/**
 * Global Proxy Configuration Service (Phase 23.0 EXPANDED)
 * 
 * Consolidated service managing ALL global proxy configuration:
 * - HTTP Proxy: URL, username, password, enabled state
 * - Webhook Proxy: URL, token, secret, monitored channels, enabled state
 * 
 * All credentials are encrypted before storage.
 * Configuration is cached in memory for performance (5-minute TTL).
 * 
 * Storage: Global root database (not guild-scoped)
 * Table: global_config (key-value pairs)
 * 
 * Replaces:
 * - ProxyConfigService (webhook proxy)
 * - HTTP proxy wrapper functionality
 */

const crypto = require('crypto');
const { getDatabase } = require('./DatabaseService');

// Encryption key derivation
const ENCRYPTION_KEY = crypto
  .createHash('sha256')
  .update(process.env.ENCRYPTION_SECRET || 'default-insecure-key')
  .digest();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const ALGORITHM = 'aes-256-cbc';

// Configuration keys
const CONFIG_KEYS = {
  // HTTP Proxy
  HTTP_PROXY_URL: 'http_proxy_url',
  HTTP_PROXY_USERNAME: 'http_proxy_username',
  HTTP_PROXY_PASSWORD: 'http_proxy_password',
  HTTP_PROXY_ENABLED: 'http_proxy_enabled',
  // Webhook Proxy
  WEBHOOK_URL: 'webhook_url',
  WEBHOOK_TOKEN: 'webhook_token',
  WEBHOOK_SECRET: 'webhook_secret',
  WEBHOOK_MONITORED_CHANNELS: 'webhook_monitored_channels',
  WEBHOOK_ENABLED: 'webhook_enabled',
};

class GlobalProxyConfigService {
  constructor() {
    this.cache = {};
    this.cacheTTL = {};
  }

  /**
   * Get database connection
   * @private
   */
  _getDb() {
    return getDatabase();
  }

