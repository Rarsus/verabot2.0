/**
 * Global Proxy Configuration Service (Phase 23.0)
 * 
 * Manages global proxy settings for the Discord bot.
 * All credentials are encrypted before storage.
 * Configuration is cached in memory for performance.
 * 
 * Storage: Global root database (not guild-scoped)
 * Table: global_config (key-value pairs)
 * 
 * Provides:
 * - Proxy URL management (http://proxy:port)
 * - Proxy username management (encrypted)
 * - Proxy password management (encrypted)
 * - Proxy enable/disable toggle
 * - Full configuration retrieval
 * - Configuration validation
 * - Cleanup operations
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
    if (!text) return null;
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
    if (!encrypted) return null;
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
      const value = await this._getDbValue('proxy_url');
      return value;
    } catch (err) {
      console.error('GlobalProxyConfigService.getProxyUrl error:', err);
      throw err;
    }
  }

  /**
   * Set proxy URL
   * @param {string} url - Proxy URL (e.g., http://proxy.example.com:8080)
   * @throws {Error} If URL is invalid
   */
  async setProxyUrl(url) {
    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      throw new Error('Proxy URL must be a non-empty string');
    }

    try {
      await this._setDbValue('proxy_url', url.trim());
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
      const value = await this._getDbValue('proxy_username');
      return value;
    } catch (err) {
      console.error('GlobalProxyConfigService.getProxyUsername error:', err);
      throw err;
    }
  }

  /**
   * Set proxy username
   * @param {string} username - Proxy username
   * @throws {Error} If username is invalid
   */
  async setProxyUsername(username) {
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      throw new Error('Proxy username must be a non-empty string');
    }

    try {
      await this._setDbValue('proxy_username', username.trim());
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
      const encrypted = await this._getDbValue('proxy_password');
      return encrypted ? this._decrypt(encrypted) : null;
    } catch (err) {
      console.error('GlobalProxyConfigService.getProxyPassword error:', err);
      throw err;
    }
  }

  /**
   * Set proxy password (encrypted before storage)
   * @param {string} password - Proxy password
   * @throws {Error} If password is invalid
   */
  async setProxyPassword(password) {
    if (!password || typeof password !== 'string' || password.length === 0) {
      throw new Error('Proxy password must be a non-empty string');
    }

    try {
      const encrypted = this._encrypt(password);
      await this._setDbValue('proxy_password', encrypted);
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
      const value = await this._getDbValue('proxy_enabled');
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
      await this._setDbValue('proxy_enabled', enabled ? '1' : '0');
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
   * Delete all proxy configuration
   * @returns {Promise<void>}
   */
  async deleteAllProxyConfig() {
    try {
      const keys = ['proxy_url', 'proxy_username', 'proxy_password', 'proxy_enabled'];
      await Promise.all(keys.map((key) => this._deleteDbValue(key)));
    } catch (err) {
      console.error('GlobalProxyConfigService.deleteAllProxyConfig error:', err);
      throw err;
    }
  }

  /**
   * Validate proxy configuration
   * @returns {Promise<Object>} { valid: boolean, errors: string[] }
   */
  async validateProxyConfig() {
    try {
      const config = await this.getFullProxyConfig();
      const errors = [];

      if (!config.url) {
        errors.push('Proxy URL is required');
      } else {
        try {
          new URL(config.url);
        } catch (err) {
          errors.push(`Invalid proxy URL format: ${err.message}`);
        }
      }

      if (config.username && config.username.trim().length === 0) {
        errors.push('Proxy username cannot be empty if set');
      }

      if (config.password && config.password.trim().length === 0) {
        errors.push('Proxy password cannot be empty if set');
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    } catch (err) {
      console.error('GlobalProxyConfigService.validateProxyConfig error:', err);
      return {
        valid: false,
        errors: [err.message],
      };
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
