/**
 * Guild-Aware Reminder Service (Phase 2: Guild Isolation)
 * Uses per-guild databases - each guild has its own database file
 * All reminder operations are automatically scoped to a specific guild's database
 */

const GuildDatabaseManager = require('./GuildDatabaseManager');
const { REMINDER_STATUS } = require('../utils/constants/reminder-constants');
const { logError, ERROR_LEVELS } = require('../middleware/errorHandler');

/**
 * Create a new reminder for a specific guild
 * @param {string} guildId - Discord guild ID
 * @param {Object} reminderData - Reminder data
 * @returns {Promise<number>} Reminder ID
 */
async function createReminder(guildId, reminderData) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await GuildDatabaseManager.getGuildDatabase(guildId);
      const { subject, category, when, content, link, image, notification_method } = reminderData;

      db.run(
        `INSERT INTO reminders (subject, category, when_datetime, content, link, image, notificationTime, status, notification_method)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          subject,
          category,
          when,
          content || null,
          link || null,
          image || null,
          when,
          REMINDER_STATUS.ACTIVE,
          notification_method || 'dm',
        ],
        function (err) {
          if (err) {
            logError('GuildAwareReminderService.createReminder', err, ERROR_LEVELS.MEDIUM, { guildId });
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    } catch (error) {
      logError('GuildAwareReminderService.createReminder', error, ERROR_LEVELS.MEDIUM, { guildId });
      reject(error);
    }
  });
}

/**
 * Add an assignment for a reminder (user or role)
 * @param {string} guildId - Discord guild ID
 * @param {number} reminderId - Reminder ID
 * @param {string} assigneeType - 'user' or 'role'
 * @param {string} assigneeId - Discord user or role ID
 * @returns {Promise<number>} Assignment ID
 */
async function addReminderAssignment(guildId, reminderId, assigneeType, assigneeId) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await GuildDatabaseManager.getGuildDatabase(guildId);

      db.run(
        'INSERT INTO reminder_assignments (reminderId, assigneeType, assigneeId) VALUES (?, ?, ?)',
        [reminderId, assigneeType, assigneeId],
        function (err) {
          if (err) {
            logError('GuildAwareReminderService.addReminderAssignment', err, ERROR_LEVELS.MEDIUM, {
              guildId,
              reminderId,
            });
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    } catch (error) {
      logError('GuildAwareReminderService.addReminderAssignment', error, ERROR_LEVELS.MEDIUM, { guildId, reminderId });
      reject(error);
    }
  });
}

/**
 * Get a reminder by ID (guild-scoped)
 * @param {string} guildId - Discord guild ID
 * @param {number} id - Reminder ID
 * @returns {Promise<Object|null>} Reminder object or null
 */
async function getReminderById(guildId, id) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await GuildDatabaseManager.getGuildDatabase(guildId);

      db.get('SELECT * FROM reminders WHERE id = ?', [id], (err, row) => {
        if (err) {
          logError('GuildAwareReminderService.getReminderById', err, ERROR_LEVELS.MEDIUM, { guildId, id });
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    } catch (error) {
      logError('GuildAwareReminderService.getReminderById', error, ERROR_LEVELS.MEDIUM, { guildId, id });
      reject(error);
    }
  });
}

/**
 * Update a reminder (guild-scoped)
 * @param {string} guildId - Discord guild ID
 * @param {number} id - Reminder ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
async function updateReminder(guildId, id, updates) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await GuildDatabaseManager.getGuildDatabase(guildId);
      const fields = [];
      const values = [];

      Object.entries(updates).forEach(([key, value]) => {
        fields.push(`${key} = ?`);
        values.push(value);
      });

      fields.push('updatedAt = CURRENT_TIMESTAMP');
      values.push(id);

      db.run(`UPDATE reminders SET ${fields.join(', ')} WHERE id = ?`, values, (err) => {
        if (err) {
          logError('GuildAwareReminderService.updateReminder', err, ERROR_LEVELS.MEDIUM, { guildId, id });
          reject(err);
        } else {
          resolve();
        }
      });
    } catch (error) {
      logError('GuildAwareReminderService.updateReminder', error, ERROR_LEVELS.MEDIUM, { guildId, id });
      reject(error);
    }
  });
}

/**
 * Delete a reminder (guild-scoped)
 * @param {string} guildId - Discord guild ID
 * @param {number} id - Reminder ID
 * @param {boolean} hard - Hard delete (true) or soft delete (false)
 * @returns {Promise<void>}
 */
async function deleteReminder(guildId, id, hard = false) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await GuildDatabaseManager.getGuildDatabase(guildId);

      if (hard) {
        db.run('DELETE FROM reminders WHERE id = ?', [id], (err) => {
          if (err) {
            logError('GuildAwareReminderService.deleteReminder', err, ERROR_LEVELS.MEDIUM, { guildId, id });
            reject(err);
          } else {
            resolve();
          }
        });
      } else {
        db.run(
          'UPDATE reminders SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
          [REMINDER_STATUS.DELETED, id],
          (err) => {
            if (err) {
              logError('GuildAwareReminderService.deleteReminder', err, ERROR_LEVELS.MEDIUM, { guildId, id });
              reject(err);
            } else {
              resolve();
            }
          }
        );
      }
    } catch (error) {
      logError('GuildAwareReminderService.deleteReminder', error, ERROR_LEVELS.MEDIUM, { guildId, id });
      reject(error);
    }
  });
}

/**
 * Get all reminders for a guild
 * @param {string} guildId - Discord guild ID
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} Reminder array
 */
async function getAllReminders(guildId, filters = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await GuildDatabaseManager.getGuildDatabase(guildId);
      const conditions = [];
      const params = [];

      if (filters.status) {
        conditions.push('status = ?');
        params.push(filters.status);
      }

      if (filters.category) {
        conditions.push('category = ?');
        params.push(filters.category);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      db.all(`SELECT * FROM reminders ${whereClause} ORDER BY when_datetime ASC`, params, (err, rows) => {
        if (err) {
          logError('GuildAwareReminderService.getAllReminders', err, ERROR_LEVELS.MEDIUM, { guildId });
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    } catch (error) {
      logError('GuildAwareReminderService.getAllReminders', error, ERROR_LEVELS.MEDIUM, { guildId });
      reject(error);
    }
  });
}

/**
 * Search reminders for a guild
 * @param {string} guildId - Discord guild ID
 * @param {string} query - Search query
 * @returns {Promise<Array>} Reminder array
 */
async function searchReminders(guildId, query) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await GuildDatabaseManager.getGuildDatabase(guildId);
      const searchTerm = `%${query}%`;

      db.all(
        `SELECT * FROM reminders
         WHERE subject LIKE ? OR category LIKE ? OR content LIKE ?
         ORDER BY when_datetime ASC`,
        [searchTerm, searchTerm, searchTerm],
        (err, rows) => {
          if (err) {
            logError('GuildAwareReminderService.searchReminders', err, ERROR_LEVELS.MEDIUM, { guildId, query });
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    } catch (error) {
      logError('GuildAwareReminderService.searchReminders', error, ERROR_LEVELS.MEDIUM, { guildId, query });
      reject(error);
    }
  });
}

/**
 * Delete all reminders for a guild (GDPR deletion)
 * Deletes the entire guild database folder
 * @param {string} guildId - Discord guild ID
 * @returns {Promise<void>}
 */
async function deleteGuildReminders(guildId) {
  try {
    await GuildDatabaseManager.deleteGuildDatabase(guildId);
  } catch (error) {
    logError('GuildAwareReminderService.deleteGuildReminders', error, ERROR_LEVELS.HIGH, { guildId });
    throw error;
  }
}

/**
 * Get reminder statistics for a guild
 * @param {string} guildId - Discord guild ID
 * @returns {Promise<Object>} Statistics object
 */
async function getGuildReminderStats(guildId) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await GuildDatabaseManager.getGuildDatabase(guildId);

      db.get(
        `SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as completed,
          COUNT(DISTINCT category) as categories
         FROM reminders`,
        [REMINDER_STATUS.ACTIVE, REMINDER_STATUS.COMPLETED],
        (err, row) => {
          if (err) {
            logError('GuildAwareReminderService.getGuildReminderStats', err, ERROR_LEVELS.MEDIUM, { guildId });
            reject(err);
          } else {
            resolve(row || { total: 0, active: 0, completed: 0, categories: 0 });
          }
        }
      );
    } catch (error) {
      logError('GuildAwareReminderService.getGuildReminderStats', error, ERROR_LEVELS.MEDIUM, { guildId });
      reject(error);
    }
  });
}

module.exports = {
  createReminder,
  addReminderAssignment,
  getReminderById,
  updateReminder,
  deleteReminder,
  getAllReminders,
  searchReminders,
  deleteGuildReminders,
  getGuildReminderStats,
};
