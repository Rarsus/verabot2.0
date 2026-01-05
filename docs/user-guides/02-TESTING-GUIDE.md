# Testing Guide

Comprehensive guide to testing in VeraBot2.0 using Test-Driven Development (TDD) principles.

## Quick Start

### Run All Tests

```bash
npm test              # Quick sanity checks (1-2 seconds)
npm run test:all      # All tests (utility + integration)
```

### Test Results

Current status:

- ✅ 36/38 utility tests passing (95%)
- ✅ 35/35 quote system tests passing (100%)
- ✅ Overall: 71/73 passing (97%)

---

## Test Philosophy

VeraBot2.0 uses **Test-Driven Development (TDD)** with the following approach:

1. **Write tests first** - Before implementing features
2. **Make tests fail** - Verify test actually tests something
3. **Implement code** - Make tests pass
4. **Refactor** - Improve code quality while tests pass
5. **Repeat** - For each feature

### Why TDD?

- **Confidence** - Tests verify your code works as expected
- **Documentation** - Tests show how code should be used
- **Regression Prevention** - Old tests catch new bugs
- **Design** - Writing tests first leads to better API design
- **Refactoring** - Tests protect against breaking changes

---

## Test Organization

### Test Files

```
scripts/
├── run-tests.js                 # Main test runner
├── test-command-base.js         # Command base class tests
├── test-command-options.js      # Options builder tests
├── test-response-helpers.js     # Response helpers tests
└── test-integration-refactor.js # Integration tests
```

### Running Specific Tests

```bash
npm run test:utils:base          # Command base tests only
npm run test:utils:options       # Options builder tests only
npm run test:utils:helpers       # Response helpers tests only
npm run test:integration:refactor # Integration tests only
npm run test:quotes              # Quote system basic tests
npm run test:quotes-advanced     # Advanced quote tests
```

---

## Test Structure

### Test Pattern

All tests follow a consistent pattern:

```javascript
const assert = require('assert');
const { describe, it } = require('../test-utils');

// Group related tests
describe('Feature Name', () => {
  // Individual test case
  it('should do something specific', () => {
    const result = doSomething();
    assert.strictEqual(result, expectedValue);
  });

  it('should handle edge cases', () => {
    const result = doSomething(edgeCase);
    assert.deepStrictEqual(result, expectedValue);
  });
});
```

### Assertion Methods

```javascript
assert.strictEqual(actual, expected)           // Strict equality check
assert.deepStrictEqual(actual, expected)       // Deep object comparison
assert.notStrictEqual(actual, expected)        // Strict inequality
assert.ok(value)                               // Truthy check
assert.throws(() => { ... }, Error)            // Error thrown check
assert.doesNotThrow(() => { ... })             // No error check
```

---

## Testing Utilities

### Command Base Class Tests

Location: `scripts/test-command-base.js`

```javascript
// Test that command extends Command class
function testCommandInheritance() {
  const command = new MyCommand();
  assert(command instanceof Command);
}

// Test command properties
function testCommandProperties() {
  const command = new MyCommand();
  assert.strictEqual(command.name, 'mycommand');
  assert.strictEqual(command.description, 'What it does');
}

// Test error handling
function testErrorHandling() {
  assert.throws(() => {
    new MyCommand().executeWithBadInput();
  }, Error);
}
```

### Options Builder Tests

Location: `scripts/test-command-options.js`

```javascript
// Test option creation
function testOptionCreation() {
  const { data, options } = buildCommandOptions('test', 'Test command', [
    { name: 'arg', type: 'string', required: true },
  ]);

  assert(data !== undefined);
  assert(Array.isArray(options));
  assert.strictEqual(options[0].name, 'arg');
  assert.strictEqual(options[0].type, 'string');
}

// Test option validation
function testOptionValidation() {
  assert.throws(() => {
    buildCommandOptions('', '', []); // Empty name
  }, Error);
}
```

### Response Helpers Tests

Location: `scripts/test-response-helpers.js`

```javascript
// Test response formatting
function testSuccessResponse() {
  const response = formatSuccess('Operation successful');
  assert(response.includes('Operation successful'));
}

// Test error responses
function testErrorResponse() {
  const response = formatError('Something went wrong');
  assert(response.includes('Something went wrong'));
}
```

