/**
 * Reminder System Constants
 * Defines constants for reminder categories, statuses, and validation
 */

// Reminder statuses
const REMINDER_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Default reminder categories
const REMINDER_CATEGORIES = {
  MEETING: 'Meeting',
  TASK: 'Task',
  EVENT: 'Event',
  DEADLINE: 'Deadline',
  GENERAL: 'General'
};

// Validation limits
const REMINDER_LIMITS = {
  SUBJECT_MIN_LENGTH: 3,
  SUBJECT_MAX_LENGTH: 200,
  CONTENT_MAX_LENGTH: 2000,
  CATEGORY_MAX_LENGTH: 50,
  URL_MAX_LENGTH: 500
};

// Notification timing
const NOTIFICATION_DEFAULTS = {
  CHECK_INTERVAL: 60000, // 1 minute
  ADVANCE_HOURS: 0, // No advance by default
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 300000 // 5 minutes
};

module.exports = {
  REMINDER_STATUS,
  REMINDER_CATEGORIES,
  REMINDER_LIMITS,
  NOTIFICATION_DEFAULTS
};
