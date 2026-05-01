/**
 * View — Base container component wrapping Cocos4 Node/UITransform
 *
 * View is the base container component that encapsulates a cc.Node with
 * cc.UITransform for layout. It provides the fundamental props for positioning,
 * sizing, scaling, and visibility of UI elements.
 *
 * Props are applied via registered prop mappings that handle conversion to
 * Cocos4 APIs (e.g., width/height → setContentSize, anchorX/anchorY → setAnchorPoint).
 */
import { registerComponent } from '../core/create-element';
import { registerPropMapping, toNumber, parseColor } from '../core/apply-props';
/**
 * View factory function
 *
 * Minimal factory since View is essentially a plain cc.Node with UITransform.
 * All prop application is handled by the registered prop mappings below.
 *
 * @param node - The cc.Node instance created by createHostNode
 * @param props - VNode props passed during creation
 */
function factory(node: any, props: Record<string, any>): void {
  // View is a base container - no special component setup needed beyond UITransform
  // All props (position, size, scale, rotation, opacity, visibility) are handled
  // by the prop mappings registered below
}
// Register View component with the component registry
registerComponent('View', factory);
// Register View prop mappings
// These map VNode props to Cocos4 node/property APIs with type conversion
registerPropMapping('View', {
  width: (node: any, value: any) => {
    const transform = node.getComponent(cc.UITransform);
    if (transform) {
      transform.setContentSize(toNumber(value), transform.contentSize.height);
    }
  },
  height: (node: any, value: any) => {
    const transform = node.getComponent(cc.UITransform);
    if (transform) {
      transform.setContentSize(transform.contentSize.width, toNumber(value));
    }
  },
  x: (node: any, value: any) => {
    node.setPosition(toNumber(value), node.position.y);
  },
  y: (node: any, value: any) => {
    node.setPosition(node.position.x, toNumber(value));
  },
  anchorX: (node: any, value: any) => {
    const transform = node.getComponent(cc.UITransform);
    if (transform) {
      transform.setAnchorPoint(toNumber(value), transform.anchorPoint.y);
    }
  },
  anchorY: (node: any, value: any) => {
    const transform = node.getComponent(cc.UITransform);
    if (transform) {
      transform.setAnchorPoint(transform.anchorPoint.x, toNumber(value));
    }
  },
  scaleX: (node: any, value: any) => {
    node.setScale(toNumber(value), node.scale.y);
  },
  scaleY: (node: any, value: any) => {
    node.setScale(node.scale.x, toNumber(value));
  },
  rotation: (node: any, value: any) => {
    node.setRotationFromEuler(toNumber(value), 0, 0);
  },
  opacity: (node: any, value: any) => {
    const uiRenderer = node.getComponent(cc.UIOpacity);
    if (uiRenderer) {
      uiRenderer.opacity = toNumber(value);
    } else {
      const opacity = node.addComponent(cc.UIOpacity);
      opacity.opacity = toNumber(value);
    }
  },
  color: (node: any, value: any) => {
    node.color = parseColor(value);
  },
  visible: (node: any, value: any) => {
    node.active = value;
  },
});