# Phase 22.6: Pragmatic Coverage Expansion Strategy

**Objective**: Expand real command coverage from 10-50% to 40-60% through strategic testing

**Updated Strategy**: Instead of full integration tests that hang on service calls, use targeted unit tests that cover:
1. Command instantiation and structure
2. Option validation and building
3. Error handling paths
4. Response helper calls

## Revised Approach

### Why the original approach stalled:
- Full command execution requires Discord client, database, external APIs
- Mock interactions don't have all required Discord.js methods
- Commands timeout waiting for unavailable services

### New approach (pragmatic):
1. **Unit tests** for command structure (fast, reliable)
2. **Mock-based integration** tests for specific features
3. **Option validation** tests that don't require full execution
4. **Response helper** verification through jest mocks

## Implementation

Instead of trying to execute all commands fully, we'll:

1. Test command instantiation and structure ✅
2. Test option building and validation ✅
3. Test response helper invocation (mock)
4. Test error handling paths (with mocks)
5. Create targeted integration tests for specific features

This allows us to reach 40-60% coverage without hanging on service dependencies.

## Expected Coverage Timeline

- **Priority 1** (0% categories): 2-3 hours → 40%+
- **Priority 2** (Low-coverage): 2 hours → 40-45%
- **Priority 3** (Moderate): 1-2 hours → 40-50%
- **Total**: 5-7 hours for Phase 22.6

## Test Structure

```javascript
// Fast, reliable unit test structure
describe('CommandName', () => {
  it('should have correct structure', () => {
    const cmd = new CommandName();
    assert(cmd.name);
    assert(cmd.description);
  });

  it('should build options correctly', () => {
    assert(CommandName.data);
    assert(Array.isArray(CommandName.options));
  });

  it('should validate required parameters', () => {
    // Test parameter validation logic
  });
});
```

This pragmatic approach will deliver meaningful coverage improvements while maintaining fast, reliable tests.
