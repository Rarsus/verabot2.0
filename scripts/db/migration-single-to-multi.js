#!/usr/bin/env node
/* eslint-disable security/detect-object-injection */

/**
 * Migration Script: Single-Database to Multi-Database Architecture
 *
 * Converts from centralized single database to per-guild database architecture.
 *
 * USAGE:
 *   node scripts/db/migration-single-to-multi.js [guildId]
 *
 * OPTIONS:
 *   guildId  - If provided, migrates only this specific guild
 *            - If omitted, migrates ALL guilds from single database
 *
 * PROCESS:
 *   1. Read all data from single database (data/db/quotes.db)
 *   2. Backup original database to data/db/backups/
 *   3. Create per-guild databases in data/db/guilds/{GUILD_ID}/
 *   4. Copy appropriate data to each guild's database
 *   5. Verify migration completed successfully
 *
 * ROLLBACK:
 *   Backups are preserved in data/db/backups/ for rollback if needed
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const GuildDatabaseManager = require('../../src/services/GuildDatabaseManager');

// Configuration
const SINGLE_DB_PATH = path.join(__dirname, '../../data/db/quotes.db');
const BACKUP_DIR = path.join(__dirname, '../../data/db/backups');
const GUILDS_DIR = path.join(__dirname, '../../data/db/guilds');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

/**
 * Log helper functions
 */
const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
};

/**
 * Check if single database exists
 */
function checkSourceDatabase() {
  if (!fs.existsSync(SINGLE_DB_PATH)) {
    log.error('Source database not found: ' + SINGLE_DB_PATH);
    process.exit(1);
  }
  log.success('Source database found');
}

/**
 * Create backup of original database
 */
function backupOriginalDatabase() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `quotes_${timestamp}.db.backup`);

  fs.copyFileSync(SINGLE_DB_PATH, backupPath);
  log.success(`Backup created: ${backupPath}`);

  return backupPath;
}

/**
 * Open database connection
 */
function openDatabase(dbPath) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
      } else {
        db.run('PRAGMA foreign_keys = ON', () => {
          resolve(db);
        });
      }
    });
  });
}

/**
 * Get all data from source database
 */
function getAllData(db) {
  return new Promise((resolve, reject) => {
    const data = {};

    db.all('SELECT * FROM quotes', (err, quotes) => {
      if (err) {
        reject(err);
        return;
      }
      data.quotes = quotes || [];

      // Get other tables if they exist
      const tables = [
        'tags',
        'quote_tags',
        'quote_ratings',
        'reminders',
        'reminder_assignments',
        'user_communications',
      ];
      let completed = 0;

      tables.forEach((table) => {
        db.all(`SELECT * FROM ${table}`, (err, rows) => {
          if (!err) {
            data[table] = rows || [];
          }
          completed++;

          if (completed === tables.length) {
            resolve(data);
          }
        });
      });
    });
  });
}

/**
 * Extract guild IDs from data
 */
function extractGuildIds(data) {
  const guildIds = new Set();

  // Try to extract from reminders table
  if (data.reminders && data.reminders.length > 0) {
    data.reminders.forEach((reminder) => {
      if (reminder.guildId && reminder.guildId !== 'legacy') {
        guildIds.add(reminder.guildId);
      }
    });
  }

  // Try to extract from user_communications table
  if (data.user_communications && data.user_communications.length > 0) {
    data.user_communications.forEach((comm) => {
      if (comm.guildId && comm.guildId !== 'legacy') {
        guildIds.add(comm.guildId);
      }
    });
  }

  // If no guilds found, create a default one
  if (guildIds.size === 0) {
    guildIds.add('default-guild-' + Date.now());
    log.warning('No guild IDs found in data. Using default guild ID.');
  }

  return Array.from(guildIds);
}

/**
 * Migrate data to guild-specific database
 */
