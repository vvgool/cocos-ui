import { describe, it, expect } from 'vitest';
import {
  jsx,
  jsxs,
  jsxDEV,
  Fragment,
  createElement,
  isValidElement,
} from '../jsx-runtime';

describe('jsx-runtime', () => {
  describe('jsx()', () => {
    it('should create a basic VNode with type and props', () => {
      const vnode = jsx('View', { id: 'test' });

      expect(vnode.type).toBe('View');
      expect(vnode.props).toEqual({ id: 'test' });
      expect(vnode.key).toBeUndefined();
      expect(vnode.ref).toBeUndefined();
    });

    it('should handle children in props', () => {
      const vnode = jsx('View', { children: ['child1', 'child2'] });

      expect(vnode.props.children).toEqual(['child1', 'child2']);
    });

    it('should extract key from props', () => {
      const vnode = jsx('View', { id: 'test', key: 'my-key' });

      expect(vnode.key).toBe('my-key');
      expect(vnode.props.key).toBeUndefined();
    });

    it('should extract ref from props', () => {
      const mockRef = { current: null };
      const vnode = jsx('View', { id: 'test', ref: mockRef });

      expect(vnode.ref).toBe(mockRef);
      expect(vnode.props.ref).toBeUndefined();
    });

    it('should handle key parameter', () => {
      const vnode = jsx('View', { id: 'test' }, 'param-key');

      expect(vnode.key).toBe('param-key');
    });

    it('should handle Fragment type', () => {
      const vnode = jsx(Fragment, { id: 'frag' });

      expect(vnode.type).toBe('Fragment');
      expect(vnode.props).toEqual({ id: 'frag' });
    });

    it('should filter out null/undefined/boolean children', () => {
      const vnode = jsx('View', {
        children: [null, undefined, false, true, 'valid'],
      });

      expect(vnode.props.children).toEqual(['valid']);
    });

    it('should flatten nested children arrays', () => {
      const vnode = jsx('View', {
        children: ['a', ['b', 'c'], 'd'],
      });

      expect(vnode.props.children).toEqual(['a', 'b', 'c', 'd']);
    });

    it('should handle null props', () => {
      const vnode = jsx('View', null);

      expect(vnode.type).toBe('View');
      expect(vnode.props).toEqual({});
      expect(vnode.key).toBeUndefined();
    });

    it('should handle undefined props', () => {
      const vnode = jsx('View', null);

      expect(vnode.type).toBe('View');
      expect(vnode.props).toEqual({});
    });
  });

  describe('jsxs()', () => {
    it('should create a VNode with static children', () => {
      const vnode = jsxs('View', { children: ['child1', 'child2'] });

      expect(vnode.type).toBe('View');
      expect(vnode.props.children).toEqual(['child1', 'child2']);
    });

    it('should extract key from props', () => {
      const vnode = jsxs('View', { id: 'test', key: 'static-key' });

      expect(vnode.key).toBe('static-key');
      expect(vnode.props.key).toBeUndefined();
    });

    it('should extract ref from props', () => {
      const mockRef = { current: null };
      const vnode = jsxs('View', { id: 'test', ref: mockRef });

      expect(vnode.ref).toBe(mockRef);
      expect(vnode.props.ref).toBeUndefined();
    });

    it('should handle key parameter', () => {
      const vnode = jsxs('View', { children: ['child'] }, 'param-key');

      expect(vnode.key).toBe('param-key');
    });

    it('should flatten children in jsxs', () => {
      const vnode = jsxs('View', {
        children: ['a', ['b', 'c'], 'd'],
      });

      expect(vnode.props.children).toEqual(['a', 'b', 'c', 'd']);
    });

    it('should handle null props', () => {
      const vnode = jsxs('View', null);

      expect(vnode.type).toBe('View');
      expect(vnode.props).toEqual({});
    });
  });

  describe('jsxDEV()', () => {
    it('should create a VNode (same as jsx)', () => {
      const vnode = jsxDEV('View', { id: 'dev-test' });

      expect(vnode.type).toBe('View');
      expect(vnode.props).toEqual({ id: 'dev-test' });
    });

    it('should extract key from props', () => {
      const vnode = jsxDEV('View', { key: 'dev-key' });

      expect(vnode.key).toBe('dev-key');
    });

    it('should extract ref from props', () => {
      const mockRef = { current: null };
      const vnode = jsxDEV('View', { ref: mockRef });

      expect(vnode.ref).toBe(mockRef);
    });

    it('should handle children', () => {
      const vnode = jsxDEV('View', { children: ['child1', 'child2'] });

      expect(vnode.props.children).toEqual(['child1', 'child2']);
    });
  });

  describe('createElement()', () => {
    it('should create a basic VNode', () => {
      const vnode = createElement('View', { id: 'test' });

      expect(vnode.type).toBe('View');
      expect(vnode.props).toEqual({ id: 'test' });
    });

    it('should handle children as rest parameters', () => {
      const vnode = createElement('View', { id: 'test' }, 'child1', 'child2');

      expect(vnode.props.children).toEqual(['child1', 'child2']);
    });

    it('should flatten nested children', () => {
      const vnode = createElement('View', { id: 'test' }, [
        'child1',
        ['nested1', 'nested2'],
        'child2',
      ]);

      expect(vnode.props.children).toEqual(['child1', 'nested1', 'nested2', 'child2']);
    });

    it('should handle null props with children', () => {
      const vnode = createElement('View', null, 'child1', 'child2');

      expect(vnode.type).toBe('View');
      expect(vnode.props.children).toEqual(['child1', 'child2']);
    });

    it('should not override existing children in props', () => {
      const vnode = createElement('View', { children: ['existing'] }, 'new');

      expect(vnode.props.children).toEqual(['existing']);
    });

    it('should filter out null/undefined/boolean children', () => {
      const vnode = createElement('View', null, null, undefined, false, true, 'valid');

      expect(vnode.props.children).toEqual(['valid']);
    });
  });

  describe('Fragment', () => {
    it('should have value "Fragment"', () => {
      expect(Fragment).toBe('Fragment');
    });

    it('should be usable as element type', () => {
      const vnode = jsx(Fragment, { id: 'test' });

      expect(vnode.type).toBe('Fragment');
    });
  });

  describe('isValidElement()', () => {
    it('should return true for valid VNode from jsx', () => {
      const vnode = jsx('View', { id: 'test' });
      expect(isValidElement(vnode)).toBe(true);
    });

    it('should return true for valid VNode from jsxs', () => {
      const vnode = jsxs('View', { children: ['child'] });
      expect(isValidElement(vnode)).toBe(true);
    });

    it('should return true for valid VNode from createElement', () => {
      const vnode = createElement('View', { id: 'test' });
      expect(isValidElement(vnode)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isValidElement(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isValidElement(undefined)).toBe(false);
    });

    it('should return false for plain object', () => {
      expect(isValidElement({ foo: 'bar' })).toBe(false);
    });

    it('should return false for string', () => {
      expect(isValidElement('string')).toBe(false);
    });

    it('should return false for number', () => {
      expect(isValidElement(123)).toBe(false);
    });

    it('should return false for object without type', () => {
      expect(isValidElement({ props: {} })).toBe(false);
    });

    it('should return false for object without props', () => {
      expect(isValidElement({ type: 'View' })).toBe(false);
    });

    it('should return false for object with non-object props', () => {
      expect(isValidElement({ type: 'View', props: 'not-object' })).toBe(false);
    });

    it('should return true for Fragment VNode', () => {
      const vnode = jsx(Fragment, { id: 'test' });
      expect(isValidElement(vnode)).toBe(true);
    });
  });
});
