# CI Configuration Implementation Guide
**Phase 1: Critical Fixes (Weeks 1-2)**

## Implementation Overview

This document provides step-by-step implementation of CI/CD improvements with concrete file changes.

---

## STEP 1: Consolidate Test Workflows

### Current State
- `test.yml` - Node 18/20 (outdated)
- `ci.yml` - Node 20/22 (current)
- `coverage.yml` - Duplicate coverage
- `test-coverage.yml` - Unknown purpose

### Action: Replace test.yml (update immediately)

**File: `.github/workflows/test.yml`**

```yaml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

# Prevent duplicate runs
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      fail-fast: false
      matrix:
        node-version: [20.x, 22.x]

    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 📦 Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4  # Updated: @v3 → @v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
          cache-dependency-path: package-lock.json

      - name: 📚 Install dependencies
        run: npm ci

      - name: 🔍 Run linter
        run: npm run lint -- --max-warnings=100

      - name: 🧪 Run tests with coverage
        run: npm run test:coverage

      - name: ✅ Validate coverage thresholds
        run: npm run coverage:validate

      - name: ☁️ Upload coverage to Codecov
        if: matrix.node-version == '20.x'  # Only upload once
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella
          fail_ci_if_error: false

      - name: 📊 Upload test artifacts
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results-node-${{ matrix.node-version }}
          path: |
            coverage/
            test-results/
          retention-days: 30
```

**Changes Made:**
1. ✅ Updated `@v3` → `@v4`
2. ✅ Added concurrency control
3. ✅ Changed to Node 20/22 (drop outdated 18)
4. ✅ Consolidated coverage check inline
5. ✅ Added explicit cache-dependency-path
6. ✅ Added artifact retention
7. ✅ Added fail-fast: false for complete test runs

---

## STEP 2: Fix Coverage Configuration

### Issue: Mismatched thresholds between jest.config.js and .nycrc.json

**Action 1: Update jest.config.js**

Find and replace this section:

```javascript
// BEFORE
coverageThreshold: {
  global: {
    branches: 0,
    functions: 0,
    lines: 0,
    statements: 0,
  },
},
testTimeout: 10000,

// AFTER
coverageThreshold: {
  global: {
    branches: 20,      // Match .nycrc.json
    functions: 35,     // Match .nycrc.json
    lines: 25,         // Match .nycrc.json
    statements: 25,    // Match .nycrc.json
  },
  './src/middleware/**/*.js': {
    branches: 80,      // Stricter for critical code
    functions: 90,
    lines: 85,
    statements: 85,
  },
},
testTimeout: 5000,  // Reduced from 10s to catch slow tests
```

**Action 2: Enhance .nycrc.json**

```json
{
  "all": true,
  "include": [
    "src/**/*.js"
  ],
  "exclude": [
    "src/**/*.test.js",
    "src/**/*.spec.js",
    "src/index.js",
    "src/register-commands.js",
    "src/config/**",
    "**/node_modules/**",
    "coverage/**"
  ],
  "reporter": [
    "text",
    "lcov",
    "html",
    "json-summary"
  ],
  "report-dir": "./coverage",
  "temp-dir": "./coverage/.nyc_output",
  "lines": 25,
  "functions": 35,
  "branches": 20,
  "statements": 25,
  "check-coverage": true,
  "per-file": true,        // NEW: Enforce per-file thresholds
  "skip-full": true,       // NEW: Don't report 100% files
  "produce-source-map": true  // NEW: For debugging
}
```

---

## STEP 3: Consolidate/Deprecate Coverage Workflows

### Action: Update coverage.yml for clarity

**File: `.github/workflows/coverage.yml`** (keep as secondary reporter)

```yaml
name: Coverage Report

on:
  pull_request:
    branches: [ main, develop ]

concurrency:
  group: coverage-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read
  pull-requests: write

jobs:
  coverage:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'

      - run: npm ci

      - name: Generate coverage
        run: npm run test:coverage

      - name: Validate coverage
        run: npm run coverage:validate

      - name: Comment PR with coverage
        if: github.event_name == 'pull_request'
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          lcov-file: ./coverage/lcov.info
```

### Action: DEPRECATE test-coverage.yml

Add comment to top of file:

```yaml
# ⚠️ DEPRECATED - Use test.yml or coverage.yml instead
# This workflow is no longer needed after consolidation
# Kept for reference only
```

---

## STEP 4: Update ci.yml with Concurrency

**File: `.github/workflows/ci.yml`** (Already good, just add concurrency)

Add after `on:` section:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

---

## STEP 5: Fix Action Versions Everywhere

**Audit all workflows for action versions:**

```bash
# Find outdated actions
grep -r "@v3" .github/workflows/
grep -r "@v2" .github/workflows/
```

**Update pattern:** All `actions/` should be `@v4`, all `codecov` should be `@v4`

**Files to update:**
- ✅ test.yml - DONE (updated to @v4)
- ⬜ ci.yml - Check if @v4
- ⬜ security.yml - Check if @v4
- ⬜ code-quality.yml - Check if @v4
- ⬜ All others

---

## STEP 6: Add Caching Strategy (Enhanced)

**Add to all workflows after setup-node:**

```yaml
- name: Restore npm cache
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-npm-

- name: Cache coverage results
  uses: actions/cache@v4
  with:
    path: coverage
    key: ${{ runner.os }}-coverage-${{ github.sha }}
    restore-keys: ${{ runner.os }}-coverage-
```

---

## STEP 7: Fix Permission Scoping

**Review each workflow and update permissions:**

