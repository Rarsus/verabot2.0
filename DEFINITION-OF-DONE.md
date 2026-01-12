# VeraBot2.0 Definition of Done (DoD)

**Version:** 1.0  
**Effective Date:** January 12, 2026  
**Scope:** All code changes, features, and releases

---

## Executive Summary

The Definition of Done (DoD) is a comprehensive checklist that ensures all work meets quality, testing, documentation, and security standards before being considered complete. This document applies to:

- ✅ Individual code commits
- ✅ Feature implementations
- ✅ Bug fixes
- ✅ Refactoring work
- ✅ Release candidates

**No work is considered "done" until ALL applicable criteria are met.**

---

## I. Code Quality Standards

### 1. Code Style & Formatting

- [ ] **ESLint Compliance** - Zero linting errors/warnings
  ```bash
  npm run lint
  ```
  - All files pass ESLint checks
  - Max warnings threshold (50) not exceeded
  - Pre-commit hooks pass without errors

- [ ] **Consistent Naming Conventions**
  - Variables: `camelCase` (e.g., `userId`, `quoteText`)
  - Classes: `PascalCase` (e.g., `CommandBase`, `QuoteService`)
  - Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRIES`)
  - Files: `kebab-case` (e.g., `add-quote.js`, `command-base.js`)

- [ ] **Consistent Indentation** - 2 spaces (enforced by ESLint)

- [ ] **Semicolons Required** - All statements must end with semicolons

- [ ] **Quote Style** - Single quotes for strings (enforced by ESLint)

- [ ] **No Magic Numbers** - Extract to named constants
  ```javascript
  // ❌ BAD
  const delay = 3000;
  
  // ✅ GOOD
  const TIMEOUT_MS = 3000;
  ```

---

### 2. Architectural Patterns

- [ ] **Command Pattern Usage** - All commands extend `Command` base class
  - Use `src/core/CommandBase.js`, NOT deprecated `src/utils/command-base.js`
  - Implement `execute()` for prefix commands
  - Implement `executeInteraction()` for slash commands
  - Don't write manual try-catch blocks (handled by base class)

- [ ] **Response Helpers Usage** - All Discord responses use helpers
  - Use `sendSuccess()`, `sendError()`, `sendQuoteEmbed()` from `src/utils/helpers/response-helpers.js`
  - NO raw Discord API calls in commands
  - Consistent message formatting across bot

- [ ] **Service Layer Pattern** - Business logic separated from commands
  - Commands handle interaction/parsing
  - Services handle business logic
  - Use guild-aware services for all database operations

- [ ] **Guild-Aware Database Access** - MANDATORY for database operations
  - Use `GuildAwareDatabaseService`, `QuoteService`, `GuildAwareReminderService`
  - NEVER use deprecated `src/db.js` wrapper
  - All operations must include `guildId` parameter
  - Prevents cross-guild data leaks

- [ ] **No Deprecated Imports** - Verify imports are from current locations
  ```javascript
  // ✅ CORRECT - Current locations
  const CommandBase = require('../../src/core/CommandBase');
  const DatabaseService = require('../../src/services/DatabaseService');
  const { sendSuccess } = require('../../src/utils/helpers/response-helpers');
  
  // ❌ WRONG - Deprecated locations
  const CommandBase = require('../../src/utils/command-base');  // OLD!
  const db = require('../../src/db');  // DEPRECATED!
  const { sendSuccess } = require('../../src/utils/response-helpers');  // OLD PATH!
  ```

---

### 3. Code Complexity

- [ ] **Functions Stay Focused** - Single responsibility principle
  - Functions do ONE thing well
  - Max 20 lines per function (complex logic extracted)
  - Cyclomatic complexity < 5

- [ ] **No Code Duplication** - DRY principle
  - No copy-paste code
  - Reusable logic extracted to utilities
  - Shared patterns in base classes

- [ ] **No Commented-Out Code** - Delete instead of commenting
  - Exception: Temporarily marked with `// TODO:` or `// FIXME:`
  - All temp comments must be resolved before done

---

### 4. Error Handling

