/**
 * RichText Component — Wraps Cocos4 cc.RichText
 *
 * Supports Cocos4 native tags: <color>, <size>, <b>, <i>, <u>, <img>, <br>
 */
import { registerComponent, ComponentRegistry } from '../core/create-element';
import { registerPropMapping } from '../core/apply-props';
interface RichTextProps {
  string?: string;
  fontSize?: number;
  fontFamily?: string;
  maxWidth?: number;
  handleTouchEvent?: boolean;
}
function richTextFactory(node: any, props: Record<string, any>): void {
  const richText = node.addComponent(cc.RichText);
  const { font, ...rest } = props;
  // Apply any remaining props directly
  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined) {
      (richText as any)[key] = value;
    }
  }
}
registerComponent('RichText', richTextFactory);
registerPropMapping('RichText', {
  string: (node: any, value: any) => {
    const rt = node.getComponent(cc.RichText);
    if (rt) rt.string = value;
  },
  fontSize: (node: any, value: any) => {
    const rt = node.getComponent(cc.RichText);
    if (rt) rt.fontSize = Number(value);
  },
  fontFamily: (node: any, value: any) => {
    const rt = node.getComponent(cc.RichText);
    if (rt) rt.fontFamily = value;
  },
  maxWidth: (node: any, value: any) => {
    const rt = node.getComponent(cc.RichText);
    if (rt) rt.maxWidth = Number(value);
  },
  handleTouchEvent: (node: any, value: any) => {
    const rt = node.getComponent(cc.RichText);
    if (rt) rt.handleTouchEvent = Boolean(value);
  },
});
export type { RichTextProps };
export { ComponentRegistry };