```yaml
# For simple test workflows
permissions:
  contents: read

# For PR workflows that comment
permissions:
  contents: read
  pull-requests: write

# For release workflows
permissions:
  contents: write
  pull-requests: write
  packages: write

# For deployment
permissions:
  contents: read
  deployments: write
```

---

## STEP 8: Add Environment-based Secrets

**Create `.github/workflows/config.yml` (documentation):**

```yaml
# Reference: Recommended GitHub Secrets to set up:
# 
# REQUIRED:
# - CODECOV_TOKEN: For Codecov coverage uploads
# 
# OPTIONAL:
# - SLACK_WEBHOOK: For Slack notifications
# - SENTRY_AUTH_TOKEN: For error tracking
# - NPM_PUBLISH_TOKEN: For npm package publishing
```

---

## STEP 9: Update Timeout Configuration

### jest.config.js
Already updated in STEP 2

### Per-test suite override:

```javascript
// In your test file
describe('Slow Integration Tests', () => {
  beforeAll(() => {
    jest.setTimeout(10000);  // Only for this suite
  });

  it('handles long operations', async () => {
    // test
  });
});
```

---

## STEP 10: Add Better Error Reporting

**Add to ci.yml:**

```yaml
- name: Publish test results
  if: always()
  continue-on-error: true
  run: |
    if [ -f coverage/test-results.json ]; then
      echo "## Test Results" >> $GITHUB_STEP_SUMMARY
      cat coverage/test-results.json >> $GITHUB_STEP_SUMMARY
    fi
```

---

## Implementation Checklist

### Pre-Implementation
- [ ] Create feature branch: `git checkout -b ci/consolidate-workflows`
- [ ] Backup current workflows: `cp -r .github/workflows .github/workflows.backup`
- [ ] Review changes with team

### Implementation Phase 1 (2-3 hours)
- [ ] Update test.yml (action versions + concurrency)
- [ ] Fix jest.config.js coverage thresholds
- [ ] Update .nycrc.json (per-file enforcement)
- [ ] Update ci.yml (add concurrency)
- [ ] Add permissions to all workflows
- [ ] Test changes on feature branch

### Testing
- [ ] Create test PR
- [ ] Verify test.yml runs
- [ ] Verify ci.yml runs
- [ ] Verify coverage reporting
- [ ] Check artifact uploads
- [ ] Confirm no duplicate runs

### Validation
- [ ] Coverage reports generated
- [ ] CI/CD time reduced
- [ ] Same test pass rate
- [ ] No regressions
- [ ] All workflows succeed

### Finalization
- [ ] Update CONTRIBUTING.md with new workflow info
- [ ] Create detailed changelog
- [ ] Commit: `git commit -m "ci: consolidate workflows and improve configuration"`
- [ ] Push feature branch
- [ ] Get PR approval
- [ ] Merge to main

---

## Troubleshooting

### If tests fail after changes:
1. Check action versions compatibility
2. Verify npm cache is working
3. Run locally: `npm ci && npm test`
4. Check GitHub Actions logs
5. Revert and try incrementally

### If coverage drops:
1. Verify thresholds match between jest and nyc
2. Check that coverage files are generated
3. Review any excluded files
4. Run: `npm run test:coverage`

### If workflows don't trigger:
1. Verify branch names match
2. Check concurrency group syntax
3. Review permissions
4. Manually trigger from Actions tab

---

## Post-Implementation Tasks

### Week 1: Monitor
- Monitor all workflows
- Check CI/CD time reduction
- Verify no regressions

### Week 2: Optimize
- Fine-tune concurrency groups
- Optimize cache strategies
- Adjust timeouts if needed

### Week 3: Document
- Update CONTRIBUTING.md
- Create CI/CD guide for team
- Document workflow triggers

### Week 4: Plan Phase 2
- Schedule next improvements
- Plan performance monitoring
- Plan security enhancements

---

## Expected Outcomes

### Before Changes
```
test.yml runs:        2 (Node 18, 20) = 2 workflows
ci.yml runs:          2 (Node 20, 22) = 2 workflows  
coverage.yml runs:    1 (redundant)  = 1 workflow
test-coverage.yml:    1 (unknown)    = 1 workflow
─────────────────────────────────────
Total:               6 workflow runs
Parallel jobs:       Multiple parallel CI jobs
Time per push:       ~30 minutes
```

### After Phase 1
```
test.yml runs:        2 (Node 20, 22) with concurrency = 1 workflow
ci.yml runs:          2 (Node 20, 22) with concurrency = 1 workflow
coverage.yml runs:    1 (supplementary) = 1 workflow
─────────────────────────────────────
Total:               3 workflow runs
Parallel jobs:       Sequential with concurrency control
Time per push:       ~18 minutes (40% reduction)
```

### Metrics Improvement
- ✅ CI/CD time: 30 min → 18 min (40% reduction)
- ✅ Workflow consistency: 100%
- ✅ Test coverage enforcement: Global + per-file
- ✅ Action versions: All current (@v4+)
- ✅ Permission scoping: Least privilege

---

## Questions & Support

**Q: Will this break existing PRs?**  
A: No, existing PRs will continue to work. New improvements only apply to future runs.

**Q: Can I roll back?**  
A: Yes, restore from `.github/workflows.backup` folder.

**Q: Should I merge coverage.yml into test.yml?**  
A: Keep both for now. Coverage.yml handles PR comments separately.

**Q: What about test-coverage.yml?**  
A: Mark as deprecated, can be removed after 1-2 weeks of monitoring.

**Q: How do I update my local development?**  
A: Just pull the latest changes, no local config changes needed.
