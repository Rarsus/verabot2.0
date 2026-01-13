# Phase 2: Guild-Aware Database Testing Strategy

**Date:** January 6, 2026  
**Priority:** HIGH  
**Effort:** 8-12 hours  
**Impact:** Critical for production alignment

---

## Executive Summary

Phase 1 tests successfully validate database operations but use the deprecated root-database API. Phase 2 must add comprehensive guild-aware database tests to align with the production `GuildDatabaseManager` architecture.

---

## Current State

### Phase 1 Test Coverage

- ✅ Root-level database operations (30 tests)
- ✅ Proxy configuration CRUD (12 tests)
- ❌ Guild-aware operations (0 tests)
- ❌ GuildDatabaseManager (0 tests)
- ❌ Guild isolation validation (0 tests)

### Production Architecture

- Guild-specific SQLite databases
- One database file per guild
- On-demand database creation
- Per-guild data isolation
- Connection caching

---

## Phase 2 Test Suite: Guild-Aware Database

### New File: `tests/unit/test-guild-aware-database.js`

**Structure:** 15-20 new tests organized by functionality

### Test Categories

#### 1. GuildDatabaseManager Basic Operations (4 tests)

```javascript
// Test 1: Get database for guild
const db = await GuildDatabaseManager.getDatabase('guild-123');
Assert: Database object returned

// Test 2: Get database creates file
const db = await GuildDatabaseManager.getDatabase('guild-456');
Assert: Database file created in data/guild-456/ directory

// Test 3: Get database caches connection
const db1 = await GuildDatabaseManager.getDatabase('guild-789');
const db2 = await GuildDatabaseManager.getDatabase('guild-789');
Assert: db1 === db2 (same connection object)

// Test 4: Multiple guilds have different connections
const db1 = await GuildDatabaseManager.getDatabase('guild-111');
const db2 = await GuildDatabaseManager.getDatabase('guild-222');
Assert: db1 !== db2 (different connections)
```

#### 2. Guild-Aware Quote Operations (5 tests)

```javascript
// Test 5: Add quote to guild
const quoteId = await addQuote('guild-123', 'Guild quote text', 'Author');
Assert: quoteId is numeric

// Test 6: Get quotes from guild
const quotes = await getAllQuotes('guild-123');
Assert: Array returned with quotes

// Test 7: Data isolation between guilds
await addQuote('guild-111', 'Guild 1 quote', 'Author');
const guild2Quotes = await getAllQuotes('guild-222');
Assert: guild2Quotes is empty (different guild)

// Test 8: Get quote by ID with guild context
const quote = await getQuoteById('guild-123', quoteId);
Assert: Quote matches what was added

// Test 9: Update quote in guild context
await updateQuote('guild-123', quoteId, 'Updated text', 'New author');
const quote = await getQuoteById('guild-123', quoteId);
Assert: Quote contains new text and author
```

#### 3. Guild Data Isolation Validation (4 tests)

```javascript
// Test 10: Different guilds have different quote counts
await addQuote('guild-AAA', 'Quote 1', 'Author');
await addQuote('guild-AAA', 'Quote 2', 'Author');
const count1 = await getQuoteCount('guild-AAA');
const count2 = await getQuoteCount('guild-BBB');
Assert: count1 = 2, count2 = 0

// Test 11: Delete in one guild doesn't affect others
const id1 = await addQuote('guild-X', 'Quote X', 'Author');
const id2 = await addQuote('guild-Y', 'Quote Y', 'Author');
await deleteQuote('guild-X', id1);
const xQuotes = await getAllQuotes('guild-X');
const yQuotes = await getAllQuotes('guild-Y');
Assert: xQuotes empty, yQuotes has 1 quote

// Test 12: Search is guild-scoped
await addQuote('guild-1', 'pizza lovers', 'Chef');
await addQuote('guild-2', 'pizza makers', 'Chef');
const results1 = await searchQuotes('guild-1', 'pizza');
const results2 = await searchQuotes('guild-2', 'pizza');
Assert: results1 has 1, results2 has 1, different quotes

// Test 13: Tags are guild-specific
await addTag('guild-1', 'cooking', 'Cooking stuff');
const tags1 = await getAllTags('guild-1');
const tags2 = await getAllTags('guild-2');
Assert: tags1 has tag, tags2 is empty
```

#### 4. Guild Database File Management (3 tests)

```javascript
// Test 14: Database files created in correct directory
const db = await GuildDatabaseManager.getDatabase('guild-test-123');
Assert: File exists at data/guild-test-123/quotes.db

// Test 15: Close guild database
const db = await GuildDatabaseManager.getDatabase('guild-cleanup');
await GuildDatabaseManager.closeDatabase('guild-cleanup');
Assert: Connection closed, cache cleared

// Test 16: Reopen guild database after close
await GuildDatabaseManager.closeDatabase('guild-reopen');
const db1 = await GuildDatabaseManager.getDatabase('guild-reopen');
const db2 = await GuildDatabaseManager.getDatabase('guild-reopen');
Assert: New connection created, then cached
```

