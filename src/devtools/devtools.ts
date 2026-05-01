/**
 * DevTools — In-Browser Component Tree Inspector
 *
 * When the URL contains `?devtools=true`, a floating panel appears
 * in the bottom-right corner showing the live cc.Node tree hierarchy.
 *
 * Features:
 * - Collapsible floating panel with toggle button
 * - Tree view: component names, props summary, nesting indentation
 * - Auto-update: panel refreshes when the component tree changes
 * - Expand/collapse individual tree nodes
 */
// =============================================================================
// Types
// =============================================================================
interface DevToolsState {
  panelVisible: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // ms
}
// =============================================================================
// Style Constants
// =============================================================================
const PANEL_STYLES: Record<string, string> = {
  position: 'fixed',
  bottom: '12px',
  right: '12px',
  width: '380px',
  maxHeight: '60vh',
  backgroundColor: 'rgba(20, 20, 30, 0.92)',
  color: '#e0e0e0',
  fontFamily: "'SF Mono', 'Menlo', 'Consolas', monospace",
  fontSize: '12px',
  lineHeight: '1.5',
  border: '1px solid rgba(100, 140, 255, 0.35)',
  borderRadius: '8px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
  zIndex: '99999',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  transition: 'opacity 0.2s ease, transform 0.2s ease',
};
const HEADER_STYLES: Record<string, string> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 12px',
  backgroundColor: 'rgba(60, 80, 180, 0.3)',
  borderBottom: '1px solid rgba(100, 140, 255, 0.25)',
  cursor: 'pointer',
  userSelect: 'none',
  flexShrink: '0',
};
const TREE_CONTAINER_STYLES: Record<string, string> = {
  overflowY: 'auto',
  overflowX: 'hidden',
  padding: '6px 0',
  flex: '1',
  minHeight: '0',
};
const TOGGLE_BTN_STYLES: Record<string, string> = {
  position: 'fixed',
  bottom: '12px',
  right: '12px',
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: 'rgba(60, 80, 180, 0.85)',
  color: '#fff',
  border: 'none',
  fontSize: '18px',
  cursor: 'pointer',
  zIndex: '99999',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'transform 0.15s ease',
};
const FOOTER_STYLES: Record<string, string> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '6px 12px',
  backgroundColor: 'rgba(40, 40, 60, 0.5)',
  borderTop: '1px solid rgba(100, 140, 255, 0.15)',
  fontSize: '10px',
  color: '#888',
  flexShrink: '0',
};
// =============================================================================
// Utility: Apply inline styles from object
// =============================================================================
function applyStyles(el: HTMLElement, styles: Record<string, string>): void {
  for (const [key, value] of Object.entries(styles)) {
    (el.style as any)[key] = value;
  }
}
// =============================================================================
// Tree Node Rendering
// =============================================================================
const PROPS_SKIP = new Set(['children', 'key', 'ref']);
const MAX_DISPLAYED_PROPS = 4;
function formatPropsSummary(props: Record<string, any>): string {
  const entries = Object.entries(props)
    .filter(([k]) => !PROPS_SKIP.has(k))
    .slice(0, MAX_DISPLAYED_PROPS);
  if (entries.length === 0) return '';
  const parts = entries.map(([k, v]) => {
    if (typeof v === 'string') return `${k}="${v}"`;
    if (typeof v === 'number') return `${k}={${v}}`;
    if (typeof v === 'function') return `${k}={fn}`;
    if (v === null) return `${k}={null}`;
    if (typeof v === 'object') return `${k}={...}`;
    return `${k}={${typeof v}}`;
  });
  const totalRelevant = Object.keys(props).filter((k) => !PROPS_SKIP.has(k)).length;
  const suffix = totalRelevant > MAX_DISPLAYED_PROPS ? ' ...' : '';
  return parts.join(' ') + suffix;
}
function getNodeDisplayName(node: any): string {
  if (!node) return '<null>';
  const name = node.name;
  if (name && name !== 'Node') return name;
  if (node._components && Array.isArray(node._components)) {
    for (const comp of node._components) {
      const compName = comp?.constructor?.name;
      if (compName && compName !== 'UITransform') return compName;
    }
  }
  return 'Node';
}
function hasChildren(node: any): boolean {
  return node && node.children && node.children.length > 0;
}
function createTreeNode(
  node: any,
  depth: number,
  expandedSet: Set<string>,
  nodeIdMap: WeakMap<any, string>,
): HTMLElement {
  const row = document.createElement('div');
  row.style.cssText = `
    padding: 2px 8px 2px ${8 + depth * 16}px;
    cursor: pointer;
    whiteSpace: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `;
  const nodeId = nodeIdMap.get(node) || `node-${Math.random().toString(36).slice(2, 8)}`;
  if (!nodeIdMap.has(node)) nodeIdMap.set(node, nodeId);
  const isExpanded = expandedSet.has(nodeId);
  const hasKids = hasChildren(node);
  const arrow = document.createElement('span');
  arrow.style.cssText = `
    display: inline-block;
    width: 14px;
    text-align: center;
    color: #888;
    font-size: 10px;
    margin-right: 4px;
    flex-shrink: 0;
  `;
  if (hasKids) {
    arrow.textContent = isExpanded ? '▼' : '▶';
    arrow.style.cursor = 'pointer';
    arrow.style.color = '#6488ff';
  } else {
    arrow.textContent = ' ';
  }
  row.appendChild(arrow);
  const nameSpan = document.createElement('span');
  nameSpan.style.cssText = 'color: #6488ff; font-weight: 500;';
  nameSpan.textContent = getNodeDisplayName(node);
  row.appendChild(nameSpan);
  const propsInfo = getNodePropsInfo(node);
  if (propsInfo) {
    const propsSpan = document.createElement('span');
    propsSpan.style.cssText = 'color: #999; margin-left: 6px;';
    propsSpan.textContent = propsInfo;
    row.appendChild(propsSpan);
  }
  if (hasKids) {
    const badge = document.createElement('span');
    badge.style.cssText = `
      margin-left: 6px;
      background: rgba(100, 140, 255, 0.2);
      color: #6488ff;
      padding: 0 4px;
      border-radius: 3px;
      font-size: 10px;
    `;
    badge.textContent = String(node.children.length);
    row.appendChild(badge);
  }
  row.addEventListener('mouseenter', () => {
    row.style.backgroundColor = 'rgba(100, 140, 255, 0.12)';
  });
  row.addEventListener('mouseleave', () => {
    row.style.backgroundColor = 'transparent';
  });
  if (hasKids) {
    row.addEventListener('click', () => {
      if (expandedSet.has(nodeId)) {
        expandedSet.delete(nodeId);
      } else {
        expandedSet.add(nodeId);
      }
      refreshTree();
    });
  }
  row.addEventListener('dblclick', () => {
    highlightNode(node);
  });
  return row;
}
function getNodePropsInfo(node: any): string {
  if (!node) return '';
  const parts: string[] = [];
  if (node.position) {
    const x = Math.round((node.position.x ?? 0) * 10) / 10;
    const y = Math.round((node.position.y ?? 0) * 10) / 10;
    if (x !== 0 || y !== 0) {
      parts.push(`pos=(${x},${y})`);
    }
  }
  const transform = node.getComponent?.('cc.UITransform') ?? node.getComponent?.(cc?.UITransform);
  if (transform) {
    const w = Math.round((transform.contentSize?.width ?? 0) * 10) / 10;
    const h = Math.round((transform.contentSize?.height ?? 0) * 10) / 10;
    if (w > 0 || h > 0) {
      parts.push(`size=${w}×${h}`);
    }
  }
  if (node.active === false) {
    parts.push('inactive');
  }
  return parts.length > 0 ? parts.join(' ') : '';
}
function highlightNode(node: any): void {
  if (!node) return;
  const originalColor = node.color?.r !== undefined ? { ...node.color } : null;
  try {
    if (node.color) {
      const Color = cc?.Color;
      if (Color) {
        node.color = new Color(255, 255, 255, 255);
      }
    }
    setTimeout(() => {
      if (originalColor && node.color) {
        node.color.r = originalColor.r;
        node.color.g = originalColor.g;
        node.color.b = originalColor.b;
        node.color.a = originalColor.a;
      }
    }, 300);
  } catch {
    // highlight is best-effort
  }
}
// =============================================================================
// Panel State & DOM
// =============================================================================
let panelEl: HTMLElement | null = null;
let toggleBtn: HTMLElement | null = null;
let treeContainer: HTMLElement | null = null;
let footerEl: HTMLElement | null = null;
let refreshTimer: ReturnType<typeof setInterval> | null = null;
const state: DevToolsState = {
  panelVisible: true,
  autoRefresh: true,
  refreshInterval: 1000,
};
const expandedNodes: Set<string> = new Set();
const nodeIdMap: WeakMap<any, string> = new WeakMap();
const rootContainers: Set<any> = new Set();
// =============================================================================
// Tree Traversal
// =============================================================================
function renderNodeTree(node: any, depth: number, container: HTMLElement): void {
  if (!node) return;
  const nodeId = getOrAssignNodeId(node);
  const row = createTreeNode(node, depth, expandedNodes, nodeIdMap);
  container.appendChild(row);
  if (hasChildren(node) && expandedNodes.has(nodeId)) {
    for (const child of node.children) {
      renderNodeTree(child, depth + 1, container);
    }
  }
}
function getOrAssignNodeId(node: any): string {
  let id = nodeIdMap.get(node);
  if (!id) {
    id = `n-${Math.random().toString(36).slice(2, 8)}`;
    nodeIdMap.set(node, id);
  }
  return id;
}
// =============================================================================
// Refresh Logic
// =============================================================================
function refreshTree(): void {
  if (!treeContainer) return;
  treeContainer.innerHTML = '';
  if (rootContainers.size === 0) {
    try {
      const scene = cc?.director?.getScene?.();
      if (scene) {
        renderNodeTree(scene, 0, treeContainer);
      } else {
        const noContent = document.createElement('div');
        noContent.style.cssText = 'padding: 12px; color: #666; text-align: center;';
        noContent.textContent = 'No scene found. Call render() first.';
        treeContainer.appendChild(noContent);
      }
    } catch {
      const noContent = document.createElement('div');
      noContent.style.cssText = 'padding: 12px; color: #666; text-align: center;';
      noContent.textContent = 'No scene found.';
      treeContainer.appendChild(noContent);
    }
  } else {
    for (const container of rootContainers) {
      renderNodeTree(container, 0, treeContainer);
    }
  }
  updateFooter();
}
function countNodes(node: any): number {
  if (!node) return 0;
  let count = 1;
  if (node.children) {
    for (const child of node.children) {
      count += countNodes(child);
    }
  }
  return count;
}
function updateFooter(): void {
  if (!footerEl) return;
  let totalNodes = 0;
  if (rootContainers.size > 0) {
    for (const container of rootContainers) {
      totalNodes += countNodes(container);
    }
  } else {
    try {
      const scene = cc?.director?.getScene?.();
      if (scene) totalNodes = countNodes(scene);
    } catch {
      // ignore
    }
  }
  const autoLabel = state.autoRefresh ? `Auto: ${state.refreshInterval}ms` : 'Auto: off';
  footerEl.textContent = `${totalNodes} nodes · ${autoLabel}`;
}
// =============================================================================
// Panel Creation
// =============================================================================
function createPanel(): void {
  panelEl = document.createElement('div');
  panelEl.id = 'cocos-ui-devtools';
  applyStyles(panelEl, PANEL_STYLES);
  const header = document.createElement('div');
  applyStyles(header, HEADER_STYLES);
  header.innerHTML = `
    <span style="font-weight: 600; color: #6488ff; font-size: 13px;">
      🔍 CocosUI DevTools
    </span>
    <div style="display: flex; gap: 8px; align-items: center;">
      <button id="devtools-refresh" style="
        background: none; border: 1px solid rgba(100,140,255,0.3); color: #6488ff;
        padding: 2px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;
        font-family: inherit;
      ">Refresh</button>
      <button id="devtools-auto" style="
        background: none; border: 1px solid rgba(100,140,255,0.3); color: #6488ff;
        padding: 2px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;
        font-family: inherit;
      ">Auto ✓</button>
      <button id="devtools-close" style="
        background: none; border: none; color: #888; cursor: pointer; font-size: 16px;
        padding: 0 2px; line-height: 1;
      ">✕</button>
    </div>
  `;
  panelEl.appendChild(header);
  treeContainer = document.createElement('div');
  applyStyles(treeContainer, TREE_CONTAINER_STYLES);
  panelEl.appendChild(treeContainer);
  footerEl = document.createElement('div');
  applyStyles(footerEl, FOOTER_STYLES);
  panelEl.appendChild(footerEl);
  document.body.appendChild(panelEl);
  const refreshBtn = document.getElementById('devtools-refresh');
  const autoBtn = document.getElementById('devtools-auto');
  const closeBtn = document.getElementById('devtools-close');
  refreshBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    refreshTree();
  });
  autoBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    state.autoRefresh = !state.autoRefresh;
    autoBtn.textContent = state.autoRefresh ? 'Auto ✓' : 'Auto ✗';
    if (state.autoRefresh) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }
  });
  closeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    hidePanel();
  });
  refreshTree();
  if (state.autoRefresh) {
    startAutoRefresh();
  }
}
function createToggleButton(): void {
  toggleBtn = document.createElement('button');
  toggleBtn.id = 'cocos-ui-devtools-toggle';
  applyStyles(toggleBtn, TOGGLE_BTN_STYLES);
  toggleBtn.textContent = '🔍';
  toggleBtn.title = 'Open CocosUI DevTools';
  toggleBtn.addEventListener('click', () => {
    showPanel();
  });
  toggleBtn.addEventListener('mouseenter', () => {
    if (toggleBtn) toggleBtn.style.transform = 'scale(1.1)';
  });
  toggleBtn.addEventListener('mouseleave', () => {
    if (toggleBtn) toggleBtn.style.transform = 'scale(1)';
  });
  document.body.appendChild(toggleBtn);
}
function showPanel(): void {
  state.panelVisible = true;
  if (panelEl) {
    panelEl.style.display = 'flex';
    panelEl.style.opacity = '1';
    panelEl.style.transform = 'none';
  }
  if (toggleBtn) {
    toggleBtn.style.display = 'none';
  }
  refreshTree();
  if (state.autoRefresh) {
    startAutoRefresh();
  }
}
function hidePanel(): void {
  state.panelVisible = false;
  stopAutoRefresh();
  if (panelEl) {
    panelEl.style.opacity = '0';
    panelEl.style.transform = 'translateY(8px)';
    setTimeout(() => {
      if (panelEl && !state.panelVisible) {
        panelEl.style.display = 'none';
      }
    }, 200);
  }
  if (toggleBtn) {
    toggleBtn.style.display = 'flex';
  }
}
// =============================================================================
// Auto-Refresh
// =============================================================================
function startAutoRefresh(): void {
  stopAutoRefresh();
  refreshTimer = setInterval(() => {
    if (state.panelVisible) {
      refreshTree();
    }
  }, state.refreshInterval);
}
function stopAutoRefresh(): void {
  if (refreshTimer !== null) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}
