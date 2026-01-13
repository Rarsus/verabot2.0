# PHASE-22.3c Coverage Expansion Plan
## Branch & Function Coverage Enhancement

**Date:** January 13, 2026  
**Status:** PLANNING  
**Target:** 25-35 new tests for 85%+ branch coverage  
**Scheduled:** January 14-15, 2026

---

## Overview

Phase 22.3c focuses on expanding branch coverage and improving function coverage through targeted testing of middleware, validators, utilities, and core infrastructure. This phase targets three critical areas with incomplete coverage.

---

## Current Coverage Baseline

```
Coverage Metrics (Post-Phase 22.3b):
├── Line Coverage:        ~84% (target: 85%+)
├── Function Coverage:    ~90% (target: 95%+)
├── Branch Coverage:      ~81% (target: 85%+)
├── Total Tests:          1525/1525 passing ✅
└── Test Suites:          33 suites, 100% pass rate ✅
```

---

## Target Modules for Phase 22.3c

### Category 1: Middleware & Error Handling (12-15 tests)

**Location:** `src/middleware/errorHandler.js`  
**Current Coverage:** ~45% (major gaps in error handling branches)  
**Key Areas:**
- Exception type discrimination (Discord.js vs database vs validation errors)
- Error logging and reporting flows
- Retry logic branches and decision trees
- Error message formatting for different environments
- Stack trace handling and redaction
- Production vs development error masking

**Branch Gaps Identified:** 17 branches
- Error type checking (8 branches)
- Logging level decisions (4 branches)
- Retry vs fail decisions (3 branches)
- Production error masking (2 branches)

**Expected Improvement:** 45% → 75% coverage

---

### Category 2: Input Validation & Validators (8-12 tests)

**Locations:**
- `src/middleware/inputValidator.js`
- `src/services/ValidationService.js`

**Current Coverage:** ~60% (missing edge cases, special character handling)  
**Key Areas:**
- Unicode and emoji validation
- Null/undefined/empty value branches
- Type coercion and strict typing paths
- Range and length boundary conditions
- Invalid input combinations
- Whitespace and control character handling

**Branch Gaps Identified:** 14 branches
- Type validation switch cases (6 branches)
- Edge case handling (5 branches)
- Error message generation (3 branches)

**Expected Improvement:** 60% → 85% coverage

---

### Category 3: Response Helpers - Edge Cases (5-8 tests)

**Location:** `src/utils/helpers/response-helpers.js`  
**Current Coverage:** ~75% (missing error formatting branches)  
**Key Areas:**
- Long text truncation logic branches
- Embed size and field limits
- Maximum field value handling
- Error message formatting variations
- Null embed/content edge cases

**Branch Gaps Identified:** 9 branches
- Truncation conditions (4 branches)
- Embed field limits (3 branches)
- Error handling (2 branches)

**Expected Improvement:** 75% → 90% coverage

---

## Implementation Strategy

### Phase 1: Architecture & Setup (Jan 14, Morning)
- [ ] Analyze error handler source code
- [ ] Identify all error paths and branches
- [ ] Create mock objects for error scenarios
- [ ] Set up test file structure

### Phase 2: Middleware & Error Handling Tests (Jan 14, Afternoon)
- [ ] Test Discord.js specific error handling
- [ ] Test database error handling
- [ ] Test validation error handling
- [ ] Test logging configuration branches
- [ ] Test retry logic paths
- [ ] Test error message formatting
- Target: 12-15 passing tests

### Phase 3: Validators Tests (Jan 14, Evening)
- [ ] Test type validation branches
- [ ] Test boundary conditions
- [ ] Test special character combinations
- [ ] Test null/undefined handling
- [ ] Test validation message variations
- Target: 8-12 passing tests

### Phase 4: Response Helpers Tests (Jan 15, Morning)
- [ ] Test truncation logic branches
- [ ] Test embed size limits
- [ ] Test field maximum handling
- [ ] Test error response variations
- Target: 5-8 passing tests

### Phase 5: Validation & Reporting (Jan 15, Afternoon)
- [ ] Run full test suite
- [ ] Verify all new tests pass
- [ ] Check coverage metrics
- [ ] Validate no regressions
- [ ] ESLint compliance check

---

## Success Criteria

### Test Implementation
- ✅ 25-35 new tests created
- ✅ All new tests passing (100% pass rate)
- ✅ Zero test flakiness
- ✅ Comprehensive documentation

### Coverage Metrics
- ✅ Line coverage ≥ 85%
- ✅ Function coverage ≥ 95%
- ✅ Branch coverage ≥ 85%
- ✅ No coverage regressions from Phase 22.3a/b

### Code Quality
- ✅ ESLint 100% compliance (0 errors, 0 warnings)
- ✅ Pre-commit checks passing
- ✅ No console warnings or errors

### Regression Testing
- ✅ All 1525 existing tests still passing
- ✅ No breaking changes to existing functionality
- ✅ All imports from correct locations (no deprecated paths)

---

## Test File Structure

Three comprehensive test files will be created:

