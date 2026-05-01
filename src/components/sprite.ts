import { registerComponent } from '../core/create-element';
import { registerPropMapping } from '../core/apply-props';
import { loadImage } from '../core/resource-loader';
const SpriteType = { SIMPLE: 0, SLICED: 1, TILED: 2, FILLED: 3 } as const;
const SpriteSizeMode = { NONE: 0, RAW_SIZE: 1, TRIMMED: 2 } as const;
function createSprite(node: any, props: Record<string, any>): void {
  const sprite = node.addComponent(cc.Sprite);
  sprite.type = SpriteType.SIMPLE;
  sprite.sizeMode = SpriteSizeMode.NONE;
  if (props.src) {
    loadSpriteImage(sprite, props.src);
  }
}
function parseSpriteType(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const upper = value.toUpperCase();
    if (upper in SpriteType) return SpriteType[upper as keyof typeof SpriteType];
  }
  return SpriteType.SIMPLE;
}
function parseSpriteSizeMode(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const upper = value.toUpperCase();
    if (upper in SpriteSizeMode) return SpriteSizeMode[upper as keyof typeof SpriteSizeMode];
  }
  return SpriteSizeMode.NONE;
}
function loadSpriteImage(sprite: any, src: string): void {
  showPlaceholder(sprite);
  loadImage(src)
    .then((spriteFrame: any) => { sprite.spriteFrame = spriteFrame; })
    .catch((err: Error) => {
      console.warn(`[Sprite] Failed to load image: ${src}`, err);
      showErrorIndicator(sprite);
    });
}
function showPlaceholder(sprite: any): void {
  const size = 100;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#888888';
    ctx.fillRect(0, 0, size, size);
  }
  const dataURL = canvas.toDataURL();
  const img = new Image();
  img.onload = () => {
    try {
      const imageAsset = new cc.ImageAsset(img);
      const placeholderFrame = new cc.SpriteFrame(imageAsset);
      sprite.spriteFrame = placeholderFrame;
      if (sprite.sizeMode === SpriteSizeMode.NONE) {
        sprite.sizeMode = SpriteSizeMode.RAW_SIZE;
      }
    } catch { }
  };
  img.src = dataURL;
}
function showErrorIndicator(sprite: any): void {
  const size = 100;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(20, 20);
    ctx.lineTo(80, 80);
    ctx.moveTo(80, 20);
    ctx.lineTo(20, 80);
    ctx.stroke();
  }
  const dataURL = canvas.toDataURL();
  const img = new Image();
  img.onload = () => {
    try {
      const imageAsset = new cc.ImageAsset(img);
      const errorFrame = new cc.SpriteFrame(imageAsset);
      sprite.spriteFrame = errorFrame;
      sprite.sizeMode = SpriteSizeMode.RAW_SIZE;
    } catch { }
  };
  img.src = dataURL;
}
const spritePropMapping: Record<string, string | ((node: any, value: any) => void)> = {
  type: (node, value) => {
    const sprite = node.getComponent(cc.Sprite);
    if (sprite) sprite.type = parseSpriteType(value);
  },
  sizeMode: (node, value) => {
    const sprite = node.getComponent(cc.Sprite);
    if (sprite) sprite.sizeMode = parseSpriteSizeMode(value);
  },
  grayscale: (node, value) => {
    const sprite = node.getComponent(cc.Sprite);
    if (sprite) sprite.grayscale = Boolean(value);
  },
  opacity: (node, value) => {
    const sprite = node.getComponent(cc.Sprite);
    if (sprite) sprite.opacity = Number(value);
  },
  src: (node, value) => {
    if (value) {
      const sprite = node.getComponent(cc.Sprite);
      if (sprite) loadSpriteImage(sprite, value);
    }
  },
};
registerComponent('Sprite', createSprite);
registerPropMapping('Sprite', spritePropMapping);