- [ ] **No Silent Failures** - All errors are logged or handled
  - Errors propagate with context
  - User-facing errors provide helpful messages
  - Internal errors logged with stack traces

- [ ] **Graceful Degradation** - System continues when possible
  - Non-critical failures don't crash bot
  - Timeouts have fallbacks
  - Database failures are retried (max 3 attempts)

- [ ] **No Swallowed Exceptions** - Errors are not silently ignored
  ```javascript
  // ❌ BAD - Swallowed error
  try { await operation(); } catch (e) {}
  
  // ✅ GOOD - Error is logged/handled
  try { await operation(); } catch (e) { logger.error(e); throw e; }
  ```

---

## II. Testing Requirements

### 1. Test-Driven Development (TDD) - MANDATORY

- [ ] **Tests Written FIRST** - Before implementation code
  - Test file created before .js file
  - Tests define requirements
  - Implementation follows test specs

- [ ] **All Public Methods Tested** - 100% method coverage
  - Happy path: Normal operation
  - Error paths: All error types
  - Edge cases: Boundary conditions

- [ ] **Tests PASS Locally** - Before any commit
  ```bash
  npm test
  ```
  - All tests passing (green)
  - No skipped tests (x.skip)
  - No only tests (x.only)

---

### 2. Test Coverage Standards

**Minimum Coverage by Module:**

| Module Type   | Lines    | Functions | Branches | Tests   |
| ------------- | -------- | --------- | -------- | ------- |
| Services      | 85%+     | 90%+      | 80%+     | 20-30   |
| Utilities     | 90%+     | 95%+      | 85%+     | 15-25   |
| Commands      | 80%+     | 85%+      | 75%+     | 15-20   |
| Middleware    | 95%+     | 100%      | 90%+     | 20-25   |
| New Features  | 90%+     | 95%+      | 85%+     | 20-30   |

- [ ] **Coverage Never Decreases** - Only maintain or improve
  - Check current coverage: `npm test -- --coverage`
  - Compare against baseline
  - Gaps explained and acceptable

- [ ] **Branch Coverage Tested** - if/else and ternaries covered
  ```javascript
  // MUST test both true and false branches
  if (condition) { /* test this path */ }
  else { /* and this path */ }
  ```

---

### 3. Test Quality

- [ ] **Test File Naming** - Follows `test-[module-name].test.js` convention
  - Unit tests: `tests/unit/test-*.test.js`
  - Integration tests: `tests/integration/test-*.test.js`
  - Archived tests: `tests/_archive/[old-test].js`

- [ ] **Descriptive Test Names** - Clearly state what is tested
  ```javascript
  // ✅ GOOD - Clear intent
  it('should return quote by ID for valid guild and quote ID', () => {
  
  // ❌ BAD - Unclear
  it('works', () => {
  ```

- [ ] **Proper Test Setup/Teardown** - No side effects between tests
  - `beforeEach()`: Initialize test data, create mocks
  - `afterEach()`: Cleanup resources, reset mocks
  - Tests are independent (can run in any order)

- [ ] **Meaningful Assertions** - Each test verifies specific behavior
  ```javascript
  // ✅ GOOD - Specific assertions
  assert.strictEqual(result.id, expectedId);
  assert.strictEqual(result.guildId, guildId);
  
  // ❌ BAD - Generic assertion
  assert(result);  // What are we testing?
  ```

- [ ] **Error Path Testing** - Test all error scenarios
  ```javascript
  // MUST test:
  - Invalid inputs (null, undefined, empty)
  - Database errors
  - Network timeouts
  - Permission errors
  - Rate limiting
  - Async/await rejections
  ```

- [ ] **Mock External Dependencies** - No actual API calls in tests
  - Discord.js interactions mocked
  - Database operations use in-memory SQLite
  - HTTP requests mocked
  - No real API keys or secrets in tests

---

### 4. Test Execution

- [ ] **All Tests Pass** - 100% pass rate
  ```bash
  npm test
  # Result: Tests: X passed, X total
  ```

- [ ] **No Test Flakiness** - Tests pass consistently
  - Not timing-dependent
  - Not order-dependent
  - Reproducible failures

