import { registerComponent } from '../core/create-element';
import { registerPropMapping } from '../core/apply-props';

function createToggle(node: any, props: Record<string, any>): void {
  const toggle = node.addComponent(cc.Toggle);
  if (props.onChange) {
    node.on('toggle', (toggle: any) => {
      props.onChange(toggle.isChecked);
    });
  }
}

const togglePropMapping: Record<string, string | ((node: any, value: any) => void)> = {
  checked: (node, value) => {
    const toggle = node.getComponent(cc.Toggle);
    if (toggle) toggle.isChecked = Boolean(value);
  },
  disabled: (node, value) => {
    const toggle = node.getComponent(cc.Toggle);
    if (toggle) toggle.interactable = !value;
  },
};

registerComponent('Toggle', createToggle);
registerPropMapping('Toggle', togglePropMapping);
