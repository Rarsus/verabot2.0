/**
 * Webhook Proxy Service
 * Handles forwarding messages from Discord to external webhooks
 */

const fetch = require('node-fetch');
const { logError, ERROR_LEVELS } = require('../middleware/errorHandler');
const { formatMessagePayload, sanitizeForLogging } = require('../utils/proxy-helpers');

class WebhookProxyService {
  constructor(fetchImpl = null) {
    // Allow dependency injection for testing
    this.fetch = fetchImpl || fetch;
  }

  /**
   * Forward a Discord message to a webhook
   * @param {Object} message - Discord message object
   * @param {string} webhookUrl - Webhook URL
   * @param {string} token - Authentication token
   * @returns {Promise<Object>} {success: boolean, error: string|null}
   */
  async forwardMessage(message, webhookUrl, token) {
    try {
      // Format the payload
      const payload = formatMessagePayload(message);

      // Validate payload
      const validation = this.validatePayload(payload);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Send to webhook
      const response = await this.fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        logError(
          'WebhookProxyService.forwardMessage',
          `Webhook returned status ${response.status}`,
          ERROR_LEVELS.MEDIUM,
          {
            status: response.status,
            messageId: message.id,
            channel: sanitizeForLogging(message.channel?.id),
          }
        );
        return {
          success: false,
          error: `Webhook request failed with status ${response.status}`,
        };
      }

      return { success: true, error: null };
    } catch (err) {
      logError('WebhookProxyService.forwardMessage', err, ERROR_LEVELS.MEDIUM, { messageId: message.id });
      return {
        success: false,
        error: err.message || 'Failed to forward message',
      };
    }
  }

  /**
   * Forward message with retry logic
   * @param {Object} message - Discord message object
   * @param {string} webhookUrl - Webhook URL
   * @param {string} token - Authentication token
   * @param {number} maxRetries - Maximum number of retries (default 3)
   * @param {number} retryDelay - Delay between retries in ms (default 1000)
   * @returns {Promise<Object>} {success: boolean, error: string|null, attempts: number}
   */
  async forwardMessageWithRetry(message, webhookUrl, token, maxRetries = 3, retryDelay = 1000) {
    let attempts = 0;
    let lastError = null;

    while (attempts < maxRetries) {
      attempts++;

      const result = await this.forwardMessage(message, webhookUrl, token);

      if (result.success) {
        return { success: true, error: null, attempts };
      }

      lastError = result.error;

      // Don't retry on validation errors
      if (result.error && result.error.includes('validation')) {
        break;
      }

      // Wait before retry (except on last attempt)
      if (attempts < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay * attempts));
      }
    }

    logError(
      'WebhookProxyService.forwardMessageWithRetry',
      `Failed after ${attempts} attempts: ${lastError}`,
      ERROR_LEVELS.HIGH,
      { messageId: message.id, attempts }
    );

    return {
      success: false,
      error: lastError || 'Max retries exceeded',
      attempts,
    };
  }

  /**
   * Validate message payload
   * @param {Object} payload - Message payload
   * @returns {Object} {valid: boolean, error: string|null}
   */
  validatePayload(payload) {
    if (!payload) {
      return { valid: false, error: 'Payload is empty' };
    }

    if (!payload.content || typeof payload.content !== 'string' || payload.content.length === 0) {
      return { valid: false, error: 'Invalid or empty content' };
    }

    if (!payload.author || !payload.author.username) {
      return { valid: false, error: 'Invalid author information' };
    }

    if (!payload.channel) {
      return { valid: false, error: 'Missing channel information' };
    }

    if (!payload.timestamp) {
      return { valid: false, error: 'Missing timestamp' };
    }

    return { valid: true, error: null };
  }

  /**
   * Batch forward multiple messages
   * @param {Array<Object>} messages - Array of Discord messages
   * @param {string} webhookUrl - Webhook URL
   * @param {string} token - Authentication token
   * @returns {Promise<Object>} {successful: number, failed: number, errors: Array}
   */
  async forwardBatch(messages, webhookUrl, token) {
    let successful = 0;
    let failed = 0;
    const errors = [];

    for (const message of messages) {
      const result = await this.forwardMessageWithRetry(message, webhookUrl, token);

      if (result.success) {
        successful++;
      } else {
        failed++;
        errors.push({
          messageId: message.id,
          error: result.error,
        });
      }
    }

    return { successful, failed, errors };
  }
}

module.exports = WebhookProxyService;
