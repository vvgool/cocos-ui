# Cocos-UI：纯代码 JSX UI 框架

## TL;DR

> **Quick Summary**: 在 Cocos4 开源引擎之上构建一个纯代码、声明式 JSX UI 框架（npm 包 `cocos-ui`），封装全部 20+ Cocos4 UI 组件，内置响应式状态管理、Tween 动效、粒子系统、主题变量、错误边界和 Vite 开发服务器。AI 为主要用户——API 设计目标是 AI 一次性生成即可正确运行的代码。
>
> **Deliverables**:
> - npm 包 `cocos-ui`（TypeScript JSX 运行时 + 组件库）
> - 内置 Vite 开发服务器（WebGL 浏览器预览 + 热更新）
> - 完整组件封装（View, Label, Button, Sprite, ScrollView, Layout, Toggle, Slider, ProgressBar, EditBox, RichText, PageView, Mask, Graphics, SafeArea, Widget, Particle2D）
> - 响应式状态管理（Signal-based, 数据驱动 UI 更新）
> - Tween 动画系统封装 + 主题变量系统
> - 错误边界、加载占位符、DevTools 调试面板
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES — 7 waves, max 12 concurrent tasks
> **Critical Path**: JSX Runtime → Reconciler → Component System → Dev Server → QA

---

## Context

### Original Request
在 Cocos4 开源引擎（https://github.com/cocos/cocos4）基础上，增加一个纯代码的 UI 框架，支持所有平台，方便 AI 使用，减少对编辑器的依赖。

### Interview Summary

| # | 决策项 | 选择 | 理由 |
|---|--------|------|------|
| 1 | 主要用户 | AI 代码生成 | API 必须简单、可预测、最小样板代码 |
| 2 | API 范式 | 声明式 JSX（真实 TSX 编译） | LLM 对 JSX 训练数据最多，生成准确率最高 |
| 3 | 集成策略 | 包装 Cocos4 现有 UI 组件 | 复用成熟渲染/输入/布局，快速出成果 |
| 4 | 布局系统 | Cocos4 原生 Layout + Widget | 轻量，不引入外部依赖 |
| 5 | 样式系统 | 内联组件属性 | 结构扁平无歧义，AI 最易生成 |
| 6 | V1 范围 | 完整封装 ~20+ 组件 | 一次性覆盖所有常用场景 |
| 7 | 测试策略 | 无单元测试，Agent QA 验证 | Playwright 浏览器 + 命令行运行时验证 |
| 8 | 构建发布 | npm 包 `cocos-ui` | AI: `import { View, Button } from 'cocos-ui'` |
| 9 | JSX 实现 | react-jsx 模式 + 自定义 jsxImportSource | 标准 TSX，无需额外工具链 |
| 10 | 动效 | 封装 Cocos4 Tween | 声明式：`<View animate={{ scale: 1.1 }}>` |
| 11 | 屏幕适配 | Cocos4 Canvas + SafeArea + Widget | 自动多分辨率 |
| 12 | 性能 | 最小 reconciler + 合批渲染 | 不能有性能问题 |
| 13 | 粒子 | 封装 `particle-2d` 为 `<Particle2D>` | 粒子动效支持 |
| 14 | 数据驱动 | 响应式状态管理（Signal） | UI = f(state)，自动更新 |
| 15 | 资源加载 | 自动加载——写路径即可 | `<Sprite src='images/hero.png' />` |
| 16 | 容错 | 错误边界 + 加载占位符 + 主题变量 + DevTools | 生产级标准，全部包含 |

### Research Findings

**Cocos4 架构**:
- 渲染后端：Vulkan (Win/Android)、Metal (macOS/iOS)、WebGL/WebGL2 (Web)、WebGPU (WASM)
- 现有 UI: `cocos/ui/` 包含 Button, Label, Sprite, ScrollView, Layout, Toggle, Slider, ProgressBar, EditBox, RichText, PageView, Mask, Graphics, SafeArea, Widget
- 2D 渲染: `cocos/2d/` — Sprite, Graphics (矢量), batcher-2d (合批)
- 粒子: `cocos/particle-2d/`
- 输入: `pal/input/` + `cocos/input/` — 多点触摸、键盘、鼠标，跨平台
- 场景图: `cocos/scene-graph/` — Node/Component 体系
- 动画: `cocos/animation/` — Tween 系统
- 资源: `cocos/asset/` — AssetManager 资源加载
- 技术栈: 50.8% C++ 核心 + 34.5% TypeScript 用户层

**UI 框架调研** (6 种模式对比):
- IMGUI: 即时模式，适合工具/Debug UI
- React/JSX: 声明式，AI 友好，虚拟树 diff
- Flutter: 三层层架构（Widget/Element/RenderObject）
- Godot: 锚点 + 容器布局
- Unity UITK: Yoga Flexbox + USS 样式
- 推荐混合: 保留模式虚拟树 + 组件系统 + JSX 声明式 API

---

## Work Objectives

### Core Objective
在 Cocos4 引擎上构建一个 **AI 友好的纯代码 JSX UI 框架**，AI 只需写好 TSX 文件即可在浏览器中看到 UI 效果，零编辑器依赖。框架内部映射 JSX 声明到 Cocos4 原生组件，保持高性能。

### Concrete Deliverables
- `cocos-ui` npm 包（含 JSX 运行时、reconciler、组件库、状态管理、动画、DevTools）
- Vite 开发服务器（WebGL 浏览器预览 + HMR）
- 完整 TypeScript 类型定义（props、events、style、theme）
- 示例 TSX 应用展示所有组件
- Agent QA 验证场景

### Definition of Done
- [ ] `npm run dev` 启动 Vite 服务器，浏览器打开显示 Cocos4 WebGL 画布
- [ ] TSX 文件修改后浏览器自动刷新
- [ ] `<View>`、`<Label>`、`<Button>` 等全部 20+ 组件可用
- [ ] `<Button onClick={handler}>` 事件正常工作
- [ ] `useState()` 状态变化自动触发 UI 更新
- [ ] `<Sprite src='img.png'>` 图片自动加载并显示，加载中显示占位符
- [ ] 组件出错时显示红色错误边界，不影响其他组件
- [ ] DevTools 面板可查看组件树和状态

### Must Have
- JSX 声明式 API（所有组件）
- 响应式状态管理（Signal/useState）
- 错误边界（ErrorBoundary）
- 加载占位符（Suspense/placeholder）
- Tween 动效封装
- 粒子系统（Particle2D）
- 主题变量系统
- Vite 开发服务器 + WebGL 预览
- DevTools 调试面板

### Must NOT Have (Guardrails)
- ❌ 不引入 React/Vue 等外部 UI 框架（自建轻量运行时）
- ❌ 不引入 Yoga/Flexbox 等外部布局引擎（用 Cocos4 原生 Layout）
- ❌ 不依赖 Cocos Creator 编辑器
- ❌ 不修改 Cocos4 引擎源码
- ❌ 不引入 CSS-in-JS 库（内联 props 即可）
- ❌ 不过度抽象：1 个 JSX 元素 → 1 个 Cocos4 Node（简单映射）
- ❌ 不做服务端渲染（SSR）

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO（新项目）
- **Automated tests**: NO
- **Framework**: N/A
- **Agent QA**: ALL tasks verified via Playwright (browser UI) or Bash (runtime check)