  /**
   * Encrypt sensitive data
   * @private
   */
  _encrypt(text) {
    // Allow empty string, but reject null/undefined
    if (text === null || text === undefined) return null;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt sensitive data
   * @private
   */
  _decrypt(encrypted) {
    // Allow decryption of all non-null/undefined values
    if (encrypted === null || encrypted === undefined) return null;
    const parts = encrypted.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(parts[1], 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Get value from database or cache
   * @private
   */
  async _getDbValue(key) {
    return new Promise((resolve, reject) => {
      const db = this._getDb();
      db.get(
        'SELECT value FROM global_config WHERE key = ?',
        [key],
        (err, row) => {
          if (err) reject(err);
          else resolve(row ? row.value : null);
        }
      );
    });
  }

  /**
   * Set value in database and update cache
   * @private
   */
  async _setDbValue(key, value) {
    return new Promise((resolve, reject) => {
      const db = this._getDb();
      const now = new Date().toISOString();
      db.run(
        `INSERT INTO global_config (key, value, updated_at) 
         VALUES (?, ?, ?) 
         ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = ?`,
        [key, value, now, value, now],
        (err) => {
          if (err) reject(err);
          else {
            // Update cache
            this.cache[key] = value;
            this.cacheTTL[key] = Date.now() + CACHE_TTL;
            resolve();
          }
        }
      );
    });
  }

  /**
   * Delete value from database and cache
   * @private
   */
  async _deleteDbValue(key) {
    return new Promise((resolve, reject) => {
      const db = this._getDb();
      db.run('DELETE FROM global_config WHERE key = ?', [key], (err) => {
        if (err) reject(err);
        else {
          delete this.cache[key];
          delete this.cacheTTL[key];
          resolve();
        }
      });
    });
  }

  /**
   * Get proxy URL
   * @returns {Promise<string|null>}
   */
  async getProxyUrl() {
    try {
      return await this._getDbValue(CONFIG_KEYS.HTTP_PROXY_URL);
    } catch (err) {
      console.error('GlobalProxyConfigService.getProxyUrl error:', err);
      throw err;
    }
  }

  /**
   * Set proxy URL
   * @param {string} url - Proxy URL (e.g., http://proxy.example.com:8080)
   */
  async setProxyUrl(url) {
    try {
      // Only delete on null/undefined
      // Empty string should be stored as-is
      if (url === null || url === undefined) {
        await this._deleteDbValue(CONFIG_KEYS.HTTP_PROXY_URL);
      } else {
        // Store as-is, including empty string and whitespace
        await this._setDbValue(CONFIG_KEYS.HTTP_PROXY_URL, url);
      }
    } catch (err) {
      console.error('GlobalProxyConfigService.setProxyUrl error:', err);
      throw err;
    }
  }

  /**
   * Get proxy username
   * @returns {Promise<string|null>}
   */
  async getProxyUsername() {
    try {
      const encrypted = await this._getDbValue(CONFIG_KEYS.HTTP_PROXY_USERNAME);
      return encrypted ? this._decrypt(encrypted) : null;
    } catch (err) {
      console.error('GlobalProxyConfigService.getProxyUsername error:', err);
      throw err;
    }
  }

  /**
   * Set proxy username (encrypted)
   * @param {string} username - Username to encrypt and store
   */
  async setProxyUsername(username) {
    try {
      if (username === null || username === undefined) {
        await this._deleteDbValue(CONFIG_KEYS.HTTP_PROXY_USERNAME);
      } else {
        // Allow empty string - encrypt it
        const encrypted = this._encrypt(username);
        await this._setDbValue(CONFIG_KEYS.HTTP_PROXY_USERNAME, encrypted);
      }
    } catch (err) {
      console.error('GlobalProxyConfigService.setProxyUsername error:', err);
      throw err;
    }
  }

  /**
   * Get proxy password (decrypted)
   * @returns {Promise<string|null>}
   */
  async getProxyPassword() {
    try {
      const encrypted = await this._getDbValue(CONFIG_KEYS.HTTP_PROXY_PASSWORD);
      return encrypted ? this._decrypt(encrypted) : null;
    } catch (err) {
      console.error('GlobalProxyConfigService.getProxyPassword error:', err);
      throw err;
    }
  }

  /**
   * Set HTTP proxy password (encrypted)
   * @param {string} password - Password to encrypt and store
   */
  async setProxyPassword(password) {
    try {
      if (password === null || password === undefined) {
        await this._deleteDbValue(CONFIG_KEYS.HTTP_PROXY_PASSWORD);
      } else {
        // Allow empty string - encrypt it
        const encrypted = this._encrypt(password);
        await this._setDbValue(CONFIG_KEYS.HTTP_PROXY_PASSWORD, encrypted);
      }
    } catch (err) {
      console.error('GlobalProxyConfigService.setProxyPassword error:', err);
      throw err;
    }
  }

  /**
   * Check if proxy is enabled
   * @returns {Promise<boolean>}
   */
  async isProxyEnabled() {
    try {
      const value = await this._getDbValue(CONFIG_KEYS.HTTP_PROXY_ENABLED);
      return value === '1' || value === 1;
    } catch (err) {
      console.error('GlobalProxyConfigService.isProxyEnabled error:', err);
      return false;
    }
  }

  /**
   * Set proxy enabled/disabled state
   * @param {boolean} enabled - Enable or disable proxy
   */
  async setProxyEnabled(enabled) {
    try {
      await this._setDbValue(CONFIG_KEYS.HTTP_PROXY_ENABLED, enabled ? '1' : '0');
    } catch (err) {
      console.error('GlobalProxyConfigService.setProxyEnabled error:', err);
      throw err;
    }
  }

  /**
   * Get complete proxy configuration
   * @returns {Promise<Object>}
   */
  async getFullProxyConfig() {
    try {
      const [url, username, password, enabled] = await Promise.all([
        this.getProxyUrl(),
        this.getProxyUsername(),
        this.getProxyPassword(),
        this.isProxyEnabled(),
      ]);

      return {
        url,
        username,
        password,
        enabled,
      };
    } catch (err) {
      console.error('GlobalProxyConfigService.getFullProxyConfig error:', err);
      throw err;
    }
  }

  /**
   * Get all configuration values from database
   * @private
   */
  async _getAllDbValues() {
    return new Promise((resolve, reject) => {
      const db = this._getDb();
      db.all(
        'SELECT key, value FROM global_config',
        [],
        (err, rows) => {
          if (err) reject(err);
          else {
            const result = {};
            (rows || []).forEach((row) => {
              result[row.key] = row.value;
            });
            resolve(result);
          }
        }
      );
    });
  }

  // =====================================================================
  // WEBHOOK PROXY METHODS
  // =====================================================================

  /**
   * Get webhook URL
   * @returns {Promise<string|null>}
   */
  async getWebhookUrl() {
    try {
      return await this._getDbValue(CONFIG_KEYS.WEBHOOK_URL);
    } catch (err) {
      console.error('GlobalProxyConfigService.getWebhookUrl error:', err);
      return null;
    }
  }

  /**
   * Set webhook URL
   * @param {string} url - Webhook URL
   */
  async setWebhookUrl(url) {
    try {
      // Only delete on null/undefined
      // Empty string should be stored as-is
      if (url === null || url === undefined) {
        await this._deleteDbValue(CONFIG_KEYS.WEBHOOK_URL);
      } else {
        // Store as-is, including empty string and whitespace
        await this._setDbValue(CONFIG_KEYS.WEBHOOK_URL, url);
      }
    } catch (err) {
      console.error('GlobalProxyConfigService.setWebhookUrl error:', err);
      throw err;
    }
  }

  /**
   * Get webhook token (decrypted)
   * @returns {Promise<string|null>}
   */
  async getWebhookToken() {
    try {
      const encrypted = await this._getDbValue(CONFIG_KEYS.WEBHOOK_TOKEN);
      return encrypted ? this._decrypt(encrypted) : null;
    } catch (err) {
      console.error('GlobalProxyConfigService.getWebhookToken error:', err);
      return null;
    }
  }

  /**
   * Set webhook token (encrypted)
   * @param {string} token - Token to encrypt and store
   */
  async setWebhookToken(token) {
    try {
      if (token === null || token === undefined) {
        await this._deleteDbValue(CONFIG_KEYS.WEBHOOK_TOKEN);
      } else {
        // Allow empty string - encrypt it
        const encrypted = this._encrypt(token);
        await this._setDbValue(CONFIG_KEYS.WEBHOOK_TOKEN, encrypted);
      }
    } catch (err) {
      console.error('GlobalProxyConfigService.setWebhookToken error:', err);
      throw err;
    }
  }

  /**
   * Get webhook secret (decrypted)
   * @returns {Promise<string|null>}
   */
  async getWebhookSecret() {
    try {
      const encrypted = await this._getDbValue(CONFIG_KEYS.WEBHOOK_SECRET);
      return encrypted ? this._decrypt(encrypted) : null;
    } catch (err) {
      console.error('GlobalProxyConfigService.getWebhookSecret error:', err);
      return null;
    }
  }

  /**
   * Set webhook secret (encrypted)
   * @param {string} secret - Secret to encrypt and store
   */
  async setWebhookSecret(secret) {
    try {
      if (secret === null || secret === undefined) {
        await this._deleteDbValue(CONFIG_KEYS.WEBHOOK_SECRET);
      } else {
        // Allow empty string - encrypt it
        const encrypted = this._encrypt(secret);
        await this._setDbValue(CONFIG_KEYS.WEBHOOK_SECRET, encrypted);
      }
    } catch (err) {
      console.error('GlobalProxyConfigService.setWebhookSecret error:', err);
      throw err;
    }
  }

  /**
   * Get monitored channels array
   * @returns {Promise<Array<string>>}
   */
  async getMonitoredChannels() {
    try {
      const value = await this._getDbValue(CONFIG_KEYS.WEBHOOK_MONITORED_CHANNELS);
      if (!value) return [];
      return JSON.parse(value);
    } catch (err) {
      console.error('GlobalProxyConfigService.getMonitoredChannels error:', err);
      return [];
    }
  }

  /**
   * Set monitored channels array
   * @param {Array<string>} channels - Channel IDs to monitor
   */
  async setMonitoredChannels(channels) {
    try {
      if (!channels || channels.length === 0) {
        await this._deleteDbValue(CONFIG_KEYS.WEBHOOK_MONITORED_CHANNELS);
      } else {
        const value = JSON.stringify(channels);
        await this._setDbValue(CONFIG_KEYS.WEBHOOK_MONITORED_CHANNELS, value);
      }
    } catch (err) {
      console.error('GlobalProxyConfigService.setMonitoredChannels error:', err);
      throw err;
    }
  }

  /**
   * Add single channel to monitored list
   * @param {string} channelId - Channel ID to add
   */
  async addMonitoredChannel(channelId) {
    try {
      const channels = await this.getMonitoredChannels();
      if (!channels.includes(channelId)) {
        channels.push(channelId);
        await this.setMonitoredChannels(channels);
      }
    } catch (err) {
      console.error('GlobalProxyConfigService.addMonitoredChannel error:', err);
      throw err;
    }
  }

  /**
   * Remove single channel from monitored list
   * @param {string} channelId - Channel ID to remove
   */
  async removeMonitoredChannel(channelId) {
    try {
      const channels = await this.getMonitoredChannels();
      const filtered = channels.filter((id) => id !== channelId);
      if (filtered.length === 0) {
        await this._deleteDbValue(CONFIG_KEYS.WEBHOOK_MONITORED_CHANNELS);
      } else {
        await this.setMonitoredChannels(filtered);
      }
    } catch (err) {
      console.error('GlobalProxyConfigService.removeMonitoredChannel error:', err);
      throw err;
    }
  }

  /**
   * Check if webhook is enabled
   * @returns {Promise<boolean>}
   */
  async isWebhookEnabled() {
    try {
      const value = await this._getDbValue(CONFIG_KEYS.WEBHOOK_ENABLED);
      return value === '1' || value === 1;
    } catch (err) {
      console.error('GlobalProxyConfigService.isWebhookEnabled error:', err);
      return false;
    }
  }

  /**
   * Set webhook enabled state
   * @param {boolean} enabled
   */
  async setWebhookEnabled(enabled) {
    try {
      await this._setDbValue(CONFIG_KEYS.WEBHOOK_ENABLED, enabled ? '1' : '0');
    } catch (err) {
      console.error('GlobalProxyConfigService.setWebhookEnabled error:', err);
      throw err;
    }
  }

  // =====================================================================
  // UNIFIED CONFIGURATION METHODS
  // =====================================================================

  /**
   * Get all configuration (without sensitive data like passwords/tokens/secrets)
   * @returns {Promise<Object>}
   */
  async getAllConfig() {
    try {
      const all = await this._getAllDbValues();

      const httpPassword = all[CONFIG_KEYS.HTTP_PROXY_PASSWORD];
      const webhookToken = all[CONFIG_KEYS.WEBHOOK_TOKEN];
      const webhookSecret = all[CONFIG_KEYS.WEBHOOK_SECRET];
      
      // Decrypt username since it's non-sensitive in the context of "all config"
      const encryptedUsername = all[CONFIG_KEYS.HTTP_PROXY_USERNAME];
      const username = encryptedUsername ? this._decrypt(encryptedUsername) : null;

      const monitoredChannels = all[CONFIG_KEYS.WEBHOOK_MONITORED_CHANNELS]
        ? JSON.parse(all[CONFIG_KEYS.WEBHOOK_MONITORED_CHANNELS])
        : [];

      return {
        httpProxy: {
          url: all[CONFIG_KEYS.HTTP_PROXY_URL] || null,
          username: username,
          enabled: (all[CONFIG_KEYS.HTTP_PROXY_ENABLED] === '1'),
          hasPassword: !!httpPassword,
        },
        webhook: {
          url: all[CONFIG_KEYS.WEBHOOK_URL] || null,
          hasToken: !!webhookToken,
          hasSecret: !!webhookSecret,
          monitoredChannels,
          enabled: (all[CONFIG_KEYS.WEBHOOK_ENABLED] === '1'),
        },
        lastUpdated: new Date().toISOString(),
      };
    } catch (err) {
      console.error('GlobalProxyConfigService.getAllConfig error:', err);
      throw err;
    }
  }

  /**
   * Get full configuration (with sensitive data - USE CAREFULLY)
   * @returns {Promise<Object>}
   */
  async getFullConfig() {
    try {
      const [
        httpProxyUrl,
        httpProxyUsername,
        httpProxyPassword,
        httpProxyEnabled,
        webhookUrl,
        webhookToken,
        webhookSecret,
        monitoredChannels,
        webhookEnabled,
      ] = await Promise.all([
        this.getProxyUrl(),
        this.getProxyUsername(),
        this.getProxyPassword(),
        this.isProxyEnabled(),
        this.getWebhookUrl(),
        this.getWebhookToken(),
        this.getWebhookSecret(),
        this.getMonitoredChannels(),
        this.isWebhookEnabled(),
      ]);

      return {
        httpProxy: {
          url: httpProxyUrl,
          username: httpProxyUsername,
          password: httpProxyPassword,
          enabled: httpProxyEnabled,
        },
        webhook: {
          url: webhookUrl,
          token: webhookToken,
          secret: webhookSecret,
          monitoredChannels,
          enabled: webhookEnabled,
        },
        lastUpdated: new Date().toISOString(),
      };
    } catch (err) {
      console.error('GlobalProxyConfigService.getFullConfig error:', err);
      throw err;
    }
  }

  /**
   * Delete HTTP proxy configuration only
   * @returns {Promise<void>}
   */
  async deleteHttpProxyConfig() {
    try {
      const keys = [
        CONFIG_KEYS.HTTP_PROXY_URL,
        CONFIG_KEYS.HTTP_PROXY_USERNAME,
        CONFIG_KEYS.HTTP_PROXY_PASSWORD,
        CONFIG_KEYS.HTTP_PROXY_ENABLED,
      ];
      await Promise.all(keys.map((key) => this._deleteDbValue(key)));
    } catch (err) {
      console.error('GlobalProxyConfigService.deleteHttpProxyConfig error:', err);
      throw err;
    }
  }

  /**
   * Delete webhook configuration only
   * @returns {Promise<void>}
   */
  async deleteWebhookConfig() {
    try {
      const keys = [
        CONFIG_KEYS.WEBHOOK_URL,
        CONFIG_KEYS.WEBHOOK_TOKEN,
        CONFIG_KEYS.WEBHOOK_SECRET,
        CONFIG_KEYS.WEBHOOK_MONITORED_CHANNELS,
        CONFIG_KEYS.WEBHOOK_ENABLED,
      ];
      await Promise.all(keys.map((key) => this._deleteDbValue(key)));
    } catch (err) {
      console.error('GlobalProxyConfigService.deleteWebhookConfig error:', err);
      throw err;
    }
  }

  /**
   * Delete all configuration (legacy method for backward compatibility)
   * @returns {Promise<void>}
   */
  async deleteAllProxyConfig() {
    return this.deleteHttpProxyConfig();
  }

  /**
   * Delete all configuration
   * @returns {Promise<void>}
   */
  async deleteAllConfig() {
    try {
      await Promise.all([this.deleteHttpProxyConfig(), this.deleteWebhookConfig()]);
    } catch (err) {
      console.error('GlobalProxyConfigService.deleteAllConfig error:', err);
      throw err;
    }
  }

  /**
   * Validate HTTP proxy configuration
   * @returns {Promise<boolean>}
   */
  async validateProxyConfig() {
    try {
      const url = await this.getProxyUrl();
      if (!url) return false;
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    } catch (err) {
      console.error('GlobalProxyConfigService.validateProxyConfig error:', err);
      return false;
    }
  }

  /**
   * Validate webhook configuration
   * @returns {Promise<boolean>}
   */
  async validateWebhookConfig() {
    try {
      const url = await this.getWebhookUrl();
      if (!url) return false;
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    } catch (err) {
      console.error('GlobalProxyConfigService.validateWebhookConfig error:', err);
      return false;
    }
  }

  /**
   * Clear cache (for testing)
   * @private
   */
  _clearCache() {
    this.cache = {};
    this.cacheTTL = {};
  }
}

module.exports = new GlobalProxyConfigService();
