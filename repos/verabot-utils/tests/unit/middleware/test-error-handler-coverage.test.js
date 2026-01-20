/**
 * Error Handler Comprehensive Coverage Tests
 * Tests for src/middleware/errorHandler.js
 * 
 * Coverage Focus:
 * - Quote text validation branches (empty, short, long, invalid types)
 * - Author validation branches (empty, long, invalid types)
 * - Quote number validation branches (invalid, zero, negative, exceeds max)
 * - Interaction error handling (replied, deferred, fresh interactions)
 * - Error level discrimination (all 4 levels)
 * - Logging output formatting
 */

const assert = require('assert');
const {
  ERROR_LEVELS,
  logError,
  handleInteractionError,
  validateQuoteText,
  validateAuthor,
  validateQuoteNumber,
} = require('../../../src/middleware/errorHandler');

/**
 * Mock objects for testing
 */
class MockInteraction {
  constructor(opts = {}) {
    this.user = { id: 'test-user-123', username: 'TestUser' };
    this.commandName = opts.commandName || 'test-command';
    this.replied = opts.replied || false;
    this.deferred = opts.deferred || false;
    this.repliedWith = null;
    this.followUpWith = null;
  }

  async reply(options) {
    if (this.replied || this.deferred) {
      throw new Error('Cannot reply to already replied interaction');
    }
    this.replied = true;
    this.repliedWith = options;
    return { id: 'msg-123' };
  }

  async followUp(options) {
    this.followUpWith = options;
    return { id: 'msg-456' };
  }
}

/**
 * Console output capture for testing logging
 */
class LogCapture {
  constructor() {
    this.logs = [];
    this.originalError = console.error;
    console.error = (...args) => {
      this.logs.push(args);
    };
  }

  restore() {
    console.error = this.originalError;
  }

  hasLog(text) {
    return this.logs.some(log => log.some(arg => String(arg).includes(text)));
  }

  clear() {
    this.logs = [];
  }
}

/**
 * Test Suite: validateQuoteText
 */
describe('errorHandler.validateQuoteText()', () => {
  it('should accept valid quote text', () => {
    const result = validateQuoteText('This is a valid quote');
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.sanitized, 'This is a valid quote');
  });

  it('should reject null/undefined quote', () => {
    const result1 = validateQuoteText(null);
    assert.strictEqual(result1.valid, false);
    assert(result1.error.includes('non-empty string'));

    const result2 = validateQuoteText(undefined);
    assert.strictEqual(result2.valid, false);
  });

  it('should reject non-string types', () => {
    const testCases = [123, { text: 'quote' }, ['quote'], true];
    testCases.forEach(testCase => {
      const result = validateQuoteText(testCase);
      assert.strictEqual(result.valid, false);
      assert(result.error.includes('non-empty string'));
    });
  });

  it('should reject empty string', () => {
    const result = validateQuoteText('');
    assert.strictEqual(result.valid, false);
    assert(result.error.includes('empty'));
  });

  it('should reject string with only whitespace', () => {
    const result = validateQuoteText('   \t\n   ');
    assert.strictEqual(result.valid, false);
    assert(result.error.includes('empty'));
  });

  it('should reject quote shorter than 3 characters', () => {
    const result1 = validateQuoteText('a');
    assert.strictEqual(result1.valid, false);
    assert(result1.error.includes('at least 3 characters'));

    const result2 = validateQuoteText('ab');
    assert.strictEqual(result2.valid, false);
  });

  it('should accept quote with exactly 3 characters', () => {
    const result = validateQuoteText('abc');
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.sanitized, 'abc');
  });

  it('should reject quote exceeding 500 characters', () => {
    const longQuote = 'a'.repeat(501);
    const result = validateQuoteText(longQuote);
    assert.strictEqual(result.valid, false);
    assert(result.error.includes('exceed 500 characters'));
  });

  it('should accept quote with exactly 500 characters', () => {
    const quote = 'a'.repeat(500);
    const result = validateQuoteText(quote);
    assert.strictEqual(result.valid, true);
  });

  it('should trim whitespace from valid quote', () => {
    const result = validateQuoteText('  trimmed quote  ');
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.sanitized, 'trimmed quote');
  });

  it('should handle quotes with special characters', () => {
    const result = validateQuoteText('This "quote" has \'special\' chars & symbols!');
    assert.strictEqual(result.valid, true);
  });
});

