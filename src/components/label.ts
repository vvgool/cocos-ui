import { registerComponent } from '../core/create-element';
import { registerPropMapping, parseColor } from '../core/apply-props';
import { resourceLoader } from '../core/resource-loader';
function labelFactory(node: any, props: Record<string, any>): void {
  const label = node.addComponent(cc.Label);
  label.fontSize = 40;
  label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  label.verticalAlign = cc.Label.VerticalAlign.CENTER;
  label.overflow = cc.Label.Overflow.CLAMP;
  label.lineHeight = 40;
}
// applyLabelProps 被删除 — prop 设置由 applyProps + labelPropMapping 统一处理
const labelPropMapping: Record<string, string | ((node: any, value: any) => void)> = {
  text: (node: any, value: any) => {
    const label = node.getComponent(cc.Label);
    if (label) label.string = value;
  },
  fontSize: (node: any, value: any) => {
    const label = node.getComponent(cc.Label);
    if (label) label.fontSize = Number(value);
  },
  fontFamily: (node: any, value: any) => {
    const label = node.getComponent(cc.Label);
    if (label) label.fontFamily = value;
  },
  lineHeight: (node: any, value: any) => {
    const label = node.getComponent(cc.Label);
    if (label) label.lineHeight = Number(value);
  },
  horizontalAlign: (node: any, value: any) => {
    const label = node.getComponent(cc.Label);
    if (label) label.horizontalAlign = value;
  },
  verticalAlign: (node: any, value: any) => {
    const label = node.getComponent(cc.Label);
    if (label) label.verticalAlign = value;
  },
  overflow: (node: any, value: any) => {
    const label = node.getComponent(cc.Label);
    if (label) label.overflow = value;
  },
  bold: (node: any, value: any) => {
    const label = node.getComponent(cc.Label);
    if (label) label.isBold = Boolean(value);
  },
  italic: (node: any, value: any) => {
    const label = node.getComponent(cc.Label);
    if (label) label.isItalic = Boolean(value);
  },
  underline: (node: any, value: any) => {
    const label = node.getComponent(cc.Label);
    if (label) label.isUnderline = Boolean(value);
  },
  color: (node: any, value: any) => {
    const label = node.getComponent(cc.Label);
    if (label) label.color = parseColor(value);
  },
  font: (node: any, value: any) => {
    const label = node.getComponent(cc.Label);
    if (label) {
      resourceLoader.loadFont(value).then((fontAsset: any) => {
        label.font = fontAsset;
      });
    }
  },
};
registerComponent('Label', labelFactory);
registerPropMapping('Label', labelPropMapping);