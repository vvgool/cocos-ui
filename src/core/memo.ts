/**
 * Memoization — Skip Re-render When Props Don't Change
 *
 * `memo()` wraps a function component so that the reconciler skips
 * re-executing it (and its entire subtree) when props are shallow-equal.
 *
 * Usage:
 * ```tsx
 * const MyButton = memo((props: { text: string }) => {
 *   return <Button text={props.text} />;
 * });
 * ```
 */

import type { VNode } from './vnode';

// =============================================================================
// Types
// =============================================================================

export interface MemoizedComponent extends Function {
  _isMemoized: true;
  _componentFn: (props: any) => VNode;
}

// =============================================================================
// Memo HOC
// =============================================================================

/**
 * Wrap a function component with memoization.
 * The component will only re-render when its props change (shallow comparison).
 *
 * @param componentFn - The function component to memoize
 * @returns A memoized component function with a `_isMemoized` marker
 */
export function memo<P extends Record<string, any> = Record<string, any>>(
  componentFn: (props: P) => VNode,
): MemoizedComponent {
  const wrapped = function(props: P): VNode {
    return componentFn(props);
  } as unknown as MemoizedComponent;

  wrapped._isMemoized = true;
  wrapped._componentFn = componentFn;

  return wrapped;
}

// =============================================================================
// Type Guard
// =============================================================================

/**
 * Check whether a function is a memoized component.
 */
export function isMemoizedComponent(fn: any): fn is MemoizedComponent {
  return typeof fn === 'function' && (fn as any)._isMemoized === true;
}
