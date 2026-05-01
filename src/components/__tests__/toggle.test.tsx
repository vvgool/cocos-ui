import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MockNode, MockToggle } from '../../__tests__/utils/mock-cocos';
import { setupTest, cleanupTest, createTestContainer } from '../../__tests__/utils/test-utils';
import { createHostNode } from '../../core/create-element';
import { applyCreateProps } from '../../core/apply-props';
import '../../components/toggle';

describe('Toggle', () => {
  let container: MockNode;

  beforeEach(() => {
    setupTest();
    container = createTestContainer('ToggleTestContainer');
  });

  afterEach(() => {
    cleanupTest();
  });

  describe('component registration', () => {
    it('should register Toggle component with ComponentRegistry', () => {
      const node = createHostNode({ type: 'Toggle', props: {} } as any);
      expect(node).toBeDefined();
      expect(node).toBeInstanceOf(MockNode);
    });

    it('should create Toggle component with default props', () => {
      const node = createHostNode({ type: 'Toggle', props: {} } as any);
      const toggle = node.getComponent(MockToggle);
      expect(toggle).toBeDefined();
      expect(toggle?.isChecked).toBe(false);
      expect(toggle?.interactable).toBe(true);
    });
  });

  describe('props mapping - checked', () => {
    it('should set checked to true', () => {
      const node = createHostNode({ type: 'Toggle', props: {} } as any);
      applyCreateProps(node, { checked: true });
      const toggle = node.getComponent(MockToggle);
      expect(toggle?.isChecked).toBe(true);
    });

    it('should set checked to false', () => {
      const node = createHostNode({ type: 'Toggle', props: {} } as any);
      applyCreateProps(node, { checked: false });
      const toggle = node.getComponent(MockToggle);
      expect(toggle?.isChecked).toBe(false);
    });

    it('should convert truthy values to boolean true', () => {
      const node = createHostNode({ type: 'Toggle', props: {} } as any);
      applyCreateProps(node, { checked: 1 });
      const toggle = node.getComponent(MockToggle);
      expect(toggle?.isChecked).toBe(true);
    });

    it('should convert falsy values to boolean false', () => {
      const node = createHostNode({ type: 'Toggle', props: {} } as any);
      applyCreateProps(node, { checked: null });
      const toggle = node.getComponent(MockToggle);
      expect(toggle?.isChecked).toBe(false);
    });
  });

  describe('props mapping - disabled', () => {
    it('should set interactable to false when disabled is true', () => {
      const node = createHostNode({ type: 'Toggle', props: {} } as any);
      applyCreateProps(node, { disabled: true });
      const toggle = node.getComponent(MockToggle);
      expect(toggle?.interactable).toBe(false);
    });

    it('should set interactable to true when disabled is false', () => {
      const node = createHostNode({ type: 'Toggle', props: {} } as any);
      applyCreateProps(node, { disabled: false });
      const toggle = node.getComponent(MockToggle);
      expect(toggle?.interactable).toBe(true);
    });
  });

  describe('event handlers - onChange', () => {
    it('should register onChange handler for toggle event', () => {
      const onChange = vi.fn();
      const node = createHostNode({ type: 'Toggle', props: { onChange } } as any);
      
      node.emit('toggle', { isChecked: true });
      
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('should call onChange with isChecked value', () => {
      const onChange = vi.fn();
      const node = createHostNode({ type: 'Toggle', props: { onChange } } as any);
      
      node.emit('toggle', { isChecked: false });
      
      expect(onChange).toHaveBeenCalledWith(false);
    });

    it('should not throw if onChange is not provided', () => {
      const node = createHostNode({ type: 'Toggle', props: {} } as any);
      expect(() => node.emit('toggle', { isChecked: true })).not.toThrow();
    });
  });

  describe('default values', () => {
    it('should have default checked value of false', () => {
      const node = createHostNode({ type: 'Toggle', props: {} } as any);
      const toggle = node.getComponent(MockToggle);
      expect(toggle?.isChecked).toBe(false);
    });

    it('should have default interactable value of true', () => {
      const node = createHostNode({ type: 'Toggle', props: {} } as any);
      const toggle = node.getComponent(MockToggle);
      expect(toggle?.interactable).toBe(true);
    });
  });
});