---

## Writing New Tests

### Step 1: Identify What to Test

```
Feature: Add Quote
├── Input validation
├── Database insertion
├── Error handling
├── Response formatting
└── Permission checking
```

### Step 2: Write Test Cases

```javascript
const assert = require('assert');
const AddQuoteCommand = require('../src/commands/quote-management/add-quote');
const db = require('../src/db');

describe('Add Quote Command', () => {
  // Test 1: Valid input
  it('should add a quote with valid text and author', async () => {
    const command = new AddQuoteCommand();
    const result = await command.validateInput('Quote text', 'Author name');
    assert.strictEqual(result.valid, true);
  });

  // Test 2: Empty text
  it('should reject empty quote text', async () => {
    const command = new AddQuoteCommand();
    const result = await command.validateInput('', 'Author');
    assert.strictEqual(result.valid, false);
  });

  // Test 3: Missing author
  it('should reject missing author', async () => {
    const command = new AddQuoteCommand();
    const result = await command.validateInput('Quote', '');
    assert.strictEqual(result.valid, false);
  });

  // Test 4: Too long
  it('should reject text exceeding max length', async () => {
    const command = new AddQuoteCommand();
    const longText = 'a'.repeat(1001);
    const result = await command.validateInput(longText, 'Author');
    assert.strictEqual(result.valid, false);
  });

  // Test 5: Database insertion
  it('should store quote in database', async () => {
    const command = new AddQuoteCommand();
    await command.addQuote('Test quote', 'Test Author');

    const quote = await db.get('SELECT * FROM quotes WHERE text = ?', ['Test quote']);
    assert.ok(quote);
    assert.strictEqual(quote.author, 'Test Author');
  });
});
```

### Step 3: Run Tests

```bash
node scripts/test-add-quote.js
```

Expected output:

```
✓ should add a quote with valid text and author
✓ should reject empty quote text
✓ should reject missing author
✓ should reject text exceeding max length
✓ should store quote in database

5 tests passed
```

### Step 4: Implement Feature

Now write the actual code to make tests pass.

### Step 5: Verify Tests Pass

```bash
node scripts/test-add-quote.js
```

All tests should pass ✓

---

## Testing Patterns

### Pattern 1: Testing Input Validation

```javascript
describe('Input Validation', () => {
  it('should accept valid input', () => {
    const result = validateInput('valid input');
    assert.ok(result.valid);
  });

  it('should reject empty input', () => {
    const result = validateInput('');
    assert.strictEqual(result.valid, false);
  });

  it('should reject too long input', () => {
    const longInput = 'a'.repeat(1001);
    const result = validateInput(longInput);
    assert.strictEqual(result.valid, false);
  });

  it('should reject invalid format', () => {
    const result = validateInput('invalid@format!');
    assert.strictEqual(result.valid, false);
  });
});
```

### Pattern 2: Testing Database Operations

```javascript
describe('Database Operations', () => {
  beforeEach(async () => {
    // Clear test data
    await db.run('DELETE FROM test_table');
  });

  it('should insert data', async () => {
    await db.run('INSERT INTO test_table (name) VALUES (?)', ['test']);
    const result = await db.get('SELECT * FROM test_table WHERE name = ?', ['test']);
    assert.ok(result);
  });

  it('should update data', async () => {
    await db.run('INSERT INTO test_table (name) VALUES (?)', ['old']);
    await db.run('UPDATE test_table SET name = ? WHERE name = ?', ['new', 'old']);
    const result = await db.get('SELECT * FROM test_table WHERE name = ?', ['new']);
    assert.ok(result);
  });

  it('should delete data', async () => {
    await db.run('INSERT INTO test_table (name) VALUES (?)', ['delete_me']);
    await db.run('DELETE FROM test_table WHERE name = ?', ['delete_me']);
    const result = await db.get('SELECT * FROM test_table WHERE name = ?', ['delete_me']);
    assert.strictEqual(result, undefined);
  });
});
```

### Pattern 3: Testing Error Handling

