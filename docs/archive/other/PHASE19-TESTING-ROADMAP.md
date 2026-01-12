# Next Phase: Testing Remaining 0% Coverage Files

## Overview
Phase 18 successfully added 193 tests across 4 core utility files, achieving 100% coverage on critical modules. This guide outlines the strategy for testing the remaining 25+ files.

## Recommended Testing Order

### Phase 19a: Core Services (HIGH PRIORITY)

#### 1. DatabasePool.js (0% → target 85%+)
**Criticality**: CRITICAL - Core database infrastructure  
**Complexity**: HIGH - Requires connection pooling simulation  
**Tests Needed**: ~30-40 tests

```javascript
// Test structure example:
describe('DatabasePool', () => {
  it('should initialize connection pool');
  it('should acquire connection from pool');
  it('should release connection back to pool');
  it('should handle pool exhaustion gracefully');
  it('should recover from connection errors');
  it('should clean up stale connections');
  it('should support concurrent operations');
  // Edge cases, error scenarios...
});
```

**Mocking Strategy**:
- Mock `better-sqlite3` Database class
- Mock connection state transitions
- Simulate pool capacity limits

#### 2. CacheManager.js (0% → target 85%+)
**Criticality**: HIGH - Performance optimization  
**Complexity**: MEDIUM  
**Tests Needed**: ~25-35 tests

```javascript
describe('CacheManager', () => {
  it('should store and retrieve cached data');
  it('should handle cache expiration');
  it('should respect size limits');
  it('should support different TTL values');
  it('should clear expired entries');
  it('should emit invalidation events');
  // Edge cases, concurrency...
});
```

**Mocking Strategy**:
- Mock timer functions (for TTL)
- Mock event emitters
- Track memory usage

#### 3. ReminderNotificationService.js (0% → target 85%+)
**Criticality**: HIGH - Core reminder feature  
**Complexity**: HIGH - Async/Discord integration  
**Tests Needed**: ~35-45 tests

```javascript
describe('ReminderNotificationService', () => {
  it('should send reminder to Discord user');
  it('should handle user DM failures');
  it('should retry failed notifications');
  it('should respect rate limits');
  it('should handle timezone calculations');
  // Discord mocking, error scenarios...
});
```

**Mocking Strategy**:
- Mock Discord user/channel objects
- Mock DM channel creation
- Mock timer/scheduler functions

### Phase 19b: Middleware (HIGH PRIORITY)

#### 4. logger.js (0% → target 85%+)
**Criticality**: MEDIUM - Logging infrastructure  
**Complexity**: MEDIUM  
**Tests Needed**: ~20-30 tests

```javascript
describe('Logger', () => {
  it('should format log entries');
  it('should write to output stream');
  it('should include timestamps');
  it('should support multiple log levels');
  it('should batch log writes');
  // File system mocking...
});
```

#### 5. commandValidator.js (0% → target 85%+)
**Criticality**: MEDIUM - Command validation  
**Complexity**: MEDIUM  
**Tests Needed**: ~25-35 tests

```javascript
describe('CommandValidator', () => {
  it('should validate command structure');
  it('should check required options');
  it('should enforce option types');
  it('should validate option values');
  // Permission checking, role validation...
});
```

#### 6. dashboard-auth.js (0% → target 85%+)
**Criticality**: HIGH - Security critical  
**Complexity**: HIGH - Auth/session handling  
**Tests Needed**: ~35-45 tests

```javascript
describe('DashboardAuth', () => {
  it('should validate Discord OAuth tokens');
  it('should manage user sessions');
  it('should handle token refresh');
  it('should enforce permission checks');
  it('should prevent token replay attacks');
  // Auth failure scenarios...
});
```

**Mocking Strategy**:
- Mock Discord OAuth endpoints
- Mock JWT token generation/validation
- Mock session store

### Phase 19c: Core Files (MEDIUM PRIORITY)

#### 7. migration.js (0% → target 80%+)
**Criticality**: MEDIUM - Database initialization  
**Complexity**: MEDIUM  
**Tests Needed**: ~20-30 tests

```javascript
describe('Migration', () => {
  it('should detect schema version');
  it('should apply migrations in order');
  it('should handle migration failures');
  it('should rollback on error');
  // Upgrade path testing...
});
```

#### 8. schema-enhancement.js (0% → target 80%+)
**Criticality**: MEDIUM - Database setup  
**Complexity**: MEDIUM  
**Tests Needed**: ~20-30 tests

```javascript
describe('SchemaEnhancement', () => {
  it('should create tables if missing');
  it('should add missing columns');
  it('should create indexes');
  it('should preserve existing data');
  // Idempotency testing...
});
```

#### 9. security.js (0% → target 80%+)
**Criticality**: HIGH - Security utilities  
**Complexity**: MEDIUM  
**Tests Needed**: ~25-35 tests

```javascript
describe('Security', () => {
  it('should encrypt sensitive data');
  it('should decrypt correctly');
  it('should validate signatures');
  it('should prevent injection attacks');
  // Cryptography testing...
});
```

#### 10. datetime-parser.js (0% → target 80%+)
**Criticality**: MEDIUM - Date handling  
**Complexity**: MEDIUM  
**Tests Needed**: ~30-40 tests

