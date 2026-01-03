/**
 * Quote Service - Guild-Aware Operations
 *
 * Provides guild-scoped quote management operations.
 * All methods require guildId parameter for guild isolation and GDPR compliance.
 *
 * Usage:
 *   const { addQuote, getAllQuotes } = require('../../services/QuoteService');
 *   const id = await addQuote(guildId, 'Quote text', 'Author name');
 *   const quotes = await getAllQuotes(guildId);
 *
 * @pattern Guild-Aware Service Pattern
 * @see docs/reference/COMMAND-DATABASE-PATTERNS-ANALYSIS.md
 */

const guildAwareDb = require('./GuildAwareDatabaseService');

/**
 * Add a quote to a guild's database
 * @param {string} guildId - Discord guild ID (REQUIRED)
 * @param {string} text - Quote text
 * @param {string} author - Quote author (optional, defaults to 'Anonymous')
 * @returns {Promise<number>} Quote ID
 * @throws {Error} If guildId or text is missing
 */
async function addQuote(guildId, text, author = 'Anonymous') {
  if (!guildId) throw new Error('Guild ID required');
  return guildAwareDb.addQuote(guildId, text, author);
}

/**
 * Get all quotes from a guild's database
 * @param {string} guildId - Discord guild ID (REQUIRED)
 * @returns {Promise<Array<Object>>} Array of quote objects
 * @throws {Error} If guildId is missing
 */
async function getAllQuotes(guildId) {
  if (!guildId) throw new Error('Guild ID required');
  return guildAwareDb.getAllQuotes(guildId);
}

/**
 * Get a quote by ID from a guild's database
 * @param {string} guildId - Discord guild ID (REQUIRED)
 * @param {number} id - Quote ID
 * @returns {Promise<Object|null>} Quote object or null
 * @throws {Error} If guildId or id is missing
 */
async function getQuoteById(guildId, id) {
  if (!guildId) throw new Error('Guild ID required');
  return guildAwareDb.getQuoteById(guildId, id);
}

/**
 * Get a random quote from a guild's database
 * @param {string} guildId - Discord guild ID (REQUIRED)
 * @returns {Promise<Object|null>} Random quote or null if no quotes exist
 * @throws {Error} If guildId is missing
 */
async function getRandomQuote(guildId) {
  if (!guildId) throw new Error('Guild ID required');

  const quotes = await guildAwareDb.getAllQuotes(guildId);
  if (!quotes || quotes.length === 0) {
    return null;
  }

  return quotes[Math.floor(Math.random() * quotes.length)];
}

/**
 * Search quotes by keyword in a guild's database
 * @param {string} guildId - Discord guild ID (REQUIRED)
 * @param {string} keyword - Search keyword
 * @returns {Promise<Array<Object>>} Matching quotes
 * @throws {Error} If guildId or keyword is missing
 */
async function searchQuotes(guildId, keyword) {
  if (!guildId) throw new Error('Guild ID required');
  return guildAwareDb.searchQuotes(guildId, keyword);
}

/**
 * Update a quote in a guild's database
 * @param {string} guildId - Discord guild ID (REQUIRED)
 * @param {number} id - Quote ID
 * @param {string} text - New quote text
 * @param {string} author - New author (optional)
 * @returns {Promise<boolean>} Success status
 * @throws {Error} If guildId, id, or text is missing
 */
async function updateQuote(guildId, id, text, author = 'Anonymous') {
  if (!guildId) throw new Error('Guild ID required');
  return guildAwareDb.updateQuote(guildId, id, text, author);
}

/**
 * Delete a quote from a guild's database
 * @param {string} guildId - Discord guild ID (REQUIRED)
 * @param {number} id - Quote ID
 * @returns {Promise<boolean>} Success status
 * @throws {Error} If guildId or id is missing
 */
async function deleteQuote(guildId, id) {
  if (!guildId) throw new Error('Guild ID required');
  return guildAwareDb.deleteQuote(guildId, id);
}

/**
 * Get total quote count for a guild
 * @param {string} guildId - Discord guild ID (REQUIRED)
 * @returns {Promise<number>} Total quotes in guild
 * @throws {Error} If guildId is missing
 */
async function getQuoteCount(guildId) {
  if (!guildId) throw new Error('Guild ID required');
  return guildAwareDb.getQuoteCount(guildId);
}

/**
 * Rate a quote in a guild's database
 * @param {string} guildId - Discord guild ID (REQUIRED)
 * @param {number} quoteId - Quote ID
 * @param {string} userId - Discord user ID
 * @param {number} rating - Rating (1-5)
 * @returns {Promise<boolean>} Success status
 * @throws {Error} If required parameters are missing/invalid
 */
