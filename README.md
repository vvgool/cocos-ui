# CocosUI

**纯代码 JSX UI 框架 for Cocos4 — AI 友好的声明式 UI**

[![npm version](https://img.shields.io/npm/v/cocos-ui.svg)](https://www.npmjs.com/package/cocos-ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

CocosUI is a declarative UI framework built for Cocos Creator 4.x. Write UI components using JSX/TSX syntax with reactive state management, built-in animations, and a comprehensive component library.

## Features

- **17+ UI Components** — View, Label, Button, Sprite, ScrollView, Layout, Toggle, Slider, ProgressBar, EditBox, RichText, PageView, Mask, Graphics, SafeArea, Widget, Particle2D
- **JSX Declarative API** — Write UI in familiar React-like syntax
- **Reactive State Management** — `useState`, `createSignal`, `createEffect` for fine-grained reactivity
- **Tween Animations** — Built-in animation system with 30+ easing functions
- **Error Boundaries** — Graceful error handling with fallback UIs
- **Theme System** — Light/dark themes with custom theme support
- **DevTools** — Developer tools for debugging component trees
- **Suspense** — Lazy loading with shimmer placeholders
- **Resource Loading** — Images, fonts, and particle systems with caching
- **TypeScript First** — Full type safety out of the box

## Installation

```bash
npm install cocos-ui
```

**Peer Dependencies:**
- Cocos Creator >= 4.0.0-alpha

## Quick Start

```tsx
import { render, useState, View, VBox, Button, Label } from 'cocos-ui';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <VBox padding={20} spacing={10}>
      <Label text="Counter Demo" fontSize={28} bold />
      <Button
        text={`Count: ${count()}`}
        onClick={() => setCount(prev => prev + 1)}
      />
      <Button
        text="Reset"
        onClick={() => setCount(0)}
      />
    </VBox>
  );
}

render(<Counter />);
```

## Components

| Component | Description |
|-----------|-------------|
| `View` | Basic container with layout and styling |
| `Label` | Text display with typography options |
| `Button` | Clickable button with text/content |
| `Sprite` | Image display with loading states |
| `ScrollView` | Scrollable container (vertical/horizontal) |
| `Layout` | Flexible layout container |
| `VBox` | Vertical layout (flex-direction: column) |
| `HBox` | Horizontal layout (flex-direction: row) |
| `Toggle` | Boolean on/off switch |
| `Slider` | Range input slider |
| `ProgressBar` | Progress indicator |
| `EditBox` | Text input field |
| `RichText` | Formatted text with styles |
| `PageView` | Paginated scroll view |
| `Mask` | Clipping mask for content |
| `Graphics` | Vector shapes (rect, circle, line) |
| `SafeArea` | Safe area container for mobile |
| `Widget` | Custom component wrapper |
| `Particle2D` | Particle system emitter |

## Core APIs

### Rendering

```tsx
import { render } from 'cocos-ui';

render(<App />);
```

### State Management

```tsx
import { useState, createSignal, createEffect } from 'cocos-ui';

// useState hook
const [count, setCount] = useState(0);

// Fine-grained signals
const [signal, setSignal] = createSignal(0);
createEffect(() => { console.log(signal()); });
```

### Animations

```tsx
import { View } from 'cocos-ui';

<View
  animate={[
    { x: 100, duration: 0.5, easing: 'sineOut' },
    { x: 0, duration: 0.5, easing: 'sineIn' }
  ]}
/>
```

### Themes

```tsx
import { ThemeProvider, useTheme, lightTheme, darkTheme } from 'cocos-ui';

function ThemedComponent() {
  const theme = useTheme();
  return <View color={theme.colors.primary} />;
}

<ThemeProvider theme={darkTheme}>
  <ThemedComponent />
</ThemeProvider>
```

### Error Boundaries

```tsx
import { errorBoundary, Label } from 'cocos-ui';

const SafeComponent = errorBoundary(
  RiskyComponent,
  <Label text="Something went wrong!" color="#ff3b30" />
);
```

### Suspense

```tsx
import { Suspense, shimmer, Sprite } from 'cocos-ui';

<Suspense fallback={shimmer({ width: 200, height: 150 })}>
  <Sprite src="https://example.com/image.png" />
</Suspense>
```

## Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Type checking
npm run typecheck

# Build for production
npm run build
```

## Project Status

- ✅ 533 tests passing
- ✅ Zero type errors
- ✅ Production-ready build pipeline

## License

MIT © CocosUI
