/**
 * ⚠️  DEPRECATED: Reminder Service (Phase 7 Assessment)
 *
 * This service is DEPRECATED as of v2.13.0 and will be removed in v0.3.0 (March 2026).
 *
 * USE INSTEAD: GuildAwareReminderService
 * Location: src/services/GuildAwareReminderService.js
 *
 * Reasons for deprecation:
 * - Uses shared root database (not guild-isolated)
 * - All core commands have migrated to GuildAwareReminderService
 * - All event handlers have migrated to GuildAwareReminderService
 * - Security risk: possible cross-guild data exposure via SQL bugs
 *
 * Migration Status:
 * ✅ All commands using GuildAwareReminderService
 * ✅ All event handlers using GuildAwareReminderService
 * ⏳ ReminderNotificationService - PENDING update to guild-aware (Phase 6 expansion)
 *
 * See: docs/reference/DB-DEPRECATION-TIMELINE.md for detailed migration guide
 */

/**
 * Reminder Service
 * Core business logic for reminder management
 */

const { getDatabase } = require('./DatabaseService');
const { REMINDER_STATUS, REMINDER_LIMITS } = require('../utils/constants/reminder-constants');
const { logError, ERROR_LEVELS } = require('../utils/error-handler');
const { parseDateTime } = require('../utils/helpers/datetime-parser');

/**
 * Validate reminder subject
 * @param {string} subject - Reminder subject
 * @returns {Object} Validation result
 */
function validateSubject(subject) {
  if (!subject || typeof subject !== 'string') {
    return { valid: false, error: 'Subject is required and must be a string' };
  }

  const trimmed = subject.trim();
  if (trimmed.length < REMINDER_LIMITS.SUBJECT_MIN_LENGTH) {
    return { valid: false, error: `Subject must be at least ${REMINDER_LIMITS.SUBJECT_MIN_LENGTH} characters` };
  }
  if (trimmed.length > REMINDER_LIMITS.SUBJECT_MAX_LENGTH) {
    return { valid: false, error: `Subject must not exceed ${REMINDER_LIMITS.SUBJECT_MAX_LENGTH} characters` };
  }

  return { valid: true, sanitized: trimmed };
}

/**
 * Validate reminder category
 * @param {string} category - Reminder category
 * @returns {Object} Validation result
 */
function validateCategory(category) {
  if (!category || typeof category !== 'string') {
    return { valid: false, error: 'Category is required and must be a string' };
  }

  const trimmed = category.trim();
  if (trimmed.length === 0 || trimmed.length > REMINDER_LIMITS.CATEGORY_MAX_LENGTH) {
    return { valid: false, error: `Category must be between 1 and ${REMINDER_LIMITS.CATEGORY_MAX_LENGTH} characters` };
  }

  return { valid: true, sanitized: trimmed };
}

/**
 * Validate reminder datetime
 * Supports multiple formats: ISO dates, relative time, natural language, etc.
 * @param {string} whenDatetime - When the reminder is for
 * @returns {Object} Validation result
 */
function validateDatetime(whenDatetime) {
  if (!whenDatetime || typeof whenDatetime !== 'string') {
    return { valid: false, error: 'Date/time is required and must be a string' };
  }

  // Use the datetime parser to handle all formats
  const parseResult = parseDateTime(whenDatetime);

  if (!parseResult.valid) {
    // Provide more helpful error message
    return {
      valid: false,
      error: parseResult.error || 'Invalid date/time format. Try formats like: "1 day", "tomorrow", "3:30 PM", "2025-12-31", or "tomorrow at 3 PM"'
    };
  }

  return {
    valid: true,
    sanitized: parseResult.isoString
  };
}

/**
 * Validate optional content
 * @param {string} content - Reminder content
 * @returns {Object} Validation result
 */
function validateContent(content) {
  if (!content) {
    return { valid: true, sanitized: null };
  }

  if (typeof content !== 'string') {
    return { valid: false, error: 'Content must be a string' };
  }

  const trimmed = content.trim();
  if (trimmed.length > REMINDER_LIMITS.CONTENT_MAX_LENGTH) {
    return { valid: false, error: `Content must not exceed ${REMINDER_LIMITS.CONTENT_MAX_LENGTH} characters` };
  }

  return { valid: true, sanitized: trimmed || null };
}

/**
 * Validate optional URL
 * @param {string} link - URL link
 * @returns {Object} Validation result
 */
