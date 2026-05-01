/**
 * Suspense — Async loading state management with fallback UI
 *
 * Shows a fallback while child resources are loading, and switches
 * to the actual children once all resources are ready.
 *
 * Usage:
 *   <Suspense fallback={<Placeholder />}>
 *     <Sprite src="slow.png" />
 *   </Suspense>
 *
 * Convenience:
 *   shimmer()                    → default 200×100 placeholder
 *   shimmer({ width: 300 })      → 300×100 placeholder
 *   shimmer({ width: 300, height: 50 }) → 300×50 placeholder
 */
import type { VNode } from './vnode';
import { useResource, loadImage, loadFont, loadPlist } from './resource-loader';
import { getCurrentComponent } from './state';
import { registerComponent } from './create-element';
import { registerPropMapping, toNumber } from './apply-props';
// ---------------------------------------------------------------------------
// Resource type detection
// ---------------------------------------------------------------------------
/** Mapping from VNode type names to their default resource types */
const RESOURCE_TYPE_MAP: Record<string, 'image' | 'font' | 'plist'> = {
  Sprite: 'image',
  Particle2D: 'plist',
};
/**
 * Infer resource type from a VNode type and src extension.
 *
 * Uses explicit type mapping first, then falls back to file extension
 * heuristics.
 */
function inferResourceType(
  type: string | Function,
  src: string,
): 'image' | 'font' | 'plist' {
  if (typeof type === 'string' && type in RESOURCE_TYPE_MAP) {
    return RESOURCE_TYPE_MAP[type];
  }
  const lower = src.toLowerCase();
  if (lower.endsWith('.plist')) return 'plist';
  if (
    lower.endsWith('.ttf') ||
    lower.endsWith('.otf') ||
    lower.endsWith('.woff') ||
    lower.endsWith('.woff2')
  ) {
    return 'font';
  }
  return 'image';
}
/** Trigger a resource load and return the promise (deduplication is handled internally). */
function triggerLoad(
  src: string,
  type: 'image' | 'font' | 'plist',
): Promise<any> {
  switch (type) {
    case 'font':
      return loadFont(src);
    case 'plist':
      return loadPlist(src);
    default:
      return loadImage(src);
  }
}
// ---------------------------------------------------------------------------
// Resource collection from VNode tree
// ---------------------------------------------------------------------------
interface ResourceRef {
  src: string;
  type: 'image' | 'font' | 'plist';
}
/**
 * Recursively collect all resource references from a VNode tree.
 *
 * Looks for `src` and `fontSrc` props on VNodes and infers their
 * resource type from the VNode type or file extension.
 */
function collectResources(children: (VNode | string)[]): ResourceRef[] {
  const resources: ResourceRef[] = [];
  for (const child of children) {
    if (typeof child === 'string') continue;
    if (!child || typeof child !== 'object') continue;
    // Check for src prop (images, plists, etc.)
    if (child.props?.src && typeof child.props.src === 'string') {
      resources.push({
        src: child.props.src,
        type: inferResourceType(child.type, child.props.src),
      });
    }
    // Check for fontSrc prop (fonts)
    if (child.props?.fontSrc && typeof child.props.fontSrc === 'string') {
      resources.push({
        src: child.props.fontSrc,
        type: 'font',
      });
    }
    // Recurse into nested children
    if (child.props?.children) {
      const nested = Array.isArray(child.props.children)
        ? child.props.children
        : [child.props.children];
      resources.push(...collectResources(nested));
    }
  }
  return resources;
}
// ---------------------------------------------------------------------------
// Suspense Component
// ---------------------------------------------------------------------------
export interface SuspenseProps {
  /** VNode to display while resources are loading */
  fallback: VNode;
  /** Child content to display once resources are loaded */
  children?: VNode | VNode[] | string | string[];
}
/**
 * Suspense component — shows fallback while resources are loading.
 *
 * Walks children to find resource references (`src`, `fontSrc` props),
 * checks their loading state via `useResource`, and returns the fallback
 * if any are still loading. Triggers loads for idle resources and
 * schedules re-renders when loads complete.
 *
 * When all referenced resources are loaded (or in error state), renders
 * the children. Error states are treated as "done" — individual child
 * components handle their own error display.
 */
