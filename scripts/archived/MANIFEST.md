# Scripts Archive Manifest

**Date Created:** January 19, 2026  
**Archive Version:** 1.0  
**Phase:** 4 - Obsolete Scripts Archival  
**Total Archived Scripts:** 8

---

## Archive Overview

This directory contains obsolete or deprecated scripts that have been archived from the active `scripts/` folder. These scripts are no longer used in the project's standard workflow but are preserved in this archive for:

1. **Historical Reference** - Understanding how the project evolved
2. **Recovery** - Scripts can be retrieved from git history if needed
3. **Knowledge Preservation** - Documentation of why scripts became obsolete
4. **Compliance** - Audit trail of all project scripts

---

## Archived Scripts Index

### 1. jest-migration-helper.js

**Original Location:** `scripts/jest-migration-helper.js`  
**Purpose:** Convert legacy test runner scripts to Jest format  
**Status:** ❌ OBSOLETE  
**Archive Date:** January 19, 2026  
**Last Modified:** Early 2024  
**Lines of Code:** ~180

**Why Archived:**
- Jest migration fully completed (all 3300+ tests now use Jest)
- No tests use legacy format anymore
- Script no longer serves any purpose
- Only used during initial Jest migration phase

**Dependencies:**
- None (standalone utility script)

**Modern Alternative:**
- Use Jest directly: `npm test`
- Use Jest in watch mode: `npm run test:watch`
- Use Jest coverage: `npm run test:coverage`

**Recovery Instructions:**
```bash
git log --all --full-history -- scripts/jest-migration-helper.js
git show <commit>:scripts/jest-migration-helper.js
```

**Notes:** This was a migration tool created to help transition from a custom test runner to Jest. After migration completion (Nov 2024), it served no further purpose.

---

### 2. validate-coverage.js

**Original Location:** `scripts/validate-coverage.js`  
**Purpose:** Validate code coverage meets minimum thresholds  
**Status:** ❌ REDUNDANT  
**Archive Date:** January 19, 2026  
**Last Modified:** November 2024  
**Lines of Code:** ~95

**Why Archived:**
- Functionality consolidated into `scripts/coverage.js` (Phase 3)
- `scripts/coverage.js` handles all coverage validation modes
- npm script `npm run coverage:validate` replaces this script
- Reduces script duplication and maintenance burden

**Dependencies:**
- jest (for coverage data)
- fs (file system operations)

**Modern Alternative:**
```bash
npm run coverage:validate    # Use consolidated coverage script
npm run coverage            # Or use shorthand
```

**Previous npm Script:**
```json
"coverage:old-validate": "node scripts/validate-coverage.js"
```

**Recovery Instructions:**
```bash
git log --all --full-history -- scripts/validate-coverage.js
git show <commit>:scripts/validate-coverage.js
```

**Notes:** Functionality merged into `scripts/coverage.js` with enhanced features like baseline tracking and comparison modes.

---

### 3. performance/show-metrics.js

**Original Location:** `scripts/performance/show-metrics.js`  
**Purpose:** Display performance metrics and system monitoring  
**Status:** ❌ PLACEHOLDER/INCOMPLETE  
**Archive Date:** January 19, 2026  
**Last Modified:** November 2024  
**Lines of Code:** ~45

**Why Archived:**
- Script is just a placeholder with instructions
- No actual metrics implementation
- Doesn't integrate with any monitoring system
- Not actively used in any workflows

**Dependencies:**
- None (standalone)

**Modern Alternative:**
- Performance monitoring handled by CI/CD workflows (versioning.yml)
- GitHub Actions logs provide execution time data
- Use `npm run test -- --showConfig` for test configuration details

**Previous npm Script:**
```json
"perf:monitor": "node scripts/performance/show-metrics.js"
```

**Recovery Instructions:**
```bash
git log --all --full-history -- scripts/performance/show-metrics.js
git show <commit>:scripts/performance/show-metrics.js
```

**Notes:** This was created as a placeholder but implementation was never completed. Performance monitoring is now integrated into CI/CD workflows.

---

### 4. build/generate-test-docs.js

**Original Location:** `scripts/build/generate-test-docs.js`  
**Purpose:** Auto-generate documentation from test files  
**Status:** ❌ OUTDATED  
**Archive Date:** January 19, 2026  
**Last Modified:** October 2024  
**Lines of Code:** ~320

**Why Archived:**
- Uses hardcoded list of 44+ test files (requires manual updates)
- Should use dynamic test discovery instead
- No error handling for missing test files
- Output format incompatible with modern Jest setup

**Dependencies:**
- child_process (execSync)
- fs (file operations)
- jest (for test execution)

**Modern Alternative:**
- Jest itself generates test documentation
- Use `npm test -- --showConfig` for test configuration
- Use `npm test -- --listTests` to list all tests dynamically
- Better to maintain docs manually or use JSDoc comments

**Previous Usage:**
```bash
node scripts/build/generate-test-docs.js
```

**Recovery Instructions:**
```bash
git log --all --full-history -- scripts/build/generate-test-docs.js
git show <commit>:scripts/build/generate-test-docs.js
```

**Notes:** The hardcoded test list made this script fragile and unmaintainable. Modern Jest provides better alternatives for documentation generation.

---

### 5. setup-ci-pipeline.js

**Original Location:** `scripts/setup-ci-pipeline.js`  
**Purpose:** Configure GitHub Actions workflows for CI/CD  
**Status:** ❌ NO ACTIVE REFERENCES  
**Archive Date:** January 19, 2026  
**Last Modified:** September 2024  
**Lines of Code:** ~185

**Why Archived:**
- No references found in any npm scripts
- No active use in workflows
- CI/CD configuration already in `.github/workflows/`
- GitHub Actions workflows are manually maintained
- Script assumptions about workflow structure unclear