#### 5. Error Handling & Edge Cases (2-3 tests)

```javascript
// Test 17: Invalid guild ID handling
try {
  await GuildDatabaseManager.getDatabase(null);
  Assert: Should throw error
} catch (err) {
  Assert: Error message is clear
}

// Test 18: Concurrent access to same guild
const promises = [];
for (let i = 0; i < 5; i++) {
  promises.push(
    addQuote('guild-concurrent', `Quote ${i}`, 'Author')
  );
}
const results = await Promise.all(promises);
Assert: All succeed, no race conditions

// Test 19: Large data sets per guild
for (let i = 0; i < 100; i++) {
  await addQuote('guild-large', `Quote ${i}`, 'Author');
}
const count = await getQuoteCount('guild-large');
Assert: count = 100
```

---

## Implementation Notes

### Setup Requirements

```javascript
const GuildDatabaseManager = require('../../src/services/GuildDatabaseManager');
const {
  addQuote,
  getAllQuotes,
  getQuoteById,
  searchQuotes,
  updateQuote,
  deleteQuote,
  getQuoteCount,
  addTag,
  getAllTags,
} = require('../../src/services/GuildAwareDatabaseService');
```

### Important Patterns

1. **Always pass guildId as first parameter**

   ```javascript
   // ✅ CORRECT
   await addQuote('guild-123', 'text', 'author');

   // ❌ WRONG
   await addQuote('text', 'author');
   ```

2. **Cleanup between tests**

   ```javascript
   afterEach(async () => {
     // Clean up guild databases to avoid test pollution
     await GuildDatabaseManager.closeDatabase(testGuildId);
   });
   ```

3. **Use unique guild IDs**

   ```javascript
   const guildId = `test-guild-${Date.now()}-${Math.random()}`;
   ```

4. **Verify isolation**
   ```javascript
   // Always test that one guild's data doesn't appear in another
   const guild1Data = await getAllQuotes('guild-1');
   const guild2Data = await getAllQuotes('guild-2');
   Assert: guild1Data !== guild2Data;
   ```

---

## Expected Coverage Improvements

### Before Phase 2

- DatabaseService.js: 81.63% lines
- GuildDatabaseManager: 0% (untested)
- Guild-aware operations: 0% (untested)

### After Phase 2

- DatabaseService.js: 90%+ lines (complete legacy coverage)
- GuildDatabaseManager: 85%+ (complete new API coverage)
- Guild-aware operations: 100% (comprehensive testing)

### Test Count

- Current: 30 database tests + 12 proxy config tests
- Phase 2 adds: 15-20 guild-aware tests
- Total: 57-62 database-related tests

---

## Phase 2 Integration

### Timeline

- **Weeks 1-2:** Implement guild-aware database tests (8-12 hours)
- **Week 2:** Add ReminderService.js tests (5-7 hours)
- **Week 2-3:** Add errorHandler.js tests (7-10 hours)
- **Week 3:** Integration tests and final coverage (5-7 hours)

### Total Phase 2 Effort

- Guild-aware tests: 12 hours
- Other Phase 2 modules: 17-24 hours
- **Total: 29-36 hours (3.5-4.5 days)**

### Coverage Target for Phase 2

- Overall: 75%+ (from current 70.33%)
- Database modules: 90%+ (guild-aware + root)
- Service modules: 85%+ average

---

## Deprecation Management

### Timeline

- **Current:** Jan 2026 - Root database DEPRECATED
- **Phase 2:** Add guild-aware tests (validates new API)
- **v0.3.0:** March 2026 - Remove root database API

### Deliverables

1. Guild-aware test suite (15-20 tests)
2. Migration guide for existing code
3. Deprecation timeline documentation
4. Clear examples of new guild-aware API

---

## Success Criteria

✅ Guild-aware database operations tested  
✅ Guild isolation validated  
✅ GuildDatabaseManager fully covered  
✅ Multi-guild scenarios tested  
✅ Connection caching verified  
✅ Error scenarios covered  
✅ Overall coverage 75%+  
✅ All tests passing  
✅ No deprecation warnings in new tests

---

## Risk Mitigation

### Risk: Breaking existing code using deprecated API

**Mitigation:** Phase 2 tests validate new API before deprecating old API

### Risk: Guild isolation bugs

**Mitigation:** Explicit isolation tests with multiple guilds per test

### Risk: Connection cache issues

**Mitigation:** Test connection reuse and cleanup patterns

### Risk: Performance regression

**Mitigation:** Test with large datasets (100+ quotes per guild)

---

## Recommendation

**PROCEED WITH PHASE 2 GUILD-AWARE TESTS**

This is critical for:

1. Validating production architecture
2. Ensuring guild isolation works correctly
3. Before removing deprecated API
4. Achieving 75%+ overall coverage target
5. Preventing production issues with multi-guild data

---

**Priority:** HIGH  
**Effort:** 8-12 hours  
**Impact:** CRITICAL for production alignment  
**Timeline:** Weeks 1-2 of Phase 2
