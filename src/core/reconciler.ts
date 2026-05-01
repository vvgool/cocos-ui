/**
 * Reconciler — VNode Tree Diff Engine & Cocos4 Node Lifecycle Manager
 *
 * Minimal Fiber architecture: child/sibling/parent/effectTag/alternate.
 * No lanes, no priorities, no concurrent mode.
 *
 * Key-based child reconciliation: same key → reuse (UPDATE), different key → CREATE/DELETE.
 * Commit order: CREATE/UPDATE first (building tree), then DELETE (cleanup).
 */
import type { VNode, FiberNode } from './vnode';
import { createFiber, createOrReuseFiber } from './vnode';
import { Fragment } from './jsx-runtime';
import { setCurrentComponent, resetComponentHookIndex, createEffect, isSignalBinding } from './state';
import type { Component } from './state';
import { createHostNode } from './create-element';
import { applyProps, removeProps, applyCreateProps } from './apply-props';
import { isErrorBoundary, renderFallback, logError } from './error-boundary';
import type { ErrorBoundaryFn } from './error-boundary';
import { isMemoizedComponent } from './memo';
import { nodePool } from './node-pool';
import { fiberPool } from './fiber-pool';
// Cocos Creator global — typed as `any` since cocos-creator is a peerDep
// =============================================================================
// Root Tracking
// =============================================================================
/** Map from container nodes to their root FiberNode */
const rootFibers: WeakMap<any, FiberNode> = new WeakMap();
// =============================================================================
// Scheduling
// =============================================================================
/** Pending re-render callbacks, deduplicated by component reference */
const pendingRenders: Set<() => void> = new Set();
let isScheduled = false;
let rafId: number | null = null;
/**
 * Schedule a component re-render aligned to the next animation frame.
 * Called by useState setters to trigger reconciliation.
 * Uses requestAnimationFrame to avoid mid-frame updates.
 */
export function scheduleUpdate(componentFn: () => void): void {
  pendingRenders.add(componentFn);
  if (!isScheduled) {
    isScheduled = true;
    rafId = requestAnimationFrame(() => {
      isScheduled = false;
      rafId = null;
      const renders = [...pendingRenders];
      pendingRenders.clear();
      for (const render of renders) {
        render();
      }
    });
  }
}
// =============================================================================
// Dirty Fiber Tracking (P1b)
// =============================================================================
/** Tracks fibers with non-NONE effectTags during reconciliation */
let _dirtyFiberList: FiberNode[] | null = null;
function trackDirtyFiber(fiber: FiberNode): void {
  if (_dirtyFiberList && fiber.effectTag !== 'NONE') {
    _dirtyFiberList.push(fiber);
  }
}
// =============================================================================
// Signal-Driven Direct Property Updates (P0)
// =============================================================================
/**
 * 追踪 fiber 上的 signal 订阅 dispose 函数集合。
 * 当 signal-bound prop 变化时，effect 直接更新 Cocos 节点属性，
 * 完全跳过组件重渲染和 VNode diff。
 */
const _signalSubscriptions = new WeakMap<FiberNode, Set<() => void>>();
/**
 * 为 fiber 的 props 中所有 SignalBinding 创建订阅。
 * 每个 SignalBinding 创建一个 createEffect，当 signal 变化时直接更新 Cocos 节点属性。
 * 如果 fiber 已有旧订阅，会先 dispose 再创建新的。
 */
