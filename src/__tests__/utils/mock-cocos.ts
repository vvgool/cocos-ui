/**
 * Mock Cocos4 API for Testing
 *
 * Provides lightweight mocks for Cocos4 core classes:
 * - Node, UITransform, Component, Label, Sprite
 *
 * These mocks support chainable method calls and basic property access
 * to enable unit testing without the full Cocos4 engine.
 */

import { vi } from 'vitest';

// =============================================================================
// Mock Classes
// =============================================================================

/**
 * Mock UITransform component
 */
export class MockUITransform {
  width: number = 0;
  height: number = 0;
  anchorX: number = 0;
  anchorY: number = 0;

  constructor() {
    // Initialize with default values
  }

  setContentSize(width: number, height: number): this {
    this.width = width;
    this.height = height;
    return this;
  }

  setAnchorPoint(x: number, y: number): this {
    this.anchorX = x;
    this.anchorY = y;
    return this;
  }

  get contentSize() {
    return { width: this.width, height: this.height };
  }

  get anchorPoint() {
    return { x: this.anchorX, y: this.anchorY };
  }
}

/**
 * Mock Component base class
 */
export class MockComponent {
  node: MockNode | null = null;
  name: string = 'Component';
  enabled: boolean = true;
  enabledInHierarchy: boolean = true;
  isValid: boolean = true;

  constructor(node?: MockNode) {
    if (node) {
      this.node = node;
    }
  }
}

/**
 * Mock Label component
 */
export class MockLabel extends MockComponent {
  string: string = '';
  fontSize: number = 16;
  fontFamily: string = 'Arial';
  lineHeight: number = 0;
  spacing: number = 0;
  enableWrapText: boolean = true;
  isBold: boolean = false;
  isItalic: boolean = false;
  isUnderline: boolean = false;
  horizontalAlign: number = 0;
  verticalAlign: number = 0;
  overflow: number = 0;
  color: { r: number; g: number; b: number; a: number } = { r: 255, g: 255, b: 255, a: 255 };

  static HorizontalAlign = { LEFT: 0, CENTER: 1, RIGHT: 2 };
  static VerticalAlign = { TOP: 0, CENTER: 1, BOTTOM: 2 };
  static Overflow = { NONE: 0, CLAMP: 1, SHRINK: 2, RESIZE_HEIGHT: 3 };

  constructor(node?: MockNode) {
    super(node);
    this.name = 'Label';
  }
}

/**
 * Mock Sprite component
 */
export class MockSprite extends MockComponent {
  spriteFrame: any = null;
  type: number = 0;
  sizeMode: number = 0;
  trim: boolean = true;
  grayscale: boolean = false;
  opacity: number = 255;
  color: { r: number; g: number; b: number; a: number } = { r: 255, g: 255, b: 255, a: 255 };

  static Type = { SIMPLE: 0, SLICED: 1, TILED: 2, FILLED: 3 };
  static SizeMode = { NONE: 0, RAW_SIZE: 1, TRIMMED: 2 };

  constructor(node?: MockNode) {
    super(node);
    this.name = 'Sprite';
  }
}

/**
 * Mock Button component
 */
export class MockButton extends MockComponent {
  interactable: boolean = true;
  transition: number = 1;
  normalColor: { r: number; g: number; b: number; a: number } = { r: 255, g: 255, b: 255, a: 255 };
  pressedColor: { r: number; g: number; b: number; a: number } = { r: 200, g: 200, b: 200, a: 255 };
  hoverColor: { r: number; g: number; b: number; a: number } = { r: 230, g: 230, b: 230, a: 255 };
  disabledColor: { r: number; g: number; b: number; a: number } = { r: 150, g: 150, b: 150, a: 255 };
  duration: number = 0.1;
  zoomScale: number = 0.1;
  target: MockNode | null = null;
  clickEvents: any[] = [];

  static Transition = { NONE: 0, COLOR: 1, SPRITE: 2, SCALE: 3 };

  constructor(node?: MockNode) {
    super(node);
    this.name = 'Button';
  }
}

/**
 * Mock ScrollView component
 */
