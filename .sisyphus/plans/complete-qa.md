# CocosUI 完整质量保障计划

## TL;DR

> **Quick Summary**: 为 CocosUI JSX UI 框架建立完整的质量保障体系，包括测试基础设施 (Vitest + Playwright)、文档 (README + API 文档 + 使用指南)、CI/CD (GitHub Actions)，以及 alpha/beta 预发布流程。
>
> **Deliverables**:
> - Vitest 单元测试框架 + 50+ 测试用例
> - Playwright E2E 测试框架 + 20+ 场景验证
> - README.md + API 文档 + 使用指南
> - GitHub Actions CI/CD workflows
> - npm alpha/beta 预发布
>
> **Estimated Effort**: Large (3 weeks)
> **Parallel Execution**: YES — 6 waves, max 8 concurrent tasks
> **Critical Path**: Test Infra → Core Tests → Component Tests → E2E → Docs → CI/CD → Release

---

## Context

### Original Request
用户选择"方案 C：完整质量保障" — 为 CocosUI 项目建立包含测试、文档、CI/CD 的完整质量保证体系。

### Interview Summary

| # | 决策项 | 选择 | 理由 |
|---|--------|------|------|
| 1 | 测试框架 | Vitest + Playwright | Vite 原生，快速，ESM 支持最佳 |
| 2 | 文档深度 | Standard (README + API docs + Guides) | 3-4 天完成，平衡深度和工作量 |
| 3 | CI/CD 平台 | GitHub Actions | 免费，集成好，推荐方案 |
| 4 | 发布策略 | Pre-release first (alpha/beta) | 收集反馈后再发布 v1.0.0 |
| 5 | 时间规划 | Thorough (3 weeks) | 完整 QA 包含文档网站和完整测试覆盖 |

### Research Findings

**测试基础设施**:
- 现状：ZERO — 无测试文件、无配置、无依赖
- Cocos4 依赖有完整的 Jest 测试 (100+ 文件)
- 推荐：Vitest (Vite 原生) + Playwright (E2E)

**CI/CD 状态**:
- 现状：NONE — 无 GitHub workflows，无 npm 发布脚本
- package.json 结构完整但无自动化
- 推荐：GitHub Actions (CI + publish)

**文档状态**:
- JSDoc: ✅ 优秀 — 170 个注释块
- 示例：✅ 优秀 — demo.tsx 399 行
- README.md: ❌ 缺失 (关键缺口)
- API 文档：❌ 缺失
- License: ❌ 缺失

### Metis Review

**Identified Gaps**:
1. **Cocos4 依赖问题**: deps/cocos4 是 git submodule，测试环境需要特殊配置
2. **浏览器兼容性**: Playwright 需要配置多浏览器测试
3. **覆盖率目标**: 需要设定合理的测试覆盖率阈值
4. **文档托管**: 需要决定 API 文档托管方案 (GitHub Pages?)
5. **npm 认证**: 需要配置 npm token 用于自动发布

---

## Work Objectives

### Core Objective
为 CocosUI 建立完整的质量保障体系，确保代码质量、文档完整、自动化测试和发布流程，为 alpha/beta 预发布做好准备。

### Concrete Deliverables
- Vitest 配置 + 50+ 单元测试用例
- Playwright 配置 + 20+E2E 测试场景
- README.md (安装、快速开始、组件列表)
- API 文档 (TypeDoc 生成)
- 使用指南 (状态管理、主题、动画)
- GitHub Actions workflows (CI + publish)
- npm alpha/beta 预发布

### Definition of Done
- [ ] `npm test` 运行所有测试，通过率 100%
- [ ] `npm run test:coverage` 覆盖率 ≥80%
- [ ] `npm run test:e2e` E2E 测试全部通过
- [ ] README.md 存在且包含完整安装和使用说明
- [ ] API 文档生成成功
- [ ] GitHub Actions CI workflow 运行成功
- [ ] npm publish --dry-run 成功
- [ ] alpha/beta 版本发布到 npm

### Must Have
- Vitest 单元测试框架
- Playwright E2E 测试框架
- README.md 完整文档
- API 文档 (TypeDoc)
- GitHub Actions CI workflow
- npm 发布配置
- 测试覆盖率报告

### Must NOT Have (Guardrails)
- ❌ 不测试 Cocos4 引擎内部逻辑（只测 CocosUI 封装层）
- ❌ 不追求 100% 测试覆盖率（目标 80%+）
- ❌ 不使用复杂的 mock 方案（用简单 stub）
- ❌ 不编写冗长的集成文档（保持简洁）
- ❌ 不配置复杂的 monorepo 测试（单仓库测试）
- ❌ 不实现自动语义化版本（手动版本号）

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: YES (TDD for new code, tests-after for existing)
- **Framework**: Vitest (unit) + Playwright (E2E)
- **Agent QA**: ALL tasks verified via test execution + evidence capture

### QA Policy
每个测试任务必须包含：
- 测试文件路径
- 测试用例数量
- 覆盖率要求
- 证据文件路径

- **Unit Tests**: Vitest run + coverage report
- **E2E Tests**: Playwright test + screenshots
- **Evidence**: `.sisyphus/evidence/test-{N}-{scenario}.png|.txt`

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Test Infrastructure — 4 tasks, ALL parallel):
├── T1: Vitest 配置 + 测试脚本 [quick]
├── T2: 测试工具函数 + Mock 设置 [quick]
├── T3: 首个单元测试 (vnode.test.ts) [quick]
└── T4: Playwright 配置 + E2E 脚手架 [quick]