### QA Policy
每个组件任务附带至少 2 个 Agent 可执行的验证场景（1 happy path + 1 error/edge case）。

- **Web UI**: Playwright 打开浏览器 → 导航到页面 → 检查元素/交互 → 截图
- **CLI**: Bash 运行 Node 脚本 → 验证输出
- **Evidence**: `.sisyphus/evidence/task-{N}-{slug}.png|.txt`

---

## Execution Strategy

### Parallel Execution Waves

> 依据：Foundation → Core Engine → Components (parallel) → Advanced (parallel) → Integration

```
Wave 1 (Foundation — 5 tasks, ALL parallel):
├── T1: 项目脚手架 + 构建配置 [quick]
├── T2: TypeScript 类型体系 [quick]
├── T3: JSX 运行时工厂 [quick]
├── T4: 虚拟节点 + Fiber 类型 [quick]
└── T5: 响应式状态管理 (Signal) [unspecified-high]

Wave 2 (Core Engine — 4 tasks, ALL parallel after Wave 1):
├── T6: Node 创建工厂 [quick]
├── T7: Props 映射器 [deep]
├── T8: Reconciler 核心 [deep]
└── T9: 资源加载器 [unspecified-high]

Wave 3a (Display Components — 6 tasks, ALL parallel after Wave 2):
├── T10: View 容器组件 [quick]
├── T11: Label 文字组件 [quick]
├── T12: Sprite 图片组件 [quick]
├── T13: RichText 富文本组件 [quick]
├── T14: Graphics 矢量组件 [quick]
└── T15: Layout 布局组件 (VBox/HBox) [quick]

Wave 3b (Interactive Components — 5 tasks, ALL parallel after Wave 2):
├── T16: Button 按钮组件 [quick]
├── T17: Toggle 开关组件 [quick]
├── T18: Slider 滑块组件 [quick]
├── T19: ProgressBar 进度条组件 [quick]
└── T20: EditBox 输入框组件 [quick]

Wave 3c (Advanced Components — 5 tasks, ALL parallel after Wave 2):
├── T21: ScrollView 滚动组件 [deep]
├── T22: PageView 翻页组件 [deep]
├── T23: Mask 遮罩组件 [quick]
├── T24: SafeArea + Widget 适配组件 [quick]
└── T25: Particle2D 粒子组件 [unspecified-high]

Wave 4 (System Features — 6 tasks, ALL parallel after Wave 2+3):
├── T26: 错误边界 (ErrorBoundary) [unspecified-high]
├── T27: 加载状态 & 占位符 (Suspense) [unspecified-high]
├── T28: Tween 动效系统 [deep]
├── T29: 主题变量系统 [quick]
├── T30: DevTools 调试面板 [visual-engineering]
└── T31: 公共 API 导出 (index.ts) [quick]

Wave 5 (Dev Server & Demo — 2 tasks, sequential after Wave 4):
├── T32: Vite 开发服务器 + Cocos4 WebGL 集成 [visual-engineering]
└── T33: 示例 TSX 应用 [quick]

Wave FINAL (Verification — 4 tasks, ALL parallel after Wave 5):
├── F1: Plan Compliance Audit (oracle)
├── F2: Code Quality Review (unspecified-high)
├── F3: Agent QA — 全部组件场景验证 (unspecified-high + playwright)
└── F4: Scope Fidelity Check (deep)
```

**Critical Path**: T1 → T2 → T8(Reconciler) → T16(Button) → T31(index) → T32(DevServer) → T33(Demo) → F1-F4
**Parallel Speedup**: ~75% faster than sequential due to massive component parallelism
**Max Concurrent**: 12 (Waves 3a+3b+3c)

---

- [x] 1. **项目脚手架 + 构建配置**

  **What to do**:
  - 初始化项目：`package.json`（name: `cocos-ui`, type: `module`）
  - 配置 `tsconfig.json`：`"jsx": "react-jsx"`, `"jsxImportSource": "cocos-ui"`, strict mode
  - 配置构建工具（Vite / tsup）：输出 ESM + CJS，生成 `.d.ts` 类型声明
  - 创建目录结构：`src/core/`, `src/components/`, `src/types/`, `src/animation/`, `src/devtools/`, `examples/`
  - 添加 Cocos4 engine 为 peerDependency
  - 配置 `.gitignore`, `.npmignore`

  **Must NOT do**:
  - 不要配置 webpack（只用 Vite）
  - 不要引入 React/Vue 等依赖
  - 不要创建复杂的 monorepo 结构

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T2, T3, T4, T5)
  - **Blocks**: ALL subsequent tasks
  - **Blocked By**: None

  **References**:
  - 参考 `package.json` 标准 npm 包结构 —— 字段：name, version, main, module, types, exports, peerDependencies
  - TypeScript 官方文档 JSX 配置：`"jsx": "react-jsx"` with custom `jsxImportSource`

  **Acceptance Criteria**:
  - [ ] `ls package.json tsconfig.json` 文件存在
  - [ ] `npx tsc --noEmit` 通过（0 errors）
  - [ ] `src/` 目录结构完整

  **QA Scenarios**:
  ```
  Scenario: 项目可正常安装和编译
    Tool: Bash
    Steps:
      1. npm install
      2. npx tsc --noEmit
    Expected Result: tsc 编译通过，0 errors
    Evidence: .sisyphus/evidence/task-1-tsc-check.txt

  Scenario: JSX 编译配置正确
    Tool: Bash
    Preconditions: 写一个最小 TSX 文件 examples/test.tsx
    Steps:
      1. npx tsc --noEmit --jsx react-jsx --jsxImportSource cocos-ui examples/test.tsx
    Expected Result: JSX 语法被正确编译，无语法错误
    Evidence: .sisyphus/evidence/task-1-jsx-compile.txt
  ```

  **Commit**: YES
  - Message: `feat(scaffold): initialize cocos-ui project with TSX config`
  - Files: `package.json, tsconfig.json, src/`

