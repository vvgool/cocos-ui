/**
 * Reactive State Management — Signal / useState System
 *
 * Lightweight reactive primitives inspired by SolidJS and Preact Signals.
 * Pure TypeScript — no runtime dependencies.
 */

// =============================================================================
// Internal Types
// =============================================================================

/**
 * A computation that tracks signal dependencies and re-executes when they change.
 * Used internally by createEffect and createMemo.
 */
interface Computation {
  /** Execute the computation (re-run the tracked function) */
  execute(): void;
  /** Set of subscriber-sets this computation belongs to (for cleanup) */
  dependencies: Set<Set<Computation>>;
}

// =============================================================================
// Global Reactive Context
// =============================================================================

/** Stack of currently executing computations (effects / memos) */
const effectStack: Computation[] = [];

/** The currently executing computation (top of the stack) */
let currentEffect: Computation | null = null;

/** Batch nesting depth — while > 0, effect execution is deferred */
let batchDepth = 0;

/** Effects queued during a batch, deduplicated, flushed when outermost batch ends */
const pendingEffects: Set<Computation> = new Set();

// =============================================================================
// Helpers
// =============================================================================

/**
 * Remove a computation from all its dependency subscriber-sets.
 * Called before re-execution so dependencies are re-tracked fresh.
 */
function cleanup(computation: Computation): void {
  for (const dep of computation.dependencies) {
    dep.delete(computation);
  }
  computation.dependencies.clear();
}

/**
 * Notify all subscribers of a signal change.
 * Inside a batch, subscribers are queued; outside, they execute immediately.
 * A snapshot of the set is iterated to allow safe mutation during iteration.
 */
function notifySubscribers(subscribers: Set<Computation>): void {
  const snapshot = [...subscribers];
  for (const subscriber of snapshot) {
    if (batchDepth > 0) {
      pendingEffects.add(subscriber);
    } else {
      subscriber.execute();
    }
  }
}

// =============================================================================
// createSignal
// =============================================================================

/**
 * Create a reactive signal. Returns a [getter, setter] pair.
 *
 * - `getter()` — reads the current value AND tracks this read for effects
 * - `setter(newValue)` — updates the value AND notifies all subscribers
 *
 * Supports functional updates: `setCount(prev => prev + 1)`
 * Only notifies if value actually changed (using `!==` comparison).
 */
export function createSignal<T>(
  initialValue: T,
): [() => T, (value: T | ((prev: T) => T)) => void] {
  let value = initialValue;
  const subscribers = new Set<Computation>();

  const getter = (): T => {
    if (currentEffect !== null) {
      subscribers.add(currentEffect);
      currentEffect.dependencies.add(subscribers);
    }
    return value;
  };

  const setter = (newValue: T | ((prev: T) => T)): void => {
    const resolvedValue: T =
      typeof newValue === 'function'
        ? (newValue as (prev: T) => T)(value)
        : newValue;

    if (resolvedValue !== value) {
      value = resolvedValue;
      notifySubscribers(subscribers);
    }
  };

  return [getter, setter];
}

// =============================================================================
// createEffect
// =============================================================================

/**
 * Create an effect that automatically tracks signal dependencies.
 * Immediately executes `fn` once to discover dependencies.
 * Re-executes whenever any tracked signal changes.
 *
 * Before each re-execution, old subscriptions are cleared and re-tracked.
 * Returns an unsubscribe function that removes all subscriptions.
 */
export function createEffect(fn: () => void): () => void {
  const computation: Computation = {
    dependencies: new Set(),
    execute() {
      cleanup(computation);
      effectStack.push(computation);
      currentEffect = computation;
      try {
        fn();
      } finally {
        effectStack.pop();
        currentEffect = effectStack[effectStack.length - 1] ?? null;
      }
    },
  };

  computation.execute();

  return () => cleanup(computation);
}

// =============================================================================
// batch
// =============================================================================

/**
 * Batch multiple signal updates — effects only fire once after the batch completes.
 * Nested batches are supported; effects fire when the outermost batch completes.
 */