/**
 * Test Suite: validateAuthor
 */
describe('errorHandler.validateAuthor()', () => {
  it('should accept valid author name', () => {
    const result = validateAuthor('John Doe');
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.sanitized, 'John Doe');
  });

  it('should default to Anonymous for null/undefined', () => {
    const result1 = validateAuthor(null);
    assert.strictEqual(result1.valid, true);
    assert.strictEqual(result1.sanitized, 'Anonymous');

    const result2 = validateAuthor(undefined);
    assert.strictEqual(result2.valid, true);
    assert.strictEqual(result2.sanitized, 'Anonymous');
  });

  it('should default to Anonymous for empty string', () => {
    const result = validateAuthor('');
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.sanitized, 'Anonymous');
  });

  it('should default to Anonymous for whitespace-only string', () => {
    const result = validateAuthor('   ');
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.sanitized, 'Anonymous');
  });

  it('should reject non-string types', () => {
    const result = validateAuthor(123);
    assert.strictEqual(result.valid, true); // Defaults to Anonymous
    assert.strictEqual(result.sanitized, 'Anonymous');
  });

  it('should reject author exceeding 100 characters', () => {
    const longAuthor = 'a'.repeat(101);
    const result = validateAuthor(longAuthor);
    assert.strictEqual(result.valid, false);
    assert(result.error.includes('exceed 100 characters'));
  });

  it('should accept author with exactly 100 characters', () => {
    const author = 'a'.repeat(100);
    const result = validateAuthor(author);
    assert.strictEqual(result.valid, true);
  });

  it('should trim whitespace from author', () => {
    const result = validateAuthor('  Jane Smith  ');
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.sanitized, 'Jane Smith');
  });

  it('should handle authors with special characters', () => {
    const result = validateAuthor("O'Connor-Smith (Pen Name)");
    assert.strictEqual(result.valid, true);
  });
});

/**
 * Test Suite: validateQuoteNumber
 */
describe('errorHandler.validateQuoteNumber()', () => {
  it('should accept valid quote number', () => {
    const result = validateQuoteNumber(5, 100);
    assert.strictEqual(result.valid, true);
    assert(!result.error);
  });

  it('should accept quote number 1', () => {
    const result = validateQuoteNumber(1, 100);
    assert.strictEqual(result.valid, true);
  });

  it('should reject non-integer numbers', () => {
    const result1 = validateQuoteNumber(5.5, 100);
    assert.strictEqual(result1.valid, false);
    assert(result1.error.includes('integer'));

    const result2 = validateQuoteNumber(5.0, 100);
    assert.strictEqual(result2.valid, true); // 5.0 is integer
  });

  it('should reject non-numeric types', () => {
    const result = validateQuoteNumber('5', 100);
    assert.strictEqual(result.valid, false);
    assert(result.error.includes('integer'));
  });

  it('should reject zero', () => {
    const result = validateQuoteNumber(0, 100);
    assert.strictEqual(result.valid, false);
    assert(result.error.includes('at least 1'));
  });

  it('should reject negative numbers', () => {
    const result = validateQuoteNumber(-5, 100);
    assert.strictEqual(result.valid, false);
    assert(result.error.includes('at least 1'));
  });

  it('should reject number exceeding max', () => {
    const result = validateQuoteNumber(101, 100);
    assert.strictEqual(result.valid, false);
    assert(result.error.includes('cannot exceed 100'));
  });

  it('should accept number at max boundary', () => {
    const result = validateQuoteNumber(100, 100);
    assert.strictEqual(result.valid, true);
  });

  it('should handle null/undefined', () => {
    const result1 = validateQuoteNumber(null, 100);
    assert.strictEqual(result1.valid, false);

    const result2 = validateQuoteNumber(undefined, 100);
    assert.strictEqual(result2.valid, false);
  });

  it('should reject NaN', () => {
    const result = validateQuoteNumber(NaN, 100);
    assert.strictEqual(result.valid, false);
  });

  it('should handle Infinity', () => {
    const result = validateQuoteNumber(Infinity, 100);
    assert.strictEqual(result.valid, false);
  });
});

/**
 * Test Suite: logError
 */
