import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MockNode, MockEditBox } from '../../__tests__/utils/mock-cocos';
import { setupTest, cleanupTest, createTestContainer } from '../../__tests__/utils/test-utils';
import { createHostNode } from '../../core/create-element';
import { applyCreateProps } from '../../core/apply-props';
import '../../components/edit-box';

describe('EditBox', () => {
  let container: MockNode;

  beforeEach(() => {
    setupTest();
    container = createTestContainer('EditBoxTestContainer');
  });

  afterEach(() => {
    cleanupTest();
  });

  describe('component registration', () => {
    it('should register EditBox component with ComponentRegistry', () => {
      const node = createHostNode({ type: 'EditBox', props: {} } as any);
      expect(node).toBeDefined();
      expect(node).toBeInstanceOf(MockNode);
    });

    it('should create EditBox component with default props', () => {
      const node = createHostNode({ type: 'EditBox', props: {} } as any);
      const editBox = node.getComponent(MockEditBox);
      expect(editBox).toBeDefined();
      expect(editBox?.string).toBe('');
      expect(editBox?.interactable).toBe(true);
    });
  });

  describe('props mapping - value', () => {
    it('should set string value', () => {
      const node = createHostNode({ type: 'EditBox', props: {} } as any);
      applyCreateProps(node, { value: 'Hello World' });
      const editBox = node.getComponent(MockEditBox);
      expect(editBox?.string).toBe('Hello World');
    });

    it('should set empty string value', () => {
      const node = createHostNode({ type: 'EditBox', props: {} } as any);
      applyCreateProps(node, { value: '' });
      const editBox = node.getComponent(MockEditBox);
      expect(editBox?.string).toBe('');
    });
  });

  describe('props mapping - placeholder', () => {
    it('should set placeholder value', () => {
      const node = createHostNode({ type: 'EditBox', props: {} } as any);
      applyCreateProps(node, { placeholder: 'Enter text...' });
      const editBox = node.getComponent(MockEditBox);
      expect(editBox?.placeholder).toBe('Enter text...');
    });
  });

  describe('props mapping - maxLength', () => {
    it('should set maxLength value', () => {
      const node = createHostNode({ type: 'EditBox', props: {} } as any);
      applyCreateProps(node, { maxLength: 50 });
      const editBox = node.getComponent(MockEditBox);
      expect(editBox?.maxLength).toBe(50);
    });

    it('should set maxLength to -1 (unlimited)', () => {
      const node = createHostNode({ type: 'EditBox', props: {} } as any);
      applyCreateProps(node, { maxLength: -1 });
      const editBox = node.getComponent(MockEditBox);
      expect(editBox?.maxLength).toBe(-1);
    });
  });

  describe('props mapping - disabled', () => {
    it('should set interactable to false when disabled is true', () => {
      const node = createHostNode({ type: 'EditBox', props: {} } as any);
      applyCreateProps(node, { disabled: true });
      const editBox = node.getComponent(MockEditBox);
      expect(editBox?.interactable).toBe(false);
    });

    it('should set interactable to true when disabled is false', () => {
      const node = createHostNode({ type: 'EditBox', props: {} } as any);
      applyCreateProps(node, { disabled: false });
      const editBox = node.getComponent(MockEditBox);
      expect(editBox?.interactable).toBe(true);
    });
  });

  describe('event handlers - onChange', () => {
    it('should register onChange handler for text-changed event', () => {
      const onChange = vi.fn();
      const node = createHostNode({ type: 'EditBox', props: { onChange } } as any);
      
      node.emit('text-changed', { detail: { string: 'New Value' } });
      
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('New Value');
    });

    it('should not throw if onChange is not provided', () => {
      const node = createHostNode({ type: 'EditBox', props: {} } as any);
      expect(() => node.emit('text-changed', { detail: { string: 'Test' } })).not.toThrow();
    });
  });

  describe('event handlers - onConfirm', () => {
    it('should register onConfirm handler for editing-did-ended event', () => {
      const onConfirm = vi.fn();
      const node = createHostNode({ type: 'EditBox', props: { onConfirm } } as any);
      applyCreateProps(node, { value: 'Final Value' });
      
      node.emit('editing-did-ended', {});
      
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(onConfirm).toHaveBeenCalledWith('Final Value');
    });

    it('should not throw if onConfirm is not provided', () => {
      const node = createHostNode({ type: 'EditBox', props: {} } as any);
      expect(() => node.emit('editing-did-ended', {})).not.toThrow();
    });
  });

  describe('default values', () => {
    it('should have default string value of empty string', () => {
      const node = createHostNode({ type: 'EditBox', props: {} } as any);
      const editBox = node.getComponent(MockEditBox);
      expect(editBox?.string).toBe('');
    });

    it('should have default interactable value of true', () => {
      const node = createHostNode({ type: 'EditBox', props: {} } as any);
      const editBox = node.getComponent(MockEditBox);
      expect(editBox?.interactable).toBe(true);
    });
  });
});
