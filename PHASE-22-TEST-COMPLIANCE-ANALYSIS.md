# Phase 22 - Test Naming Compliance Analysis & Implementation

**Status:** In Progress  
**Date:** January 12, 2026  
**Objective:** Standardize ALL remaining test files to `test-[module].test.js` convention

---

## Current Compliance Audit

**Total Active Test Files:** 22 (non-archived)  
**Compliant:** 6 files (27%)  
**Non-Compliant:** 16 files (73%)

### Compliant Files (6 - Already follow `test-*.test.js` pattern) ✅

```
✅ tests/integration/test-integration.test.js
✅ tests/integration/test-security-integration.test.js
✅ tests/integration/test-validation-integration.test.js
✅ tests/unit/test-command-base.test.js
✅ tests/unit/test-jest-bridge.test.js
✅ tests/unit/test-phase4-gaps.test.js
```

### Non-Compliant Files (16 - Need Renaming) ❌

#### Category 1: `jest-phase*` Pattern (4 files) → Rename to `test-*`

```
❌ tests/unit/commands/jest-phase8a-quote-commands.test.js
   → ✅ tests/unit/commands/test-quote-commands.test.js

❌ tests/unit/commands/jest-phase8b-user-admin-commands.test.js
   → ✅ tests/unit/commands/test-admin-commands.test.js

❌ tests/unit/utils/jest-phase8c-library-utilities.test.js
   → ✅ tests/unit/utils/test-library-utilities.test.js

❌ tests/unit/utils/jest-phase8d-error-scenarios.test.js
   → ✅ tests/unit/utils/test-error-scenarios.test.js
```

#### Category 2: `phase*` Pattern (12 files) → Rename to `test-*`

**Core/Response Helpers:**
```
❌ tests/unit/core/phase17-response-helpers.test.js
   → ✅ tests/unit/core/test-response-helpers.test.js
```

**Services (9 files):**
```
❌ tests/unit/services/phase14-database-service.test.js
   → ✅ tests/unit/services/test-database-service.test.js

❌ tests/unit/services/phase14-quote-service.test.js
   → ✅ tests/unit/services/test-quote-service.test.js

❌ tests/unit/services/phase14-reminder-service.test.js
   → ✅ tests/unit/services/test-reminder-service.test.js

❌ tests/unit/services/phase15-cache-manager.test.js
   → ✅ tests/unit/services/test-cache-manager.test.js

❌ tests/unit/services/phase15-discord-service.test.js
   → ✅ tests/unit/services/test-discord-service.test.js

❌ tests/unit/services/phase15-validation-service.test.js
   → ✅ tests/unit/services/test-validation-service.test.js

❌ tests/unit/services/phase17-database-service.test.js
   → ✅ tests/unit/services/test-database-service-v2.test.js  (Note: Duplicate name - need to check)

❌ tests/unit/services/phase17-guild-database-service.test.js
   → ✅ tests/unit/services/test-guild-database-service.test.js

❌ tests/unit/services/phase17-reminder-service.test.js
   → ✅ tests/unit/services/test-reminder-service-v2.test.js  (Note: Duplicate name - need to check)
```

**Commands (2 files):**
```
❌ tests/unit/commands/phase17-admin-preference-commands.test.js
   → ✅ tests/unit/commands/test-admin-preference-commands.test.js
```

**Utils (1 file):**
```
❌ tests/unit/utils/phase17-datetime-security.test.js
   → ✅ tests/unit/utils/test-datetime-security.test.js
```

---

## Implementation Plan

### Phase 22 Execution Steps

#### Step 1.1: Prepare Mapping (DONE - This document)

#### Step 1.2: Execute Renaming in Batches

**Batch A: Utils (4 files)** - 5 minutes
```bash
git mv tests/unit/utils/jest-phase8c-library-utilities.test.js tests/unit/utils/test-library-utilities.test.js
git mv tests/unit/utils/jest-phase8d-error-scenarios.test.js tests/unit/utils/test-error-scenarios.test.js
git mv tests/unit/utils/phase17-datetime-security.test.js tests/unit/utils/test-datetime-security.test.js
```

**Batch B: Core (1 file)** - 2 minutes
```bash
git mv tests/unit/core/phase17-response-helpers.test.js tests/unit/core/test-response-helpers.test.js
```

**Batch C: Commands (3 files)** - 5 minutes
```bash
git mv tests/unit/commands/jest-phase8a-quote-commands.test.js tests/unit/commands/test-quote-commands.test.js
git mv tests/unit/commands/jest-phase8b-user-admin-commands.test.js tests/unit/commands/test-admin-commands.test.js
git mv tests/unit/commands/phase17-admin-preference-commands.test.js tests/unit/commands/test-admin-preference-commands.test.js
```