```
tests/unit/middleware/
├── test-middleware-error-handler-coverage.test.js (12-15 tests)
│   ├── Error type discrimination (6 tests)
│   ├── Logging configuration (3 tests)
│   ├── Retry logic (2 tests)
│   └── Production error masking (1-3 tests)

tests/unit/middleware/
├── test-validators-coverage.test.js (8-12 tests)
│   ├── Type validation (4 tests)
│   ├── Boundary conditions (3 tests)
│   ├── Special characters (2 tests)
│   └── Edge cases (1-3 tests)

tests/unit/utils/
└── test-response-helpers-edge-cases-coverage.test.js (5-8 tests)
    ├── Truncation logic (2 tests)
    ├── Embed limits (2 tests)
    └── Error handling (1-2 tests)
```

**Total:** 25-35 tests across 3 files, ~1500-2000 lines of test code

---

## Mock Architecture

Following patterns from Phase 22.3a/b:

```javascript
// Mock implementations for isolated testing
class MockLogger {
  log(level, message) { /* ... */ }
  error(err) { /* ... */ }
  info(msg) { /* ... */ }
}

class MockDiscordError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

// Statistics tracking
class TestableErrorHandler {
  constructor(logger) {
    this.logger = logger;
    this.stats = {
      errorsHandled: 0,
      errorsLogged: 0,
      retriesAttempted: 0
    };
  }
}
```

---

## Coverage Gap Analysis Details

### errorHandler.js Coverage Flow

```
Current: ~45%

Error handling decision tree:
├── Error type check (8 branches)
│   ├── Is DiscordAPIError?  ❌ MISSING
│   ├── Is ValidationError?  ❌ MISSING
│   ├── Is DatabaseError?    ❌ MISSING
│   ├── Is RateLimitError?   ❌ MISSING
│   ├── Is TimeoutError?     ❌ MISSING
│   ├── Is PermissionError?  ❌ MISSING
│   ├── Is Unknown?          ✅ Some coverage
│   └── Error severity?      ❌ MISSING
│
├── Logging level decision (4 branches)
│   ├── Critical → log + alert
│   ├── Error → log + report
│   ├── Warning → log
│   └── Info → silent
│
├── Retry decision (3 branches)
│   ├── Retryable? → schedule retry
│   ├── Permanent? → fail immediately
│   └── Unknown? → exponential backoff
│
└── Error masking (2 branches)
    ├── Production → mask details
    └── Development → expose all

Target: ~75% (+30%)
```

### ValidationService.js Coverage Flow

```
Current: ~60%

Type validation switch (6 branches):
├── string type      ❌ MISSING
├── number type      ✅ Some
├── boolean type     ❌ MISSING
├── array type       ❌ MISSING
├── object type      ❌ MISSING
└── null/undefined   ❌ MISSING

Edge cases (5 branches):
├── Empty string     ❌ MISSING
├── Null input       ✅ Some
├── NaN values       ❌ MISSING
├── Infinity values  ❌ MISSING
└── Mixed types      ❌ MISSING

Target: ~85% (+25%)
```

---

## Timeline

| Phase | Task | Estimated | Status |
|-------|------|-----------|--------|
| 1 | Planning & Setup | Jan 13 | ✅ Complete |
| 2 | Error Handler Tests | Jan 14 AM | ⏳ Pending |
| 3 | Validator Tests | Jan 14 PM | ⏳ Pending |
| 4 | Response Helpers Tests | Jan 15 AM | ⏳ Pending |
| 5 | Validation & Reporting | Jan 15 PM | ⏳ Pending |

**Total Duration:** 2 days (Jan 14-15, 2026)  
**Buffer:** Jan 16 for Phase 22.3d (Edge cases & final push)

---

## Phase 22.3 Complete Timeline

| Phase | Focus | Tests | Coverage | Status |
|-------|-------|-------|----------|--------|
| 22.3a | Critical Services | 130 | ~83% | ✅ Complete |
| 22.3b | Feature Services | 102 | ~84% | ✅ Complete |
| 22.3c | Branch/Function | 25-35 | 85%+ | ⏳ Planning |
| 22.3d | Edge Cases | 15-25 | 87%+ | 🔜 Planned |

**Overall Phase 22.3 Goals:**
- ✅ Create 250+ new tests
- ✅ Achieve 85%+ coverage on all metrics
- ✅ Establish TDD as standard
- ✅ Create comprehensive mock architecture
- ✅ Document naming conventions

---

## Known Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Complex error flows | Incomplete branch coverage | Create detailed flow diagrams |
| Edge case combinations | Missed scenarios | Exhaustive combination testing |
| Performance test timeout | Slow test suite | Optimize mocks, use in-memory DBs |
| Flaky async tests | False failures | Deterministic assertions, proper await |

---

## Related Documents

- [PHASE-22.3-COVERAGE-EXPANSION-PLAN.md](PHASE-22.3-COVERAGE-EXPANSION-PLAN.md) - Overall Phase 22.3 plan
- [PHASE-22.3a-INITIALIZATION-SUMMARY.md](PHASE-22.3a-INITIALIZATION-SUMMARY.md) - Phase 22.3a completion
- [PHASE-22.3b-COMPLETION-REPORT.md](PHASE-22.3b-COMPLETION-REPORT.md) - Phase 22.3b completion
- [DOCUMENT-NAMING-CONVENTION.md](DOCUMENT-NAMING-CONVENTION.md) - Documentation standards
- [CODE-COVERAGE-ANALYSIS-PLAN.md](CODE-COVERAGE-ANALYSIS-PLAN.md) - Overall coverage roadmap

---

**Document Status:** READY FOR IMPLEMENTATION  
**Next Action:** Begin Phase 22.3c testing on Jan 14, 2026  
**Contact:** GitHub Copilot / Development Team
