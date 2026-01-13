/**
 * Phase 22.5: Real Command Execution Tests
 * Tests actual command implementations against mock interactions
 * Measures real code coverage of CommandBase subclasses
 *
 * Purpose: Bridge gap between mock tests and real command implementations
 * Validates that actual command code gets executed
 */

const assert = require('assert');
const CommandExecutor = require('../integration/command-executor');
const MockInteractionBuilder = require('../mocks/interaction-builder');

describe('Phase 22.5: Real Command Execution Integration', () => {
  let executor;

  beforeEach(() => {
    executor = new CommandExecutor();
  });

  // ============================================================================
  // SECTION 1: COMMAND EXECUTOR INFRASTRUCTURE
  // ============================================================================

  describe('CommandExecutor', () => {
    it('should instantiate without errors', () => {
      assert(executor instanceof CommandExecutor);
    });

    it('should have executeCommand method', () => {
      assert(typeof executor.executeCommand === 'function');
    });

    it('should validate command structure', () => {
      const invalidCommand = {
        name: 'test',
        // Missing description and execute methods
      };

      assert.throws(() => {
        executor.validateCommand(invalidCommand);
      }, /missing required "description"/i);
    });

    it('should execute batch commands', async () => {
      // Mock a simple command
      class SimpleCommand {
        constructor() {
          this.name = 'simple';
          this.description = 'Simple command';
        }

        async executeInteraction(interaction) {
          await interaction.reply({ content: 'Success' });
          return { ok: true };
        }
      }

      const interaction = MockInteractionBuilder.create('simple').build();
      const specs = [{ CommandClass: SimpleCommand, interaction }];

      const results = await executor.executeCommandBatch(specs);
      assert(results.successful === 1);
      assert(results.total === 1);
      assert(results.successRate === '100%');
    });
  });

  // ============================================================================
  // SECTION 2: MOCK INTERACTION BUILDER
  // ============================================================================

  describe('MockInteractionBuilder', () => {
    it('should create basic interaction', () => {
      const interaction = MockInteractionBuilder.create('test-command').build();
      assert(interaction.commandName === 'test-command');
      assert(interaction.guildId === 'test-guild-123');
      assert(interaction.user.id === 'test-user-456');
    });

    it('should support guild customization', () => {
      const interaction = MockInteractionBuilder.create('test')
        .withGuild('custom-guild')
        .build();
      assert(interaction.guildId === 'custom-guild');
    });

    it('should support user customization', () => {
      const interaction = MockInteractionBuilder.create('test')
        .withUser('custom-user')
        .build();
      assert(interaction.user.id === 'custom-user');
    });

    it('should support options', () => {
      const interaction = MockInteractionBuilder.create('test')
        .withOption('name', 'John')
        .withOption('age', '30')
        .build();

      assert(interaction.options.getString('name') === 'John');
      assert(interaction.options.getInteger('age') === 30);
    });

    it('should support batch options', () => {
      const interaction = MockInteractionBuilder.create('test')
        .withOptions({
          name: 'Alice',
          email: 'alice@example.com',
          active: true,
        })
        .build();

      assert(interaction.options.getString('name') === 'Alice');
      assert(interaction.options.getString('email') === 'alice@example.com');
      assert(interaction.options.getBoolean('active') === true);
    });

    it('should support admin permissions', () => {
      const interaction = MockInteractionBuilder.createAdmin('test').build();
      assert(interaction.member.permissions.has('ADMINISTRATOR'));
    });

    it('should track response calls', () => {
      const interaction = MockInteractionBuilder.create('test').build();
      const callInfo = interaction;

      assert(typeof interaction.reply === 'function');
      assert(typeof interaction.deferReply === 'function');
      assert(typeof interaction.followUp === 'function');
    });

    it('should support slash command type', () => {
      const interaction = MockInteractionBuilder.create('test').build();
      assert(interaction.isChatInputCommand() === true);
      assert(interaction.isCommand() === true);
    });

    it('should support prefix command type', () => {
      const interaction = MockInteractionBuilder.create('test')
        .forPrefixCommand('!')
        .build();

      assert(interaction.prefix === '!');
      assert(Array.isArray(interaction.args));
    });

    it('should batch create interactions', () => {
      const interactions = MockInteractionBuilder.createBatch(['cmd1', 'cmd2', 'cmd3']);
      assert(interactions.length === 3);
      assert(interactions[0].commandName === 'cmd1');
      assert(interactions[1].commandName === 'cmd2');
      assert(interactions[2].commandName === 'cmd3');
    });
  });

  // ============================================================================
  // SECTION 3: REAL COMMAND EXECUTION TESTS
  // ============================================================================

  describe('Real Command Execution', () => {
    it('should execute a command that extends CommandBase', async () => {
      // Use a real command from src/commands if available
      // For now, create a minimal test command
      const Command = require('../../src/core/CommandBase');
      const buildCommandOptions = require('../../src/core/CommandOptions');

      const { data, options } = buildCommandOptions('test', 'Test command', []);

      class TestCommand extends Command {
        constructor() {
          super({ name: 'test', description: 'Test', data, options });
        }

        async executeInteraction(interaction) {
          await interaction.reply({ content: 'Test successful' });
          return { success: true };
        }
      }

      const interaction = MockInteractionBuilder.create('test').build();
      const result = await executor.executeCommand(TestCommand, interaction);

      assert(result.success === true);
      assert(interaction.reply.mock.calls.length > 0);
    });

    it('should capture execution errors', async () => {
      const Command = require('../../src/core/CommandBase');
      const buildCommandOptions = require('../../src/core/CommandOptions');

      const { data, options } = buildCommandOptions('error-cmd', 'Error command', []);

      class ErrorCommand extends Command {
        constructor() {
          super({ name: 'error-cmd', description: 'Error', data, options });
        }

        async executeInteraction() {
          throw new Error('Intentional test error');
        }
      }

      const interaction = MockInteractionBuilder.create('error-cmd').build();
      const result = await executor.executeCommand(ErrorCommand, interaction);

      assert(result.success === false);
      assert(result.error.includes('Intentional test error'));
    });

    it('should verify response helpers are called', async () => {
      const Command = require('../../src/core/CommandBase');
      const buildCommandOptions = require('../../src/core/CommandOptions');
      const { sendSuccess } = require('../../src/utils/helpers/response-helpers');

      const { data, options } = buildCommandOptions('verify-cmd', 'Verify command', []);

      class VerifyCommand extends Command {
        constructor() {
          super({ name: 'verify-cmd', description: 'Verify', data, options });
        }

        async executeInteraction(interaction) {
          // This should trigger response helper
          await sendSuccess(interaction, 'Operation successful');
        }
      }

      const interaction = MockInteractionBuilder.create('verify-cmd').build();
      const result = await executor.executeCommand(VerifyCommand, interaction);

      assert(result.success === true);
      // Verify some response method was called
      assert(
        interaction.reply.mock.calls.length > 0
        || interaction.followUp.mock.calls.length > 0
        || interaction.editReply.mock.calls.length > 0,
      );
    });
  });

  // ============================================================================
  // SECTION 4: COVERAGE VALIDATION
  // ============================================================================

  describe('Coverage Measurement', () => {
    it('should track command execution metrics', async () => {
      const Command = require('../../src/core/CommandBase');
      const buildCommandOptions = require('../../src/core/CommandOptions');

      const { data, options } = buildCommandOptions('metric-cmd', 'Metrics', []);

      class MetricCommand extends Command {
        constructor() {
          super({ name: 'metric-cmd', description: 'Metrics', data, options });
        }

        async executeInteraction(interaction) {
          await interaction.reply({ content: 'Metric test' });
        }
      }

      const interactions = [
        MockInteractionBuilder.create('metric-cmd').build(),
        MockInteractionBuilder.create('metric-cmd').withUser('user-2').build(),
      ];

      const specs = interactions.map((int) => ({
        CommandClass: MetricCommand,
        interaction: int,
      }));

      const batchResult = await executor.executeCommandBatch(specs);
      const metrics = CommandExecutor.getMetrics(batchResult);

      assert(metrics.totalCommands === 2);
      assert(metrics.executedSuccessfully === 2);
      assert(metrics.successRate === '100%');
    });

    it('should identify failed command executions', async () => {
      class FailingCommand {
        constructor() {
          this.name = 'failing';
          this.description = 'Fails';
        }

        async executeInteraction() {
          throw new Error('Execution failed');
        }
      }

      const interaction = MockInteractionBuilder.create('failing').build();
      const specs = [{ CommandClass: FailingCommand, interaction }];
      const batchResult = await executor.executeCommandBatch(specs);

      assert(batchResult.failed === 1);
      assert(batchResult.successful === 0);
      assert(batchResult.successRate === '0%');
    });
  });

  // ============================================================================
  // SECTION 5: INTEGRATION PATTERNS
  // ============================================================================

  describe('Integration Patterns', () => {
    it('should support option-based command patterns', async () => {
      const Command = require('../../src/core/CommandBase');
      const buildCommandOptions = require('../../src/core/CommandOptions');

      const { data, options } = buildCommandOptions('option-cmd', 'Option command', [
        { name: 'text', type: 'string', required: true, description: 'Input text' },
      ]);

      class OptionCommand extends Command {
        constructor() {
          super({ name: 'option-cmd', description: 'Options', data, options });
        }

        async executeInteraction(interaction) {
          const text = interaction.options.getString('text');
          if (!text) throw new Error('Text required');
          await interaction.reply({ content: `Received: ${text}` });
        }
      }

      const interaction = MockInteractionBuilder.create('option-cmd')
        .withOption('text', 'Hello World')
        .build();

      const result = await executor.executeCommand(OptionCommand, interaction);
      assert(result.success === true);
      assert(interaction.reply.mock.calls.length > 0);
    });

    it('should support guild context preservation', async () => {
      const Command = require('../../src/core/CommandBase');
      const buildCommandOptions = require('../../src/core/CommandOptions');

      const { data, options } = buildCommandOptions('guild-cmd', 'Guild command', []);

      class GuildCommand extends Command {
        constructor() {
          super({ name: 'guild-cmd', description: 'Guild', data, options });
        }

        async executeInteraction(interaction) {
          if (!interaction.guildId) throw new Error('Guild context missing');
          await interaction.reply({ content: `Guild: ${interaction.guildId}` });
        }
      }

      const guildId = 'custom-guild-789';
      const interaction = MockInteractionBuilder.create('guild-cmd')
        .withGuild(guildId)
        .build();

      const result = await executor.executeCommand(GuildCommand, interaction);
      assert(result.success === true);
      assert(interaction.guildId === guildId);
    });

    it('should support user context preservation', async () => {
      const Command = require('../../src/core/CommandBase');
      const buildCommandOptions = require('../../src/core/CommandOptions');

      const { data, options } = buildCommandOptions('user-cmd', 'User command', []);

      class UserCommand extends Command {
        constructor() {
          super({ name: 'user-cmd', description: 'User', data, options });
        }

        async executeInteraction(interaction) {
          const userId = interaction.user.id;
          await interaction.reply({ content: `User: ${userId}` });
        }
      }

      const userId = 'custom-user-999';
      const interaction = MockInteractionBuilder.create('user-cmd')
        .withUser(userId)
        .build();

      const result = await executor.executeCommand(UserCommand, interaction);
      assert(result.success === true);
      assert(interaction.user.id === userId);
    });
  });
});
