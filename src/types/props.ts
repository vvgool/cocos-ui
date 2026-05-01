import type { StyleProps } from './style';

export interface CommonProps {
  id?: string;
  key?: string;
  ref?: unknown;
  style?: Partial<StyleProps>;
}

export interface LayoutProps {
  width?: number;
  height?: number;
  padding?: number | { top?: number; right?: number; bottom?: number; left?: number };
  margin?: number | { top?: number; right?: number; bottom?: number; left?: number };
  layoutType?: 'NONE' | 'HORIZONTAL' | 'VERTICAL' | 'GRID';
}