import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MockNode, MockRichText } from '../../__tests__/utils/mock-cocos';
import { setupTest, cleanupTest, createTestContainer } from '../../__tests__/utils/test-utils';
import { createHostNode } from '../../core/create-element';
import { applyCreateProps } from '../../core/apply-props';
import '../../components/rich-text';

describe('RichText', () => {
  let container: MockNode;

  beforeEach(() => {
    setupTest();
    container = createTestContainer('RichTextTestContainer');
  });

  afterEach(() => {
    cleanupTest();
  });

  describe('component registration', () => {
    it('should register RichText component with ComponentRegistry', () => {
      const node = createHostNode({ type: 'RichText', props: {} } as any);
      expect(node).toBeDefined();
      expect(node).toBeInstanceOf(MockNode);
    });

    it('should create RichText component with default props', () => {
      const node = createHostNode({ type: 'RichText', props: {} } as any);
      const richText = node.getComponent(MockRichText);
      expect(richText).toBeDefined();
      expect(richText?.string).toBe('');
      expect(richText?.fontSize).toBe(16);
    });
  });

  describe('props mapping - string', () => {
    it('should set string value', () => {
      const node = createHostNode({ type: 'RichText', props: {} } as any);
      applyCreateProps(node, { string: '<color=#ff0000>Hello</color>' });
      const richText = node.getComponent(MockRichText);
      expect(richText?.string).toBe('<color=#ff0000>Hello</color>');
    });

    it('should set empty string value', () => {
      const node = createHostNode({ type: 'RichText', props: {} } as any);
      applyCreateProps(node, { string: '' });
      const richText = node.getComponent(MockRichText);
      expect(richText?.string).toBe('');
    });
  });

  describe('props mapping - fontSize', () => {
    it('should set fontSize value', () => {
      const node = createHostNode({ type: 'RichText', props: {} } as any);
      applyCreateProps(node, { fontSize: 24 });
      const richText = node.getComponent(MockRichText);
      expect(richText?.fontSize).toBe(24);
    });

    it('should set fontSize from string', () => {
      const node = createHostNode({ type: 'RichText', props: {} } as any);
      applyCreateProps(node, { fontSize: '32' });
      const richText = node.getComponent(MockRichText);
      expect(richText?.fontSize).toBe(32);
    });
  });

  describe('props mapping - fontFamily', () => {
    it('should set fontFamily value', () => {
      const node = createHostNode({ type: 'RichText', props: {} } as any);
      applyCreateProps(node, { fontFamily: 'Helvetica' });
      const richText = node.getComponent(MockRichText);
      expect(richText?.fontFamily).toBe('Helvetica');
    });
  });

  describe('props mapping - maxWidth', () => {
    it('should set maxWidth value', () => {
      const node = createHostNode({ type: 'RichText', props: {} } as any);
      applyCreateProps(node, { maxWidth: 300 });
      const richText = node.getComponent(MockRichText);
      expect(richText?.maxWidth).toBe(300);
    });

    it('should set maxWidth to 0', () => {
      const node = createHostNode({ type: 'RichText', props: {} } as any);
      applyCreateProps(node, { maxWidth: 0 });
      const richText = node.getComponent(MockRichText);
      expect(richText?.maxWidth).toBe(0);
    });
  });

  describe('props mapping - handleTouchEvent', () => {
    it('should set handleTouchEvent to true', () => {
      const node = createHostNode({ type: 'RichText', props: {} } as any);
      applyCreateProps(node, { handleTouchEvent: true });
      const richText = node.getComponent(MockRichText);
      expect(richText?.handleTouchEvent).toBe(true);
    });

    it('should set handleTouchEvent to false', () => {
      const node = createHostNode({ type: 'RichText', props: {} } as any);
      applyCreateProps(node, { handleTouchEvent: false });
      const richText = node.getComponent(MockRichText);
      expect(richText?.handleTouchEvent).toBe(false);
    });
  });

  describe('default values', () => {
    it('should have default string value of empty string', () => {
      const node = createHostNode({ type: 'RichText', props: {} } as any);
      const richText = node.getComponent(MockRichText);
      expect(richText?.string).toBe('');
    });

    it('should have default fontSize of 16', () => {
      const node = createHostNode({ type: 'RichText', props: {} } as any);
      const richText = node.getComponent(MockRichText);
      expect(richText?.fontSize).toBe(16);
    });

    it('should have default fontFamily of Arial', () => {
      const node = createHostNode({ type: 'RichText', props: {} } as any);
      const richText = node.getComponent(MockRichText);
      expect(richText?.fontFamily).toBe('Arial');
    });

    it('should have default handleTouchEvent of false', () => {
      const node = createHostNode({ type: 'RichText', props: {} } as any);
      const richText = node.getComponent(MockRichText);
      expect(richText?.handleTouchEvent).toBe(false);
    });
  });
});