function setupSignalBindings(fiber: FiberNode): void {
  // Always dispose old subscriptions first — handles fiber pool reuse where
  // the previous vnode had signal bindings but the current one doesn't
  const oldDisposes = _signalSubscriptions.get(fiber);
  if (oldDisposes) {
    for (const d of oldDisposes) d();
    _signalSubscriptions.delete(fiber);
  }
  const props = fiber.vnode.props;
  const disposes = new Set<() => void>();
  let hasBindings = false;
  for (const [key, value] of Object.entries(props)) {
    if (key === 'children' || key === 'key' || key === 'ref') continue;
    // Handle signal bindings nested inside style objects
    if (key === 'style' && value && typeof value === 'object' && !Array.isArray(value)) {
      for (const [styleKey, styleValue] of Object.entries(value)) {
        if (!isSignalBinding(styleValue)) continue;
        hasBindings = true;
        const dispose = createEffect(() => {
          const val = styleValue.getter();
          applyProps(fiber.node, null, { style: { [styleKey]: val } });
        });
        disposes.add(dispose);
      }
      continue;
    }
    if (!isSignalBinding(value)) continue;
    hasBindings = true;
    // createEffect 自动追踪 signal 依赖
    // 当 signal 变化时，直接更新 Cocos 节点属性
    const dispose = createEffect(() => {
      const val = value.getter();
      applyProps(fiber.node, null, { [key]: val });
    });
    disposes.add(dispose);
  }
  if (hasBindings) {
    _signalSubscriptions.set(fiber, disposes);
  }
}
/** 清理 fiber 上的所有 signal 订阅 */
function disposeSignalBindings(fiber: FiberNode): void {
  const disposes = _signalSubscriptions.get(fiber);
  if (disposes) {
    for (const d of disposes) d();
    _signalSubscriptions.delete(fiber);
  }
}
// =============================================================================
// Text Node Handling
// =============================================================================
/**
 * Create a VNode for a text node.
 * Text nodes are represented as VNodes with type '#text'.
 */
function createTextVNode(text: string): VNode {
  return {
    type: '#text',
    props: { textContent: String(text) },
    key: null,
  };
}
/**
 * Normalize a child value into a VNode.
 * Strings/numbers become text VNodes; VNodes pass through; null/undefined/boolean are filtered.
 */
function normalizeChild(child: VNode | string | null | undefined | boolean): VNode | null {
  if (child == null || typeof child === 'boolean') {
    return null;
  }
  if (typeof child === 'string' || typeof child === 'number') {
    return createTextVNode(String(child));
  }
  return child;
}
/**
 * Normalize the children prop of a VNode into an array of VNodes.
 * Filters out null/undefined/boolean, converts strings/numbers to text VNodes.
 */
function normalizeChildren(vnode: VNode): VNode[] {
  const rawChildren = vnode.props?.children;
  if (rawChildren == null) {
    return [];
  }
  const childArray = Array.isArray(rawChildren) ? rawChildren : [rawChildren];
  const result: VNode[] = [];
  for (const child of childArray) {
    const normalized = normalizeChild(child);
    if (normalized !== null) {
      result.push(normalized);
    }
  }
  return result;
}
// =============================================================================
// Create Host Node for Text
// =============================================================================
/**
 * Create a Cocos4 Label node for text content.
 */
function createTextNode(vnode: VNode): any {
  const node = new cc.Node();
  node.addComponent(cc.UITransform);
  const label = node.addComponent(cc.Label);
  label.string = vnode.props.textContent ?? '';
  label.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
  label.verticalAlign = cc.Label.VerticalAlign.TOP;
  node.name = '#text';
  return node;
}
// =============================================================================
// Reconcile Children
// =============================================================================
/**
 * Diff old children vs new children, assign effectTags, and build the new child fiber list.
 *
 * Key-based reconciliation:
 * - Same key → reuse fiber (UPDATE if props differ, NONE if same)
 * - Different key → CREATE new fiber, DELETE old fiber
 * - Positional fallback when no keys
 */
