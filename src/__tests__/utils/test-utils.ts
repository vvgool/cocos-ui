/**
 * Test Utilities for CocosUI
 *
 * Provides helper functions for creating test fixtures,
 * managing test lifecycle, and mocking VNode props.
 */

import type { VNode } from '../../core/vnode';
import { MockNode, MockComponent, setupGlobalCc, cleanupGlobalCc } from './mock-cocos';
import { vi } from 'vitest';

/**
 * Create a test container node
 *
 * Creates a mock Node to serve as the root container for test renders.
 * The container is automatically cleaned up by cleanupTest().
 *
 * @param name - Optional name for the container node (default: 'TestContainer')
 * @returns A mock Node instance to use as test container
 *
 * @example
 * ```ts
 * describe('MyComponent', () => {
 *   let container: MockNode;
 *
 *   beforeEach(() => {
 *     container = createTestContainer('MyComponentTest');
 *   });
 *
 *   afterEach(() => {
 *     cleanupTest();
 *   });
 *
 *   it('should render correctly', () => {
 *     render(<MyComponent />, container);
 *     expect(container.children.length).toBe(1);
 *   });
 * });
 * ```
 */
export function createTestContainer(name: string = 'TestContainer'): MockNode {
  const container = new MockNode(name);
  return container;
}

/**
 * Cleanup test state after each test
 *
 * Performs the following cleanup operations:
 * - Removes the global cc namespace
 * - Clears any pending timers
 * - Resets mock function call history
 *
 * Should be called in afterEach() hooks.
 *
 * @example
 * ```ts
 * afterEach(() => {
 *   cleanupTest();
 * });
 * ```
 */
export function cleanupTest(): void {
  cleanupGlobalCc();

  // Clear all timers
  vi.clearAllTimers();

  // Reset all mocks
  vi.clearAllMocks();
}

/**
 * Setup test environment before each test
 *
 * Performs the following setup operations:
 * - Sets up the global cc namespace with mocks
 * - Enables fake timers
 *
 * Should be called in beforeEach() hooks.
 *
 * @example
 * ```ts
 * beforeEach(() => {
 *   setupTest();
 * });
 * ```
 */
export function setupTest(): void {
  setupGlobalCc();

  // Use fake timers for controlled time-based testing
  vi.useFakeTimers();
}

/**
 * Create a mock VNode prop
 *
 * Helper for creating typed prop objects for VNode testing.
 * Useful for testing component prop handling and reconciliation.
 *
 * @param name - Prop name
 * @param value - Prop value
 * @returns An object with the single prop
 *
 * @example
 * ```ts
 * // Create props for a Label VNode
 * const props = {
 *   ...mockProp('string', 'Hello World'),
 *   ...mockProp('fontSize', 24),
 *   ...mockProp('color', { r: 255, g: 0, b: 0, a: 255 }),
 * };
 * ```
 */
export function mockProp<T extends string, V>(name: T, value: V): Record<T, V> {
  return { [name]: value } as Record<T, V>;
}

/**
 * Create mock VNode children array
 *
 * Helper for creating children arrays for VNode testing.
 *
 * @param children - Array of child VNodes or null/undefined
 * @returns The children array or undefined
 *
 * @example
 * ```ts
 * const vnode: VNode = {
 *   type: 'View',
 *   props: {
 *     ...mockProp('id', 'parent'),
 *     children: mockChildren([
 *       { type: 'Label', props: { string: 'Child 1' } },
 *       { type: 'Label', props: { string: 'Child 2' } },
 *     ]),
 *   },
 * };
 * ```
 */
export function mockChildren(children: Array<Partial<VNode>> | undefined | null): Array<Partial<VNode>> | undefined {
  return children ?? undefined;
}

/**
 * Wait for next animation frame
 *
 * Utility for waiting for reconciliation to complete.
 * Since the reconciler uses requestAnimationFrame, this helper
 * advances fake timers and waits for the next frame.
 *
 * @example
 * ```ts
 * it('should update after state change', async () => {
 *   render(<Counter />, container);
 *
 *   // Trigger state update
 *   fireEvent.click(container.getChildByName('button')!);
 *
 *   // Wait for reconciliation
 *   await waitForNextFrame();
 *
 *   expect(container.getChildByName('count')!.name).toBe('2');
 * });
 * ```
 */
export async function waitForNextFrame(): Promise<void> {
  await Promise.resolve();
  vi.advanceTimersByTime(16); // Advance by one frame (~60fps)
}

/**
 * Get all children from a container
 *
 * Helper for asserting on rendered children.
 *
 * @param container - The container node
 * @returns Array of child nodes
 *
 * @example
 * ```ts
 * const children = getChildren(container);
 * expect(children).toHaveLength(3);
 * ```
 */
export function getChildren(container: MockNode): MockNode[] {
  return [...container.children];
}

/**
 * Find child by name
 *
 * Helper for finding a specific child node by name.
 *
 * @param container - The container node
 * @param name - The name to search for
 * @returns The found node or null
 *
 * @example
 * ```ts
 * const labelNode = findChildByName(container, 'myLabel');
 * expect(labelNode).not.toBeNull();
 * ```
 */
export function findChildByName(container: MockNode, name: string): MockNode | null {
  return container.getChildByName(name);
}

/**
 * Assert node has component
 *
 * Helper for asserting that a node has a specific component type.
 *
 * @param node - The node to check
 * @param componentType - The component constructor
 * @returns True if node has the component
 *
 * @example
 * ```ts
 * expect(hasComponent(node, MockLabel)).toBe(true);
 * ```
 */
export function hasComponent(node: MockNode, componentType: new (node: MockNode) => any): boolean {
  return node.getComponent(componentType) !== null;
}

/**
 * Get component from node
 *
 * Helper for getting a component from a node with type safety.
 *
 * @param node - The node to get component from
 * @param componentType - The component constructor
 * @returns The component instance or null
 *
 * @example
 * ```ts
 * const label = getComponent(node, MockLabel);
 * expect(label?.string).toBe('Hello');
 * ```
 */
export function getComponent<T extends MockComponent>(node: MockNode, componentType: new (node: MockNode) => T): T | null {
  return node.getComponent(componentType) as T | null;
}