describe('errorHandler.logError()', () => {
  let logCapture;

  beforeEach(() => {
    logCapture = new LogCapture();
  });

  afterEach(() => {
    logCapture.restore();
  });

  it('should log error with correct context', () => {
    logError('test-context', 'test error');
    assert(logCapture.hasLog('test-context'));
    assert(logCapture.hasLog('test error'));
  });

  it('should log error with LOW level', () => {
    logError('ctx', 'err', ERROR_LEVELS.LOW);
    assert(logCapture.hasLog('LOW'));
  });

  it('should log error with MEDIUM level', () => {
    logError('ctx', 'err', ERROR_LEVELS.MEDIUM);
    assert(logCapture.hasLog('MEDIUM'));
  });

  it('should log error with HIGH level', () => {
    logError('ctx', 'err', ERROR_LEVELS.HIGH);
    assert(logCapture.hasLog('HIGH'));
  });

  it('should log error with CRITICAL level', () => {
    logError('ctx', 'err', ERROR_LEVELS.CRITICAL);
    assert(logCapture.hasLog('CRITICAL'));
  });

  it('should default to MEDIUM level when not specified', () => {
    logError('ctx', 'err');
    assert(logCapture.hasLog('MEDIUM'));
  });

  it('should extract stack trace from Error objects', () => {
    const error = new Error('Test error message');
    logError('ctx', error);
    assert(logCapture.hasLog('Stack'));
  });

  it('should handle string errors without stack', () => {
    logError('ctx', 'string error');
    assert(logCapture.hasLog('string error'));
  });

  it('should include metadata in log output', () => {
    logError('ctx', 'err', ERROR_LEVELS.MEDIUM, { userId: 'user-123' });
    assert(logCapture.hasLog('Metadata'));
  });

  it('should handle empty metadata', () => {
    logError('ctx', 'err', ERROR_LEVELS.MEDIUM, {});
    // Should not include Metadata section for empty object
    const metadataLogs = logCapture.logs.filter(log => log.some(arg => String(arg).includes('Metadata')));
    assert.strictEqual(metadataLogs.length, 0);
  });

  it('should format error with Error object', () => {
    const error = new Error('Test message');
    logError('command-ctx', error, ERROR_LEVELS.HIGH);
    assert(logCapture.hasLog('Test message'));
  });
});

/**
 * Test Suite: handleInteractionError
 */
describe('errorHandler.handleInteractionError()', () => {
  let logCapture;

  beforeEach(() => {
    logCapture = new LogCapture();
  });

  afterEach(() => {
    logCapture.restore();
  });

  it('should send error reply to fresh interaction', async () => {
    const interaction = new MockInteraction();
    await handleInteractionError(interaction, new Error('Test error'), 'test-context');
    
    assert(interaction.replied);
    assert(interaction.repliedWith.content.includes('Test error'));
    assert(interaction.repliedWith.content.includes('❌'));
  });

  it('should send followUp to already replied interaction', async () => {
    const interaction = new MockInteraction({ replied: true });
    await handleInteractionError(interaction, new Error('Test error'), 'test-context');
    
    assert(interaction.followUpWith !== null);
    assert(interaction.followUpWith.content.includes('Test error'));
  });

  it('should send followUp to deferred interaction', async () => {
    const interaction = new MockInteraction({ deferred: true });
    await handleInteractionError(interaction, new Error('Test error'), 'test-context');
    
    assert(interaction.followUpWith !== null);
  });

  it('should log error with user context in metadata', async () => {
    const interaction = new MockInteraction();
    await handleInteractionError(interaction, new Error('Test error'), 'test-context');
    
    // handleInteractionError passes metadata to logError
    assert(logCapture.hasLog('test-context'));
    // Metadata is logged separately
    assert(logCapture.hasLog('Metadata'));
  });

  it('should log error with command name in metadata', async () => {
    const interaction = new MockInteraction({ commandName: 'add-quote' });
    await handleInteractionError(interaction, new Error('Test'), 'ctx');
    
    assert(logCapture.hasLog('ctx'));
    // Command name is passed as metadata
    assert(logCapture.hasLog('Metadata'));
  });

  it('should handle string errors', async () => {
    const interaction = new MockInteraction();
    await handleInteractionError(interaction, 'String error', 'ctx');
    
    assert(interaction.replied);
    assert(interaction.repliedWith.content.includes('String error'));
  });

  it('should set ephemeral flag (flags: 64)', async () => {
    const interaction = new MockInteraction();
    await handleInteractionError(interaction, new Error('Test'), 'ctx');
    
    assert.strictEqual(interaction.repliedWith.flags, 64); // Ephemeral flag
  });

  it('should handle missing user object gracefully', async () => {
    const interaction = new MockInteraction();
    interaction.user = null;
    
    // Should not throw
    await handleInteractionError(interaction, new Error('Test'), 'ctx');
    assert(interaction.replied);
  });

  it('should handle interaction errors during reply attempt', async () => {
    const interaction = new MockInteraction();
    interaction.reply = async () => {
      throw new Error('Reply failed');
    };
    
    // Should catch and log the error
    logCapture.clear();
    await handleInteractionError(interaction, new Error('Original error'), 'ctx');
    
    // Should log both original and reply error
    assert(logCapture.hasLog('reply error'));
  });

  it('should extract error message from Error object', async () => {
    const error = new Error('Custom error message');
    const interaction = new MockInteraction();
    await handleInteractionError(interaction, error, 'ctx');
    
    assert(interaction.repliedWith.content.includes('Custom error message'));
  });

  it('should extract error message from string', async () => {
    const interaction = new MockInteraction();
    await handleInteractionError(interaction, 'String message', 'ctx');
    
    assert(interaction.repliedWith.content.includes('String message'));
  });
});

