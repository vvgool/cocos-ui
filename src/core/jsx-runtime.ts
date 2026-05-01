/**
 * JSX Runtime Factory for cocos-ui
 *
 * Provides the runtime functions that TypeScript's JSX transform calls.
 * Produces plain VNode objects — no Cocos4 objects are created here.
 */

export interface VNode {
  type: string | Function;
  props: Record<string, any>;
  key?: string | null;
  ref?: any;
}

// Fragment marker — used by JSX transform for <>...</>
export const Fragment = 'Fragment' as const;

/**
 * Flatten nested children arrays and filter out null/undefined/boolean.
 */
function flattenChildren(children: any[]): any[] {
  const result: any[] = [];

  for (const child of children) {
    if (child === null || child === undefined || typeof child === 'boolean') {
      continue;
    }
    if (Array.isArray(child)) {
      result.push(...flattenChildren(child));
    } else {
      result.push(child);
    }
  }

  return result;
}

/**
 * Type guard to check if an object is a VNode.
 */
export function isValidElement(obj: any): obj is VNode {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof obj.type !== 'undefined' &&
    typeof obj.props === 'object'
  );
}

/**
 * Convenient wrapper for creating VNodes manually (not used by TSX compiler).
 */
export function createElement(
  type: string | Function,
  props?: Record<string, any> | null,
  ...children: any[]
): VNode {
  const finalProps = props ?? {};

  // If children are provided and not already in props, add them
  if (children.length > 0 && !('children' in finalProps)) {
    finalProps.children = flattenChildren(children);
  }

  return jsx(type, finalProps);
}

/**
 * JSX transform entry point — used for elements with or without children.
 * The compiler chooses this when children are not known at compile time.
 */
export function jsx(
  type: string | Function,
  props: Record<string, any> | null,
  key?: string
): VNode {
  const finalProps: Record<string, any> = {};

  if (props !== null && props !== undefined) {
    // Extract key and ref — these are special, not passed as component props
    const { key: extractedKey, ref, children: rawChildren, ...rest } = props;

    // Use provided key, or extracted key, or undefined
    const resolvedKey = key !== undefined ? key : extractedKey !== undefined ? extractedKey : undefined;

    // Copy remaining props
    Object.assign(finalProps, rest);

    // Handle children — flatten if present
    if (rawChildren !== undefined) {
      const childArr = Array.isArray(rawChildren) ? rawChildren : [rawChildren];
      finalProps.children = flattenChildren(childArr);
    }

    return {
      type,
      props: finalProps,
      key: resolvedKey,
      ref,
    };
  }

  return {
    type,
    props: finalProps,
    key: key ?? undefined,
    ref: undefined,
  };
}

/**
 * JSX transform entry point — used when the compiler knows there are children.
 * Optimized path — children are already in props.children.
 */
export function jsxs(
  type: string | Function,
  props: Record<string, any> | null,
  key?: string
): VNode {
  const finalProps: Record<string, any> = {};

  if (props !== null && props !== undefined) {
    const { key: extractedKey, ref, children: rawChildren, ...rest } = props;

    const resolvedKey = key !== undefined ? key : extractedKey !== undefined ? extractedKey : undefined;

    Object.assign(finalProps, rest);

    // jsxs is called when there ARE children — flatten them
    if (rawChildren !== undefined) {
      const childArr = Array.isArray(rawChildren) ? rawChildren : [rawChildren];
      finalProps.children = flattenChildren(childArr);
    }

    return {
      type,
      props: finalProps,
      key: resolvedKey,
      ref,
    };
  }

  return {
    type,
    props: finalProps,
    key: key ?? undefined,
    ref: undefined,
  };
}

// Export jsxDEV and jsxFragment for compatibility (not used in modern transforms)
export const jsxDEV = jsx;
export const jsxFragment = jsxs;

// =============================================================================
// Template Compilation (P3) — re-exported from jsx-template
// =============================================================================

export {
  jsxTemplate,
  jsxsTemplate,
  clearTemplates,
  isTemplateVNode,
  getTemplateCacheSize,
} from './jsx-template';

// JSX namespace for TypeScript's jsxImportSource resolution
// Required for `jsx: "react-jsx"` with `jsxImportSource: "cocos-ui"`
export declare namespace JSX {
  interface IntrinsicElements {
    View: any;
    Label: any;
    Button: any;
    Sprite: any;
    ScrollView: any;
    Layout: any;
    VBox: any;
    HBox: any;
    Toggle: any;
    Slider: any;
    ProgressBar: any;
    EditBox: any;
    RichText: any;
    PageView: any;
    Mask: any;
    Graphics: any;
    SafeArea: any;
    Widget: any;
    Particle2D: any;
    Placeholder: any;
    Fragment: any;
  }

  interface Element extends VNode {}
  interface ElementClass {}
  interface ElementAttributesProperty { props: any }
  interface ElementChildrenAttribute { children: any }
}