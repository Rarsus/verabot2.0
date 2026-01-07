/**
 * Query Builder Unit Tests
 * Tests for chainable SQL query builder
 */

const QueryBuilder = require('../../src/utils/QueryBuilder');

console.log('=== Query Builder Tests ===\n');

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

// Test 1: Basic select
console.log('=== Test 1: Basic Select ===');
const qb1 = new QueryBuilder();
const sql1 = qb1.from('users').build();
assert(sql1 === 'SELECT * FROM users', 'Basic select query');

// Test 2: Select specific columns
console.log('\n=== Test 2: Select Specific Columns ===');
const qb2 = new QueryBuilder();
const sql2 = qb2.select('id, name').from('users').build();
assert(sql2 === 'SELECT id, name FROM users', 'Select with columns');

// Test 3: Select with array of columns
console.log('\n=== Test 3: Select with Column Array ===');
const qb3 = new QueryBuilder();
const sql3 = qb3.select(['id', 'name', 'email']).from('users').build();
assert(sql3 === 'SELECT id, name, email FROM users', 'Select with column array');

// Test 4: Where clause
console.log('\n=== Test 4: Where Clause ===');
const qb4 = new QueryBuilder();
qb4.from('users').where('id = ?', 1);
const sql4 = qb4.build();
const params4 = qb4.getParams();
assert(sql4 === 'SELECT * FROM users WHERE id = ?', 'Query with where clause');
assert(params4.length === 1 && params4[0] === 1, 'Where parameters set');

// Test 5: Multiple where clauses
console.log('\n=== Test 5: Multiple Where Clauses ===');
const qb5 = new QueryBuilder();
qb5.from('users')
  .where('age > ?', 18)
  .where('status = ?', 'active');
const sql5 = qb5.build();
const params5 = qb5.getParams();
assert(sql5.includes('WHERE age > ? AND status = ?'), 'Multiple where clauses combined with AND');
assert(params5.length === 2, 'Multiple where parameters');

// Test 6: Order by
console.log('\n=== Test 6: Order By ===');
const qb6 = new QueryBuilder();
const sql6 = qb6.from('users').orderBy('name ASC').build();
assert(sql6 === 'SELECT * FROM users ORDER BY name ASC', 'Query with order by');

// Test 7: Limit
console.log('\n=== Test 7: Limit ===');
const qb7 = new QueryBuilder();
const sql7 = qb7.from('users').limit(10).build();
assert(sql7 === 'SELECT * FROM users LIMIT 10', 'Query with limit');

// Test 8: Complex query
console.log('\n=== Test 8: Complex Query ===');
const qb8 = new QueryBuilder();
qb8.select(['id', 'name', 'email'])
  .from('users')
  .where('age > ?', 18)
  .where('status = ?', 'active')
  .orderBy('name ASC')
  .limit(5);
const sql8 = qb8.build();
const params8 = qb8.getParams();
assert(sql8.includes('SELECT id, name, email FROM users'), 'Complex query structure');
assert(sql8.includes('WHERE age > ? AND status = ?'), 'Complex query where clauses');
assert(sql8.includes('ORDER BY name ASC'), 'Complex query order by');
assert(sql8.includes('LIMIT 5'), 'Complex query limit');
assert(params8.length === 2, 'Complex query parameters');

// Test 9: Chainable API
console.log('\n=== Test 9: Chainable API ===');
const qb9 = new QueryBuilder();
const result = qb9.select('*');
assert(result === qb9, 'Select returns builder instance');
const result2 = qb9.from('users');
assert(result2 === qb9, 'From returns builder instance');
const result3 = qb9.where('id = ?', 1);
assert(result3 === qb9, 'Where returns builder instance');

// Test 10: Reset builder
console.log('\n=== Test 10: Reset Builder ===');
const qb10 = new QueryBuilder();
qb10.select('id').from('users').where('id = ?', 1);
qb10.reset();
const emptyParams = qb10.getParams();
assert(emptyParams.length === 0, 'Parameters cleared after reset');
try {
  qb10.build();
  assert(false, 'Should throw error after reset');
} catch (err) {
  assert(err.message.includes('FROM'), 'Throws error when FROM is missing after reset');
}

// Test 11: Missing FROM clause
console.log('\n=== Test 11: Missing FROM Clause ===');
const qb11 = new QueryBuilder();
qb11.select('id');
try {
  qb11.build();
  assert(false, 'Should throw error without FROM');
} catch (err) {
  assert(err.message.includes('FROM'), 'Throws error when FROM is missing');
}

// Test 12: Where with array parameters
console.log('\n=== Test 12: Where with Array Parameters ===');
const qb12 = new QueryBuilder();
qb12.from('users').where('id IN (?, ?, ?)', [1, 2, 3]);
const params12 = qb12.getParams();
assert(params12.length === 3, 'Array parameters flattened');
assert(params12[0] === 1 && params12[2] === 3, 'Array parameters correct');

// Test 13: Empty where value
console.log('\n=== Test 13: Where Without Parameters ===');
const qb13 = new QueryBuilder();
qb13.from('users').where('deleted_at IS NULL');
const sql13 = qb13.build();
const params13 = qb13.getParams();
assert(sql13.includes('deleted_at IS NULL'), 'Where without parameters works');
assert(params13.length === 0, 'No parameters added');

// Test 14: Build multiple times
console.log('\n=== Test 14: Build Multiple Times ===');
const qb14 = new QueryBuilder();
qb14.from('users').where('id = ?', 1);
const sql14a = qb14.build();
const sql14b = qb14.build();
assert(sql14a === sql14b, 'Build is idempotent');

// Test 15: Select all columns explicitly
console.log('\n=== Test 15: Select All Columns ===');
const qb15 = new QueryBuilder();
const sql15 = qb15.select('*').from('users').build();
assert(sql15 === 'SELECT * FROM users', 'Explicit select * works');

// Print results asynchronously to avoid async leak
(async () => {
  // Ensure all pending operations are complete
  await new Promise(resolve => setImmediate(resolve));

  console.log('\n==================================================');
  console.log(`Results: ${passedTests} passed, ${failedTests} failed`);

  if (failedTests === 0) {
    console.log('✅ All query builder tests passed!');
  } else {
    console.log(`❌ ${failedTests} test(s) failed`);
  }
})().catch(err => {
  console.error('Error in test summary:', err);
});
