/**
 * Guild-Aware Reminder Service
 * Extends ReminderService with guild isolation for GDPR compliance
 * All reminder operations are scoped to a specific guild
 */

const { getDatabase } = require('./DatabaseService');
const { REMINDER_STATUS } = require('../utils/constants/reminder-constants');
const { logError, ERROR_LEVELS } = require('../middleware/errorHandler');

/**
 * Create a new reminder for a specific guild
 * @param {string} guildId - Discord guild ID
 * @param {Object} reminderData - Reminder data
 * @returns {Promise<number>} Reminder ID
 */
async function createReminder(guildId, reminderData) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    const {
      subject, category, when, content, link, image, notification_method
    } = reminderData;

    db.run(
      `INSERT INTO reminders (guildId, subject, category, when_datetime, content, link, image, notificationTime, status, notification_method)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [guildId, subject, category, when, content || null, link || null, image || null, when, REMINDER_STATUS.ACTIVE, notification_method || 'dm'],
      function(err) {
        if (err) {
          logError('GuildAwareReminderService.createReminder', err, ERROR_LEVELS.MEDIUM, { guildId });
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
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
  return new Promise((resolve, reject) => {
    const db = getDatabase();

    db.run(
      'INSERT INTO reminder_assignments (guildId, reminderId, assigneeType, assigneeId) VALUES (?, ?, ?, ?)',
      [guildId, reminderId, assigneeType, assigneeId],
      function(err) {
        if (err) {
          logError('GuildAwareReminderService.addReminderAssignment', err, ERROR_LEVELS.MEDIUM, { guildId, reminderId });
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
}

/**
 * Get a reminder by ID (guild-scoped)
 * @param {string} guildId - Discord guild ID
 * @param {number} id - Reminder ID
 * @returns {Promise<Object|null>} Reminder object or null
 */
async function getReminderById(guildId, id) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();

    db.get(
      'SELECT * FROM reminders WHERE id = ? AND guildId = ?',
      [id, guildId],
      (err, row) => {
        if (err) {
          logError('GuildAwareReminderService.getReminderById', err, ERROR_LEVELS.MEDIUM, { guildId, id });
          reject(err);
        } else {
          resolve(row || null);
        }
      }
    );
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
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    const fields = [];
    const values = [];

    Object.entries(updates).forEach(([key, value]) => {
      fields.push(`${key} = ?`);
      values.push(value);
    });

    fields.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(id);
    values.push(guildId);

    db.run(
      `UPDATE reminders SET ${fields.join(', ')} WHERE id = ? AND guildId = ?`,
      values,
      (err) => {
        if (err) {
          logError('GuildAwareReminderService.updateReminder', err, ERROR_LEVELS.MEDIUM, { guildId, id });
          reject(err);
        } else {
          resolve();
        }
      }
    );
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
  return new Promise((resolve, reject) => {
    const db = getDatabase();

    if (hard) {
      db.run('DELETE FROM reminders WHERE id = ? AND guildId = ?', [id, guildId], (err) => {
        if (err) {
          logError('GuildAwareReminderService.deleteReminder', err, ERROR_LEVELS.MEDIUM, { guildId, id });
          reject(err);
        } else {
          resolve();
        }
      });
    } else {
      db.run(
        'UPDATE reminders SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND guildId = ?',
        [REMINDER_STATUS.DELETED, id, guildId],
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
  });
}

/**
 * Get all reminders for a guild
 * @param {string} guildId - Discord guild ID
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} Reminder array
 */
async function getAllReminders(guildId, filters = {}) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    const conditions = ['guildId = ?'];
    const params = [guildId];

    if (filters.status) {
      conditions.push('status = ?');
      params.push(filters.status);
    }

    if (filters.category) {
      conditions.push('category = ?');
      params.push(filters.category);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    db.all(
      `SELECT * FROM reminders ${whereClause} ORDER BY when_datetime ASC`,
      params,
      (err, rows) => {
        if (err) {
          logError('GuildAwareReminderService.getAllReminders', err, ERROR_LEVELS.MEDIUM, { guildId });
          reject(err);
        } else {
          resolve(rows || []);
        }
      }
    );
  });
}

/**
 * Search reminders for a guild
 * @param {string} guildId - Discord guild ID
 * @param {string} query - Search query
 * @returns {Promise<Array>} Reminder array
 */
async function searchReminders(guildId, query) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    const searchTerm = `%${query}%`;

    db.all(
      `SELECT * FROM reminders
       WHERE guildId = ? AND (subject LIKE ? OR category LIKE ? OR content LIKE ?)
       ORDER BY when_datetime ASC`,
      [guildId, searchTerm, searchTerm, searchTerm],
      (err, rows) => {
        if (err) {
          logError('GuildAwareReminderService.searchReminders', err, ERROR_LEVELS.MEDIUM, { guildId, query });
          reject(err);
        } else {
          resolve(rows || []);
        }
      }
    );
  });
}

/**
 * Delete all reminders for a guild (GDPR deletion)
 * @param {string} guildId - Discord guild ID
 * @returns {Promise<void>}
 */
async function deleteGuildReminders(guildId) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();

    db.run('DELETE FROM reminders WHERE guildId = ?', [guildId], (err) => {
      if (err) {
        logError('GuildAwareReminderService.deleteGuildReminders', err, ERROR_LEVELS.HIGH, { guildId });
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Get reminder statistics for a guild
 * @param {string} guildId - Discord guild ID
 * @returns {Promise<Object>} Statistics object
 */
async function getGuildReminderStats(guildId) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();

    db.get(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as completed,
        COUNT(DISTINCT category) as categories
       FROM reminders WHERE guildId = ?`,
      [REMINDER_STATUS.ACTIVE, REMINDER_STATUS.COMPLETED, guildId],
      (err, row) => {
        if (err) {
          logError('GuildAwareReminderService.getGuildReminderStats', err, ERROR_LEVELS.MEDIUM, { guildId });
          reject(err);
        } else {
          resolve(row || { total: 0, active: 0, completed: 0, categories: 0 });
        }
      }
    );
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
  getGuildReminderStats
};
