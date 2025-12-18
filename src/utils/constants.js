/**
 * Application Constants
 */

const EMBED_COLORS = {
  SUCCESS: 0x00ff00,
  ERROR: 0xff0000,
  INFO: 0x0099ff,
  WARNING: 0xffaa00
};

const MESSAGE_FLAGS = {
  EPHEMERAL: 64,
  SILENT: 4096
};

const ERROR_MESSAGES = {
  INTERNAL_ERROR: 'An internal error occurred. Please try again later.',
  INVALID_INPUT: 'Invalid input provided.',
  DATABASE_ERROR: 'A database error occurred. Please try again later.',
  COMMAND_NOT_FOUND: 'Command not found.',
  INSUFFICIENT_PERMISSIONS: 'You do not have permission to use this command.'
};

const LIMITS = {
  QUOTE_TEXT_MAX: 500,
  QUOTE_AUTHOR_MAX: 100,
  SEARCH_RESULTS_MAX: 25,
  QUOTES_PER_PAGE: 5
};

module.exports = {
  EMBED_COLORS,
  MESSAGE_FLAGS,
  ERROR_MESSAGES,
  LIMITS
};
