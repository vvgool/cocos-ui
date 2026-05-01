/**
 * Unit Tests for Signal/State System
 * Tests for: createSignal, createEffect, createMemo, batch, useState, createStore
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createSignal,
  createEffect,
  createMemo,
  batch,
  useState,
  createStore,
  signal,
  isSignalBinding,
  getCurrentComponent,
  setCurrentComponent,
  resetComponentHookIndex,
  type Component,
} from '../state';

describe('createSignal', () => {
  it('should create signal with initial value', () => {
    const [count, setCount] = createSignal(0);
    expect(count()).toBe(0);
  });

  it('should update value with setter', () => {
    const [count, setCount] = createSignal(0);
    setCount(5);
    expect(count()).toBe(5);
  });

  it('should support functional updates', () => {
    const [count, setCount] = createSignal(0);
    setCount((prev) => prev + 1);
    expect(count()).toBe(1);
    setCount((prev) => prev + 1);
    expect(count()).toBe(2);
  });

  it('should not notify when value unchanged (=== comparison)', () => {
    const [count, setCount] = createSignal(5);
    let notifyCount = 0;
    createEffect(() => {
      count();
      notifyCount++;
    });
    expect(notifyCount).toBe(1);
    setCount(5); // Same value
    expect(notifyCount).toBe(1); // No re-run
  });

  it('should allow multiple independent signals', () => {
    const [a, setA] = createSignal(1);
    const [b, setB] = createSignal(10);
    setA(100);
    setB(200);
    expect(a()).toBe(100);
    expect(b()).toBe(200);
  });
});

describe('createEffect', () => {
  it('should run immediately on creation', () => {
    let runCount = 0;
    createEffect(() => {
      runCount++;
    });
    expect(runCount).toBe(1);
  });

  it('should re-run when tracked signal changes', () => {
    const [count, setCount] = createSignal(0);
    let runCount = 0;
    createEffect(() => {
      count();
      runCount++;
    });
    expect(runCount).toBe(1);
    setCount(1);
    expect(runCount).toBe(2);
  });

  it('should track multiple signal dependencies', () => {
    const [a, setA] = createSignal(1);
    const [b, setB] = createSignal(2);
    let runCount = 0;
    createEffect(() => {
      a();
      b();
      runCount++;
    });
    expect(runCount).toBe(1);
    setA(10);
    expect(runCount).toBe(2);
    setB(20);
    expect(runCount).toBe(3);
  });

  it('should not re-run when untracked signal changes', () => {
    const [a, setA] = createSignal(1);
    const [b, setB] = createSignal(2);
    let runCount = 0;
    createEffect(() => {
      a(); // Only track 'a'
      runCount++;
    });
    expect(runCount).toBe(1);
    setB(20); // Change 'b' which is not tracked
    expect(runCount).toBe(1); // Should not re-run
  });

  it('should unsubscribe and stop notifications', () => {
    const [count, setCount] = createSignal(0);
    let runCount = 0;
    const unsub = createEffect(() => {
      count();
      runCount++;
    });
    expect(runCount).toBe(1);
    unsub();
    setCount(1);
    expect(runCount).toBe(1); // No re-run after unsubscribe
  });

  it('should handle nested effects correctly', () => {
    const [x, setX] = createSignal(1);
    const [y, setY] = createSignal(10);
    let outerRuns = 0;
    let innerRuns = 0;

    createEffect(() => {
      outerRuns++;
      const xVal = x();
      createEffect(() => {
        innerRuns++;
        const yVal = y();
      });
    });

    expect(outerRuns).toBe(1);
    expect(innerRuns).toBe(1);

    setY(20); // Only inner effect tracks y
    expect(innerRuns).toBe(2);
    expect(outerRuns).toBe(1); // Outer does NOT re-run

    setX(2); // Outer tracks x
    expect(outerRuns).toBe(2);
    expect(innerRuns).toBe(3); // Inner re-runs because it's recreated
  });
});

describe('batch', () => {
  it('should defer effect execution until batch completes', () => {
    const [a, setA] = createSignal(0);
    const [b, setB] = createSignal(0);
    let runCount = 0;

    createEffect(() => {
      a();
      b();
      runCount++;
    });

    expect(runCount).toBe(1);

    batch(() => {
      setA(1);
      setB(1);
    });

    expect(runCount).toBe(2); // Only ONE re-run after batch
  });

  it('should support nested batches', () => {
    const [count, setCount] = createSignal(0);
    let runCount = 0;

    createEffect(() => {
      count();
      runCount++;
    });

    expect(runCount).toBe(1);

    batch(() => {
      batch(() => {
        setCount(1);
      });
    });

    expect(runCount).toBe(2); // Single re-run after outermost batch
  });

  it('should handle multiple effects in batch', () => {
    const [a, setA] = createSignal(0);
    const [b, setB] = createSignal(0);
    let aRuns = 0;
    let bRuns = 0;

    createEffect(() => {
      a();
      aRuns++;
    });

    createEffect(() => {
      b();
      bRuns++;
    });

    expect(aRuns).toBe(1);
    expect(bRuns).toBe(1);

    batch(() => {
      setA(1);
      setB(1);
    });

    expect(aRuns).toBe(2);
    expect(bRuns).toBe(2);
  });
});

describe('createMemo', () => {
  it('should compute value on first read', () => {
    const [num, setNum] = createSignal(5);
    let computeCount = 0;
    const doubled = createMemo(() => {
      computeCount++;
      return num() * 2;
    });

    expect(doubled()).toBe(10);
    expect(computeCount).toBe(1);
  });

  it('should cache result between reads', () => {
    const [num, setNum] = createSignal(5);
    let computeCount = 0;
    const doubled = createMemo(() => {
      computeCount++;
      return num() * 2;
    });

    doubled();
    doubled();
    doubled();
    expect(computeCount).toBe(1); // Only computed once
  });

  it('should recompute when dependency changes', () => {
    const [num, setNum] = createSignal(5);
    let computeCount = 0;
    const doubled = createMemo(() => {
      computeCount++;
      return num() * 2;
    });

    expect(doubled()).toBe(10);
    expect(computeCount).toBe(1);

    setNum(10);
    expect(doubled()).toBe(20);
    expect(computeCount).toBe(2); // Recomputed after dependency change
  });

  it('should mark dirty and notify subscribers', () => {
    const [base, setBase] = createSignal(3);
    let memoComputeCount = 0;
    let effectRunCount = 0;

    const tripled = createMemo(() => {
      memoComputeCount++;
      return base() * 3;
    });

    createEffect(() => {
      tripled();
      effectRunCount++;
    });

    expect(memoComputeCount).toBe(1);
    expect(effectRunCount).toBe(1);

    setBase(4);
    expect(effectRunCount).toBe(2); // Effect re-runs
    expect(memoComputeCount).toBe(2); // Memo recomputes
  });

  it('should track multiple dependencies', () => {
    const [a, setA] = createSignal(2);
    const [b, setB] = createSignal(3);
    let computeCount = 0;

    const sum = createMemo(() => {
      computeCount++;
      return a() + b();
    });

    expect(sum()).toBe(5);
    expect(computeCount).toBe(1);

    setA(10);
    expect(sum()).toBe(13);
    expect(computeCount).toBe(2);

    setB(20);
    expect(sum()).toBe(30);
    expect(computeCount).toBe(3);
  });
});

describe('useState', () => {
  beforeEach(() => {
    setCurrentComponent(null);
  });

  it('should create state with initial value', () => {
    const comp: Component = { update: null };
    setCurrentComponent(comp);
    resetComponentHookIndex(comp);

    const [state, setState] = useState(100);
    expect(state()).toBe(100);
  });

  it('should update state with setter', () => {
    const comp: Component = { update: null };
    setCurrentComponent(comp);
    resetComponentHookIndex(comp);

    const [state, setState] = useState(100);
    setState(200);
    expect(state()).toBe(200);
  });

  it('should support functional updates', () => {
    const comp: Component = { update: null };
    setCurrentComponent(comp);
    resetComponentHookIndex(comp);

    const [state, setState] = useState(100);
    setState((prev) => prev + 50);
    expect(state()).toBe(150);
    setState((prev) => prev * 2);
    expect(state()).toBe(300);
  });

  it('should persist state across re-renders', () => {
    const comp: Component = { update: null };
    setCurrentComponent(comp);
    resetComponentHookIndex(comp);

    // First render
    const [state1, setState1] = useState(1);
    setState1(2);

    // Simulate re-render
    resetComponentHookIndex(comp);
    const [state2, setState2] = useState(999); // Should be ignored

    expect(state2()).toBe(2); // Should still be 2 from first render
  });

  it('should call component.update on setState', () => {
    let updateCalled = 0;
    const comp: Component = {
      update: () => {
        updateCalled++;
      },
    };
    setCurrentComponent(comp);
    resetComponentHookIndex(comp);

    const [state, setState] = useState(0);
    expect(updateCalled).toBe(0);

    setState(1);
    expect(updateCalled).toBe(1);

    setState(2);
    expect(updateCalled).toBe(2);
  });

  it('should work without component context (fallback to plain signal)', () => {
    setCurrentComponent(null);
    const [state, setState] = useState(0);
    expect(state()).toBe(0);
    setState(5);
    expect(state()).toBe(5);
  });

  it('should handle multiple useState calls in same component', () => {
    const comp: Component = { update: null };
    setCurrentComponent(comp);
    resetComponentHookIndex(comp);

    const [count, setCount] = useState(0);
    const [name, setName] = useState('Alice');

    setCount(10);
    setName('Bob');

    expect(count()).toBe(10);
    expect(name()).toBe('Bob');
  });
});

describe('createStore', () => {
  it('should create store with initial state', () => {
    const store = createStore({ count: 0, name: 'test' });
    expect(store.get().count).toBe(0);
    expect(store.get().name).toBe('test');
  });

  it('should update state with set', () => {
    const store = createStore({ count: 0, name: 'test' });
    store.set({ count: 5 });
    expect(store.get().count).toBe(5);
    expect(store.get().name).toBe('test'); // Unchanged
  });

  it('should merge partial updates', () => {
    const store = createStore({ a: 1, b: 2, c: 3 });
    store.set({ b: 20 });
    const state = store.get();
    expect(state.a).toBe(1);
    expect(state.b).toBe(20);
    expect(state.c).toBe(3);
  });

  it('should notify subscribers on set', () => {
    const store = createStore({ count: 0 });
    let notifyCount = 0;
    let lastState: any;

    const unsub = store.subscribe((state) => {
      notifyCount++;
      lastState = state;
    });

    store.set({ count: 1 });
    expect(notifyCount).toBe(1);
    expect(lastState.count).toBe(1);

    store.set({ count: 2 });
    expect(notifyCount).toBe(2);
  });

  it('should unsubscribe correctly', () => {
    const store = createStore({ count: 0 });
    let notifyCount = 0;

    const unsub = store.subscribe(() => {
      notifyCount++;
    });

    store.set({ count: 1 });
    expect(notifyCount).toBe(1);

    unsub();
    store.set({ count: 2 });
    expect(notifyCount).toBe(1); // No more notifications
  });

  it('should track in effects', () => {
    const store = createStore({ count: 0 });
    let effectRuns = 0;

    createEffect(() => {
      store.get();
      effectRuns++;
    });

    expect(effectRuns).toBe(1);

    store.set({ count: 1 });
    expect(effectRuns).toBe(2);
  });
});

describe('signal binding', () => {
  it('should create SignalBinding object', () => {
    const [count] = createSignal(0);
    const binding = signal(count);
    expect(binding._isSignalBinding).toBe(true);
    expect(binding.getter).toBe(count);
  });

  it('should cache SignalBinding for same getter', () => {
    const [count] = createSignal(0);
    const binding1 = signal(count);
    const binding2 = signal(count);
    expect(binding1).toBe(binding2); // Same object
  });

  it('should identify SignalBinding with type guard', () => {
    const [count] = createSignal(0);
    const binding = signal(count);
    expect(isSignalBinding(binding)).toBe(true);
    expect(isSignalBinding(count)).toBeFalsy();
    expect(isSignalBinding({})).toBeFalsy();
  });
});

describe('signal composition and chains', () => {
  it('should handle dependency chains (memo depending on memo)', () => {
    const [num, setNum] = createSignal(2);
    let doubledComputes = 0;
    let quadrupledComputes = 0;

    const doubled = createMemo(() => {
      doubledComputes++;
      return num() * 2;
    });

    const quadrupled = createMemo(() => {
      quadrupledComputes++;
      return doubled() * 2;
    });

    expect(quadrupled()).toBe(8);
    expect(doubledComputes).toBe(1);
    expect(quadrupledComputes).toBe(1);

    setNum(3);
    expect(quadrupled()).toBe(12);
    expect(doubledComputes).toBe(2);
    expect(quadrupledComputes).toBe(2);
  });

  it('should handle effect reading multiple memos', () => {
    const [a, setA] = createSignal(2);
    const [b, setB] = createSignal(3);
    let effectRuns = 0;

    const doubledA = createMemo(() => a() * 2);
    const doubledB = createMemo(() => b() * 2);

    createEffect(() => {
      doubledA();
      doubledB();
      effectRuns++;
    });

    expect(effectRuns).toBe(1);

    setA(10);
    expect(effectRuns).toBe(2);

    setB(20);
    expect(effectRuns).toBe(3);
  });

  it('should handle complex dependency graph', () => {
    const [x, setX] = createSignal(1);
    const [y, setY] = createSignal(2);

    let sumComputes = 0;
    let productComputes = 0;
    let resultComputes = 0;

    const sum = createMemo(() => {
      sumComputes++;
      return x() + y();
    });

    const product = createMemo(() => {
      productComputes++;
      return x() * y();
    });

    const result = createMemo(() => {
      resultComputes++;
      return sum() + product();
    });

    expect(result()).toBe(5); // (1+2) + (1*2) = 3 + 2 = 5
    expect(sumComputes).toBe(1);
    expect(productComputes).toBe(1);
    expect(resultComputes).toBe(1);

    setX(3);
    expect(result()).toBe(11); // (3+2) + (3*2) = 5 + 6 = 11
    expect(sumComputes).toBe(2);
    expect(productComputes).toBe(2);
    expect(resultComputes).toBe(2);
  });
});

describe('getCurrentComponent / setCurrentComponent', () => {
  beforeEach(() => {
    setCurrentComponent(null);
  });

  it('should track current component', () => {
    expect(getCurrentComponent()).toBe(null);

    const comp: Component = { update: null };
    setCurrentComponent(comp);
    expect(getCurrentComponent()).toBe(comp);

    setCurrentComponent(null);
    expect(getCurrentComponent()).toBe(null);
  });
});
