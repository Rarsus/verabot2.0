/**
 * Guild-Aware Database Wrapper
 *
 * This file extends DatabaseService with guild-aware overloads for all quote-related methods.
 * It's loaded at the end of DatabaseService.js to provide a unified API.
 *
 * Pattern:
 *   - If first parameter is a Discord ID → route to GuildAwareDatabaseService
 *   - Otherwise → use legacy shared database behavior
 */

const GuildAwareDatabaseService = require('./GuildAwareDatabaseService');

/**
 * Check if a value looks like a Discord guild ID (18-20 digit string)
 * @private
 * @param {*} val - Value to check
 * @returns {boolean} True if looks like Discord ID
 */
function isDiscordId(val) {
  return typeof val === 'string' && /^\d{18,20}$/.test(val);
}

// Store original methods
const OriginalDatabaseService = {
  searchQuotes: null,
  updateQuote: null,
  deleteQuote: null,
  getQuoteCount: null,
  rateQuote: null,
  getQuoteRating: null,
  tagQuote: null,
  getQuotesByTag: null,
};

/**
 * Wrap a database method to support guild-aware API
 *
 * @param {string} methodName - Name of the method to wrap
 * @param {Function} legacyMethod - Original method
 * @param {Function} guildAwareMethod - Guild-aware counterpart in GuildAwareDatabaseService
 * @param {Array<string>} legacyParamNames - Names of legacy method parameters
 * @returns {Function} Wrapped method
 */
function createGuildAwareWrapper(methodName, legacyMethod, guildAwareMethod, _legacyParamNames) {
  return function (...args) {
    // If first argument is a Discord ID, use guild-aware API
    if (args.length > 0 && isDiscordId(args[0])) {
      const guildId = args[0];
      const restArgs = args.slice(1);
      return guildAwareMethod.apply(GuildAwareDatabaseService, [guildId, ...restArgs]);
    }

    // Otherwise use legacy API
    return legacyMethod.apply(this, args);
  };
}

/**
 * Apply guild-aware wrappers to DatabaseService exports
 * This is called at the end of DatabaseService.js
 *
 * @param {Object} exportedService - The module.exports object from DatabaseService
 * @returns {void}
 */
function enableGuildAwareAPI(exportedService) {
  // Store originals
  OriginalDatabaseService.searchQuotes = exportedService.searchQuotes;
  OriginalDatabaseService.updateQuote = exportedService.updateQuote;
  OriginalDatabaseService.deleteQuote = exportedService.deleteQuote;
  OriginalDatabaseService.getQuoteCount = exportedService.getQuoteCount;
  OriginalDatabaseService.rateQuote = exportedService.rateQuote;
  OriginalDatabaseService.getQuoteRating = exportedService.getQuoteRating;
  OriginalDatabaseService.tagQuote = exportedService.tagQuote;
  OriginalDatabaseService.getQuotesByTag = exportedService.getQuotesByTag;

  // Wrap all methods
  exportedService.searchQuotes = createGuildAwareWrapper(
    'searchQuotes',
    OriginalDatabaseService.searchQuotes,
    GuildAwareDatabaseService.searchQuotes,
    ['keyword']
  );

  exportedService.updateQuote = createGuildAwareWrapper(
    'updateQuote',
    OriginalDatabaseService.updateQuote,
    GuildAwareDatabaseService.updateQuote,
    ['id', 'text', 'author']
  );

  exportedService.deleteQuote = createGuildAwareWrapper(
    'deleteQuote',
    OriginalDatabaseService.deleteQuote,
    GuildAwareDatabaseService.deleteQuote,
    ['id']
  );

  exportedService.getQuoteCount = createGuildAwareWrapper(
    'getQuoteCount',
    OriginalDatabaseService.getQuoteCount,
    GuildAwareDatabaseService.getQuoteCount,
    []
  );

  exportedService.rateQuote = createGuildAwareWrapper(
    'rateQuote',
    OriginalDatabaseService.rateQuote,
    GuildAwareDatabaseService.rateQuote,
    ['quoteId', 'userId', 'rating']
  );

  exportedService.getQuoteRating = createGuildAwareWrapper(
    'getQuoteRating',
    OriginalDatabaseService.getQuoteRating,
    GuildAwareDatabaseService.getQuoteRating,
    ['quoteId', 'userId']
  );

  exportedService.tagQuote = createGuildAwareWrapper(
    'tagQuote',
    OriginalDatabaseService.tagQuote,
    GuildAwareDatabaseService.tagQuote,
    ['quoteId', 'tagName']
  );

  exportedService.getQuotesByTag = createGuildAwareWrapper(
    'getQuotesByTag',
    OriginalDatabaseService.getQuotesByTag,
    GuildAwareDatabaseService.getQuotesByTag,
    ['tagName']
  );

  // Add new guild-aware only methods
  exportedService.getGuildStatistics = function (guildId) {
    if (!isDiscordId(guildId)) {
      throw new Error('getGuildStatistics requires a guild ID');
    }
    return GuildAwareDatabaseService.getGuildStatistics(guildId);
  };

  exportedService.exportGuildData = function (guildId) {
    if (!isDiscordId(guildId)) {
      throw new Error('exportGuildData requires a guild ID');
    }
    return GuildAwareDatabaseService.exportGuildData(guildId);
  };

  exportedService.deleteGuildData = function (guildId) {
    if (!isDiscordId(guildId)) {
      throw new Error('deleteGuildData requires a guild ID');
    }
    return GuildAwareDatabaseService.deleteGuildData(guildId);
  };

  // Add guild manager access for shutdown
  exportedService.closeAllGuildDatabases = async function () {
    const guildManager = require('./GuildDatabaseManager');
    return guildManager.closeAllDatabases();
  };
}

module.exports = {
  enableGuildAwareAPI,
  isDiscordId,
  OriginalDatabaseService,
};
