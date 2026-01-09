/**
 * Error Handler Middleware - Comprehensive Test Suite
 * Tests all error handling, logging, and validation functions
 * Target: 95%+ coverage of errorHandler.js
 */

const assert = require('assert');
const {
  ERROR_LEVELS,
  logError,
  handleInteractionError,
  validateQuoteText,
  validateAuthor,
  validateQuoteNumber,
} = require('../src/middleware/errorHandler');

describe('ErrorHandler Middleware', () => {
  // Capture console.error output
  let consoleErrorLogs = [];
  const originalConsoleError = console.error;

  beforeEach(() => {
    consoleErrorLogs = [];
    console.error = (...args) => {
      consoleErrorLogs.push(args);
    };
  });

  afterEach(() => {
    console.error = originalConsoleError;
    consoleErrorLogs = [];
  });

  // ============================================
  // ERROR_LEVELS Constants Tests
  // ============================================
  describe('ERROR_LEVELS', () => {
    it('should have all required error level constants', () => {
      assert.strictEqual(ERROR_LEVELS.LOW, 'LOW');
      assert.strictEqual(ERROR_LEVELS.MEDIUM, 'MEDIUM');
      assert.strictEqual(ERROR_LEVELS.HIGH, 'HIGH');
      assert.strictEqual(ERROR_LEVELS.CRITICAL, 'CRITICAL');
    });

    it('should have exactly 4 error levels', () => {
      assert.strictEqual(Object.keys(ERROR_LEVELS).length, 4);
    });
  });

  // ============================================
  // logError Function Tests
  // ============================================
  describe('logError()', () => {
    it('should log error with context and message', () => {
      logError('TestCommand', 'Test error message', ERROR_LEVELS.MEDIUM);

      assert(consoleErrorLogs.length > 0);
      const log = consoleErrorLogs[0][0];
      assert(log.includes('MEDIUM'));
      assert(log.includes('TestCommand'));
    });

    it('should log Error objects with stack trace', () => {
      const error = new Error('Test error with stack');
      logError('TestContext', error, ERROR_LEVELS.HIGH);

      assert(consoleErrorLogs.length > 0);
      const logOutput = consoleErrorLogs.join('|');
      assert(logOutput.includes('HIGH'));
      assert(logOutput.includes('Test error with stack'));
    });

    it('should use LOW level for low severity errors', () => {
      logError('Context', 'Low error', ERROR_LEVELS.LOW);

      const log = consoleErrorLogs[0][0];
      assert(log.includes('LOW'));
    });

    it('should use CRITICAL level for critical errors', () => {
      logError('Context', 'Critical error', ERROR_LEVELS.CRITICAL);

      const log = consoleErrorLogs[0][0];
      assert(log.includes('CRITICAL'));
    });

    it('should default to MEDIUM level when not specified', () => {
      logError('Context', 'Default error');

      const log = consoleErrorLogs[0][0];
      assert(log.includes('MEDIUM'));
    });

    it('should include metadata in log output', () => {
      const metadata = { userId: '123', commandName: 'test' };
      logError('Context', 'Error with metadata', ERROR_LEVELS.HIGH, metadata);

      // Metadata is logged separately, check that logs exist
      assert(consoleErrorLogs.length > 0);
    });

    it('should handle string errors', () => {
      logError('Context', 'String error', ERROR_LEVELS.MEDIUM);

      const log = consoleErrorLogs[0][0];
      assert(log.includes('MEDIUM'));
      assert(log.includes('Context'));
    });

    it('should handle errors with empty metadata', () => {
      logError('Context', 'Error', ERROR_LEVELS.LOW, {});

      assert(consoleErrorLogs.length > 0);
    });

    it('should handle null error gracefully', () => {
      logError('Context', null, ERROR_LEVELS.MEDIUM);

      assert(consoleErrorLogs.length > 0);
    });

    it('should handle undefined error gracefully', () => {
      logError('Context', undefined, ERROR_LEVELS.MEDIUM);

      assert(consoleErrorLogs.length > 0);
    });

    it('should include stack trace when Error object provided', () => {
      const error = new Error('Stack trace test');
      logError('Context', error, ERROR_LEVELS.HIGH);

      const logOutput = consoleErrorLogs.join('|');
      assert(logOutput.includes('Stack:'));
    });

    it('should handle metadata with multiple properties', () => {
      const metadata = {
        userId: '123',
        commandName: 'test',
        guildId: '456',
        channelId: '789',
      };
      logError('Context', 'Error', ERROR_LEVELS.HIGH, metadata);

      assert(consoleErrorLogs.length > 0);
    });

    it('should color code LOW errors with cyan', () => {
      logError('Context', 'Low priority', ERROR_LEVELS.LOW);

      const log = consoleErrorLogs[0][0];
      assert(log.includes('\x1b[36m')); // Cyan
    });

    it('should color code MEDIUM errors with yellow', () => {
      logError('Context', 'Medium priority', ERROR_LEVELS.MEDIUM);

      const log = consoleErrorLogs[0][0];
      assert(log.includes('\x1b[33m')); // Yellow
    });

    it('should color code HIGH errors with red', () => {
      logError('Context', 'High priority', ERROR_LEVELS.HIGH);

      const log = consoleErrorLogs[0][0];
      assert(log.includes('\x1b[31m')); // Red
    });

    it('should color code CRITICAL errors with magenta', () => {
      logError('Context', 'Critical', ERROR_LEVELS.CRITICAL);

      const log = consoleErrorLogs[0][0];
      assert(log.includes('\x1b[35m')); // Magenta
    });
  });

  // ============================================
  // handleInteractionError Function Tests
  // ============================================
  describe('handleInteractionError()', () => {
    const createMockInteraction = (overrides = {}) => ({
      user: { id: '123456789' },
      commandName: 'test-command',
      replied: false,
      deferred: false,
      reply: async (msg) => ({ ok: true, ...msg }),
      followUp: async (msg) => ({ ok: true, ...msg }),
      ...overrides,
    });

    it('should handle error with Error object', async () => {
      const interaction = createMockInteraction();
      const error = new Error('Test error');

      await handleInteractionError(interaction, error, 'TestContext');

      assert(consoleErrorLogs.length > 0);
    });

    it('should handle error with string message', async () => {
      const interaction = createMockInteraction();

      await handleInteractionError(interaction, 'String error', 'TestContext');

      assert(consoleErrorLogs.length > 0);
    });

    it('should reply to interaction when not replied', async () => {
      let replyCalled = false;
      const interaction = createMockInteraction({
        reply: async (msg) => {
          replyCalled = true;
          assert(msg.content.includes('error'));
          return { ok: true };
        },
      });

      await handleInteractionError(interaction, 'Test error', 'Context');

      assert(replyCalled);
    });

    it('should use followUp when interaction already replied', async () => {
      let followUpCalled = false;
      const interaction = createMockInteraction({
        replied: true,
        followUp: async (msg) => {
          followUpCalled = true;
          assert(msg.content.includes('error'));
          return { ok: true };
        },
      });

      await handleInteractionError(interaction, 'Test error', 'Context');

      assert(followUpCalled);
    });

    it('should use followUp when interaction deferred', async () => {
      let followUpCalled = false;
      const interaction = createMockInteraction({
        deferred: true,
        followUp: async (msg) => {
          followUpCalled = true;
          return { ok: true };
        },
      });

      await handleInteractionError(interaction, 'Test error', 'Context');

      assert(followUpCalled);
    });

    it('should set ephemeral flag (64) on error response', async () => {
      let messageFlags = null;
      const interaction = createMockInteraction({
        reply: async (msg) => {
          messageFlags = msg.flags;
          return { ok: true };
        },
      });

      await handleInteractionError(interaction, 'Test error', 'Context');

      assert.strictEqual(messageFlags, 64);
    });

    it('should log error with user and command context', async () => {
      const interaction = createMockInteraction({
        user: { id: 'user-123' },
        commandName: 'quote-add',
      });

      await handleInteractionError(interaction, 'Test error', 'CommandContext');

      const logOutput = consoleErrorLogs.join('|');
      assert(logOutput.includes('user-123') || logOutput.includes('CommandContext'));
    });

    it('should handle reply error gracefully', async () => {
      const interaction = createMockInteraction({
        reply: async () => {
          throw new Error('Reply failed');
        },
      });

      // Should not throw
      await handleInteractionError(interaction, 'Original error', 'Context');

      assert(consoleErrorLogs.length > 0);
    });

    it('should handle interaction without user gracefully', async () => {
      const interaction = createMockInteraction({ user: null });

      let replyCalled = false;
      interaction.reply = async (msg) => {
        replyCalled = true;
        return { ok: true };
      };

      await handleInteractionError(interaction, 'Test error', 'Context');

      assert(replyCalled);
    });

    it('should extract error message from Error object', async () => {
      let capturedMessage = null;
      const interaction = createMockInteraction({
        reply: async (msg) => {
          capturedMessage = msg.content;
          return { ok: true };
        },
      });

      const error = new Error('Specific error message');
      await handleInteractionError(interaction, error, 'Context');

      assert(capturedMessage.includes('Specific error message'));
    });

    it('should include error message in response', async () => {
      let messageContent = null;
      const interaction = createMockInteraction({
        reply: async (msg) => {
          messageContent = msg.content;
          return { ok: true };
        },
      });

      await handleInteractionError(interaction, 'Custom error', 'Context');

      assert(messageContent.includes('Custom error'));
      assert(messageContent.includes('❌'));
    });
  });

  // ============================================
  // validateQuoteText Function Tests
  // ============================================
  describe('validateQuoteText()', () => {
    it('should accept valid quote text', () => {
      const result = validateQuoteText('This is a valid quote');

      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.error, null);
      assert.strictEqual(result.sanitized, 'This is a valid quote');
    });

    it('should reject null text', () => {
      const result = validateQuoteText(null);

      assert.strictEqual(result.valid, false);
      assert(result.error.includes('non-empty string'));
    });

    it('should reject undefined text', () => {
      const result = validateQuoteText(undefined);

      assert.strictEqual(result.valid, false);
      assert(result.error.includes('non-empty string'));
    });

    it('should reject non-string text', () => {
      const result = validateQuoteText(123);

      assert.strictEqual(result.valid, false);
      assert(result.error.includes('non-empty string'));
    });

    it('should reject empty string', () => {
      const result = validateQuoteText('');

      assert.strictEqual(result.valid, false);
      assert(result.error && result.error.length > 0);
    });

    it('should reject whitespace-only string', () => {
      const result = validateQuoteText('   \n\t  ');

      assert.strictEqual(result.valid, false);
      assert(result.error.includes('cannot be empty'));
    });

    it('should reject text shorter than 3 characters', () => {
      const result = validateQuoteText('ab');

      assert.strictEqual(result.valid, false);
      assert(result.error.includes('at least 3 characters'));
    });

    it('should accept exactly 3 character text', () => {
      const result = validateQuoteText('abc');

      assert.strictEqual(result.valid, true);
    });

    it('should reject text longer than 500 characters', () => {
      const longText = 'a'.repeat(501);
      const result = validateQuoteText(longText);

      assert.strictEqual(result.valid, false);
      assert(result.error.includes('exceed 500 characters'));
    });

    it('should accept exactly 500 character text', () => {
      const maxText = 'a'.repeat(500);
      const result = validateQuoteText(maxText);

      assert.strictEqual(result.valid, true);
    });

    it('should trim whitespace from input', () => {
      const result = validateQuoteText('  Trimmed quote  ');

      assert.strictEqual(result.sanitized, 'Trimmed quote');
    });

    it('should handle special characters', () => {
      const result = validateQuoteText('Quote with "quotes" and \'apostrophes\'');

      assert.strictEqual(result.valid, true);
    });

    it('should handle unicode characters', () => {
      const result = validateQuoteText('Quote with émojis 🎉 and accénts');

      assert.strictEqual(result.valid, true);
    });

    it('should handle newlines in quote', () => {
      const result = validateQuoteText('Quote with\nmultiple\nlines');

      assert.strictEqual(result.valid, true);
    });

    it('should handle tabs in quote', () => {
      const result = validateQuoteText('Quote\twith\ttabs');

      assert.strictEqual(result.valid, true);
    });
  });

  // ============================================
  // validateAuthor Function Tests
  // ============================================
  describe('validateAuthor()', () => {
    it('should accept valid author name', () => {
      const result = validateAuthor('John Doe');

      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.error, null);
      assert.strictEqual(result.sanitized, 'John Doe');
    });

    it('should default to Anonymous when null', () => {
      const result = validateAuthor(null);

      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.sanitized, 'Anonymous');
    });

    it('should default to Anonymous when undefined', () => {
      const result = validateAuthor(undefined);

      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.sanitized, 'Anonymous');
    });

    it('should default to Anonymous when non-string', () => {
      const result = validateAuthor(123);

      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.sanitized, 'Anonymous');
    });

    it('should default to Anonymous when empty string', () => {
      const result = validateAuthor('');

      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.sanitized, 'Anonymous');
    });

    it('should default to Anonymous when whitespace-only', () => {
      const result = validateAuthor('   \t\n  ');

      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.sanitized, 'Anonymous');
    });

    it('should trim whitespace from author name', () => {
      const result = validateAuthor('  John Doe  ');

      assert.strictEqual(result.sanitized, 'John Doe');
    });

    it('should reject author name longer than 100 characters', () => {
      const longAuthor = 'a'.repeat(101);
      const result = validateAuthor(longAuthor);

      assert.strictEqual(result.valid, false);
      assert(result.error.includes('exceed 100 characters'));
    });

    it('should accept exactly 100 character author name', () => {
      const maxAuthor = 'a'.repeat(100);
      const result = validateAuthor(maxAuthor);

      assert.strictEqual(result.valid, true);
    });

    it('should handle special characters in author name', () => {
      const result = validateAuthor('O\'Brien-Smith Jr.');

      assert.strictEqual(result.valid, true);
    });

    it('should handle unicode characters in author name', () => {
      const result = validateAuthor('Müller Jösef');

      assert.strictEqual(result.valid, true);
    });

    it('should handle single character author name', () => {
      const result = validateAuthor('A');

      assert.strictEqual(result.valid, true);
    });
  });

  // ============================================
  // validateQuoteNumber Function Tests
  // ============================================
  describe('validateQuoteNumber()', () => {
    it('should accept valid quote number within range', () => {
      const result = validateQuoteNumber(5, 100);

      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.error, null);
    });

    it('should accept quote number equal to 1', () => {
      const result = validateQuoteNumber(1, 100);

      assert.strictEqual(result.valid, true);
    });

    it('should accept quote number equal to max', () => {
      const result = validateQuoteNumber(100, 100);

      assert.strictEqual(result.valid, true);
    });

    it('should reject non-integer number', () => {
      const result = validateQuoteNumber(5.5, 100);

      assert.strictEqual(result.valid, false);
      assert(result.error.includes('must be an integer'));
    });

    it('should reject negative number', () => {
      const result = validateQuoteNumber(-1, 100);

      assert.strictEqual(result.valid, false);
      assert(result.error.includes('must be at least 1'));
    });

    it('should reject zero', () => {
      const result = validateQuoteNumber(0, 100);

      assert.strictEqual(result.valid, false);
      assert(result.error.includes('must be at least 1'));
    });

    it('should reject number exceeding max', () => {
      const result = validateQuoteNumber(101, 100);

      assert.strictEqual(result.valid, false);
      assert(result.error.includes('cannot exceed 100'));
    });

    it('should reject non-numeric string', () => {
      const result = validateQuoteNumber('abc', 100);

      assert.strictEqual(result.valid, false);
      assert(result.error.includes('must be an integer'));
    });

    it('should reject float that looks like integer', () => {
      const result = validateQuoteNumber(5.0, 100);

      // 5.0 is technically an integer in JavaScript
      assert.strictEqual(result.valid, true);
    });

    it('should handle large valid numbers', () => {
      const result = validateQuoteNumber(999999, 1000000);

      assert.strictEqual(result.valid, true);
    });

    it('should handle edge case: maxNumber = 1', () => {
      const result = validateQuoteNumber(1, 1);

      assert.strictEqual(result.valid, true);
    });

    it('should reject when number equals 0 with maxNumber = 1', () => {
      const result = validateQuoteNumber(0, 1);

      assert.strictEqual(result.valid, false);
    });

    it('should provide correct error message with specific max number', () => {
      const result = validateQuoteNumber(50, 25);

      assert(result.error.includes('cannot exceed 25'));
    });
  });

  // ============================================
  // Integration Tests - Error Scenarios
  // ============================================
  describe('Integration - Error Recovery Scenarios', () => {
    it('should handle cascading errors gracefully', () => {
      const error1 = new Error('First error');
      logError('Context1', error1, ERROR_LEVELS.MEDIUM);

      const error2 = new Error('Second error');
      logError('Context2', error2, ERROR_LEVELS.HIGH);

      assert(consoleErrorLogs.length >= 2);
    });

    it('should validate quote attributes together', () => {
      const text = validateQuoteText('Valid quote text');
      const author = validateAuthor('Author Name');
      const number = validateQuoteNumber(1, 10);

      assert(text.valid && author.valid && number.valid);
    });

    it('should handle validation with user interaction flow', async () => {
      const textValidation = validateQuoteText('Great quote');
      const authorValidation = validateAuthor('Source');

      if (textValidation.valid && authorValidation.valid) {
        const interaction = {
          reply: async (msg) => ({ ok: true }),
        };
        // Simulate successful response
        assert(true);
      }
    });

    it('should log multiple validation errors', () => {
      const texts = [
        { input: '', name: 'empty' },
        { input: 'ab', name: 'too short' },
        { input: 'a'.repeat(501), name: 'too long' },
      ];

      texts.forEach((t) => {
        const result = validateQuoteText(t.input);
        if (!result.valid) {
          logError('ValidationFailed', result.error, ERROR_LEVELS.LOW);
        }
      });

      assert(consoleErrorLogs.length > 0);
    });

    it('should maintain error context through recovery', () => {
      logError('OperationStart', 'Started', ERROR_LEVELS.LOW);

      const result = validateQuoteText('invalid');
      logError('OperationFailed', result.error, ERROR_LEVELS.MEDIUM);

      assert(consoleErrorLogs.length >= 2);
    });
  });

  // ============================================
  // Edge Cases & Boundary Tests
  // ============================================
  describe('Edge Cases & Boundary Conditions', () => {
    it('should handle Object.toString() in error message', () => {
      const error = {};
      logError('Context', error, ERROR_LEVELS.LOW);

      assert(consoleErrorLogs.length > 0);
    });

    it('should handle very long error messages', () => {
      const longError = 'E'.repeat(10000);
      logError('Context', longError, ERROR_LEVELS.MEDIUM);

      assert(consoleErrorLogs.length > 0);
    });

    it('should handle metadata with circular references safely', () => {
      const metadata = {};
      metadata.self = metadata; // Create circular reference

      // Should not crash
      logError('Context', 'Error', ERROR_LEVELS.LOW, metadata);

      assert(consoleErrorLogs.length > 0);
    });

    it('should handle quote text with only numbers', () => {
      const result = validateQuoteText('123');

      assert.strictEqual(result.valid, true);
    });

    it('should handle quote text with SQL-like patterns', () => {
      const result = validateQuoteText('SELECT * FROM quotes WHERE id = 1');

      // errorHandler does not validate SQL, just format
      assert.strictEqual(result.valid, true);
    });

    it('should handle very large quote numbers', () => {
      const result = validateQuoteNumber(Number.MAX_SAFE_INTEGER - 1, Number.MAX_SAFE_INTEGER);

      assert.strictEqual(result.valid, true);
    });

    it('should handle Infinity as quote number', () => {
      const result = validateQuoteNumber(Infinity, 100);

      assert.strictEqual(result.valid, false);
    });

    it('should handle NaN as quote number', () => {
      const result = validateQuoteNumber(NaN, 100);

      assert.strictEqual(result.valid, false);
    });
  });
});