export function batch(fn: () => void): void {
  batchDepth++;
  try {
    fn();
  } finally {
    batchDepth--;
    if (batchDepth === 0) {
      const effects = [...pendingEffects];
      pendingEffects.clear();
      for (const effect of effects) {
        effect.execute();
      }
    }
  }
}

// =============================================================================
// createMemo
// =============================================================================

/**
 * Create a computed / derived signal that auto-tracks dependencies.
 *
 * - Lazily evaluates: only recomputes when dependencies change AND the value is read
 * - Caches the result between dependency changes
 * - Can be tracked by downstream effects / memos
 */
export function createMemo<T>(fn: () => T): () => T {
  let value: T;
  let isDirty = true;
  const subscribers = new Set<Computation>();

  const memoComputation: Computation = {
    dependencies: new Set(),
    execute() {
      isDirty = true;
      notifySubscribers(subscribers);
    },
  };

  const getter = (): T => {
    if (isDirty) {
      cleanup(memoComputation);
      effectStack.push(memoComputation);
      currentEffect = memoComputation;
      try {
        value = fn();
      } finally {
        effectStack.pop();
        currentEffect = effectStack[effectStack.length - 1] ?? null;
      }
      isDirty = false;
    }
    if (currentEffect !== null) {
      subscribers.add(currentEffect);
      currentEffect.dependencies.add(subscribers);
    }
    return value;
  };

  return getter;
}

// =============================================================================
// Signal Binding (P0 — Signal-Driven Direct Property Updates)
// =============================================================================

/**
 * Signal 绑定标记接口。
 * 包装 signal getter，使 reconciler 可以创建直接到 Cocos 节点的订阅。
 */
export interface SignalBinding<T> {
  _isSignalBinding: true;
  /** Signal getter 函数 */
  getter: () => T;
}

/**
 * 包装 signal getter 为 SignalBinding 对象。
 * 在 JSX prop 中使用时，reconciler 会创建直接到 Cocos 节点的更新订阅，
 * 完全跳过组件重渲染和 VNode diff。
 *
 * 缓存策略: signal getter 由 createSignal() 创建一次后永不改变，
 * 因此 SignalBinding 对象也可安全缓存，消除每次组件重渲染时的临时对象分配。
 *
 * @example
 * ```tsx
 * const [count, setCount] = createSignal(0);
 * <Label text={signal(count)} />
 * ```
 */
const _signalBindingCache = new WeakMap<() => unknown, SignalBinding<unknown>>();

export function signal<T>(getter: () => T): SignalBinding<T> {
  let binding = _signalBindingCache.get(getter as () => unknown);
  if (!binding) {
    binding = { _isSignalBinding: true, getter };
    _signalBindingCache.set(getter as () => unknown, binding);
  }
  return binding as SignalBinding<T>;
}

/** 类型守卫：判断值是否为 SignalBinding */
export function isSignalBinding(value: any): value is SignalBinding<any> {
  return value && typeof value === 'object' && value._isSignalBinding === true;
}

// =============================================================================
// useState (Component-Level State)
// =============================================================================

/**
 * Component instance — holds a callback slot for the reconciler to register
 * re-render triggers, and internal hook state for useState persistence.
 */
export interface Component {
  update: (() => void) | null;
  /** @internal hook state array — stores [getter, setter] tuples per useState call */
  _hooks?: any[][];
  /** @internal hook index — reset to 0 before each render by the reconciler */
  _hookIndex?: number;
}

/** Currently rendering component (set by the reconciler before rendering) */
let _currentComponent: Component | null = null;

/** Get the currently rendering component (for reconciler integration) */
export function getCurrentComponent(): Component | null {
  return _currentComponent;
}

/** Set the currently rendering component (for reconciler integration) */
export function setCurrentComponent(comp: Component | null): void {
  _currentComponent = comp;
}

/**
 * Reset the hook index on a component (called by reconciler before each render).
 * This tells useState whether the current call is a first-time create or a re-render reuse.
 */
export function resetComponentHookIndex(comp: Component): void {
  comp._hookIndex = 0;
}

