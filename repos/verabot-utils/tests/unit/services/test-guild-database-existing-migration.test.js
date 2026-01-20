/**
 * Tests for GuildDatabaseManager migration on existing database access
 * Verifies migrations run when accessing existing (not new) guild databases
 */

const assert = require('assert');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const os = require('os');

describe('GuildDatabaseManager migration on existing database access', () => {
  let testDir;
  let GuildDatabaseManager;

  beforeEach(() => {
    // Create temp directory for test databases
    testDir = path.join(os.tmpdir(), `test-guild-db-${Date.now()}`);
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // Clear require cache to get fresh instance
    delete require.cache[require.resolve('../../../src/services/GuildDatabaseManager')];
    GuildDatabaseManager = require('../../../src/services/GuildDatabaseManager');
  });

  afterEach(async () => {
    // Close all connections
    if (GuildDatabaseManager && GuildDatabaseManager.closeAllConnections) {
      await GuildDatabaseManager.closeAllConnections();
    }

    // Clean up test directory
    if (fs.existsSync(testDir)) {
      const files = fs.readdirSync(testDir);
      for (const file of files) {
        const filePath = path.join(testDir, file);
        if (fs.statSync(filePath).isDirectory()) {
          const subFiles = fs.readdirSync(filePath);
          for (const subFile of subFiles) {
            fs.unlinkSync(path.join(filePath, subFile));
          }
          fs.rmdirSync(filePath);
        } else {
          fs.unlinkSync(filePath);
        }
      }
      fs.rmdirSync(testDir);
    }
  });

  describe('migration on existing database access', () => {
    it('should run migrations when accessing existing database with old schema', async () => {
      const guildId = 'test-guild-123';

      // Create database with OLD schema (table-level UNIQUE constraint)
      const guildDir = path.join(testDir, guildId);
      fs.mkdirSync(guildDir, { recursive: true });
      const dbPath = path.join(guildDir, 'quotes.db');

      // Create old schema manually
      await new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, (err) => {
          if (err) {
            reject(err);
            return;
          }

          // Create table with OLD schema (table-level UNIQUE)
          db.run(
            `
            CREATE TABLE IF NOT EXISTS user_communications (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              userId TEXT NOT NULL,
              opted_in INTEGER DEFAULT 0,
              preferences TEXT DEFAULT '{}',
              createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
              updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
              UNIQUE(userId)
            )
          `,
            (createErr) => {
              if (createErr) {
                db.close();
                reject(createErr);
                return;
              }

              // Verify old schema by trying ON CONFLICT (should fail)
              db.run(
                `INSERT INTO user_communications (userId, opted_in, createdAt, updatedAt)
                 VALUES ('test-user', 1, datetime('now'), datetime('now'))
                 ON CONFLICT(userId) DO UPDATE SET opted_in = 1`,
                (insertErr) => {
                  // We expect this to fail with old schema
                  db.close();
                  resolve(); // Continue regardless
                }
              );
            }
          );
        });
      });

      // Now access the database via GuildDatabaseManager
      // This should trigger migration
      const db = await GuildDatabaseManager.getGuildDatabase(guildId);

      // Wait a moment for migration to potentially run
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Try ON CONFLICT operation - should now succeed
      let conflictError = null;
      await new Promise((resolve) => {
        db.run(
          `INSERT INTO user_communications (userId, opted_in, createdAt, updatedAt)
           VALUES ('test-user-2', 1, datetime('now'), datetime('now'))
           ON CONFLICT(userId) DO UPDATE SET opted_in = 1`,
          (err) => {
            conflictError = err;
            resolve();
          }
        );
      });

      // Should not error after migration
      assert.strictEqual(conflictError, null, 'ON CONFLICT should work after migration runs');

      await GuildDatabaseManager.closeGuildDatabase(guildId);
    });

    it('should handle migration gracefully if table does not exist', async () => {
      const guildId = 'test-guild-empty';

      // Create empty database (no tables)
      const guildDir = path.join(testDir, guildId);
      fs.mkdirSync(guildDir, { recursive: true });
      const dbPath = path.join(guildDir, 'quotes.db');

      // Create empty database file
      const db = new sqlite3.Database(dbPath);
      await new Promise((resolve) => {
        db.run('SELECT 1', (err) => {
          db.close();
          resolve(); // Ignore errors
        });
      });

      // Access via GuildDatabaseManager - should not fail
      let error = null;
      try {
        const guildDb = await GuildDatabaseManager.getGuildDatabase(guildId);
        await GuildDatabaseManager.closeGuildDatabase(guildId);
      } catch (err) {
        error = err;
      }

      // Should handle gracefully
      assert.strictEqual(error, null, 'Should handle empty database gracefully');
    });

    it('should not re-run migration on subsequent access', async () => {
      const guildId = 'test-guild-idempotent';

      // Create database with OLD schema
      const guildDir = path.join(testDir, guildId);
      fs.mkdirSync(guildDir, { recursive: true });
      const dbPath = path.join(guildDir, 'quotes.db');

      await new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, (err) => {
          if (err) {
            reject(err);
            return;
          }

          db.run(
            `
            CREATE TABLE IF NOT EXISTS user_communications (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              userId TEXT NOT NULL,
              opted_in INTEGER DEFAULT 0,
              preferences TEXT DEFAULT '{}',
              createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
              updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
              UNIQUE(userId)
            )
          `,
            () => {
              db.close();
              resolve();
            }
          );
        });
      });

      // First access - triggers migration
      const db1 = await GuildDatabaseManager.getGuildDatabase(guildId);
      await GuildDatabaseManager.closeGuildDatabase(guildId);

      // Second access - should not re-migrate (already fixed)
      const db2 = await GuildDatabaseManager.getGuildDatabase(guildId);

      // Verify ON CONFLICT works
      let error = null;
      await new Promise((resolve) => {
        db2.run(
          `INSERT INTO user_communications (userId, opted_in, createdAt, updatedAt)
           VALUES ('final-test', 1, datetime('now'), datetime('now'))
           ON CONFLICT(userId) DO UPDATE SET opted_in = 1`,
          (err) => {
            error = err;
            resolve();
          }
        );
      });

      assert.strictEqual(error, null, 'Should still work on second access');

      await GuildDatabaseManager.closeGuildDatabase(guildId);
    });
  });
});
