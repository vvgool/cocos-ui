import { registerComponent } from '../core/create-element';
import { registerPropMapping, parseColor } from '../core/apply-props';
const ButtonTransition = {
  NONE: 0,
  COLOR: 1,
  SPRITE: 2,
  SCALE: 3,
} as const;
function buttonFactory(node: any, props: Record<string, any>): void {
  const button = node.addComponent(cc.Button);
  button.transition = ButtonTransition.NONE;
}
function parseTransition(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const upper = value.toUpperCase();
    if (upper in ButtonTransition) {
      return ButtonTransition[upper as keyof typeof ButtonTransition];
    }
  }
  return ButtonTransition.NONE;
}
const buttonPropMapping: Record<string, string | ((node: any, value: any) => void)> = {
  text: (node: any, value: any) => {
    let labelNode = node.getChildByName('Label');
    if (!labelNode) {
      labelNode = new cc.Node('Label');
      node.addChild(labelNode);
      const transform = labelNode.addComponent(cc.UITransform);
      transform.setContentSize(100, 40);
      transform.setAnchorPoint(0.5, 0.5);
      const label = labelNode.addComponent(cc.Label);
      label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
      label.verticalAlign = cc.Label.VerticalAlign.CENTER;
      label.overflow = cc.Label.Overflow.CLAMP;
      label.lineHeight = 40;
    }
    const label = labelNode.getComponent(cc.Label);
    if (label) {
      label.string = value;
    }
  },
  disabled: (node: any, value: any) => {
    const button = node.getComponent(cc.Button);
    if (button) {
      button.interactable = !value;
    }
  },
  interactable: (node: any, value: any) => {
    const button = node.getComponent(cc.Button);
    if (button) {
      button.interactable = value;
    }
  },
  transition: (node: any, value: any) => {
    const button = node.getComponent(cc.Button);
    if (button) {
      button.transition = parseTransition(value);
    }
  },
  normalColor: (node: any, value: any) => {
    const button = node.getComponent(cc.Button);
    if (button) {
      button.normalColor = parseColor(value);
    }
  },
  pressedColor: (node: any, value: any) => {
    const button = node.getComponent(cc.Button);
    if (button) {
      button.pressedColor = parseColor(value);
    }
  },
  hoverColor: (node: any, value: any) => {
    const button = node.getComponent(cc.Button);
    if (button) {
      button.hoverColor = parseColor(value);
    }
  },
  onClick: (node: any, value: any) => {
    const handler = value;
    node.on('click', handler, handler);
  },
};
registerComponent('Button', buttonFactory);
registerPropMapping('Button', buttonPropMapping);