- [x] 2. **TypeScript 类型体系 (types/)**

  **What to do**:
  - `src/types/props.ts`: 定义公共属性类型——`CommonProps`（id, key, ref, style）、`LayoutProps`（width, height, padding, margin, layoutType）
  - `src/types/events.ts`: 定义事件类型——`ClickEvent`, `ChangeEvent`, `InputEvent`, `TouchEvent`, 以及对应的 handler 签名
  - `src/types/style.ts`: 定义样式类型——`Color`, `FontSize`, `Alignment`, `Overflow`, `Visibility`
  - `src/types/theme.ts`: 定义主题变量类型——`ThemeColors`, `ThemeFonts`, `ThemeSpacing`
  - `src/types/resource.ts`: 定义资源类型——`ImageSource`, `FontSource`, `LoadingState`
  - 所有类型导出为 `cocos-ui` 包的公共 API

  **Must NOT do**:
  - 不要定义过于宽泛的 `any` 类型
  - 不要交叉引用导致循环依赖

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T3, T4, T5)
  - **Blocks**: ALL component tasks (T10-T25)
  - **Blocked By**: None

  **References**:
  - React 类型定义参考：`@types/react` 的 CSSProperties, EventHandler 类型
  - Cocos4 类型参考：`cocos/ui/button.ts` 中 Button 组件的属性签名

  **Acceptance Criteria**:
  - [ ] `src/types/` 目录下 5 个类型文件存在
  - [ ] `npx tsc --noEmit` 类型检查通过
  - [ ] 类型可从 `cocos-ui` 包导入：`import { CommonProps, ClickEvent } from 'cocos-ui'`

  **QA Scenarios**:
  ```
  Scenario: 类型可被外部项目正常导入
    Tool: Bash
    Steps:
      1. 创建临时 TS 文件：import { CommonProps, ClickEvent, ThemeColors } from './src/types'
      2. npx tsc --noEmit temp.ts
    Expected Result: 编译通过，类型正确
    Evidence: .sisyphus/evidence/task-2-type-check.txt
  ```

  **Commit**: YES (与 T1 一起)
  - Message: `feat(types): core type definitions for props, events, style, theme`
  - Files: `src/types/*.ts`

- [x] 3. **JSX 运行时工厂 (jsx-runtime.ts)**

  **What to do**:
  - `src/core/jsx-runtime.ts`: 实现 `jsx(type, props, ...children)` 和 `jsxs(type, props, ...children)` 函数
  - 返回 `VNode` 对象：`{ type, props, key, ref }` —— 轻量级，不持有 Cocos4 引用
  - `src/core/jsx.d.ts`: 声明 JSX 内置元素类型（IntrinsicElements）——映射所有组件标签名
  - 支持 Fragment：`<>...</>` 映射为特殊的 Fragment 类型
  - Children 扁平化处理（嵌套数组自动展平）

  **Must NOT do**:
  - 不要在 jsx 工厂函数中创建 Cocos4 对象（它只生产虚拟节点）
  - 不要实现 reconcile/diff 逻辑（那是 Reconciler 的任务）

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T2, T4, T5)
  - **Blocks**: T8 (Reconciler), all component tasks
  - **Blocked By**: None

  **References**:
  - React JSX Runtime 源码参考：`react/jsx-runtime` —— jsx() 函数签名和 children 处理
  - TypeScript JSX 手册：`https://www.typescriptlang.org/docs/handbook/jsx.html`

  **Acceptance Criteria**:
  - [ ] `src/core/jsx-runtime.ts` 导出 `jsx` 和 `jsxs` 函数
  - [ ] `src/core/jsx.d.ts` 声明 `JSX.IntrinsicElements` 接口
  - [ ] `import { jsx } from 'cocos-ui/jsx-runtime'` 可用

  **QA Scenarios**:
  ```
  Scenario: JSX 编译后正确调用 jsx 工厂
    Tool: Bash
    Steps:
      1. 编写 TSX：const vnode = <View id="root"><Label text="Hello" /></View>
      2. npx tsc 编译，检查编译后的 JS 文件
      3. 验证编译结果调用了 jsx('View', {id: 'root'}, jsx('Label', {text: 'Hello'}))
    Expected Result: 编译后的代码正确调用 jsx/jsxs 工厂函数
    Evidence: .sisyphus/evidence/task-3-jsx-compiled.js
  ```

  **Commit**: YES
  - Message: `feat(core): JSX runtime factory (jsx/jsxs) and intrinsic elements`
  - Files: `src/core/jsx-runtime.ts, src/core/jsx.d.ts`

- [x] 4. **虚拟节点 & Fiber 类型定义 (vnode.ts)**

  **What to do**:
  - `src/core/vnode.ts`: 定义核心数据结构
  - `VNode` 类型：`{ type: string | Function, props: Record<string, any>, key?: string, ref?: any }`
  - `Fiber` 类型：`{ vnode: VNode, node: cc.Node | null, child: Fiber | null, sibling: Fiber | null, parent: Fiber | null, effectTag: 'CREATE' | 'UPDATE' | 'DELETE' | 'NONE' }`
  - `ComponentType` 类型：函数组件签名 `(props) => VNode`
  - 工具函数：`createVNode()`, `isValidElement()`, `flattenChildren()`

  **Must NOT do**:
  - 不要在 vnode.ts 中引入 Cocos4 依赖（通过类型导入可以）
  - 不要把 Fiber 实现得和 React 一样复杂——只保留最小必要字段

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T2, T3, T5)
  - **Blocks**: T8 (Reconciler), T7 (Props Mapper)
  - **Blocked By**: None

  **References**:
  - React Fiber 架构概述：Fiber 节点的基本字段（tag, key, type, stateNode, child, sibling, return, effectTag）
  - 本框架简化版只需：vnode + node + child/sibling/parent + effectTag

  **Acceptance Criteria**:
  - [ ] `VNode`, `FiberNode`, `ComponentType` 类型定义完整
  - [ ] `createVNode()` 函数可用
  - [ ] `npx tsc --noEmit` 通过

  **QA Scenarios**:
  ```
  Scenario: VNode 创建和结构验证
    Tool: Bash (node REPL)
    Steps:
      1. 编写脚本：import { createVNode } from './src/core/vnode'
      2. const vn = createVNode('View', { id: 'test' }, [createVNode('Label', { text: 'hi' })])
      3. console.log(JSON.stringify(vn))
    Expected Result: 输出正确的嵌套 VNode 结构，children 扁平化
    Evidence: .sisyphus/evidence/task-4-vnode-test.txt
  ```

  **Commit**: YES
  - Message: `feat(core): VNode and Fiber type definitions with createVNode utility`
  - Files: `src/core/vnode.ts`

- [x] 5. **响应式状态管理 (Signal/useState)**

  **What to do**:
  - `src/core/state.ts`: 实现轻量级 Signal 系统
  - `createSignal(initialValue)`: 返回 `[getter, setter]` —— getter 读取值，setter 更新值并触发订阅者
  - `useState(initialValue)`: 返回 `[state, setState]` —— 在组件上下文中使用
  - `createEffect(fn)`: 副作用函数，自动追踪依赖的 signal，依赖变化时重新执行
  - 全局状态管理器 `Store`: `createStore(initialState)` —— 支持跨组件共享状态
  - 实现 `batch(fn)`: 批量更新，多个 setState 只触发一次 re-render

  **Must NOT do**:
  - 不要实现 React 的 hook 规则检查（那是 lint 工具的事）
  - 不要实现 useReducer/useContext/useMemo/useCallback（V1 只需要 useState + Signal）
  - Signal 不引入外部依赖库

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T2, T3, T4)
  - **Blocks**: T8 (Reconciler — 需要知道何时 re-render)
  - **Blocked By**: None (纯 JS 逻辑)

  **References**:
  - SolidJS Signal 实现原理：`createSignal` 返回 getter/setter，自动追踪依赖
  - Preact Signals：`@preact/signals-core` 的 API 设计
  - 参考轻量实现：`https://github.com/preactjs/signals` —— signal, effect, batch

  **Acceptance Criteria**:
  - [ ] `createSignal()` 创建 signal，setter 修改后 getter 返回新值
  - [ ] `useState()` 在组件中使用，setState 后触发组件 re-render
  - [ ] `createEffect()` 自动追踪 signal 依赖，变化时重新执行
  - [ ] `batch()` 批量更新只触发一次 effect

  **QA Scenarios**:
  ```
  Scenario: useState 基本流程
    Tool: Bash (node REPL)
    Steps:
      1. 编写测试脚本：
         const [count, setCount] = useState(0)
         setCount(1)
         console.assert(count() === 1, 'count should be 1')
      2. node test-state.js
    Expected Result: 断言通过，count 为 1
    Evidence: .sisyphus/evidence/task-5-state-test.txt

  Scenario: createEffect 自动追踪依赖
    Tool: Bash (node REPL)
    Steps:
      1. const [name, setName] = createSignal('Alice')
      2. createEffect(() => console.log(name()))
      3. setName('Bob')
    Expected Result: effect 自动执行，输出 'Bob'
    Evidence: .sisyphus/evidence/task-5-effect-test.txt
  ```

  **Commit**: YES
  - Message: `feat(core): reactive state management with signals and useState`
  - Files: `src/core/state.ts`

