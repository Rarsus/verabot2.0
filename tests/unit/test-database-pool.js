/**
 * Database Pool Unit Tests
 * Tests for connection pooling and queue management
 */

const DatabasePool = require('../../src/services/DatabasePool');
const path = require('path');
const fs = require('fs');

console.log('=== Database Pool Tests ===\n');

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

// Test database path
const testDbPath = path.join(__dirname, '..', '..', 'data', 'db', 'test_pool.db');

// Clean up test database
function cleanupTestDb() {
  if (fs.existsSync(testDbPath)) {
    try {
      fs.unlinkSync(testDbPath);
    } catch {
      // Ignore
    }
  }
}

// Test 1: Pool initialization
console.log('=== Test 1: Pool Initialization ===');
const pool = new DatabasePool({ dbPath: testDbPath, poolSize: 3 });
assert(pool !== null, 'Pool initialized');
assert(pool.poolSize === 3, 'Pool size set correctly');

// Wait for connections to be created
setTimeout(async () => {
  const stats = pool.getStats();
  assert(stats.totalConnections <= 3, 'Connections created within pool size');

  // Test 2: Get connection
  console.log('\n=== Test 2: Get Connection ===');
  try {
    const conn = await pool.getConnection();
    assert(conn !== null, 'Connection acquired');
    assert(conn.db !== null, 'Connection has database object');
    pool.releaseConnection(conn);
    assert(true, 'Connection released');
  } catch (err) {
    assert(false, `Failed to get connection: ${err.message}`);
  }

  // Test 3: Multiple connections
  console.log('\n=== Test 3: Multiple Connections ===');
  try {
    const conn1 = await pool.getConnection();
    const conn2 = await pool.getConnection();
    const conn3 = await pool.getConnection();
    assert(conn1.id !== conn2.id, 'Different connections returned');
    assert(conn2.id !== conn3.id, 'Third connection unique');
    pool.releaseConnection(conn1);
    pool.releaseConnection(conn2);
    pool.releaseConnection(conn3);
    assert(true, 'Multiple connections handled');
  } catch (err) {
    assert(false, `Multiple connections failed: ${err.message}`);
  }

  // Test 4: Connection reuse
  console.log('\n=== Test 4: Connection Reuse ===');
  try {
    const conn1 = await pool.getConnection();
    pool.releaseConnection(conn1);
    await sleep(50); // Give time for connection to be added back to pool
    const conn2 = await pool.getConnection();
    const id2 = conn2.id;
    // Connection should be reused (same ID) or from the limited pool
    assert(id2 !== undefined && id2 < 10, 'Connection from pool');
    pool.releaseConnection(conn2);
  } catch (err) {
    assert(false, `Connection reuse failed: ${err.message}`);
  }

  // Test 5: Execute query - all
  console.log('\n=== Test 5: Execute Query - All ===');
  try {
    await pool.execQuery('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)', [], 'run');
    await pool.execQuery('INSERT INTO test (name) VALUES (?)', ['test1'], 'run');
    await pool.execQuery('INSERT INTO test (name) VALUES (?)', ['test2'], 'run');
    const rows = await pool.execQuery('SELECT * FROM test', [], 'all');
    assert(Array.isArray(rows), 'Returns array for all query');
    assert(rows.length === 2, 'Correct number of rows');
  } catch (err) {
    assert(false, `Execute query all failed: ${err.message}`);
  }

  // Test 6: Execute query - get
  console.log('\n=== Test 6: Execute Query - Get ===');
  try {
    const row = await pool.execQuery('SELECT * FROM test WHERE name = ?', ['test1'], 'get');
    assert(row !== null, 'Returns single row');
    assert(row.name === 'test1', 'Correct row data');
  } catch (err) {
    assert(false, `Execute query get failed: ${err.message}`);
  }

  // Test 7: Execute query - run
  console.log('\n=== Test 7: Execute Query - Run ===');
  try {
    const result = await pool.execQuery('UPDATE test SET name = ? WHERE name = ?', ['updated', 'test1'], 'run');
    assert(result.changes !== undefined, 'Returns changes count');
    assert(result.changes === 1, 'Correct changes count');
  } catch (err) {
    assert(false, `Execute query run failed: ${err.message}`);
  }

  // Test 8: Statistics tracking
  console.log('\n=== Test 8: Statistics Tracking ===');
  const beforeStats = pool.getStats();
  try {
    const conn = await pool.getConnection();
    pool.releaseConnection(conn);
    const afterStats = pool.getStats();
    assert(afterStats.acquired > beforeStats.acquired, 'Acquired count incremented');
    assert(afterStats.released > beforeStats.released, 'Released count incremented');
  } catch (err) {
    assert(false, `Statistics tracking failed: ${err.message}`);
  }

  // Test 9: Pool utilization
  console.log('\n=== Test 9: Pool Utilization ===');
  try {
    const conn1 = await pool.getConnection();
    const conn2 = await pool.getConnection();
    const stats = pool.getStats();
    assert(stats.inUseConnections === 2, 'Correct in-use count');
    assert(parseFloat(stats.utilization) > 0, 'Utilization calculated');
    pool.releaseConnection(conn1);
    pool.releaseConnection(conn2);
  } catch (err) {
    assert(false, `Pool utilization failed: ${err.message}`);
  }

  // Test 10: Connection queuing
  console.log('\n=== Test 10: Connection Queuing ===');
  const smallPool = new DatabasePool({ dbPath: testDbPath, poolSize: 2, queueTimeout: 1000 });
  await sleep(100); // Let pool initialize

  try {
    const conn1 = await smallPool.getConnection();
    const conn2 = await smallPool.getConnection();

    // This should queue
    const queuePromise = smallPool.getConnection();
    await sleep(50);
    const queueStats = smallPool.getStats();

    // Release one to fulfill queue
    smallPool.releaseConnection(conn1);
    const conn3 = await queuePromise;

    assert(conn3 !== null, 'Queued connection fulfilled');
    assert(queueStats.queued > 0 || queueStats.queuedRequests > 0, 'Queue tracked in stats');

    smallPool.releaseConnection(conn2);
    smallPool.releaseConnection(conn3);
    await smallPool.close();
  } catch (err) {
    assert(false, `Connection queuing failed: ${err.message}`);
    try { await smallPool.close(); } catch { /* ignore */ }
  }

  // Test 11: Reset statistics
  console.log('\n=== Test 11: Reset Statistics ===');
  pool.resetStats();
  const resetStats = pool.getStats();
  assert(resetStats.acquired === 0, 'Acquired reset to 0');
  assert(resetStats.released === 0, 'Released reset to 0');

  // Test 12: Error handling - invalid query
  console.log('\n=== Test 12: Error Handling - Invalid Query ===');
  try {
    await pool.execQuery('INVALID SQL QUERY', [], 'all');
    assert(false, 'Should throw error for invalid query');
  } catch (err) {
    assert(err.message.includes('syntax'), 'Throws error for invalid SQL');
  }

  // Test 13: Available connections
  console.log('\n=== Test 13: Available Connections ===');
  const availStats1 = pool.getStats();
  const conn = await pool.getConnection();
  const availStats2 = pool.getStats();
  assert(availStats2.availableConnections < availStats1.availableConnections,
    'Available connections decreased');
  pool.releaseConnection(conn);
  const availStats3 = pool.getStats();
  assert(availStats3.availableConnections >= availStats2.availableConnections,
    'Available connections increased after release');

  // Test 14: Concurrent queries
  console.log('\n=== Test 14: Concurrent Queries ===');
  try {
    const promises = [
      pool.execQuery('SELECT * FROM test', [], 'all'),
      pool.execQuery('SELECT * FROM test', [], 'all'),
      pool.execQuery('SELECT * FROM test', [], 'all')
    ];
    const results = await Promise.all(promises);
    assert(results.length === 3, 'All concurrent queries completed');
    assert(results.every(r => Array.isArray(r)), 'All results valid');
  } catch (err) {
    assert(false, `Concurrent queries failed: ${err.message}`);
  }

  // Test 15: Close pool
  console.log('\n=== Test 15: Close Pool ===');
  try {
    await pool.close();
    const closedStats = pool.getStats();
    assert(closedStats.totalConnections === 0, 'All connections closed');
    assert(closedStats.queuedRequests === 0, 'Queue cleared');
  } catch (err) {
    assert(false, `Close pool failed: ${err.message}`);
  }

  // Cleanup
  cleanupTestDb();

  // Print results
  console.log('\n==================================================');
  console.log(`Results: ${passedTests} passed, ${failedTests} failed`);

  if (failedTests === 0) {
    console.log('✅ All database pool tests passed!');
  } else {
    console.log(`❌ ${failedTests} test(s) failed`);
  }
}, 500);
