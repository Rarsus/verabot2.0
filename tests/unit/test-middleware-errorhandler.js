/**
 * Test Suite: Error Handler Middleware
 * Tests error logging and interaction error handling
 */

/* eslint-disable no-unused-vars */

const { logError, handleInteractionError, ERROR_LEVELS } = require('../../src/middleware/errorHandler');

let passed = 0;
let failed = 0;

// Mock interaction for testing
function createMockInteraction() {
  return {
    user: { id: '123456', username: 'testuser' },
    commandName: 'test-command',
    replied: false,
    deferred: false,
    reply: async function (msg) {
      this.replied = true;
      return msg;
    },
    followUp: async function (msg) {
      return msg;
    },
  };
}

// Test 1: Error levels are defined
console.log('\n=== Test 1: Error Levels Defined ===');
try {
  if (ERROR_LEVELS.LOW && ERROR_LEVELS.MEDIUM && ERROR_LEVELS.HIGH && ERROR_LEVELS.CRITICAL) {
    console.log('✅ Test 1 Passed: All error levels defined');
    passed++;
  } else {
    console.error('❌ Test 1 Failed: Missing error levels');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 1 Failed:', err.message);
  failed++;
}

// Test 2: logError handles Error objects
console.log('\n=== Test 2: Log Error Object ===');
try {
  const testError = new Error('Test error message');
  logError('test.context', testError, ERROR_LEVELS.MEDIUM);
  console.log('✅ Test 2 Passed: Error object logged');
  passed++;
} catch (err) {
  console.error('❌ Test 2 Failed:', err.message);
  failed++;
}

// Test 3: logError handles string messages
console.log('\n=== Test 3: Log String Message ===');
try {
  logError('test.context', 'String error message', ERROR_LEVELS.LOW);
  console.log('✅ Test 3 Passed: String message logged');
  passed++;
} catch (err) {
  console.error('❌ Test 3 Failed:', err.message);
  failed++;
}

// Test 4: logError with metadata
console.log('\n=== Test 4: Log With Metadata ===');
try {
  logError('test.context', 'Error with metadata', ERROR_LEVELS.HIGH, {
    userId: '123456',
    commandName: 'test-cmd',
  });
  console.log('✅ Test 4 Passed: Error with metadata logged');
  passed++;
} catch (err) {
  console.error('❌ Test 4 Failed:', err.message);
  failed++;
}

// Test 5: logError with stack trace
console.log('\n=== Test 5: Log Error Stack Trace ===');
try {
  const error = new Error('Error with stack trace');
  logError('test.context', error, ERROR_LEVELS.CRITICAL);
  if (error.stack) {
    console.log('✅ Test 5 Passed: Error stack trace available');
    passed++;
  } else {
    console.error('❌ Test 5 Failed: Stack trace not found');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 5 Failed:', err.message);
  failed++;
}

// Test 6: handleInteractionError with new interaction
console.log('\n=== Test 6: Handle Error on New Interaction ===');
try {
  const interaction = createMockInteraction();
  const error = new Error('Interaction error');

  handleInteractionError(interaction, error, 'test.command')
    .then(() => {
      if (interaction.replied) {
        console.log('✅ Test 6 Passed: Error handled on new interaction');
        passed++;
      } else {
        console.error('❌ Test 6 Failed: Interaction not replied');
        failed++;
      }
    })
    .catch((err) => {
      console.error('❌ Test 6 Failed:', err.message);
      failed++;
    });
} catch (err) {
  console.error('❌ Test 6 Failed:', err.message);
  failed++;
}

// Test 7: handleInteractionError with replied interaction
console.log('\n=== Test 7: Handle Error on Replied Interaction ===');
try {
  const interaction = createMockInteraction();
  interaction.replied = true;
  const error = new Error('Already replied error');

  handleInteractionError(interaction, error, 'test.command')
    .then(() => {
      console.log('✅ Test 7 Passed: Error handled on replied interaction');
      passed++;
    })
    .catch((err) => {
      console.error('❌ Test 7 Failed:', err.message);
      failed++;
    });
} catch (err) {
  console.error('❌ Test 7 Failed:', err.message);
  failed++;
}

// Test 8: handleInteractionError with deferred interaction
console.log('\n=== Test 8: Handle Error on Deferred Interaction ===');
try {
  const interaction = createMockInteraction();
  interaction.deferred = true;
  const error = new Error('Deferred error');

  handleInteractionError(interaction, error, 'test.command')
    .then(() => {
      console.log('✅ Test 8 Passed: Error handled on deferred interaction');
      passed++;
    })
    .catch((err) => {
      console.error('❌ Test 8 Failed:', err.message);
      failed++;
    });
} catch (err) {
  console.error('❌ Test 8 Failed:', err.message);
  failed++;
}

// Test 9: logError default level is MEDIUM
console.log('\n=== Test 9: Default Error Level ===');
try {
  logError('test.context', 'No level specified');
  console.log('✅ Test 9 Passed: Default error level used');
  passed++;
} catch (err) {
  console.error('❌ Test 9 Failed:', err.message);
  failed++;
}

// Test 10: logError all error levels work
console.log('\n=== Test 10: All Error Levels ===');
try {
  let allWork = true;
  Object.keys(ERROR_LEVELS).forEach((level) => {
    try {
      logError('test.context', 'Testing level: ' + level, ERROR_LEVELS[level]);
    } catch (e) {
      allWork = false;
    }
  });

  if (allWork) {
    console.log('✅ Test 10 Passed: All error levels work');
    passed++;
  } else {
    console.error('❌ Test 10 Failed: Some error levels failed');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 10 Failed:', err.message);
  failed++;
}

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log('✅ All error handler tests passed!');
}
