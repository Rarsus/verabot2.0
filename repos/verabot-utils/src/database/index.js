// Database layer exports
const connection = require('./connection');
const schema = require('./schema');

module.exports = {
  connection,
  schema,
  // Legacy adapter for backward compatibility
  legacyAdapter: require('./legacy-adapter')
};
