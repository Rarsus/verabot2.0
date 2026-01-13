# Phase 22.7: Advanced Coverage Expansion (60% → 90%)

**Objective**: Achieve 60-90% real command coverage through advanced scenario testing

**Prerequisites**: Phase 22.6b parameter validation tests must be complete

## Strategy

Phase 22.7 focuses on **complex interactions** and **error scenarios** that command implementations must handle:

### Coverage Gaps (22.6 → 22.7)
- **22.6b delivers**: 20-30% coverage (parameter validation)
- **Still missing**: Error paths, edge cases, service integration
- **Target for 22.7**: 60-90% (comprehensive scenario coverage)

## Implementation Areas

### 1. Permission & Authorization Testing (15 tests)
- Admin-only command access control
- Role-based permission checks
- Cross-guild permission isolation
- Permission denial handling

**Example**:
```javascript
it('should reject non-admin user from broadcast command', () => {
  // Test that command validates admin permissions
  // Verify error message when permission denied
});
```

### 2. Error Path Testing (25 tests)
- Database connection failures
- Discord API rate limiting
- Invalid Discord IDs
- Service timeout scenarios
- Graceful fallbacks

**Example**:
```javascript
it('should handle database error when retrieving quotes', () => {
  // Mock DatabaseService to throw error
  // Verify command catches and handles gracefully
  // Verify user gets error message (not crash)
});
```

### 3. Concurrent Operation Testing (20 tests)
- Multiple users executing same command
- Race conditions in database operations
- Concurrent quote/reminder creation
- State consistency with simultaneous modifications

**Example**:
```javascript
it('should handle 10 concurrent quote additions safely', async () => {
  // Execute add-quote 10 times in parallel
  // Verify all 10 quotes saved correctly
  // Verify no race conditions
});
```

### 4. Data Validation & Sanitization (20 tests)
- XSS prevention in user input
- SQL injection prevention (prepared statements)
- Length overflow handling
- Special character handling

**Example**:
```javascript
it('should sanitize quote text containing HTML tags', () => {
  // Verify HTML tags don't execute
  // Verify special chars are escaped
});
```

### 5. Edge Cases & Boundary Conditions (20 tests)
- Empty results handling
- Maximum dataset sizes
- Null/undefined values
- Circular references
- Unicode handling

**Example**:
```javascript
it('should handle 1000+ quotes in search results', () => {
  // Create 1000 test quotes
  // Search returns all without crashing
  // Pagination works correctly
});
```

## Test Implementation Pattern

```javascript
describe('Phase 22.7: Advanced Coverage - Error Scenarios', () => {
  
  describe('error handling', () => {
    beforeEach(() => {
      // Setup mocks for DatabaseService, DiscordService
      jest.spyOn(DatabaseService, 'query').mockRejectedValue(
        new Error('Connection timeout')
      );
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should handle database timeout gracefully', async () => {
      const interaction = createMockInteraction('add-quote', {
        text: 'Test quote',
        author: 'Author',
      });

      const result = await executeCommand(AddQuoteCommand, interaction);
      
      // Verify command caught error
      assert(result.error || !result.success);
      
      // Verify user got error message (via response helper)
      expect(responseHelpers.sendError).toHaveBeenCalledWith(
        interaction,
        expect.stringContaining('error'),
        true
      );
    });
  });

  describe('permission checks', () => {
    it('should reject non-admin from admin-only commands', async () => {
      const interaction = createMockInteraction('broadcast', {});
      // interaction.member.permissions = [] (no admin)

      const result = await executeCommand(BroadcastCommand, interaction);
      
      expect(responseHelpers.sendError).toHaveBeenCalledWith(
        interaction,
        expect.stringContaining('permission'),
        expect.any(Boolean)
      );
    });
  });

  describe('concurrent operations', () => {
    it('should handle 5 parallel quote additions', async () => {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        const interaction = createMockInteraction('add-quote', {
          text: `Quote ${i}`,
          author: 'Author',
        });
        promises.push(executeCommand(AddQuoteCommand, interaction));
      }

      const results = await Promise.all(promises);
      
      // All should succeed
      results.forEach(r => assert(r.success));
      
      // All quotes should be in database
      const quotes = await QuoteService.getAllQuotes('guild-123');
      assert.strictEqual(quotes.length, 5);
    });
  });

  describe('edge cases', () => {
    it('should handle quote text with unicode characters', async () => {
      const unicodeText = '你好世界 🌍 مرحبا العالم';
      const interaction = createMockInteraction('add-quote', {
        text: unicodeText,
        author: 'Author',
      });

      const result = await executeCommand(AddQuoteCommand, interaction);
      assert(result.success);
      
      // Verify quote saved correctly
      const saved = await QuoteService.getQuoteById('guild-123', result.quoteId);
      assert.strictEqual(saved.text, unicodeText);
    });
  });
});
```

