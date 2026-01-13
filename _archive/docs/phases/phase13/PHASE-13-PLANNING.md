# Phase 13 - Service & Middleware Coverage Expansion (Planning)

## Overview

Phase 13 will expand test coverage from 10.96% (Statements) to 15-20% by creating comprehensive integration tests for services and middleware that currently have 0% coverage or low coverage.

## Current Coverage Status (Phase 12 End)

### Services Coverage
| Service | Coverage | Status |
|---------|----------|--------|
| DatabaseService | 18.75% | ✅ Has coverage (Phase 9) |
| GuildAwareDatabaseService | 10.81% | ✅ Has coverage (Phase 9) |
| QuoteService | ~15% | ✅ Has coverage (Phase 9) |
| GuildAwareReminderService | ~12% | ✅ Has coverage (Phase 9) |
| ProxyConfigService | 0% | ❌ NO COVERAGE |
| CommunicationService | 0% | ❌ NO COVERAGE |
| WebhookListenerService | 0% | ❌ NO COVERAGE |
| RolePermissionService | ~8% | ⚠️ LOW COVERAGE |
| ResolutionHelpers | 0% | ❌ NO COVERAGE |

### Middleware Coverage
| Module | Coverage | Status |
|--------|----------|--------|
| errorHandler.js | 6.77% | ✅ Has coverage (Phase 10) |
| Other middleware | Unknown | ⚠️ NEEDS ASSESSMENT |

### Routes/HTTP Coverage
| Module | Coverage | Status |
|--------|----------|--------|
| src/routes | 0% | ❌ NO COVERAGE |
| Dashboard API | ~30% | ✅ Has coverage (Phase 6) |

## Phase 13 Strategy

### Tier 1: High Priority Services (15-20 tests each)

**Priority 1A: ProxyConfigService** (NEW - 0% coverage)
```javascript
// Test these methods:
- initializeProxy()
- setProxyConfig(guildId, config)
- getProxyConfig(guildId)
- deleteProxyConfig(guildId)
- isProxyEnabled(guildId)
- getAllConfigs()
- validateProxySettings(settings)
```

**Priority 1B: CommunicationService** (NEW - 0% coverage)
```javascript
// Test these methods:
- optInUser(userId, guildId)
- optOutUser(userId, guildId)
- getUserOptInStatus(userId, guildId)
- isUserOptedIn(userId, guildId)
- isUserOptedOut(userId, guildId)
- getAllOptedInUsers(guildId)
- getAllOptedOutUsers(guildId)
- clearUserPreferences(userId)
```

**Priority 1C: WebhookListenerService** (NEW - 0% coverage)
```javascript
// Test these methods:
- startWebhookServer(port)
- stopWebhookServer()
- registerWebhookHandler(name, handler)
- processIncomingWebhook(data)
- sendWebhookNotification(event, data)
- validateWebhookSignature(payload, signature)
```

### Tier 2: Medium Priority Services (10-15 tests each)

**Priority 2A: ResolutionHelpers** (NEW - 0% coverage)
```javascript
// Test these methods:
- resolveUser(input)
- resolveGuild(input)
- resolveChannel(input)
- resolveRole(input)
- validateResolution(type, result)
```

**Priority 2B: RolePermissionService** (LOW - 8% coverage)
```javascript
// Expand existing coverage:
- Permission hierarchy testing
- Role validation edge cases
- Concurrent permission checks
- Permission caching verification
```

### Tier 3: Infrastructure Routes (5-10 tests each)

**Priority 3A: Dashboard Routes**
```javascript
// Test endpoints:
- GET /api/dashboard/stats
- POST /api/dashboard/quotes
- PUT /api/dashboard/quotes/:id
- DELETE /api/dashboard/quotes/:id
```

**Priority 3B: Admin Routes** (If separate)
```javascript
// Test admin-only endpoints
```

## Test Organization Structure

```
tests/
├── phase13-proxy-config-service.test.js          (20 tests)
├── phase13-communication-service.test.js         (20 tests)
├── phase13-webhook-listener-service.test.js      (15 tests)
├── phase13-resolution-helpers.test.js            (15 tests)
├── phase13-services-integration.test.js          (10 tests for RolePermissionService expansion)
└── phase13-routes-integration.test.js            (15 tests for route handlers)

Total: ~95 tests
```

## Expected Coverage After Phase 13

| Service | Before | After | Target |
|---------|--------|-------|--------|
| ProxyConfigService | 0% | 20-30% | ✅ |
| CommunicationService | 0% | 20-30% | ✅ |
| WebhookListenerService | 0% | 15-25% | ✅ |
| ResolutionHelpers | 0% | 20-30% | ✅ |
| Overall Statements | 10.96% | 15-18% | ✅ TARGET |
| Overall Functions | 13.67% | 17-20% | ✅ BONUS |

## Implementation Approach

### Step 1: Analyze Existing Services
- Read each service completely to understand all public methods
- Identify dependencies (databases, external services)
- Map error scenarios for each method
- Document expected behavior from code