```javascript
describe('Error Handling', () => {
  it('should throw error on invalid operation', () => {
    assert.throws(() => {
      riskyOperation(invalidInput);
    }, Error);
  });

  it('should throw specific error type', () => {
    assert.throws(() => {
      riskyOperation(invalidInput);
    }, TypeError);
  });

  it('should catch and handle database errors', async () => {
    try {
      await db.run('INVALID SQL');
      assert.fail('Should have thrown error');
    } catch (error) {
      assert(error instanceof Error);
    }
  });
});
```

### Pattern 4: Testing Async Operations

```javascript
describe('Async Operations', () => {
  it('should resolve with correct data', async () => {
    const result = await fetchData('test');
    assert.ok(result);
    assert.strictEqual(result.id, 1);
  });

  it('should reject on error', async () => {
    try {
      await fetchData('invalid');
      assert.fail('Should have thrown error');
    } catch (error) {
      assert.ok(error);
    }
  });

  it('should handle timeouts', async () => {
    this.timeout(5000); // Set timeout for this test
    const result = await slowOperation();
    assert.ok(result);
  });
});
```

---

## Mocking and Stubbing

### Mock Objects

```javascript
// Mock Discord message object
const mockMessage = {
  author: { id: '123456', username: 'TestUser' },
  channel: { send: async (content) => ({ content }) },
  member: { roles: [], permissions: { has: () => false } },
  guild: { id: '789' },
};

// Mock Discord interaction object
const mockInteraction = {
  user: { id: '123456', username: 'TestUser' },
  channel: { id: '456' },
  guild: { id: '789' },
  options: {
    getString: (name) => 'test value',
    getInteger: (name) => 42,
  },
  reply: async (options) => ({}),
  editReply: async (options) => ({}),
};

// Use in tests
test('command handles message', async () => {
  const command = new MyCommand();
  await command.execute(mockMessage, ['arg1']);
  assert.ok(true); // Verify it doesn't throw
});
```

### Stubbing Functions

```javascript
// Original function
function fetchData(url) {
  return fetch(url).then((r) => r.json());
}

// Stub for testing
function stubFetchData() {
  return Promise.resolve({ id: 1, name: 'Test' });
}

// Use in test
it('should handle API response', async () => {
  const data = await stubFetchData();
  assert.strictEqual(data.id, 1);
});
```

---

## Coverage Analysis

### What to Test

Essential test areas:

- ✅ Input validation
- ✅ Happy path (normal operation)
- ✅ Error cases (invalid input)
- ✅ Edge cases (boundary values)
- ✅ Database operations
- ✅ Permission checks
- ✅ Response formatting

### Test Coverage Goals

- **Utility modules:** 95%+ coverage (currently achieved)
- **Command logic:** 80%+ coverage
- **Database layer:** 90%+ coverage
- **Overall:** 85%+ coverage

### Check Coverage

```javascript
// Simple coverage check
let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  try {
    fn();
    testsPassed++;
    console.log(`✓ ${name}`);
  } catch (error) {
    testsFailed++;
    console.error(`✗ ${name}: ${error.message}`);
  }
}

// After all tests
console.log(`\n${testsPassed} passed, ${testsFailed} failed`);
console.log(`Coverage: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
```

---

## Continuous Testing

### Watch Mode (Recommended During Development)

```bash
npm run test:watch  # Re-run tests on file changes
```

### Pre-commit Hooks

```bash
# Automatically run tests before committing
npm run test  # Runs before git commit
```

### CI/CD Integration

Tests automatically run on:

- Every git push
- Pull request creation
- Scheduled daily runs

---

## Debugging Tests

### Add Console Logging

```javascript
it('should process data correctly', () => {
  const input = 'test';
  console.log('Input:', input); // Debug output

  const result = process(input);
  console.log('Result:', result); // See result

  assert.strictEqual(result, 'TEST');
});
```

### Run Single Test

```javascript
// Temporarily change 'it' to 'it.only'
it.only('should test only this', () => {
  // This test runs alone
});

