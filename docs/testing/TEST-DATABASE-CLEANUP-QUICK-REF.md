# Test Database Cleanup - Quick Reference

## TL;DR

✅ **Test database files ARE being cleaned up automatically** after each `npm test` run.

## Key Facts

| Question | Answer |
|----------|--------|
| Are those db files test files? | ✅ Yes, 541 test guild databases in `data/db/guilds/` |
| Do they consume storage? | ⚠️ Yes - 48 MB total, growing before cleanup |
| Are they cleaned up? | ✅ Yes - global Jest teardown removes them after tests |
| Do I need to manually delete them? | ❌ No - automatic cleanup handles it |
| How often are they removed? | After every `npm test` execution completes |

## What Happens

### During Test Run
```
npm test
  ↓
Tests create guild databases in data/db/guilds/
  ↓
Tests use databases (add quotes, reminders, etc.)
  ↓
Tests complete (tests pass or fail)
  ↓
```

### After Test Run (NEW)
```
Global Jest teardown triggered
  ↓
Removes ALL guild directories from data/db/guilds/
  ↓
Preserves _schema/ directory
  ↓
Logs: "✓ Test database cleanup completed"
  ↓
Next test run starts with clean slate
```

## Commands

```bash
# Run tests (cleanup happens automatically at end)
npm test

# Check database directory before tests
ls -la data/db/guilds/

# Check storage usage
du -sh data/db/

# Expected: After cleanup is ~100 KB, before next test run
```

## Configuration

**Files Changed:**

1. `tests/jest-teardown.js` (NEW)
   - Global teardown hook that removes test databases
   - Preserves schema directory and other data

2. `jest.config.js` (UPDATED)
   - Added `globalTeardown` configuration
   - Points to new teardown hook

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Databases not cleaned up | Run `npm test` (cleanup happens after tests complete) |
| Cleanup failed message | Check write permissions on `data/db/guilds/` |
| Tests hanging | Ensure database connections close properly in `afterEach` |

## See Also

- [TEST-DATABASE-CLEANUP-ANALYSIS.md](TEST-DATABASE-CLEANUP-ANALYSIS.md) - Full analysis
- [jest.config.js](../../jest.config.js) - Jest configuration
- [tests/jest-teardown.js](../../tests/jest-teardown.js) - Cleanup implementation
