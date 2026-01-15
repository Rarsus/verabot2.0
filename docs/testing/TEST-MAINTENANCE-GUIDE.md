# Test Maintenance & Development Guide

## Overview
This guide provides best practices for maintaining, updating, and developing tests as the codebase evolves. It ensures test quality and relevance throughout the development lifecycle.

---

## Test Maintenance Strategy

### 1. Regular Test Review (Weekly)

**Purpose:** Ensure tests remain relevant and aligned with current implementation

**Checklist:**
- [ ] Review test execution times
- [ ] Identify flaky tests
- [ ] Check for obsolete tests
- [ ] Verify test descriptions are accurate
- [ ] Assess coverage gaps

**Command:**
```bash
npm run test:report
npm run test:performance
```

### 2. Flaky Test Management

**Identifying Flaky Tests:**
```bash
# Run tests 5 times to detect flakiness
for i in {1..5}; do npm test; done
```

**Fixing Flaky Tests:**
1. Run test in isolation to reproduce issue
2. Look for timing-dependent code
3. Add proper waits/delays if needed
4. Check for cleanup issues between tests
5. Consider mocking unstable dependencies

**Best Practices:**
- Use `beforeEach` and `afterEach` for setup/teardown
- Avoid hardcoded timeouts
- Mock external dependencies
- Use proper async/await syntax
- Clean up resources (databases, connections)

### 3. Test Deprecation Policy

**When to Deprecate a Test:**
1. Feature is removed or refactored
2. Test no longer serves a purpose
3. Functionality moved to different test
4. Behavior changed and old test becomes invalid

**Deprecation Process:**
```javascript
// Step 1: Mark as deprecated
describe.skip('DEPRECATED: Old feature test', () => {
  // ... test code
});

// Step 2: Update DEPRECATION-LOG.md
// - What: Description of deprecated test
// - Why: Reason for deprecation
// - When: Date of deprecation
// - Replacement: New test or functionality

// Step 3: Remove in next major version
```

### 4. Test Versioning

**Semantic Versioning for Tests:**
```
MAJOR.MINOR.PATCH
- MAJOR: Breaking changes (rewrites)
- MINOR: New tests added
- PATCH: Bug fixes in tests
```

**Example:**
```javascript
// Version: phase17-quote-commands.test.js@1.0.0
describe('Phase 17: Quote Commands v1.0', () => {
  // Tests for v1.0 of quote command API
});
```

---

## Test Update Process

### When Code Changes

**1. Implementation Changes (Non-Breaking)**
```javascript
// ✅ DO: Update assertions to match new behavior
it('should return sorted results', () => {
  const results = search('quote');
  // Old: assert(Array.isArray(results))
  // New: assert sorted by relevance
  assert(results[0].score >= results[1].score);
});
```

**2. Breaking Changes**
```javascript
// 1. Create new test file for new version
// tests/phase17-quote-commands-v2.test.js

// 2. Keep old tests, mark as skip/deprecated
describe.skip('DEPRECATED: Old behavior', () => { /* ... */ });

// 3. Add migration notes
// docs/MIGRATION-GUIDE.md - v1 to v2
```

**3. Bug Fixes**
```javascript
// If bug fix reveals test gap:
it('should handle edge case X', () => {
  // New test for bug that was fixed
  const result = operation(edgeCase);
  assert(result === expectedFix);
});
```

### Updating Test Files

**Step 1: Identify Tests to Update**
```bash
# Search for tests using removed functionality
grep -r "oldFunction" tests/
```

**Step 2: Update Test Code**
```javascript
// Old
const result = await oldFunction(args);

// New
const result = await newFunction(args);
```

**Step 3: Verify Tests Pass**
```bash
npm test -- tests/specific-test.js
```

**Step 4: Run Full Suite**
```bash
npm test
```

**Step 5: Commit Changes**
```bash
git add tests/
git commit -m "Update tests for feature X changes"
```

---

## Test Development Workflow

### Adding New Tests

**Phase 1: Analyze**
- [ ] Identify feature to test
- [ ] Understand current coverage
- [ ] Determine test scope
- [ ] Plan test organization

**Phase 2: Create Test File**
```bash
# Create test file following naming convention
touch tests/test-{feature-name}.js
```

**Phase 3: Write Tests (TDD)**
```javascript
// 1. Write test first
it('should implement feature X', () => {
  const result = featureX(input);
  assert(result === expected);
});

// 2. Run test (will fail - RED)
npm test

// 3. Implement feature to pass test (GREEN)
function featureX(input) {
  return doSomething(input);
}

// 4. Refactor while tests pass (REFACTOR)
// Optimize code quality without changing behavior
```

**Phase 4: Documentation**
- [ ] Add JSDoc comments to tests
- [ ] Document test scenarios
- [ ] Add any special setup requirements
- [ ] Note dependencies

**Phase 5: Review & Commit**
- [ ] Self-review for quality
- [ ] Run full test suite
- [ ] Commit with clear message

### Test Organization Best Practices

**File Structure:**
```
tests/
├── unit/                 # Unit tests for modules
│   ├── test-services.js
│   ├── test-utilities.js
│   └── test-helpers.js
├── integration/          # Integration tests
│   ├── test-workflows.js
│   └── test-api.js
└── phase17-*.test.js    # Phase-specific tests
```

