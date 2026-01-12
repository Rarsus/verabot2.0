# Test Naming Convention Refactoring Guide

**Date**: January 12, 2026  
**Purpose**: Establish consistent, functional naming convention for ALL Jest test files  
**Scope**: All test files across the entire codebase (phases 1-19+, unit tests, integration tests, archived tests)

---

## Current Naming Issue

The codebase has accumulated test files with inconsistent naming patterns across multiple phases and organizational approaches:

```
tests/
├── phase18-command-base-comprehensive.test.js      # Phase-based naming
├── phase19a-cache-manager-comprehensive.test.js    # Phase with letter suffix
├── phase19b-logger-comprehensive.test.js           # Phase-based variant
├── jest-phase8c-library-utilities.test.js          # Jest prefix variant
├── phase17-response-helpers.test.js                # Mixed phase/functional
├── test-github-actions-scripts.js                  # Functional naming
├── _archive/unit/test-*.js                         # Archived tests (some functional)
├── _archive/phase5/jest-phase5a-*.test.js          # Archived phase-based
├── unit/jest-*.test.js                             # Unit subdirectory
└── integration/test-security-integration.test.js   # Integration subdirectory
```

**Problems**:
- **Inconsistent naming**: phase-based (18), jest-prefixed, phase-letter hybrids (19a, 19b), functional (test-*)
- **Inconsistent organization**: Some in `_archive/`, some in `unit/`, some in `integration/`, some in root
- **Maintenance burden**: Phase numbers accumulate and become meaningless (what is "phase 18" relative to today?)
- **Poor discoverability**: Searching for "logger" returns "phase19b-logger-comprehensive.test.js", "jest-phase8c-library-utilities.test.js", etc.
- **Duplicate/legacy code**: Archived tests duplicate functionality from newer tests, causing confusion
- **Mixed conventions**: Some use `.test.js` suffix, some don't; some use `jest-` prefix, some use `test-` prefix

---

## Recommended Naming Convention

### Overall Structure

```
tests/
├── unit/                          # Unit tests (single module, mocked dependencies)
│   ├── test-command-base.test.js
│   ├── test-error-handler.test.js
│   ├── test-logger.test.js
│   ├── test-validation-service.test.js
│   ├── test-cache-manager.test.js
│   ├── test-discord-service.test.js
│   ├── test-quote-service.test.js
│   └── ...
│
├── integration/                   # Integration tests (multiple modules, real interactions)
│   ├── test-database-operations.test.js
│   ├── test-command-execution.test.js
│   ├── test-security-integration.test.js
│   ├── test-reminder-workflow.test.js
│   └── ...
│
├── middleware/                    # Middleware & auth tests
│   ├── test-command-validator.test.js
│   ├── test-dashboard-auth.test.js
│   ├── test-auth-middleware.test.js
│   └── ...
│
├── commands/                      # Command implementation tests
│   ├── test-misc-commands.test.js
│   ├── test-quote-commands.test.js
│   ├── test-admin-commands.test.js
│   └── ...
│
├── services/                      # Service layer tests
│   ├── test-reminder-notification-service.test.js
│   ├── test-database-service.test.js
│   ├── test-guild-database-service.test.js
│   └── ...
│
└── _archive/                      # Deprecated tests (kept for historical reference)
    ├── phase5/
    ├── phase6/
    ├── phase7/
    └── (old tests with temporal naming - not actively maintained)
```

### Format: `test-[module-name].test.js`

**Examples with folder context**:
```
tests/unit/test-command-base.test.js
  ↑      ↑    ↑
  │      │    └─ Consistent prefix: "test-"
  │      └────── Category: unit/
  └──────────── Root: tests/

tests/integration/test-command-execution.test.js
tests/services/test-reminder-notification-service.test.js
tests/commands/test-quote-commands.test.js
tests/middleware/test-dashboard-auth.test.js
```

### Naming Rules

**✅ DO:**
- Use `test-[module-name].test.js` format (prefix `test-`, suffix `.test.js`)
- Use kebab-case for module names: `test-cache-manager.test.js` (not `test-cacheManager.test.js`)
- Place test files in appropriate subdirectory: `unit/`, `integration/`, `services/`, `commands/`, or `middleware/`
- Use singular form for service tests: `test-quote-service.test.js` (not `test-quote-services.test.js`)
- Match the source file name closely: src/services/QuoteService.js → tests/services/test-quote-service.test.js
- Keep module names descriptive but concise (2-4 words maximum)

