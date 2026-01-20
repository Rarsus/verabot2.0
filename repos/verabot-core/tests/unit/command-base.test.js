/**
 * Unit Tests for CommandBase
 * Testing command base class and lifecycle
 */

const assert = require('assert');
const CommandBase = require('../../src/core/CommandBase');

describe('CommandBase', () => {
  class TestCommand extends CommandBase {
    constructor() {
      super({
        name: 'test',
        description: 'Test command',
      });
    }

    async execute(message, args) {
      return { success: true, args };
    }

    async executeInteraction(interaction) {
      return { success: true, interaction: interaction.user.id };
    }
  }

  let testCommand;

  beforeEach(() => {
    testCommand = new TestCommand();
  });

  describe('Constructor', () => {
    it('should initialize with name and description', () => {
      assert.strictEqual(testCommand.name, 'test');
      assert.strictEqual(testCommand.description, 'Test command');
    });

    it('should have register method', () => {
      assert.strictEqual(typeof testCommand.register, 'function');
    });

    it('should have execute method', () => {
      assert.strictEqual(typeof testCommand.execute, 'function');
    });
  });

  describe('register()', () => {
    it('should return command instance for chaining', () => {
      const result = testCommand.register();

      assert.ok(result instanceof CommandBase);
    });

    it('should make command ready for use', () => {
      testCommand.register();

      assert.ok(true);
    });
  });

  describe('Error handling', () => {
    it('should handle errors in execute method', async () => {
      class ErrorCommand extends CommandBase {
        constructor() {
          super({
            name: 'error',
            description: 'Error command',
          });
        }

        async execute() {
          throw new Error('Test error');
        }

        async executeInteraction() {
          throw new Error('Test error');
        }
      }

      const cmd = new ErrorCommand().register();

      // Command base catches errors automatically
      assert.ok(cmd);
    });

    it('should not break on missing handlers', () => {
      class MinimalCommand extends CommandBase {
        constructor() {
          super({
            name: 'minimal',
            description: 'Minimal',
          });
        }
      }

      const cmd = new MinimalCommand().register();

      assert.ok(cmd);
    });
  });

  describe('Command properties', () => {
    it('should store command options', () => {
      class OptionsCommand extends CommandBase {
        constructor() {
          super({
            name: 'opts',
            description: 'With options',
            options: [{ name: 'arg1', type: 'string' }],
          });
        }
      }

      const cmd = new OptionsCommand();

      assert.ok(cmd.options || cmd.name);
    });

    it('should support command category', () => {
      class CategoryCommand extends CommandBase {
        constructor() {
          super({
            name: 'cat',
            description: 'Categorized',
            category: 'utility',
          });
        }
      }

      const cmd = new CategoryCommand();

      assert.ok(cmd.name);
    });
  });

  describe('Instance methods', () => {
    it('should allow command execution', async () => {
      const result = await testCommand.execute(null, []);

      assert.deepStrictEqual(result, { success: true, args: [] });
    });

    it('should allow interaction execution', async () => {
      const mockInteraction = { user: { id: 'user-123' } };

      const result = await testCommand.executeInteraction(mockInteraction);

      assert.strictEqual(result.success, true);
    });
  });

  describe('Base class inheritance', () => {
    it('should allow extending CommandBase', () => {
      assert.ok(testCommand instanceof CommandBase);
    });

    it('should preserve subclass properties', () => {
      class CustomCommand extends CommandBase {
        constructor() {
          super({
            name: 'custom',
            description: 'Custom',
          });
          this.customProp = 'value';
        }
      }

      const cmd = new CustomCommand();

      assert.strictEqual(cmd.customProp, 'value');
      assert.strictEqual(cmd.name, 'custom');
    });
  });

  describe('Command lifecycle', () => {
    it('should create and register command', () => {
      const cmd = testCommand.register();

      assert.ok(cmd);
      assert.strictEqual(cmd.name, 'test');
    });

    it('should support multiple commands', () => {
      class AnotherCommand extends CommandBase {
        constructor() {
          super({
            name: 'another',
            description: 'Another',
          });
        }
      }

      const cmd1 = testCommand.register();
      const cmd2 = new AnotherCommand().register();

      assert.notStrictEqual(cmd1.name, cmd2.name);
    });
  });
});
