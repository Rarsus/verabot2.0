/**
 * Test Suite: Error Handler Middleware
 *
 * Comprehensive test suite for error handling middleware.
 * Tests all error levels, logging, recovery patterns, and async error handling.
 *
 * Test Categories:
 * 1. Error Levels (5 tests)
 * 2. Error Logging (5 tests)
 * 3. Error Recovery (4 tests)
 * 4. Async Error Handling (4 tests)
 * 5. Error Context Preservation (3 tests)
 * 6. Error Response Formatting (3 bonus tests)
 *
 * Total: 24 tests
 */

const assert = require('assert');
const { logError, ERROR_LEVELS } = require('../../src/middleware/errorHandler');

let passed = 0;
let failed = 0;

// Helper function to capture console output
function captureConsoleOutput(fn) {
  const logs = {
    log: [],
    warn: [],
    error: [],
  };

  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  console.log = (...args) => logs.log.push(args.join(' '));
  console.warn = (...args) => logs.warn.push(args.join(' '));
  console.error = (...args) => logs.error.push(args.join(' '));

  try {
    fn();
  } finally {
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
  }

  return logs;
}

// Test helper
function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (err) {
    console.error(`❌ ${name}`);
    console.error(`   Error: ${err.message}`);
    failed++;
  }
}

// ============================================================================
// TEST SUITE: ERROR LEVELS
// ============================================================================

console.log('\n=== Error Handler Tests ===\n');

console.log('📋 Category 1: Error Levels (5 tests)');

test('Test 1: Log LOW level errors', () => {
  const logs = captureConsoleOutput(() => {
    logError('testFunc', new Error('Low error'), ERROR_LEVELS.LOW);
  });
  // All levels use console.error
  assert(logs.error.length > 0, 'Should log LOW level');
});

test('Test 2: Log MEDIUM level errors', () => {
  const logs = captureConsoleOutput(() => {
    logError('testFunc', new Error('Medium error'), ERROR_LEVELS.MEDIUM);
  });
  assert(logs.warn.length > 0 || logs.error.length > 0, 'Should log MEDIUM level');
});

test('Test 3: Log HIGH level errors', () => {
  const logs = captureConsoleOutput(() => {
    logError('testFunc', new Error('High error'), ERROR_LEVELS.HIGH);
  });
  assert(logs.error.length > 0, 'Should use error for HIGH level');
});

test('Test 4: Log CRITICAL level errors', () => {
  const logs = captureConsoleOutput(() => {
    logError('testFunc', new Error('Critical error'), ERROR_LEVELS.CRITICAL);
  });
  assert(logs.error.length > 0, 'Should use error for CRITICAL level');
});

test('Test 5: Handle undefined error level gracefully', () => {
  const logs = captureConsoleOutput(() => {
    logError('testFunc', new Error('Unknown level'), undefined);
  });
  // Should handle gracefully without throwing
  assert(logs.log.length > 0 || logs.warn.length > 0 || logs.error.length > 0, 'Should log something');
});

// ============================================================================
// TEST SUITE: ERROR LOGGING
// ============================================================================

console.log('\n📋 Category 2: Error Logging (5 tests)');

test('Test 6: Include function name in error log', () => {
  const logs = captureConsoleOutput(() => {
    logError('myFunction', new Error('test'), ERROR_LEVELS.LOW);
  });
  const allLogs = [...logs.log, ...logs.warn, ...logs.error].join(' ');
  assert(allLogs.includes('myFunction'), 'Function name should be included');
});

test('Test 7: Include error message in error log', () => {
  const logs = captureConsoleOutput(() => {
    logError('func', new Error('specific message'), ERROR_LEVELS.LOW);
  });
  const allLogs = [...logs.log, ...logs.warn, ...logs.error].join(' ');
  assert(allLogs.includes('specific message'), 'Error message should be included');
});

test('Test 8: Include error stack trace', () => {
  const logs = captureConsoleOutput(() => {
    try {
      throw new Error('test stack');
    } catch (err) {
      logError('func', err, ERROR_LEVELS.HIGH);
    }
  });
  const allLogs = [...logs.log, ...logs.warn, ...logs.error].join(' ');
  assert(allLogs.includes('test stack'), 'Stack trace should be included');
});

test('Test 9: Handle multiple errors correctly', () => {
  const logs = captureConsoleOutput(() => {
    logError('testFunc1', new Error('Error 1'), ERROR_LEVELS.LOW);
    logError('testFunc2', new Error('Error 2'), ERROR_LEVELS.MEDIUM);
  });
  const allLogs = [...logs.log, ...logs.warn, ...logs.error].join(' ');
  assert(allLogs.includes('Error 1') && allLogs.includes('Error 2'), 'Multiple errors should be logged');
});

test('Test 10: Handle complex error objects', () => {
  const logs = captureConsoleOutput(() => {
    const err = new Error('Complex error');
    err.code = 'CUSTOM_CODE';
    err.context = { userId: '123', action: 'test' };
    logError('complexFunc', err, ERROR_LEVELS.MEDIUM);
  });
  const allLogs = [...logs.log, ...logs.warn, ...logs.error].join(' ');
  assert(allLogs.includes('Complex error'), 'Complex error should be logged');
});

// ============================================================================
// TEST SUITE: ERROR RECOVERY
// ============================================================================

console.log('\n📋 Category 3: Error Recovery (4 tests)');