- [ ] **Test Execution Time** - Reasonable performance
  - Unit tests: < 5s for entire suite
  - Integration tests: < 20s
  - Total: < 30s

---

## III. Documentation Standards

### 1. Code Comments

- [ ] **Complex Logic Documented** - Why, not what
  ```javascript
  // ✅ GOOD - Explains WHY
  // Retry with exponential backoff to handle rate limiting
  const delay = Math.pow(2, attempts) * 100;
  
  // ❌ BAD - Explains WHAT (code already shows this)
  // increment attempts by 1
  attempts++;
  ```

- [ ] **No Obvious Comments** - Don't comment obvious code
  ```javascript
  // ❌ BAD - Obvious
  const name = user.name; // get user name
  
  // ✅ GOOD - No comment needed
  const name = user.name;
  ```

- [ ] **Function JSDoc** - Public functions documented
  ```javascript
  /**
   * Adds a quote to the database
   * @param {string} guildId - Guild ID for isolation
   * @param {string} text - Quote text
   * @param {string} author - Quote author
   * @returns {Promise<Object>} Created quote with ID
   * @throws {Error} If database operation fails
   */
  async addQuote(guildId, text, author) {
  ```

---

### 2. File-Level Documentation

- [ ] **File Header** - Describe file purpose (for complex files)
  ```javascript
  /**
   * Quote management commands
   * Provides CRUD operations for quote system
   * 
   * Commands:
   * - /add-quote: Add new quote
   * - /delete-quote: Remove quote
   * - /list-quotes: Show all quotes
   */
  ```

- [ ] **Exports Documented** - What is exported and why
  ```javascript
  // ✅ GOOD - Clear exports
  module.exports = {
    getQuote,      // Retrieve single quote
    addQuote,      // Add new quote to database
    deleteQuote,   // Remove quote by ID
  };
  ```

---

### 3. README & User-Facing Documentation

- [ ] **Feature Documented** - Users can understand usage
  - What the feature does
  - How to use it
  - Common examples
  - Troubleshooting

- [ ] **Breaking Changes Documented** - Migration path provided
  - What changed
  - Why it changed
  - How to migrate
  - Timeline for deprecation

- [ ] **Links Verified** - No broken documentation links
  - All internal links work
  - External links validated
  - Files moved are updated

---

### 4. API Documentation

- [ ] **Command Options Documented** - What each option does
  ```javascript
  const { data, options } = buildCommandOptions('quote-id', 'Get quote by ID', [
    { 
      name: 'id', 
      type: 'integer', 
      required: true, 
      description: 'Quote ID (1-999)' // Clear description
    },
  ]);
  ```

- [ ] **Service Methods Documented** - What each method does
  - Parameters: types and meanings
  - Return value: type and contents
  - Exceptions: what can go wrong
  - Example usage

---

## IV. Security Requirements

### 1. Input Validation

- [ ] **All User Input Validated** - Before processing
  - String lengths checked
  - Numbers in valid ranges
  - Enums verified against allowed values
  - No SQL injection possible (prepared statements)

- [ ] **No Secrets in Code** - All secrets from .env
  ```javascript
  // ❌ BAD - Secret hardcoded
  const token = 'xoxb-12345...';
  
  // ✅ GOOD - From environment
  const token = process.env.DISCORD_TOKEN;
  ```

- [ ] **Sanitized Output** - User data escaped in messages
  - No code injection via user input
  - Discord embeds sanitized
  - Database queries use parameters

---

### 2. Authentication & Authorization

- [ ] **Permission Checks** - Admin commands verify permissions
  ```javascript
  if (!interaction.member.permissions.has('ADMINISTRATOR')) {
    await sendError(interaction, 'Admin permission required');
    return;
  }
  ```

- [ ] **Guild Isolation Verified** - Users can't access other guilds' data
  - All queries include guildId
  - No cross-guild data leakage
  - Guild membership verified for operations

---

### 3. Data Protection