function validateLink(link) {
  if (!link) {
    return { valid: true, sanitized: null };
  }

  if (typeof link !== 'string') {
    return { valid: false, error: 'Link must be a string' };
  }

  const trimmed = link.trim();
  if (trimmed.length > REMINDER_LIMITS.URL_MAX_LENGTH) {
    return { valid: false, error: `Link must not exceed ${REMINDER_LIMITS.URL_MAX_LENGTH} characters` };
  }

  // Basic URL validation
  try {
    new URL(trimmed);
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }

  return { valid: true, sanitized: trimmed };
}

/**
 * Validate optional image URL
 * @param {string} image - Image URL
 * @returns {Object} Validation result
 */
function validateImage(image) {
  if (!image) {
    return { valid: true, sanitized: null };
  }

  if (typeof image !== 'string') {
    return { valid: false, error: 'Image must be a string' };
  }

  const trimmed = image.trim();
  if (trimmed.length > REMINDER_LIMITS.URL_MAX_LENGTH) {
    return { valid: false, error: `Image URL must not exceed ${REMINDER_LIMITS.URL_MAX_LENGTH} characters` };
  }

  // Basic URL validation
  try {
    new URL(trimmed);
  } catch {
    return { valid: false, error: 'Invalid image URL format' };
  }

  return { valid: true, sanitized: trimmed };
}

/**
 * Create a new reminder
 * @param {Object} reminderData - Reminder data
 * @returns {Promise<number>} Reminder ID
 */
