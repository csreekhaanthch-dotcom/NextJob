import { LRUCache } from 'lru-cache';

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items in cache
}

class CacheService {
  private caches: Map<string, LRUCache<string, any>> = new Map();

  /**
   * Create a new cache with given options
   */
  createCache(name: string, options: CacheOptions = {}): LRUCache<string, any> {
    const cache = new LRUCache<string, any>({
      max: options.maxSize || 1000,
      ttl: options.ttl || 1000 * 60 * 5 // 5 minutes default
    });
    
    this.caches.set(name, cache);
    return cache;
  }

  /**
   * Get existing cache by name
   */
  getCache(name: string): LRUCache<string, any> | undefined {
    return this.caches.get(name);
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    this.caches.forEach(cache => cache.clear());
  }

  /**
   * Clear specific cache
   */
  clearCache(name: string): void {
    const cache = this.caches.get(name);
    if (cache) {
      cache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): Record<string, { size: number }> {
    const stats: Record<string, { size: number }> = {};
    this.caches.forEach((cache, name) => {
      stats[name] = { size: cache.size };
    });
    return stats;
  }
}

export const cacheService = new CacheService();