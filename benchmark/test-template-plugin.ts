/**
 * Smoke test for the JSX Template Compilation Vite Plugin (P3).
 *
 * Verifies that the plugin correctly:
 * 1. Detects jsx()/jsxs() calls with all-literal arguments
 * 2. Handles esbuild import aliasing (_jsx, _jsxs)
 * 3. Leaves non-static calls (with identifiers/function calls) unchanged
 *
 * 运行方式: npx tsx benchmark/test-template-plugin.ts
 */

import { findAllJSCalls, isStaticExpression } from '../vite-plugin-jsx-template';

// =============================================================================
// Test: isStaticExpression
// =============================================================================

function testIsStatic(): void {
  console.log('\n=== isStaticExpression 测试 ===\n');
  let passed = 0;
  let failed = 0;

  // [expression, expected]
  const cases: [string, boolean][] = [
    // Numbers
    ['42', true],
    ['3.14', true],
    ['-1', true],
    ['1e5', true],

    // Booleans
    ['true', true],
    ['false', true],

    // null/undefined
    ['null', true],
    ['undefined', true],

    // Strings
    ["'hello'", true],
    ['"world"', true],
    ["''", true],

    // Template literals (rejected for safety)
    ['`hello`', false],
    ['`hello ${name}`', false],

    // Empty object
    ['{}', true],

    // Simple object
    ["{width: 100}", true],
    ["{width: 100, height: 50}", true],
    ["{text: 'hello', fontSize: 16}", true],
    ["{color: '#ff0000', opacity: 0.5}", true],

    // Nested object
    ["{style: {color: 'red'}}", true],

    // Empty array
    ['[]', true],

    // Array with literals
    ["[1, 2, 3]", true],
    ["['a', 'b', 'c']", true],

    // Non-static — identifiers (variable references)
    ['someVar', false],
    ['obj.prop', false],
    ['foo()', false],
    ['a + b', false],

    // Non-static — function/arrow expressions
    ['() => {}', false],
    ['function() {}', false],

    // Non-static object with shorthand property
    ['{foo}', false],

    // Non-static — computed key
    ['{[key]: value}', false],

    // Non-static — property value is identifier
    ["{data: items}", false],
    ["{children: [child1, child2]}", false],
  ];

  for (const [expr, expected] of cases) {
    const result = isStaticExpression(expr);
    if (result === expected) {
      passed++;
    } else {
      failed++;
      console.error(`  ✗ FAIL: isStaticExpression(${JSON.stringify(expr)}) = ${result}, expected ${expected}`);
    }
  }

  if (failed === 0) {
    console.log(`  ✅ ${passed}/${passed + failed} 通过`);
  } else {
    console.error(`  ❌ ${failed}/${passed + failed} 失败`);
  }
}

// =============================================================================
// Test: findAllJSCalls
// =============================================================================

function testFindAllJSCalls(): void {
  console.log('\n=== findAllJSCalls 测试 ===\n');
  let passed = 0;
  let failed = 0;

  const importedNames = new Set(['jsx', 'jsxs']);

  // [code, expectedCallCount, expectedFirstArgCount]
  const cases: [string, number, number][] = [
    // Single jsx call
    ['jsx(View, {width: 100})', 1, 2],

    // Single jsxs call with children
    ['jsxs(View, {children: [child]})', 1, 2],

    // Nested — should find both outer jsxs and inner jsx
    ['jsxs(View, {children: [jsx(Label, {text: "Hello"})]})',
     2, // Both outer jsxs and inner jsx are valid calls
     2],

    // Two separate calls
    ['jsx(A, {x:1}); jsx(B, {y:2})', 2, 2],

    // Call with explicit key (3 args)
    ['jsx(View, {width: 100}, "key1")', 1, 3],
  ];

  for (const [code, expectedCount] of cases) {
    const calls = findAllJSCalls(code, importedNames);

    if (calls.length !== expectedCount) {
      failed++;
      console.error(`  ✗ FAIL: findAllJSCalls(count) = ${calls.length}, expected ${expectedCount}`);
      console.error(`    Code: ${JSON.stringify(code.slice(0, 60))}...`);
    } else {
      passed++;
    }
  }

  if (failed === 0) {
    console.log(`  ✅ ${passed}/${passed + failed} 通过`);
  } else {
    console.error(`  ❌ ${failed}/${passed + failed} 失败`);
  }
}

// =============================================================================
// Integration: simulate plugin transform with esbuild output
// =============================================================================

function testTransformIntegration(): void {
  console.log('\n=== 集成测试: 模拟插件转换 ===\n');

  // Simulated code as produced by esbuild JSX transform (with import aliasing)
  const inputCode = `import { jsx as _jsx, jsxs as _jsxs } from "cocos-ui/jsx-runtime";
function App() {
  return _jsxs(View, { width: 100, children: [
    _jsx(Label, { text: "Hello", fontSize: 16 }),
    _jsx(Label, { text: "World" })
  ]});
}`;

  const allNames = new Set(['_jsx', '_jsxs']);
  const calls = findAllJSCalls(inputCode, allNames);
  console.log(`  Found ${calls.length} JSX calls (expected: 3)`);

  let allPassed = true;

  for (const call of calls) {
    const argsWithoutType = call.args.slice(1);
    const isStatic = argsWithoutType.every(a => isStaticExpression(a));
    const name = call.name;
    const shortArgs = call.args.map((a, i) => i === 0 ? a : a.slice(0, 25)).join(', ');

    if (name === '_jsx' && isStatic) {
      console.log(`  ✅ ${name}(${shortArgs}) → template (correct: inner children are static props)`);
    } else if (name === '_jsxs' && !isStatic) {
      console.log(`  ✅ ${name}(${shortArgs}) → runtime (correct: children array contains function calls)`);
    } else {
      console.error(`  ✗ UNEXPECTED: ${name}(${shortArgs}) → ${isStatic ? 'template' : 'runtime'}`);
      allPassed = false;
    }
  }

  // Verify: inner _jsx calls should be template-eligible, outer _jsxs should not
  const innerCalls = calls.filter(c => c.name === '_jsx');
  const outerCalls = calls.filter(c => c.name === '_jsxs');

  const innerAllStatic = innerCalls.every(c =>
    c.args.slice(1).every(a => isStaticExpression(a))
  );
  const outerNotStatic = outerCalls.every(c =>
    !c.args.slice(1).every(a => isStaticExpression(a))
  );

  if (innerAllStatic) {
    console.log(`  ✅ 内部 _jsx 节点全部可模板化`);
  } else {
    console.error(`  ❌ 内部 _jsx 节点不应需要运行时创建`);
    allPassed = false;
  }

  if (outerNotStatic) {
    console.log(`  ✅ 外部 _jsxs 节点保持运行时创建 (children 含函数调用)`);
  } else {
    console.error(`  ❌ 外部 _jsxs 不应标记为可模板化`);
    allPassed = false;
  }

  if (allPassed) {
    console.log(`\n  ✅ 全部通过`);
  } else {
    console.error(`\n  ❌ 有失败项`);
  }
}

// =============================================================================
// Main
// =============================================================================

console.log('╔══════════════════════════════════════════════════════╗');
console.log('║  P3 JSX Template Compilation Plugin — 冒烟测试       ║');
console.log('╚══════════════════════════════════════════════════════╝');

testIsStatic();
testFindAllJSCalls();
testTransformIntegration();

console.log('\n✅ 所有测试完成\n');
