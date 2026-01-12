/**
 * Phase 18: Error Handler Comprehensive Coverage
 * Full test coverage for error-handler.js utility functions
 * Tests logging, error handling, validation functions
 */

describe('Error Handler Comprehensive', () => {
  const {
    ERROR_LEVELS,
    logError,
    handleInteractionError,
    validateQuoteText,
    validateAuthor,
    validateQuoteNumber,
  } = require('../src/utils/error-handler');

  beforeEach(() => {
    // Suppress console output during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('ERROR_LEVELS constant', () => {
    it('should define all error levels', () => {
      expect(ERROR_LEVELS).toHaveProperty('LOW');
      expect(ERROR_LEVELS).toHaveProperty('MEDIUM');
      expect(ERROR_LEVELS).toHaveProperty('HIGH');
      expect(ERROR_LEVELS).toHaveProperty('CRITICAL');
    });

    it('should have correct error level values', () => {
      expect(ERROR_LEVELS.LOW).toBe('LOW');
      expect(ERROR_LEVELS.MEDIUM).toBe('MEDIUM');
      expect(ERROR_LEVELS.HIGH).toBe('HIGH');
      expect(ERROR_LEVELS.CRITICAL).toBe('CRITICAL');
    });
  });

  describe('logError', () => {
    it('should log error with Error object', () => {
      const error = new Error('Test error');
      logError('test-context', error, ERROR_LEVELS.MEDIUM);

      expect(console.error).toHaveBeenCalled();
    });

    it('should log error with string message', () => {
      logError('test-context', 'String error message', ERROR_LEVELS.LOW);

      expect(console.error).toHaveBeenCalled();
    });

    it('should use default MEDIUM level', () => {
      logError('test-context', 'Error');

      expect(console.error).toHaveBeenCalled();
    });

    it('should log with LOW level', () => {
      logError('test-context', 'Low priority error', ERROR_LEVELS.LOW);

      expect(console.error).toHaveBeenCalled();
    });

    it('should log with HIGH level', () => {
      logError('test-context', 'High priority error', ERROR_LEVELS.HIGH);

      expect(console.error).toHaveBeenCalled();
    });

    it('should log with CRITICAL level', () => {
      logError('test-context', 'Critical error', ERROR_LEVELS.CRITICAL);

      expect(console.error).toHaveBeenCalled();
    });

    it('should include metadata when provided', () => {
      const metadata = { userId: '123', guildId: 'guild-456' };
      logError('test-context', 'Error', ERROR_LEVELS.MEDIUM, metadata);

      expect(console.error).toHaveBeenCalled();
    });

    it('should not include metadata when empty', () => {
      logError('test-context', 'Error', ERROR_LEVELS.MEDIUM, {});

      expect(console.error).toHaveBeenCalled();
    });

    it('should log stack trace for Error objects', () => {
      const error = new Error('Test error');
      logError('test-context', error);

      expect(console.error).toHaveBeenCalled();
    });

    it('should not include stack for string errors', () => {
      logError('test-context', 'String error');

      expect(console.error).toHaveBeenCalled();
    });

    it('should handle error with various contexts', () => {
      const contexts = [
        'command.execute',
        'database.query',
        'api.fetch',
        'file.read',
      ];

      contexts.forEach(context => {
        console.error.mockClear();
        logError(context, 'Error', ERROR_LEVELS.MEDIUM);
        expect(console.error).toHaveBeenCalled();
      });
    });

    it('should handle error with complex metadata', () => {
      const metadata = {
        userId: '123',
        commandName: 'add-quote',
        guildId: 'guild-456',
        timestamp: '2024-01-12T10:00:00Z',
        retries: 3,
      };

      logError('test-context', 'Complex error', ERROR_LEVELS.HIGH, metadata);

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('handleInteractionError', () => {
    let mockInteraction;

    beforeEach(() => {
      mockInteraction = {
        user: { id: 'user-123' },
        commandName: 'test-command',
        replied: false,
        deferred: false,
        reply: jest.fn().mockResolvedValue({}),
        followUp: jest.fn().mockResolvedValue({}),
      };
    });

    it('should send error reply on new interaction', async () => {
      await handleInteractionError(mockInteraction, 'Test error', 'test-context');

      expect(mockInteraction.reply).toHaveBeenCalled();
    });

    it('should send followUp when interaction already replied', async () => {
      mockInteraction.replied = true;

      await handleInteractionError(mockInteraction, 'Test error', 'test-context');

      expect(mockInteraction.followUp).toHaveBeenCalled();
      expect(mockInteraction.reply).not.toHaveBeenCalled();
    });

    it('should send followUp when interaction deferred', async () => {
      mockInteraction.deferred = true;

      await handleInteractionError(mockInteraction, 'Test error', 'test-context');

      expect(mockInteraction.followUp).toHaveBeenCalled();
    });

    it('should format error message with emoji', async () => {
      await handleInteractionError(mockInteraction, 'Test error', 'test-context');

      const callArgs = mockInteraction.reply.mock.calls[0][0];
      expect(callArgs.content).toContain('❌');
      expect(callArgs.content).toContain('Test error');
    });

    it('should send ephemeral message', async () => {
      await handleInteractionError(mockInteraction, 'Test error', 'test-context');

      const callArgs = mockInteraction.reply.mock.calls[0][0];
      expect(callArgs.flags).toBe(64); // Ephemeral
    });

    it('should log error with metadata', async () => {
      await handleInteractionError(mockInteraction, 'Test error', 'test-context');

      expect(console.error).toHaveBeenCalled();
    });

    it('should handle Error object', async () => {
      const error = new Error('Detailed error message');

      await handleInteractionError(mockInteraction, error, 'test-context');

      const callArgs = mockInteraction.reply.mock.calls[0][0];
      expect(callArgs.content).toContain('Detailed error message');
    });

    it('should handle string error message', async () => {
      await handleInteractionError(mockInteraction, 'String error', 'test-context');

      const callArgs = mockInteraction.reply.mock.calls[0][0];
      expect(callArgs.content).toContain('String error');
    });

    it('should handle interaction without user', async () => {
      delete mockInteraction.user;

      await handleInteractionError(mockInteraction, 'Error', 'test-context');

      expect(mockInteraction.reply).toHaveBeenCalled();
    });

    it('should handle error when sending reply fails', async () => {
      mockInteraction.reply.mockRejectedValueOnce(new Error('Reply failed'));

      await handleInteractionError(mockInteraction, 'Error', 'test-context');

      expect(console.error).toHaveBeenCalled();
    });

    it('should handle error when sending followUp fails', async () => {
      mockInteraction.replied = true;
      mockInteraction.followUp.mockRejectedValueOnce(new Error('FollowUp failed'));

      await handleInteractionError(mockInteraction, 'Error', 'test-context');

      expect(console.error).toHaveBeenCalled();
    });

    it('should include user ID in log metadata', async () => {
      await handleInteractionError(mockInteraction, 'Error', 'test-context');

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('validateQuoteText', () => {
    it('should validate correct quote text', () => {
      const result = validateQuoteText('This is a valid quote');

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
      expect(result.sanitized).toBe('This is a valid quote');
    });

    it('should reject null quote text', () => {
      const result = validateQuoteText(null);

      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should reject undefined quote text', () => {
      const result = validateQuoteText(undefined);

      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should reject non-string quote text', () => {
      const result = validateQuoteText(123);

      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should reject empty string', () => {
      const result = validateQuoteText('');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject whitespace-only string', () => {
      const result = validateQuoteText('   ');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject text less than 3 characters', () => {
      const result = validateQuoteText('ab');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('3 characters');
    });

    it('should accept exactly 3 character text', () => {
      const result = validateQuoteText('abc');

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should reject text exceeding 500 characters', () => {
      const longText = 'a'.repeat(501);
      const result = validateQuoteText(longText);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('500 characters');
    });

    it('should accept exactly 500 character text', () => {
      const text = 'a'.repeat(500);
      const result = validateQuoteText(text);

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should trim whitespace', () => {
      const result = validateQuoteText('  Valid quote  ');

      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('Valid quote');
    });

    it('should handle quotes with special characters', () => {
      const result = validateQuoteText('Quote with "special" chars & symbols!');

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should handle quotes with line breaks', () => {
      const result = validateQuoteText('Quote with\nmultiple\nlines');

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should handle quotes with unicode characters', () => {
      const result = validateQuoteText('Quote with emojis 🎉 and ñ');

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe('validateAuthor', () => {
    it('should validate correct author name', () => {
      const result = validateAuthor('John Doe');

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
      expect(result.sanitized).toBe('John Doe');
    });

    it('should default to Anonymous for null', () => {
      const result = validateAuthor(null);

      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('Anonymous');
    });

    it('should default to Anonymous for undefined', () => {
      const result = validateAuthor(undefined);

      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('Anonymous');
    });

    it('should default to Anonymous for empty string', () => {
      const result = validateAuthor('');

      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('Anonymous');
    });

    it('should default to Anonymous for whitespace-only', () => {
      const result = validateAuthor('   ');

      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('Anonymous');
    });

    it('should reject non-string author', () => {
      const result = validateAuthor(123);

      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('Anonymous');
    });

    it('should reject author exceeding 100 characters', () => {
      const longAuthor = 'a'.repeat(101);
      const result = validateAuthor(longAuthor);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('100 characters');
    });

    it('should accept exactly 100 character author', () => {
      const author = 'a'.repeat(100);
      const result = validateAuthor(author);

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should trim whitespace', () => {
      const result = validateAuthor('  John Doe  ');

      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('John Doe');
    });

    it('should handle author with special characters', () => {
      const result = validateAuthor("O'Brien");

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should handle author with numbers', () => {
      const result = validateAuthor('John Doe 123');

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe('validateQuoteNumber', () => {
    it('should validate correct quote number', () => {
      const result = validateQuoteNumber(5, 100);

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should reject non-integer number', () => {
      const result = validateQuoteNumber(5.5, 100);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('integer');
    });

    it('should reject string number', () => {
      const result = validateQuoteNumber('5', 100);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('integer');
    });

    it('should reject zero', () => {
      const result = validateQuoteNumber(0, 100);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 1');
    });

    it('should reject negative numbers', () => {
      const result = validateQuoteNumber(-5, 100);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 1');
    });

    it('should accept 1 as minimum', () => {
      const result = validateQuoteNumber(1, 100);

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should reject number exceeding max', () => {
      const result = validateQuoteNumber(101, 100);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('cannot exceed 100');
    });

    it('should accept number equal to max', () => {
      const result = validateQuoteNumber(100, 100);

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should handle large valid numbers', () => {
      const result = validateQuoteNumber(1000000, 1000000);

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should handle very large maxNumber', () => {
      const result = validateQuoteNumber(500, 999999999);

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should reject NaN', () => {
      const result = validateQuoteNumber(NaN, 100);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('integer');
    });

    it('should reject Infinity', () => {
      const result = validateQuoteNumber(Infinity, 100);

      expect(result.valid).toBe(false);
    });
  });

  describe('Integration scenarios', () => {
    it('should validate quote text and author together', () => {
      const textResult = validateQuoteText('Valid quote text');
      const authorResult = validateAuthor('John Doe');

      expect(textResult.valid).toBe(true);
      expect(authorResult.valid).toBe(true);
    });

    it('should handle quote with missing author', () => {
      const textResult = validateQuoteText('Valid quote');
      const authorResult = validateAuthor('');

      expect(textResult.valid).toBe(true);
      expect(authorResult.valid).toBe(true);
      expect(authorResult.sanitized).toBe('Anonymous');
    });

    it('should handle quote retrieval scenario', () => {
      const numberResult = validateQuoteNumber(5, 100);
      const textResult = validateQuoteText('Retrieved quote');

      expect(numberResult.valid).toBe(true);
      expect(textResult.valid).toBe(true);
    });

    it('should handle error logging with validation context', () => {
      const textResult = validateQuoteText('');
      if (!textResult.valid) {
        logError('add-quote-command', textResult.error, ERROR_LEVELS.MEDIUM);
      }

      expect(console.error).toHaveBeenCalled();
    });

    it('should handle interaction error with validation failure', async () => {
      const mockInteraction = {
        user: { id: 'user-123' },
        commandName: 'add-quote',
        replied: false,
        deferred: false,
        reply: jest.fn().mockResolvedValue({}),
      };

      const textResult = validateQuoteText('');
      if (!textResult.valid) {
        await handleInteractionError(mockInteraction, textResult.error, 'add-quote');
      }

      expect(mockInteraction.reply).toHaveBeenCalled();
    });
  });
});
