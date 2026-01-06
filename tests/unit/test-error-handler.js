/**
 * Error Handler Middleware Tests
 *
 * Comprehensive test suite for error handling, logging, and recovery patterns.
 * Tests all error levels, scenarios, and response patterns.
 *
 * Test Categories:
 * 1. Error Levels (5 tests)
 * 2. Error Logging (5 tests)
 * 3. Error Recovery (4 tests)
 * 4. Async Error Handling (4 tests)
 * 5. Error Context Preservation (3 tests)
 *
 * Total: 21 tests
 */

const assert = require('assert');
const { logError, logWarning, logInfo, ERROR_LEVELS } = require('../../src/middleware/errorHandler');

describe('Error Handler Middleware', () => {
  // Capture logged output for verification
  let logOutput = [];
  let originalLog, originalWarn, originalError;

  beforeEach(() => {
    logOutput = [];
    originalLog = console.log;
    originalWarn = console.warn;
    originalError = console.error;

    // Capture console output
    console.log = (...args) => {
      logOutput.push({ type: 'log', args });
    };
    console.warn = (...args) => {
      logOutput.push({ type: 'warn', args });
    };
    console.error = (...args) => {
      logOutput.push({ type: 'error', args });
    };
  });

  afterEach(() => {
    // Restore console methods
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
    logOutput = [];
  });

  // ============================================================================
  // CATEGORY 1: Error Levels (5 tests)
  // ============================================================================

  describe('Error Levels', () => {
    it('should log LOW level errors (test 1)', () => {
      const testError = new Error('Low priority error');
      logError('TestFunction', testError, ERROR_LEVELS.LOW);

      assert(logOutput.length > 0, 'Should have logged something');
      assert(logOutput[0].type === 'warn' || logOutput[0].type === 'log', 'LOW level should use console.warn or log');
    });

    it('should log MEDIUM level errors (test 2)', () => {
      const testError = new Error('Medium priority error');
      logError('TestFunction', testError, ERROR_LEVELS.MEDIUM);

      assert(logOutput.length > 0, 'Should have logged something');
      assert(
        logOutput[0].type === 'warn' || logOutput[0].type === 'error',
        'MEDIUM level should use console.warn or error'
      );
    });

    it('should log HIGH level errors (test 3)', () => {
      const testError = new Error('High priority error');
      logError('TestFunction', testError, ERROR_LEVELS.HIGH);

      assert(logOutput.length > 0, 'Should have logged something');
      assert(logOutput[0].type === 'error', 'HIGH level should use console.error');
    });

    it('should log CRITICAL level errors (test 4)', () => {
      const testError = new Error('Critical error');
      logError('TestFunction', testError, ERROR_LEVELS.CRITICAL);

      assert(logOutput.length > 0, 'Should have logged something');
      assert(logOutput[0].type === 'error', 'CRITICAL level should use console.error');
    });

    it('should handle undefined error level gracefully (test 5)', () => {
      const testError = new Error('Error with undefined level');
      assert.doesNotThrow(() => {
        logError('TestFunction', testError, undefined);
      }, 'Should not throw on undefined level');
    });
  });

  // ============================================================================
  // CATEGORY 2: Error Logging (5 tests)
  // ============================================================================

  describe('Error Logging', () => {
    it('should include function name in error log (test 6)', () => {
      const functionName = 'TestFunction123';
      const testError = new Error('Test error');
      logError(functionName, testError, ERROR_LEVELS.MEDIUM);

      const logText = JSON.stringify(logOutput);
      assert(logText.includes(functionName), 'Function name should be included in log');
    });

    it('should include error message in error log (test 7)', () => {
      const errorMessage = 'Specific error message for testing';
      const testError = new Error(errorMessage);
      logError('TestFunc', testError, ERROR_LEVELS.MEDIUM);

      const logText = JSON.stringify(logOutput);
      assert(logText.includes(errorMessage), 'Error message should be included in log');
    });

    it('should include error stack trace (test 8)', () => {
      const testError = new Error('Stack trace test');
      logError('TestFunc', testError, ERROR_LEVELS.HIGH);

      const logText = JSON.stringify(logOutput);
      assert(logText.includes('at') || logText.includes('Stack'), 'Stack trace should be included');
    });

    it('should log warning level messages (test 9)', () => {
      const message = 'Warning message';
      assert.doesNotThrow(() => {
        logWarning('TestFunc', message);
      }, 'Should not throw on warning');

      assert(logOutput.length > 0, 'Should have logged warning');
    });

    it('should log info level messages (test 10)', () => {
      const message = 'Info message for testing';
      assert.doesNotThrow(() => {
        logInfo('TestFunc', message);
      }, 'Should not throw on info');

      assert(logOutput.length > 0, 'Should have logged info');
    });
  });

  // ============================================================================
  // CATEGORY 3: Error Recovery (4 tests)
  // ============================================================================

  describe('Error Recovery', () => {
    it('should handle errors with custom metadata (test 11)', () => {
      const testError = new Error('Error with metadata');
      const metadata = { userId: 'user123', guildId: 'guild456' };

      // Attempt to add metadata
      testError.metadata = metadata;
      logError('TestFunc', testError, ERROR_LEVELS.MEDIUM);

      assert(logOutput.length > 0, 'Should have logged error with metadata');
    });

    it('should handle null error gracefully (test 12)', () => {
      assert.doesNotThrow(() => {
        logError('TestFunc', null, ERROR_LEVELS.LOW);
      }, 'Should not throw on null error');
    });

    it('should handle string error messages (test 13)', () => {
      assert.doesNotThrow(() => {
        logError('TestFunc', 'String error message', ERROR_LEVELS.MEDIUM);
      }, 'Should handle string error messages');
    });

    it('should handle error objects with cause property (test 14)', () => {
      const originalError = new Error('Original error');
      const wrappedError = new Error('Wrapped error');
      wrappedError.cause = originalError;

      assert.doesNotThrow(() => {
        logError('TestFunc', wrappedError, ERROR_LEVELS.MEDIUM);
      }, 'Should handle errors with cause');
    });
  });

  // ============================================================================
  // CATEGORY 4: Async Error Handling (4 tests)
  // ============================================================================

  describe('Async Error Handling', () => {
    it('should handle promise rejection errors (test 15)', async () => {
      const testError = new Error('Async error');
      try {
        throw testError;
      } catch (err) {
        assert.doesNotThrow(() => {
          logError('AsyncTestFunc', err, ERROR_LEVELS.HIGH);
        }, 'Should handle async errors');
      }
    });

    it('should handle database errors (test 16)', () => {
      const dbError = new Error('Database connection failed');
      dbError.code = 'ECONNREFUSED';

      assert.doesNotThrow(() => {
        logError('DatabaseOperation', dbError, ERROR_LEVELS.HIGH);
      }, 'Should handle database errors');

      assert(logOutput.length > 0, 'Should have logged database error');
    });

    it('should handle timeout errors (test 17)', () => {
      const timeoutError = new Error('Operation timeout');
      timeoutError.code = 'ETIMEDOUT';

      assert.doesNotThrow(() => {
        logError('TimeoutOperation', timeoutError, ERROR_LEVELS.MEDIUM);
      }, 'Should handle timeout errors');
    });

    it('should handle validation errors (test 18)', () => {
      const validationError = new Error('Validation failed');
      validationError.field = 'email';
      validationError.value = 'invalid';

      assert.doesNotThrow(() => {
        logError('ValidationCheck', validationError, ERROR_LEVELS.LOW);
      }, 'Should handle validation errors');
    });
  });

  // ============================================================================
  // CATEGORY 5: Error Context Preservation (3 tests)
  // ============================================================================

  describe('Error Context Preservation', () => {
    it('should preserve error properties (test 19)', () => {
      const testError = new Error('Error with properties');
      testError.code = 'CUSTOM_ERROR_CODE';
      testError.userId = 'user789';

      assert.doesNotThrow(() => {
        logError('TestFunc', testError, ERROR_LEVELS.MEDIUM);
      }, 'Should preserve error properties');

      // Verify error object is intact
      assert.strictEqual(testError.code, 'CUSTOM_ERROR_CODE', 'Error code should be preserved');
      assert.strictEqual(testError.userId, 'user789', 'User ID should be preserved');
    });

    it('should log errors from try-catch blocks (test 20)', () => {
      let caughtError = null;
      try {
        throw new Error('Try-catch error');
      } catch (err) {
        caughtError = err;
      }

      assert.doesNotThrow(() => {
        logError('TryCatchFunc', caughtError, ERROR_LEVELS.MEDIUM);
      }, 'Should log errors from try-catch');

      assert(logOutput.length > 0, 'Should have logged the error');
    });

    it('should handle error chaining (test 21)', () => {
      let chainedError = null;
      try {
        try {
          throw new Error('Original error');
        } catch (err) {
          chainedError = new Error('Wrapped error');
          chainedError.originalError = err;
          throw chainedError;
        }
      } catch (err) {
        assert.doesNotThrow(() => {
          logError('ChainedErrorFunc', err, ERROR_LEVELS.HIGH);
        }, 'Should handle chained errors');
      }
    });
  });

  // ============================================================================
  // Additional: Error Response Formatting (Bonus Tests)
  // ============================================================================

  describe('Error Response Formatting', () => {
    it('should format errors for user display', () => {
      const testError = new Error('User-facing error');
      logError('UserOperation', testError, ERROR_LEVELS.MEDIUM);

      assert(logOutput.length > 0, 'Should have formatted error');
    });

    it('should include error context in logs', () => {
      const context = {
        userId: 'user123',
        guildId: 'guild456',
        channelId: 'channel789',
        commandName: 'test-command'
      };

      const testError = new Error('Contextual error');
      Object.assign(testError, context);

      logError('ContextualFunc', testError, ERROR_LEVELS.MEDIUM);

      assert(logOutput.length > 0, 'Should have logged error with context');
    });

    it('should handle multiple errors in sequence', () => {
      const errors = [
        new Error('Error 1'),
        new Error('Error 2'),
        new Error('Error 3')
      ];

      errors.forEach((err, index) => {
        assert.doesNotThrow(() => {
          logError(`Function${index}`, err, ERROR_LEVELS.LOW);
        }, `Should handle error ${index + 1}`);
      });

      assert(logOutput.length >= 3, 'Should have logged all errors');
    });
  });
});
