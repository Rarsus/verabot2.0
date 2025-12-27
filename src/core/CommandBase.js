/**
 * Base Command Class
 * Provides reusable structure and error handling for all commands
 */

const { logError, ERROR_LEVELS } = require('../middleware/errorHandler');

/**
 * Base class for all commands
 * Handles error wrapping and common patterns
 */
class Command {
  constructor(config) {
    this.name = config.name;
    this.description = config.description;
    this.data = config.data;
    this.options = config.options || [];
  }

  /**
   * Wrap an async function with error handling
   * @param {Function} fn - Async function to wrap
   * @param {string} context - Context for logging
   * @returns {Function} Wrapped function
   */
  wrapError(fn, context) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (err) {
        const [firstArg] = args;
        const isInteraction = firstArg?.isCommand?.() || firstArg?.isChatInputCommand?.();

        logError(context, err, ERROR_LEVELS.MEDIUM, {
          commandName: this.name
        });

        if (isInteraction) {
          try {
            const response = `❌ An error occurred: ${err.message || 'Unknown error'}`;
            if (firstArg.replied || firstArg.deferred) {
              await firstArg.followUp({ content: response, flags: 64 });
            } else {
              await firstArg.reply({ content: response, flags: 64 });
            }
          } catch (replyErr) {
            logError(`${context} (reply error)`, replyErr, ERROR_LEVELS.HIGH);
          }
        }
      }
    };
  }

  /**
   * Register this command
   * Automatically wraps execute and executeInteraction
   */
  register() {
    if (this.execute) {
      this.execute = this.wrapError(this.execute.bind(this), `${this.name}.execute`);
    }
    if (this.executeInteraction) {
      this.executeInteraction = this.wrapError(this.executeInteraction.bind(this), `${this.name}.executeInteraction`);
    }
    return this;
  }
}

module.exports = Command;
