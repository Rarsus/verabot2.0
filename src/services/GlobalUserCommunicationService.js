/**
 * Global User Communication Service (Phase 23.0)
 * 
 * Manages global user opt-in/opt-out status for DMs and communication features.
 * Users control whether they receive communication across all Discord servers the bot is in.
 * 
 * Storage: Global root database (not guild-scoped)
 * Table: user_communications (user_id, opted_in, created_at, updated_at)
 * 
 * Provides:
 * - User opt-in/opt-out operations
 * - Status checking (isOptedIn)
 * - Bulk operations for performance
 * - User listing operations
 * - Metadata retrieval (with timestamps)
 * - Cleanup operations
 * - Validation
 */

const { getDatabase } = require('./DatabaseService');

class GlobalUserCommunicationService {
  constructor() {}

  /**
   * Get database connection
   * @private
   */
  _getDb() {
    return getDatabase();
  }

  /**
   * Check if user has opted in to communication
   * @param {string} userId - Discord user ID
   * @returns {Promise<boolean>} True if opted in, false otherwise
   * @throws {Error} If userId is invalid
   */
  async isOptedIn(userId) {
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error('User ID must be a non-empty string');
    }

    try {
      return new Promise((resolve, reject) => {
        const db = this._getDb(); db.get(
          'SELECT opted_in FROM user_communications WHERE user_id = ? LIMIT 1',
          [userId.trim()],
          (err, row) => {
            if (err) {
              console.error('GlobalUserCommunicationService.isOptedIn error:', err);
              reject(err);
            } else {
              // Default to opted out if not found
              resolve(row ? row.opted_in === 1 : false);
            }
          }
        );
      });
    } catch (err) {
      console.error('GlobalUserCommunicationService.isOptedIn error:', err);
      throw err;
    }
  }

  /**
   * Opt user in to receive communications
   * @param {string} userId - Discord user ID
   * @param {string} timestamp - Optional: ISO timestamp (default: now)
   * @returns {Promise<void>}
   * @throws {Error} If userId is invalid
   */
  async optIn(userId, timestamp = null) {
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error('User ID must be a non-empty string');
    }

    const now = timestamp || new Date().toISOString();

    try {
      return new Promise((resolve, reject) => {
        const db = this._getDb(); db.run(
          `INSERT INTO user_communications (user_id, opted_in, created_at, updated_at)
           VALUES (?, 1, ?, ?)
           ON CONFLICT(user_id) DO UPDATE SET opted_in = 1, updated_at = ?`,
          [userId.trim(), now, now, now],
          (err) => {
            if (err) {
              console.error('GlobalUserCommunicationService.optIn error:', err);
              reject(err);
            } else {
              resolve();
            }
          }
        );
      });
    } catch (err) {
      console.error('GlobalUserCommunicationService.optIn error:', err);
      throw err;
    }
  }

  /**
   * Opt user out of communications
   * @param {string} userId - Discord user ID
   * @param {string} timestamp - Optional: ISO timestamp (default: now)
   * @returns {Promise<void>}
   * @throws {Error} If userId is invalid
   */
  async optOut(userId, timestamp = null) {
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error('User ID must be a non-empty string');
    }

    const now = timestamp || new Date().toISOString();

    try {
      return new Promise((resolve, reject) => {
        const db = this._getDb(); db.run(
          `INSERT INTO user_communications (user_id, opted_in, created_at, updated_at)
           VALUES (?, 0, ?, ?)
           ON CONFLICT(user_id) DO UPDATE SET opted_in = 0, updated_at = ?`,
          [userId.trim(), now, now, now],
          (err) => {
            if (err) {
              console.error('GlobalUserCommunicationService.optOut error:', err);
              reject(err);
            } else {
              resolve();
            }
          }
        );
      });
    } catch (err) {
      console.error('GlobalUserCommunicationService.optOut error:', err);
      throw err;
    }
  }

  /**
   * Bulk opt-in multiple users
   * @param {Array<string>} userIds - Array of Discord user IDs
   * @returns {Promise<void>}
   */
  async bulkOptIn(userIds) {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return; // No-op for empty arrays
    }

    try {
      const now = new Date().toISOString();
      const placeholders = userIds.map(() => '(?, 1, ?, ?)').join(',');

      return new Promise((resolve, reject) => {
        const db = this._getDb();
        const values = [];
        userIds.forEach((userId) => {
          values.push(userId.trim(), now, now);
        });

        db.run(
          `INSERT INTO user_communications (user_id, opted_in, created_at, updated_at)
           VALUES ${placeholders}
           ON CONFLICT(user_id) DO UPDATE SET opted_in = 1, updated_at = ?`,
          [...values, now],
          (err) => {
            if (err) {
              console.error('GlobalUserCommunicationService.bulkOptIn error:', err);
              reject(err);
            } else {
              resolve();
            }
          }
        );
      });
    } catch (err) {
      console.error('GlobalUserCommunicationService.bulkOptIn error:', err);
      throw err;
    }
  }

  /**
   * Bulk opt-out multiple users
   * @param {Array<string>} userIds - Array of Discord user IDs
   * @returns {Promise<void>}
   */
  async bulkOptOut(userIds) {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return; // No-op for empty arrays
    }

    try {
      const now = new Date().toISOString();
      const placeholders = userIds.map(() => '(?, 0, ?, ?)').join(',');

      return new Promise((resolve, reject) => {
        const db = this._getDb();
        const values = [];
        userIds.forEach((userId) => {
          values.push(userId.trim(), now, now);
        });

        db.run(
          `INSERT INTO user_communications (user_id, opted_in, created_at, updated_at)
           VALUES ${placeholders}
           ON CONFLICT(user_id) DO UPDATE SET opted_in = 0, updated_at = ?`,
          [...values, now],
          (err) => {
            if (err) {
              console.error('GlobalUserCommunicationService.bulkOptOut error:', err);
              reject(err);
            } else {
              resolve();
            }
          }
        );
      });
    } catch (err) {
      console.error('GlobalUserCommunicationService.bulkOptOut error:', err);
      throw err;
    }
  }

  /**
   * Get all opted-in users
   * @returns {Promise<Array<string>>} Array of user IDs
   */
  async getAllOptedInUsers() {
    try {
      return new Promise((resolve, reject) => {
        const db = this._getDb(); db.all(
          'SELECT user_id FROM user_communications WHERE opted_in = 1 ORDER BY user_id',
          [],
          (err, rows) => {
            if (err) {
              console.error('GlobalUserCommunicationService.getAllOptedInUsers error:', err);
              reject(err);
            } else {
              resolve(rows ? rows.map((r) => r.user_id) : []);
            }
          }
        );
      });
    } catch (err) {
      console.error('GlobalUserCommunicationService.getAllOptedInUsers error:', err);
      throw err;
    }
  }

  /**
   * Get all opted-out users
   * @returns {Promise<Array<string>>} Array of user IDs
   */
  async getAllOptedOutUsers() {
    try {
      return new Promise((resolve, reject) => {
        const db = this._getDb(); db.all(
          'SELECT user_id FROM user_communications WHERE opted_in = 0 ORDER BY user_id',
          [],
          (err, rows) => {
            if (err) {
              console.error('GlobalUserCommunicationService.getAllOptedOutUsers error:', err);
              reject(err);
            } else {
              resolve(rows ? rows.map((r) => r.user_id) : []);
            }
          }
        );
      });
    } catch (err) {
      console.error('GlobalUserCommunicationService.getAllOptedOutUsers error:', err);
      throw err;
    }
  }

  /**
   * Get user communication status with metadata
   * @param {string} userId - Discord user ID
   * @returns {Promise<Object|null>} { user_id, opted_in, created_at, updated_at } or null
   */
  async getOptInStatus(userId) {
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error('User ID must be a non-empty string');
    }

    try {
      return new Promise((resolve, reject) => {
        const db = this._getDb(); db.get(
          'SELECT user_id, opted_in, created_at, updated_at FROM user_communications WHERE user_id = ?',
          [userId.trim()],
          (err, row) => {
            if (err) {
              console.error('GlobalUserCommunicationService.getOptInStatus error:', err);
              reject(err);
            } else {
              resolve(row || null);
            }
          }
        );
      });
    } catch (err) {
      console.error('GlobalUserCommunicationService.getOptInStatus error:', err);
      throw err;
    }
  }

  /**
   * Delete all user communication records
   * @returns {Promise<void>}
   */
  async deleteAllUserCommunications() {
    try {
      return new Promise((resolve, reject) => {
        const db = this._getDb(); db.run('DELETE FROM user_communications', [], (err) => {
          if (err) {
            console.error('GlobalUserCommunicationService.deleteAllUserCommunications error:', err);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    } catch (err) {
      console.error('GlobalUserCommunicationService.deleteAllUserCommunications error:', err);
      throw err;
    }
  }

  /**
   * Clean up inactive user records (not updated for N days)
   * @param {number} inactiveDays - Number of days to consider inactive
   * @returns {Promise<number>} Number of records deleted
   */
  async cleanupInactiveUsers(inactiveDays = 365) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - inactiveDays);
      const cutoffIso = cutoffDate.toISOString();

      return new Promise((resolve, reject) => {
        const db = this._getDb(); db.run(
          'DELETE FROM user_communications WHERE updated_at < ?',
          [cutoffIso],
          function (err) {
            if (err) {
              console.error('GlobalUserCommunicationService.cleanupInactiveUsers error:', err);
              reject(err);
            } else {
              resolve(this.changes);
            }
          }
        );
      });
    } catch (err) {
      console.error('GlobalUserCommunicationService.cleanupInactiveUsers error:', err);
      throw err;
    }
  }
}

module.exports = new GlobalUserCommunicationService();
