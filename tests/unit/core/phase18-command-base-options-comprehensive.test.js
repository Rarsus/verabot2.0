/**
 * Phase 18: Command Base & Options Comprehensive Coverage
 * Full test coverage for command-base.js and command-options.js
 * Tests command inheritance, error wrapping, option building
 */

// Mock error-handler before requiring command-base
jest.mock('../../src/middleware/errorHandler', () => ({
  logError: jest.fn(),
  ERROR_LEVELS: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL',
  },
}));

// Mock Discord.js before requiring command-options
jest.mock('discord.js', () => ({
  SlashCommandBuilder: jest.fn(function() {
    this.setName = jest.fn(() => this);
    this.setDescription = jest.fn(() => this);
    this.addStringOption = jest.fn(() => this);
    this.addIntegerOption = jest.fn(() => this);
    this.addBooleanOption = jest.fn(() => this);
    return this;
  }),
}));

describe('Command Base & Options Comprehensive', () => {
  describe('Command Base Class', () => {
    let Command;
    let mockError;

    beforeEach(() => {
      jest.resetModules();
      jest.clearAllMocks();
      Command = require('../../src/core/CommandBase');
      mockError = new Error('Test error');
    });

    describe('constructor', () => {
      it('should create a command instance with required config', () => {
        const config = {
          name: 'test-command',
          description: 'A test command',
        };

        const cmd = new Command(config);

        expect(cmd.name).toBe('test-command');
        expect(cmd.description).toBe('A test command');
      });

      it('should set data property from config', () => {
        const mockData = { setName: jest.fn() };
        const config = {
          name: 'test-command',
          description: 'A test command',
          data: mockData,
        };

        const cmd = new Command(config);

        expect(cmd.data).toBe(mockData);
      });

      it('should set options array from config', () => {
        const options = [{ name: 'text', type: 'string' }];
        const config = {
          name: 'test-command',
          description: 'A test command',
          options,
        };

        const cmd = new Command(config);

        expect(cmd.options).toEqual(options);
      });

      it('should use empty options array if not provided', () => {
        const config = {
          name: 'test-command',
          description: 'A test command',
        };

        const cmd = new Command(config);

        expect(cmd.options).toEqual([]);
      });
    });

    describe('wrapError', () => {
      it('should execute function without errors', async () => {
        const cmd = new Command({
          name: 'test',
          description: 'test',
        });

        const mockFn = jest.fn().mockResolvedValue('success');
        const wrapped = cmd.wrapError(mockFn, 'test-context');

        const result = await wrapped();

        expect(result).toBe('success');
        expect(mockFn).toHaveBeenCalled();
      });

      it('should catch and log errors', async () => {
        const { logError } = require('../../src/middleware/errorHandler');
        const cmd = new Command({
          name: 'test',
          description: 'test',
        });

        const mockFn = jest.fn().mockRejectedValue(mockError);
        const wrapped = cmd.wrapError(mockFn, 'test-context');

        await wrapped();

        // logError is mocked, so just verify it was called
        expect(logError).toHaveBeenCalled();
      });

      it('should send error reply on Discord interaction', async () => {
        const cmd = new Command({
          name: 'test',
          description: 'test',
        });

        const mockInteraction = {
          isCommand: jest.fn(() => true),
          isChatInputCommand: jest.fn(() => true),
          replied: false,
          deferred: false,
          reply: jest.fn().mockResolvedValue({}),
        };

        const mockFn = jest.fn().mockRejectedValue(mockError);
        const wrapped = cmd.wrapError(mockFn, 'test-context');

        await wrapped(mockInteraction);

        expect(mockInteraction.reply).toHaveBeenCalled();
      });

      it('should use followUp on deferred interaction', async () => {
        const cmd = new Command({
          name: 'test',
          description: 'test',
        });

        const mockInteraction = {
          isCommand: jest.fn(() => true),
          replied: false,
          deferred: true,
          followUp: jest.fn().mockResolvedValue({}),
        };

        const mockFn = jest.fn().mockRejectedValue(mockError);
        const wrapped = cmd.wrapError(mockFn, 'test-context');

        await wrapped(mockInteraction);

        expect(mockInteraction.followUp).toHaveBeenCalled();
      });

      it('should use followUp on already replied interaction', async () => {
        const cmd = new Command({
          name: 'test',
          description: 'test',
        });

        const mockInteraction = {
          isCommand: jest.fn(() => true),
          replied: true,
          deferred: false,
          followUp: jest.fn().mockResolvedValue({}),
        };

        const mockFn = jest.fn().mockRejectedValue(mockError);
        const wrapped = cmd.wrapError(mockFn, 'test-context');

        await wrapped(mockInteraction);

        expect(mockInteraction.followUp).toHaveBeenCalled();
      });

      it('should handle non-interaction errors without Discord call', async () => {
        const cmd = new Command({
          name: 'test',
          description: 'test',
        });

        const nonInteraction = {};
        const mockFn = jest.fn().mockRejectedValue(mockError);
        const wrapped = cmd.wrapError(mockFn, 'test-context');

        await wrapped(nonInteraction);

        expect(nonInteraction.reply).toBeUndefined();
      });

      it('should send error message with emoji', async () => {
        const cmd = new Command({
          name: 'test',
          description: 'test',
        });

        const mockInteraction = {
          isCommand: jest.fn(() => true),
          replied: false,
          deferred: false,
          reply: jest.fn().mockResolvedValue({}),
        };

        const mockFn = jest.fn().mockRejectedValue(mockError);
        const wrapped = cmd.wrapError(mockFn, 'test-context');

        await wrapped(mockInteraction);

        const callArgs = mockInteraction.reply.mock.calls[0][0];
        expect(callArgs.content).toContain('❌');
        expect(callArgs.content).toContain(mockError.message);
      });

      it('should set ephemeral flag on error messages', async () => {
        const cmd = new Command({
          name: 'test',
          description: 'test',
        });

        const mockInteraction = {
          isCommand: jest.fn(() => true),
          replied: false,
          deferred: false,
          reply: jest.fn().mockResolvedValue({}),
        };

        const mockFn = jest.fn().mockRejectedValue(mockError);
        const wrapped = cmd.wrapError(mockFn, 'test-context');

        await wrapped(mockInteraction);

        const callArgs = mockInteraction.reply.mock.calls[0][0];
        expect(callArgs.flags).toBe(64); // Ephemeral
      });

      it('should handle reply error gracefully', async () => {
        const { logError } = require('../../src/middleware/errorHandler');
        const cmd = new Command({
          name: 'test',
          description: 'test',
        });

        const mockInteraction = {
          isCommand: jest.fn(() => true),
          replied: false,
          deferred: false,
          reply: jest.fn().mockRejectedValue(new Error('Reply failed')),
        };

        const mockFn = jest.fn().mockRejectedValue(mockError);
        const wrapped = cmd.wrapError(mockFn, 'test-context');

        await wrapped(mockInteraction);

        // Verify logError was called
        expect(logError).toHaveBeenCalled();
      });

      it('should pass through returned values from async function', async () => {
        const cmd = new Command({
          name: 'test',
          description: 'test',
        });

        const expectedValue = { id: 123, text: 'quote' };
        const mockFn = jest.fn().mockResolvedValue(expectedValue);
        const wrapped = cmd.wrapError(mockFn, 'test-context');

        const result = await wrapped();

        expect(result).toEqual(expectedValue);
      });

      it('should work with multiple arguments', async () => {
        const cmd = new Command({
          name: 'test',
          description: 'test',
        });

        const mockFn = jest.fn().mockResolvedValue('success');
        const wrapped = cmd.wrapError(mockFn, 'test-context');

        await wrapped('arg1', 'arg2', { arg3: 'value' });

        expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', { arg3: 'value' });
      });
    });

    describe('register', () => {
      it('should wrap execute method', () => {
        const cmd = new Command({
          name: 'test',
          description: 'test',
        });

        const originalExecute = jest.fn();
        cmd.execute = originalExecute;

        cmd.register();

        expect(typeof cmd.execute).toBe('function');
        expect(cmd.execute).not.toBe(originalExecute);
      });

      it('should wrap executeInteraction method', () => {
        const cmd = new Command({
          name: 'test',
          description: 'test',
        });

        const originalExecuteInteraction = jest.fn();
        cmd.executeInteraction = originalExecuteInteraction;

        cmd.register();

        expect(typeof cmd.executeInteraction).toBe('function');
        expect(cmd.executeInteraction).not.toBe(originalExecuteInteraction);
      });

      it('should return this for chaining', () => {
        const cmd = new Command({
          name: 'test',
          description: 'test',
        });

        const result = cmd.register();

        expect(result).toBe(cmd);
      });

      it('should not fail if execute is not defined', () => {
        const cmd = new Command({
          name: 'test',
          description: 'test',
        });

        expect(() => cmd.register()).not.toThrow();
      });

      it('should not fail if executeInteraction is not defined', () => {
        const cmd = new Command({
          name: 'test',
          description: 'test',
        });

        expect(() => cmd.register()).not.toThrow();
      });

      it('should preserve command properties after register', () => {
        const cmd = new Command({
          name: 'test-cmd',
          description: 'Test command',
        });

        cmd.register();

        expect(cmd.name).toBe('test-cmd');
        expect(cmd.description).toBe('Test command');
      });
    });
  });

  describe('Command Options Builder', () => {
    let buildCommandOptions;

    beforeEach(() => {
      jest.resetModules();
      buildCommandOptions = require('../../src/core/CommandOptions');
      jest.clearAllMocks();
    });

    describe('buildCommandOptions', () => {
      it('should create command with no options', () => {
        const result = buildCommandOptions('test', 'Test command', []);

        expect(result).toHaveProperty('data');
        expect(result).toHaveProperty('options');
        expect(result.options).toEqual([]);
      });

      it('should create command with default description', () => {
        const result = buildCommandOptions('test', 'Test command');

        expect(result).toHaveProperty('data');
        expect(result).toHaveProperty('options');
      });

      it('should build string option', () => {
        const options = [
          { name: 'text', type: 'string', description: 'Input text', required: true },
        ];

        const result = buildCommandOptions('test', 'Test', options);

        expect(result.options).toHaveLength(1);
        expect(result.options[0].name).toBe('text');
        expect(result.options[0].type).toBe('string');
      });

      it('should build integer option', () => {
        const options = [
          { name: 'count', type: 'integer', description: 'Number of items', minValue: 1, maxValue: 100 },
        ];

        const result = buildCommandOptions('test', 'Test', options);

        expect(result.options).toHaveLength(1);
        expect(result.options[0].type).toBe('integer');
      });

      it('should build boolean option', () => {
        const options = [
          { name: 'flag', type: 'boolean', description: 'Enable feature' },
        ];

        const result = buildCommandOptions('test', 'Test', options);

        expect(result.options).toHaveLength(1);
        expect(result.options[0].type).toBe('boolean');
      });

      it('should handle multiple options', () => {
        const options = [
          { name: 'text', type: 'string', description: 'Text', required: true },
          { name: 'count', type: 'integer', description: 'Count' },
          { name: 'flag', type: 'boolean', description: 'Flag' },
        ];

        const result = buildCommandOptions('test', 'Test', options);

        expect(result.options).toHaveLength(3);
      });

      it('should preserve required property', () => {
        const options = [
          { name: 'required-text', type: 'string', description: 'Required', required: true },
          { name: 'optional-text', type: 'string', description: 'Optional', required: false },
        ];

        const result = buildCommandOptions('test', 'Test', options);

        expect(result.options[0].required).toBe(true);
        expect(result.options[1].required).toBe(false);
      });

      it('should default required to false', () => {
        const options = [
          { name: 'text', type: 'string', description: 'Text' },
        ];

        const result = buildCommandOptions('test', 'Test', options);

        expect(result.options[0].required).toBe(false);
      });

      it('should preserve string constraints', () => {
        const options = [
          {
            name: 'text',
            type: 'string',
            description: 'Text',
            minLength: 3,
            maxLength: 100,
          },
        ];

        const result = buildCommandOptions('test', 'Test', options);

        expect(result.options[0].minLength).toBe(3);
        expect(result.options[0].maxLength).toBe(100);
      });

      it('should preserve integer constraints', () => {
        const options = [
          {
            name: 'count',
            type: 'integer',
            description: 'Count',
            minValue: 1,
            maxValue: 1000,
          },
        ];

        const result = buildCommandOptions('test', 'Test', options);

        expect(result.options[0].minValue).toBe(1);
        expect(result.options[0].maxValue).toBe(1000);
      });

      it('should preserve choices for string options', () => {
        const options = [
          {
            name: 'choice',
            type: 'string',
            description: 'Choose one',
            choices: [
              { name: 'Option 1', value: 'opt1' },
              { name: 'Option 2', value: 'opt2' },
            ],
          },
        ];

        const result = buildCommandOptions('test', 'Test', options);

        expect(result.options[0].choices).toHaveLength(2);
      });

      it('should return SlashCommandBuilder as data', () => {
        const result = buildCommandOptions('test', 'Test', []);

        expect(result.data).toBeDefined();
      });

      it('should handle empty options array', () => {
        const result = buildCommandOptions('test', 'Test', []);

        expect(result.options).toEqual([]);
      });

      it('should preserve extra properties in option', () => {
        const options = [
          {
            name: 'text',
            type: 'string',
            description: 'Text',
            customProperty: 'custom-value',
          },
        ];

        const result = buildCommandOptions('test', 'Test', options);

        expect(result.options[0].customProperty).toBe('custom-value');
      });

      it('should handle command names correctly', () => {
        const result = buildCommandOptions('my-command', 'My Command', []);

        expect(result).toBeDefined();
      });

      it('should handle long descriptions', () => {
        const longDescription = 'A'.repeat(100);
        const result = buildCommandOptions('test', longDescription, []);

        expect(result).toBeDefined();
      });
    });
  });

  describe('Integration: Command with Options', () => {
    it('should create command with options and register', () => {
      const Command = require('../../src/core/CommandBase');
      const buildCommandOptions = require('../../src/core/CommandOptions');

      const { data, options } = buildCommandOptions('add-quote', 'Add a new quote', [
        { name: 'text', type: 'string', description: 'Quote text', required: true },
        { name: 'author', type: 'string', description: 'Quote author', required: false },
      ]);

      const cmd = new Command({
        name: 'add-quote',
        description: 'Add a new quote',
        data,
        options,
      });

      cmd.register();

      expect(cmd.name).toBe('add-quote');
      expect(cmd.options).toHaveLength(2);
    });
  });
});