**❌ DON'T:**
- Include phase numbers (18, 19a, 19b, etc.)
- Include test scope in filename ("comprehensive", "unit", "integration") - let folder location indicate scope
- Use "jest-" prefix (redundant with `.test.js` suffix)
- Mix naming conventions in same directory
- Use underscores: use hyphens instead
- Hardcode absolute file paths - use relative paths
- Create nested subdirectories beyond one level (e.g., `unit/core/` - keep as `unit/`)
- Use `.js` extension alone - always use `.test.js`

### Examples of Correct Naming

| Module Location | Source File | ✅ Correct Test Path | ❌ Incorrect Test Paths |
|---|---|---|---|
| Core utility | src/core/CommandBase.js | tests/unit/test-command-base.test.js | tests/phase18-command-base.test.js<br>tests/jest-command-base.test.js<br>tests/test-CommandBase.js |
| Middleware | src/middleware/logger.js | tests/middleware/test-logger.test.js | tests/phase19b-logger-comprehensive.test.js<br>tests/test-middleware-logger.js |
| Service | src/services/QuoteService.js | tests/services/test-quote-service.test.js | tests/test-quoteService.test.js<br>tests/phase14-quote-service.test.js |
| Auth middleware | src/middleware/dashboard-auth.js | tests/middleware/test-dashboard-auth.test.js | tests/phase19b-dashboard-auth-comprehensive.test.js<br>tests/test-dashboardAuth.test.js |
| Command feature | src/commands/quote-management/add-quote.js | tests/commands/test-add-quote.test.js | tests/phase17-add-quote-command.test.js<br>tests/test-addQuote.js |
| Integration test | (Multiple modules) | tests/integration/test-command-execution.test.js | tests/integration-tests/command-execution.js<br>tests/test-integration-commands.test.js |

### Folder Structure Guidelines

**When to use each folder:**

**`tests/unit/`** - Single module in isolation
- Service methods with mocked dependencies
- Utility functions and helpers
- Middleware individual functions
- Core classes and base classes
- Example: `test-cache-manager.test.js` (mocks external services)

**`tests/integration/`** - Multiple modules working together
- Command execution with database
- Reminder workflow (scheduler + notification + database)
- Security operations across auth + permissions
- Full feature workflows
- Example: `test-command-execution.test.js` (real command + real database)

**`tests/services/`** - Service layer tests
- Business logic in services
- Database interactions
- External service integrations
- Example: `test-reminder-notification-service.test.js`

**`tests/commands/`** - Command implementation tests
- Command parsing and execution
- Option handling
- Permission checking
- Example: `test-quote-commands.test.js`

**`tests/middleware/`** - Middleware and auth tests
- Error handling middleware
- Command validation
- Dashboard authentication
- Example: `test-dashboard-auth.test.js`

**`tests/_archive/`** - Deprecated tests (for reference only)
- Old phase-based tests no longer maintained
- Superseded by newer tests
- Kept for historical/learning purposes
- Not run by CI/CD
- Example: `_archive/phase5/jest-phase5a-role-permission-service.test.js`

---

## Migration Strategy: From Current State to New Convention

### Current State Analysis

**Active test files** (~40-50 files in use):
```
Phase 18 tests (4 files):
  - phase18-command-base-comprehensive.test.js
  - phase18-error-handler-comprehensive.test.js
  - phase18-response-helpers-comprehensive.test.js
  - phase18-validation-service-comprehensive.test.js

Phase 19a tests (2 files):
  - phase19a-cache-manager-comprehensive.test.js
  - phase19a-reminder-notification-service-unit.test.js

Phase 19b tests (3 files):
  - phase19b-logger-comprehensive.test.js
  - phase19b-command-validator-comprehensive.test.js
  - phase19b-dashboard-auth-comprehensive.test.js

Phase 17 tests (6 files):
  - phase17-response-helpers.test.js
  - phase17-database-service.test.js
  - phase17-validation-integration.test.js
  - phase17-reminder-service.test.js
  - phase17-guild-database-service.test.js
  - And others...

Mixed naming (varies by phase)
```

