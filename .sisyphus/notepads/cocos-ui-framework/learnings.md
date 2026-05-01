# Learnings - cocos-ui-framework

## Conventions
- TypeScript strict mode enabled
- JSX: react-jsx transform with jsxImportSource: "cocos-ui"
- Module: ESNext with bundler resolution
- Build: tsup (ESM + CJS + .d.ts)
- No external UI framework dependencies
- 1 JSX element → 1 Cocos4 Node

## Patterns
- VNode is the core data structure: { type, props, key, ref }
- Component registry pattern for factory functions
- Props mapping via registered mappings per component
- Signal-based reactive state (createSignal, createEffect, useState)
- Reconciler: CREATE/UPDATE/DELETE effect tags, O(n) children diff

## Gotchas
- VNode interface is defined in BOTH jsx-runtime.ts and vnode.ts — they are structurally compatible
- tsconfig has noEmit: true for type-checking only; actual build uses tsup
- cocos-creator is a peerDep — not installed at compile time. Use `declare const cc: any` to reference Cocos4 globals without importing.
- Fragment = 'Fragment' constant from jsx-runtime, not a special class

## 2026-04-25 T9: Resource Loader
- ResourceLoader uses Map<string, CacheEntry> with composite keys (`type::src`) for deduplication
- Failed loads are removed from cache immediately (in .catch) to allow retry
- In-flight promises are stored on the CacheEntry for dedup — cleared after resolution
- cc.SpriteFrame is constructed from cc.ImageAsset: `new cc.SpriteFrame(imageAsset)`
- cc.assetManager.loadRemote uses `{ type: cc.ImageAsset }` or `{ type: cc.TTFFont }` options
- Singleton pattern with bound convenience exports (loadImage, loadFont, useResource, clearCache)

## 2026-04-25 T7: Props Mapper
- applyProps uses diff-based update: iterates union of oldProps+newProps keys, skips unchanged
- PropMappings registry follows same pattern as ComponentRegistry in create-element.ts
- Style props are nested objects (style: { width, height, ... }) — applyStyle diffs them separately
- Event props detected by isEventProp: starts with 'on' + uppercase letter
- Event name mapping: onClick→'click', onTouchStart→'touch-start', fallback camelCase→kebab-case
- Event handlers tracked via WeakMap<node, Map<propName, handler>> for cleanup on unbind
- parseColor handles #RGB, #RRGGBB, #RRGGBBAA, and object pass-through; uses cc.Color when available
- toNumber converts string numerics ('24'→24), passes through numbers, returns original on failure
- STYLE_DEFAULTS used for resetting removed style props (anchorX/Y default 0.5, opacity 255, etc.)
- ref prop: only clears oldRef.current=null; reconciler sets newRef.current after node creation
- children/key props are skipped (reconciler handles them)
- removeProps(node, oldProps) is a convenience wrapper: applyProps(node, oldProps, {})

## 2026-04-25 T8: Reconciler
- Reconciler uses minimal Fiber: child/sibling/parent/effectTag/alternate — no lanes/priorities/concurrent
- Key-based child reconciliation: Map<string|null, FiberNode> for O(1) lookup by key; positional fallback when no keys
- DELETE fibers are appended after new children in the sibling list, collected during commit phase
- Commit order: CREATE/UPDATE first (build tree), then DELETE (cleanup) — ensures parent nodes exist before children attach
- Function components: setCurrentComponent({ update: reRenderFn }) before calling componentFn, cleared in finally block
- scheduleUpdate uses queueMicrotask for batching; pendingRenders Set deduplicates same component re-renders
- Text nodes: VNode type '#text' with props.textContent → cc.Node + cc.Label
- Fragment: type 'Fragment' from jsx-runtime, creates container node via createHostNode, reconciles children into parent
- render(null, container) destroys entire tree via destroyNodeTree (depth-first recursive destroy)
- rootFibers WeakMap<any, FiberNode> tracks per-container root fibers
- shallowEqual skips 'children' and 'key' keys, does structural comparison of children array (by key/type)
- performUpdate re-renders component function, reconciles output, and commits immediately
- Unused import EffectTag removed; unused isTextValue function removed
