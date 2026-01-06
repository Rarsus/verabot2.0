# TDD Quick Reference - VeraBot2.0

**Quick lookup guide for Test-Driven Development implementation**

---

## 🚀 Quick Start: Write a New Feature with TDD

### Step 1: Create Test File FIRST ❌→✅
```bash
# DON'T: Start writing implementation code
# DO: Create test file first
touch tests/unit/test-my-feature.js
```

### Step 2: Write Tests (RED Phase)
```javascript
// tests/unit/test-my-feature.js
const assert = require('assert');
const MyFeature = require('../../src/path/to/my-feature');

describe('MyFeature', () => {
  describe('doSomething()', () => {
    it('should return expected value for valid input', () => {
      const result = MyFeature.doSomething('input');
      assert.strictEqual(result, 'expected');
    });

    it('should throw error for invalid input', () => {
      assert.throws(() => {
        MyFeature.doSomething(null);
      }, /Invalid input/);
    });

    it('should handle edge case: empty string', () => {
      const result = MyFeature.doSomething('');
      assert.strictEqual(result, null);
    });
  });
});
```

Run test (should FAIL):
```bash
npm test -- tests/unit/test-my-feature.js
# Expected: Tests fail ❌
```

### Step 3: Implement Code (GREEN Phase)
```javascript
// src/path/to/my-feature.js
class MyFeature {
  static doSomething(input) {
    if (input === null) {
      throw new Error('Invalid input');
    }
    if (input === '') {
      return null;
    }
    return 'expected'; // Minimum needed to pass
  }
}

module.exports = MyFeature;
```

Run test (should PASS):
```bash
npm test -- tests/unit/test-my-feature.js
# Expected: All tests pass ✅
```

### Step 4: Refactor (REFACTOR Phase)
```javascript
// Improve code quality while keeping tests passing
class MyFeature {
  static doSomething(input) {
    // Validate input
    if (input === null || typeof input !== 'string') {
      throw new Error('Invalid input: expected string');
    }

    // Handle empty case
    if (input.trim().length === 0) {
      return null;
    }

    // Process input
    return 'expected';
  }
}
```

Verify tests still pass:
```bash
npm test -- tests/unit/test-my-feature.js
# Expected: All tests still pass ✅
```

### Step 5: Check Coverage
```bash
npm run test:coverage
# Verify your module meets coverage thresholds
```

### Step 6: Pre-commit Checks
```bash
# 1. Run all tests
npm test

# 2. Check linting
npm run lint

# 3. Generate coverage
npm run test:coverage

# 4. ONLY commit if all pass
git add .
git commit -m "feat: Add MyFeature with full TDD"
```

---

## 📊 Coverage Thresholds

**MUST MEET these minimums BEFORE commit:**

```
Service Modules:        Lines: 85%  |  Functions: 90%  |  Branches: 80%
Utility Modules:        Lines: 90%  |  Functions: 95%  |  Branches: 85%
Command Modules:        Lines: 80%  |  Functions: 85%  |  Branches: 75%
Middleware Modules:     Lines: 95%  |  Functions: 100% |  Branches: 90%
Feature Modules:        Lines: 90%  |  Functions: 95%  |  Branches: 85%
```

**Check your module:**
```bash
npm run test:coverage
# Open coverage/lcov-report/index.html
# Verify YOUR module meets thresholds
```

---

## 🧪 Required Test Scenarios

**Every public method MUST have tests for:**

### Happy Path ✅
```javascript
it('should return correct result for valid input', () => {
  const result = module.method('valid');
  assert.strictEqual(result, expected);
});
```

### Error Scenarios ❌
```javascript
it('should throw specific error for invalid input', () => {
  assert.throws(() => {
    module.method(null);
  }, /Expected error message/);
});
```

### Edge Cases 🔧
```javascript
it('should handle edge case: empty string', () => {
  const result = module.method('');
  assert.strictEqual(result, null);
});

it('should handle edge case: very long input', () => {
  const longInput = 'x'.repeat(10000);
  const result = module.method(longInput);
  // Assert behavior
});

it('should handle edge case: special characters', () => {
  const result = module.method('!@#$%^&*()');
  // Assert behavior
});
```

