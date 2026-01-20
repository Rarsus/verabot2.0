/**
 * Base Command Class
 * Provides reusable structure and error handling for all commands
 */

/**
 * Base Command Class
 * Provides reusable structure and error handling for all commands
 */

const { logError, ERROR_LEVELS } = require('verabot-utils/middleware/errorHandler');
const { sendError } = require('../helpers/response-helpers');

// Optional: Load RolePermissionService if available
let RolePermissionService;
try {
  RolePermissionService = require('../services/RolePermissionService');
  // eslint-disable-next-line no-unused-vars
} catch (_error) {
  // RolePermissionService not available - OK for basic commands
}

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
    // Permission and visibility config
    this.permissions = config.permissions || {
      minTier: 0,
      visible: true,
      allowGuildOverride: true,
    };
  }

  /**
   * Check if user has permission to execute this command
   * @param {Object} context - Interaction or message
   * @param {Object} client - Discord.js client
   * @returns {Promise<{allowed: boolean, reason?: string}>}
   */
  async checkPermission(context, client) {
    const userId = context.user?.id || context.author?.id;
    const guildId = context.guildId;

    if (!userId || !guildId) {
      return { allowed: true }; // Allow DMs
    }

    const hasPermission = await RolePermissionService.canExecuteCommand(userId, guildId, this.name, client);

    if (!hasPermission) {
      const userTier = await RolePermissionService.getUserTier(userId, guildId, client);
      const cmdConfig = RolePermissionService.getCommandConfig(this.name, guildId);
      const minTier = cmdConfig?.minTier || 0;
      const tierName = RolePermissionService.getRoleDescription(minTier);

      return {
        allowed: false,
        reason: `You need **${tierName}** to use this command. Your tier: ${RolePermissionService.getRoleDescription(userTier)}`,
      };
    }

    return { allowed: true };
  }

  /**
   * Check if command is visible to user
   * @param {Object} context - Interaction or message
   * @param {Object} client - Discord.js client
   * @returns {Promise<boolean>}
   */
  async checkVisibility(context, client) {
    const userId = context.user?.id || context.author?.id;
    const guildId = context.guildId;

    if (!userId || !guildId) {
      return true; // Always visible in DMs
    }

    return RolePermissionService.isCommandVisible(userId, guildId, this.name, client);
  }

  /**
   * Wrap an async function with error handling AND permission checks
   * @param {Function} fn - Async function to wrap
   * @param {string} context - Context for logging
   * @param {boolean} isInteractionHandler - True if this is executeInteraction
   * @returns {Function} Wrapped function
   */
  wrapError(fn, context, isInteractionHandler = false) {
    // eslint-disable-next-line complexity
    return async (...args) => {
      try {
        const [firstArg] = args;
        const isInteraction = firstArg?.isCommand?.() || firstArg?.isChatInputCommand?.();

        // Get client from context
        const client = isInteraction ? firstArg.client : firstArg?.client;

        // Check permission before execution
        if (isInteractionHandler && client) {
          const permissionCheck = await this.checkPermission(firstArg, client);
          if (!permissionCheck.allowed) {
            return await sendError(firstArg, permissionCheck.reason, true);
          }
        }

        return await fn(...args);
      } catch (err) {
        const [firstArg] = args;
        const isInteraction = firstArg?.isCommand?.() || firstArg?.isChatInputCommand?.();

        logError(context, err, ERROR_LEVELS.MEDIUM, {
          commandName: this.name,
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
   * Slash commands (executeInteraction) get permission checks
   * Prefix commands (execute) rely on legacy handling
   */
  register() {
    if (this.execute) {
      // Prefix commands don't get permission checks (no Discord role context easily)
      this.execute = this.wrapError(this.execute.bind(this), `${this.name}.execute`, false);
    }
    if (this.executeInteraction) {
      // Slash commands get permission checks (interaction has full context)
      this.executeInteraction = this.wrapError(
        this.executeInteraction.bind(this),
        `${this.name}.executeInteraction`,
        true,
      );
    }
    return this;
  }
}

module.exports = Command;
