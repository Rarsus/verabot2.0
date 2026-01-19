# Database Service - Deprecation Timeline

**Status:** ⚠️ DEPRECATED (January 2026)  
**Current Release:** v3.2.0 (January 20, 2026)  
**Removal Target:** v4.0.0 (Q2 2026)  
**Timeline:** ~4 months

## Overview

The legacy `DatabaseService` wrapper module is being deprecated in favor of specialized global services and guild-aware services. This document outlines the timeline, migration path, and rationale for this change.

### What's Happening?

**v3.1.0 (January 15):** Three new specialized services introduced:
- `GlobalProxyConfigService` - HTTP proxy configuration with encryption
- `GlobalUserCommunicationService` - User opt-in/opt-out preferences
- `CommunicationService` migrated to use GlobalUserCommunicationService

**v3.2.0 (January 20):** Guild-aware notification refactoring completed:
- `ReminderNotificationService` migrated to GuildAwareReminderNotificationService
- 30 integration tests for multi-guild scenarios (100% passing)
- Database abstraction analysis complete (3 options documented)

**v4.0.0 (Q2 2026):** DatabaseService wrapper will be removed entirely.

## Timeline

### Phase 1: Deprecation Introduction (v3.1.0 - January 2026)

- ✅ **COMPLETED**: Create GlobalProxyConfigService with encryption
- ✅ **COMPLETED**: Create GlobalUserCommunicationService for user preferences
- ✅ **COMPLETED**: Migrate CommunicationService to use GlobalUserCommunicationService
- ✅ **COMPLETED**: Add deprecation warning to DatabaseService header
- ✅ **COMPLETED**: Create GLOBAL-SERVICES-MIGRATION-GUIDE.md
- ✅ **COMPLETED**: Update CHANGELOG.md with breaking changes notice
- ✅ **COMPLETED**: Update .github/copilot-instructions.md

**What Works:**
- All 2873 existing tests passing
- Services fully implemented and tested (82 new tests)
- CommunicationService refactored to use new service
- Proxy commands kept as-is (per architecture decision)

### Phase 2: Guild-Aware Migration (v3.2.0 - January 2026) ✅ COMPLETE

- ✅ **COMPLETED**: Refactor ReminderNotificationService to guild-aware pattern
- ✅ **COMPLETED**: Add 30 integration tests for multi-guild scenarios
- ✅ **COMPLETED**: Analyze database abstraction options (3 strategies, 650+ lines)
- ✅ **COMPLETED**: Maintain 100% backward compatibility
- ✅ **COMPLETED**: Achieve 100% test pass rate (2985 tests)

**What Works:**
- Notifications scoped to guild context
- Batch processing for multi-guild delivery (10 guilds at a time)
- Guild isolation verified through integration tests
- Concurrent operations safe across guilds
- Error isolation prevents cross-guild failures

### Phase 3: Migration Period (v3.3.0-v3.9.x - Feb-May 2026)

- ⏳ **PENDING**: Implement DatabaseSpecification class (see DATABASE-ABSTRACTION-ANALYSIS.md)
- ⏳ **PENDING**: Create additional specialized services as needed
- ⏳ **PENDING**: Monitor for edge cases and new use patterns

**Expected Actions:**
- Any new code must use specialized services or guild-aware services
- Existing code using DatabaseService continues working
- Detailed migration examples provided

### Phase 4: Final Removal (v4.0.0 - Q2 2026)

- Remove src/services/DatabaseService.js entirely
- Remove all wrapper imports
- Update package version to v4.0.0
- Archive this timeline document

**Breaking Change Notice:**
This will be released as v4.0.0 (major version) to clearly indicate breaking changes.

## Why the Deprecation?


### Problems with db.js

1. **Missing Guild Context Enforcement**

   ```javascript
   // ❌ This works but is DANGEROUS
   const quotes = await db.getAllQuotes();
   // Returns quotes from which guild? Unclear!
   ```

2. **Backward Compatible with Single-Database Pattern**
   - Designed for single shared database
   - Makes multi-guild architecture confusing
   - Guild context becomes optional