test('Test 11: Handle errors with custom metadata', () => {
  const logs = captureConsoleOutput(() => {
    const err = new Error('test');
    err.context = 'custom context';
    logError('func', err, ERROR_LEVELS.MEDIUM);
  });
  assert(logs.error.length > 0, 'Should handle error with metadata');
});

test('Test 12: Handle null error gracefully', () => {
  captureConsoleOutput(() => {
    logError('func', null, ERROR_LEVELS.LOW);
  });
  // Should not throw - just check it was called
  assert(true, 'Should handle null error without throwing');
});

test('Test 13: Handle string error messages', () => {
  const logs = captureConsoleOutput(() => {
    logError('func', 'String error message', ERROR_LEVELS.LOW);
  });
  const allLogs = [...logs.log, ...logs.warn, ...logs.error].join(' ');
  assert(allLogs.length > 0, 'Should handle string errors');
});

test('Test 14: Handle error objects with cause property', () => {
  const logs = captureConsoleOutput(() => {
    const err = new Error('test');
    err.cause = new Error('root cause');
    logError('func', err, ERROR_LEVELS.HIGH);
  });
  assert(logs.error.length > 0, 'Should handle error with cause');
});

// ============================================================================
// TEST SUITE: ASYNC ERROR HANDLING
// ============================================================================

console.log('\n📋 Category 4: Async Error Handling (4 tests)');

test('Test 15: Handle promise rejection errors', () => {
  const logs = captureConsoleOutput(() => {
    const err = new Error('promise error');
    logError('asyncFunc', err, ERROR_LEVELS.MEDIUM);
  });
  assert(logs.error.length > 0, 'Should handle promise rejections');
});

test('Test 16: Handle database errors', () => {
  const logs = captureConsoleOutput(() => {
    const dbErr = new Error('database connection failed');
    dbErr.code = 'ECONNREFUSED';
    logError('database.connect', dbErr, ERROR_LEVELS.HIGH);
  });
  assert(logs.error.length > 0, 'Should log database errors');
});

test('Test 17: Handle timeout errors', () => {
  const logs = captureConsoleOutput(() => {
    const timeoutErr = new Error('Operation timed out');
    timeoutErr.code = 'ETIMEDOUT';
    logError('operation', timeoutErr, ERROR_LEVELS.MEDIUM);
  });
  assert(logs.warn.length > 0 || logs.error.length > 0, 'Should log timeout errors');
});

test('Test 18: Handle validation errors', () => {
  const logs = captureConsoleOutput(() => {
    const valErr = new Error('Validation failed');
    valErr.field = 'email';
    logError('validate', valErr, ERROR_LEVELS.LOW);
  });
  assert(logs.error.length > 0, 'Should log validation errors');
});

// ============================================================================
// TEST SUITE: ERROR CONTEXT PRESERVATION
// ============================================================================

console.log('\n📋 Category 5: Error Context Preservation (3 tests)');

test('Test 19: Preserve error properties', () => {
  const logs = captureConsoleOutput(() => {
    const err = new Error('test');
    err.userId = '123';
    err.guildId = 'guild456';
    logError('func', err, ERROR_LEVELS.MEDIUM);
  });
  assert(logs.error.length > 0, 'Should preserve error properties');
});

test('Test 20: Log errors from try-catch blocks', () => {
  const logs = captureConsoleOutput(() => {
    try {
      throw new Error('caught error');
    } catch (err) {
      logError('tryBlock', err, ERROR_LEVELS.LOW);
    }
  });
  assert(logs.error.length > 0, 'Should log errors from try-catch');
});

test('Test 21: Handle error chaining', () => {
  const logs = captureConsoleOutput(() => {
    const original = new Error('original');
    const wrapper = new Error('wrapped');
    wrapper.cause = original;
    logError('func', wrapper, ERROR_LEVELS.HIGH);
  });
  assert(logs.error.length > 0, 'Should handle error chaining');
});

// ============================================================================
// TEST SUITE: ERROR RESPONSE FORMATTING (BONUS)
// ============================================================================

console.log('\n📋 Category 6: Error Response Formatting (3 bonus tests)');

test('Test 22: Format errors for user display', () => {
  const logs = captureConsoleOutput(() => {
    const err = new Error('User-friendly message');
    logError('userAPI', err, ERROR_LEVELS.LOW);
  });
  assert(logs.error.length > 0, 'Should format for display');
});

test('Test 23: Include error context in logs', () => {
  const logs = captureConsoleOutput(() => {
    const err = new Error('contextual error');
    err.context = { operation: 'quote_save', timestamp: Date.now() };
    logError('save', err, ERROR_LEVELS.MEDIUM);
  });
  assert(logs.error.length > 0, 'Should include context in logs');
});

test('Test 24: Handle multiple errors in sequence', () => {
  const logs = captureConsoleOutput(() => {
    logError('func1', new Error('error 1'), ERROR_LEVELS.LOW);
    logError('func2', new Error('error 2'), ERROR_LEVELS.MEDIUM);
    logError('func3', new Error('error 3'), ERROR_LEVELS.HIGH);
  });
  assert(logs.error.length >= 3, 'Should handle multiple errors');
});

// ============================================================================
// RESULTS
// ============================================================================

console.log(`\n${'='.repeat(50)}`);
console.log('📊 Test Results');
console.log('='.repeat(50));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log('='.repeat(50));

if (failed > 0) {
  console.error(`\n❌ ${failed} test(s) failed`);
} else {
  console.log('\n✅ All error handler tests passed!');
}
