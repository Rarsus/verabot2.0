/**
 * Guild-Aware Communication Service
 * Manages user opt-in/opt-out status for DMs and communication features with guild isolation
 * All user communication preferences are scoped to a specific guild for GDPR compliance
 */

const { getDatabase } = require('./DatabaseService');
const { logError, ERROR_LEVELS } = require('../middleware/errorHandler');

/**
 * Check if user has opted in to receive DMs for a specific guild
 * @param {string} guildId - Discord guild ID
 * @param {string} userId - Discord user ID
 * @returns {Promise<boolean>} True if user is opted in for this guild, false otherwise
 */
function isOptedIn(guildId, userId) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();

    db.get(
      'SELECT opted_in FROM user_communications WHERE userId = ? AND guildId = ? LIMIT 1',
      [userId, guildId],
      (err, row) => {
        if (err) {
          logError('GuildAwareCommunicationService.isOptedIn', err, ERROR_LEVELS.MEDIUM, { guildId, userId });
          reject(err);
        } else {
          // If user doesn't exist in guild, they haven't opted in (default: opt-out)
          resolve(row ? row.opted_in === 1 : false);
        }
      }
    );
  });
}

/**
 * Opt user in to receive DMs and communication features for a specific guild
 * @param {string} guildId - Discord guild ID
 * @param {string} userId - Discord user ID
 * @returns {Promise<void>}
 */
function optIn(guildId, userId) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    const now = new Date().toISOString();

    db.run(
      `INSERT INTO user_communications (userId, guildId, opted_in, createdAt, updatedAt)
       VALUES (?, ?, 1, ?, ?)
       ON CONFLICT(userId, guildId) DO UPDATE SET opted_in = 1, updatedAt = ?`,
      [userId, guildId, now, now, now],
      (err) => {
        if (err) {
          logError('GuildAwareCommunicationService.optIn', err, ERROR_LEVELS.MEDIUM, { guildId, userId });
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

/**
 * Opt user out of receiving DMs and communication features for a specific guild
 * @param {string} guildId - Discord guild ID
 * @param {string} userId - Discord user ID
 * @returns {Promise<void>}
 */
function optOut(guildId, userId) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    const now = new Date().toISOString();

    db.run(
      `INSERT INTO user_communications (userId, guildId, opted_in, createdAt, updatedAt)
       VALUES (?, ?, 0, ?, ?)
       ON CONFLICT(userId, guildId) DO UPDATE SET opted_in = 0, updatedAt = ?`,
      [userId, guildId, now, now, now],
      (err) => {
        if (err) {
          logError('GuildAwareCommunicationService.optOut', err, ERROR_LEVELS.MEDIUM, { guildId, userId });
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

/**
 * Get communication status for a user in a guild
 * @param {string} guildId - Discord guild ID
 * @param {string} userId - Discord user ID
 * @returns {Promise<Object>} Status object
 */
function getStatus(guildId, userId) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();

    db.get(
      'SELECT opted_in, createdAt, updatedAt FROM user_communications WHERE userId = ? AND guildId = ? LIMIT 1',
      [userId, guildId],
      (err, row) => {
        if (err) {
          logError('GuildAwareCommunicationService.getStatus', err, ERROR_LEVELS.MEDIUM, { guildId, userId });
          reject(err);
        } else {
          resolve(row || { opted_in: 0, createdAt: null, updatedAt: null });
        }
      }
    );
  });
}

/**
 * Get all opted-in users for a guild
 * @param {string} guildId - Discord guild ID
 * @returns {Promise<Array>} Array of user IDs
 */
function getOptedInUsersForGuild(guildId) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();

    db.all(
      'SELECT userId FROM user_communications WHERE guildId = ? AND opted_in = 1',
      [guildId],
      (err, rows) => {
        if (err) {
          logError('GuildAwareCommunicationService.getOptedInUsersForGuild', err, ERROR_LEVELS.MEDIUM, { guildId });
          reject(err);
        } else {
          resolve((rows || []).map(r => r.userId));
        }
      }
    );
  });
}

/**
 * Delete all communication preferences for a guild (GDPR deletion)
 * @param {string} guildId - Discord guild ID
 * @returns {Promise<void>}
 */
function deleteGuildCommunications(guildId) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();

    db.run('DELETE FROM user_communications WHERE guildId = ?', [guildId], (err) => {
      if (err) {
        logError('GuildAwareCommunicationService.deleteGuildCommunications', err, ERROR_LEVELS.HIGH, { guildId });
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Get communication statistics for a guild
 * @param {string} guildId - Discord guild ID
 * @returns {Promise<Object>} Statistics object
 */
function getGuildCommunicationStats(guildId) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();

    db.get(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN opted_in = 1 THEN 1 ELSE 0 END) as optedIn,
        SUM(CASE WHEN opted_in = 0 THEN 1 ELSE 0 END) as optedOut
       FROM user_communications WHERE guildId = ?`,
      [guildId],
      (err, row) => {
        if (err) {
          logError('GuildAwareCommunicationService.getGuildCommunicationStats', err, ERROR_LEVELS.MEDIUM, { guildId });
          reject(err);
        } else {
          resolve(row || { total: 0, optedIn: 0, optedOut: 0 });
        }
      }
    );
  });
}

module.exports = {
  isOptedIn,
  optIn,
  optOut,
  getStatus,
  getOptedInUsersForGuild,
  deleteGuildCommunications,
  getGuildCommunicationStats
};
