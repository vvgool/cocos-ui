/**
 * ErrorBoundary Unit Tests
 * 
 * Tests for error boundary HOC and error logging functionality.
 * Pure VNode tests - no Cocos4 mock required.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { errorBoundary, isErrorBoundary, getErrorLog, clearErrorLog, logError, ERROR_BOUNDARY_SYMBOL } from '../error-boundary';
import { createElement } from '../jsx-runtime';

// Simple test components
function GoodComponent(props: Record<string, any>) {
  return createElement('View', { className: props.className || 'good' }, 'Good Content') as any;
}

const BadComponent = ((props: Record<string, any>) => {
  throw new Error('Component crashed!');
}) as any;

describe('errorBoundary()', () => {
  beforeEach(() => {
    clearErrorLog();
  });

  it('should create a wrapper component with error boundary symbol', () => {
    const fallback = createElement('View', null, 'Fallback');
    const Boundary = errorBoundary(GoodComponent, fallback);

    expect(Boundary).toBeDefined();
    expect(typeof Boundary).toBe('function');
    expect(ERROR_BOUNDARY_SYMBOL in Boundary).toBe(true);
  });

  it('should render wrapped component successfully when no error occurs', () => {
    const fallback = createElement('View', null, 'Fallback');
    const Boundary = errorBoundary(GoodComponent, fallback);

    const result = Boundary({ className: 'test' });

    expect(result).toBeDefined();
    expect(result.type).toBe('View');
    expect(result.props.className).toBe('test');
    expect(result.props.children).toEqual(['Good Content']);
  });

  it('should render fallback when wrapped component throws', () => {
    const fallback = createElement('View', { className: 'error-fallback' }, 'Something went wrong');
    const Boundary = errorBoundary(BadComponent, fallback);

    const result = Boundary({});

    expect(result).toBeDefined();
    expect(result.type).toBe('View');
    expect(result.props.className).toBe('error-fallback');
    expect(result.props.children).toEqual(['Something went wrong']);
  });

  it('should render fallback from function when wrapped component throws', () => {
    const fallbackFn = (error: Error) => 
      createElement('View', { className: 'dynamic-fallback' }, `Error: ${error.message}`);
    const Boundary = errorBoundary(BadComponent, fallbackFn);

    const result = Boundary({});

    expect(result).toBeDefined();
    expect(result.type).toBe('View');
    expect(result.props.className).toBe('dynamic-fallback');
    expect(result.props.children).toEqual(['Error: Component crashed!']);
  });

  it('should log error to global error log when wrapped component throws', () => {
    const fallback = createElement('View', null, 'Fallback');
    const Boundary = errorBoundary(BadComponent, fallback);

    Boundary({});

    const errorLog = getErrorLog();
    expect(errorLog).toHaveLength(1);
    expect(errorLog[0].error).toBeInstanceOf(Error);
    expect(errorLog[0].error.message).toBe('Component crashed!');
    expect(errorLog[0].timestamp).toBeDefined();
    expect(Date.now() - errorLog[0].timestamp).toBeLessThan(1000);
  });
});

describe('isErrorBoundary()', () => {
  it('should return true for error boundary components', () => {
    const fallback = createElement('View', null, 'Fallback');
    const Boundary = errorBoundary(GoodComponent, fallback);

    expect(isErrorBoundary(Boundary)).toBe(true);
  });

  it('should return false for regular components', () => {
    expect(isErrorBoundary(GoodComponent)).toBe(false);
    expect(isErrorBoundary(BadComponent)).toBe(false);
  });

  it('should return false for non-function types', () => {
    expect(isErrorBoundary('View' as any)).toBe(false);
    expect(isErrorBoundary(null as any)).toBe(false);
  });
});

describe('getErrorLog() and clearErrorLog()', () => {
  beforeEach(() => {
    clearErrorLog();
  });

  it('should return empty array after clearErrorLog()', () => {
    logError(new Error('Test error'));
    expect(getErrorLog()).toHaveLength(1);

    clearErrorLog();
    expect(getErrorLog()).toHaveLength(0);
  });

  it('should return readonly array of error info', () => {
    logError(new Error('Error 1'));
    logError(new Error('Error 2'));

    const log = getErrorLog();
    expect(log).toHaveLength(2);
    expect(log[0].error.message).toBe('Error 1');
    expect(log[1].error.message).toBe('Error 2');
  });

  it('should include timestamp in error log entries', () => {
    const before = Date.now();
    logError(new Error('Test'));
    const after = Date.now();

    const log = getErrorLog();
    expect(log[0].timestamp).toBeGreaterThanOrEqual(before);
    expect(log[0].timestamp).toBeLessThanOrEqual(after);
  });
});

describe('logError()', () => {
  beforeEach(() => {
    clearErrorLog();
  });

  it('should log error with component stack', () => {
    const testError = new Error('Stack test');
    logError(testError, 'at TestComponent');

    const log = getErrorLog();
    expect(log).toHaveLength(1);
    expect(log[0].error).toBe(testError);
    expect(log[0].componentStack).toBe('at TestComponent');
  });

  it('should handle errors without component stack', () => {
    logError(new Error('No stack'));

    const log = getErrorLog();
    expect(log).toHaveLength(1);
    expect(log[0].componentStack).toBeUndefined();
  });
});