async function createReminder(reminderData) {
  const db = getDatabase();

  // Validate required fields
  const subjectValidation = validateSubject(reminderData.subject);
  if (!subjectValidation.valid) {
    throw new Error(subjectValidation.error);
  }

  const categoryValidation = validateCategory(reminderData.category);
  if (!categoryValidation.valid) {
    throw new Error(categoryValidation.error);
  }

  const datetimeValidation = validateDatetime(reminderData.when);
  if (!datetimeValidation.valid) {
    throw new Error(datetimeValidation.error);
  }

  // Validate optional fields
  const contentValidation = validateContent(reminderData.content);
  if (!contentValidation.valid) {
    throw new Error(contentValidation.error);
  }

  const linkValidation = validateLink(reminderData.link);
  if (!linkValidation.valid) {
    throw new Error(linkValidation.error);
  }

  const imageValidation = validateImage(reminderData.image);
  if (!imageValidation.valid) {
    throw new Error(imageValidation.error);
  }

  // Set notification time (default to event time if not specified)
  const notificationTime = reminderData.notificationTime || datetimeValidation.sanitized;

  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO reminders (subject, category, when_datetime, content, link, image, notificationTime, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        subjectValidation.sanitized,
        categoryValidation.sanitized,
        datetimeValidation.sanitized,
        contentValidation.sanitized,
        linkValidation.sanitized,
        imageValidation.sanitized,
        notificationTime,
        REMINDER_STATUS.ACTIVE
      ],
      function(err) {
        if (err) {
          logError('ReminderService.createReminder', err, ERROR_LEVELS.MEDIUM);
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
}

/**
 * Add assignment for reminder (user or role)
 * @param {number} reminderId - Reminder ID
 * @param {string} assigneeType - 'user' or 'role'
 * @param {string} assigneeId - User ID or Role ID
 * @returns {Promise<number>} Assignment ID
 */
async function addReminderAssignment(reminderId, assigneeType, assigneeId) {
  const db = getDatabase();

  if (!['user', 'role'].includes(assigneeType)) {
    throw new Error('Assignee type must be "user" or "role"');
  }

  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO reminder_assignments (reminderId, assigneeType, assigneeId) VALUES (?, ?, ?)',
      [reminderId, assigneeType, assigneeId],
      function(err) {
        if (err) {
          logError('ReminderService.addReminderAssignment', err, ERROR_LEVELS.MEDIUM);
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
}

/**
 * Get reminder by ID with assignments
 * @param {number} id - Reminder ID
 * @returns {Promise<Object|null>} Reminder object with assignments
 */
async function getReminderById(id) {
  const db = getDatabase();

  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM reminders WHERE id = ?',
      [id],
      (err, reminder) => {
        if (err) {
          logError('ReminderService.getReminderById', err, ERROR_LEVELS.MEDIUM);
          reject(err);
        } else if (!reminder) {
          resolve(null);
        } else {
          // Get assignments
          db.all(
            'SELECT * FROM reminder_assignments WHERE reminderId = ?',
            [id],
            (err, assignments) => {
              if (err) {
                logError('ReminderService.getReminderById.assignments', err, ERROR_LEVELS.LOW);
                reminder.assignments = [];
              } else {
                reminder.assignments = assignments || [];
              }
              resolve(reminder);
            }
          );
        }
      }
    );
  });
}

/**
 * Update reminder
 * @param {number} id - Reminder ID
 * @param {Object} updateData - Fields to update
 * @returns {Promise<boolean>} Success status
 */
async function updateReminder(id, updateData) {
  const db = getDatabase();

  const fields = [];
  const values = [];

  if (updateData.subject !== undefined) {
    const validation = validateSubject(updateData.subject);
    if (!validation.valid) throw new Error(validation.error);
    fields.push('subject = ?');
    values.push(validation.sanitized);
  }

  if (updateData.category !== undefined) {
    const validation = validateCategory(updateData.category);
    if (!validation.valid) throw new Error(validation.error);
    fields.push('category = ?');
    values.push(validation.sanitized);
  }

  if (updateData.when !== undefined) {
    const validation = validateDatetime(updateData.when);
    if (!validation.valid) throw new Error(validation.error);
    fields.push('when_datetime = ?');
    values.push(validation.sanitized);
  }

  if (updateData.content !== undefined) {
    const validation = validateContent(updateData.content);
    if (!validation.valid) throw new Error(validation.error);
    fields.push('content = ?');
    values.push(validation.sanitized);
  }

  if (updateData.link !== undefined) {
    const validation = validateLink(updateData.link);
    if (!validation.valid) throw new Error(validation.error);
    fields.push('link = ?');
    values.push(validation.sanitized);
  }

  if (updateData.image !== undefined) {
    const validation = validateImage(updateData.image);
    if (!validation.valid) throw new Error(validation.error);
    fields.push('image = ?');
    values.push(validation.sanitized);
  }

  if (updateData.status !== undefined) {
    if (!Object.values(REMINDER_STATUS).includes(updateData.status)) {
      throw new Error('Invalid status');
    }
    fields.push('status = ?');
    values.push(updateData.status);
  }

  if (updateData.notificationTime !== undefined) {
    const validation = validateDatetime(updateData.notificationTime);
    if (!validation.valid) throw new Error(validation.error);
    fields.push('notificationTime = ?');
    values.push(validation.sanitized);
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  fields.push('updatedAt = CURRENT_TIMESTAMP');
  values.push(id);

  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE reminders SET ${fields.join(', ')} WHERE id = ?`,
      values,
      function(err) {
        if (err) {
          logError('ReminderService.updateReminder', err, ERROR_LEVELS.MEDIUM);
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      }
    );
  });
}

/**
 * Delete reminder (soft delete by default)
 * @param {number} id - Reminder ID
 * @param {boolean} hard - Whether to hard delete
 * @returns {Promise<boolean>} Success status
 */
async function deleteReminder(id, hard = false) {
  const db = getDatabase();

  if (hard) {
    // Hard delete
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM reminders WHERE id = ?', [id], function(err) {
        if (err) {
          logError('ReminderService.deleteReminder', err, ERROR_LEVELS.MEDIUM);
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  } else {
    // Soft delete - mark as cancelled
    return updateReminder(id, { status: REMINDER_STATUS.CANCELLED });
  }
}

/**
 * List reminders with filters
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Array of reminders
 */
async function listReminders(filters = {}) {
  const db = getDatabase();

  const conditions = [];
  const values = [];

  if (filters.status) {
    conditions.push('status = ?');
    values.push(filters.status);
  }

  if (filters.category) {
    conditions.push('category = ?');
    values.push(filters.category);
  }

  if (filters.assigneeId) {
    conditions.push('id IN (SELECT reminderId FROM reminder_assignments WHERE assigneeId = ?)');
    values.push(filters.assigneeId);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = filters.limit || 50;
  const offset = filters.offset || 0;

  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM reminders ${whereClause} ORDER BY when_datetime ASC LIMIT ? OFFSET ?`,
      [...values, limit, offset],
      (err, rows) => {
        if (err) {
          logError('ReminderService.listReminders', err, ERROR_LEVELS.MEDIUM);
          reject(err);
        } else {
          resolve(rows || []);
        }
      }
    );
  });
}

/**
 * Search reminders by keyword
 * @param {string} keyword - Search keyword
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Matching reminders
 */