/**
 * Component-level state hook.
 *
 * Creates a signal on first render; reuses the same signal on subsequent renders.
 * The setter also triggers a component re-render via `component.update()`.
 *
 * Hook state is stored on the Component object. The reconciler carries it forward
 * across re-renders by copying `_hooks` from the old component (stored on the fiber)
 * to the new component created in each `performUpdate` call.
 */
export function useState<T>(
  initialValue: T,
): [() => T, (value: T | ((prev: T) => T)) => void] {
  const comp = getCurrentComponent();

  // Outside component context — plain signal, no re-render trigger
  if (!comp) return createSignal(initialValue);

  // Initialize hook storage
  if (!comp._hooks) {
    comp._hooks = [];
  }

  const index = comp._hookIndex ?? 0;
  comp._hookIndex = index + 1;

  // Reuse existing hook (re-render path)
  if (index < comp._hooks.length) {
    return comp._hooks[index] as [() => T, (value: T | ((prev: T) => T)) => void];
  }

  // Create new hook (first render path)
  const [getter, setter] = createSignal(initialValue);

  const wrappedSetter = (value: T | ((prev: T) => T)) => {
    setter(value);
    comp.update?.();
  };

  const hook: [() => T, (value: T | ((prev: T) => T)) => void] = [getter, wrappedSetter];
  comp._hooks.push(hook);
  return hook;
}

// =============================================================================
// createStore (Global State)
// =============================================================================

/**
 * Create a global state store — shared across components.
 *
 * - `get()` — returns current state (tracks in effects)
 * - `set(partial)` — shallow-merges partial into state and notifies subscribers
 * - `subscribe(fn)` — registers a callback invoked on every state change;
 *   returns an unsubscribe function
 */
export function createStore<T extends Record<string, any>>(initialState: T): {
  get: () => T;
  set: (partial: Partial<T>) => void;
  subscribe: (fn: (state: T) => void) => () => void;
} {
  const [getState, setState] = createSignal(initialState);
  const subscribers = new Set<(state: T) => void>();

  return {
    get: getState,

    set: (partial: Partial<T>) => {
      setState((prev) => ({ ...prev, ...partial }));
      const state = getState();
      const snapshot = [...subscribers];
      for (const fn of snapshot) {
        fn(state);
      }
    },

    subscribe: (fn: (state: T) => void) => {
      subscribers.add(fn);
      return () => {
        subscribers.delete(fn);
      };
    },
  };
}

// =============================================================================
// Inline Tests
// =============================================================================

/**
 * Run all inline tests. Execute with:  npx tsx src/core/state.ts
 *
 * @internal
 */
