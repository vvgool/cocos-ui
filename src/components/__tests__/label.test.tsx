import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MockNode, MockLabel } from '../../__tests__/utils/mock-cocos';
import { setupTest, cleanupTest, createTestContainer } from '../../__tests__/utils/test-utils';
import { createHostNode } from '../../core/create-element';
import { applyCreateProps } from '../../core/apply-props';
import '../../components/label';

describe('Label', () => {
  let container: MockNode;

  beforeEach(() => {
    setupTest();
    container = createTestContainer('LabelTestContainer');
  });

  afterEach(() => {
    cleanupTest();
  });

  describe('component registration', () => {
    it('should register Label component with ComponentRegistry', () => {
      const node = createHostNode({ type: 'Label', props: {} } as any);
      expect(node).toBeDefined();
      expect(node).toBeInstanceOf(MockNode);
    });

    it('should create Label component with cc.Label attached', () => {
      const node = createHostNode({ type: 'Label', props: {} } as any);
      const label = node.getComponent(MockLabel);
      expect(label).toBeDefined();
    });
  });

  describe('default props', () => {
    it('should have default fontSize of 40', () => {
      const node = createHostNode({ type: 'Label', props: {} } as any);
      const label = node.getComponent(MockLabel);
      expect(label?.fontSize).toBe(40);
    });

    it('should have default horizontalAlign of CENTER', () => {
      const node = createHostNode({ type: 'Label', props: {} } as any);
      const label = node.getComponent(MockLabel);
      expect(label?.horizontalAlign).toBe(MockLabel.HorizontalAlign.CENTER);
    });

    it('should have default verticalAlign of CENTER', () => {
      const node = createHostNode({ type: 'Label', props: {} } as any);
      const label = node.getComponent(MockLabel);
      expect(label?.verticalAlign).toBe(MockLabel.VerticalAlign.CENTER);
    });

    it('should have default overflow of CLAMP', () => {
      const node = createHostNode({ type: 'Label', props: {} } as any);
      const label = node.getComponent(MockLabel);
      expect(label?.overflow).toBe(MockLabel.Overflow.CLAMP);
    });

    it('should have default lineHeight of 40', () => {
      const node = createHostNode({ type: 'Label', props: {} } as any);
      const label = node.getComponent(MockLabel);
      expect(label?.lineHeight).toBe(40);
    });
  });

  describe('props mapping - text', () => {
    it('should set text string', () => {
      const node = createHostNode({ type: 'Label', props: {} } as any);
      applyCreateProps(node, { text: 'Hello World' });
      const label = node.getComponent(MockLabel);
      expect(label?.string).toBe('Hello World');
    });

    it('should set empty text', () => {
      const node = createHostNode({ type: 'Label', props: {} } as any);
      applyCreateProps(node, { text: '' });
      const label = node.getComponent(MockLabel);
      expect(label?.string).toBe('');
    });
  });

  describe('props mapping - fontSize', () => {
    it('should set fontSize', () => {
      const node = createHostNode({ type: 'Label', props: {} } as any);
      applyCreateProps(node, { fontSize: 24 });
      const label = node.getComponent(MockLabel);
      expect(label?.fontSize).toBe(24);
    });

    it('should set fontSize as string', () => {
      const node = createHostNode({ type: 'Label', props: {} } as any);
      applyCreateProps(node, { fontSize: '32' });
      const label = node.getComponent(MockLabel);
      expect(label?.fontSize).toBe(32);
    });
  });

  describe('props mapping - fontFamily', () => {
    it('should set fontFamily', () => {
      const node = createHostNode({ type: 'Label', props: {} } as any);
      applyCreateProps(node, { fontFamily: 'Helvetica' });
      const label = node.getComponent(MockLabel);
      expect(label?.fontFamily).toBe('Helvetica');
    });
  });

  describe('props mapping - text styles', () => {
    it('should set bold', () => {
      const node = createHostNode({ type: 'Label', props: {} } as any);
      applyCreateProps(node, { bold: true });
      const label = node.getComponent(MockLabel);
      expect(label?.isBold).toBe(true);
    });

    it('should set italic', () => {
      const node = createHostNode({ type: 'Label', props: {} } as any);
      applyCreateProps(node, { italic: true });
      const label = node.getComponent(MockLabel);
      expect(label?.isItalic).toBe(true);
    });

    it('should set underline', () => {
      const node = createHostNode({ type: 'Label', props: {} } as any);
      applyCreateProps(node, { underline: true });
      const label = node.getComponent(MockLabel);
      expect(label?.isUnderline).toBe(true);
    });
  });

  describe('props mapping - color', () => {
    it('should set color from hex string', () => {
      const node = createHostNode({ type: 'Label', props: {} } as any);
      applyCreateProps(node, { color: '#ff0000' });
      const label = node.getComponent(MockLabel);
      expect(label?.color.r).toBe(255);
      expect(label?.color.g).toBe(0);
      expect(label?.color.b).toBe(0);
    });

    it('should set color from rgb object', () => {
      const node = createHostNode({ type: 'Label', props: {} } as any);
      applyCreateProps(node, { color: { r: 0, g: 0, b: 255, a: 255 } });
      const label = node.getComponent(MockLabel);
      expect(label?.color.r).toBe(0);
      expect(label?.color.g).toBe(0);
      expect(label?.color.b).toBe(255);
    });
  });

  describe('Node creation via createHostNode', () => {
    it('should create node with correct name', () => {
      const node = createHostNode({ type: 'Label', props: {} } as any);
      expect(node.name).toBe('Label');
    });

    it('should have UITransform component', () => {
      const node = createHostNode({ type: 'Label', props: {} } as any);
      const transform = node.getComponent(cc.UITransform);
      expect(transform).toBeDefined();
    });
  });
});
