/**
 * Logger Middleware
 * Provides centralized logging functionality
 */

const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
};

/**
 * Log a message
 * @param {string} level - Log level
 * @param {string} context - Context/category
 * @param {string} message - Message to log
 * @param {object} data - Additional data (optional)
 */
function log(level, context, message, data = {}) {
  const timestamp = new Date().toISOString();
  // Entry object for future logging service integration
  // const _entry = {
  //   timestamp,
  //   level,
  //   context,
  //   message,
  //   ...data
  // };

  // Future: Could integrate with logging service
  console.log(`[${timestamp}] [${level}] [${context}] ${message}`, data);
}

module.exports = { log, LOG_LEVELS };
