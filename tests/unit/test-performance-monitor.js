/**
 * Performance Monitor Integration Tests
 * Tests for PerformanceMonitor service integration
 */

const PerformanceMonitor = require('../../src/services/PerformanceMonitor');
const CacheManager = require('../../src/services/CacheManager');

console.log('=== Performance Monitor Integration Tests ===\n');

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

// Test 1: Initialize monitor
console.log('=== Test 1: Initialize Monitor ===');
const monitor = new PerformanceMonitor();
assert(monitor !== null, 'Monitor initialized');
assert(monitor.metrics !== null, 'Metrics object exists');

// Test 2: Record query
console.log('\n=== Test 2: Record Query ===');
monitor.recordQuery('SELECT * FROM quotes', 50, false);
const metrics1 = monitor.getMetrics();
assert(metrics1.queries.total === 1, 'Query recorded');
assert(metrics1.queries.uncached === 1, 'Uncached query counted');

// Test 3: Record cached query
console.log('\n=== Test 3: Record Cached Query ===');
monitor.recordQuery('SELECT * FROM quotes', 5, true);
const metrics2 = monitor.getMetrics();
assert(metrics2.queries.cached === 1, 'Cached query counted');
assert(parseFloat(metrics2.queries.cacheHitRate) === 50, 'Cache hit rate calculated correctly');

// Test 4: Query metrics calculation
console.log('\n=== Test 4: Query Metrics ===');
monitor.recordQuery('SELECT * FROM users', 100, false);
const metrics3 = monitor.getMetrics();
assert(metrics3.queries.total === 3, 'Total queries correct');
assert(parseFloat(metrics3.queries.averageDuration) > 0, 'Average duration calculated');
assert(metrics3.queries.maxDuration === 100, 'Max duration tracked');
assert(metrics3.queries.minDuration === 5, 'Min duration tracked');

// Test 5: Query type tracking
console.log('\n=== Test 5: Query Type Tracking ===');
monitor.recordQuery('INSERT INTO quotes VALUES (1)', 20, false);
monitor.recordQuery('UPDATE quotes SET text = "a"', 30, false);
monitor.recordQuery('DELETE FROM quotes WHERE id = 1', 15, false);
const metrics4 = monitor.getMetrics();
assert(metrics4.queries.byType.select !== undefined, 'SELECT queries tracked');
assert(metrics4.queries.byType.insert !== undefined, 'INSERT queries tracked');
assert(metrics4.queries.byType.update !== undefined, 'UPDATE queries tracked');
assert(metrics4.queries.byType.delete !== undefined, 'DELETE queries tracked');

// Test 6: Update cache metrics
console.log('\n=== Test 6: Update Cache Metrics ===');
const cache = new CacheManager();
cache.set('key1', 'value1');
cache.get('key1'); // hit
cache.get('key2'); // miss
monitor.updateCacheMetrics(cache.getStats());
const metrics5 = monitor.getMetrics();
assert(metrics5.cache.hits === 1, 'Cache hits updated');
assert(metrics5.cache.misses === 1, 'Cache misses updated');

// Test 7: Memory metrics
console.log('\n=== Test 7: Memory Metrics ===');
monitor.updateMemoryMetrics();
const metrics6 = monitor.getMetrics();
assert(metrics6.memory.heapUsed !== undefined, 'Heap used tracked');
assert(metrics6.memory.heapTotal !== undefined, 'Heap total tracked');
assert(metrics6.memory.rss !== undefined, 'RSS tracked');

// Test 8: Slow queries
console.log('\n=== Test 8: Slow Queries Detection ===');
monitor.recordQuery('SLOW SELECT * FROM large_table', 150, false);
monitor.recordQuery('SLOW JOIN query', 200, false);
const slowQueries = monitor.getSlowQueries(100);
assert(slowQueries.length === 2, 'Slow queries detected');
assert(slowQueries[0].duration >= 100, 'Slow query duration correct');