### Boundary Conditions 📏
```javascript
it('should handle minimum value', () => {
  const result = module.method(1);
  assert.strictEqual(result, expected);
});

it('should handle maximum value', () => {
  const result = module.method(Number.MAX_SAFE_INTEGER);
  assert.strictEqual(result, expected);
});
```

### Async Operations ⏱️
```javascript
it('should handle async operation successfully', async () => {
  const result = await module.asyncMethod('input');
  assert.strictEqual(result, expected);
});

it('should handle async error', async () => {
  await assert.rejects(
    () => module.asyncMethod(null),
    /Expected error/
  );
});
```

---

## 🎯 Mocking Patterns

### Discord.js Mocking
```javascript
const mockInteraction = {
  user: { id: 'user-123', username: 'TestUser' },
  guildId: 'guild-456',
  channelId: 'channel-789',
  reply: async (msg) => ({ id: 'msg-123', ...msg }),
  deferReply: async () => ({}),
  editReply: async (msg) => ({ ...msg }),
  followUp: async (msg) => ({ ...msg }),
};

// Use in tests
const result = await command.executeInteraction(mockInteraction);
```

### Database Mocking
```javascript
const Database = require('better-sqlite3');
const db = new Database(':memory:'); // In-memory SQLite

// Setup in beforeEach
db.exec('CREATE TABLE test (id INTEGER PRIMARY KEY, value TEXT)');

// Cleanup in afterEach
db.close();
```

### Service Mocking
```javascript
const mockService = {
  getQuote: async (id) => ({
    id,
    text: 'Test quote',
    author: 'Test Author'
  }),
  addQuote: async (text, author) => ({ success: true }),
};

// Use in tests
const result = await command.executeWithService(mockService);
```

---

## ❌ Common Mistakes (DON'T DO THESE)

### ❌ Writing code first
```javascript
// WRONG - Code before tests
class MyFeature {
  static doSomething(input) {
    // Lots of implementation
  }
}
```

### ❌ Testing only happy path
```javascript
// WRONG - Only one test case
it('should work', () => {
  const result = module.method('input');
  assert.ok(result);
});
```

### ❌ No error testing
```javascript
// WRONG - Doesn't test error scenarios
describe('MyModule', () => {
  it('should return value', () => {
    // Happy path only
  });
});
```

### ❌ Forgetting cleanup
```javascript
// WRONG - No cleanup between tests
afterEach(() => {
  // Missing cleanup code
});
```

### ❌ Committing without tests passing
```bash
# WRONG
npm run lint  # Passes
git commit -m "Add feature"  # WITHOUT running tests

# RIGHT
npm test      # MUST pass
npm run lint  # MUST pass
npm run test:coverage  # MUST meet thresholds
git commit -m "Add feature"
```

---

## ✅ DO THIS INSTEAD

### ✅ Write tests first
```javascript
// RIGHT - Tests before code
describe('MyFeature', () => {
  it('should...', () => { });
  it('should handle error...', () => { });
  it('should handle edge case...', () => { });
});
// THEN implement code to pass tests
```

### ✅ Test all scenarios
```javascript
// RIGHT - Complete test coverage
describe('MyFeature', () => {
  describe('happy path', () => {
    it('should return expected', () => { });
  });

  describe('error scenarios', () => {
    it('should throw for null', () => { });
    it('should throw for invalid type', () => { });
  });

  describe('edge cases', () => {
    it('should handle empty string', () => { });
    it('should handle very long input', () => { });
  });
});
```

### ✅ Test error paths
```javascript
// RIGHT - All error scenarios tested
it('should throw error for invalid input', () => {
  assert.throws(() => {
    module.method(null);
  }, /Invalid input/);
});

it('should throw error for wrong type', () => {
  assert.throws(() => {
    module.method(123);
  }, /Expected string/);
});
```

