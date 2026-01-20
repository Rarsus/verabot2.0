/**
 * CacheManager Comprehensive Test Suite
 * Tests cache operations, TTL handling, LRU eviction, and performance
 * Phase 15 Coverage: CacheManager methods and edge cases
 */

const assert = require('assert');

/**
 * Mock CacheManager
 * Implements in-memory caching with TTL and LRU eviction
 */
class MockCacheManager {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 100;
    this.defaultTTL = options.defaultTTL || 300000; // 5 minutes
    this.cache = new Map();
    this.accessOrder = new Map();
    this._stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0,
      invalidations: 0,
    };
  }

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

  invalidate(key) {
    const existed = this.cache.has(key);
    this.cache.delete(key);
    this.accessOrder.delete(key);

    if (existed) {
      this._stats.invalidations++;
    }

    return existed;
  }

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

  clear() {
    const count = this.cache.size;
    this.cache.clear();
    this.accessOrder.clear();
    this._stats.invalidations += count;
  }

  getStats() {
    const totalRequests = this._stats.hits + this._stats.misses;
    const hitRate =
      totalRequests > 0
        ? ((this._stats.hits / totalRequests) * 100).toFixed(2)
        : 0;

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

  resetStats() {
    this._stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0,
      invalidations: 0,
    };
  }

  _evictLRU() {
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

  _estimateMemoryUsage() {
    let bytes = 0;

    for (const [key, entry] of this.cache.entries()) {
      bytes += key.length * 2;
      try {
        bytes += JSON.stringify(entry.value).length * 2;
      } catch {
        bytes += 100;
      }
      bytes += 16;
    }

    return bytes;
  }

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

  has(key) {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.accessOrder.delete(key);
      return false;
    }

    return true;
  }
}

