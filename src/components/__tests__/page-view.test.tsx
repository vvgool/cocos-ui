import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MockNode, MockComponent, MockUITransform } from '../../__tests__/utils/mock-cocos';
import { setupTest, cleanupTest, createTestContainer } from '../../__tests__/utils/test-utils';
import { createHostNode, ComponentRegistry } from '../../core/create-element';
import { applyCreateProps } from '../../core/apply-props';
import '../../components/page-view';

// Mock PageView-related components
class MockPageView extends MockComponent {
  direction: number = 1;
  inertia: boolean = true;
  elastic: boolean = true;
  bounceDuration: number = 0.5;
  autoPageInterval: number = 0.3;
  content: MockNode | null = null;
  indicator: MockPageViewIndicator | null = null;

  setCurrentPage(index: number): void {
    // Mock implementation
  }

  constructor(node?: MockNode) {
    super(node);
    this.name = 'PageView';
  }
}

class MockPageViewIndicator extends MockComponent {
  spriteFrame: any = null;
  spacing: number = 10;
  cellSize: { width: number; height: number } = { width: 20, height: 20 };
  indicatorDistance: number = 0;
  indicatorScale: number = 1;
  _N$normalSprite: any = null;
  _N$totalLength: number = 0;
  _N$currentIndex: number = 0;

  constructor(node?: MockNode) {
    super(node);
    this.name = 'PageViewIndicator';
  }
}

// Extend global cc with PageView components
function setupPageViewMocks(): void {
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).cc.PageView = MockPageView;
    (globalThis as any).cc.PageViewIndicator = MockPageViewIndicator;
  }
}

describe('PageView', () => {
  let container: MockNode;

  beforeEach(() => {
    setupTest();
    setupPageViewMocks();
    container = createTestContainer('PageViewTestContainer');
  });

  afterEach(() => {
    cleanupTest();
  });

  describe('component registration', () => {
    it('should register PageView component with ComponentRegistry', () => {
      const factory = ComponentRegistry.get('PageView');
      expect(factory).toBeDefined();
      expect(typeof factory).toBe('function');
    });

    it('should register PageIndicator component with ComponentRegistry', () => {
      const factory = ComponentRegistry.get('PageIndicator');
      expect(factory).toBeDefined();
      expect(typeof factory).toBe('function');
    });

    it('should create PageView node via createHostNode', () => {
      const node = createHostNode({ type: 'PageView', props: {} } as any);
      expect(node).toBeDefined();
      expect(node).toBeInstanceOf(MockNode);
    });
  });

  describe('props mapping - direction', () => {
    it('should set direction via prop (number)', () => {
      const node = createHostNode({ type: 'PageView', props: {} } as any);
      applyCreateProps(node, { direction: 0 });
      const pageView = node.getComponent(MockPageView);
      expect(pageView?.direction).toBe(0);
    });

    it('should set direction to HORIZONTAL via string', () => {
      const node = createHostNode({ type: 'PageView', props: {} } as any);
      applyCreateProps(node, { direction: 'HORIZONTAL' });
      const pageView = node.getComponent(MockPageView);
      expect(pageView?.direction).toBe(1);
    });

    it('should set direction to VERTICAL via string', () => {
      const node = createHostNode({ type: 'PageView', props: {} } as any);
      applyCreateProps(node, { direction: 'VERTICAL' });
      const pageView = node.getComponent(MockPageView);
      expect(pageView?.direction).toBe(2);
    });

    it('should set direction to BOTH via string', () => {
      const node = createHostNode({ type: 'PageView', props: {} } as any);
      applyCreateProps(node, { direction: 'BOTH' });
      const pageView = node.getComponent(MockPageView);
      expect(pageView?.direction).toBe(3);
    });

    it('should default to HORIZONTAL (1) for invalid direction', () => {
      const node = createHostNode({ type: 'PageView', props: {} } as any);
      applyCreateProps(node, { direction: 'INVALID' });
      const pageView = node.getComponent(MockPageView);
      expect(pageView?.direction).toBe(1);
    });
  });

  describe('props mapping - currentPage', () => {
    it('should call setCurrentPage with provided value', () => {
      const node = createHostNode({ type: 'PageView', props: {} } as any);
      applyCreateProps(node, { currentPage: 2 });
      const pageView = node.getComponent(MockPageView);
      expect(pageView).toBeDefined();
      expect(pageView?.setCurrentPage).toBeDefined();
    });
  });

  describe('props mapping - inertia', () => {
    it('should set inertia to true', () => {
      const node = createHostNode({ type: 'PageView', props: {} } as any);
      applyCreateProps(node, { inertia: true });
      const pageView = node.getComponent(MockPageView);
      expect(pageView?.inertia).toBe(true);
    });

    it('should set inertia to false', () => {
      const node = createHostNode({ type: 'PageView', props: {} } as any);
      applyCreateProps(node, { inertia: false });
      const pageView = node.getComponent(MockPageView);
      expect(pageView?.inertia).toBe(false);
    });
  });

  describe('props mapping - elastic', () => {
    it('should set elastic to true', () => {
      const node = createHostNode({ type: 'PageView', props: {} } as any);
      applyCreateProps(node, { elastic: true });
      const pageView = node.getComponent(MockPageView);
      expect(pageView?.elastic).toBe(true);
    });

    it('should set elastic to false', () => {
      const node = createHostNode({ type: 'PageView', props: {} } as any);
      applyCreateProps(node, { elastic: false });
      const pageView = node.getComponent(MockPageView);
      expect(pageView?.elastic).toBe(false);
    });
  });

  describe('props mapping - bounceDuration', () => {
    it('should set bounceDuration', () => {
      const node = createHostNode({ type: 'PageView', props: {} } as any);
      applyCreateProps(node, { bounceDuration: 0.8 });
      const pageView = node.getComponent(MockPageView);
      expect(pageView?.bounceDuration).toBe(0.8);
    });
  });

  describe('props mapping - autoPageInterval', () => {
    it('should set autoPageInterval', () => {
      const node = createHostNode({ type: 'PageView', props: {} } as any);
      applyCreateProps(node, { autoPageInterval: 0.5 });
      const pageView = node.getComponent(MockPageView);
      expect(pageView?.autoPageInterval).toBe(0.5);
    });
  });

  describe('props mapping - indicator', () => {
    it('should setup indicator with spriteFrame', () => {
      const mockSpriteFrame = { id: 'test-sprite' };
      const node = createHostNode({ type: 'PageView', props: {} } as any);
      applyCreateProps(node, { indicator: { spriteFrame: mockSpriteFrame } });
      const pageView = node.getComponent(MockPageView);
      expect(pageView?.indicator).toBeDefined();
      expect(pageView?.indicator?.spriteFrame).toBe(mockSpriteFrame);
    });

    it('should setup indicator with spacing', () => {
      const node = createHostNode({ type: 'PageView', props: {} } as any);
      applyCreateProps(node, { indicator: { spacing: 15 } });
      const pageView = node.getComponent(MockPageView);
      expect(pageView?.indicator?.spacing).toBe(15);
    });
  });

  describe('props mapping - onPageChanged', () => {
    it('should register page-turning event listener', () => {
      const onPageChangedMock = vi.fn();
      const node = createHostNode({ type: 'PageView', props: { onPageChanged: onPageChangedMock } } as any);
      
      // Emit the page-turning event
      node.emit('page-turning', 3);
      
      expect(onPageChangedMock).toHaveBeenCalledWith(3);
    });
  });

  describe('node structure', () => {
    it('should create content child node', () => {
      const node = createHostNode({ type: 'PageView', props: {} } as any);
      const contentNode = node.getChildByName('content');
      expect(contentNode).toBeDefined();
      expect(contentNode?.getComponent(MockUITransform)).toBeDefined();
    });

    it('should have PageView component attached', () => {
      const node = createHostNode({ type: 'PageView', props: {} } as any);
      const pageView = node.getComponent(MockPageView);
      expect(pageView).toBeDefined();
      expect(pageView?.name).toBe('PageView');
    });
  });

  describe('default values', () => {
    it('should have default direction HORIZONTAL (1)', () => {
      const node = createHostNode({ type: 'PageView', props: {} } as any);
      const pageView = node.getComponent(MockPageView);
      expect(pageView?.direction).toBe(1);
    });

    it('should have default inertia true', () => {
      const node = createHostNode({ type: 'PageView', props: {} } as any);
      const pageView = node.getComponent(MockPageView);
      expect(pageView?.inertia).toBe(true);
    });

    it('should have default elastic true', () => {
      const node = createHostNode({ type: 'PageView', props: {} } as any);
      const pageView = node.getComponent(MockPageView);
      expect(pageView?.elastic).toBe(true);
    });
  });
});