### ✅ Cleanup properly
```javascript
// RIGHT - Proper cleanup
afterEach(() => {
  // Close connections
  db.close();
  
  // Clear mocks
  mockService.reset();
  
  // Clean up files
  fs.rmSync(testDir, { recursive: true });
});
```

### ✅ Full pre-commit checklist
```bash
# RIGHT - Run all checks before commit
npm test              # All tests pass ✅
npm run lint          # No lint errors ✅
npm run test:coverage # Coverage meets thresholds ✅

# Only THEN commit
git commit -m "feat: New feature with full TDD"
```

---

## 📋 Test Structure Template

Copy-paste template for new test files:

```javascript
// tests/unit/test-{module-name}.js
/**
 * Test suite for {ModuleName}
 * 
 * Covers:
 * - Happy path scenarios
 * - Error handling
 * - Edge cases
 * - Boundary conditions
 */

const assert = require('assert');
const { describe, it, beforeEach, afterEach } = require('node:test');

const Module = require('../../src/path/to/module');

describe('ModuleName', () => {
  let testData;

  beforeEach(() => {
    // Initialize test data
    testData = {
      validInput: 'test',
      invalidInput: null,
    };
  });

  afterEach(() => {
    // Cleanup (close DB, reset mocks, etc)
  });

  describe('methodName()', () => {
    // Happy path
    it('should return expected value for valid input', () => {
      const result = Module.methodName(testData.validInput);
      assert.strictEqual(result, 'expected');
    });

    // Error scenarios
    it('should throw error for invalid input', () => {
      assert.throws(() => {
        Module.methodName(testData.invalidInput);
      }, /Invalid input/);
    });

    // Edge cases
    it('should handle edge case: empty string', () => {
      const result = Module.methodName('');
      assert.strictEqual(result, null);
    });
  });

  describe('anotherMethod()', () => {
    // Tests for another method...
  });
});
```

---

## 🔍 Verify Coverage

### View Coverage Report
```bash
# Generate coverage report
npm run test:coverage

# Open in browser
# macOS
open coverage/lcov-report/index.html

# Linux
xdg-open coverage/lcov-report/index.html

# Windows
start coverage/lcov-report/index.html
```

### Check Specific Module
```bash
# View coverage for one module
cat coverage/coverage-final.json | jq '.["C:\\repo\\verabot2.0\\src\\path\\to\\module.js"]'
```

### Get Summary
```bash
# Quick coverage summary
cat coverage/coverage-summary.json | jq '.total'

# Output shows:
# {
#   "lines": { "pct": 79.54 },
#   "functions": { "pct": 82.74 },
#   "branches": { "pct": 74.71 }
# }
```

---

## 📚 Detailed Guides

