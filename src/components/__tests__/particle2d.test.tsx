import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MockNode, MockComponent } from '../../__tests__/utils/mock-cocos';
import { setupTest, cleanupTest, createTestContainer } from '../../__tests__/utils/test-utils';
import { createHostNode, ComponentRegistry } from '../../core/create-element';
import { applyCreateProps } from '../../core/apply-props';
import '../../components/particle2d';

class MockParticleSystem2D extends MockComponent {
  file: any = null;
  autoRemoveOnFinish: boolean = false;
  playOnLoad: boolean = true;
  loop: boolean = true;
  life: number = 1;
  speed: number = 1;
  emissionRate: number = 10;
  duration: number = -1;
  totalParticles: number = 0;
  active: boolean = false;

  constructor(node?: MockNode) {
    super(node);
    this.name = 'ParticleSystem2D';
  }

  resetSystem(): void {
    // Mock implementation
  }

  stopSystem(): void {
    // Mock implementation
  }
}

function setupParticle2DMocks(): void {
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).cc.ParticleSystem2D = MockParticleSystem2D;
  }
}

describe('Particle2D', () => {
  let container: MockNode;

  beforeEach(() => {
    setupTest();
    setupParticle2DMocks();
    container = createTestContainer('Particle2DTestContainer');
  });

  afterEach(() => {
    cleanupTest();
  });

  describe('component registration', () => {
    it('should register Particle2D component with ComponentRegistry', () => {
      const factory = ComponentRegistry.get('Particle2D');
      expect(factory).toBeDefined();
      expect(typeof factory).toBe('function');
    });

    it('should create Particle2D node via createHostNode', () => {
      const node = createHostNode({ type: 'Particle2D', props: {} } as any);
      expect(node).toBeDefined();
      expect(node).toBeInstanceOf(MockNode);
    });

    it('should have ParticleSystem2D component attached after creation', () => {
      const node = createHostNode({ type: 'Particle2D', props: {} } as any);
      const particle = node.getComponent(MockParticleSystem2D);
      expect(particle).toBeDefined();
      expect(particle?.name).toBe('ParticleSystem2D');
    });
  });

  describe('props mapping - file (plist loading)', () => {
    it('should load plist file via file prop', async () => {
      const node = createHostNode({ type: 'Particle2D', props: { file: 'particles.plist' } } as any);
      const particle = node.getComponent(MockParticleSystem2D);
      expect(particle).toBeDefined();
      
      // Advance timers to allow async plist loading
      await vi.advanceTimersByTimeAsync(100);
    });

    it('should handle missing file prop gracefully', () => {
      const node = createHostNode({ type: 'Particle2D', props: {} } as any);
      const particle = node.getComponent(MockParticleSystem2D);
      expect(particle).toBeDefined();
      expect(particle?.file).toBe(null);
    });
  });

  describe('props mapping - playOnLoad', () => {
    it('should set playOnLoad to true', () => {
      const node = createHostNode({ type: 'Particle2D', props: {} } as any);
      applyCreateProps(node, { playOnLoad: true });
      const particle = node.getComponent(MockParticleSystem2D);
      expect(particle?.playOnLoad).toBe(true);
    });

    it('should set playOnLoad to false', () => {
      const node = createHostNode({ type: 'Particle2D', props: {} } as any);
      applyCreateProps(node, { playOnLoad: false });
      const particle = node.getComponent(MockParticleSystem2D);
      expect(particle?.playOnLoad).toBe(false);
    });

    it('should default playOnLoad to true', () => {
      const node = createHostNode({ type: 'Particle2D', props: {} } as any);
      applyCreateProps(node, {});
      const particle = node.getComponent(MockParticleSystem2D);
      expect(particle?.playOnLoad).toBe(true);
    });
  });

  describe('props mapping - loop', () => {
    it('should set loop to true', () => {
      const node = createHostNode({ type: 'Particle2D', props: {} } as any);
      applyCreateProps(node, { loop: true });
      const particle = node.getComponent(MockParticleSystem2D);
      expect(particle?.loop).toBe(true);
    });

    it('should set loop to false', () => {
      const node = createHostNode({ type: 'Particle2D', props: {} } as any);
      applyCreateProps(node, { loop: false });
      const particle = node.getComponent(MockParticleSystem2D);
      expect(particle?.loop).toBe(false);
    });

    it('should default loop to true', () => {
      const node = createHostNode({ type: 'Particle2D', props: {} } as any);
      applyCreateProps(node, {});
      const particle = node.getComponent(MockParticleSystem2D);
      expect(particle?.loop).toBe(true);
    });
  });

  describe('props mapping - autoRemoveOnFinish', () => {
    it('should set autoRemoveOnFinish to true', () => {
      const node = createHostNode({ type: 'Particle2D', props: {} } as any);
      applyCreateProps(node, { autoRemoveOnFinish: true });
      const particle = node.getComponent(MockParticleSystem2D);
      expect(particle?.autoRemoveOnFinish).toBe(true);
    });

    it('should set autoRemoveOnFinish to false', () => {
      const node = createHostNode({ type: 'Particle2D', props: {} } as any);
      applyCreateProps(node, { autoRemoveOnFinish: false });
      const particle = node.getComponent(MockParticleSystem2D);
      expect(particle?.autoRemoveOnFinish).toBe(false);
    });
  });

  describe('props mapping - life', () => {
    it('should set life duration', () => {
      const node = createHostNode({ type: 'Particle2D', props: {} } as any);
      applyCreateProps(node, { life: 5 });
      const particle = node.getComponent(MockParticleSystem2D);
      expect(particle?.life).toBe(5);
    });

    it('should set life from string', () => {
      const node = createHostNode({ type: 'Particle2D', props: {} } as any);
      applyCreateProps(node, { life: '3.5' });
      const particle = node.getComponent(MockParticleSystem2D);
      expect(particle?.life).toBe(3.5);
    });
  });

  describe('props mapping - speed', () => {
    it('should set speed', () => {
      const node = createHostNode({ type: 'Particle2D', props: {} } as any);
      applyCreateProps(node, { speed: 2 });
      const particle = node.getComponent(MockParticleSystem2D);
      expect(particle?.speed).toBe(2);
    });

    it('should set speed from string', () => {
      const node = createHostNode({ type: 'Particle2D', props: {} } as any);
      applyCreateProps(node, { speed: '1.5' });
      const particle = node.getComponent(MockParticleSystem2D);
      expect(particle?.speed).toBe(1.5);
    });
  });

  describe('props mapping - emissionRate', () => {
    it('should set emissionRate', () => {
      const node = createHostNode({ type: 'Particle2D', props: {} } as any);
      applyCreateProps(node, { emissionRate: 50 });
      const particle = node.getComponent(MockParticleSystem2D);
      expect(particle?.emissionRate).toBe(50);
    });
  });

  describe('props mapping - duration', () => {
    it('should set duration', () => {
      const node = createHostNode({ type: 'Particle2D', props: {} } as any);
      applyCreateProps(node, { duration: 10 });
      const particle = node.getComponent(MockParticleSystem2D);
      expect(particle?.duration).toBe(10);
    });

    it('should set duration to -1 for infinite', () => {
      const node = createHostNode({ type: 'Particle2D', props: {} } as any);
      applyCreateProps(node, { duration: -1 });
      const particle = node.getComponent(MockParticleSystem2D);
      expect(particle?.duration).toBe(-1);
    });
  });

  describe('default values', () => {
    it('should have default playOnLoad true', () => {
      const node = createHostNode({ type: 'Particle2D', props: {} } as any);
      applyCreateProps(node, {});
      const particle = node.getComponent(MockParticleSystem2D);
      expect(particle?.playOnLoad).toBe(true);
    });

    it('should have default loop true', () => {
      const node = createHostNode({ type: 'Particle2D', props: {} } as any);
      applyCreateProps(node, {});
      const particle = node.getComponent(MockParticleSystem2D);
      expect(particle?.loop).toBe(true);
    });

    it('should have default autoRemoveOnFinish false', () => {
      const node = createHostNode({ type: 'Particle2D', props: {} } as any);
      applyCreateProps(node, {});
      const particle = node.getComponent(MockParticleSystem2D);
      expect(particle?.autoRemoveOnFinish).toBe(false);
    });

    it('should have default life 1', () => {
      const node = createHostNode({ type: 'Particle2D', props: {} } as any);
      applyCreateProps(node, {});
      const particle = node.getComponent(MockParticleSystem2D);
      expect(particle?.life).toBe(1);
    });

    it('should have default speed 1', () => {
      const node = createHostNode({ type: 'Particle2D', props: {} } as any);
      applyCreateProps(node, {});
      const particle = node.getComponent(MockParticleSystem2D);
      expect(particle?.speed).toBe(1);
    });

    it('should have default emissionRate 10', () => {
      const node = createHostNode({ type: 'Particle2D', props: {} } as any);
      applyCreateProps(node, {});
      const particle = node.getComponent(MockParticleSystem2D);
      expect(particle?.emissionRate).toBe(10);
    });
  });
});
