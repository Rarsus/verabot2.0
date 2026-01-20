/**
 * GuildAwareDatabaseService - Re-export from verabot-utils
 *
 * Wrapper around GuildDatabaseManager that provides guild-specific
 * database operations. All methods require guildId parameter.
 *
 * Usage:
 *   const quote = await db.addQuote(guildId, text, author);
 *   const quotes = await db.getAllQuotes(guildId);
 */

const GuildAwareDatabaseService = require('verabot-utils/services/GuildAwareDatabaseService');

module.exports = GuildAwareDatabaseService;
