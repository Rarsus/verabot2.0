# Phase 22.4: Scripts Folder Refactoring & Improvements

**Objective:** Modernize and improve the scripts folder to fix deprecated module references, inconsistent patterns, and missing functionality.

**Status:** IN PROGRESS (Branch: `feature/phase-22.4-scripts-refactoring`)

**Timeline:** 2-3 weeks (6-9 hours of work)

**Related Documentation:**
- [SCRIPTS-ANALYSIS-REPORT.md](./SCRIPTS-ANALYSIS-REPORT.md) - Detailed findings
- [SCRIPTS-REFACTORING-GUIDE.md](./SCRIPTS-REFACTORING-GUIDE.md) - Step-by-step implementation
- [scripts/README.md](./scripts/README.md) - Script documentation

---

## Phase Goals

### ✅ Completed: Coverage System Replacement

**Deliverable:** Unified coverage reporting script (scripts/coverage-unified.js)

**What was done:**
- Created `scripts/coverage-unified.js` - New unified coverage system
- Reports coverage of **ALL non-archived test files** (44 test files)
- Provides inventory of all active test files by category
- Supports multiple modes: report, validate, baseline, compare, all
- Updated package.json to use new unified script
- Removed dependency on fragmented coverage-tracking.js and validate-coverage.js

**NPM Scripts Updated:**
```bash
npm run coverage:report   # Generate and display coverage report
npm run coverage:validate # Validate against targets
npm run coverage:baseline # Set coverage baseline
npm run coverage:compare  # Compare to baseline
npm run coverage:all      # Full comprehensive report
```

**Test File Inventory Generated:**
- Total Active Test Files: 44
- Categories: unit (35), integration (3), root (6)
- Total test code: ~2.3 MB
- All non-archived test files included in coverage

---

## Implementation Plan

### Phase 1: Critical Fixes (1-2 hours) [IN PROGRESS]

#### Task 1.1: Fix Deprecated Module References
**Status:** READY TO IMPLEMENT
**Files Affected:**
- `test-imports.js` - Uses deprecated `src/db`
- `test-quotes.js` - Uses deprecated `src/db`
- `test-quotes-advanced.js` - Uses deprecated `src/db`
- `test-communication-service.js` - Old test format

**What needs fixing:**
```javascript
// OLD (DEPRECATED)
const db = require('../src/db');
await db.getQuote(id);

// NEW (CORRECT)
const QuoteService = require('../src/services/QuoteService');
const GuildAwareDatabaseService = require('../src/services/GuildAwareDatabaseService');
const quoteService = new QuoteService(db);
await quoteService.getQuoteById(guildId, id);
```

**Action Items:**
- [ ] Replace deprecated `src/db` with appropriate service imports
- [ ] Update function calls to use new service API
- [ ] Verify tests still pass
- [ ] Document any breaking changes

**Effort:** 30 minutes

---

#### Task 1.2: Modernize Command Validation (run-tests.js)
**Status:** READY TO IMPLEMENT
**File:** `scripts/run-tests.js`

**Current Issues:**
- Only checks for method existence
- Doesn't validate CommandBase inheritance
- Doesn't check proper command registration with `.register()`

**What needs to be done:**
```javascript
// Add validation for CommandBase inheritance
const CommandBase = require('../src/core/CommandBase');

function validateCommand(cmd) {
  // Check 1: Extends CommandBase or is registered instance
  const isCommand = cmd instanceof CommandBase || 
                    cmd.constructor.name === 'Command';
  
  // Check 2: Has required methods
  const hasExecute = typeof cmd.execute === 'function';
  const hasInteraction = typeof cmd.executeInteraction === 'function';
  
  // Check 3: Has been properly registered
  const isRegistered = cmd.register !== undefined;
  
  return isCommand && hasExecute && hasInteraction && isRegistered;
}
```

**Action Items:**
- [ ] Update validation logic to check CommandBase inheritance
- [ ] Add check for `.register()` method
- [ ] Test against all existing commands
- [ ] Update error messages to be more descriptive

