/**
 * Input Validator Middleware
 * Provides comprehensive input validation and sanitization
 * Prevents SQL injection, XSS, and other security vulnerabilities
 */

const { logError, ERROR_LEVELS } = require('./errorHandler');

// SQL Injection patterns to detect
const SQL_INJECTION_PATTERNS = [
  /(\s|^)(union|select|insert|update|delete|drop|create|alter|exec|execute|script|javascript|eval)(\s|$)/gi,
  /[';]--/gi,
  /\/\*.*?\*\//gi,
  /(0x[0-9a-f]+)/gi,
  /(\s|^)(or|and)(\s|$).*?[=<>]/gi,
];

// XSS patterns to detect - well-tested patterns, not user-generated
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*>/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi,
  /javascript:/gi,
  /data:text\/html/gi,
];

/**
 * Validate and sanitize text input
 * @param {string} input - Input to validate
 * @param {object} options - Validation options
 * @returns {object} { valid: boolean, sanitized: string, errors: array }
 */
function validateTextInput(input, options = {}) {
  const {
    minLength = 1,
    maxLength = 2000,
    allowEmpty = false,
    checkSQLInjection = true,
    checkXSS = true,
    customPattern = null,
    fieldName = 'input',
  } = options;

  const errors = [];

  // Type check
  if (typeof input !== 'string') {
    errors.push(`${fieldName} must be a string`);
    return { valid: false, sanitized: '', errors };
  }

  // Trim input
  const trimmed = input.trim();

  // Empty check
  if (!allowEmpty && trimmed.length === 0) {
    errors.push(`${fieldName} cannot be empty`);
    return { valid: false, sanitized: trimmed, errors };
  }

  // Length validation
  if (trimmed.length < minLength) {
    errors.push(`${fieldName} must be at least ${minLength} characters`);
  }

  if (trimmed.length > maxLength) {
    errors.push(`${fieldName} must be at most ${maxLength} characters`);
  }

  // SQL Injection check
  if (checkSQLInjection && detectSQLInjection(trimmed)) {
    errors.push(`${fieldName} contains potentially malicious SQL patterns`);
    logError('InputValidator', `SQL injection attempt detected in ${fieldName}`, ERROR_LEVELS.HIGH, {
      input: trimmed.substring(0, 100),
    });
  }

  // XSS check
  if (checkXSS && detectXSS(trimmed)) {
    errors.push(`${fieldName} contains potentially malicious script patterns`);
    logError('InputValidator', `XSS attempt detected in ${fieldName}`, ERROR_LEVELS.HIGH, {
      input: trimmed.substring(0, 100),
    });
  }

  // Custom pattern validation
  if (customPattern && !customPattern.test(trimmed)) {
    errors.push(`${fieldName} does not match required pattern`);
  }

  return {
    valid: errors.length === 0,
    sanitized: sanitizeString(trimmed),
    errors,
  };
}

/**
 * Detect SQL injection patterns
 * @param {string} input - Input to check
 * @returns {boolean} True if SQL injection detected
 */
function detectSQLInjection(input) {
  if (!input || typeof input !== 'string') return false;

  return SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Detect XSS patterns
 * @param {string} input - Input to check
 * @returns {boolean} True if XSS detected
 */
function detectXSS(input) {
  if (!input || typeof input !== 'string') return false;

  return XSS_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Sanitize string by removing potentially dangerous characters
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeString(input) {
  if (!input || typeof input !== 'string') return '';

  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');

  // Remove control characters except newline and tab
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  return sanitized;
}

/**
 * Validate numeric input
 * @param {*} input - Input to validate
 * @param {object} options - Validation options
 * @returns {object} { valid: boolean, value: number, errors: array }
 */
function validateNumericInput(input, options = {}) {
  const {
    min = Number.MIN_SAFE_INTEGER,
    max = Number.MAX_SAFE_INTEGER,
    integer = false,
    positive = false,
    fieldName = 'input',
  } = options;

  const errors = [];

  // Type coercion and validation
  const num = Number(input);

  if (isNaN(num)) {
    errors.push(`${fieldName} must be a valid number`);
    return { valid: false, value: null, errors };
  }

  // Integer check
  if (integer && !Number.isInteger(num)) {
    errors.push(`${fieldName} must be an integer`);
  }

  // Positive check
  if (positive && num <= 0) {
    errors.push(`${fieldName} must be positive`);
  }

  // Range validation
  if (num < min) {
    errors.push(`${fieldName} must be at least ${min}`);
  }

  if (num > max) {
    errors.push(`${fieldName} must be at most ${max}`);
  }

  return {
    valid: errors.length === 0,
    value: num,
    errors,
  };
}

/**
 * Validate Discord user ID
 * @param {string} userId - User ID to validate
 * @returns {object} { valid: boolean, errors: array }
 */
function validateDiscordId(userId) {
  const errors = [];

  if (typeof userId !== 'string') {
    errors.push('User ID must be a string');
    return { valid: false, errors };
  }

  // Discord IDs are numeric strings (snowflakes)
  if (!/^\d{17,19}$/.test(userId)) {
    errors.push('Invalid Discord ID format');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Rate limiting helper - simple in-memory implementation
 */
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  /**
   * Check if request is allowed
   * @param {string} identifier - Unique identifier (user ID, IP, etc.)
   * @returns {boolean} True if request is allowed
   */
  isAllowed(identifier) {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];

    // Remove expired requests
    const validRequests = userRequests.filter((timestamp) => now - timestamp < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      this.requests.set(identifier, validRequests);
      return false;
    }

    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }

  /**
   * Get remaining requests for identifier
   * @param {string} identifier - Unique identifier
   * @returns {number} Remaining requests
   */
  getRemaining(identifier) {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    const validRequests = userRequests.filter((timestamp) => now - timestamp < this.windowMs);

    return Math.max(0, this.maxRequests - validRequests.length);
  }

  /**
   * Reset rate limit for identifier
   * @param {string} identifier - Unique identifier
   */
  reset(identifier) {
    this.requests.delete(identifier);
  }

  /**
   * Clear all rate limits
   */
  clear() {
    this.requests.clear();
  }
}

module.exports = {
  validateTextInput,
  validateNumericInput,
  validateDiscordId,
  detectSQLInjection,
  detectXSS,
  sanitizeString,
  RateLimiter,
};
