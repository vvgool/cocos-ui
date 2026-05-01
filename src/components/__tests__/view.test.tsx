import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MockNode, MockUITransform } from '../../__tests__/utils/mock-cocos';
import { setupTest, cleanupTest, createTestContainer } from '../../__tests__/utils/test-utils';
import { createHostNode } from '../../core/create-element';
import { applyCreateProps } from '../../core/apply-props';
import '../../components/view';

describe('View', () => {
  let container: MockNode;

  beforeEach(() => {
    setupTest();
    container = createTestContainer('ViewTestContainer');
  });

  afterEach(() => {
    cleanupTest();
  });

  describe('component registration', () => {
    it('should register View component with ComponentRegistry', () => {
      const node = createHostNode({ type: 'View', props: {} } as any);
      expect(node).toBeDefined();
      expect(node).toBeInstanceOf(MockNode);
    });

    it('should create View component with default props', () => {
      const node = createHostNode({ type: 'View', props: {} } as any);
      expect(node).toBeDefined();
      expect(node.name).toBe('View');
      expect(node.active).toBe(true);
    });
  });

  describe('props mapping - size', () => {
    it('should set width via UITransform', () => {
      const node = createHostNode({ type: 'View', props: {} } as any);
      applyCreateProps(node, { width: 200 });
      const transform = node.getComponent(MockUITransform);
      expect(transform).toBeDefined();
      expect(transform?.contentSize.width).toBe(200);
    });

    it('should set height via UITransform', () => {
      const node = createHostNode({ type: 'View', props: {} } as any);
      applyCreateProps(node, { height: 150 });
      const transform = node.getComponent(MockUITransform);
      expect(transform).toBeDefined();
      expect(transform?.contentSize.height).toBe(150);
    });

    it('should set both width and height', () => {
      const node = createHostNode({ type: 'View', props: {} } as any);
      applyCreateProps(node, { width: 300, height: 200 });
      const transform = node.getComponent(MockUITransform);
      expect(transform?.contentSize.width).toBe(300);
      expect(transform?.contentSize.height).toBe(200);
    });
  });

  describe('props mapping - position', () => {
    it('should set x position', () => {
      const node = createHostNode({ type: 'View', props: {} } as any);
      applyCreateProps(node, { x: 100 });
      expect(node.position.x).toBe(100);
      expect(node.position.y).toBe(0);
    });

    it('should set y position', () => {
      const node = createHostNode({ type: 'View', props: {} } as any);
      applyCreateProps(node, { y: 50 });
      expect(node.position.x).toBe(0);
      expect(node.position.y).toBe(50);
    });

    it('should set both x and y position', () => {
      const node = createHostNode({ type: 'View', props: {} } as any);
      applyCreateProps(node, { x: 100, y: 200 });
      expect(node.position.x).toBe(100);
      expect(node.position.y).toBe(200);
    });
  });

  describe('props mapping - anchor point', () => {
    it('should set anchorX', () => {
      const node = createHostNode({ type: 'View', props: {} } as any);
      applyCreateProps(node, { anchorX: 0.5 });
      const transform = node.getComponent(MockUITransform);
      expect(transform?.anchorPoint.x).toBe(0.5);
    });

    it('should set anchorY', () => {
      const node = createHostNode({ type: 'View', props: {} } as any);
      applyCreateProps(node, { anchorY: 0.5 });
      const transform = node.getComponent(MockUITransform);
      expect(transform?.anchorPoint.y).toBe(0.5);
    });

    it('should set both anchorX and anchorY', () => {
      const node = createHostNode({ type: 'View', props: {} } as any);
      applyCreateProps(node, { anchorX: 1, anchorY: 0 });
      const transform = node.getComponent(MockUITransform);
      expect(transform?.anchorPoint.x).toBe(1);
      expect(transform?.anchorPoint.y).toBe(0);
    });
  });

  describe('props mapping - scale', () => {
    it('should set scaleX', () => {
      const node = createHostNode({ type: 'View', props: {} } as any);
      applyCreateProps(node, { scaleX: 2 });
      expect(node.scale.x).toBe(2);
      expect(node.scale.y).toBe(1);
    });

    it('should set scaleY', () => {
      const node = createHostNode({ type: 'View', props: {} } as any);
      applyCreateProps(node, { scaleY: 1.5 });
      expect(node.scale.x).toBe(1);
      expect(node.scale.y).toBe(1.5);
    });

    it('should set both scaleX and scaleY', () => {
      const node = createHostNode({ type: 'View', props: {} } as any);
      applyCreateProps(node, { scaleX: 2, scaleY: 3 });
      expect(node.scale.x).toBe(2);
      expect(node.scale.y).toBe(3);
    });
  });

  describe('props mapping - opacity', () => {
    it('should set opacity via UIOpacity component', () => {
      const node = createHostNode({ type: 'View', props: {} } as any);
      applyCreateProps(node, { opacity: 128 });
      const uiOpacity = node.getComponent(cc.UIOpacity);
      expect(uiOpacity).toBeDefined();
      expect(uiOpacity?.opacity).toBe(128);
    });

    it('should set opacity to 0 (invisible)', () => {
      const node = createHostNode({ type: 'View', props: {} } as any);
      applyCreateProps(node, { opacity: 0 });
      const uiOpacity = node.getComponent(cc.UIOpacity);
      expect(uiOpacity?.opacity).toBe(0);
    });

    it('should set opacity to 255 (fully visible)', () => {
      const node = createHostNode({ type: 'View', props: {} } as any);
      applyCreateProps(node, { opacity: 255 });
      const uiOpacity = node.getComponent(cc.UIOpacity);
      expect(uiOpacity?.opacity).toBe(255);
    });
  });

  describe('props mapping - color', () => {
    it('should set color from hex string', () => {
      const node = createHostNode({ type: 'View', props: {} } as any);
      applyCreateProps(node, { color: '#ff0000' });
      expect(node.color.r).toBe(255);
      expect(node.color.g).toBe(0);
      expect(node.color.b).toBe(0);
    });

    it('should set color from rgb object', () => {
      const node = createHostNode({ type: 'View', props: {} } as any);
      applyCreateProps(node, { color: { r: 0, g: 255, b: 0, a: 255 } });
      expect(node.color.r).toBe(0);
      expect(node.color.g).toBe(255);
      expect(node.color.b).toBe(0);
    });
  });

  describe('props mapping - visibility', () => {
    it('should set visible to false (deactivate node)', () => {
      const node = createHostNode({ type: 'View', props: {} } as any);
      applyCreateProps(node, { visible: false });
      expect(node.active).toBe(false);
    });

    it('should set visible to true (activate node)', () => {
      const node = createHostNode({ type: 'View', props: {} } as any);
      applyCreateProps(node, { visible: true });
      expect(node.active).toBe(true);
    });
  });

  describe('default props values', () => {
    it('should have default position (0, 0)', () => {
      const node = createHostNode({ type: 'View', props: {} } as any);
      expect(node.position.x).toBe(0);
      expect(node.position.y).toBe(0);
    });

    it('should have default scale (1, 1)', () => {
      const node = createHostNode({ type: 'View', props: {} } as any);
      expect(node.scale.x).toBe(1);
      expect(node.scale.y).toBe(1);
    });

    it('should have default visibility (true)', () => {
      const node = createHostNode({ type: 'View', props: {} } as any);
      expect(node.active).toBe(true);
    });
  });
});
