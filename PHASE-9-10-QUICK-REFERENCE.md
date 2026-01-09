# Phase 9-10 Test Refactoring Quick Reference

## TL;DR

**What to Do:** Replace Phase 9-10 tests from pure mocking to real service imports

**Pattern:**
```javascript
// BEFORE ❌ (0% coverage)
const sqlite3 = require('sqlite3').verbose();
let testDb = new sqlite3.Database(':memory:');

// AFTER ✅ (real coverage)
const DatabaseService = require('../src/services/DatabaseService');
const sqlite3 = require('sqlite3').verbose();
let testDb = new sqlite3.Database(':memory:');
// Call DatabaseService.function(db, ...)
```

## Files to Refactor

| File | Tests | Current | Target Service | Expected Coverage |
|------|-------|---------|-----------------|-------------------|
| `tests/phase9-database-service.test.js` | 28 | Pure SQLite | DatabaseService | DatabaseService 0%→5% |
| `tests/phase9-quote-service.test.js` | 25 | Mock validation | QuoteService | QuoteService 0%→5% |
| `tests/phase9-reminder-service.test.js` | 22 | Mock operations | GuildAwareReminderService | ReminderService 0%→5% |
| `tests/phase10-middleware.test.js` | 24 | Mock logic | errorHandler, inputValidator | Middleware 0%→3-5% |

## Import Statements to Add

```javascript
// Add these to each test file

// Phase 9A Database Tests
const DatabaseService = require('../src/services/DatabaseService');
const sqlite3 = require('sqlite3').verbose();

// Phase 9B Quote Tests
const QuoteService = require('../src/services/QuoteService');
const DatabaseService = require('../src/services/DatabaseService');

// Phase 9C Reminder Tests
const GuildAwareReminderService = require('../src/services/GuildAwareReminderService');
const DatabaseService = require('../src/services/DatabaseService');

// Phase 10 Middleware Tests
const { logError, ERROR_LEVELS } = require('../src/middleware/errorHandler');
const { validateInput } = require('../src/middleware/inputValidator');
```

## Service Method Patterns

### DatabaseService (Functions, not Class)
```javascript
// Database setup
DatabaseService.initializeDatabase()
DatabaseService.setupSchema(db)
DatabaseService.getDatabase()

// Quote operations
DatabaseService.addQuote(guildId, text, author)
DatabaseService.getAllQuotes(guildId)
DatabaseService.getQuoteById(guildId, id)
DatabaseService.deleteQuote(guildId, id)
```

### QuoteService (Class Constructor)
```javascript
const quoteService = new QuoteService(db);
await quoteService.addQuote(guildId, text, author);
await quoteService.getRandomQuote(guildId);
await quoteService.searchQuotes(guildId, query);
```

### GuildAwareReminderService (Class Constructor)
```javascript
const reminderService = new GuildAwareReminderService(db);
await reminderService.addReminder(guildId, userId, text, dueDate);
await reminderService.getReminderById(guildId, id);
await reminderService.deleteReminder(guildId, id);
```

### Middleware (Functions)
```javascript
logError(module, error, ERROR_LEVELS.CRITICAL);
validateInput(input, rules);
```

## Test Refactoring Steps

1. **Open test file** (e.g., `tests/phase9-database-service.test.js`)

2. **Replace setup with service imports**
   ```javascript
   // Remove: const sqlite3 = require('sqlite3').verbose();
   // Add: const DatabaseService = require('../src/services/DatabaseService');
   ```

3. **Update beforeEach/afterEach**
   ```javascript
   beforeEach(() => {
     testDb = new sqlite3.Database(':memory:');
     // Still use sqlite3 for database creation
   });
   ```

4. **Update test logic**
   - Replace raw SQL with service method calls
   - Keep test descriptions the same
   - Assertions can stay mostly the same

5. **Run tests**
   ```bash
   npm test -- tests/phase9X-refactored.test.js
   ```

6. **Check coverage**
   ```bash
   npm run test:jest:coverage | grep -A 5 "ServiceName"
   ```

## Expected Results

### Before Any Refactoring
```
Test Suites: 1 failed, 1 total (if adding new test)
Tests:       0 passing (before refactoring)
Coverage:    0.52% overall
Phase 9-10:  0% coverage
```

### After Single File Refactored
```
Test Suites: All passing
Tests:       28 passing (if doing database file)
Coverage:    1-5% increase total
Phase 9A:    5% coverage of DatabaseService
```

### After All 99 Tests Refactored
```
Test Suites: All passing
Tests:       1,043 total, 100% pass
Coverage:    20-35% overall (estimated)
Phase 9-10:  Real coverage of services
```

## Common Issues & Fixes

**Issue:** "DatabaseService is not a constructor"
**Fix:** DatabaseService exports functions, not a class. Call `DatabaseService.method()` directly.

**Issue:** "Cannot find module"
**Fix:** Check path - from `tests/` directory, `../src/services/ServiceName.js`

**Issue:** Tests fail after changing imports
**Fix:** Check service API - may need to pass `guildId` or other parameters differently

**Issue:** Coverage doesn't increase
**Fix:** Verify tests actually call the service methods, not just mock them

## Resources

- [PHASE-9-10-TEST-REFACTORING-GUIDE.md](./PHASE-9-10-TEST-REFACTORING-GUIDE.md) - Comprehensive guide
- [.github/copilot-instructions.md](./.github/copilot-instructions.md#import-rules-for-tests-critical) - Import rules
- [tests/phase9a-refactored.test.js](./tests/phase9a-refactored.test.js) - Working example
- [PHASE-11-SESSION-2-SUMMARY.md](./PHASE-11-SESSION-2-SUMMARY.md) - Session summary

## Quick Commands

```bash
# Test one file
npm test -- tests/phase9-database-service.test.js

# Test all Phase 9-10
npm test -- tests/phase9*.test.js tests/phase10*.test.js

# Check coverage
npm run test:jest:coverage

# Run lint
npm run lint

# Commit changes
git add tests/phase9*.test.js tests/phase10*.test.js
git commit -m "Phase 11: Refactor Phase 9-10 tests to use real service imports"
```

## Success Checklist

- [ ] Identified correct service to import
- [ ] Added import statement at top of test file
- [ ] Updated test setup (beforeEach/afterEach)
- [ ] Converted test logic to use service methods
- [ ] Kept test descriptions and count the same
- [ ] All tests pass: `npm test -- tests/phaseX*.test.js`
- [ ] Coverage increased: `npm run test:jest:coverage`
- [ ] ESLint passes: `npm run lint`
- [ ] Committed with proper message

---

**Use this guide when refactoring any Phase 9-10 test file. See PHASE-9-10-TEST-REFACTORING-GUIDE.md for detailed examples.**
