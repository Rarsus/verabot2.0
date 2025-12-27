/**
 * Test Suite: Logger Middleware
 * Tests centralized logging functionality
 */

/* eslint-disable no-unused-vars */

const { log, LOG_LEVELS } = require('../../src/middleware/logger');

let passed = 0;
let failed = 0;

// Test 1: LOG_LEVELS are defined
console.log('\n=== Test 1: Log Levels Defined ===');
try {
  if (LOG_LEVELS.DEBUG && LOG_LEVELS.INFO && LOG_LEVELS.WARN && LOG_LEVELS.ERROR) {
    console.log('✅ Test 1 Passed: All log levels defined');
    passed++;
  } else {
    console.error('❌ Test 1 Failed: Missing log levels');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 1 Failed:', err.message);
  failed++;
}

// Test 2: log function exists and is callable
console.log('\n=== Test 2: Log Function Exists ===');
try {
  if (typeof log === 'function') {
    console.log('✅ Test 2 Passed: log function is defined');
    passed++;
  } else {
    console.error('❌ Test 2 Failed: log is not a function');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 2 Failed:', err.message);
  failed++;
}

// Test 3: log DEBUG level message
console.log('\n=== Test 3: Log DEBUG Level ===');
try {
  log(LOG_LEVELS.DEBUG, 'test.context', 'Debug message');
  console.log('✅ Test 3 Passed: DEBUG level logged');
  passed++;
} catch (err) {
  console.error('❌ Test 3 Failed:', err.message);
  failed++;
}

// Test 4: log INFO level message
console.log('\n=== Test 4: Log INFO Level ===');
try {
  log(LOG_LEVELS.INFO, 'test.context', 'Info message');
  console.log('✅ Test 4 Passed: INFO level logged');
  passed++;
} catch (err) {
  console.error('❌ Test 4 Failed:', err.message);
  failed++;
}

// Test 5: log WARN level message
console.log('\n=== Test 5: Log WARN Level ===');
try {
  log(LOG_LEVELS.WARN, 'test.context', 'Warning message');
  console.log('✅ Test 5 Passed: WARN level logged');
  passed++;
} catch (err) {
  console.error('❌ Test 5 Failed:', err.message);
  failed++;
}

// Test 6: log ERROR level message
console.log('\n=== Test 6: Log ERROR Level ===');
try {
  log(LOG_LEVELS.ERROR, 'test.context', 'Error message');
  console.log('✅ Test 6 Passed: ERROR level logged');
  passed++;
} catch (err) {
  console.error('❌ Test 6 Failed:', err.message);
  failed++;
}

// Test 7: log with additional data
console.log('\n=== Test 7: Log With Data ===');
try {
  log(LOG_LEVELS.INFO, 'test.context', 'Message with data', {
    userId: '123',
    action: 'test'
  });
  console.log('✅ Test 7 Passed: Log with additional data');
  passed++;
} catch (err) {
  console.error('❌ Test 7 Failed:', err.message);
  failed++;
}

// Test 8: log with empty data object
console.log('\n=== Test 8: Log With Empty Data ===');
try {
  log(LOG_LEVELS.INFO, 'test.context', 'Message without data', {});
  console.log('✅ Test 8 Passed: Log with empty data object');
  passed++;
} catch (err) {
  console.error('❌ Test 8 Failed:', err.message);
  failed++;
}

// Test 9: log without data parameter (default)
console.log('\n=== Test 9: Log Without Data Parameter ===');
try {
  log(LOG_LEVELS.INFO, 'test.context', 'Message with default data');
  console.log('✅ Test 9 Passed: Log without data parameter');
  passed++;
} catch (err) {
  console.error('❌ Test 9 Failed:', err.message);
  failed++;
}

// Test 10: log with various context strings
console.log('\n=== Test 10: Log Different Contexts ===');
try {
  const contexts = ['command', 'database', 'middleware', 'service.quote'];
  let allPassed = true;

  contexts.forEach(context => {
    try {
      log(LOG_LEVELS.INFO, context, 'Test message for ' + context);
    } catch (e) {
      allPassed = false;
    }
  });

  if (allPassed) {
    console.log('✅ Test 10 Passed: All context strings logged');
    passed++;
  } else {
    console.error('❌ Test 10 Failed: Some contexts failed');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 10 Failed:', err.message);
  failed++;
}

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log('✅ All logger tests passed!');
}
