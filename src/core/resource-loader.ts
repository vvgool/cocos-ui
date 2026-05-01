/**
 * Resource Loader — automatic resource loading with caching for Cocos4.
 *
 * Wraps Cocos4's `cc.assetManager` callback-based API into ergonomic Promises
 * with deduplication (concurrent requests for the same resource share one
 * network call) and a queryable cache.
 *
 * Cocos4 types are intentionally typed as `any` because `cocos-creator` is a
 * peer dependency and not available at compile time.
 */
/** Cocos4 global — `cc` is provided by the Cocos Creator runtime. */
import type { LoadingState, ResourceState } from '../types/resource';
// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
/** Internal cache entry that tracks both the resolved asset and its state. */
interface CacheEntry {
  state: ResourceState<any>;
  /** In-flight promise — used for deduplication of concurrent requests. */
  promise?: Promise<any>;
}
// ---------------------------------------------------------------------------
// ResourceLoader
// ---------------------------------------------------------------------------
/**
 * Automatic resource loader with caching and deduplication.
 *
 * - Same resource requested twice → only one network request (deduplication).
 * - Failed loads are **not** cached, allowing retry on subsequent requests.
 * - Exposes a public `cache` for inspection.
 */
export class ResourceLoader {
  /** Public cache — maps resource keys to their current state & data. */
  readonly cache: Map<string, CacheEntry> = new Map();
  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------
  /**
   * Load an image resource via Cocos4 assetManager.
   *
   * @param src - Remote URL or local path to the image.
   * @returns Promise that resolves to a `cc.SpriteFrame` (typed as `any`).
   */
  loadImage(src: string): Promise<any> {
    return this.load(src, 'image');
  }
  /**
   * Load a font resource via Cocos4 assetManager.
   *
   * @param src - Remote URL or local path to the font file.
   * @returns Promise that resolves to a `cc.Font` / `cc.TTFFont` (typed as `any`).
   */
  loadFont(src: string): Promise<any> {
    return this.load(src, 'font');
  }
  /**
   * Load a .plist particle asset via Cocos4 assetManager.
   *
   * @param src - Remote URL or local path to the .plist file.
   * @returns Promise that resolves to a `cc.ParticleAsset` (typed as `any`).
   */
  loadPlist(src: string): Promise<any> {
    return this.load(src, 'plist');
  }
  /**
   * Query the current state of a resource synchronously.
   *
   * @param src  - Resource identifier (URL or path).
   * @param type - Resource type: `'image'` or `'font'`.
   * @returns A `ResourceState` object describing the current status.
   */
  useResource(src: string, type: 'image' | 'font' | 'plist'): ResourceState<any> {
    const key = this.cacheKey(src, type);
    const entry = this.cache.get(key);
    if (!entry) {
      return { status: 'idle' as LoadingState };
    }
    return { ...entry.state };
  }
  /**
   * Clear the entire resource cache.
   *
   * After calling this, all resources will need to be re-loaded on demand.
   */
  clearCache(): void {
    this.cache.clear();
  }
  // -----------------------------------------------------------------------
  // Internal
  // -----------------------------------------------------------------------
  /**
   * Core load implementation with deduplication.
   *
   * - If the resource is already loaded, returns it immediately.
   * - If the resource is currently loading, returns the existing in-flight promise.
   * - Otherwise, starts a new load and caches the result on success.
   */
  private load(src: string, type: 'image' | 'font' | 'plist'): Promise<any> {
    const key = this.cacheKey(src, type);
    const existing = this.cache.get(key);
    // Already loaded — return cached data.
    if (existing && existing.state.status === 'loaded') {
      return Promise.resolve(existing.state.data);
    }
    // Currently loading — return in-flight promise (deduplication).
    if (existing && existing.promise) {
      return existing.promise;
    }
    // Start a new load.
    const entry: CacheEntry = {
      state: { status: 'loading' as LoadingState },
    };
    this.cache.set(key, entry);
    const promise =
      type === 'image'
        ? this.loadImageAsset(src)
        : type === 'font'
          ? this.loadFontAsset(src)
          : this.loadPlistAsset(src);
    entry.promise = promise
      .then((data: any) => {
        entry.state = { status: 'loaded' as LoadingState, data };
        entry.promise = undefined;
        return data;
      })
      .catch((error: unknown) => {
        const err = error instanceof Error ? error : new Error(String(error));
        // Remove from cache so a retry is possible.
        this.cache.delete(key);
        throw err;
      });
    return promise;
  }
  /**
   * Load an image via `cc.assetManager.loadRemote`.
   *
   * Cocos4 loads a `cc.ImageAsset` which we convert to a `cc.SpriteFrame`.
   */
  private loadImageAsset(src: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      // @ts-ignore — Cocos4 runtime API
      cc.assetManager.loadRemote(
        src,
        { type: cc.ImageAsset },
        (err: Error | null, asset: any) => {
          if (err) {
            reject(err);
            return;
          }
          try {
            // @ts-ignore — Cocos4 runtime API
            const spriteFrame = new cc.SpriteFrame(asset);
            resolve(spriteFrame);
          } catch (conversionError) {
            reject(conversionError);
          }
        },
      );
    });
  }
  /**
   * Load a font via `cc.assetManager.loadRemote`.
   *
   * Returns a `cc.Font` / `cc.TTFFont` asset directly.
   */
  private loadFontAsset(src: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      // @ts-ignore — Cocos4 runtime API
      cc.assetManager.loadRemote(
        src,
        { type: cc.TTFFont },
        (err: Error | null, asset: any) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(asset);
        },
      );
    });
  }
  private loadPlistAsset(src: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      // @ts-ignore — Cocos4 runtime API
      cc.assetManager.loadRemote(
        src,
        { type: cc.ParticleAsset },
        (err: Error | null, asset: any) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(asset);
        },
      );
    });
  }
  /** Build a unique cache key from source path and resource type. */
  private cacheKey(src: string, type: 'image' | 'font' | 'plist'): string {
    return `${type}::${src}`;
  }
}
// ---------------------------------------------------------------------------
// Singleton convenience
// ---------------------------------------------------------------------------
/** Default singleton instance for app-wide use. */
export const resourceLoader = new ResourceLoader();
/** Convenience: load an image using the default resource loader. */
export const loadImage = resourceLoader.loadImage.bind(resourceLoader);
/** Convenience: load a font using the default resource loader. */
export const loadFont = resourceLoader.loadFont.bind(resourceLoader);
/** Convenience: load a .plist particle asset using the default resource loader. */
export const loadPlist = resourceLoader.loadPlist.bind(resourceLoader);
/** Convenience: query resource state using the default resource loader. */
export const useResource = resourceLoader.useResource.bind(resourceLoader);
/** Convenience: clear the default resource loader cache. */
export const clearCache = resourceLoader.clearCache.bind(resourceLoader);