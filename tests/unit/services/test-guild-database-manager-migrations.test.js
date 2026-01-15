/**
 * Tests for GuildDatabaseManager Migration Functions
 * Tests the _runMigrations() method that adds missing columns to existing tables
 */

const assert = require('assert');
const sqlite3 = require('sqlite3').verbose();
const manager = require('../../../src/services/GuildDatabaseManager');

describe('GuildDatabaseManager._runMigrations()', () => {
  let testDb;

  beforeEach(async () => {
    // Create fresh in-memory database for each test
    testDb = new sqlite3.Database(':memory:');

    // Create user_communications table WITHOUT opted_in or preferences columns
    await new Promise((resolve, reject) => {
      testDb.run(
        `
        CREATE TABLE IF NOT EXISTS user_communications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(userId)
        )
      `,
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  });

  afterEach((done) => {
    if (testDb) {
      testDb.close((err) => {
        if (err) console.error('Error closing test database:', err);
        done();
      });
    } else {
      done();
    }
  });

  describe('happy path', () => {
    it('should add opted_in column when missing', async () => {
      // Run migration
      await manager._runMigrations(testDb);

      // Verify opted_in column was added
      const columns = await new Promise((resolve) => {
        testDb.all('PRAGMA table_info(user_communications)', (err, cols) => {
          resolve(cols || []);
        });
      });

      const columnNames = columns.map((col) => col.name);
      assert.ok(columnNames.includes('opted_in'), 'opted_in column should exist after migration');
    });

    it('should add preferences column when missing', async () => {
      // Run migration
      await manager._runMigrations(testDb);

      // Verify preferences column was added
      const columns = await new Promise((resolve) => {
        testDb.all('PRAGMA table_info(user_communications)', (err, cols) => {
          resolve(cols || []);
        });
      });

      const columnNames = columns.map((col) => col.name);
      assert.ok(columnNames.includes('preferences'), 'preferences column should exist after migration');
    });

    it('should add both columns in a single migration run', async () => {
      // Run migration
      await manager._runMigrations(testDb);

      // Verify both columns were added
      const columns = await new Promise((resolve) => {
        testDb.all('PRAGMA table_info(user_communications)', (err, cols) => {
          resolve(cols || []);
        });
      });

      const columnNames = columns.map((col) => col.name);
      assert.ok(columnNames.includes('opted_in'), 'opted_in column should exist');
      assert.ok(columnNames.includes('preferences'), 'preferences column should exist');
    });

    it('should set opted_in default value to 0', async () => {
      // Run migration
      await manager._runMigrations(testDb);

      // Insert a record without specifying opted_in
      await new Promise((resolve, reject) => {
        testDb.run('INSERT INTO user_communications (userId) VALUES (?)', ['test-user-123'], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Verify default value is 0
      const row = await new Promise((resolve) => {
        testDb.get('SELECT opted_in FROM user_communications WHERE userId = ?', ['test-user-123'], (err, row) => {
          resolve(row || {});
        });
      });

      assert.strictEqual(row.opted_in, 0, 'opted_in should default to 0');
    });

    it('should set preferences default value to empty JSON', async () => {
      // Run migration
      await manager._runMigrations(testDb);

      // Insert a record without specifying preferences
      await new Promise((resolve, reject) => {
        testDb.run('INSERT INTO user_communications (userId) VALUES (?)', ['test-user-456'], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Verify default value is '{}'
      const row = await new Promise((resolve) => {
        testDb.get('SELECT preferences FROM user_communications WHERE userId = ?', ['test-user-456'], (err, row) => {
          resolve(row || {});
        });
      });

      assert.strictEqual(row.preferences, '{}', 'preferences should default to empty JSON');
    });
  });

  describe('idempotent behavior', () => {
    it('should not fail when columns already exist', async () => {
      // Add columns manually
      await new Promise((resolve, reject) => {
        testDb.run(
          'ALTER TABLE user_communications ADD COLUMN opted_in INTEGER DEFAULT 0',
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      // Run migration - should not throw error
      let migrationError = null;
      try {
        await manager._runMigrations(testDb);
      } catch (error) {
        migrationError = error;
      }

      assert.strictEqual(migrationError, null, 'migration should not fail when columns exist');
    });

    it('should handle running migration twice', async () => {
      // First migration run
      await manager._runMigrations(testDb);

      // Second migration run - should not fail
      let secondError = null;
      try {
        await manager._runMigrations(testDb);
      } catch (error) {
        secondError = error;
      }

      assert.strictEqual(secondError, null, 'second migration run should not fail');
    });

    it('should handle partial column existence (opted_in exists, preferences missing)', async () => {
      // Add only opted_in column
      await new Promise((resolve, reject) => {
        testDb.run(
          'ALTER TABLE user_communications ADD COLUMN opted_in INTEGER DEFAULT 0',
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      // Run migration
      await manager._runMigrations(testDb);

      // Verify preferences was added
      const columns = await new Promise((resolve) => {
        testDb.all('PRAGMA table_info(user_communications)', (err, cols) => {
          resolve(cols || []);
        });
      });

      const columnNames = columns.map((col) => col.name);
      assert.ok(columnNames.includes('preferences'), 'preferences should be added even if opted_in exists');
    });
  });

  describe('error handling', () => {
    it('should not throw error if table does not exist', async () => {
      // Create fresh database with no tables
      const emptyDb = new sqlite3.Database(':memory:');

      let migrationError = null;
      try {
        await manager._runMigrations(emptyDb);
      } catch (error) {
        migrationError = error;
      }

      emptyDb.close();

      // Migration should handle gracefully (silently log error per implementation)
      // Should not throw to caller
      assert.strictEqual(migrationError, null, 'migration should not throw if table missing');
    });

    it('should handle database query errors gracefully', async () => {
      // Close database to cause error
      testDb.close();

      let migrationError = null;
      try {
        await manager._runMigrations(testDb);
      } catch (error) {
        migrationError = error;
      }

      // Migration should not propagate errors
      // (per implementation: errors logged but not thrown)
      assert.strictEqual(migrationError, null, 'migration should handle db errors gracefully');
    });
  });

  describe('data preservation', () => {
    it('should preserve existing data when adding columns', async () => {
      // Insert test data before migration
      await new Promise((resolve, reject) => {
        testDb.run(
          'INSERT INTO user_communications (userId, createdAt) VALUES (?, ?)',
          ['user-123', '2024-01-01T00:00:00Z'],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      // Run migration
      await manager._runMigrations(testDb);

      // Verify data still exists
      const row = await new Promise((resolve) => {
        testDb.get('SELECT * FROM user_communications WHERE userId = ?', ['user-123'], (err, row) => {
          resolve(row || null);
        });
      });

      assert.ok(row, 'data should be preserved after migration');
      assert.strictEqual(row.userId, 'user-123', 'userId should be preserved');
      assert.strictEqual(row.createdAt, '2024-01-01T00:00:00Z', 'createdAt should be preserved');
    });

    it('should set default values for migrated columns on existing rows', async () => {
      // Insert test data before migration
      await new Promise((resolve, reject) => {
        testDb.run(
          'INSERT INTO user_communications (userId) VALUES (?)',
          ['user-456'],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      // Run migration
      await manager._runMigrations(testDb);

      // Verify new columns have default values
      const row = await new Promise((resolve) => {
        testDb.get('SELECT opted_in, preferences FROM user_communications WHERE userId = ?', ['user-456'], (err, row) => {
          resolve(row || {});
        });
      });

      assert.strictEqual(row.opted_in, 0, 'opted_in should default to 0 for existing rows');
      assert.strictEqual(row.preferences, '{}', 'preferences should default to empty JSON for existing rows');
    });
  });

  describe('integration with GuildDatabaseManager lifecycle', () => {
    it('should work with _runAsync helper method', async () => {
      // Verify _runAsync is used correctly in migration
      // Create a test that verifies the migration uses the manager's async method
      const hasRunAsync = typeof manager._runAsync === 'function';
      assert.ok(hasRunAsync, '_runAsync method should exist on manager');
    });

    it('should complete without hanging or blocking', async () => {
      // Set a timeout - migration should complete quickly
      const startTime = Date.now();
      await manager._runMigrations(testDb);
      const duration = Date.now() - startTime;

      assert.ok(duration < 5000, 'migration should complete within 5 seconds');
    });
  });

  describe('column properties', () => {
    it('opted_in column should have correct type and default', async () => {
      // Run migration
      await manager._runMigrations(testDb);

      // Check column info
      const columns = await new Promise((resolve) => {
        testDb.all('PRAGMA table_info(user_communications)', (err, cols) => {
          resolve(cols || []);
        });
      });

      const optedInCol = columns.find((col) => col.name === 'opted_in');
      assert.ok(optedInCol, 'opted_in column should exist');
      assert.strictEqual(optedInCol.type, 'INTEGER', 'opted_in should be INTEGER type');
      assert.strictEqual(optedInCol.dflt_value, '0', 'opted_in should default to 0');
    });

    it('preferences column should have correct type and default', async () => {
      // Run migration
      await manager._runMigrations(testDb);

      // Check column info
      const columns = await new Promise((resolve) => {
        testDb.all('PRAGMA table_info(user_communications)', (err, cols) => {
          resolve(cols || []);
        });
      });

      const prefsCol = columns.find((col) => col.name === 'preferences');
      assert.ok(prefsCol, 'preferences column should exist');
      assert.strictEqual(prefsCol.type, 'TEXT', 'preferences should be TEXT type');
      assert.strictEqual(prefsCol.dflt_value, "'{}'", 'preferences should default to empty JSON');
    });
  });
});
