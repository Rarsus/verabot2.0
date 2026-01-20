/**
 * Cache Manager Service
 * Implements in-memory caching with TTL and LRU eviction
 */

class CacheManager {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 100;
    this.defaultTTL = options.defaultTTL || 300000; // 5 minutes in ms
    this.cache = new Map();
    this.accessOrder = new Map(); // Track access order for LRU
    this._stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0,
      invalidations: 0,
    };
  }

  /**
   * Get cached value
   * @param {string} key - Cache key
   * @returns {*} Cached value or undefined
   */
  get(key) {
    const entry = this.cache.get(key);

    if (!entry) {
      this._stats.misses++;
      return undefined;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.accessOrder.delete(key);
      this._stats.misses++;
      return undefined;
    }

    // Update access time for LRU
    this.accessOrder.delete(key);
    this.accessOrder.set(key, Date.now());

    this._stats.hits++;
    return entry.value;
  }

  /**
   * Store value in cache with TTL
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds (optional)
   */
  set(key, value, ttl = null) {
    const timeToLive = ttl !== null ? ttl : this.defaultTTL;

    // Evict if at max size and key is new
    if (!this.cache.has(key) && this.cache.size >= this.maxSize) {
      this._evictLRU();
    }

    const entry = {
      value,
      expiresAt: Date.now() + timeToLive,
      createdAt: Date.now(),
    };

    this.cache.set(key, entry);
    this.accessOrder.set(key, Date.now());
    this._stats.sets++;
  }

  /**
   * Invalidate specific cache entry
   * @param {string} key - Cache key to invalidate
   * @returns {boolean} True if key was found and deleted
   */
  invalidate(key) {
    const existed = this.cache.has(key);
    this.cache.delete(key);
    this.accessOrder.delete(key);

    if (existed) {
      this._stats.invalidations++;
    }

    return existed;
  }

  /**
   * Invalidate cache entries matching pattern
   * @param {string|RegExp} pattern - Pattern to match keys
   * @returns {number} Number of entries invalidated
   */
  invalidatePattern(pattern) {
    let regex;
    if (typeof pattern === 'string') {
      // eslint-disable-next-line security/detect-non-literal-regexp
      regex = new RegExp(pattern.replace(/\*/g, '.*'));
    } else {
      regex = pattern;
    }

    let count = 0;
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        this.accessOrder.delete(key);
        count++;
      }
    }

    this._stats.invalidations += count;
    return count;
  }

  /**
   * Clear all cache entries
   */
  clear() {
    const count = this.cache.size;
    this.cache.clear();
    this.accessOrder.clear();
    this._stats.invalidations += count;
  }

  /**
   * Get cache statistics
   * @returns {object} Cache statistics
   */
  getStats() {
    const totalRequests = this._stats.hits + this._stats.misses;
    const hitRate = totalRequests > 0 ? ((this._stats.hits / totalRequests) * 100).toFixed(2) : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this._stats.hits,
      misses: this._stats.misses,
      sets: this._stats.sets,
      evictions: this._stats.evictions,
      invalidations: this._stats.invalidations,
      hitRate: parseFloat(hitRate),
      memoryUsage: this._estimateMemoryUsage(),
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this._stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0,
      invalidations: 0,
    };
  }

  /**
   * Evict least recently used entry (LRU)
   * @private
   */
  _evictLRU() {
    // Get oldest access time
    let oldestKey = null;
    let oldestTime = Infinity;

    for (const [key, accessTime] of this.accessOrder.entries()) {
      if (accessTime < oldestTime) {
        oldestTime = accessTime;
        oldestKey = key;
      }
    }

    if (oldestKey !== null) {
      this.cache.delete(oldestKey);
      this.accessOrder.delete(oldestKey);
      this._stats.evictions++;
    }
  }

  /**
   * Estimate memory usage of cache
   * @private
   * @returns {number} Estimated bytes
   */
  _estimateMemoryUsage() {
    let bytes = 0;

    for (const [key, entry] of this.cache.entries()) {
      // Rough estimate: key length + JSON stringified value length
      bytes += key.length * 2; // UTF-16 chars
      try {
        bytes += JSON.stringify(entry.value).length * 2;
      } catch {
        bytes += 100; // Fallback estimate for unstringifiable values
      }
      bytes += 16; // Overhead for timestamps
    }

    return bytes;
  }

  /**
   * Clean up expired entries
   * @returns {number} Number of entries cleaned
   */
  cleanup() {
    const now = Date.now();
    let count = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        this.accessOrder.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Check if key exists and is not expired
   * @param {string} key - Cache key
   * @returns {boolean} True if key exists and is valid
   */
  has(key) {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.accessOrder.delete(key);
      return false;
    }

    return true;
  }
}

module.exports = CacheManager;
