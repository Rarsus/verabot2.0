/**
 * Security Utils Tests
 * Tests for security utilities including encryption, HMAC, etc.
 */

/* eslint-disable no-unused-vars */

const security = require('../../src/utils/security');
const crypto = require('crypto');

console.log('=== Security Utils Tests ===\n');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ ${testName}`);
    passedTests++;
  } else {
    console.log(`❌ ${testName}`);
    failedTests++;
  }
}

// Test 1: Generate key pair
console.log('=== Test 1: Generate Key Pair ===');
try {
  const keys = security.generateKeyPair();
  assert(keys.publicKey !== null && keys.privateKey !== null, 'Key pair generated');
  assert(keys.publicKey.includes('BEGIN PUBLIC KEY'), 'Public key format correct');
  assert(keys.privateKey.includes('BEGIN PRIVATE KEY'), 'Private key format correct');
} catch (err) {
  assert(false, `Generate keypair failed: ${err.message}`);
}

// Test 2: Encrypt and decrypt
console.log('\n=== Test 2: Encrypt and Decrypt ===');
try {
  const plaintext = 'Hello, World!';
  const encrypted = security.encrypt(plaintext);
  assert(encrypted.length > 0, 'Encryption produces output');

  const decrypted = security.decrypt(encrypted);
  assert(decrypted === plaintext, 'Decryption recovers original text');
} catch (err) {
  assert(false, `Encrypt/decrypt failed: ${err.message}`);
}

// Test 3: Encrypt empty string
console.log('\n=== Test 3: Encrypt Empty String ===');
try {
  const encrypted = security.encrypt('');
  assert(encrypted === '', 'Empty string returns empty');
} catch (err) {
  assert(false, `Empty encrypt failed: ${err.message}`);
}

// Test 4: Decrypt empty string
console.log('\n=== Test 4: Decrypt Empty String ===');
try {
  const decrypted = security.decrypt('');
  assert(decrypted === '', 'Empty decrypt returns empty');
} catch (err) {
  assert(false, `Empty decrypt failed: ${err.message}`);
}

// Test 5: Encrypt with custom key
console.log('\n=== Test 5: Encrypt with Custom Key ===');
try {
  const customKey = crypto.randomBytes(32);
  const plaintext = 'Custom key test';
  const encrypted = security.encrypt(plaintext, customKey);
  const decrypted = security.decrypt(encrypted, customKey);
  assert(decrypted === plaintext, 'Custom key encryption/decryption works');
} catch (err) {
  assert(false, `Custom key failed: ${err.message}`);
}

// Test 6: HMAC signature generation
console.log('\n=== Test 6: HMAC Signature ===');
try {
  const data = 'test data';
  const signature = security.generateHMAC(data);
  assert(signature.length > 0, 'HMAC signature generated');
  assert(typeof signature === 'string', 'Signature is a string');
} catch (err) {
  assert(false, `HMAC generation failed: ${err.message}`);
}

// Test 7: HMAC verification
console.log('\n=== Test 7: HMAC Verification ===');
try {
  const data = 'test data';
  const signature = security.generateHMAC(data);
  const isValid = security.verifyHMAC(data, signature);
  assert(isValid === true, 'Valid HMAC verified');
} catch (err) {
  assert(false, `HMAC verification failed: ${err.message}`);
}

// Test 8: HMAC verification with invalid signature
console.log('\n=== Test 8: Invalid HMAC ===');
try {
  const data = 'test data';
  const isValid = security.verifyHMAC(data, 'invalid_signature');
  assert(isValid === false, 'Invalid HMAC rejected');
} catch (err) {
  assert(false, `Invalid HMAC check failed: ${err.message}`);
}

// Test 9: HMAC with custom key
console.log('\n=== Test 9: HMAC with Custom Key ===');
try {
  const data = 'test data';
  const customKey = crypto.randomBytes(32);
  const signature = security.generateHMAC(data, customKey);
  const isValid = security.verifyHMAC(data, signature, customKey);
  assert(isValid === true, 'Custom key HMAC works');
} catch (err) {
  assert(false, `Custom HMAC failed: ${err.message}`);
}

// Test 10: Hash password
console.log('\n=== Test 10: Hash Password ===');
try {
  const password = 'mySecurePassword123';
  const hash = security.hashPassword(password);
  assert(hash.length > 0, 'Password hash generated');
  assert(hash.includes(':'), 'Hash contains salt separator');
} catch (err) {
  assert(false, `Password hashing failed: ${err.message}`);
}

// Test 11: Verify password
console.log('\n=== Test 11: Verify Password ===');
try {
  const password = 'mySecurePassword123';
  const hash = security.hashPassword(password);
  const isValid = security.verifyPassword(password, hash);
  assert(isValid === true, 'Correct password verified');
} catch (err) {
  assert(false, `Password verification failed: ${err.message}`);
}

// Test 12: Verify wrong password
console.log('\n=== Test 12: Wrong Password ===');
try {
  const password = 'mySecurePassword123';
  const hash = security.hashPassword(password);
  const isValid = security.verifyPassword('wrongPassword', hash);
  assert(isValid === false, 'Wrong password rejected');
} catch (err) {
  assert(false, `Wrong password check failed: ${err.message}`);
}

// Test 13: Generate random token
console.log('\n=== Test 13: Generate Random Token ===');
try {
  const token = security.generateToken();
  assert(token.length === 64, 'Token is 64 characters (32 bytes hex)');
  assert(/^[0-9a-f]+$/.test(token), 'Token is valid hex');
} catch (err) {
  assert(false, `Token generation failed: ${err.message}`);
}

// Test 14: Generate custom length token
console.log('\n=== Test 14: Custom Length Token ===');
try {
  const token = security.generateToken(16);
  assert(token.length === 32, 'Custom length token (16 bytes = 32 hex chars)');
} catch (err) {
  assert(false, `Custom token failed: ${err.message}`);
}

// Test 15: Validate token format
console.log('\n=== Test 15: Validate Token Format ===');
try {
  const validToken = security.generateToken();
  const isValid = security.validateToken(validToken);
  assert(isValid === true, 'Valid token format accepted');

  const invalidToken = 'not-valid';
  const isInvalid = security.validateToken(invalidToken);
  assert(isInvalid === false, 'Invalid token format rejected');
} catch (err) {
  assert(false, `Token validation failed: ${err.message}`);
}

// Test 16: Generate secure string
console.log('\n=== Test 16: Generate Secure String ===');
try {
  const secureStr = security.generateSecureString(20);
  assert(secureStr.length === 20, 'Secure string has correct length');
  assert(typeof secureStr === 'string', 'Secure string is a string');
} catch (err) {
  assert(false, `Secure string failed: ${err.message}`);
}

// Test 17: SHA256 hash
console.log('\n=== Test 17: SHA256 Hash ===');
try {
  const data = 'test data';
  const hash = security.hashSHA256(data);
  assert(hash.length === 64, 'SHA256 hash is 64 characters');
  assert(/^[0-9a-f]+$/.test(hash), 'Hash is valid hex');
} catch (err) {
  assert(false, `SHA256 hash failed: ${err.message}`);
}

// Test 18: Encrypt complex data
console.log('\n=== Test 18: Encrypt Complex Data ===');
try {
  const complexData = JSON.stringify({
    user: 'test',
    data: [1, 2, 3],
    nested: { key: 'value' }
  });
  const encrypted = security.encrypt(complexData);
  const decrypted = security.decrypt(encrypted);
  assert(decrypted === complexData, 'Complex data preserved through encryption');
} catch (err) {
  assert(false, `Complex encryption failed: ${err.message}`);
}

// Test 19: Different data produces different ciphertexts
console.log('\n=== Test 19: Unique Ciphertexts ===');
try {
  const text = 'same text';
  const encrypted1 = security.encrypt(text);
  const encrypted2 = security.encrypt(text);
  assert(encrypted1 !== encrypted2, 'Same plaintext produces different ciphertexts (IV variation)');
} catch (err) {
  assert(false, `Unique ciphertext test failed: ${err.message}`);
}

// Test 20: Invalid encrypted data handling
console.log('\n=== Test 20: Invalid Encrypted Data ===');
try {
  const result = security.decrypt('invalid:format:data');
  assert(result === '', 'Invalid encrypted data returns empty string or throws');
} catch (err) {
  // Either throws or returns empty - both are acceptable
  assert(true, 'Invalid data handled properly');
}

// Print results
console.log('\n==================================================');
console.log(`Results: ${passedTests} passed, ${failedTests} failed`);

if (failedTests === 0) {
  console.log('✅ All security utils tests passed!');
  process.exit(0);
} else {
  console.log(`❌ ${failedTests} test(s) failed`);
  process.exit(1);
}
