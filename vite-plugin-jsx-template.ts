/**
 * Vite Plugin: JSX Template Compilation (P3)
 *
 * Transforms runtime jsx()/jsxs() calls into cached jsxTemplate()/jsxsTemplate()
 * calls when ALL arguments are compile-time literals (static content).
 *
 * This eliminates runtime VNode allocation for static JSX subtrees and enables
 * the reconciler to skip reconciliation via reference equality.
 *
 * How it works:
 * 1. Runs after esbuild's JSX transform (enforce: 'post')
 * 2. Finds jsx()/jsxs() calls in the transformed output
 * 3. Checks if all non-type arguments are static literals
 * 4. If yes, replaces with jsxTemplate()/jsxsTemplate() + unique template ID
 * 5. Updates the import statement to include the template functions
 *
 * Example transformation:
 *   // Before:
 *   jsx(View, { width: 100, height: 50 })
 *   jsxs(View, { children: [jsx(Label, { text: "Hello" })] })
 *
 *   // After:
 *   jsxTemplate("t0_0", View, { width: 100, height: 50 })
 *   jsxsTemplate("t0_1", View, { children: [jsxTemplate("t0_2", Label, { text: "Hello" })] })
 */

import type { Plugin, ResolvedConfig } from 'vite';

interface PluginOptions {
  /** Enable/disable template compilation (default: true) */
  enabled?: boolean;
  /** Prefix for template IDs */
  idPrefix?: string;
  /** JSX runtime module ID(s) to optimize */
  runtimeModules?: string[];
}

const DEFAULT_RUNTIME_MODULES = [
  'cocos-ui/jsx-runtime',
  '/src/core/jsx-runtime.ts',
];

/**
 * Vite plugin that compiles static JSX into template VNodes at build time.
 */
export function jsxTemplatePlugin(options: PluginOptions = {}): Plugin {
  const {
    enabled = true,
    idPrefix = 't',
    runtimeModules = DEFAULT_RUNTIME_MODULES,
  } = options;

  /** Per-file template ID counter */
  let fileCounter = 0;

  /** Cache of import source → whether we need to add template imports */
  const importCache = new Map<string, boolean>();

  return {
    name: 'cocos-ui:jsx-template',
    enforce: 'post',

    configResolved(_config: ResolvedConfig) {
      fileCounter = 0;
      importCache.clear();
    },

    transform(code: string, id: string) {
      // Only process JS/TS files (not node_modules)
      if (!enabled || !id.match(/\.(jsx?|tsx?)$/) || id.includes('node_modules')) {
        return null;
      }

      // Check if this file imports from a JSX runtime module
      const runtimeImport = findRuntimeImport(code, runtimeModules);
      if (!runtimeImport) {
        return null;
      }

      const fileId = fileCounter++;
      let result = code;

      // Find all jsx( and jsxs( calls (but NOT jsxTemplate/jsxsTemplate calls)
      const calls = findAllJSCalls(result, runtimeImport.importedNames);

      if (calls.length === 0) {
        return null;
      }

      // Process calls from innermost to outermost to preserve positions
      calls.sort((a, b) => b.start - a.start);

      const templateReplacements: Array<{ start: number; end: number; replacement: string }> = [];
      let templateIndex = 0;

      for (const call of calls) {
        // First arg is the type — skip it for static check
        const typeArg = call.args[0];
        const remainingArgs = call.args.slice(1);

        // Check if all non-type arguments are static literals
        const isStatic = remainingArgs.every(arg => isStaticExpression(arg));

        if (!isStatic) {
          continue;
        }

        const templateId = `${idPrefix}${fileId}_${templateIndex++}`;
        const templateFn = call.name === 'jsxs' ? 'jsxsTemplate' : 'jsxTemplate';
        const newArgs = [JSON.stringify(templateId), ...call.args].join(', ');
        const replacement = `${templateFn}(${newArgs})`;

        templateReplacements.push({
          start: call.start,
          end: call.end,
          replacement,
        });
      }

      if (templateReplacements.length === 0) {
        return null;
      }

      // Apply replacements (already sorted in reverse order)
      for (const r of templateReplacements) {
        result = result.slice(0, r.start) + r.replacement + result.slice(r.end);
      }

      // Update import to include template functions
      if (templateReplacements.length > 0) {
        result = updateImportForTemplate(result, runtimeImport);
      }

      return { code: result, map: null };
    },
  };
}

// =============================================================================
// Internal Helpers
// =============================================================================

interface RuntimeImport {
  /** Full import statement text */
  statement: string;
  /** Start position of the import statement */
  start: number;
  /** End position of the import statement */
  end: number;
  /** Imported specifier names (e.g. ['jsx', 'jsxs']) */
  importedNames: Set<string>;
  /** Module source (e.g. 'cocos-ui/jsx-runtime') */
  source: string;
}

interface JSCall {
  name: string;
  start: number;
  end: number;
  args: string[];
}