Wave 2 (Core Engine Tests — 5 tasks, ALL parallel after Wave 1):
├── T5: JSX Runtime 测试 [quick]
├── T6: State/Signal 测试 [deep]
├── T7: Reconciler 测试 [deep]
├── T8: Resource Loader 测试 [unspecified-high]
└── T9: Error Boundary + Suspense 测试 [quick]

Wave 3 (Component Tests — 17 tasks, ALL parallel after Wave 2):
├── T10: View 组件测试 [quick]
├── T11: Label 组件测试 [quick]
├── T12: Button 组件测试 [quick]
├── T13: Sprite 组件测试 [quick]
├── T14: Layout 组件测试 (VBox/HBox) [quick]
├── T15: ScrollView 组件测试 [deep]
├── T16: Toggle 组件测试 [quick]
├── T17: Slider 组件测试 [quick]
├── T18: ProgressBar 组件测试 [quick]
├── T19: EditBox 组件测试 [quick]
├── T20: RichText 组件测试 [quick]
├── T21: PageView 组件测试 [deep]
├── T22: Mask 组件测试 [quick]
├── T23: Graphics 组件测试 [quick]
├── T24: SafeArea + Widget 测试 [quick]
├── T25: Particle2D 组件测试 [unspecified-high]
├── T26: Animation/Tween 测试 [deep]
└── T27: Theme 系统测试 [quick]

Wave 4 (Documentation — 5 tasks, ALL parallel after Wave 2):
├── T28: README.md 编写 [visual-engineering]
├── T29: TypeDoc API 文档生成 [quick]
├── T30: 状态管理指南 [writing]
├── T31: 主题系统指南 [writing]
├── T32: 动画系统指南 [writing]

Wave 5 (CI/CD — 4 tasks, ALL parallel after Wave 3+4):
├── T33: GitHub Actions CI workflow [quick]
├── T34: GitHub Actions publish workflow [quick]
├── T35: npm 发布配置 [quick]
└── T36: Git 初始化 + 首次提交 [git-master]

Wave 6 (Pre-release — 3 tasks, sequential after Wave 5):
├── T37: alpha 版本测试发布 [quick]
├── T38: beta 版本测试发布 [quick]
└── T39: 最终验证 + 用户文档审查 [deep]

Wave FINAL (Verification — 4 tasks, ALL parallel after Wave 6):
├── F1: Plan Compliance Audit (oracle)
├── F2: Code Quality Review (unspecified-high)
├── F3: Test Coverage Verification (unspecified-high)
└── F4: Documentation Completeness Check (deep)
```

**Critical Path**: T1 → T5 → T7 → T10 → T28 → T33 → T37 → T39 → F1-F4
**Parallel Speedup**: ~70% faster than sequential
**Max Concurrent**: 17 (Wave 3 - Component Tests)

### Dependency Matrix

| Task | Dependencies | Blocks |
|------|--------------|--------|
| T1-T4 | None | T5-T9, T10-T27 |
| T5-T9 | T1-T4 | T10-T27, T37-T39 |
| T10-T27 | T5-T9 | T37-T39 |
| T28-T32 | T5-T9 (for examples) | T33-T36 |
| T33-T36 | T28-T32 | T37-T39 |
| T37-T39 | T33-T36 | F1-F4 |
| F1-F4 | T37-T39 | Release |

### Agent Dispatch Summary

- **Wave 1**: 4 tasks — `quick` x4
- **Wave 2**: 5 tasks — `quick` x2, `deep` x2, `unspecified-high` x1
- **Wave 3**: 17 tasks — `quick` x13, `deep` x3, `unspecified-high` x1
- **Wave 4**: 5 tasks — `visual-engineering` x1, `quick` x1, `writing` x3
- **Wave 5**: 4 tasks — `quick` x3, `git-master` x1
- **Wave 6**: 3 tasks — `quick` x2, `deep` x1
- **FINAL**: 4 tasks — `oracle`, `unspecified-high` x2, `deep`

---

## TODOs

- [x] 1. **Vitest 配置 + 测试脚本**

  **What to do**:
  - 安装 Vitest 依赖：`npm install -D vitest @vitest/coverage-v8 jsdom`
  - 创建 `vitest.config.ts`：集成 Vite 配置，配置 test.include, test.environment
  - 添加测试脚本到 package.json：
    - `"test": "vitest run"`
    - `"test:watch": "vitest"`
    - `"test:coverage": "vitest run --coverage"`
  - 创建 `src/__tests__/setup.ts`：全局测试设置，Cocos4 mock
  - 配置 tsconfig.test.json：测试专用 TypeScript 配置

  **Must NOT do**:
  - 不要配置复杂的 mock 方案
  - 不要引入 Jest（与 Vite 不兼容）

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T2, T3, T4)
  - **Blocks**: ALL test tasks (T5-T27)
  - **Blocked By**: None

  **References**:
  - Vitest 官方文档：`https://vitest.dev/config/`
  - Vite + Vitest 集成示例

  **Acceptance Criteria**:
  - [ ] `vitest.config.ts` 文件存在
  - [ ] `npm test` 命令存在
  - [ ] `npm run test:coverage` 命令存在

  **QA Scenarios**:
  ```
  Scenario: Vitest 配置验证
    Tool: Bash
    Steps:
      1. npm test
      2. 验证 Vitest 启动（即使无测试）
    Expected Result: Vitest 启动成功，无配置错误
    Evidence: .sisyphus/evidence/task-1-vitest-setup.txt
  ```

  **Commit**: YES (与 T2, T3, T4 一起)
  - Message: `feat(test): vitest configuration and test scripts`
  - Files: `vitest.config.ts, package.json, src/__tests__/setup.ts`

