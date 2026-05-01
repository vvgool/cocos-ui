import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MockNode, MockButton, MockLabel } from '../../__tests__/utils/mock-cocos';
import { setupTest, cleanupTest, createTestContainer } from '../../__tests__/utils/test-utils';
import { createHostNode } from '../../core/create-element';
import { applyCreateProps } from '../../core/apply-props';
import '../../components/button';

describe('Button', () => {
  let container: MockNode;

  beforeEach(() => {
    setupTest();
    container = createTestContainer('ButtonTestContainer');
  });

  afterEach(() => {
    cleanupTest();
  });

  describe('component registration', () => {
    it('should register Button component with ComponentRegistry', () => {
      const node = createHostNode({ type: 'Button', props: {} } as any);
      expect(node).toBeDefined();
      expect(node).toBeInstanceOf(MockNode);
    });

    it('should create Button component with cc.Button attached', () => {
      const node = createHostNode({ type: 'Button', props: {} } as any);
      const button = node.getComponent(MockButton);
      expect(button).toBeDefined();
    });
  });

  describe('default props', () => {
    it('should have default transition of NONE', () => {
      const node = createHostNode({ type: 'Button', props: {} } as any);
      const button = node.getComponent(MockButton);
      expect(button?.transition).toBe(MockButton.Transition.NONE);
    });

    it('should have default interactable of true', () => {
      const node = createHostNode({ type: 'Button', props: {} } as any);
      const button = node.getComponent(MockButton);
      expect(button?.interactable).toBe(true);
    });
  });

  describe('props mapping - text', () => {
    it('should create Label child node when text is set', () => {
      const node = createHostNode({ type: 'Button', props: {} } as any);
      applyCreateProps(node, { text: 'Click Me' });
      const labelNode = node.getChildByName('Label');
      expect(labelNode).toBeDefined();
    });

    it('should set text on the Label component', () => {
      const node = createHostNode({ type: 'Button', props: {} } as any);
      applyCreateProps(node, { text: 'Submit' });
      const labelNode = node.getChildByName('Label');
      const label = labelNode?.getComponent(MockLabel);
      expect(label?.string).toBe('Submit');
    });
  });

  describe('props mapping - disabled', () => {
    it('should set interactable to false when disabled is true', () => {
      const node = createHostNode({ type: 'Button', props: {} } as any);
      applyCreateProps(node, { disabled: true });
      const button = node.getComponent(MockButton);
      expect(button?.interactable).toBe(false);
    });

    it('should set interactable to true when disabled is false', () => {
      const node = createHostNode({ type: 'Button', props: {} } as any);
      applyCreateProps(node, { disabled: false });
      const button = node.getComponent(MockButton);
      expect(button?.interactable).toBe(true);
    });
  });

  describe('props mapping - transition', () => {
    it('should set transition to COLOR', () => {
      const node = createHostNode({ type: 'Button', props: {} } as any);
      applyCreateProps(node, { transition: MockButton.Transition.COLOR });
      const button = node.getComponent(MockButton);
      expect(button?.transition).toBe(MockButton.Transition.COLOR);
    });

    it('should set transition to NONE', () => {
      const node = createHostNode({ type: 'Button', props: {} } as any);
      applyCreateProps(node, { transition: MockButton.Transition.NONE });
      const button = node.getComponent(MockButton);
      expect(button?.transition).toBe(MockButton.Transition.NONE);
    });
  });

  describe('props mapping - onClick', () => {
    it('should register click event handler', () => {
      const clickHandler = vi.fn();
      const node = createHostNode({ type: 'Button', props: {} } as any);
      applyCreateProps(node, { onClick: clickHandler });
      
      node.emit('click');
      expect(clickHandler).toHaveBeenCalled();
    });
  });

  describe('Node creation via createHostNode', () => {
    it('should create node with correct name', () => {
      const node = createHostNode({ type: 'Button', props: {} } as any);
      expect(node.name).toBe('Button');
    });

    it('should have UITransform component', () => {
      const node = createHostNode({ type: 'Button', props: {} } as any);
      const transform = node.getComponent(cc.UITransform);
      expect(transform).toBeDefined();
    });
  });
});
