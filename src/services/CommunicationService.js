/**
 * Communication Service
 * Manages user opt-in/opt-out status for DMs and communication features
 */

const { getDatabase } = require('./DatabaseService');
const { logError, ERROR_LEVELS } = require('../middleware/errorHandler');

/**
 * Check if user has opted in to receive DMs
 * @param {string} userId - Discord user ID
 * @returns {Promise<boolean>} True if user is opted in, false otherwise
 */
function isOptedIn(userId) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();

    db.get(
      'SELECT opted_in FROM user_communications WHERE user_id = ? LIMIT 1',
      [userId],
      (err, row) => {
        if (err) {
          logError('CommunicationService.isOptedIn', err, ERROR_LEVELS.MEDIUM, { userId });
          reject(err);
        } else {
          // If user doesn't exist, they haven't opted in (default: opt-out)
          resolve(row ? row.opted_in === 1 : false);
        }
      }
    );
  });
}

/**
 * Opt user in to receive DMs and communication features
 * @param {string} userId - Discord user ID
 * @returns {Promise<void>}
 */
function optIn(userId) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    const now = new Date().toISOString();

    db.run(
      `INSERT INTO user_communications (user_id, opted_in, created_at, updated_at)
       VALUES (?, 1, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET opted_in = 1, updated_at = ?`,
      [userId, now, now, now],
      (err) => {
        if (err) {
          logError('CommunicationService.optIn', err, ERROR_LEVELS.MEDIUM, { userId });
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

/**
 * Opt user out of receiving DMs
 * @param {string} userId - Discord user ID
 * @returns {Promise<void>}
 */
function optOut(userId) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    const now = new Date().toISOString();

    db.run(
      `INSERT INTO user_communications (user_id, opted_in, created_at, updated_at)
       VALUES (?, 0, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET opted_in = 0, updated_at = ?`,
      [userId, now, now, now],
      (err) => {
        if (err) {
          logError('CommunicationService.optOut', err, ERROR_LEVELS.MEDIUM, { userId });
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

/**
 * Get user's communication status and metadata
 * @param {string} userId - Discord user ID
 * @returns {Promise<Object>} Status object { opted_in, created_at, updated_at }
 */
function getStatus(userId) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();

    db.get(
      'SELECT opted_in, created_at, updated_at FROM user_communications WHERE user_id = ? LIMIT 1',
      [userId],
      (err, row) => {
        if (err) {
          logError('CommunicationService.getStatus', err, ERROR_LEVELS.MEDIUM, { userId });
          reject(err);
        } else {
          if (row) {
            resolve({
              opted_in: row.opted_in === 1,
              created_at: row.created_at,
              updated_at: row.updated_at
            });
          } else {
            // User doesn't exist, return default opt-out status
            resolve({
              opted_in: false,
              created_at: null,
              updated_at: null
            });
          }
        }
      }
    );
  });
}

module.exports = {
  isOptedIn,
  optIn,
  optOut,
  getStatus
};