- [x] 2. **测试工具函数 + Mock 设置**

  **What to do**:
  - 创建 `src/__tests__/utils/mock-cocos.ts`：Cocos4 API mock
  - 创建 `src/__tests__/utils/test-utils.ts`：通用测试工具函数
  - Mock cc.Node, cc.UITransform, cc.Label 等核心类
  - 创建测试容器工具函数：`createTestContainer()`, `cleanupTest()`
  - 配置全局 beforeEach/afterEach hooks

  **Must NOT do**:
  - 不要 mock 过于复杂的 Cocos4 行为
  - 不要实现完整的 Cocos4 模拟器

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T3, T4)
  - **Blocks**: ALL test tasks (T5-T27)
  - **Blocked By**: T1

  **References**:
  - Vitest mock 文档：`https://vitest.dev/guide/mocking.html`
  - Cocos4 类型定义：`deps/cocos4/cocos/core.d.ts`

  **Acceptance Criteria**:
  - [ ] mock-cocos.ts 文件存在
  - [ ] test-utils.ts 文件存在
  - [ ] 测试可以使用 cc.Node mock

  **QA Scenarios**:
  ```
  Scenario: Mock 验证
    Tool: Bash (node REPL)
    Steps:
      1. import { mockNode } from './__tests__/utils/mock-cocos'
      2. const node = mockNode()
      3. node.addComponent('UITransform')
      4. 验证无错误
    Expected Result: Mock 对象正常工作
    Evidence: .sisyphus/evidence/task-2-mock-test.txt
  ```

  **Commit**: YES (与 T1, T3, T4 一起)
  - Message: `feat(test): test utilities and Cocos4 mocks`
  - Files: `src/__tests__/utils/*.ts`

- [x] 3. **首个单元测试 (vnode.test.ts)**

  **What to do**:
  - 创建 `src/core/__tests__/vnode.test.ts`
  - 测试 createVNode 函数
  - 测试 createFiber 函数
  - 测试 flattenChildren 函数
  - 测试 isValidElement 函数
  - 覆盖边界情况：null children, nested arrays, Fragment

  **Must NOT do**:
  - 不要测试 reconciler（那是 T7 的任务）
  - 不要测试组件渲染（那是组件测试的任务）

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T2, T4)
  - **Blocks**: T5-T9 (core tests)
  - **Blocked By**: T1, T2

  **References**:
  - VNode 实现：`src/core/vnode.ts`
  - Vitest 测试示例：`https://vitest.dev/guide/#examples`

  **Acceptance Criteria**:
  - [ ] vnode.test.ts 文件存在
  - [ ] 至少 10 个测试用例
  - [ ] `npm test src/core/__tests__/vnode.test.ts` 通过

  **QA Scenarios**:
  ```
  Scenario: VNode 测试运行
    Tool: Bash
    Steps:
      1. npm test src/core/__tests__/vnode.test.ts
      2. 验证所有测试通过
    Expected Result: 10+ 测试用例全部通过
    Evidence: .sisyphus/evidence/task-3-vnode-test.txt
  ```

  **Commit**: YES (与 T1, T2, T4 一起)
  - Message: `test(core): vnode unit tests`
  - Files: `src/core/__tests__/vnode.test.ts`

- [x] 4. **Playwright 配置 + E2E 脚手架**

  **What to do**:
  - 安装 Playwright：`npm install -D playwright @playwright/test`
  - 创建 `playwright.config.ts`：配置 testDir, timeout, browser
  - 创建 `e2e/setup.ts`：E2E 测试设置
  - 创建 `e2e/demo.test.ts`：首个 E2E 测试（验证 demo.tsx 渲染）
  - 添加 E2E 脚本：`"test:e2e": "playwright test"`
  - 安装 Playwright 浏览器：`npx playwright install`

  **Must NOT do**:
  - 不要配置过多的浏览器（只用 Chromium 测试）
  - 不要测试 Cocos4 内部功能

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[playwright]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T2, T3)
  - **Blocks**: T15, T21, T37-T39 (E2E 相关)
  - **Blocked By**: T1

  **References**:
  - Playwright 官方文档：`https://playwright.dev/docs/intro`
  - Playwright + Vite 集成示例

  **Acceptance Criteria**:
  - [ ] playwright.config.ts 文件存在
  - [ ] `npm run test:e2e` 命令存在
  - [ ] e2e/demo.test.ts 文件存在
  - [ ] Playwright 浏览器已安装

  **QA Scenarios**:
  ```
  Scenario: Playwright 配置验证
    Tool: Bash
    Steps:
      1. npm run test:e2e
      2. 验证 Playwright 启动（即使只有一个测试）
    Expected Result: Playwright 启动成功，测试运行
    Evidence: .sisyphus/evidence/task-4-playwright-setup.txt
  ```

  **Commit**: YES (与 T1, T2, T3 一起)
  - Message: `feat(e2e): playwright configuration and scaffolding`
  - Files: `playwright.config.ts, e2e/`

---

