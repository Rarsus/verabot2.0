/**
 * Security Integration Tests
 * End-to-end security testing for encryption, HMAC, and token validation
 */

const {
  encrypt,
  decrypt,
  generateHMAC,
  verifyHMAC,
  hashPassword,
  verifyPassword,
  generateToken,
  generateSecureString,
  validateToken,
  hashSHA256,
  // constantTimeCompare // Reserved for future use
} = require('../../src/utils/security');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`✅ Test ${passed + failed}: ${name}`);
  } catch {
    failed++;
    console.error(`❌ Test ${passed + failed}: ${name}`);
    console.error(`   Error: ${error.message}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

console.log('\n=== Security Integration Tests ===\n');

// Test 1: Encryption and decryption round-trip
test('Encryption and decryption round-trip', () => {
  const plaintext = 'Secret message';
  const encrypted = encrypt(plaintext);
  const decrypted = decrypt(encrypted);
  assert(decrypted === plaintext, 'Decrypted text should match original');
});

// Test 2: Encrypted data contains three parts (iv:authTag:ciphertext)
test('Encrypted data format validation', () => {
  const encrypted = encrypt('test');
  const parts = encrypted.split(':');
  assert(parts.length === 3, 'Encrypted data should have 3 parts');
});

// Test 3: Different encryptions of same data are different (IV randomization)
test('IV randomization - different encryptions', () => {
  const plaintext = 'Same message';
  const encrypted1 = encrypt(plaintext);
  const encrypted2 = encrypt(plaintext);
  assert(encrypted1 !== encrypted2, 'Different encryptions should be different');
});

// Test 4: Decryption of invalid data throws error
test('Decryption of invalid data fails', () => {
  let errorThrown = false;
  try {
    decrypt('invalid:data:format');
  } catch {
    errorThrown = true;
  }
  assert(errorThrown === true, 'Decrypting invalid data should throw error');
});

// Test 5: HMAC generation produces consistent signature
test('HMAC generation is consistent', () => {
  const data = 'Important data';
  const signature1 = generateHMAC(data);
  const signature2 = generateHMAC(data);
  assert(signature1 === signature2, 'HMAC should be consistent for same data');
});

// Test 6: HMAC verification succeeds for valid signature
test('HMAC verification succeeds for valid signature', () => {
  const data = 'Data to sign';
  const signature = generateHMAC(data);
  const isValid = verifyHMAC(data, signature);
  assert(isValid === true, 'Valid HMAC should verify');
});

// Test 7: HMAC verification fails for tampered data
test('HMAC verification fails for tampered data', () => {
  const data = 'Original data';
  const signature = generateHMAC(data);
  const tamperedData = 'Tampered data';
  const isValid = verifyHMAC(tamperedData, signature);
  assert(isValid === false, 'Tampered data should fail verification');
});

// Test 8: Password hashing produces different hashes (salt randomization)
test('Password hashing - different salts produce different hashes', () => {
  const password = 'mypassword123';
  const hash1 = hashPassword(password);
  const hash2 = hashPassword(password);
  assert(hash1 !== hash2, 'Different hashes should be generated (different salts)');
});

// Test 9: Password verification succeeds for correct password
test('Password verification succeeds for correct password', () => {
  const password = 'securepass123';
  const hash = hashPassword(password);
  const isValid = verifyPassword(password, hash);
  assert(isValid === true, 'Correct password should verify');
});

// Test 10: Password verification fails for incorrect password
test('Password verification fails for incorrect password', () => {
  const password = 'securepass123';
  const hash = hashPassword(password);
  const isValid = verifyPassword('wrongpassword', hash);
  assert(isValid === false, 'Incorrect password should fail verification');
});

// Test 11: Token generation produces hex string of correct length
test('Token generation produces correct format', () => {
  const token = generateToken(32);
  assert(token.length === 64, 'Token should be 64 characters (32 bytes hex)');
  assert(/^[0-9a-f]+$/i.test(token), 'Token should be hex format');
});

// Test 12: Token validation accepts valid tokens
test('Token validation accepts valid tokens', () => {
  const token = generateToken(32);
  const isValid = validateToken(token);
  assert(isValid === true, 'Valid token should pass validation');
});

// Test 13: Token validation rejects short tokens
test('Token validation rejects short tokens', () => {
  const shortToken = generateToken(10);
  const isValid = validateToken(shortToken, 32);
  assert(isValid === false, 'Short token should be rejected');
});

// Test 14: Secure string generation produces correct length
test('Secure string generation produces correct length', () => {
  const str = generateSecureString(20, 'alphanumeric');
  assert(str.length === 20, 'Generated string should have correct length');
});

// Test 15: SHA-256 hashing produces consistent hash
test('SHA-256 hashing is consistent', () => {
  const data = 'Data to hash';
  const hash1 = hashSHA256(data);
  const hash2 = hashSHA256(data);
  assert(hash1 === hash2, 'SHA-256 hash should be consistent');
  assert(hash1.length === 64, 'SHA-256 hash should be 64 characters');
});

console.log('\n' + '='.repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(50) + '\n');

if (failed > 0) {
  console.error(`❌ ${failed} test(s) failed`);
  process.exit(1);
} else {
  console.log('✅ All security integration tests passed!');
  process.exit(0);
}
