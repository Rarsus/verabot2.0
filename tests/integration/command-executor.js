/**
 * CommandExecutor - Integration Layer for Real Command Testing
 * Phase 22.5: Implementation Integration
 *
 * Purpose: Bridge between mock tests and real command implementations
 * Allows tests to execute actual CommandBase subclasses with mock interactions
 *
 * Usage:
 *   const executor = new CommandExecutor();
 *   const result = await executor.executeCommand(CreateReminderCommand, mockInteraction);
 */

class CommandExecutor {
  /**
   * Execute a real command with a mock interaction
   * @param {Class} CommandClass - Subclass of CommandBase to execute
   * @param {Object} interaction - Mock Discord.js interaction
   * @returns {Promise<Object>} Command execution result
   */
  async executeCommand(CommandClass, interaction) {
    try {
      // Instantiate the actual command
      const command = new CommandClass();

      // Validate command structure
      this.validateCommand(command);

      // Execute the command via interaction (slash command path)
      if (command.executeInteraction && typeof command.executeInteraction === 'function') {
        const result = await command.executeInteraction(interaction);
        return {
          success: true,
          result,
          commandName: command.name,
          method: 'executeInteraction',
        };
      }

      // Fallback: Try execute method (prefix command path)
      if (command.execute && typeof command.execute === 'function') {
        const result = await command.execute(interaction.message, interaction.args);
        return {
          success: true,
          result,
          commandName: command.name,
          method: 'execute',
        };
      }

      throw new Error(`Command ${CommandClass.name} has no execute methods`);
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stack: error.stack,
        commandName: CommandClass.name,
      };
    }
  }

  /**
   * Execute command and verify response helpers were used
   * @param {Class} CommandClass - Command to execute
   * @param {Object} interaction - Mock interaction
   * @returns {Promise<Object>} Verification result
   */
  async executeAndVerifyResponse(CommandClass, interaction) {
    const execution = await this.executeCommand(CommandClass, interaction);

    if (!execution.success) {
      return execution;
    }

    // Verify response helper was called
    const responseHelper = interaction.reply || interaction.followUp || interaction.editReply;
    if (!responseHelper) {
      return {
        success: false,
        error: 'No response helper was called (reply/followUp/editReply)',
        commandName: CommandClass.name,
      };
    }

    if (responseHelper.mock && !responseHelper.mock.calls.length) {
      return {
        success: false,
        error: 'Response helper mock was not invoked',
        commandName: CommandClass.name,
      };
    }

    return {
      success: true,
      responseHelperUsed: true,
      commandName: CommandClass.name,
    };
  }

  /**
   * Validate command structure matches CommandBase pattern
   * @param {Object} command - Command instance to validate
   */
  validateCommand(command) {
    if (!command.name) {
      throw new Error('Command missing required "name" property');
    }

    if (!command.description) {
      throw new Error('Command missing required "description" property');
    }

    if (!command.executeInteraction && !command.execute) {
      throw new Error(
        `Command ${command.name} must implement executeInteraction() or execute()`,
      );
    }
  }

  /**
   * Execute command batch (multiple commands at once)
   * Useful for measuring coverage improvements across multiple commands
   * @param {Array} commandSpecs - Array of {CommandClass, interaction} objects
   * @returns {Promise<Array>} Results for all commands
   */
  async executeCommandBatch(commandSpecs) {
    const results = await Promise.all(
      commandSpecs.map(({ CommandClass, interaction }) =>
        this.executeCommand(CommandClass, interaction),
      ),
    );

    return {
      total: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
      successRate: `${Math.round(
        (results.filter((r) => r.success).length / results.length) * 100,
      )}%`,
    };
  }

  /**
   * Get command execution metrics
   * @param {Array} results - Results from executeCommandBatch
   * @returns {Object} Metrics object
   */
  static getMetrics(results) {
    const successfulCommands = results.results.filter((r) => r.success);
    const failedCommands = results.results.filter((r) => !r.success);

    return {
      totalCommands: results.total,
      executedSuccessfully: results.successful,
      executedWithErrors: results.failed,
      successRate: results.successRate,
      failedCommandNames: failedCommands.map((r) => r.commandName),
      successfulCommandNames: successfulCommands.map((r) => r.commandName),
    };
  }
}

module.exports = CommandExecutor;