export function reconcileChildren(
  parentFiber: FiberNode,
  newVNodes: VNode[],
): { firstChild: FiberNode | null; hasChanges: boolean } {
  const oldFiber = parentFiber.child;
  const oldFibers: FiberNode[] = [];
  // Collect old child fibers into a list
  let current: FiberNode | null = oldFiber;
  while (current) {
    oldFibers.push(current);
    current = current.sibling;
  }
  // Build a map of old fibers by key for O(1) lookup
  const oldFiberByKey: Map<string | null, FiberNode> = new Map();
  for (const f of oldFibers) {
    const key = f.vnode.key ?? null;
    // First one wins — same as React behavior for duplicate keys
    if (!oldFiberByKey.has(key)) {
      oldFiberByKey.set(key, f);
    }
  }
  const usedOldFibers: Set<FiberNode> = new Set();
  let firstChild: FiberNode | null = null;
  let prevSibling: FiberNode | null = null;
  let hasChanges = false;
  for (let i = 0; i < newVNodes.length; i++) {
    const newVNode = newVNodes[i];
    const newKey = newVNode.key ?? null;
    let matchedOldFiber: FiberNode | null = null;
    // Try key-based match first
    if (newKey !== null) {
      matchedOldFiber = oldFiberByKey.get(newKey) ?? null;
    } else {
      // Positional fallback: find first unused old fiber with matching type or same positional
      if (i < oldFibers.length && !usedOldFibers.has(oldFibers[i])) {
        const candidate = oldFibers[i];
        // Prefer type match, but accept positional match as fallback
        if (candidate.vnode.type === newVNode.type || candidate.vnode.key === null) {
          matchedOldFiber = candidate;
        }
      }
    }
    let newFiber: FiberNode;
    if (matchedOldFiber && !usedOldFibers.has(matchedOldFiber)) {
      // Reuse existing fiber
      usedOldFibers.add(matchedOldFiber);
      const propsChanged = !shallowEqual(matchedOldFiber.vnode.props, newVNode.props);
      newFiber = createOrReuseFiber(newVNode, {
        node: matchedOldFiber.node,
        parent: parentFiber,
        effectTag: propsChanged ? 'UPDATE' : 'NONE',
        alternate: matchedOldFiber,
        memoized: (!propsChanged && typeof newVNode.type === 'function' && isMemoizedComponent(newVNode.type)) || undefined,
      });
      trackDirtyFiber(newFiber);
      if (propsChanged) {
        hasChanges = true;
      }
    } else {
      // Create new fiber
      newFiber = createOrReuseFiber(newVNode, {
        parent: parentFiber,
        effectTag: 'CREATE',
      });
      trackDirtyFiber(newFiber);      hasChanges = true;
    }
    // Link siblings
    if (prevSibling) {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
    if (firstChild === null) {
      firstChild = newFiber;
    }
  }
  // Mark unused old fibers for deletion
  for (const oldF of oldFibers) {
    if (!usedOldFibers.has(oldF)) {
      const deleteFiber = createOrReuseFiber(oldF.vnode, {
        node: oldF.node,
        parent: parentFiber,
        effectTag: 'DELETE',
        alternate: oldF,
      });
      trackDirtyFiber(deleteFiber);      // Append deletion fibers after the last new child
      if (prevSibling) {
        prevSibling.sibling = deleteFiber;
        prevSibling = deleteFiber;
      } else {
        firstChild = deleteFiber;
        prevSibling = deleteFiber;
      }
      hasChanges = true;
    }
  }
  parentFiber.child = firstChild;
  return { firstChild, hasChanges };
}
// =============================================================================
// Shallow Equal
// =============================================================================
/** Shallow comparison of two objects, skipping 'children' and 'key' */
function shallowEqual(
  a: Record<string, any>,
  b: Record<string, any>,
): boolean {
  const keysA = Object.keys(a).filter((k) => k !== 'children' && k !== 'key');
  const keysB = Object.keys(b).filter((k) => k !== 'children' && k !== 'key');
  if (keysA.length !== keysB.length) {
    return false;
  }
  for (const key of keysA) {
    if (a[key] !== b[key]) {
      return false;
    }
  }
  // Also compare children shallowly
  const childrenA = a.children;
  const childrenB = b.children;
  if (childrenA === childrenB) {
    return true;
  }
  if (!childrenA || !childrenB) {
    return false;
  }
  if (Array.isArray(childrenA) && Array.isArray(childrenB)) {
    if (childrenA.length !== childrenB.length) {
      return false;
    }
    for (let i = 0; i < childrenA.length; i++) {
      if (childrenA[i] !== childrenB[i]) {
        // Deep comparison for VNode children — compare by reference or key
        const ca = childrenA[i];
        const cb = childrenB[i];
        if (typeof ca === 'object' && typeof cb === 'object') {
          if (ca.key !== undefined && cb.key !== undefined && ca.key !== cb.key) {
            return false;
          }
          if (ca.type !== cb.type) {
            return false;
          }
          // Don't deep-compare props here — the reconciler will handle that
        } else if (ca !== cb) {
          return false;
        }
      }
    }
  }
  return true;
}
// =============================================================================
// Bailout — Subtree Effect Reset
// =============================================================================
/**
 * Recursively reset all effectTags in a fiber's subtree to 'NONE'.
 * Called by the bailout path when a function component's props haven't changed.
 *
 * This is a lightweight tree walk (no VNode creation, no reconciliation)
 * that prevents stale effectTags from a previous commit cycle.
 */
function clearSubtreeEffects(fiber: FiberNode): void {
  if (!fiber) return;
  let child = fiber.child;
  while (child) {
    if (child.effectTag !== 'DELETE') {
      child.effectTag = 'NONE';
      child.memoized = false;
      clearSubtreeEffects(child);
    }
    child = child.sibling;
  }
}
// =============================================================================
// Render VNode Tree
// =============================================================================
/**
 * Recursively render a VNode tree into FiberNodes.
 * For function components, calls the function and renders the result.
 * For host elements, creates the fiber and reconciles children.
 */
function renderFiber(fiber: FiberNode): void {
  const vnode = fiber.vnode;
  const type = vnode.type;
  // =============================================================================
  // Static subtree: skip reconciliation entirely after initial mount.
  // When a subtree is marked with `static` prop, it's created once and never
  // re-rendered, regardless of parent re-renders. This eliminates VNode creation,
  // reconciliation, and commit work for the entire subtree.
  // =============================================================================
  if (vnode.props?.static && fiber.child) {
    clearSubtreeEffects(fiber);
    return;
  }
  // =============================================================================
  // Bailout: function component with unchanged props — skip entire subtree.
  // Inspired by Compose Slot Table's "skip group" — when a component's inputs
  // haven't changed, we skip executing it AND all of its children.
  //
  // This is more aggressive than memo(): it requires no user annotation and
  // automatically propagates to all descendants.
  //
  // Safety: stale effectTags from the previous commit are cleared to NONE
  // via clearSubtreeEffects, preventing incorrect commitWork entries.
  // =============================================================================
  if (typeof type === 'function' && fiber.effectTag === 'NONE') {
    clearSubtreeEffects(fiber);
    return;
  }
  if (typeof type === 'function') {
    const componentFn = type as (props: Record<string, any>) => VNode;
    const boundary = isErrorBoundary(componentFn) ? (componentFn as ErrorBoundaryFn) : null;
    const component: Component = { update: null };
    const reRender = () => {
      scheduleUpdate(() => {
        performUpdate(fiber, componentFn);
      });
    };
    component.update = reRender;
    // Make hook state accessible to useState via component
    component._hooks = fiber._hookState;
    if (!fiber._hookState) {
      fiber._hookState = [];
    }
    component._hookIndex = 0;
    setCurrentComponent(component);
    let result: VNode;
    try {
      result = componentFn(vnode.props);
    } catch (err) {
      setCurrentComponent(null);
      const error = err instanceof Error ? err : new Error(String(err));
      if (boundary) {
        result = renderFallback(boundary, error);
      } else {
        logError(error, `in <${(componentFn as any).displayName || componentFn.name || 'Component'}>`);
        return;
      }
    }
    setCurrentComponent(null);
    const childVNodes = normalizeChild(result);
    if (childVNodes) {
      const childFiber = createFiber(childVNodes, fiber);
      childFiber.effectTag = 'CREATE';
      trackDirtyFiber(childFiber);
      fiber.child = childFiber;
      if (boundary) {
        try {
          renderFiber(childFiber);
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          const fallbackVNode = renderFallback(boundary, error);
          const fallbackFiber = createFiber(fallbackVNode, fiber);
          fallbackFiber.effectTag = 'CREATE';
          trackDirtyFiber(fallbackFiber);
          fiber.child = fallbackFiber;
          renderFiber(fallbackFiber);
        }
      } else {
        renderFiber(childFiber);
      }
    }
  } else if (type === Fragment) {
    // Fragment — no host node, just render children into parent
    const childVNodes = normalizeChildren(vnode);
    if (childVNodes.length > 0) {
      reconcileChildren(fiber, childVNodes);
      // Recursively render each child
      let child = fiber.child;
      while (child) {
        if (child.effectTag !== 'DELETE') {
          renderFiber(child);
        }
        child = child.sibling;
      }
    }
  } else if (type === '#text') {
    // Text node — will be created during commit
    // No children to reconcile
  } else {
    // Host element — reconcile children
    const childVNodes = normalizeChildren(vnode);
    if (childVNodes.length > 0) {
      reconcileChildren(fiber, childVNodes);
      // Recursively render each child
      let child = fiber.child;
      while (child) {
        if (child.effectTag !== 'DELETE') {
          renderFiber(child);
        }
        child = child.sibling;
      }
    }
  }
}
/**
 * Re-render a component fiber (triggered by useState setter).
 * Diff the new output against the old and assign effect tags.
 * Skips memoized subtrees and avoids commit when nothing changed.
 */
function performUpdate(fiber: FiberNode, componentFn: (props: Record<string, any>) => VNode): void {
  const boundary = isErrorBoundary(componentFn) ? (componentFn as ErrorBoundaryFn) : null;
  const component: Component = { update: null };
  const reRender = () => {
    scheduleUpdate(() => {
      performUpdate(fiber, componentFn);
    });
  };
  component.update = reRender;
  // Reuse hook state from fiber (persistent across re-renders)
  component._hooks = fiber._hookState;
  if (!fiber._hookState) {
    fiber._hookState = [];
  }
  component._hookIndex = 0;
  setCurrentComponent(component);
  let newVNode: VNode;
  try {
    newVNode = componentFn(fiber.vnode.props);
  } catch (err) {
    setCurrentComponent(null);
    const error = err instanceof Error ? err : new Error(String(err));
    if (boundary) {
      newVNode = renderFallback(boundary, error);
    } else {
      logError(error, `in <${(componentFn as any).displayName || componentFn.name || 'Component'}>`);
      return;
    }
  }
  setCurrentComponent(null);
  const oldChild = fiber.child;
  const newChildVNodes = normalizeChild(newVNode);
  if (newChildVNodes) {
    const childVNodes = [newChildVNodes];
    _dirtyFiberList = [];
    const { hasChanges } = reconcileChildren(fiber, childVNodes);
    let child = fiber.child;
    while (child) {
      if (child.effectTag !== 'DELETE') {
        // Skip memoized subtrees — props haven't changed
        if (child.memoized) {
          child = child.sibling;
          continue;
        }
        if (boundary) {
          try {
            renderFiber(child);
          } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            const fallbackVNode = renderFallback(boundary, error);
            const fallbackFiber = createFiber(fallbackVNode, fiber);
            fallbackFiber.effectTag = 'CREATE';
            trackDirtyFiber(fallbackFiber);
            fiber.child = fallbackFiber;
            renderFiber(fallbackFiber);
            break;
          }
        } else {
          renderFiber(child);
        }
      }
      child = child.sibling;
    }
    // Only commit if there are actual changes (avoid wasted traversal)
    if (hasChanges) {
      commitWork(fiber);
    }
    _dirtyFiberList = null;
  } else {
    if (oldChild) {
      _dirtyFiberList = [];
      let current: FiberNode | null = oldChild;
      while (current) {
        current.effectTag = 'DELETE';
        trackDirtyFiber(current);
        current = current.sibling;
      }
      // Always commit when marking for deletion
      commitWork(fiber);
      _dirtyFiberList = null;
    }
  }
}
// =============================================================================
// Commit Phase
// =============================================================================
/**
 * Execute all effects on the fiber tree.
 * CREATE/UPDATE first (building tree), then DELETE (cleanup).
 *
 * Uses the dirty fiber list (P1b) when available — avoids O(n) DFS traversal.
 * Falls back to collectEffects DFS if no dirty list (e.g. initial mount via render()).
 */
