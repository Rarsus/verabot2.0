# Phase 7 Planning Document

**Date:** January 7, 2026  
**Phase Status:** In Progress  
**Objective:** Target zero-coverage and ultra-low-coverage modules to improve from 29.31% → 50-60% coverage

## Coverage Baseline

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| **Lines** | 29.31% | 50-60% | +20-31% |
| **Functions** | 32.42% | 55-65% | +23-33% |
| **Branches** | 24.41% | 45-55% | +20-31% |
| **Tests** | 524 | ~900 | +376 |

## Phase 7 Structure

### Phase 7A: Zero-Coverage Critical Services (50-60 tests)
**Objective:** Eliminate zero-coverage modules  
**Modules (7 critical):**
- `src/services/DiscordService.js` (0%) - Discord API wrapper, critical for bot communication
- `src/services/ExternalActionHandler.js` (0%) - External event handling
- `src/services/WebSocketService.js` (0%) - WebSocket communication
- `src/services/CommunicationService.js` (0%) - Communication layer
- `src/middleware/dashboard-auth.js` (0%) - Dashboard authentication middleware
- `src/utils/helpers/resolution-helpers.js` (0%) - Resolution utilities
- `src/routes/dashboard.js` (0%) - Dashboard routes

**Test Coverage Targets:**
- DiscordService: 0% → 75%
- ExternalActionHandler: 0% → 70%
- WebSocketService: 0% → 80%
- CommunicationService: 0% → 70%
- Dashboard Auth: 0% → 85%
- Resolution Helpers: 0% → 90%
- Dashboard Routes: 0% → 75%

**Tests to Create:**
1. DiscordService core methods (8 tests)
2. ExternalActionHandler scenarios (9 tests)
3. WebSocketService communication (10 tests)
4. CommunicationService operations (9 tests)
5. Dashboard auth middleware (10 tests)
6. Resolution helpers functions (8 tests)
7. Dashboard routes (6 tests)

---

### Phase 7B: Ultra-Low Coverage Services (40-50 tests)
**Objective:** Bring ultra-low coverage services to minimum 50%  
**Modules (3 critical):**
- `src/services/GuildAwareReminderService.js` (3.57%)
- `src/services/ReminderService.js` (4.48%)
- `src/services/RolePermissionService.js` (6.45%)

**Test Coverage Targets:**
- GuildAwareReminderService: 3.57% → 60%
- ReminderService: 4.48% → 55%
- RolePermissionService: 6.45% → 70%

**Tests to Create:**
1. GuildAwareReminderService CRUD (15 tests)
2. ReminderService operations (14 tests)
3. RolePermissionService verification (11 tests)
4. Integration scenarios (5 tests)

---

### Phase 7C: Low-Coverage Reminder Commands (45-55 tests)
**Objective:** Improve reminder command coverage from 15-33% to 60%+  
**Modules (6 commands):**
- `src/commands/reminder-management/create-reminder.js` (17.02%)
- `src/commands/reminder-management/list-reminders.js` (20%)
- `src/commands/reminder-management/search-reminders.js` (22.85%)
- `src/commands/reminder-management/get-reminder.js` (25%)
- `src/commands/reminder-management/delete-reminder.js` (33.33%)
- `src/commands/reminder-management/update-reminder.js` (15.9%)

**Test Coverage Targets:**
- All commands: <33% → 65%+

**Tests to Create:**
1. Create reminder command (8 tests)
2. List reminders command (7 tests)
3. Search reminders command (8 tests)
4. Get reminder command (7 tests)
5. Delete reminder command (7 tests)
6. Update reminder command (8 tests)
7. Command integration (4 tests)

---

### Phase 7D: Service Gaps & Error Handling (35-45 tests)
**Objective:** Improve remaining service coverage and error paths  
**Modules:**
- `src/services/QuoteService.js` (25%)
- `src/services/WebhookListenerService.js` (33.78%)
- `src/utils/error-handler.js` (29.78%)
- `src/services/MigrationManager.js` (37.5%)
- `src/services/DatabasePool.js` (48.33%)

**Test Coverage Targets:**
- QuoteService: 25% → 65%
- WebhookListenerService: 33.78% → 65%
- Error handler: 29.78% → 80%
- MigrationManager: 37.5% → 70%
- DatabasePool: 48.33% → 75%

**Tests to Create:**
1. QuoteService comprehensive (12 tests)
2. WebhookListenerService operations (10 tests)
3. Error handler edge cases (9 tests)
4. MigrationManager scenarios (6 tests)
5. DatabasePool management (8 tests)

---

## Expected Outcomes

**Phase 7A:** +12-15% coverage (zero modules eliminated)
**Phase 7B:** +8-10% coverage (ultra-low modules improved)
**Phase 7C:** +10-12% coverage (reminder commands improved)
**Phase 7D:** +8-10% coverage (remaining services improved)

**Total Phase 7 Impact:** +38-47% estimated improvement  
**Projected Final Coverage:** 67-76% lines, 70-79% functions, 62-71% branches

## Test Count

- Phase 7A: 60 tests
- Phase 7B: 45 tests
- Phase 7C: 49 tests
- Phase 7D: 45 tests
- **Total: 199 tests**

**Combined Project:**
- Phase 1-6: 524 tests
- Phase 7: 199 tests
- **Total: 723 tests**

## Implementation Timeline

1. Phase 7A: 2-3 days (zero-coverage, highest priority)
2. Phase 7B: 1-2 days (ultra-low coverage)
3. Phase 7C: 1-2 days (reminder commands)
4. Phase 7D: 1-2 days (service gaps)

**Estimated Completion:** 5-9 days from start

## Success Criteria

✅ All 199 tests passing  
✅ 100% test pass rate maintained  
✅ 50-60% minimum coverage achieved  
✅ Zero-coverage modules eliminated  
✅ All critical services tested  
✅ Error paths thoroughly covered  
✅ Integration scenarios validated  

## Notes

- Phase 7A is highest priority (7 zero-coverage modules)
- Focus on critical services first (DiscordService, WebSocketService)
- Dashboard routes need comprehensive testing
- Reminder services have minimal coverage - significant work needed
- Error handling needs substantial expansion

---

**Next Step:** Begin Phase 7A implementation