export class MockScrollView extends MockComponent {
  horizontal: boolean = false;
  vertical: boolean = true;
  inertia: boolean = false;
  elastic: boolean = false;
  bounceDuration: number = 0.3;
  content: MockNode | null = null;

  constructor(node?: MockNode) {
    super(node);
    this.name = 'ScrollView';
  }

  scrollTo(position: any, time: number): void {
    // Mock implementation
  }
}

/**
 * Mock Toggle component
 */
export class MockToggle extends MockComponent {
  isChecked: boolean = false;
  interactable: boolean = true;
  checkMark: MockNode | null = null;
  toggleGroup: any = null;

  constructor(node?: MockNode) {
    super(node);
    this.name = 'Toggle';
  }
}

/**
 * Mock Slider component
 */
export class MockSlider extends MockComponent {
  progress: number = 0;
  direction: number = 0; // 0 = HORIZONTAL, 1 = VERTICAL
  interactable: boolean = true;
  handle: MockNode | null = null;
  bar: MockNode | null = null;

  static Direction = { HORIZONTAL: 0, VERTICAL: 1 };

  constructor(node?: MockNode) {
    super(node);
    this.name = 'Slider';
  }
}

/**
 * Mock ProgressBar component
 */
export class MockProgressBar extends MockComponent {
  progress: number = 0;
  mode: number = 0; // 0 = HORIZONTAL, 1 = VERTICAL, 2 = FILLED
  reverse: boolean = false;
  totalLength: number = 100;
  bar: MockNode | null = null;

  static Mode = { HORIZONTAL: 0, VERTICAL: 1, FILLED: 2 };

  constructor(node?: MockNode) {
    super(node);
    this.name = 'ProgressBar';
  }
}

/**
 * Mock EditBox component
 */
export class MockEditBox extends MockComponent {
  string: string = '';
  placeholder: string = '';
  maxLength: number = -1;
  inputMode: number = 0;
  returnType: number = 0;
  interactable: boolean = true;

  static InputMode = { ANY: 0, NUMERIC: 1, DECIMAL: 2, SINGLE_LINE: 3 };
  static ReturnType = { DEFAULT: 0, DONE: 1, SEND: 2, SEARCH: 3, NEXT: 4 };

  constructor(node?: MockNode) {
    super(node);
    this.name = 'EditBox';
  }
}

/**
 * Mock UIOpacity component
 */
export class MockUIOpacity extends MockComponent {
  opacity: number = 255;

  constructor(node?: MockNode) {
    super(node);
    this.name = 'UIOpacity';
  }
}

/**
 * Mock RichText component
 */
export class MockRichText extends MockComponent {
  string: string = '';
  fontSize: number = 16;
  fontFamily: string = 'Arial';
  maxWidth: number = 0;
  handleTouchEvent: boolean = false;

  constructor(node?: MockNode) {
    super(node);
    this.name = 'RichText';
  }
}

/**
 * Mock Node class
 */
export class MockNode {
  name: string = 'Node';
  active: boolean = true;
  parent: MockNode | null = null;
  children: MockNode[] = [];
  components: MockComponent[] = [];
  uiTransform: MockUITransform | null = null;
  position: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
  scale: { x: number; y: number; z: number } = { x: 1, y: 1, z: 1 };
  angle: number = 0;
  color: { r: number; g: number; b: number; a: number } = { r: 255, g: 255, b: 255, a: 255 };
  opacity: number = 255;

  // Getter/setter for x and y (for compatibility with scroll-view.ts)
  get x(): number {
    return this.position.x;
  }
  set x(value: number) {
    this.position.x = value;
  }
  get y(): number {
    return this.position.y;
  }
  set y(value: number) {
    this.position.y = value;
  }

  // Event handling
  private _eventListeners: Map<string, Array<{ callback: (...args: any[]) => void; target?: any }>> = new Map();

  constructor(name?: string) {
    if (name) {
      this.name = name;
    }
  }

  addComponent<T extends MockComponent>(type: new (node: MockNode) => T): T {
    const existing = this.getComponent(type);
    if (existing) {
      return existing;
    }
    const component = new type(this);
    if ((type as any) === MockUITransform) {
      this.uiTransform = component as unknown as MockUITransform;
    } else {
      this.components.push(component);
    }
    return component;
  }