async function searchReminders(keyword, options = {}) {
  const db = getDatabase();

  if (!keyword || typeof keyword !== 'string') {
    throw new Error('Search keyword is required');
  }

  const searchTerm = `%${keyword.trim()}%`;
  const limit = options.limit || 50;
  const offset = options.offset || 0;

  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM reminders 
       WHERE (subject LIKE ? OR category LIKE ? OR content LIKE ?)
       AND status = ?
       ORDER BY when_datetime ASC 
       LIMIT ? OFFSET ?`,
      [searchTerm, searchTerm, searchTerm, REMINDER_STATUS.ACTIVE, limit, offset],
      (err, rows) => {
        if (err) {
          logError('ReminderService.searchReminders', err, ERROR_LEVELS.MEDIUM);
          reject(err);
        } else {
          resolve(rows || []);
        }
      }
    );
  });
}

/**
 * Get reminders due for notification
 * @param {Date} checkTime - Time to check against
 * @returns {Promise<Array>} Reminders due for notification
 */
async function getRemindersForNotification(checkTime = new Date()) {
  const db = getDatabase();
  const checkTimeISO = checkTime.toISOString();

  return new Promise((resolve, reject) => {
    db.all(
      `SELECT r.*, GROUP_CONCAT(ra.assigneeType || ':' || ra.assigneeId) as assignees
       FROM reminders r
       LEFT JOIN reminder_assignments ra ON r.id = ra.reminderId
       WHERE r.status = ? 
       AND r.notificationTime <= ?
       AND r.id NOT IN (
         SELECT reminderId FROM reminder_notifications 
         WHERE success = 1
       )
       GROUP BY r.id
       ORDER BY r.notificationTime ASC`,
      [REMINDER_STATUS.ACTIVE, checkTimeISO],
      (err, rows) => {
        if (err) {
          logError('ReminderService.getRemindersForNotification', err, ERROR_LEVELS.MEDIUM);
          reject(err);
        } else {
          resolve(rows || []);
        }
      }
    );
  });
}

/**
 * Record notification delivery
 * @param {number} reminderId - Reminder ID
 * @param {boolean} success - Whether notification succeeded
 * @param {string} errorMessage - Error message if failed
 * @returns {Promise<number>} Notification record ID
 */
async function recordNotification(reminderId, success, errorMessage = null) {
  const db = getDatabase();

  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO reminder_notifications (reminderId, success, errorMessage) VALUES (?, ?, ?)',
      [reminderId, success ? 1 : 0, errorMessage],
      function(err) {
        if (err) {
          logError('ReminderService.recordNotification', err, ERROR_LEVELS.LOW);
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
}

/**
 * Check if a reminder recipient has opted in to receive DMs
 * @param {string} userId - Discord user ID
 * @returns {Promise<boolean>} True if user opted in, false otherwise
 */
async function isRecipientOptedIn(userId) {
  const CommunicationService = require('./CommunicationService');
  return CommunicationService.isOptedIn(userId);
}

/**
 * Get recipient information for a reminder
 * @param {number} reminderId - Reminder ID
 * @returns {Promise<Object>} Recipients with user details { userId, optedIn }
 */
async function getReminderRecipients(reminderId) {
  const db = getDatabase();
  const CommunicationService = require('./CommunicationService');

  return new Promise(async (resolve, reject) => {
    db.all(
      'SELECT assigneeType, assigneeId FROM reminder_assignments WHERE reminderId = ? AND assigneeType = ?',
      [reminderId, 'user'],
      async (err, rows) => {
        if (err) {
          logError('ReminderService.getReminderRecipients', err, ERROR_LEVELS.MEDIUM);
          reject(err);
        } else {
          try {
            // Check opt-in status for each user recipient
            const recipients = await Promise.all(
              (rows || []).map(async (row) => ({
                userId: row.assigneeId,
                optedIn: await CommunicationService.isOptedIn(row.assigneeId)
              }))
            );
            resolve(recipients);
          } catch (error) {
            logError('ReminderService.getReminderRecipients.checkOptIn', error, ERROR_LEVELS.MEDIUM);
            reject(error);
          }
        }
      }
    );
  });
}

/**
 * Update reminder notification method
 * @param {number} reminderId - Reminder ID
 * @param {string} method - 'dm' or 'server'
 * @returns {Promise<void>}
 */
async function updateNotificationMethod(reminderId, method) {
  const db = getDatabase();

  if (!['dm', 'server'].includes(method)) {
    throw new Error('Notification method must be either "dm" or "server"');
  }

  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE reminders SET notification_method = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [method, reminderId],
      (err) => {
        if (err) {
          logError('ReminderService.updateNotificationMethod', err, ERROR_LEVELS.MEDIUM);
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

module.exports = {
  // Validation functions
  validateSubject,
  validateCategory,
  validateDatetime,
  validateContent,
  validateLink,
  validateImage,

  // CRUD operations
  createReminder,
  addReminderAssignment,
  getReminderById,
  updateReminder,
  deleteReminder,
  listReminders,
  searchReminders,

  // Notification support
  getRemindersForNotification,
  recordNotification,
  isRecipientOptedIn,
  getReminderRecipients,
  updateNotificationMethod
};
