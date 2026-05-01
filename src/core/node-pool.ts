/**
 * Node Pool — Reuse Cocos4 Nodes to Reduce GC Pressure
 *
 * Instead of creating and destroying cc.Node objects repeatedly,
 * release() returns them to a pool and acquire() reuses them.
 * This reduces JS→C++ boundary crossings and GC churn.
 *
 * Pooled nodes are deactivated and detached from the scene graph.
 * On acquire, they are reactivated and must be re-initialized by
 * the component factory.
 */
// =============================================================================
// Configuration
// =============================================================================
const DEFAULT_POOL_SIZE = 50;
// =============================================================================
// NodePool
// =============================================================================
export class NodePool {
  private pool: any[] = [];
  private maxSize: number;
  constructor(maxSize: number = DEFAULT_POOL_SIZE) {
    this.maxSize = maxSize;
  }
  /**
   * Acquire a node from the pool.
   * Returns a recycled node (active, renamed) or `null` if the pool is empty.
   * When `null` is returned, the caller should create a new node.
   */
  acquire(name: string): any {
    if (this.pool.length > 0) {
      const node = this.pool.pop()!;
      node.name = name;
      node.active = true;
      return node;
    }
    return null;
  }
  /**
   * Return a node to the pool for reuse.
   * Detaches from scene graph, deactivates, and destroys children.
   * If the pool is full, the node is destroyed instead.
   */
  release(node: any): void {
    if (!node) return;
    if (this.pool.length >= this.maxSize) {
      // Pool full — destroy node directly
      node.removeFromParent();
      node.destroy();
      return;
    }
    // Detach from scene graph
    node.removeFromParent();
    node.active = false;
    // Destroy all children (pool only reuses the root node)
    const children = node.children.slice();
    for (const child of children) {
      child.removeFromParent();
      child.destroy();
    }
    // Remove all non-UITransform components (factories will re-add them)
    const components = node.components.slice();
    for (const comp of components) {
      if (comp.constructor && comp.constructor.name !== 'UITransform') {
        node.removeComponent(comp);
      }
    }
    this.pool.push(node);
  }
  /**
   * Destroy all nodes currently in the pool.
   */
  drain(): void {
    for (const node of this.pool) {
      node.removeFromParent();
      node.destroy();
    }
    this.pool.length = 0;
  }
  /**
   * Current number of nodes in the pool.
   */
  get size(): number {
    return this.pool.length;
  }
}
/** Global singleton node pool */
export const nodePool = new NodePool();