  getComponent<T extends MockComponent>(type: new (node: MockNode) => T): T | null;
  getComponent(className: string): MockComponent | MockUITransform | null;
  getComponent(type: any): MockComponent | MockUITransform | null {
    if (typeof type === 'string') {
      if (type === 'UITransform') {
        return this.uiTransform;
      }
      return this.components.find((c) => c.name === type) || null;
    }
    // Check for UITransform
    if (type === MockUITransform) {
      return this.uiTransform;
    }
    return this.components.find((c) => c instanceof type) || null;
  }

  addChild(child: MockNode): void {
    if (!this.children.includes(child)) {
      child.parent = this;
      this.children.push(child);
    }
  }

  removeFromParent(): void {
    if (this.parent) {
      this.parent.removeChild(this);
      this.parent = null;
    }
  }

  removeChild(child: MockNode): void {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
      child.parent = null;
    }
  }

  removeAllChildren(): void {
    this.children.forEach((child) => {
      child.parent = null;
    });
    this.children = [];
  }

  destroy(): void {
    this.removeAllChildren();
    this.components = [];
    this.parent = null;
  }

  getChildByName(name: string): MockNode | null {
    return this.children.find((child) => child.name === name) || null;
  }

  setPosition(x: number, y: number, z: number = 0): void {
    this.position = { x, y, z };
  }

  setScale(x: number, y: number, z: number = 1): void {
    this.scale = { x, y, z };
  }

  setRotationFromEuler(x: number, y: number, z: number): void {
    // Mock implementation - angle is a simplified representation
    this.angle = z;
  }

  on(type: string, callback: (...args: any[]) => void, target?: any): void {
    if (!this._eventListeners.has(type)) {
      this._eventListeners.set(type, []);
    }
    this._eventListeners.get(type)!.push({ callback, target });
  }

  off(type: string, callback?: (...args: any[]) => void): void {
    const listeners = this._eventListeners.get(type);
    if (listeners) {
      if (callback) {
        const index = listeners.findIndex((l) => l.callback === callback);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      } else {
        this._eventListeners.delete(type);
      }
    }
  }

  once(type: string, callback: (...args: any[]) => void, target?: any): void {
    const wrappedCallback = (...args: any[]) => {
      this.off(type, wrappedCallback);
      callback(...args);
    };
    this.on(type, wrappedCallback, target);
  }

  emit(type: string, ...args: any[]): void {
    const listeners = this._eventListeners.get(type);
    if (listeners) {
      listeners.forEach(({ callback }) => callback(...args));
    }
  }

  dispatchEvent(event: any): void {
    // Mock implementation - emit with event type
    if (event && event.type) {
      this.emit(event.type, event);
    }
  }
}

// =============================================================================
// Mock Factory Functions
// =============================================================================

/**
 * Create a mock Node with optional name
 */
export function mockNode(name?: string): MockNode {
  return new MockNode(name);
}

/**
 * Create a mock UITransform component
 */
export function mockUITransform(): MockUITransform {
  return new MockUITransform();
}

/**
 * Create a mock Label component
 */
export function mockLabel(): MockLabel {
  return new MockLabel();
}

/**
 * Create a mock Sprite component
 */
export function mockSprite(): MockSprite {
  return new MockSprite();
}

/**
 * Create a mock Button component
 */
export function mockButton(): MockButton {
  return new MockButton();
}

/**
 * Create a mock ScrollView component
 */
export function mockScrollView(): MockScrollView {
  return new MockScrollView();
}

/**
 * Create a mock Toggle component
 */
export function mockToggle(): MockToggle {
  return new MockToggle();
}

/**
 * Create a mock Slider component
 */
export function mockSlider(): MockSlider {
  return new MockSlider();
}

/**
 * Create a mock ProgressBar component
 */
export function mockProgressBar(): MockProgressBar {
  return new MockProgressBar();
}

/**
 * Create a mock EditBox component
 */
export function mockEditBox(): MockEditBox {
  return new MockEditBox();
}

