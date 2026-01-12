/**
 * Phase 19a: CacheManager Comprehensive Coverage
 * Full test coverage for CacheManager.js
 * Tests caching with TTL, LRU eviction, and invalidation
 */

const assert = require('assert');
const CacheManager = require('../../src/services/CacheManager');

describe('CacheManager', () => {
  let cache;

  beforeEach(() => {
    cache = new CacheManager({
      maxSize: 5,
      defaultTTL: 5000,
    });
  });

  describe('Initialization', () => {
    it('should initialize with default options', () => {
      const newCache = new CacheManager();
      assert.strictEqual(newCache.maxSize, 100);
      assert.strictEqual(newCache.defaultTTL, 300000);
    });

    it('should initialize with custom options', () => {
      assert.strictEqual(cache.maxSize, 5);
      assert.strictEqual(cache.defaultTTL, 5000);
    });

    it('should start with empty cache', () => {
      assert.strictEqual(cache.cache.size, 0);
      assert.strictEqual(cache.accessOrder.size, 0);
    });

    it('should initialize stats to zero', () => {
      const stats = cache.getStats();
      assert.strictEqual(stats.hits, 0);
      assert.strictEqual(stats.misses, 0);
      assert.strictEqual(stats.sets, 0);
      assert.strictEqual(stats.evictions, 0);
      assert.strictEqual(stats.invalidations, 0);
    });
  });

  describe('set() and get()', () => {
    it('should store and retrieve values', () => {
      cache.set('key1', 'value1');
      const result = cache.get('key1');

      assert.strictEqual(result, 'value1');
    });

    it('should increment sets counter', () => {
      cache.set('key1', 'value1');
      const stats = cache.getStats();

      assert.strictEqual(stats.sets, 1);
    });

    it('should increment hits on get', () => {
      cache.set('key1', 'value1');
      cache.get('key1');
      const stats = cache.getStats();

      assert.strictEqual(stats.hits, 1);
    });

    it('should return undefined for missing key', () => {
      const result = cache.get('nonexistent');
      assert.strictEqual(result, undefined);
    });

    it('should increment misses on missing key', () => {
      cache.get('nonexistent');
      const stats = cache.getStats();

      assert.strictEqual(stats.misses, 1);
    });

    it('should store various data types', () => {
      cache.set('string', 'value');
      cache.set('number', 42);
      cache.set('boolean', true);
      cache.set('object', { key: 'value' });
      cache.set('array', [1, 2, 3]);

      assert.strictEqual(cache.get('string'), 'value');
      assert.strictEqual(cache.get('number'), 42);
      assert.strictEqual(cache.get('boolean'), true);
      assert.deepStrictEqual(cache.get('object'), { key: 'value' });
      assert.deepStrictEqual(cache.get('array'), [1, 2, 3]);
    });

    it('should overwrite existing values', () => {
      cache.set('key1', 'value1');
      cache.set('key1', 'value2');

      assert.strictEqual(cache.get('key1'), 'value2');
    });

    it('should track access order on get', async () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      const firstAccessTime = cache.accessOrder.get('key1');

      // Wait and access key1
      await new Promise((resolve) => setTimeout(resolve, 10));
      cache.get('key1');
      const secondAccessTime = cache.accessOrder.get('key1');

      assert(secondAccessTime > firstAccessTime);
    });
  });

  describe('TTL (Time To Live)', () => {
    it('should use default TTL', () => {
      const before = Date.now();
      cache.set('key1', 'value1');
      const entry = cache.cache.get('key1');

      assert(entry.expiresAt > before);
      assert(entry.expiresAt <= before + cache.defaultTTL + 100);
    });

    it('should use custom TTL', () => {
      const before = Date.now();
      cache.set('key1', 'value1', 1000);
      const entry = cache.cache.get('key1');

      assert(entry.expiresAt > before);
      assert(entry.expiresAt <= before + 1100);
    });

    it('should return undefined for expired key', async () => {
      cache.set('key1', 'value1', 100);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 150));

      const result = cache.get('key1');
      assert.strictEqual(result, undefined);
    });

    it('should remove expired entry from cache', async () => {
      cache.set('key1', 'value1', 100);
      assert.strictEqual(cache.cache.size, 1);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 150));

      cache.get('key1');
      assert.strictEqual(cache.cache.size, 0);
    });

    it('should count expired access as miss', async () => {
      cache.set('key1', 'value1', 100);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 150));

      cache.get('key1');
      const stats = cache.getStats();

      assert.strictEqual(stats.misses, 1);
    });

    it('should support zero TTL', async () => {
      cache.set('key1', 'value1', 0);

      // Zero TTL means it expires immediately
      await new Promise((resolve) => setTimeout(resolve, 50));
      const result = cache.get('key1');

      assert.strictEqual(result, undefined);
    });

    it('should support long TTL', () => {
      cache.set('key1', 'value1', 1000000);
      const entry = cache.cache.get('key1');

      const expiresIn = entry.expiresAt - Date.now();
      assert(expiresIn > 999000);
    });
  });

  describe('LRU Eviction', () => {
    it('should evict least recently used when at max size', () => {
      // Fill cache to max
      for (let i = 0; i < 5; i++) {
        cache.set(`key${i}`, `value${i}`);
      }

      assert.strictEqual(cache.cache.size, 5);

      // Add one more, should evict oldest
      cache.set('key5', 'value5');

      assert.strictEqual(cache.cache.size, 5);
      assert.strictEqual(cache.cache.has('key5'), true);
      assert.strictEqual(cache.cache.has('key0'), false);
    });

    it('should track evictions', () => {
      // Fill and evict
      for (let i = 0; i < 6; i++) {
        cache.set(`key${i}`, `value${i}`);
      }

      const stats = cache.getStats();
      assert.strictEqual(stats.evictions, 1);
    });

    it('should evict based on access time', () => {
      // Set initial keys
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      // Access key1 to make it most recent
      cache.get('key1');

      // Fill cache
      cache.set('key4', 'value4');
      cache.set('key5', 'value5');

      // Add one more, key2 should be evicted (least recently used)
      cache.set('key6', 'value6');

      assert.strictEqual(cache.cache.has('key1'), true);
      assert.strictEqual(cache.cache.has('key2'), false);
      assert.strictEqual(cache.cache.has('key6'), true);
    });

    it('should not evict if under max size', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      const stats = cache.getStats();
      assert.strictEqual(stats.evictions, 0);
    });

    it('should handle eviction with single entry', () => {
      cache.maxSize = 1;
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      assert.strictEqual(cache.cache.size, 1);
      assert.strictEqual(cache.cache.has('key2'), true);
    });
  });

  describe('invalidate()', () => {
    it('should remove specific key', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.invalidate('key1');

      assert.strictEqual(cache.cache.has('key1'), false);
      assert.strictEqual(cache.cache.has('key2'), true);
    });

    it('should return true if key existed', () => {
      cache.set('key1', 'value1');
      const result = cache.invalidate('key1');

      assert.strictEqual(result, true);
    });

    it('should return false if key not found', () => {
      const result = cache.invalidate('nonexistent');

      assert.strictEqual(result, false);
    });

    it('should increment invalidations counter', () => {
      cache.set('key1', 'value1');
      cache.invalidate('key1');

      const stats = cache.getStats();
      assert.strictEqual(stats.invalidations, 1);
    });

    it('should not increment for nonexistent key', () => {
      cache.invalidate('nonexistent');

      const stats = cache.getStats();
      assert.strictEqual(stats.invalidations, 0);
    });

    it('should remove from access order', () => {
      cache.set('key1', 'value1');
      cache.invalidate('key1');

      assert.strictEqual(cache.accessOrder.has('key1'), false);
    });
  });

  describe('invalidatePattern()', () => {
    it('should invalidate keys matching string pattern', () => {
      cache.set('user:1', 'data1');
      cache.set('user:2', 'data2');
      cache.set('post:1', 'data3');

      cache.invalidatePattern('user:*');

      assert.strictEqual(cache.cache.has('user:1'), false);
      assert.strictEqual(cache.cache.has('user:2'), false);
      assert.strictEqual(cache.cache.has('post:1'), true);
    });

    it('should invalidate keys matching regex pattern', () => {
      cache.set('user:1', 'data1');
      cache.set('user:2', 'data2');
      cache.set('admin:1', 'data3');

      cache.invalidatePattern(/^user:/);

      assert.strictEqual(cache.cache.has('user:1'), false);
      assert.strictEqual(cache.cache.has('user:2'), false);
      assert.strictEqual(cache.cache.has('admin:1'), true);
    });

    it('should return count of invalidated entries', () => {
      cache.set('user:1', 'data1');
      cache.set('user:2', 'data2');
      cache.set('post:1', 'data3');

      const count = cache.invalidatePattern('user:*');

      assert.strictEqual(count, 2);
    });

    it('should track pattern invalidations', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.invalidatePattern('key*');

      const stats = cache.getStats();
      assert.strictEqual(stats.invalidations, 2);
    });

    it('should handle complex patterns', () => {
      cache.set('quote:user:1', 'data1');
      cache.set('quote:user:2', 'data2');
      cache.set('quote:admin:1', 'data3');

      cache.invalidatePattern('quote:user:*');

      assert.strictEqual(cache.cache.has('quote:user:1'), false);
      assert.strictEqual(cache.cache.has('quote:user:2'), false);
      assert.strictEqual(cache.cache.has('quote:admin:1'), true);
    });

    it('should return 0 for no matches', () => {
      cache.set('key1', 'value1');

      const count = cache.invalidatePattern('nonexistent:*');

      assert.strictEqual(count, 0);
    });
  });

  describe('clear()', () => {
    it('should remove all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      cache.clear();

      assert.strictEqual(cache.cache.size, 0);
      assert.strictEqual(cache.accessOrder.size, 0);
    });

    it('should track clear as invalidations', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.clear();

      const stats = cache.getStats();
      assert.strictEqual(stats.invalidations, 2);
    });

    it('should handle clearing empty cache', () => {
      cache.clear();

      assert.strictEqual(cache.cache.size, 0);
      const stats = cache.getStats();
      assert.strictEqual(stats.invalidations, 0);
    });
  });

  describe('has()', () => {
    it('should return true for existing valid key', () => {
      cache.set('key1', 'value1');
      assert.strictEqual(cache.has('key1'), true);
    });

    it('should return false for nonexistent key', () => {
      assert.strictEqual(cache.has('nonexistent'), false);
    });

    it('should return false for expired key', async () => {
      cache.set('key1', 'value1', 100);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 150));

      assert.strictEqual(cache.has('key1'), false);
    });

    it('should remove expired entry when checking', async () => {
      cache.set('key1', 'value1', 100);
      assert.strictEqual(cache.cache.size, 1);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 150));

      cache.has('key1');
      assert.strictEqual(cache.cache.size, 0);
    });

    it('should not modify stats', () => {
      cache.set('key1', 'value1');
      const before = cache.getStats().hits;

      cache.has('key1');
      const after = cache.getStats().hits;

      assert.strictEqual(before, after);
    });
  });

  describe('getStats()', () => {
    it('should return cache statistics', () => {
      cache.set('key1', 'value1');
      cache.get('key1');
      cache.get('nonexistent');

      const stats = cache.getStats();

      assert.strictEqual(stats.size, 1);
      assert.strictEqual(stats.maxSize, 5);
      assert.strictEqual(stats.hits, 1);
      assert.strictEqual(stats.misses, 1);
      assert.strictEqual(stats.sets, 1);
    });

    it('should calculate hit rate', () => {
      cache.set('key1', 'value1');
      cache.get('key1');
      cache.get('key1');
      cache.get('nonexistent');

      const stats = cache.getStats();

      // 2 hits, 1 miss = 66.67% hit rate
      assert(stats.hitRate > 66 && stats.hitRate < 67);
    });

    it('should handle 0% hit rate', () => {
      cache.get('nonexistent');

      const stats = cache.getStats();
      assert.strictEqual(stats.hitRate, 0);
    });

    it('should handle 100% hit rate', () => {
      cache.set('key1', 'value1');
      cache.get('key1');
      cache.get('key1');

      const stats = cache.getStats();
      assert.strictEqual(stats.hitRate, 100);
    });

    it('should estimate memory usage', () => {
      cache.set('key1', 'value1');
      cache.set('key2', { complex: 'object' });

      const stats = cache.getStats();

      assert(stats.memoryUsage > 0);
    });
  });

  describe('cleanup()', () => {
    it('should remove expired entries', async () => {
      cache.set('key1', 'value1', 100);
      cache.set('key2', 'value2', 100);
      cache.set('key3', 'value3', 5000);

      assert.strictEqual(cache.cache.size, 3);

      // Wait for some to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      const count = cache.cleanup();

      assert.strictEqual(count, 2);
      assert.strictEqual(cache.cache.size, 1);
    });

    it('should return count of cleaned entries', async () => {
      cache.set('key1', 'value1', 100);
      cache.set('key2', 'value1', 100);

      await new Promise((resolve) => setTimeout(resolve, 150));

      const count = cache.cleanup();
      assert.strictEqual(count, 2);
    });

    it('should handle no expired entries', () => {
      cache.set('key1', 'value1', 5000);

      const count = cache.cleanup();
      assert.strictEqual(count, 0);
    });

    it('should update access order', async () => {
      cache.set('key1', 'value1', 100);
      assert.strictEqual(cache.accessOrder.size, 1);

      await new Promise((resolve) => setTimeout(resolve, 150));

      cache.cleanup();
      assert.strictEqual(cache.accessOrder.size, 0);
    });
  });

  describe('resetStats()', () => {
    it('should reset all statistics', () => {
      cache.set('key1', 'value1');
      cache.get('key1');

      cache.resetStats();

      const stats = cache.getStats();
      assert.strictEqual(stats.hits, 0);
      assert.strictEqual(stats.misses, 0);
      assert.strictEqual(stats.sets, 0);
    });

    it('should preserve cache data', () => {
      cache.set('key1', 'value1');

      cache.resetStats();

      assert.strictEqual(cache.get('key1'), 'value1');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle mixed operations', () => {
      cache.set('user:1', { name: 'John' });
      cache.set('user:2', { name: 'Jane' });
      cache.set('post:1', { title: 'Test' });

      assert.strictEqual(cache.get('user:1').name, 'John');
      cache.invalidatePattern('user:*');
      assert.strictEqual(cache.get('user:1'), undefined);
      assert.deepStrictEqual(cache.get('post:1'), { title: 'Test' });
    });

    it('should handle concurrent access patterns', () => {
      // Simulate multiple accesses
      for (let i = 0; i < 10; i++) {
        cache.set(`key${i}`, `value${i}`);
        cache.get(`key${i}`);
      }

      const stats = cache.getStats();
      assert(stats.hits > 0);
      assert(stats.sets > 0);
    });

    it('should maintain cache during expiration', async () => {
      cache.set('short', 'value', 100);
      cache.set('long', 'value', 5000);

      await new Promise((resolve) => setTimeout(resolve, 150));

      assert.strictEqual(cache.get('short'), undefined);
      assert.strictEqual(cache.get('long'), 'value');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string keys', () => {
      cache.set('', 'value');
      assert.strictEqual(cache.get(''), 'value');
    });

    it('should handle null values', () => {
      cache.set('key1', null);
      assert.strictEqual(cache.get('key1'), null);
    });

    it('should handle undefined values', () => {
      cache.set('key1', undefined);
      assert.strictEqual(cache.get('key1'), undefined);
    });

    it('should handle very large objects', () => {
      const largeObj = {};
      for (let i = 0; i < 1000; i++) {
        largeObj[`prop${i}`] = `value${i}`;
      }

      cache.set('large', largeObj);
      const retrieved = cache.get('large');

      assert.strictEqual(Object.keys(retrieved).length, 1000);
    });

    it('should handle rapid set/get cycles', () => {
      for (let i = 0; i < 100; i++) {
        cache.set(`key${i % 5}`, `value${i}`);
        cache.get(`key${i % 5}`);
      }

      const stats = cache.getStats();
      assert(stats.sets >= 5);
      assert(stats.hits >= 90);
    });
  });
});
