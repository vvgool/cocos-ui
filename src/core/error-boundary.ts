/**
 * ErrorBoundary — Component-Level Fault Tolerance
 *
 * Catches render exceptions from wrapped components and displays
 * a fallback VNode instead, keeping the rest of the tree intact.
 *
 * Design:
 * - `errorBoundary(WrappedComponent, fallback)` returns a new component
 * - The wrapper calls WrappedComponent inside try/catch
 * - On error: logs to console + global error log, renders fallback
 * - Fallback can be a static VNode or a function `(error, errorInfo) => VNode`
 * - No React-like lifecycle methods — purely functional
 *
 * The reconciler also wraps component calls in try/catch so that
 * errors from deep children propagate up to the nearest error boundary.
 */

import type { VNode, ComponentType } from './vnode';

// =============================================================================
// Error Info
// =============================================================================

/** Captured error information for DevTools integration */
export interface ErrorInfo {
  error: Error;
  componentStack?: string;
  timestamp: number;
}

// =============================================================================
// Global Error Log (DevTools hook)
// =============================================================================

/** Internal error log — read via `getErrorLog()` */
const errorLog: ErrorInfo[] = [];

/** Read the global error log (DevTools integration point) */
export function getErrorLog(): ReadonlyArray<ErrorInfo> {
  return errorLog;
}

/** Clear the global error log */
export function clearErrorLog(): void {
  errorLog.length = 0;
}

// =============================================================================
// Error Boundary Marker
// =============================================================================

/**
 * Symbol used to mark a component function as an error boundary.
 * Stored as a property on the wrapper function so the reconciler
 * can detect it without instanceof checks.
 */
export const ERROR_BOUNDARY_SYMBOL = Symbol.for('cocos.errorBoundary');

/** Type for error boundary component functions */
export interface ErrorBoundaryFn {
  (props: Record<string, any>): VNode;
  [ERROR_BOUNDARY_SYMBOL]: {
    wrappedComponent: ComponentType;
    fallback: VNode | ((error: Error, errorInfo: ErrorInfo) => VNode);
  };
}

/** Check if a component type is an error boundary */
export function isErrorBoundary(type: Function): type is ErrorBoundaryFn {
  return typeof type === 'function' && ERROR_BOUNDARY_SYMBOL in type;
}

// =============================================================================
// Log Helper
// =============================================================================

/** Log an error to the global error log and console */
export function logError(error: Error, componentStack?: string): void {
  const errorInfo: ErrorInfo = {
    error,
    componentStack,
    timestamp: Date.now(),
  };
  errorLog.push(errorInfo);
  console.error(
    '[CocosUI ErrorBoundary]',
    error,
    componentStack ? `\n${componentStack}` : '',
  );
}

// =============================================================================
// Render Fallback
// =============================================================================

/** Render the fallback for an error boundary (VNode or function) */
export function renderFallback(boundaryType: ErrorBoundaryFn, error: Error): VNode {
  const { fallback } = boundaryType[ERROR_BOUNDARY_SYMBOL];
  const errorInfo: ErrorInfo = {
    error,
    timestamp: Date.now(),
  };

  if (typeof fallback === 'function') {
    return (fallback as (error: Error, info: ErrorInfo) => VNode)(error, errorInfo);
  }
  return fallback;
}

// =============================================================================
// errorBoundary HOC
// =============================================================================

/**
 * Create an error boundary that wraps a component.
 *
 * When the wrapped component throws during render, the fallback is rendered
 * instead. The error is logged to console and the global error log.
 *
 * @param wrappedComponent - The component to wrap
 * @param fallback - A VNode or `(error, errorInfo) => VNode` function
 * @returns An error boundary component function
 *
 * @example
 * ```ts
 * const SafeList = errorBoundary(List, <View><Label>Error loading list</Label></View>)
 * const SafeList2 = errorBoundary(List, (err, info) => <View><Label>{err.message}</Label></View>)
 * ```
 */
export function errorBoundary(
  wrappedComponent: ComponentType,
  fallback: VNode | ((error: Error, errorInfo: ErrorInfo) => VNode),
): ErrorBoundaryFn {
  const boundaryFn: any = (props: Record<string, any>): VNode => {
    try {
      return wrappedComponent(props);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const errorInfo: ErrorInfo = {
        error,
        timestamp: Date.now(),
      };
      errorLog.push(errorInfo);
      console.error('[CocosUI ErrorBoundary] Caught render error:', error);

      if (typeof fallback === 'function') {
        return (fallback as (error: Error, info: ErrorInfo) => VNode)(error, errorInfo);
      }
      return fallback;
    }
  };

  boundaryFn[ERROR_BOUNDARY_SYMBOL] = {
    wrappedComponent,
    fallback,
  };

  return boundaryFn;
}