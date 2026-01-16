# Scripts Refactoring Implementation Guide

> **⚠️ OUTDATED - Pre-Phase 3 Guide**  
> This guide was created before Phase 3 consolidation (January 16, 2026).  
> Most issues described here have been resolved in Phase 3.  
> See [PHASE-3-COMPLETION-SUMMARY.md](/PHASE-3-COMPLETION-SUMMARY.md) for current status.

**Phase:** Critical Fixes  
**Priority:** HIGH (COMPLETED IN PHASE 3)  
**Estimated Time:** 2-3 hours  
**Date Created:** January 13, 2026

---

## Overview

This guide provides step-by-step instructions for refactoring the scripts folder to:
1. Remove deprecated module references
2. Update broken validation logic
3. Archive obsolete test scripts
4. Modernize script patterns

---

## Phase 1: Immediate Critical Fixes

### Issue 1: Update Deprecated Module References

#### Problem
Scripts reference the deprecated `src/db.js` module which is marked for removal.

**Affected Scripts:**
- `scripts/test-imports.js` (Line 1)
- `scripts/test-quotes.js` (multiple lines)
- `scripts/test-quotes-advanced.js` (multiple lines)

#### Solution: Replace with Guild-Aware Services

**Step 1: Fix test-imports.js**

Current code (DEPRECATED):
```javascript
const db = require('../src/db');
console.log('rate-quote needs: rateQuote, getQuoteById');
console.log('  rateQuote:', typeof db.rateQuote === 'function' ? '✓' : '✗');
```

New code (CORRECT):
```javascript
/**
 * Import Validation Script
 * Validates that required imports are available from modern services
 */

const QuoteService = require('../src/services/QuoteService');
const DatabaseService = require('../src/services/DatabaseService');
const GuildAwareDatabaseService = require('../src/services/GuildAwareDatabaseService');

console.log('✅ Modern service imports available:');
console.log('  QuoteService:', typeof QuoteService === 'function' ? '✓' : '✗');
console.log('  DatabaseService:', typeof DatabaseService === 'function' ? '✓' : '✗');
console.log('  GuildAwareDatabaseService:', typeof GuildAwareDatabaseService === 'function' ? '✓' : '✗');

// Verify key methods exist
const methods = {
  'QuoteService.getQuoteById': typeof QuoteService.prototype.getQuoteById,
  'QuoteService.addQuote': typeof QuoteService.prototype.addQuote,
  'DatabaseService.initialize': typeof DatabaseService.prototype.initialize,
};

Object.entries(methods).forEach(([method, type]) => {
  console.log(`  ${method}: ${type === 'function' ? '✓' : '✗'}`);
});
```

**Checklist:**
- [ ] Update `test-imports.js` with new service references
- [ ] Test the script: `node scripts/test-imports.js`
- [ ] Verify all imports are available

---

### Issue 2: Modernize Command Validation

#### Problem
`run-tests.js` uses outdated validation logic that doesn't match modern CommandBase patterns.

#### Solution: Use New validate-commands.js

**Step 1: Deprecate run-tests.js**

The new `validate-commands.js` is better and should replace `run-tests.js`:

```bash
# Backup old version
mv scripts/run-tests.js scripts/run-tests.js.deprecated

# Use new version
chmod +x scripts/validate-commands.js
```

**Step 2: Update npm script (package.json)**

Current:
```json
"test": "jest"  // run-tests.js is not referenced
```

Add new validation script:
```bash
npm run validate:commands    # Optional: add this if needed
```

**Step 3: Test the new script**

```bash
node scripts/validate-commands.js
```

Expected output:
```
════════════════════════════════════════
Command Validation Report
════════════════════════════════════════

Scanning: /path/to/src/commands

Found 15 command file(s)

▸ Valid Commands (15/15)
  ping      slash      commands/misc/ping.js
  help      both       commands/misc/help.js
  ...

▸ Summary
✅ All 15 command(s) are valid
```

