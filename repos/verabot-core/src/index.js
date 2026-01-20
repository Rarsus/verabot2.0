const exports = {};

// Core infrastructure
exports.CommandBase = require('./core/CommandBase');
exports.CommandOptions = require('./core/CommandOptions');
exports.EventBase = require('./core/EventBase');

// Services (gracefully handle missing dependencies)
exports.DatabaseService = require('./services/DatabaseService');
exports.GuildAwareDatabaseService = require('./services/GuildAwareDatabaseService');
exports.DiscordService = require('./services/DiscordService');
exports.ValidationService = require('./services/ValidationService');

try {
  exports.GuildDatabaseManager = require('./services/GuildDatabaseManager');
  // eslint-disable-next-line no-unused-vars
} catch (_error) {
  // GuildDatabaseManager not available
}

try {
  module.exports.RolePermissionService = require('./services/RolePermissionService');
  // eslint-disable-next-line no-unused-vars
} catch (_error) {
  // RolePermissionService not available
}

// Helpers
exports.responseHelpers = require('./helpers/response-helpers');
exports.apiHelpers = require('./helpers/api-helpers');

module.exports = exports;