- [x] 5. **JSX Runtime 测试**

  **What to do**:
  - 创建 `src/core/__tests__/jsx-runtime.test.ts`
  - 测试 jsx() 函数
  - 测试 jsxs() 函数
  - 测试 Fragment 支持
  - 测试 children 扁平化
  - 测试 isValidElement()

  **Must NOT do**:
  - 不要测试 reconciler（T7 的任务）
  - 不要测试组件渲染

  **Recommended Agent Profile**: `quick`
  **Parallelization**: Wave 2 (with T6-T9), Blocked By: T1-T3
  **Acceptance Criteria**: 8+ 测试用例全部通过
  **QA Scenarios**: Bash 运行测试验证通过率
  **Commit**: YES — `test(core): jsx-runtime unit tests`
  **Files**: `src/core/__tests__/jsx-runtime.test.ts`

- [x] 6. **State/Signal 测试**

  **What to do**:
  - 创建 `src/core/__tests__/state.test.ts`
  - 测试 createSignal (getter/setter)
  - 测试 createEffect (依赖追踪)
  - 测试 useState (组件状态)
  - 测试 batch (批量更新)
  - 测试 createStore (全局状态)
  - 测试信号组合和嵌套

  **Must NOT do**:
  - 不要测试组件 re-render（那是组件测试的任务）

  **Recommended Agent Profile**: `deep`
  **Parallelization**: Wave 2 (with T5, T7-T9), Blocked By: T1-T2
  **Acceptance Criteria**: 15+ 测试用例全部通过
  **QA Scenarios**: Bash 运行测试 + 覆盖率验证
  **Commit**: YES — `test(core): state/signal unit tests`
  **Files**: `src/core/__tests__/state.test.ts`

- [x] 7. **Reconciler 测试**

  **What to do**:
  - 创建 `src/core/__tests__/reconciler.test.ts`
  - 测试 render() 初始渲染
  - 测试 props 更新（Node 复用）
  - 测试 children diff（keyed children）
  - 测试 Node 清理（render null）
  - 测试错误处理

  **Must NOT do**:
  - 不要测试完整的组件生命周期（那是组件测试的任务）

  **Recommended Agent Profile**: `deep`
  **Parallelization**: Wave 2 (with T5-T6, T8-T9), Blocked By: T1-T3, T5-T6
  **Acceptance Criteria**: 12+ 测试用例全部通过
  **QA Scenarios**: Bash 运行测试 + 验证 Node 复用
  **Commit**: YES — `test(core): reconciler unit tests`
  **Files**: `src/core/__tests__/reconciler.test.ts`

- [x] 8. **Resource Loader 测试**

  **What to do**:
  - 创建 `src/core/__tests__/resource-loader.test.ts`
  - 测试 loadImage 函数
  - 测试 loadFont 函数
  - 测试资源缓存（重复加载）
  - 测试 useResource hook
  - 测试错误处理（加载失败）

  **Must NOT do**:
  - 不要测试真实的网络请求（用 mock）

  **Recommended Agent Profile**: `unspecified-high`
  **Parallelization**: Wave 2 (with T5-T7, T9), Blocked By: T1-T2
  **Acceptance Criteria**: 10+ 测试用例全部通过
  **QA Scenarios**: Bash 运行测试 + 验证缓存逻辑
  **Commit**: YES — `test(core): resource-loader unit tests`
  **Files**: `src/core/__tests__/resource-loader.test.ts`

- [x] 9. **Error Boundary + Suspense 测试**

  **What to do**:
  - 创建 `src/core/__tests__/error-boundary.test.ts`
  - 测试 errorBoundary HOC
  - 测试 fallback 渲染
  - 测试错误日志记录
  - 创建 `src/core/__tests__/suspense.test.ts`
  - 测试 Suspense 组件
  - 测试加载状态
  - 测试骨架屏占位符

  **Must NOT do**:
  - 不要测试复杂的错误场景（保持简单）

  **Recommended Agent Profile**: `quick`
  **Parallelization**: Wave 2 (with T5-T8), Blocked By: T5-T8
  **Acceptance Criteria**: 10+ 测试用例全部通过
  **QA Scenarios**: Bash 运行测试 + 验证 fallback 渲染
  **Commit**: YES — `test(core): error-boundary and suspense tests`
  **Files**: `src/core/__tests__/error-boundary.test.ts, src/core/__tests__/suspense.test.ts`

---

- [x] 10. **View 组件测试**

  **What to do**:
  - 创建 `src/components/__tests__/view.test.tsx`
  - 测试 View 渲染（width, height, opacity）
  - 测试 props 更新
  - 测试 children 渲染
  - 测试 ref 转发

  **Recommended Agent Profile**: `quick`
  **Parallelization**: Wave 3a (with T11-T27), Blocked By: T5-T9
  **Acceptance Criteria**: 6+ 测试用例全部通过
  **QA Scenarios**: Bash 运行测试
  **Commit**: YES — `test(components): View container tests`
  **Files**: `src/components/__tests__/view.test.tsx`

- [x] 11. **Label 组件测试**

  **What to do**:
  - 创建 `src/components/__tests__/label.test.tsx`
  - 测试 Label 渲染（text, fontSize, color）
  - 测试字体加载（mock）
  - 测试加载失败降级

  **Recommended Agent Profile**: `quick`
  **Parallelization**: Wave 3a, Blocked By: T5-T9
  **Acceptance Criteria**: 6+ 测试用例全部通过
  **QA Scenarios**: Bash 运行测试
  **Commit**: YES — `test(components): Label component tests`
  **Files**: `src/components/__tests__/label.test.tsx`

