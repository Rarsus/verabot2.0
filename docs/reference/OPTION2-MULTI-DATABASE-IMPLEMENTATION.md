# Option 2: Multi-Database Guild Isolation Implementation

**Date:** January 3, 2026  
**Status:** Implementation Strategy  
**Choice:** Multi-Database Architecture  
**Reason:** GDPR Compliance & Complete Data Isolation

---

## Executive Summary

You've chosen **Option 2: Multiple Database Files Per Guild** for strong GDPR compliance and complete data isolation. This document provides a step-by-step implementation guide.

**Key Benefits:**
- ✅ Complete per-guild data isolation
- ✅ Trivial GDPR compliance (delete single file)
- ✅ Easy guild offboarding
- ✅ Per-guild backup/restore
- ✅ No cross-guild data contamination possible

**Trade-offs:**
- ⚠️ More complex connection management
- ⚠️ Multiple database file handles
- ⚠️ Harder cross-guild queries (rare anyway)

**Timeline:** 1-2 weeks  
**Complexity:** High

---

## Architecture Overview

### New Structure

```
data/db/
├── _schema/                          (shared schema template)
│   └── schema.sql                    (standard schema for all DBs)
│
├── guilds/
│   ├── 123456789/                    (Guild A)
│   │   ├── quotes.db
│   │   └── quotes.db-wal
│   │
│   ├── 987654321/                    (Guild B)
│   │   ├── quotes.db
│   │   └── quotes.db-wal
│   │
│   └── 111222333/                    (Guild C)
│       ├── quotes.db
│       └── quotes.db-wal
│
└── shared/                           (optional: user preferences, global data)
    └── shared.db                     (cross-guild data only)
```

### Database Files Per Guild

Each guild gets its own SQLite database containing:
- quotes (guild-specific)
- reminders (guild-specific)
- ratings (guild-specific)
- tags (guild-specific)
- schema_versions (per DB)

---

## Phase 1: Create Guild Database Manager Service

### New Service: `GuildDatabaseManager.js`

This service handles:
- Opening/closing per-guild database connections
- Caching connections to avoid excessive file handles
- Schema initialization for new guilds
- Graceful connection cleanup

