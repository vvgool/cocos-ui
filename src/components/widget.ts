import { registerComponent } from '../core/create-element';
import { registerPropMapping, toNumber } from '../core/apply-props';
function widgetFactory(node: any, props: Record<string, any>): void {
  const widget = node.addComponent(cc.Widget);
}
registerComponent('Widget', widgetFactory);
registerPropMapping('Widget', {
  top: (node: any, value: any) => {
    const widget = node.getComponent(cc.Widget);
    if (widget) widget.top = toNumber(value);
  },
  bottom: (node: any, value: any) => {
    const widget = node.getComponent(cc.Widget);
    if (widget) widget.bottom = toNumber(value);
  },
  left: (node: any, value: any) => {
    const widget = node.getComponent(cc.Widget);
    if (widget) widget.left = toNumber(value);
  },
  right: (node: any, value: any) => {
    const widget = node.getComponent(cc.Widget);
    if (widget) widget.right = toNumber(value);
  },
  target: (node: any, value: any) => {
    const widget = node.getComponent(cc.Widget);
    if (widget) widget.target = value;
  },
  isAlignOnce: (node: any, value: any) => {
    const widget = node.getComponent(cc.Widget);
    if (widget) widget.isAlignOnce = Boolean(value);
  },
});