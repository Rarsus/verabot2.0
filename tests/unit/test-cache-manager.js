/**
 * Cache Manager Unit Tests
 * Tests for in-memory caching with TTL and LRU eviction
 */

const CacheManager = require('../../src/services/CacheManager');

console.log('=== Cache Manager Tests ===\n');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ ${testName}`);
    passedTests++;
  } else {
    console.log(`❌ ${testName}`);
    failedTests++;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test 1: Cache initialization
console.log('=== Test 1: Cache Initialization ===');
const cache = new CacheManager({ maxSize: 5, defaultTTL: 1000 });
assert(cache !== null, 'Cache manager initialized');
assert(cache.cache.size === 0, 'Cache starts empty');

// Test 2: Set and get
console.log('\n=== Test 2: Set and Get ===');
cache.set('key1', 'value1');
const value = cache.get('key1');
assert(value === 'value1', 'Set and get value');

// Test 3: Get non-existent key
console.log('\n=== Test 3: Get Non-existent Key ===');
const missing = cache.get('nonexistent');
assert(missing === undefined, 'Returns undefined for missing key');

// Test 4: Set with custom TTL
console.log('\n=== Test 4: Custom TTL ===');
cache.set('ttl-key', 'ttl-value', 100);
assert(cache.get('ttl-key') === 'ttl-value', 'Value set with custom TTL');

// Test 5: TTL expiration
console.log('\n=== Test 5: TTL Expiration ===');
(async () => {
  const shortCache = new CacheManager({ defaultTTL: 50 });
  shortCache.set('expire-key', 'expire-value');
  assert(shortCache.get('expire-key') === 'expire-value', 'Value exists before expiration');

  await sleep(100);
  const expired = shortCache.get('expire-key');
  assert(expired === undefined, 'Value expired after TTL');
})();

// Test 6: LRU eviction
console.log('\n=== Test 6: LRU Eviction ===');
const lruCache = new CacheManager({ maxSize: 3 });
lruCache.set('a', 1);
lruCache.set('b', 2);
lruCache.set('c', 3);
lruCache.get('a'); // Access 'a' to make it more recently used
lruCache.set('d', 4); // Should evict 'b' (least recently used)
assert(lruCache.get('a') === 1, 'Most recently accessed kept');
assert(lruCache.get('b') === undefined, 'LRU entry evicted');
assert(lruCache.get('d') === 4, 'New entry added');

// Test 7: Invalidate specific key
console.log('\n=== Test 7: Invalidate Specific Key ===');
const invCache = new CacheManager();
invCache.set('inv1', 'value1');
invCache.set('inv2', 'value2');
const invalidated = invCache.invalidate('inv1');
assert(invalidated === true, 'Returns true when key exists');
assert(invCache.get('inv1') === undefined, 'Invalidated key removed');
assert(invCache.get('inv2') === 'value2', 'Other keys remain');

// Test 8: Invalidate pattern with wildcard
console.log('\n=== Test 8: Invalidate Pattern ===');
const patCache = new CacheManager();
patCache.set('user:1', 'data1');
patCache.set('user:2', 'data2');
patCache.set('post:1', 'post1');
const count = patCache.invalidatePattern('user:*');
assert(count === 2, 'Correct number of keys invalidated');
assert(patCache.get('user:1') === undefined, 'Pattern matched keys removed');
assert(patCache.get('post:1') === 'post1', 'Non-matching keys remain');

// Test 9: Invalidate pattern with regex
console.log('\n=== Test 9: Invalidate Pattern with Regex ===');
const regexCache = new CacheManager();
regexCache.set('test1', 'a');
regexCache.set('test2', 'b');
regexCache.set('other', 'c');
const regexCount = regexCache.invalidatePattern(/^test\d+$/);
assert(regexCount === 2, 'Regex pattern matches correct keys');
assert(regexCache.get('other') === 'c', 'Non-matching keys preserved');

// Test 10: Clear all
console.log('\n=== Test 10: Clear All ===');
const clearCache = new CacheManager();
clearCache.set('k1', 'v1');
clearCache.set('k2', 'v2');
clearCache.clear();
assert(clearCache.cache.size === 0, 'All entries cleared');
assert(clearCache.get('k1') === undefined, 'Cleared keys not accessible');

// Test 11: Statistics - hits
console.log('\n=== Test 11: Statistics - Hits ===');
const statsCache = new CacheManager();
statsCache.set('stat1', 'value');
statsCache.get('stat1'); // hit
statsCache.get('stat1'); // hit
statsCache.get('missing'); // miss
const stats = statsCache.getStats();
assert(stats.hits === 2, 'Correct hit count');
assert(stats.misses === 1, 'Correct miss count');

// Test 12: Statistics - hit rate
console.log('\n=== Test 12: Statistics - Hit Rate ===');
const rateCache = new CacheManager();
rateCache.set('item', 'data');
rateCache.get('item'); // hit
rateCache.get('item'); // hit
rateCache.get('none'); // miss
const rateStats = rateCache.getStats();
const expectedRate = (2 / 3 * 100).toFixed(2);
assert(rateStats.hitRate === parseFloat(expectedRate), 'Correct hit rate calculation');

// Test 13: Statistics - sets
console.log('\n=== Test 13: Statistics - Sets ===');
const setCache = new CacheManager();
setCache.set('a', 1);
setCache.set('b', 2);
setCache.set('a', 3); // update
const setStats = setCache.getStats();
assert(setStats.sets === 3, 'Correct set count including updates');

// Test 14: Statistics - evictions
console.log('\n=== Test 14: Statistics - Evictions ===');
const evictCache = new CacheManager({ maxSize: 2 });
evictCache.set('e1', 1);
evictCache.set('e2', 2);
evictCache.set('e3', 3); // triggers eviction
const evictStats = evictCache.getStats();
assert(evictStats.evictions === 1, 'Eviction counted');

// Test 15: Statistics - invalidations
console.log('\n=== Test 15: Statistics - Invalidations ===');
const invalidCache = new CacheManager();
invalidCache.set('i1', 1);
invalidCache.set('i2', 2);
invalidCache.invalidate('i1');
invalidCache.clear();
const invalidStats = invalidCache.getStats();
assert(invalidStats.invalidations === 2, 'Invalidations counted');

// Test 16: Has method
console.log('\n=== Test 16: Has Method ===');
const hasCache = new CacheManager();
hasCache.set('exists', 'yes');
assert(hasCache.has('exists') === true, 'Returns true for existing key');
assert(hasCache.has('notexists') === false, 'Returns false for missing key');

// Test 17: Has method with expired key
console.log('\n=== Test 17: Has Method with Expired Key ===');
(async () => {
  const expCache = new CacheManager({ defaultTTL: 50 });
  expCache.set('exp', 'val');
  assert(expCache.has('exp') === true, 'Returns true before expiration');
  await sleep(100);
  assert(expCache.has('exp') === false, 'Returns false after expiration');
})();

// Test 18: Cleanup expired entries
console.log('\n=== Test 18: Cleanup Expired Entries ===');
(async () => {
  const cleanCache = new CacheManager({ defaultTTL: 50 });
  cleanCache.set('c1', 'v1');
  cleanCache.set('c2', 'v2', 200);
  await sleep(100);
  const cleaned = cleanCache.cleanup();
  assert(cleaned === 1, 'Correct number of expired entries cleaned');
  assert(cleanCache.get('c1') === undefined, 'Expired entry removed');
  assert(cleanCache.get('c2') === 'v2', 'Non-expired entry kept');
})();

// Test 19: Reset statistics
console.log('\n=== Test 19: Reset Statistics ===');
const resetCache = new CacheManager();
resetCache.set('r1', 'v1');
resetCache.get('r1');
resetCache.resetStats();
const resetStats = resetCache.getStats();
assert(resetStats.hits === 0, 'Hits reset to 0');
assert(resetStats.sets === 0, 'Sets reset to 0');

// Test 20: Complex data types
console.log('\n=== Test 20: Complex Data Types ===');
const objCache = new CacheManager();
const obj = { id: 1, name: 'test', nested: { value: 42 } };
const arr = [1, 2, 3, { key: 'value' }];
objCache.set('obj', obj);
objCache.set('arr', arr);
const retrievedObj = objCache.get('obj');
const retrievedArr = objCache.get('arr');
assert(JSON.stringify(retrievedObj) === JSON.stringify(obj), 'Object stored and retrieved');
assert(JSON.stringify(retrievedArr) === JSON.stringify(arr), 'Array stored and retrieved');

// Wait for async tests to complete
setTimeout(() => {
  console.log('\n==================================================');
  console.log(`Results: ${passedTests} passed, ${failedTests} failed`);

  if (failedTests === 0) {
    console.log('✅ All cache manager tests passed!');
    process.exit(0);
  } else {
    console.log(`❌ ${failedTests} test(s) failed`);
    process.exit(1);
  }
}, 500);
