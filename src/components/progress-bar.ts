import { registerComponent } from '../core/create-element';
import { registerPropMapping } from '../core/apply-props';
const Mode = { HORIZONTAL: 0, VERTICAL: 1, FILLED: 2 } as const;
function progressBarFactory(node: any, props: Record<string, any>): void {
  const progressBar = node.addComponent(cc.ProgressBar);
  progressBar.progress = 0;
  progressBar.mode = Mode.HORIZONTAL;
}
function parseMode(value: any): number | null {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const upper = value.toUpperCase();
    if (upper === 'HORIZONTAL') return Mode.HORIZONTAL;
    if (upper === 'VERTICAL') return Mode.VERTICAL;
    if (upper === 'FILLED') return Mode.FILLED;
  }
  return null;
}
const progressBarPropMapping: Record<string, string | ((node: any, value: any) => void)> = {
  progress: (node: any, value: any) => {
    const progressBar = node.getComponent(cc.ProgressBar);
    if (progressBar) progressBar.progress = value;
  },
  mode: (node: any, value: any) => {
    const progressBar = node.getComponent(cc.ProgressBar);
    if (progressBar) {
      const mode = parseMode(value);
      if (mode !== null) progressBar.mode = mode;
    }
  },
  reverse: (node: any, value: any) => {
    const progressBar = node.getComponent(cc.ProgressBar);
    if (progressBar) progressBar.reverse = value;
  },
  totalLength: (node: any, value: any) => {
    const progressBar = node.getComponent(cc.ProgressBar);
    if (progressBar) progressBar.totalLength = value;
  },
};
registerComponent('ProgressBar', progressBarFactory);
registerPropMapping('ProgressBar', progressBarPropMapping);