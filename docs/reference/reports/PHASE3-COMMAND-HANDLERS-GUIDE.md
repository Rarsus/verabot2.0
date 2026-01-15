# Phase 3: Update Command Handlers

## Overview

Phase 3 updates all command handlers to extract `guildId` from Discord interactions and pass it to database methods. This enables per-guild data isolation and GDPR compliance.

## Implementation Pattern

All commands follow this pattern:

### BEFORE (Current)

```javascript
// Old code - uses shared database
const quote = await db.addQuote(text, author);
const quotes = await db.getAllQuotes();
const quote = await db.getQuoteById(id);
```

### AFTER (Phase 3)

```javascript
// New code - guild-aware
const guildId = interaction.guildId;
const quote = await db.addQuote(guildId, text, author);
const quotes = await db.getAllQuotes(guildId);
const quote = await db.getQuoteById(guildId, id);
```

## The Change (It's Simple!)

1. **Extract guild ID** from interaction
2. **Pass as first parameter** to all database methods

That's it! The compatibility layer handles everything else.

## Files to Update

### Quote Management Commands (~5 files)

1. `src/commands/quote-management/add-quote.js`
   - Pass `interaction.guildId` to `db.addQuote()`
2. `src/commands/quote-management/delete-quote.js`
   - Pass `interaction.guildId` to `db.deleteQuote()`
3. `src/commands/quote-management/update-quote.js`
   - Pass `interaction.guildId` to `db.updateQuote()`
4. `src/commands/quote-management/list-quotes.js`
   - Pass `interaction.guildId` to `db.getAllQuotes()`
5. `src/commands/quote-management/quote.js`
   - Pass `interaction.guildId` to `db.getQuoteById()`

### Quote Discovery Commands (~4 files)

6. `src/commands/quote-discovery/random-quote.js`
   - Pass `interaction.guildId` to `db.getAllQuotes()`
7. `src/commands/quote-discovery/search-quotes.js`
   - Pass `interaction.guildId` to `db.searchQuotes()`
8. `src/commands/quote-discovery/quote-stats.js`
   - Pass `interaction.guildId` to `db.getGuildStatistics()` (NEW)
9. `src/commands/quote-discovery/similar-quotes.js`
   - Pass `interaction.guildId` to `db.searchQuotes()`

### Quote Social Commands (~3 files)

10. `src/commands/quote-social/rate-quote.js`
    - Pass `interaction.guildId` to `db.rateQuote()`
    - Pass `interaction.guildId` to `db.getQuoteRating()` (if showing current)
11. `src/commands/quote-social/tag-quote.js`
    - Pass `interaction.guildId` to `db.tagQuote()`
12. `src/commands/quote-social/get-quotes-by-tag.js`
    - Pass `interaction.guildId` to `db.getQuotesByTag()`

### Quote Export Commands (~2 files)

13. `src/commands/quote-export/export-quotes.js`
    - Pass `interaction.guildId` to `db.exportGuildData()` (NEW)
14. `src/commands/quote-export/export-to-csv.js`
    - Pass `interaction.guildId` when appropriate

### Misc Commands (~3 files)

15. `src/commands/misc/poem.js`
    - May not need guild awareness (API-based)
16. `src/commands/misc/help.js`
    - No database calls
17. `src/commands/misc/hi.js`
    - No database calls

### Admin Commands (~2 files)

18. `src/commands/admin/...` (if any use database)
    - Apply same pattern

---

## Step-by-Step Update Process

### For Each Command File:

#### 1. Extract Guild ID

Add at the start of `executeInteraction()`:

```javascript
async executeInteraction(interaction) {
  // Get guild ID - REQUIRED for phase 3
  const guildId = interaction.guildId;

  if (!guildId) {
    await interaction.reply({
      content: '❌ This command only works in servers.',
      ephemeral: true
    });
    return;
  }

  // Rest of command logic...
}
```

#### 2. Update Database Calls

Change all `db.*()` calls to include `guildId` as first parameter:

```javascript
// BEFORE
const quote = await db.getQuoteById(quoteId);

// AFTER
const quote = await db.getQuoteById(guildId, quoteId);
```

#### 3. Update All Methods

These methods need updating (remember guildId is FIRST param):

```javascript
// Quote Operations
db.addQuote(guildId, text, author);
db.getAllQuotes(guildId);
db.getQuoteById(guildId, id);
db.searchQuotes(guildId, keyword);
db.updateQuote(guildId, id, text, author);
db.deleteQuote(guildId, id);
db.getQuoteCount(guildId);

// Ratings
db.rateQuote(guildId, quoteId, userId, rating);
db.getQuoteRating(guildId, quoteId, userId);

// Tags
db.tagQuote(guildId, quoteId, tagName);
db.getQuotesByTag(guildId, tagName);

// NEW - Guild-specific
db.getGuildStatistics(guildId);
db.exportGuildData(guildId);
db.deleteGuildData(guildId); // GDPR
```

