import { describe, it, expect, beforeEach } from 'vitest';
import {
  createVNode,
  isValidElement,
  flattenChildren,
  createFiber,
  createOrReuseFiber,
} from '../vnode';
import { fiberPool } from '../fiber-pool';

describe('vnode', () => {
  beforeEach(() => {
    // Clear fiber pool before each test to ensure clean state
    fiberPool.drain();
  });

  describe('createVNode', () => {
    it('should create a basic VNode with type and props', () => {
      const vnode = createVNode('View', { id: 'test' });

      expect(vnode.type).toBe('View');
      expect(vnode.props).toEqual({ id: 'test' });
      expect(vnode.key).toBe(null);
      expect(vnode.ref).toBeUndefined();
    });

    it('should flatten children automatically', () => {
      const vnode = createVNode('View', { id: 'test' }, [
        'child1',
        ['nested1', 'nested2'],
        'child2',
      ] as any);

      expect(vnode.props.children).toEqual(['child1', 'nested1', 'nested2', 'child2']);
    });

    it('should extract key from props', () => {
      const vnode = createVNode('View', { id: 'test', key: 'my-key' });

      expect(vnode.key).toBe('my-key');
      expect(vnode.props.key).toBe('my-key');
    });

    it('should extract ref from props', () => {
      const mockRef = { current: null };
      const vnode = createVNode('View', { id: 'test', ref: mockRef });

      expect(vnode.ref).toBe(mockRef);
      expect(vnode.props.ref).toBe(mockRef);
    });

    it('should handle empty props', () => {
      const vnode = createVNode('View');

      expect(vnode.type).toBe('View');
      expect(vnode.props).toEqual({});
      expect(vnode.key).toBe(null);
    });

    it('should handle null/undefined/boolean children', () => {
      const vnode = createVNode('View', {}, [null, undefined, false, true, 'valid']);

      expect(vnode.props.children).toEqual(['valid']);
    });
  });

  describe('flattenChildren', () => {
    it('should filter out null', () => {
      const result = flattenChildren([null, 'a', null, 'b']);
      expect(result).toEqual(['a', 'b']);
    });

    it('should filter out undefined', () => {
      const result = flattenChildren([undefined, 'a', undefined, 'b']);
      expect(result).toEqual(['a', 'b']);
    });

    it('should filter out boolean values', () => {
      const result = flattenChildren([true, false, 'a', true, 'b']);
      expect(result).toEqual(['a', 'b']);
    });

    it('should flatten nested arrays', () => {
      const result = flattenChildren([
        'a',
        ['b', ['c', 'd']],
        'e',
      ]);
      expect(result).toEqual(['a', 'b', 'c', 'd', 'e']);
    });

    it('should keep string children', () => {
      const result = flattenChildren(['hello', 'world']);
      expect(result).toEqual(['hello', 'world']);
    });

    it('should handle mixed types (VNode + string)', () => {
      const vnode1 = createVNode('Text', { content: '1' });
      const vnode2 = createVNode('Text', { content: '2' });

      const result = flattenChildren([vnode1, 'separator', vnode2]);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(vnode1);
      expect(result[1]).toBe('separator');
      expect(result[2]).toEqual(vnode2);
    });

    it('should handle deeply nested arrays', () => {
      const result = flattenChildren([
        ['a', ['b']],
        [['c'], 'd'],
      ]);
      expect(result).toEqual(['a', 'b', 'c', 'd']);
    });

    it('should return empty array for all invalid children', () => {
      const result = flattenChildren([null, undefined, true, false]);
      expect(result).toEqual([]);
    });
  });

  describe('isValidElement', () => {
    it('should return true for valid VNode', () => {
      const vnode = createVNode('View', { id: 'test' });
      expect(isValidElement(vnode)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isValidElement(null)).toBe(false);
    });

    it('should return false for plain object without proper structure', () => {
      expect(isValidElement({ foo: 'bar' })).toBe(false);
    });

    it('should return false for string', () => {
      expect(isValidElement('string')).toBe(false);
    });

    it('should return false for number', () => {
      expect(isValidElement(123)).toBe(false);
    });

    it('should return false for object without type string', () => {
      expect(isValidElement({ type: () => {}, props: {} })).toBe(false);
    });

    it('should return false for object without props object', () => {
      expect(isValidElement({ type: 'View', props: 'not-object' })).toBe(false);
    });
  });

  describe('createFiber', () => {
    it('should create a basic FiberNode', () => {
      const vnode = createVNode('View', { id: 'test' });
      const fiber = createFiber(vnode);

      expect(fiber.vnode).toBe(vnode);
      expect(fiber.node).toBe(null);
      expect(fiber.child).toBe(null);
      expect(fiber.sibling).toBe(null);
      expect(fiber.parent).toBe(null);
      expect(fiber.effectTag).toBe('NONE');
      expect(fiber.alternate).toBe(null);
    });

    it('should set parent when provided', () => {
      const vnode = createVNode('View', { id: 'test' });
      const parentFiber = createFiber(createVNode('Parent', {}));
      const fiber = createFiber(vnode, parentFiber);

      expect(fiber.parent).toBe(parentFiber);
    });

    it('should reuse fiber from pool', () => {
      const vnode1 = createVNode('View', { id: 'test1' });
      const vnode2 = createVNode('View', { id: 'test2' });

      // Create and release a fiber to populate the pool
      const fiber1 = createFiber(vnode1);
      fiberPool.release(fiber1);

      // Create a new fiber - should reuse from pool
      const fiber2 = createFiber(vnode2);

      // Should be the same object (reused from pool)
      expect(fiber2).toBe(fiber1);
      expect(fiber2.vnode).toBe(vnode2);
    });

    it('should have default effectTag as NONE', () => {
      const vnode = createVNode('View', { id: 'test' });
      const fiber = createFiber(vnode);

      expect(fiber.effectTag).toBe('NONE');
    });
  });

  describe('createOrReuseFiber', () => {
    it('should create fiber with custom fields', () => {
      const vnode = createVNode('View', { id: 'test' });
      const mockNode = { mock: true };

      const fiber = createOrReuseFiber(vnode, {
        node: mockNode,
        effectTag: 'CREATE',
      });

      expect(fiber.vnode).toBe(vnode);
      expect(fiber.node).toBe(mockNode);
      expect(fiber.effectTag).toBe('CREATE');
    });

    it('should override effectTag', () => {
      const vnode = createVNode('View', { id: 'test' });

      const fiber = createOrReuseFiber(vnode, {
        effectTag: 'UPDATE',
      });

      expect(fiber.effectTag).toBe('UPDATE');
    });

    it('should set memoized field when provided', () => {
      const vnode = createVNode('View', { id: 'test' });

      const fiber = createOrReuseFiber(vnode, {
        memoized: true,
      });

      expect(fiber.memoized).toBe(true);
    });

    it('should not set memoized when not provided', () => {
      const vnode = createVNode('View', { id: 'test' });

      const fiber = createOrReuseFiber(vnode, {});

      expect(fiber.memoized).toBeUndefined();
    });

    it('should reuse fiber from pool with custom fields', () => {
      const vnode1 = createVNode('View', { id: 'test1' });
      const vnode2 = createVNode('View', { id: 'test2' });

      // Create and release a fiber to populate the pool
      const fiber1 = createOrReuseFiber(vnode1, { effectTag: 'CREATE' });
      fiberPool.release(fiber1);

      // Create a new fiber with different fields - should reuse from pool
      const mockNode = { mock: true };
      const fiber2 = createOrReuseFiber(vnode2, {
        node: mockNode,
        effectTag: 'UPDATE',
      });

      // Should be the same object (reused from pool)
      expect(fiber2).toBe(fiber1);
      expect(fiber2.vnode).toBe(vnode2);
      expect(fiber2.node).toBe(mockNode);
      expect(fiber2.effectTag).toBe('UPDATE');
    });

    it('should handle all optional fields', () => {
      const vnode = createVNode('View', { id: 'test' });
      const mockNode = { mock: true };
      const childFiber = createFiber(createVNode('Child', {}));
      const siblingFiber = createFiber(createVNode('Sibling', {}));
      const parentFiber = createFiber(createVNode('Parent', {}));
      const alternateFiber = createFiber(createVNode('Alternate', {}));

      const fiber = createOrReuseFiber(vnode, {
        node: mockNode,
        child: childFiber,
        sibling: siblingFiber,
        parent: parentFiber,
        effectTag: 'DELETE',
        alternate: alternateFiber,
        memoized: true,
      });

      expect(fiber.node).toBe(mockNode);
      expect(fiber.child).toBe(childFiber);
      expect(fiber.sibling).toBe(siblingFiber);
      expect(fiber.parent).toBe(parentFiber);
      expect(fiber.effectTag).toBe('DELETE');
      expect(fiber.alternate).toBe(alternateFiber);
      expect(fiber.memoized).toBe(true);
    });
  });
});