- [x] 12. **Button 组件测试**

  **What to do**:
  - 创建 `src/components/__tests__/button.test.tsx`
  - 测试 Button 渲染（text, disabled）
  - 测试 onClick 事件
  - 测试 transition 属性
  - 测试自定义内容（children）

  **Recommended Agent Profile**: `quick`
  **Parallelization**: Wave 3b, Blocked By: T5-T9, T10-T11
  **Acceptance Criteria**: 8+ 测试用例全部通过
  **QA Scenarios**: Bash 运行测试 + 事件验证
  **Commit**: YES — `test(components): Button component tests`
  **Files**: `src/components/__tests__/button.test.tsx`

- [x] 13. **Sprite 组件测试**

  **What to do**:
  - 创建 `src/components/__tests__/sprite.test.tsx`
  - 测试 Sprite 渲染
  - 测试图片加载（mock）
  - 测试加载中占位符
  - 测试加载失败错误图标

  **Recommended Agent Profile**: `quick`
  **Parallelization**: Wave 3a, Blocked By: T5-T9
  **Acceptance Criteria**: 8+ 测试用例全部通过
  **QA Scenarios**: Bash 运行测试
  **Commit**: YES — `test(components): Sprite component tests`
  **Files**: `src/components/__tests__/sprite.test.tsx`

- [x] 14. **Layout 组件测试 (VBox/HBox)**

  **What to do**:
  - 创建 `src/components/__tests__/layout.test.tsx`
  - 测试 VBox 纵向排列
  - 测试 HBox 横向排列
  - 测试 spacing 属性
  - 测试 padding 属性

  **Recommended Agent Profile**: `quick`
  **Parallelization**: Wave 3a, Blocked By: T5-T9, T10
  **Acceptance Criteria**: 8+ 测试用例全部通过
  **QA Scenarios**: Bash 运行测试
  **Commit**: YES — `test(components): Layout (VBox/HBox) tests`
  **Files**: `src/components/__tests__/layout.test.tsx`

- [x] 15. **ScrollView 组件测试**

  **What to do**:
  - 创建 `src/components/__tests__/scroll-view.test.tsx`
  - 测试 ScrollView 渲染
  - 测试滚动方向
  - 测试 content 子节点
  - 测试 onScroll 事件

  **Recommended Agent Profile**: `deep`
  **Parallelization**: Wave 3c, Blocked By: T5-T9, T10
  **Acceptance Criteria**: 8+ 测试用例全部通过
  **QA Scenarios**: Bash 运行测试
  **Commit**: YES — `test(components): ScrollView component tests`
  **Files**: `src/components/__tests__/scroll-view.test.tsx`

- [x] 16. **Toggle 组件测试**

  **What to do**:
  - 创建 `src/components/__tests__/toggle.test.tsx`
  - 测试 Toggle 渲染
  - 测试 checked 属性
  - 测试 onChange 事件
  - 测试 Toggle.Group

  **Recommended Agent Profile**: `quick`
  **Parallelization**: Wave 3b, Blocked By: T5-T9
  **Acceptance Criteria**: 8+ 测试用例全部通过
  **QA Scenarios**: Bash 运行测试
  **Commit**: YES — `test(components): Toggle component tests`
  **Files**: `src/components/__tests__/toggle.test.tsx`

- [x] 17. **Slider 组件测试**

  **What to do**:
  - 创建 `src/components/__tests__/slider.test.tsx`
  - 测试 Slider 渲染
  - 测试 value 属性
  - 测试 onChange 事件
  - 测试 min/max/step

  **Recommended Agent Profile**: `quick`
  **Parallelization**: Wave 3b, Blocked By: T5-T9
  **Acceptance Criteria**: 8+ 测试用例全部通过
  **QA Scenarios**: Bash 运行测试
  **Commit**: YES — `test(components): Slider component tests`
  **Files**: `src/components/__tests__/slider.test.tsx`

- [x] 18. **ProgressBar 组件测试**

  **What to do**:
  - 创建 `src/components/__tests__/progress-bar.test.tsx`
  - 测试 ProgressBar 渲染
  - 测试 progress 属性
  - 测试 mode 属性

  **Recommended Agent Profile**: `quick`
  **Parallelization**: Wave 3b, Blocked By: T5-T9
  **Acceptance Criteria**: 6+ 测试用例全部通过
  **QA Scenarios**: Bash 运行测试
  **Commit**: YES — `test(components): ProgressBar component tests`
  **Files**: `src/components/__tests__/progress-bar.test.tsx`

- [x] 19. **EditBox 组件测试**

  **What to do**:
  - 创建 `src/components/__tests__/edit-box.test.tsx`
  - 测试 EditBox 渲染
  - 测试 value 属性
  - 测试 onChange 事件
  - 测试 placeholder

  **Recommended Agent Profile**: `quick`
  **Parallelization**: Wave 3b, Blocked By: T5-T9
  **Acceptance Criteria**: 8+ 测试用例全部通过
  **QA Scenarios**: Bash 运行测试
  **Commit**: YES — `test(components): EditBox component tests`
  **Files**: `src/components/__tests__/edit-box.test.tsx`

- [x] 20. **RichText 组件测试**

  **What to do**:
  - 创建 `src/components/__tests__/rich-text.test.tsx`
  - 测试 RichText 渲染
  - 测试 html 属性
  - 测试 segments 属性

  **Recommended Agent Profile**: `quick`
  **Parallelization**: Wave 3a, Blocked By: T5-T9
  **Acceptance Criteria**: 6+ 测试用例全部通过
  **QA Scenarios**: Bash 运行测试
  **Commit**: YES — `test(components): RichText component tests`
  **Files**: `src/components/__tests__/rich-text.test.tsx`

