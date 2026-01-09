# Phase 11 Continuation Guide

> **For developers continuing the Phase 11 test refactoring work**

## Where We Are

**Session 2 Complete:** All setup done, ready for refactoring  
**Current Coverage:** 0.52% (27/5,163 statements)  
**Target Coverage:** 20-35% (1,100-1,800 statements)  
**Work Remaining:** 99 tests to refactor (4 files, ~4-6 hours)

## Quick Start

### 1. Understand the Problem
Read: [PHASE-9-10-MISINTERPRETATION.md](./PHASE-9-10-MISINTERPRETATION.md)

**TL;DR:** Phase 9-10 tests were created to avoid deprecated code by not importing anything. This was wrong. They should import from NEW locations (src/services/*, src/core/*, src/middleware/*) and test real code.

### 2. See the Pattern
Open: [tests/phase9a-refactored.test.js](./tests/phase9a-refactored.test.js)

**What you see:** 10 passing tests that show the correct pattern for importing and testing real services.

### 3. Get Quick Reference
Bookmark: [PHASE-9-10-QUICK-REFERENCE.md](./PHASE-9-10-QUICK-REFERENCE.md)

**What it covers:**
- TL;DR summary
- Files to refactor table
- Import statements for each service
- Service method patterns
- Common issues & fixes
- Quick commands

### 4. Get Detailed Guide  
Read: [PHASE-9-10-TEST-REFACTORING-GUIDE.md](./PHASE-9-10-TEST-REFACTORING-GUIDE.md)

**What it covers:**
- Misinterpretation explanation
- Before/after patterns for each test file
- Detailed changes required
- Refactoring checklist
- Coverage impact table

## The Work

### Phase 9A: Database Tests (28 tests)
**File:** `tests/phase9-database-service.test.js`
**Current:** Pure SQLite mocking (0% coverage)
**Target:** Import DatabaseService functions
**Expected:** DatabaseService.js 0% → 5% coverage

**Steps:**
1. Add import: `const DatabaseService = require('../src/services/DatabaseService');`
2. Replace raw SQL with: `DatabaseService.addQuote(guildId, text, author)`
3. Run: `npm test -- tests/phase9-database-service.test.js`
4. Verify all 28 tests pass

### Phase 9B: Quote Tests (25 tests)
**File:** `tests/phase9-quote-service.test.js`
**Current:** Mock validation only (0% coverage)
**Target:** Import and test QuoteService
**Expected:** QuoteService.js 0% → 5% coverage

**Steps:**
1. Add import: `const QuoteService = require('../src/services/QuoteService');`
2. Create in beforeEach: `const quoteService = new QuoteService(testDb);`
3. Replace mocks with: `const result = await quoteService.addQuote(guildId, text, author);`
4. Run: `npm test -- tests/phase9-quote-service.test.js`
5. Verify all 25 tests pass

### Phase 9C: Reminder Tests (22 tests)
**File:** `tests/phase9-reminder-service.test.js`
**Current:** Mock operations only (0% coverage)
**Target:** Import GuildAwareReminderService
**Expected:** GuildAwareReminderService.js 0% → 5% coverage

**Steps:**
1. Add import: `const GuildAwareReminderService = require('../src/services/GuildAwareReminderService');`
2. Create in beforeEach: `const reminderService = new GuildAwareReminderService(testDb);`
3. Replace mocks with real calls: `const reminder = await reminderService.addReminder(guildId, userId, text, date);`
4. Run: `npm test -- tests/phase9-reminder-service.test.js`
5. Verify all 22 tests pass

### Phase 10: Middleware Tests (24 tests)
**File:** `tests/phase10-middleware.test.js`
**Current:** Mock error/validation logic (0% coverage)
**Target:** Import real errorHandler and inputValidator
**Expected:** Middleware 0% → 3-5% coverage

**Steps:**
1. Add imports: 
   ```javascript
   const { logError, ERROR_LEVELS } = require('../src/middleware/errorHandler');
   const { validateInput } = require('../src/middleware/inputValidator');
   ```
2. Replace mocks with real calls: `logError('module', error, ERROR_LEVELS.CRITICAL);`
3. Replace validation mocks with: `const result = validateInput(input, rules);`
4. Run: `npm test -- tests/phase10-middleware.test.js`
5. Verify all 24 tests pass

## Verification

After refactoring each file:

```bash
# Test single file
npm test -- tests/phaseXX-*.test.js

# Test all Phase 9-10
npm test -- tests/phase9*.test.js tests/phase10*.test.js

# Check coverage
npm run test:jest:coverage

# Check for lint errors
npm run lint

# Expected: All tests passing, coverage increased
```

## Final Verification (After All Refactoring)

```bash
# Run complete test suite
npm test

# Expected: 1,043 tests passing (same as before)
# But coverage should be 0.52% → 20-35%

# Generate coverage report
npm run test:jest:coverage

# Should see coverage like:
# File                        | % Stmts | % Branch | % Funcs | % Lines |
# DatabaseService.js          |     5%  |    3%    |    8%   |    5%   |
# QuoteService.js             |     5%  |    4%    |    7%   |    5%   |
# GuildAwareReminderService   |     5%  |    3%    |    8%   |    5%   |
# errorHandler.js             |     4%  |    2%    |    6%   |    4%   |
# ... (plus existing 0.52%)
# ─────────────────────────────────────────────────────
# All files                   |  20-35% | ...      | ...     | ...     |
```

## Commit

```bash
# Stage all refactored tests
git add tests/phase9*.test.js tests/phase10*.test.js

# Commit with clear message
git commit -m "Phase 11: Refactor Phase 9-10 tests to use real service imports

- Refactored 28 Phase 9A database tests to use DatabaseService
- Refactored 25 Phase 9B quote tests to use QuoteService  
- Refactored 22 Phase 9C reminder tests to use GuildAwareReminderService
- Refactored 24 Phase 10 middleware tests to use real middleware
- Converted 99 fake tests (0% coverage) to real tests (20-35% coverage)
- All 1,043 tests still passing
- Fixed critical misinterpretation of deprecation guidelines

See PHASE-11-SESSION-2-SUMMARY.md for details."

# Push
git push origin phase-11-test-refactoring
```

## Common Issues

**Issue:** Tests fail after refactoring
- **Cause:** Wrong service method name or parameters
- **Fix:** Check [PHASE-9-10-QUICK-REFERENCE.md](./PHASE-9-10-QUICK-REFERENCE.md) service method patterns

**Issue:** Coverage doesn't increase
- **Cause:** Tests not calling real service methods
- **Fix:** Verify you're calling service.method(), not mocking it

**Issue:** Import errors
- **Cause:** Wrong path or module not found
- **Fix:** Check path from tests/ directory: `../src/services/ServiceName.js`

**Issue:** Module is not a constructor
- **Cause:** Trying to `new` a function-based service
- **Fix:** Use `ServiceName.method()` for DatabaseService (it exports functions)

## Resources

| Document | Purpose | Read When |
|----------|---------|-----------|
| [PHASE-9-10-MISINTERPRETATION.md](./PHASE-9-10-MISINTERPRETATION.md) | Explains the problem | You want to understand the background |
| [PHASE-9-10-TEST-REFACTORING-GUIDE.md](./PHASE-9-10-TEST-REFACTORING-GUIDE.md) | Detailed refactoring guide | You're doing the refactoring |
| [PHASE-9-10-QUICK-REFERENCE.md](./PHASE-9-10-QUICK-REFERENCE.md) | Quick lookup | You need fast answers |
| [tests/phase9a-refactored.test.js](./tests/phase9a-refactored.test.js) | Working example | You need to see working code |
| [PHASE-11-SESSION-2-SUMMARY.md](./PHASE-11-SESSION-2-SUMMARY.md) | Session recap | You want overview of what was done |
| [.github/copilot-instructions.md](./.github/copilot-instructions.md#import-rules-for-tests-critical) | Import rules | You need to know what to import |

## Timeline Estimate

- **Phase 9A (Database):** 1-2 hours × 28 tests
- **Phase 9B (Quotes):** 1-2 hours × 25 tests  
- **Phase 9C (Reminders):** 1-2 hours × 22 tests
- **Phase 10 (Middleware):** 1 hour × 24 tests
- **Verification & Commit:** 30 minutes
- **Total:** 4-6 hours for 99 tests

## Success Criteria

✅ All 99 Phase 9-10 tests refactored  
✅ All 1,043 tests passing (100% pass rate)  
✅ Coverage increased from 0.52% to 20-35%  
✅ No tests removed or merged  
✅ All imports from NEW locations  
✅ Clear commit message  
✅ Linting passes  

## Questions?

1. **"What's the difference between Phase 9A, 9B, 9C?"**
   - A = Database operations
   - B = Quote operations  
   - C = Reminder operations
   
2. **"Can I refactor all 4 groups at once?"**
   - Yes, but verify each file individually before moving to next

3. **"What if tests break after refactoring?"**
   - Check service APIs in [PHASE-9-10-QUICK-REFERENCE.md](./PHASE-9-10-QUICK-REFERENCE.md)
   - Verify you're calling methods correctly

4. **"How do I know if coverage increased?"**
   - Run `npm run test:jest:coverage` and look for service module percentages

5. **"Where do I get help?"**
   - See [tests/phase9a-refactored.test.js](./tests/phase9a-refactored.test.js) for working example
   - Check [PHASE-9-10-QUICK-REFERENCE.md](./PHASE-9-10-QUICK-REFERENCE.md) common issues section

---

**Ready to start? Pick Phase 9A, open the QUICK-REFERENCE, and follow the pattern from phase9a-refactored.test.js. You've got this!** 🚀
