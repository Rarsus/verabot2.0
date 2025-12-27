# GitHub Actions Workflow Tests

This directory contains tests to verify that all npm commands used in GitHub Actions workflows work correctly.

## Test File

- `test-github-actions-scripts.js` - Tests all npm commands referenced in GitHub Actions workflows

## Running the Tests

```bash
# Run workflow tests
npm run test:workflows
```

## What It Tests

### Documentation Validation Scripts
- `docs:links` - Check internal and external documentation links
- `docs:version` - Verify version consistency across files
- `docs:badges` - Update status badges in README
- `docs:lint` - Lint markdown files (placeholder)

### Security Tests
- `test:security` - Run security validation tests (20 tests)
- `test:integration` - Run security integration tests (15 tests)

### Other Workflow Commands
- `lint` - Run ESLint with warnings tolerance
- `security:audit` - Run npm audit
- `test:all` - Run all unit tests

## Expected Behavior

- All scripts should execute without throwing errors
- Documentation validation scripts may exit with non-zero codes when finding issues (warnings, broken links) - this is expected behavior
- Security and test scripts should pass with zero failures

## CI Integration

These tests ensure that:
1. All npm commands referenced in `.github/workflows/` files exist
2. Scripts execute successfully 
3. No missing dependencies or configuration issues
4. Workflows won't fail due to command not found errors

## Troubleshooting

If tests fail:

1. **Missing npm script**: Add the script to `package.json`
2. **Missing dependency**: Run `npm ci` to reinstall dependencies
3. **Script execution error**: Check the script file exists and is executable
4. **Test suite failures**: Check that underlying tests pass individually

## Related Documentation

- [CI/CD Setup Guide](../docs/CI-CD-SETUP.md) - Workflow explanations and troubleshooting
- [GitHub Actions Guide](../docs/GITHUB-ACTIONS-GUIDE.md) - Workflow structure and tips
