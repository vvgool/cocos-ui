import { registerComponent } from '../core/create-element';
import { registerPropMapping } from '../core/apply-props';
import { loadPlist } from '../core/resource-loader';
function createParticle2D(node: any, props: Record<string, any>): void {
  const particle = node.addComponent(cc.ParticleSystem2D);
  if (props.file) {
    loadPlistFile(particle, props.file);
  }
}
function loadPlistFile(particle: any, src: string): void {
  loadPlist(src)
    .then((asset: any) => {
      particle.file = asset;
    })
    .catch((err: Error) => {
      console.warn(`[Particle2D] Failed to load plist: ${src}`, err);
    });
}
const particle2DPropMapping: Record<string, string | ((node: any, value: any) => void)> = {
  file: (node, value) => {
    if (value) {
      const particle = node.getComponent(cc.ParticleSystem2D);
      if (particle) loadPlistFile(particle, value);
    }
  },
  autoRemoveOnFinish: (node, value) => {
    const particle = node.getComponent(cc.ParticleSystem2D);
    if (particle) particle.autoRemoveOnFinish = Boolean(value);
  },
  playOnLoad: (node, value) => {
    const particle = node.getComponent(cc.ParticleSystem2D);
    if (particle) particle.playOnLoad = Boolean(value);
  },
  loop: (node, value) => {
    const particle = node.getComponent(cc.ParticleSystem2D);
    if (particle) particle.loop = Boolean(value);
  },
  life: (node, value) => {
    const particle = node.getComponent(cc.ParticleSystem2D);
    if (particle) particle.life = Number(value);
  },
  speed: (node, value) => {
    const particle = node.getComponent(cc.ParticleSystem2D);
    if (particle) particle.speed = Number(value);
  },
  emissionRate: (node, value) => {
    const particle = node.getComponent(cc.ParticleSystem2D);
    if (particle) particle.emissionRate = Number(value);
  },
  duration: (node, value) => {
    const particle = node.getComponent(cc.ParticleSystem2D);
    if (particle) particle.duration = Number(value);
  },
};
registerComponent('Particle2D', createParticle2D);
registerPropMapping('Particle2D', particle2DPropMapping);