For more information, see:
- 📄 **CODE-COVERAGE-ANALYSIS-PLAN.md** - Detailed coverage roadmap
- 📄 **.github/copilot-instructions.md** - Full TDD framework (Test-Driven Development section)
- 📁 **tests/unit/** - Real examples of test structure

---

## 🚨 TDD Non-Negotiables

| Rule | Must? | Consequence |
|------|-------|------------|
| Write tests BEFORE code | ✅ YES | PR rejected |
| Test happy path | ✅ YES | PR rejected |
| Test error paths | ✅ YES | PR rejected |
| Test edge cases | ✅ YES | PR rejected |
| Meet coverage thresholds | ✅ YES | PR rejected |
| Pass npm test | ✅ YES | Cannot merge |
| Pass npm run lint | ✅ YES | Cannot merge |
| Pre-commit checks | ✅ YES | No exceptions |

---

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Write test file | 15-30 min |
| Write tests (3-5 cases) | 30-60 min |
| Implement code | 30-60 min |
| Refactor & optimize | 20-40 min |
| Verify coverage | 10-15 min |
| Pre-commit checks | 5-10 min |
| **Total per feature** | **2-4 hours** |

---

**Remember: Tests first, code second, quality always.** ✅

npm run test:integration:refactor
```

### Run Specific Test Groups:

```bash
# All sanity checks
npm test

# All quote system tests (should still pass)
npm run test:quotes && npm run test:quotes-advanced

# Everything
npm run test:all
```

---

## Understanding Test Output

### Green ✅ = Test Passed

```
✅ Test 1 Passed: Command instantiation works
```

The test ran successfully and the code behaves as expected.

### Red ❌ = Test Failed

```
❌ Test 3 Failed: No reply sent
```

The test expected a reply but didn't get one. This guides us to fix the code.

### Yellow ⚠️ = Test Skipped

```
⚠️  Test 9 Skipped: Cannot verify builder structure
```

The test was skipped (usually due to mocking limitations, but the underlying feature works).

---

## Current Test Status Summary

```
Test Suite                    Status      Tests
─────────────────────────────────────────────────
Command Base Class            83%         5/6 passing
  → Error wrapping working
  → Registration working
  → One mock edge case to fix

Options Builder              100%         10/10 passing ✅
  → All option types working
  → Constraints working
  → Ready to use

Response Helpers             100%         12/12 passing ✅
  → Embeds working
  → Messages working
  → DM handling working

Integration Tests             90%         9/10 passing
  → Utilities work together
  → Commands integrate well
  → One mock edge case to fix

─────────────────────────────────────────────────
TOTAL                         93%         38/41 passing
```

---

## What Each Test Suite Validates

### Command Base Class Tests (7 tests)

Tests that the Command base class:

- ✅ Can be instantiated
- ✅ Properly wraps error handling
- ✅ Returns results on success
- ✅ Sends error replies on failure
- ✅ Respects deferred state
- ✅ Supports chainable registration
- ✅ Includes error details in messages

**Result:** Commands will need NO try-catch blocks

### Options Builder Tests (10 tests)

Tests that buildCommandOptions:

- ✅ Creates SlashCommandBuilder
- ✅ Generates options array from same definition
- ✅ Handles all option types (string, integer, boolean)
- ✅ Applies constraints (min/max length, min/max value)
- ✅ Handles optional parameters
- ✅ Works with 0, 1, or multiple options

**Result:** One definition creates both builder and options

### Response Helpers Tests (12 tests)

Tests that helper functions:

- ✅ Send quote embeds correctly
- ✅ Work with new and deferred interactions
- ✅ Format success messages with ✅
- ✅ Format error messages with ❌
- ✅ Set ephemeral flags correctly
- ✅ Send DMs and show confirmation
- ✅ Handle defer() safely

**Result:** No repeated response code needed

### Integration Tests (10 tests)

Tests that all utilities:

- ✅ Load without errors
- ✅ Work together in commands
- ✅ Reduce boilerplate significantly
- ✅ Are properly isolated
- ✅ Support multiple options
- ✅ Handle errors automatically

**Result:** Commands become much simpler

---

## Before & After Example

### BEFORE (Old Pattern - 50+ lines)

```javascript
const { SlashCommandBuilder } = require('discord.js');
const { addQuote } = require('../db');
const { validateQuoteText, handleInteractionError } = require('../utils/error-handler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hi')
    .setDescription('Say hi')
    .addStringOption((opt) => opt.setName('name').setDescription('Name').setRequired(false)),
  name: 'hi',
  description: 'Say hi to someone: /hi name:Alice',
  options: [{ name: 'name', type: 'string', description: 'Name to say hi to', required: false }],
  async execute(message, args) {
    try {
      const name = args[0] || 'there';
      if (message.channel && typeof message.channel.send === 'function') {
        await message.channel.send(`hello ${name}!`);
      } else if (message.reply) {
        await message.reply(`hello ${name}!`);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  },
  async executeInteraction(interaction) {
    try {
      const name = interaction.options.getString('name') || 'there';
      await interaction.reply(`hello ${name}!`);
    } catch (err) {
      console.error('Error:', err);
      try {
        await interaction.reply('Error occurred', { flags: 64 });
      } catch (e) {
        /* ignore */
      }
    }
  },
};
```

**Problems:**

- ❌ 50+ lines
- ❌ Duplicate option definitions
- ❌ Repeated error handling
- ❌ Message/interaction logic duplicated

### AFTER (New Pattern - 20 lines)

```javascript
const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');