**Dependencies:**
- fs (file system operations)
- path (path utilities)

**Modern Alternative:**
- GitHub Actions workflows are in `.github/workflows/` directory
- Edit workflows directly for configuration changes
- Use GitHub web interface for workflow management

**Recovery Instructions:**
```bash
git log --all --full-history -- scripts/setup-ci-pipeline.js
git show <commit>:scripts/setup-ci-pipeline.js
```

**Notes:** Purpose was unclear and no active references found in codebase. GitHub Actions configuration is now manually maintained through workflow files.

---

### 6. db/migration-single-to-multi.js

**Original Location:** `scripts/db/migration-single-to-multi.js`  
**Purpose:** Migrate database from single database to per-guild multi-database architecture  
**Status:** ⚠️ ARCHIVE-AFTER-USE (Archived but historical reference)  
**Archive Date:** January 19, 2026  
**Last Modified:** January 2025  
**Lines of Code:** ~416

**Why Archived:**
- One-time migration script (used for architecture change)
- Specific to migration from Phase 6 (single → multi-database)
- No longer needed after migration is complete
- Preserved as historical reference for audit trail

**Dependencies:**
- sqlite3
- GuildDatabaseManager
- fs (backups)

**Modern Alternative:**
- Multi-database architecture now standard
- New deployments use per-guild databases by default
- See `scripts/db/migrate.js` for standard migrations

**Usage During Migration:**
```bash
node scripts/db/migration-single-to-multi.js [guildId]
```

**Recovery Instructions:**
```bash
git log --all --full-history -- scripts/db/migration-single-to-multi.js
git show <commit>:scripts/db/migration-single-to-multi.js
```

**Notes:** This was a critical one-time migration script used to transition the database architecture. It's preserved as historical reference and documented the migration process used in January 2025.

---

### 7. deploy.sh

**Original Location:** `scripts/deploy.sh`  
**Purpose:** Deploy VeraBot dashboard with environment checks  
**Status:** ❌ UNCLEAR PURPOSE  
**Archive Date:** January 19, 2026  
**Last Modified:** August 2024  
**Lines of Code:** ~112

**Why Archived:**
- No references in any npm scripts or workflows
- Purpose unclear: dashboard deployment not mentioned elsewhere
- Bash script (inconsistent with Node.js project)
- No documentation of deployment target
- Assumes .env configuration not present in most environments

**Dependencies:**
- bash shell
- Environment variables (.env file)

**Modern Alternative:**
- Docker containerization: Use `docker build` and `docker-compose`
- CI/CD workflows in `.github/workflows/` handle deployments
- Cloud deployment handled through GitHub Actions

**Recovery Instructions:**
```bash
git log --all --full-history -- scripts/deploy.sh
git show <commit>:scripts/deploy.sh
```

**Notes:** Purpose was never clear. If deployment is needed, use Docker (Dockerfile present) or GitHub Actions workflows instead.

---

### 8. jest-migration-helper.js (Alternative: run-tests.js consolidation)

**Status:** ARCHIVED AS PART OF CONSOLIDATION

During Phase 3, `run-tests.js` was consolidated into `validate-commands.js`. While `run-tests.js` itself is gone, we're noting it here for historical completeness:

**Original Location:** `scripts/run-tests.js`  
**Purpose:** Run Jest tests with validation  
**Status:** ✅ CONSOLIDATED (Not separately archived)  
**Consolidation Date:** January 15, 2026  
**Lines of Code:** ~120

**Consolidation Details:**
- Merged into `scripts/validate-commands.js`
- Functionality preserved and enhanced
- npm scripts updated to call consolidated script
- All tests passing with consolidated version

**Notes:** This was consolidated during Phase 3 as it was identified as duplicate functionality. The consolidation reduced script count by 1 and improved maintainability.

---

## Archive Statistics

| Metric | Count |
|--------|-------|
| Total Archived Scripts | 8 |
| One-time Migration Scripts | 1 |
| Placeholder/Incomplete | 1 |
| Consolidated/Redundant | 2 |
| Obsolete | 3 |
| Unclear Purpose | 1 |

---

## Maintenance Notes

### Adding to Archive
When archiving a new script:

1. Move script to `scripts/archived/` directory
2. Preserve subdirectory structure if applicable
3. Create entry in this MANIFEST.md with:
   - Original location
   - Purpose and why it was archived
   - Dependencies
   - Modern alternative
   - Recovery instructions
4. Update `scripts/archived/ARCHIVE.md` with summary
5. Remove npm script references from `package.json`
6. Create git commit with message: `Archive: Move [scriptname] to scripts/archived/`

### Recovery from Archive
If a script is needed again:

1. Check MANIFEST.md for recovery instructions
2. Use git history: `git log --all --full-history -- scripts/[filename]`
3. Restore from archive: `git show <commit>:scripts/[filename] > scripts/[filename]`
4. Restore npm scripts if needed
5. Test thoroughly before using

### Audit Trail
All archived scripts remain in git history:
```bash
git log --all --follow -- scripts/archived/
git log --all --follow -- "scripts/$(basename $script)"
```

---

## Related Documentation

- [ARCHIVE.md](./ARCHIVE.md) - Full archival documentation
- [PHASE-4-ARCHIVAL.md](../../PHASE-4-ARCHIVAL.md) - Phase 4 work summary
- [docs/guides/scripts-refactoring-guide.md](../../docs/guides/scripts-refactoring-guide.md) - Refactoring guide

---

**Manifest Version:** 1.0  
**Last Updated:** January 19, 2026  
**Maintained By:** GitHub Copilot (TDD Agent)  
**Archive Status:** ✅ ACTIVE (8 scripts archived)
