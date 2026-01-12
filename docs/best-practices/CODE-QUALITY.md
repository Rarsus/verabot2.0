# Code Quality Standards

This document outlines code quality standards and practices for VeraBot2.0.

## Pre-Commit Checks

Before every commit, the following checks run automatically:

1. **ESLint** - Code style and quality rules
2. **Unit Tests** - All 74+ tests must pass
3. **Documentation Generation** - Test docs auto-update

If any check fails, the commit is aborted.

## Code Style Guide

### JavaScript Standards

#### Indentation & Spacing

```javascript
// ✅ Use 2-space indentation
const obj = {
  property: 'value',
  nested: {
    key: 'nested value',
  },
};

// ✅ Space around operators
const result = a + b;
const config = { enabled: true };
const arr = [1, 2, 3];

// ❌ No spaces inside brackets/braces
const bad1 = {key:'value'};
const bad2 = [1,2,3];
```

#### Variable Declaration

```javascript
// ✅ Use const by default
const config = {
  /* ... */
};

// ✅ Use let for mutable variables
let counter = 0;
counter++;

// ❌ Never use var
var oldStyle = true;
```

#### Quotes

```javascript
// ✅ Use single quotes
const message = 'Hello, world!';

// ✅ Avoid escaping when possible
const quote = "Use 'single' for nested quotes";

// ❌ Use double quotes only when necessary
const bad = 'Unnecessary';
```

#### Functions

```javascript
// ✅ Named functions
async function executeCommand(interaction) {
  // implementation
}

// ✅ Arrow functions for callbacks
const results = data.map(item => item.value);

// ✅ Space before parenthesis
function myFunction() {
  // implementation
}

// ❌ No space after function name
functionname() {
}
```

#### Semicolons

```javascript
// ✅ Always use semicolons
const x = 5;
const fn = () => x;

// ❌ Never omit semicolons
const x = 5;
const fn = () => x;
```

### File Organization

#### Single Responsibility

Each file should have one primary responsibility:

```
src/
  commands/
    quote-management/
      add-quote.js        # Only handles adding quotes
      delete-quote.js     # Only handles deleting quotes
  utils/
    command-base.js       # Only base command class
    response-helpers.js   # Only response utilities
```

#### Imports at Top

```javascript
// ✅ Group imports by type
const { Command } = require('../core/CommandBase');
const { sendError } = require('../utils/helpers/response-helpers');
const database = require('../services/DatabaseService');

// ❌ Mixed imports and code
const database = require('../services/DatabaseService');
const config = loadConfig();
const { Command } = require('../core/CommandBase');
```

#### Max Line Length

- Target: 80-100 characters
- Hard limit: 120 characters
- Break long lines logically

```javascript
// ✅ Readable long line break
const message = interaction.options.getString('quote') || 'No quote provided';

// ❌ Too long
const message = interaction.options.getString('quote') || 'No quote provided';
```

## Testing Standards

### Test Structure

```javascript
// ✅ Clear test organization
console.log('\n=== Test 1: Feature Description ===');
try {
  // Test setup
  const cmd = new Command({...});

  // Test execution
  const result = await cmd.execute();

  // Assertion
  if (result.success) {
    console.log('✅ Test 1 Passed: Clear description');
    passed++;
  }
} catch (err) {
  console.error('❌ Test 1 Failed:', err.message);
  failed++;
}
```

### Coverage Requirements

- All public methods must have tests
- Error cases must be tested
- Edge cases must be covered
- Minimum target: 80% coverage

### Running Tests

```bash
# Run basic tests
npm test

# Run all tests including advanced suites
npm run test:all

# Run specific test suite
npm run test:utils:base

# Generate test documentation
npm run test:docs
```

## Documentation Standards

### Code Comments

```javascript
// ✅ Explain WHY, not WHAT
// Use optional chaining for safe property access
const isInteraction = firstArg?.isCommand?.();

// ✅ Document complex logic
// Retry up to 3 times with exponential backoff
for (let attempt = 0; attempt < 3; attempt++) {
  try {
    return await fetch(url);
  } catch (err) {
    await sleep(Math.pow(2, attempt) * 1000);
  }
}

// ❌ Don't comment obvious code
// Increment counter
counter++;

// ❌ Outdated comments
// This was broken in v1.2 (but fixed now)
const value = getValue();
```

### JSDoc for Public APIs

```javascript
/**
 * Wraps an async function with automatic error handling
 * @param {Function} fn - Async function to wrap
 * @param {string} context - Context for logging (e.g., 'command.execute')
 * @returns {Function} Wrapped function with error handling
 * @throws {Error} If function execution fails after retry logic
 */
wrapError(fn, context) {
  // implementation
}
```

### File Headers

```javascript
/**
 * Quote Management Command
 * Handles adding, updating, and deleting quotes from the database
 *
 * Features:
 * - SQLite persistence
 * - Automatic error handling
 * - User-friendly error messages
 */

const Command = require('../../core/CommandBase');
```

## Performance Guidelines

### Avoid Common Pitfalls

```javascript
// ❌ Unnecessary database queries in loops
for (const userId of userIds) {
  const user = await getUser(userId); // Repeated queries!
}

// ✅ Batch operations when possible
const users = await getUsers(userIds); // Single query
```

### Async Best Practices

```javascript
// ✅ Proper async/await
try {
  const result = await operation();
  return result;
} catch (err) {
  handleError(err);
}

// ❌ Unnecessary promises
return new Promise((resolve) => {
  resolve(value);
});
```

### Memory Management

```javascript
// ✅ Clean up resources
const connection = await db.connect();
try {
  // use connection
} finally {
  await connection.close();
}

// ❌ Leaked connections
const connection = await db.connect();
// no cleanup!
```

## Error Handling

### Always Handle Async Errors

```javascript
// ✅ Try-catch for async operations
async function safeOperation() {
  try {
    return await riskyOperation();
  } catch (err) {
    logError('operation', err, ERROR_LEVELS.MEDIUM);
    throw err;
  }
}

// ❌ Unhandled promise rejection
function badOperation() {
  return riskyOperation().then((result) => result);
}
```

### Meaningful Error Messages

```javascript
// ✅ Include context and actionable info
throw new Error(`Failed to load quote #${quoteId}: Database timeout (check connection)`);

// ❌ Generic error messages
throw new Error('Error');
```

## Git Practices

### Commit Messages

```
// ✅ Clear, descriptive messages
feat: add quote export functionality
fix: handle null user in quote stats
docs: update command creation guide
refactor: extract error handling to utility
test: add integration tests for quote search

// ❌ Vague messages
update stuff
fix bug
changes
wip
```

### Commit Workflow

```bash
# Pre-commit checks run automatically
git add .
git commit -m "feat: add new feature"

# If checks fail:
# 1. Fix linting errors: npm run lint -- --fix
# 2. Fix test failures: review test output
# 3. Retry commit
```

## Quality Metrics

### Current Status

- **Test Coverage:** 74 tests passing (100%)
- **Linting:** All rules enforced
- **Code Style:** ESLint configured
- **Pre-commit Checks:** Enabled

### Monitoring

```bash
# Check lint warnings
npm run lint -- --format json | jq '.[] | select(.severity=="warning")'

# Run full test suite with coverage
npm run test:all

# View recent test results
cat docs/TEST-SUMMARY-LATEST.md
```

## Continuous Improvement

1. **Regular Reviews:** Review code quality metrics weekly
2. **Dependency Updates:** Keep packages updated (npm audit)
3. **Test Coverage:** Aim for 85%+ coverage
4. **Documentation:** Keep docs in sync with code
5. **Performance:** Monitor response times and resource usage
