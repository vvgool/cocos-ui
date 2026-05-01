import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MockNode, MockSprite } from '../../__tests__/utils/mock-cocos';
import { setupTest, cleanupTest, createTestContainer } from '../../__tests__/utils/test-utils';
import { createHostNode } from '../../core/create-element';
import { applyCreateProps } from '../../core/apply-props';
import '../../components/sprite';

describe('Sprite', () => {
  let container: MockNode;

  beforeEach(() => {
    setupTest();
    container = createTestContainer('SpriteTestContainer');
  });

  afterEach(() => {
    cleanupTest();
  });

  describe('component registration', () => {
    it('should register Sprite component with ComponentRegistry', () => {
      const node = createHostNode({ type: 'Sprite', props: {} } as any);
      expect(node).toBeDefined();
      expect(node).toBeInstanceOf(MockNode);
    });

    it('should create Sprite component with cc.Sprite attached', () => {
      const node = createHostNode({ type: 'Sprite', props: {} } as any);
      const sprite = node.getComponent(MockSprite);
      expect(sprite).toBeDefined();
    });
  });

  describe('default props', () => {
    it('should have default type of SIMPLE', () => {
      const node = createHostNode({ type: 'Sprite', props: {} } as any);
      const sprite = node.getComponent(MockSprite);
      expect(sprite?.type).toBe(MockSprite.Type.SIMPLE);
    });

    it('should have default sizeMode of NONE', () => {
      const node = createHostNode({ type: 'Sprite', props: {} } as any);
      const sprite = node.getComponent(MockSprite);
      expect(sprite?.sizeMode).toBe(MockSprite.SizeMode.NONE);
    });

    it('should have default grayscale of false', () => {
      const node = createHostNode({ type: 'Sprite', props: {} } as any);
      const sprite = node.getComponent(MockSprite);
      expect(sprite?.grayscale).toBe(false);
    });

    it('should have default opacity of 255', () => {
      const node = createHostNode({ type: 'Sprite', props: {} } as any);
      const sprite = node.getComponent(MockSprite);
      expect(sprite?.opacity).toBe(255);
    });
  });

  describe('props mapping - type', () => {
    it('should set type to SLICED', () => {
      const node = createHostNode({ type: 'Sprite', props: {} } as any);
      applyCreateProps(node, { type: MockSprite.Type.SLICED });
      const sprite = node.getComponent(MockSprite);
      expect(sprite?.type).toBe(MockSprite.Type.SLICED);
    });

    it('should set type to TILED', () => {
      const node = createHostNode({ type: 'Sprite', props: {} } as any);
      applyCreateProps(node, { type: MockSprite.Type.TILED });
      const sprite = node.getComponent(MockSprite);
      expect(sprite?.type).toBe(MockSprite.Type.TILED);
    });
  });

  describe('props mapping - sizeMode', () => {
    it('should set sizeMode to RAW_SIZE', () => {
      const node = createHostNode({ type: 'Sprite', props: {} } as any);
      applyCreateProps(node, { sizeMode: MockSprite.SizeMode.RAW_SIZE });
      const sprite = node.getComponent(MockSprite);
      expect(sprite?.sizeMode).toBe(MockSprite.SizeMode.RAW_SIZE);
    });

    it('should set sizeMode to TRIMMED', () => {
      const node = createHostNode({ type: 'Sprite', props: {} } as any);
      applyCreateProps(node, { sizeMode: MockSprite.SizeMode.TRIMMED });
      const sprite = node.getComponent(MockSprite);
      expect(sprite?.sizeMode).toBe(MockSprite.SizeMode.TRIMMED);
    });
  });

  describe('props mapping - grayscale', () => {
    it('should set grayscale to true', () => {
      const node = createHostNode({ type: 'Sprite', props: {} } as any);
      applyCreateProps(node, { grayscale: true });
      const sprite = node.getComponent(MockSprite);
      expect(sprite?.grayscale).toBe(true);
    });

    it('should set grayscale to false', () => {
      const node = createHostNode({ type: 'Sprite', props: {} } as any);
      applyCreateProps(node, { grayscale: false });
      const sprite = node.getComponent(MockSprite);
      expect(sprite?.grayscale).toBe(false);
    });
  });

  describe('props mapping - opacity', () => {
    it('should set opacity', () => {
      const node = createHostNode({ type: 'Sprite', props: {} } as any);
      applyCreateProps(node, { opacity: 128 });
      const sprite = node.getComponent(MockSprite);
      expect(sprite?.opacity).toBe(128);
    });

    it('should set opacity to 0 (invisible)', () => {
      const node = createHostNode({ type: 'Sprite', props: {} } as any);
      applyCreateProps(node, { opacity: 0 });
      const sprite = node.getComponent(MockSprite);
      expect(sprite?.opacity).toBe(0);
    });
  });

  describe('props mapping - src', () => {
    it('should accept src prop for image loading', () => {
      const node = createHostNode({ type: 'Sprite', props: {} } as any);
      applyCreateProps(node, { src: 'test-image.png' });
      const sprite = node.getComponent(MockSprite);
      expect(sprite).toBeDefined();
    });
  });

  describe('Node creation via createHostNode', () => {
    it('should create node with correct name', () => {
      const node = createHostNode({ type: 'Sprite', props: {} } as any);
      expect(node.name).toBe('Sprite');
    });

    it('should have UITransform component', () => {
      const node = createHostNode({ type: 'Sprite', props: {} } as any);
      const transform = node.getComponent(cc.UITransform);
      expect(transform).toBeDefined();
    });
  });
});
