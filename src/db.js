/**
 * Database Module - Wrapper for SQLite database operations
 * 
 * This module provides a clean interface for quote management operations.
 * The underlying implementation uses SQLite for better performance and scalability.
 */

const database = require('./database');

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

  return await database.addQuote(quote, author);
}

/**
 * Get all quotes
 * @returns {Promise<Array>} Array of quotes
 */
async function getAllQuotes() {
  return await database.getAllQuotes();
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

  return await database.getQuoteById(number);
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

  return await database.searchQuotes(keyword);
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

  return await database.updateQuote(id, text, author);
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

  return await database.deleteQuote(id);
}

/**
 * Get total quote count
 * @returns {Promise<number>} Total quotes
 */
async function getQuoteCount() {
  return await database.getQuoteCount();
}

module.exports = {
  addQuote,
  getAllQuotes,
  getQuoteByNumber,
  searchQuotes,
  updateQuote,
  deleteQuote,
  getQuoteCount
};
