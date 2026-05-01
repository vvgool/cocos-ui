# Animation Guide

This guide covers the declarative animation system in CocosUI using the `animate` prop.

## Basic Usage

Use the `animate` prop on any component to animate properties.

```tsx
import { useState, View, Button } from 'cocos-ui';

function SimpleAnimation() {
  const [animated, setAnimated] = useState(false);

  return (
    <VBox spacing={20}>
      <Button
        text={animated() ? 'Reset' : 'Animate'}
        onClick={() => setAnimated(!animated())}
      />
      <View
        width={80}
        height={80}
        color="#007aff"
        animate={animated() ? { x: 100, duration: 0.5 } : {}}
      />
    </VBox>
  );
}
```

## Animatable Properties

| Property | Type | Description |
|----------|------|-------------|
| `x`, `y` | number | Position coordinates |
| `scaleX`, `scaleY`, `scale` | number | Scale factors |
| `rotation` | number | Rotation in degrees |
| `opacity` | number | Opacity (0-255) |
| `color` | string | Hex color value |
| `duration` | number | Animation duration in seconds |
| `easing` | string | Easing function name |
| `relative` | boolean | Use relative movement |

## Easing Functions

Available easing functions for controlling animation acceleration:

```tsx
// Linear - constant speed
{ x: 100, easing: 'linear' }

// Sine - smooth, gentle curves
{ x: 100, easing: 'sineIn' }    // Accelerate
{ x: 100, easing: 'sineOut' }   // Decelerate
{ x: 100, easing: 'sineInOut' } // Accelerate then decelerate

// Quadratic - stronger acceleration
{ x: 100, easing: 'quadIn' }
{ x: 100, easing: 'quadOut' }

// Expressive - bouncy and elastic
{ x: 100, easing: 'elasticOut' } // Elastic bounce
{ x: 100, easing: 'backOut' }    // Overshoot then settle
{ x: 100, easing: 'bounceOut' }  // Bounce effect
```

## Tween Queues (Sequential Animations)

Chain multiple animations by passing an array.

```tsx
import { useState, View, Button } from 'cocos-ui';

function ChainedAnimation() {
  const [playing, setPlaying] = useState(false);

  return (
    <VBox spacing={20}>
      <Button
        text={playing() ? 'Stop' : 'Play Sequence'}
        onClick={() => setPlaying(!playing())}
      />
      <View
        width={60}
        height={60}
        color="#34c759"
        animate={
          playing()
            ? [
                { x: 100, duration: 0.5, easing: 'sineOut' },
                { y: 100, duration: 0.5, easing: 'sineIn' },
                { x: 0, y: 0, duration: 0.5, easing: 'sineInOut' },
              ]
            : undefined
        }
      />
    </VBox>
  );
}
```

## Callbacks

Use `onAnimationStart` and `onAnimationEnd` for lifecycle hooks.

```tsx
import { useState, View, Label, VBox } from 'cocos-ui';

function AnimationWithCallbacks() {
  const [status, setStatus] = useState('idle');

  return (
    <VBox spacing={20}>
      <Label text={`Status: ${status}`} />
      <View
        width={80}
        height={80}
        color="#ff9500"
        animate={{
          rotation: 360,
          duration: 1,
          easing: 'elasticOut',
          onAnimationStart: () => setStatus('animating'),
          onAnimationEnd: () => setStatus('complete'),
        }}
      />
    </VBox>
  );
}
```

## Practical Examples

### Pulse Animation

```tsx
<View
  width={100}
  height={100}
  color="#e94560"
  animate={{
    scale: 1.1,
    duration: 0.6,
    easing: 'sineInOut',
  }}
/>
```

### Slide In from Left

```tsx
<View
  width={200}
  height={50}
  color="#007aff"
  animate={{
    x: 0,
    opacity: 255,
    duration: 0.4,
    easing: 'sineOut',
    relative: true,
  }}
/>
```

### Bounce Effect

```tsx
<View
  width={60}
  height={60}
  color="#4ecdc4"
  animate={{
    y: -50,
    duration: 0.5,
    easing: 'bounceOut',
  }}
/>
```

### Complex Sequence with Callbacks

```tsx
function IntroAnimation() {
  const [visible, setVisible] = useState(false);

  return (
    <View
      width={150}
      height={150}
      color="#5856d6"
      animate={
        visible
          ? [
              { scale: 0, opacity: 0, duration: 0 },
              {
                scale: 1,
                opacity: 255,
                duration: 0.3,
                easing: 'backOut',
                onAnimationEnd: () => console.log('Appeared'),
              },
              {
                rotation: 360,
                duration: 0.6,
                easing: 'elasticOut',
                onAnimationEnd: () => console.log('Rotated'),
              },
            ]
          : undefined
      }
    />
  );
}
```

## Relative vs Absolute Animation

By default, animations use absolute values. Set `relative: true` for delta-based movement.

```tsx
// Absolute: always moves to x=100
<View animate={{ x: 100, duration: 0.5 }} />

// Relative: moves 100px from current position
<View animate={{ x: 100, duration: 0.5, relative: true }} />
```
