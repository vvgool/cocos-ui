import { registerComponent } from '../core/create-element';
function safeAreaFactory(node: any, props: Record<string, any>): void {
  node.addComponent(cc.SafeArea);
}
registerComponent('SafeArea', safeAreaFactory);