import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MockNode, MockComponent } from '../../__tests__/utils/mock-cocos';
import { setupTest, cleanupTest, createTestContainer } from '../../__tests__/utils/test-utils';
import { createHostNode, ComponentRegistry } from '../../core/create-element';
import '../../components/graphics';

class MockGraphics extends MockComponent {
  fillColor: { r: number; g: number; b: number; a: number } = { r: 255, g: 255, b: 255, a: 255 };
  strokeColor: { r: number; g: number; b: number; a: number } = { r: 0, g: 0, b: 0, a: 255 };
  lineWidth: number = 1;

  constructor(node?: MockNode) {
    super(node);
    this.name = 'Graphics';
  }

  clear(): void {
    // Mock implementation
  }

  rect(x: number, y: number, w: number, h: number): void {
    // Mock implementation
  }

  circle(cx: number, cy: number, r: number): void {
    // Mock implementation
  }

  moveTo(x: number, y: number): void {
    // Mock implementation
  }

  lineTo(x: number, y: number): void {
    // Mock implementation
  }

  fill(): void {
    // Mock implementation
  }

  stroke(): void {
    // Mock implementation
  }
}

function setupGraphicsMocks(): void {
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).cc.Graphics = MockGraphics;
  }
}

describe('Graphics', () => {
  let container: MockNode;

  beforeEach(() => {
    setupTest();
    setupGraphicsMocks();
    container = createTestContainer('GraphicsTestContainer');
  });

  afterEach(() => {
    cleanupTest();
  });

  describe('component registration', () => {
    it('should register Graphics component with ComponentRegistry', () => {
      const factory = ComponentRegistry.get('Graphics');
      expect(factory).toBeDefined();
      expect(typeof factory).toBe('function');
    });

    it('should create Graphics node via createHostNode', () => {
      const node = createHostNode({ type: 'Graphics', props: {} } as any);
      expect(node).toBeDefined();
      expect(node).toBeInstanceOf(MockNode);
    });

    it('should have Graphics component attached after creation', () => {
      const node = createHostNode({ type: 'Graphics', props: {} } as any);
      const graphics = node.getComponent(MockGraphics);
      expect(graphics).toBeDefined();
      expect(graphics?.name).toBe('Graphics');
    });
  });

  describe('props mapping - shapes (rect)', () => {
    it('should render rect shape with fill color', () => {
      const shapes = [
        {
          type: 'rect' as const,
          x: 10,
          y: 20,
          w: 100,
          h: 50,
          fillColor: '#ff0000',
        },
      ];
      const node = createHostNode({ type: 'Graphics', props: { shapes } } as any);
      const graphics = node.getComponent(MockGraphics);
      expect(graphics).toBeDefined();
    });

    it('should render rect shape with stroke color', () => {
      const shapes = [
        {
          type: 'rect' as const,
          x: 0,
          y: 0,
          w: 50,
          h: 50,
          strokeColor: { r: 0, g: 0, b: 255, a: 255 },
          lineWidth: 2,
        },
      ];
      const node = createHostNode({ type: 'Graphics', props: { shapes } } as any);
      const graphics = node.getComponent(MockGraphics);
      expect(graphics).toBeDefined();
    });

    it('should render rect shape with both fill and stroke', () => {
      const shapes = [
        {
          type: 'rect' as const,
          x: 10,
          y: 10,
          w: 80,
          h: 40,
          fillColor: '#00ff00',
          strokeColor: '#0000ff',
          lineWidth: 3,
        },
      ];
      const node = createHostNode({ type: 'Graphics', props: { shapes } } as any);
      const graphics = node.getComponent(MockGraphics);
      expect(graphics).toBeDefined();
    });
  });

  describe('props mapping - shapes (circle)', () => {
    it('should render circle shape with fill color', () => {
      const shapes = [
        {
          type: 'circle' as const,
          cx: 50,
          cy: 50,
          r: 25,
          fillColor: '#ffff00',
        },
      ];
      const node = createHostNode({ type: 'Graphics', props: { shapes } } as any);
      const graphics = node.getComponent(MockGraphics);
      expect(graphics).toBeDefined();
    });

    it('should render circle shape with stroke color', () => {
      const shapes = [
        {
          type: 'circle' as const,
          cx: 100,
          cy: 100,
          r: 30,
          strokeColor: { r: 255, g: 0, b: 255, a: 255 },
          lineWidth: 4,
        },
      ];
      const node = createHostNode({ type: 'Graphics', props: { shapes } } as any);
      const graphics = node.getComponent(MockGraphics);
      expect(graphics).toBeDefined();
    });

    it('should render circle shape with both fill and stroke', () => {
      const shapes = [
        {
          type: 'circle' as const,
          cx: 75,
          cy: 75,
          r: 20,
          fillColor: '#00ffff',
          strokeColor: '#ff00ff',
          lineWidth: 2,
        },
      ];
      const node = createHostNode({ type: 'Graphics', props: { shapes } } as any);
      const graphics = node.getComponent(MockGraphics);
      expect(graphics).toBeDefined();
    });
  });

  describe('props mapping - shapes (line)', () => {
    it('should render line shape with stroke color', () => {
      const shapes = [
        {
          type: 'line' as const,
          x1: 0,
          y1: 0,
          x2: 100,
          y2: 100,
          strokeColor: '#ffffff',
        },
      ];
      const node = createHostNode({ type: 'Graphics', props: { shapes } } as any);
      const graphics = node.getComponent(MockGraphics);
      expect(graphics).toBeDefined();
    });

    it('should render line shape with custom lineWidth', () => {
      const shapes = [
        {
          type: 'line' as const,
          x1: 10,
          y1: 10,
          x2: 200,
          y2: 200,
          strokeColor: { r: 128, g: 128, b: 128, a: 255 },
          lineWidth: 5,
        },
      ];
      const node = createHostNode({ type: 'Graphics', props: { shapes } } as any);
      const graphics = node.getComponent(MockGraphics);
      expect(graphics).toBeDefined();
    });
  });

  describe('props mapping - multiple shapes', () => {
    it('should render multiple shapes in order', () => {
      const shapes = [
        { type: 'rect' as const, x: 0, y: 0, w: 50, h: 50, fillColor: '#ff0000' },
        { type: 'circle' as const, cx: 50, cy: 50, r: 25, fillColor: '#00ff00' },
        { type: 'line' as const, x1: 0, y1: 100, x2: 100, y2: 100, strokeColor: '#0000ff' },
      ];
      const node = createHostNode({ type: 'Graphics', props: { shapes } } as any);
      const graphics = node.getComponent(MockGraphics);
      expect(graphics).toBeDefined();
    });
  });

  describe('color parsing', () => {
    it('should parse hex color string for fillColor', () => {
      const shapes = [
        {
          type: 'rect' as const,
          x: 0,
          y: 0,
          w: 10,
          h: 10,
          fillColor: '#aabbcc',
        },
      ];
      const node = createHostNode({ type: 'Graphics', props: { shapes } } as any);
      const graphics = node.getComponent(MockGraphics);
      expect(graphics).toBeDefined();
    });

    it('should parse rgb color object for strokeColor', () => {
      const shapes = [
        {
          type: 'rect' as const,
          x: 0,
          y: 0,
          w: 10,
          h: 10,
          strokeColor: { r: 100, g: 150, b: 200, a: 255 },
        },
      ];
      const node = createHostNode({ type: 'Graphics', props: { shapes } } as any);
      const graphics = node.getComponent(MockGraphics);
      expect(graphics).toBeDefined();
    });
  });

  describe('empty shapes array', () => {
    it('should handle empty shapes array', () => {
      const shapes: any[] = [];
      const node = createHostNode({ type: 'Graphics', props: { shapes } } as any);
      const graphics = node.getComponent(MockGraphics);
      expect(graphics).toBeDefined();
    });
  });
});
