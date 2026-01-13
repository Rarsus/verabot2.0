# Phase 22.6: Coverage Expansion (40% → 60%)

**Objective**: Expand real command coverage from 10-50% to 40-60% across all 39 commands through systematic parameter testing, validation testing, and error path testing.

**Status**: IN PROGRESS

**Branch**: `feature/phase-22.6-coverage-expansion`

## Current Coverage Baseline

| Category | Files | Current | Target |
|----------|-------|---------|--------|
| admin | 9 | 0% | 40-50% |
| misc | 4 | 11.15% | 45-50% |
| quote-discovery | 3 | 16.91% | 40-45% |
| quote-export | 1 | 14.03% | 40-45% |
| quote-management | 5 | 11.62% | 40-45% |
| quote-social | 2 | 13.33% | 40-45% |
| reminder-management | 6 | 17.35% | 40-50% |
| user-preferences | 4 | 0% | 40-50% |
| **Total** | **39** | **11%** | **40-50%** |

## Strategy

Phase 22.6 will add **3 types of tests per command**:

### 1. Parameter Tests (5 tests/command)
- Test each command option/parameter individually
- Verify options are properly processed
- Test different option value types (strings, numbers, boolean, etc.)
- Test optional vs required parameters
- Verify command builds correct output with parameters

### 2. Validation Tests (3 tests/command)
- Test invalid input handling
- Test boundary conditions (empty strings, 0, negative numbers, max length, etc.)
- Test permission validation
- Test guild/user context validation

### 3. Error Path Tests (2 tests/command)
- Test service failures (database errors, API errors)
- Test error message generation
- Test graceful error handling

## Implementation Priority

**Priority 1: Zero Coverage Categories** (admin, user-preferences)
- 9 + 4 = 13 commands needing ~4 tests each
- Goal: Move from 0% → 40%+
- Estimated effort: 6-8 hours

**Priority 2: Low Coverage Categories** (misc, quote-discovery, quote-export, quote-management, quote-social)
- 3 + 1 + 5 + 2 + 4 = 15 commands needing ~2-3 tests each
- Goal: Move from 11-17% → 40-45%
- Estimated effort: 4-5 hours

**Priority 3: Moderate Coverage** (reminder-management)
- 6 commands needing ~2 tests each
- Goal: Move from 17% → 40-50%
- Estimated effort: 2-3 hours

## Total Effort Estimate
- **Hourly**: 12-16 hours
- **Test count**: ~130 new tests
- **Expected result**: 2,300+ total tests, 40-60% command coverage

## Test Patterns

All tests follow the established patterns from Phase 22.5:

```javascript
// Parameter test pattern
it('should handle command with all parameters', async () => {
  const interaction = MockInteractionBuilder
    .create('command-name')
    .withGuild('guild-123')
    .withOption('param1', 'value1')
    .withOption('param2', 'value2')
    .build();
  
  const result = await executor.executeCommand(CommandClass, interaction);
  assert.strictEqual(result.success, true);
});

// Validation test pattern
it('should reject invalid parameter value', async () => {
  const interaction = MockInteractionBuilder
    .create('command-name')
    .withGuild('guild-123')
    .withOption('param1', '') // invalid: empty
    .build();
  
  const result = await executor.executeCommand(CommandClass, interaction);
  // Verify error handling
  assert(result.error || !result.success);
});

// Error path test pattern
it('should handle service error gracefully', async () => {
  // Mock service to throw error
  // Verify command catches and handles
  const result = await executor.executeCommand(CommandClass, interaction);
  assert(result.success === false || result.error);
});
```

## Tracking Progress

Will track coverage by category in real-time:
- Green: 40%+ coverage achieved
- Yellow: 30-40% coverage in progress
- Red: <30% coverage needs work

## Next Phases

**Phase 22.7**: Advanced coverage (60% → 90%)
- Concurrent operation testing
- End-to-end scenarios
- Permission checking
- Rate limiting
- State management

**Phase 22.8**: Final polish
- Code coverage documentation
- Performance optimization
- Release notes
- v0.2.0 release preparation

## Success Criteria

- ✅ 40%+ coverage on all 39 commands
- ✅ 130+ new tests created and passing
- ✅ All error paths tested
- ✅ All parameter combinations validated
- ✅ 100% test pass rate maintained
- ✅ Performance <15s for full test suite