**Archived test files** (~60+ files):
```
tests/_archive/unit/test-*.js
tests/_archive/phase5/jest-phase5a-*.test.js
tests/_archive/phase5/jest-phase5b-*.test.js
tests/_archive/dashboard/test-*.js
... (not run by jest, superseded by newer tests)
```

### Step 1: Create New Directory Structure (1 hour)

```bash
mkdir -p /home/olav/repo/verabot2.0/tests/{unit,integration,services,commands,middleware}
```

### Step 2: Prepare Migration Mapping (1-2 hours)

Create a mapping document of all active test files:

```bash
# List all active test files that need renaming
find tests -maxdepth 1 -name "*.test.js" -o -name "jest-*.test.js" | sort

# Output mapping to file:
echo "SOURCE => TARGET" > MIGRATION_MAPPING.txt
# Example:
# phase18-command-base-comprehensive.test.js => unit/test-command-base.test.js
# phase19b-logger-comprehensive.test.js => middleware/test-logger.test.js
# phase17-database-service.test.js => services/test-database-service.test.js
```

### Step 3: Execute Migration in Batches

**Batch 1: Core Utilities (Unit Tests)** - 4 files

```bash
cd /home/olav/repo/verabot2.0

# Phase 18 core files → unit/
git mv tests/phase18-command-base-comprehensive.test.js tests/unit/test-command-base.test.js
git mv tests/phase18-error-handler-comprehensive.test.js tests/unit/test-error-handler.test.js
git mv tests/phase18-response-helpers-comprehensive.test.js tests/unit/test-response-helpers.test.js
git mv tests/phase18-validation-service-comprehensive.test.js tests/unit/test-validation-service.test.js

# Test this batch
npm test -- tests/unit/

# Commit
git commit -m "refactor: migrate phase18 core tests to functional naming in unit/"
```

**Batch 2: Services** - 3 files

```bash
# Phase 19a services → services/
git mv tests/phase19a-cache-manager-comprehensive.test.js tests/services/test-cache-manager.test.js
git mv tests/phase19a-reminder-notification-service-unit.test.js tests/services/test-reminder-notification-service.test.js
git mv tests/phase14-database-service.test.js tests/services/test-database-service.test.js

# Test this batch
npm test -- tests/services/

# Commit
git commit -m "refactor: migrate service tests to functional naming in services/"
```

**Batch 3: Middleware & Auth** - 3 files

```bash
# Phase 19b middleware → middleware/
git mv tests/phase19b-logger-comprehensive.test.js tests/middleware/test-logger.test.js
git mv tests/phase19b-command-validator-comprehensive.test.js tests/middleware/test-command-validator.test.js
git mv tests/phase19b-dashboard-auth-comprehensive.test.js tests/middleware/test-dashboard-auth.test.js

# Test this batch
npm test -- tests/middleware/

# Commit
git commit -m "refactor: migrate middleware tests to functional naming in middleware/"
```

**Batch 4: Commands** - Files as identified

```bash
# Create commands test directory if files exist
git mv tests/phase17-quote-commands.test.js tests/commands/test-quote-commands.test.js
git mv tests/phase17-reminder-commands.test.js tests/commands/test-reminder-commands.test.js
git mv tests/phase17-admin-preference-commands.test.js tests/commands/test-admin-commands.test.js

# Test this batch
npm test -- tests/commands/

# Commit
git commit -m "refactor: migrate command tests to functional naming in commands/"
```

**Batch 5: Integration Tests** - As identified

```bash
# Move integration tests
git mv tests/integration/test-security-integration.test.js tests/integration/test-security-integration.test.js
# Rename if needed to match pattern

# Test this batch
npm test -- tests/integration/

# Commit
git commit -m "refactor: migrate integration tests to functional naming in integration/"
```

### Step 4: Update Jest Configuration

**Update `jest.config.js`:**

```javascript
module.exports = {
  testEnvironment: 'node',

  // Updated test patterns for new folder structure
  testMatch: [
    'tests/unit/**/*.test.js',
    'tests/integration/**/*.test.js',
    'tests/services/**/*.test.js',
    'tests/commands/**/*.test.js',
    'tests/middleware/**/*.test.js',
  ],

  // Keep archive ignored
  testPathIgnorePatterns: ['/node_modules/', 'tests/_archive'],

  // Rest of config...
};
```

### Step 5: Update npm Scripts

