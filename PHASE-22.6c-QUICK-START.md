# Phase 22.6c Quick Start Guide - Service Mocking & Error Path Tests

**Phase Status**: Ready to Start  
**Estimated Duration**: 4-5 hours  
**Target Tests**: 40-50 new tests  
**Coverage Expansion**: 20-25% → 45%

## Overview

Phase 22.6c will add **service mocking tests** that exercise error paths and failure scenarios by mocking external service dependencies (database, Discord API, etc.). Unlike Phase 22.6b (parameter validation) which tested option definitions, Phase 22.6c will test actual command execution paths when services fail.

## Strategy

### Service Dependencies to Mock

1. **QuoteService** - Quote database operations
   - Add quote failures (duplicate, validation, DB error)
   - Get quote failures (not found, DB error)
   - Delete quote failures (cascade issues, permissions)
   - Search failures (invalid query, DB timeout)

2. **ReminderService** - Reminder operations
   - Create reminder failures (schedule conflict, validation)
   - Get/Update failures (not found, permission denied)
   - Delete failures (active reminder conflict)
   - Search failures (invalid filter, timeout)

3. **Discord.js API** - Discord interactions
   - Reply failures (no permission, channel deleted)
   - Defer failures (interaction already responded)
   - Edit reply failures (message deleted, permissions)
   - DM failures (user blocked, invalid user)

4. **Communication Service** - Preference handling
   - Opt-in/out failures (validation, permissions)
   - Status check failures (user not found, privacy)

### Test File Structure

```javascript
// tests/unit/utils/test-commands-service-mocking-[category]-22.6c.test.js

describe('Phase 22.6c: [Category] Command Service Mocking', () => {
  // Setup mock services
  let mockQuoteService;
  let mockInteraction;
  
  beforeEach(() => {
    // Mock the service
    jest.mock('../../services/QuoteService', () => ({
      getQuoteById: jest.fn(),
      addQuote: jest.fn(),
    }));
    
    // Create mock interaction
    mockInteraction = {
      user: { id: 'user-123' },
      guildId: 'guild-456',
      deferReply: jest.fn().mockResolvedValue({}),
      editReply: jest.fn().mockResolvedValue({}),
    };
  });
  
  describe('quote commands error handling', () => {
    it('should handle quote not found error gracefully', async () => {
      // Setup: Mock service throws NotFoundError
      mockQuoteService.getQuoteById.mockRejectedValue(new Error('Quote not found'));
      
      // Execute: Run command with error scenario
      // Assert: Verify error response sent to user
    });
  });
});
```

## Files to Create (Proposed)

### 1. test-commands-service-mocking-quote-22.6c.test.js (20-25 tests)

**Commands**: add-quote, delete-quote, update-quote, list-quotes, quote, search-quotes, rate-quote, tag-quote, export-quotes

**Error Scenarios**:
- Database connection failure
- Quote not found (get/delete/update)
- Duplicate quote (add)
- Validation failure (text too short, rating invalid)
- Permission denied (admin operations)
- Timeout (slow database query)
- Concurrent modification (race condition)

**Test Pattern**:
```javascript
it('should handle quote not found when getting quote', async () => {
  const mockQuoteService = {
    getQuoteById: jest.fn().mockRejectedValue(new Error('Quote not found'))
  };
  
  const interaction = createMockInteraction({ options: { getInteger: () => 42 } });
  
  // Call actual command or CommandExecutor
  // Verify: sendError called with appropriate message
  // Verify: User gets helpful error feedback
});
```

### 2. test-commands-service-mocking-reminder-22.6c.test.js (15-20 tests)

**Commands**: create-reminder, delete-reminder, get-reminder, list-reminders, search-reminders, update-reminder

