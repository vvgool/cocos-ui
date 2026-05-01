import { registerComponent } from '../core/create-element';
import { registerPropMapping } from '../core/apply-props';
const MaskType = { RECT: 0, ELLIPSE: 1, IMAGE_STENCIL: 2 } as const;
function createMask(node: any, props: Record<string, any>): void {
  const mask = node.addComponent(cc.Mask);
  mask.type = MaskType.RECT;
  mask.inverted = false;
  mask.alphaThreshold = 0.1;
}
function parseMaskType(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const upper = value.toUpperCase();
    if (upper in MaskType) return MaskType[upper as keyof typeof MaskType];
  }
  return MaskType.RECT;
}
const maskPropMapping: Record<string, string | ((node: any, value: any) => void)> = {
  type: (node, value) => {
    const mask = node.getComponent(cc.Mask);
    if (mask) mask.type = parseMaskType(value);
  },
  inverted: (node, value) => {
    const mask = node.getComponent(cc.Mask);
    if (mask) mask.inverted = Boolean(value);
  },
  alphaThreshold: (node, value) => {
    const mask = node.getComponent(cc.Mask);
    if (mask) mask.alphaThreshold = Number(value);
  },
};
registerComponent('Mask', createMask);
registerPropMapping('Mask', maskPropMapping);