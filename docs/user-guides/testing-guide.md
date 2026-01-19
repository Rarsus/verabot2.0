# Testing Guide - Jest & Test-Driven Development

Comprehensive guide to testing in VeraBot2.0 using **Jest** and **Test-Driven Development (TDD)** principles.

**Updated**: January 2026  
**Framework**: Jest (Node.js test runner)  
**Approach**: Test-Driven Development (TDD) - MANDATORY for all new code

---

## Quick Start

### Run All Tests

```bash
npm test              # Run all tests (Jest default)
npm test -- --watch  # Watch mode (re-run on changes)
npm test -- --coverage # Generate coverage report
```

### Current Test Status

```
Test Suites: 40 total, 38 passing
Tests:       1,901 passing, 100% pass rate ✅
Files:       100+ test files across phases 18-19
Coverage:    31.6% global, targeted 90%+ by Phase 20+
Time:        ~50-70 seconds for full suite
```

---

## Test Philosophy: Test-Driven Development (TDD)

VeraBot2.0 uses **strict TDD** with this mandatory workflow:

### 🔴 RED Phase - Write Tests First
1. Create test file BEFORE implementation
2. Write tests for desired behavior
3. Run tests (should FAIL - RED)
4. Tests drive the design

### 🟢 GREEN Phase - Implement Minimum Code
1. Write ONLY code needed to pass tests
2. Keep implementation focused and simple
3. All tests PASS (GREEN)
4. No over-engineering

### 🔵 REFACTOR Phase - Improve Quality
1. Optimize code while tests remain passing
2. Improve readability and maintainability
3. All tests STILL PASS
4. No new functionality during refactor

**This is NON-NEGOTIABLE for new code.**

### Why TDD?

- ✅ **Confidence** - Tests verify code works as expected
- ✅ **Documentation** - Tests show how code should be used
- ✅ **Regression Prevention** - Old tests catch new bugs
- ✅ **Design** - Writing tests first leads to better API design
- ✅ **Refactoring** - Tests protect against breaking changes
- ✅ **Coverage** - No untested code is shipped

---

## Test Organization

### Jest Test Structure

All test files follow Jest conventions:

```
tests/
├── unit/                          # Unit tests (isolated modules)
│   ├── test-command-base.test.js
│   ├── test-error-handler.test.js
│   ├── test-response-helpers.test.js
│   └── test-validation-service.test.js
│
├── services/                      # Service layer tests
│   ├── test-cache-manager.test.js
│   ├── test-quote-service.test.js
│   ├── test-database-service.test.js
│   └── test-reminder-notification-service.test.js
│
├── middleware/                    # Middleware & auth tests
│   ├── test-logger.test.js
│   ├── test-command-validator.test.js
│   └── test-dashboard-auth.test.js
│
├── commands/                      # Command implementation tests
│   ├── test-quote-commands.test.js
│   └── test-reminder-commands.test.js
│
├── integration/                   # Integration tests
│   ├── test-command-execution.test.js
│   └── test-security-integration.test.js
│
├── phase18-*.test.js              # Phase 18 tests (core utilities)
├── phase19a-*.test.js             # Phase 19a tests (services)
├── phase19b-*.test.js             # Phase 19b tests (middleware)
└── phase19c-*.test.js             # Phase 19c tests (database/migration)
```

### Running Tests by Category

```bash
# All tests
npm test

# Unit tests only
npm test -- tests/unit/

# Service tests only
npm test -- tests/services/

# Specific phase
npm test -- tests/phase18-

# Watch mode (re-run on file changes)
npm test -- --watch

# Coverage report
npm test -- --coverage

# Single test file
npm test -- tests/unit/test-command-base.test.js

# Matching pattern
npm test -- --testNamePattern="should handle error"
```

---

## Test Structure & Patterns

### Basic Test Pattern (Jest)

```javascript
/**
 * Test file for MyModule
 * Location: tests/unit/test-my-module.test.js
 */

const assert = require('assert');
const MyModule = require('../../src/path/to/my-module');

describe('MyModule', () => {
  let testData;

  // Setup before each test
  beforeEach(() => {
    testData = {
      input: 'test value',
      expected: 'output value',
    };
  });

  // Cleanup after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test suite for a specific method
  describe('methodName()', () => {
    // Happy path - expected behavior
    it('should return expected value for valid input', () => {
      const result = MyModule.methodName(testData.input);
      assert.strictEqual(result, testData.expected);
    });

    // Error scenario
    it('should throw error for invalid input', () => {
      assert.throws(() => {
        MyModule.methodName(null);
      }, /Expected error message/);
    });

    // Edge case
    it('should handle edge case: empty string', () => {
      const result = MyModule.methodName('');
      assert.strictEqual(result, null);
    });

    // Async operations
    it('should handle async operation', async () => {
      const result = await MyModule.asyncMethod(testData.input);
      assert.ok(result);
    });
  });
});
```

### Assertion Methods (Node.js assert)