export function commitWork(fiber: FiberNode): void {
  const dirtyList = _dirtyFiberList;
  if (dirtyList && dirtyList.length > 0) {
    // Fast path: iterate pre-collected dirty fibers
    const createAndUpdateFibers: FiberNode[] = [];
    const deleteFibers: FiberNode[] = [];
    for (const f of dirtyList) {
      if (f.effectTag === 'CREATE' || f.effectTag === 'UPDATE') {
        createAndUpdateFibers.push(f);
      } else if (f.effectTag === 'DELETE') {
        deleteFibers.push(f);
      }
    }
    // Phase 1: CREATE and UPDATE
    for (const f of createAndUpdateFibers) {
      commitSingleFiber(f);
    }
    // Phase 2: DELETE (cleanup)
    for (const f of deleteFibers) {
      commitDeletion(f);
    }
  } else {
    // Fallback: DFS traversal (used when dirty list not initialized)
    const createAndUpdateFibers: FiberNode[] = [];
    const deleteFibers: FiberNode[] = [];
    function collectEffects(f: FiberNode | null): void {
      if (!f) return;
      if (f.effectTag === 'CREATE' || f.effectTag === 'UPDATE') {
        createAndUpdateFibers.push(f);
      } else if (f.effectTag === 'DELETE') {
        deleteFibers.push(f);
      }
      collectEffects(f.child);
      collectEffects(f.sibling);
    }
    collectEffects(fiber);
    // Phase 1: CREATE and UPDATE
    for (const f of createAndUpdateFibers) {
      commitSingleFiber(f);
    }
    // Phase 2: DELETE (cleanup)
    for (const f of deleteFibers) {
      commitDeletion(f);
    }
  }
  // Release old alternate fibers back to pool after commit
  releaseOldFiberTree(fiber);
}
/**
 * Release old alternate fibers back to the fiber pool after commit.
 * Walks the current tree and releases each fiber's alternate.
 */
