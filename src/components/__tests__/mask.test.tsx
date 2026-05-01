import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MockNode, MockComponent } from '../../__tests__/utils/mock-cocos';
import { setupTest, cleanupTest, createTestContainer } from '../../__tests__/utils/test-utils';
import { createHostNode, ComponentRegistry } from '../../core/create-element';
import { applyCreateProps } from '../../core/apply-props';
import '../../components/mask';

class MockMask extends MockComponent {
  type: number = 0;
  inverted: boolean = false;
  alphaThreshold: number = 0.1;
  spriteFrame: any = null;
  alphaThresholdEnabled: boolean = false;

  constructor(node?: MockNode) {
    super(node);
    this.name = 'Mask';
  }
}

function setupMaskMocks(): void {
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).cc.Mask = MockMask;
  }
}

describe('Mask', () => {
  let container: MockNode;

  beforeEach(() => {
    setupTest();
    setupMaskMocks();
    container = createTestContainer('MaskTestContainer');
  });

  afterEach(() => {
    cleanupTest();
  });

  describe('component registration', () => {
    it('should register Mask component with ComponentRegistry', () => {
      const factory = ComponentRegistry.get('Mask');
      expect(factory).toBeDefined();
      expect(typeof factory).toBe('function');
    });

    it('should create Mask node via createHostNode', () => {
      const node = createHostNode({ type: 'Mask', props: {} } as any);
      expect(node).toBeDefined();
      expect(node).toBeInstanceOf(MockNode);
    });

    it('should have Mask component attached after creation', () => {
      const node = createHostNode({ type: 'Mask', props: {} } as any);
      const mask = node.getComponent(MockMask);
      expect(mask).toBeDefined();
      expect(mask?.name).toBe('Mask');
    });
  });

  describe('props mapping - type', () => {
    it('should set type via prop (number) - RECT', () => {
      const node = createHostNode({ type: 'Mask', props: {} } as any);
      applyCreateProps(node, { type: 0 });
      const mask = node.getComponent(MockMask);
      expect(mask?.type).toBe(0);
    });

    it('should set type via prop (number) - ELLIPSE', () => {
      const node = createHostNode({ type: 'Mask', props: {} } as any);
      applyCreateProps(node, { type: 1 });
      const mask = node.getComponent(MockMask);
      expect(mask?.type).toBe(1);
    });

    it('should set type via string - RECT', () => {
      const node = createHostNode({ type: 'Mask', props: {} } as any);
      applyCreateProps(node, { type: 'RECT' });
      const mask = node.getComponent(MockMask);
      expect(mask?.type).toBe(0);
    });

    it('should set type via string - ELLIPSE', () => {
      const node = createHostNode({ type: 'Mask', props: {} } as any);
      applyCreateProps(node, { type: 'ELLIPSE' });
      const mask = node.getComponent(MockMask);
      expect(mask?.type).toBe(1);
    });

    it('should set type via string - IMAGE_STENCIL', () => {
      const node = createHostNode({ type: 'Mask', props: {} } as any);
      applyCreateProps(node, { type: 'IMAGE_STENCIL' });
      const mask = node.getComponent(MockMask);
      expect(mask?.type).toBe(2);
    });

    it('should default to RECT (0) for invalid type', () => {
      const node = createHostNode({ type: 'Mask', props: {} } as any);
      applyCreateProps(node, { type: 'INVALID' });
      const mask = node.getComponent(MockMask);
      expect(mask?.type).toBe(0);
    });
  });

  describe('props mapping - inverted', () => {
    it('should set inverted to true', () => {
      const node = createHostNode({ type: 'Mask', props: {} } as any);
      applyCreateProps(node, { inverted: true });
      const mask = node.getComponent(MockMask);
      expect(mask?.inverted).toBe(true);
    });

    it('should set inverted to false', () => {
      const node = createHostNode({ type: 'Mask', props: {} } as any);
      applyCreateProps(node, { inverted: false });
      const mask = node.getComponent(MockMask);
      expect(mask?.inverted).toBe(false);
    });

    it('should set inverted from truthy value', () => {
      const node = createHostNode({ type: 'Mask', props: {} } as any);
      applyCreateProps(node, { inverted: 1 });
      const mask = node.getComponent(MockMask);
      expect(mask?.inverted).toBe(true);
    });
  });

  describe('props mapping - alphaThreshold', () => {
    it('should set alphaThreshold as number', () => {
      const node = createHostNode({ type: 'Mask', props: {} } as any);
      applyCreateProps(node, { alphaThreshold: 0.5 });
      const mask = node.getComponent(MockMask);
      expect(mask?.alphaThreshold).toBe(0.5);
    });

    it('should set alphaThreshold from string', () => {
      const node = createHostNode({ type: 'Mask', props: {} } as any);
      applyCreateProps(node, { alphaThreshold: '0.8' });
      const mask = node.getComponent(MockMask);
      expect(mask?.alphaThreshold).toBe(0.8);
    });
  });

  describe('default values', () => {
    it('should have default type RECT (0)', () => {
      const node = createHostNode({ type: 'Mask', props: {} } as any);
      applyCreateProps(node, {});
      const mask = node.getComponent(MockMask);
      expect(mask?.type).toBe(0);
    });

    it('should have default inverted false', () => {
      const node = createHostNode({ type: 'Mask', props: {} } as any);
      applyCreateProps(node, {});
      const mask = node.getComponent(MockMask);
      expect(mask?.inverted).toBe(false);
    });

    it('should have default alphaThreshold 0.1', () => {
      const node = createHostNode({ type: 'Mask', props: {} } as any);
      applyCreateProps(node, {});
      const mask = node.getComponent(MockMask);
      expect(mask?.alphaThreshold).toBe(0.1);
    });
  });
});