- [ ] **Sensitive Data Not Logged** - No passwords, tokens, secrets
  - User IDs logged (safe)
  - Sensitive responses logged with `[REDACTED]`
  - Database queries logged without parameters (if sensitive)

- [ ] **Database Transactions Safe** - All operations atomic
  - No partial updates
  - Rollback on errors
  - ACID properties maintained

---

## V. Performance Requirements

### 1. Startup Performance

- [ ] **Bot Starts Quickly** - < 3 seconds
  ```bash
  # Measure: npm start
  # Should show "Bot is ready" within 3 seconds
  ```

- [ ] **Command Registration Fast** - < 2 seconds
  ```bash
  npm run register-commands
  # Should complete within 2 seconds
  ```

---

### 2. Response Time

- [ ] **Commands Respond Quickly** - < 500ms
  - Simple commands: < 100ms
  - Database queries: < 200ms
  - API calls: < 500ms (with timeout)

- [ ] **Slash Commands Acknowledge** - Within 3 seconds
  - `defer()` called for long operations
  - `editReply()` before timeout
  - User sees progress indicators

---

### 3. Resource Usage

- [ ] **Memory Efficient** - No memory leaks
  - Memory usage stable over time
  - No unbounded arrays/caches
  - Cleanup in destructors/afterEach

- [ ] **Database Queries Optimized** - No N+1 queries
  - Bulk operations used when possible
  - Indexes verified in schema
  - Query plans reviewed for complex queries

---

## VI. Release Readiness

### 1. Version Management

- [ ] **Version Updated** - package.json bumped
  - Major: Breaking changes
  - Minor: New features
  - Patch: Bug fixes
  - Follows semantic versioning

- [ ] **CHANGELOG Updated** - All changes documented
  - Features listed
  - Bug fixes listed
  - Breaking changes highlighted
  - Date and version recorded

---

### 2. Git History

- [ ] **Clean Commit History** - Meaningful commits
  - One logical change per commit
  - Good commit messages
  - Related changes grouped

- [ ] **Commit Messages Follow Format**
  ```
  type: description
  
  Optional details/rationale
  
  Fixes #123  // Issue number if applicable
  ```
  - Types: feat, fix, chore, refactor, test, docs
  - First line < 50 characters
  - Detailed explanation in body

- [ ] **No Large Binary Files** - Code only
  - No compiled files
  - No dependencies in repo
  - Images referenced, not embedded

---

### 3. Deployment Verification

- [ ] **Code Runs on Target Environment** - Tested on deployment platform
  - Node version compatible
  - Dependencies installable
  - Environment variables correct
  - Database migrations successful

- [ ] **No Production Issues** - Pre-release checklist
  - All tests passing
  - No console errors
  - Logging configured
  - Error reporting enabled

---

## VII. Verification Checklist

### Pre-Commit Checklist

Before committing code:

```bash
# 1. Code Quality
npm run lint              # ✅ Zero errors/warnings
npm run format           # ✅ Code formatted consistently

# 2. Tests
npm test                 # ✅ All tests passing
npm test -- --coverage   # ✅ Coverage meets thresholds

# 3. Build
npm run build            # ✅ Project builds without errors

# 4. Documentation
# ✅ Code commented (complex logic)
# ✅ JSDoc complete (public functions)
# ✅ README updated (if feature)
# ✅ Commit message written
```

### Pre-Push Checklist

Before pushing to remote:

```bash
# 1. Verify tests again
npm test                 # ✅ All tests passing

# 2. Verify lint
npm run lint             # ✅ No errors

# 3. Verify commit
git log --oneline -5     # ✅ Good commit messages

# 4. Verify changes
git diff origin/main     # ✅ Only intended changes
```

### Pre-Merge Checklist

Before merging to main:

- [ ] Code review approved
- [ ] All CI checks passing
- [ ] Tests passing in CI environment
- [ ] No merge conflicts
- [ ] Commit history clean
- [ ] Documentation complete
- [ ] Changelog updated

---

## VIII. Examples: Done vs. Not Done

### Example 1: Simple Bug Fix

**❌ NOT DONE:**
```javascript
// Fixed bug - just changed code
// No test added
// No documentation updated
```

