export interface VNode {
  type: string | Function;
  props: Record<string, any>;
  key?: string | null;
  ref?: any;
}

export type EffectTag = 'CREATE' | 'UPDATE' | 'DELETE' | 'NONE';

export interface FiberNode {
  vnode: VNode;
  node: any | null;
  child: FiberNode | null;
  sibling: FiberNode | null;
  parent: FiberNode | null;
  effectTag: EffectTag;
  alternate: FiberNode | null;
  /** When true, skip re-rendering this subtree (used by memo()) */
  memoized?: boolean;
  /** Hook state for useState persistence across re-renders */
  _hookState?: any[][];
  _hookIndex?: number;
}

export type ComponentType<P = any> = (props: P) => VNode;

export function createVNode(
  type: string | Function,
  props?: Record<string, any>,
  children?: Array<VNode | string | null | undefined | boolean>
): VNode {
  const normalizedProps: Record<string, any> = { ...props };

  if (children !== undefined) {
    normalizedProps.children = flattenChildren(children);
  }

  return {
    type,
    props: normalizedProps,
    key: normalizedProps.key ?? null,
    ref: normalizedProps.ref,
  };
}

export function isValidElement(obj: any): obj is VNode {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof obj.type === 'string' &&
    typeof obj.props === 'object'
  );
}

export function flattenChildren(
  children: Array<VNode | string | Array<any> | null | undefined | boolean>
): Array<VNode | string> {
  const result: Array<VNode | string> = [];

  for (const child of children) {
    if (child == null || typeof child === 'boolean') {
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

// =============================================================================
// Fiber Factory — with Pooling
// =============================================================================

import { fiberPool } from './fiber-pool';

/**
 * Create a new FiberNode, reusing a pooled object if available.
 */
export function createFiber(vnode: VNode, parent?: FiberNode | null): FiberNode {
  const pooled = fiberPool.acquire();
  if (pooled) {
    pooled.vnode = vnode;
    pooled.node = null;
    pooled.child = null;
    pooled.sibling = null;
    pooled.parent = parent ?? null;
    pooled.effectTag = 'NONE';
    pooled.alternate = null;
    return pooled;
  }
  return {
    vnode,
    node: null,
    child: null,
    sibling: null,
    parent: parent ?? null,
    effectTag: 'NONE',
    alternate: null,
  };
}

/**
 * Create a FiberNode from a VNode with explicit field overrides.
 * Tries the pool first; falls back to a fresh object.
 * This is the preferred factory for reconcileChildren, replacing bare object literals.
 */
export function createOrReuseFiber(
  vnode: VNode,
  fields: {
    node?: any;
    child?: FiberNode | null;
    sibling?: FiberNode | null;
    parent?: FiberNode | null;
    effectTag?: EffectTag;
    alternate?: FiberNode | null;
    memoized?: boolean;
  },
): FiberNode {
  const pooled = fiberPool.acquire();
  if (pooled) {
    pooled.vnode = vnode;
    pooled.node = fields.node ?? null;
    pooled.child = fields.child ?? null;
    pooled.sibling = fields.sibling ?? null;
    pooled.parent = fields.parent ?? null;
    pooled.effectTag = fields.effectTag ?? 'NONE';
    pooled.alternate = fields.alternate ?? null;
    if (fields.memoized) {
      pooled.memoized = true;
    }
    return pooled;
  }
  const fiber: FiberNode = {
    vnode,
    node: fields.node ?? null,
    child: fields.child ?? null,
    sibling: fields.sibling ?? null,
    parent: fields.parent ?? null,
    effectTag: fields.effectTag ?? 'NONE',
    alternate: fields.alternate ?? null,
  };
  if (fields.memoized) {
    fiber.memoized = true;
  }
  return fiber;
}