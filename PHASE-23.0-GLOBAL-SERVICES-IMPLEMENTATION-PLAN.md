# PHASE-23.0-GLOBAL-SERVICES-IMPLEMENTATION-PLAN.md

**Version:** 3.0.0 → 3.1.0 (potentially breaking)  
**Status:** Planning Phase  
**Date:** January 13, 2026  
**Category:** Global Configuration Services Refactoring  

## Executive Summary

This document outlines the implementation plan for **Option 2: Specialized Global Services** - replacing generic `DatabaseService` with focused, single-responsibility services for global bot configuration.

**Objectives:**
1. Create `GlobalProxyConfigService` and `GlobalUserCommunicationService`
2. Write comprehensive tests FIRST (TDD compliance)
3. Migrate all usages from DatabaseService to new services
4. Mark DatabaseService as obsolete
5. Eliminate architectural inconsistencies

**Version Impact:** 3.0.0 → 3.1.0 (potentially breaking due to service removal in 4.0.0)

---

## Architecture Changes

### Current (Inconsistent)
```
Guild-Scoped:     GuildAwareDatabaseService
Global Settings:  DatabaseService (generic, unclear)
```

### Target (Consistent)
```
Guild-Scoped:       GuildAwareDatabaseService
Global Proxy:       GlobalProxyConfigService (specialized)
Global Comms:       GlobalUserCommunicationService (specialized)
Global Generic:     (removed - no longer needed)
```

---

## Phase 1: Test-First Implementation (TDD)

### Step 1.1: GlobalProxyConfigService Tests
**File:** `tests/unit/services/test-global-proxy-config-service.test.js`

**Test Coverage Required:**
- Module initialization and export
- Proxy URL getter/setter (encrypted storage)
- Proxy username getter/setter (encrypted storage)
- Proxy password getter/setter (encrypted storage)
- Proxy enable/disable toggle
- Proxy status retrieval
- Configuration reset
- Multi-value transactions
- Error handling (invalid inputs, storage failures)
- Caching behavior (optional: in-memory cache)

**Estimated Tests:** 20-25 test cases

---

### Step 1.2: GlobalUserCommunicationService Tests
**File:** `tests/unit/services/test-global-user-communication-service.test.js`

**Test Coverage Required:**
- Module initialization and export
- User opt-in functionality
- User opt-out functionality
- Check user status (opted in/out)
- Bulk opt-in operations
- Bulk opt-out operations
- Get all opted-in users
- Cleanup opt-status (inactive users)
- Error handling (invalid user IDs, storage failures)
- Race condition handling (concurrent updates)

**Estimated Tests:** 18-22 test cases

---

### Step 1.3: Command Tests (Updated for New Services)
**Files:** 
- `tests/unit/commands/test-proxy-commands-refactored.test.js`
- `tests/unit/commands/test-communication-commands-refactored.test.js`

**Test Coverage Required:**
- proxy-enable: uses GlobalProxyConfigService
- proxy-config: uses GlobalProxyConfigService
- proxy-status: uses GlobalProxyConfigService
- opt-in command: uses GlobalUserCommunicationService
- opt-out command: uses GlobalUserCommunicationService
- Integration: setting proxy config then querying status
- Integration: opting in then checking status

**Estimated Tests:** 12-16 test cases

---

## Phase 2: Service Implementation

### Step 2.1: Create GlobalProxyConfigService
**File:** `src/services/GlobalProxyConfigService.js`

**Responsibilities:**
- Store proxy URL, username, password in global (root) database
- Encrypt sensitive credentials before storage
- Provide getter/setter methods for each property
- Cache configuration in memory (TTL: 5 minutes)
- Validate configuration before storage
- Provide enable/disable toggle

**Interface:**
```javascript
async getProxyUrl() → string | null
async setProxyUrl(url) → void
async getProxyUsername() → string | null
async setProxyUsername(username) → void
async getProxyPassword() → string | null  // Returns decrypted
async setProxyPassword(password) → void
async isProxyEnabled() → boolean
async setProxyEnabled(enabled) → void
async getFullProxyConfig() → { url, username, password, enabled }
async deleteAllProxyConfig() → void
async validateProxyConfig() → { valid: boolean, errors: [] }
```

---

### Step 2.2: Create GlobalUserCommunicationService
**File:** `src/services/GlobalUserCommunicationService.js`

**Responsibilities:**
- Store user opt-in/opt-out status in global (root) database
- Track timestamp of last status change
- Provide check, opt-in, opt-out methods
- Support bulk operations for performance
- Clean up stale user records (optional)

**Interface:**
```javascript
async isOptedIn(userId) → boolean
async optIn(userId, timestamp?) → void
async optOut(userId, timestamp?) → void
async getAllOptedInUsers() → Array<userId>
async getAllOptedOutUsers() → Array<userId>
async bulkOptIn(userIds) → void
async bulkOptOut(userIds) → void
async getOptInStatus(userId) → { userId, opted_in, updated_at }
async deleteAllUserCommunications() → void
async cleanupInactiveUsers(inactiveDays) → number (deleted count)
```