/**
 * Find import statements importing from the JSX runtime module.
 */
function findRuntimeImport(code: string, runtimeModules: string[]): RuntimeImport | null {
  const importRegex = /import\s*\{([^}]+)\}\s*from\s*["']([^"']+)["']/g;
  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(code)) !== null) {
    const importedNames = match[1].split(',').map(s => s.trim()).filter(Boolean);
    const source = match[2];

    // Check if source matches any runtime module
    const isRuntimeModule = runtimeModules.some(m => source.includes(m));

    if (isRuntimeModule) {
      return {
        statement: match[0],
        start: match.index,
        end: match.index + match[0].length,
        importedNames: new Set(importedNames),
        source,
      };
    }
  }

  return null;
}

/**
 * Find all jsx() and jsxs() calls in the code.
 * Only finds calls that are direct function invocations (not member expressions).
 */
function findAllJSCalls(code: string, importedNames: Set<string>): JSCall[] {
  const results: JSCall[] = [];

  // Search for ALL imported names (handles esbuild alias like _jsx, _jsxs)
  for (const name of importedNames) {
    // Only process jsx/jsxs variants, not other imports like Fragment etc.
    const cleanName = name.replace(/^_+/, '');
    if (cleanName !== 'jsx' && cleanName !== 'jsxs') continue;

    const searchStr = name + '(';
    let pos = 0;

    while ((pos = code.indexOf(searchStr, pos)) !== -1) {
      const callStart = pos;
      const argsStart = pos + searchStr.length;

      // Check this isn't a member expression (e.g. some.jsx())
      if (callStart > 0) {
        const charBefore = code[callStart - 1];
        if (/[a-zA-Z0-9_$]/.test(charBefore)) {
          pos = argsStart;
          continue;
        }
      }

      const extracted = extractArgs(code, argsStart);
      if (extracted.parts.length >= 1) {
        results.push({
          name,
          start: callStart,
          end: extracted.end,
          args: extracted.parts,
        });
      }

      pos = extracted.end;
    }
  }

  return results;
}

/**
 * Extract top-level comma-separated arguments from a function call.
 * Handles nested parentheses, brackets, braces, and strings.
 */
function extractArgs(code: string, start: number): { parts: string[]; end: number } {
  const parts: string[] = [];
  let current = '';
  let depth = 0;
  let i = start;

  while (i < code.length) {
    const ch = code[i];

    if (ch === ')' && depth === 0) {
      const trimmed = current.trim();
      if (trimmed) parts.push(trimmed);
      return { parts, end: i + 1 };
    }

    if (ch === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
      i++;
      continue;
    }

    // Track depth for nested structures
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    if (ch === ')' || ch === ']' || ch === '}') depth--;

    // Handle string literals (skip past them to avoid counting braces inside)
    if ((ch === '"' || ch === "'" || ch === '`') && depth >= 0) {
      current += ch;
      i++;
      const quote = ch;
      while (i < code.length) {
        current += code[i];
        if (code[i] === '\\') {
          i++;
          if (i < code.length) { current += code[i]; i++; }
          continue;
        }
        if (code[i] === quote) {
          i++;
          break;
        }
        i++;
      }
      continue;
    }

    // Handle regex literals (starts with /, not comment)
    if (ch === '/' && depth === 0) {
      // Could be a regex — check if previous non-whitespace is an operator
      const prevTrimmed = current.trimEnd();
      if (prevTrimmed.length > 0 && /[(\[{=,:!&|?+\-*/%^<>]$/.test(prevTrimmed[prevTrimmed.length - 1] || '')) {
        current += ch;
        i++;
        while (i < code.length) {
          current += code[i];
          if (code[i] === '\\') {
            i++; if (i < code.length) { current += code[i]; i++; }
            continue;
          }
          if (code[i] === '/') {
            // Skip flags
            i++;
            while (i < code.length && /[a-zA-Z]/.test(code[i])) {
              current += code[i];
              i++;
            }
            break;
          }
          i++;
        }
        continue;
      }
    }

    current += ch;
    i++;
  }

  // Reach end of code without closing paren
  const trimmed = current.trim();
  if (trimmed) parts.push(trimmed);
  return { parts, end: i };
}

/**
 * Check if a JS expression string contains only static/primitive values.
 * "Static" means: no variable references, no function calls, no member expressions.
 */
function isStaticExpression(expr: string): boolean {
  const trimmed = expr.trim();

  // Empty
  if (!trimmed) return false;

  // Numeric literals
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(trimmed)) return true;

  // Boolean literals
  if (trimmed === 'true' || trimmed === 'false') return true;

  // null / undefined
  if (trimmed === 'null' || trimmed === 'undefined') return true;

  // String literals (single/double quotes only, NOT template literals)
  if (isStringLiteral(trimmed)) return true;
  // Template literals (backtick) — reject: may contain ${expr} or be hard to analyze
  if (trimmed.startsWith('`') && trimmed.endsWith('`')) {
    return false;
  }

  // Object literal
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) return true; // empty object
    const entries = splitByTopLevelComma(inner);
    return entries.every(entry => {
      // Each entry: key: value
      const colonIdx = findTopLevelColonOrEq(entry);
      if (colonIdx === -1) return false;
      // Shorthand property (e.g. `{foo}`) — NOT static (it's a variable ref)
      if (colonIdx === -1 || colonIdx >= entry.length - 1) return false;
      const val = entry.slice(colonIdx + 1).trim();
      return (
        isSimpleKey(entry.slice(0, colonIdx).trim()) &&
        isStaticExpression(val)
      );
    });
  }

  // Array literal
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) return true; // empty array
    const elements = splitByTopLevelComma(inner);
    return elements.every(el => isStaticExpression(el));
  }

  // Arrow function (static — it's a callback like onClick)
  // Actually, arrow functions close over variables, so they're not fully static.
  // But in practice, inline arrow functions in event handlers are common.
  // For now, DON'T template functions with arrow callbacks.
  if (trimmed.startsWith('(') || trimmed.startsWith('=>') || trimmed.includes('=>')) {
    return false;
  }

  return false;
}