**Error Scenarios**:
- Reminder not found (get/delete/update)
- Schedule conflict (overlapping reminders)
- Invalid date/time parsing
- Permission denied (can't set reminder for another user)
- Database timeout
- Scheduling service unavailable
- Invalid category (doesn't exist)

### 3. test-commands-service-mocking-admin-22.6c.test.js (10-15 tests)

**Commands**: broadcast, say, whisper, proxy-config, etc.

**Error Scenarios**:
- No permission to send message (broadcast)
- Channel/user not found (say, whisper)
- Invalid URL (proxy config)
- Proxy server unreachable
- Message too long (Discord limit)
- Rate limited (too many messages)

### 4. test-commands-service-mocking-user-pref-22.6c.test.js (5-10 tests)

**Commands**: opt-in, opt-out, opt-in-request, comm-status

**Error Scenarios**:
- User not found
- Invalid preference type
- Communication service unavailable
- Permission denied (can't check other user preferences)

### 5. test-commands-service-mocking-misc-22.6c.test.js (5 tests)

**Commands**: help, ping, poem, hi

**Error Scenarios**:
- HuggingFace API timeout (poem)
- Invalid API response format
- Service degradation (slow response)

## Implementation Approach

### Step 1: Import Mocking Utilities

```javascript
const assert = require('assert');
jest.mock('../../services/QuoteService');
jest.mock('../../services/ReminderService');
jest.mock('../../utils/helpers/response-helpers');

const QuoteService = require('../../services/QuoteService');
const { sendError, sendSuccess } = require('../../utils/helpers/response-helpers');
```

### Step 2: Create Mock Interaction Factory

```javascript
const createMockInteraction = (options = {}) => ({
  user: { id: 'user-123', username: 'TestUser' },
  guildId: 'guild-456',
  channelId: 'channel-789',
  options: {
    getInteger: jest.fn().mockReturnValue(options.id || 1),
    getString: jest.fn().mockReturnValue(options.text || ''),
    getUser: jest.fn().mockReturnValue({ id: 'user-id' }),
    ...options.customOptions,
  },
  deferReply: jest.fn().mockResolvedValue({}),
  editReply: jest.fn().mockResolvedValue({ id: 'msg-123' }),
  followUp: jest.fn().mockResolvedValue({ id: 'msg-456' }),
  ...options.customMethods,
});
```

### Step 3: Test Service Failure Scenarios

```javascript
describe('quote commands error handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle database error when adding quote', async () => {
    // Setup mock to reject
    QuoteService.addQuote.mockRejectedValue(
      new Error('Database connection lost')
    );
    
    const interaction = createMockInteraction({
      text: 'Test quote',
      author: 'Test Author'
    });
    
    // Execute command
    // const command = require('../../commands/quote-management/add-quote');
    // await command.executeInteraction(interaction);
    
    // Assert error response
    expect(sendError).toHaveBeenCalledWith(
      interaction,
      expect.stringContaining('Database'),
      true
    );
  });
});
```

## Expected Test Coverage

### Coverage by Service

| Service | Errors | Tests |
|---------|--------|-------|
| QuoteService | 8 | 12 |
| ReminderService | 7 | 10 |
| Discord API | 6 | 8 |
| Communication | 4 | 5 |
| External (HF) | 2 | 3 |
| **Total** | **27** | **40-50** |

### Error Scenarios Per Category

**Connection Errors** (5 tests)
- Database connection failure
- API timeout
- Network unreachable
- Service unavailable
- Slow response (graceful degradation)

**Permission Errors** (8 tests)
- Insufficient permissions
- Can't DM user (blocked)
- Can't send to channel (deleted)
- Can't modify reminder (not owner)
- Can't view preferences (privacy)
- Role check failures
- Guild permission check

**Validation Errors** (10 tests)
- Invalid date/time format
- Duplicate entry
- Invalid enum value
- Missing required field
- Constraint violation
- Rate limit exceeded
- Quota exceeded
- Data too large
- Invalid format
- Business rule violation

**Conflict/State Errors** (8 tests)
- Not found (quote, reminder, user)
- Already exists (duplicate)
- State mismatch (concurrent modification)
- Schedule conflict
- Cascade constraints
- Orphaned records
- Partial failure (batch operation)

**Response Errors** (5 tests)
- Message already responded
- Invalid response type
- Response timeout
- Interaction expired
- Follow-up failed

## Coverage Progression

```
Phase 22.6a: 2,329 tests (response helper foundation)
Phase 22.6b: 2,499 tests (parameter validation, +170)
Phase 22.6c: 2,540-2,549 tests (service mocking, +40-50) ← TARGET
```

## Success Criteria

- ✅ 40-50 new service mocking tests
- ✅ All tests passing (100%)
- ✅ Coverage: 20-25% → 45%
- ✅ Execution time: <15 seconds
- ✅ All error paths covered
- ✅ Consistent error handling patterns

## Key Patterns to Test

### Pattern 1: Service Error Response

```javascript
it('should catch service error and send user-friendly message', async () => {
  Service.method.mockRejectedValue(new Error('DB Error'));
  
  // Execute command
  // Verify sendError called with user-friendly message
  // Verify error logged internally
  // Verify interaction properly concluded
});
```

### Pattern 2: Permission Check

```javascript
it('should deny access when user lacks permission', async () => {
  // Create interaction with insufficient permissions
  interaction.user.permissions = ['SEND_MESSAGES']; // Missing ADMIN
  
  // Execute command
  // Verify permission denied error sent
  // Verify audit log created
});
```

### Pattern 3: Resource Not Found

```javascript
it('should handle not found gracefully', async () => {
  Service.getById.mockResolvedValue(null);
  
  // Execute with ID that doesn't exist
  // Verify helpful "not found" message sent
  // Verify suggestion to try listing all resources
});
```

### Pattern 4: Timeout Handling

```javascript
it('should handle operation timeout', async () => {
  Service.slowOperation.mockImplementation(
    () => new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 100)
    )
  );
  
  // Execute command
  // Verify timeout message sent
  // Verify interaction properly completed
});
```

## Commands Status

### Quote Commands (9 total)
- [ ] add-quote: DB error, validation, duplicate
- [ ] delete-quote: Not found, permission, cascade
- [ ] update-quote: Not found, validation, permission
- [ ] list-quotes: DB error, timeout, empty result
- [ ] quote: Not found, permission, timeout
- [ ] search-quotes: Invalid search, DB error, timeout
- [ ] rate-quote: Not found, permission, validation
- [ ] tag-quote: Not found, permission, validation
- [ ] export-quotes: DB error, format error, permission

### Reminder Commands (6 total)
- [ ] create-reminder: Schedule conflict, validation, DB error
- [ ] delete-reminder: Not found, permission, cascade
- [ ] get-reminder: Not found, permission, timeout
- [ ] list-reminders: DB error, timeout, filter error
- [ ] search-reminders: Invalid search, DB error, timeout
- [ ] update-reminder: Not found, validation, permission

### Admin Commands (9+ total)
- [ ] broadcast: Permission, channel not found, timeout
- [ ] say: Channel not found, permission, message too long
- [ ] whisper: User not found, user blocked, permission
- [ ] proxy-config: Invalid URL, connection refused, timeout
- [ ] proxy-enable/disable: Not found, permission, conflict
- [ ] proxy-status: DB error, timeout

### User Pref Commands (4 total)
- [ ] opt-in: Validation, service error
- [ ] opt-out: Validation, service error
- [ ] opt-in-request: User not found, permission
- [ ] comm-status: Service error, timeout

### Misc Commands (4 total)
- [ ] help: Service error
- [ ] hi: No errors expected
- [ ] ping: Service error, timeout
- [ ] poem: HuggingFace API error, timeout, invalid response

## Next Steps

1. Read `PHASE-22.6c-SERVICE-MOCKING-GUIDE.md` (to be created)
2. Start with quote commands (most complex service interactions)
3. Move to reminders (similar patterns to quotes)
4. Complete admin/user-pref/misc (simpler error scenarios)
5. Run full test suite and measure coverage
6. Commit Phase 22.6c work
7. Move to Phase 22.6d (gap filling)

## Estimated Timeline

| Task | Time |
|------|------|
| Quote commands (9 cmds, 12 tests) | 1.5 hours |
| Reminder commands (6 cmds, 10 tests) | 1 hour |
| Admin commands (9+ cmds, 12 tests) | 1.5 hours |
| User pref/misc (8 cmds, 5 tests) | 0.5 hours |
| Testing & debugging | 1 hour |
| **Total** | **~5 hours** |

---

**Ready to Start**: Phase 22.6c test implementation  
**Prerequisite**: Phase 22.6b complete ✅  
**Next Review**: After Phase 22.6c (target: 2,540+ tests, 45% coverage)
