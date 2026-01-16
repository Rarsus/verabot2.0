/**
 * Scripts Error Handler Utility
 * Centralized error handling for all scripts
 * Provides consistent error logging, recovery hints, and exit code management
 * 
 * Usage:
 *   const { handleScriptError, handleFileError, isRecoverableError } = require('./error-handler');
 *   
 *   try {
 *     // script logic
 *   } catch (error) {
 *     handleFileError(error, 'path/to/file.js', 'reading');
 *   }
 */

const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

/**
 * Recoverable error codes that can be retried
 */
const RECOVERABLE_ERRORS = {
  ENOENT: 'File or directory not found',
  EACCES: 'Permission denied',
  ETIMEDOUT: 'Operation timed out',
  ECONNREFUSED: 'Connection refused',
  ECONNRESET: 'Connection reset',
  EHOSTUNREACH: 'Host unreachable',
  ENETUNREACH: 'Network unreachable',
  ENOTFOUND: 'DNS lookup failed',
  EMFILE: 'Too many open files',
  ENFILE: 'Too many open files in system',
};

/**
 * Create error context with metadata
 * @param {string} scriptName - Name of the script
 * @param {string} operation - Current operation being performed
 * @param {object} details - Optional additional details
 * @returns {object} Error context object
 */
function createErrorContext(scriptName, operation, details = null) {
  return {
    scriptName,
    operation,
    timestamp: Date.now(),
    details: details || null,
  };
}

/**
 * Check if an error is recoverable (can be retried)
 * @param {Error} error - Error to check
 * @returns {boolean} True if error is recoverable
 */
function isRecoverableError(error) {
  if (!error || typeof error !== 'object') return false;
  if (!error.code) return false;
  return error.code in RECOVERABLE_ERRORS;
}

/**
 * Format error output with color and structure
 * @param {Error} error - Error object
 * @param {object} context - Error context from createErrorContext
 * @returns {string} Formatted error message
 */
function formatErrorOutput(error, context) {
  const scriptName = path.basename(context.scriptName);
  const operation = context.operation;
  const errorMessage = error.message || 'Unknown error';
  const errorCode = error.code ? ` [${error.code}]` : '';
  
  let output = `${colors.red}❌ Error in ${colors.bright}${scriptName}${colors.reset}${colors.red}`;
  output += `\n   Operation: ${operation}`;
  output += `\n   Message: ${errorMessage}${errorCode}`;

  if (isRecoverableError(error)) {
    output += `\n   ${colors.yellow}⚠️  This error is recoverable. Consider retrying.${colors.reset}`;
  }

  if (context.details && Object.keys(context.details).length > 0) {
    output += `\n   Details:`;
    for (const [key, value] of Object.entries(context.details)) {
      output += `\n     - ${key}: ${value}`;
    }
  }

  output += `\n${colors.reset}`;
  return output;
}

/**
 * Log error with full context to console.error
 * @param {Error} error - Error object
 * @param {object} context - Error context
 */
function logErrorWithContext(error, context) {
  const output = formatErrorOutput(error, context);
  console.error(output);
}

/**
 * Handle file operation errors
 * @param {Error} error - Error from file operation
 * @param {string} filePath - Path to the file
 * @param {string} operation - Operation type (reading, writing, parsing, etc.)
 * @throws {Error} Enhanced error with context
 */
function handleFileError(error, filePath, operation) {
  const fileName = path.basename(filePath);
  const context = createErrorContext('file-operation', operation, {
    file: fileName,
    path: filePath,
    errorCode: error.code,
  });

  logErrorWithContext(error, context);

  const enhancedError = new Error(`File ${operation} failed: ${filePath} - ${error.message}`);
  enhancedError.code = error.code;
  enhancedError.originalError = error;
  enhancedError.context = context;
  
  if (isRecoverableError(error)) {
    enhancedError.recoverable = true;
    enhancedError.recovery = `Try ${operation} again or check file permissions`;
  }

  throw enhancedError;
}

/**
 * Handle command execution errors
 * @param {Error} error - Error from command execution
 * @param {string} command - Command that was executed
 * @param {number} exitCode - Exit code from command
 * @throws {Error} Enhanced error with context
 */
function handleCommandError(error, command, exitCode) {
  const context = createErrorContext('command-execution', command, {
    exitCode,
    errorCode: error.code,
  });

  logErrorWithContext(error, context);

  const enhancedError = new Error(`Command failed: ${command} (exit code: ${exitCode})\n${error.message}`);
  enhancedError.code = error.code;
  enhancedError.exitCode = exitCode;
  enhancedError.command = command;
  enhancedError.originalError = error;
  enhancedError.context = context;

  throw enhancedError;
}

/**
 * Handle process-level errors
 * @param {Error} error - Error object
 * @param {string} processName - Name of the process
 * @param {number} exitCode - Exit code
 * @throws {Error} Enhanced error with context
 */
function handleProcessError(error, processName, exitCode) {
  const context = createErrorContext('process', processName, {
    exitCode,
    errorCode: error.code,
  });

  logErrorWithContext(error, context);

  const enhancedError = new Error(`Process '${processName}' failed with exit code ${exitCode}\n${error.message}`);
  enhancedError.code = error.code;
  enhancedError.exitCode = exitCode;
  enhancedError.processName = processName;
  enhancedError.originalError = error;
  enhancedError.context = context;

  throw enhancedError;
}

/**
 * Handle final script error and exit
 * @param {Error} error - Error object
 * @param {string} scriptName - Name of the script
 * @param {number} exitCode - Exit code to use
 */
function handleScriptError(error, scriptName, exitCode = 1) {
  const context = createErrorContext(scriptName, 'main execution');
  
  logErrorWithContext(error, context);

  console.error(
    `${colors.red}${colors.bright}` +
    `\n❌ Script '${path.basename(scriptName)}' encountered a fatal error and is exiting.` +
    `${colors.reset}\n`
  );

  process.exit(exitCode);
}

module.exports = {
  createErrorContext,
  isRecoverableError,
  formatErrorOutput,
  logErrorWithContext,
  handleFileError,
  handleCommandError,
  handleProcessError,
  handleScriptError,
  RECOVERABLE_ERRORS,
  colors,
};
