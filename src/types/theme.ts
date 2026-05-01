export type ThemeColors = Record<string, string>;

export type ThemeFonts = Record<string, string>;

export type ThemeSpacing = Record<string, number>;

export interface Theme {
  colors?: ThemeColors;
  fonts?: ThemeFonts;
  spacing?: ThemeSpacing;
}