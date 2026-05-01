/**
 * Layout — VBox/HBox container components wrapping Cocos4 cc.Layout
 *
 * VBox and HBox are layout container components that use cc.Layout to
 * arrange child nodes in vertical or horizontal patterns.
 *
 * Props control spacing, padding, alignment, and resize mode.
 */
import { registerComponent } from '../core/create-element';
import { registerPropMapping, toNumber } from '../core/apply-props';
// cc.Layout.Type enum values
const LayoutType = {
  NONE: 0,
  HORIZONTAL: 1,
  VERTICAL: 2,
  GRID: 3,
} as const;
// cc.Layout.ResizeMode enum values
const ResizeMode = {
  NONE: 0,
  CONTAINER: 1,
  CHILDREN: 2,
} as const;
// cc.Layout.HorizontalAlign enum values
const HorizontalAlign = {
  LEFT: 0,
  CENTER: 1,
  RIGHT: 2,
  BOTH: 3,
} as const;
// cc.Layout.VerticalAlign enum values
const VerticalAlign = {
  TOP: 0,
  CENTER: 1,
  BOTTOM: 2,
  BOTH: 3,
} as const;
/**
 * Parse resize mode value
 */
function parseResizeMode(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const upper = value.toUpperCase();
    if (upper in ResizeMode) return ResizeMode[upper as keyof typeof ResizeMode];
  }
  return ResizeMode.NONE;
}
/**
 * Parse horizontal align value
 */
function parseHorizontalAlign(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const upper = value.toUpperCase();
    if (upper in HorizontalAlign) return HorizontalAlign[upper as keyof typeof HorizontalAlign];
  }
  return HorizontalAlign.LEFT;
}
/**
 * Parse vertical align value
 */
function parseVerticalAlign(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const upper = value.toUpperCase();
    if (upper in VerticalAlign) return VerticalAlign[upper as keyof typeof VerticalAlign];
  }
  return VerticalAlign.TOP;
}
/**
 * Create VBox layout component
 * VBox arranges children vertically (top to bottom)
 */
function createVBox(node: any, props: Record<string, any>): void {
  const layout = node.addComponent(cc.Layout);
  layout.type = LayoutType.VERTICAL;
}
/**
 * Create HBox layout component
 * HBox arranges children horizontally (left to right)
 */
function createHBox(node: any, props: Record<string, any>): void {
  const layout = node.addComponent(cc.Layout);
  layout.type = LayoutType.HORIZONTAL;
}
// Register VBox component
registerComponent('VBox', createVBox);
// Register HBox component
registerComponent('HBox', createHBox);
// Register VBox prop mappings
registerPropMapping('VBox', {
  spacing: (node: any, value: any) => {
    const layout = node.getComponent(cc.Layout);
    if (layout) {
      layout.spacingX = toNumber(value);
      layout.spacingY = toNumber(value);
    }
  },
  spacingX: (node: any, value: any) => {
    const layout = node.getComponent(cc.Layout);
    if (layout) layout.spacingX = toNumber(value);
  },
  spacingY: (node: any, value: any) => {
    const layout = node.getComponent(cc.Layout);
    if (layout) layout.spacingY = toNumber(value);
  },
  padding: (node: any, value: any) => {
    const layout = node.getComponent(cc.Layout);
    if (layout) {
      layout.paddingLeft = toNumber(value);
      layout.paddingRight = toNumber(value);
      layout.paddingTop = toNumber(value);
      layout.paddingBottom = toNumber(value);
    }
  },
  paddingLeft: (node: any, value: any) => {
    const layout = node.getComponent(cc.Layout);
    if (layout) layout.paddingLeft = toNumber(value);
  },
  paddingRight: (node: any, value: any) => {
    const layout = node.getComponent(cc.Layout);
    if (layout) layout.paddingRight = toNumber(value);
  },
  paddingTop: (node: any, value: any) => {
    const layout = node.getComponent(cc.Layout);
    if (layout) layout.paddingTop = toNumber(value);
  },
  paddingBottom: (node: any, value: any) => {
    const layout = node.getComponent(cc.Layout);
    if (layout) layout.paddingBottom = toNumber(value);
  },
  resizeMode: (node: any, value: any) => {
    const layout = node.getComponent(cc.Layout);
    if (layout) layout.resizeMode = parseResizeMode(value);
  },
  horizontalAlign: (node: any, value: any) => {
    const layout = node.getComponent(cc.Layout);
    if (layout) layout.horizontalAlign = parseHorizontalAlign(value);
  },
  verticalAlign: (node: any, value: any) => {
    const layout = node.getComponent(cc.Layout);
    if (layout) layout.verticalAlign = parseVerticalAlign(value);
  },
});
// Register HBox prop mappings
registerPropMapping('HBox', {
  spacing: (node: any, value: any) => {
    const layout = node.getComponent(cc.Layout);
    if (layout) {
      layout.spacingX = toNumber(value);
      layout.spacingY = toNumber(value);
    }
  },
  spacingX: (node: any, value: any) => {
    const layout = node.getComponent(cc.Layout);
    if (layout) layout.spacingX = toNumber(value);
  },
  spacingY: (node: any, value: any) => {
    const layout = node.getComponent(cc.Layout);
    if (layout) layout.spacingY = toNumber(value);
  },
  padding: (node: any, value: any) => {
    const layout = node.getComponent(cc.Layout);
    if (layout) {
      layout.paddingLeft = toNumber(value);
      layout.paddingRight = toNumber(value);
      layout.paddingTop = toNumber(value);
      layout.paddingBottom = toNumber(value);
    }
  },
  paddingLeft: (node: any, value: any) => {
    const layout = node.getComponent(cc.Layout);
    if (layout) layout.paddingLeft = toNumber(value);
  },
  paddingRight: (node: any, value: any) => {
    const layout = node.getComponent(cc.Layout);
    if (layout) layout.paddingRight = toNumber(value);
  },
  paddingTop: (node: any, value: any) => {
    const layout = node.getComponent(cc.Layout);
    if (layout) layout.paddingTop = toNumber(value);
  },
  paddingBottom: (node: any, value: any) => {
    const layout = node.getComponent(cc.Layout);
    if (layout) layout.paddingBottom = toNumber(value);
  },
  resizeMode: (node: any, value: any) => {
    const layout = node.getComponent(cc.Layout);
    if (layout) layout.resizeMode = parseResizeMode(value);
  },
  horizontalAlign: (node: any, value: any) => {
    const layout = node.getComponent(cc.Layout);
    if (layout) layout.horizontalAlign = parseHorizontalAlign(value);
  },
  verticalAlign: (node: any, value: any) => {
    const layout = node.getComponent(cc.Layout);
    if (layout) layout.verticalAlign = parseVerticalAlign(value);
  },
});