# Database Module (db.js) - Deprecation Timeline

**Status:** ⚠️ DEPRECATED (January 2026)  
**Removal Target:** v0.3.0 (March 2026)  
**Timeline:** 2 months

## Overview

The legacy `src/db.js` wrapper module is being deprecated in favor of guild-aware services. This document outlines the timeline, migration path, and rationale for this change.

## Timeline

### Phase 1: Deprecation Notice (NOW - January 2026)

- ✅ **COMPLETED**: Add deprecation warning to src/db.js header
- ✅ **COMPLETED**: Update .github/copilot-instructions.md
- ✅ **COMPLETED**: Update documentation with migration guide
- ⏳ **IN PROGRESS**: Communicate deprecation to team

**Actions:**

- All new code must use guild-aware services
- Existing code using db.js continues to work (backward compatible)
- Clear migration instructions provided

### Phase 2: Warning Period (February 2026)

- Monitor usage of db.js across codebase
- Support team members migrating to new services
- Update any remaining documentation

**If you find db.js usage:**

1. Replace with appropriate guild-aware service
2. Add guildId parameter to all method calls
3. Test guild isolation (A != B in different guilds)

### Phase 3: Removal (March 2026 - v0.3.0)

- Remove src/db.js entirely
- Remove all references from documentation
- Update package version to v0.3.0

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
- [ARCHITECTURE-PATTERNS-VISUAL.md](./ARCHITECTURE-PATTERNS-VISUAL.md) - Visual comparison
- [.github/copilot-instructions.md](../../.github/copilot-instructions.md) - Development guide
- [src/services/QuoteService.js](../../src/services/QuoteService.js) - Implementation reference
- [src/services/GuildAwareReminderService.js](../../src/services/GuildAwareReminderService.js) - Reminder service
- [src/services/GuildAwareDatabaseService.js](../../src/services/GuildAwareDatabaseService.js) - Base service

## Status of Migration

### Completed ✅

- All 11 quote commands migrated to QuoteService
- Reminder commands already using GuildAwareReminderService
- No remaining code depends on db.js wrapper

### In Progress ⏳

- Deprecation notice added to db.js
- Documentation updated
- Copilot instructions updated

### Upcoming (February 2026)

- Monitor for any emergency db.js usage
- Support team migration if needed
- Finalize removal in v0.3.0

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

**Last Updated:** January 3, 2026  
**Timeline Status:** Phase 1 (Deprecation Notice) ✅ Complete
