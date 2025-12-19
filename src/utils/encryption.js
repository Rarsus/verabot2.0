/**
 * Simple Encryption Utility
 * Uses basic encryption for storing sensitive configuration
 * Note: In production, consider using more robust encryption or external secret management
 */

const crypto = require('crypto');

// Use environment variable or default key (should be set in production)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypt a value
 * @param {string} text - Plain text to encrypt
 * @returns {string} Encrypted value (iv:encrypted format)
 */
function encryptValue(text) {
  if (!text) return '';
  
  try {
    const key = Buffer.from(ENCRYPTION_KEY.substring(0, 64), 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (err) {
    console.error('Encryption error:', err.message);
    throw new Error('Failed to encrypt value');
  }
}

/**
 * Decrypt a value
 * @param {string} encryptedText - Encrypted text (iv:encrypted format)
 * @returns {string} Decrypted plain text
 */
function decryptValue(encryptedText) {
  if (!encryptedText) return '';
  
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted format');
    }
    
    const key = Buffer.from(ENCRYPTION_KEY.substring(0, 64), 'hex');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (err) {
    console.error('Decryption error:', err.message);
    throw new Error('Failed to decrypt value');
  }
}

/**
 * Generate a secure random token
 * @param {number} length - Token length in bytes (default 32)
 * @returns {string} Random hex token
 */
function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Create HMAC signature for webhook verification
 * @param {string} payload - Payload to sign
 * @param {string} secret - Secret key
 * @returns {string} HMAC signature
 */
function createHmacSignature(payload, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  return hmac.digest('hex');
}

/**
 * Verify HMAC signature
 * @param {string} payload - Original payload
 * @param {string} signature - Signature to verify
 * @param {string} secret - Secret key
 * @returns {boolean} True if signature is valid
 */
function verifyHmacSignature(payload, signature, secret) {
  const expectedSignature = createHmacSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

module.exports = {
  encryptValue,
  decryptValue,
  generateSecureToken,
  createHmacSignature,
  verifyHmacSignature
};
