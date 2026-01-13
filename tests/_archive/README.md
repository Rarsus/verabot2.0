# Archived Tests - Historical Reference

**Purpose:** This directory contains historical test files from earlier phases of development. These tests are intentionally excluded from the main test suite but preserved for reference and project history tracking.

---

## Why These Tests Are Archived

1. **Superseded by New Tests** - Functionality has been re-tested using modern patterns
2. **Phase-Based Legacy** - Old phase numbering system (Phase 5, 10, 18, 19, etc.) no longer in use
3. **Historical Record** - Preserved to track how testing evolved across project phases
4. **Pattern Examples** - Show how testing practices improved over time

---

## Naming Conventions in Archive

### Phase-Based Naming: `phase[N]-[descriptor].test.js`

**Examples:**
- `phase10-middleware.test.js` - Phase 10 tests for middleware
- `phase13-communication-service.test.js` - Phase 13 communication tests
- `phase17-quote-commands.test.js` - Phase 17 quote command tests
- `phase18-response-helpers-comprehensive.test.js` - Phase 18 comprehensive helpers
- `phase19b-logger-comprehensive.test.js` - Phase 19b logger tests

**Pattern:** `phase{NUMBER}{LETTER?}-{FEATURE}-{SCOPE?}.test.js`

### Jest-Prefixed Legacy: `jest-phase[N]-[descriptor].test.js`

**Examples:**
- `jest-phase5a-reminder-service.test.js` - Phase 5a reminder service
- `jest-phase6c-dashboard-routes.test.js` - Phase 6c dashboard routing
- `jest-phase5d-integration.test.js` - Phase 5d integration tests

**Pattern:** `jest-phase{NUMBER}{LETTER}-{FEATURE}.test.js`

---

## Current Test Organization

These archived files have been replaced by the modern convention in active test suite:

| Archived Phase-Based | Current Test-Based Equivalent |
|---|---|
| phase18-response-helpers-comprehensive.test.js | tests/unit/test-response-helpers-edge-cases.test.js |
| phase19b-logger-comprehensive.test.js | tests/unit/test-logger.test.js |
| phase13-communication-service.test.js | tests/services/test-communication-service.test.js |
| jest-phase5a-reminder-service.test.js | tests/services/test-reminder-service.test.js |

---

## How These Are Excluded

**Jest Configuration** (`jest.config.js`):
```javascript
testPathIgnorePatterns: [
  '/node_modules/',
  '/dashboard/',
  '/coverage/',
  'tests/_archive',    // ← Excludes this directory
  'test-security-integration'
]
```

**Result:** Archived tests are NOT executed during `npm test` runs.

**Verification:**
```bash
# These should return NO results:
npm test -- --listTests | grep -i archive
npm test -- --listTests | grep -i phase
```

---

## Organization by Phase

### Phase 5 Tests (8-10 files)
- `jest-phase5a-reminder-service.test.js`
- `jest-phase5a-guild-aware-reminder-service.test.js`
- `jest-phase5a-role-permission-service.test.js`
- `jest-phase5b-error-handler.test.js`
- `jest-phase5b-webhook-listener-service.test.js`
- `jest-phase5c-command-base.test.js`
- `jest-phase5c-quote-service.test.js`
- `jest-phase5d-dashboard.test.js`
- `jest-phase5d-integration.test.js`

### Phase 6 Tests (4 files)
- `jest-phase6a-database-services.test.js`
- `jest-phase6b-command-implementations.test.js`
- `jest-phase6c-dashboard-routes.test.js`
- `jest-phase6d-coverage-improvements.test.js`

### Phase 10-19 Tests (20+ files)
Organized chronologically by phase number (10, 13, 14, 17, 18, 19a, 19b, 19c)

---

## Using Archived Tests

### When to Reference Archived Tests

✅ **DO reference archived tests when:**
- Learning how testing practices evolved
- Understanding historical context of features
- Troubleshooting regressions (comparing old vs new implementations)
- Documenting feature history

### When to Ignore Archived Tests

❌ **DON'T reference archived tests when:**
- Writing new tests (use current convention instead)
- Calculating test metrics (excluded from suite)
- Debugging failures (use current tests)
- Setting up CI/CD (excluded by jest.config.js)

---

## Current Active Test Convention

All **new tests** should follow the modern convention:

**Pattern:** `test-[module-name].test.js`

**Location:** `tests/{unit,integration,services,commands,middleware}/`

**Examples:**
- `tests/unit/test-command-base.test.js`
- `tests/services/test-quote-service.test.js`
- `tests/integration/test-command-execution.test.js`
- `tests/middleware/test-logger.test.js`

---

## Statistics

| Metric | Count |
|--------|-------|
| Total Archived Files | 48 |
| Phase-Based Naming | 39 |
| Jest-Prefixed Naming | 9 |
| Total Archived Tests | ~1,200+ (estimated) |
| Excluded from CI/CD | Yes |
| Used in main test suite | No |

---

## For More Information

- **Test Naming Convention:** See [TEST-FILE-AUDIT-REPORT.md](../../TEST-FILE-AUDIT-REPORT.md)
- **Jest Configuration:** See `jest.config.js` (root level)
- **Current Active Tests:** `tests/{unit,integration,services,commands,middleware}/`

---

**Last Updated:** January 15, 2026  
**Status:** Active (archived tests properly excluded)  
**Maintenance:** Quarterly review recommended
