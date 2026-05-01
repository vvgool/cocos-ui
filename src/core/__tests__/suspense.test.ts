/**
 * Suspense Unit Tests
 * 
 * Tests for Suspense component and placeholder helpers.
 * Pure VNode tests - no Cocos4 mock required.
 */

import { describe, it, expect } from 'vitest';
import { Suspense, shimmer, placeholder } from '../suspense';
import { createElement } from '../jsx-runtime';

describe('Suspense', () => {
  it('should create a Suspense component function', () => {
    expect(Suspense).toBeDefined();
    expect(typeof Suspense).toBe('function');
  });

  it('should render fallback when no children are provided', () => {
    const fallback = createElement('View', { className: 'loading' }, 'Loading...');
    const result = Suspense({ fallback });

    expect(result).toBeDefined();
    expect(result.type).toBe('View');
    expect(result.props.className).toBe('loading');
    expect(result.props.children).toEqual(['Loading...']);
  });

  it('should render children when resources have no src prop', () => {
    const fallback = createElement('View', { className: 'loading' }, 'Loading...');
    const child = createElement('View', { className: 'content' }, 'No resources here');
    
    const result = Suspense({ fallback, children: child });

    expect(result).toBeDefined();
    expect(result.type).toBe('View');
    expect(result.props.className).toBe('content');
  });

  it('should render children when no resources are referenced', () => {
    const fallback = createElement('View', null, 'Loading');
    const child = createElement('View', { className: 'content' }, 'Content');
    
    const result = Suspense({ fallback, children: child });

    expect(result).toBeDefined();
    expect(result.type).toBe('View');
    expect(result.props.className).toBe('content');
    expect(result.props.children).toEqual(['Content']);
  });

  it('should wrap multiple children in a Fragment', () => {
    const fallback = createElement('View', null, 'Loading');
    const child1 = createElement('View', null, 'Child 1');
    const child2 = createElement('View', null, 'Child 2');
    
    const result = Suspense({ fallback, children: [child1, child2] });

    expect(result).toBeDefined();
    expect(result.type).toBe('Fragment');
    expect(result.props.children).toHaveLength(2);
  });

  it('should handle string children as text nodes', () => {
    const fallback = createElement('View', null, 'Loading');
    
    const result = Suspense({ fallback, children: 'Hello World' });

    expect(result).toBeDefined();
    expect(result.type).toBe('#text');
    expect(result.props.textContent).toBe('Hello World');
  });
});

describe('shimmer()', () => {
  it('should create a Placeholder VNode with default dimensions', () => {
    const result = shimmer();

    expect(result).toBeDefined();
    expect(result.type).toBe('Placeholder');
    expect(result.props).toEqual({});
    expect(result.key).toBe(null);
  });

  it('should create a Placeholder VNode with custom width', () => {
    const result = shimmer({ width: 300 });

    expect(result).toBeDefined();
    expect(result.type).toBe('Placeholder');
    expect(result.props.width).toBe(300);
  });

  it('should create a Placeholder VNode with custom dimensions', () => {
    const result = shimmer({ width: 400, height: 200 });

    expect(result).toBeDefined();
    expect(result.type).toBe('Placeholder');
    expect(result.props.width).toBe(400);
    expect(result.props.height).toBe(200);
  });

  it('should create a Placeholder VNode with border radius', () => {
    const result = shimmer({ width: 100, height: 100, borderRadius: 8 });

    expect(result).toBeDefined();
    expect(result.type).toBe('Placeholder');
    expect(result.props.borderRadius).toBe(8);
  });

  it('should create a Placeholder VNode with custom color', () => {
    const result = shimmer({ color: '#cccccc' });

    expect(result).toBeDefined();
    expect(result.type).toBe('Placeholder');
    expect(result.props.color).toBe('#cccccc');
  });
});

describe('placeholder()', () => {
  it('should create a Placeholder VNode (alias for shimmer)', () => {
    const result = placeholder();

    expect(result).toBeDefined();
    expect(result.type).toBe('Placeholder');
    expect(result.key).toBe(null);
  });

  it('should accept the same props as shimmer', () => {
    const result = placeholder({ width: 250, height: 150, borderRadius: 4, color: '#dddddd' });

    expect(result).toBeDefined();
    expect(result.type).toBe('Placeholder');
    expect(result.props.width).toBe(250);
    expect(result.props.height).toBe(150);
    expect(result.props.borderRadius).toBe(4);
    expect(result.props.color).toBe('#dddddd');
  });

  it('should produce identical output to shimmer', () => {
    const props = { width: 100, height: 50 };
    const shimmerResult = shimmer(props);
    const placeholderResult = placeholder(props);

    expect(placeholderResult).toEqual(shimmerResult);
  });
});