function releaseOldFiberTree(fiber: FiberNode | null): void {
  if (!fiber) return;
  if (fiber.alternate) {
    // Dispose signal subscriptions on the alternate before releasing it
    disposeSignalBindings(fiber.alternate);
    fiberPool.release(fiber.alternate);
    fiber.alternate = null;
  }
  releaseOldFiberTree(fiber.child);
  releaseOldFiberTree(fiber.sibling);
}
/**
 * Commit a single CREATE or UPDATE fiber.
 */
function commitSingleFiber(fiber: FiberNode): void {
  const type = fiber.vnode.type;
  if (fiber.effectTag === 'CREATE') {
    // Create the host node
    if (type === '#text') {
      fiber.node = createTextNode(fiber.vnode);
    } else if (type === Fragment) {
      // Fragment doesn't create a node — children are committed directly
      // We still need a container node for Fragment
      fiber.node = createHostNode(fiber.vnode);
    } else if (typeof type === 'function') {
      // Function component — node is the child's node
      // The component fiber itself doesn't create a node
      // Its child's node will be used
      if (fiber.child && fiber.child.node) {
        fiber.node = fiber.child.node;
      }
      return;
    } else {
      // Try node pool first — reduce allocations and GC pressure
      const nodeName = fiber.vnode.props?.id ?? (typeof type === 'string' ? type : 'Component');
      const pooledNode = nodePool.acquire(nodeName);
      if (pooledNode) {
        // Reuse pooled node — factory will re-add components
        fiber.node = createHostNode(fiber.vnode, pooledNode);
      } else {
        fiber.node = createHostNode(fiber.vnode);
      }
    }
    // Apply initial props (CREATE fast-path: no diffing, no Set alloc)
    applyCreateProps(fiber.node, fiber.vnode.props);
    // Set ref
    if (fiber.vnode.ref && typeof fiber.vnode.ref === 'object' && 'current' in fiber.vnode.ref) {
      fiber.vnode.ref.current = fiber.node;
    }
    // Attach to parent
    const parentNode = getParentNode(fiber);
    if (parentNode && fiber.node) {
      parentNode.addChild(fiber.node);
    }
    // Setup signal-driven direct property updates (P0)
    setupSignalBindings(fiber);
  } else if (fiber.effectTag === 'UPDATE') {
    // Skip update for memoized fibers — props are confirmed unchanged
    if (fiber.memoized) {
      // Still need to propagate the child node reference for function components
      if (typeof type === 'function' && fiber.child && fiber.child.node) {
        fiber.node = fiber.child.node;
      }
      return;
    }
    // Update existing node
    if (fiber.alternate && fiber.node) {
      const oldProps = fiber.alternate.vnode.props;
      const newProps = fiber.vnode.props;
      // For function components, the node is the child's node
      if (typeof type === 'function') {
        // Component update is handled by re-rendering — props diff is on the child
        if (fiber.child && fiber.child.node) {
          fiber.node = fiber.child.node;
        }
        return;
      }
      applyProps(fiber.node, oldProps, newProps);
      // Update ref
      if (fiber.vnode.ref && typeof fiber.vnode.ref === 'object' && 'current' in fiber.vnode.ref) {
        fiber.vnode.ref.current = fiber.node;
      }
      // Re-establish signal bindings (prop values may have changed bindings)
      setupSignalBindings(fiber);
    }
  }
}
/**
 * Get the parent Cocos4 node for a fiber.
 * Walks up the fiber tree to find the nearest ancestor with a node.
 */