```javascript
describe('DateTimeParser', () => {
  it('should parse relative dates (tomorrow, next week)');
  it('should parse absolute dates (2024-01-15)');
  it('should handle timezones');
  it('should validate date ranges');
  // Locale-specific parsing...
});
```

### Phase 19d: Commands & Additional Services (LOWER PRIORITY)

#### 11-20. Service Coverage Expansion
- `GuildAwareCommunicationService.js` (4.28% → 85%+)
- `QuoteService.js` (3.12% → 85%+)
- `PerformanceMonitor.js` (0% → 80%+)
- `MigrationManager.js` (0% → 80%+)
- And other services...

#### 21-30. Command Implementation Tests
- `poem.js` (0% → 80%+)
- `whisper.js` (0% → 80%+)
- `proxy-enable.js`, `proxy-config.js` (0% → 80%+)
- And other commands...

#### 31. Additional Utils
- `QueryBuilder.js` (0% → 90%+)
- `security.js` (0% → 85%+)

## Testing Template

Use this structure for all new test files:

```javascript
/**
 * Phase 19[x]: [Module Name] Comprehensive Coverage
 * Full test coverage for [module].js
 */

describe('[Module Name]', () => {
  const Module = require('../src/path/to/module');

  beforeEach(() => {
    // Setup mocks, fixtures
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup
    jest.restoreAllMocks();
  });

  describe('Method 1', () => {
    it('should handle happy path', () => {
      const result = Module.method1('valid input');
      expect(result).toBeDefined();
    });

    it('should handle error case', () => {
      expect(() => Module.method1(null))
        .toThrow('Expected error message');
    });

    it('should handle edge case', () => {
      // Test boundary conditions
    });
  });

  describe('Integration scenarios', () => {
    it('should work with other modules', () => {
      // Test multiple functions together
    });
  });
});
```

## Mocking Guidelines

### For Discord.js Integration
```javascript
const mockUser = {
  id: 'user-123',
  username: 'TestUser',
  createDM: jest.fn().mockResolvedValue({
    send: jest.fn().mockResolvedValue({}),
  }),
};

const mockInteraction = {
  user: mockUser,
  guildId: 'guild-456',
  reply: jest.fn().mockResolvedValue({}),
  editReply: jest.fn().mockResolvedValue({}),
  followUp: jest.fn().mockResolvedValue({}),
};
```

### For Database Operations
```javascript
const mockDb = {
  exec: jest.fn(),
  prepare: jest.fn(),
  exec: jest.fn(() => [{ id: 1 }]),
};
```

### For Async Operations
```javascript
const mockAsync = jest.fn()
  .mockResolvedValueOnce({ success: true })
  .mockResolvedValueOnce({ success: false })
  .mockRejectedValueOnce(new Error('Failure'));
```

## Coverage Targets by Phase

| Phase | Files | Target Coverage | Est. Tests |
|-------|-------|-----------------|-----------|
| Phase 18 | 4 | 100% | 193 ✅ |
| Phase 19a | 3 | 85%+ | ~100 |
| Phase 19b | 3 | 85%+ | ~90 |
| Phase 19c | 4 | 80%+ | ~100 |
| Phase 19d | 15+ | 80%+ | ~200+ |

## Running Tests

```bash
# Run specific phase
npm test -- tests/phase19a-*.test.js

# Run with coverage
npm run test:coverage

# Check file-specific coverage
npm run test:coverage | grep "DatabasePool\|CacheManager"

# Generate coverage report
npm test -- --coverage
```

## Quality Checklist

Before committing tests for any new file:

- [ ] Test file created BEFORE implementation changes
- [ ] All public methods have tests
- [ ] Happy path covered
- [ ] Error scenarios covered (all error types)
- [ ] Edge cases covered (nulls, empty, boundary values)
- [ ] Async operations tested properly
- [ ] All mocks are clear and consistent
- [ ] Coverage threshold met (85% lines, 80% branches)
- [ ] All tests PASS: `npm test`
- [ ] No ESLint errors: `npm run lint`
- [ ] Coverage maintained/improved

## Documentation

Create a summary like PHASE18-TEST-COVERAGE-SUMMARY.md for each major phase:
- List files covered
- Show before/after coverage
- Highlight key test scenarios
- Include running instructions

## Estimated Timeline

- **Phase 19a (Services)**: 2-3 days (100 tests)
- **Phase 19b (Middleware)**: 1-2 days (90 tests)
- **Phase 19c (Core Files)**: 2-3 days (100 tests)
- **Phase 19d (Commands)**: 3-4 days (200+ tests)

**Total**: ~8-12 days of focused TDD implementation

## Success Metrics

After Phase 19 completion:

- [ ] Global coverage: 85%+ lines, 80%+ branches
- [ ] 0 files at 0% coverage
- [ ] 500+ tests across all phases
- [ ] All tests passing
- [ ] Code quality maintained
- [ ] No new ESLint errors

---

**Ready to proceed with Phase 19?** Start with Phase 19a: Core Services (DatabasePool, CacheManager, ReminderNotificationService).
