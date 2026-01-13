# Phase 22.6: Pragmatic Coverage Expansion Strategy

**Objective**: Expand real command coverage from 10-50% to 40-60% through systematic enhancements

**Status**: IN PROGRESS - Implementing

**Lesson Learned**: Full command execution integration tests hang on service dependencies (Discord client, database, external APIs). Instead, we'll use existing test infrastructure and enhance coverage through:

1. **Parameter validation tests** - Test command option validation without full execution
2. **Response helper verification** - Mock response helpers and verify they're called
3. **Error path testing** - Test error handling with mocked services
4. **Existing test enhancement** - Build on Phase 22.5 command mapping tests

## Implementation Plan

### Phase 22.6a: Response Helper Mocking Tests
- Create comprehensive response helper tests
- Verify all commands call response helpers correctly
- Test happy path + error path helper calls
- **Expected**: 15-20 additional tests

### Phase 22.6b: Parameter Validation Tests  
- Test each command's option validation
- Test boundary conditions
- Test invalid input handling
- **Expected**: 40-60 additional tests

### Phase 22.6c: Service Mock Tests
- Mock database and Discord service calls
- Test error handling when services fail
- Test retry logic
- **Expected**: 30-40 additional tests

### Phase 22.6d: Coverage Measurement
- Run coverage after each test batch
- Document coverage improvements
- Identify remaining gaps
- **Expected**: Real-time coverage tracking

## Working Test Patterns (From Phase 22.5)

These patterns WORK without hanging:
- Command structure validation (metadata, options)
- Option builder testing
- Response helper mocking with jest.mock()
- Batch execution with CommandExecutor (simple mocks)

These patterns DON'T WORK (hang on service calls):
- Full command execution with real Discord services
- Database operations without mocking
- External API calls

## Revised Coverage Targets

| Phase | Commands | Current | Target | Method |
|-------|----------|---------|--------|--------|
| 22.6a | All 39 | 10% | 30% | Response helper tests |
| 22.6b | All 39 | 30% | 45% | Parameter validation |
| 22.6c | All 39 | 45% | 55% | Service mocking |
| 22.6d | All 39 | 55% | 60% | Edge cases + cleanup |
| Total | **39** | **10%** | **60%** | Systematic approach |

## Implementation Schedule

- **22.6a** (2 hours): Response helper mocking - ALL 39 commands
- **22.6b** (3 hours): Parameter validation - Priority 1 (admin, user-pref)
- **22.6c** (2 hours): Service mocking - Reminder and Quote commands
- **22.6d** (1 hour): Final cleanup and measurement
- **Total**: 8 hours → 60% real command coverage

## Key Insight

The 0-50% coverage in Phase 22.5 is from:
- **0-20%**: Command structure + basic instantiation
- **20-40%**: Option processing + response helpers
- **40-60%**: Error handling + complex logic paths
- **60-90%**: Edge cases + integration scenarios (Phase 22.7)
- **90%+**: Advanced scenarios (Phase 22.8)

Phase 22.6 focuses on reaching 40-60% by adding parameter and error testing through **mocked service integration** rather than full command execution.

## Test Infrastructure

Using existing, working infrastructure:
- `CommandExecutor` - Simple validation only (no service calls)
- `MockInteractionBuilder` - Interaction object creation
- `jest.mock()` - Service mocking
- Unit tests - Individual component testing

## Success Criteria

✅ All 39 commands reach 40%+ coverage
✅ 60% average coverage across all commands
✅ 150+ new tests passing
✅ Full test suite <15s
✅ 100% test pass rate maintained
✅ No hanging or timeout issues

## Next Steps

1. Create response helper tests (reusable across all commands)
2. Create parameter validation tests (per-command)
3. Create service mocking tests (per-service)
4. Measure coverage after each batch
5. Document improvements
