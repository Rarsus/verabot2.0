/**
 * Error Handler Utility
 * Provides consistent error handling and logging across the bot
 */

const ERROR_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

/**
 * Log an error with context
 * @param {string} context - Where the error occurred (command name, function, etc.)
 * @param {Error|string} error - The error or error message
 * @param {string} level - Error level (LOW, MEDIUM, HIGH, CRITICAL)
 * @param {object} metadata - Additional context (optional)
 */
function logError(context, error, level = ERROR_LEVELS.MEDIUM, metadata = {}) {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : '';

  // Build log entry for potential future use (logging service integration)
  void {
    timestamp,
    context,
    level,
    message: errorMessage,
    ...(errorStack && { stack: errorStack }),
    ...metadata
  };

  // Color-coded console output
  const colors = {
    LOW: '\x1b[36m',      // Cyan
    MEDIUM: '\x1b[33m',   // Yellow
    HIGH: '\x1b[31m',     // Red
    CRITICAL: '\x1b[35m'  // Magenta
  };
  const reset = '\x1b[0m';
  const color = colors[level] || reset;

  console.error(`${color}[${level}] ${context}${reset}`, errorMessage);
  if (errorStack) {
    console.error(`${color}Stack:${reset}`, errorStack);
  }
  if (Object.keys(metadata).length > 0) {
    console.error(`${color}Metadata:${reset}`, metadata);
  }
}

/**
 * Handle command interaction errors
 * @param {object} interaction - Discord interaction
 * @param {Error|string} error - The error
 * @param {string} context - Where the error occurred
 */
async function handleInteractionError(interaction, error, context) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  logError(context, error, ERROR_LEVELS.MEDIUM, {
    userId: interaction.user?.id,
    commandName: interaction.commandName
  });

  try {
    const response = `❌ An error occurred: ${errorMessage}`;
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: response, flags: 64 });
    } else {
      await interaction.reply({ content: response, flags: 64 });
    }
  } catch (replyErr) {
    logError(`${context} (reply error)`, replyErr, ERROR_LEVELS.HIGH, {
      userId: interaction.user?.id
    });
  }
}

/**
 * Validate and sanitize quote text
 * @param {string} text - The quote text
 * @returns {object} {valid: boolean, error: string|null, sanitized: string}
 */
function validateQuoteText(text) {
  if (!text || typeof text !== 'string') {
    return { valid: false, error: 'Quote must be a non-empty string', sanitized: null };
  }

  const trimmed = text.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Quote cannot be empty', sanitized: null };
  }

  if (trimmed.length > 500) {
    return { valid: false, error: 'Quote cannot exceed 500 characters', sanitized: null };
  }

  if (trimmed.length < 3) {
    return { valid: false, error: 'Quote must be at least 3 characters', sanitized: null };
  }

  return { valid: true, error: null, sanitized: trimmed };
}

/**
 * Validate and sanitize author name
 * @param {string} author - The author name
 * @returns {object} {valid: boolean, error: string|null, sanitized: string}
 */
function validateAuthor(author) {
  // Author can be empty (defaults to Anonymous)
  if (!author || typeof author !== 'string') {
    return { valid: true, error: null, sanitized: 'Anonymous' };
  }

  const trimmed = author.trim();

  // If empty, default to Anonymous
  if (trimmed.length === 0) {
    return { valid: true, error: null, sanitized: 'Anonymous' };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Author name cannot exceed 100 characters', sanitized: null };
  }

  return { valid: true, error: null, sanitized: trimmed };
}

/**
 * Validate quote number
 * @param {number} number - The quote number
 * @param {number} maxNumber - Maximum valid quote number
 * @returns {object} {valid: boolean, error: string|null}
 */
function validateQuoteNumber(number, maxNumber) {
  if (!Number.isInteger(number)) {
    return { valid: false, error: 'Quote number must be an integer' };
  }

  if (number < 1) {
    return { valid: false, error: 'Quote number must be at least 1' };
  }

  if (number > maxNumber) {
    return { valid: false, error: `Quote number cannot exceed ${maxNumber}` };
  }

  return { valid: true, error: null };
}

module.exports = {
  ERROR_LEVELS,
  logError,
  handleInteractionError,
  validateQuoteText,
  validateAuthor,
  validateQuoteNumber
};
