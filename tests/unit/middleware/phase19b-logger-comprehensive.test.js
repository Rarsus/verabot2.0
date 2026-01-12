/**
 * Phase 19b: Logger Middleware Comprehensive Coverage
 * Tests for centralized logging functionality
 */

const assert = require('assert');
const { log, LOG_LEVELS } = require('../src/middleware/logger');

describe('Logger Middleware', () => {
  // Capture console.log output
  let originalLog;
  let capturedOutput;

  beforeEach(() => {
    capturedOutput = [];
    originalLog = console.log;
    console.log = (...args) => {
      capturedOutput.push(args);
    };
  });

  afterEach(() => {
    console.log = originalLog;
    capturedOutput = [];
  });

  describe('LOG_LEVELS constants', () => {
    it('should have DEBUG level', () => {
      assert.strictEqual(LOG_LEVELS.DEBUG, 'DEBUG');
    });

    it('should have INFO level', () => {
      assert.strictEqual(LOG_LEVELS.INFO, 'INFO');
    });

    it('should have WARN level', () => {
      assert.strictEqual(LOG_LEVELS.WARN, 'WARN');
    });

    it('should have ERROR level', () => {
      assert.strictEqual(LOG_LEVELS.ERROR, 'ERROR');
    });

    it('should have exactly 4 log levels', () => {
      assert.strictEqual(Object.keys(LOG_LEVELS).length, 4);
    });
  });

  describe('log() - Debug Level', () => {
    it('should log DEBUG level message', () => {
      log(LOG_LEVELS.DEBUG, 'TestContext', 'Test message');

      assert.strictEqual(capturedOutput.length, 1);
      assert.ok(capturedOutput[0][0].includes('DEBUG'));
      assert.ok(capturedOutput[0][0].includes('TestContext'));
      assert.ok(capturedOutput[0][0].includes('Test message'));
    });

    it('should include timestamp in DEBUG output', () => {
      log(LOG_LEVELS.DEBUG, 'TestContext', 'Test message');

      const output = capturedOutput[0][0];
      assert.ok(output.includes('['));
      assert.ok(output.match(/\d{4}-\d{2}-\d{2}T/)); // ISO date format
    });

    it('should include additional data with DEBUG message', () => {
      log(LOG_LEVELS.DEBUG, 'TestContext', 'Test message', { userId: '123', action: 'create' });

      assert.strictEqual(capturedOutput.length, 1);
      assert.ok(capturedOutput[0][1]?.userId === '123');
      assert.ok(capturedOutput[0][1]?.action === 'create');
    });
  });

  describe('log() - Info Level', () => {
    it('should log INFO level message', () => {
      log(LOG_LEVELS.INFO, 'TestContext', 'Test message');

      assert.strictEqual(capturedOutput.length, 1);
      assert.ok(capturedOutput[0][0].includes('INFO'));
    });

    it('should format INFO message correctly', () => {
      log(LOG_LEVELS.INFO, 'QuoteSystem', 'Quote added');

      const output = capturedOutput[0][0];
      assert.ok(output.includes('[INFO]'));
      assert.ok(output.includes('[QuoteSystem]'));
      assert.ok(output.includes('Quote added'));
    });
  });

  describe('log() - Warning Level', () => {
    it('should log WARN level message', () => {
      log(LOG_LEVELS.WARN, 'TestContext', 'Test message');

      assert.strictEqual(capturedOutput.length, 1);
      assert.ok(capturedOutput[0][0].includes('WARN'));
    });

    it('should log warning with context', () => {
      log(LOG_LEVELS.WARN, 'ValidationService', 'Invalid input detected');

      const output = capturedOutput[0][0];
      assert.ok(output.includes('WARN'));
      assert.ok(output.includes('ValidationService'));
      assert.ok(output.includes('Invalid input detected'));
    });
  });

  describe('log() - Error Level', () => {
    it('should log ERROR level message', () => {
      log(LOG_LEVELS.ERROR, 'TestContext', 'Test message');

      assert.strictEqual(capturedOutput.length, 1);
      assert.ok(capturedOutput[0][0].includes('ERROR'));
    });

    it('should include error details', () => {
      const errorData = {
        errorCode: 'E001',
        errorMessage: 'Database connection failed',
        stack: 'Error: Connection timeout',
      };
      log(LOG_LEVELS.ERROR, 'DatabaseService', 'Connection error', errorData);

      assert.strictEqual(capturedOutput.length, 1);
      assert.ok(capturedOutput[0][0].includes('ERROR'));
      assert.strictEqual(capturedOutput[0][1].errorCode, 'E001');
      assert.strictEqual(capturedOutput[0][1].errorMessage, 'Database connection failed');
    });
  });

  describe('log() - Context Parameter', () => {
    it('should include context in log output', () => {
      log(LOG_LEVELS.INFO, 'CommandHandler', 'Command executed');

      assert.ok(capturedOutput[0][0].includes('CommandHandler'));
    });

    it('should handle context with special characters', () => {
      log(LOG_LEVELS.INFO, 'Service:Handler:SubContext', 'Test');

      assert.ok(capturedOutput[0][0].includes('Service:Handler:SubContext'));
    });

    it('should handle context with hyphens', () => {
      log(LOG_LEVELS.INFO, 'quote-service', 'Test');

      assert.ok(capturedOutput[0][0].includes('quote-service'));
    });

    it('should handle context with numbers', () => {
      log(LOG_LEVELS.INFO, 'Service123', 'Test');

      assert.ok(capturedOutput[0][0].includes('Service123'));
    });

    it('should handle context with slashes', () => {
      log(LOG_LEVELS.INFO, 'middleware/auth', 'Test');

      assert.ok(capturedOutput[0][0].includes('middleware/auth'));
    });
  });

  describe('log() - Message Parameter', () => {
    it('should include message text', () => {
      log(LOG_LEVELS.INFO, 'Context', 'User login successful');

      assert.ok(capturedOutput[0][0].includes('User login successful'));
    });

    it('should handle messages with special characters', () => {
      log(LOG_LEVELS.INFO, 'Context', 'Error: "Invalid input" @ line 42');

      assert.ok(capturedOutput[0][0].includes('Error: "Invalid input" @ line 42'));
    });

    it('should handle very long messages', () => {
      const longMessage = 'A'.repeat(500);
      log(LOG_LEVELS.INFO, 'Context', longMessage);

      assert.ok(capturedOutput[0][0].includes(longMessage));
    });

    it('should handle empty message', () => {
      log(LOG_LEVELS.INFO, 'Context', '');

      assert.strictEqual(capturedOutput.length, 1);
      // Should still log, just with empty message
      assert.ok(capturedOutput[0][0].includes('INFO'));
    });

    it('should handle message with newlines', () => {
      const messageWithNewlines = 'Line 1\nLine 2\nLine 3';
      log(LOG_LEVELS.INFO, 'Context', messageWithNewlines);

      assert.ok(capturedOutput[0][0].includes(messageWithNewlines));
    });
  });

  describe('log() - Data Parameter', () => {
    it('should handle optional data parameter', () => {
      log(LOG_LEVELS.INFO, 'Context', 'Message'); // No data parameter

      assert.strictEqual(capturedOutput.length, 1);
      assert.ok(capturedOutput[0][0].includes('Message'));
    });

    it('should log data object with single property', () => {
      log(LOG_LEVELS.INFO, 'Context', 'Message', { userId: '123' });

      assert.strictEqual(capturedOutput[0][1].userId, '123');
    });

    it('should log data object with multiple properties', () => {
      const data = {
        userId: '123',
        username: 'testuser',
        action: 'login',
        timestamp: '2024-01-01T00:00:00Z',
      };
      log(LOG_LEVELS.INFO, 'Context', 'Message', data);

      assert.strictEqual(capturedOutput[0][1].userId, '123');
      assert.strictEqual(capturedOutput[0][1].username, 'testuser');
      assert.strictEqual(capturedOutput[0][1].action, 'login');
      assert.strictEqual(capturedOutput[0][1].timestamp, '2024-01-01T00:00:00Z');
    });

    it('should handle data with nested objects', () => {
      const data = {
        user: { id: '123', name: 'Test' },
        guild: { id: '456', name: 'TestGuild' },
      };
      log(LOG_LEVELS.INFO, 'Context', 'Message', data);

      assert.strictEqual(capturedOutput[0][1].user.id, '123');
      assert.strictEqual(capturedOutput[0][1].guild.name, 'TestGuild');
    });

    it('should handle data with arrays', () => {
      const data = {
        items: ['a', 'b', 'c'],
        numbers: [1, 2, 3],
      };
      log(LOG_LEVELS.INFO, 'Context', 'Message', data);

      assert.deepStrictEqual(capturedOutput[0][1].items, ['a', 'b', 'c']);
      assert.deepStrictEqual(capturedOutput[0][1].numbers, [1, 2, 3]);
    });

    it('should handle data with null values', () => {
      log(LOG_LEVELS.INFO, 'Context', 'Message', { value: null });

      assert.strictEqual(capturedOutput[0][1].value, null);
    });

    it('should handle data with undefined values', () => {
      log(LOG_LEVELS.INFO, 'Context', 'Message', { value: undefined });

      assert.strictEqual(capturedOutput[0][1].value, undefined);
    });

    it('should handle data with boolean values', () => {
      log(LOG_LEVELS.INFO, 'Context', 'Message', { success: true, failed: false });

      assert.strictEqual(capturedOutput[0][1].success, true);
      assert.strictEqual(capturedOutput[0][1].failed, false);
    });

    it('should handle data with numeric values', () => {
      log(LOG_LEVELS.INFO, 'Context', 'Message', { count: 42, ratio: 3.14, zero: 0 });

      assert.strictEqual(capturedOutput[0][1].count, 42);
      assert.strictEqual(capturedOutput[0][1].ratio, 3.14);
      assert.strictEqual(capturedOutput[0][1].zero, 0);
    });
  });

  describe('log() - Output Format', () => {
    it('should format output with brackets for each section', () => {
      log(LOG_LEVELS.INFO, 'Context', 'Message');

      const output = capturedOutput[0][0];
      // Should have format: [timestamp] [level] [context] message
      const bracketCount = (output.match(/\[/g) || []).length;
      assert.ok(bracketCount >= 3); // At least 3 opening brackets
    });

    it('should include ISO timestamp format', () => {
      log(LOG_LEVELS.INFO, 'Context', 'Message');

      const output = capturedOutput[0][0];
      // ISO format: 2024-01-01T00:00:00.000Z
      assert.ok(output.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/));
    });

    it('should separate level and context with brackets', () => {
      log(LOG_LEVELS.WARN, 'TestContext', 'Message');

      const output = capturedOutput[0][0];
      assert.ok(output.includes('[WARN]'));
      assert.ok(output.includes('[TestContext]'));
    });
  });

  describe('log() - Multiple Calls', () => {
    it('should log multiple messages sequentially', () => {
      log(LOG_LEVELS.INFO, 'Context', 'Message 1');
      log(LOG_LEVELS.INFO, 'Context', 'Message 2');
      log(LOG_LEVELS.INFO, 'Context', 'Message 3');

      assert.strictEqual(capturedOutput.length, 3);
      assert.ok(capturedOutput[0][0].includes('Message 1'));
      assert.ok(capturedOutput[1][0].includes('Message 2'));
      assert.ok(capturedOutput[2][0].includes('Message 3'));
    });

    it('should maintain separate data for each log call', () => {
      log(LOG_LEVELS.INFO, 'Context', 'Message 1', { id: 1 });
      log(LOG_LEVELS.INFO, 'Context', 'Message 2', { id: 2 });
      log(LOG_LEVELS.INFO, 'Context', 'Message 3', { id: 3 });

      assert.strictEqual(capturedOutput[0][1].id, 1);
      assert.strictEqual(capturedOutput[1][1].id, 2);
      assert.strictEqual(capturedOutput[2][1].id, 3);
    });

    it('should handle mixed log levels', () => {
      log(LOG_LEVELS.DEBUG, 'Context', 'Debug message');
      log(LOG_LEVELS.INFO, 'Context', 'Info message');
      log(LOG_LEVELS.WARN, 'Context', 'Warn message');
      log(LOG_LEVELS.ERROR, 'Context', 'Error message');

      assert.strictEqual(capturedOutput.length, 4);
      assert.ok(capturedOutput[0][0].includes('DEBUG'));
      assert.ok(capturedOutput[1][0].includes('INFO'));
      assert.ok(capturedOutput[2][0].includes('WARN'));
      assert.ok(capturedOutput[3][0].includes('ERROR'));
    });
  });

  describe('Edge Cases', () => {
    it('should handle numeric context', () => {
      log(LOG_LEVELS.INFO, '123', 'Message');

      assert.ok(capturedOutput[0][0].includes('123'));
    });

    it('should handle context with spaces', () => {
      log(LOG_LEVELS.INFO, 'Multiple Word Context', 'Message');

      assert.ok(capturedOutput[0][0].includes('Multiple Word Context'));
    });

    it('should handle data with circular references gracefully', () => {
      const data = { a: 1 };
      data.self = data; // Circular reference

      // Should not throw
      assert.doesNotThrow(() => {
        log(LOG_LEVELS.INFO, 'Context', 'Message', data);
      });

      assert.strictEqual(capturedOutput.length, 1);
    });

    it('should handle data with Date objects', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      log(LOG_LEVELS.INFO, 'Context', 'Message', { date });

      assert.ok(capturedOutput[0][1].date instanceof Date);
    });

    it('should handle data with Error objects', () => {
      const error = new Error('Test error');
      log(LOG_LEVELS.ERROR, 'Context', 'Message', { error });

      assert.ok(capturedOutput[0][1].error instanceof Error);
      assert.strictEqual(capturedOutput[0][1].error.message, 'Test error');
    });

    it('should handle unicode characters in all parameters', () => {
      log(LOG_LEVELS.INFO, '上下文', '消息', { 键: '值', emoji: '😀' });

      assert.ok(capturedOutput[0][0].includes('上下文'));
      assert.ok(capturedOutput[0][0].includes('消息'));
      assert.strictEqual(capturedOutput[0][1].键, '值');
      assert.strictEqual(capturedOutput[0][1].emoji, '😀');
    });
  });

  describe('Integration Scenarios', () => {
    it('should log complete workflow', () => {
      log(LOG_LEVELS.INFO, 'CommandHandler', 'Command started', { command: 'add-quote' });
      log(LOG_LEVELS.DEBUG, 'ValidationService', 'Validating input');
      log(LOG_LEVELS.INFO, 'QuoteService', 'Quote saved', { quoteId: 123, author: 'Test' });

      assert.strictEqual(capturedOutput.length, 3);
      assert.ok(capturedOutput[0][0].includes('Command started'));
      assert.ok(capturedOutput[1][0].includes('Validating input'));
      assert.ok(capturedOutput[2][0].includes('Quote saved'));
    });

    it('should log error workflow', () => {
      log(LOG_LEVELS.INFO, 'DatabaseService', 'Attempting connection');
      log(LOG_LEVELS.WARN, 'DatabaseService', 'Connection slow', { duration: 2000 });
      log(LOG_LEVELS.ERROR, 'DatabaseService', 'Connection failed', {
        errorCode: 'ECONNREFUSED',
        message: 'Connection refused',
      });

      assert.strictEqual(capturedOutput.length, 3);
      assert.ok(capturedOutput[0][0].includes('Attempting connection'));
      assert.ok(capturedOutput[1][0].includes('Connection slow'));
      assert.ok(capturedOutput[2][0].includes('Connection failed'));
    });

    it('should log performance monitoring', () => {
      const operations = [
        { op: 'fetch', duration: 45 },
        { op: 'parse', duration: 12 },
        { op: 'process', duration: 78 },
        { op: 'save', duration: 34 },
      ];

      operations.forEach((op) => {
        log(LOG_LEVELS.DEBUG, 'PerformanceMonitor', `Operation completed`, op);
      });

      assert.strictEqual(capturedOutput.length, 4);
      assert.ok(capturedOutput[0][1].op === 'fetch');
      assert.ok(capturedOutput[1][1].op === 'parse');
      assert.ok(capturedOutput[2][1].op === 'process');
      assert.ok(capturedOutput[3][1].op === 'save');
    });
  });
});