---

- [x] 6. **Node 创建工厂 (create-element.ts)**

  **What to do**:
  - `src/core/create-element.ts`: VNode → Cocos4 Node 的创建逻辑
  - `createHostNode(vnode: VNode): cc.Node` —— 根据 VNode.type 创建 Cocos4 Node 并附加对应 Component
  - 组件注册表 `ComponentRegistry`: 映射组件名 → 工厂函数（由各组件模块注册）
  - `registerComponent(name: string, factory: (node: cc.Node, props: any) => void)`
  - 处理 Fragment：创建空容器 Node
  - 创建 UITransform 组件（每个 UI Node 都需要）

  **Must NOT do**:
  - 不要在此文件中写具体组件的创建逻辑（由各组件文件通过 registerComponent 注册）
  - 不要在此文件中处理 props（由 T7 Props 映射器处理）

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with T7, T8, T9)
  - **Blocks**: All component tasks (T10-T25)
  - **Blocked By**: T1 (project setup), T2 (types), T3 (jsx-runtime), T4 (vnode)

  **References**:
  - Cocos4 Node API: `new cc.Node(name)` → `node.addComponent(cc.UITransform)` → `node.addComponent(cc.Label)`
  - React DOM 参考：`createInstance` 在 `react-dom` 中的实现——根据 fiber.tag 创建 DOM 元素

  **Acceptance Criteria**:
  - [ ] `registerComponent('Label', factory)` 注册后可通过 type='Label' 创建
  - [ ] `createHostNode(vnode)` 返回有效的 cc.Node（有 UITransform）
  - [ ] Fragment 类型创建空 Node 容器

  **QA Scenarios**:
  ```
  Scenario: 创建基础 Cocos4 Node
    Tool: Bash (Cocos4 runtime)
    Steps:
      1. const vnode = createVNode('View', { id: 'root' })
      2. const node = createHostNode(vnode)
      3. console.assert(node.name === 'root', 'node name should be root')
      4. console.assert(node.getComponent(cc.UITransform) !== null, 'should have UITransform')
    Expected Result: 断言通过，node 有效且有 UITransform
    Evidence: .sisyphus/evidence/task-6-node-create.txt
  ```

  **Commit**: YES
  - Message: `feat(core): node creation factory with component registry`
  - Files: `src/core/create-element.ts`

- [x] 7. **Props 映射器 (apply-props.ts)**

  **What to do**:
  - `src/core/apply-props.ts`: 将 VNode.props 映射到 Cocos4 Component 属性
  - `applyProps(node: cc.Node, oldProps: Props | null, newProps: Props)` —— diff props 并只更新变化的部分
  - 属性映射表 `PropMappings`: 组件名 → props 映射规则
  - `registerPropMapping(component: string, mapping: Record<string, string | Function>)`
  - 处理特殊 props：
    - `style` props：映射到 UITransform（width, height, anchorPoint）
    - `layout` props：映射到 Layout 组件（type, spacing, padding）
    - `event` props：`onClick` → `node.on('click', handler)`，`onChange` → 对应事件
    - `children`：递归处理子节点
    - `ref`：保存引用到 ref 对象
  - 类型转换：字符串颜色 `'#333'` → `cc.Color`，字符串数值 `'24'` → number

  **Must NOT do**:
  - 不要对每种属性进行硬编码的 if-else
  - 不要遗漏 props 清理（删除的 props 需要 reset 到默认值）

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with T6, T8, T9)
  - **Blocks**: All component tasks (T10-T25)
  - **Blocked By**: T1, T2, T4

  **References**:
  - React DOM props 处理：`setProp` 在 DOM 元素上的实现——区分 attribute, property, event, style
  - Cocos4 组件属性 API：`label.string = 'text'`, `label.fontSize = 24`, `sprite.spriteFrame = frame`

  **Acceptance Criteria**:
  - [ ] `applyProps(node, null, { width: 100 })` 设置 node UITransform.width = 100
  - [ ] `applyProps(node, { width: 100 }, { width: 200 })` 只更新 width
  - [ ] `applyProps(node, { onClick: fn }, {})` 清理事件监听
  - [ ] 字符串 `'#ff0000'` 被转换为 `cc.Color` 对象

  **QA Scenarios**:
  ```
  Scenario: Props 正确应用和更新
    Tool: Bash (Cocos4 runtime)
    Steps:
      1. const node = createHostNode(createVNode('View', {}))
      2. applyProps(node, null, { width: 100, height: 50 })
      3. console.assert(node.getComponent(cc.UITransform).width === 100)
      4. applyProps(node, { width: 100, height: 50 }, { width: 200 })
      5. console.assert(node.getComponent(cc.UITransform).width === 200)
    Expected Result: 所有断言通过
    Evidence: .sisyphus/evidence/task-7-props-apply.txt
  ```

  **Commit**: YES
  - Message: `feat(core): props applicator with type conversion and event binding`
  - Files: `src/core/apply-props.ts`