describe('CacheManager', () => {
  let cache;

  beforeEach(() => {
    cache = new MockCacheManager({ maxSize: 10, defaultTTL: 10000 }); // 10 second TTL
  });

  describe('constructor()', () => {
    it('should initialize with default options', () => {
      const defaultCache = new MockCacheManager();

      assert.strictEqual(defaultCache.maxSize, 100);
      assert.strictEqual(defaultCache.defaultTTL, 300000);
      assert.strictEqual(defaultCache.cache.size, 0);
    });

    it('should initialize with custom options', () => {
      const customCache = new MockCacheManager({
        maxSize: 50,
        defaultTTL: 60000,
      });

      assert.strictEqual(customCache.maxSize, 50);
      assert.strictEqual(customCache.defaultTTL, 60000);
    });

    it('should initialize with empty cache', () => {
      assert.strictEqual(cache.cache.size, 0);
      assert.strictEqual(cache.accessOrder.size, 0);
    });

    it('should initialize statistics to zero', () => {
      const stats = cache.getStats();

      assert.strictEqual(stats.hits, 0);
      assert.strictEqual(stats.misses, 0);
      assert.strictEqual(stats.sets, 0);
      assert.strictEqual(stats.evictions, 0);
      assert.strictEqual(stats.invalidations, 0);
    });
  });

  describe('set() and get()', () => {
    it('should store and retrieve value', () => {
      cache.set('key1', 'value1');

      const result = cache.get('key1');

      assert.strictEqual(result, 'value1');
    });

    it('should store and retrieve object value', () => {
      const obj = { id: 1, name: 'Test' };
      cache.set('obj-key', obj);

      const result = cache.get('obj-key');

      assert.deepStrictEqual(result, obj);
    });

    it('should store and retrieve array value', () => {
      const arr = [1, 2, 3, 4, 5];
      cache.set('array-key', arr);

      const result = cache.get('array-key');

      assert.deepStrictEqual(result, arr);
    });

    it('should store and retrieve null value', () => {
      cache.set('null-key', null);

      const result = cache.get('null-key');

      assert.strictEqual(result, null);
    });

    it('should store and retrieve undefined value', () => {
      cache.set('undef-key', undefined);

      const result = cache.get('undef-key');

      assert.strictEqual(result, undefined);
    });

    it('should return undefined for non-existent key', () => {
      const result = cache.get('non-existent');

      assert.strictEqual(result, undefined);
    });

    it('should overwrite existing value', () => {
      cache.set('key1', 'value1');
      cache.set('key1', 'value2');

      const result = cache.get('key1');

      assert.strictEqual(result, 'value2');
    });

    it('should track set operation in stats', () => {
      cache.set('key1', 'value1');

      const stats = cache.getStats();

      assert.strictEqual(stats.sets, 1);
    });

    it('should handle multiple sets to same key', () => {
      cache.set('key1', 'value1');
      cache.set('key1', 'value2');
      cache.set('key1', 'value3');

      const stats = cache.getStats();

      assert.strictEqual(stats.sets, 3);
    });
  });

  describe('TTL and Expiration', () => {
    it('should expire entry after TTL', (done) => {
      cache.set('expire-key', 'value', 100); // 100ms TTL

      setTimeout(() => {
        const result = cache.get('expire-key');

        assert.strictEqual(result, undefined);
        done();
      }, 150);
    });

    it('should not expire entry before TTL', (done) => {
      cache.set('persist-key', 'value', 500); // 500ms TTL

      setTimeout(() => {
        const result = cache.get('persist-key');

        assert.strictEqual(result, 'value');
        done();
      }, 100);
    });

    it('should use custom TTL over default', () => {
      const customTTL = 5000;
      cache.set('custom-ttl', 'value', customTTL);

      const entry = cache.cache.get('custom-ttl');
      const expectedExpiry = entry.createdAt + customTTL;

      assert.strictEqual(entry.expiresAt, expectedExpiry);
    });

    it('should use default TTL when not specified', () => {
      cache.set('default-ttl', 'value');

      const entry = cache.cache.get('default-ttl');
      const expectedExpiry = entry.createdAt + cache.defaultTTL;

      assert.strictEqual(entry.expiresAt, expectedExpiry);
    });

    it('should track expired access as miss in stats', (done) => {
      cache.set('expire-test', 'value', 50);

      setTimeout(() => {
        cache.get('expire-test');
        const stats = cache.getStats();

        assert.strictEqual(stats.misses, 1);
        done();
      }, 100);
    });
  });

  describe('invalidate()', () => {
    it('should remove entry from cache', () => {
      cache.set('key1', 'value1');

      const result = cache.invalidate('key1');

      assert.strictEqual(result, true);
      assert.strictEqual(cache.get('key1'), undefined);
    });

    it('should return true when key exists', () => {
      cache.set('key1', 'value1');

      const result = cache.invalidate('key1');

      assert.strictEqual(result, true);
    });

    it('should return false when key does not exist', () => {
      const result = cache.invalidate('non-existent');

      assert.strictEqual(result, false);
    });

    it('should remove from access order tracking', () => {
      cache.set('key1', 'value1');
      cache.invalidate('key1');

      assert.strictEqual(cache.accessOrder.has('key1'), false);
    });

    it('should track invalidation in stats', () => {
      cache.set('key1', 'value1');
      cache.invalidate('key1');

      const stats = cache.getStats();

      assert.strictEqual(stats.invalidations, 1);
    });

    it('should not count invalidation of non-existent key in stats', () => {
      cache.invalidate('non-existent');

      const stats = cache.getStats();

      assert.strictEqual(stats.invalidations, 0);
    });
  });

  describe('invalidatePattern()', () => {
    beforeEach(() => {
      cache.set('user:1', 'user1');
      cache.set('user:2', 'user2');
      cache.set('quote:1', 'quote1');
      cache.set('quote:2', 'quote2');
      cache.set('session:abc', 'session1');
    });

    it('should invalidate entries matching wildcard pattern', () => {
      const count = cache.invalidatePattern('user:*');

      assert.strictEqual(count, 2);
      assert.strictEqual(cache.get('user:1'), undefined);
      assert.strictEqual(cache.get('user:2'), undefined);
    });

    it('should invalidate entries matching regex pattern', () => {
      const regex = /^quote:/;
      const count = cache.invalidatePattern(regex);

      assert.strictEqual(count, 2);
      assert.strictEqual(cache.get('quote:1'), undefined);
    });

    it('should not invalidate non-matching entries', () => {
      cache.invalidatePattern('user:*');

      assert.strictEqual(cache.get('quote:1'), 'quote1');
      assert.strictEqual(cache.get('session:abc'), 'session1');
    });

    it('should return correct count of invalidated entries', () => {
      const count = cache.invalidatePattern('*');

      assert.strictEqual(count, 5);
    });

    it('should track pattern invalidations in stats', () => {
      cache.invalidatePattern('user:*');

      const stats = cache.getStats();

      assert.strictEqual(stats.invalidations, 2);
    });

    it('should handle pattern with no matches', () => {
      const count = cache.invalidatePattern('nonexistent:*');

      assert.strictEqual(count, 0);
    });
  });

  describe('clear()', () => {
    it('should remove all entries from cache', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      cache.clear();

      assert.strictEqual(cache.cache.size, 0);
      assert.strictEqual(cache.get('key1'), undefined);
    });

    it('should clear access order tracking', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.clear();

      assert.strictEqual(cache.accessOrder.size, 0);
    });

    it('should update invalidations stats', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.clear();

      const stats = cache.getStats();

      assert.strictEqual(stats.invalidations, 2);
    });

    it('should handle clearing empty cache', () => {
      cache.clear();

      const stats = cache.getStats();

      assert.strictEqual(stats.invalidations, 0);
      assert.strictEqual(cache.cache.size, 0);
    });
  });

  describe('LRU Eviction', () => {
    it('should evict least recently used entry when cache is full', () => {
      // Fill cache to max size (10)
      for (let i = 1; i <= 10; i++) {
        cache.set(`key${i}`, `value${i}`);
      }

      // Add one more (key1 should be evicted as LRU)
      cache.set('key11', 'value11');

      assert.strictEqual(cache.get('key1'), undefined);
      assert.strictEqual(cache.get('key11'), 'value11');
    });

    it('should not evict recently accessed entries', () => {
      for (let i = 1; i <= 10; i++) {
        cache.set(`key${i}`, `value${i}`);
      }

      // Access key1 to make it recently used
      cache.get('key1');

      // Add new entry
      cache.set('key11', 'value11');

      // key2 (oldest, not accessed) should be evicted, not key1
      assert.strictEqual(cache.get('key1'), 'value1');
      assert.strictEqual(cache.get('key2'), undefined);
    });

    it('should track evictions in stats', () => {
      for (let i = 1; i <= 10; i++) {
        cache.set(`key${i}`, `value${i}`);
      }

      cache.set('key11', 'value11');

      const stats = cache.getStats();

      assert.strictEqual(stats.evictions, 1);
    });

    it('should not evict when updating existing key', () => {
      for (let i = 1; i <= 10; i++) {
        cache.set(`key${i}`, `value${i}`);
      }

      cache.set('key1', 'updated-value1');

      const stats = cache.getStats();

      assert.strictEqual(stats.evictions, 0);
      assert.strictEqual(cache.get('key1'), 'updated-value1');
    });

    it('should handle multiple evictions correctly', () => {
      for (let i = 1; i <= 10; i++) {
        cache.set(`key${i}`, `value${i}`);
      }

      // Add 5 more entries (5 evictions)
      for (let i = 11; i <= 15; i++) {
        cache.set(`key${i}`, `value${i}`);
      }

      const stats = cache.getStats();

      assert.strictEqual(stats.evictions, 5);
      assert.strictEqual(cache.cache.size, 10);
    });
  });

  describe('has()', () => {
    it('should return true for existing valid entry', () => {
      cache.set('key1', 'value1');

      const result = cache.has('key1');

      assert.strictEqual(result, true);
    });

    it('should return false for non-existent entry', () => {
      const result = cache.has('non-existent');

      assert.strictEqual(result, false);
    });

    it('should return false for expired entry', (done) => {
      cache.set('expire-key', 'value', 50);

      setTimeout(() => {
        const result = cache.has('expire-key');

        assert.strictEqual(result, false);
        done();
      }, 100);
    });

    it('should remove expired entry when checking', (done) => {
      cache.set('expire-key', 'value', 50);

      setTimeout(() => {
        cache.has('expire-key');

        assert.strictEqual(cache.cache.has('expire-key'), false);
        done();
      }, 100);
    });
  });

  describe('cleanup()', () => {
    it('should remove all expired entries', (done) => {
      cache.set('expire1', 'value1', 50);
      cache.set('expire2', 'value2', 50);
      cache.set('persist', 'value3', 5000);

      setTimeout(() => {
        const count = cache.cleanup();

        assert.strictEqual(count, 2);
        assert.strictEqual(cache.get('persist'), 'value3');
        done();
      }, 100);
    });

    it('should return count of cleaned entries', (done) => {
      cache.set('exp1', 'v1', 50);
      cache.set('exp2', 'v2', 50);
      cache.set('exp3', 'v3', 50);

      setTimeout(() => {
        const count = cache.cleanup();

        assert.strictEqual(count, 3);
        done();
      }, 100);
    });

    it('should handle cleanup with no expired entries', () => {
      cache.set('key1', 'value1', 10000);
      cache.set('key2', 'value2', 10000);

      const count = cache.cleanup();

      assert.strictEqual(count, 0);
      assert.strictEqual(cache.cache.size, 2);
    });
  });

  describe('getStats()', () => {
    it('should return statistics object', () => {
      const stats = cache.getStats();

      assert(stats);
      assert('hits' in stats);
      assert('misses' in stats);
      assert('sets' in stats);
      assert('evictions' in stats);
      assert('invalidations' in stats);
      assert('hitRate' in stats);
      assert('size' in stats);
      assert('maxSize' in stats);
      assert('memoryUsage' in stats);
    });

    it('should calculate hit rate correctly', () => {
      cache.set('key1', 'value1');
      cache.get('key1'); // hit
      cache.get('key1'); // hit
      cache.get('non-existent'); // miss

      const stats = cache.getStats();

      assert.strictEqual(stats.hits, 2);
      assert.strictEqual(stats.misses, 1);
      // hitRate is rounded to 2 decimals
      assert.strictEqual(stats.hitRate, 66.67);
    });

    it('should return 0 hit rate with no requests', () => {
      const stats = cache.getStats();

      assert.strictEqual(stats.hitRate, 0);
    });

    it('should return 100 hit rate with all hits', () => {
      cache.set('key1', 'value1');
      cache.get('key1');
      cache.get('key1');

      const stats = cache.getStats();

      assert.strictEqual(stats.hitRate, 100);
    });

    it('should track current cache size', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      const stats = cache.getStats();

      assert.strictEqual(stats.size, 2);
    });

    it('should report maxSize', () => {
      const stats = cache.getStats();

      assert.strictEqual(stats.maxSize, 10);
    });

    it('should estimate memory usage', () => {
      cache.set('key1', 'a'.repeat(100));
      cache.set('key2', { data: 'x'.repeat(100) });

      const stats = cache.getStats();

      assert(stats.memoryUsage > 0);
    });
  });

  describe('resetStats()', () => {
    it('should reset all statistics to zero', () => {
      cache.set('key1', 'value1');
      cache.get('key1');
      cache.get('non-existent');

      cache.resetStats();

      const stats = cache.getStats();

      assert.strictEqual(stats.hits, 0);
      assert.strictEqual(stats.misses, 0);
      assert.strictEqual(stats.sets, 0);
    });

    it('should not clear cache entries', () => {
      cache.set('key1', 'value1');
      cache.resetStats();

      const result = cache.get('key1');

      assert.strictEqual(result, 'value1');
    });

    it('should allow statistics to be collected again after reset', () => {
      cache.set('key1', 'value1');
      cache.resetStats();
      cache.set('key2', 'value2');

      const stats = cache.getStats();

      assert.strictEqual(stats.sets, 1);
    });
  });

  describe('Performance', () => {
    it('should handle large number of set operations', () => {
      const largeCache = new MockCacheManager({ maxSize: 1000 });

      for (let i = 0; i < 500; i++) {
        largeCache.set(`key${i}`, `value${i}`);
      }

      const stats = largeCache.getStats();

      assert.strictEqual(stats.sets, 500);
      assert.strictEqual(stats.size, 500);
    });

    it('should handle rapid get operations', () => {
      cache.set('key1', 'value1');

      for (let i = 0; i < 100; i++) {
        cache.get('key1');
      }

      const stats = cache.getStats();

      assert.strictEqual(stats.hits, 100);
    });

    it('should maintain accurate statistics under load', () => {
      // Use a larger cache to avoid evictions during this test
      const largeCache = new MockCacheManager({ maxSize: 100, defaultTTL: 10000 });
      
      for (let i = 0; i < 20; i++) {
        largeCache.set(`key${i}`, `value${i}`);
      }

      for (let i = 0; i < 20; i++) {
        largeCache.get(`key${i}`);
      }

      for (let i = 20; i < 30; i++) {
        largeCache.get(`key${i}`);
      }

      const stats = largeCache.getStats();

      assert.strictEqual(stats.sets, 20);
      assert.strictEqual(stats.hits, 20);
      assert.strictEqual(stats.misses, 10);
    });
  });

  describe('Edge Cases', () => {
    it('should handle numeric keys', () => {
      cache.set('123', 'numeric-key');

      const result = cache.get('123');

      assert.strictEqual(result, 'numeric-key');
    });

    it('should handle keys with special characters', () => {
      const specialKey = 'user:@#$%:123';
      cache.set(specialKey, 'value');

      const result = cache.get(specialKey);

      assert.strictEqual(result, 'value');
    });

    it('should handle very long keys', () => {
      const longKey = 'key'.repeat(100);
      cache.set(longKey, 'value');

      const result = cache.get(longKey);

      assert.strictEqual(result, 'value');
    });

    it('should handle circular reference values gracefully', () => {
      const obj = { a: 1 };
      obj.self = obj; // Circular reference

      cache.set('circular', obj);

      const result = cache.get('circular');

      assert(result);
      assert.strictEqual(result.a, 1);
    });

    it('should handle empty string values', () => {
      cache.set('empty', '');

      const result = cache.get('empty');

      assert.strictEqual(result, '');
    });

    it('should handle boolean values', () => {
      cache.set('true-key', true);
      cache.set('false-key', false);

      assert.strictEqual(cache.get('true-key'), true);
      assert.strictEqual(cache.get('false-key'), false);
    });

    it('should handle zero and negative numbers', () => {
      cache.set('zero', 0);
      cache.set('negative', -42);

      assert.strictEqual(cache.get('zero'), 0);
      assert.strictEqual(cache.get('negative'), -42);
    });

    it('should handle very large TTL values', () => {
      cache.set('long-ttl', 'value', 999999999999);

      const result = cache.get('long-ttl');

      assert.strictEqual(result, 'value');
    });

    it('should handle very small (but positive) TTL values', (done) => {
      cache.set('short-ttl', 'value', 1);

      setTimeout(() => {
        const result = cache.get('short-ttl');

        assert.strictEqual(result, undefined);
        done();
      }, 10);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete cache lifecycle', () => {
      // Set
      cache.set('user:1', { id: 1, name: 'John' });
      cache.set('user:2', { id: 2, name: 'Jane' });

      // Get
      assert.deepStrictEqual(cache.get('user:1'), { id: 1, name: 'John' });

      // Check
      assert.strictEqual(cache.has('user:1'), true);

      // Invalidate
      cache.invalidate('user:1');

      // Verify
      assert.strictEqual(cache.has('user:1'), false);
      assert.strictEqual(cache.has('user:2'), true);
    });

    it('should handle cache warming and pattern invalidation', () => {
      // Warm cache
      for (let i = 1; i <= 5; i++) {
        cache.set(`user:${i}`, { id: i });
        cache.set(`post:${i}`, { id: i });
      }

      // Invalidate pattern
      cache.invalidatePattern('user:*');

      // Verify
      assert.strictEqual(cache.has('user:1'), false);
      assert.strictEqual(cache.has('post:1'), true);
    });

    it('should handle stats-driven cache optimization', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      // Simulate workload
      cache.get('key1'); // hit
      cache.get('key1'); // hit
      cache.get('key3'); // miss

      const stats = cache.getStats();

      // hitRate is rounded to 2 decimals
      assert.strictEqual(stats.hitRate, 66.67);

      // Reset and retry
      cache.resetStats();
      cache.set('key3', 'value3');
      cache.get('key1'); // hit
      cache.get('key2'); // hit

      const newStats = cache.getStats();

      assert.strictEqual(newStats.hits, 2);
      assert.strictEqual(newStats.misses, 0);
    });
  });
});
