/**
 * Proxy Configuration Service
 * Manages proxy settings and configuration storage
 */

const { encryptValue, decryptValue } = require('../utils/encryption');
const { logError, ERROR_LEVELS } = require('../middleware/errorHandler');

// Configuration keys
const CONFIG_KEYS = {
  WEBHOOK_URL: 'webhook_url',
  WEBHOOK_TOKEN: 'webhook_token',
  MONITORED_CHANNELS: 'monitored_channels',
  PROXY_ENABLED: 'proxy_enabled',
  LISTENER_PORT: 'listener_port',
  WEBHOOK_SECRET: 'webhook_secret'
};

class ProxyConfigService {
  constructor(databaseService) {
    this.db = databaseService;
  }

  /**
   * Set webhook URL
   * @param {string} url - Webhook URL
   * @returns {Promise<boolean>}
   */
  async setWebhookUrl(url) {
    try {
      await this.db.setProxyConfig(CONFIG_KEYS.WEBHOOK_URL, url, false);
      return true;
    } catch (err) {
      logError('ProxyConfigService.setWebhookUrl', err, ERROR_LEVELS.MEDIUM);
      throw err;
    }
  }

  /**
   * Get webhook URL
   * @returns {Promise<string|null>}
   */
  async getWebhookUrl() {
    try {
      const config = await this.db.getProxyConfig(CONFIG_KEYS.WEBHOOK_URL);
      return config ? config.value : null;
    } catch (err) {
      logError('ProxyConfigService.getWebhookUrl', err, ERROR_LEVELS.LOW);
      return null;
    }
  }

  /**
   * Set webhook token (encrypted)
   * @param {string} token - Webhook token
   * @returns {Promise<boolean>}
   */
  async setWebhookToken(token) {
    try {
      const encrypted = encryptValue(token);
      await this.db.setProxyConfig(CONFIG_KEYS.WEBHOOK_TOKEN, encrypted, true);
      return true;
    } catch (err) {
      logError('ProxyConfigService.setWebhookToken', err, ERROR_LEVELS.MEDIUM);
      throw err;
    }
  }

  /**
   * Get webhook token (decrypted)
   * @returns {Promise<string|null>}
   */
  async getWebhookToken() {
    try {
      const config = await this.db.getProxyConfig(CONFIG_KEYS.WEBHOOK_TOKEN);
      if (!config) return null;

      return decryptValue(config.value);
    } catch (err) {
      logError('ProxyConfigService.getWebhookToken', err, ERROR_LEVELS.MEDIUM);
      return null;
    }
  }

  /**
   * Set monitored channels
   * @param {Array<string>} channels - Array of channel IDs
   * @returns {Promise<boolean>}
   */
  async setMonitoredChannels(channels) {
    try {
      const value = JSON.stringify(channels);
      await this.db.setProxyConfig(CONFIG_KEYS.MONITORED_CHANNELS, value, false);
      return true;
    } catch (err) {
      logError('ProxyConfigService.setMonitoredChannels', err, ERROR_LEVELS.MEDIUM);
      throw err;
    }
  }

  /**
   * Get monitored channels
   * @returns {Promise<Array<string>>}
   */
  async getMonitoredChannels() {
    try {
      const config = await this.db.getProxyConfig(CONFIG_KEYS.MONITORED_CHANNELS);
      if (!config) return [];

      return JSON.parse(config.value);
    } catch (err) {
      logError('ProxyConfigService.getMonitoredChannels', err, ERROR_LEVELS.LOW);
      return [];
    }
  }

  /**
   * Enable or disable proxy
   * @param {boolean} enabled - Enable/disable proxy
   * @returns {Promise<boolean>}
   */
  async setProxyEnabled(enabled) {
    try {
      await this.db.setProxyConfig(CONFIG_KEYS.PROXY_ENABLED, enabled ? '1' : '0', false);
      return true;
    } catch (err) {
      logError('ProxyConfigService.setProxyEnabled', err, ERROR_LEVELS.MEDIUM);
      throw err;
    }
  }

  /**
   * Check if proxy is enabled
   * @returns {Promise<boolean>}
   */
  async isProxyEnabled() {
    try {
      const config = await this.db.getProxyConfig(CONFIG_KEYS.PROXY_ENABLED);
      return config ? config.value === '1' : false;
    } catch (err) {
      logError('ProxyConfigService.isProxyEnabled', err, ERROR_LEVELS.LOW);
      return false;
    }
  }

  /**
   * Set webhook secret for signature verification
   * @param {string} secret - Webhook secret
   * @returns {Promise<boolean>}
   */
  async setWebhookSecret(secret) {
    try {
      const encrypted = encryptValue(secret);
      await this.db.setProxyConfig(CONFIG_KEYS.WEBHOOK_SECRET, encrypted, true);
      return true;
    } catch (err) {
      logError('ProxyConfigService.setWebhookSecret', err, ERROR_LEVELS.MEDIUM);
      throw err;
    }
  }

  /**
   * Get webhook secret (decrypted)
   * @returns {Promise<string|null>}
   */
  async getWebhookSecret() {
    try {
      const config = await this.db.getProxyConfig(CONFIG_KEYS.WEBHOOK_SECRET);
      if (!config) return null;

      return decryptValue(config.value);
    } catch (err) {
      logError('ProxyConfigService.getWebhookSecret', err, ERROR_LEVELS.MEDIUM);
      return null;
    }
  }

  /**
   * Get all configuration (without sensitive data)
   * @returns {Promise<Object>}
   */
  async getAllConfig() {
    try {
      // Get all config entries in a single database call
      const allEntries = await this.db.getAllProxyConfig();

      // Process entries
      const config = {
        webhookUrl: null,
        monitoredChannels: [],
        enabled: false,
        hasToken: false,
        hasSecret: false
      };

      for (const entry of allEntries) {
        switch (entry.key) {
          case CONFIG_KEYS.WEBHOOK_URL:
            config.webhookUrl = entry.value;
            break;
          case CONFIG_KEYS.WEBHOOK_TOKEN:
            config.hasToken = true;
            break;
          case CONFIG_KEYS.WEBHOOK_SECRET:
            config.hasSecret = true;
            break;
          case CONFIG_KEYS.MONITORED_CHANNELS:
            try {
              config.monitoredChannels = JSON.parse(entry.value);
            } catch (err) {
              logError('ProxyConfigService.getAllConfig.parseChannels', err, ERROR_LEVELS.LOW);
              config.monitoredChannels = [];
            }
            break;
          case CONFIG_KEYS.PROXY_ENABLED:
            config.enabled = entry.value === '1';
            break;
        }
      }

      return config;
    } catch (err) {
      logError('ProxyConfigService.getAllConfig', err, ERROR_LEVELS.MEDIUM);
      return {
        webhookUrl: null,
        monitoredChannels: [],
        enabled: false,
        hasToken: false,
        hasSecret: false
      };
    }
  }

  /**
   * Clear all proxy configuration
   * @returns {Promise<boolean>}
   */
  async clearAllConfig() {
    try {
      await Promise.all(
        Object.values(CONFIG_KEYS).map(key =>
          this.db.deleteProxyConfig(key).catch(() => {})
        )
      );
      return true;
    } catch (err) {
      logError('ProxyConfigService.clearAllConfig', err, ERROR_LEVELS.MEDIUM);
      return false;
    }
  }
}

module.exports = ProxyConfigService;