- [x] 21. **PageView 组件测试**

  **What to do**:
  - 创建 `src/components/__tests__/page-view.test.tsx`
  - 测试 PageView 渲染
  - 测试 currentPage 属性
  - 测试 onPageChanged 事件
  - 测试 PageView.Dots 指示器

  **Recommended Agent Profile**: `deep`
  **Parallelization**: Wave 3c, Blocked By: T5-T9, T15
  **Acceptance Criteria**: 8+ 测试用例全部通过
  **QA Scenarios**: Bash 运行测试
  **Commit**: YES — `test(components): PageView component tests`
  **Files**: `src/components/__tests__/page-view.test.tsx`

- [x] 22. **Mask 组件测试**

  **What to do**:
  - 创建 `src/components/__tests__/mask.test.tsx`
  - 测试 Mask 渲染
  - 测试 type 属性（RECT/ELLIPSE）
  - 测试 inverted 属性

  **Recommended Agent Profile**: `quick`
  **Parallelization**: Wave 3c, Blocked By: T5-T9
  **Acceptance Criteria**: 6+ 测试用例全部通过
  **QA Scenarios**: Bash 运行测试
  **Commit**: YES — `test(components): Mask component tests`
  **Files**: `src/components/__tests__/mask.test.tsx`

- [x] 23. **Graphics 组件测试**

  **What to do**:
  - 创建 `src/components/__tests__/graphics.test.tsx`
  - 测试 Graphics 渲染
  - 测试 shapes 属性（rect, circle, line）
  - 测试 fillColor/strokeColor

  **Recommended Agent Profile**: `quick`
  **Parallelization**: Wave 3a, Blocked By: T5-T9
  **Acceptance Criteria**: 8+ 测试用例全部通过
  **QA Scenarios**: Bash 运行测试
  **Commit**: YES — `test(components): Graphics component tests`
  **Files**: `src/components/__tests__/graphics.test.tsx`

- [x] 24. **SafeArea + Widget 测试**

  **What to do**:
  - 创建 `src/components/__tests__/safe-area.test.tsx`
  - 创建 `src/components/__tests__/widget.test.tsx`
  - 测试 SafeArea 渲染
  - 测试 Widget 锚点定位

  **Recommended Agent Profile**: `quick`
  **Parallelization**: Wave 3c, Blocked By: T5-T9
  **Acceptance Criteria**: 6+ 测试用例全部通过
  **QA Scenarios**: Bash 运行测试
  **Commit**: YES — `test(components): SafeArea and Widget tests`
  **Files**: `src/components/__tests__/safe-area.test.tsx, src/components/__tests__/widget.test.tsx`

- [x] 25. **Particle2D 组件测试**

  **What to do**:
  - 创建 `src/components/__tests__/particle2d.test.tsx`
  - 测试 Particle2D 渲染
  - 测试 file 属性（plist 加载）
  - 测试 playOnLoad/loop

  **Recommended Agent Profile**: `unspecified-high`
  **Parallelization**: Wave 3c, Blocked By: T5-T9
  **Acceptance Criteria**: 6+ 测试用例全部通过
  **QA Scenarios**: Bash 运行测试
  **Commit**: YES — `test(components): Particle2D component tests`
  **Files**: `src/components/__tests__/particle2d.test.tsx`

- [x] 26. **Animation/Tween 测试**

  **What to do**:
  - 创建 `src/animation/__tests__/tween.test.tsx`
  - 测试 animate 属性
  - 测试动画队列
  - 测试 onAnimationStart/End 回调
  - 测试 easing 函数

  **Recommended Agent Profile**: `deep`
  **Parallelization**: Wave 3c, Blocked By: T5-T9
  **Acceptance Criteria**: 10+ 测试用例全部通过
  **QA Scenarios**: Bash 运行测试
  **Commit**: YES — `test(animation): Tween animation tests`
  **Files**: `src/animation/__tests__/tween.test.tsx`

- [x] 27. **Theme 系统测试**

  **What to do**:
  - 创建 `src/theme/__tests__/theme.test.tsx`
  - 测试 createTheme 函数
  - 测试 ThemeProvider 组件
  - 测试 useTheme hook
  - 测试主题切换

  **Recommended Agent Profile**: `quick`
  **Parallelization**: Wave 3c, Blocked By: T5-T9
  **Acceptance Criteria**: 8+ 测试用例全部通过
  **QA Scenarios**: Bash 运行测试
  **Commit**: YES — `test(theme): theme system tests`
  **Files**: `src/theme/__tests__/theme.test.tsx`

---