## Files to Create

1. **test-commands-error-handling-22.7.test.js** (25 tests)
   - Database errors
   - Discord API errors
   - Service timeouts
   - Graceful error handling

2. **test-commands-permissions-22.7.test.js** (15 tests)
   - Admin permission checks
   - Role-based access
   - Permission denial handling

3. **test-commands-concurrent-22.7.test.js** (20 tests)
   - Parallel executions
   - Race condition handling
   - State consistency

4. **test-commands-validation-22.7.test.js** (20 tests)
   - XSS prevention
   - Input sanitization
   - Special character handling

5. **test-commands-edge-cases-22.7.test.js** (20 tests)
   - Large datasets
   - Empty results
   - Boundary conditions
   - Unicode handling

**Total**: 100 new tests expected

## Test Infrastructure Needed

### Mocking Services
```javascript
// Mock DatabaseService to simulate errors
jest.spyOn(DatabaseService, 'query').mockRejectedValue(new Error('Timeout'));

// Mock DiscordService for API errors
jest.spyOn(DiscordService, 'sendMessage').mockRejectedValue(new Error('Rate limited'));

// Reset mocks between tests
afterEach(() => jest.restoreAllMocks());
```

### Helper Functions
```javascript
// Create interaction with specific permissions
function createAdminInteraction(commandName, options = {}) {
  return {
    user: { id: 'admin-user' },
    member: { permissions: ['ADMINISTRATOR'] },
    guildId: 'guild-123',
    // ... other properties
  };
}

// Create interaction with no permissions
function createUserInteraction(commandName, options = {}) {
  return {
    user: { id: 'regular-user' },
    member: { permissions: [] },
    guildId: 'guild-123',
    // ... other properties
  };
}
```

## Expected Coverage Impact

- **Before 22.7**: 20-30% (basic parameter tests)
- **After 22.7**: 60-90% (error paths, edge cases, permissions)
- **Mechanism**: Error paths, permission checks, edge cases add 50-60% more coverage

## Coverage Targets by Command Type

| Type | Count | Target |
|------|-------|--------|
| Admin | 9 | 70%+ |
| Reminder | 6 | 75%+ |
| Quote | 12 | 80%+ |
| User Pref | 4 | 65%+ |
| Misc | 4 | 60%+ |
| **Total** | **35** | **70%+** |

## Test Execution & Validation

```bash
# Run Phase 22.7 tests only
npm test -- tests/unit/test-commands-error-handling-22.7.test.js \
             tests/unit/test-commands-permissions-22.7.test.js \
             tests/unit/test-commands-concurrent-22.7.test.js \
             tests/unit/test-commands-validation-22.7.test.js \
             tests/unit/test-commands-edge-cases-22.7.test.js

# Full suite validation
npm test

# Coverage measurement
npm test -- --coverage
```

## Success Criteria

- ✅ 100+ new advanced scenario tests
- ✅ All 35+ commands reach 60%+ coverage
- ✅ Error paths fully covered
- ✅ Permission checks verified
- ✅ Concurrent operations safe
- ✅ Edge cases handled
- ✅ 2,400+ total tests passing
- ✅ Execution time <15s

## Timeline Estimate

- **Test creation**: 4-5 hours
- **Service mocking setup**: 1 hour
- **Execution & debugging**: 1-2 hours
- **Coverage validation**: 1 hour
- **Total**: 7-9 hours

## Next Phase (22.8)

Phase 22.8 will focus on:
- Final edge case coverage
- Performance optimization
- Documentation & release notes
- v0.2.0 release preparation
