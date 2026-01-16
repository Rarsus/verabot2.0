# Scripts Folder - Usage & Documentation

This folder contains utility scripts for the VeraBot 2.0 project. All scripts are organized by category and functionality.

**Last Updated:** January 16, 2026 (Phase 3)  
**Total Scripts:** 21 (Phase 3: Consolidation in progress)  
**Status:** Phase 3 consolidation complete - deprecated scripts marked

---

## Quick Reference

### Essential Scripts (Use Daily)

| Script | Command | Purpose |
|--------|---------|---------|
| Node version check | `npm run check-node-version` | Verify Node.js 18+ before install |
| Run tests | `npm test` | Execute all Jest tests |
| Coverage report | `npm run coverage:report` | Generate coverage metrics |
| Validate coverage | `npm run coverage:check` | Check coverage vs targets |
| Lint code | `npm run lint` | Check code quality (ESLint) |

### Utility Scripts (Use As Needed)

| Script | Command | Purpose |
|--------|---------|---------|
| Check links | `npm run docs:links` | Validate documentation links |
| Check version | `npm run docs:version` | Verify version consistency |
| Update badges | `npm run docs:badges` | Update README badges |
| Show metrics | `npm run perf:monitor` | Display performance metrics |
| Validate commands | `node scripts/validate-commands.js` | Check command structure (NEW) |

### Database Scripts (Requires Database)

| Script | Command | Purpose |
|--------|---------|---------|
| Run migrations | `npm run db:migrate` | Apply pending migrations |
| Migration status | `npm run db:migrate:status` | Show migration status |
| Rollback migration | `npm run db:rollback` | Undo last migration |

---

## Script Categories

### 1. Quality & Testing (`coverage.js`, `validate-*.js`)

Scripts for code quality, testing, and coverage management.

#### Coverage Management System (Consolidated in Phase 3)
```bash
npm run coverage:report      # Generate and report coverage
npm run coverage:check       # Validate coverage against targets
npm run coverage:validate    # Full validation report
npm run coverage:baseline    # Set new baseline
npm run coverage:compare     # Compare to baseline
npm run coverage:all         # Comprehensive report
```

**Primary File:**
- `coverage.js` - Unified coverage management (consolidated from coverage-unified.js and coverage-tracking.js)

**Additional Files:**
- `validate-coverage.js` - Coverage roadmap tracker (separate from coverage.js)
- `coverage-unified.js` - **DEPRECATED** (redirects to coverage.js)
- `coverage-tracking.js` - **DEPRECATED** (redirects to coverage.js)

**Features:**
- Generate Jest coverage reports
- Track coverage history over time
- Compare against baseline
- Color-coded output (red/yellow/green)
- Per-module coverage analysis
- Consolidated from multiple scripts in Phase 3

**Configuration:** See `.scripts-config.json` for coverage targets

---

### 2. Documentation & Validation (`validation/`)

Scripts for documentation quality and link validation.

#### Link Checker
```bash
npm run docs:links          # Check all documentation links
```

**File:** `validation/check-links.js`  
**Features:**
- Validates markdown links `[text](url)`
- Checks file existence
- Verifies external URLs
- Ignores patterns (node_modules, .git, etc)
- Reports broken links

#### Version Checker
```bash
npm run docs:version        # Verify version consistency
npm run release:check       # Check before release
```

**File:** `validation/check-version.js`  
**Features:**
- Checks version in package.json
- Validates version consistency across files
- Pre-release validation

#### Badge Updater
```bash
npm run docs:badges         # Update README badges
```

**File:** `validation/update-badges.js`  
**Features:**
- Updates coverage badge in README
- Adds test status badge
- Updates dependency badges

---

### 3. Command Validation

#### Validate Commands Structure
```bash
node scripts/validate-commands.js
```

**File:** `scripts/validate-commands.js` (NEW)  
**Features:**
- Scans all commands in src/commands/
- Validates CommandBase inheritance
- Checks required exports
- Reports command types (slash/prefix)
- Color-coded validation results

**Example Output:**
```
Valid Commands (15/15)
  ping      slash      commands/misc/ping.js
  help      both       commands/misc/help.js
  ...

Summary
✅ All 15 command(s) are valid
```

