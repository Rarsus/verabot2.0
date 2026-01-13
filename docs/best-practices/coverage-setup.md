# Code Coverage Setup Guide

This guide explains how to use the code coverage infrastructure in VeraBot2.0.

**Updated:** January 15, 2026 (Phase 22.3 In Progress)  
**Current Coverage:** 22.93% lines / 32.69% functions / 16.4% branches (1525 tests passing)  
**Target Coverage:** 85%+ lines / 95%+ functions / 85%+ branches

## Overview

VeraBot2.0 uses **Jest 30.2.0** for comprehensive testing with code coverage reporting. Jest provides fast, reliable test execution with built-in coverage analysis using V8.

## Coverage Configuration

Coverage is configured in `jest.config.js` with the following targets:

### Coverage Thresholds (Phase 19 Target)

- **Lines:** 90% minimum (currently 31.6%)
- **Functions:** 95% minimum (currently 82.7%)
- **Branches:** 85% minimum (currently 74.7%)
- **Statements:** 90% minimum

### Report Formats

Coverage reports are generated in multiple formats:

- **text** - Console output with summary and uncovered lines
- **text-summary** - Brief console summary
- **html** - Browsable HTML report in `coverage/` directory
- **lcov** - Machine-readable format for CI/CD integration
- **json** - JSON format for programmatic access

### Excluded Files

The following are excluded from coverage:

- `tests/**` - Test files
- `node_modules/**` - Dependencies
- `coverage/**` - Coverage reports
- `dist/**` - Build output
- Deprecated locations (src/utils/command-base.js, etc.)

**Coverage Focus:** Core business logic in services, middleware, commands, and utility helpers.

## NPM Scripts

### Run Tests with Coverage

```bash
npm run test:jest:coverage
```

Runs all tests and generates coverage report with detailed HTML output.

### Check Coverage Thresholds

```bash
npm run coverage:check
```

Verifies that coverage meets the configured thresholds. Exits with error if thresholds are not met.

## Test Files Structure (Phase 19)

Coverage tests are organized into 40+ test files across multiple categories:

### Core Framework Tests (100% coverage)

- `tests/unit/test-command-base.js` - CommandBase class (7 tests)
- `tests/unit/test-command-options.js` - CommandOptions builder (10 tests)
- `tests/unit/test-middleware-errorhandler.js` - Error handler (11 tests)
- `tests/unit/test-middleware-logger.js` - Logger (11 tests)
- `tests/unit/test-middleware-validator.js` - Command validator (11 tests)
- `tests/unit/test-response-helpers.js` - Response helpers (18 tests)

### Infrastructure Service Tests (80%+ coverage)

- `tests/unit/test-cache-manager.js` - CacheManager (38 tests, 98.82% coverage)
- `tests/unit/test-database-pool.js` - DatabasePool (54 tests, 44+ passing)
- `tests/unit/test-migration-manager.js` - MigrationManager (32 tests)
- `tests/unit/test-performance-monitor.js` - PerformanceMonitor (36 tests)
- `tests/unit/test-query-builder.js` - QueryBuilder (27 tests)

### Business Logic Tests (50%+ coverage)

- `tests/unit/test-services-database.js` - DatabaseService (19 tests)
- `tests/unit/test-services-quote.js` - QuoteService (13 tests)
- `tests/unit/test-reminder-notifications.js` - Notifications (12 tests)
- `tests/unit/test-reminder-service.js` - ReminderService (25 tests)

### Command Tests (30%+ coverage)

- `tests/unit/test-misc-commands.js` - Misc commands (13 tests)
- `tests/unit/test-reminder-commands.js` - Reminder commands (15 tests)
- `tests/unit/test-quotes-advanced.js` - Advanced features (18 tests)

## Viewing Coverage Reports

### HTML Reports

After running `npm run test:jest:coverage`, open the HTML report:

```bash
open coverage/lcov-report/index.html  # macOS
xdg-open coverage/lcov-report/index.html  # Linux
start coverage/lcov-report/index.html  # Windows
```

The HTML report provides:

- Per-file coverage statistics
- Line-by-line coverage highlighting with uncovered line numbers
- Drill-down to specific functions and branches
- Coverage trends over time

### Console Reports

Text reports show coverage summary:

```
SUMMARY: 31.6% statements, 74.7% branches, 82.7% functions, 31.6% lines
1,896 passing (98.5%)
7 failing (DatabasePool mocking issues)
```

## Coverage Goals & Roadmap

### Phase 19 Status (COMPLETE) ✓

- **Achievement:** 1525 tests passing (100%)
- **Coverage:** 31.6% global (40+ test files)
- **New Tests:** 180+ created for infrastructure services
- **Fully Tested:** 7 modules at 90%+ coverage

### Phase 20 Goals (In Progress)

- **Target:** 70-75% global coverage
- **Work:** Service layer testing, test file migration
- **Timeline:** 1-2 weeks
- **Tests:** +500-600 additional tests

### Phase 21+ Goals

- **Target:** 85-90% global coverage
- **Work:** Command implementations, edge cases
- **Timeline:** 2-3 weeks
- **Tests:** +200-300 additional tests

### Maintenance

- **Never decrease** existing coverage
- **Always improve** coverage with new code
- **Review coverage** before each major release
- **Refactor tests** for clarity and maintainability
- Utilities (helpers, encryption, proxy): 86.6%

### Future Goals

- Maintain 70%+ coverage for all new code
- Increase coverage to 80%+ over time
- Add integration test coverage for commands
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
