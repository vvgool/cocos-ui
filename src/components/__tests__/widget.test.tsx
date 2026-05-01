import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MockNode, MockComponent } from '../../__tests__/utils/mock-cocos';
import { setupTest, cleanupTest, createTestContainer } from '../../__tests__/utils/test-utils';
import { createHostNode, ComponentRegistry } from '../../core/create-element';
import { applyCreateProps } from '../../core/apply-props';
import '../../components/widget';

class MockWidget extends MockComponent {
  top: number = 0;
  bottom: number = 0;
  left: number = 0;
  right: number = 0;
  target: MockNode | null = null;
  isAlignOnce: boolean = true;

  constructor(node?: MockNode) {
    super(node);
    this.name = 'Widget';
  }
}

function setupWidgetMocks(): void {
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).cc.Widget = MockWidget;
  }
}

describe('Widget', () => {
  let container: MockNode;

  beforeEach(() => {
    setupTest();
    setupWidgetMocks();
    container = createTestContainer('WidgetTestContainer');
  });

  afterEach(() => {
    cleanupTest();
  });

  describe('component registration', () => {
    it('should register Widget component with ComponentRegistry', () => {
      const factory = ComponentRegistry.get('Widget');
      expect(factory).toBeDefined();
      expect(typeof factory).toBe('function');
    });

    it('should create Widget node via createHostNode', () => {
      const node = createHostNode({ type: 'Widget', props: {} } as any);
      expect(node).toBeDefined();
      expect(node).toBeInstanceOf(MockNode);
    });

    it('should have Widget component attached after creation', () => {
      const node = createHostNode({ type: 'Widget', props: {} } as any);
      const widget = node.getComponent(MockWidget);
      expect(widget).toBeDefined();
      expect(widget?.name).toBe('Widget');
    });
  });

  describe('props mapping - anchor positions', () => {
    it('should set top position', () => {
      const node = createHostNode({ type: 'Widget', props: {} } as any);
      applyCreateProps(node, { top: 100 });
      const widget = node.getComponent(MockWidget);
      expect(widget?.top).toBe(100);
    });

    it('should set bottom position', () => {
      const node = createHostNode({ type: 'Widget', props: {} } as any);
      applyCreateProps(node, { bottom: 50 });
      const widget = node.getComponent(MockWidget);
      expect(widget?.bottom).toBe(50);
    });

    it('should set left position', () => {
      const node = createHostNode({ type: 'Widget', props: {} } as any);
      applyCreateProps(node, { left: 20 });
      const widget = node.getComponent(MockWidget);
      expect(widget?.left).toBe(20);
    });

    it('should set right position', () => {
      const node = createHostNode({ type: 'Widget', props: {} } as any);
      applyCreateProps(node, { right: 30 });
      const widget = node.getComponent(MockWidget);
      expect(widget?.right).toBe(30);
    });

    it('should set all anchor positions at once', () => {
      const node = createHostNode({ type: 'Widget', props: {} } as any);
      applyCreateProps(node, { top: 10, bottom: 20, left: 30, right: 40 });
      const widget = node.getComponent(MockWidget);
      expect(widget?.top).toBe(10);
      expect(widget?.bottom).toBe(20);
      expect(widget?.left).toBe(30);
      expect(widget?.right).toBe(40);
    });
  });

  describe('props mapping - target', () => {
    it('should set target node', () => {
      const targetNode = new MockNode('TargetNode');
      const node = createHostNode({ type: 'Widget', props: {} } as any);
      applyCreateProps(node, { target: targetNode });
      const widget = node.getComponent(MockWidget);
      expect(widget?.target).toBe(targetNode);
    });

    it('should set target to null', () => {
      const node = createHostNode({ type: 'Widget', props: {} } as any);
      applyCreateProps(node, { target: null });
      const widget = node.getComponent(MockWidget);
      expect(widget?.target).toBe(null);
    });
  });

  describe('props mapping - isAlignOnce', () => {
    it('should set isAlignOnce to true', () => {
      const node = createHostNode({ type: 'Widget', props: {} } as any);
      applyCreateProps(node, { isAlignOnce: true });
      const widget = node.getComponent(MockWidget);
      expect(widget?.isAlignOnce).toBe(true);
    });

    it('should set isAlignOnce to false', () => {
      const node = createHostNode({ type: 'Widget', props: {} } as any);
      applyCreateProps(node, { isAlignOnce: false });
      const widget = node.getComponent(MockWidget);
      expect(widget?.isAlignOnce).toBe(false);
    });

    it('should set isAlignOnce from truthy value', () => {
      const node = createHostNode({ type: 'Widget', props: {} } as any);
      applyCreateProps(node, { isAlignOnce: 1 });
      const widget = node.getComponent(MockWidget);
      expect(widget?.isAlignOnce).toBe(true);
    });
  });

  describe('default values', () => {
    it('should have default top 0', () => {
      const node = createHostNode({ type: 'Widget', props: {} } as any);
      applyCreateProps(node, {});
      const widget = node.getComponent(MockWidget);
      expect(widget?.top).toBe(0);
    });

    it('should have default bottom 0', () => {
      const node = createHostNode({ type: 'Widget', props: {} } as any);
      applyCreateProps(node, {});
      const widget = node.getComponent(MockWidget);
      expect(widget?.bottom).toBe(0);
    });

    it('should have default left 0', () => {
      const node = createHostNode({ type: 'Widget', props: {} } as any);
      applyCreateProps(node, {});
      const widget = node.getComponent(MockWidget);
      expect(widget?.left).toBe(0);
    });

    it('should have default right 0', () => {
      const node = createHostNode({ type: 'Widget', props: {} } as any);
      applyCreateProps(node, {});
      const widget = node.getComponent(MockWidget);
      expect(widget?.right).toBe(0);
    });

    it('should have default isAlignOnce true', () => {
      const node = createHostNode({ type: 'Widget', props: {} } as any);
      applyCreateProps(node, {});
      const widget = node.getComponent(MockWidget);
      expect(widget?.isAlignOnce).toBe(true);
    });
  });
});
