# Option 2 Quick Start Guide

**Start Date:** January 3, 2026  
**Architecture:** Per-Guild SQLite Databases  
**Priority:** GDPR Compliance  

---

## Quick Overview

Instead of one shared database, you'll have:
- **One database per guild** (e.g., `data/db/guilds/123456789/quotes.db`)
- **Complete isolation** - Guild A cannot see Guild B's data
- **GDPR trivial** - Delete folder = all data gone

---

## Step 1: Create Core Services (30 mins - 1 hour)

### Create `src/services/GuildDatabaseManager.js`

This is the heart of the system. It:
- Opens/closes database connections per guild
- Caches connections to avoid file handle issues
- Initializes schemas for new guilds
- Handles GDPR deletion

**File location:** `src/services/GuildDatabaseManager.js`

See full code in: `docs/reference/OPTION2-MULTI-DATABASE-IMPLEMENTATION.md` (Phase 1 section)

### Create Schema Template

File: `data/db/_schema/schema.sql`

Contains standard schema (quotes, reminders, ratings, tags, etc.)

---

## Step 2: Update Database Service (1-2 hours)

### Replace `src/services/DatabaseService.js`

Key changes:
1. Add `guildId` parameter to ALL methods
2. Use `manager.getGuildDatabase(guildId)` instead of global db
3. Add `deleteGuildAllData(guildId)` for GDPR

**Example:**

```javascript
// OLD - shared database
async function addQuote(text, author) {
  db.run('INSERT INTO quotes...', [text, author]);
}

// NEW - guild-specific database
async function addQuote(guildId, text, author) {
  const db = await this.manager.getGuildDatabase(guildId);
  db.run('INSERT INTO quotes...', [text, author]);
}
```

---

## Step 3: Update All Commands (2-3 hours)

### Pass `guildId` to Database Methods

Every command needs to pass guild ID:

```javascript
// In quote command
const id = await db.addQuote(
  interaction.guildId,  // <-- ADD THIS
  text,
  author
);
```

Search for all `db.` calls and add `guildId` as first parameter.

**Files to update:**
- `src/commands/quote-management/*.js`
- `src/commands/quote-discovery/*.js`
- `src/commands/quote-social/*.js`
- `src/commands/quote-export/*.js`
- `src/commands/misc/*.js` (reminder commands)

---

## Step 4: Create Migration Script (1 hour)

If you have existing data in the old database:

```javascript
// scripts/migrate-to-per-guild.js
// See full code in OPTION2-MULTI-DATABASE-IMPLEMENTATION.md
```

This copies data from old `data/db/quotes.db` to per-guild databases.

---

## Step 5: Test (4-6 hours)

Create test for guild isolation:

```javascript
describe('Guild Isolation', () => {
  it('guilds should not see each other's data', async () => {
    // Add quote to Guild A
    await db.addQuote('GUILD_A', 'Secret Quote', 'Author');

    // Guild B should not see it
    const quotesB = await db.getAllQuotes('GUILD_B');
    expect(quotesB).toHaveLength(0);
  });

  it('GDPR: deleting guild should delete all data', async () => {
    await db.addQuote('GUILD_C', 'Data', 'Author');
    await db.deleteGuildAllData('GUILD_C');

    const quotes = await db.getAllQuotes('GUILD_C');
    expect(quotes).toHaveLength(0);
  });
});
```

---

## Quick Checklist

- [ ] Create `GuildDatabaseManager.js`
- [ ] Create `data/db/_schema/schema.sql`
- [ ] Update `DatabaseService.js`
- [ ] Update `QuoteService.js` (add guildId)
- [ ] Update `ReminderService.js` (add guildId)
- [ ] Update all command files (pass guildId)
- [ ] Create migration script
- [ ] Run tests
- [ ] Run migration
- [ ] Deploy

---

## What Happens Next

**After implementation, you'll have:**

✅ Each guild has its own database  
✅ Guild A cannot access Guild B's data  
✅ GDPR compliance is one-line: `manager.deleteGuildDatabase(guildId)`  
✅ Easy backup/restore per guild  
✅ Easy guild offboarding  

---

## Architecture After Implementation

```
Bot receives command from Guild A
    ↓
Command handler extracts guildId
    ↓
Passes to db.addQuote(guildId, ...)
    ↓
DatabaseService calls manager.getGuildDatabase(guildId)
    ↓
Opens Guild A's database: data/db/guilds/123456789/quotes.db
    ↓
Executes query on Guild A's database ONLY
    ↓
Guild B's database never touched
```

---

## Key Files to Change

1. **New:** `src/services/GuildDatabaseManager.js` (200+ lines)
2. **New:** `data/db/_schema/schema.sql` (schema template)
3. **Update:** `src/services/DatabaseService.js` (rewrite)
4. **Update:** `src/services/QuoteService.js` (add guildId)
5. **Update:** `src/services/ReminderService.js` (add guildId)
6. **Update:** All command files (~20 files, add guildId)
7. **New:** `scripts/migrate-to-per-guild.js` (migration)

---

## Common Pitfalls to Avoid

❌ **Don't forget to pass guildId** - Every db call needs it  
❌ **Don't use global db connection** - Use manager for each guild  
❌ **Don't forget schema initialization** - New guilds need tables  
❌ **Don't handle connection cleanup** - Manager handles it  
❌ **Don't forget GDPR deletion** - Test deleteGuildAllData()  

---

## Testing Before Production

```bash
# 1. Test with single guild
npm test

# 2. Test with multiple guilds
npm run test:integration

# 3. Run migration
node scripts/migrate-to-per-guild.js

# 4. Verify data integrity
node scripts/validate-migration.js

# 5. Test GDPR compliance
npm run test:gdpr

# 6. Performance test
npm run test:performance
```

---

## Full Documentation

See: `docs/reference/OPTION2-MULTI-DATABASE-IMPLEMENTATION.md`

Contains:
- Complete service code
- Schema template
- Migration script
- Error handling
- Testing examples
- Production setup

---

## Getting Help

If you get stuck:

1. Check the full implementation guide
2. Look at example code in the guide
3. Run tests to verify each step
4. Check Git history for changes

---

**Ready to start?**

Next: Create `src/services/GuildDatabaseManager.js`
