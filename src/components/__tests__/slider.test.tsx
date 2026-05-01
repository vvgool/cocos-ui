import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MockNode, MockSlider } from '../../__tests__/utils/mock-cocos';
import { setupTest, cleanupTest, createTestContainer } from '../../__tests__/utils/test-utils';
import { createHostNode } from '../../core/create-element';
import { applyCreateProps } from '../../core/apply-props';
import '../../components/slider';

describe('Slider', () => {
  let container: MockNode;

  beforeEach(() => {
    setupTest();
    container = createTestContainer('SliderTestContainer');
  });

  afterEach(() => {
    cleanupTest();
  });

  describe('component registration', () => {
    it('should register Slider component with ComponentRegistry', () => {
      const node = createHostNode({ type: 'Slider', props: {} } as any);
      expect(node).toBeDefined();
      expect(node).toBeInstanceOf(MockNode);
    });

    it('should create Slider component with default props', () => {
      const node = createHostNode({ type: 'Slider', props: {} } as any);
      const slider = node.getComponent(MockSlider);
      expect(slider).toBeDefined();
      expect(slider?.progress).toBe(0);
      expect(slider?.direction).toBe(0);
      expect(slider?.interactable).toBe(true);
    });
  });

  describe('props mapping - value', () => {
    it('should set progress value', () => {
      const node = createHostNode({ type: 'Slider', props: {} } as any);
      applyCreateProps(node, { value: 0.5 });
      const slider = node.getComponent(MockSlider);
      expect(slider?.progress).toBe(0.5);
    });

    it('should set progress value to 0', () => {
      const node = createHostNode({ type: 'Slider', props: {} } as any);
      applyCreateProps(node, { value: 0 });
      const slider = node.getComponent(MockSlider);
      expect(slider?.progress).toBe(0);
    });

    it('should set progress value to 1', () => {
      const node = createHostNode({ type: 'Slider', props: {} } as any);
      applyCreateProps(node, { value: 1 });
      const slider = node.getComponent(MockSlider);
      expect(slider?.progress).toBe(1);
    });
  });

  describe('props mapping - direction', () => {
    it('should set direction to HORIZONTAL using string', () => {
      const node = createHostNode({ type: 'Slider', props: {} } as any);
      applyCreateProps(node, { direction: 'HORIZONTAL' });
      const slider = node.getComponent(MockSlider);
      expect(slider?.direction).toBe(0);
    });

    it('should set direction to VERTICAL using string', () => {
      const node = createHostNode({ type: 'Slider', props: {} } as any);
      applyCreateProps(node, { direction: 'VERTICAL' });
      const slider = node.getComponent(MockSlider);
      expect(slider?.direction).toBe(1);
    });

    it('should set direction using number', () => {
      const node = createHostNode({ type: 'Slider', props: {} } as any);
      applyCreateProps(node, { direction: 0 });
      const slider = node.getComponent(MockSlider);
      expect(slider?.direction).toBe(0);
    });
  });

  describe('props mapping - disabled', () => {
    it('should set interactable to false when disabled is true', () => {
      const node = createHostNode({ type: 'Slider', props: {} } as any);
      applyCreateProps(node, { disabled: true });
      const slider = node.getComponent(MockSlider);
      expect(slider?.interactable).toBe(false);
    });

    it('should set interactable to true when disabled is false', () => {
      const node = createHostNode({ type: 'Slider', props: {} } as any);
      applyCreateProps(node, { disabled: false });
      const slider = node.getComponent(MockSlider);
      expect(slider?.interactable).toBe(true);
    });
  });

  describe('event handlers - onChange', () => {
    it('should register onChange handler for slide event', () => {
      const onChange = vi.fn();
      const node = createHostNode({ type: 'Slider', props: { onChange } } as any);
      
      node.emit('slide', { detail: 0.75 });
      
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(0.75);
    });

    it('should call onChange when slide event is emitted', () => {
      const onChange = vi.fn();
      const node = createHostNode({ type: 'Slider', props: { onChange } } as any);
      
      node.emit('slide', { detail: 0.5 });
      
      expect(onChange).toHaveBeenCalledWith(0.5);
    });

    it('should not throw if onChange is not provided', () => {
      const node = createHostNode({ type: 'Slider', props: {} } as any);
      expect(() => node.emit('slide', { detail: 0.5 })).not.toThrow();
    });
  });

  describe('default values', () => {
    it('should have default progress value of 0', () => {
      const node = createHostNode({ type: 'Slider', props: {} } as any);
      const slider = node.getComponent(MockSlider);
      expect(slider?.progress).toBe(0);
    });

    it('should have default direction of HORIZONTAL', () => {
      const node = createHostNode({ type: 'Slider', props: {} } as any);
      const slider = node.getComponent(MockSlider);
      expect(slider?.direction).toBe(0);
    });

    it('should have default interactable value of true', () => {
      const node = createHostNode({ type: 'Slider', props: {} } as any);
      const slider = node.getComponent(MockSlider);
      expect(slider?.interactable).toBe(true);
    });
  });
});
