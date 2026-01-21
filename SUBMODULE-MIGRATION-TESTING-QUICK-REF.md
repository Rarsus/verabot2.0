# Quick Reference: Submodule Migration Testing

**Quick Guide:** Testing compatibility between verabot submodules after repository split.

---

## Quick Start

```bash
# 1. Initialize submodules (if not already done)
git submodule init
git submodule update --recursive

# 2. Install dependencies
npm install

# 3. Run migration compatibility tests
npm test -- tests/integration/test-submodule-migration-compatibility.test.js

# 4. Run all tests
npm test
```

---

## Test Categories (35 tests total)

### ✅ Structure Tests (4)
- Submodule initialization
- Package.json configuration
- Source directories
- Git repositories

### ✅ Module Tests (19)
- verabot-core (6 tests)
- verabot-utils (6 tests)
- verabot-dashboard (4 tests)
- verabot-commands (3 tests)

### ✅ Integration Tests (12)
- Cross-module dependencies (1 test)
- Package.json validation (4 tests)
- Module exports (2 tests)
- Test infrastructure (2 tests)
- Main repo integration (3 tests)

---

## Expected Results

```
Test Suites: 1 passed
Tests:       35 passed
Time:        < 0.5 seconds
```

---

## Dependency Chain

```
verabot-utils (Base)
    ↓
verabot-core → verabot-commands
    ↓
verabot-dashboard
```

---

## Common Issues & Solutions

### Issue: Submodules not initialized
```bash
git submodule init
git submodule update --recursive
```

### Issue: Dependencies not installed
```bash
npm install
cd repos/verabot-core && npm install
cd repos/verabot-utils && npm install
cd repos/verabot-dashboard && npm install
cd repos/verabot-commands && npm install
```

### Issue: Test failures
```bash
# Run specific test with verbose output
npm test -- tests/integration/test-submodule-migration-compatibility.test.js --verbose

# Check test report
cat SUBMODULE-MIGRATION-TEST-REPORT.md
```

---

## Related Documentation

- **Full Report:** SUBMODULE-MIGRATION-TEST-REPORT.md
- **Migration Plan:** EPIC-49-IMPLEMENTATION-PLAN.md
- **Phase Report:** PHASE-2-SUBMODULE-COMPLETION-REPORT.md
- **Dev Strategy:** SUBMODULE-AWARE-DEVELOPMENT-STRATEGY.md

---

## Test File Location

```
tests/integration/test-submodule-migration-compatibility.test.js
```

---

## Status: ✅ COMPLETE

All 35 tests passing. Migration verified and production-ready.
