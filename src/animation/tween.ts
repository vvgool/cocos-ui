/**
 * Tween Animation System — Declarative animation via cc.Tween
 *
 * Provides a declarative `animate` prop that can be used on any component:
 *   <View animate={{ x: 100, duration: 0.5, easing: 'sineOut' }} />
 *
 * Supports:
 * - Position: x, y
 * - Scale: scaleX, scaleY, scale
 * - Rotation: rotation
 * - Opacity: opacity
 * - Color: color
 * - Easing functions: linear, sineIn, sineOut, sineInOut, quadIn, quadOut,
 *   elasticOut, backOut, bounceOut
 * - Sequential chains: animate={[{ x: 100 }, { y: 200 }]}
 * - Callbacks: onAnimationStart, onAnimationEnd
 *
 * Cocos4 types are intentionally typed as `any` because `cocos-creator` is a
 * peer dependency and not available at compile time.
 */
export type EasingName =
  | 'linear'
  | 'sineIn'
  | 'sineOut'
  | 'sineInOut'
  | 'quadIn'
  | 'quadOut'
  | 'elasticOut'
  | 'backOut'
  | 'bounceOut';
export interface AnimateProps {
  x?: number;
  y?: number;
  scaleX?: number;
  scaleY?: number;
  scale?: number;
  rotation?: number;
  opacity?: number;
  color?: string | any;
  duration?: number;
  easing?: EasingName;
  relative?: boolean;
  onAnimationStart?: () => void;
  onAnimationEnd?: () => void;
}
export type AnimateValue = AnimateProps | AnimateProps[];
const easingMap: Record<EasingName, string> = {
  linear: 'linear',
  sineIn: 'sineIn',
  sineOut: 'sineOut',
  sineInOut: 'sineInOut',
  quadIn: 'quadIn',
  quadOut: 'quadOut',
  elasticOut: 'elasticOut',
  backOut: 'backOut',
  bounceOut: 'bounceOut',
};
function resolveEasing(easing: EasingName | undefined): any {
  if (!easing || easing === 'linear') {
    return undefined;
  }
  const name = easingMap[easing];
  if (!name) {
    return undefined;
  }
  if (typeof cc !== 'undefined' && cc.Tween && cc.Tween.easing) {
    const fn = cc.Tween.easing[name];
    if (fn) {
      return fn;
    }
  }
  return name;
}
function buildTweenTarget(
  node: any,
  animate: AnimateProps,
): { target: Record<string, any>; needsOpacity: boolean } {
  const target: Record<string, any> = {};
  let needsOpacity = false;
  if (animate.x !== undefined || animate.y !== undefined) {
    const currentPos = node.position;
    const x = animate.x !== undefined ? animate.x : currentPos.x;
    const y = animate.y !== undefined ? animate.y : currentPos.y;
    target.position = new cc.Vec3(x, y, currentPos.z ?? 0);
  }
  if (animate.scale !== undefined) {
    target.scale = new cc.Vec3(animate.scale, animate.scale, 1);
  } else if (animate.scaleX !== undefined || animate.scaleY !== undefined) {
    const currentScale = node.scale;
    const sx = animate.scaleX !== undefined ? animate.scaleX : currentScale.x;
    const sy = animate.scaleY !== undefined ? animate.scaleY : currentScale.y;
    target.scale = new cc.Vec3(sx, sy, 1);
  }
  if (animate.rotation !== undefined) {
    target.eulerAngles = new cc.Vec3(animate.rotation, 0, 0);
  }
  if (animate.opacity !== undefined) {
    needsOpacity = true;
    target.opacity = animate.opacity;
  }
  if (animate.color !== undefined) {
    if (typeof animate.color === 'string') {
      target.color = parseColor(animate.color);
    } else {
      target.color = animate.color;
    }
  }
  return { target, needsOpacity };
}
function parseColor(value: any): any {
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
const activeTweens: WeakMap<any, any[]> = new WeakMap();
function stopActiveTweens(node: any): void {
  const tweens = activeTweens.get(node);
  if (tweens) {
    for (const t of tweens) {
      if (t && typeof t.stop === 'function') {
        t.stop();
      }
    }
    activeTweens.delete(node);
  }
}
function trackTween(node: any, tween: any): void {
  let tweens = activeTweens.get(node);
  if (!tweens) {
    tweens = [];
    activeTweens.set(node, tweens);
  }
  tweens.push(tween);
}
export function applyAnimate(node: any, value: AnimateValue): void {
  stopActiveTweens(node);
  if (!value) {
    return;
  }
  const steps: AnimateProps[] = Array.isArray(value) ? value : [value];
  if (steps.length === 0) {
    return;
  }
  const needsOpacity = steps.some((s) => s.opacity !== undefined);
  if (needsOpacity) {
    const existingOpacity = node.getComponent(cc.UIOpacity);
    if (!existingOpacity) {
      node.addComponent(cc.UIOpacity);
    }
  }
  let tween = cc.tween(node);
  const trackedTweens: any[] = [];
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const duration = step.duration ?? 0.3;
    const easing = resolveEasing(step.easing);
    const isRelative = step.relative ?? false;
    if (step.onAnimationStart) {
      tween = tween.call(() => {
        step.onAnimationStart!();
      });
    }
    const { target } = buildTweenTarget(node, step);
    if (Object.keys(target).length > 0) {
      const tweenOpts: Record<string, any> = {};
      if (easing) {
        tweenOpts.easing = easing;
      }
      if (isRelative) {
        tween = tween.by(duration, target, tweenOpts);
      } else {
        tween = tween.to(duration, target, tweenOpts);
      }
    }
    if (step.onAnimationEnd) {
      tween = tween.call(() => {
        step.onAnimationEnd!();
      });
    }
  }
  const startedTween = tween.start();
  if (startedTween) {
    trackedTweens.push(startedTween);
  }
  trackTween(node, tween);
  for (const t of trackedTweens) {
    trackTween(node, t);
  }
}
export function stopAnimate(node: any): void {
  stopActiveTweens(node);
}