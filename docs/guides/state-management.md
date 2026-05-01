# State Management Guide

This guide covers the reactive state management primitives in CocosUI.

## useState

Component-level state using signals. Returns a getter/setter pair.

```tsx
import { useState, View, Label, Button } from 'cocos-ui';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <VBox spacing={10}>
      <Label text={`Count: ${count()}`} />
      <Button text="Increment" onClick={() => setCount(prev => prev + 1)} />
      <Button text="Reset" onClick={() => setCount(0)} />
    </VBox>
  );
}
```

## createSignal / createEffect

Low-level reactive primitives for fine-grained reactivity.

```tsx
import { createSignal, createEffect } from 'cocos-ui';

const [name, setName] = createSignal('Alice');

// Automatically tracks dependencies and re-runs when they change
const unsub = createEffect(() => {
  console.log(`Name changed to: ${name()}`);
});

setName('Bob'); // Logs: "Name changed to: Bob"

// Cleanup when no longer needed
unsub();
```

## batch

Batch multiple signal updates to prevent unnecessary re-renders. Effects fire once after the batch completes.

```tsx
import { batch, createSignal, createEffect } from 'cocos-ui';

const [a, setA] = createSignal(0);
const [b, setB] = createSignal(0);

createEffect(() => {
  console.log(`a=${a()}, b=${b()}`);
});

// Without batch: effect runs twice
// With batch: effect runs once
batch(() => {
  setA(1);
  setB(1);
});
```

## createStore

Global state shared across components with shallow merge updates.

```tsx
import { createStore } from 'cocos-ui';

const appStore = createStore({
  count: 0,
  user: null,
  theme: 'light',
});

// Read state
console.log(appStore.get().count);

// Update state (shallow merge)
appStore.set({ count: 10, theme: 'dark' });

// Subscribe to changes
const unsub = appStore.subscribe((state) => {
  console.log('State changed:', state);
});
```

## createMemo

Derived/computed state that caches results and only recomputes when dependencies change.

```tsx
import { createSignal, createMemo } from 'cocos-ui';

const [price, setPrice] = createSignal(100);
const [quantity, setQuantity] = createSignal(5);

// Only recomputes when price or quantity changes
const total = createMemo(() => price() * quantity());

console.log(total()); // 500
setPrice(150);
console.log(total()); // 750 (recomputed)
```

## Complete Example: Shopping Cart

```tsx
import { useState, createStore, createMemo, signal } from 'cocos-ui';

const cartStore = createStore({
  items: [],
  discount: 0,
});

function CartItem({ name, price }) {
  const [qty, setQty] = useState(1);

  return (
    <HBox spacing={10}>
      <Label text={`${name} x ${qty()}`} />
      <Label text={`$${(price * qty()).toFixed(2)}`} />
      <Button text="-" onClick={() => setQty(Math.max(1, qty() - 1))} />
      <Button text="+" onClick={() => setQty(qty() + 1)} />
    </HBox>
  );
}

function Cart() {
  const subtotal = createMemo(() => {
    return cartStore.get().items.reduce((sum, item) => sum + item.price * item.qty, 0);
  });

  const total = createMemo(() => {
    const { subtotal, discount } = cartStore.get();
    return subtotal * (1 - discount);
  });

  return (
    <VBox spacing={10}>
      <Label text={`Subtotal: $${subtotal().toFixed(2)}`} />
      <Label text={`Discount: ${(cartStore.get().discount * 100).toFixed(0)}%`} />
      <Label text={`Total: $${total().toFixed(2)}`} bold />
    </VBox>
  );
}
```