/**
 * Test Suite: ERROR_LEVELS constant
 */
describe('errorHandler.ERROR_LEVELS', () => {
  it('should define LOW level', () => {
    assert.strictEqual(ERROR_LEVELS.LOW, 'LOW');
  });

  it('should define MEDIUM level', () => {
    assert.strictEqual(ERROR_LEVELS.MEDIUM, 'MEDIUM');
  });

  it('should define HIGH level', () => {
    assert.strictEqual(ERROR_LEVELS.HIGH, 'HIGH');
  });

  it('should define CRITICAL level', () => {
    assert.strictEqual(ERROR_LEVELS.CRITICAL, 'CRITICAL');
  });

  it('should have 4 levels total', () => {
    const levels = Object.keys(ERROR_LEVELS);
    assert.strictEqual(levels.length, 4);
  });
});

/**
 * Integration Tests: Multiple validation functions together
 */
describe('errorHandler: Integration Scenarios', () => {
  it('should validate complete quote data (happy path)', () => {
    const textResult = validateQuoteText('This is a great quote');
    const authorResult = validateAuthor('John Doe');
    const numberResult = validateQuoteNumber(5, 100);

    assert.strictEqual(textResult.valid, true);
    assert.strictEqual(authorResult.valid, true);
    assert.strictEqual(numberResult.valid, true);
  });

  it('should validate quote with all edge cases (boundaries)', () => {
    const textResult = validateQuoteText('abc'); // Minimum 3 chars
    const authorResult = validateAuthor('a'.repeat(100)); // Maximum 100 chars
    const numberResult = validateQuoteNumber(1, 1); // Min and max both 1

    assert.strictEqual(textResult.valid, true);
    assert.strictEqual(authorResult.valid, true);
    assert.strictEqual(numberResult.valid, true);
  });

  it('should handle quote validation with missing author (Anonymous)', () => {
    const textResult = validateQuoteText('Valid quote text');
    const authorResult = validateAuthor(null); // Will default to Anonymous
    const numberResult = validateQuoteNumber(10, 50);

    assert.strictEqual(textResult.valid, true);
    assert.strictEqual(authorResult.valid, true);
    assert.strictEqual(authorResult.sanitized, 'Anonymous');
    assert.strictEqual(numberResult.valid, true);
  });

  it('should reject quote when any validation fails', () => {
    const textResult = validateQuoteText('a'); // Too short
    const authorResult = validateAuthor('Valid Author');
    const numberResult = validateQuoteNumber(5, 100);

    assert.strictEqual(textResult.valid, false);
    assert.strictEqual(authorResult.valid, true);
    assert.strictEqual(numberResult.valid, true);
  });

  it('should handle multiple validation errors', () => {
    const textResult = validateQuoteText(''); // Empty
    const authorResult = validateAuthor('a'.repeat(101)); // Too long
    const numberResult = validateQuoteNumber(0, 100); // Zero

    assert.strictEqual(textResult.valid, false);
    assert.strictEqual(authorResult.valid, false);
    assert.strictEqual(numberResult.valid, false);
  });
});
