# Code Coverage Setup Guide

This guide explains how to use the code coverage infrastructure in VeraBot2.0.

## Overview

VeraBot2.0 uses [c8](https://github.com/bcoe/c8) for code coverage reporting. c8 is a modern code coverage tool that uses V8's built-in coverage features for accurate, fast coverage analysis.

## Coverage Configuration

Coverage is configured in `.c8rc.json` with the following settings:

### Coverage Thresholds
- **Lines:** 70% minimum
- **Functions:** 70% minimum
- **Branches:** 65% minimum
- **Statements:** 70% minimum

### Report Formats
Coverage reports are generated in three formats:
- **text** - Console output with summary
- **html** - Browsable HTML report in `coverage/` directory
- **lcov** - Machine-readable format for CI/CD integration

### Excluded Files
The following are excluded from coverage:
- `tests/**` - Test files
- `node_modules/**` - Dependencies
- `coverage/**` - Coverage reports
- `**/*.test.js` - Test files
- `**/*.spec.js` - Spec files

## NPM Scripts

### Run Tests with Coverage
```bash
npm run test:coverage
```
Runs all tests and generates coverage report.

### Generate Coverage Report
```bash
npm run coverage:report
```
Generates coverage reports in all configured formats without running tests.

### Check Coverage Thresholds
```bash
npm run coverage:check
```
Verifies that coverage meets the configured thresholds. Exits with error if thresholds are not met.

## Test Files Structure

Coverage tests are organized by layer:

### Service Layer Tests
- `tests/unit/test-services-database.js` - DatabaseService (20+ tests)
- `tests/unit/test-services-validation.js` - ValidationService (15+ tests)
- `tests/unit/test-services-quote.js` - QuoteService (12+ tests)

### Middleware Tests
- `tests/unit/test-middleware-errorhandler.js` - Error handler (15+ tests)
- `tests/unit/test-middleware-logger.js` - Logger (10+ tests)
- `tests/unit/test-middleware-validator.js` - Command validator (10+ tests)

### Utility Tests
- `tests/unit/test-command-base.js` - Command base class tests
- `tests/unit/test-command-options.js` - Options builder tests
- `tests/unit/test-response-helpers.js` - Response helper tests

## Viewing Coverage Reports

### HTML Reports
After running `npm run test:coverage`, open the HTML report:
```bash
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

The HTML report provides:
- Per-file coverage statistics
- Line-by-line coverage highlighting
- Drill-down to specific functions
- Branch coverage visualization

### Console Reports
Text reports show a summary table:
```
File                  | % Stmts | % Branch | % Funcs | % Lines |
--------------------- | ------- | -------- | ------- | ------- |
src/services/         |   85.5  |   72.3   |   90.1  |   86.2  |
src/middleware/       |   78.9  |   68.5   |   82.3  |   79.1  |
...
```

## Coverage Goals

### Current Status (Week 1)
- **Target:** 70%+ overall coverage
- **Tests:** 150+ tests across all layers
- **Focus:** Service layer and middleware

### Future Goals
- Maintain 70%+ coverage for all new code
- Increase coverage to 80%+ over time
- Add integration test coverage
- Monitor coverage trends in CI/CD

## Best Practices

### Writing Testable Code
1. Keep functions small and focused
2. Use dependency injection where possible
3. Separate business logic from framework code
4. Avoid complex conditionals

### Writing Effective Tests
1. Test one thing per test
2. Use descriptive test names
3. Follow AAA pattern (Arrange, Act, Assert)
4. Test edge cases and error conditions
5. Mock external dependencies

### Coverage Anti-Patterns to Avoid
- ❌ Don't write tests just for coverage
- ❌ Don't ignore test quality for coverage numbers
- ❌ Don't test implementation details
- ❌ Don't skip important edge cases

### What to Test
✅ **Do test:**
- Public API functions
- Business logic
- Error handling
- Edge cases and boundary conditions
- Integration points

❌ **Don't test:**
- Third-party libraries
- Simple getters/setters
- Framework code
- Configuration files

## CI/CD Integration

### GitHub Actions Integration
Add coverage check to your workflow:
```yaml
- name: Run tests with coverage
  run: npm run test:coverage

- name: Check coverage thresholds
  run: npm run coverage:check
```

### Badge Generation
Coverage badges can be generated using services like:
- [Codecov](https://codecov.io/)
- [Coveralls](https://coveralls.io/)
- [Code Climate](https://codeclimate.com/)

## Troubleshooting

### Coverage Too Low
If coverage is below thresholds:
1. Identify uncovered files: Check HTML report
2. Add tests for critical paths
3. Remove dead code
4. Update `.c8rc.json` exclusions if needed

### Tests Passing But Coverage Failing
- Check `.c8rc.json` thresholds
- Verify all files are being tested
- Look for untested branches

### Coverage Reports Missing
- Ensure `coverage/` directory is gitignored
- Check c8 is installed: `npm list c8`
- Verify `.c8rc.json` configuration

## Additional Resources

- [c8 Documentation](https://github.com/bcoe/c8)
- [V8 Coverage Guide](https://v8.dev/blog/javascript-code-coverage)
- [Testing Best Practices](../guides/02-TESTING-GUIDE.md)
- [Contributing Guide](../../CONTRIBUTING.md)

## Support

If you encounter issues with coverage:
1. Check this guide first
2. Review existing test files for examples
3. Check GitHub Issues
4. Ask in Discord developer channel

---

**Last Updated:** December 2024
**Version:** 1.0.0
