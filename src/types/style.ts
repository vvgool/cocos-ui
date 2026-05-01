export type Color = string;

export type FontSize = number;

export type Alignment = 'LEFT' | 'CENTER' | 'RIGHT' | 'TOP' | 'BOTTOM';

export type Overflow = 'NONE' | 'CLAMP' | 'SHRINK' | 'RESIZE_HEIGHT';

export type Visibility = boolean;

export interface StyleProps {
  color?: Color;
  fontSize?: FontSize;
  alignment?: Alignment;
  overflow?: Overflow;
  visibility?: Visibility;
  backgroundColor?: Color;
  borderColor?: Color;
  borderWidth?: number;
  borderRadius?: number;
}