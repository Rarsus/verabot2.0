/**
 * External Action Handler
 *
 * Processes and executes approved external actions from WebSocket services.
 * Integrates with Discord bot to perform authorized commands/operations.
 *
 * Features:
 * - Action validation and safety checks
 * - Discord integration (send messages, create embeds, etc.)
 * - Parameterized action execution
 * - Error handling and fallback
 * - Audit logging of all actions
 *
 * Usage:
 *   const handler = require('./ExternalActionHandler');
 *   handler.executeAction(client, action, payload);
 */

const { logError, logInfo, ERROR_LEVELS } = require('../middleware/errorHandler');

class ExternalActionHandler {
  constructor() {
    // Map of action handlers
    this.handlers = new Map();
    this._registerDefaultHandlers();
  }

  /**
   * Register default action handlers
   * @private
   */
  _registerDefaultHandlers() {
    // Discord message action
    this.register('discord_message', this._handleDiscordMessage.bind(this));

    // Discord user DM action
    this.register('discord_dm', this._handleDiscordDM.bind(this));

    // Discord role assignment
    this.register('discord_role', this._handleDiscordRole.bind(this));

    // Generic notification
    this.register('notification', this._handleNotification.bind(this));

    // Test/health check
    this.register('ping', this._handlePing.bind(this));
  }

  /**
   * Register custom action handler
   * @param {string} actionName - Name of the action
   * @param {Function} handler - Async handler function(client, payload)
   */
  register(actionName, handler) {
    if (typeof handler !== 'function') {
      throw new Error('Handler must be a function');
    }
    this.handlers.set(actionName, handler);
    logInfo(`Registered action handler: ${actionName}`);
  }

  /**
   * Execute an approved action
   * @param {Object} client - Discord client
   * @param {string} action - Action name (must be in whitelist)
   * @param {Object} payload - Action payload with parameters
   * @returns {Promise<Object>} Execution result
   */
  async executeAction(client, action, payload) {
    // Validate inputs
    if (!client || !action || typeof action !== 'string') {
      throw new Error('Invalid inputs: client and action string required');
    }

    logInfo(`Executing external action: ${action}`, {
      action,
      payloadKeys: Object.keys(payload),
    });

    // Check handler exists
    const handler = this.handlers.get(action);
    if (!handler) {
      logError(`No handler registered for action: ${action}`, ERROR_LEVELS.MEDIUM, {
        action,
        availableActions: Array.from(this.handlers.keys()),
      });
      throw new Error(`Unknown action: ${action}`);
    }

    try {
      const result = await handler(client, payload);
      logInfo(`Action executed successfully: ${action}`, {
        action,
        resultKeys: Object.keys(result),
      });
      return result;
    } catch (err) {
      logError(`Action execution failed: ${action}`, ERROR_LEVELS.HIGH, {
        action,
        error: err.message,
        stack: err.stack,
      });
      throw err;
    }
  }

  /**
   * Get all registered action names
   * @returns {Array<string>} List of registered actions
   */
  getRegisteredActions() {
    return Array.from(this.handlers.keys());
  }

  // ========== DEFAULT HANDLERS ==========

  /**
   * Send message to Discord channel
   * @private
   */
  async _handleDiscordMessage(client, payload) {
    const { channelId, message, embed } = payload;

    if (!channelId || !message) {
      throw new Error('discord_message requires: channelId, message');
    }

    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel) {
      throw new Error(`Channel not found: ${channelId}`);
    }

    const msgOptions = { content: message };
    if (embed) {
      msgOptions.embeds = [embed];
    }

    const sent = await channel.send(msgOptions);
    return {
      success: true,
      messageId: sent.id,
      channelId: channel.id,
    };
  }

  /**
   * Send DM to Discord user
   * @private
   */
  async _handleDiscordDM(client, payload) {
    const { userId, message, embed } = payload;

    if (!userId || !message) {
      throw new Error('discord_dm requires: userId, message');
    }

    const user = await client.users.fetch(userId).catch(() => null);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const dmOptions = { content: message };
    if (embed) {
      dmOptions.embeds = [embed];
    }

    const sent = await user.send(dmOptions);
    return {
      success: true,
      messageId: sent.id,
      userId: user.id,
    };
  }

  /**
   * Assign role to user
   * @private
   */
  async _handleDiscordRole(client, payload) {
    const { guildId, userId, roleId, action } = payload;

    if (!guildId || !userId || !roleId || !action) {
      throw new Error('discord_role requires: guildId, userId, roleId, action (add/remove)');
    }

    if (!['add', 'remove'].includes(action)) {
      throw new Error('discord_role action must be "add" or "remove"');
    }

    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) {
      throw new Error(`Guild not found: ${guildId}`);
    }

    const member = await guild.members.fetch(userId).catch(() => null);
    if (!member) {
      throw new Error(`Member not found in guild: ${userId}`);
    }

    const role = guild.roles.cache.get(roleId);
    if (!role) {
      throw new Error(`Role not found: ${roleId}`);
    }

    if (action === 'add') {
      await member.roles.add(role);
    } else {
      await member.roles.remove(role);
    }

    return {
      success: true,
      action,
      userId,
      roleId,
      guildId,
    };
  }

  /**
   * Send generic notification
   * @private
   */
  async _handleNotification(client, payload) {
    const { message, level } = payload;

    if (!message) {
      throw new Error('notification requires: message');
    }

    logInfo(`External notification (${level || 'info'}): ${message}`, {
      level: level || 'info',
      source: 'external_action',
    });

    return {
      success: true,
      message,
      level: level || 'info',
    };
  }

  /**
   * Health check / ping
   * @private
   */
  async _handlePing() {
    return {
      success: true,
      pong: true,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new ExternalActionHandler();
