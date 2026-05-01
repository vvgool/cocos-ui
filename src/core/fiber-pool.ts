/**
 * Fiber Pool — Reuse FiberNode Objects to Reduce GC Pressure
 *
 * During reconciliation, new FiberNode objects are created on every update.
 * Instead of allocating fresh objects and leaving old ones for the GC,
 * released fibers are stored here and reused.
 *
 * Each fiber is fully cleared (all fields reset) before being returned
 * to the pool, preventing stale reference leaks.
 */

import type { FiberNode, EffectTag } from './vnode';

// =============================================================================
// Configuration
// =============================================================================

const DEFAULT_POOL_SIZE = 1000;

// =============================================================================
// FiberPool
// =============================================================================

export class FiberPool {
  private pool: FiberNode[] = [];
  private maxSize: number;

  constructor(maxSize: number = DEFAULT_POOL_SIZE) {
    this.maxSize = maxSize;
  }

  /**
   * Acquire a cleared FiberNode from the pool.
   * Returns a fiber with all fields reset, or `null` if the pool is empty.
   */
  acquire(): FiberNode | null {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return null;
  }

  /**
   * Return a FiberNode to the pool for reuse.
   * All fields are cleared before storing.
   * If the pool is full, the object is discarded (awaiting GC).
   */
  release(fiber: FiberNode | null): void {
    if (!fiber) return;

    // Pool full — discard the object
    if (this.pool.length >= this.maxSize) return;

    // Clear all fields to prevent stale references
    fiber.vnode = null as any;
    fiber.node = null;
    fiber.child = null;
    fiber.sibling = null;
    fiber.parent = null;
    fiber.effectTag = 'NONE' as EffectTag;
    fiber.alternate = null;
    delete (fiber as any).memoized;

    this.pool.push(fiber);
  }

  /**
   * Drain all fibers from the pool.
   */
  drain(): void {
    this.pool.length = 0;
  }

  /**
   * Current number of fibers in the pool.
   */
  get size(): number {
    return this.pool.length;
  }
}

/** Global singleton fiber pool */
export const fiberPool = new FiberPool();