/**
 * Create a mock RichText component
 */
export function mockRichText(): MockRichText {
  return new MockRichText();
}

// =============================================================================
// Global cc Setup
// =============================================================================

/**
 * Setup global cc namespace for tests.
 * Call this in your test setup file to make cc.Node, cc.UITransform, etc. available.
 */
export function setupGlobalCc(): void {
  const ccNamespace = {
    Node: MockNode,
    UITransform: MockUITransform,
    Component: MockComponent,
    Label: MockLabel,
    Sprite: MockSprite,
    Button: MockButton,
    Toggle: MockToggle,
    Slider: MockSlider,
    ProgressBar: MockProgressBar,
    EditBox: MockEditBox,
    RichText: MockRichText,
    ScrollView: MockScrollView,
    UIOpacity: MockUIOpacity,
      Vec2: class Vec2 {
        x: number;
        y: number;
        constructor(x: number = 0, y: number = 0) {
          this.x = x;
          this.y = y;
        }
      },
      Vec3: class Vec3 {
        x: number;
        y: number;
        z: number;
        constructor(x: number = 0, y: number = 0, z: number = 0) {
          this.x = x;
          this.y = y;
          this.z = z;
        }
      },
      Color: class Color {
        r: number;
        g: number;
        b: number;
        a: number;
        constructor(r: number = 255, g: number = 255, b: number = 255, a: number = 255) {
          this.r = r;
          this.g = g;
          this.b = b;
          this.a = a;
        }
        set(value: Color | string | number): void {
          if (typeof value === 'number') {
            this.r = value;
            this.g = value;
            this.b = value;
            this.a = value;
          } else if (typeof value === 'string') {
            // Simple hex parsing
            if (value.startsWith('#')) {
              const hex = value.slice(1);
              this.r = parseInt(hex.substring(0, 2), 16);
              this.g = parseInt(hex.substring(2, 4), 16);
              this.b = parseInt(hex.substring(4, 6), 16);
              this.a = hex.length === 8 ? parseInt(hex.substring(6, 8), 16) : 255;
            }
          } else {
            this.r = value.r;
            this.g = value.g;
            this.b = value.b;
            this.a = value.a;
          }
        }
      },
      SpriteFrame: class SpriteFrame {
        constructor(imageAsset?: any) {
          // Mock implementation
        }
      },
      ImageAsset: class ImageAsset {
        constructor(image?: HTMLImageElement | HTMLCanvasElement) {
          // Mock implementation
        }
      },
      Tween: class Tween {
        static easing: Record<string, string> = {};
        constructor(target: any) {
          // Mock implementation
        }
      },
      tween: function (target: any) {
        return {
          to: function () {
            return this;
          },
          by: function () {
            return this;
          },
          delay: function () {
            return this;
          },
          repeat: function () {
            return this;
          },
          repeatForever: function () {
            return this;
          },
          then: function () {
            return this;
          },
          target: function () {
            return this;
          },
          start: function () {
            return this;
          },
          stop: function () {},
          clone: function () {
            return this;
          },
          union: function () {
            return this;
          },
          easing: function () {
            return this;
          },
          call: function () {
            return this;
          },
          hide: function () {
            return this;
          },
          show: function () {
            return this;
          },
          removeSelf: function () {
            return this;
          },
          reverse: function () {
            return this;
          },
        };
      },
      assetManager: {
        loadRemote: vi.fn((...args: any[]) => {
          const callback = args.length === 2 ? args[1] : args[2];
          callback(null, {});
        }),
        loadAny: vi.fn((url: string, callback: any) => {
          callback(null, {});
        }),
        releaseAsset: vi.fn(),
      },
      director: {
        getScene: vi.fn(() => null),
        runScene: vi.fn(),
        getDeltaTime: vi.fn(() => 0),
        getTotalTime: vi.fn(() => 0),
        getFrameCount: vi.fn(() => 0),
      },
    };

    (globalThis as any).cc = ccNamespace;
  }

/**
 * Cleanup global cc namespace
 */
export function cleanupGlobalCc(): void {
  if (typeof globalThis !== 'undefined') {
    delete (globalThis as any).cc;
  }
}