---

## Phase 3: Migration (Remove DatabaseService Dependency)

### Step 3.1: Migrate src/index.js
**Current:**
```javascript
const database = require('./services/DatabaseService');
const proxyConfig = new ProxyConfigService(database);
```

**New:**
```javascript
const globalProxyConfig = require('./services/GlobalProxyConfigService');
const proxyConfig = new ProxyConfigService(globalProxyConfig);
```

---

### Step 3.2: Migrate Proxy Admin Commands
**Files:** 
- `src/commands/admin/proxy-enable.js`
- `src/commands/admin/proxy-config.js`
- `src/commands/admin/proxy-status.js`

**Changes:** Replace `DatabaseService` import with `GlobalProxyConfigService`

---

### Step 3.3: Migrate CommunicationService
**File:** `src/services/CommunicationService.js`

**Current:**
```javascript
const { getDatabase } = require('./DatabaseService');
// ... uses getDatabase() throughout
```

**New:**
```javascript
const globalUserComm = require('./GlobalUserCommunicationService');
// ... uses globalUserComm throughout
```

---

## Phase 4: Mark DatabaseService Obsolete

### Step 4.1: Add Deprecation Warning
**File:** `src/services/DatabaseService.js`

Add header:
```javascript
/**
 * ⚠️ DEPRECATED: DatabaseService (v3.1.0+)
 * 
 * This service is DEPRECATED as of v3.1.0 and will be REMOVED in v4.0.0.
 * 
 * REASON FOR DEPRECATION:
 * - Replaced by specialized global services (GlobalProxyConfigService, GlobalUserCommunicationService)
 * - Generic database wrapper no longer needed
 * - Guild operations use GuildAwareDatabaseService
 * - Global operations use specific service classes
 * 
 * MIGRATION REQUIRED BY: v4.0.0 (Target: May 2026)
 * 
 * See: docs/reference/DB-DEPRECATION-TIMELINE.md
 */
```

---

### Step 4.2: Update services/index.js
Remove or deprecate DatabaseService export

---

## Phase 5: Documentation Updates

### Step 5.1: Update CHANGELOG.md
```markdown
## v3.1.0 (Target: February 2026)

### 🎉 New Features
- **GlobalProxyConfigService:** Specialized service for proxy configuration management
- **GlobalUserCommunicationService:** Specialized service for user communication preferences

### 🔄 Changed
- Migrated from generic DatabaseService to specialized global services
- Improved service separation of concerns
- Enhanced testability of configuration management

### ⚠️ Deprecated
- `DatabaseService` - Will be removed in v4.0.0
- Direct database imports for global settings

### 📋 Migration Guide
See `docs/reference/GLOBAL-SERVICES-MIGRATION-GUIDE.md` for upgrade instructions
```

---

### Step 5.2: Create docs/reference/GLOBAL-SERVICES-MIGRATION-GUIDE.md
Document the migration path for users of DatabaseService

---

### Step 5.3: Update docs/reference/DB-DEPRECATION-TIMELINE.md
```
v3.0.0 (Current)
├── DatabaseService exists (deprecated, replacement available)
├── GuildAwareDatabaseService (active)
├── GuildAwareReminderService (active)
└── Direct database access in some global services

v3.1.0 (Target: Feb 2026) ← YOU ARE HERE
├── ✅ GlobalProxyConfigService introduced
├── ✅ GlobalUserCommunicationService introduced
├── ✅ CommunicationService migrated
├── ✅ All commands migrated
├── ⚠️ DatabaseService marked for deletion
└── 📝 Migration guide published

v4.0.0 (Target: May 2026)
├── 🗑️ DatabaseService removed completely
├── 🗑️ ReminderService removed
├── ✅ Clean architecture
└── ✅ All services use modern patterns
```

---

## Feature Branch Setup

### Branch Creation
```bash
git checkout main
git pull origin main
git checkout -b feature/23.0-global-services-refactoring

# Mark as potentially breaking
git branch --edit-description
# Add message: "BREAKING CHANGE: DatabaseService deprecated, use GlobalProxyConfigService and GlobalUserCommunicationService"
```

---

## Implementation Checklist

### ✅ Phase 1: Tests First (TDD)
- [ ] Create test-global-proxy-config-service.test.js (20+ tests)
- [ ] Create test-global-user-communication-service.test.js (20+ tests)
- [ ] Create test-proxy-commands-refactored.test.js (8+ tests)
- [ ] Create test-communication-commands-refactored.test.js (4+ tests)
- [ ] All tests FAIL (RED phase)
- [ ] Estimated: 50-60 total new test cases