// =============================================================================
// Public API
// =============================================================================
/**
 * Initialize the DevTools panel.
 *
 * When the URL contains `?devtools=true`, a floating panel appears
 * in the bottom-right corner showing the live cc.Node tree hierarchy.
 *
 * Call this once at application startup, after the first `render()` call.
 *
 * @param container - Optional: the root container node used in `render()`.
 *                    If provided, the tree view starts from this node.
 *                    If omitted, falls back to `cc.director.getScene()`.
 */
export function initDevTools(container?: any): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  const params = new URLSearchParams(window.location.search);
  if (params.get('devtools') !== 'true') {
    return;
  }
  // Track the root container for tree traversal
  if (container) {
    rootContainers.add(container);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      createPanel();
      createToggleButton();
    });
  } else {
    createPanel();
    createToggleButton();
  }
}
/**
 * Register a root container for the DevTools tree view.
 * Call this each time you call `render(vnode, container)`.
 *
 * @param container - The cc.Node container passed to `render()`
 */
export function registerDevToolsRoot(container: any): void {
  if (!container) return;
  rootContainers.add(container);
  if (state.panelVisible && treeContainer) {
    refreshTree();
  }
}
/**
 * Unregister a root container (e.g., when unmounting).
 *
 * @param container - The cc.Node container to remove
 */
export function unregisterDevToolsRoot(container: any): void {
  rootContainers.delete(container);
  if (state.panelVisible && treeContainer) {
    refreshTree();
  }
}
/**
 * Manually trigger a DevTools tree refresh.
 * Useful after programmatic DOM changes.
 */
export function refreshDevTools(): void {
  if (state.panelVisible) {
    refreshTree();
  }
}
/**
 * Destroy the DevTools panel and clean up all resources.
 */
export function destroyDevTools(): void {
  stopAutoRefresh();
  if (panelEl) {
    panelEl.remove();
    panelEl = null;
  }
  if (toggleBtn) {
    toggleBtn.remove();
    toggleBtn = null;
  }
  treeContainer = null;
  footerEl = null;
  rootContainers.clear();
  expandedNodes.clear();
}