/**
 * API Helper Utilities
 * Helpers for API interactions and external service calls
 */

/**
 * Validate API response
 * @param {Object} response - Response object
 * @param {string} context - Context for error logging
 * @returns {boolean} True if valid
 * @throws {Error} If response is invalid
 */
function validateResponse(response, context) {
  if (!response) {
    throw new Error(`[${context}] Null or undefined response`);
  }

  if (response.error) {
    throw new Error(`[${context}] API Error: ${response.error}`);
  }

  return true;
}

/**
 * Parse pagination parameters
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Items per page
 * @returns {Object} { offset, limit }
 */
function parsePagination(page = 1, limit = 10) {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
  const offset = (pageNum - 1) * limitNum;

  return { offset, limit: limitNum, page: pageNum };
}

/**
 * Format API error response
 * @param {Error} error - Error object
 * @param {string} context - Context for error
 * @returns {Object} Formatted error response
 */
function formatErrorResponse(error, context) {
  return {
    success: false,
    error: error.message || 'Unknown error',
    context,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Format success response
 * @param {*} data - Response data
 * @param {Object} metadata - Optional metadata
 * @returns {Object} Formatted response
 */
function formatSuccessResponse(data, metadata = {}) {
  return {
    success: true,
    data,
    metadata,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Retry API call with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} initialDelay - Initial delay in ms
 * @returns {Promise<*>} Result of function
 */
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Throttle API calls
 * @param {Function} fn - Async function to throttle
 * @param {number} delay - Delay between calls in ms
 * @returns {Function} Throttled function
 */
function throttleApiCall(fn, delay = 1000) {
  let lastCall = 0;

  return async function (...args) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall < delay) {
      await new Promise((resolve) => setTimeout(resolve, delay - timeSinceLastCall));
    }

    lastCall = Date.now();
    return fn(...args);
  };
}

module.exports = {
  validateResponse,
  parsePagination,
  formatErrorResponse,
  formatSuccessResponse,
  retryWithBackoff,
  throttleApiCall,
};
