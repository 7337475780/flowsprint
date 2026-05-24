interface CacheEntry {
  value: any;
  expiresAt: number;
}

class AppCache {
  private cache = new Map<string, CacheEntry>();

  /**
   * Get value from cache if it exists and hasn't expired.
   */
  get(key: string): any {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Set value in cache with a TTL (defaults to 5 minutes).
   */
  set(key: string, value: any, ttlMs: number = 300_000): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Invalidate specific key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all keys starting with a prefix (e.g. user specific keys)
   */
  invalidatePrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Invalidate keys matching a regular expression pattern
   */
  invalidatePattern(pattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
  }
}

export const appCache = new AppCache();
export default appCache;
