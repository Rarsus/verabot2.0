/**
 * WebSocket Service
 *
 * Manages WebSocket connections to external services (e.g., XToys webhook).
 * Handles connection lifecycle, message parsing, action validation, and reconnection.
 *
 * Features:
 * - Multi-connection support (multiple external services)
 * - Automatic reconnection with exponential backoff
 * - Message validation and action whitelisting
 * - Acknowledgment system for message handling
 * - Comprehensive logging and error handling
 * - Discord integration ready
 *
 * Usage:
 *   const wsService = require('./WebSocketService');
 *   await wsService.connect(serviceName, webhookUrl, allowedActions);
 *   await wsService.disconnect(serviceName);
 */

const { logError, logInfo, ERROR_LEVELS } = require('../middleware/errorHandler');

class WebSocketService {
  constructor() {
    // Map of serviceName -> WebSocket connection state
    this.connections = new Map();

    // Configuration
    this.reconnectDelay = 1000;
    this.maxReconnectDelay = 30000;
    this.reconnectTimeouts = new Map();
  }

  /**
   * Connect to external WebSocket service
   * @param {string} serviceName - Unique name for this service (e.g., 'xtoys', 'custom-api')
   * @param {string} webhookUrl - WebSocket URL to connect to
   * @param {Array<string>} allowedActions - List of approved action names to accept
   * @param {Function} actionHandler - Callback function(action, payload) to handle incoming actions
   * @returns {Promise<boolean>} True if connection successful
   */
  async connect(serviceName, webhookUrl, allowedActions, actionHandler) {
    if (!serviceName || !webhookUrl || !allowedActions || !actionHandler) {
      throw new Error('Missing required parameters: serviceName, webhookUrl, allowedActions, actionHandler');
    }

    // Check if already connected
    if (this.connections.has(serviceName)) {
      logError('WebSocket already connected to ' + serviceName, ERROR_LEVELS.MEDIUM, {
        serviceName,
        webhookUrl,
      });
      return false;
    }

    return new Promise((resolve) => {
      try {
        const WebSocket = require('ws');
        const ws = new WebSocket(webhookUrl);

        const connectionState = {
          serviceName,
          webhookUrl,
          ws,
          allowedActions: new Set(allowedActions),
          actionHandler,
          isConnected: false,
          shouldReconnect: true,
          reconnectDelay: this.reconnectDelay,
          messageCount: 0,
          errorCount: 0,
        };

        ws.on('open', () => {
          connectionState.isConnected = true;
          connectionState.reconnectDelay = this.reconnectDelay;
          logInfo(`WebSocket connected to ${serviceName}`, {
            serviceName,
            webhookUrl,
            allowedActions: Array.from(connectionState.allowedActions),
          });
          resolve(true);
        });

        ws.on('message', (data) => {
          this._handleMessage(connectionState, data);
        });

        ws.on('close', (code) => {
          connectionState.isConnected = false;
          logInfo(`WebSocket closed: ${serviceName} (code=${code})`, {
            serviceName,
            code,
            messageCount: connectionState.messageCount,
            errorCount: connectionState.errorCount,
          });

          if (connectionState.shouldReconnect) {
            this._scheduleReconnect(connectionState);
          }
        });

        ws.on('error', (err) => {
          connectionState.errorCount++;
          logError(`WebSocket error: ${serviceName}`, ERROR_LEVELS.MEDIUM, {
            serviceName,
            error: err.message,
            errorCount: connectionState.errorCount,
          });
        });

        this.connections.set(serviceName, connectionState);
      } catch (err) {
        logError(`Failed to create WebSocket connection to ${serviceName}`, ERROR_LEVELS.HIGH, {
          serviceName,
          error: err.message,
        });
        resolve(false);
      }
    });
  }

  /**
   * Disconnect from WebSocket service
   * @param {string} serviceName - Service name to disconnect
   * @returns {Promise<boolean>} True if disconnected successfully
   */
  async disconnect(serviceName) {
    const state = this.connections.get(serviceName);
    if (!state) {
      logError(`WebSocket not connected: ${serviceName}`, ERROR_LEVELS.LOW, { serviceName });
      return false;
    }

    try {
      state.shouldReconnect = false;
      if (state.ws && state.ws.readyState === 1) {
        // WebSocket.OPEN
        state.ws.close();
      }
      this.connections.delete(serviceName);
      logInfo(`WebSocket disconnected: ${serviceName}`, { serviceName });
      return true;
    } catch (err) {
      logError(`Error disconnecting WebSocket: ${serviceName}`, ERROR_LEVELS.MEDIUM, {
        serviceName,
        error: err.message,
      });
      return false;
    }
  }

  /**
   * Send data to WebSocket
   * @param {string} serviceName - Target service
   * @param {Object} payload - Data to send
   * @returns {boolean} True if sent successfully
   */
  send(serviceName, payload) {
    const state = this.connections.get(serviceName);
    if (!state || !state.isConnected || !state.ws || state.ws.readyState !== 1) {
      logError(`Cannot send: WebSocket not connected to ${serviceName}`, ERROR_LEVELS.LOW, {
        serviceName,
        connected: state ? state.isConnected : false,
      });
      return false;
    }

    try {
      state.ws.send(JSON.stringify(payload));
      logInfo(`WebSocket message sent to ${serviceName}`, {
        serviceName,
        payloadKeys: Object.keys(payload),
      });
      return true;
    } catch (err) {
      logError(`Failed to send WebSocket message to ${serviceName}`, ERROR_LEVELS.MEDIUM, {
        serviceName,
        error: err.message,
      });
      return false;
    }
  }