// Test 9: Reset metrics
console.log('\n=== Test 9: Reset Metrics ===');
monitor.reset();
const metrics7 = monitor.getMetrics();
assert(metrics7.queries.total === 0, 'Queries reset');
assert(Object.keys(metrics7.queries.byType).length === 0, 'Query types reset');

// Test 10: Query history limit
console.log('\n=== Test 10: Query History Limit ===');
const monitor2 = new PerformanceMonitor();
monitor2.maxHistorySize = 5;
for (let i = 0; i < 10; i++) {
  monitor2.recordQuery(`SELECT ${i}`, 10, false);
}
assert(monitor2.queryHistory.length === 5, 'History limited to max size');

// Test 11: Log metrics (should not throw)
console.log('\n=== Test 11: Log Metrics ===');
try {
  monitor.recordQuery('SELECT test', 25, false);
  monitor.logMetrics();
  assert(true, 'Log metrics executes without error');
} catch (err) {
  assert(false, 'Log metrics failed: ' + err.message);
}

// Test 12: Query type detection
console.log('\n=== Test 12: Query Type Detection ===');
const testCases = [
  { sql: 'SELECT * FROM table', expected: 'select' },
  { sql: 'INSERT INTO table VALUES (1)', expected: 'insert' },
  { sql: 'UPDATE table SET x=1', expected: 'update' },
  { sql: 'DELETE FROM table', expected: 'delete' },
  { sql: 'CREATE TABLE test', expected: 'create' },
  { sql: 'DROP TABLE test', expected: 'drop' },
  { sql: 'ALTER TABLE test', expected: 'alter' }
];

testCases.forEach(tc => {
  monitor.recordQuery(tc.sql, 10, false);
});
const metrics8 = monitor.getMetrics();
assert(metrics8.queries.byType.select !== undefined, 'SELECT type detected');
assert(metrics8.queries.byType.insert !== undefined, 'INSERT type detected');
assert(metrics8.queries.byType.update !== undefined, 'UPDATE type detected');
assert(metrics8.queries.byType.delete !== undefined, 'DELETE type detected');

// Test 13: Multiple cache updates
console.log('\n=== Test 13: Multiple Cache Updates ===');
const cache2 = new CacheManager({ maxSize: 10 });
cache2.set('a', 1);
cache2.set('b', 2);
cache2.get('a'); // hit
cache2.get('b'); // hit
cache2.get('c'); // miss
monitor.updateCacheMetrics(cache2.getStats());
const metrics9 = monitor.getMetrics();
assert(metrics9.cache.size === 2, 'Cache size updated');
assert(metrics9.cache.hitRate > 0, 'Cache hit rate updated');

// Test 14: Pool metrics update
console.log('\n=== Test 14: Pool Metrics Update ===');
const poolStats = {
  totalConnections: 5,
  availableConnections: 3,
  inUseConnections: 2,
  acquired: 10,
  released: 8,
  queued: 2,
  utilization: 40
};
monitor.updatePoolMetrics(poolStats);
const metrics10 = monitor.getMetrics();
assert(metrics10.pool.totalConnections === 5, 'Pool total connections updated');
assert(metrics10.pool.utilization === 40, 'Pool utilization updated');

// Test 15: Recent queries
console.log('\n=== Test 15: Recent Queries ===');
monitor.reset();
monitor.recordQuery('Query 1', 10, false);
monitor.recordQuery('Query 2', 20, false);
monitor.recordQuery('Query 3', 30, false);
const metrics11 = monitor.getMetrics();
assert(metrics11.recentQueries.length <= 10, 'Recent queries limited');
assert(metrics11.recentQueries[0].sql.includes('Query'), 'Recent queries contain query info');

// Print results
console.log('\n==================================================');
console.log(`Results: ${passedTests} passed, ${failedTests} failed`);

if (failedTests === 0) {
  console.log('✅ All performance monitor integration tests passed!');
  process.exit(0);
} else {
  console.log(`❌ ${failedTests} test(s) failed`);
  process.exit(1);
}