**Update `package.json`:**

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest tests/unit/",
    "test:integration": "jest tests/integration/",
    "test:services": "jest tests/services/",
    "test:commands": "jest tests/commands/",
    "test:middleware": "jest tests/middleware/",
    "test:all-active": "jest tests/{unit,integration,services,commands,middleware}/"
  }
}
```

### Step 6: Update Documentation

Files to update:
- `README.md` - Test execution examples with new folder structure
- `CONTRIBUTING.md` - Updated test file naming guidelines
- `docs/guides/02-TESTING-GUIDE.md` - New test organization
- `docs/reference/TDD-QUICK-REFERENCE.md` - Folder structure examples
- All phase documentation files that reference test file names
- CI/CD configuration (GitHub Actions, etc.)

### Step 7: Handle Archived Tests

```bash
# Archived tests already in tests/_archive/ - no changes needed
# These are superseded and not run by CI/CD

# Document in CHANGELOG.md:
# - Archived phase 5-7 tests are retained for historical reference
# - Not executed in CI/CD (excluded by jest.config.js)
# - Can be reviewed for learning purposes but not maintained
```

### Step 8: Verify Everything Works

```bash
# Full verification
npm test                                    # Should run all new tests
npm test -- tests/unit/                     # Should find unit tests
npm test -- tests/integration/              # Should find integration tests
npm test -- --listTests                     # Verify discovery
npm test -- --coverage                      # Verify coverage still works

# Check specific test suites work
npm run test:unit
npm run test:integration
npm run test:services
npm run test:middleware
npm run test:commands

# Verify archive is ignored
npm test 2>&1 | grep "_archive"             # Should NOT appear in run output
```

### Step 9: Commit Final Changes

```bash
# After all migrations and verifications pass:
git add jest.config.js package.json
git commit -m "chore: update jest configuration for new test structure

- Updated testMatch patterns for new folder structure
- Added npm scripts for category-specific test execution
- jest.config.js continues to ignore _archive/ directory
- All 40+ active tests migrated, coverage maintained"

git log --oneline | head -10
# Should show clean series of refactor commits
```

---

## Future Test Organization

The new folder structure accommodates growth:

```
tests/
├── unit/                          # Small, isolated tests (10-15 test files)
│   ├── test-command-base.test.js
│   ├── test-error-handler.test.js
│   ├── test-cache-manager.test.js
│   ├── test-query-builder.test.js
│   └── test-datetime-parser.test.js
│
├── integration/                   # Feature workflow tests (3-5 test files)
│   ├── test-command-execution.test.js
│   ├── test-reminder-workflow.test.js
│   ├── test-database-operations.test.js
│   ├── test-security-integration.test.js
│   └── test-bot-startup.test.js
│
├── services/                      # Business logic tests (8-12 test files)
│   ├── test-quote-service.test.js
│   ├── test-database-service.test.js
│   ├── test-reminder-notification-service.test.js
│   ├── test-discord-service.test.js
│   ├── test-validation-service.test.js
│   └── ...
│
├── commands/                      # Command implementation tests (4-6 test files)
│   ├── test-quote-commands.test.js
│   ├── test-reminder-commands.test.js
│   ├── test-admin-commands.test.js
│   ├── test-misc-commands.test.js
│   └── ...
│
├── middleware/                    # Middleware & auth tests (3-5 test files)
│   ├── test-logger.test.js
│   ├── test-command-validator.test.js
│   ├── test-dashboard-auth.test.js
│   ├── test-error-handler.test.js
│   └── ...
│
└── _archive/                      # Historical reference (not maintained)
    ├── phase5/
    ├── phase6/
    ├── phase7/
    └── ...
```

This structure supports 30-50 active test files organized by function. No further reorganization needed at this scale.

---

## Benefits of This Change

### Improved Discoverability & Organization

```bash
# BEFORE: Confusing scattered naming and locations
$ find tests -maxdepth 1 -name "*.test.js" | grep logger
tests/phase19b-logger-comprehensive.test.js     # One location
tests/_archive/unit/test-middleware-logger.js   # Another location?
# Which one is current? Which one is archived?

# AFTER: Crystal clear organization
$ ls tests/middleware/ | grep logger
test-logger.test.js                             # Only one, obviously current
# Archived tests in tests/_archive/ are clearly separated
```

### Better grep/Search Results

```bash
# BEFORE: Noisy results with inconsistent naming
$ grep -r "logger" tests/ --include="*.test.js"
tests/phase19b-logger-comprehensive.test.js    # Main test
tests/_archive/unit/test-middleware-logger.js  # Archive (confusing)
tests/jest-setup.js                             # Unrelated (noise)

