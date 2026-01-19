# Database Architecture Analysis: Guild Isolation Issues

**Date:** January 3, 2026  
**Status:** Analysis Complete  
**Issue:** Shared database across guilds is not ideal for multi-tenancy

---

## Current Architecture

### Database Structure

The bot currently uses a **single SQLite database** (`data/db/quotes.db`) shared across ALL guilds:

```
┌─────────────────────────────────────────┐
│        Single Shared Database           │
│      (All Guilds & All Data)            │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ quotes table (no guild_id)       │  │
│  │ - id (autoincrement)             │  │
│  │ - text                           │  │
│  │ - author                         │  │
│  │ - addedAt / createdAt            │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ reminders table (no guild_id)    │  │
│  │ - id                             │  │
│  │ - userId                         │  │
│  │ - subject, content, category     │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ Other tables (ratings, tags,     │  │
│  │ user_communications, etc)        │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘

    │
    ├── Guild A  (accesses all data)
    ├── Guild B  (accesses all data)
    ├── Guild C  (accesses all data)
    └── Guild N  (accesses all data)
```

### Data Tables Without Guild Isolation

1. **quotes** - All quotes accessible from any guild
2. **reminders** - User reminders accessible cross-guild
3. **ratings** - Quote ratings shared across guilds
4. **tags** - Quote tags shared across guilds
5. **user_communications** - Global opt-in tracking

### Current Issues

| Issue                    | Impact                                   | Severity  |
| ------------------------ | ---------------------------------------- | --------- |
| **Data Leakage**         | Guild A can see Guild B's quotes         | 🔴 High   |
| **No Isolation**         | All reminders visible to all guilds      | 🔴 High   |
| **Difficult Compliance** | GDPR/privacy per-guild not possible      | 🟡 Medium |
| **Scalability**          | Growing dataset affects all guilds       | 🟡 Medium |
| **Security**             | Potential cross-guild exploits           | 🟡 Medium |
| **Management**           | Hard to backup/restore single guild data | 🟡 Medium |

---

## Solution Options

### Option 1: Add Guild ID Column (RECOMMENDED)

**Approach:** Add `guild_id` to all data tables, modify queries to filter by guild

**Pros:**

- ✅ Single database (simpler ops)
- ✅ Moderate code changes
- ✅ Good performance with proper indexes
- ✅ Easy to implement incrementally
- ✅ Backward compatible with migration

**Cons:**

- ⚠️ Need to add column to existing tables
- ⚠️ Need to migrate all queries to filter by guild
- ⚠️ Still shares DB (harder disaster recovery)

**Implementation Complexity:** Medium (3-4 days)

**Recommended:** YES - Best balance of security, simplicity, and performance

---

### Option 2: Multiple Database Files Per Guild

**Approach:** Create separate database file for each guild: `quotes_GUILD_ID.db`

**Pros:**

- ✅ Complete data isolation
- ✅ Per-guild backup/restore easy
- ✅ Better compliance (GDPR deletion simple)
- ✅ Can disable guild independently
- ✅ Easy to off-board guilds

**Cons:**

- ⚠️ More complex connection management
- ⚠️ Database overhead (many small DBs vs one large)
- ⚠️ Harder to query across guilds (if needed)
- ⚠️ More file handles needed
- ⚠️ Larger code changes required

**Implementation Complexity:** High (1 week+)

**Recommended:** NO - Overkill for current scale

---

### Option 3: Hybrid: Per-Guild Schemas

**Approach:** Use PostgreSQL with one schema per guild in same DB cluster

**Pros:**

- ✅ Complete isolation without multiple DBs
- ✅ Better scalability than SQLite
- ✅ Query across schemas if needed
- ✅ Professional approach

**Cons:**

- ⚠️ Requires PostgreSQL (different tech stack)
- ⚠️ Operational complexity increases
- ⚠️ Higher deployment costs
- ⚠️ SQLite to PostgreSQL migration required