/**
 * Check if a string is a JS string literal (single or double quoted only).
 * Template literals (backtick) are NOT considered string literals here.
 */
function isStringLiteral(s: string): boolean {
  if ((s.startsWith("'") && s.endsWith("'")) ||
      (s.startsWith('"') && s.endsWith('"'))) {
    // Quick validation: no unescaped same-quotes inside
    const quote = s[0];
    let i = 1;
    while (i < s.length - 1) {
      if (s[i] === '\\') { i += 2; continue; }
      if (s[i] === quote) return false; // unescaped quote inside
      i++;
    }
    return true;
  }
  return false;
}

/**
 * Check if a string is a valid simple object key (identifier, number, or string).
 */
function isSimpleKey(key: string): boolean {
  if (!key) return false;
  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) return true;
  if (/^-?\d+(\.\d+)?$/.test(key)) return true;
  if (isStringLiteral(key)) return true;
  // Computed key — could be anything, treat as non-static
  if (key.startsWith('[')) return false;
  return false;
}

/**
 * Find the top-level colon (or equals for JSX) that separates key from value in an object entry.
 * Skips colons inside nested structures.
 */
function findTopLevelColonOrEq(s: string): number {
  let depth = 0;
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];

    if (inString) {
      if (ch === '\\') { i++; continue; }
      if (ch === stringChar) inString = false;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inString = true;
      stringChar = ch;
      continue;
    }

    if ('({['.includes(ch)) { depth++; continue; }
    if (')}]'.includes(ch)) { depth--; continue; }

    if (depth === 0 && ch === ':') {
      return i;
    }
  }

  return -1;
}

/**
 * Split a string by top-level commas (not inside nested structures).
 */
function splitByTopLevelComma(s: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];

    if (inString) {
      current += ch;
      if (ch === '\\') { i++; if (i < s.length) current += s[i]; continue; }
      if (ch === stringChar) inString = false;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inString = true;
      stringChar = ch;
      current += ch;
      continue;
    }

    if ('({['.includes(ch)) { depth++; current += ch; continue; }
    if (')}]'.includes(ch)) { depth--; current += ch; continue; }

    if (depth === 0 && ch === ',') {
      parts.push(current.trim());
      current = '';
      continue;
    }

    current += ch;
  }

  if (current.trim()) parts.push(current.trim());
  return parts;
}

/**
 * Update the import statement to include jsxTemplate and jsxsTemplate.
 */
function updateImportForTemplate(code: string, runtimeImport: RuntimeImport): string {
  const neededNames = ['jsxTemplate', 'jsxsTemplate', 'clearTemplates'];
  const existingNames = runtimeImport.importedNames;
  const namesToAdd = neededNames.filter(n => !existingNames.has(n));

  if (namesToAdd.length === 0) {
    return code;
  }

  // Find the last imported name in the existing import
  const oldStatement = runtimeImport.statement;
  const importMatch = oldStatement.match(/import\s*\{([^}]+)\}\s*from\s*["']([^"']+)["']/);
  if (!importMatch) return code;

  const existingSpecifiers = importMatch[1];
  const newSpecifiers = existingSpecifiers.trim() + ', ' + namesToAdd.join(', ');
  const newStatement = oldStatement.replace(existingSpecifiers, newSpecifiers);

  return (
    code.slice(0, runtimeImport.start) +
    newStatement +
    code.slice(runtimeImport.end)
  );
}

/**
 * Force-reset file counter (for testing / HMR).
 */
export function _resetFileCounter(): void {
  fileCounter = 0;
}

// =============================================================================
// Exported for testing — these are used by smoke tests.
// =============================================================================

/** @internal Exported for testing */
export { findAllJSCalls, isStaticExpression };
