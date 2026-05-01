import { registerComponent } from '../core/create-element';
import { registerPropMapping, parseColor } from '../core/apply-props';
export type ShapeType = 'rect' | 'circle' | 'line';
export interface RectShape {
  type: 'rect';
  x: number;
  y: number;
  w: number;
  h: number;
  fillColor?: string | { r: number; g: number; b: number; a?: number };
  strokeColor?: string | { r: number; g: number; b: number; a?: number };
  lineWidth?: number;
}
export interface CircleShape {
  type: 'circle';
  cx: number;
  cy: number;
  r: number;
  fillColor?: string | { r: number; g: number; b: number; a?: number };
  strokeColor?: string | { r: number; g: number; b: number; a?: number };
  lineWidth?: number;
}
export interface LineShape {
  type: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  strokeColor?: string | { r: number; g: number; b: number; a?: number };
  lineWidth?: number;
}
export type Shape = RectShape | CircleShape | LineShape;
function renderShapes(graphics: any, shapes: Shape[]): void {
  graphics.clear();
for (const shape of shapes) {
    switch (shape.type) {
      case 'rect':
        if (shape.fillColor) {
          graphics.fillColor = parseColor(shape.fillColor);
        }
        if (shape.strokeColor) {
          graphics.strokeColor = parseColor(shape.strokeColor);
        }
        if (shape.lineWidth !== undefined) {
          graphics.lineWidth = shape.lineWidth;
        }
        graphics.rect(shape.x, shape.y, shape.w, shape.h);
        if (shape.fillColor) graphics.fill();
        if (shape.strokeColor) graphics.stroke();
        break;
      case 'circle':
        if (shape.fillColor) {
          graphics.fillColor = parseColor(shape.fillColor);
        }
        if (shape.strokeColor) {
          graphics.strokeColor = parseColor(shape.strokeColor);
        }
        if (shape.lineWidth !== undefined) {
          graphics.lineWidth = shape.lineWidth;
        }
        graphics.circle(shape.cx, shape.cy, shape.r);
        if (shape.fillColor) graphics.fill();
        if (shape.strokeColor) graphics.stroke();
        break;
      case 'line':
        if (shape.strokeColor) {
          graphics.strokeColor = parseColor(shape.strokeColor);
        }
        if (shape.lineWidth !== undefined) {
          graphics.lineWidth = shape.lineWidth;
        }
        graphics.moveTo(shape.x1, shape.y1);
        graphics.lineTo(shape.x2, shape.y2);
        if (shape.strokeColor) graphics.stroke();
        break;
    }
  }
}
function createGraphics(node: any, props: Record<string, any>): void {
  const graphics = node.addComponent(cc.Graphics);
}
const graphicsPropMapping: Record<string, string | ((node: any, value: any) => void)> = {
  shapes: (node: any, value: any) => {
    if (Array.isArray(value)) {
      const graphics = node.getComponent(cc.Graphics);
      if (graphics) renderShapes(graphics, value);
    }
  },
};
registerComponent('Graphics', createGraphics);
registerPropMapping('Graphics', graphicsPropMapping);