```javascript
/**
 * Guild Database Manager
 * Manages per-guild SQLite database connections
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { logError, ERROR_LEVELS } = require('../middleware/errorHandler');

class GuildDatabaseManager {
  constructor(options = {}) {
    // Configuration
    this.guildsDir = options.guildsDir || path.join(__dirname, '..', '..', 'data', 'db', 'guilds');
    this.maxConnections = options.maxConnections || 50;
    this.connectionTimeout = options.connectionTimeout || 5 * 60 * 1000; // 5 min
    
    // Connection pool
    this.connections = new Map(); // Map<guildId, Database>
    this.lastAccess = new Map(); // Track last access for cleanup
    
    // Schema
    this.schemaPath = options.schemaPath || path.join(__dirname, '..', '..', 'data', 'db', '_schema', 'schema.sql');
    
    // Ensure directories exist
    this.ensureDirectories();
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    if (!fs.existsSync(this.guildsDir)) {
      fs.mkdirSync(this.guildsDir, { recursive: true });
    }
  }

  /**
   * Get database connection for a guild
   * Creates new connection if not cached
   * @param {string} guildId - Discord guild ID
   * @returns {Promise<sqlite3.Database>} Database connection
   */
  async getGuildDatabase(guildId) {
    if (!guildId) {
      throw new Error('Guild ID required');
    }

    // Check if connection is cached
    if (this.connections.has(guildId)) {
      this.lastAccess.set(guildId, Date.now());
      return this.connections.get(guildId);
    }

    // Create new connection
    try {
      const db = await this.createGuildDatabase(guildId);
      this.connections.set(guildId, db);
      this.lastAccess.set(guildId, Date.now());
      
      return db;
    } catch (err) {
      logError('GuildDatabaseManager.getGuildDatabase', err, ERROR_LEVELS.CRITICAL);
      throw err;
    }
  }

  /**
   * Create new database for guild
   * @param {string} guildId - Discord guild ID
   * @returns {Promise<sqlite3.Database>} New database connection
   */
  async createGuildDatabase(guildId) {
    const guildDbDir = path.join(this.guildsDir, guildId);
    
    // Ensure guild directory exists
    if (!fs.existsSync(guildDbDir)) {
      fs.mkdirSync(guildDbDir, { recursive: true });
    }

    const dbPath = path.join(guildDbDir, 'quotes.db');

    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbPath, async (err) => {
        if (err) {
          logError('GuildDatabaseManager.createGuildDatabase', err, ERROR_LEVELS.CRITICAL);
          reject(err);
          return;
        }

        try {
          // Enable foreign keys
          await this.runAsync(db, 'PRAGMA foreign_keys = ON');
          
          // Initialize schema if new database
          const isNew = !fs.existsSync(dbPath) || fs.statSync(dbPath).size === 0;
          if (isNew) {
            await this.initializeSchema(db, guildId);
          }

          resolve(db);
        } catch (err) {
          logError('GuildDatabaseManager.createGuildDatabase.init', err, ERROR_LEVELS.CRITICAL);
          reject(err);
        }
      });
    });
  }

  /**
   * Initialize schema for new guild database
   * @param {sqlite3.Database} db - Database connection
   * @param {string} guildId - Guild ID
   * @returns {Promise<void>}
   */
  async initializeSchema(db, guildId) {
    // Read schema file
    if (!fs.existsSync(this.schemaPath)) {
      throw new Error(`Schema file not found: ${this.schemaPath}`);
    }

    const schema = fs.readFileSync(this.schemaPath, 'utf8');

    return new Promise((resolve, reject) => {
      db.exec(schema, (err) => {
        if (err) {
          logError('GuildDatabaseManager.initializeSchema', err, ERROR_LEVELS.CRITICAL);
          reject(err);
        } else {
          console.log(`✅ Initialized database schema for guild ${guildId}`);
          resolve();
        }
      });
    });
  }

  /**
   * Close database connection
   * @param {string} guildId - Guild ID
   * @returns {Promise<void>}
   */
  async closeGuildDatabase(guildId) {
    if (!this.connections.has(guildId)) {
      return;
    }

    return new Promise((resolve, reject) => {
      const db = this.connections.get(guildId);
      
      db.close((err) => {
        if (err) {
          logError('GuildDatabaseManager.closeGuildDatabase', err, ERROR_LEVELS.MEDIUM);
          reject(err);
        } else {
          this.connections.delete(guildId);
          this.lastAccess.delete(guildId);
          console.log(`✅ Closed database for guild ${guildId}`);
          resolve();
        }
      });
    });
  }

  /**
   * Delete guild database entirely (GDPR right to deletion)
   * @param {string} guildId - Guild ID
   * @returns {Promise<void>}
   */
  async deleteGuildDatabase(guildId) {
    // Close connection first
    await this.closeGuildDatabase(guildId);

    // Delete directory
    const guildDbDir = path.join(this.guildsDir, guildId);
    
    if (fs.existsSync(guildDbDir)) {
      fs.rmSync(guildDbDir, { recursive: true, force: true });
      console.log(`✅ Deleted database for guild ${guildId} (GDPR compliance)`);
    }
  }

  /**
   * Backup guild database
   * @param {string} guildId - Guild ID
   * @param {string} backupDir - Directory to backup to
   * @returns {Promise<string>} Path to backup file
   */
  async backupGuildDatabase(guildId, backupDir = './backups') {
    const guildDbDir = path.join(this.guildsDir, guildId);
    const dbPath = path.join(guildDbDir, 'quotes.db');

    if (!fs.existsSync(dbPath)) {
      throw new Error(`Database not found for guild ${guildId}`);
    }

    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `${guildId}_${timestamp}.db`);

    // Copy file
    fs.copyFileSync(dbPath, backupPath);
    console.log(`✅ Backed up database for guild ${guildId} to ${backupPath}`);

    return backupPath;
  }

  /**
   * Run SQL with promise wrapper
   * @private
   */
  runAsync(db, sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  /**
   * Get all guild IDs
   * @returns {string[]} Array of guild IDs
   */
  getGuildIds() {
    if (!fs.existsSync(this.guildsDir)) {
      return [];
    }

    return fs.readdirSync(this.guildsDir)
      .filter(file => fs.statSync(path.join(this.guildsDir, file)).isDirectory());
  }

  /**
   * Cleanup old connections
   * Closes connections not accessed in X time
   */
  async cleanupOldConnections() {
    const now = Date.now();
    const connectionsToClose = [];

    for (const [guildId, lastAccess] of this.lastAccess.entries()) {
      if (now - lastAccess > this.connectionTimeout) {
        connectionsToClose.push(guildId);
      }
    }

    for (const guildId of connectionsToClose) {
      await this.closeGuildDatabase(guildId);
      console.log(`🧹 Cleaned up old connection for guild ${guildId}`);
    }
  }

  /**
   * Shutdown all connections
   * Call on bot shutdown
   */
  async shutdown() {
    console.log('🔌 Shutting down all guild database connections...');
    
    const guildIds = Array.from(this.connections.keys());
    
    for (const guildId of guildIds) {
      await this.closeGuildDatabase(guildId);
    }

    console.log('✅ All guild databases closed');
  }
}

module.exports = GuildDatabaseManager;
```

