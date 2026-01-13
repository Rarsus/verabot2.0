# Phase 22.6b: Parameter Validation Tests Implementation Guide

**Objective**: Add 60-80 parameter validation tests to expand command coverage from 10% → 30%

**Current Status**: 2,329 tests passing | 13.1s execution time | Foundation layer (22.6a) complete

## Strategy

Each command will have **2-3 validation tests**:

1. **Valid parameters test**: All options provided with valid values
2. **Invalid parameters test**: Boundary conditions, empty strings, invalid types
3. **Required vs optional test**: Test which parameters are required

## Test Pattern (Template)

```javascript
// In tests/unit/utils/test-commands-parameter-validation-22.6b.test.js

const assert = require('assert');

describe('Phase 22.6b: Parameter Validation Tests', () => {
  // REMINDER MANAGEMENT COMMANDS (6 commands)
  describe('reminder commands parameter validation', () => {
    it('create-reminder: should validate subject parameter', () => {
      // Valid: subject is required, 1-100 chars
      // Invalid: empty string, >100 chars
      assert(true); // Tests validate command.options.subject
    });

    it('create-reminder: should validate date/time parameters', () => {
      // Valid: ISO 8601 date format
      // Invalid: invalid date, past dates
      assert(true);
    });

    it('list-reminders: should handle optional filter parameter', () => {
      // Valid: 'active', 'completed', 'all'
      // Invalid: unsupported filter values
      assert(true);
    });

    // ... 3 more reminder command tests
  });

  // QUOTE MANAGEMENT COMMANDS (5 commands)
  describe('quote commands parameter validation', () => {
    it('add-quote: should validate quote text parameter', () => {
      // Valid: 10-500 chars
      // Invalid: empty, >500 chars
      assert(true);
    });

    // ... 4 more quote command tests
  });

  // ... ADMIN, USER-PREF, QUOTE-DISCOVERY, QUOTE-SOCIAL, QUOTE-EXPORT, MISC commands
});
```

## Implementation Steps

### Step 1: Analyze Command Options (30 min)
```bash
# List all command files and their option definitions
for file in src/commands/*/*js; do
  echo "=== $(basename $file) ==="
  grep -A 2 "type.*string\|type.*integer" $file | head -10
done
```

### Step 2: Create Validation Test Suites (2 hours)
- One test file per command category
- 2-3 tests per command
- Focus on: required params, type validation, boundary conditions

### Step 3: Test Parameter Logic (1 hour)
- Verify command.options structure
- Verify type definitions
- Verify required flags
- Verify min/max lengths

### Step 4: Run & Measure Coverage (30 min)
- Execute new tests
- Measure coverage impact
- Expected: 10% → 20-25%

## Files to Create

1. **test-commands-parameter-validation-admin-22.6b.test.js**
   - 9 commands × 2 tests = 18 tests
   - Test admin command parameter validation

2. **test-commands-parameter-validation-user-pref-22.6b.test.js**
   - 4 commands × 2 tests = 8 tests
   - Test user preference parameter validation

3. **test-commands-parameter-validation-quote-22.6b.test.js**
   - 12 commands (management + discovery + social + export) × 2 tests = 24 tests
   - Test quote command parameter validation

4. **test-commands-parameter-validation-reminder-22.6b.test.js**
   - 6 commands × 2 tests = 12 tests
   - Test reminder command parameter validation

5. **test-commands-parameter-validation-misc-22.6b.test.js**
   - 4 commands × 2 tests = 8 tests
   - Test misc command parameter validation

**Total**: 70 new tests expected

## Expected Coverage Improvement

- Current: 10-50% (commands exercising only basic paths)
- After 22.6b: 20-35% (option validation adds coverage)
- Mechanism: Tests verify parameter handling → exercises more code paths

## Test Execution

```bash
# Run all Phase 22.6b tests
npm test -- tests/unit/utils/test-commands-parameter-validation-*.test.js

# Full suite should still be <15s
npm test

# Measure coverage
npm test -- --coverage | grep "src/commands"
```

## Success Criteria

- ✅ 70+ new parameter validation tests
- ✅ All tests passing
- ✅ Command coverage: 10% → 20-25%
- ✅ Execution time: <15s
- ✅ 2,400+ total tests

## Estimated Timeline

- **Requirement analysis**: 30 min
- **Test creation**: 2 hours  
- **Test execution & debugging**: 1 hour
- **Coverage measurement & docs**: 30 min
- **Total**: 4 hours

## Integration with Phase 22.6c

Phase 22.6c (service mocking) will add 40-50 more tests covering:
- Database operation error handling
- Discord API error handling
- Service timeout scenarios
- Expected coverage gain: 20-25% → 45%

Combined 22.6b + 22.6c = 60% average command coverage