# AFTER: Focused results
$ grep -r "logger" tests/unit tests/middleware tests/integration
tests/middleware/test-logger.test.js             # Exactly what we need
# Archives explicitly excluded from search scope
```

### Cleaner npm Scripts

```bash
# BEFORE
npm test -- tests/phase18*.test.js tests/phase17*.test.js tests/phase14*.test.js
# Hard to remember, hard to maintain

# AFTER
npm run test:unit           # All unit tests
npm run test:integration    # All integration tests
npm run test:services       # All service layer tests
npm run test:middleware     # All middleware/auth tests
npm run test:commands       # All command tests
# Clear, memorable, easy to maintain
```

### Maintainability & Sustainability

- ✅ **Phase-independent**: Tests don't need renaming as phases progress
- ✅ **Purpose-driven**: Folder and file names reflect function, not history
- ✅ **Scalable**: Can easily add more folders as test suite grows
- ✅ **Archival clarity**: Deprecated tests explicitly in `_archive/`, not mixed with active tests
- ✅ **Team onboarding**: New contributors understand test organization immediately

### Git History & Blame

```bash
# BEFORE: Phase numbers obscure actual content
git log --oneline | grep phase18
# hard to understand what changed

# AFTER: Purpose is clear
git log --oneline | grep "test-command-base"
# Obviously about command base testing
```

---

## Implementation Checklist

**Phase 1: Planning & Preparation** (~1 hour)
- [ ] Document current test file locations and naming patterns
- [ ] Create complete mapping of current → new file names
- [ ] Review jest.config.js for required updates
- [ ] Review package.json for npm script updates
- [ ] Get team agreement on new structure

**Phase 2: Create Directory Structure** (~15 minutes)
- [ ] Create `tests/unit/` directory
- [ ] Create `tests/integration/` directory
- [ ] Create `tests/services/` directory
- [ ] Create `tests/commands/` directory
- [ ] Create `tests/middleware/` directory
- [ ] Verify `tests/_archive/` exists with existing archived tests

**Phase 3A: Migrate Core Tests - Batch 1** (~30 minutes)
- [ ] Move phase18 tests → `unit/` with new names
- [ ] Run: `npm test -- tests/unit/`
- [ ] Verify all tests pass
- [ ] Commit with message about batch

**Phase 3B: Migrate Services - Batch 2** (~30 minutes)
- [ ] Move phase19a & 14 tests → `services/` with new names
- [ ] Run: `npm test -- tests/services/`
- [ ] Verify all tests pass
- [ ] Commit with message about batch

**Phase 3C: Migrate Middleware - Batch 3** (~30 minutes)
- [ ] Move phase19b tests → `middleware/` with new names
- [ ] Run: `npm test -- tests/middleware/`
- [ ] Verify all tests pass
- [ ] Commit with message about batch

**Phase 3D: Migrate Commands & Integration - Batch 4-5** (~1 hour)
- [ ] Move phase17 command tests → `commands/`
- [ ] Move integration tests → `integration/`
- [ ] Run: `npm test -- tests/commands/ tests/integration/`
- [ ] Verify all tests pass
- [ ] Commit with message about batch

**Phase 4: Update Configuration** (~30 minutes)
- [ ] Update `jest.config.js` testMatch patterns
- [ ] Update `jest.config.js` testPathIgnorePatterns
- [ ] Update `package.json` npm scripts for category tests
- [ ] Test: `npm test` runs all active tests
- [ ] Test: `npm run test:unit` runs only unit tests
- [ ] Commit configuration changes

**Phase 5: Update Documentation** (~1 hour)
- [ ] Update `README.md` test examples
- [ ] Update `CONTRIBUTING.md` test guidelines
- [ ] Update `docs/guides/02-TESTING-GUIDE.md`
- [ ] Update `docs/reference/TDD-QUICK-REFERENCE.md`
- [ ] Update any CI/CD files (GitHub Actions, etc.)
- [ ] Commit documentation changes

**Phase 6: Verify & Validate** (~30 minutes)
- [ ] Run full test suite: `npm test`
- [ ] Verify coverage: `npm test -- --coverage`
- [ ] Verify no archived tests run: `npm test 2>&1 | grep _archive` (should be empty)
- [ ] Test category scripts: `npm run test:unit`, `npm run test:services`, etc.
- [ ] Verify test count hasn't changed
- [ ] Verify coverage metrics haven't decreased

**Phase 7: Final Documentation** (~30 minutes)
- [ ] Create MIGRATION-SUMMARY.md documenting what was done
- [ ] Update CHANGELOG.md with migration details
- [ ] List all renamed files in summary
- [ ] Include before/after structure comparison

**TOTAL TIME ESTIMATE: 4-5 hours** (mostly execution, some waiting for tests to run)

---

## Timeline Estimate

| Phase | Task | Time | Difficulty |
|-------|------|------|-----------|
| 1 | Planning & documentation | 1 hour | Low |
| 2 | Create directory structure | 15 min | Very Low |
| 3A | Migrate & test batch 1 (Core) | 30 min | Low |
| 3B | Migrate & test batch 2 (Services) | 30 min | Low |
| 3C | Migrate & test batch 3 (Middleware) | 30 min | Low |
| 3D | Migrate & test batch 4-5 (Commands/Integration) | 1 hour | Low |
| 4 | Update configuration | 30 min | Low |
| 5 | Update documentation | 1 hour | Low |
| 6 | Verify & validate | 30 min | Low |
| 7 | Final documentation | 30 min | Low |
| **TOTAL** | **All phases** | **4-5 hours** | **Low** |

Key insight: Most time is waiting for tests to run, not actual file operations. Can be compressed to 2-3 hours if done in parallel.

---

## Example Migration Script

If you prefer automated migration (use with caution - test thoroughly):

```bash
#!/bin/bash
# migrate-all-tests.sh
# Automated test file migration with phase-based execution

