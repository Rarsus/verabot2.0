# Phase 9-10 Test Refactoring Guide

## Overview

Phase 9-10 tests were created using pure mocking to avoid deprecated code. However, the deprecation instruction meant "import from NEW locations, not deprecated ones" - NOT "avoid importing entirely."

This guide explains how to refactor the 99 Phase 9-10 tests to test real service implementations while maintaining the same test count and structure.

## Key Principle

**Before (Wrong):**
```javascript
// Avoided importing to prevent deprecated imports
const sqlite3 = require('sqlite3');
const testDb = new sqlite3.Database(':memory:');
// Tests never execute real DatabaseService code
```

**After (Correct):**
```javascript
// Import from NEW locations (not deprecated ones)
const DatabaseService = require('../../../src/services/DatabaseService');
const testDb = new DatabaseService(':memory:');
// Tests now execute real DatabaseService code
```

## Files to Refactor

### Phase 9A: Database Tests
**File:** `tests/phase9-database-service.test.js`
- Current: 28 tests using pure `sqlite3` mocking
- Change: Import `DatabaseService` from `src/services/DatabaseService`
- Expected: 0% → 5% coverage of DatabaseService

**Changes Required:**
```javascript
// ❌ BEFORE
const sqlite3 = require('sqlite3').verbose();
let testDb = new sqlite3.Database(':memory:');

// ✅ AFTER
const DatabaseService = require('../../../src/services/DatabaseService');
let testDb = new DatabaseService(':memory:');
```

**Test Structure Preservation:**
- Keep all 28 test descriptions
- Maintain test organization (5 tests per section)
- Update test logic to call DatabaseService methods instead of raw SQL
- Keep assertions the same (just testing different implementation)

### Phase 9B: Quote Tests
**File:** `tests/phase9-quote-service.test.js`
- Current: 25 tests mocking validation only
- Change: Import `QuoteService` from `src/services/QuoteService`
- Expected: 0% → 5% coverage of QuoteService

**Changes Required:**
```javascript
// ❌ BEFORE
const QuoteService = require('../../../src/services/QuoteService');
const mockDb = { /* mock database */ };
const quoteService = new QuoteService(mockDb);

// ✅ AFTER
const DatabaseService = require('../../../src/services/DatabaseService');
const QuoteService = require('../../../src/services/QuoteService');
let testDb;
let quoteService;

beforeEach(async () => {
  testDb = new DatabaseService(':memory:');
  await testDb.initialize();
  quoteService = new QuoteService(testDb);
});
```

### Phase 9C: Reminder Tests
**File:** `tests/phase9-reminder-service.test.js`
- Current: 22 tests with mock operations
- Change: Import `GuildAwareReminderService` from `src/services/GuildAwareReminderService`
- Expected: 0% → 5% coverage of GuildAwareReminderService

**Changes Required:**
```javascript
// ❌ BEFORE
const mockReminder = { /* mock object */ };
// Tests never create real reminders

// ✅ AFTER
const GuildAwareReminderService = require('../../../src/services/GuildAwareReminderService');
const reminderService = new GuildAwareReminderService(testDb);
const reminder = await reminderService.addReminder(guildId, userId, text, dueDate);
// Tests now execute real reminder operations
```

### Phase 10: Middleware Tests
**File:** `tests/phase10-middleware.test.js`
- Current: 24 tests (10 error, 8 validation, 6 response)
- Change: Import actual `errorHandler` and `inputValidator`
- Expected: 0% → 3-5% coverage of middleware

**Changes Required:**
```javascript
// ❌ BEFORE
const mockError = new Error('test');
// Tests verify mock behavior

// ✅ AFTER
const { logError, ERROR_LEVELS } = require('../../../src/middleware/errorHandler');
const { validateInput } = require('../../../src/middleware/inputValidator');
logError('test.module', error, ERROR_LEVELS.CRITICAL);
// Tests verify actual middleware behavior
```

## Refactoring Checklist

For each test file:

- [ ] Identify imports needed (DatabaseService, service classes, middleware)
- [ ] Replace mock initialization with real service creation
- [ ] Update setup methods (beforeEach) to initialize real services
- [ ] Update test logic to call real methods instead of mocks
- [ ] Keep test descriptions the same
- [ ] Keep test count the same
- [ ] Update assertions to match real behavior (not mock expectations)
- [ ] Run `npm test` to verify tests still pass
- [ ] Check `npm run test:jest:coverage` for coverage increase
- [ ] Commit changes with message explaining refactor

## Coverage Impact Per File

| File | Tests | Before | After | Target |
|------|-------|--------|-------|--------|
| phase9-database-service.test.js | 28 | 0% | 5% | DatabaseService |
| phase9-quote-service.test.js | 25 | 0% | 5% | QuoteService |
| phase9-reminder-service.test.js | 22 | 0% | 5% | GuildAwareReminderService |
| phase10-middleware.test.js | 24 | 0% | 3-5% | errorHandler, inputValidator |
| **TOTAL** | **99** | **0%** | **5-15%** | Multiple services |

## Expected Final State

**Before Refactoring:**
- 1,043 tests total
- 0.52% coverage (27/5,163 statements)
- Only 4 modules with coverage
- 99 Phase 9-10 tests are purely fake

**After Refactoring:**
- 1,043 tests total (same count!)
- 20-35% coverage (estimated)
- 10+ modules with coverage
- 99 Phase 9-10 tests test real code

## Critical Notes

⚠️ **IMPORTANT:** These refactorings are NOT about changing what tests do - they're about changing WHAT CODE IS TESTED.

- Same test count before and after
- Same test structure and organization
- Same test names (mostly)
- **Different implementation** (real services vs mocks)
- **Much higher coverage** (actual code execution vs mock verification)

## Why This Matters

This refactoring demonstrates the correct interpretation of the deprecation guidelines:

✅ **Correct:** "Import from NEW locations, test real implementations"
❌ **Wrong:** "Avoid importing to avoid deprecated code"

The 99 Phase 9-10 tests represent the first opportunity to apply this correction at scale. Success here establishes the pattern for all future test development.

## Next Steps

1. Start with Phase 9A (database tests) - most straightforward
2. Follow with Phase 9B (quote tests) - depends on database
3. Then Phase 9C (reminder tests) - depends on database
4. Finally Phase 10 (middleware tests) - independent
5. Verify coverage improvement: 0.52% → 20-35%
6. Establish pattern for Phase 11+ development

## Resources

- [Deprecation Guidelines](../.github/copilot-instructions.md#deprecation-notes--testing-requirements)
- [Import Rules for Tests](../.github/copilot-instructions.md#import-rules-for-tests-critical)
- [DatabaseService API](../src/services/DatabaseService.js)
- [QuoteService API](../src/services/QuoteService.js)
- [GuildAwareReminderService API](../src/services/GuildAwareReminderService.js)
- [Middleware](../src/middleware/)