```javascript
// Equality
assert.strictEqual(actual, expected);           // Strict equality (===)
assert.notStrictEqual(actual, expected);        // Not strictly equal (!==)
assert.deepStrictEqual(obj1, obj2);             // Deep object comparison
assert.deepNotStrictEqual(obj1, obj2);          // Deep inequality

// Truthiness
assert.ok(value);                               // Truthy check
assert.strictEqual(value, true);                // Explicit true check
assert.strictEqual(value, false);               // Explicit false check

// Exceptions
assert.throws(() => fn(), /error message/);     // Expects error
assert.doesNotThrow(() => fn());                // Expects no error

// Arrays
assert.ok(Array.isArray(value));                // Array check
assert.strictEqual(arr.length, 3);              // Length check
assert.ok(arr.includes(item));                  // Inclusion check

// Objects
assert.ok(obj.hasOwnProperty('key'));           // Property check
assert.strictEqual(typeof obj, 'object');       // Type check
```

---

## Coverage Requirements by Module Type

| Module Type | Lines | Functions | Branches | Required |
| ----------- | ------ | --------- | -------- | -------- |
| Core Services | **85%** | **90%** | **80%** | ✅ Mandatory |
| Utilities | **90%** | **95%** | **85%** | ✅ Mandatory |
| Commands | **80%** | **85%** | **75%** | ✅ Mandatory |
| Middleware | **95%** | **100%** | **90%** | ✅ Mandatory |
| New Features | **90%** | **95%** | **85%** | ✅ Mandatory |

**View coverage:**

```bash
npm test -- --coverage
# Opens: coverage/lcov-report/index.html
```

---

## Required Test Scenarios

Every public method MUST have tests for:

### 1. Happy Path ✅

```javascript
it('should return correct result for valid input', () => {
  const result = module.method('valid');
  assert.strictEqual(result, expected);
});
```

### 2. Error Scenarios ❌

```javascript
it('should throw specific error for invalid input', () => {
  assert.throws(() => {
    module.method(null);
  }, /Invalid input/);
});

it('should handle database error gracefully', async () => {
  // Setup mock to throw error
  const error = new Error('Database error');
  
  try {
    await module.asyncMethod();
    assert.fail('Should have thrown');
  } catch (err) {
    assert.ok(err.message.includes('Database'));
  }
});
```

### 3. Edge Cases 🔧

```javascript
it('should handle edge case: empty string', () => {
  const result = module.method('');
  assert.strictEqual(result, null);
});

it('should handle edge case: null value', () => {
  assert.throws(() => module.method(null));
});

it('should handle edge case: very large input', () => {
  const largeInput = 'x'.repeat(10000);
  const result = module.method(largeInput);
  assert.ok(result);
});

it('should handle edge case: special characters', () => {
  const result = module.method('!@#$%^&*()');
  assert.ok(result);
});
```

### 4. Boundary Conditions 📏

```javascript
it('should handle minimum value', () => {
  const result = module.method(0);
  assert.strictEqual(result, expected);
});

it('should handle maximum value', () => {
  const result = module.method(Number.MAX_SAFE_INTEGER);
  assert.ok(result);
});

it('should handle array with one item', () => {
  const result = module.method([1]);
  assert.ok(result);
});

it('should handle empty array', () => {
  const result = module.method([]);
  assert.deepStrictEqual(result, []);
});
```

### 5. Async Operations ⏱️

```javascript
it('should handle successful async operation', async () => {
  const result = await module.asyncMethod('input');
  assert.strictEqual(result, expected);
});

it('should handle async error', async () => {
  try {
    await module.failingAsync();
    assert.fail('Should have rejected');
  } catch (err) {
    assert.ok(err);
  }
});
```

---

## Mocking Patterns

### Mocking Discord.js Interactions

```javascript
const mockInteraction = {
  user: { id: 'user-123', username: 'TestUser' },
  guildId: 'guild-456',
  reply: jest.fn().mockResolvedValue({}),
  editReply: jest.fn().mockResolvedValue({}),
  deferReply: jest.fn().mockResolvedValue({}),
};
```

### Mocking Database Operations

```javascript
const Database = require('better-sqlite3');
let db;

beforeEach(() => {
  db = new Database(':memory:');
});

afterEach(() => {
  db.close();
});
```

---

## Test-Driven Development Workflow

### Step 1: Write Tests FIRST

```bash
touch tests/unit/test-my-feature.test.js
```

### Step 2: Run Tests (RED) - Should FAIL

```bash
npm test -- tests/unit/test-my-feature.test.js
```

### Step 3: Implement Code (GREEN)

```javascript
// Make tests pass with minimum code
```

### Step 4: Run Tests (GREEN) - Should PASS

```bash
npm test -- tests/unit/test-my-feature.test.js
```

### Step 5: Refactor (REFACTOR)

```javascript
// Improve code quality while tests pass
```

### Step 6: Verify Coverage

```bash
npm test -- --coverage
```

---

## Pre-Commit Checklist

```bash
# 1. Run all tests
npm test

# 2. Check coverage
npm test -- --coverage

# 3. Lint code
npm run lint

# 4. ONLY commit if ALL checks pass
git add .
git commit -m "feat: Add feature with TDD"
```

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Test-Driven Development Reference](../reference/quick-refs/TDD-QUICK-REFERENCE.md)
- [Coverage Analysis](../testing/test-coverage-baseline-strategy.md)

---

**Status**: ✅ Updated January 2026  
**Framework**: Jest with Node.js assert  
**Approach**: Mandatory TDD for all new code