export function Suspense(props: SuspenseProps): VNode {
  const { fallback } = props;
  const rawChildren = props.children;
  // Normalize children to array
  const childArray: (VNode | string)[] = rawChildren
    ? Array.isArray(rawChildren)
      ? rawChildren
      : [rawChildren]
    : [];
  // No children → show fallback immediately
  if (childArray.length === 0) {
    return fallback;
  }
  // Collect all resource references from children
  const resources = collectResources(childArray);
  // No resources found → render children immediately
  if (resources.length === 0) {
    return wrapChildren(childArray);
  }
  // Check loading states and trigger loads for idle/loading resources
  let isLoading = false;
  const component = getCurrentComponent();
  for (const { src, type } of resources) {
    const state = useResource(src, type);
    if (state.status === 'idle' || state.status === 'loading') {
      isLoading = true;
      // Trigger the load (deduplication handles concurrent requests)
      const loadPromise = triggerLoad(src, type);
      // Schedule re-render when load completes (success or failure)
      if (component?.update) {
        loadPromise.then(
          () => {
            component.update?.();
          },
          () => {
            component.update?.();
          },
        );
      }
    }
  }
  if (isLoading) {
    return fallback;
  }
  // All resources loaded — render children
  return wrapChildren(childArray);
}
/**
 * Wrap children array into a single VNode.
 *
 * Returns the single child directly if there's only one, or wraps
 * multiple children in a Fragment VNode.
 */
function wrapChildren(childArray: (VNode | string)[]): VNode {
  if (childArray.length === 1) {
    const child = childArray[0];
    if (typeof child === 'string') {
      return { type: '#text', props: { textContent: child }, key: null };
    }
    return child;
  }
  return {
    type: 'Fragment',
    props: { children: childArray },
    key: null,
  };
}
// ---------------------------------------------------------------------------
// Placeholder Component
// ---------------------------------------------------------------------------
export interface PlaceholderProps {
  /** Width of the placeholder rectangle (default: 200) */
  width?: number;
  /** Height of the placeholder rectangle (default: 100) */
  height?: number;
  /** Border radius for rounded corners (default: 0) */
  borderRadius?: number;
  /** Fill color as CSS color string (default: '#e0e0e0') */
  color?: string;
}
/** Default placeholder dimensions */
const DEFAULT_WIDTH = 200;
const DEFAULT_HEIGHT = 100;
/**
 * Draw a rounded rectangle path on a canvas context.
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
/**
 * Placeholder factory — creates a gray rectangle with shimmer effect.
 *
 * Renders as a Cocos4 Node with a programmatically created SpriteFrame
 * (canvas-based texture with gradient overlay) and a pulsing opacity
 * animation for the shimmer effect.
 */
function createPlaceholder(node: any, props: Record<string, any>): void {
  const width = toNumber(props.width) ?? DEFAULT_WIDTH;
  const height = toNumber(props.height) ?? DEFAULT_HEIGHT;
  const borderRadius = toNumber(props.borderRadius) ?? 0;
  const color = props.color ?? '#e0e0e0';
  // Set content size via UITransform
  const transform = node.getComponent(cc.UITransform);
  if (transform) {
    transform.setContentSize(width, height);
  }
  // Create placeholder sprite
  const sprite = node.addComponent(cc.Sprite);
  sprite.type = cc.Sprite.Type.SIMPLE;
  sprite.sizeMode = cc.Sprite.SizeMode.RAW_SIZE;
  // Build canvas-based texture
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Draw background fill
    ctx.fillStyle = color;
    if (borderRadius > 0) {
      drawRoundedRect(ctx, 0, 0, width, height, borderRadius);
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, width, height);
    }
    // Draw shimmer gradient overlay
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    if (borderRadius > 0) {
      drawRoundedRect(ctx, 0, 0, width, height, borderRadius);
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, width, height);
    }
  }
  // Convert canvas to SpriteFrame
  const dataURL = canvas.toDataURL();
  const img = new Image();
  img.onload = () => {
    try {
      const imageAsset = new cc.ImageAsset(img);
      const spriteFrame = new cc.SpriteFrame(imageAsset);
      sprite.spriteFrame = spriteFrame;
    } catch {
      // Fallback: sprite remains without frame
    }
  };
  img.src = dataURL;
  // Add opacity pulse for shimmer animation
  const opacity = node.addComponent(cc.UIOpacity);
  opacity.opacity = 200;
  let increasing = false;
  node.schedule(() => {
    const current = opacity.opacity;
    if (increasing) {
      opacity.opacity = Math.min(255, current + 3);
      if (current >= 250) increasing = false;
    } else {
      opacity.opacity = Math.max(100, current - 3);
      if (current <= 110) increasing = true;
    }
  }, 0.03);
}
// Register Placeholder as a host component
registerComponent('Placeholder', createPlaceholder);
// Register Placeholder prop mappings
registerPropMapping('Placeholder', {
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
});
// ---------------------------------------------------------------------------
// Convenience Functions
// ---------------------------------------------------------------------------
/**
 * Create a Placeholder VNode with optional dimensions.
 *
 * Usage:
 *   shimmer()                          → default 200×100 placeholder
 *   shimmer({ width: 300 })            → 300×100 placeholder
 *   shimmer({ width: 300, height: 50 }) → 300×50 placeholder
 */
export function shimmer(props?: PlaceholderProps): VNode {
  return {
    type: 'Placeholder',
    props: { ...props },
    key: null,
  };
}
/**
 * Create a Placeholder VNode (alias for shimmer).
 */
export function placeholder(props?: PlaceholderProps): VNode {
  return shimmer(props);
}