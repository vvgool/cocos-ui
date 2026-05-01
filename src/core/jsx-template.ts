/**
 * JSX Template Compilation Runtime (P3)
 *
 * Provides `jsxTemplate()` — a cached VNode factory for statically-known JSX trees.
 * When the Vite plugin detects a fully-static JSX subtree (all props/children are
 * compile-time literals), it replaces the runtime jsx()/jsxs() call with jsxTemplate().
 *
 * The cached VNode reference never changes across renders, allowing the reconciler to:
 * 1. Skip VNode creation (already pre-allocated)
 * 2. Skip shallowEqual (same reference === no change)
 * 3. Skip entire subtree reconciliation via bailout
 *
 * Template ID scheme:
 *   Each unique static JSX expression gets a compile-time ID like "t0", "t1", etc.
 *   The Vite plugin generates sequential IDs per file.
 *   Hot-reload resets all templates via clearTemplates().
 */

import type { VNode } from './vnode';

/** Template cache — maps templateId → cached VNode */
const _templateCache = new Map<string, VNode>();

/**
 * Create or retrieve a template VNode for a statically-known JSX expression.
 *
 * Called by the Vite plugin's transformed output INSTEAD of jsx()/jsxs()
 * when ALL arguments are compile-time literals.
 *
 * @param templateId — Unique compile-time ID per static JSX expression (e.g. "t0_View")
 * @param type — Element type (string for host elements, function for components)
 * @param props — Props object (must be immutable — will be frozen)
 * @param key — Optional key
 */
export function jsxTemplate(
  templateId: string,
  type: string | Function,
  props: Record<string, any> | null,
  key?: string,
): VNode {
  const cached = _templateCache.get(templateId);
  if (cached) {
    return cached;
  }

  const frozenProps: Record<string, any> = {};
  if (props) {
    // Shallow-freeze props — they're static and should never be mutated
    for (const [k, v] of Object.entries(props)) {
      frozenProps[k] = v;
    }
    Object.freeze(frozenProps);
  }

  const vnode: VNode = {
    type,
    props: frozenProps,
    key: key ?? (props?.key ?? null),
    ref: props?.ref,
  };

  // Mark as template VNode for reconciler fast-path detection
  Object.defineProperty(vnode, '_isTemplate', { value: true, writable: false });

  _templateCache.set(templateId, vnode);
  return vnode;
}

/**
 * Shortcut: create a template VNode for jsxs() (known children at compile time).
 * Identical behavior to jsxTemplate — the children are already in props.
 */
export const jsxsTemplate = jsxTemplate;

/**
 * Clear all template caches. Called during hot-reload / dev-server refresh.
 */
export function clearTemplates(): void {
  _templateCache.clear();
}

/**
 * Get the number of cached templates (for debugging / benchmarking).
 */
export function getTemplateCacheSize(): number {
  return _templateCache.size;
}

/**
 * Check if a VNode is a template VNode.
 * Template VNodes are cached, frozen, and guaranteed stable across renders.
 */
export function isTemplateVNode(vnode: VNode): boolean {
  return (vnode as any)._isTemplate === true;
}