function getParentNode(fiber: FiberNode): any | null {
  let parent = fiber.parent;
  while (parent) {
    if (parent.node) {
      return parent.node;
    }
    parent = parent.parent;
  }
  return null;
}
/**
 * Commit a DELETE fiber — release node to pool for reuse.
 * Uses the NodePool to avoid GC pressure from repeated create/destroy cycles.
 */
function commitDeletion(fiber: FiberNode): void {
  const node = fiber.node;
  if (!node) return;
  // Remove event handlers and props
  removeProps(node, fiber.vnode.props);
  // Clear ref
  if (fiber.vnode.ref && typeof fiber.vnode.ref === 'object' && 'current' in fiber.vnode.ref) {
    fiber.vnode.ref.current = null;
  }
  // Dispose signal subscriptions (P0)
  disposeSignalBindings(fiber);
  // Return host node to pool (handles detach, child cleanup, and optional destroy if pool full)
  nodePool.release(node);
  // Return fiber objects to pool for reuse
  fiberPool.release(fiber.alternate);
  fiberPool.release(fiber);
}
// =============================================================================
// Render Entry Point
// =============================================================================
/**
 * Mount or update a VNode tree onto a Cocos4 container Node.
 *
 * - `render(vnode, container)` — mount or update the tree
 * - `render(null, container)` — unmount and destroy the entire tree
 */