**Checklist:**
- [ ] Run `node scripts/validate-commands.js`
- [ ] Verify all commands are valid
- [ ] No errors in output

---

### Issue 3: Archive Obsolete Test Scripts

#### Problem
8 old test scripts are no longer needed since Jest replaced the manual testing framework.

#### Solution: Archive to History

**Step 1: Create archive directory**
```bash
mkdir -p _archive/scripts/old-manual-tests
mkdir -p _archive/scripts/old-manual-tests/docs
```

**Step 2: Move old test scripts**
```bash
# Move test scripts
mv scripts/test-command-base.js _archive/scripts/old-manual-tests/
mv scripts/test-command-options.js _archive/scripts/old-manual-tests/
mv scripts/test-communication-service.js _archive/scripts/old-manual-tests/
mv scripts/test-quotes.js _archive/scripts/old-manual-tests/
mv scripts/test-quotes-advanced.js _archive/scripts/old-manual-tests/
mv scripts/test-response-helpers.js _archive/scripts/old-manual-tests/
mv scripts/test-integration-refactor.js _archive/scripts/old-manual-tests/
mv scripts/test-summary.js _archive/scripts/old-manual-tests/
```

**Step 3: Update documentation generator**
```bash
# Move or delete generate-test-docs.js (it references old test patterns)
mv scripts/generate-test-docs.js _archive/scripts/old-manual-tests/
mv scripts/update-test-docs.js _archive/scripts/old-manual-tests/
```

**Step 4: Create archive README**
```bash
cat > _archive/scripts/old-manual-tests/README.md << 'EOF'
# Old Manual Test Scripts (Phase 22.0-22.1)

These scripts were used for manual Test-Driven Development before the project 
migrated to the Jest testing framework.

## Status
- **ARCHIVED:** These scripts are no longer used
- **REASON:** Replaced by Jest framework (1922+ tests in `tests/` directory)
- **KEPT FOR:** Historical reference and legacy documentation

## Contents
- `test-*.js` - Old manual test files
- `generate-test-docs.js` - Old test documentation generator
- `test-summary.js` - Shows old Phase 22.0 metrics

## Migration
Modern tests can be found in:
- `tests/unit/` - Unit tests
- `tests/integration/` - Integration tests

For current test execution, use:
```bash
npm test              # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

See `SCRIPTS-ANALYSIS-REPORT.md` for full analysis.
EOF
```

**Checklist:**
- [ ] Create archive directory structure
- [ ] Move 8+ old test scripts to archive
- [ ] Create archive README
- [ ] Verify scripts folder is cleaner

---

### Issue 4: Create Configuration System

#### Problem
Settings are hardcoded in scripts, making them difficult to customize.

#### Solution: Use .scripts-config.json

**Step 1: Configuration file created**

The file `.scripts-config.json` already created with:
```json
{
  "coverage": {
    "statements": 90,
    "branches": 85,
    "functions": 95,
    "lines": 90
  }
}
```

**Step 2: Update scripts to use configuration**

Example: Update `validate-coverage.js`

```javascript
// OLD (hardcoded)
const targets = {
  final: {
    statements: 90,
    branches: 85,
    functions: 95,
    lines: 90,
  },
};

// NEW (configurable)
const config = JSON.parse(fs.readFileSync('.scripts-config.json', 'utf8'));
const targets = config.coverage;
```

**Checklist:**
- [ ] Verify `.scripts-config.json` exists in root
- [ ] Review configuration values
- [ ] Update critical scripts to use config

---

## Phase 2: Medium-Term Improvements

### Issue 5: Add Unit Tests for Scripts

Create test files for critical scripts:

```bash
mkdir -p tests/scripts
```

Example test file:
```javascript
// tests/scripts/coverage-tracking.test.js
describe('coverage-tracking', () => {
  it('should parse coverage summary', () => {
    // Test implementation
  });
});
```

### Issue 6: Enhance Error Handling

Example improvements:

```javascript
// OLD: Generic error
console.error('Failed');