### Step 2: Create Test Files
- Follow established TDD pattern (tests first)
- Create mock utilities for Discord.js/Database operations
- Organize tests in 3-4 describe blocks per service
- Include setup/teardown for database or state management

### Step 3: Implementation Pattern (from Phase 12)
```javascript
describe('ServiceName Integration Tests', () => {
  let testDb;
  let service;

  beforeAll(() => {
    // Initialize real service with test database
  });

  describe('Method 1 Operations', () => {
    it('should perform operation successfully', async () => {
      // Call real method
      // Verify result
    });

    it('should handle error scenario', async () => {
      // Set up error condition
      // Call method
      // Verify error handling
    });
  });

  afterAll(async () => {
    // Cleanup resources
  });
});
```

### Step 4: Coverage Validation
- Run each test file individually
- Check coverage percentages
- Verify all public methods are tested
- Document coverage in Phase 13 summary

### Step 5: Integration Testing
- Test service interactions (CommunicationService + Database)
- Test middleware chains
- Test error propagation
- Test concurrent operations

## Known Challenges

### Challenge 1: Discord.js Integration
**Service:** WebhookListenerService
- Requires HTTP server mocking or testing with mock handlers
- May need to test webhook signature validation separately

### Challenge 2: Async State Management
**Services:** CommunicationService, ProxyConfigService
- Need proper cleanup between tests
- May have race conditions with concurrent operations
- Database state must be isolated per test

### Challenge 3: External Dependencies
**Service:** WebhookListenerService
- May make external HTTP requests
- Need to mock external services
- Need to test timeout/retry logic

## Success Criteria

- ✅ 80-100 new tests created
- ✅ All tests passing (100% pass rate)
- ✅ Coverage reaches 15-20% (from 10.96%)
- ✅ All public methods of targeted services tested
- ✅ Error scenarios covered
- ✅ Integration paths tested
- ✅ No breaking changes to existing tests
- ✅ Clear commit message

## Dependency Requirements

For Phase 13 tests, will need:
- sqlite3 for database testing (already available)
- node:crypto for signature validation testing
- node:http for webhook server testing (or mock)
- discord.js mock utilities (from Phase 12)

## Estimated Timeline

| Task | Duration |
|------|----------|
| Analyze services | 30-45 min |
| Create ProxyConfig tests | 1.5-2 hours |
| Create Communication tests | 1.5-2 hours |
| Create WebhookListener tests | 1-1.5 hours |
| Create ResolutionHelpers tests | 45-60 min |
| Integration & coverage validation | 45-60 min |
| Documentation | 30-45 min |
| **Total** | **6-9 hours** |

## Quality Standards (from Copilot Instructions)

Each Phase 13 test MUST:
1. ✅ Import from NEW locations (not deprecated utils/)
2. ✅ Test real service code execution (not mocked away)
3. ✅ Have complete happy path coverage
4. ✅ Have error scenario coverage
5. ✅ Have edge case coverage
6. ✅ Use proper async/await patterns
7. ✅ Have clean setup/teardown
8. ✅ Not depend on other tests
9. ✅ Have clear, descriptive names
10. ✅ Follow established patterns from Phase 12

## Resources for Phase 13

### Code Examples
- [tests/phase9-database-service.test.js](./tests/phase9-database-service.test.js) - Database testing pattern
- [tests/phase12-commands-integration.test.js](./tests/phase12-commands-integration.test.js) - Integration testing pattern

### Service Documentation
- [src/services/](./src/services/) - All services to be tested
- [src/middleware/](./src/middleware/) - Middleware patterns

### Reference Docs
- [PHASE-12-EXECUTION-SUMMARY.md](./PHASE-12-EXECUTION-SUMMARY.md) - Coverage metrics
- [.github/copilot-instructions.md](./.github/copilot-instructions.md) - Import rules & TDD guidelines

## Success Metrics

```
Phase 12 → Phase 13 Progression:

Coverage Before:  10.96% (Statements) / 13.67% (Functions)
Coverage Target:  15-20% (Statements) / 17-20% (Functions)
Coverage After:   [To be measured]

Test Count:
- Before: 1031 tests
- Added: 80-100 tests
- After:  1111-1131 tests

Pass Rate: 100% (must maintain)

Key Services Unlocked:
✅ ProxyConfigService (proxy management)
✅ CommunicationService (user preferences)
✅ WebhookListenerService (external integration)
✅ ResolutionHelpers (utility functions)
```

---

## Next Phase After Phase 13 (Phase 14 Preview)

**Phase 14: Edge Cases & Error Scenarios (20-25% coverage)**
- Focus on boundary conditions
- Test invalid input handling
- Test concurrent operations
- Test performance characteristics
- Test resource cleanup
- Test recovery from errors

---

**Status:** Ready for Phase 13 implementation ✅
**Estimated Start:** After Phase 12 completion review
**Priority:** High (unlocks critical service coverage)