**Implementation Complexity:** Very High (2+ weeks)

**Recommended:** NO - Overkill for current stage

---

## ⭐ RECOMMENDED: Option 2 - Multiple Database Files Per Guild

### Why This Choice (GDPR Priority)

You've prioritized **GDPR Compliance and Complete Data Isolation**, making Option 2 the right choice:

✅ **GDPR Compliance is Trivial**

- Delete single guild = delete `guilds/GUILD_ID/` folder
- Complete audit trail per guild
- Easy data portability (export .db file)

✅ **Zero Data Contamination**

- Guild A cannot access Guild B data
- Complete filesystem-level isolation

✅ **Easy Guild Offboarding**

- Remove directory = all guild data gone
- No orphaned data cleanup needed

**See:** [OPTION2-MULTI-DATABASE-IMPLEMENTATION.md](../OPTION2-MULTI-DATABASE-IMPLEMENTATION.md) for complete implementation guide.

### New Directory Structure

```
data/db/
├── _schema/
│   └── schema.sql              (template schema for all guilds)
│
├── guilds/
│   ├── 123456789/              (Guild A - Discord ID)
│   │   ├── quotes.db
│   │   └── quotes.db-wal
│   │
│   ├── 987654321/              (Guild B)
│   │   ├── quotes.db
│   │   └── quotes.db-wal
│   │
│   └── 111222333/              (Guild C)
│       ├── quotes.db
│       └── quotes.db-wal
│
└── shared/                      (optional: cross-guild data)
    └── shared.db               (user prefs, opt-ins, etc)
```

### Implementation Plan

#### Phase 1: Prepare Infrastructure

1. **Create migration file** for adding guild_id column
2. **Update schema** to include guild_id on all tables
3. **Add database indexes** on (guild_id, other_columns)
4. **Create helper functions** for guild-scoped queries

#### Phase 2: Update Data Layer

1. **Modify DatabaseService.js**
   - Add `guildId` parameter to all query functions
   - Filter all SELECT queries with `WHERE guild_id = ?`
   - Add guild_id to all INSERT operations

2. **Update all service methods**
   - Pass guildId through service layer
   - Update ReminderService, QuoteService, etc.

3. **Modify command handlers**
   - Extract guildId from interaction
   - Pass to database methods

#### Phase 3: Handle Edge Cases

1. **User communications** (global opt-in)
   - Keep as global OR combine with guild_id

2. **Ratings and tags**
   - Make guild-scoped (per-guild quote ratings)

3. **User data**
   - User preferences might need cross-guild access
   - Design user-specific vs. guild-specific data

#### Phase 4: Testing & Migration

1. **Create test fixtures**
2. **Test queries with multiple guilds**
3. **Run migration on production database**
4. **Verify data integrity**

---

## Code Changes Required

### Migration SQL

```sql
-- Add guild_id to quotes table
ALTER TABLE quotes ADD COLUMN guild_id TEXT DEFAULT NULL;

-- Add guild_id to reminders table
ALTER TABLE reminders ADD COLUMN guild_id TEXT;

-- Add guild_id to ratings table
ALTER TABLE ratings ADD COLUMN guild_id TEXT;

-- Create indexes for performance
CREATE INDEX idx_quotes_guild ON quotes(guild_id);
CREATE INDEX idx_reminders_guild ON reminders(guild_id);
CREATE INDEX idx_ratings_guild ON ratings(guild_id);

-- Composite indexes for common queries
CREATE INDEX idx_quotes_guild_id ON quotes(guild_id, id);
CREATE INDEX idx_reminders_guild_userId ON reminders(guild_id, user_id);
```

### DatabaseService Changes Example

**Before:**

```javascript
async function addQuote(text, author) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO quotes (text, author, addedAt) VALUES (?, ?, ?)',
      [text, author, new Date().toISOString()],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

async function getAllQuotes() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM quotes', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}
```