- [x] 8. **Reconciler 核心 (reconciler.ts)**

  **What to do**:
  - `src/core/reconciler.ts`: 虚拟树 diff + Cocos4 Node 生命周期管理
  - `render(vnode: VNode, container: cc.Node)` —— 入口函数，将 VNode 树挂载到容器
  - `reconcileChildren(parentFiber: Fiber, newVNodes: VNode[])` —— diff 新旧 children，生成 effectTag
  - `commitWork(fiber: Fiber)` —— 根据 effectTag 执行实际 DOM/Cocos4 操作：
    - `CREATE`: 调用 createHostNode + applyProps + appendChild
    - `UPDATE`: 调用 applyProps（只更新变化的 props）
    - `DELETE`: 调用 node.destroy() + 清理事件/ref
  - `scheduleUpdate(fiber: Fiber)` —— 调度更新（利用 Cocos4 的 scheduler 或 requestAnimationFrame）
  - 与状态管理集成：当 signal 变化时，标记对应 fiber 为 dirty，触发 reconcile

  **Must NOT do**:
  - 不要实现完整的 React Fiber 架构（不需要 lanes、优先级、concurrent mode）
  - 不要在每个 reconcile 周期全量 diff（只 diff 标记为 dirty 的子树）
  - Reconciler 不持有全局状态——每个 render() 调用独立

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Wave 1)
  - **Parallel Group**: Wave 2 (with T6, T7, T9)
  - **Blocks**: T31 (index.ts export), full system integration
  - **Blocked By**: T3 (jsx-runtime), T4 (vnode), T5 (state), T6 (create-element), T7 (apply-props)

  **References**:
  - React Reconciler 参考：`react-reconciler` 包——`createContainer`, `updateContainer`, `commitRoot`
  - 简化版 reconciler 参考：Preact 的 `diff` 算法——O(n) children diff by key
  - Cocos4 生命周期：`node.addChild()`, `node.removeFromParent()`, `node.destroy()`

  **Acceptance Criteria**:
  - [ ] `render(<View><Label text='Hi'/></View>, container)` 创建 Node 树
  - [ ] 更新 `text` prop 后只更新 Label Component，不重建 Node
  - [ ] `render(null, container)` 清理所有子 Node
  - [ ] 同一个 key 的 children 原地更新（不删除再创建）

  **QA Scenarios**:
  ```
  Scenario: 初始渲染创建 Node 树
    Tool: Bash (Cocos4 runtime)
    Steps:
      1. const container = new cc.Node('root')
      2. render(<View id='app'><Label text='Hello' /></View>, container)
      3. console.assert(container.children.length === 1)
      4. console.assert(container.children[0].getComponent(cc.Label).string === 'Hello')
    Expected Result: 完整 Node 树创建，Label 文字正确
    Evidence: .sisyphus/evidence/task-8-render-init.txt

  Scenario: 更新只修改变化部分
    Tool: Bash (Cocos4 runtime)
    Steps:
      1. render(<View><Label text='Old' /></View>, container)
      2. const oldLabelNode = container.children[0].children[0]
      3. render(<View><Label text='New' /></View>, container)
      4. console.assert(container.children[0].children[0] === oldLabelNode, 'should reuse node')
      5. console.assert(oldLabelNode.getComponent(cc.Label).string === 'New')
    Expected Result: Node 复用，只更新 text 属性
    Evidence: .sisyphus/evidence/task-8-render-update.txt
  ```

  **Commit**: YES
  - Message: `feat(core): reconciler with VNode diffing and Cocos4 Node lifecycle`
  - Files: `src/core/reconciler.ts`

- [x] 9. **资源加载器 (resource-loader.ts)**

  **What to do**:
  - `src/core/resource-loader.ts`: 自动加载资源系统
  - `loadImage(src: string): Promise<cc.SpriteFrame>` —— 调用 Cocos4 assetManager 加载图片
  - `loadFont(src: string): Promise<cc.Font>` —— 加载字体
  - `ResourceCache`: 缓存已加载资源（Map<string, Promise<Resource>>），避免重复加载
  - `useResource(src: string, type: 'image' | 'font'): { status: 'loading' | 'loaded' | 'error', data?: any }`
  - 加载状态追踪：`loading` → `loaded` → hooks 通知组件更新
  - 错误处理：加载失败返回 `status: 'error'`

  **Must NOT do**:
  - 不要缓存失败的加载结果（允许重试）
  - 不要阻止 UI 渲染（异步加载，不阻塞主线程）

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with T6, T7, T8)
  - **Blocks**: T12 (Sprite), T11 (Label)
  - **Blocked By**: T1, T2

  **References**:
  - Cocos4 AssetManager API: `assetManager.loadRemote(url, ImageAsset, callback)` 或 `resources.load(path, SpriteFrame, callback)`
  - Cocos4 资源类型: `cc.SpriteFrame`, `cc.ImageAsset`, `cc.Font`, `cc.TTFFont`

  **Acceptance Criteria**:
  - [ ] `loadImage('images/test.png')` 返回 Promise<SpriteFrame>
  - [ ] 同一资源两次加载只发一次网络请求（缓存命中）
  - [ ] `useResource('images/test.png', 'image')` 初始返回 `{ status: 'loading' }`

  **QA Scenarios**:
  ```
  Scenario: 图片加载和缓存
    Tool: Bash (Cocos4 runtime)
    Steps:
      1. const p1 = loadImage('images/test.png')
      2. const p2 = loadImage('images/test.png')
      3. console.assert(p1 === p2, 'should return same promise for cached resource')
      4. const spriteFrame = await p1
      5. console.assert(spriteFrame instanceof cc.SpriteFrame)
    Expected Result: 缓存命中，返回有效 SpriteFrame
    Evidence: .sisyphus/evidence/task-9-resource-load.txt
  ```

  **Commit**: YES
  - Message: `feat(core): resource loader with auto-loading and cache`
  - Files: `src/core/resource-loader.ts`

- [x] 10. **View 容器组件**

  **What to do**:
  - `src/components/view.ts`: 封装 Cocos4 Node 为最基础的容器组件
  - 注册到 ComponentRegistry，Props 映射到 `cc.UITransform` 属性
  - Props: id, width, height, x, y, anchorX, anchorY, scaleX, scaleY, rotation, opacity, color, visible
  - 支持 `ref` prop 保存 Node 引用

  **Must NOT do**: 不要实现 children 处理（reconciler 负责）、不要添加布局逻辑

  **Recommended Agent Profile**: Category `quick`, Skills `[]`
  **Parallelization**: Wave 3a (with T11-T15), Blocked By: T6/T7/T8, Blocks: None

  **References**: Cocos4 Node + UITransform API
  **Acceptance Criteria**: `<View width={100} height={50} opacity={0.5} />` 创建 100x50 半透明容器
  **QA Scenarios**: Playwright 验证 View 渲染 100x200 区域 + Bash 验证属性更新后 Node 复用
  **Commit**: YES — `feat(components): View container with transform props`
  **Files**: `src/components/view.ts`

- [x] 11. **Label 文字组件**

  **What to do**:
  - `src/components/label.ts`: 封装 Cocos4 `cc.Label`
  - Props: text, fontSize, fontFamily, font, color, lineHeight, horizontalAlign, verticalAlign, overflow, bold
  - 自动加载字体：`font='zh.fnt'` → resourceLoader.loadFont()
  - 加载中显示 "..."，加载失败降级为系统默认字体

  **Must NOT do**: 不要重新实现文字渲染、不要硬编码字体路径

  **Recommended Agent Profile**: Category `quick`, Skills `[]`
  **Parallelization**: Wave 3a, Blocked By: T6/T7/T8/T9, Blocks: None

  **References**: Cocos4 Label API (`label.string`, `label.fontSize`, `label.color`, etc.)
  **Acceptance Criteria**: `<Label text='Hello' fontSize={24} color='#ff0000' />` 红色 24px 文字
  **QA Scenarios**: Playwright 截图验证文字渲染 + Bash 验证字体加载失败降级
  **Commit**: YES — `feat(components): Label with auto font loading and fallback`
  **Files**: `src/components/label.ts`

