import { registerComponent } from '../core/create-element';
import { registerPropMapping } from '../core/apply-props';
const Direction = { HORIZONTAL: 0, VERTICAL: 1 } as const;
function sliderFactory(node: any, props: Record<string, any>): void {
  const slider = node.addComponent(cc.Slider);
  slider.progress = 0;
  slider.direction = Direction.HORIZONTAL;
  if (props.onChange) {
    node.on('slide', (event: any) => {
      const value = event.detail || slider.progress;
      props.onChange(value);
    });
  }
}
function parseDirection(value: any): number | null {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const upper = value.toUpperCase();
    if (upper === 'HORIZONTAL') return Direction.HORIZONTAL;
    if (upper === 'VERTICAL') return Direction.VERTICAL;
  }
  return null;
}
const sliderPropMapping: Record<string, string | ((node: any, value: any) => void)> = {
  value: (node: any, value: any) => {
    const slider = node.getComponent(cc.Slider);
    if (slider) slider.progress = value;
  },
  direction: (node: any, value: any) => {
    const slider = node.getComponent(cc.Slider);
    if (slider) {
      const dir = parseDirection(value);
      if (dir !== null) slider.direction = dir;
    }
  },
  disabled: (node: any, value: any) => {
    const slider = node.getComponent(cc.Slider);
    if (slider) slider.interactable = !value;
  },
};
registerComponent('Slider', sliderFactory);
registerPropMapping('Slider', sliderPropMapping);