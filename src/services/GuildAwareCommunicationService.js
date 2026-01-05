/**
 * Guild-Aware Communication Service (Phase 3: Guild Isolation)
 * Uses per-guild databases - each guild has its own database file
 * Manages user opt-in/opt-out status for DMs and communication features
 * All user communication preferences are automatically scoped to a specific guild's database
 */

const GuildDatabaseManager = require('./GuildDatabaseManager');
const { logError, ERROR_LEVELS } = require('../middleware/errorHandler');

/**
 * Check if user has opted in to receive DMs
 * @param {string} guildId - Discord guild ID
 * @param {string} userId - Discord user ID
 * @returns {Promise<boolean>} True if user is opted in for this guild, false otherwise
 */
function isOptedIn(guildId, userId) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await GuildDatabaseManager.getGuildDatabase(guildId);

      db.get(
        'SELECT opted_in FROM user_communications WHERE userId = ? LIMIT 1',
        [userId],
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
    } catch (error) {
      logError('GuildAwareCommunicationService.isOptedIn', error, ERROR_LEVELS.MEDIUM, { guildId, userId });
      reject(error);
    }
  });
}

/**
 * Opt user in to receive DMs and communication features
 * @param {string} guildId - Discord guild ID
 * @param {string} userId - Discord user ID
 * @returns {Promise<void>}
 */
function optIn(guildId, userId) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await GuildDatabaseManager.getGuildDatabase(guildId);
      const now = new Date().toISOString();

      db.run(
        `INSERT INTO user_communications (userId, opted_in, createdAt, updatedAt)
         VALUES (?, 1, ?, ?)
         ON CONFLICT(userId) DO UPDATE SET opted_in = 1, updatedAt = ?`,
        [userId, now, now, now],
        (err) => {
          if (err) {
            logError('GuildAwareCommunicationService.optIn', err, ERROR_LEVELS.MEDIUM, { guildId, userId });
            reject(err);
          } else {
            resolve();
          }
        }
      );
    } catch (error) {
      logError('GuildAwareCommunicationService.optIn', error, ERROR_LEVELS.MEDIUM, { guildId, userId });
      reject(error);
    }
  });
}

/**
 * Opt user out of receiving DMs and communication features
 * @param {string} guildId - Discord guild ID
 * @param {string} userId - Discord user ID
 * @returns {Promise<void>}
 */
function optOut(guildId, userId) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await GuildDatabaseManager.getGuildDatabase(guildId);
      const now = new Date().toISOString();

      db.run(
        `INSERT INTO user_communications (userId, opted_in, createdAt, updatedAt)
         VALUES (?, 0, ?, ?)
         ON CONFLICT(userId) DO UPDATE SET opted_in = 0, updatedAt = ?`,
        [userId, now, now, now],
        (err) => {
          if (err) {
            logError('GuildAwareCommunicationService.optOut', err, ERROR_LEVELS.MEDIUM, { guildId, userId });
            reject(err);
          } else {
            resolve();
          }
        }
      );
    } catch (error) {
      logError('GuildAwareCommunicationService.optOut', error, ERROR_LEVELS.MEDIUM, { guildId, userId });
      reject(error);
    }
  });
}

/**
 * Get communication status for a user in a guild
 * @param {string} guildId - Discord guild ID
 * @param {string} userId - Discord user ID
 * @returns {Promise<Object>} Status object
 */
function getStatus(guildId, userId) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await GuildDatabaseManager.getGuildDatabase(guildId);

      db.get(
        'SELECT opted_in, createdAt, updatedAt FROM user_communications WHERE userId = ? LIMIT 1',
        [userId],
        (err, row) => {
          if (err) {
            logError('GuildAwareCommunicationService.getStatus', err, ERROR_LEVELS.MEDIUM, { guildId, userId });
            reject(err);
          } else {
            resolve(row || { opted_in: 0, createdAt: null, updatedAt: null });
          }
        }
      );
    } catch (error) {
      logError('GuildAwareCommunicationService.getStatus', error, ERROR_LEVELS.MEDIUM, { guildId, userId });
      reject(error);
    }
  });
}

/**
 * Get all opted-in users for a guild
 * @param {string} guildId - Discord guild ID
 * @returns {Promise<Array>} Array of user IDs
 */
function getOptedInUsersForGuild(guildId) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await GuildDatabaseManager.getGuildDatabase(guildId);

      db.all(
        'SELECT userId FROM user_communications WHERE opted_in = 1',
        [],
        (err, rows) => {
          if (err) {
            logError('GuildAwareCommunicationService.getOptedInUsersForGuild', err, ERROR_LEVELS.MEDIUM, { guildId });
            reject(err);
          } else {
            resolve((rows || []).map(r => r.userId));
          }
        }
      );
    } catch (error) {
      logError('GuildAwareCommunicationService.getOptedInUsersForGuild', error, ERROR_LEVELS.MEDIUM, { guildId });
      reject(error);
    }
  });
}

/**
 * Delete all communication preferences for a guild (GDPR deletion)
 * Deletes the entire guild database folder
 * @param {string} guildId - Discord guild ID
 * @returns {Promise<void>}
 */
async function deleteGuildCommunications(guildId) {
  try {
    await GuildDatabaseManager.deleteGuildDatabase(guildId);
  } catch (error) {
    logError('GuildAwareCommunicationService.deleteGuildCommunications', error, ERROR_LEVELS.HIGH, { guildId });
    throw error;
  }
}

/**
 * Get communication statistics for a guild
 * @param {string} guildId - Discord guild ID
 * @returns {Promise<Object>} Statistics object
 */
function getGuildCommunicationStats(guildId) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await GuildDatabaseManager.getGuildDatabase(guildId);

      db.get(
        `SELECT
          COUNT(*) as total,
          SUM(CASE WHEN opted_in = 1 THEN 1 ELSE 0 END) as optedIn,
          SUM(CASE WHEN opted_in = 0 THEN 1 ELSE 0 END) as optedOut
         FROM user_communications`,
        [],
        (err, row) => {
          if (err) {
            logError('GuildAwareCommunicationService.getGuildCommunicationStats', err, ERROR_LEVELS.MEDIUM, { guildId });
            reject(err);
          } else {
            resolve(row || { total: 0, optedIn: 0, optedOut: 0 });
          }
        }
      );
    } catch (error) {
      logError('GuildAwareCommunicationService.getGuildCommunicationStats', error, ERROR_LEVELS.MEDIUM, { guildId });
      reject(error);
    }
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
