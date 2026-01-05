# Guild Isolation Refactoring - Next Steps Checklist

## Current Status: 70% Complete ✅

**Phases 1-4:** Complete (Guild schemas, service refactoring, root DB cleanup)  
**Phases 5-7:** Pending (Event handlers, tests, legacy service assessment)

---

## Phase 5: Bot Event Handlers (⏳ NEXT)

### Objective

Update `src/index.js` to pass guild context through reminder button handlers

### Files to Modify

- **Primary:** `src/index.js` (lines 217-250)

### Changes Required

#### Issue

Three event handlers use `ReminderService` with only `reminderId`:

```javascript
// ❌ WRONG - Only has reminderId, no guildId
const context = {
  reminderId: 123,
  subject: 'Meeting',
};
```

#### Solution

Store both guildId and reminderId:

```javascript
// ✅ CORRECT - Has both guild and reminder context
const context = {
  guildId: interaction.guildId,
  reminderId: 123,
  subject: 'Meeting',
};
```

### Specific Changes Needed

**1. reminder_cancel button** (line ~217)

```javascript
// OLD
const context = Object.values(client.reminderContexts || {}).find(...);
if (context && context.reminderId) {
  const { deleteReminder } = require('./services/ReminderService');
  await deleteReminder(context.reminderId);

// NEW
if (context && context.guildId && context.reminderId) {
  const reminderService = require('./services/GuildAwareReminderService');
  await reminderService.deleteReminder(context.guildId, context.reminderId, true);
```

**2. reminder_server button** (line ~232)

```javascript
// OLD
const { updateNotificationMethod } = require('./services/ReminderService');
await updateNotificationMethod(context.reminderId, 'server');

// NEW - This may need a new method or different approach
// Need to look at what updateNotificationMethod does and replicate it with guild DB
```

**3. reminder_notify button** (line ~247)

```javascript
// OLD
const { updateNotificationMethod } = require('./services/ReminderService');
await updateNotificationMethod(context.reminderId, 'dm');

// NEW - Same as above
```

### Subtask Checklist

- [ ] Locate reminder context storage (search for `reminderContexts`)
- [ ] Update context to include `guildId` from `interaction.guildId`
- [ ] Update deleteReminder call to use GuildAwareReminderService
- [ ] Decide on updateNotificationMethod replacement:
  - Option A: Create `updateReminderNotificationMethod(guildId, reminderId, method)` in GuildAwareReminderService
  - Option B: Add to existing updateReminder function
  - Option C: Create new ReminderNotificationService for guild DB
- [ ] Test button interactions in Discord

### Testing

```bash
# 1. Manually test reminder cancel button in Discord
# 2. Manually test reminder server/notify buttons in Discord
# 3. Verify reminders are deleted from correct guild DB only
```

---

## Phase 6: Test Suite (⏳ AFTER PHASE 5)

### Objective

Update/replace old tests to work with guild-aware services

### Files to Update

#### 1. `tests/unit/test-reminder-service.js`

**Issue:** Tests old `ReminderService` using root DB

**Action:**

- [ ] Check if still needed (used anywhere?)
- [ ] If yes: Update to use `GuildAwareReminderService` with test guild
- [ ] If no: Delete and note in CHANGELOG

**Key Changes:**

```javascript
// OLD
const { createReminder } = require('../../src/services/ReminderService');
const db = DatabaseService.getDatabase();

// NEW
const { createReminder } = require('../../src/services/GuildAwareReminderService');
const GuildDatabaseManager = require('../../src/services/GuildDatabaseManager');
const testGuildId = 'test-guild-123';
```

#### 2. `tests/unit/test-communication-service.js`

**Issue:** Tests old `CommunicationService` using root DB

**Action:**

- [ ] Check if still needed
- [ ] If yes: Update to use `GuildAwareCommunicationService` with test guild
- [ ] If no: Delete and note in CHANGELOG

#### 3. `tests/unit/test-admin-communication.js`

**Issue:** Tests old `CommunicationService` in admin commands

**Action:**

- [ ] Check what it's testing
- [ ] Update or replace with guild-aware tests

#### 4. `tests/unit/test-reminder-database.js`

**Issue:** Direct reminder table operations on root DB