---

## Phase 2: Create Guild Database Service Wrapper

### Update `DatabaseService.js` to use Guild Manager

```javascript
/**
 * Database Service - Guild-Aware Version
 * Routes database operations to correct guild database
 */

const GuildDatabaseManager = require('./GuildDatabaseManager');

class GuildAwareDatabaseService {
  constructor() {
    this.manager = new GuildDatabaseManager();
    this.manager.ensureDirectories();
  }

  /**
   * Add a quote to a guild's database
   * @param {string} guildId - Guild ID
   * @param {string} text - Quote text
   * @param {string} author - Quote author
   * @returns {Promise<number>} Quote ID
   */
  async addQuote(guildId, text, author = 'Anonymous') {
    const db = await this.manager.getGuildDatabase(guildId);

    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO quotes (text, author, addedAt) VALUES (?, ?, ?)',
        [text, author, new Date().toISOString()],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  /**
   * Get all quotes for a guild
   * @param {string} guildId - Guild ID
   * @returns {Promise<Array>} Array of quotes
   */
  async getAllQuotes(guildId) {
    const db = await this.manager.getGuildDatabase(guildId);

    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM quotes ORDER BY id DESC',
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
  }

  /**
   * Get quote by ID from guild
   * @param {string} guildId - Guild ID
   * @param {number} id - Quote ID
   * @returns {Promise<Object|null>} Quote object or null
   */
  async getQuoteById(guildId, id) {
    const db = await this.manager.getGuildDatabase(guildId);

    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM quotes WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  // ... implement all other database methods similarly ...

  /**
   * GDPR: Delete all data for a guild
   * @param {string} guildId - Guild ID
   * @returns {Promise<void>}
   */
  async deleteGuildAllData(guildId) {
    console.log(`🗑️  Deleting all data for guild ${guildId} (GDPR request)`);
    return await this.manager.deleteGuildDatabase(guildId);
  }

  /**
   * Get database manager for advanced operations
   * @returns {GuildDatabaseManager} Manager instance
   */
  getManager() {
    return this.manager;
  }
}

module.exports = new GuildAwareDatabaseService();
```

---

## Phase 3: Create Schema Template File

### New File: `data/db/_schema/schema.sql`

```sql
-- Guild-specific database schema
-- Applied to each guild's database

CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Anonymous',
  addedAt TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quotes_addedAt ON quotes(addedAt);

CREATE TABLE IF NOT EXISTS ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(quote_id) REFERENCES quotes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ratings_quote_id ON ratings(quote_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);

CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quote_tags (
  quote_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (quote_id, tag_id),
  FOREIGN KEY(quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
  FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reminders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT,
  category TEXT,
  when_datetime TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);

CREATE TABLE IF NOT EXISTS schema_versions (
  version INTEGER PRIMARY KEY,
  description TEXT,
  executedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Phase 4: Update Command Handlers

### Example: Update Quote Command

**Before:**
```javascript
class AddQuoteCommand extends Command {
  async executeInteraction(interaction) {
    const text = interaction.options.getString('text');
    const author = interaction.options.getString('author') || 'Anonymous';

    // No guild isolation
    const id = await db.addQuote(text, author);
    
    await sendSuccess(interaction, `Quote #${id} added!`);
  }
}
```

**After:**
```javascript
class AddQuoteCommand extends Command {
  async executeInteraction(interaction) {
    const text = interaction.options.getString('text');
    const author = interaction.options.getString('author') || 'Anonymous';

    // Pass guildId for guild-specific database
    const id = await db.addQuote(interaction.guildId, text, author);
    
    await sendSuccess(interaction, `Quote #${id} added!`);
  }
}
```

---

## Phase 5: Handle Shared Data

Some data might be cross-guild (optional):

```javascript
// User preferences (global)
class UserPreferencesService {
  async getUserPreference(userId) {
    // Use shared database
    const sharedDb = await this.manager.getSharedDatabase();
    // ... query shared db ...
  }
}