**Effort:** 30 minutes

---

#### Task 1.3: Fix generate-test-docs.js for Jest Format
**Status:** READY TO IMPLEMENT
**File:** `scripts/generate-test-docs.js`

**Current Issues:**
- Parses old test format (// Test N: comments)
- References test files that no longer exist
- Not compatible with modern Jest describe/it blocks

**What needs to be done:**
```javascript
// Parse Jest format instead of old format
function parseJestTests(content) {
  const tests = [];
  
  // Parse describe blocks
  const describeRegex = /describe\s*\(\s*['"`]([^'"`]+)['"`]/g;
  let match;
  while ((match = describeRegex.exec(content))) {
    tests.push({
      type: 'describe',
      name: match[1],
    });
  }
  
  // Parse it/test blocks
  const itRegex = /it\s*\(\s*['"`]([^'"`]+)['"`]/g;
  while ((match = itRegex.exec(content))) {
    tests.push({
      type: 'test',
      name: match[1],
    });
  }
  
  return tests;
}
```

**Action Items:**
- [ ] Rewrite to parse Jest describe/it blocks
- [ ] Scan active test files (tests/unit/, tests/integration/)
- [ ] Generate documentation index
- [ ] Test output format

**Effort:** 45 minutes

---

#### Task 1.4: Create Configuration System (.scripts-config.json)
**Status:** READY TO IMPLEMENT
**File:** `.scripts-config.json` (already created)

**What was provided:**
```json
{
  "coverage": {
    "statements": 90,
    "branches": 85,
    "functions": 95,
    "lines": 90
  },
  "paths": {
    "coverage": "coverage/",
    "tests": "tests/",
    "docs": "docs/",
    "commands": "src/commands/",
    "services": "src/services/"
  },
  "validation": {
    "checkLinks": true,
    "checkVersion": true,
    "checkCommands": true
  },
  "output": {
    "useColor": true,
    "verbose": false,
    "timestamps": false
  }
}
```

**Action Items:**
- [ ] Update scripts to read .scripts-config.json
- [ ] Replace hardcoded values with config values
- [ ] Test configuration loading

**Effort:** 30 minutes

**Total Phase 1 Time:** 2 hours (can be parallelized)

---

### Phase 2: Important Improvements (2-3 hours)

#### Task 2.1: Archive Obsolete Test Scripts
**Status:** READY TO IMPLEMENT
**Files to Archive (8 total):**
- `scripts/test-command-base.js`
- `scripts/test-command-options.js`
- `scripts/test-communication-service.js`
- `scripts/test-quotes-advanced.js`
- `scripts/test-quotes.js`
- `scripts/test-response-helpers.js`
- `scripts/test-integration-refactor.js`
- `scripts/test-summary.js`

**Why:**
- These are old manual TDD tests from Phase 22.0-22.1
- Replaced by Jest test suite (1922+ passing tests in tests/)
- Keep historical reference by archiving

**Bash Commands:**
```bash
mkdir -p _archive/scripts/old-manual-tests
mv scripts/test-*.js _archive/scripts/old-manual-tests/
git add _archive/scripts/old-manual-tests/
git commit -m "Archive: Move old manual test scripts to _archive"
```

**Action Items:**
- [ ] Create _archive/scripts/old-manual-tests/ directory
- [ ] Move 8 test-*.js files to archive
- [ ] Create README in archive directory explaining purpose
- [ ] Commit changes

**Effort:** 15 minutes

---

#### Task 2.2: Enhance Error Handling Across Scripts
**Status:** READY TO IMPLEMENT
**Affected Files:** All utility scripts

**Current Issues:**
- Inconsistent error handling patterns
- Generic error messages
- No graceful degradation

**What needs improvement:**
```javascript
// BEFORE (generic)
try {
  const summary = JSON.parse(fs.readFileSync(file, 'utf8'));
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

// AFTER (specific, helpful)
try {
  const summary = JSON.parse(fs.readFileSync(file, 'utf8'));
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error(`${colors.red}❌ Coverage report not found${colors.reset}`);
    console.error(`${colors.dim}Run: npm run test:coverage${colors.reset}`);
  } else if (error instanceof SyntaxError) {
    console.error(`${colors.red}❌ Invalid JSON in coverage report${colors.reset}`);
  } else {
    console.error(`${colors.red}❌ Failed to read coverage report:${colors.reset}`, error.message);
  }
  process.exit(1);
}
```

**Action Items:**
- [ ] Add error type detection (ENOENT, SyntaxError, etc.)
- [ ] Provide helpful suggestions in error messages
- [ ] Add recovery/fallback options where possible
- [ ] Test error paths

**Effort:** 45 minutes

---

#### Task 2.3: Integrate Shared Utilities Module
**Status:** READY TO IMPLEMENT
**New Module:** `scripts/lib/utils.js` (already created)

**Available Functions:**
- `success(msg)` - Green success message
- `error(msg, exit=true)` - Red error message
- `warning(msg)` - Yellow warning message
- `info(msg)` - Cyan info message
- `header(text)` - Bold header with underline
- `subheader(text)` - Bold subheader
- `formatPercent(val)` - Format as percentage
- `formatTable(data)` - Format as table
- `progressBar(current, total)` - Display progress
- `readJSON(path)` - Safe JSON read
- `writeJSON(path, data)` - Safe JSON write
- `safeRequire(module, fallback)` - Safe require with fallback
- `runScript(name, fn)` - Execute script with error handling
- `execAsync(command)` - Execute shell command
- `exit(code)` - Exit with code
- `isCI()` - Detect CI environment
- `shouldUseColor()` - Check if color output is appropriate

**Integration Steps:**
1. Add `const utils = require('./lib/utils');` to scripts
2. Replace `console.log()` with `utils.info()`, `utils.success()`, etc.
3. Replace direct file operations with `utils.readJSON()`, `utils.writeJSON()`
4. Test each script after integration

**Scripts to Update (priority order):**
1. coverage-tracking.js
2. validate-coverage.js
3. run-tests.js
4. generate-test-docs.js
5. Other utilities

**Effort:** 60 minutes

---

#### Task 2.4: Add Dry-Run Mode Support
**Status:** READY TO IMPLEMENT
**Affected Scripts:** File-writing and database scripts

**Scripts needing dry-run:**
- Database migration scripts (db/migrate.js, db/rollback.js)
- Documentation update scripts (update-badges.js)
- Any script that modifies files

**Implementation Pattern:**
```javascript
const isDryRun = process.argv.includes('--dry-run');

if (!isDryRun) {
  fs.writeFileSync(filePath, content);
  console.log(`${colors.green}✅ Updated ${filePath}${colors.reset}`);
} else {
  console.log(`${colors.cyan}🔍 DRY RUN:${colors.reset} Would update ${filePath}`);
  console.log(`${colors.dim}${content.substring(0, 100)}...${colors.reset}`);
}
```

**Action Items:**
- [ ] Add --dry-run flag support to file-writing scripts
- [ ] Test dry-run mode (verify no files written)
- [ ] Test normal mode (verify files written)
- [ ] Document in script usage

**Effort:** 30 minutes

**Total Phase 2 Time:** 2.5 hours

---

### Phase 3: Enhancements (3-4 hours)

#### Task 3.1: Add Unit Tests for Critical Scripts
**Status:** READY TO IMPLEMENT
**New Test Directory:** `tests/unit/scripts/`

**Scripts to test (priority order):**
1. `scripts/lib/utils.js` - Core utility module (22+ functions)
2. `scripts/coverage-unified.js` - Coverage reporting
3. `scripts/validate-commands.js` - Command validation
4. Database migration utilities

**Test Template:**
```javascript
// tests/unit/scripts/test-utils.js
const assert = require('assert');
const utils = require('../../../scripts/lib/utils');

describe('scripts/lib/utils', () => {
  describe('formatPercent', () => {
    it('should format number as percentage', () => {
      assert.strictEqual(utils.formatPercent(85.5), '85.50%');
    });
    
    it('should handle edge cases', () => {
      assert.strictEqual(utils.formatPercent(0), '0.00%');
      assert.strictEqual(utils.formatPercent(100), '100.00%');
    });
  });
  
  describe('readJSON', () => {
    it('should read valid JSON file', () => {
      // Create temp file, test reading
    });
    
    it('should handle missing files gracefully', () => {
      // Test error handling
    });
    
    it('should handle invalid JSON', () => {
      // Test JSON parse error
    });
  });
});
```

**Coverage Targets:**
- utils.js: 95%+ line coverage
- coverage-unified.js: 85%+ line coverage
- validate-commands.js: 80%+ line coverage

**Effort:** 120 minutes

---

#### Task 3.2: Create Script Runner Wrapper
**Status:** READY TO IMPLEMENT
**New File:** `scripts/lib/runner.js`

**Purpose:** Provide consistent pattern for all scripts

**Features:**
- Consistent error handling
- Automatic logging
- Performance monitoring
- Cleanup/teardown handling

**Example:**
```javascript
// scripts/lib/runner.js
const utils = require('./utils');

function runScript(name, fn, options = {}) {
  const startTime = Date.now();
  
  try {
    utils.header(`🚀 Running: ${name}`);
    
    const result = fn();
    
    if (result instanceof Promise) {
      return result
        .then(res => {
          const duration = Date.now() - startTime;
          utils.success(`✅ ${name} completed in ${duration}ms`);
          return res;
        })
        .catch(err => handleError(err, name));
    }
    
    return result;
  } catch (error) {
    return handleError(error, name);
  }
}

function handleError(error, scriptName) {
  utils.error(`❌ ${scriptName} failed:`, false);
  console.error(error);
  
  if (process.env.DEBUG) {
    console.error(error.stack);
  }
  
  process.exit(1);
}

module.exports = { runScript };
```

**Effort:** 60 minutes

---

#### Task 3.3: Improve Database Scripts
**Status:** READY TO IMPLEMENT
**Files:**
- `scripts/db/migrate.js`
- `scripts/db/migrate-status.js`
- `scripts/db/rollback.js`

**Improvements:**
- Add better error handling
- Add transaction support
- Add rollback safety checks
- Add dry-run mode
- Better progress reporting

**Effort:** 90 minutes

---

#### Task 3.4: Create Scripts Test Suite
**Status:** READY TO IMPLEMENT
**New File:** `tests/unit/scripts/run-all-scripts.test.js`

**Purpose:** Integration test to verify all scripts execute without errors

**What to test:**
- All scripts execute without errors
- All scripts produce expected output
- All scripts handle --help properly
- All scripts handle invalid arguments gracefully

**Effort:** 60 minutes

**Total Phase 3 Time:** 4 hours

---

## Success Criteria

### Coverage System ✅
- [x] New unified coverage script created
- [x] Reports on ALL non-archived test files
- [x] Updated npm scripts in package.json
- [x] Multiple reporting modes (report, validate, baseline, compare, all)

### Script Quality
- [ ] Zero deprecated module references
- [ ] All scripts have proper error handling
- [ ] All file-writing scripts have --dry-run support
- [ ] Shared utilities integrated into critical scripts
- [ ] Configuration system working in at least 3 scripts

### Testing
- [ ] All critical scripts have unit tests
- [ ] Coverage of scripts/lib/utils.js ≥ 95%
- [ ] Coverage of coverage-unified.js ≥ 85%
- [ ] Coverage of validate-commands.js ≥ 80%
- [ ] All tests passing

### Documentation
- [ ] scripts/README.md created and comprehensive
- [ ] All scripts have clear usage comments
- [ ] Configuration options documented
- [ ] Error messages are helpful and actionable

---

## Testing Checklist

Before committing each phase:

**Phase 1 Testing:**
- [ ] Run `npm run coverage:report` - Should show 44 test files
- [ ] Run `npm run coverage:validate` - Should show current coverage
- [ ] Run `npm run coverage:baseline` - Should set baseline
- [ ] Run `npm run coverage:compare` - Should show comparison
- [ ] All npm scripts run without errors
- [ ] No ESLint errors: `npm run lint`
- [ ] All tests still pass: `npm test`

**Phase 2 Testing:**
- [ ] Archived scripts are in _archive/ directory
- [ ] All utility scripts still work
- [ ] Error messages are helpful
- [ ] Dry-run modes work (no files written)
- [ ] Normal modes work (files written)

**Phase 3 Testing:**
- [ ] New unit tests pass
- [ ] Script tests pass
- [ ] Coverage reports show test script coverage
- [ ] All npm scripts functional

---

## Rollback Plan

If any change causes issues:

1. **For individual scripts:** `git checkout HEAD -- scripts/[filename]`
2. **For whole phase:** `git reset --hard HEAD~[N]` where N is number of commits
3. **For coverage system:** Keep old scripts as fallback in _archive/

---

## Timeline

**Week 1:**
- Complete Phase 1 (2 hours)
- Begin Phase 2 (2-3 hours)

**Week 2:**
- Complete Phase 2
- Begin Phase 3 (3-4 hours)

**Week 3:**
- Complete Phase 3
- Testing and validation
- Final commit and documentation

**Total Estimated Effort:** 6-9 hours across 2-3 weeks

---

## Branch Information

**Feature Branch:** `feature/phase-22.4-scripts-refactoring`

**Merge Target:** `main` (via PR)

**Related Issues:**
- Scripts folder uses deprecated modules
- No configuration system
- Inconsistent error handling
- Missing unit tests for scripts

---

## Files to be Modified/Created

### New Files Created:
- [x] scripts/coverage-unified.js (unified coverage system)
- [ ] scripts/lib/utils.js (if not exists)
- [ ] scripts/lib/runner.js
- [ ] tests/unit/scripts/test-utils.js
- [ ] tests/unit/scripts/test-coverage.js
- [ ] tests/unit/scripts/test-validate-commands.js
- [ ] tests/unit/scripts/run-all-scripts.test.js

### Files to be Modified:
- [x] package.json (coverage scripts)
- [ ] scripts/run-tests.js (validation logic)
- [ ] scripts/generate-test-docs.js (Jest format)
- [ ] scripts/db/migrate.js (error handling)
- [ ] scripts/db/migrate-status.js (error handling)
- [ ] scripts/db/rollback.js (error handling)
- [ ] All utility scripts (integrate utils.js)

### Files to be Archived:
- [ ] scripts/test-command-base.js
- [ ] scripts/test-command-options.js
- [ ] scripts/test-communication-service.js
- [ ] scripts/test-quotes-advanced.js
- [ ] scripts/test-quotes.js
- [ ] scripts/test-response-helpers.js
- [ ] scripts/test-integration-refactor.js
- [ ] scripts/test-summary.js

### Files to be Deleted (Phase 2+):
- [ ] scripts/coverage-tracking.js (replace with coverage-unified.js)
- [ ] scripts/validate-coverage.js (replaced by coverage-unified.js)
- [ ] scripts/update-test-docs.js (outdated)

---

## Next Steps

1. ✅ Create coverage-unified.js
2. ✅ Create feature branch
3. **TODO: Implement Phase 1 critical fixes**
4. TODO: Implement Phase 2 improvements
5. TODO: Implement Phase 3 enhancements
6. TODO: Testing and validation
7. TODO: Create PR and merge to main

---

## References

- [SCRIPTS-ANALYSIS-REPORT.md](./SCRIPTS-ANALYSIS-REPORT.md)
- [SCRIPTS-REFACTORING-GUIDE.md](./SCRIPTS-REFACTORING-GUIDE.md)
- [scripts/README.md](./scripts/README.md)
- [scripts/lib/utils.js](./scripts/lib/utils.js)
- [.scripts-config.json](./.scripts-config.json)

---

**Last Updated:** January 13, 2026
**Status:** IN PROGRESS - Phase 1 Complete, Phase 2-3 Pending