**Describe Block Organization:**
```javascript
describe('Feature Name', () => {
  describe('Subfeature A', () => {
    it('should do X', () => { /* ... */ });
    it('should do Y', () => { /* ... */ });
  });

  describe('Subfeature B', () => {
    it('should do Z', () => { /* ... */ });
  });

  describe('Error Handling', () => {
    it('should handle error X', () => { /* ... */ });
  });
});
```

---

## Performance & Monitoring

### Test Performance Targets

| Test Type | Target | Warning | Critical |
|-----------|--------|---------|----------|
| Unit | <50ms | >100ms | >500ms |
| Integration | <500ms | >1s | >5s |
| Database | <2s | >5s | >10s |
| Total Suite | <15s | >20s | >30s |

### Monitoring Test Performance

**Command:**
```bash
npm run test:performance
```

**Output Analysis:**
```
slow-test.js: 1200ms ⚠️  (warning threshold)
fast-test.js: 45ms ✅
```

**Optimization Steps:**
1. Identify slow tests
2. Analyze bottlenecks
3. Apply optimization strategies
4. Verify improvement
5. Document changes

---

## Common Test Maintenance Tasks

### Task 1: Update Test for Renamed Function

```javascript
// Before
const result = await oldFunctionName(args);

// After
const result = await newFunctionName(args);

// Commit
git add tests/
git commit -m "chore: update tests for renamed function"
```

### Task 2: Fix Flaky Test

```javascript
// Problem: Test depends on external API timing

// Solution 1: Mock the API
const mockApi = jest.fn().mockResolvedValue(expectedData);

// Solution 2: Add proper wait
await new Promise(resolve => setTimeout(resolve, 100));

// Solution 3: Use proper async patterns
await asyncOperation();
assert(result === expected);
```

### Task 3: Add Missing Test Coverage

```javascript
// Identify gap
const module = require('./uncovered-module');

// Create test file
// tests/test-uncovered-module.js

// Add comprehensive tests
describe('Uncovered Module', () => {
  it('should handle case A', () => { /* ... */ });
  it('should handle case B', () => { /* ... */ });
  it('should handle error case', () => { /* ... */ });
});
```

### Task 4: Deprecate Old Tests

```javascript
// 1. Mark tests as skip
describe.skip('DEPRECATED: Old API tests', () => { /* ... */ });

// 2. Log deprecation
// DEPRECATION-LOG.md entry added

// 3. Direct to new tests
// "See phase17-new-feature-tests.js for current tests"

// 4. Schedule removal (next major version)
```

---

## Documentation Standards

### Test File Header

```javascript
/**
 * Test Suite: Quote Commands
 * Module: src/commands/quote-management/add-quote.js
 * Description: Tests for adding quotes to database
 * 
 * Coverage:
 * - Basic quote addition
 * - Validation (text, author, length)
 * - Guild isolation
 * - Error handling
 * 
 * @requires src/commands/quote-management/add-quote.js
 * @requires src/services/GuildAwareDatabaseService.js
 * 
 * Last Updated: 2026-01-09
 * Version: 1.0.0
 */
```

### Test Case Documentation

```javascript
it('should add quote with text and author', () => {
  // Setup
  const guildId = 'guild-123';
  const quoteText = 'Great quote';
  const author = 'Author Name';

  // Execute
  const result = addQuote(guildId, quoteText, author);

  // Assert
  assert(result.id);
  assert(result.text === quoteText);
  assert(result.author === author);
  assert(result.guildId === guildId);
});
```

---

## Test Review Checklist

Before committing test changes:

- [ ] Tests are descriptive and clear
- [ ] All tests passing locally
- [ ] No console.log statements
- [ ] Proper setup/teardown in hooks
- [ ] Mocks cleaned up after tests
- [ ] No hardcoded timeouts
- [ ] Follows project patterns
- [ ] JSDoc comments added
- [ ] No commented-out code
- [ ] Variable names are meaningful
- [ ] Error messages are helpful
- [ ] Coverage maintained/improved

---

## Continuous Improvement

### Monthly Test Health Review

**Tasks:**
1. [ ] Analyze coverage trends
2. [ ] Review test execution times
3. [ ] Identify and fix flaky tests
4. [ ] Update outdated documentation
5. [ ] Refactor slow tests
6. [ ] Review deprecation log
7. [ ] Plan new tests for gaps

### Quarterly Test Audit

**Tasks:**
1. [ ] Full codebase coverage analysis
2. [ ] Test quality assessment
3. [ ] Performance optimization review
4. [ ] Remove deprecated tests
5. [ ] Update testing strategy
6. [ ] Team knowledge sharing

---

## Support & Resources

**Related Documents:**
- [PHASE-17-COMPLETION-REPORT.md](PHASE-17-COMPLETION-REPORT.md) - Overview of test structure
- [TEST-COVERAGE-ROADMAP.md](TEST-COVERAGE-ROADMAP.md) - Coverage improvement strategy
- `.github/workflows/test.yml` - CI/CD pipeline configuration

**Commands Reference:**
```bash
# Run all tests
npm test

# Run specific test file
npm test tests/test-name.js

# Run tests matching pattern
npm test -- --testNamePattern="pattern"

# Run with coverage
npm run test:coverage

# Watch mode for development
npm test -- --watch

# Verbose output
npm test -- --verbose
```

---

## Contact & Questions

For test maintenance questions or issues:
- Review this guide first
- Check existing test patterns
- Consult senior developers
- Document new patterns for future reference