**After:**

```javascript
async function addQuote(text, author, guildId) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO quotes (text, author, addedAt, guild_id) VALUES (?, ?, ?, ?)',
      [text, author, new Date().toISOString(), guildId],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

async function getAllQuotes(guildId) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM quotes WHERE guild_id = ? ORDER BY id DESC', [guildId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}
```

### Command Handler Changes

**Before:**

```javascript
const quote = await db.getQuoteByNumber(number);
```

**After:**

```javascript
const quote = await db.getQuoteByNumber(number, interaction.guildId);
```

---

## Security & Privacy Benefits

### Before (Current)

- ❌ Any guild can access any other guild's data
- ❌ Hard to implement per-guild GDPR deletion
- ❌ No audit trail per guild
- ❌ Potential data contamination

### After (With Guild ID)

- ✅ Strict data isolation per guild
- ✅ Easy GDPR compliance per guild
- ✅ Can track modifications per guild
- ✅ Can offboard guilds cleanly
- ✅ Audit trail per guild possible

---

## Implementation Timeline

| Phase       | Duration     | Tasks                                      |
| ----------- | ------------ | ------------------------------------------ |
| **Phase 1** | 1 day        | Migrations, schema updates, helpers        |
| **Phase 2** | 2-3 days     | Update DatabaseService, services, commands |
| **Phase 3** | 1 day        | Edge cases, special handling               |
| **Phase 4** | 1 day        | Testing, validation, production migration  |
| **Total**   | **5-6 days** | Full implementation                        |

---

## Implementation Checklist

- [ ] Create migration files
- [ ] Add guild_id columns to all tables
- [ ] Create database indexes
- [ ] Update DatabaseService with guild_id parameter
- [ ] Update QuoteService methods
- [ ] Update ReminderService methods
- [ ] Update ReminderNotificationService
- [ ] Update CommunicationService
- [ ] Update all command handlers to pass guildId
- [ ] Update all queries to filter by guild
- [ ] Create test cases for guild isolation
- [ ] Test with multiple guilds
- [ ] Run production migration
- [ ] Verify data integrity
- [ ] Update documentation

---

## Testing Strategy

### Unit Tests

```javascript
describe('Guild Isolation', () => {
  it('should only return quotes for specific guild', async () => {
    const guild1Quotes = await db.getAllQuotes('GUILD_1');
    const guild2Quotes = await db.getAllQuotes('GUILD_2');
    expect(guild1Quotes).not.toEqual(guild2Quotes);
  });

  it('should prevent cross-guild quote access', async () => {
    await db.addQuote('Secret quote', 'User', 'GUILD_1');
    const guild2Quotes = await db.getAllQuotes('GUILD_2');
    expect(guild2Quotes).not.toContain(secretQuote);
  });
});
```

### Integration Tests

- Test quote operations across multiple guilds
- Test reminder isolation per guild
- Test rating isolation per guild
- Test command behavior with guild_id

---

## Rollback Plan

If issues occur:

1. **Keep backup** of original database before migration
2. **Database version tracking** allows rollback
3. **Code can handle NULL guild_id** temporarily for legacy compatibility
4. **Feature flags** can disable guild isolation if needed

---

## Questions to Consider

1. Should user preferences be cross-guild or per-guild?
2. Should ratings be guild-specific or global?
3. Should tags be guild-specific or global?
4. How to handle existing data during migration?
5. Need audit trail for compliance?

---

## Next Steps

1. **Review this analysis** with team
2. **Decide if guild isolation needed** for your use case
3. **Estimate effort** for your specific needs
4. **Create detailed migration plan** for data migration
5. **Begin Phase 1 implementation**

---

## References

- Current database: `src/database.js`, `src/services/DatabaseService.js`
- Quote operations: `src/services/QuoteService.js`
- Reminder operations: `src/services/ReminderService.js`
- Migrations: `src/services/MigrationManager.js`
