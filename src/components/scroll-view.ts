import { registerComponent } from '../core/create-element';
import { registerPropMapping } from '../core/apply-props';
const Direction = {
  NONE: 0,
  HORIZONTAL: 1,
  VERTICAL: 2,
  BOTH: 3,
} as const;
function parseDirection(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const upper = value.toUpperCase();
    if (upper in Direction) return Direction[upper as keyof typeof Direction];
  }
  return Direction.VERTICAL;
}
function scrollViewFactory(node: any, props: Record<string, any>): void {
  const scrollView = node.addComponent(cc.ScrollView);
  const contentNode = new cc.Node('content');
  contentNode.addComponent(cc.UITransform);
  node.addChild(contentNode);
  scrollView.content = contentNode;
  if (props.direction !== undefined) {
    scrollView.horizontal = (parseDirection(props.direction) & Direction.HORIZONTAL) !== 0;
    scrollView.vertical = (parseDirection(props.direction) & Direction.VERTICAL) !== 0;
  } else {
    if (props.horizontal !== undefined) scrollView.horizontal = !!props.horizontal;
    if (props.vertical !== undefined) scrollView.vertical = !!props.vertical;
  }
  if (props.onScroll) {
    node.on('scrolling', () => {
      const content = scrollView.content;
      if (content) {
        props.onScroll({
          x: content.x,
          y: content.y,
          scrollX: content.x,
          scrollY: content.y,
        });
      }
    });
  }
}
const scrollViewPropMapping: Record<string, string | ((node: any, value: any) => void)> = {
  direction: (node: any, value: any) => {
    const scrollView = node.getComponent(cc.ScrollView);
    if (scrollView) {
      const dir = parseDirection(value);
      scrollView.horizontal = (dir & Direction.HORIZONTAL) !== 0;
      scrollView.vertical = (dir & Direction.VERTICAL) !== 0;
    }
  },
  horizontal: (node: any, value: any) => {
    const scrollView = node.getComponent(cc.ScrollView);
    if (scrollView) scrollView.horizontal = !!value;
  },
  vertical: (node: any, value: any) => {
    const scrollView = node.getComponent(cc.ScrollView);
    if (scrollView) scrollView.vertical = !!value;
  },
  inertia: (node: any, value: any) => {
    const scrollView = node.getComponent(cc.ScrollView);
    if (scrollView) scrollView.inertia = !!value;
  },
  elastic: (node: any, value: any) => {
    const scrollView = node.getComponent(cc.ScrollView);
    if (scrollView) scrollView.elastic = !!value;
  },
  bounceDuration: (node: any, value: any) => {
    const scrollView = node.getComponent(cc.ScrollView);
    if (scrollView) scrollView.bounceDuration = value;
  },
  scrollTo: (node: any, value: any) => {
    const scrollView = node.getComponent(cc.ScrollView);
    if (scrollView) {
      if (typeof value === 'object' && value !== null) {
        const x = value.x ?? 0;
        const y = value.y ?? 0;
        const time = value.time ?? 0.3;
        scrollView.scrollTo(new cc.Vec2(x, y), time);
      }
    }
  },
  onScroll: (node: any, value: any) => {
    // Handled by applyProps event system; mapping ensures prop recognition
  },
};
registerComponent('ScrollView', scrollViewFactory);
registerPropMapping('ScrollView', scrollViewPropMapping);