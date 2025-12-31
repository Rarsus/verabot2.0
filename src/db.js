/**
 * Database Module - Wrapper for SQLite database operations
 *
 * This module provides a clean interface for quote management operations.
 * The underlying implementation uses SQLite for better performance and scalability.
 */

const database = require('./services/DatabaseService');

/**
 * Add a quote with validation
 * @param {string} quote - Quote text
 * @param {string} author - Quote author
 * @returns {Promise<number>} Quote ID
 */
async function addQuote(quote, author = 'Anonymous') {
  if (typeof quote !== 'string') {
    throw new Error('Quote must be a string');
  }
  if (typeof author !== 'string') {
    throw new Error('Author must be a string');
  }

  return database.addQuote(quote, author);
}

/**
 * Get all quotes
 * @returns {Promise<Array>} Array of quotes
 */
async function getAllQuotes() {
  return database.getAllQuotes();
}

/**
 * Get quote by number (legacy support - uses ID)
 * @param {number} number - Quote number
 * @returns {Promise<Object|null>} Quote object or null
 */
async function getQuoteByNumber(number) {
  if (!Number.isInteger(number)) {
    throw new Error('Quote number must be an integer');
  }

  return database.getQuoteById(number);
}

/**
 * Search quotes by keyword
 * @param {string} keyword - Search keyword
 * @returns {Promise<Array>} Matching quotes
 */
async function searchQuotes(keyword) {
  if (typeof keyword !== 'string') {
    throw new Error('Search keyword must be a string');
  }

  return database.searchQuotes(keyword);
}

/**
 * Update a quote
 * @param {number} id - Quote ID
 * @param {string} text - New text
 * @param {string} author - New author
 * @returns {Promise<boolean>} Success status
 */
async function updateQuote(id, text, author) {
  if (!Number.isInteger(id)) {
    throw new Error('Quote ID must be an integer');
  }

  return database.updateQuote(id, text, author);
}

/**
 * Delete a quote
 * @param {number} id - Quote ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteQuote(id) {
  if (!Number.isInteger(id)) {
    throw new Error('Quote ID must be an integer');
  }

  return database.deleteQuote(id);
}

/**
 * Get total quote count
 * @returns {Promise<number>} Total quotes
 */
async function getQuoteCount() {
  return database.getQuoteCount();
}

/**
 * Rate a quote
 * @param {number} quoteId - Quote ID
 * @param {string} userId - User ID
 * @param {number} rating - Rating 1-5
 * @returns {Promise<Object>} Result with success status and average rating
 */
async function rateQuote(quoteId, userId, rating) {
  if (!Number.isInteger(quoteId)) {
    throw new Error('Quote ID must be an integer');
  }
  if (typeof userId !== 'string') {
    throw new Error('User ID must be a string');
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Rating must be an integer between 1 and 5');
  }

  return database.rateQuote(quoteId, userId, rating);
}

/**
 * Get quote by ID
 * @param {number} id - Quote ID
 * @returns {Promise<Object|null>} Quote object or null
 */
async function getQuoteById(id) {
  if (!Number.isInteger(id)) {
    throw new Error('Quote ID must be an integer');
  }

  return database.getQuoteById(id);
}

/**
 * Add a tag
 * @param {string} tagName - Tag name
 * @returns {Promise<number>} Tag ID
 */
async function addTag(tagName) {
  if (typeof tagName !== 'string') {
    throw new Error('Tag name must be a string');
  }

  return database.addTag(tagName);
}

/**
 * Get tag by name
 * @param {string} tagName - Tag name
 * @returns {Promise<Object|null>} Tag object or null
 */
async function getTagByName(tagName) {
  if (typeof tagName !== 'string') {
    throw new Error('Tag name must be a string');
  }

  return database.getTagByName(tagName);
}

/**
 * Add tag to quote
 * @param {number} quoteId - Quote ID
 * @param {number} tagId - Tag ID
 * @returns {Promise<void>}
 */
async function addTagToQuote(quoteId, tagId) {
  if (!Number.isInteger(quoteId)) {
    throw new Error('Quote ID must be an integer');
  }
  if (!Number.isInteger(tagId)) {
    throw new Error('Tag ID must be an integer');
  }

  return database.addTagToQuote(quoteId, tagId);
}

/**
 * Export quotes as JSON
 * @param {array} quotes - Quotes to export (optional, exports all if not provided)
 * @returns {Promise<string>} JSON string
 */
async function exportQuotesAsJson(quotes) {
  return database.exportQuotesAsJson(quotes);
}

/**
 * Export quotes as CSV
 * @param {array} quotes - Quotes to export (optional, exports all if not provided)
 * @returns {Promise<string>} CSV string
 */
async function exportQuotesAsCsv(quotes) {
  return database.exportQuotesAsCsv(quotes);
}

module.exports = {
  addQuote,
  getAllQuotes,
  getQuoteByNumber,
  searchQuotes,
  updateQuote,
  deleteQuote,
  getQuoteCount,
  rateQuote,
  getQuoteById,
  addTag,
  getTagByName,
  addTagToQuote,
  exportQuotesAsJson,
  exportQuotesAsCsv
};