- [x] 28. **README.md 编写**

  **What to do**:
  - 创建项目根目录 README.md
  - 包含：项目概述、安装说明、快速开始、组件列表、API 文档链接
  - 添加基础使用示例（Counter Demo）
  - 添加特性列表
  - 添加 badges（npm version, CI status, test coverage）

  **Must NOT do**:
  - 不要写冗长的架构说明（那是 docs/ 的内容）
  - 不要包含所有 API 细节（链接到 API 文档）

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with T29-T32)
  - **Blocks**: T33-T36 (CI/CD needs README for badges)
  - **Blocked By**: T5-T9 (for accurate examples)

  **References**:
  - 优秀 npm README 示例：`https://github.com/vuejs/core`, `https://github.com/solidjs/solid`
  - README 模板：`https://github.com/other/awesome-readme`

  **Acceptance Criteria**:
  - [ ] README.md 文件存在
  - [ ] 包含安装说明
  - [ ] 包含快速开始示例
  - [ ] 包含组件列表

  **QA Scenarios**:
  ```
  Scenario: README 渲染验证
    Tool: Bash
    Steps:
      1. cat README.md | head -50
      2. 验证结构完整
    Expected Result: README 包含所有必需章节
    Evidence: .sisyphus/evidence/task-28-readme.txt
  ```

  **Commit**: YES
  - Message: `docs: comprehensive README.md with installation and quick start`
  - Files: `README.md`

- [x] 29. **TypeDoc API 文档生成**

  **What to do**:
  - 安装 TypeDoc：`npm install -D typedoc`
  - 创建 typedoc.json 配置
  - 添加 docs 脚本：`"docs": "typedoc src/index.ts"`
  - 配置输出目录：docs/api/
  - 从 JSDoc 生成完整 API 文档
  - 验证生成的文档完整性

  **Must NOT do**:
  - 不要手动编写 API 文档（用 TypeDoc 生成）
  - 不要配置过于复杂的 TypeDoc 选项

  **Recommended Agent Profile**: `quick`
  **Parallelization**: Wave 4 (with T28, T30-T32), Blocked By: T5-T9
  **Acceptance Criteria**: docs/api/ 目录存在且包含完整 API 文档
  **QA Scenarios**: Bash 运行 `npm run docs` 验证生成成功
  **Commit**: YES — `docs: TypeDoc API documentation setup`
  **Files**: `typedoc.json, docs/`

- [x] 30. **状态管理指南**

  **What to do**:
  - 创建 `docs/guides/state-management.md`
  - 包含：useState 基础、createSignal 高级用法、createEffect 副作用
  - 包含：batch 批量更新、createStore 全局状态
  - 包含：实用示例和最佳实践

  **Recommended Agent Profile**: `writing`
  **Parallelization**: Wave 4 (with T28-T29, T31-T32), Blocked By: T6
  **Acceptance Criteria**: 指南完整且包含代码示例
  **QA Scenarios**: 阅读验证文档完整性
  **Commit**: YES — `docs: state management guide`
  **Files**: `docs/guides/state-management.md`

- [x] 31. **主题系统指南**

  **What to do**:
  - 创建 `docs/guides/theming.md`
  - 包含：createTheme 基础、ThemeProvider 使用
  - 包含：useTheme hook、预设主题（light/dark）
  - 包含：自定义主题示例

  **Recommended Agent Profile**: `writing`
  **Parallelization**: Wave 4 (with T28-T30, T32), Blocked By: T29
  **Acceptance Criteria**: 指南完整且包含代码示例
  **QA Scenarios**: 阅读验证文档完整性
  **Commit**: YES — `docs: theming guide`
  **Files**: `docs/guides/theming.md`

- [x] 32. **动画系统指南**

  **What to do**:
  - 创建 `docs/guides/animations.md`
  - 包含：animate 属性基础、Tween 队列
  - 包含：easing 函数、onAnimationStart/End 回调
  - 包含：实用动画示例

  **Recommended Agent Profile**: `writing`
  **Parallelization**: Wave 4 (with T28-T31), Blocked By: T26
  **Acceptance Criteria**: 指南完整且包含代码示例
  **QA Scenarios**: 阅读验证文档完整性
  **Commit**: YES — `docs: animation guide`
  **Files**: `docs/guides/animations.md`

- [x] 33. **GitHub Actions CI workflow**

  **What to do**:
  - 创建 `.github/workflows/ci.yml`
  - 配置：Node.js setup, npm ci, typecheck, build, test
  - 配置：在 push 和 pull_request 时触发
  - 添加测试覆盖率报告上传
  - 添加 CI status badge 到 README

  **Must NOT do**:
  - 不要配置复杂的矩阵测试（单环境即可）
  - 不要配置自动合并

  **Recommended Agent Profile**: `quick`
  **Parallelization**: Wave 5 (with T34-T36), Blocked By: T28, T1-T3
  **Acceptance Criteria**: CI workflow 运行成功
  **QA Scenarios**: 推送测试提交验证 CI 运行
  **Commit**: YES — `ci: GitHub Actions workflow for CI`
  **Files**: `.github/workflows/ci.yml`

- [x] 34. **GitHub Actions publish workflow**

  **What to do**:
  - 创建 `.github/workflows/publish.yml`
  - 配置：在 release 时触发
  - 配置：npm publish
  - 配置：NPM_TOKEN 密钥
  - 添加发布说明

  **Recommended Agent Profile**: `quick`
  **Parallelization**: Wave 5 (with T33, T35-T36), Blocked By: T33
  **Acceptance Criteria**: publish workflow 配置正确
  **QA Scenarios**: 验证 workflow 语法
  **Commit**: YES — `ci: GitHub Actions workflow for npm publish`
  **Files**: `.github/workflows/publish.yml`

- [x] 35. **npm 发布配置**

  **What to do**:
  - 添加发布脚本到 package.json：
    - `"prepublishOnly": "npm run typecheck && npm run build && npm test"`
    - `"release": "npm publish"`
  - 验证 .npmignore 配置
  - 验证 package.json exports 字段
  - 测试 `npm publish --dry-run`

  **Recommended Agent Profile**: `quick`
  **Parallelization**: Wave 5 (with T33-T34, T36), Blocked By: T1-T3
  **Acceptance Criteria**: `npm publish --dry-run` 成功
  **QA Scenarios**: Bash 运行 dry-run 验证
  **Commit**: YES — `chore: npm publish configuration`
  **Files**: `package.json`

