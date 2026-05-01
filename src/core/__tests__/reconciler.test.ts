import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, reconcileChildren, commitWork } from '../reconciler';
import { createVNode, createFiber, type VNode, type FiberNode } from '../vnode';
import { ComponentRegistry, registerComponent } from '../create-element';
import { registerPropMapping } from '../apply-props';
import { MockNode, MockLabel, MockSprite, MockButton, MockUITransform, setupGlobalCc, cleanupGlobalCc } from '../../__tests__/utils/mock-cocos';
import { createTestContainer, setupTest, cleanupTest, getChildren, hasComponent } from '../../__tests__/utils/test-utils';

(MockNode as any).prototype.removeComponent = function(comp: any) {
  const idx = this.components.indexOf(comp);
  if (idx !== -1) {
    this.components.splice(idx, 1);
  }
};

describe('reconciler', () => {
  beforeEach(() => {
    setupGlobalCc();
    setupTest();
    ComponentRegistry.clear();
    
    registerPropMapping('Label', {
      string: (node, value) => {
        const label = node.getComponent(MockLabel);
        if (label) {
          label.string = value;
        }
      },
    });
  });

  afterEach(() => {
    cleanupGlobalCc();
    cleanupTest();
  });

  describe('render()', () => {
    it('should create node tree on initial render', () => {
      const container = createTestContainer();

      registerComponent('View', (node) => {
      });
      registerComponent('Label', (node) => {
        node.addComponent(MockLabel);
      });

      const vnode = createVNode('View', { id: 'root' }, [
        createVNode('Label', { id: 'myLabel', string: 'Hello' }),
      ]);
      render(vnode, container);

      expect(container.children.length).toBe(1);
      const labelNode = container.children[0];
      expect(labelNode.name).toBe('myLabel');
      expect(hasComponent(labelNode, MockLabel)).toBe(true);
    });

    it('should render multiple children', () => {
      const container = createTestContainer();

      registerComponent('View', (node) => {
      });
      registerComponent('Label', (node) => {
        node.addComponent(MockLabel);
      });

      const vnode = createVNode('View', { id: 'parent' }, [
        createVNode('Label', { id: 'child1', string: 'First' }),
        createVNode('Label', { id: 'child2', string: 'Second' }),
      ]);

      render(vnode, container);

      expect(container.children.length).toBe(2);
      expect(container.children[0].name).toBe('child1');
      expect(container.children[1].name).toBe('child2');
    });

    it('should handle text nodes', () => {
      const container = createTestContainer();

      registerComponent('View', (node) => {
      });

      const vnode = createVNode('View', { id: 'parent' }, ['Hello World']);
      render(vnode, container);

      expect(container.children.length).toBe(1);
      const textNode = container.children[0];
      expect(textNode.name).toBe('#text');
      expect(hasComponent(textNode, MockLabel)).toBe(true);
    });

    it('should attach component via ComponentRegistry', () => {
      const container = createTestContainer();

      let capturedNode: any = null;
      registerComponent('Sprite', (node, props) => {
        capturedNode = node;
        const sprite = node.addComponent(MockSprite);
        if (props.spriteFrame) {
          sprite.spriteFrame = props.spriteFrame;
        }
      });

      const vnode = createVNode('View', { id: 'root' }, [
        createVNode('Sprite', { id: 'mySprite', spriteFrame: { id: 'frame1' } }),
      ]);
      render(vnode, container);

      expect(container.children.length).toBe(1);
      const spriteNode = container.children[0];
      expect(spriteNode).toBe(capturedNode);
      expect(hasComponent(spriteNode, MockSprite)).toBe(true);
      const sprite = spriteNode.getComponent(MockSprite);
      expect(sprite?.spriteFrame).toEqual({ id: 'frame1' });
    });
  });

  describe('render() - node cleanup', () => {
    it('should clear all children on render(null, container)', () => {
      const container = createTestContainer();

      registerComponent('View', (node) => {
      });
      registerComponent('Label', (node) => {
        node.addComponent(MockLabel);
      });

      const vnode = createVNode('View', { id: 'root' }, [
        createVNode('Label', { id: 'myLabel', string: 'Hello' }),
      ]);
      render(vnode, container);

      expect(container.children.length).toBe(1);

      render(null, container);

      expect(container.children.length).toBe(0);
    });
  });

  describe('reconcileChildren()', () => {
    it('should compare old and new VNode lists', () => {
      const parentFiber = createFiber(createVNode('View', {}));
      parentFiber.node = new MockNode('Parent');

      const oldVNode1 = createVNode('Label', { id: 'old1' });
      const oldVNode2 = createVNode('Label', { id: 'old2' });
      const oldFiber1 = createFiber(oldVNode1, parentFiber);
      const oldFiber2 = createFiber(oldVNode2, parentFiber);
      oldFiber1.sibling = oldFiber2;
      parentFiber.child = oldFiber1;

      const newVNodes: VNode[] = [
        createVNode('Label', { id: 'new1' }),
        createVNode('Label', { id: 'new2' }),
        createVNode('Label', { id: 'new3' }),
      ];

      const result = reconcileChildren(parentFiber, newVNodes);

      expect(result.firstChild).not.toBeNull();
      expect(result.hasChanges).toBe(true);

      let count = 0;
      let child: FiberNode | null = parentFiber.child;
      while (child) {
        count++;
        child = child.sibling;
      }
      expect(count).toBe(3);
    });

    it('should generate correct effectTag for CREATE', () => {
      const parentFiber = createFiber(createVNode('View', {}));
      parentFiber.node = new MockNode('Parent');

      const newVNodes: VNode[] = [
        createVNode('Label', { key: 'new', id: 'new' }),
      ];

      reconcileChildren(parentFiber, newVNodes);

      const child = parentFiber.child;
      expect(child).not.toBeNull();
      expect(child!.effectTag).toBe('CREATE');
    });

    it('should generate correct effectTag for UPDATE when props change', () => {
      const parentFiber = createFiber(createVNode('View', {}));
      parentFiber.node = new MockNode('Parent');

      const oldVNode = createVNode('Label', { key: 'same', id: 'label', string: 'Old' });
      const oldFiber = createFiber(oldVNode, parentFiber);
      oldFiber.node = new MockNode('Label');
      parentFiber.child = oldFiber;

      const newVNodes: VNode[] = [
        createVNode('Label', { key: 'same', id: 'label', string: 'New' }),
      ];

      reconcileChildren(parentFiber, newVNodes);

      const child = parentFiber.child;
      expect(child).not.toBeNull();
      expect(child!.effectTag).toBe('UPDATE');
    });

    it('should generate NONE effectTag when props are unchanged', () => {
      const parentFiber = createFiber(createVNode('View', {}));
      parentFiber.node = new MockNode('Parent');

      const oldVNode = createVNode('Label', { key: 'same', id: 'label', string: 'Same' });
      const oldFiber = createFiber(oldVNode, parentFiber);
      oldFiber.node = new MockNode('Label');
      parentFiber.child = oldFiber;

      const newVNodes: VNode[] = [
        createVNode('Label', { key: 'same', id: 'label', string: 'Same' }),
      ];

      reconcileChildren(parentFiber, newVNodes);

      const child = parentFiber.child;
      expect(child).not.toBeNull();
      expect(child!.effectTag).toBe('NONE');
    });

    it('should generate DELETE effectTag for removed children', () => {
      const parentFiber = createFiber(createVNode('View', {}));
      parentFiber.node = new MockNode('Parent');

      const oldVNode = createVNode('Label', { key: 'removed', id: 'label' });
      const oldFiber = createFiber(oldVNode, parentFiber);
      oldFiber.node = new MockNode('Label');
      parentFiber.child = oldFiber;

      const newVNodes: VNode[] = [
        createVNode('Label', { key: 'kept', id: 'kept-label' }),
      ];

      reconcileChildren(parentFiber, newVNodes);

      let deleteFiber: FiberNode | null = null;
      let child: FiberNode | null = parentFiber.child;
      while (child) {
        if (child.effectTag === 'DELETE') {
          deleteFiber = child;
          break;
        }
        child = child.sibling;
      }

      expect(deleteFiber).not.toBeNull();
      expect(deleteFiber!.vnode.key).toBe('removed');
    });

    it('should handle keyed children correctly', () => {
      const parentFiber = createFiber(createVNode('View', {}));
      parentFiber.node = new MockNode('Parent');

      const oldVNode1 = createVNode('Label', { key: 'a', id: 'label-a' });
      const oldVNode2 = createVNode('Label', { key: 'b', id: 'label-b' });
      const oldFiber1 = createFiber(oldVNode1, parentFiber);
      const oldFiber2 = createFiber(oldVNode2, parentFiber);
      oldFiber1.sibling = oldFiber2;
      parentFiber.child = oldFiber1;

      const newVNodes: VNode[] = [
        createVNode('Label', { key: 'b', id: 'label-b-new' }),
        createVNode('Label', { key: 'a', id: 'label-a' }),
      ];

      const result = reconcileChildren(parentFiber, newVNodes);

      expect(result.hasChanges).toBe(true);

      let count = 0;
      let child: FiberNode | null = parentFiber.child;
      while (child) {
        count++;
        child = child.sibling;
      }
      expect(count).toBe(2);
    });
  });

  describe('commitWork()', () => {
    it('should CREATE new nodes', () => {
      const container = createTestContainer();

      registerComponent('Label', (node) => {
        node.addComponent(MockLabel);
      });

      const parentFiber = createFiber(createVNode('View', {}));
      parentFiber.node = container;

      const childVNode = createVNode('Label', { id: 'newLabel', string: 'Hello' });
      const childFiber = createFiber(childVNode, parentFiber);
      childFiber.effectTag = 'CREATE';
      parentFiber.child = childFiber;

      commitWork(parentFiber);

      expect(container.children.length).toBe(1);
      const labelNode = container.children[0];
      expect(labelNode.name).toBe('newLabel');
      expect(hasComponent(labelNode, MockLabel)).toBe(true);
    });

    it('should UPDATE existing nodes', () => {
      const container = createTestContainer();

      registerComponent('Label', (node) => {
        node.addComponent(MockLabel);
      });

      const oldNode = new MockNode('Label');
      const oldLabel = oldNode.addComponent(MockLabel);
      oldLabel.string = 'Old';

      const oldVNode = createVNode('Label', { id: 'myLabel', string: 'Old' });
      const oldFiber = createFiber(oldVNode);
      oldFiber.node = oldNode;

      const newVNode = createVNode('Label', { id: 'myLabel', string: 'New' });
      const newFiber = createFiber(newVNode);
      newFiber.node = oldNode;
      newFiber.effectTag = 'UPDATE';
      newFiber.alternate = oldFiber;

      const parentFiber = createFiber(createVNode('View', {}));
      parentFiber.node = container;
      parentFiber.child = newFiber;

      commitWork(parentFiber);

      expect(oldLabel.string).toBe('New');
    });

    it('should DELETE nodes', () => {
      const container = createTestContainer();

      registerComponent('Label', (node) => {
        node.addComponent(MockLabel);
      });

      const childNode = new MockNode('Label');
      childNode.addComponent(MockLabel);
      container.addChild(childNode);

      expect(container.children.length).toBe(1);

      const deleteVNode = createVNode('Label', { id: 'toDelete' });
      const deleteFiber = createFiber(deleteVNode);
      deleteFiber.node = childNode;
      deleteFiber.effectTag = 'DELETE';

      const parentFiber = createFiber(createVNode('View', {}));
      parentFiber.node = container;
      parentFiber.child = deleteFiber;

      commitWork(parentFiber);

      expect(container.children.length).toBe(0);
      expect(childNode.parent).toBe(null);
    });

    it('should handle mixed CREATE and DELETE operations', () => {
      const container = createTestContainer();

      registerComponent('Label', (node) => {
        node.addComponent(MockLabel);
      });

      const oldNode = new MockNode('OldLabel');
      oldNode.addComponent(MockLabel);
      container.addChild(oldNode);

      const parentFiber = createFiber(createVNode('View', {}));
      parentFiber.node = container;

      const createVNodeLabel = createVNode('Label', { id: 'newLabel', string: 'New' });
      const createFiberNode = createFiber(createVNodeLabel, parentFiber);
      createFiberNode.effectTag = 'CREATE';

      const deleteVNode = createVNode('Label', { id: 'oldLabel' });
      const deleteFiber = createFiber(deleteVNode);
      deleteFiber.node = oldNode;
      deleteFiber.effectTag = 'DELETE';

      createFiberNode.sibling = deleteFiber;
      parentFiber.child = createFiberNode;

      commitWork(parentFiber);

      expect(container.children.length).toBe(1);
      expect(container.children[0].name).toBe('newLabel');
      expect(oldNode.parent).toBe(null);
    });
  });
});
