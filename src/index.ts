import './components/view';
import './components/label';
import './components/button';
import './components/sprite';
import './components/scroll-view';
import './components/layout';
import './components/toggle';
import './components/slider';
import './components/progress-bar';
import './components/edit-box';
import './components/rich-text';
import './components/page-view';
import './components/mask';
import './components/graphics';
import './components/safe-area';
import './components/widget';
import './components/particle2d';

export { render } from './core/reconciler';
export { scheduleUpdate, reconcileChildren, commitWork } from './core/reconciler';

export { createSignal, createEffect, createMemo, batch, useState, createStore, signal, isSignalBinding } from './core/state';
export { getCurrentComponent, setCurrentComponent } from './core/state';
export type { Component, SignalBinding } from './core/state';

export { createHostNode, registerComponent, getComponentFactory, ComponentRegistry } from './core/create-element';
export type { ComponentFactory } from './core/create-element';

export { createVNode, createFiber, flattenChildren } from './core/vnode';
export type { VNode, FiberNode, EffectTag, ComponentType } from './core/vnode';

export { jsx, jsxs, jsxDEV, jsxFragment, Fragment, createElement, isValidElement } from './core/jsx-runtime';
export type { VNode as JSXVNode } from './core/jsx-runtime';

export const View = 'View' as const;
export const Label = 'Label' as const;
export const Button = 'Button' as const;
export const Sprite = 'Sprite' as const;
export const ScrollView = 'ScrollView' as const;
export const Layout = 'Layout' as const;
export const VBox = 'VBox' as const;
export const HBox = 'HBox' as const;
export const Toggle = 'Toggle' as const;
export const Slider = 'Slider' as const;
export const ProgressBar = 'ProgressBar' as const;
export const EditBox = 'EditBox' as const;
export const RichText = 'RichText' as const;
export const PageView = 'PageView' as const;
export const Mask = 'Mask' as const;
export const Graphics = 'Graphics' as const;
export const SafeArea = 'SafeArea' as const;
export const Widget = 'Widget' as const;
export const Particle2D = 'Particle2D' as const;

export { loadImage, loadFont, loadPlist, useResource, clearCache, resourceLoader } from './core/resource-loader';
export { ResourceLoader } from './core/resource-loader';

export { createTheme, useTheme, getTheme, lightTheme, darkTheme } from './theme/theme';
export type { Theme } from './types/theme';

export { errorBoundary, isErrorBoundary, getErrorLog, clearErrorLog, logError, renderFallback, ERROR_BOUNDARY_SYMBOL } from './core/error-boundary';
export type { ErrorInfo, ErrorBoundaryFn } from './core/error-boundary';

export { Suspense, shimmer, placeholder } from './core/suspense';
export type { SuspenseProps, PlaceholderProps } from './core/suspense';

export { applyAnimate, stopAnimate } from './animation/tween';
export type { AnimateProps, AnimateValue, EasingName } from './animation/tween';

export { initDevTools, refreshDevTools, destroyDevTools } from './devtools/devtools';

export type {
  CommonProps,
  LayoutProps,
  ClickEvent,
  ClickHandler,
  ChangeEvent,
  ChangeHandler,
  InputEvent,
  InputHandler,
  TouchEvent,
  TouchHandler,
} from './types/index';

export type {
  Color,
  FontSize,
  Alignment,
  Overflow,
  Visibility,
  StyleProps,
} from './types/index';

export type { ThemeColors, ThemeFonts, ThemeSpacing, Theme as ThemeType } from './types/index';

export type { ImageSource, FontSource, LoadingState, ResourceState } from './types/index';

export type { RichTextProps } from './components/rich-text';

export type { ShapeType, RectShape, CircleShape, LineShape, Shape } from './components/graphics';

export { memo, isMemoizedComponent } from './core/memo';
export type { MemoizedComponent } from './core/memo';

export { NodePool, nodePool } from './core/node-pool';

export { FiberPool, fiberPool } from './core/fiber-pool';

export { jsxTemplate, jsxsTemplate, clearTemplates, isTemplateVNode, getTemplateCacheSize } from './core/jsx-template';