// NEW: Specific error with help
console.error(utils.error('Coverage report not found'));
console.error(utils.info('Run: npm run test:coverage'));
process.exit(1);
```

### Issue 7: Add Dry-Run Modes

For file-writing scripts:

```javascript
const isDryRun = process.argv.includes('--dry-run');

if (isDryRun) {
  console.log(utils.info('Dry-run mode - no changes will be written'));
}

if (!isDryRun) {
  fs.writeFileSync(filePath, content);
  console.log(utils.success('File written'));
} else {
  console.log(utils.info('Would write file: ' + filePath));
}
```

---

## Phase 3: Long-Term Enhancements

### Issue 8: Create Shared Utilities

The file `scripts/lib/utils.js` is already created with:
- Color formatting
- File operations
- Error handling
- Consistent messaging

Update scripts to use it:

```javascript
const utils = require('./lib/utils');
const { success, error, warning } = utils;
```

### Issue 9: Documentation

Created comprehensive documentation:
- `scripts/README.md` - Main reference
- `SCRIPTS-ANALYSIS-REPORT.md` - Full analysis
- This implementation guide

---

## Implementation Checklist

### Critical Fixes (Do Now)
- [ ] Update deprecated module references
  - [ ] `test-imports.js`
  - [ ] `test-quotes.js` (if not archived)
  - [ ] `test-quotes-advanced.js` (if not archived)
  
- [ ] Archive old test scripts
  - [ ] Create `_archive/scripts/old-manual-tests/`
  - [ ] Move 8 old test files
  - [ ] Create archive README
  
- [ ] Test deprecated module removal
  - [ ] Run `node scripts/test-imports.js` (updated version)
  - [ ] Verify no references to `src/db`
  
- [ ] Create and verify configuration
  - [ ] Verify `.scripts-config.json` exists
  - [ ] Review coverage targets
  - [ ] Update scripts to use config

### Validation
```bash
# Test all npm scripts still work
npm run check-node-version          # Should pass
npm run coverage:check              # Should show current coverage
npm run docs:links                  # Should run successfully
npm run lint                        # Should pass

# Test new validation
node scripts/validate-commands.js   # Should show valid commands

# Verify no broken imports
node -e "require('./src/services/QuoteService'); console.log('✓')"
node -e "require('./src/services/DatabaseService'); console.log('✓')"
```

---

## Rollback Plan

If anything breaks during refactoring:

```bash
# Restore from git
git checkout scripts/
git checkout .scripts-config.json
git checkout _archive/

# Or selectively restore specific files
git checkout scripts/test-imports.js
```

---

## Success Criteria

- ✅ No deprecated module references in active scripts
- ✅ Command validation works with modern CommandBase
- ✅ Old test scripts archived, not deleted
- ✅ All npm scripts still work
- ✅ Configuration system in place
- ✅ Comprehensive documentation created
- ✅ New utilities module available
- ✅ Zero errors in script execution

---

## Timeline

| Phase | Estimated Time | Status |
|-------|----------------|--------|
| Phase 1 (Critical) | 1-2 hours | Ready |
| Phase 2 (Important) | 2-3 hours | Pending |
| Phase 3 (Enhancement) | 3-4 hours | Future |
| **Total** | **6-9 hours** | — |

---

## Next Steps

1. Execute Phase 1 steps in order
2. Test each change before moving to next
3. Document any issues encountered
4. Plan Phase 2 improvements
5. Monitor script performance over time

---

## References

- [SCRIPTS-ANALYSIS-REPORT.md](../SCRIPTS-ANALYSIS-REPORT.md) - Full analysis
- [scripts/README.md](./README.md) - Usage guide
- [.scripts-config.json](../.scripts-config.json) - Configuration
- [scripts/lib/utils.js](./lib/utils.js) - Utilities module

---

**Created:** January 13, 2026  
**Last Updated:** January 13, 2026  
**Status:** Ready for implementation
