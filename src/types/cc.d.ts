/**
 * Cocos4 Engine Type Declarations
 *
 * Provides TypeScript types for the Cocos4 (cocos-creator) runtime API.
 * At runtime, the global `cc` object is provided by the Cocos4 engine
 * (see https://github.com/cocos/cocos4 -> cocos/core/global-exports.ts).
 *
 * These types cover ONLY the API surface used by cocos-ui.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

declare namespace cc {

  // ---- Math -----------------------------------------------------------------

  class Vec2 {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
  }

  class Vec3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
  }

  interface Size {
    width: number;
    height: number;
  }

  class Color {
    r: number; g: number; b: number; a: number;
    constructor(r?: number, g?: number, b?: number, a?: number);
    set(value: Color | string | number): void;
  }

  // ---- Scene Graph ----------------------------------------------------------

  interface EventHandler {
    component: string;
    handler: string;
    target: Node;
    customEventData: string;
  }

  class Node {
    name: string;
    active: boolean;
    parent: Node | null;
    children: Node[];
    components: Component[];
    position: Vec3;
    scale: Vec3;
    angle: number;
    color: Color;
    opacity: number;

    constructor(name?: string);

    addComponent<T extends Component>(type: new (...args: any[]) => T): T;
    getComponent<T extends Component>(type: new (...args: any[]) => T): T | null;
    getComponent(className: string): Component | null;

    addChild(child: Node): void;
    removeFromParent(): void;
    removeChild(child: Node): void;
    removeAllChildren(): void;
    destroy(): void;

    getChildByName(name: string): Node | null;

    setPosition(x: number, y: number, z?: number): void;
    setScale(x: number, y: number, z?: number): void;
    setRotationFromEuler(x: number, y: number, z: number): void;

    on(type: string, callback: (...args: any[]) => void, target?: any, useCapture?: boolean): void;
    off(type: string, callback?: (...args: any[]) => void, target?: any): void;
    once(type: string, callback: (...args: any[]) => void, target?: any): void;
    emit(type: string, ...args: any[]): void;
    dispatchEvent(event: any): void;
  }

  abstract class Component {
    node: Node;
    name: string;
    enabled: boolean;
    enabledInHierarchy: boolean;
    isValid: boolean;
  }

  // ---- UI Framework ---------------------------------------------------------

  class UITransform extends Component {
    width: number;
    height: number;
    anchorX: number;
    anchorY: number;
    contentSize: Size;
    anchorPoint: Vec2;
    setContentSize(w: number, h: number): void;
    setAnchorPoint(x: number, y: number): void;
  }

  class UIOpacity extends Component {
    opacity: number;
  }

  // ---- UI Components --------------------------------------------------------

  class Button extends Component {
    interactable: boolean;
    transition: number;
    normalColor: Color;
    pressedColor: Color;
    hoverColor: Color;
    disabledColor: Color;
    duration: number;
    zoomScale: number;
    target: Node | null;
    clickEvents: EventHandler[];
    static Transition: { NONE: 0; COLOR: 1; SPRITE: 2; SCALE: 3 };
  }

  class Label extends Component {
    string: string;
    fontSize: number;
    fontFamily: string;
    lineHeight: number;
    spacing: number;
    enableWrapText: boolean;
    isBold: boolean;
    isItalic: boolean;
    isUnderline: boolean;
    horizontalAlign: number;
    verticalAlign: number;
    overflow: number;
    color: Color;
    font: any;
    cacheMode: number;
    static HorizontalAlign: { LEFT: number; CENTER: number; RIGHT: number };
    static VerticalAlign: { TOP: number; CENTER: number; BOTTOM: number };
    static Overflow: { NONE: number; CLAMP: number; SHRINK: number; RESIZE_HEIGHT: number };
  }

  class Sprite extends Component {
    spriteFrame: SpriteFrame | null;
    type: number;
    sizeMode: number;
    trim: boolean;
    grayscale: boolean;
    opacity: number;
    color: Color;
    static Type: { SIMPLE: number; SLICED: number; TILED: number; FILLED: number };
    static SizeMode: { NONE: number; RAW_SIZE: number; TRIMMED: number };
  }

  class SpriteFrame {
    constructor(imageAsset?: ImageAsset);
  }

  class ImageAsset {
    constructor(image: HTMLImageElement | HTMLCanvasElement);
  }

  class RichText extends Component {
    string: string;
    horizontalAlign: number;
    fontSize: number;
    fontFamily: string;
    font: any;
    maxWidth: number;
    lineHeight: number;
    imageAtlas: any;
    handleTouchEvent: boolean;
  }

  class ScrollView extends Component {
    content: Node | null;
    horizontal: boolean;
    vertical: boolean;
    inertia: boolean;
    brake: number;
    elastic: boolean;
    bounceDuration: number;
    scrollEvents: EventHandler[];
    scrollToBottom(time?: number, attenuated?: boolean): void;
    scrollToTop(time?: number, attenuated?: boolean): void;
    scrollToLeft(time?: number, attenuated?: boolean): void;
    scrollToRight(time?: number, attenuated?: boolean): void;
    scrollToPercentLocation(percent: Vec2, time?: number): void;
    getScrollOffset(out?: Vec2): Vec2;
    getMaxScrollOffset(out?: Vec2): Vec2;
    isScrolling(): boolean;
  }

  class Layout extends Component {
    type: number;
    resizeMode: number;
    paddingLeft: number; paddingRight: number;
    paddingTop: number; paddingBottom: number;
    spacingX: number; spacingY: number;
    horizontalAlign: number; verticalAlign: number;
    cellSize: Size;
    static Type: { NONE: number; HORIZONTAL: number; VERTICAL: number; GRID: number };
    static ResizeMode: { NONE: number; CONTAINER: number; CHILDREN: number };
    static HorizontalAlign: { LEFT: number; CENTER: number; RIGHT: number };
    static VerticalAlign: { TOP: number; CENTER: number; BOTTOM: number };
  }

  class Toggle extends Component {
    isChecked: boolean;
    interactable: boolean;
    toggleGroup: ToggleContainer | null;
    checkMark: Sprite | null;
    static EventType: { TOGGLE: string };
  }

  class ToggleContainer extends Component {
    toggleItems: Toggle[];
    allowSwitchOff: boolean;
  }

  class Slider extends Component {
    handle: Node | null;
    handleSprite: Sprite | null;
    progress: number;
    slideEvents: EventHandler[];
    static Direction: { HORIZONTAL: number; VERTICAL: number };
  }

  class ProgressBar extends Component {
    barSprite: Sprite | null;
    mode: number;
    progress: number;
    totalLength: number;
    reverse: boolean;
    static Mode: { HORIZONTAL: number; VERTICAL: number; FILLED: number };
  }

  class EditBox extends Component {
    string: string;
    placeholder: string;
    placeholderLabel: Label | null;
    maxLength: number;
    inputMode: number;
    inputFlag: number;
    returnType: number;
    textLabel: Label | null;
    editingDidBegan: EventHandler[];
    editingDidEnded: EventHandler[];
    textChanged: EventHandler[];
    editingReturn: EventHandler[];
    static InputMode: { ANY: number; EMAIL_ADDR: number; NUMERIC: number; PHONE_NUMBER: number; URL: number; DECIMAL: number };
    static InputFlag: { PASSWORD: number; SENSITIVE: number; INITIAL_CAPS_WORD: number; INITIAL_CAPS_SENTENCE: number; DEFAULT: number };
    static KeyboardReturnType: { DEFAULT: number; DONE: number; SEND: number; SEARCH: number; GO: number; NEXT: number };
  }

  class PageView extends Component {
    sizeMode: number;
    direction: number;
    scrollThreshold: number;
    pageTurningEventTiming: number;
    indicator: PageViewIndicator | null;
    pageTurningSpeed: number;
    events: EventHandler[];
    getPages(): Node[];
    getCurrentPageIndex(): number;
    setCurrentPageIndex(index: number, scrollAnimation?: boolean): void;
    addPage(page: Node): void;
    removePage(page: Node): void;
    static SizeMode: { FREE: number; CONTAINER: number };
    static Direction: { HORIZONTAL: number; VERTICAL: number };
    static EventType: { PAGE_TURNING: string };
  }

  class PageViewIndicator extends Component {
    spriteFrame: SpriteFrame | null;
    direction: number;
    cellSize: Size;
    spacing: number;
    static Direction: { HORIZONTAL: number; VERTICAL: number };
  }

  class Mask extends Component {
    type: number;
    inverted: boolean;
    alphaThreshold: number;
    spriteFrame: SpriteFrame | null;
    static Type: { RECT: number; ELLIPSE: number; IMAGE_STENCIL: number };
  }

  class Graphics extends Component {
    lineWidth: number;
    strokeColor: Color;
    fillColor: Color;
    miterLimit: number;
    lineCap: number;
    lineJoin: number;
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
    arc(cx: number, cy: number, r: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void;
    ellipse(cx: number, cy: number, rx: number, ry: number): void;
    circle(cx: number, cy: number, r: number): void;
    rect(x: number, y: number, w: number, h: number): void;
    roundRect(x: number, y: number, w: number, h: number, r: number): void;
    clear(): void;
    fill(): void;
    stroke(): void;
    close(): void;
  }

  class SafeArea extends Component {}

  class Widget extends Component {
    isAlignTop: boolean; isAlignBottom: boolean;
    isAlignLeft: boolean; isAlignRight: boolean;
    isAlignHorizontalCenter: boolean; isAlignVerticalCenter: boolean;
    isAbsoluteTop: boolean; isAbsoluteBottom: boolean;
    isAbsoluteLeft: boolean; isAbsoluteRight: boolean;
    isAbsoluteHorizontalCenter: boolean; isAbsoluteVerticalCenter: boolean;
    top: number; bottom: number; left: number; right: number;
    horizontalCenter: number; verticalCenter: number;
    alignMode: number;
    static AlignMode: { ONCE: number; ON_WINDOW_RESIZE: number; ALWAYS: number };
  }

  class ParticleSystem2D extends Component {
    file: string;
    custom: boolean;
    playOnLoad: boolean;
    autoRemoveOnFinish: boolean;
    loop: boolean;
    life: number; lifeVar: number;
    speed: number; speedVar: number;
    totalParticles: number;
    duration: number;
    emissionRate: number;
    gravity: Vec2;
    angle: number; angleVar: number;
    startSize: number; startSizeVar: number;
    endSize: number; endSizeVar: number;
    startColor: Color; startColorVar: Color;
    endColor: Color; endColorVar: Color;
    play(): void; stop(): void;
    pause(): void; resume(): void;
    resetSystem(): void;
  }

  class ParticleAsset {
    _nativeAsset: any;
    spriteFrame: SpriteFrame | null;
  }

  // ---- Fonts -----------------------------------------------------------------

  class Font { _nativeAsset: any; _uuid: string; }
  class TTFFont extends Font {}

  // ---- Tween -----------------------------------------------------------------

  interface TweenObject<T> {
    to(duration: number, props: Record<string, any>, opts?: Record<string, any>): TweenObject<T>;
    to(props: Record<string, any>, duration?: number, easing?: string | ((k: number) => number)): TweenObject<T>;
    by(duration: number, props: Record<string, any>, opts?: Record<string, any>): TweenObject<T>;
    by(props: Record<string, any>, duration?: number, easing?: string | ((k: number) => number)): TweenObject<T>;
    delay(d: number): TweenObject<T>;
    repeat(count: number, embedTween?: TweenObject<T>): TweenObject<T>;
    repeatForever(embedTween?: TweenObject<T>): TweenObject<T>;
    then(nextTween: TweenObject<T>): TweenObject<T>;
    target(target: T): TweenObject<T>;
    start(): TweenObject<T>;
    stop(): void;
    clone(target: T): TweenObject<T>;
    union(): TweenObject<T>;
    easing(easing: string | ((k: number) => number)): TweenObject<T>;
    call(callback: () => void): TweenObject<T>;
    hide(): TweenObject<T>;
    show(): TweenObject<T>;
    removeSelf(): TweenObject<T>;
    reverse(): TweenObject<T>;
  }

  class Tween {
    constructor(target: any);
    static easing: Record<string, string>;
  }

  function tween(target: any): TweenObject<any>;

  // ---- Asset Manager ---------------------------------------------------------

  interface AssetManager {
    loadRemote(url: string, options: Record<string, any>, callback: (err: Error | null, asset?: any) => void): void;
    loadRemote(url: string, callback: (err: Error | null, asset?: any) => void): void;
    loadAny(url: string, callback: (err: Error | null, asset?: any) => void): void;
    releaseAsset(asset: any): void;
  }
  const assetManager: AssetManager;

  // ---- Director --------------------------------------------------------------

  interface Director {
    getScene(): Node | null;
    runScene(scene: Node, onBeforeLoad?: () => void, onLaunched?: () => void): void;
    getDeltaTime(): number;
    getTotalTime(): number;
    getFrameCount(): number;
  }
  const director: Director;

  // ---- Game ------------------------------------------------------------------

  interface Game {
    init(config: Record<string, any>): Promise<void>;
    runScene(scene: Node): void;
    step(dt: number): void;
    pause(): void;
    resume(): void;
    end(): void;
    restart(): void;
    setFrameRate(frameRate: number): void;
    getFrameRate(): number;
    readonly canvas: HTMLCanvasElement;
  }

  // ---- Debug -----------------------------------------------------------------

  enum DebugMode {
    NONE = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    INFO_FOR_WEB_PAGE = 4,
    WARN_FOR_WEB_PAGE = 5,
    ERROR_FOR_WEB_PAGE = 6,
  }

  // ---- Scene -----------------------------------------------------------------

  interface Scene extends Node {
    new (name?: string): Scene;
  }
}
