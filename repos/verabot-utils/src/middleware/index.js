// Middleware exports
const errorHandler = require('./errorHandler');
const validator = require('./validator');
const logger = require('./logger');
const inputValidator = require('./inputValidator');
const corsHandler = require('./corsHandler');

module.exports = {
  errorHandler,
  validator,
  logger,
  inputValidator,
  corsHandler
};
