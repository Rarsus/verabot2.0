# Automated Test Documentation Generator

## Overview

The `update-test-docs.js` script automatically generates comprehensive test documentation by scanning all test files, counting tests, running them, and producing detailed reports. This eliminates the need for manual documentation updates and ensures accuracy.

## Features

- **Automatic Test Discovery**: Scans all test files in `tests/unit/` directory
- **Accurate Test Counting**: Detects test cases by pattern matching `// Test N:` comments
- **Test Execution**: Runs each test file and captures results
- **Metadata Extraction**: Extracts test descriptions and file headers
- **Documentation Generation**: Creates two comprehensive documentation files
- **Fast Performance**: Completes in under 5 seconds
- **CI/CD Integration**: Automatically runs after tests in GitHub Actions
- **Error Resilient**: Handles test failures gracefully and continues

## Generated Documentation

### 1. `docs/TEST-SUMMARY-LATEST.md`
A concise summary of the latest test run including:
- Test file results (passed/failed)
- Overall statistics (total tests, pass rate, duration)
- Status indicators (✅/❌)

### 2. `docs/TEST-COVERAGE-OVERVIEW.md`
A comprehensive overview including:
- Executive summary with key metrics
- Table of all test files with counts and status
- Detailed breakdown of each test file
- Individual test descriptions
- Test execution commands
- CI/CD integration information

## Usage

### Manual Execution

Run the script manually to update documentation:

```bash
npm run test:docs:update
```

Or directly with Node:

```bash
node scripts/update-test-docs.js
```

### Automatic Execution

The script runs automatically in CI/CD pipelines:

- **After tests pass/fail** in `.github/workflows/ci.yml`
- **After coverage analysis** in `.github/workflows/test-coverage.yml`
- Documentation is uploaded as build artifacts

## How It Works

### 1. Test Discovery
```javascript
// Scans tests/unit/ for all test-*.js files
// Excludes: test-all.js, run-tests.js
const testFiles = getAllTestFiles();
```

### 2. Test Counting
```javascript
// Looks for pattern: // Test N: Description
const testMatches = content.match(/^\/\/ Test \d+:/gm);
const count = testMatches ? testMatches.length : 0;
```

### 3. Test Execution
```javascript
// Runs each test file and captures output
const output = execSync(`node "${filePath}"`);
// Extracts pass/fail counts from test output
```

### 4. Documentation Generation
```javascript
// Generates markdown documentation with:
// - Timestamps
// - Test counts and pass rates
// - Detailed test descriptions
// - Status indicators
```

## Test File Requirements

For accurate detection, test files should follow this pattern:

```javascript
/**
 * Test Suite Description
 * Brief explanation of what this test suite covers
 */

// Test 1: Description of first test
console.log('=== Test 1: Description ===');
// ... test implementation

// Test 2: Description of second test
console.log('=== Test 2: Description ===');
// ... test implementation

// Test summary output
console.log('=== Test Summary ===');
console.log('✅ Passed: N');
console.log('❌ Failed: N');
console.log('Total: N');
```

## Output Parsing

The script recognizes multiple output formats:

1. **Explicit Summary** (preferred):
   ```
   === Test Summary ===
   ✅ Passed: 10
   ❌ Failed: 2
   Total: 12
   ```

2. **Individual Pass/Fail Lines**:
   ```
   ✅ Test 1 Passed: ...
   ❌ Test 2 Failed: ...
   ```

3. **Symbol Counting** (fallback):
   - Counts ✅ and ❌ symbols in output

## Configuration

Key configuration constants (at top of script):

```javascript
const TESTS_DIR = path.join(__dirname, '../tests/unit');
const DOCS_DIR = path.join(__dirname, '../docs');
const TEST_COVERAGE_DOC = path.join(DOCS_DIR, 'TEST-COVERAGE-OVERVIEW.md');
const TEST_SUMMARY_DOC = path.join(DOCS_DIR, 'TEST-SUMMARY-LATEST.md');
```

## Performance

- **Typical runtime**: 3-5 seconds
- **Test execution**: Parallel-safe, runs sequentially
- **Timeout**: 30 seconds per test file
- **Error handling**: Graceful degradation on test failures

## Exit Codes

- **0**: Success (documentation updated, regardless of test results)
- **1**: Fatal error (script crash, cannot write files)

Note: Test failures do NOT cause the script to exit with code 1. Documentation should be updated regardless of test status.

## CI/CD Integration

### GitHub Actions Workflows

The script is integrated into:

**ci.yml**:
```yaml
- name: 📝 Update test documentation
  if: always()
  run: npm run test:docs:update
  continue-on-error: true
```

**test-coverage.yml**:
```yaml
- name: 📝 Update test documentation
  if: always()
  run: npm run test:docs:update
  continue-on-error: true
```

### Artifacts

Documentation is uploaded as artifacts:
- `docs/TEST-SUMMARY-LATEST.md`
- `docs/TEST-COVERAGE-OVERVIEW.md`
- Retention: 30 days

## Troubleshooting

### Issue: Script times out
**Solution**: Increase timeout in `execSync` options or investigate slow tests

### Issue: Inaccurate test counts
**Solution**: Ensure test files follow the `// Test N:` comment pattern

### Issue: Missing test descriptions
**Solution**: Add test descriptions after `// Test N:` in test files

### Issue: Test execution fails
**Solution**: Check test dependencies and ensure tests can run independently

## Future Enhancements

Potential improvements for future versions:

- [ ] Parallel test execution for faster performance
- [ ] Test categorization (unit, integration, e2e)
- [ ] Historical test trend tracking
- [ ] Coverage integration (merge with c8 reports)
- [ ] Test duration analysis and slow test detection
- [ ] Automatic issue creation for failing tests
- [ ] Slack/Discord notifications for test status changes

## Maintenance

### Adding New Test Files

New test files are automatically detected if they:
1. Are located in `tests/unit/`
2. Follow the naming pattern `test-*.js`
3. Are not `test-all.js` or `run-tests.js`

### Updating Documentation Format

To change the documentation format, modify these functions:
- `generateTestSummary()` - for TEST-SUMMARY-LATEST.md
- `generateCoverageOverview()` - for TEST-COVERAGE-OVERVIEW.md

## Related Files

- `tests/unit/test-all.js` - Comprehensive test runner
- `tests/unit/run-tests.js` - Quick sanity check runner
- `scripts/generate-test-docs.js` - Legacy test documentation (deprecated)
- `.github/workflows/ci.yml` - Main CI workflow
- `.github/workflows/test-coverage.yml` - Coverage workflow

## Support

For issues or questions:
1. Check test file patterns and output formats
2. Review script logs for error messages
3. Verify test files can run independently
4. Check CI/CD workflow logs for integration issues

---

**Last Updated**: 2025-12-28  
**Script Version**: 1.0.0  
**Maintainer**: VeraBot2.0 Development Team
