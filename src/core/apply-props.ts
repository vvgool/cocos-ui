/**
 * Props Mapper — VNode.props → Cocos4 Component property mapping system
 *
 * Provides diff-based prop updates with type conversion and event management.
 * Uses a registry pattern (PropMappings) so components can register their own
 * prop-to-property mappings without hardcoding in the core.
 *
 * Cocos4 types are intentionally typed as `any` because `cocos-creator` is a
 * peer dependency and not available at compile time.
 */
import { nodeComponentTypes } from './create-element';
import { applyAnimate, stopAnimate } from '../animation/tween';
import type { AnimateValue } from '../animation/tween';
export type PropMapping = string | ((node: any, value: any) => void);
export type PropMappings = Map<string, Record<string, PropMapping>>;
export const propMappings: PropMappings = new Map();
export function registerPropMapping(
  component: string,
  mapping: Record<string, PropMapping>,
): void {
  propMappings.set(component, mapping);
}
export function parseColor(value: any): any {
  if (typeof value === 'object' && value !== null) {
    return value;
  }
  if (typeof value !== 'string') {
    return value;
  }
  let hex = value.trim();
  if (!hex.startsWith('#')) {
    return value;
  }
  hex = hex.slice(1);
  let r: number;
  let g: number;
  let b: number;
  let a: number = 255;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  } else if (hex.length === 8) {
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
    a = parseInt(hex.slice(6, 8), 16);
  } else {
    return value;
  }
  if (typeof cc !== 'undefined' && cc.Color) {
    return new cc.Color(r, g, b, a);
  }
  return { r, g, b, a };
}
export function toNumber(value: any): any {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  return value;
}
const STYLE_MAPPINGS: Record<string, PropMapping> = {
  width: (node: any, value: any) => {
    const transform = node.getComponent(cc.UITransform);
    if (transform) {
      transform.setContentSize(toNumber(value), transform.contentSize.height);
    }
  },
  height: (node: any, value: any) => {
    const transform = node.getComponent(cc.UITransform);
    if (transform) {
      transform.setContentSize(transform.contentSize.width, toNumber(value));
    }
  },
  x: (node: any, value: any) => {
    node.setPosition(toNumber(value), node.position.y);
  },
  y: (node: any, value: any) => {
    node.setPosition(node.position.x, toNumber(value));
  },
  anchorX: (node: any, value: any) => {
    const transform = node.getComponent(cc.UITransform);
    if (transform) {
      transform.setAnchorPoint(toNumber(value), transform.anchorPoint.y);
    }
  },
  anchorY: (node: any, value: any) => {
    const transform = node.getComponent(cc.UITransform);
    if (transform) {
      transform.setAnchorPoint(transform.anchorPoint.x, toNumber(value));
    }
  },
  scaleX: (node: any, value: any) => {
    node.setScale(toNumber(value), node.scale.y);
  },
  scaleY: (node: any, value: any) => {
    node.setScale(node.scale.x, toNumber(value));
  },
  rotation: (node: any, value: any) => {
    node.setRotationFromEuler(toNumber(value), 0, 0);
  },
  opacity: (node: any, value: any) => {
    const uiRenderer = node.getComponent(cc.UIOpacity);
    if (uiRenderer) {
      uiRenderer.opacity = toNumber(value);
    } else {
      const opacity = node.addComponent(cc.UIOpacity);
      opacity.opacity = toNumber(value);
    }
  },
  color: (node: any, value: any) => {
    node.color = parseColor(value);
  },
};
const EVENT_PROP_MAP: Record<string, string> = {
  onClick: 'click',
  onTouchStart: 'touch-start',
  onTouchEnd: 'touch-end',
  onTouchMove: 'touch-move',
  onTouchCancel: 'touch-cancel',
  onChange: 'change',
  onInput: 'input',
  onSlide: 'slide',
  onFocus: 'focus',
  onBlur: 'blur',
  onSubmit: 'submit',
};
function isEventProp(propName: string): boolean {
  return propName.startsWith('on') && propName.length > 2 && propName[2] === propName[2].toUpperCase();
}
function toEventName(propName: string): string {
  if (propName in EVENT_PROP_MAP) {
    return EVENT_PROP_MAP[propName];
  }
  const name = propName.slice(2);
  return name.replace(/([A-Z])/g, '-$1').toLowerCase().slice(1);
}
const nodeEventHandlers: WeakMap<any, Map<string, Function>> = new WeakMap();
function getEventHandlerMap(node: any): Map<string, Function> {
  let map = nodeEventHandlers.get(node);
  if (!map) {
    map = new Map();
    nodeEventHandlers.set(node, map);
  }
  return map;
}
const STYLE_DEFAULTS: Record<string, any> = {
  width: 0,
  height: 0,
  x: 0,
  y: 0,
  anchorX: 0.5,
  anchorY: 0.5,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
  opacity: 255,
  color: null,
};
export function applyProps(
  node: any,
  oldProps: Record<string, any> | null,
  newProps: Record<string, any>,
): void {
  const componentName = nodeComponentTypes.get(node) ?? node.name ?? '';
  const componentMapping = propMappings.get(componentName) ?? null;
  const allKeys = new Set<string>();
  if (oldProps) {
    for (const key of Object.keys(oldProps)) {
      allKeys.add(key);
    }
  }
  for (const key of Object.keys(newProps)) {
    allKeys.add(key);
  }
  for (const key of allKeys) {
    if (key === 'children' || key === 'key' || key === 'static') {
      continue;
    }
    const oldValue = oldProps?.[key];
    const newValue = newProps[key];
    if (oldValue === newValue) {
      continue;
    }
    if (key === 'ref') {
      applyRef(oldValue, newValue);
      continue;
    }
    if (key === 'style') {
      applyStyle(node, oldValue, newValue);
      continue;
    }
    if (key === 'animate') {
      applyAnimateProp(node, oldValue, newValue);
      continue;
    }
    if (isEventProp(key)) {
      applyEvent(node, key, oldValue, newValue);
      continue;
    }
    if (componentMapping && key in componentMapping) {
      const mapping = componentMapping[key];
      applyMappedProp(node, mapping, newValue, oldValue);
      continue;
    }
    applyDirectProp(node, key, newValue, oldValue);
  }
}
function applyRef(oldRef: any, newRef: any): void {
  if (oldRef && typeof oldRef === 'object' && 'current' in oldRef) {
    oldRef.current = null;
  }
  if (newRef && typeof newRef === 'object' && 'current' in newRef) {
    // Reconciler sets ref.current to the node after creation
  }
}
function applyStyle(
  node: any,
  oldStyle: Record<string, any> | null | undefined,
  newStyle: Record<string, any> | null | undefined,
): void {
  const allStyleKeys = new Set<string>();
  if (oldStyle) {
    for (const key of Object.keys(oldStyle)) {
      allStyleKeys.add(key);
    }
  }
  if (newStyle) {
    for (const key of Object.keys(newStyle)) {
      allStyleKeys.add(key);
    }
  }
  for (const key of allStyleKeys) {
    const oldValue = oldStyle?.[key];
    const newValue = newStyle?.[key];
    if (oldValue === newValue) {
      continue;
    }
    const setter = STYLE_MAPPINGS[key];
    if (setter) {
      if (newValue !== undefined) {
        if (typeof setter === 'function') {
          setter(node, newValue);
        } else {
          node[setter] = toNumber(newValue);
        }
      } else {
        const defaultValue = STYLE_DEFAULTS[key];
        if (defaultValue !== undefined) {
          if (typeof setter === 'function') {
            setter(node, defaultValue);
          } else {
            node[setter] = defaultValue;
          }
        }
      }
    }
  }
}
function applyAnimateProp(
  node: any,
  oldValue: AnimateValue | undefined,
  newValue: AnimateValue | undefined,
): void {
  if (newValue) {
    applyAnimate(node, newValue);
  } else if (oldValue) {
    stopAnimate(node);
  }
}
function applyEvent(
  node: any,
  propName: string,
  oldHandler: Function | undefined,
  newHandler: Function | undefined,
): void {
  const eventName = toEventName(propName);
  const handlerMap = getEventHandlerMap(node);
  if (oldHandler) {
    node.off(eventName, oldHandler as (...args: any[]) => void);
    handlerMap.delete(propName);
  }
  if (newHandler) {
    node.on(eventName, newHandler as (...args: any[]) => void);
    handlerMap.set(propName, newHandler);
  }
}
function applyMappedProp(
  node: any,
  mapping: PropMapping,
  newValue: any,
  _oldValue: any,
): void {
  if (typeof mapping === 'function') {
    mapping(node, newValue);
  } else {
    node[mapping] = newValue;
  }
}
function applyDirectProp(
  node: any,
  key: string,
  newValue: any,
  _oldValue: any,
): void {
  if (newValue !== undefined) {
    node[key] = newValue;
  } else {
    delete node[key];
  }
}
/**
 * Fast-path for CREATE — applies props to a newly created node.
 *
 * Unlike applyProps(), this skips:
 * - oldProps/newProps diffing (no oldValue === newValue checks)
 * - allKeys Set creation
 * - Style key Set creation
 *
 * Additionally merges batchable C++ API calls to reduce JS↔C++ boundary crossings:
 * - { width, height } → setContentSize(w, h)  (saves 2 C++ reads)
 * - { x, y }         → setPosition(x, y)      (saves 2 C++ reads)
 * - { anchorX, anchorY } → setAnchorPoint(x, y) (saves 2 C++ reads)
 * - { scaleX, scaleY }   → setScale(x, y)        (saves 2 C++ reads)
 */
