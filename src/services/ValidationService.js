/**
 * Validation Service
 * Business logic for data validation
 */

/**
 * Validate quote text
 * @param {string} text - Quote text
 * @returns {object} Validation result
 */
function validateQuoteText(text) {
  if (!text || typeof text !== 'string') {
    return { valid: false, error: 'Quote text must be a string' };
  }
  
  if (text.trim().length === 0) {
    return { valid: false, error: 'Quote text cannot be empty' };
  }
  
  if (text.length > 500) {
    return { valid: false, error: 'Quote text cannot exceed 500 characters' };
  }
  
  return { valid: true };
}

/**
 * Validate author
 * @param {string} author - Author name
 * @returns {object} Validation result
 */
function validateAuthor(author) {
  if (!author || typeof author !== 'string') {
    return { valid: false, error: 'Author must be a string' };
  }
  
  if (author.length > 100) {
    return { valid: false, error: 'Author name cannot exceed 100 characters' };
  }
  
  return { valid: true };
}

/**
 * Validate quote number
 * @param {any} number - Quote number
 * @returns {object} Validation result
 */
function validateQuoteNumber(number) {
  const num = parseInt(number);
  
  if (isNaN(num)) {
    return { valid: false, error: 'Quote number must be a valid integer' };
  }
  
  if (num < 1) {
    return { valid: false, error: 'Quote number must be greater than 0' };
  }
  
  return { valid: true };
}

module.exports = {
  validateQuoteText,
  validateAuthor,
  validateQuoteNumber
};
