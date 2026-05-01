import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MockNode, MockUITransform, setupGlobalCc, cleanupGlobalCc } from '../../__tests__/utils/mock-cocos';
import { createTestContainer } from '../../__tests__/utils/test-utils';
import { createHostNode } from '../../core/create-element';
import { applyCreateProps } from '../../core/apply-props';
import '../../components/layout';

const MockLayout = class MockLayout {
  node: MockNode | null = null;
  name: string = 'Layout';
  type: number = 0;
  spacingX: number = 0;
  spacingY: number = 0;
  paddingLeft: number = 0;
  paddingRight: number = 0;
  paddingTop: number = 0;
  paddingBottom: number = 0;
  resizeMode: number = 0;
  horizontalAlign: number = 0;
  verticalAlign: number = 0;

  static Type = { NONE: 0, HORIZONTAL: 1, VERTICAL: 2, GRID: 3 };
  static ResizeMode = { NONE: 0, CONTAINER: 1, CHILDREN: 2 };
  static HorizontalAlign = { LEFT: 0, CENTER: 1, RIGHT: 2, BOTH: 3 };
  static VerticalAlign = { TOP: 0, CENTER: 1, BOTTOM: 2, BOTH: 3 };

  constructor(node?: MockNode) {
    if (node) {
      this.node = node;
    }
  }
};