// User opt-in status (global)
class CommunicationService {
  async isUserOptedIn(userId) {
    // Use shared database
    const sharedDb = await this.manager.getSharedDatabase();
    // ... query shared db ...
  }
}
```

---

## Migration from Single DB to Per-Guild

### Migration Script

```javascript
/**
 * Migrate from single database to per-guild databases
 * Run this once during transition
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const GuildDatabaseManager = require('./GuildDatabaseManager');

async function migrateToPerGuildDatabases() {
  console.log('🚀 Starting migration from single to per-guild databases...\n');

  const oldDbPath = path.join(__dirname, '..', '..', 'data', 'db', 'quotes.db');
  
  if (!fs.existsSync(oldDbPath)) {
    console.log('⚠️  No existing database found. Starting fresh with per-guild DBs.');
    return;
  }

  // Open old database
  const oldDb = new sqlite3.Database(oldDbPath);
  const manager = new GuildDatabaseManager();

  // Get list of guilds from bot (you'd need to pass this in)
  // For now, we'll create a default guild database
  
  // TODO: Get actual guilds from Discord client
  const guildIds = process.env.GUILD_IDS ? process.env.GUILD_IDS.split(',') : ['default'];

  for (const guildId of guildIds) {
    console.log(`📦 Migrating data for guild ${guildId}...`);

    const newDb = await manager.getGuildDatabase(guildId);

    // Copy tables
    const tables = ['quotes', 'ratings', 'tags', 'quote_tags', 'reminders'];

    for (const table of tables) {
      await new Promise((resolve, reject) => {
        oldDb.all(`SELECT * FROM ${table}`, async (err, rows) => {
          if (err) {
            console.log(`⚠️  Table ${table} not found, skipping...`);
            resolve();
            return;
          }

          // Insert into new database
          if (rows.length > 0) {
            const columns = Object.keys(rows[0]).join(',');
            const placeholders = Object.keys(rows[0]).map(() => '?').join(',');

            for (const row of rows) {
              const values = Object.values(row);
              await new Promise((resolveInsert, rejectInsert) => {
                newDb.run(
                  `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`,
                  values,
                  (insertErr) => {
                    if (insertErr) rejectInsert(insertErr);
                    else resolveInsert();
                  }
                );
              });
            }

            console.log(`  ✅ Migrated ${rows.length} rows from ${table}`);
          }

          resolve();
        });
      });
    }

    console.log(`✅ Completed migration for guild ${guildId}\n`);
  }

  oldDb.close(() => {
    console.log('✅ Migration complete!');
    console.log('📍 Old database: ' + oldDbPath);
    console.log('📍 New databases: data/db/guilds/*/quotes.db');
  });
}

migrateToPerGuildDatabases().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
```

---

## Implementation Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Phase 1** | 2-3 days | GuildDatabaseManager service |
| **Phase 2** | 1-2 days | Update DatabaseService wrapper |
| **Phase 3** | 0.5 day | Create schema template |
| **Phase 4** | 2-3 days | Update all command handlers |
| **Phase 5** | 1 day | Handle shared data (if needed) |
| **Migration** | 1 day | Run migration script, test |
| **Testing** | 2-3 days | Full multi-guild testing |
| **Total** | **10-12 days** | Full implementation |

---

## GDPR Compliance Checklist

With per-guild databases, GDPR compliance becomes trivial:

- [x] **Right to Deletion:** Delete guild directory = all data gone
- [x] **Data Isolation:** Complete per-guild isolation  
- [x] **Data Portability:** Export single guild's .db file
- [x] **Audit Trail:** Each guild has complete history
- [x] **Backup/Restore:** Single guild independent
- [x] **Guild Offboarding:** Trivial cleanup

---

## Error Handling

```javascript
class DatabaseError extends Error {
  constructor(guildId, operation, originalError) {
    super(`Database error for guild ${guildId} during ${operation}: ${originalError.message}`);
    this.guildId = guildId;
    this.operation = operation;
    this.originalError = originalError;
  }
}

// In service:
try {
  const quote = await db.addQuote(guildId, text, author);
} catch (err) {
  if (err instanceof DatabaseError) {
    // Handle guild-specific errors
    await sendError(interaction, 
      `Failed to add quote for your server. Please try again.`, 
      true);
  }
}
```

---

## Connection Pool Management

To avoid opening too many connections:

```javascript
// In GuildDatabaseManager
const CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes

constructor(options = {}) {
  // ... other init ...
  
  // Periodic cleanup of old connections
  setInterval(() => {
    this.cleanupOldConnections();
  }, CLEANUP_INTERVAL);
}
```

---

## Monitoring & Health Checks

```javascript
class DatabaseHealthCheck {
  async checkGuildDatabase(guildId) {
    try {
      const db = await this.manager.getGuildDatabase(guildId);
      
      // Simple query to verify database is working
      await new Promise((resolve, reject) => {
        db.get('SELECT 1', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      return { status: 'healthy', guildId };
    } catch (err) {
      return { 
        status: 'error', 
        guildId, 
        error: err.message 
      };
    }
  }

  async checkAllGuilds() {
    const guildIds = this.manager.getGuildIds();
    const results = [];

    for (const guildId of guildIds) {
      results.push(await this.checkGuildDatabase(guildId));
    }

    return results;
  }
}
```

---

## Testing Strategy

### Unit Tests

```javascript
describe('Per-Guild Databases', () => {
  it('should isolate data between guilds', async () => {
    // Add quote to Guild A
    const quoteAId = await db.addQuote('GUILD_A', 'Quote A', 'Author A');

    // Add quote to Guild B
    const quoteBId = await db.addQuote('GUILD_B', 'Quote B', 'Author B');

    // Get quotes from Guild A
    const quotesA = await db.getAllQuotes('GUILD_A');
    expect(quotesA).toHaveLength(1);
    expect(quotesA[0].text).toBe('Quote A');

    // Get quotes from Guild B
    const quotesB = await db.getAllQuotes('GUILD_B');
    expect(quotesB).toHaveLength(1);
    expect(quotesB[0].text).toBe('Quote B');
  });

  it('should support GDPR deletion', async () => {
    await db.addQuote('GUILD_C', 'Secret Quote', 'Secret Author');

    // Verify quote exists
    let quotes = await db.getAllQuotes('GUILD_C');
    expect(quotes).toHaveLength(1);

    // Delete all guild data
    await db.deleteGuildAllData('GUILD_C');

    // Verify completely deleted
    quotes = await db.getAllQuotes('GUILD_C');
    expect(quotes).toHaveLength(0);
  });
});
```

### Integration Tests

```javascript
describe('Multi-Guild Operations', () => {
  it('should handle concurrent guild operations', async () => {
    const promises = [];

    for (let i = 0; i < 10; i++) {
      promises.push(
        db.addQuote(`GUILD_${i}`, `Quote ${i}`, `Author ${i}`)
      );
    }

    const ids = await Promise.all(promises);
    expect(ids).toHaveLength(10);
  });
});
```

---

## Production Considerations

### Backup Strategy

```bash
# Backup all guild databases
#!/bin/bash
BACKUP_DIR="./backups/$(date +%Y-%m-%d_%H-%M-%S)"
mkdir -p "$BACKUP_DIR"

cp -r data/db/guilds/* "$BACKUP_DIR/"
echo "✅ Backed up all guild databases to $BACKUP_DIR"
```

### Monitoring

```javascript
// Log database size per guild
async function getGuildDatabaseSize(guildId) {
  const guildDbDir = path.join(this.guildsDir, guildId);
  const dbPath = path.join(guildDbDir, 'quotes.db');

  if (fs.existsSync(dbPath)) {
    const stats = fs.statSync(dbPath);
    return {
      guildId,
      sizeBytes: stats.size,
      sizeMB: (stats.size / 1024 / 1024).toFixed(2)
    };
  }

  return { guildId, sizeBytes: 0, sizeMB: 0 };
}
```

---

## Bot Shutdown Handling

```javascript
// In index.js
const client = new Client({ intents: [...] });

client.on('ready', () => {
  console.log('Bot ready');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down bot...');
  await databaseService.getManager().shutdown();
  process.exit(0);
});
```

---

## Advantages Summary

✅ **GDPR Compliant:** Delete `guilds/GUILD_ID/` = all data gone  
✅ **Complete Isolation:** Zero data leakage possible  
✅ **Easy Offboarding:** Simple directory deletion  
✅ **Backup/Restore:** Per-guild independence  
✅ **Audit Trail:** Each guild has complete history  
✅ **Scale:** Can distribute guilds across systems later  

---

## Next Steps

1. Create `GuildDatabaseManager.js` service
2. Create `data/db/_schema/schema.sql` template
3. Update `DatabaseService.js` to use guild manager
4. Update all command handlers to pass `guildId`
5. Create migration script
6. Write comprehensive tests
7. Test with multiple guilds
8. Deploy to production

---

## Support Resources

- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [GDPR Compliance Guide](https://gdpr-info.eu/)
- [Discord.js Guild Documentation](https://discord.js.org/#/docs/main/stable/class/Guild)

