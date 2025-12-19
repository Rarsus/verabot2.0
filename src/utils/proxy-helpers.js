/**
 * Proxy Helper Utilities
 * Common utilities for message proxy functionality
 */

const { PermissionFlagsBits } = require('discord.js');

/**
 * Check if message should be forwarded
 * @param {Object} message - Discord message
 * @param {Array<string>} monitoredChannels - List of channel IDs to monitor
 * @returns {boolean} True if message should be forwarded
 */
function shouldForwardMessage(message, monitoredChannels) {
  // Don't forward bot messages
  if (message.author?.bot) {
    return false;
  }

  // Don't forward if no channels specified (proxy is not configured)
  if (!monitoredChannels || monitoredChannels.length === 0) {
    return false;
  }

  // Check if message is in a monitored channel
  const channelId = message.channel?.id;
  if (!channelId) {
    return false;
  }

  return monitoredChannels.includes(channelId);
}

/**
 * Check if user has admin permissions
 * @param {Object} interaction - Discord interaction
 * @returns {boolean} True if user is admin
 */
function checkAdminPermission(interaction) {
  try {
    if (!interaction.member) {
      return false;
    }

    return interaction.member.permissions.has(PermissionFlagsBits.Administrator);
  } catch (err) {
    console.error('Error checking admin permission:', err);
    return false;
  }
}

/**
 * Validate webhook URL
 * @param {string} url - URL to validate
 * @returns {object} {valid: boolean, error: string|null}
 */
function validateWebhookUrl(url) {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'Webhook URL must be a string' };
  }

  const trimmed = url.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Webhook URL cannot be empty' };
  }

  // Basic URL validation
  try {
    const urlObj = new URL(trimmed);
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return { valid: false, error: 'Webhook URL must use HTTP or HTTPS protocol' };
    }
  } catch (err) {
    return { valid: false, error: 'Invalid webhook URL format' };
  }

  return { valid: true, error: null };
}

/**
 * Validate channel ID format
 * @param {string} channelId - Discord channel ID
 * @returns {boolean} True if valid format
 */
function validateChannelId(channelId) {
  if (!channelId || typeof channelId !== 'string') {
    return false;
  }

  // Discord snowflake IDs are numeric strings
  return /^\d{17,19}$/.test(channelId);
}

/**
 * Sanitize message content for logging (remove sensitive data)
 * @param {string} content - Message content
 * @returns {string} Sanitized content
 */
function sanitizeForLogging(content) {
  if (!content) return '';
  
  // Truncate long messages
  const maxLength = 100;
  const sanitized = content.substring(0, maxLength);
  
  // Remove potential tokens or secrets (basic pattern matching)
  return sanitized
    .replace(/[a-zA-Z0-9_-]{20,}/g, '[REDACTED]')
    .replace(/Bearer\s+\S+/gi, 'Bearer [REDACTED]');
}

/**
 * Format message payload for webhook
 * @param {Object} message - Discord message
 * @returns {Object} Formatted payload
 */
function formatMessagePayload(message) {
  return {
    content: message.content,
    author: {
      id: message.author.id,
      username: message.author.username,
      tag: message.author.tag
    },
    channel: message.channel.id,
    channelName: message.channel.name,
    messageId: message.id,
    timestamp: message.createdTimestamp,
    serverId: message.guild?.id,
    serverName: message.guild?.name
  };
}

/**
 * Parse incoming webhook payload
 * @param {Object} payload - Raw payload
 * @returns {Object} Parsed payload with validation
 */
function parseIncomingPayload(payload) {
  const errors = [];

  if (!payload.content || typeof payload.content !== 'string') {
    errors.push('Missing or invalid content');
  }

  if (!payload.channel || typeof payload.channel !== 'string') {
    errors.push('Missing or invalid channel');
  }

  return {
    valid: errors.length === 0,
    errors,
    content: payload.content,
    channel: payload.channel,
    timestamp: payload.timestamp || Date.now(),
    metadata: payload.metadata || {}
  };
}

module.exports = {
  shouldForwardMessage,
  checkAdminPermission,
  validateWebhookUrl,
  validateChannelId,
  sanitizeForLogging,
  formatMessagePayload,
  parseIncomingPayload
};