- [x] 12. **Sprite 图片组件**

  **What to do**:
  - `src/components/sprite.ts`: 封装 Cocos4 `cc.Sprite`
  - Props: src, sizeMode, type (SIMPLE/SLICED/TILED/FILLED), grayscale, opacity
  - 自动加载: `src='img.png'` → resourceLoader.loadImage()
  - 加载中显示灰色占位矩形，加载失败显示错误图标

  **Must NOT do**: 不要缓存无效资源、不要处理 9-slice 编辑器设置

  **Recommended Agent Profile**: Category `quick`, Skills `[]`
  **Parallelization**: Wave 3a, Blocked By: T6/T7/T8/T9, Blocks: None

  **References**: Cocos4 Sprite API + resourceLoader
  **Acceptance Criteria**: `<Sprite src='hero.png' />` 异步加载显示图片，失败显示错误占位符
  **QA Scenarios**: Playwright 截图验证加载成功和失败两种状态
  **Commit**: YES — `feat(components): Sprite with auto image loading and placeholders`
  **Files**: `src/components/sprite.ts`

- [x] 13. **RichText 富文本组件**

  **What to do**:
  - `src/components/rich-text.ts`: 封装 Cocos4 `cc.RichText`
  - Props: html (支持 `<color>`, `<size>`, `<b>`, `<i>`, `<u>`, `<img>`, `<br>` 标签), fontSize, fontFamily, maxWidth
  - 简化版 API: 也支持 `segments={[{ text, color, size }]}` 数组格式

  **Must NOT do**: 不实现完整 HTML 解析器

  **Recommended Agent Profile**: Category `quick`, Skills `[]`
  **Parallelization**: Wave 3a, Blocked By: T6/T7/T8, Blocks: None

  **References**: Cocos4 RichText native tag set
  **Acceptance Criteria**: `<RichText html="<color=red>Red</color> text" />` 分段颜色渲染
  **QA Scenarios**: Playwright 截图验证富文本渲染
  **Commit**: YES — `feat(components): RichText with Cocos4 HTML tag support`
  **Files**: `src/components/rich-text.ts`

- [x] 14. **Graphics 矢量组件**

  **What to do**:
  - `src/components/graphics.ts`: 封装 Cocos4 `cc.Graphics` 为声明式形状 API
  - Props: shapes（数组，每项 { type: 'rect'|'circle'|'line', ...坐标, fillColor?, strokeColor? }）, lineWidth
  - 每个 render 周期 clear() + 重新 draw 所有 shapes

  **Must NOT do**: V1 不支持 SVG 路径解析

  **Recommended Agent Profile**: Category `quick`, Skills `[]`
  **Parallelization**: Wave 3a, Blocked By: T6/T7/T8, Blocks: None

  **References**: Cocos4 Graphics draw API:
  **Acceptance Criteria**: `<Graphics shapes={[{type:'rect',x:0,y:0,w:100,h:50,fillColor:'red'}]} />` 红色矩形
  **QA Scenarios**: Playwright 截图验证矩形+圆形组合绘制
  **Commit**: YES — `feat(components): Graphics with declarative shape API`
  **Files**: `src/components/graphics.ts`

- [x] 15. **Layout 布局组件 (VBox / HBox)**

  **What to do**:
  - `src/components/layout.ts`: 封装 Cocos4 `cc.Layout`
  - `<VBox>` → Layout.Type.VERTICAL，`<HBox>` → Layout.Type.HORIZONTAL
  - Props: spacing, padding (上/下/左/右), resizeMode, horizontalAlign, verticalAlign
  - 自动管理 children 排列

  **Must NOT do**: 不引入 Flexbox 属性（Cocos4 Layout 不支持 flex grow/shrink）

  **Recommended Agent Profile**: Category `quick`, Skills `[]`
  **Parallelization**: Wave 3a, Blocked By: T6/T7/T8/T10, Blocks: None

  **References**: Cocos4 Layout component API
  **Acceptance Criteria**: `<VBox spacing={10}><Label text='A'/><Label text='B'/></VBox>` 纵向间距 10px
  **QA Scenarios**: Playwright 截图验证 VBox 纵向排列 + HBox 横向排列
  **Commit**: YES — `feat(components): VBox and HBox layout containers`
  **Files**: `src/components/layout.ts`

- [x] 16. **Button 按钮组件**

  **What to do**:
  - `src/components/button.ts`: 封装 Cocos4 `cc.Button`
  - Props: text, disabled, interactable, transition (NONE/COLOR/SPRITE/SCALE), normalColor, pressedColor, hoverColor
  - onClick 事件映射到 `button.node.on('click', handler, this)`
  - 按钮内含 Label 子节点: `<Button text='确定'>` 自动创建 Button + 内部 Label
  - 支持自定义内容: `<Button><Sprite src='icon.png'/><Label text='按钮'/></Button>`

  **Must NOT do**: 不要覆盖 Cocos4 Button 的 transition 动画逻辑

  **Recommended Agent Profile**: Category `quick`, Skills `[]`
  **Parallelization**: Wave 3b (with T17-T20), Blocked By: T6/T7/T8/T10/T11, Blocks: None

  **References**: Cocos4 Button API (`button.interactable`, `button.transition`, clickEvents)
  **Acceptance Criteria**: `<Button text='Click' onClick={fn} />` 点击触发回调，按钮有视觉反馈
  **QA Scenarios**:
  ```
  Scenario: Button 点击事件
    Tool: Playwright
    Steps:
      1. render(<Button text='Click Me' onClick={() => clicked = true} />)
      2. Playwright: await page.click('canvas') at button position
      3. 验证 clicked === true
    Expected Result: 点击触发 onClick 回调
    Evidence: .sisyphus/evidence/task-16-button-click.png
  ```
  **Commit**: YES — `feat(components): Button with click event and auto label`
  **Files**: `src/components/button.ts`

- [x] 17. **Toggle 开关组件**

  **What to do**:
  - `src/components/toggle.ts`: 封装 Cocos4 `cc.Toggle`
  - Props: checked, disabled, onChange(checked: boolean)
  - 支持 checkbox 和 radio 模式
  - Toggle 组容器（RadioGroup）：`<Toggle.Group value={val} onChange={fn}>`

  **Must NOT do**: 不要手动管理 toggle 互斥（用 Cocos4 ToggleContainer）

  **Recommended Agent Profile**: Category `quick`, Skills `[]`
  **Parallelization**: Wave 3b, Blocked By: T6/T7/T8, Blocks: None

  **References**: Cocos4 Toggle + ToggleContainer API
  **Acceptance Criteria**: `<Toggle checked={false} onChange={fn} />` 点击切换，回调接收新值
  **QA Scenarios**: Playwright 验证 Toggle 点击切换 UI + onChange 回调
  **Commit**: YES — `feat(components): Toggle with checkbox and radio group`
  **Files**: `src/components/toggle.ts`

- [x] 18. **Slider 滑块组件**

  **What to do**:
  - `src/components/slider.ts`: 封装 Cocos4 `cc.Slider`
  - Props: value (0-1), min, max, step, disabled, onChange(value: number)
  - 支持水平和垂直方向

  **Must NOT do**: 不要重新实现滑块拖拽逻辑

  **Recommended Agent Profile**: Category `quick`, Skills `[]`
  **Parallelization**: Wave 3b, Blocked By: T6/T7/T8, Blocks: None

  **References**: Cocos4 Slider API (`slider.progress`, `slider.slideEvents`)
  **Acceptance Criteria**: `<Slider value={0.5} onChange={fn} />` 拖拽滑块，回调接收 0-1 值
  **QA Scenarios**: Playwright 拖拽滑块验证进度变化和 onChange
  **Commit**: YES — `feat(components): Slider with drag interaction`
  **Files**: `src/components/slider.ts`