// Run tests
npm run test:all  // Only the .only test runs
```

### Skip Test Temporarily

```javascript
// Use 'it.skip' to skip a test
it.skip('should not run this test', () => {
  // This test is skipped
});
```

---

## Common Testing Issues

### Issue: Test passes locally but fails in CI

**Solution:**

- Check test doesn't depend on timing
- Verify database is clean between tests
- Use absolute file paths instead of relative
- Mock external API calls

### Issue: Test is flaky (sometimes passes, sometimes fails)

**Solution:**

- Avoid time-dependent tests
- Clean up test data after each test
- Use proper async/await handling
- Mock network calls

### Issue: "Cannot find module" error in test

**Solution:**

- Verify path is correct relative to test file
- Use `require.resolve()` to debug paths
- Check Node.js can load the module:
  ```bash
  node -e "require('./src/commands/misc/hi')"
  ```

### Issue: Test times out

**Solution:**

- Check for infinite loops
- Increase timeout: `this.timeout(5000)`
- Ensure all promises are awaited
- Check database isn't locked

---

## Best Practices

### 1. Test Behavior, Not Implementation

```javascript
// Good - Test what user sees
it('should return sorted results', () => {
  const results = search('test');
  assert.strictEqual(results[0].rating > results[1].rating, true);
});

// Bad - Test internal details
it('should call Array.sort', () => {
  // Tests specific implementation
  sinon.spy(Array, 'sort');
});
```

### 2. One Assertion Per Test

```javascript
// Good - One thing tested
it('should validate email format', () => {
  assert.ok(validateEmail('test@example.com'));
});

// Bad - Multiple assertions
it('should validate email', () => {
  assert.ok(validateEmail('test@example.com'));
  assert.ok(validateEmail('user@domain.org'));
  assert.ok(!validateEmail('invalid'));
});
```

### 3. Clear Test Names

```javascript
// Good - Clear what's being tested
it('should reject empty quote text');
it('should accept quote with valid author');
it('should delete quote when user is owner');

// Bad - Vague names
it('should work');
it('tests quote');
it('handles input');
```

### 4. Clean Up After Tests

```javascript
describe('Quote operations', () => {
  afterEach(async () => {
    // Clean up test data
    await db.run('DELETE FROM quotes WHERE author = ?', ['Test Author']);
  });

  it('should add quote', async () => {
    await addQuote('Test text', 'Test Author');
    const quote = await db.get('SELECT * FROM quotes WHERE author = ?', ['Test Author']);
    assert.ok(quote);
  });
});
```

### 5. Group Related Tests

```javascript
describe('Quote Validation', () => {
  describe('Text Validation', () => {
    it('should reject empty text');
    it('should reject too long text');
  });

  describe('Author Validation', () => {
    it('should reject empty author');
    it('should accept valid author');
  });
});
```

---

## Reference

### Test Commands

```bash
npm test                          # Run basic tests
npm run test:all                  # Run all tests
npm run test:utils:base           # Test command base class
npm run test:utils:options        # Test options builder
npm run test:utils:helpers        # Test response helpers
npm run test:integration:refactor # Test integration
npm run test:quotes               # Test quote system
npm run test:quotes-advanced      # Test advanced quote features
```

### Assert Methods

```javascript
assert.ok(value); // Truthy
assert.strictEqual(a, b); // Strict equal
assert.notStrictEqual(a, b); // Strict not equal
assert.deepStrictEqual(a, b); // Deep equal
assert.throws(fn, Error); // Throws error
assert.doesNotThrow(fn); // No error
```

### Test Lifecycle

```javascript
describe('Feature', () => {
  before(() => {
    // Run once before all tests
  });

  beforeEach(() => {
    // Run before each test
  });

  it('test 1', () => {});
  it('test 2', () => {});

  afterEach(() => {
    // Run after each test
  });

  after(() => {
    // Run once after all tests
  });
});
```

---

## Next Steps

1. **Run existing tests** - `npm run test:all`
2. **Read test files** - Study existing test patterns
3. **Write a test** - Create a test for your feature
4. **Implement feature** - Make test pass
5. **Verify coverage** - Ensure you're testing the right things

For more help, see:

- [Node.js Assert Documentation](https://nodejs.org/api/assert.html)
- [TDD Basics](https://en.wikipedia.org/wiki/Test-driven_development)
- [Testing Best Practices](https://testingjavascript.com/)