---

### 4. Performance Monitoring (`performance/`)

#### Show Metrics
```bash
npm run perf:monitor        # Display test metrics
```

**File:** `performance/show-metrics.js`  
**Features:**
- Shows test execution time
- Displays test count
- Shows memory usage
- Tracks performance trends

---

### 5. Database Management (`db/`)

Scripts for database migrations and maintenance.

#### Run Migrations
```bash
npm run db:migrate          # Apply pending migrations
npm run db:migrate:status   # Show migration status
npm run db:rollback         # Undo last migration
```

**Files:**
- `db/migrate.js` - Run pending migrations
- `db/migrate-status.js` - Show migration status
- `db/rollback.js` - Rollback migrations

**Features:**
- Version tracking
- Pending migration detection
- Rollback capability
- Transaction support

**Usage Example:**
```bash
# Check status before migrating
npm run db:migrate:status

# Run all pending migrations
npm run db:migrate

# Migrate to specific version (optional)
npm run db:migrate 5

# Rollback if needed
npm run db:rollback
```

---

### 6. Deprecated/Obsolete Scripts (Phase 3)

The following scripts are marked as deprecated/obsolete and will be archived in Phase 4:

**Consolidated Scripts:**
- `coverage-unified.js` - **DEPRECATED** (use coverage.js instead)
- `coverage-tracking.js` - **DEPRECATED** (use coverage.js instead)

**Obsolete Scripts:**
- `jest-migration-helper.js` - **OBSOLETE** (Jest migration complete)

**Archived Scripts:**
- `test-*.js` files (8 total) - Old manual tests (in `_archive/scripts/old-manual-tests/`)

**Status:** Phase 3 consolidation complete  
**Next Step:** Phase 4 will move deprecated scripts to archive

---

## Configuration

### Script Configuration File
**Location:** `.scripts-config.json`

Centralizes settings for all scripts:

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
    "docs": "docs/"
  },
  "output": {
    "useColor": true,
    "verbose": false
  }
}
```

### Environment Variables

Scripts respect these environment variables:

- `CI` - Set by CI systems (disables colors)
- `NO_COLOR` - Disable color output
- `VERBOSE` - Increase verbosity

**Example:**
```bash
NO_COLOR=1 npm run coverage:check
VERBOSE=1 npm run db:migrate:status
```

---

## Utility Module

### Shared Utilities
**Location:** `scripts/lib/utils.js`

Provides common functions used by all scripts:

```javascript
const utils = require('./lib/utils');

// Color output
console.log(utils.success('Operation completed'));
console.log(utils.error('Something failed'));
console.log(utils.warning('Check this'));

// Formatting
const percent = utils.formatPercent(85.5, 90); // "85.50%" (yellow)
const bar = utils.progressBar(75, 100, 20);   // Progress bar

// File operations
const data = utils.readJSON('file.json', {});
utils.writeJSON('file.json', data);

// Error handling
utils.exit(0, 'Success!');  // Exit with success
utils.exit(1, 'Failed!');   // Exit with error
```

**Available Functions:**
- `success()`, `error()`, `warning()`, `info()` - Formatted messages
- `header()`, `subheader()` - Section headers
- `formatPercent()` - Format percentages with color
- `progressBar()` - Create progress bars
- `formatTable()` - Format data as tables
- `readJSON()`, `writeJSON()` - JSON file operations
- `safeRequire()` - Safe module loading
- `runScript()` - Run with error handling
- `execAsync()` - Execute shell commands
- `isCI()`, `shouldUseColor()` - Environment detection

---

## Best Practices

### Writing New Scripts

1. **Use the utility module for consistency:**
   ```javascript
   const utils = require('./lib/utils');
   console.log(utils.success('Done!'));
   ```

2. **Add proper error handling:**
   ```javascript
   const result = utils.runScript('MyScript', () => {
     // Your code here
     return value;
   });
   ```

3. **Support CI environments:**
   ```javascript
   if (utils.isCI()) {
     // Adjust output for CI
   }
   ```

4. **Use configuration:**
   ```javascript
   const config = utils.readJSON('.scripts-config.json');
   const target = config.coverage.statements;
   ```

5. **Document your script:**
   ```javascript
   /**
    * Script purpose
    * Usage: npm run script-name [options]
    * Options:
    *   --dry-run  : Show what would change
    *   --verbose  : Detailed output
    */
   ```

### Running Scripts Manually

```bash
# Run from project root
node scripts/script-name.js