---

## Example: Complete Command Update

### Before (add-quote.js)

```javascript
class AddQuote extends Command {
  async executeInteraction(interaction) {
    const text = interaction.options.getString('text');
    const author = interaction.options.getString('author') || 'Anonymous';

    try {
      const quoteId = await db.addQuote(text, author);
      await sendSuccess(interaction, `Quote #${quoteId} added!`);
    } catch (error) {
      await sendError(interaction, error.message);
    }
  }
}
```

### After (add-quote.js) - Phase 3

```javascript
class AddQuote extends Command {
  async executeInteraction(interaction) {
    // Get guild ID
    const guildId = interaction.guildId;
    if (!guildId) {
      await interaction.reply({
        content: '❌ This command only works in servers.',
        ephemeral: true,
      });
      return;
    }

    const text = interaction.options.getString('text');
    const author = interaction.options.getString('author') || 'Anonymous';

    try {
      // UPDATED: Add guildId as first parameter
      const quoteId = await db.addQuote(guildId, text, author);
      await sendSuccess(interaction, `Quote #${quoteId} added to this server!`);
    } catch (error) {
      await sendError(interaction, error.message);
    }
  }
}
```

---

## Testing Each Command

After updating each command:

```bash
# 1. Check syntax
node -c src/commands/path/command-name.js

# 2. Test in Discord (after deployment)
# - Run the command in Guild A
# - Run the command in Guild B
# - Verify data is isolated (Guild A can't see Guild B's quotes)
```

---

## Verification Checklist

For each updated command:

- [ ] Extracted `guildId` from interaction
- [ ] Check for missing guild ID (optional)
- [ ] Updated ALL `db.*()` calls
- [ ] Guild ID is FIRST parameter
- [ ] Syntax is valid (`node -c`)
- [ ] Error handling preserved
- [ ] No breaking changes to command

---

## Expected Behavior After Phase 3

### User Perspective

```
Guild A adds quote "Hello"
Guild B adds quote "World"

Guild A user runs /list-quotes
→ Sees only Guild A's quotes

Guild B user runs /list-quotes
→ Sees only Guild B's quotes

No cross-contamination! ✅
```

### Database Perspective

```
Before: data/db/quotes.db (all guilds share)
After:
  data/db/guilds/GUILD_A_ID/quotes.db
  data/db/guilds/GUILD_B_ID/quotes.db
  data/db/guilds/GUILD_C_ID/quotes.db
```

---

## Timeline

Estimate: **2-3 days**

**Day 1:** Update quote management + discovery commands (9 files)
**Day 2:** Update quote social + export + admin commands (5 files)
**Day 3:** Testing and validation

---

## Backward Compatibility

✅ **Important:** Old code without `guildId` still works!

If you forget to add `guildId` to a command, it will:

1. Default to shared database (old behavior)
2. Lose guild isolation for that command
3. Continue working without errors

This means you can:

- Update commands gradually
- Deploy without all changes complete
- Test incrementally

---

## Troubleshooting

### "Command still uses shared database"

**Solution:** Check that you added `guildId` as FIRST parameter to all `db.*()` calls

### "Error: Guild ID is required"

**Solution:** Command is called in DM. Add guild check:

```javascript
if (!interaction.guildId) {
  await interaction.reply('This command only works in servers.');
  return;
}
```

### "Quote appears in multiple guilds"

**Solution:** Forgot to add `guildId` to one of the `db.*()` calls

---

## Next Steps

1. **Start with:** `src/commands/quote-management/add-quote.js`
2. **After each update:** Run eslint
3. **Test in Discord:** Verify guild isolation
4. **After all commands:** Proceed to Phase 4 (migration)

---

## Documentation References

- Phase 1-2 Complete Report: `docs/reference/PHASE1-2-COMPLETION-REPORT.md`
- Option 2 Multi-DB Guide: `docs/reference/OPTION2-MULTI-DATABASE-IMPLEMENTATION.md`
- Quick Start: `docs/reference/OPTION2-QUICK-START.md`

---

## Support

If stuck on a command update:

1. Check example above
2. Look at updated `add-quote.js` for pattern
3. Reference method signatures in `GuildAwareDatabaseService.js`
4. All methods require `guildId` as first parameter

---

Estimated Completion: January 5-7, 2026
