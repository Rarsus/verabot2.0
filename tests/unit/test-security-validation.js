/**
 * Security Validation Tests
 * Tests for input validation, SQL injection prevention, XSS prevention, and rate limiting
 */

const {
  validateTextInput,
  validateNumericInput,
  validateDiscordId,
  detectSQLInjection,
  detectXSS,
  sanitizeString,
  RateLimiter
} = require('../../src/middleware/inputValidator');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`✅ Test ${passed + failed}: ${name}`);
  } catch (error) {
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

console.log('\n=== Security Validation Tests ===\n');

// Test 1: Valid text input
test('Valid text input accepted', () => {
  const result = validateTextInput('Hello, world!', { minLength: 5, maxLength: 100 });
  assert(result.valid === true, 'Valid text should pass');
  assert(result.errors.length === 0, 'Should have no errors');
});

// Test 2: SQL injection detection - UNION attack
test('SQL injection detected - UNION attack', () => {
  const result = validateTextInput("' UNION SELECT * FROM users--", { checkSQLInjection: true });
  assert(result.valid === false, 'SQL injection should be detected');
  assert(result.errors.length > 0, 'Should have errors');
});

// Test 3: SQL injection detection - OR 1=1 attack
test('SQL injection detected - OR 1=1 attack', () => {
  const malicious = "admin' OR '1'='1";
  assert(detectSQLInjection(malicious) === true, 'SQL injection should be detected');
});

// Test 4: SQL injection detection - comment attack
test('SQL injection detected - comment attack', () => {
  const malicious = "'; DROP TABLE users--";
  assert(detectSQLInjection(malicious) === true, 'SQL injection should be detected');
});

// Test 5: XSS detection - script tag
test('XSS detected - script tag', () => {
  const malicious = '<script>alert("XSS")</script>';
  assert(detectXSS(malicious) === true, 'XSS should be detected');
});

// Test 6: XSS detection - iframe injection
test('XSS detected - iframe injection', () => {
  const malicious = '<iframe src="http://evil.com"></iframe>';
  assert(detectXSS(malicious) === true, 'XSS should be detected');
});

// Test 7: XSS detection - event handler
test('XSS detected - event handler', () => {
  const malicious = '<img src=x onerror="alert(1)">';
  assert(detectXSS(malicious) === true, 'XSS should be detected');
});

// Test 8: XSS detection - javascript protocol
test('XSS detected - javascript protocol', () => {
  const malicious = '<a href="javascript:alert(1)">Click</a>';
  assert(detectXSS(malicious) === true, 'XSS should be detected');
});

// Test 9: Text input length validation - too short
test('Text input rejected - too short', () => {
  const result = validateTextInput('Hi', { minLength: 10 });
  assert(result.valid === false, 'Short text should be rejected');
  assert(result.errors.some(e => e.includes('at least')), 'Should have min length error');
});

// Test 10: Text input length validation - too long
test('Text input rejected - too long', () => {
  const longText = 'a'.repeat(2001);
  const result = validateTextInput(longText, { maxLength: 2000 });
  assert(result.valid === false, 'Long text should be rejected');
  assert(result.errors.some(e => e.includes('at most')), 'Should have max length error');
});

// Test 11: Numeric validation - valid integer
test('Numeric validation - valid integer', () => {
  const result = validateNumericInput(42, { integer: true });
  assert(result.valid === true, 'Valid integer should pass');
  assert(result.value === 42, 'Value should be 42');
});

// Test 12: Numeric validation - invalid (not a number)
test('Numeric validation - invalid (not a number)', () => {
  const result = validateNumericInput('abc', {});
  assert(result.valid === false, 'Non-numeric should be rejected');
  assert(result.errors.length > 0, 'Should have errors');
});

// Test 13: Numeric validation - positive check
test('Numeric validation - positive check fails for negative', () => {
  const result = validateNumericInput(-5, { positive: true });
  assert(result.valid === false, 'Negative should be rejected when positive required');
});

// Test 14: Numeric validation - range check
test('Numeric validation - range check', () => {
  const result = validateNumericInput(150, { min: 1, max: 100 });
  assert(result.valid === false, 'Out of range should be rejected');
});

// Test 15: Discord ID validation - valid
test('Discord ID validation - valid', () => {
  const result = validateDiscordId('123456789012345678');
  assert(result.valid === true, 'Valid Discord ID should pass');
});

// Test 16: Discord ID validation - invalid format
test('Discord ID validation - invalid format', () => {
  const result = validateDiscordId('abc123');
  assert(result.valid === false, 'Invalid Discord ID should be rejected');
});

// Test 17: String sanitization - removes null bytes
test('String sanitization - removes null bytes', () => {
  const input = 'Hello\x00World';
  const sanitized = sanitizeString(input);
  assert(sanitized === 'HelloWorld', 'Null bytes should be removed');
});

// Test 18: Rate limiter - allows requests within limit
test('Rate limiter - allows requests within limit', () => {
  const limiter = new RateLimiter(3, 60000);
  assert(limiter.isAllowed('user1') === true, 'First request should be allowed');
  assert(limiter.isAllowed('user1') === true, 'Second request should be allowed');
  assert(limiter.isAllowed('user1') === true, 'Third request should be allowed');
});

// Test 19: Rate limiter - blocks requests over limit
test('Rate limiter - blocks requests over limit', () => {
  const limiter = new RateLimiter(2, 60000);
  limiter.isAllowed('user2');
  limiter.isAllowed('user2');
  assert(limiter.isAllowed('user2') === false, 'Request over limit should be blocked');
});

// Test 20: Rate limiter - tracks remaining requests
test('Rate limiter - tracks remaining requests', () => {
  const limiter = new RateLimiter(5, 60000);
  limiter.isAllowed('user3');
  limiter.isAllowed('user3');
  const remaining = limiter.getRemaining('user3');
  assert(remaining === 3, 'Should have 3 remaining requests');
});

console.log('\n' + '='.repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(50) + '\n');

if (failed > 0) {
  console.error(`❌ ${failed} test(s) failed`);
  process.exit(1);
} else {
  console.log('✅ All security validation tests passed!');
  process.exit(0);
}