export function render(vnode: VNode | null, container: any): void {
  if (!container) {
    console.error('[reconciler] render() called with null container');
    return;
  }
  if (vnode === null) {
    const existingRoot = rootFibers.get(container);
    if (existingRoot) {
      if (existingRoot.node) {
        // Destroy all children of the container via pool
        const children = existingRoot.node.children.slice();
        for (const child of children) {
          child.removeFromParent();
          child.destroy();
        }
      }
      rootFibers.delete(container);
    }
    return;
  }
  const existingRoot = rootFibers.get(container);
  try {
    if (existingRoot) {
      const newRoot: FiberNode = {
        vnode,
        node: existingRoot.node,
        child: null,
        sibling: null,
        parent: null,
        effectTag: 'UPDATE',
        alternate: existingRoot,
      };
      const childVNodes = normalizeChildren(vnode);
      if (childVNodes.length > 0) {
        _dirtyFiberList = [];
        reconcileChildren(newRoot, childVNodes);
        let child = newRoot.child;
        while (child) {
          if (child.effectTag !== 'DELETE') {
            renderFiber(child);
          }
          child = child.sibling;
        }
      }
      commitWork(newRoot);
      _dirtyFiberList = null;
      rootFibers.set(container, newRoot);
    } else {
      const rootFiber: FiberNode = {
        vnode,
        node: container,
        child: null,
        sibling: null,
        parent: null,
        effectTag: 'NONE',
        alternate: null,
      };
      const childVNodes = normalizeChildren(vnode);
      if (childVNodes.length > 0) {
        _dirtyFiberList = [];
        reconcileChildren(rootFiber, childVNodes);
        let child = rootFiber.child;
        while (child) {
          if (child.effectTag !== 'DELETE') {
            renderFiber(child);
          }
          child = child.sibling;
        }
      }
      commitWork(rootFiber);
      _dirtyFiberList = null;
      rootFibers.set(container, rootFiber);
    }
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logError(error, 'at root level');
  }
}