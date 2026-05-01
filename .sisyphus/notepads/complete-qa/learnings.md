
## Vitest Setup - 2026-05-01

### Successful Configuration

**Dependencies installed:**
- `vitest` - Test runner
- `@vitest/coverage-v8` - Coverage provider
- `jsdom` - DOM environment

**Key configuration decisions:**
1. Used `vitest/config` instead of `vite` in vitest.config.ts to get proper test type support
2. Inherited all Vite config: jsx settings, alias resolution, jsxTemplatePlugin
3. Set `test.environment = 'jsdom'` for DOM-based component testing
4. Set `test.globals = true` to auto-import describe, it, expect
5. Coverage configured to include `src/**/*.ts` but exclude `src/__tests__/**`

**npm scripts added:**
- `npm test` / `npm run test` - Run tests once
- `npm run test:watch` - Watch mode
- `npm run test:coverage` - Run with coverage

**Files created:**
- `vitest.config.ts` - Test configuration
- `src/__tests__/setup.ts` - Global test setup with vitest type reference
- `src/__tests__/setup.test.ts` - Dummy test to verify setup

**Note:** Installation required `--legacy-peer-deps` flag due to cocos-creator peer dependency not being available in npm registry (it's a local git submodule).

## vnode.ts Unit Tests - Learnings (2026-05-01)

### Test Structure
- Created 31 comprehensive test cases covering all vnode APIs
- Tests organized in describe blocks: createVNode, flattenChildren, isValidElement, createFiber, createOrReuseFiber

### Key Patterns
1. **fiberPool management**: Use `beforeEach` to drain the fiber pool for clean test state
2. **Import fiberPool separately**: `fiberPool` is exported from `fiber-pool.ts`, not re-exported from `vnode.ts`
3. **Pool reuse testing**: To test pool reuse, first create and release a fiber, then verify the next creation returns the same object reference

### Test Coverage
- `createVNode`: 6 tests (basic creation, children flattening, key/ref extraction, empty props, null/undefined/boolean filtering)
- `flattenChildren`: 8 tests (null/undefined/boolean filtering, nested array flattening, mixed types, deeply nested arrays)
- `isValidElement`: 7 tests (valid VNode, null, plain objects, primitives, invalid structures)
- `createFiber`: 4 tests (basic creation, parent setting, pool reuse, default effectTag)
- `createOrReuseFiber`: 6 tests (custom fields, effectTag override, memoized field, pool reuse with fields, all optional fields)

### Gotchas
- `isValidElement` checks structure (type: string, props: object), not creation method - plain objects with correct structure return true
- Nested arrays in children need `as any` cast for TypeScript due to union type limitations
- fiberPool is a singleton - must drain between tests to avoid cross-test contamination

## T2: Mock Cocos4 API + Test Utilities (2026-05-01)

### Mock Design Patterns

**Chainable Mock Classes**: Mock classes return `this` from methods like `setContentSize()` and `setAnchorPoint()` to support fluent API patterns that match Cocos4's real API.

**Component Registry Compatibility**: Mock `Node.addComponent()` returns the created component instance, matching the real API that allows chaining like `node.addComponent(UITransform).getComponent()`.

**Global cc Namespace**: The `setupGlobalCc()` function installs mock classes on `globalThis.cc`, enabling test code to use `new cc.Node()`, `new cc.UITransform()`, etc. without additional imports.

### Key Mock Classes Created

- `MockNode`: Full scene graph API (children, parent, addComponent, getComponent, events)
- `MockUITransform`: Size and anchor point properties with chainable setters
- `MockComponent`: Base class with enabled, isValid, node reference
- `MockLabel`: All Label properties (string, fontSize, fontFamily, color, alignment)
- `MockSprite`: spriteFrame, type, sizeMode, color, opacity
- `MockButton`: Transition colors, clickEvents, interactable

### Test Utilities

- `createTestContainer(name?)`: Creates isolated root node for test renders
- `setupTest()`: Installs global cc mocks + fake timers
- `cleanupTest()`: Removes cc globals, clears timers and mocks
- `mockProp(name, value)`: Type-safe prop object creation
- `waitForNextFrame()`: Advances fake timers for reconciliation
- `getComponent()`, `hasComponent()`: Type-safe component assertions

### TypeScript Notes

- Import `vi` from 'vitest' explicitly in test utilities (vitest globals don't include `vi` in type checking)
- Use `as T | null` type assertion for generic component getters when MockNode's getComponent overloads don't infer correctly
- Pre-existing error in `vnode.test.ts` unrelated to new test utilities


## T4: Playwright E2E Setup - 2026-05-01

### Dependencies Installed
- `playwright` - Browser automation library
- `@playwright/test` - Test runner

### Configuration Files Created

**playwright.config.ts:**
- `testDir: './e2e'` - Test files location
- `timeout: 30000` - Global test timeout
- `expect.timeout: 10000` - Assertion timeout
- `webServer` config: Auto-starts Vite dev server on port 3000
- Single browser project: Chromium only (Desktop Chrome)
- `use.baseURL: 'http://localhost:3000'` - Base URL for tests
- Screenshots on failure, trace on first retry

**e2e/setup.ts:**
- Re-exports `test` and `expect` from @playwright/test
- Provides base for all E2E tests to import from

**e2e/demo.test.ts:**
- 4 basic tests verifying:
  1. Page loads successfully (URL check)
  2. Page title contains "WebGL Preview"
  3. Canvas element is visible
  4. Loading status element is visible

### npm Scripts Added
- `npm run test:e2e` - Run Playwright E2E tests

### Browser Installation
- `npx playwright install chromium` - Downloads Chromium for testing

### Notes
- Installation used `--legacy-peer-deps` flag (consistent with project pattern)
- Vite dev server auto-starts via webServer config (no manual start needed)
- Tests use `page.goto('http://localhost:3000')` to access the dev server
- Only Chromium configured (no multi-browser setup per requirements)
