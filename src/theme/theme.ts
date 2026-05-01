/**
 * Theme Variable System
 *
 * Signal-based theme context with provider component and useTheme hook.
 * Preset themes: lightTheme, darkTheme with colors, fonts, spacing.
 */

import { createSignal } from '../core/state';
import { registerComponent } from '../core/create-element';
import type { Theme } from '../types/theme';

export type { Theme };

// =============================================================================
// Global Theme State
// =============================================================================

/** Global theme signal — shared across all components */
const [themeSignal, setThemeSignal] = createSignal<Theme>({});

/** Getter: current theme value */
export const getTheme = themeSignal;

/** Setter: update theme value (exported for testing) */
export { setThemeSignal };

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a theme object from config.
 * Ensures theme has expected structure with optional colors, fonts, spacing.
 */
export function createTheme(config: Theme): Theme {
  return {
    colors: config.colors ?? {},
    fonts: config.fonts ?? {},
    spacing: config.spacing ?? {},
  };
}

// =============================================================================
// Preset Themes
// =============================================================================

/** Light theme preset */
export const lightTheme: Theme = createTheme({
  colors: {
    background: '#ffffff',
    surface: '#f5f5f5',
    primary: '#007aff',
    secondary: '#5856d6',
    text: '#000000',
    textSecondary: '#666666',
    border: '#e0e0e0',
    error: '#ff3b30',
    success: '#34c759',
  },
  fonts: {
    regular: 'System.ttf',
    bold: 'System-Bold.ttf',
    mono: 'System-Mono.ttf',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
});

/** Dark theme preset */
export const darkTheme: Theme = createTheme({
  colors: {
    background: '#1c1c1e',
    surface: '#2c2c2e',
    primary: '#0a84ff',
    secondary: '#5e5ce6',
    text: '#ffffff',
    textSecondary: '#8e8e93',
    border: '#3a3a3c',
    error: '#ff453a',
    success: '#30d158',
  },
  fonts: {
    regular: 'System.ttf',
    bold: 'System-Bold.ttf',
    mono: 'System-Mono.ttf',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
});

// =============================================================================
// ThemeProvider Component
// =============================================================================

/**
 * ThemeProvider component — injects theme into children via signal context.
 * Children access theme via useTheme() hook.
 *
 * @param props.theme - Theme object to inject
 * @param props.children - Child nodes
 */
function ThemeProvider(props: { theme?: Theme; children?: any }): null {
  if (props.theme) {
    setThemeSignal(props.theme);
  }
  return null;
}

/** Register ThemeProvider with component registry */
registerComponent('ThemeProvider', (node: any, props: Record<string, any>) => {
  // ThemeProvider is a structural component — no additional node setup needed
  // Theme is injected via the global signal, not node properties
});

// =============================================================================
// useTheme Hook
// =============================================================================

/**
 * Hook returning the current theme object.
 * Reacts to theme changes automatically via signal tracking.
 */
export function useTheme(): Theme {
  return themeSignal();
}