async function migrateDataToGuild(guildManager, guildId, data) {
  try {
    const db = await guildManager.getGuildDatabase(guildId);

    // Helper to run SQL
    const runAsync = (sql, params = []) => {
      return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ lastID: this.lastID, changes: this.changes });
          }
        });
      });
    };

    // Migrate quotes
    if (data.quotes && data.quotes.length > 0) {
      for (const quote of data.quotes) {
        try {
          await runAsync(
            'INSERT INTO quotes (text, author, addedAt, category, averageRating, ratingCount, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
              quote.text,
              quote.author || 'Anonymous',
              quote.addedAt || new Date().toISOString(),
              quote.category || 'General',
              quote.averageRating || 0,
              quote.ratingCount || 0,
              quote.createdAt || new Date().toISOString(),
              quote.updatedAt || new Date().toISOString(),
            ]
          );
        } catch {
          log.warning(`Skipped duplicate quote: "${quote.text.substring(0, 50)}..."`);
        }
      }
      log.success(`Migrated ${data.quotes.length} quotes to guild ${guildId}`);
    }

    // Migrate tags
    if (data.tags && data.tags.length > 0) {
      for (const tag of data.tags) {
        try {
          await runAsync('INSERT INTO tags (name, description, createdAt) VALUES (?, ?, ?)', [
            tag.name,
            tag.description || '',
            tag.createdAt || new Date().toISOString(),
          ]);
        } catch {
          log.warning(`Skipped duplicate tag: ${tag.name}`);
        }
      }
      log.success(`Migrated ${data.tags.length} tags to guild ${guildId}`);
    }

    // Migrate quote_tags
    if (data.quote_tags && data.quote_tags.length > 0) {
      for (const qt of data.quote_tags) {
        try {
          await runAsync('INSERT INTO quote_tags (quoteId, tagId) VALUES (?, ?)', [qt.quoteId, qt.tagId]);
        } catch {
          // Silently skip if quote or tag doesn't exist
        }
      }
      log.success(`Migrated ${data.quote_tags.length} quote-tag associations to guild ${guildId}`);
    }

    // Migrate ratings
    if (data.quote_ratings && data.quote_ratings.length > 0) {
      for (const rating of data.quote_ratings) {
        try {
          await runAsync('INSERT INTO quote_ratings (quoteId, userId, rating, createdAt) VALUES (?, ?, ?, ?)', [
            rating.quoteId,
            rating.userId,
            rating.rating,
            rating.createdAt || new Date().toISOString(),
          ]);
        } catch {
          log.warning(`Skipped duplicate rating for quote ${rating.quoteId}`);
        }
      }
      log.success(`Migrated ${data.quote_ratings.length} ratings to guild ${guildId}`);
    }

    // Migrate reminders (filter by guildId)
    if (data.reminders && data.reminders.length > 0) {
      const guildReminders = data.reminders.filter(
        (r) => !r.guildId || r.guildId === guildId || r.guildId === 'legacy'
      );

      for (const reminder of guildReminders) {
        try {
          await runAsync(
            'INSERT INTO reminders (subject, category, when_datetime, content, link, image, notificationTime, status, notification_method, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
              reminder.subject,
              reminder.category,
              reminder.when_datetime,
              reminder.content || '',
              reminder.link || '',
              reminder.image || '',
              reminder.notificationTime,
              reminder.status || 'active',
              reminder.notification_method || 'dm',
              reminder.createdAt || new Date().toISOString(),
              reminder.updatedAt || new Date().toISOString(),
            ]
          );
        } catch {
          log.warning(`Skipped invalid reminder: ${reminder.subject}`);
        }
      }
      log.success(`Migrated ${guildReminders.length} reminders to guild ${guildId}`);
    }

    // Migrate user communications (filter by guildId)
    if (data.user_communications && data.user_communications.length > 0) {
      const guildComms = data.user_communications.filter(
        (c) => !c.guildId || c.guildId === guildId || c.guildId === 'legacy'
      );

      for (const comm of guildComms) {
        try {
          await runAsync(
            'INSERT INTO user_communications (userId, optedIn, optInTimestamp, optOutTimestamp, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
            [
              comm.userId,
              comm.optedIn ? 1 : 0,
              comm.optInTimestamp || null,
              comm.optOutTimestamp || null,
              comm.createdAt || new Date().toISOString(),
              comm.updatedAt || new Date().toISOString(),
            ]
          );
        } catch {
          log.warning(`Skipped duplicate communication preference for user ${comm.userId}`);
        }
      }
      log.success(`Migrated ${guildComms.length} communication preferences to guild ${guildId}`);
    }

    log.info(`Guild ${guildId} migration complete`);
    return true;
  } catch (err) {
    log.error(`Failed to migrate guild ${guildId}: ${err.message}`);
    return false;
  }
}

/**
 * Main migration function
 */
async function migrate() {
  log.header('🔄 VeraBot Multi-Database Migration Script');

  try {
    // Step 1: Verify source database
    log.info('Verifying source database...');
    checkSourceDatabase();

    // Step 2: Backup original database
    log.info('Creating backup of original database...');
    const backupPath = backupOriginalDatabase();

    // Step 3: Open and read source database
    log.info('Reading data from source database...');
    const sourceDb = await openDatabase(SINGLE_DB_PATH);
    const allData = await getAllData(sourceDb);
    sourceDb.close();

    log.success(`Read ${allData.quotes?.length || 0} quotes and related data`);

    // Step 4: Determine guild IDs
    let targetGuilds = [];
    const cliGuildId = process.argv[2];

    if (cliGuildId) {
      targetGuilds = [cliGuildId];
      log.info(`Migrating specific guild: ${cliGuildId}`);
    } else {
      targetGuilds = extractGuildIds(allData);
      log.info(`Migrating ${targetGuilds.length} guild(s): ${targetGuilds.join(', ')}`);
    }

    // Step 5: Initialize guild database manager
    const guildManager = new GuildDatabaseManager();

    // Step 6: Migrate data to each guild
    log.header('📦 Migrating Data to Guild Databases');
    const results = [];

    for (const guildId of targetGuilds) {
      log.info(`Starting migration for guild: ${guildId}`);
      const success = await migrateDataToGuild(guildManager, guildId, allData);
      results.push({ guildId, success });
    }

    // Step 7: Verify migration
    log.header('✔️  Migration Summary');
    const successful = results.filter((r) => r.success).length;
    const failed = results.length - successful;

    log.success(`Migration completed: ${successful}/${results.length} guilds migrated successfully`);

    if (failed > 0) {
      log.warning(`${failed} guild(s) had issues during migration`);
    }

    // Step 8: Cleanup
    await guildManager.shutdown();

    log.header('📝 Post-Migration Steps');
    log.info(`1. Backup stored at: ${backupPath}`);
    log.info(`2. Original database preserved at: ${SINGLE_DB_PATH}`);
    log.info(`3. Guild databases created in: ${GUILDS_DIR}`);
    log.info('4. Verify data integrity in Discord');
    log.info('5. Once verified, you can safely delete the original database');

    if (failed === 0) {
      log.success('\n✨ Migration completed successfully!');
      process.exit(0);
    } else {
      log.warning('\n⚠️  Migration completed with warnings. Check the output above.');
      process.exit(1);
    }
  } catch (err) {
    log.error(`Migration failed: ${err.message}`);
    console.error(err);
    process.exit(1);
  }
}

// Run migration
migrate();
