/**
 * Webhook Listener Service
 * Handles incoming webhook messages and relays them to Discord channels
 */

const http = require('http');
const { logError, ERROR_LEVELS } = require('../middleware/errorHandler');
const { parseIncomingPayload } = require('../utils/proxy-helpers');
const { createHmacSignature, verifyHmacSignature } = require('../utils/encryption');

class WebhookListenerService {
  constructor(discordClient) {
    this.client = discordClient;
    this.server = null;
  }

  /**
   * Process incoming webhook message
   * @param {Object} payload - Incoming webhook payload
   * @returns {Promise<Object>} {success: boolean, error: string|null, messageId: string|null}
   */
  async processIncomingMessage(payload) {
    try {
      // Validate payload
      const validation = this.validateIncomingPayload(payload);
      if (!validation.valid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`,
          messageId: null,
        };
      }

      // Get the channel
      const channel = this.client.channels.cache.get(payload.channel);
      if (!channel) {
        logError(
          'WebhookListenerService.processIncomingMessage',
          `Channel not found: ${payload.channel}`,
          ERROR_LEVELS.MEDIUM
        );
        return {
          success: false,
          error: 'Channel not found or bot lacks access',
          messageId: null,
        };
      }

      // Send message to Discord channel
      const sentMessage = await channel.send(payload.content);

      return {
        success: true,
        error: null,
        messageId: sentMessage.id,
      };
    } catch (err) {
      logError('WebhookListenerService.processIncomingMessage', err, ERROR_LEVELS.MEDIUM, {
        channel: payload?.channel,
      });
      return {
        success: false,
        error: err.message || 'Failed to process incoming message',
        messageId: null,
      };
    }
  }

  /**
   * Validate incoming webhook payload
   * @param {Object} payload - Incoming payload
   * @returns {Object} {valid: boolean, errors: Array}
   */
  validateIncomingPayload(payload) {
    const result = parseIncomingPayload(payload);
    return {
      valid: result.valid,
      errors: result.errors || [],
    };
  }

  /**
   * Generate HMAC signature for payload
   * @param {Object} payload - Payload to sign
   * @param {string} secret - Secret key
   * @returns {string} HMAC signature
   */
  generateSignature(payload, secret) {
    const payloadString = JSON.stringify(payload);
    return createHmacSignature(payloadString, secret);
  }

  /**
   * Verify HMAC signature
   * @param {Object} payload - Payload to verify
   * @param {string} signature - Signature to verify
   * @param {string} secret - Secret key
   * @returns {boolean} True if signature is valid
   */
  verifySignature(payload, signature, secret) {
    try {
      const payloadString = JSON.stringify(payload);
      return verifyHmacSignature(payloadString, signature, secret);
    } catch (err) {
      logError('WebhookListenerService.verifySignature', err, ERROR_LEVELS.LOW);
      return false;
    }
  }

  /**
   * Start HTTP server to listen for webhooks
   * @param {number} port - Port number
   * @param {string} secret - Webhook secret for verification
   * @returns {Promise<void>}
   */
  async startServer(port, secret) {
    if (this.server) {
      throw new Error('Server is already running');
    }

    return new Promise((resolve, reject) => {
      this.server = http.createServer(async (req, res) => {
        // Only accept POST requests
        if (req.method !== 'POST') {
          res.writeHead(405, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        // Only accept /webhook path
        if (req.url !== '/webhook') {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Not found' }));
          return;
        }

        // Read request body
        let body = '';
        req.on('data', (chunk) => {
          body += chunk.toString();
        });

        req.on('end', async () => {
          try {
            const payload = JSON.parse(body);

            // Verify signature if secret is provided
            if (secret) {
              const signature = req.headers['x-webhook-signature'];
              if (!signature || !this.verifySignature(payload, signature, secret)) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid signature' }));
                return;
              }
            }

            // Process the message
            const result = await this.processIncomingMessage(payload);

            if (result.success) {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify({
                  success: true,
                  messageId: result.messageId,
                })
              );
            } else {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify({
                  success: false,
                  error: result.error,
                })
              );
            }
          } catch (err) {
            logError('WebhookListenerService.handleRequest', err, ERROR_LEVELS.MEDIUM);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                success: false,
                error: 'Internal server error',
              })
            );
          }
        });
      });

      this.server.listen(port, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log(`Webhook listener started on port ${port}`);
          resolve();
        }
      });
    });
  }

  /**
   * Stop HTTP server
   * @returns {Promise<void>}
   */
  async stopServer() {
    if (!this.server) {
      return;
    }

    return new Promise((resolve) => {
      this.server.close(() => {
        console.log('Webhook listener stopped');
        this.server = null;
        resolve();
      });
    });
  }

  /**
   * Check if server is running
   * @returns {boolean}
   */
  isRunning() {
    return this.server !== null;
  }
}

module.exports = WebhookListenerService;