**Action:**

- [ ] Delete (legacy, reminders no longer in root DB)
- [ ] Or update to test guild database operations

### New Tests to Create

#### `tests/unit/test-guild-reminder-service.js`

```javascript
// Test GuildAwareReminderService with guild isolation
describe('GuildAwareReminderService', () => {
  const guildA = 'guild-a-123';
  const guildB = 'guild-b-456';

  test('Reminders in Guild A not visible in Guild B', () => {
    // Create reminder in Guild A
    // Verify not visible in Guild B
    // Verify visible in Guild A
  });

  test('Deleting Guild A removes all reminders', () => {
    // Create multiple reminders in Guild A
    // Call deleteGuildReminders(guildA)
    // Verify folder data/db/guilds/guild-a-123/ deleted
  });
});
```

#### `tests/unit/test-guild-communication-service.js`

```javascript
// Test GuildAwareCommunicationService with guild isolation
describe('GuildAwareCommunicationService', () => {
  const guildA = 'guild-a-123';
  const guildB = 'guild-b-456';
  const user = 'user-123';

  test('User can have different opt-in status per guild', () => {
    // User opted in to Guild A
    // User opted out from Guild B
    // Verify isOptedIn(guildA, user) = true
    // Verify isOptedIn(guildB, user) = false
  });
});
```

### Subtask Checklist

- [ ] Audit existing test files
- [ ] Delete tests for root DB operations (if no longer valid)
- [ ] Update tests to use guild-aware services
- [ ] Create new guild isolation tests
- [ ] Verify all tests pass: `npm test`
- [ ] Check test coverage: `npm run test:coverage`

---

## Phase 7: Legacy Service Assessment (⏳ AFTER PHASE 6)

### Objective

Decide on fate of `ReminderService.js` (660 lines of legacy code)

### Current Status of ReminderService

**Uses:**

- `src/index.js` - Bot event handlers (will be refactored in Phase 5)
- `src/services/ReminderNotificationService.js` - Notification delivery
- `tests/unit/test-reminder-service.js` - Test file

**Purpose:** Manages reminders in root database

### Decision Matrix

| Option           | Pros                              | Cons                              | Effort           |
| ---------------- | --------------------------------- | --------------------------------- | ---------------- |
| **A: Delete**    | Clean codebase, less maintenance  | Lose notification logic if needed | Low (30 min)     |
| **B: Refactor**  | Keep if notification logic needed | Significant work                  | High (2-3 hours) |
| **C: Deprecate** | Keep but mark obsolete            | Legacy code remains               | Low (30 min)     |

### Recommendation

**Option C: Deprecate** (for now)

- Mark with `@deprecated` comments
- Keep for backward compatibility if anything still depends on it
- Remove in v1.0.0

### Tasks

#### If Option A (Delete)

- [ ] Search for all `ReminderService` imports
- [ ] Verify no external code depends on it
- [ ] Check if notification logic needs to be preserved
- [ ] Delete `src/services/ReminderService.js`
- [ ] Delete `src/services/ReminderNotificationService.js` (if not needed)
- [ ] Update CHANGELOG
- [ ] Add comment in code explaining removal

#### If Option B (Refactor)

- [ ] Create `GuildAwareReminderNotificationService`
- [ ] Migrate notification logic to work with guild DBs
- [ ] Update ReminderService to wrap guild service (backward compat)
- [ ] Update bot event handlers
- [ ] Update tests

#### If Option C (Deprecate)

- [ ] Add `@deprecated` JSDoc to all ReminderService functions
- [ ] Add comment: "Use GuildAwareReminderService instead (v0.3.0+)"
- [ ] Log deprecation warning when used
- [ ] Update DEPRECATION-AUDIT.md
- [ ] Plan removal for next major version

### Subtask Checklist

- [ ] Review ReminderNotificationService usage
- [ ] Check all files importing ReminderService
- [ ] Make decision (A, B, or C)
- [ ] Implement chosen approach
- [ ] Update documentation

---

## Final Verification Checklist

### Code Quality

- [ ] All modified files pass `npm run lint`
- [ ] No syntax errors: `node -c` on all changed files
- [ ] No deprecated functions used in services
- [ ] No `getDatabase()` calls in service layer (except in legacy ReminderService)