3. **Extra Indirection Layer**

   ```
   Command → db.js → DatabaseService → SQLite
   ```

   - Makes testing harder (must mock multiple layers)
   - Makes refactoring harder (hidden complexity)

4. **No Type Safety**
   - Optional guildId parameter
   - Can't tell from function signature if guild-aware
   - Easy to make mistakes in multi-guild context

### Benefits of Guild-Aware Services

1. **Mandatory Guild Context**

   ```javascript
   // ✅ Guild context is REQUIRED
   const quotes = await quoteService.getAllQuotes(guildId);
   // Clear: these are quotes for this specific guild
   ```

2. **Direct Service Imports**

   ```
   Command → QuoteService → GuildAwareDatabaseService → SQLite
   ```

   - Simpler layer structure
   - Easier to test (fewer layers)
   - Easier to refactor (direct dependency)

3. **Type-Safe Guild Isolation**

   ```javascript
   // Guild context is first parameter, always required
   // TypeScript would catch missing guildId
   async addQuote(guildId, text, author) {
     if (!guildId) throw new Error('Guild ID required');
     // ...
   }
   ```

4. **Scales Naturally**
   - Works with single database per guild
   - Works with multiple database servers
   - Guild isolation is architecture-independent

## Migration Guide

### Before (db.js)

```javascript
const { addQuote, getAllQuotes, searchQuotes } = require('../../db');

async function executeInteraction(interaction) {
  const guildId = interaction.guildId;

  // Guild context is optional - must pass it explicitly
  const quoteId = await addQuote(guildId, text, author);
  const quotes = await getAllQuotes(guildId);
  const results = await searchQuotes(guildId, keyword);
}
```

### After (Guild-Aware Service)

```javascript
const quoteService = require('../../services/QuoteService');

async function executeInteraction(interaction) {
  const guildId = interaction.guildId;

  // Guild context is required - enforced by service
  const quoteId = await quoteService.addQuote(guildId, text, author);
  const quotes = await quoteService.getAllQuotes(guildId);
  const results = await quoteService.searchQuotes(guildId, keyword);
}
```

**Changes:**

- Import: `require('../../db')` → `require('../../services/QuoteService')`
- Usage: `addQuote(...)` → `quoteService.addQuote(...)`
- Pattern: Same method signatures, just moved to guild-aware service

### Service Mapping

#### Quote Operations → QuoteService

```javascript
const quoteService = require('../../services/QuoteService');

// All methods require guildId as first parameter
await quoteService.addQuote(guildId, text, author);
await quoteService.getAllQuotes(guildId);
await quoteService.getQuoteById(guildId, id);
await quoteService.updateQuote(guildId, id, text, author);
await quoteService.deleteQuote(guildId, id);
await quoteService.searchQuotes(guildId, keyword);
await quoteService.getRandomQuote(guildId);
await quoteService.getQuoteCount(guildId);
await quoteService.rateQuote(guildId, id, userId, rating);
await quoteService.getQuoteRating(guildId, id);
await quoteService.tagQuote(guildId, id, tagName);
await quoteService.getQuotesByTag(guildId, tagName);
await quoteService.exportAsJson(guildId, quotes);
await quoteService.exportAsCSV(guildId, quotes);
```

#### Reminder Operations → GuildAwareReminderService

```javascript
const reminderService = require('../../services/GuildAwareReminderService');

// All methods require guildId as first parameter
await reminderService.addReminder(guildId, userId, text, dueDate);
await reminderService.getReminderById(guildId, id);
await reminderService.getUserReminders(guildId, userId);
await reminderService.updateReminder(guildId, id, text, dueDate);
await reminderService.deleteReminder(guildId, id);
// ... etc
```

#### Direct Database → GuildAwareDatabaseService

```javascript
const guildDbService = require('../../services/GuildAwareDatabaseService');

// For complex queries or operations not covered by services
const db = await guildDbService.getGuildDatabase(guildId);
const result = await guildDbService.executeQuery(guildId, sql, params);
```

## Migration Checklist

