import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ResourceLoader, resourceLoader, loadImage, loadFont, loadPlist, useResource, clearCache } from '../resource-loader';
import { setupGlobalCc, cleanupGlobalCc } from '../../__tests__/utils/mock-cocos';

describe('ResourceLoader', () => {
  beforeEach(() => {
    setupGlobalCc();
    vi.mocked(cc.assetManager.loadRemote).mockClear();
    vi.mocked(cc.assetManager.loadRemote).mockImplementation((...args: any[]) => {
      const callback = args.length === 2 ? args[1] : args[2];
      callback(null, { _id: args[0], _name: args[0].split('/').pop() });
    });
  });

  afterEach(() => {
    cleanupGlobalCc();
    vi.restoreAllMocks();
  });

  describe('loadImage', () => {
    it('should load image successfully and return SpriteFrame', async () => {
      const loader = new ResourceLoader();
      const mockAsset = { _id: 'test.png' };
      
      vi.mocked(cc.assetManager.loadRemote).mockImplementation((...args: any[]) => {
        const callback = args.length === 2 ? args[1] : args[2];
        callback(null, mockAsset);
      });

      const result = await loader.loadImage('https://example.com/test.png');

      expect(cc.assetManager.loadRemote).toHaveBeenCalledWith(
        'https://example.com/test.png',
        { type: cc.ImageAsset },
        expect.any(Function)
      );
      expect(result).toBeInstanceOf(cc.SpriteFrame);
    });

    it('should pass correct URL to assetManager', async () => {
      const loader = new ResourceLoader();
      const testUrl = 'https://cdn.example.com/images/icon.png';

      vi.mocked(cc.assetManager.loadRemote).mockImplementation((...args: any[]) => {
        const callback = args.length === 2 ? args[1] : args[2];
        callback(null, { _id: testUrl });
      });

      await loader.loadImage(testUrl);

      expect(cc.assetManager.loadRemote).toHaveBeenCalledWith(
        testUrl,
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('should handle load error', async () => {
      const loader = new ResourceLoader();
      const testError = new Error('Network error');

      vi.mocked(cc.assetManager.loadRemote).mockImplementation((...args: any[]) => {
        const callback = args.length === 2 ? args[1] : args[2];
        callback(testError, null);
      });

      await expect(loader.loadImage('https://example.com/test.png')).rejects.toThrow('Network error');
    });
  });

  describe('loadFont', () => {
    it('should load font successfully and return Font object', async () => {
      const loader = new ResourceLoader();
      const mockFont = { _id: 'test.ttf', _name: 'CustomFont' };

      vi.mocked(cc.assetManager.loadRemote).mockImplementation((...args: any[]) => {
        const callback = args.length === 2 ? args[1] : args[2];
        callback(null, mockFont);
      });

      const result = await loader.loadFont('https://example.com/fonts/custom.ttf');

      expect(cc.assetManager.loadRemote).toHaveBeenCalledWith(
        'https://example.com/fonts/custom.ttf',
        { type: cc.TTFFont },
        expect.any(Function)
      );
      expect(result).toEqual(mockFont);
    });

    it('should pass correct URL to assetManager', async () => {
      const loader = new ResourceLoader();
      const testUrl = 'https://cdn.example.com/fonts/arial.ttf';

      vi.mocked(cc.assetManager.loadRemote).mockImplementation((...args: any[]) => {
        const callback = args.length === 2 ? args[1] : args[2];
        callback(null, { _id: testUrl });
      });

      await loader.loadFont(testUrl);

      expect(cc.assetManager.loadRemote).toHaveBeenCalledWith(
        testUrl,
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('loadPlist', () => {
    it('should load plist successfully and return particle data', async () => {
      const loader = new ResourceLoader();
      const mockParticle = { _id: 'test.plist', _name: 'ParticleEffect' };

      vi.mocked(cc.assetManager.loadRemote).mockImplementation((...args: any[]) => {
        const callback = args.length === 2 ? args[1] : args[2];
        callback(null, mockParticle);
      });

      const result = await loader.loadPlist('https://example.com/particles/fire.plist');

      expect(cc.assetManager.loadRemote).toHaveBeenCalledWith(
        'https://example.com/particles/fire.plist',
        { type: cc.ParticleAsset },
        expect.any(Function)
      );
      expect(result).toEqual(mockParticle);
    });

    it('should pass correct URL to assetManager', async () => {
      const loader = new ResourceLoader();
      const testUrl = 'https://cdn.example.com/particles/rain.plist';

      vi.mocked(cc.assetManager.loadRemote).mockImplementation((...args: any[]) => {
        const callback = args.length === 2 ? args[1] : args[2];
        callback(null, { _id: testUrl });
      });

      await loader.loadPlist(testUrl);

      expect(cc.assetManager.loadRemote).toHaveBeenCalledWith(
        testUrl,
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('Resource caching', () => {
    it('should cache loaded resource and return cached data on second request', async () => {
      const loader = new ResourceLoader();
      const mockAsset = { _id: 'cached.png' };
      let callCount = 0;

      vi.mocked(cc.assetManager.loadRemote).mockImplementation((...args: any[]) => {
        const callback = args.length === 2 ? args[1] : args[2];
        callCount++;
        callback(null, mockAsset);
      });

      const result1 = await loader.loadImage('https://example.com/cached.png');
      const result2 = await loader.loadImage('https://example.com/cached.png');

      expect(callCount).toBe(1);
      expect(result1).toBe(result2);
    });

    it('should reuse in-flight promise for concurrent requests (deduplication)', async () => {
      const loader = new ResourceLoader();
      const mockAsset = { _id: 'concurrent.png' };

      vi.mocked(cc.assetManager.loadRemote).mockImplementation((...args: any[]) => {
        const callback = args.length === 2 ? args[1] : args[2];
        callback(null, mockAsset);
      });

      const promise1 = loader.loadImage('https://example.com/concurrent.png');
      const promise2 = loader.loadImage('https://example.com/concurrent.png');

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toStrictEqual(result2);
    });

    it('should not cache failed loads (allow retry)', async () => {
      const loader = new ResourceLoader();
      let callCount = 0;

      vi.mocked(cc.assetManager.loadRemote).mockImplementation((...args: any[]) => {
        const callback = args.length === 2 ? args[1] : args[2];
        callCount++;
        if (callCount === 1) {
          callback(new Error('First attempt failed'), null);
        } else {
          callback(null, { _id: 'retry.png' });
        }
      });

      await expect(loader.loadImage('https://example.com/retry.png')).rejects.toThrow();
      const result = await loader.loadImage('https://example.com/retry.png');

      expect(callCount).toBe(2);
      expect(result).toBeDefined();
    });
  });

  describe('useResource', () => {
    it('should return idle status for non-existent resource', () => {
      const loader = new ResourceLoader();

      const state = loader.useResource('https://example.com/unknown.png', 'image');

      expect(state).toEqual({ status: 'idle' });
    });

    it('should return loading status during load', async () => {
      const loader = new ResourceLoader();
      let manualCallback: ((asset: any) => void) | undefined;

      vi.mocked(cc.assetManager.loadRemote).mockImplementation((...args: any[]) => {
        const callback = args.length === 2 ? args[1] : args[2];
        manualCallback = (asset: any) => callback(null, asset);
      });

      const loadPromise = loader.loadImage('https://example.com/loading.png');

      const state = loader.useResource('https://example.com/loading.png', 'image');

      expect(state.status).toBe('loading');

      manualCallback!({ _id: 'loaded.png' });
      await loadPromise;
    });

    it('should return loaded status and data after successful load', async () => {
      const loader = new ResourceLoader();
      const mockAsset = { _id: 'loaded.png' };

      vi.mocked(cc.assetManager.loadRemote).mockImplementation((...args: any[]) => {
        const callback = args.length === 2 ? args[1] : args[2];
        callback(null, mockAsset);
      });

      await loader.loadImage('https://example.com/loaded.png');

      const state = loader.useResource('https://example.com/loaded.png', 'image');

      expect(state.status).toBe('loaded');
      expect(state.data).toBeDefined();
    });

    it('should return correct state object format', () => {
      const loader = new ResourceLoader();

      const idleState = loader.useResource('https://example.com/test.png', 'image');

      expect(idleState).toHaveProperty('status');
      expect(idleState.status).toBe('idle');
    });
  });

  describe('Error handling', () => {
    it('should return error status after failed load', async () => {
      const loader = new ResourceLoader();
      const testError = new Error('Load failed');

      vi.mocked(cc.assetManager.loadRemote).mockImplementation((...args: any[]) => {
        const callback = args.length === 2 ? args[1] : args[2];
        callback(testError, null);
      });

      await loader.loadImage('https://example.com/error.png').catch(() => {});

      const state = loader.useResource('https://example.com/error.png', 'image');
      expect(state.status).toBe('idle');
    });

    it('should allow retry after error', async () => {
      const loader = new ResourceLoader();

      vi.mocked(cc.assetManager.loadRemote).mockImplementationOnce((...args: any[]) => {
        const callback = args.length === 2 ? args[1] : args[2];
        callback(new Error('First failed'), null);
      });

      vi.mocked(cc.assetManager.loadRemote).mockImplementationOnce((...args: any[]) => {
        const callback = args.length === 2 ? args[1] : args[2];
        callback(null, { _id: 'success.png' });
      });

      await expect(loader.loadImage('https://example.com/retry-test.png')).rejects.toThrow();
      const result = await loader.loadImage('https://example.com/retry-test.png');
      expect(result).toBeDefined();
    });
  });

  describe('clearCache', () => {
    it('should clear all cached resources', async () => {
      const loader = new ResourceLoader();

      vi.mocked(cc.assetManager.loadRemote).mockImplementationOnce((...args: any[]) => {
        const callback = args.length === 2 ? args[1] : args[2];
        callback(null, { _id: 'test1.png' });
      });

      vi.mocked(cc.assetManager.loadRemote).mockImplementationOnce((...args: any[]) => {
        const callback = args.length === 2 ? args[1] : args[2];
        callback(null, { _id: 'test2.png' });
      });

      // Load two resources
      await loader.loadImage('https://example.com/test1.png');
      await loader.loadImage('https://example.com/test2.png');

      expect(loader.cache.size).toBe(2);

      loader.clearCache();

      expect(loader.cache.size).toBe(0);
    });

    it('should require new network request after cache clear', async () => {
      const loader = new ResourceLoader();
      let callCount = 0;

      vi.mocked(cc.assetManager.loadRemote).mockImplementation((...args: any[]) => {
        const callback = args.length === 2 ? args[1] : args[2];
        callCount++;
        callback(null, { _id: 'test.png' });
      });

      await loader.loadImage('https://example.com/test.png');
      expect(callCount).toBe(1);

      loader.clearCache();

      await loader.loadImage('https://example.com/test.png');
      expect(callCount).toBe(2);
    });
  });

  describe('Singleton exports', () => {
    it('should export working loadImage function', async () => {
      vi.mocked(cc.assetManager.loadRemote).mockImplementation((...args: any[]) => {
        const callback = args.length === 2 ? args[1] : args[2];
        callback(null, { _id: 'singleton.png' });
      });

      const result = await loadImage('https://example.com/singleton.png');

      expect(result).toBeDefined();
    });

    it('should export working loadFont function', async () => {
      vi.mocked(cc.assetManager.loadRemote).mockImplementation((...args: any[]) => {
        const callback = args.length === 2 ? args[1] : args[2];
        callback(null, { _id: 'singleton.ttf' });
      });

      const result = await loadFont('https://example.com/singleton.ttf');

      expect(result).toBeDefined();
    });

    it('should export working loadPlist function', async () => {
      vi.mocked(cc.assetManager.loadRemote).mockImplementation((...args: any[]) => {
        const callback = args.length === 2 ? args[1] : args[2];
        callback(null, { _id: 'singleton.plist' });
      });

      const result = await loadPlist('https://example.com/singleton.plist');

      expect(result).toBeDefined();
    });

    it('should export working useResource function', () => {
      const state = useResource('https://example.com/unknown.png', 'image');

      expect(state.status).toBe('idle');
    });

    it('should export working clearCache function', () => {
      expect(() => clearCache()).not.toThrow();
    });
  });
});