  /**
   * Send acknowledgment message
   * @private
   * @param {Object} state - Connection state
   * @param {Object} payload - Ack payload
   */
  _sendAck(state, payload) {
    const ackPayload = { __ack: true, ...payload };
    try {
      if (state.ws && state.ws.readyState === 1) {
        state.ws.send(JSON.stringify(ackPayload));
        logInfo(`Ack sent to ${state.serviceName}`, {
          serviceName: state.serviceName,
          status: payload.status,
        });
      }
    } catch (err) {
      logError(`Failed to send ack to ${state.serviceName}`, ERROR_LEVELS.LOW, {
        serviceName: state.serviceName,
        error: err.message,
      });
    }
  }

  /**
   * Handle incoming message
   * @private
   * @param {Object} state - Connection state
   * @param {string} data - Raw message data
   */
  _handleMessage(state, data) {
    try {
      const msg = JSON.parse(data);
      state.messageCount++;

      // Validate message structure
      if (!msg.action || typeof msg.action !== 'string') {
        logError(`Invalid message from ${state.serviceName}: missing or invalid action`, ERROR_LEVELS.LOW, {
          serviceName: state.serviceName,
          messageKeys: Object.keys(msg),
        });
        this._sendAck(state, {
          status: 'error',
          reason: 'invalid_action_field',
          message: 'Action field missing or not a string',
        });
        return;
      }

      // Validate action is approved
      if (!state.allowedActions.has(msg.action)) {
        logError(`Unauthorized action from ${state.serviceName}: ${msg.action}`, ERROR_LEVELS.MEDIUM, {
          serviceName: state.serviceName,
          action: msg.action,
          allowedActions: Array.from(state.allowedActions),
        });
        this._sendAck(state, {
          status: 'error',
          reason: 'unauthorized_action',
          action: msg.action,
          message: 'Action not in approved list',
        });
        return;
      }

      // Execute action handler
      try {
        state.actionHandler(msg.action, msg);
        this._sendAck(state, {
          status: 'ok',
          action: msg.action,
          message: 'Action processed successfully',
        });
        logInfo(`Action processed from ${state.serviceName}: ${msg.action}`, {
          serviceName: state.serviceName,
          action: msg.action,
          messageCount: state.messageCount,
        });
      } catch (err) {
        logError(`Handler error for action ${msg.action} from ${state.serviceName}`, ERROR_LEVELS.MEDIUM, {
          serviceName: state.serviceName,
          action: msg.action,
          error: err.message,
        });
        this._sendAck(state, {
          status: 'error',
          reason: 'handler_error',
          action: msg.action,
          message: 'Error processing action',
        });
      }
    } catch (err) {
      logError(`Failed to parse WebSocket message from ${state.serviceName}`, ERROR_LEVELS.MEDIUM, {
        serviceName: state.serviceName,
        error: err.message,
      });
    }
  }

  /**
   * Schedule reconnection with exponential backoff
   * @private
   * @param {Object} state - Connection state
   */
  _scheduleReconnect(state) {
    // Clear existing timeout
    if (this.reconnectTimeouts.has(state.serviceName)) {
      clearTimeout(this.reconnectTimeouts.get(state.serviceName));
    }

    const delay = state.reconnectDelay;
    logInfo(`WebSocket reconnect scheduled for ${state.serviceName} in ${delay}ms`, {
      serviceName: state.serviceName,
      delayMs: delay,
    });

    const timeout = setTimeout(() => {
      state.reconnectDelay = Math.min(state.reconnectDelay * 2, this.maxReconnectDelay);
      logInfo(`Attempting to reconnect ${state.serviceName}...`, {
        serviceName: state.serviceName,
      });
      this.connect(state.serviceName, state.webhookUrl, Array.from(state.allowedActions), state.actionHandler).catch(
        (err) => {
          logError(`Reconnection failed for ${state.serviceName}`, ERROR_LEVELS.MEDIUM, {
            serviceName: state.serviceName,
            error: err.message,
          });
        }
      );
    }, delay);

    this.reconnectTimeouts.set(state.serviceName, timeout);
  }

  /**
   * Get connection status for all or specific service
   * @param {string} [serviceName] - Optional service name to check
   * @returns {Object} Status information
   */
  getStatus(serviceName) {
    if (serviceName) {
      const state = this.connections.get(serviceName);
      if (!state) {
        return { serviceName, connected: false, reason: 'not_found' };
      }
      return {
        serviceName,
        connected: state.isConnected,
        webhookUrl: state.webhookUrl,
        allowedActions: Array.from(state.allowedActions),
        messageCount: state.messageCount,
        errorCount: state.errorCount,
      };
    }

    // Return all services
    const services = {};
    for (const [name, state] of this.connections) {
      services[name] = {
        connected: state.isConnected,
        messageCount: state.messageCount,
        errorCount: state.errorCount,
      };
    }
    return services;
  }

  /**
   * Get all connected service names
   * @returns {Array<string>} List of connected service names
   */
  getConnectedServices() {
    const connected = [];
    for (const [name, state] of this.connections) {
      if (state.isConnected) {
        connected.push(name);
      }
    }
    return connected;
  }

  /**
   * Check if service is connected
   * @param {string} serviceName - Service name
   * @returns {boolean} True if connected and ready
   */
  isConnected(serviceName) {
    const state = this.connections.get(serviceName);
    return state ? state.isConnected : false;
  }
}

module.exports = new WebSocketService();