### Testing

- [ ] Unit tests pass: `npm test`
- [ ] Integration tests pass: `npm run test:integration`
- [ ] No test warnings or deprecation notices
- [ ] Test coverage maintained or improved

### Functional Testing

- [ ] Bot starts without errors
- [ ] Create reminder in Guild A, verify in Guild A DB only
- [ ] Create reminder in Guild B, verify in Guild B DB only
- [ ] Delete Guild A, verify `data/db/guilds/guild-a-*/` folder removed
- [ ] User opts in Guild A, opts out Guild B, verify separate status
- [ ] Commands work normally (no breaking changes)

### Documentation

- [ ] Update README if guild architecture mentioned
- [ ] Update API documentation
- [ ] Add migration guide for developers
- [ ] Update CHANGELOG with refactoring summary

### Database

- [ ] Verify no `guildId` columns in per-guild tables
- [ ] Verify root database only has proxy_config and schema_versions
- [ ] Backup existing guild databases before testing
- [ ] Test database deletion removes entire folder

### Security

- [ ] Verify cross-guild data isolation
- [ ] Test data isolation with multi-guild setup
- [ ] Verify GDPR deletion works as expected
- [ ] Review error messages (no guild IDs leaked)

---

## Estimated Timeline

| Phase | Task              | Duration       | Notes                                |
| ----- | ----------------- | -------------- | ------------------------------------ |
| 5     | Event handlers    | 30-45 min      | Modify 3 button handlers in index.js |
| 6     | Test updates      | 1-2 hours      | Update/create guild-aware tests      |
| 7     | Legacy assessment | 30 min         | Decide on ReminderService fate       |
| -     | Testing & QA      | 1 hour         | Full integration test                |
| -     | **TOTAL**         | **~3-4 hours** | **From now to production**           |

---

## Success Criteria

✅ All phases complete when:

1. No `getDatabase()` calls in service layer (except intentional legacy code)
2. All tests pass with guild isolation verified
3. All commands work without breaking changes
4. GDPR deletion removes complete guild data
5. Cross-guild data isolation confirmed
6. Documentation updated
7. Code passes lint and style checks

---

## Helpful Commands

```bash
# Verify syntax
node -c src/services/GuildAwareReminderService.js

# Run tests
npm test
npm run test:all
npm run test:integration

# Check for getDatabase usage (after Phase 5)
grep -r "getDatabase()" src/services/ --exclude="ReminderService.js"

# Check code style
npm run lint

# Check test coverage
npm run test:coverage

# Search for remaining TODO comments
grep -r "TODO.*guild\|TODO.*isolation\|TODO.*Phase" src/
```

---

## Key Contacts & Resources

**Documentation:**

- [GUILD-ISOLATION-REFACTORING-COMPLETE.md](GUILD-ISOLATION-REFACTORING-COMPLETE.md) - Full details
- [GUILD-ISOLATION-REFACTORING-STATUS.md](GUILD-ISOLATION-REFACTORING-STATUS.md) - Current status
- [DEPRECATION-AUDIT.md](DEPRECATION-AUDIT.md) - Deprecation tracking
- [.github/copilot-instructions.md](.github/copilot-instructions.md) - Architecture guidelines

**Key Files:**

- `src/services/GuildDatabaseManager.js` - Guild database manager
- `src/services/GuildAwareReminderService.js` - Guild-isolated reminders ✅
- `src/services/GuildAwareCommunicationService.js` - Guild-isolated communication ✅
- `src/services/DatabaseService.js` - Root database (cleaned up) ✅

---

## Notes for Next Developer

1. **Guild isolation is fundamental** - Every service interacting with guild data should use GuildDatabaseManager or a guild-aware service
2. **No shortcut filters** - Don't use `WHERE guildId = ?` - use separate databases instead
3. **GDPR deletion** - Should delete entire guild folder, not carefully delete rows
4. **Test with multiple guilds** - Always test guild isolation with at least 2 test guilds
5. **Document design decisions** - Update DEPRECATION-AUDIT.md when making architectural decisions

---

**Last Updated:** After Phase 4 completion  
**Status:** Ready for Phase 5 implementation  
**Owner:** [Next Developer]
