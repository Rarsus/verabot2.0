/**
 * Security Utilities Module
 * Enhanced encryption, HMAC signature verification, token validation, and password hashing
 */

const crypto = require('crypto');

// Configuration constants
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 16;
// const AUTH_TAG_LENGTH = 16; // Reserved for future use
const PBKDF2_ITERATIONS = 100000;

// Cached keys (singleton pattern)
let cachedEncryptionKey = null;
let cachedSecretKey = null;

/**
 * Get encryption key from environment or generate one
 * @returns {Buffer} Encryption key
 */
function getEncryptionKey() {
  // Return cached key if available
  if (cachedEncryptionKey) {
    return cachedEncryptionKey;
  }

  const keyHex = process.env.ENCRYPTION_KEY;

  if (!keyHex) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ENCRYPTION_KEY environment variable is required in production');
    }
    console.warn('⚠️ WARNING: Using temporary encryption key. Set ENCRYPTION_KEY in production.');
    cachedEncryptionKey = crypto.randomBytes(KEY_LENGTH);
    return cachedEncryptionKey;
  }

  const key = Buffer.from(keyHex, 'hex');
  if (key.length !== KEY_LENGTH) {
    throw new Error(`ENCRYPTION_KEY must be ${KEY_LENGTH * 2} hex characters (${KEY_LENGTH} bytes)`);
  }

  cachedEncryptionKey = key;
  return cachedEncryptionKey;
}

/**
 * Get secret key for HMAC from environment or generate one
 * @returns {Buffer} Secret key
 */
function getSecretKey() {
  // Return cached key if available
  if (cachedSecretKey) {
    return cachedSecretKey;
  }

  const keyHex = process.env.SECRET_KEY;

  if (!keyHex) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SECRET_KEY environment variable is required in production');
    }
    console.warn('⚠️ WARNING: Using temporary secret key. Set SECRET_KEY in production.');
    cachedSecretKey = crypto.randomBytes(KEY_LENGTH);
    return cachedSecretKey;
  }

  cachedSecretKey = Buffer.from(keyHex, 'hex');
  return cachedSecretKey;
}

/**
 * Encrypt data using AES-256-GCM
 * @param {string} plaintext - Data to encrypt
 * @param {Buffer} [key] - Optional encryption key (uses getEncryptionKey if not provided)
 * @returns {string} Encrypted data in format: iv:authTag:ciphertext (hex encoded)
 */
function encrypt(plaintext, key = null) {
  if (!plaintext) return '';

  try {
    const encryptionKey = key || getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);

    let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
    ciphertext += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Return format: iv:authTag:ciphertext
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${ciphertext}`;
  } catch {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

/**
 * Decrypt data using AES-256-GCM
 * @param {string} encryptedData - Data to decrypt (in format: iv:authTag:ciphertext)
 * @param {Buffer} [key] - Optional decryption key (uses getEncryptionKey if not provided)
 * @returns {string} Decrypted plaintext
 */
function decrypt(encryptedData, key = null) {
  if (!encryptedData) return '';

  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const [ivHex, authTagHex, ciphertext] = parts;
    const encryptionKey = key || getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv);
    decipher.setAuthTag(authTag);

    let plaintext = decipher.update(ciphertext, 'hex', 'utf8');
    plaintext += decipher.final('utf8');

    return plaintext;
  } catch {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

/**
 * Generate HMAC signature for data
 * @param {string} data - Data to sign
 * @param {Buffer} [secret] - Optional secret key (uses getSecretKey if not provided)
 * @returns {string} HMAC signature (hex encoded)
 */
function generateHMAC(data, secret = null) {
  if (!data) return '';

  try {
    const secretKey = secret || getSecretKey();
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(data);
    return hmac.digest('hex');
  } catch {
    throw new Error(`HMAC generation failed: ${error.message}`);
  }
}

/**
 * Verify HMAC signature
 * @param {string} data - Original data
 * @param {string} signature - Signature to verify
 * @param {Buffer} [secret] - Optional secret key (uses getSecretKey if not provided)
 * @returns {boolean} True if signature is valid
 */
function verifyHMAC(data, signature, secret = null) {
  if (!data || !signature) return false;

  try {
    const expectedSignature = generateHMAC(data, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Hash password using PBKDF2
 * @param {string} password - Password to hash
 * @param {Buffer} [salt] - Optional salt (generates random if not provided)
 * @returns {string} Hashed password in format: salt:hash (hex encoded)
 */
function hashPassword(password, salt = null) {
  if (!password) {
    throw new Error('Password is required');
  }

  try {
    const passwordSalt = salt || crypto.randomBytes(SALT_LENGTH);
    const hash = crypto.pbkdf2Sync(password, passwordSalt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256');

    return `${passwordSalt.toString('hex')}:${hash.toString('hex')}`;
  } catch {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
}

/**
 * Verify password against hash
 * @param {string} password - Password to verify
 * @param {string} hashedPassword - Hashed password (in format: salt:hash)
 * @returns {boolean} True if password matches
 */
function verifyPassword(password, hashedPassword) {
  if (!password || !hashedPassword) return false;

  try {
    const parts = hashedPassword.split(':');
    if (parts.length !== 2) return false;

    const [saltHex, hashHex] = parts;
    const salt = Buffer.from(saltHex, 'hex');
    const expectedHash = Buffer.from(hashHex, 'hex');

    const hash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256');

    return crypto.timingSafeEqual(hash, expectedHash);
  } catch {
    return false;
  }
}

/**
 * Generate secure random token
 * @param {number} [length=32] - Token length in bytes (will be hex encoded, so output is 2x)
 * @returns {string} Random token (hex encoded)
 */
function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate cryptographically secure random string
 * @param {number} [length=32] - String length in characters
 * @param {string} [charset='alphanumeric'] - Character set ('alphanumeric', 'hex', 'base64')
 * @returns {string} Random string
 */
function generateSecureString(length = 32, charset = 'alphanumeric') {
  const bytes = crypto.randomBytes(length);

  switch (charset) {
    case 'hex':
      return bytes.toString('hex').substring(0, length);
    case 'base64':
      return bytes.toString('base64').substring(0, length);
    case 'alphanumeric':
    default: {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars[bytes[i] % chars.length];
      }
      return result;
    }
  }
}

/**
 * Validate token format
 * @param {string} token - Token to validate
 * @param {number} [minLength=32] - Minimum token length
 * @returns {boolean} True if token is valid format
 */
function validateToken(token, minLength = 32) {
  if (!token || typeof token !== 'string') return false;
  if (token.length < minLength) return false;

  // Check if hex format
  return /^[0-9a-f]+$/i.test(token);
}

/**
 * Generate encryption key pair
 * @returns {object} { publicKey, privateKey } in PEM format
 */
function generateKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  return { publicKey, privateKey };
}

/**
 * Hash data using SHA-256
 * @param {string} data - Data to hash
 * @returns {string} Hash (hex encoded)
 */
function hashSHA256(data) {
  if (!data) return '';
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Constant-time string comparison to prevent timing attacks
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {boolean} True if strings are equal
 */
function constantTimeCompare(a, b) {
  if (!a || !b) return false;
  if (a.length !== b.length) return false;

  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

module.exports = {
  // Encryption
  encrypt,
  decrypt,
  getEncryptionKey,

  // HMAC
  generateHMAC,
  verifyHMAC,
  getSecretKey,

  // Password hashing
  hashPassword,
  verifyPassword,

  // Token generation
  generateToken,
  generateSecureString,
  validateToken,

  // Key generation
  generateKeyPair,

  // Hashing
  hashSHA256,

  // Comparison
  constantTimeCompare
};
