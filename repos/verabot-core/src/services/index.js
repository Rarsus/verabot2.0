/**
 * Services Module
 * Exports all core services for database, Discord, and validation
 */

const exports = {};

exports.DatabaseService = require('./DatabaseService');
exports.GuildAwareDatabaseService = require('./GuildAwareDatabaseService');
exports.DiscordService = require('./DiscordService');
exports.ValidationService = require('./ValidationService');

try {
  exports.GuildDatabaseManager = require('./GuildDatabaseManager');
  // eslint-disable-next-line no-unused-vars
} catch (_error) {
  // GuildDatabaseManager dependencies not available
}

try {
  exports.RolePermissionService = require('./RolePermissionService');
  // eslint-disable-next-line no-unused-vars
} catch (_error) {
  // RolePermissionService dependencies not available
}

module.exports = exports;
