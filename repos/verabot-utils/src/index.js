// verabot-utils main entry point
// Shared utilities, services, and database abstractions

const core = require('./core');
const services = require('./services');
const middleware = require('./middleware');
const utils = require('./utils');
const database = require('./database');

module.exports = {
  // Core classes for command and event handling
  core,

  // Business logic services
  services,

  // Cross-cutting concerns
  middleware,

  // Utilities and helpers
  utils,

  // Database layer
  database,

  // Convenience exports for direct access
  CommandBase: core.CommandBase,
  CommandOptions: core.CommandOptions,
  EventBase: core.EventBase,
  
  // Common services
  DatabaseService: services.DatabaseService,
  GuildAwareDatabaseService: services.GuildAwareDatabaseService,
  QuoteService: services.QuoteService,
  GuildAwareReminderService: services.GuildAwareReminderService,
  ValidationService: services.ValidationService,
  
  // Response helpers
  responseHelpers: utils.helpers.responseHelpers
};
