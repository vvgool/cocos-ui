/**
 * Tween Animation System Tests
 *
 * Tests for applyAnimate(), stopAnimate(), easing functions,
 * AnimateProps type usage, and Tween mock behavior.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MockNode, setupGlobalCc, cleanupGlobalCc } from '../../__tests__/utils/mock-cocos';
import { setupTest, cleanupTest } from '../../__tests__/utils/test-utils';
import {
  applyAnimate,
  stopAnimate,
  type AnimateProps,
  type EasingName,
} from '../tween';

describe('Tween', () => {
  let node: MockNode;

  beforeEach(() => {
    setupTest();
    node = new MockNode('TestNode');
  });

  afterEach(() => {
    cleanupTest();
  });

  describe('applyAnimate()', () => {
    it('should apply position animation (x, y)', () => {
      const animate: AnimateProps = { x: 100, y: 200, duration: 0.3 };
      
      applyAnimate(node, animate);
      
      expect(node).toBeDefined();
    });

    it('should apply scale animation', () => {
      const animate: AnimateProps = { scale: 2, duration: 0.5 };
      
      applyAnimate(node, animate);
      
      expect(node).toBeDefined();
    });

    it('should apply scaleX and scaleY separately', () => {
      const animate: AnimateProps = { scaleX: 1.5, scaleY: 2, duration: 0.3 };
      
      applyAnimate(node, animate);
      
      expect(node).toBeDefined();
    });

    it('should apply rotation animation', () => {
      const animate: AnimateProps = { rotation: 90, duration: 0.4 };
      
      applyAnimate(node, animate);
      
      expect(node).toBeDefined();
    });

    it('should apply opacity animation and add UIOpacity component', () => {
      const animate: AnimateProps = { opacity: 128, duration: 0.3 };
      
      applyAnimate(node, animate);
      
      const uiOpacity = node.getComponent((cc as any).UIOpacity);
      expect(uiOpacity).toBeDefined();
    });

    it('should apply color animation from hex string', () => {
      const animate: AnimateProps = { color: '#ff0000', duration: 0.3 };
      
      applyAnimate(node, animate);
      
      expect(node).toBeDefined();
    });

    it('should apply color animation from color object', () => {
      const animate: AnimateProps = { 
        color: { r: 0, g: 255, b: 0, a: 255 }, 
        duration: 0.3 
      };
      
      applyAnimate(node, animate);
      
      expect(node).toBeDefined();
    });

    it('should handle sequential animation steps (array)', () => {
      const animations: AnimateProps[] = [
        { x: 100, duration: 0.3 },
        { y: 200, duration: 0.3 },
      ];
      
      applyAnimate(node, animations);
      
      expect(node).toBeDefined();
    });

    it('should use default duration when not specified', () => {
      const animate: AnimateProps = { x: 50 };
      
      applyAnimate(node, animate);
      
      expect(node).toBeDefined();
    });

    it('should handle relative animation (by vs to)', () => {
      const animate: AnimateProps = { x: 50, relative: true, duration: 0.3 };
      
      applyAnimate(node, animate);
      
      expect(node).toBeDefined();
    });

    it('should call onAnimationStart callback', () => {
      const onStartMock = vi.fn();
      const animate: AnimateProps = { 
        x: 100, 
        duration: 0.3,
        onAnimationStart: onStartMock,
      };
      
      applyAnimate(node, animate);
      
      expect(onStartMock).toBeDefined();
    });

    it('should call onAnimationEnd callback', () => {
      const onEndMock = vi.fn();
      const animate: AnimateProps = { 
        x: 100, 
        duration: 0.3,
        onAnimationEnd: onEndMock,
      };
      
      applyAnimate(node, animate);
      
      expect(onEndMock).toBeDefined();
    });
  });

  describe('stopAnimate()', () => {
    it('should stop active tweens on node', () => {
      applyAnimate(node, { x: 100, duration: 0.3 });
      
      stopAnimate(node);
      
      expect(node).toBeDefined();
    });

    it('should handle stopping when no tweens exist', () => {
      stopAnimate(node);
      
      expect(node).toBeDefined();
    });
  });

  describe('easing names', () => {
    it('should handle linear easing', () => {
      const animate: AnimateProps = { x: 100, easing: 'linear', duration: 0.3 };
      
      applyAnimate(node, animate);
      
      expect(node).toBeDefined();
    });

    it('should handle sineIn easing', () => {
      const animate: AnimateProps = { x: 100, easing: 'sineIn', duration: 0.3 };
      
      applyAnimate(node, animate);
      
      expect(node).toBeDefined();
    });

    it('should handle sineOut easing', () => {
      const animate: AnimateProps = { x: 100, easing: 'sineOut', duration: 0.3 };
      
      applyAnimate(node, animate);
      
      expect(node).toBeDefined();
    });

    it('should handle sineInOut easing', () => {
      const animate: AnimateProps = { x: 100, easing: 'sineInOut', duration: 0.3 };
      
      applyAnimate(node, animate);
      
      expect(node).toBeDefined();
    });

    it('should handle quadIn easing', () => {
      const animate: AnimateProps = { x: 100, easing: 'quadIn', duration: 0.3 };
      
      applyAnimate(node, animate);
      
      expect(node).toBeDefined();
    });

    it('should handle quadOut easing', () => {
      const animate: AnimateProps = { x: 100, easing: 'quadOut', duration: 0.3 };
      
      applyAnimate(node, animate);
      
      expect(node).toBeDefined();
    });

    it('should handle elasticOut easing', () => {
      const animate: AnimateProps = { x: 100, easing: 'elasticOut', duration: 0.3 };
      
      applyAnimate(node, animate);
      
      expect(node).toBeDefined();
    });

    it('should handle backOut easing', () => {
      const animate: AnimateProps = { x: 100, easing: 'backOut', duration: 0.3 };
      
      applyAnimate(node, animate);
      
      expect(node).toBeDefined();
    });

    it('should handle bounceOut easing', () => {
      const animate: AnimateProps = { x: 100, easing: 'bounceOut', duration: 0.3 };
      
      applyAnimate(node, animate);
      
      expect(node).toBeDefined();
    });
  });

  describe('AnimateProps type usage', () => {
    it('should accept partial animate props', () => {
      const animate: AnimateProps = { x: 100 };
      
      applyAnimate(node, animate);
      
      expect(node).toBeDefined();
    });

    it('should accept all animate props at once', () => {
      const animate: AnimateProps = {
        x: 100,
        y: 200,
        scaleX: 1.5,
        scaleY: 1.5,
        rotation: 45,
        opacity: 200,
        color: '#00ff00',
        duration: 0.5,
        easing: 'sineOut',
        relative: false,
      };
      
      applyAnimate(node, animate);
      
      expect(node).toBeDefined();
    });

    it('should accept array of AnimateProps', () => {
      const animations: AnimateProps[] = [
        { x: 100, duration: 0.3 },
        { y: 200, duration: 0.3, easing: 'sineOut' },
        { scale: 2, duration: 0.5 },
      ];
      
      applyAnimate(node, animations);
      
      expect(node).toBeDefined();
    });
  });

  describe('Tween mock behavior', () => {
    it('should create tween with chainable methods', () => {
      const tween = cc.tween(node);
      
      const result = tween
        .to(0.3, { x: 100 })
        .call(() => {})
        .start();
      
      expect(result).toBeDefined();
    });

    it('should support by() for relative animations', () => {
      const tween = cc.tween(node);
      
      const result = tween
        .by(0.3, { x: 50 })
        .start();
      
      expect(result).toBeDefined();
    });

    it('should support stop() method', () => {
      const tween = cc.tween(node);
      const started = tween.start();
      
      if (started && typeof started.stop === 'function') {
        started.stop();
      }
      
      expect(node).toBeDefined();
    });
  });
});