- [ ] Identify all files using `require('../../db')`
- [ ] Determine which service to use (Quote, Reminder, or Direct DB)
- [ ] Update imports to use guild-aware service
- [ ] Add guildId parameter extraction
- [ ] Update all method calls with guildId
- [ ] Test guild isolation (guild A can't see guild B's data)
- [ ] Run full test suite: `npm test`
- [ ] Run linting: `npm run lint`
- [ ] Commit with message: `refactor: Migrate from db.js to QuoteService`

## Documentation References

- [COMMAND-DATABASE-PATTERNS-ANALYSIS.md](./COMMAND-DATABASE-PATTERNS-ANALYSIS.md) - Architectural analysis
- [ARCHITECTURE-PATTERNS-VISUAL.md](./architecture/ARCHITECTURE-PATTERNS-VISUAL.md) - Visual comparison
- [.github/copilot-instructions.md](../../.github/copilot-instructions.md) - Development guide
- [src/services/QuoteService.js](../../src/services/QuoteService.js) - Implementation reference
- [src/services/GuildAwareReminderService.js](../../src/services/GuildAwareReminderService.js) - Reminder service
- [src/services/GuildAwareDatabaseService.js](../../src/services/GuildAwareDatabaseService.js) - Base service

## Status of Migration

### Completed (v3.1.0) ✅

- GlobalProxyConfigService created and fully tested (40 tests)
- GlobalUserCommunicationService created and fully tested (42 tests)
- CommunicationService migrated to use GlobalUserCommunicationService
- DatabaseService marked with deprecation warning and migration guidance
- GLOBAL-SERVICES-MIGRATION-GUIDE.md created with detailed examples
- All 2827 tests passing (zero regressions)
- CHANGELOG.md updated with breaking changes notice

### In Progress (v3.2.0) ⏳

- [ ] ReminderNotificationService refactoring to guild-aware pattern
- [ ] Additional specialized services as needed
- [ ] Documentation updates for new services

### Upcoming (v3.9.x before v4.0.0)

- [ ] Final migration validation
- [ ] Edge case handling
- [ ] Performance testing with new services
- [ ] Documentation review

### Migration Complete at v4.0.0 🎯

- DatabaseService.js will be permanently removed
- Breaking change: all imports must use new services
- Version bumped to 4.0.0 to signal major changes


## FAQ

### Q: Can I still use db.js?

**A:** Yes, it still works for backward compatibility, but don't add new code using it. All new feature development must use guild-aware services.

### Q: What if I find db.js being used somewhere?

**A:** Please migrate it immediately using the migration guide above. Report findings to the team so we can track progress.

### Q: Why not just keep db.js around?

**A:** Maintaining two parallel patterns creates:

- Confusion about which to use
- Maintenance burden (two implementations)
- Risk of guild isolation bugs
- Friction for new developers learning the codebase

Removing it in v0.3.0 forces consistency and prevents technical debt.

### Q: What about backward compatibility?

**A:** This is a library used internally. The deprecation notice gives 2 months for migration. External users would need to update their code, but we're the only consumer.

### Q: Which service should I use?

**A:**

- **Quote operations** → `QuoteService`
- **Reminder operations** → `GuildAwareReminderService`
- **Custom database operations** → `GuildAwareDatabaseService`
- **Need help?** See COMMAND-DATABASE-PATTERNS-ANALYSIS.md

## Version Information

- **Deprecation Release:** v0.2.1 (January 2026)
- **Final Support:** v0.2.x (through February 2026)
- **Removal Release:** v0.3.0 (March 2026)

## Questions or Issues?

If you encounter issues migrating from db.js to guild-aware services:

1. Check the migration guide above
2. Review example implementations in migrated commands
3. Check COMMAND-DATABASE-PATTERNS-ANALYSIS.md
4. Review actual service implementations

---

**Last Updated:** January 15, 2026 (Phase 23.0 Complete)  
**Timeline Status:** Phase 1 (Deprecation Introduction) ✅ Complete  
**Next Phase:** Phase 2 (Migration Period) - Pending ReminderNotificationService refactoring