set -e  # Exit on error

cd /home/olav/repo/verabot2.0

echo "=== Phase 1: Creating directory structure ==="
mkdir -p tests/{unit,integration,services,commands,middleware}

echo "=== Phase 2: Verifying current state ==="
echo "Current test files:"
find tests -maxdepth 1 -name "*.test.js" -o -name "jest-*.test.js" | wc -l

echo ""
echo "=== Phase 3A: Migrating core utilities to unit/ ==="
git mv tests/phase18-command-base-comprehensive.test.js tests/unit/test-command-base.test.js
git mv tests/phase18-error-handler-comprehensive.test.js tests/unit/test-error-handler.test.js
git mv tests/phase18-response-helpers-comprehensive.test.js tests/unit/test-response-helpers.test.js
git mv tests/phase18-validation-service-comprehensive.test.js tests/unit/test-validation-service.test.js
npm test -- tests/unit/ && echo "✅ Batch 1 passed"
git commit -m "refactor: migrate phase18 core tests to unit/ with functional naming"

echo ""
echo "=== Phase 3B: Migrating services to services/ ==="
git mv tests/phase19a-cache-manager-comprehensive.test.js tests/services/test-cache-manager.test.js
git mv tests/phase19a-reminder-notification-service-unit.test.js tests/services/test-reminder-notification-service.test.js
git mv tests/phase14-database-service.test.js tests/services/test-database-service.test.js
npm test -- tests/services/ && echo "✅ Batch 2 passed"
git commit -m "refactor: migrate service tests to services/ with functional naming"

echo ""
echo "=== Phase 3C: Migrating middleware to middleware/ ==="
git mv tests/phase19b-logger-comprehensive.test.js tests/middleware/test-logger.test.js
git mv tests/phase19b-command-validator-comprehensive.test.js tests/middleware/test-command-validator.test.js
git mv tests/phase19b-dashboard-auth-comprehensive.test.js tests/middleware/test-dashboard-auth.test.js
npm test -- tests/middleware/ && echo "✅ Batch 3 passed"
git commit -m "refactor: migrate middleware tests to middleware/ with functional naming"

echo ""
echo "=== Phase 3D: Migrating commands and integration tests ==="
# Add specific file moves as needed for your repository
npm test -- tests/commands/ tests/integration/ && echo "✅ Batch 4-5 passed"
git commit -m "refactor: migrate command and integration tests with functional naming"

echo ""
echo "=== Phase 4: Updating configuration ==="
# Update jest.config.js and package.json manually or via sed
echo "Please update jest.config.js and package.json manually"

