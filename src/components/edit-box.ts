import { registerComponent } from '../core/create-element';
import { registerPropMapping } from '../core/apply-props';
const InputMode = {
  ANY: 0,
  NUMERIC: 1,
  DECIMAL: 2,
  SINGLE_LINE: 3,
} as const;
const ReturnType = {
  DEFAULT: 0,
  DONE: 1,
  SEND: 2,
  SEARCH: 3,
  NEXT: 4,
} as const;
function editBoxFactory(node: any, props: Record<string, any>): void {
  const editBox = node.addComponent(cc.EditBox);
  if (props.onChange) {
    node.on('text-changed', (event: any) => {
      props.onChange(event.detail.string || editBox.string);
    });
  }
  if (props.onConfirm) {
    node.on('editing-did-ended', (event: any) => {
      props.onConfirm(editBox.string);
    });
  }
}
function parseInputMode(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const upper = value.toUpperCase();
    if (upper in InputMode) return InputMode[upper as keyof typeof InputMode];
  }
  return InputMode.ANY;
}
function parseReturnType(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const upper = value.toUpperCase();
    if (upper in ReturnType) return ReturnType[upper as keyof typeof ReturnType];
  }
  return ReturnType.DEFAULT;
}
const editBoxPropMapping: Record<string, string | ((node: any, value: any) => void)> = {
  value: (node: any, value: any) => {
    const editBox = node.getComponent(cc.EditBox);
    if (editBox) editBox.string = value;
  },
  placeholder: (node: any, value: any) => {
    const editBox = node.getComponent(cc.EditBox);
    if (editBox) editBox.placeholder = value;
  },
  maxLength: (node: any, value: any) => {
    const editBox = node.getComponent(cc.EditBox);
    if (editBox) editBox.maxLength = value;
  },
  inputMode: (node: any, value: any) => {
    const editBox = node.getComponent(cc.EditBox);
    if (editBox) editBox.inputMode = parseInputMode(value);
  },
  returnType: (node: any, value: any) => {
    const editBox = node.getComponent(cc.EditBox);
    if (editBox) editBox.returnType = parseReturnType(value);
  },
  disabled: (node: any, value: any) => {
    const editBox = node.getComponent(cc.EditBox);
    if (editBox) editBox.interactable = !value;
  },
};
registerComponent('EditBox', editBoxFactory);
registerPropMapping('EditBox', editBoxPropMapping);
