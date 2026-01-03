/**
 * External Actions Configuration
 *
 * Defines all approved external actions and their WebSocket service mappings.
 * This is a SECURITY-CRITICAL file - only add actions you explicitly approve.
 *
 * Structure:
 * {
 *   serviceName: {
 *     enabled: boolean,
 *     webhookUrl: string,
 *     allowedActions: [string],
 *     description: string,
 *     contactEmail: string
 *   }
 * }
 *
 * IMPORTANT SECURITY NOTES:
 * 1. Only add services you trust completely
 * 2. Only add actions you explicitly intend to support
 * 3. Review each action's implementation in ExternalActionHandler
 * 4. Test thoroughly before enabling in production
 * 5. Monitor logs for unusual activity
 * 6. Regularly audit this configuration
 */

module.exports = {
  // Example: XToys webhook integration
  // xtoys: {
  //   enabled: false,
  //   webhookUrl: process.env.XTOYS_WEBHOOK_URL || 'wss://webhook.xtoys.app/YOUR_WEBHOOK_ID',
  //   allowedActions: [
  //     'discord_message',  // Send message to channel
  //     'notification',     // Generic notification
  //     'ping'             // Health check
  //   ],
  //   description: 'XToys webhook integration for notifications',
  //   contactEmail: 'admin@example.com'
  // },

  // Example: Custom external service
  // customService: {
  //   enabled: false,
  //   webhookUrl: process.env.CUSTOM_SERVICE_WEBHOOK_URL || 'wss://custom-api.example.com/webhook',
  //   allowedActions: [
  //     'discord_dm',      // Send DM to user
  //     'notification'     // Send notification
  //   ],
  //   description: 'Custom service webhook integration',
  //   contactEmail: 'support@example.com'
  // }

  // Add your approved services here
};

/**
 * Built-in approved actions reference:
 *
 * discord_message
 *   - Send message to Discord channel
 *   - Requires: channelId, message
 *   - Optional: embed (Discord embed object)
 *   - Returns: { success, messageId, channelId }
 *
 * discord_dm
 *   - Send direct message to Discord user
 *   - Requires: userId, message
 *   - Optional: embed (Discord embed object)
 *   - Returns: { success, messageId, userId }
 *
 * discord_role
 *   - Assign or remove role from user
 *   - Requires: guildId, userId, roleId, action ('add' or 'remove')
 *   - Returns: { success, action, userId, roleId, guildId }
 *
 * notification
 *   - Send generic notification (logged only)
 *   - Requires: message
 *   - Optional: level ('info', 'warning', 'error')
 *   - Returns: { success, message, level }
 *
 * ping
 *   - Health check / keep-alive
 *   - Requires: none
 *   - Returns: { success, pong, timestamp }
 *
 *
 * TO ADD CUSTOM ACTIONS:
 * 1. Implement handler in src/services/ExternalActionHandler.js
 * 2. Register it in _registerDefaultHandlers() or register() method
 * 3. Add action name to allowedActions in this config
 * 4. Test thoroughly before enabling
 * 5. Document the action's purpose and parameters
 *
 *
 * SECURITY CHECKLIST:
 * [ ] Action has clear, limited scope
 * [ ] Action validates all input parameters
 * [ ] Action includes appropriate error handling
 * [ ] Action respects Discord rate limits
 * [ ] Action respects user privacy
 * [ ] Action is logged and auditable
 * [ ] Only trusted services have access
 * [ ] Webhook URLs are protected (use env variables)
 * [ ] Configuration reviewed by security team
 */

/**
 * Helper function to validate service configuration
 * @param {Object} config - Service configuration object
 * @returns {Object} Validation result { valid: boolean, errors: string[] }
 */
function validateServiceConfig(config) {
  const errors = [];

  if (typeof config.enabled !== 'boolean') {
    errors.push('enabled must be boolean');
  }

  if (!config.webhookUrl || typeof config.webhookUrl !== 'string') {
    errors.push('webhookUrl must be non-empty string');
  }

  if (!Array.isArray(config.allowedActions) || config.allowedActions.length === 0) {
    errors.push('allowedActions must be non-empty array');
  }

  if (!config.description || typeof config.description !== 'string') {
    errors.push('description must be non-empty string');
  }

  if (!config.contactEmail || typeof config.contactEmail !== 'string') {
    errors.push('contactEmail must be non-empty string');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports.validateServiceConfig = validateServiceConfig;
