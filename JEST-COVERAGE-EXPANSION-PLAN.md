# Jest Coverage Expansion Plan - Phase 9+

**Date**: January 7, 2026  
**Status**: In Progress  
**Goal**: Increase coverage from 0.54% to 90%+ while excluding all deprecated code

---

## Current State

### Coverage Baseline
- **Statements**: 0.54% (27/5163)
- **Functions**: 0.33% (3/885)
- **Branches**: 0.06% (2/2871)
- **Lines**: 0.54% (27/4950)
- **Passing Tests**: 892/944 (100% pass rate)

### Modules to Skip (Deprecated)
- ❌ `src/utils/command-base.js` - Use `src/core/CommandBase.js`
- ❌ `src/utils/command-options.js` - Use `src/core/CommandOptions.js`
- ❌ `src/utils/response-helpers.js` - Use `src/utils/helpers/response-helpers.js`
- ❌ `src/db.js` - Use guild-aware services instead

---

## Test Priority Framework

### Tier 1: Critical Foundation (Must Have)
These modules are essential to all operations.

| Module | Lines | Current | Target | Tests | Priority |
|--------|-------|---------|--------|-------|----------|
| DatabaseService.js | 820 | 0% | 85% | 25-30 | 🔴 CRITICAL |
| QuoteService.js | 272 | 0% | 90% | 20-25 | 🔴 CRITICAL |
| ReminderService.js | 671 | 0% | 85% | 20-25 | 🔴 CRITICAL |
| GuildAwareReminderService.js | 325 | 0% | 90% | 15-20 | 🔴 CRITICAL |
| GuildAwareDatabaseService.js | 491 | 0% | 85% | 20-25 | 🔴 CRITICAL |
| GuildDatabaseManager.js | 446 | 12.38% | 85% | 15-20 | 🟠 HIGH |

### Tier 2: Core Middleware & Utilities (Important)
These handle cross-cutting concerns.

| Module | Lines | Current | Target | Tests | Priority |
|--------|-------|---------|--------|-------|----------|
| errorHandler.js | 152 | 4.25% | 90% | 20-25 | 🟠 HIGH |
| RolePermissionService.js | 412 | 6.45% | 85% | 15-20 | 🟠 HIGH |
| CommandBase.js | 144 | 5.88% | 85% | 15-20 | 🟠 HIGH |
| inputValidator.js | 275 | 0% | 80% | 15-20 | 🟠 HIGH |
| response-helpers.js | 211 | 0% | 85% | 15-20 | 🟠 HIGH |

### Tier 3: Services & Features (Important)
These provide optional/advanced functionality.

| Module | Lines | Current | Target | Tests | Priority |
|--------|-------|---------|--------|-------|----------|
| CacheManager.js | 247 | 0% | 80% | 12-15 | 🟡 MEDIUM |
| PerformanceMonitor.js | 320 | 0% | 75% | 12-15 | 🟡 MEDIUM |
| WebSocketService.js | 377 | 0% | 75% | 12-15 | 🟡 MEDIUM |
| CommunicationService.js | 126 | 0% | 85% | 10-15 | 🟡 MEDIUM |
| MigrationManager.js | 200 | 0% | 80% | 10-15 | 🟡 MEDIUM |

### Tier 4: Command Categories (Important)
Test all command categories systematically.

| Category | Commands | Coverage | Target | Tests |
|----------|----------|----------|--------|-------|
| quote-management | 5 commands | 0% | 80% | 25-30 |
| quote-discovery | 3 commands | 0% | 80% | 20-25 |
| quote-social | 2 commands | 0% | 75% | 15-20 |
| reminder-management | 6 commands | 0% | 80% | 25-30 |
| user-preferences | 3 commands | 0% | 75% | 12-15 |
| misc | 4 commands | 0% | 75% | 15-20 |

### Tier 5: Advanced Services (Nice to Have)
These provide specialized functionality.

| Module | Lines | Current | Target | Tests | Priority |
|--------|-------|---------|--------|-------|----------|
| ProxyConfigService.js | 249 | 0% | 70% | 10-12 | 🔵 LOW |
| WebhookListenerService.js | 228 | 0% | 70% | 10-12 | 🔵 LOW |
| ExternalActionHandler.js | 256 | 0% | 70% | 10-12 | 🔵 LOW |
| ValidationService.js | 73 | 0% | 80% | 8-10 | 🔵 LOW |

---

## Test Suite Organization

### New Test Files to Create

**Phase 9: Critical Services (Weeks 1-2)**
- `tests/phase9-database-service.test.js` (25-30 tests)
- `tests/phase9-guild-database-service.test.js` (20-25 tests)
- `tests/phase9-guild-database-manager.test.js` (15-20 tests)
- `tests/phase9-quote-service.test.js` (20-25 tests)
- `tests/phase9-reminder-service.test.js` (20-25 tests)
- `tests/phase9-guild-aware-reminder-service.test.js` (15-20 tests)

**Phase 10: Middleware & Utilities (Weeks 3-4)**
- `tests/phase10-error-handler.test.js` (20-25 tests)
- `tests/phase10-role-permission-service.test.js` (15-20 tests)
- `tests/phase10-input-validator.test.js` (15-20 tests)
- `tests/phase10-response-helpers.test.js` (15-20 tests)

**Phase 11: Services & Features (Weeks 5-6)**
- `tests/phase11-cache-manager.test.js` (12-15 tests)
- `tests/phase11-performance-monitor.test.js` (12-15 tests)
- `tests/phase11-communication-service.test.js` (10-15 tests)

