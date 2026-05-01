import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MockNode, MockComponent } from '../../__tests__/utils/mock-cocos';
import { setupTest, cleanupTest, createTestContainer } from '../../__tests__/utils/test-utils';
import { createHostNode, ComponentRegistry } from '../../core/create-element';
import '../../components/safe-area';

class MockSafeArea extends MockComponent {
  constructor(node?: MockNode) {
    super(node);
    this.name = 'SafeArea';
  }
}

function setupSafeAreaMocks(): void {
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).cc.SafeArea = MockSafeArea;
  }
}

describe('SafeArea', () => {
  let container: MockNode;

  beforeEach(() => {
    setupTest();
    setupSafeAreaMocks();
    container = createTestContainer('SafeAreaTestContainer');
  });

  afterEach(() => {
    cleanupTest();
  });

  describe('component registration', () => {
    it('should register SafeArea component with ComponentRegistry', () => {
      const factory = ComponentRegistry.get('SafeArea');
      expect(factory).toBeDefined();
      expect(typeof factory).toBe('function');
    });

    it('should create SafeArea node via createHostNode', () => {
      const node = createHostNode({ type: 'SafeArea', props: {} } as any);
      expect(node).toBeDefined();
      expect(node).toBeInstanceOf(MockNode);
    });

    it('should have SafeArea component attached after creation', () => {
      const node = createHostNode({ type: 'SafeArea', props: {} } as any);
      const safeArea = node.getComponent(MockSafeArea);
      expect(safeArea).toBeDefined();
      expect(safeArea?.name).toBe('SafeArea');
    });
  });

  describe('screen adaptation', () => {
    it('should create SafeArea component for automatic screen adaptation', () => {
      const node = createHostNode({ type: 'SafeArea', props: {} } as any);
      const safeArea = node.getComponent(MockSafeArea);
      expect(safeArea).toBeDefined();
    });

    it('should work with custom node name via id prop', () => {
      const node = createHostNode({ type: 'SafeArea', props: { id: 'MySafeArea' } } as any);
      expect(node.name).toBe('MySafeArea');
      const safeArea = node.getComponent(MockSafeArea);
      expect(safeArea).toBeDefined();
    });
  });

  describe('default behavior', () => {
    it('should create active node by default', () => {
      const node = createHostNode({ type: 'SafeArea', props: {} } as any);
      expect(node.active).toBe(true);
    });
  });
});
