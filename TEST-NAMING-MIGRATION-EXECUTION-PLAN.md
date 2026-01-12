# Test Naming Convention Migration - Execution Plan

**Status:** In Progress  
**Date:** January 12, 2026  
**Target:** Standardize all test naming to `test-[module-name].test.js` convention  

---

## Phase 1: Current State Analysis

### Active Test Files (6 total)

**Unit Tests (tests/unit/):**
1. `jest-bridge.test.js` → `test-jest-bridge.test.js`
2. `jest-command-base.test.js` → `test-command-base.test.js`
3. `jest-phase4-gaps.test.js` → `test-phase4-gaps.test.js`

**Integration Tests (tests/integration/):**
4. `phase17-integration.test.js` → `test-integration.test.js`
5. `phase17-validation-integration.test.js` → `test-validation-integration.test.js`
6. `test-security-integration.test.js` ✅ (Already correct)

### Issue Summary

| File | Current Pattern | Target Pattern | Directory | Status |
|------|-----------------|-----------------|-----------|--------|
| jest-bridge.test.js | `jest-*` | `test-*` | unit | ❌ Needs rename |
| jest-command-base.test.js | `jest-*` | `test-*` | unit | ❌ Needs rename |
| jest-phase4-gaps.test.js | `jest-phase*` | `test-*` | unit | ❌ Needs rename |
| phase17-integration.test.js | `phase*` | `test-*` | integration | ❌ Needs rename |
| phase17-validation-integration.test.js | `phase*` | `test-*` | integration | ❌ Needs rename |
| test-security-integration.test.js | `test-*` | `test-*` | integration | ✅ Correct |

---

## Phase 2: Migration Plan

### Step 1: Rename Unit Tests
```bash
cd tests/unit
git mv jest-bridge.test.js test-jest-bridge.test.js
git mv jest-command-base.test.js test-command-base.test.js
git mv jest-phase4-gaps.test.js test-phase4-gaps.test.js
```

### Step 2: Rename Integration Tests
```bash
cd tests/integration
git mv phase17-integration.test.js test-integration.test.js
git mv phase17-validation-integration.test.js test-validation-integration.test.js
# test-security-integration.test.js stays as is
```

### Step 3: Verify Jest Configuration
Check jest.config.js testMatch patterns still work with new names.

### Step 4: Run Tests
```bash
npm test
npm run test:coverage
```

### Step 5: Commit Changes
```bash
git commit -m "refactor: standardize all test file names to test-[module].test.js convention

RENAMED TESTS (6 files):
- jest-bridge.test.js → test-jest-bridge.test.js
- jest-command-base.test.js → test-command-base.test.js
- jest-phase4-gaps.test.js → test-phase4-gaps.test.js
- phase17-integration.test.js → test-integration.test.js
- phase17-validation-integration.test.js → test-validation-integration.test.js

VERIFIED:
- All 6 tests still passing
- Coverage metrics unchanged
- Jest config patterns still match"
```

---

## Phase 3: Root Documentation Analysis

### Status
- 119 total .md files in root directory
- 101 files in docs/ directory
- Need to categorize and archive completed phases

### Categories to Evaluate

**Phase Documentation (completed - should archive):**
- PHASE-*-COMPLETION-REPORT.md
- PHASE-*-IMPLEMENTATION.md
- SESSION-*.md
- TASKS-*.md

**Documentation Index/Guides (keep in root):**
- README.md (must stay)
- CONTRIBUTING.md
- CODE_OF_CONDUCT.md
- TEST-NAMING-CONVENTION-GUIDE.md (recent, active)

**Technical Debt/Analysis (archive to docs/archive/):**
- CI-*.md (multiple CI documentation files)
- COVERAGE-*.md (coverage analysis)
- DEPRECATED-*.md
- ESLINT-*.md
- GUILD-ISOLATION-*.md

**Feature Documentation (evaluate for moving):**
- DASHBOARD-*.md
- WEBSOCKET-*.md
- REMINDER-*.md

### Archival Criteria
Files should be moved to `docs/archive/` if:
1. ✅ Document a completed phase (PHASE-*-COMPLETE)
2. ✅ Document temporary sessions/handoffs (SESSION-*, TASK-*, HANDOFF-*)
3. ✅ Document resolved technical issues (dated issue reports)
4. ✅ Superseded by updated documentation in docs/
5. ❌ NOT: Active reference documentation (README, CONTRIBUTING, etc.)
6. ❌ NOT: Active implementation guides currently in use

---

## Phase 4: Test Framework Roadmap

### Identified Issues

**Current Test Structure:**
- ✅ Tests organized into unit/ and integration/
- ✅ 6 active test files with good coverage
- ❌ Inconsistent naming (jest-*, phase*, test-*)
- ✅ Archive contains 40 historical tests

**Coverage Gaps:**
- Service layer at 0-35% coverage
- Command implementations at 10-50% coverage
- Middleware at 0% coverage

**Test Framework Improvements Needed:**
1. Standardize naming (THIS PROJECT)
2. Expand service layer coverage (Phase 21)
3. Add command implementation tests
4. Improve middleware coverage
5. Create test utilities library

---

## Success Criteria

✅ All 6 active tests renamed to `test-[module].test.js` pattern  
✅ All tests pass with 100% success rate  
✅ Coverage metrics unchanged  
✅ Jest config still finds all tests  
✅ Git history preserved  

---

## Timeline

| Step | Task | Time | Status |
|------|------|------|--------|
| 1 | Analyze current state | 30 min | ✅ In progress |
| 2 | Create migration plan | 15 min | ✅ Complete |
| 3 | Execute test rename | 10 min | ⏳ Next |
| 4 | Validate tests | 5 min | ⏳ Next |
| 5 | Commit changes | 5 min | ⏳ Next |
| 6 | Analyze documentation | 30 min | ⏳ Next |
| 7 | Archive documentation | 1 hour | ⏳ Next |
| 8 | Create test roadmap | 30 min | ⏳ Next |
| 9 | Create DoD document | 1 hour | ⏳ Next |

**TOTAL: ~4 hours**