function _runTests(): void {
  const logs: string[] = [];
  const errors: string[] = [];

  function assert(condition: boolean, message: string): void {
    if (!condition) {
      errors.push(`FAIL: ${message}`);
    } else {
      logs.push(`PASS: ${message}`);
    }
  }

  // ----- createSignal -----
  const [count, setCount] = createSignal(0);
  assert(count() === 0, 'createSignal: initial value');

  setCount(1);
  assert(count() === 1, 'createSignal: setter updates value');

  setCount((prev) => prev + 1);
  assert(count() === 2, 'createSignal: functional update');

  setCount(2);
  assert(count() === 2, 'createSignal: same value no-op');

  // ----- createEffect -----
  let effectRuns = 0;
  const [name, setName] = createSignal('Alice');
  const unsub = createEffect(() => {
    effectRuns++;
    name();
  });
  assert(effectRuns === 1, 'createEffect: runs immediately');

  setName('Bob');
  assert(effectRuns === 2, 'createEffect: re-runs on signal change');

  setName('Bob');
  assert(effectRuns === 2, 'createEffect: no re-run when value unchanged');

  unsub();
  setName('Charlie');
  assert(effectRuns === 2, 'createEffect: unsubscribe stops notifications');

  // ----- nested effects -----
  let outerRuns = 0;
  let innerRuns = 0;
  const [x, setX] = createSignal(1);
  const [y, setY] = createSignal(10);

  createEffect(() => {
    outerRuns++;
    const xVal = x();
    createEffect(() => {
      innerRuns++;
      const yVal = y();
    });
  });
  assert(outerRuns === 1, 'nested effects: outer runs once initially');
  assert(innerRuns === 1, 'nested effects: inner runs once initially');

  setY(20);
  assert(innerRuns === 2, 'nested effects: inner re-runs on y change');
  assert(outerRuns === 1, 'nested effects: outer does NOT re-run on y change');

  // ----- batch -----
  let batchEffectRuns = 0;
  const [a, setA] = createSignal(0);
  const [b, setB] = createSignal(0);
  createEffect(() => {
    batchEffectRuns++;
    a();
    b();
  });
  assert(batchEffectRuns === 1, 'batch: effect runs initially');

  batch(() => {
    setA(1);
    setB(1);
  });
  assert(batchEffectRuns === 2, 'batch: single effect run after batch');

  // ----- nested batch -----
  let nestedBatchRuns = 0;
  const [c, setC] = createSignal(0);
  createEffect(() => {
    nestedBatchRuns++;
    c();
  });
  assert(nestedBatchRuns === 1, 'nested batch: effect runs initially');

  batch(() => {
    batch(() => {
      setC(1);
    });
  });
  assert(nestedBatchRuns === 2, 'nested batch: single run after outer batch');

  // ----- createMemo -----
  const [num, setNum] = createSignal(5);
  let memoRuns = 0;
  const doubled = createMemo(() => {
    memoRuns++;
    return num() * 2;
  });

  assert(doubled() === 10, 'createMemo: computes value');
  assert(memoRuns === 1, 'createMemo: computes once on first read');

  assert(doubled() === 10, 'createMemo: returns cached value');
  assert(memoRuns === 1, 'createMemo: no re-computation for cached read');

  setNum(10);
  assert(doubled() === 20, 'createMemo: recomputes after dependency change');
  assert(memoRuns === 2, 'createMemo: re-computes on dirty read');

  // Memo + effect integration
  let memoEffectRuns = 0;
  const [base, setBase] = createSignal(3);
  const tripled = createMemo(() => base() * 3);
  createEffect(() => {
    memoEffectRuns++;
    tripled();
  });
  assert(memoEffectRuns === 1, 'createMemo+effect: initial run');
  setBase(4);
  assert(memoEffectRuns === 2, 'createMemo+effect: re-runs on memo change');

  // ----- useState -----
  setCurrentComponent({ update: null });
  const [state, setState] = useState(100);
  assert(state() === 100, 'useState: initial value');
  setState(200);
  assert(state() === 200, 'useState: setter updates value');
  setState((prev) => prev + 50);
  assert(state() === 250, 'useState: functional update');
  setCurrentComponent(null);

  assert(getCurrentComponent() === null, 'useState: component context cleared');

  // ----- createStore -----
  const store = createStore({ count: 0, name: 'test' });
  assert(store.get().count === 0, 'createStore: initial state');
  assert(store.get().name === 'test', 'createStore: initial name');

  let storeNotifyCount = 0;
  const unsubStore = store.subscribe(() => {
    storeNotifyCount++;
  });

  store.set({ count: 1 });
  assert(store.get().count === 1, 'createStore: set updates state');
  assert(storeNotifyCount === 1, 'createStore: subscriber notified');

  store.set({ name: 'updated' });
  assert(store.get().name === 'updated', 'createStore: set partial update');
  assert(storeNotifyCount === 2, 'createStore: subscriber notified on partial update');

  unsubStore();
  store.set({ count: 5 });
  assert(storeNotifyCount === 2, 'createStore: unsubscribed no longer notified');

  // ----- Report -----
  for (const log of logs) {
    console.log(log);
  }
  if (errors.length > 0) {
    for (const err of errors) {
      console.error(err);
    }
    throw new Error(`${errors.length} test(s) failed`);
  }
  console.log(`\nAll ${logs.length} tests passed!`);
}

/** Exported for manual test execution: `import { _runTests } from './state'` then `_runTests()` */
export { _runTests };