### ✅ Phase 2: Implementation (GREEN)
- [ ] Create GlobalProxyConfigService.js
- [ ] Create GlobalUserCommunicationService.js
- [ ] All tests PASS
- [ ] Code coverage > 90% for both services

### ✅ Phase 3: Migration
- [ ] Update src/index.js
- [ ] Update proxy-enable.js
- [ ] Update proxy-config.js
- [ ] Update proxy-status.js
- [ ] Update CommunicationService.js
- [ ] All existing tests still PASS
- [ ] No regressions

### ✅ Phase 4: Deprecation
- [ ] Add deprecation notices to DatabaseService.js
- [ ] Mark ReminderService.js as also deprecated
- [ ] Update services/index.js exports

### ✅ Phase 5: Documentation
- [ ] Update CHANGELOG.md
- [ ] Create GLOBAL-SERVICES-MIGRATION-GUIDE.md
- [ ] Update DB-DEPRECATION-TIMELINE.md
- [ ] Update copilot-instructions.md with new patterns

### ✅ Phase 6: Testing
- [ ] Run full test suite: `npm test`
- [ ] Verify coverage: `npm run coverage:validate`
- [ ] No ESLint errors: `npm run lint`
- [ ] Test in Discord (test guild)

### ✅ Phase 7: PR & Merge
- [ ] Create pull request with all changes
- [ ] Link to feature branch description
- [ ] Request review
- [ ] Merge when approved
- [ ] Tag v3.1.0

---

## File Summary

### New Files (Create)
1. `src/services/GlobalProxyConfigService.js` (~150 lines)
2. `src/services/GlobalUserCommunicationService.js` (~120 lines)
3. `tests/unit/services/test-global-proxy-config-service.test.js` (~400 lines)
4. `tests/unit/services/test-global-user-communication-service.test.js` (~350 lines)
5. `tests/unit/commands/test-proxy-commands-refactored.test.js` (~200 lines)
6. `tests/unit/commands/test-communication-commands-refactored.test.js` (~150 lines)
7. `docs/reference/GLOBAL-SERVICES-MIGRATION-GUIDE.md` (~150 lines)

**Total New Code:** ~1,500 lines

### Files to Modify (Migrate)
1. `src/index.js` (1 line change)
2. `src/services/CommunicationService.js` (6 line changes)
3. `src/commands/admin/proxy-enable.js` (1 line change)
4. `src/commands/admin/proxy-config.js` (1 line change)
5. `src/commands/admin/proxy-status.js` (1 line change)
6. `src/services/DatabaseService.js` (add deprecation notice)
7. `src/services/ReminderService.js` (add deprecation notice)
8. `src/services/index.js` (deprecate exports)
9. `CHANGELOG.md` (add v3.1.0 section)
10. `docs/reference/DB-DEPRECATION-TIMELINE.md` (update timeline)
11. `.github/copilot-instructions.md` (document new patterns)

**Total Modified:** 11 files (~50 lines total changes)

---

## Success Criteria

✅ All 50-60 new tests PASS  
✅ Code coverage for new services > 90%  
✅ All existing tests still PASS (no regressions)  
✅ No guild isolation issues  
✅ DatabaseService no longer imported in active code  
✅ CommunicationService uses GlobalUserCommunicationService  
✅ All proxy commands use GlobalProxyConfigService  
✅ Documentation complete and accurate  
✅ ESLint: 0 errors  
✅ Tested in Discord (test guild)  
✅ Feature branch prepared and ready  

---

## Timeline Estimate

| Phase | Task | Estimate | Status |
|-------|------|----------|--------|
| 1 | Write all tests (TDD) | 3-4 hours | Not Started |
| 2 | Implement services | 2-3 hours | Not Started |
| 3 | Migrate code | 1-2 hours | Not Started |
| 4 | Deprecation notices | 30 min | Not Started |
| 5 | Documentation | 1-2 hours | Not Started |
| 6 | Testing & validation | 1-2 hours | Not Started |
| **TOTAL** | **Complete Implementation** | **8-13 hours** | **Ready to Start** |

---

## Notes

- **TDD Mandatory:** Tests written and failing BEFORE code implementation
- **No Mocking Global DB:** Use in-memory SQLite like existing tests
- **Encryption:** Use existing crypto utilities from codebase
- **Caching:** Optional but recommended (5-minute TTL)
- **Breaking Change:** This removes DatabaseService dependency (v4.0.0 will remove entirely)
- **Backward Compatibility:** Will maintain during 3.x releases

---

## References

- Current Deprecation Audit: `DEPRECATED-CODE-MIGRATION-AUDIT.md`
- Existing Tests: `tests/unit/services/test-guild-database-service.test.js`
- Command Patterns: `src/commands/admin/proxy-*.js`
- Service Patterns: `src/services/GuildAwareReminderService.js`
- TDD Guide: `docs/reference/TDD-QUICK-REFERENCE.md`