async function rateQuote(guildId, quoteId, userId, rating) {
  if (!guildId) throw new Error('Guild ID required');
  return guildAwareDb.rateQuote(guildId, quoteId, userId, rating);
}

/**
 * Get average rating for a quote in a guild
 * @param {string} guildId - Discord guild ID (REQUIRED)
 * @param {number} quoteId - Quote ID
 * @returns {Promise<Object>} { average, count }
 * @throws {Error} If guildId or quoteId is missing
 */
async function getQuoteRating(guildId, quoteId) {
  if (!guildId) throw new Error('Guild ID required');
  return guildAwareDb.getQuoteRating(guildId, quoteId);
}

/**
 * Add a tag to a quote in a guild's database
 * @param {string} guildId - Discord guild ID (REQUIRED)
 * @param {number} quoteId - Quote ID
 * @param {string} tagName - Tag name
 * @returns {Promise<boolean>} Success status
 * @throws {Error} If required parameters are missing
 */
async function tagQuote(guildId, quoteId, tagName) {
  if (!guildId) throw new Error('Guild ID required');
  return guildAwareDb.tagQuote(guildId, quoteId, tagName);
}

/**
 * Get quotes by tag in a guild's database
 * @param {string} guildId - Discord guild ID (REQUIRED)
 * @param {string} tagName - Tag name
 * @returns {Promise<Array<Object>>} Quotes with the tag
 * @throws {Error} If guildId or tagName is missing
 */
async function getQuotesByTag(guildId, tagName) {
  if (!guildId) throw new Error('Guild ID required');
  return guildAwareDb.getQuotesByTag(guildId, tagName);
}

/**
 * Export quotes from a guild (for data portability / GDPR)
 * @param {string} guildId - Discord guild ID (REQUIRED)
 * @returns {Promise<Object>} Exported data
 * @throws {Error} If guildId is missing
 */
async function exportGuildData(guildId) {
  if (!guildId) throw new Error('Guild ID required');
  return guildAwareDb.exportGuildData(guildId);
}

/**
 * Export quotes as JSON string
 * @param {string} guildId - Discord guild ID (REQUIRED)
 * @param {Array<Object>} quotes - Quotes to export (optional, exports all if not provided)
 * @returns {Promise<string>} JSON string
 * @throws {Error} If guildId is missing
 */
async function exportAsJson(guildId, quotes = null) {
  if (!guildId) throw new Error('Guild ID required');

  const quotesToExport = quotes || await guildAwareDb.getAllQuotes(guildId);
  return Promise.resolve(JSON.stringify(quotesToExport, null, 2));
}

/**
 * Export quotes as CSV string
 * @param {string} guildId - Discord guild ID (REQUIRED)
 * @param {Array<Object>} quotes - Quotes to export (optional, exports all if not provided)
 * @returns {Promise<string>} CSV string
 * @throws {Error} If guildId is missing
 */
async function exportAsCSV(guildId, quotes = null) {
  if (!guildId) throw new Error('Guild ID required');

  const quotesToExport = quotes || await guildAwareDb.getAllQuotes(guildId);

  if (!quotesToExport || quotesToExport.length === 0) {
    return 'id,text,author,addedAt';
  }

  const headers = ['id', 'text', 'author', 'addedAt'];
  const rows = quotesToExport.map(q => [
    q.id,
    `"${(q.text || '').replace(/"/g, '""')}"`,
    `"${(q.author || '').replace(/"/g, '""')}"`,
    q.addedAt || ''
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
 * Get guild statistics
 * @param {string} guildId - Discord guild ID (REQUIRED)
 * @returns {Promise<Object>} Statistics object
 * @throws {Error} If guildId is missing
 */
async function getGuildStatistics(guildId) {
  if (!guildId) throw new Error('Guild ID required');
  return guildAwareDb.getGuildStatistics(guildId);
}

/**
 * Delete all data for a guild (GDPR compliance)
 * @param {string} guildId - Discord guild ID (REQUIRED)
 * @returns {Promise<void>}
 * @throws {Error} If guildId is missing
 */
async function deleteGuildData(guildId) {
  if (!guildId) throw new Error('Guild ID required');
  return guildAwareDb.deleteGuildData(guildId);
}

module.exports = {
  // Quote CRUD
  addQuote,
  getAllQuotes,
  getQuoteById,
  getRandomQuote,
  searchQuotes,
  updateQuote,
  deleteQuote,
  getQuoteCount,

  // Rating operations
  rateQuote,
  getQuoteRating,

  // Tagging operations
  tagQuote,
  getQuotesByTag,

  // Export operations
  exportGuildData,
  exportAsJson,
  exportAsCSV,

  // Statistics and GDPR
  getGuildStatistics,
  deleteGuildData
};