**Phase 12: Commands (Weeks 7-8)**
- `tests/phase12-quote-management-commands.test.js` (25-30 tests)
- `tests/phase12-quote-discovery-commands.test.js` (20-25 tests)
- `tests/phase12-reminder-commands.test.js` (25-30 tests)

---

## Test Framework Standards

### Required Pattern for All Tests

```javascript
/**
 * Phase X: Module Name Tests
 * Tests: X tests covering Y% of code
 * Expected coverage: Current% → Target%
 */

const assert = require('assert');
const ModuleUnderTest = require('../../src/path/to/module');

describe('Module Name', () => {
  let testData;
  let mockDependencies;

  beforeEach(() => {
    // Setup test fixtures
  });

  afterEach(() => {
    // Cleanup resources
  });

  describe('Happy Path', () => {
    // Tests for normal operation
  });

  describe('Error Handling', () => {
    // Tests for all error scenarios
  });

  describe('Edge Cases', () => {
    // Tests for boundary conditions
  });

  describe('Integration', () => {
    // Tests for interaction with other modules
  });
});
```

### Minimum Coverage Requirements

| Module Type | Lines | Functions | Branches | Tests |
|-------------|-------|-----------|----------|-------|
| Core Services | 85%+ | 90%+ | 80%+ | 25-30 |
| Utilities | 90%+ | 95%+ | 85%+ | 15-25 |
| Middleware | 95%+ | 100% | 90%+ | 20-25 |
| Commands | 80%+ | 85%+ | 75%+ | 20-30 |

---

## Exclusions (Do NOT Test)

### Deprecated Modules
- ❌ `src/utils/command-base.js`
- ❌ `src/utils/command-options.js`
- ❌ `src/utils/response-helpers.js`
- ❌ `src/db.js` (already removed)

### External Dependencies
- ❌ `discord.js` library internals
- ❌ Third-party library internals
- ❌ Environment-specific code (process.env in tests - use mocks)

### Already Tested (Verified Coverage)
- ✅ `src/core/CommandBase.js` - Tested in phase 5c
- ✅ `src/core/CommandOptions.js` - Tested in phase 4
- ✅ `src/types/index.js` - 100% coverage
- ✅ `src/utils/constants.js` - 100% coverage

---

## Testing Strategy by Module Type

### Database Services

**Key Challenges**: 
- Mock SQLite connections
- Test transaction rollback
- Test concurrent operations
- Test guild isolation

**Key Patterns**:
```javascript
// Mock in-memory database
let db;
beforeEach(() => {
  db = new sqlite3.Database(':memory:');
});

// Test guild isolation
it('should not return quotes from different guild', () => {
  // Add quote to guild A
  // Query guild B
  // Assert empty result
});

// Test transactions
it('should rollback on error', async () => {
  // Start transaction
  // Add data
  // Throw error
  // Verify rollback
});
```

### Command Tests

**Key Challenges**:
- Mock Discord interactions
- Mock database services
- Mock external APIs
- Test permission checking

**Key Patterns**:
```javascript
// Mock interaction
const mockInteraction = {
  user: { id: 'user-123', username: 'Test' },
  guildId: 'guild-456',
  reply: jest.fn(),
  deferReply: jest.fn(),
  // ... other properties
};

// Mock services
const mockQuoteService = {
  addQuote: jest.fn().mockResolvedValue({ id: 1 }),
  // ... other methods
};

// Test permission error
it('should reject if user lacks permissions', () => {
  mockInteraction.member = { permissions: { has: jest.fn().mockReturnValue(false) } };
  // Assert rejection
});
```

### Service Tests

**Key Challenges**:
- Mock dependencies
- Test state management
- Test cache behavior
- Test error recovery

**Key Patterns**:
```javascript
// Test cache hit
it('should return cached value on second call', () => {
  service.get(key); // Cache miss, calls DB
  service.get(key); // Cache hit, doesn't call DB
  // Verify DB called once
});

// Test state cleanup
it('should cleanup resources on shutdown', () => {
  service.start();
  service.shutdown();
  // Assert no lingering connections
});
```

---

## Success Criteria

### Coverage Targets
- ✅ Statements: 20% → 90%+
- ✅ Functions: 20% → 95%+
- ✅ Branches: 15% → 85%+
- ✅ Lines: 20% → 90%+

### Test Quality
- ✅ 100% test pass rate
- ✅ 0 async leak warnings
- ✅ < 30 ESLint warnings
- ✅ All error paths tested
- ✅ All edge cases covered

### Code Quality
- ✅ No deprecated code tested
- ✅ No force skips (describe.skip)
- ✅ Proper mocking for all dependencies
- ✅ Clear test organization
- ✅ Descriptive test names

---

## Implementation Timeline

| Phase | Week | Focus | Tests | Coverage |
|-------|------|-------|-------|----------|
| 9 | 1-2 | Critical Services | 120+ | 15-20% |
| 10 | 3-4 | Middleware & Utils | 80+ | 25-35% |
| 11 | 5-6 | Services & Features | 50+ | 40-50% |
| 12 | 7-8 | Commands | 150+ | 60-70% |
| 13 | 9-10 | Advanced & Polish | 100+ | 75-85% |
| Final | 11-12 | Coverage Optimization | 50+ | 90%+ |

---

## Notes

- Each phase builds on previous phases
- Maintain 100% test pass rate throughout
- No breaking changes to existing tests
- Test coverage grows incrementally
- Each new test follows established patterns