- [x] 19. **ProgressBar 进度条组件**

  **What to do**:
  - `src/components/progress-bar.ts`: 封装 Cocos4 `cc.ProgressBar`
  - Props: progress (0-1), mode (HORIZONTAL/VERTICAL/FILLED), reverse, totalLength
  - 声明式更新：`<ProgressBar progress={0.75} />` 自动更新填充

  **Must NOT do**: 不添加动画（动画由 Tween 层处理）

  **Recommended Agent Profile**: Category `quick`, Skills `[]`
  **Parallelization**: Wave 3b, Blocked By: T6/T7/T8, Blocks: None

  **References**: Cocos4 ProgressBar API (`progressBar.progress`, `progressBar.mode`)
  **Acceptance Criteria**: `<ProgressBar progress={0.6} />` 显示 60% 填充条
  **QA Scenarios**: Playwright 截图验证 0% / 50% / 100% 三种状态
  **Commit**: YES — `feat(components): ProgressBar with declarative progress prop`
  **Files**: `src/components/progress-bar.ts`

- [x] 20. **EditBox 输入框组件**

  **What to do**:
  - `src/components/edit-box.ts`: 封装 Cocos4 `cc.EditBox`
  - Props: value, placeholder, maxLength, inputMode (ANY/NUMERIC/DECIMAL/URL/EMAIL), returnType, onChange(value: string), onConfirm
  - 调用原生输入法（Cocos4 EditBox 自动处理各平台原生输入）

  **Must NOT do**: 不要自己实现软键盘/输入法

  **Recommended Agent Profile**: Category `quick`, Skills `[]`
  **Parallelization**: Wave 3b, Blocked By: T6/T7/T8, Blocks: None

  **References**: Cocos4 EditBox API (`editBox.string`, `editBox.placeholder`, `editBox.maxLength`, `editBox.inputMode`)
  **Acceptance Criteria**: `<EditBox placeholder='输入文字' onChange={fn} />` 键盘输入触发 onChange
  **QA Scenarios**: Playwright 点击输入框，输入文字，验证 onChange 回调
  **Commit**: YES — `feat(components): EditBox with native input support`
  **Files**: `src/components/edit-box.ts`

- [x] 21. **ScrollView 滚动组件**

  **What to do**: `src/components/scroll-view.ts` — 封装 Cocos4 `cc.ScrollView`
  Props: direction, inertia, elastic, bounceDuration, scrollTo(x, y), onScroll(offset)。content 子节点自动设为滚动内容区

  **Must NOT do**: 不重新实现触摸滚动
  **Recommended Agent Profile**: Category `deep`, Skills `[]`
  **Parallelization**: Wave 3c (with T22-T25), Blocked By: T6/T7/T8/T10

  **References**: Cocos4 ScrollView API
  **Acceptance Criteria**: `<ScrollView><View height={2000}>内容</View></ScrollView>` 可滚动超大内容
  **QA Scenarios**: Playwright 拖动滚动，验证 onScroll 回调
  **Commit**: YES — `feat(components): ScrollView with touch scroll and elastic bounce`
  **Files**: `src/components/scroll-view.ts`

- [x] 22. **PageView 翻页组件**

  **What to do**: `src/components/page-view.ts` — 封装 Cocos4 `cc.PageView`
  Props: currentPage, direction, onPageChanged(pageIndex), 支持 `<PageView.Dots>` 指示器

  **Must NOT do**: 不重新实现翻页手势
  **Recommended Agent Profile**: Category `deep`, Skills `[]`
  **Parallelization**: Wave 3c, Blocked By: T6/T7/T8/T21

  **References**: Cocos4 PageView + PageViewIndicator
  **Acceptance Criteria**: `<PageView><View/><View/><View/></PageView>` 三页滑动切换
  **QA Scenarios**: Playwright 滑动翻页验证 onPageChanged
  **Commit**: YES — `feat(components): PageView with swipe and dots indicator`
  **Files**: `src/components/page-view.ts`

- [x] 23. **Mask 遮罩组件**

  **What to do**: `src/components/mask.ts` — 封装 Cocos4 `cc.Mask`
  Props: type (RECT/ELLIPSE/IMAGE_STENCIL), inverted, alphaThreshold

  **Recommended Agent Profile**: Category `quick`, Skills `[]`
  **Parallelization**: Wave 3c, Blocked By: T6/T7/T8
  **Acceptance Criteria**: `<Mask type='ELLIPSE'><Sprite src='img.png'/></Mask>` 圆形裁剪
  **QA Scenarios**: Playwright 截图验证圆形/矩形遮罩
  **Commit**: YES — `feat(components): Mask with rect, ellipse, stencil`
  **Files**: `src/components/mask.ts`

- [x] 24. **SafeArea + Widget 适配组件**

  **What to do**: `src/components/safe-area.ts` — 封装 Cocos4 `cc.SafeArea` + `cc.Widget`
  `<SafeArea>` 自动适配刘海屏，`<Widget top={0} right={10}>` 锚点定位

  **Recommended Agent Profile**: Category `quick`, Skills `[]`
  **Parallelization**: Wave 3c, Blocked By: T6/T7/T8
  **Acceptance Criteria**: `<Widget top={10} right={10}><Button text='X'/></Widget>` 固定右上角
  **QA Scenarios**: Playwright 多分辨率测试 Widget 定位
  **Commit**: YES — `feat(components): SafeArea and Widget for screen adaptation`
  **Files**: `src/components/safe-area.ts`, `src/components/widget.ts`

- [x] 25. **Particle2D 粒子组件**

  **What to do**: `src/components/particle2d.ts` — 封装 Cocos4 `cc.ParticleSystem2D`
  Props: file (.plist 路径), autoRemoveOnFinish, playOnLoad, loop, life, speed。自动加载 .plist

  **Recommended Agent Profile**: Category `unspecified-high`, Skills `[]`
  **Parallelization**: Wave 3c, Blocked By: T6/T7/T8/T9
  **Acceptance Criteria**: `<Particle2D file='fire.plist' playOnLoad loop />` 自动播放循环粒子
  **QA Scenarios**: Playwright 多帧截图验证粒子变化
  **Commit**: YES — `feat(components): Particle2D with plist loading and playback`
  **Files**: `src/components/particle2d.ts`

- [x] 26. **错误边界 (ErrorBoundary)**

  **What to do**: `src/core/error-boundary.ts` — 组件级容错
  `<ErrorBoundary fallback={<Label text='出错了'/>}>` 捕获 render 异常，显示 fallback UI，记录到 DevTools

  **Recommended Agent Profile**: Category `unspecified-high`, Skills `[]`
  **Parallelization**: Wave 4 (with T27-T31), Blocked By: T8
  **Acceptance Criteria**: 子组件抛错时显示 fallback，不白屏崩溃
  **QA Scenarios**: Playwright 渲染抛出异常的组件，验证 fallback 显示 + 其他组件正常
  **Commit**: YES — `feat(system): ErrorBoundary with graceful degradation`
  **Files**: `src/core/error-boundary.ts`

