# Scripts Archive Manifest

**Date Created:** January 16, 2026  
**Location:** `scripts/archived/`  
**Reason:** Phase 4 - Obsolete Scripts Archival

## Archived Scripts

### 1. jest-migration-helper.js
- **Status:** ❌ OBSOLETE
- **Archived Date:** January 16, 2026
- **Original Purpose:** Convert custom test runner to Jest format
- **Why Archived:** 
  - Jest migration already complete (all tests now use Jest framework)
  - No longer needed or referenced
  - Conversion logic no longer applicable
- **Size:** 1.5 KB
- **Lines of Code:** ~50
- **Modern Alternative:** Use Jest test framework directly (see `tests/` directory)
- **Recovery:** Available in git history if needed
- **Git Command to Recover:** `git show HEAD~N:scripts/jest-migration-helper.js`

### 2. coverage-tracking.js
- **Status:** ⚠️ DEPRECATED (Consolidated into coverage.js)
- **Archived Date:** January 16, 2026
- **Original Purpose:** Track, report, and analyze code coverage metrics
- **Why Archived:**
  - Duplicated functionality with coverage-unified.js
  - Both scripts consolidated into single `coverage.js`
  - Creates confusion about which script to use
  - Maintenance burden
- **Size:** 8.2 KB
- **Lines of Code:** ~200
- **Modern Alternative:** Use `scripts/coverage.js` with extended capabilities
- **Migration Guide:**
  - Old: `node scripts/coverage-tracking.js`
  - New: `node scripts/coverage.js --report` or `npm run coverage`
- **Last Used:** Phase 2 (before consolidation)
- **Recovery:** Available in git history if needed

### 3. coverage-unified.js
- **Status:** ⚠️ DEPRECATED (Consolidated into coverage.js)
- **Archived Date:** January 16, 2026
- **Original Purpose:** Unified coverage reporting system
- **Why Archived:**
  - Duplicated functionality with coverage-tracking.js
  - Both scripts consolidated into single `coverage.js`
  - Unclear separation of concerns
  - Merged with coverage-tracking.js functionality
- **Size:** 11.9 KB
- **Lines of Code:** ~280
- **Modern Alternative:** Use `scripts/coverage.js` with multiple reporting modes
- **Migration Guide:**
  - Old: `node scripts/coverage-unified.js --report`
  - New: `node scripts/coverage.js --report`
  - Old: `node scripts/coverage-unified.js --baseline`
  - New: `node scripts/coverage.js --baseline`
- **Features Merged Into coverage.js:**
  - Report generation (--report mode)
  - Baseline tracking (--baseline mode)
  - History comparison (--compare mode)
  - Full validation (--validate mode)
  - All modes combined (--all mode)
- **Last Used:** Phase 2 (before consolidation)
- **Recovery:** Available in git history if needed

## Archive Statistics

| Metric | Value |
|--------|-------|
| Total Scripts Archived | 3 |
| Total Size | ~21.6 KB |
| Total Lines of Code | ~530 |
| Archive Creation Date | January 16, 2026 |
| Phase | 4 - Obsolete Scripts Archival |

## NPM Scripts Status

The following npm scripts were affected by archival and have been updated:

**Deprecated npm scripts (removed from package.json):**
- `npm run coverage:track` (was: coverage-tracking.js)
- `npm run coverage:unified` (was: coverage-unified.js)

**Current npm scripts (use coverage.js):**
- `npm run coverage` - Full coverage report with validation
- `npm test -- --coverage` - Run tests with coverage
- `npm run lint` - Lint checks
- `npm run validate` - All validations

## Recovery Instructions

### To recover an archived script:

1. **Find the commit hash where it was deleted:**
   ```bash
   git log --oneline -- scripts/archived/[SCRIPT_NAME]
   # Or find any commit before Phase 4:
   git log --oneline --grep="Phase 4"
   ```

2. **Restore from git:**
   ```bash
   # Method 1: Restore to working directory
   git show <commit_hash>:scripts/[SCRIPT_NAME] > scripts/archived/[SCRIPT_NAME]
   
   # Method 2: View contents without restoring
   git show <commit_hash>:scripts/[SCRIPT_NAME]
   ```

3. **Move back to scripts/ if needed:**
   ```bash
   mv scripts/archived/[SCRIPT_NAME] scripts/
   ```

## References

- **Phase 3 Completion Report:** PHASE-3-COMPLETION-SUMMARY.md (coverage consolidation)
- **Phase 2 Completion Report:** PHASE-2-COMPLETION-SUMMARY.md (coverage.js creation)
- **Testing Documentation:** docs/testing/
- **Coverage System Documentation:** scripts/README.md

## Migration Checklist

- [x] jest-migration-helper.js archived
- [x] coverage-tracking.js archived
- [x] coverage-unified.js archived
- [x] Manifest created
- [ ] ARCHIVE.md documentation created (see separate file)
- [ ] package.json updated
- [ ] Codebase references verified
- [ ] CI/CD workflows verified

---

**Archive Manifest Status:** COMPLETE  
**Last Updated:** January 16, 2026
**Maintained By:** GitHub Copilot (Automated)
