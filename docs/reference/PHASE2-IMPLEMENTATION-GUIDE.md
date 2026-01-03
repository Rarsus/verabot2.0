# Phase 2: DatabaseService Compatibility Layer

## Overview

Phase 2 adds backward compatibility to `DatabaseService.js` so existing code continues to work while new code can pass `guildId` for per-guild operations.

## Strategy

Instead of rewriting `DatabaseService.js` completely, we'll add an optional `guildId` parameter that:
1. Routes to `GuildAwareDatabaseService` when `guildId` is provided
2. Routes to existing DatabaseService when `guildId` is omitted (backward compatible)

## Migration Pattern

```javascript
// OLD CODE (still works - uses shared database)
const quoteId = await db.addQuote(text, author);

// NEW CODE (guild-aware)
const quoteId = await db.addQuote(guildId, text, author);

// How we detect: If first param is a string that looks like Discord ID, treat as guildId
// Otherwise treat as old API
```

## Implementation: DatabaseService Wrapper

Add these functions to the top of `DatabaseService.js` to intelligently route calls:

```javascript
const GuildAwareDatabaseService = require('./GuildAwareDatabaseService');
const guildManager = require('./GuildDatabaseManager');

// Helper: Check if a value looks like a Discord guild ID (18-20 digit string)
function isDiscordId(val) {
  return typeof val === 'string' && /^\d{18,20}$/.test(val);
}

// Helper: Detect if we're using guild-aware API
function isGuildAwareCall(firstArg) {
  return isDiscordId(firstArg);
}
```

## Key Methods to Update

For each method, add guild-aware overload:

```javascript
// BEFORE: Only shared database
function addQuote(text, author = 'Anonymous') { /* ... */ }

// AFTER: Supports both
function addQuote(textOrGuildId, authorOrText, optionalAuthor) {
  if (isGuildAwareCall(textOrGuildId)) {
    // New guild-aware API
    const guildId = textOrGuildId;
    const text = authorOrText;
    const author = optionalAuthor || 'Anonymous';
    return GuildAwareDatabaseService.addQuote(guildId, text, author);
  } else {
    // Legacy shared database API
    const text = textOrGuildId;
    const author = authorOrText || 'Anonymous';
    // ... existing implementation
  }
}
```

## Methods to Update

These 15+ methods need guild-aware overloads:

1. `addQuote(guildId, text, author)`
2. `getAllQuotes(guildId)`
3. `getQuoteById(guildId, id)`
4. `getQuoteByNumber(guildId, number)` - alias for getQuoteById
5. `searchQuotes(guildId, keyword)`
6. `updateQuote(guildId, id, text, author)`
7. `deleteQuote(guildId, id)`
8. `getQuoteCount(guildId)`
9. `rateQuote(guildId, quoteId, userId, rating)`
10. `getQuoteRating(guildId, quoteId)`
11. `tagQuote(guildId, quoteId, tagName)`
12. `getQuotesByTag(guildId, tagName)`
13. `getGuildStatistics(guildId)` - NEW
14. `exportGuildData(guildId)` - NEW GDPR compliance
15. `deleteGuildData(guildId)` - NEW GDPR: delete all guild data

## Files Modified

- `src/services/DatabaseService.js` - Add guild-aware overloads to existing functions

## Backward Compatibility

✅ All existing code without guildId continues to work
✅ New code with guildId uses per-guild databases
✅ Gradual migration possible: update commands one at a time
✅ No breaking changes

## Command Handler Changes Required

Once Phase 2 is done, Phase 3 updates command handlers:

```javascript
// OLD (works with Phase 2)
const quote = await db.addQuote(text, author);

// NEW (Phase 3 - after updating command handlers)
const quote = await db.addQuote(interaction.guildId, text, author);
```

## Testing

Phase 2 testing ensures:
- ✅ Old API still works (shared database)
- ✅ New API works (per-guild)
- ✅ Both APIs can coexist
- ✅ No cross-guild contamination

## Timeline

- Phase 2: 1-2 days
  - Add detection logic
  - Create overloads for all methods
  - Test backward compatibility
  
- Phase 3: 2-3 days
  - Update ~20 command files
  - Test each command
  - Verify guild isolation

- Phase 4: 1-2 days
  - Migrate existing data
  - Validate migration

## Next Steps

After Phase 2 is complete:
1. Run tests to verify backward compatibility
2. Proceed to Phase 3 (update command handlers)
3. After all commands are updated, run Phase 4 (migration)