- [x] 27. **加载状态 & 占位符 (Suspense)**

  **What to do**: `src/core/suspense.ts` — 异步加载状态管理
  `<Suspense fallback={<Placeholder/>}>` 资源加载中显示骨架屏，加载完成自动切换

  **Recommended Agent Profile**: Category `unspecified-high`, Skills `[]`
  **Parallelization**: Wave 4, Blocked By: T8/T9
  **Acceptance Criteria**: `<Suspense fallback={<View/>}><Sprite src='slow.png'/></Suspense>` 加载中显示占位符
  **QA Scenarios**: Playwright 截取加载中和加载完成两种状态
  **Commit**: YES — `feat(system): Suspense with loading states and placeholder`
  **Files**: `src/core/suspense.ts`

- [x] 28. **Tween 动效系统**

  **What to do**: `src/animation/tween.ts` — 封装 Cocos4 `cc.Tween` 为声明式 API
  `<View animate={{ x: 100, duration: 0.5, easing: 'sineOut' }}>` 平移动画，支持链式队列和 onAnimationStart/End 回调

  **Recommended Agent Profile**: Category `deep`, Skills `[]`
  **Parallelization**: Wave 4, Blocked By: T8
  **Acceptance Criteria**: `<View animate={{ scale: { to: 1.2, yoyo: true } }}>` 缩放动画
  **QA Scenarios**: Playwright 多帧截图验证动画执行 + onAnimationEnd 回调
  **Commit**: YES — `feat(animation): declarative Tween system with easing and chaining`
  **Files**: `src/animation/tween.ts`

- [x] 29. **主题变量系统**

  **What to do**: `src/theme/theme.ts` — 主题变量管理
  `createTheme(config)` 定义变量，`<ThemeProvider theme={darkTheme}>` 注入，`useTheme()` 访问

  **Recommended Agent Profile**: Category `quick`, Skills `[]`
  **Parallelization**: Wave 4, Blocked By: T5
  **Acceptance Criteria**: `<ThemeProvider theme={darkTheme}><Label text='Hi' color='primary'/></ThemeProvider>` 主题色生效
  **QA Scenarios**: Bash 验证 createTheme 对象 + Playwright 验证颜色
  **Commit**: YES — `feat(theme): theme variable system with provider and presets`
  **Files**: `src/theme/theme.ts`

- [x] 30. **DevTools 调试面板**

  **What to do**: `src/devtools/devtools.ts` — 浏览器内组件树检查器
  `?devtools=true` 显示可折叠面板，tree view 展示组件层级 + props/state

  **Recommended Agent Profile**: Category `visual-engineering`, Skills `[playwright]`
  **Parallelization**: Wave 4, Blocked By: T8/T10
  **Acceptance Criteria**: devtools 参数启动后右下角显示可折叠调试面板
  **QA Scenarios**: Playwright 打开带 devtools 页面，截图验证面板和组件树
  **Commit**: YES — `feat(devtools): in-browser component inspector`
  **Files**: `src/devtools/devtools.ts`

- [x] 31. **公共 API 导出 (index.ts)**

  **What to do**: `src/index.ts` — barrel export 所有公共 API
  导出 20+ 组件 + useState/createSignal/createEffect/render/useTheme/useResource + JSX runtime + 类型

  **Recommended Agent Profile**: Category `quick`, Skills `[]`
  **Parallelization**: Wave 4, Blocked By: T10-T30, Blocks: T32
  **Acceptance Criteria**: `import { View, Button, render } from 'cocos-ui'` 全部可用
  **QA Scenarios**: Bash 验证所有导出无导入错误
  **Commit**: YES — `feat(api): public API barrel exports`
  **Files**: `src/index.ts`

- [x] 32. **Vite 开发服务器 + Cocos4 WebGL 集成**

  **What to do**: `vite.config.ts` + `examples/index.html` + `examples/main.tsx`
  Vite 配置 esbuild JSX automatic + Cocos4 alias + HMR。`npm run dev` 启动 WebGL 预览

  **Recommended Agent Profile**: Category `visual-engineering`, Skills `[playwright]`
  **Parallelization**: Wave 5 (with T33), Blocked By: T31, Blocks: F3
  **Acceptance Criteria**: `npm run dev` → 浏览器显示 Cocos4 Canvas + UI 组件
  **QA Scenarios**: Playwright 打开 localhost 验证 Canvas 渲染 + HMR 热更新
  **Commit**: YES — `feat(dev): Vite dev server with WebGL preview and HMR`
  **Files**: `vite.config.ts, examples/index.html, examples/main.tsx, package.json`

- [x] 33. **示例 TSX 应用**

  **What to do**: `examples/demo.tsx` — 完整组件展示，包含计数交互、布局、动效、粒子、错误边界、主题

  **Recommended Agent Profile**: Category `quick`, Skills `[]`
  **Parallelization**: Wave 5, Blocked By: T31/T32, Blocks: F3
  **Acceptance Criteria**: 浏览器中全部组件可交互、无报错
  **QA Scenarios**: Playwright 截图每个组件
  **Commit**: YES — `feat(examples): comprehensive demo app`
  **Files**: `examples/demo.tsx`

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + linter. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp).
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [x] F3. **Agent QA — 全组件场景验证** — `unspecified-high` + `playwright`
  Start from clean state. Use Playwright to: (1) open Vite dev server page, (2) verify ALL 20+ components render correctly, (3) test Button onClick, Toggle onChange, Slider interaction, (4) verify ErrorBoundary renders on error, (5) verify placeholder shows during load, (6) test DevTools panel opens. Save screenshots to `.sisyphus/evidence/final-qa/`.
  Output: `Components [N/N pass] | Interactions [N/N] | Evidence [N files] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Wave 1**: `feat(scaffold): project setup with TSX config and types`
- **Wave 2**: `feat(core): JSX reconciler, node factory, props mapper`
- **Wave 3**: `feat(components): display, interactive, and advanced UI components`
- **Wave 4**: `feat(system): error boundary, tween, theme, devtools`
- **Wave 5**: `feat(dev): vite dev server and demo app`

---

## Success Criteria

### Verification Commands
```bash
# 启动开发服务器
npm run dev
# 预期: Vite 启动在 localhost:5173，浏览器打开显示 Cocos4 画布 + 组件展示

# TypeScript 编译检查
npx tsc --noEmit
# 预期: 0 errors

# AI 生成的示例代码验证
cat examples/basic.tsx
# 预期: 纯 TSX 文件，import from 'cocos-ui'
```

### Final Checklist
- [ ] All "Must Have" present (JSX runtime, components, state, error boundary, animation, particles, theme, dev server, devtools)
- [ ] All "Must NOT Have" absent (no React, no external layout engine, no editor dep)
- [ ] `npm run dev` 启动成功，浏览器可见 UI
- [ ] 全部 20+ 组件在浏览器中可交互
- [ ] Agent QA 全部场景通过
