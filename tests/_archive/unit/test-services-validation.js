/**
 * Test Suite: ValidationService
 * Tests input validation functions
 */

const { validateQuoteText, validateAuthor, validateQuoteNumber } = require('../../src/services/ValidationService');

let passed = 0;
let failed = 0;

// Test 1: Valid quote text
console.log('\n=== Test 1: Valid Quote Text ===');
try {
  const result = validateQuoteText('This is a valid quote');
  if (result.valid === true && result.sanitized === 'This is a valid quote') {
    console.log('✅ Test 1 Passed: Valid quote text accepted');
    passed++;
  } else {
    console.error('❌ Test 1 Failed: Valid quote not accepted');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 1 Failed:', err.message);
  failed++;
}

// Test 2: Quote with whitespace trimming
console.log('\n=== Test 2: Quote Text Trimming ===');
try {
  const result = validateQuoteText('  trimmed quote  ');
  if (result.valid === true && result.sanitized === 'trimmed quote') {
    console.log('✅ Test 2 Passed: Whitespace trimmed correctly');
    passed++;
  } else {
    console.error('❌ Test 2 Failed: Trimming not working');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 2 Failed:', err.message);
  failed++;
}

// Test 3: Empty quote text
console.log('\n=== Test 3: Empty Quote Text ===');
try {
  const result = validateQuoteText('');
  if (result.valid === false && (result.error.includes('empty') || result.error.includes('string'))) {
    console.log('✅ Test 3 Passed: Empty quote rejected');
    passed++;
  } else {
    console.error('❌ Test 3 Failed: Empty quote should be rejected');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 3 Failed:', err.message);
  failed++;
}

// Test 4: Quote too short (< 3 chars)
console.log('\n=== Test 4: Quote Too Short ===');
try {
  const result = validateQuoteText('ab');
  if (result.valid === false && result.error.includes('3 characters')) {
    console.log('✅ Test 4 Passed: Short quote rejected');
    passed++;
  } else {
    console.error('❌ Test 4 Failed: Short quote should be rejected');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 4 Failed:', err.message);
  failed++;
}

// Test 5: Quote too long (> 500 chars)
console.log('\n=== Test 5: Quote Too Long ===');
try {
  const longQuote = 'a'.repeat(501);
  const result = validateQuoteText(longQuote);
  if (result.valid === false && result.error.includes('500')) {
    console.log('✅ Test 5 Passed: Long quote rejected');
    passed++;
  } else {
    console.error('❌ Test 5 Failed: Long quote should be rejected');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 5 Failed:', err.message);
  failed++;
}

// Test 6: Invalid type (not string)
console.log('\n=== Test 6: Invalid Quote Type ===');
try {
  const result = validateQuoteText(123);
  if (result.valid === false && result.error.includes('string')) {
    console.log('✅ Test 6 Passed: Non-string quote rejected');
    passed++;
  } else {
    console.error('❌ Test 6 Failed: Non-string should be rejected');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 6 Failed:', err.message);
  failed++;
}

// Test 7: Valid author
console.log('\n=== Test 7: Valid Author ===');
try {
  const result = validateAuthor('John Doe');
  if (result.valid === true) {
    console.log('✅ Test 7 Passed: Valid author accepted');
    passed++;
  } else {
    console.error('❌ Test 7 Failed: Valid author rejected');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 7 Failed:', err.message);
  failed++;
}

// Test 8: Author too long
console.log('\n=== Test 8: Author Too Long ===');
try {
  const longAuthor = 'a'.repeat(101);
  const result = validateAuthor(longAuthor);
  if (result.valid === false && result.error.includes('100')) {
    console.log('✅ Test 8 Passed: Long author rejected');
    passed++;
  } else {
    console.error('❌ Test 8 Failed: Long author should be rejected');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 8 Failed:', err.message);
  failed++;
}

// Test 9: Invalid author type
console.log('\n=== Test 9: Invalid Author Type ===');
try {
  const result = validateAuthor(null);
  if (result.valid === false && result.error.includes('string')) {
    console.log('✅ Test 9 Passed: Non-string author rejected');
    passed++;
  } else {
    console.error('❌ Test 9 Failed: Non-string author should be rejected');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 9 Failed:', err.message);
  failed++;
}

// Test 10: Valid quote number
console.log('\n=== Test 10: Valid Quote Number ===');
try {
  const result = validateQuoteNumber('42');
  if (result.valid === true) {
    console.log('✅ Test 10 Passed: Valid quote number accepted');
    passed++;
  } else {
    console.error('❌ Test 10 Failed: Valid quote number rejected');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 10 Failed:', err.message);
  failed++;
}

// Test 11: Invalid quote number (not integer)
console.log('\n=== Test 11: Non-Integer Quote Number ===');
try {
  const result = validateQuoteNumber('abc');
  if (result.valid === false && result.error.includes('integer')) {
    console.log('✅ Test 11 Passed: Non-integer number rejected');
    passed++;
  } else {
    console.error('❌ Test 11 Failed: Non-integer should be rejected');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 11 Failed:', err.message);
  failed++;
}

// Test 12: Quote number zero or negative
console.log('\n=== Test 12: Quote Number Zero/Negative ===');
try {
  const result = validateQuoteNumber('0');
  if (result.valid === false && result.error.includes('greater than 0')) {
    console.log('✅ Test 12 Passed: Non-positive number rejected');
    passed++;
  } else {
    console.error('❌ Test 12 Failed: Non-positive number should be rejected');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 12 Failed:', err.message);
  failed++;
}

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log('✅ All validation tests passed!');
}