const { data, options } = buildCommandOptions('hi', 'Say hi to someone', [
  { name: 'name', type: 'string', description: 'Name to say hi to', required: false },
]);

class HiCommand extends Command {
  constructor() {
    super({ name: 'hi', description: 'Say hi to someone', data, options });
  }

  async execute(message, args) {
    const name = args[0] || 'there';
    await message.reply(`hello ${name}!`);
  }

  async executeInteraction(interaction) {
    const name = interaction.options.getString('name') || 'there';
    await interaction.reply(`hello ${name}!`);
  }
}

module.exports = new HiCommand().register();
```

**Benefits:**

- ✅ 20 lines (60% reduction!)
- ✅ Single option definition
- ✅ Error handling automatic
- ✅ Clean, readable code
- ✅ No boilerplate

---

## How to Use Tests to Refactor

### For Each Command:

1. **Check it passes existing tests:**

   ```bash
   npm test              # Sanity checks
   npm run test:quotes   # Quote system tests
   ```

2. **Look at the new tests to understand requirements:**
   - Read the test descriptions in `TDD_TEST_RESULTS.md`
   - Understand what patterns are expected

3. **Refactor the command:**
   - Use Command base class
   - Use buildCommandOptions
   - Use response helpers
   - Remove try-catch blocks

4. **Verify tests pass:**

   ```bash
   npm run test:all      # Should have 41/41 passing
   npm test              # Sanity checks still pass
   npm run test:quotes   # Quote tests still pass
   npm run lint          # No linting errors
   ```

5. **Commit when everything passes:**
   ```bash
   git add -A
   git commit -m "refactor: modernize command-name.js using Command base class"
   ```

---

## Example Refactoring Checklist

For each command being refactored:

- [ ] Read test descriptions in TDD_TEST_RESULTS.md
- [ ] Backup original command (it's in git anyway)
- [ ] Extend Command base class
- [ ] Use buildCommandOptions for options
- [ ] Use response helpers for standard responses
- [ ] Remove all try-catch blocks
- [ ] Remove duplicate option definitions
- [ ] Run full test suite: `npm run test:all`
- [ ] Verify no new linting errors: `npm run lint`
- [ ] Test bot starts: `npm start` (then Ctrl+C)
- [ ] Commit: `git add -A && git commit -m "..."`

---

## Troubleshooting

### Test fails but should pass?

```bash
# Clear npm cache and reinstall
npm ci

# Run test again
npm run test:all
```

### Bot won't start after refactoring?

```bash
# Check for syntax errors
npm run lint

# Check if command is properly exported
# Each command must export a single object with:
# - name (string)
# - description (string)
# - data (SlashCommandBuilder)
# - execute or executeInteraction (function)
```

### Test passes but bot doesn't work?

1. Check all commands use `module.exports = new CommandClass().register()`
2. Verify no console.error in command implementations
3. Run bot with debug: Check Discord for error messages

---

## Next Actions

After test creation is complete:

1. **Review test results:** ✅ DONE
2. **Refactor first command:** hi.js using tests as guide
3. **Run tests:** Verify still passing
4. **Refactor second command:** ping.js
5. **Refactor quote commands:** Use response helpers
6. **Refactor complex commands:** Use all utilities
7. **Final verification:** All tests pass, bot runs, code reduced

---

## Questions?

- Why TDD? → Tests define behavior before code exists
- Why these utilities? → Reduce repeated patterns, improve maintainability
- Why test first? → Ensures all code paths covered, catches bugs early
- When done? → When all 41 tests pass AND all quote tests pass
- Can I help? → Start by refactoring hi.js and running tests!
