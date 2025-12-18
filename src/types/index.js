/**
 * Type Definitions
 * JSDoc type definitions for the application
 */

/**
 * @typedef {Object} Quote
 * @property {number} id - Quote ID
 * @property {string} text - Quote text
 * @property {string} author - Quote author
 * @property {string} addedAt - When quote was added
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} CommandConfig
 * @property {string} name - Command name
 * @property {string} description - Command description
 * @property {object} data - SlashCommandBuilder data
 * @property {Array} options - Command options
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether validation passed
 * @property {string} error - Error message if invalid
 */

/**
 * @typedef {Object} CommandContext
 * @property {object} interaction - Discord interaction
 * @property {object} client - Discord client
 * @property {Map} commands - Registered commands map
 */

module.exports = {};
