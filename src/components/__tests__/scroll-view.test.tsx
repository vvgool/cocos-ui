/**
 * ScrollView Component Tests
 * 
 * Tests for the ScrollView component registration, props mapping,
 * and basic rendering behavior.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MockNode, MockComponent, MockScrollView, setupGlobalCc, cleanupGlobalCc } from '../../__tests__/utils/mock-cocos';
import { createTestContainer, setupTest, cleanupTest } from '../../__tests__/utils/test-utils';
import { ComponentRegistry, nodeComponentTypes } from '../../core/create-element';
import { propMappings } from '../../core/apply-props';

// Import the component to trigger registration
import '../scroll-view';

describe('ScrollView', () => {
  let container: MockNode;

  beforeEach(() => {
    setupTest();
    container = createTestContainer('ScrollViewTest');
  });

  afterEach(() => {
    cleanupTest();
  });

  describe('Component Registration', () => {
    it('should register ScrollView component in ComponentRegistry', () => {
      expect(ComponentRegistry.has('ScrollView')).toBe(true);
    });

    it('should register ScrollView prop mappings', () => {
      expect(propMappings.has('ScrollView')).toBe(true);
      const mappings = propMappings.get('ScrollView')!;
      expect(mappings).toHaveProperty('direction');
      expect(mappings).toHaveProperty('horizontal');
      expect(mappings).toHaveProperty('vertical');
      expect(mappings).toHaveProperty('inertia');
      expect(mappings).toHaveProperty('elastic');
      expect(mappings).toHaveProperty('bounceDuration');
      expect(mappings).toHaveProperty('scrollTo');
      expect(mappings).toHaveProperty('onScroll');
    });
  });

  describe('Node Creation and Default Values', () => {
    it('should create a node with ScrollView component and content child', () => {
      const factory = ComponentRegistry.get('ScrollView')!;
      factory(container, {});

      // Check ScrollView component was added
      const scrollView = container.getComponent(MockScrollView);
      expect(scrollView).not.toBeNull();

      // Check content node was created
      const contentNode = container.getChildByName('content');
      expect(contentNode).not.toBeNull();
      expect(contentNode!.getComponent((cc as any).UITransform)).not.toBeNull();

      // Check content is assigned to scrollView
      expect(scrollView!.content).toBe(contentNode);
    });

    it('should default to VERTICAL direction when no direction specified', () => {
      const factory = ComponentRegistry.get('ScrollView')!;
      factory(container, {});

      const scrollView = container.getComponent(MockScrollView)!;
      // Default: vertical=true, horizontal=false (Direction.VERTICAL = 2)
      expect(scrollView.vertical).toBe(true);
      expect(scrollView.horizontal).toBe(false);
    });
  });

  describe('Direction Props', () => {
    it('should set direction to HORIZONTAL', () => {
      const factory = ComponentRegistry.get('ScrollView')!;
      factory(container, { direction: 'HORIZONTAL' });

      const scrollView = container.getComponent(MockScrollView)!;
      expect(scrollView.horizontal).toBe(true);
      expect(scrollView.vertical).toBe(false);
    });

    it('should set direction to VERTICAL', () => {
      const factory = ComponentRegistry.get('ScrollView')!;
      factory(container, { direction: 'VERTICAL' });

      const scrollView = container.getComponent(MockScrollView)!;
      expect(scrollView.horizontal).toBe(false);
      expect(scrollView.vertical).toBe(true);
    });

    it('should set direction to BOTH', () => {
      const factory = ComponentRegistry.get('ScrollView')!;
      factory(container, { direction: 'BOTH' });

      const scrollView = container.getComponent(MockScrollView)!;
      expect(scrollView.horizontal).toBe(true);
      expect(scrollView.vertical).toBe(true);
    });

    it('should set direction to NONE', () => {
      const factory = ComponentRegistry.get('ScrollView')!;
      factory(container, { direction: 'NONE' });

      const scrollView = container.getComponent(MockScrollView)!;
      expect(scrollView.horizontal).toBe(false);
      expect(scrollView.vertical).toBe(false);
    });

    it('should accept numeric direction value', () => {
      const factory = ComponentRegistry.get('ScrollView')!;
      // Direction.HORIZONTAL = 1
      factory(container, { direction: 1 });

      const scrollView = container.getComponent(MockScrollView)!;
      expect(scrollView.horizontal).toBe(true);
      expect(scrollView.vertical).toBe(false);
    });

    it('should handle individual horizontal prop', () => {
      const factory = ComponentRegistry.get('ScrollView')!;
      factory(container, { horizontal: true, vertical: false });

      const scrollView = container.getComponent(MockScrollView)!;
      expect(scrollView.horizontal).toBe(true);
    });

    it('should handle individual vertical prop', () => {
      const factory = ComponentRegistry.get('ScrollView')!;
      factory(container, { vertical: true, horizontal: false });

      const scrollView = container.getComponent(MockScrollView)!;
      expect(scrollView.vertical).toBe(true);
    });

    it('should handle both horizontal and vertical props', () => {
      const factory = ComponentRegistry.get('ScrollView')!;
      factory(container, { horizontal: true, vertical: true });

      const scrollView = container.getComponent(MockScrollView)!;
      expect(scrollView.horizontal).toBe(true);
      expect(scrollView.vertical).toBe(true);
    });
  });

  describe('ScrollView Properties', () => {
    it('should set inertia property via prop mapping', () => {
      const factory = ComponentRegistry.get('ScrollView')!;
      factory(container, {});

      const mappings = propMappings.get('ScrollView')!;
      (mappings.inertia as (node: any, value: any) => void)(container, true);

      const scrollView = container.getComponent(MockScrollView)!;
      expect(scrollView.inertia).toBe(true);
    });

    it('should set elastic property via prop mapping', () => {
      const factory = ComponentRegistry.get('ScrollView')!;
      factory(container, {});

      const mappings = propMappings.get('ScrollView')!;
      (mappings.elastic as (node: any, value: any) => void)(container, true);

      const scrollView = container.getComponent(MockScrollView)!;
      expect(scrollView.elastic).toBe(true);
    });

    it('should set bounceDuration property via prop mapping', () => {
      const factory = ComponentRegistry.get('ScrollView')!;
      factory(container, {});

      const mappings = propMappings.get('ScrollView')!;
      (mappings.bounceDuration as (node: any, value: any) => void)(container, 0.5);

      const scrollView = container.getComponent(MockScrollView)!;
      expect(scrollView.bounceDuration).toBe(0.5);
    });
  });

  describe('scrollTo Method', () => {
    it('should call scrollTo with x, y, and time via prop mapping', () => {
      const factory = ComponentRegistry.get('ScrollView')!;
      factory(container, {});

      const scrollView = container.getComponent(MockScrollView)!;
      const scrollToSpy = vi.fn();
      scrollView.scrollTo = scrollToSpy;

      const mappings = propMappings.get('ScrollView')!;
      (mappings.scrollTo as (node: any, value: any) => void)(container, { x: 100, y: 200, time: 0.5 });

      expect(scrollToSpy).toHaveBeenCalledWith(expect.anything(), 0.5);
    });

    it('should use default time value of 0.3 when not specified', () => {
      const factory = ComponentRegistry.get('ScrollView')!;
      factory(container, {});

      const scrollView = container.getComponent(MockScrollView)!;
      const scrollToSpy = vi.fn();
      scrollView.scrollTo = scrollToSpy;

      const mappings = propMappings.get('ScrollView')!;
      (mappings.scrollTo as (node: any, value: any) => void)(container, { x: 50, y: 100 });

      expect(scrollToSpy).toHaveBeenCalledWith(expect.anything(), 0.3);
    });

    it('should use default x and y values of 0 when not specified', () => {
      const factory = ComponentRegistry.get('ScrollView')!;
      factory(container, {});

      const scrollView = container.getComponent(MockScrollView)!;
      const scrollToSpy = vi.fn();
      scrollView.scrollTo = scrollToSpy;

      const mappings = propMappings.get('ScrollView')!;
      (mappings.scrollTo as (node: any, value: any) => void)(container, { time: 1.0 });

      const callArg = scrollToSpy.mock.calls[0][0];
      expect(callArg.x).toBe(0);
      expect(callArg.y).toBe(0);
    });
  });

  describe('onScroll Event', () => {
    it('should emit onScroll callback with scroll position', () => {
      const factory = ComponentRegistry.get('ScrollView')!;
      const onScrollSpy = vi.fn();

      factory(container, { onScroll: onScrollSpy });

      // Simulate scrolling event
      const scrollView = container.getComponent(MockScrollView)!;
      const contentNode = container.getChildByName('content')!;
      contentNode.position.x = 50;
      contentNode.position.y = 100;

      // Trigger the scrolling event
      container.emit('scrolling');

      expect(onScrollSpy).toHaveBeenCalledWith({
        x: 50,
        y: 100,
        scrollX: 50,
        scrollY: 100,
      });
    });

    it('should not crash if onScroll is provided but content is missing', () => {
      const factory = ComponentRegistry.get('ScrollView')!;
      const onScrollSpy = vi.fn();

      // Manually remove content to test edge case
      factory(container, { onScroll: onScrollSpy });
      const scrollView = container.getComponent(MockScrollView)!;
      scrollView.content = null;

      // Should not throw
      expect(() => container.emit('scrolling')).not.toThrow();
    });
  });

  describe('Prop Mapping Updates', () => {
    it('should update direction via prop mapping', () => {
      const factory = ComponentRegistry.get('ScrollView')!;
      factory(container, { direction: 'VERTICAL' });

      const mappings = propMappings.get('ScrollView')!;
      (mappings.direction as (node: any, value: any) => void)(container, 'HORIZONTAL');

      const scrollView = container.getComponent(MockScrollView)!;
      expect(scrollView.horizontal).toBe(true);
      expect(scrollView.vertical).toBe(false);
    });

    it('should update horizontal via prop mapping', () => {
      const factory = ComponentRegistry.get('ScrollView')!;
      factory(container, { horizontal: false });

      const mappings = propMappings.get('ScrollView')!;
      (mappings.horizontal as (node: any, value: any) => void)(container, true);

      const scrollView = container.getComponent(MockScrollView)!;
      expect(scrollView.horizontal).toBe(true);
    });

    it('should update vertical via prop mapping', () => {
      const factory = ComponentRegistry.get('ScrollView')!;
      factory(container, { vertical: false });

      const mappings = propMappings.get('ScrollView')!;
      (mappings.vertical as (node: any, value: any) => void)(container, true);

      const scrollView = container.getComponent(MockScrollView)!;
      expect(scrollView.vertical).toBe(true);
    });

    it('should update inertia via prop mapping', () => {
      const factory = ComponentRegistry.get('ScrollView')!;
      factory(container, { inertia: false });

      const mappings = propMappings.get('ScrollView')!;
      (mappings.inertia as (node: any, value: any) => void)(container, true);

      const scrollView = container.getComponent(MockScrollView)!;
      expect(scrollView.inertia).toBe(true);
    });

    it('should update elastic via prop mapping', () => {
      const factory = ComponentRegistry.get('ScrollView')!;
      factory(container, { elastic: false });

      const mappings = propMappings.get('ScrollView')!;
      (mappings.elastic as (node: any, value: any) => void)(container, true);

      const scrollView = container.getComponent(MockScrollView)!;
      expect(scrollView.elastic).toBe(true);
    });

    it('should update bounceDuration via prop mapping', () => {
      const factory = ComponentRegistry.get('ScrollView')!;
      factory(container, { bounceDuration: 0.3 });

      const mappings = propMappings.get('ScrollView')!;
      (mappings.bounceDuration as (node: any, value: any) => void)(container, 0.8);

      const scrollView = container.getComponent(MockScrollView)!;
      expect(scrollView.bounceDuration).toBe(0.8);
    });
  });
});
