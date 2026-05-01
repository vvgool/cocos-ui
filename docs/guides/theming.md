# Theming Guide

This guide covers the theme system in CocosUI, including creating themes, applying them, and accessing theme values in components.

## createTheme

Create a theme object with colors, fonts, and spacing.

```tsx
import { createTheme } from 'cocos-ui';

const customTheme = createTheme({
  colors: {
    background: '#1a1a2e',
    surface: '#16213e',
    primary: '#e94560',
    secondary: '#0f3460',
    text: '#ffffff',
    textSecondary: '#a0a0a0',
    border: '#2a2a4e',
    error: '#ff6b6b',
    success: '#4ecdc4',
  },
  fonts: {
    regular: 'fonts/Regular.ttf',
    bold: 'fonts/Bold.ttf',
    mono: 'fonts/Mono.ttf',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
});
```

## ThemeProvider

Inject a theme into the component tree.

```tsx
import { ThemeProvider, View, Label } from 'cocos-ui';

function App() {
  return (
    <ThemeProvider theme={customTheme}>
      <View>
        <Label text="Themed content goes here" />
      </View>
    </ThemeProvider>
  );
}
```

## useTheme

Access the current theme in any component.

```tsx
import { useTheme, View, Label, VBox } from 'cocos-ui';

function ThemedCard() {
  const theme = useTheme();

  return (
    <View
      width={200}
      height={100}
      color={theme.colors?.surface}
    >
      <VBox padding={10}>
        <Label
          text="Themed Card"
          color={theme.colors?.text}
          font={theme.fonts?.bold}
        />
        <Label
          text="Using useTheme() hook"
          fontSize={14}
          color={theme.colors?.textSecondary}
        />
      </VBox>
    </View>
  );
}
```

## Preset Themes

Use the built-in light and dark themes.

```tsx
import { lightTheme, darkTheme } from 'cocos-ui';

// Light theme colors
console.log(lightTheme.colors.primary);    // #007aff
console.log(lightTheme.colors.background); // #ffffff

// Dark theme colors
console.log(darkTheme.colors.primary);    // #0a84ff
console.log(darkTheme.colors.background); // #1c1c1e
```

## Complete Example: Theme Switcher

```tsx
import { useState, ThemeProvider, useTheme, Toggle, Label, HBox, VBox, View } from 'cocos-ui';
import { lightTheme, darkTheme } from 'cocos-ui';

function ThemeSwitcher() {
  const [isDark, setIsDark] = useState(false);

  return (
    <ThemeProvider theme={isDark() ? darkTheme : lightTheme}>
      <VBox spacing={20}>
        <HBox spacing={10}>
          <Label text="Dark Mode" />
          <Toggle checked={isDark()} onChange={setIsDark} />
        </HBox>

        <ThemedPanel />
      </VBox>
    </ThemeProvider>
  );
}

function ThemedPanel() {
  const theme = useTheme();

  return (
    <View
      width={300}
      height={150}
      color={theme.colors?.surface}
    >
      <VBox padding={16} spacing={8}>
        <Label
          text="Theme-Aware Panel"
          bold
          color={theme.colors?.text}
        />
        <Label
          text={`Primary: ${theme.colors?.primary}`}
          color={theme.colors?.primary}
        />
        <Label
          text={`Background: ${theme.colors?.background}`}
          color={theme.colors?.textSecondary}
        />
      </VBox>
    </View>
  );
}
```

## Theme Structure

A theme object has three optional sections:

- **colors**: Color palette for the UI
  - `background`, `surface`, `primary`, `secondary`
  - `text`, `textSecondary`, `border`
  - `error`, `success`

- **fonts**: Font family definitions
  - `regular`, `bold`, `mono`

- **spacing**: Spacing scale values
  - `xs` (4px), `sm` (8px), `md` (16px)
  - `lg` (24px), `xl` (32px)
