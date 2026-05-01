import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MockNode, MockProgressBar } from '../../__tests__/utils/mock-cocos';
import { setupTest, cleanupTest, createTestContainer } from '../../__tests__/utils/test-utils';
import { createHostNode } from '../../core/create-element';
import { applyCreateProps } from '../../core/apply-props';
import '../../components/progress-bar';

describe('ProgressBar', () => {
  let container: MockNode;

  beforeEach(() => {
    setupTest();
    container = createTestContainer('ProgressBarTestContainer');
  });

  afterEach(() => {
    cleanupTest();
  });

  describe('component registration', () => {
    it('should register ProgressBar component with ComponentRegistry', () => {
      const node = createHostNode({ type: 'ProgressBar', props: {} } as any);
      expect(node).toBeDefined();
      expect(node).toBeInstanceOf(MockNode);
    });

    it('should create ProgressBar component with default props', () => {
      const node = createHostNode({ type: 'ProgressBar', props: {} } as any);
      const progressBar = node.getComponent(MockProgressBar);
      expect(progressBar).toBeDefined();
      expect(progressBar?.progress).toBe(0);
      expect(progressBar?.mode).toBe(0);
    });
  });

  describe('props mapping - progress', () => {
    it('should set progress value', () => {
      const node = createHostNode({ type: 'ProgressBar', props: {} } as any);
      applyCreateProps(node, { progress: 0.5 });
      const progressBar = node.getComponent(MockProgressBar);
      expect(progressBar?.progress).toBe(0.5);
    });

    it('should set progress value to 0', () => {
      const node = createHostNode({ type: 'ProgressBar', props: {} } as any);
      applyCreateProps(node, { progress: 0 });
      const progressBar = node.getComponent(MockProgressBar);
      expect(progressBar?.progress).toBe(0);
    });

    it('should set progress value to 1', () => {
      const node = createHostNode({ type: 'ProgressBar', props: {} } as any);
      applyCreateProps(node, { progress: 1 });
      const progressBar = node.getComponent(MockProgressBar);
      expect(progressBar?.progress).toBe(1);
    });
  });

  describe('props mapping - mode', () => {
    it('should set mode to HORIZONTAL using string', () => {
      const node = createHostNode({ type: 'ProgressBar', props: {} } as any);
      applyCreateProps(node, { mode: 'HORIZONTAL' });
      const progressBar = node.getComponent(MockProgressBar);
      expect(progressBar?.mode).toBe(0);
    });

    it('should set mode to VERTICAL using string', () => {
      const node = createHostNode({ type: 'ProgressBar', props: {} } as any);
      applyCreateProps(node, { mode: 'VERTICAL' });
      const progressBar = node.getComponent(MockProgressBar);
      expect(progressBar?.mode).toBe(1);
    });

    it('should set mode to FILLED using string', () => {
      const node = createHostNode({ type: 'ProgressBar', props: {} } as any);
      applyCreateProps(node, { mode: 'FILLED' });
      const progressBar = node.getComponent(MockProgressBar);
      expect(progressBar?.mode).toBe(2);
    });
  });

  describe('props mapping - reverse', () => {
    it('should set reverse to true', () => {
      const node = createHostNode({ type: 'ProgressBar', props: {} } as any);
      applyCreateProps(node, { reverse: true });
      const progressBar = node.getComponent(MockProgressBar);
      expect(progressBar?.reverse).toBe(true);
    });

    it('should set reverse to false', () => {
      const node = createHostNode({ type: 'ProgressBar', props: {} } as any);
      applyCreateProps(node, { reverse: false });
      const progressBar = node.getComponent(MockProgressBar);
      expect(progressBar?.reverse).toBe(false);
    });
  });

  describe('props mapping - totalLength', () => {
    it('should set totalLength value', () => {
      const node = createHostNode({ type: 'ProgressBar', props: {} } as any);
      applyCreateProps(node, { totalLength: 200 });
      const progressBar = node.getComponent(MockProgressBar);
      expect(progressBar?.totalLength).toBe(200);
    });

    it('should set totalLength to 0', () => {
      const node = createHostNode({ type: 'ProgressBar', props: {} } as any);
      applyCreateProps(node, { totalLength: 0 });
      const progressBar = node.getComponent(MockProgressBar);
      expect(progressBar?.totalLength).toBe(0);
    });
  });

  describe('default values', () => {
    it('should have default progress value of 0', () => {
      const node = createHostNode({ type: 'ProgressBar', props: {} } as any);
      const progressBar = node.getComponent(MockProgressBar);
      expect(progressBar?.progress).toBe(0);
    });

    it('should have default mode of HORIZONTAL', () => {
      const node = createHostNode({ type: 'ProgressBar', props: {} } as any);
      const progressBar = node.getComponent(MockProgressBar);
      expect(progressBar?.mode).toBe(0);
    });

    it('should have default reverse value of false', () => {
      const node = createHostNode({ type: 'ProgressBar', props: {} } as any);
      const progressBar = node.getComponent(MockProgressBar);
      expect(progressBar?.reverse).toBe(false);
    });

    it('should have default totalLength value', () => {
      const node = createHostNode({ type: 'ProgressBar', props: {} } as any);
      const progressBar = node.getComponent(MockProgressBar);
      expect(progressBar?.totalLength).toBe(100);
    });
  });
});
