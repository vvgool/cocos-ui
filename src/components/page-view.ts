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
  return Direction.HORIZONTAL;
}
function pageViewFactory(node: any, props: Record<string, any>): void {
  const pageView = node.addComponent(cc.PageView);
  const contentNode = new cc.Node('content');
  contentNode.addComponent(cc.UITransform);
  node.addChild(contentNode);
  pageView.content = contentNode;
  if (props.direction !== undefined) {
    pageView.direction = parseDirection(props.direction);
  }
  if (props.indicator !== undefined) {
    setupIndicator(pageView, props.indicator);
  }
  if (props.onPageChanged !== undefined) {
    node.on('page-turning', (pageIndex: number) => {
      props.onPageChanged(pageIndex);
    });
  }
}
function setupIndicator(pageView: any, indicatorProps: Record<string, any>): void {
  const indicatorNode = new cc.Node('indicator');
  indicatorNode.addComponent(cc.UITransform);
  pageView.node.addChild(indicatorNode);
  const indicator = indicatorNode.addComponent(cc.PageViewIndicator);
  if (indicatorProps.spriteFrame !== undefined) {
    indicator.spriteFrame = indicatorProps.spriteFrame;
  }
  if (indicatorProps.spacing !== undefined) {
    indicator.spacing = indicatorProps.spacing;
  }
  pageView.indicator = indicator;
}
const pageViewPropMapping: Record<string, string | ((node: any, value: any) => void)> = {
  direction: (node: any, value: any) => {
    const pageView = node.getComponent(cc.PageView);
    if (pageView) {
      pageView.direction = parseDirection(value);
    }
  },
  currentPage: (node: any, value: any) => {
    const pageView = node.getComponent(cc.PageView);
    if (pageView) {
      pageView.setCurrentPage(value);
    }
  },
  inertia: (node: any, value: any) => {
    const pageView = node.getComponent(cc.PageView);
    if (pageView) {
      pageView.inertia = !!value;
    }
  },
  elastic: (node: any, value: any) => {
    const pageView = node.getComponent(cc.PageView);
    if (pageView) {
      pageView.elastic = !!value;
    }
  },
  bounceDuration: (node: any, value: any) => {
    const pageView = node.getComponent(cc.PageView);
    if (pageView) {
      pageView.bounceDuration = value;
    }
  },
  autoPageInterval: (node: any, value: any) => {
    const pageView = node.getComponent(cc.PageView);
    if (pageView) {
      pageView.autoPageInterval = value;
    }
  },
  indicator: (node: any, value: any) => {
    const pageView = node.getComponent(cc.PageView);
    if (pageView) {
      setupIndicator(pageView, value);
    }
  },
  onPageChanged: (node: any, value: any) => {
    // Handled by applyProps event system; mapping ensures prop recognition
  },
};
function pageIndicatorFactory(node: any, props: Record<string, any>): void {
  node.addComponent(cc.PageViewIndicator);
}
const pageIndicatorPropMapping: Record<string, string | ((node: any, value: any) => void)> = {
  spriteFrame: (node: any, value: any) => {
    const indicator = node.getComponent(cc.PageViewIndicator);
    if (indicator) indicator.spriteFrame = value;
  },
  spacing: (node: any, value: any) => {
    const indicator = node.getComponent(cc.PageViewIndicator);
    if (indicator) indicator.spacing = value;
  },
  cellSize: (node: any, value: any) => {
    const indicator = node.getComponent(cc.PageViewIndicator);
    if (indicator) indicator.cellSize = value;
  },
  indicatorDistance: (node: any, value: any) => {
    const indicator = node.getComponent(cc.PageViewIndicator);
    if (indicator) indicator.indicatorDistance = value;
  },
  indicatorScale: (node: any, value: any) => {
    const indicator = node.getComponent(cc.PageViewIndicator);
    if (indicator) indicator.indicatorScale = value;
  },
  _N$normalSprite: (node: any, value: any) => {
    const indicator = node.getComponent(cc.PageViewIndicator);
    if (indicator) indicator._N$normalSprite = value;
  },
  _N$totalLength: (node: any, value: any) => {
    const indicator = node.getComponent(cc.PageViewIndicator);
    if (indicator) indicator._N$totalLength = value;
  },
  _N$currentIndex: (node: any, value: any) => {
    const indicator = node.getComponent(cc.PageViewIndicator);
    if (indicator) indicator._N$currentIndex = value;
  },
};
registerComponent('PageView', pageViewFactory);
registerPropMapping('PageView', pageViewPropMapping);
registerComponent('PageIndicator', pageIndicatorFactory);
registerPropMapping('PageIndicator', pageIndicatorPropMapping);
