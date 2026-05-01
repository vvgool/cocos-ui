/**
 * Create-Element Factory — VNode to Cocos4 Node conversion
 *
 * Creates the host node for a VNode by:
 * 1. Instantiating a cc.Node
 * 2. Adding cc.UITransform component
 * 3. Calling the registered component factory (if any)
 *
 * ComponentRegistry pattern: components self-register their factory functions.
 * Unknown types get a plain Node with a warning.
 */
import type { VNode } from './vnode';
import { Fragment } from './jsx-runtime';

/**
 * Maps cc.Node instances to their registered component type name (e.g., 'Label', 'Button').
 * Used by applyProps to look up component-specific prop mappings without relying on node.name
 * (which can be overridden by user-provided `id` props).
 */
export const nodeComponentTypes = new WeakMap<any, string>();
// Cocos Creator global namespace — typed as `any` since cocos-creator is a peerDep
// not installed at compile time. All cc.* references use this declaration.
/**
 * Component factory signature — receives the newly created node and props
 * @param node - cc.Node instance (typed as `any` since cc typings not available at compile time)
 * @param props - VNode props object
 */
export type ComponentFactory = (node: any, props: Record<string, any>) => void;
/**
 * Registry mapping component type names to their factory functions.
 * Components register themselves on initialization via registerComponent().
 */
export const ComponentRegistry: Map<string, ComponentFactory> = new Map();
/**
 * Register a component factory with the registry.
 * Components call this at module load time to expose their creation logic.
 *
 * @param name - Component type name (matches VNode.type)
 * @param factory - Factory function that creates and configures the component
 */
export function registerComponent(name: string, factory: ComponentFactory): void {
  ComponentRegistry.set(name, factory);
}
/**
 * Get the factory function for a named component type.
 *
 * @param name - Component type name to look up
 * @returns The factory function, or undefined if not registered
 */
export function getComponentFactory(name: string): ComponentFactory | undefined {
  return ComponentRegistry.get(name);
}
/**
 * Create the Cocos4 host node for a VNode.
 *
 * Process:
 * 1. Create a plain cc.Node (or reuse an existingNode from pool)
 * 2. Add cc.UITransform component (required for all UI nodes)
 * 3. Set node name from props.id or fallback to type name
 * 4. Call registered component factory if found
 * 5. For Fragment, create an empty container node
 *
 * @param vnode - The VNode to create a host node for
 * @param existingNode - Optional pre-allocated node for node pool reuse
 * @returns A Cocos4 Node instance (typed as `any`)
 */
export function createHostNode(vnode: VNode, existingNode?: any): any {
  // Fragment creates an empty container node
  if (vnode.type === Fragment) {
    if (existingNode) {
      existingNode.name = vnode.props?.id ?? 'Fragment';
      return existingNode;
    }
    const node = new (cc as any).Node();
    const uitransform = node.addComponent((cc as any).UITransform);
    node.name = vnode.props?.id ?? 'Fragment';
    return node;
  }
  // Reuse existing node from pool, or create new one
  const node = existingNode ?? new (cc as any).Node();
  // Only add UITransform if it doesn't exist yet (pooled node may still have it)
  if (!node.getComponent((cc as any).UITransform)) {
    node.addComponent((cc as any).UITransform);
  }
  // Name the node — use id from props, fallback to type name
  const typeName = typeof vnode.type === 'string' ? vnode.type : 'Component';
  node.name = vnode.props?.id ?? typeName;
  // Store component type separately for prop mapping lookups (A3 fix)
  // This is needed because node.name can be overridden by user-provided `id` prop,
  // which would break component-specific prop mappings in applyProps
  nodeComponentTypes.set(node, typeName);
  // Look up and call the registered component factory
  const factory = getComponentFactory(vnode.type as string);
  if (factory) {
    factory(node, vnode.props);
  } else {
    console.warn(`[create-element] No factory registered for component: ${vnode.type}. Creating plain Node.`);
  }
  return node;
}