# Or use npm script if defined in package.json
npm run script-command

# Pass arguments
node scripts/script-name.js --option value

# Disable colors
NO_COLOR=1 node scripts/script-name.js

# Verbose mode
VERBOSE=1 node scripts/script-name.js
```

---

## Troubleshooting

### Script Won't Run

**Issue:** `Cannot find module './lib/utils'`
```bash
# Solution: Ensure utils.js exists
ls scripts/lib/utils.js

# If missing, create it from template:
cp scripts/lib/utils.js.template scripts/lib/utils.js
```

**Issue:** `MigrationManager not found`
```bash
# Solution: Check if service exists
ls src/services/MigrationManager.js

# If missing, database scripts won't work
```

### Coverage Report Empty

**Issue:** Coverage files not generated
```bash
# Solution: Run tests first
npm run test:coverage

# Then check coverage files
ls coverage/coverage-summary.json
```

### Command Validation Fails

**Issue:** Commands directory not found
```bash
# Solution: Check directory structure
ls -la src/commands/

# Validate specific command
node -e "console.log(require('./src/commands/misc/ping.js'))"
```

---

## Common Workflows

### Pre-Commit Validation
```bash
# Check code quality
npm run lint

# Validate commands
node scripts/validate-commands.js

# Check documentation
npm run docs:links
```

### Coverage Analysis
```bash
# Generate new coverage
npm run test:coverage

# Check against targets
npm run coverage:check

# Set new baseline (after intentional changes)
npm run coverage:baseline
```

### Release Preparation
```bash
# Check version consistency
npm run release:check

# Validate all documentation
npm run docs:links
npm run docs:version

# Update badges
npm run docs:badges

# Final check
npm run lint
npm run test
```

### Database Maintenance
```bash
# Check migration status
npm run db:migrate:status

# Apply pending migrations
npm run db:migrate

# Verify success
npm run db:migrate:status
```

---

## Development & Contributing

### Adding New Scripts

1. Create script in appropriate subdirectory
2. Add npm script to `package.json`
3. Update this README with documentation
4. Use `scripts/lib/utils.js` for consistent output
5. Add error handling and validation
6. Test thoroughly

### Script Refactoring (Phase 3 - COMPLETE)

**Phase 1 (Assessment): Complete**
- Analyzed all 21 scripts
- Identified duplicates and obsolete scripts

**Phase 2 (Modernization): Complete**
- Added centralized error handling
- Created lib/error-handler.js utility
- Enhanced scripts with TDD approach
- 295 new tests added

**Phase 3 (Consolidation): COMPLETE**
- ✅ Consolidated coverage-unified.js + coverage-tracking.js → coverage.js
- ✅ Marked obsolete jest-migration-helper.js for archival
- ✅ Updated package.json to use coverage.js
- ✅ Added 20 consolidation tests (3327 total tests passing)
- ✅ Updated documentation

**Phase 4 (Archival): Next**
- Move deprecated scripts to _archive/
- Final script count: ~17 scripts

---

## References

- [SCRIPTS-ANALYSIS-REPORT.md](../SCRIPTS-ANALYSIS-REPORT.md) - Comprehensive analysis
- [package.json](../package.json) - Script definitions
- [.scripts-config.json](../.scripts-config.json) - Configuration
- [scripts/lib/utils.js](./lib/utils.js) - Utility module

---

## Support & Issues

If you encounter issues with scripts:

1. Check this README first
2. Review the analysis report
3. Check individual script headers for documentation
4. Run with `--verbose` flag for more details
5. Check that all dependencies are installed (`npm install`)

---

**Last Updated:** January 16, 2026 (Phase 3 Complete)  
**Maintenance Status:** Active (Phase 3 consolidation complete, Phase 4 next)  
**Questions?** See PHASE-1-SCRIPTS-ASSESSMENT.md and PHASE-2-COMPLETION-SUMMARY.md for details.