echo ""
echo "=== Phase 6: Final verification ==="
npm test
npm run test:coverage
echo "✅ All tests passed"

echo ""
echo "=== Migration complete! ==="
git log --oneline | head -10
```

**Usage:**

```bash
# Make executable
chmod +x migrate-all-tests.sh

# Run migration (review before executing!)
./migrate-all-tests.sh

# If something goes wrong, rollback:
git reset --hard HEAD~N  # N = number of commits to undo
```

**⚠️ WARNING**: Review the script and test it in a safe environment first!

---

## FAQ

**Q: Will this break my CI/CD pipeline?**  
A: Only if your CI explicitly references `phase*.test.js` patterns. Update the pattern to `test-*.js` and you're good.

**Q: What about existing commits that reference the old names?**  
A: Git preserves full history. Old commits still reference the original files. This is intentional - we're moving forward with better naming.

**Q: Should I rename test directories too?**  
A: Not at this stage. Keep tests in the root `tests/` directory until we exceed ~50 files, then organize by category (unit/, integration/, etc.).

**Q: What about tests for tests?**  
A: Follow the same convention: `test-test-utils.js` if needed (though testing tests is rare).

**Q: Can I do this migration incrementally?**  
A: Yes, but not recommended. Better to do one atomic commit with all 9 files. The small risk is outweighed by clean history.

---

## Recommendation & Implementation Timeline

### When to Implement

**I recommend executing this migration in phases:**

**PHASE 19 COMPLETION** (Immediate - After current phase finishes)
- ✅ Execute migration as Phase 19 concludes
- ✅ All active tests created and working
- ✅ Fresh git history from phase completion
- ✅ Before starting Phase 20 or new features
- ✅ Team familiar with testing from Phase 19 work

**Benefits of this timing:**
- Captures all Phase 19 tests in migration (test files are fresh in minds)
- Clean transition point between phases
- No active feature work interrupted
- Clear git history: Phase 19 work → Test naming refactor → Next work
- Maximizes efficiency (don't add more test files before migrating existing ones)

### Implementation Approach

**Recommended: Batch-based migration (5 batches over 2 days)**

**Day 1: Core infrastructure (3 hours)**
- Batch 1: Core utilities (phase18) → unit/
- Batch 2: Services → services/
- Batch 3: Middleware → middleware/
- Configure jest & npm scripts
- Commit all changes

**Day 2: Complete features (2 hours)**
- Batch 4: Commands → commands/
- Batch 5: Integration → integration/
- Update all documentation
- Final verification
- Commit summary

**Minimal disruption:**
- No code changes (only file renames via `git mv`)
- Tests remain identical in functionality
- Coverage metrics unchanged
- Can rollback if issues: `git reset --hard origin/main`

### Success Criteria

After migration completion, verify:

✅ All 40+ active tests still in tests/ (not in _archive/)  
✅ All tests organized into appropriate folders (unit/, services/, etc.)  
✅ All tests named as `test-[module-name].test.js`  
✅ jest.config.js updated with new testMatch patterns  
✅ npm scripts support category-specific test execution  
✅ All documentation updated  
✅ `npm test` runs all active tests (40+)  
✅ `npm run test:unit/services/commands/middleware/integration` works  
✅ Tests in `_archive/` are explicitly excluded from runs  
✅ 100% test pass rate maintained  
✅ Coverage metrics maintained or improved  

### Expected Outcomes

**Before Migration:**
```
tests/
├── phase18-command-base-comprehensive.test.js
├── phase19a-cache-manager-comprehensive.test.js
├── phase19b-logger-comprehensive.test.js
├── phase14-database-service.test.js
├── phase17-quote-commands.test.js
├── ... (40+ files scattered with phase numbers)
└── _archive/unit/test-*.js (60+ archived files)
```

**After Migration:**
```
tests/
├── unit/test-*.test.js (10+ files)
├── services/test-*.test.js (8+ files)
├── middleware/test-*.test.js (3+ files)
├── commands/test-*.test.js (4+ files)
├── integration/test-*.test.js (3+ files)
└── _archive/... (60+ archived, unchanged, excluded from runs)
```

**Result:**
- ✅ Clear organization by function
- ✅ Consistent naming across all tests
- ✅ Easy to find and navigate tests
- ✅ Easy to run category-specific tests
- ✅ Scalable for future growth
- ✅ Professional, maintainable structure