export function applyCreateProps(
  node: any,
  newProps: Record<string, any>,
): void {
  const componentName = node.name ?? '';
  const componentMapping = propMappings.get(componentName) ?? null;

  // --- Step 1: Detect batchable style pairs ---
  const style = newProps.style;
  let batchW: number | undefined;
  let batchH: number | undefined;
  let batchX: number | undefined;
  let batchY: number | undefined;
  let batchAX: number | undefined;
  let batchAY: number | undefined;
  let batchSX: number | undefined;
  let batchSY: number | undefined;

  if (style && typeof style === 'object' && !Array.isArray(style)) {
    if ('width' in style && 'height' in style) {
      batchW = toNumber(style.width);
      batchH = toNumber(style.height);
    }
    if ('x' in style && 'y' in style) {
      batchX = toNumber(style.x);
      batchY = toNumber(style.y);
    }
    if ('anchorX' in style && 'anchorY' in style) {
      batchAX = toNumber(style.anchorX);
      batchAY = toNumber(style.anchorY);
    }
    if ('scaleX' in style && 'scaleY' in style) {
      batchSX = toNumber(style.scaleX);
      batchSY = toNumber(style.scaleY);
    }
  }

  // --- Step 2: Apply batched pairs (single C++ call instead of two) ---
  if (batchW !== undefined && batchH !== undefined) {
    const transform = node.getComponent(cc.UITransform);
    if (transform) transform.setContentSize(batchW, batchH);
  }
  if (batchX !== undefined && batchY !== undefined) {
    node.setPosition(batchX, batchY);
  }
  if (batchAX !== undefined && batchAY !== undefined) {
    const transform = node.getComponent(cc.UITransform);
    if (transform) transform.setAnchorPoint(batchAX, batchAY);
  }
  if (batchSX !== undefined && batchSY !== undefined) {
    node.setScale(batchSX, batchSY);
  }

  // --- Step 3: Apply remaining props (no set-alloc, no old/new cmp) ---
  for (const key of Object.keys(newProps)) {
    if (key === 'children' || key === 'key' || key === 'static') continue;

    if (key === 'ref') {
      // ref is set by the reconciler after node creation
      continue;
    }

    if (key === 'style') {
      if (style && typeof style === 'object' && !Array.isArray(style)) {
        for (const styleKey of Object.keys(style)) {
          if (styleKey === 'width' && batchW !== undefined) continue;
          if (styleKey === 'height' && batchH !== undefined) continue;
          if (styleKey === 'x' && batchX !== undefined) continue;
          if (styleKey === 'y' && batchY !== undefined) continue;
          if (styleKey === 'anchorX' && batchAX !== undefined) continue;
          if (styleKey === 'anchorY' && batchAY !== undefined) continue;
          if (styleKey === 'scaleX' && batchSX !== undefined) continue;
          if (styleKey === 'scaleY' && batchSY !== undefined) continue;
          const styleValue = style[styleKey];
          if (styleValue === undefined) continue;
          const setter = STYLE_MAPPINGS[styleKey];
          if (setter) {
            if (typeof setter === 'function') {
              setter(node, styleValue);
            } else {
              node[setter] = toNumber(styleValue);
            }
          }
        }
      }
      continue;
    }

    const value = newProps[key];
    if (value === undefined) continue;

    if (key === 'animate') {
      applyAnimate(node, value);
      continue;
    }

    if (isEventProp(key)) {
      applyCreateEvent(node, key, value);
      continue;
    }

    if (componentMapping && key in componentMapping) {
      const mapping = componentMapping[key];
      if (typeof mapping === 'function') {
        mapping(node, value);
      } else {
        node[mapping] = value;
      }
      continue;
    }

    // Direct prop
    node[key] = value;
  }
}

/** Simplified event registration for CREATE — no old handler to remove */
function applyCreateEvent(node: any, propName: string, handler: Function): void {
  const eventName = toEventName(propName);
  const handlerMap = getEventHandlerMap(node);
  node.on(eventName, handler as (...args: any[]) => void);
  handlerMap.set(propName, handler);
}

export function removeProps(node: any, oldProps: Record<string, any>): void {
  applyProps(node, oldProps, {});
}