describe('PageIndicator', () => {
  let container: MockNode;

  beforeEach(() => {
    setupTest();
    setupPageViewMocks();
    container = createTestContainer('PageIndicatorTestContainer');
  });

  afterEach(() => {
    cleanupTest();
  });

  describe('component registration', () => {
    it('should create PageIndicator node via createHostNode', () => {
      const node = createHostNode({ type: 'PageIndicator', props: {} } as any);
      expect(node).toBeDefined();
      expect(node).toBeInstanceOf(MockNode);
    });

    it('should have PageViewIndicator component attached', () => {
      const node = createHostNode({ type: 'PageIndicator', props: {} } as any);
      const indicator = node.getComponent(MockPageViewIndicator);
      expect(indicator).toBeDefined();
    });
  });

  describe('props mapping', () => {
    it('should set spriteFrame', () => {
      const mockSpriteFrame = { id: 'indicator-sprite' };
      const node = createHostNode({ type: 'PageIndicator', props: {} } as any);
      applyCreateProps(node, { spriteFrame: mockSpriteFrame });
      const indicator = node.getComponent(MockPageViewIndicator);
      expect(indicator?.spriteFrame).toBe(mockSpriteFrame);
    });

    it('should set spacing', () => {
      const node = createHostNode({ type: 'PageIndicator', props: {} } as any);
      applyCreateProps(node, { spacing: 20 });
      const indicator = node.getComponent(MockPageViewIndicator);
      expect(indicator?.spacing).toBe(20);
    });

    it('should set cellSize', () => {
      const cellSize = { width: 30, height: 30 };
      const node = createHostNode({ type: 'PageIndicator', props: {} } as any);
      applyCreateProps(node, { cellSize });
      const indicator = node.getComponent(MockPageViewIndicator);
      expect(indicator?.cellSize).toEqual(cellSize);
    });

    it('should set indicatorDistance', () => {
      const node = createHostNode({ type: 'PageIndicator', props: {} } as any);
      applyCreateProps(node, { indicatorDistance: 5 });
      const indicator = node.getComponent(MockPageViewIndicator);
      expect(indicator?.indicatorDistance).toBe(5);
    });

    it('should set indicatorScale', () => {
      const node = createHostNode({ type: 'PageIndicator', props: {} } as any);
      applyCreateProps(node, { indicatorScale: 1.5 });
      const indicator = node.getComponent(MockPageViewIndicator);
      expect(indicator?.indicatorScale).toBe(1.5);
    });
  });
});