- [ ] 36. **Git 初始化 + 首次提交**

  **What to do**:
  - 配置 git remote（如果需要）
  - 添加 .gitignore 验证
  - 首次 git add .
  - 首次 git commit -m "Initial commit: CocosUI framework with complete QA"
  - 推送远程（如果需要）

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `['git-master']`

  **Parallelization**: Wave 5 (with T33-T35), Blocked By: T28-T32
  **Acceptance Criteria**: Git 仓库有首次提交
  **QA Scenarios**: git log 验证提交
  **Commit**: N/A (this IS the commit task)
  **Files**: ALL

- [ ] 37. **alpha 版本测试发布**

  **What to do**:
  - 更新 package.json version 为 `0.1.0-alpha.0`
  - 运行 `npm publish --tag alpha --dry-run`
  - 验证发布配置
  - 实际发布（如果用户确认）：`npm publish --tag alpha`

  **Recommended Agent Profile**: `quick`
  **Parallelization**: Wave 6 (with T38-T39), Blocked By: T33-T36
  **Acceptance Criteria**: alpha 版本可发布
  **QA Scenarios**: npm view cocos-ui versions 验证
  **Commit**: YES — `release: v0.1.0-alpha.0 pre-release`
  **Files**: `package.json`

- [ ] 38. **beta 版本测试发布**

  **What to do**:
  - 更新 package.json version 为 `0.1.0-beta.0`
  - 运行 `npm publish --tag beta --dry-run`
  - 实际发布：`npm publish --tag beta`
  - 更新 README 添加 beta badge

  **Recommended Agent Profile**: `quick`
  **Parallelization**: Wave 6 (with T37, T39), Blocked By: T37
  **Acceptance Criteria**: beta 版本发布成功
  **QA Scenarios**: npm view cocos-ui versions 验证
  **Commit**: YES — `release: v0.1.0-beta.0 pre-release`
  **Files**: `package.json, README.md`

- [ ] 39. **最终验证 + 用户文档审查**

  **What to do**:
  - 审查所有文档完整性
  - 验证所有测试通过
  - 验证覆盖率 ≥80%
  - 验证 CI workflow 运行成功
  - 准备 v1.0.0 发布计划

  **Recommended Agent Profile**: `deep`
  **Parallelization**: Wave 6 (with T37-T38), Blocked By: T37-T38
  **Acceptance Criteria**: 所有验证通过
  **QA Scenarios**: 综合验证
  **Commit**: YES — `chore: final QA verification complete`
  **Files**: N/A

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search codebase for forbidden patterns. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + linter. Review all changed files for AI slop patterns. Check test quality.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | VERDICT`

- [ ] F3. **Test Coverage Verification** — `unspecified-high`
  Run `npm run test:coverage`. Verify coverage ≥80%. Check critical files have tests.
  Output: `Coverage [N%] | Threshold [80%] | Critical Files [N/N tested] | VERDICT`

- [ ] F4. **Documentation Completeness Check** — `deep`
  Verify README.md exists and is complete. Verify API docs generated. Verify all guides exist.
  Output: `README [PASS/FAIL] | API Docs [PASS/FAIL] | Guides [N/N] | VERDICT`

---

## Commit Strategy

- **Wave 1**: `feat(test): vitest + playwright configuration and scaffolding`
- **Wave 2**: `test(core): comprehensive unit tests for core engine`
- **Wave 3**: `test(components): unit tests for all 17 UI components`
- **Wave 4**: `docs: README, API docs, and usage guides`
- **Wave 5**: `ci: GitHub Actions workflows for CI and publish`
- **Wave 6**: `release: alpha/beta pre-release versions`

---

## Success Criteria

### Verification Commands
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
# Expected: Coverage ≥80%

# Run E2E tests
npm run test:e2e

# Generate API docs
npm run docs

# CI verification
npm run typecheck && npm run build && npm test
```

### Final Checklist
- [ ] 所有测试通过率 100%
- [ ] 测试覆盖率 ≥80%
- [ ] README.md 完整且包含安装说明
- [ ] API 文档生成成功 (docs/api/)
- [ ] 使用指南完整 (docs/guides/)
- [ ] GitHub Actions CI 运行成功
- [ ] npm alpha/beta 发布成功
- [ ] Git 仓库有完整提交历史

(See Wave FINAL above)

---

## Commit Strategy

- **Wave 1**: `feat(test): vitest + playwright configuration`
- **Wave 2**: `test(core): unit tests for core engine modules`
- **Wave 3**: `test(components): unit tests for all UI components`
- **Wave 4**: `docs: README, API docs, and usage guides`
- **Wave 5**: `ci: GitHub Actions workflows for CI and publish`
- **Wave 6**: `release: alpha/beta pre-release preparation`

---

## Success Criteria

### Verification Commands
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Generate API docs
npm run docs

# CI verification
npm run typecheck && npm run build && npm test
```

### Final Checklist
- [ ] 所有测试通过率 100%
- [ ] 测试覆盖率 ≥80%
- [ ] README.md 完整
- [ ] API 文档生成成功
- [ ] GitHub Actions CI 运行成功
- [ ] npm alpha/beta 发布成功