**Batch D: Services (9 files)** - 15 minutes
```bash
# Phase 14 services
git mv tests/unit/services/phase14-database-service.test.js tests/unit/services/test-database-service.test.js
git mv tests/unit/services/phase14-quote-service.test.js tests/unit/services/test-quote-service.test.js
git mv tests/unit/services/phase14-reminder-service.test.js tests/unit/services/test-reminder-service.test.js

# Phase 15 services
git mv tests/unit/services/phase15-cache-manager.test.js tests/unit/services/test-cache-manager.test.js
git mv tests/unit/services/phase15-discord-service.test.js tests/unit/services/test-discord-service.test.js
git mv tests/unit/services/phase15-validation-service.test.js tests/unit/services/test-validation-service.test.js

# Phase 17 services - Check for duplicates first
# Tests for: phase17-database-service.test.js and phase14-database-service.test.js (DUPLICATES!)
# Tests for: phase17-reminder-service.test.js and phase14-reminder-service.test.js (DUPLICATES!)

# Need to handle carefully - will rename with version suffix for now
git mv tests/unit/services/phase17-database-service.test.js tests/unit/services/test-database-service-phase17.test.js
git mv tests/unit/services/phase17-guild-database-service.test.js tests/unit/services/test-guild-database-service.test.js
git mv tests/unit/services/phase17-reminder-service.test.js tests/unit/services/test-reminder-service-phase17.test.js
```

#### Step 1.3: Run Tests After Each Batch

```bash
npm test  # Should still pass all tests
```

#### Step 1.4: Verify Compliance

```bash
find tests -maxdepth 3 -name "*.test.js" | grep -v "_archive" | grep -v "^test-"
# Should return NOTHING if all renamed correctly
```

---

## Duplicate Service Tests - Action Plan

**ISSUE:** There are multiple test files for the same services from different phases:

1. **Database Service**
   - `test-database-service.test.js` (from phase14)
   - `test-database-service-phase17.test.js` (from phase17)
   - **ACTION:** Run both, merge if needed, archive the older one to _archive/

2. **Reminder Service**
   - `test-reminder-service.test.js` (from phase14)
   - `test-reminder-service-phase17.test.js` (from phase17)
   - **ACTION:** Run both, merge if needed, archive the older one to _archive/

---

## Post-Standardization Verification

After all renaming complete, verify:

```bash
# Check 1: All files follow pattern
find tests -maxdepth 3 -name "*.test.js" | grep -v "_archive" | while read f; do
  [[ "$f" =~ test-.+\.test\.js$ ]] || echo "❌ NON-COMPLIANT: $f"
done
# Should output nothing

# Check 2: All tests still pass
npm test
# Should show: Tests: 944 passed, 944 total

# Check 3: Jest can find all tests
npm test -- --listTests | wc -l
# Should show: 22 (6 compliant + 16 newly renamed)
```

---

## Expected Results

**Before Phase 22 Step 1:**
- Compliant: 6/22 (27%)
- Non-Compliant: 16/22 (73%)

**After Phase 22 Step 1:**
- Compliant: 22/22 (100%)
- 0 phase numbers in test filenames
- 0 jest-prefixed files
- Clear, functional naming across all tests

---

## Timeline

| Task | Duration | Effort |
|------|----------|--------|
| Prepare mapping | ✅ DONE | - |
| Batch A: Utils | ~5 min | Low |
| Batch B: Core | ~2 min | Low |
| Batch C: Commands | ~5 min | Low |
| Batch D: Services | ~15 min | Medium |
| Run tests | ~10 min | Low |
| Verify compliance | ~5 min | Low |
| Handle duplicates | ~20 min | Medium |
| Final commit | ~5 min | Low |

**TOTAL: ~70 minutes (~1.2 hours)**

---

## Success Criteria

✅ All 22 active test files follow `test-[module].test.js` naming  
✅ All 944 tests passing (100% pass rate)  
✅ No phase numbers in filenames  
✅ No `jest-` prefixes in filenames  
✅ Duplicate services identified and resolved  
✅ Git history preserved with `git mv`  
✅ jest.config.js properly configured  

---

## Next Steps (After Naming Complete)

1. **Analyze coverage gaps** - Look at Phase 21 Executive Summary recommendations
2. **Coverage expansion roadmap** - Create plan to reach 90%+ coverage
3. **Test framework enhancements** - Create shared utilities library
4. **Document completion** - Create Phase 22 report

