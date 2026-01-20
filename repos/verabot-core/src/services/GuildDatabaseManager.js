/**
 * GuildDatabaseManager - Re-export from verabot-utils
 *
 * Manages per-guild SQLite database connections and lifecycle.
 * One database file per guild: data/db/guilds/{GUILD_ID}/quotes.db
 */

const GuildDatabaseManager = require('verabot-utils/services/GuildDatabaseManager');

module.exports = GuildDatabaseManager;
