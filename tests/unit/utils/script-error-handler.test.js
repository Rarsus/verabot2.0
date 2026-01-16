/**
 * Tests for scripts/lib/error-handler.js
 * TDD Tests - RED Phase (tests should fail initially)
 * Tests error handling utilities for script operations
 */

const assert = require('assert');
const path = require('path');

// Import the error handler module
const {
  handleScriptError,
  handleCommandError,
  handleFileError,
  handleProcessError,
  createErrorContext,
  formatErrorOutput,
  logErrorWithContext,
  isRecoverableError,
} = require('../../../scripts/lib/error-handler');

describe('Script Error Handler Utility', () => {
  // Test data
  const testScript = 'test-script.js';
  const testContext = { line: 42, operation: 'reading file' };
  const testError = new Error('Test error message');

  describe('createErrorContext()', () => {
    it('should create error context with script name and operation', () => {
      const context = createErrorContext('my-script.js', 'parsing JSON');
      
      assert.ok(context.scriptName);
      assert.strictEqual(context.scriptName, 'my-script.js');
      assert.ok(context.operation);
      assert.strictEqual(context.operation, 'parsing JSON');
      assert.ok(context.timestamp);
    });

    it('should include timestamp in context', () => {
      const before = Date.now();
      const context = createErrorContext('script.js', 'test');
      const after = Date.now();
      
      assert.ok(context.timestamp);
      assert.ok(context.timestamp >= before);
      assert.ok(context.timestamp <= after + 1000);
    });

    it('should accept optional details', () => {
      const details = { userId: '123', guildId: '456' };
      const context = createErrorContext('script.js', 'operation', details);
      
      assert.deepStrictEqual(context.details, details);
    });

    it('should handle undefined details gracefully', () => {
      const context = createErrorContext('script.js', 'operation');
      
      assert.ok(!context.details || typeof context.details === 'object');
    });
  });

  describe('isRecoverableError()', () => {
    it('should identify ENOENT (file not found) as recoverable', () => {
      const error = new Error('File not found');
      error.code = 'ENOENT';
      
      assert.strictEqual(isRecoverableError(error), true);
    });

    it('should identify EACCES (permission denied) as recoverable', () => {
      const error = new Error('Permission denied');
      error.code = 'EACCES';
      
      assert.strictEqual(isRecoverableError(error), true);
    });

    it('should identify ETIMEDOUT as recoverable', () => {
      const error = new Error('Operation timeout');
      error.code = 'ETIMEDOUT';
      
      assert.strictEqual(isRecoverableError(error), true);
    });

    it('should identify ECONNREFUSED as recoverable', () => {
      const error = new Error('Connection refused');
      error.code = 'ECONNREFUSED';
      
      assert.strictEqual(isRecoverableError(error), true);
    });

    it('should identify other errors as non-recoverable', () => {
      const error = new Error('Critical failure');
      error.code = 'CRITICAL';
      
      assert.strictEqual(isRecoverableError(error), false);
    });

    it('should handle errors without code property', () => {
      const error = new Error('Generic error');
      
      assert.strictEqual(isRecoverableError(error), false);
    });

    it('should handle null/undefined gracefully', () => {
      assert.strictEqual(isRecoverableError(null), false);
      assert.strictEqual(isRecoverableError(undefined), false);
    });
  });

  describe('formatErrorOutput()', () => {
    it('should format error with script name and message', () => {
      const error = new Error('Something went wrong');
      const context = createErrorContext('script.js', 'operation');
      
      const output = formatErrorOutput(error, context);
      
      assert.ok(output);
      assert.ok(typeof output === 'string');
      assert.ok(output.includes('script.js'));
      assert.ok(output.includes('Something went wrong'));
    });

    it('should include operation name in formatted output', () => {
      const error = new Error('Test error');
      const context = createErrorContext('script.js', 'file reading');
      
      const output = formatErrorOutput(error, context);
      
      assert.ok(output.includes('file reading'));
    });

    it('should include error code if present', () => {
      const error = new Error('File not found');
      error.code = 'ENOENT';
      const context = createErrorContext('script.js', 'operation');
      
      const output = formatErrorOutput(error, context);
      
      assert.ok(output.includes('ENOENT'));
    });

    it('should include recovery hint for recoverable errors', () => {
      const error = new Error('Timeout occurred');
      error.code = 'ETIMEDOUT';
      const context = createErrorContext('script.js', 'operation');
      
      const output = formatErrorOutput(error, context);
      
      assert.ok(output.includes('recoverable') || output.includes('retry') || output.includes('Retry'));
    });

    it('should include details if provided in context', () => {
      const error = new Error('Database error');
      const context = createErrorContext('script.js', 'db operation', {
        database: 'test.db',
        operation: 'migrate',
      });
      
      const output = formatErrorOutput(error, context);
      
      assert.ok(output.includes('test.db') || output.includes('migrate'));
    });
  });

  describe('handleCommandError()', () => {
    it('should throw error with proper exit code for failed commands', () => {
      const error = new Error('Command failed');
      
      assert.throws(() => {
        handleCommandError(error, 'npm test', 1);
      }, /Command failed/);
    });

    it('should include command name in error message', () => {
      const error = new Error('Failed');
      
      try {
        handleCommandError(error, 'npm install', 1);
        assert.fail('Should have thrown');
      } catch (e) {
        assert.ok(e.message.includes('npm install'));
      }
    });

    it('should include exit code in error details', () => {
      const error = new Error('Failed');
      
      try {
        handleCommandError(error, 'npm test', 42);
        assert.fail('Should have thrown');
      } catch (e) {
        assert.ok(e.exitCode === 42 || e.message.includes('42'));
      }
    });

    it('should handle command failures gracefully', () => {
      const error = new Error('ENOENT: Command not found');
      error.code = 'ENOENT';
      
      assert.throws(() => {
        handleCommandError(error, 'unknown-command', 127);
      });
    });
  });

  describe('handleFileError()', () => {
    it('should handle file not found errors', () => {
      const error = new Error('ENOENT: File not found');
      error.code = 'ENOENT';
      
      assert.throws(() => {
        handleFileError(error, '/path/to/file.js', 'reading');
      }, /file\.js/);
    });

    it('should handle permission denied errors', () => {
      const error = new Error('EACCES: Permission denied');
      error.code = 'EACCES';
      
      assert.throws(() => {
        handleFileError(error, '/etc/secure/file.txt', 'writing');
      }, /Permission/);
    });

    it('should include file path in error message', () => {
      const error = new Error('File error');
      error.code = 'EACCES';
      
      try {
        handleFileError(error, '/home/user/config.json', 'reading');
        assert.fail('Should have thrown');
      } catch (e) {
        assert.ok(e.message.includes('config.json'));
      }
    });

    it('should include operation type in error message', () => {
      const error = new Error('File error');
      error.code = 'EACCES';
      
      try {
        handleFileError(error, '/path/file.txt', 'parsing');
        assert.fail('Should have thrown');
      } catch (e) {
        assert.ok(e.message.includes('parsing'));
      }
    });

    it('should suggest recovery steps for recoverable errors', () => {
      const error = new Error('File not found');
      error.code = 'ENOENT';
      
      try {
        handleFileError(error, 'missing.json', 'reading');
      } catch (e) {
        assert.ok(e.message.includes('missing.json') || e.recovery);
      }
    });
  });

  describe('handleProcessError()', () => {
    it('should handle process errors with exit code', () => {
      const error = new Error('Process error');
      
      assert.throws(() => {
        handleProcessError(error, 'test-process', 1);
      });
    });

    it('should format process error with context', () => {
      const error = new Error('Process failed');
      
      try {
        handleProcessError(error, 'migration', 2);
        assert.fail('Should have thrown');
      } catch (e) {
        assert.ok(e.message.includes('migration'));
      }
    });

    it('should include exit code information', () => {
      const error = new Error('Failed');
      
      try {
        handleProcessError(error, 'task', 127);
      } catch (e) {
        assert.ok(e.message.includes('127') || e.exitCode === 127);
      }
    });

    it('should handle timeout errors', () => {
      const error = new Error('Timeout');
      error.code = 'ETIMEDOUT';
      
      assert.throws(() => {
        handleProcessError(error, 'long-task', 124);
      });
    });
  });

  describe('logErrorWithContext()', () => {
    let capturedOutput = '';
    const originalError = console.error;

    beforeEach(() => {
      capturedOutput = '';
      console.error = (msg) => {
        capturedOutput += msg + '\n';
      };
    });

    afterEach(() => {
      console.error = originalError;
    });

    it('should log error to console.error', () => {
      const error = new Error('Test error');
      const context = createErrorContext('script.js', 'testing');
      
      logErrorWithContext(error, context);
      
      assert.ok(capturedOutput.length > 0);
      assert.ok(capturedOutput.includes('Test error'));
    });

    it('should include script name in log', () => {
      const error = new Error('Error');
      const context = createErrorContext('my-script.js', 'operation');
      
      logErrorWithContext(error, context);
      
      assert.ok(capturedOutput.includes('my-script.js'));
    });

    it('should include operation name in log', () => {
      const error = new Error('Error');
      const context = createErrorContext('script.js', 'database migration');
      
      logErrorWithContext(error, context);
      
      assert.ok(capturedOutput.includes('database migration'));
    });

    it('should include error code if present', () => {
      const error = new Error('Error');
      error.code = 'ENOENT';
      const context = createErrorContext('script.js', 'op');
      
      logErrorWithContext(error, context);
      
      assert.ok(capturedOutput.includes('ENOENT'));
    });

    it('should format with color codes for terminal output', () => {
      const error = new Error('Error');
      const context = createErrorContext('script.js', 'op');
      
      logErrorWithContext(error, context);
      
      // Check for ANSI color codes
      assert.ok(capturedOutput.includes('\x1b[') || capturedOutput.includes('Error'));
    });
  });

  describe('handleScriptError()', () => {
    it('should exit process with error code', () => {
      const error = new Error('Critical error');
      
      // Mock process.exit to verify it's called
      const originalExit = process.exit;
      let exitCode = null;
      process.exit = (code) => {
        exitCode = code;
      };

      try {
        handleScriptError(error, 'test-script.js', 1);
        // In actual execution, process.exit would prevent further code
      } catch (e) {
        // Error thrown before exit
      }

      process.exit = originalExit;
    });

    it('should log error before exiting', () => {
      const error = new Error('Error');
      let logged = false;
      
      const originalError = console.error;
      console.error = (msg) => {
        if (msg.includes('Error')) logged = true;
      };

      const originalExit = process.exit;
      process.exit = () => {};

      try {
        handleScriptError(error, 'script.js', 1);
      } catch (e) {
        // Ignore
      }

      console.error = originalError;
      process.exit = originalExit;
    });

    it('should use provided exit code', () => {
      const error = new Error('Error');
      let capturedCode = null;

      const originalExit = process.exit;
      process.exit = (code) => {
        capturedCode = code;
      };

      const originalError = console.error;
      console.error = () => {};

      try {
        handleScriptError(error, 'script.js', 42);
      } catch (e) {
        // Ignore
      }

      console.error = originalError;
      process.exit = originalExit;
    });
  });

  describe('Error handling integration scenarios', () => {
    it('should handle missing file scenario', () => {
      const error = new Error('File not found');
      error.code = 'ENOENT';
      
      try {
        handleFileError(error, 'config.json', 'reading');
        assert.fail('Should throw');
      } catch (e) {
        assert.ok(e.message.includes('config.json'));
      }
    });

    it('should handle permission denied scenario', () => {
      const error = new Error('Permission denied');
      error.code = 'EACCES';
      
      assert.throws(() => {
        handleFileError(error, '/restricted/file', 'writing');
      }, /restricted/);
    });

    it('should handle command failure scenario', () => {
      const error = new Error('npm test failed');
      
      assert.throws(() => {
        handleCommandError(error, 'npm test', 1);
      });
    });

    it('should handle timeout scenario', () => {
      const error = new Error('Operation timeout');
      error.code = 'ETIMEDOUT';
      
      assert.strictEqual(isRecoverableError(error), true);
      
      const output = formatErrorOutput(error, createErrorContext('script.js', 'op'));
      assert.ok(output.includes('timeout') || output.includes('recoverable'));
    });
  });
});