describe('Layout', () => {
  let container: MockNode;

  beforeEach(() => {
    setupGlobalCc();
    (globalThis as any).cc.Layout = MockLayout;
    container = createTestContainer('LayoutTestContainer');
  });

  afterEach(() => {
    cleanupGlobalCc();
  });

  describe('VBox component registration', () => {
    it('should register VBox component with ComponentRegistry', () => {
      const node = createHostNode({ type: 'VBox', props: {} } as any);
      expect(node).toBeDefined();
      expect(node).toBeInstanceOf(MockNode);
    });

    it('should create VBox with Layout component', () => {
      const node = createHostNode({ type: 'VBox', props: {} } as any);
      expect(node.name).toBe('VBox');
    });

    it('should set layout type to VERTICAL', () => {
      const node = createHostNode({ type: 'VBox', props: {} } as any);
      const layout = node.getComponent(MockLayout);
      expect(layout).toBeDefined();
      expect(layout?.type).toBe(MockLayout.Type.VERTICAL);
    });
  });

  describe('HBox component registration', () => {
    it('should register HBox component with ComponentRegistry', () => {
      const node = createHostNode({ type: 'HBox', props: {} } as any);
      expect(node).toBeDefined();
      expect(node).toBeInstanceOf(MockNode);
    });

    it('should create HBox with Layout component', () => {
      const node = createHostNode({ type: 'HBox', props: {} } as any);
      expect(node.name).toBe('HBox');
    });

    it('should set layout type to HORIZONTAL', () => {
      const node = createHostNode({ type: 'HBox', props: {} } as any);
      const layout = node.getComponent(MockLayout);
      expect(layout).toBeDefined();
      expect(layout?.type).toBe(MockLayout.Type.HORIZONTAL);
    });
  });

  describe('VBox props mapping - spacing', () => {
    it('should set spacing (both X and Y)', () => {
      const node = createHostNode({ type: 'VBox', props: {} } as any);
      applyCreateProps(node, { spacing: 10 });
      const layout = node.getComponent(MockLayout);
      expect(layout?.spacingX).toBe(10);
      expect(layout?.spacingY).toBe(10);
    });

    it('should set spacingX only', () => {
      const node = createHostNode({ type: 'VBox', props: {} } as any);
      applyCreateProps(node, { spacingX: 20 });
      const layout = node.getComponent(MockLayout);
      expect(layout?.spacingX).toBe(20);
    });

    it('should set spacingY only', () => {
      const node = createHostNode({ type: 'VBox', props: {} } as any);
      applyCreateProps(node, { spacingY: 15 });
      const layout = node.getComponent(MockLayout);
      expect(layout?.spacingY).toBe(15);
    });
  });

  describe('VBox props mapping - padding', () => {
    it('should set padding (all sides)', () => {
      const node = createHostNode({ type: 'VBox', props: {} } as any);
      applyCreateProps(node, { padding: 10 });
      const layout = node.getComponent(MockLayout);
      expect(layout?.paddingLeft).toBe(10);
      expect(layout?.paddingRight).toBe(10);
      expect(layout?.paddingTop).toBe(10);
      expect(layout?.paddingBottom).toBe(10);
    });

    it('should set paddingLeft only', () => {
      const node = createHostNode({ type: 'VBox', props: {} } as any);
      applyCreateProps(node, { paddingLeft: 5 });
      const layout = node.getComponent(MockLayout);
      expect(layout?.paddingLeft).toBe(5);
    });

    it('should set paddingRight only', () => {
      const node = createHostNode({ type: 'VBox', props: {} } as any);
      applyCreateProps(node, { paddingRight: 10 });
      const layout = node.getComponent(MockLayout);
      expect(layout?.paddingRight).toBe(10);
    });

    it('should set paddingTop only', () => {
      const node = createHostNode({ type: 'VBox', props: {} } as any);
      applyCreateProps(node, { paddingTop: 15 });
      const layout = node.getComponent(MockLayout);
      expect(layout?.paddingTop).toBe(15);
    });

    it('should set paddingBottom only', () => {
      const node = createHostNode({ type: 'VBox', props: {} } as any);
      applyCreateProps(node, { paddingBottom: 20 });
      const layout = node.getComponent(MockLayout);
      expect(layout?.paddingBottom).toBe(20);
    });
  });

  describe('VBox props mapping - resizeMode', () => {
    it('should set resizeMode to CONTAINER', () => {
      const node = createHostNode({ type: 'VBox', props: {} } as any);
      applyCreateProps(node, { resizeMode: MockLayout.ResizeMode.CONTAINER });
      const layout = node.getComponent(MockLayout);
      expect(layout?.resizeMode).toBe(MockLayout.ResizeMode.CONTAINER);
    });

    it('should set resizeMode to CHILDREN', () => {
      const node = createHostNode({ type: 'VBox', props: {} } as any);
      applyCreateProps(node, { resizeMode: MockLayout.ResizeMode.CHILDREN });
      const layout = node.getComponent(MockLayout);
      expect(layout?.resizeMode).toBe(MockLayout.ResizeMode.CHILDREN);
    });
  });

  describe('HBox props mapping - spacing', () => {
    it('should set spacing (both X and Y)', () => {
      const node = createHostNode({ type: 'HBox', props: {} } as any);
      applyCreateProps(node, { spacing: 10 });
      const layout = node.getComponent(MockLayout);
      expect(layout?.spacingX).toBe(10);
      expect(layout?.spacingY).toBe(10);
    });

    it('should set spacingX only', () => {
      const node = createHostNode({ type: 'HBox', props: {} } as any);
      applyCreateProps(node, { spacingX: 25 });
      const layout = node.getComponent(MockLayout);
      expect(layout?.spacingX).toBe(25);
    });
  });

  describe('HBox props mapping - padding', () => {
    it('should set padding (all sides)', () => {
      const node = createHostNode({ type: 'HBox', props: {} } as any);
      applyCreateProps(node, { padding: 20 });
      const layout = node.getComponent(MockLayout);
      expect(layout?.paddingLeft).toBe(20);
      expect(layout?.paddingRight).toBe(20);
      expect(layout?.paddingTop).toBe(20);
      expect(layout?.paddingBottom).toBe(20);
    });

    it('should set individual padding values', () => {
      const node = createHostNode({ type: 'HBox', props: {} } as any);
      applyCreateProps(node, {
        paddingLeft: 5,
        paddingRight: 10,
        paddingTop: 15,
        paddingBottom: 20,
      });
      const layout = node.getComponent(MockLayout);
      expect(layout?.paddingLeft).toBe(5);
      expect(layout?.paddingRight).toBe(10);
      expect(layout?.paddingTop).toBe(15);
      expect(layout?.paddingBottom).toBe(20);
    });
  });

  describe('Node creation via createHostNode', () => {
    it('should create VBox node with correct name', () => {
      const node = createHostNode({ type: 'VBox', props: {} } as any);
      expect(node.name).toBe('VBox');
    });

    it('should create HBox node with correct name', () => {
      const node = createHostNode({ type: 'HBox', props: {} } as any);
      expect(node.name).toBe('HBox');
    });

    it('should have UITransform component', () => {
      const node = createHostNode({ type: 'VBox', props: {} } as any);
      const transform = node.getComponent(MockUITransform);
      expect(transform).toBeDefined();
    });
  });
});