**✅ DONE:**
```javascript
// 1. Test written first
// tests/unit/test-quote-service.test.js
it('should not crash when quote text is empty', () => {
  assert.throws(() => quoteService.validate(''), /empty quote/i);
});

// 2. Code fixed
async validate(text) {
  if (!text || text.trim() === '') {
    throw new Error('Quote cannot be empty');
  }
  // ... rest of validation
}

// 3. Documentation updated
// README notes that empty quotes are rejected

// 4. Commit message
// fix: prevent empty quote validation errors
```

---

### Example 2: New Feature

**❌ NOT DONE:**
```javascript
// Added new command
// Kinda works
// Might have bugs
```

**✅ DONE:**
```javascript
// 1. Tests written (TDD)
// tests/unit/test-new-feature.test.js - 20+ tests
// Coverage: 90% lines, 95% functions

// 2. Command implemented
// src/commands/[category]/new-feature.js
// Extends Command base class
// Uses response helpers
// Database operations guild-aware

// 3. Documentation
// README.md - feature explained
// JSDoc on all public functions
// Tests serve as usage examples

// 4. Verified
// ✅ npm test - All pass
// ✅ npm run lint - No errors
// ✅ Git history clean
// ✅ CHANGELOG updated
// ✅ No security issues

// 5. Commit
// feat: add new feature with full test coverage
// - Added new-feature command
// - 25 tests covering all scenarios
// - Guild isolation verified
// - Updated documentation
```

---

## IX. Continuous Improvement

### Definition of Done Review

- This DoD is reviewed quarterly
- Team can propose updates
- Changes require consensus
- Major changes documented in CHANGELOG

### Metrics Tracking

Track these metrics to improve DoD compliance:

1. **Test Coverage** - Target: 90%+ (current: 79.5%)
2. **Test Pass Rate** - Target: 100% (current: 100%)
3. **Build Success Rate** - Target: 100%
4. **Code Review Time** - Target: < 24 hours
5. **Release Frequency** - Track cadence

---

## X. Questions & Clarifications

### Q: Can I skip tests for urgent fixes?

**A: No.** Tests are non-negotiable. For urgent issues:
1. Write a minimal test that fails
2. Fix the code to pass the test
3. This takes 10 minutes and prevents regressions

### Q: What if new code breaks coverage threshold?

**A: Update the code or threshold thoughtfully.**
- If code is necessary, document why coverage is lower
- If code can be improved, do so before commit
- Coverage never decreases

### Q: Can I commit code with console.log() for debugging?

**A: No.** Before committing:
1. Remove console.log()
2. Use proper logger if logging needed
3. Tests should not print to console

### Q: What about legacy code that doesn't meet DoD?

**A: Schedule refactoring work.**
- Document technical debt
- Create issue in backlog
- Refactor incrementally
- New code always meets DoD

---

## XI. Responsibilities

### Developer

- ✅ Understand and follow DoD
- ✅ Complete ALL DoD items before committing
- ✅ Ask questions if DoD is unclear
- ✅ Suggest improvements to DoD

### Code Reviewer

- ✅ Verify DoD checklist completed
- ✅ Request changes if DoD not met
- ✅ Approve only when DoD 100% complete

### Team Lead

- ✅ Communicate DoD to team
- ✅ Enforce DoD consistently
- ✅ Update DoD as standards evolve
- ✅ Support team in achieving DoD

---

## XII. Related Documents

- 📖 [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute
- 🧪 [TEST-NAMING-CONVENTION-GUIDE.md](TEST-NAMING-CONVENTION-GUIDE.md) - Test standards
- 📚 [docs/user-guides/02-TESTING-GUIDE.md](docs/user-guides/02-TESTING-GUIDE.md) - Testing tutorial
- 🏗️ [docs/reference/ARCHITECTURE.md](docs/reference/ARCHITECTURE.md) - System design

---

**Definition of Done Version 1.0**  
**Effective: January 12, 2026**  
**Last Updated: January 12, 2026**

This Definition of Done applies to ALL work on VeraBot2.0. No exceptions.

