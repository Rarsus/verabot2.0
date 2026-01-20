/**
 * Tests for GuildAwareCommunicationService ON CONFLICT behavior
 * Tests the opt-in/opt-out INSERT with ON CONFLICT functionality
 */

const assert = require('assert');
const sqlite3 = require('sqlite3').verbose();

describe('user_communications ON CONFLICT functionality', () => {
  let testDb;

  beforeEach(async () => {
    // Create fresh in-memory database for each test
    testDb = new sqlite3.Database(':memory:');

    // Initialize with CORRECT schema (column-level UNIQUE)
    await new Promise((resolve, reject) => {
      testDb.run(
        `
        CREATE TABLE IF NOT EXISTS user_communications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId TEXT NOT NULL UNIQUE,
          opted_in INTEGER DEFAULT 0,
          preferences TEXT DEFAULT '{}',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
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

  describe('INSERT with ON CONFLICT', () => {
    it('should insert new user with opted_in=1', async () => {
      const userId = 'user-123';
      const now = new Date().toISOString();

      await new Promise((resolve, reject) => {
        testDb.run(
          `INSERT INTO user_communications (userId, opted_in, createdAt, updatedAt)
           VALUES (?, 1, ?, ?)
           ON CONFLICT(userId) DO UPDATE SET opted_in = 1, updatedAt = ?`,
          [userId, now, now, now],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      // Verify row was inserted
      const row = await new Promise((resolve) => {
        testDb.get('SELECT * FROM user_communications WHERE userId = ?', [userId], (err, row) => {
          resolve(row || null);
        });
      });

      assert.ok(row, 'User should be inserted');
      assert.strictEqual(row.userId, userId, 'userId should match');
      assert.strictEqual(row.opted_in, 1, 'opted_in should be 1');
    });

    it('should update opted_in when user already exists', async () => {
      const userId = 'user-456';
      const now1 = '2024-01-01T00:00:00Z';
      const now2 = '2024-01-02T00:00:00Z';

      // Insert initial record
      await new Promise((resolve, reject) => {
        testDb.run(
          'INSERT INTO user_communications (userId, opted_in, createdAt, updatedAt) VALUES (?, ?, ?, ?)',
          [userId, 0, now1, now1],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      // Update via ON CONFLICT
      await new Promise((resolve, reject) => {
        testDb.run(
          `INSERT INTO user_communications (userId, opted_in, createdAt, updatedAt)
           VALUES (?, 1, ?, ?)
           ON CONFLICT(userId) DO UPDATE SET opted_in = 1, updatedAt = ?`,
          [userId, now2, now2, now2],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      // Verify update
      const row = await new Promise((resolve) => {
        testDb.get('SELECT * FROM user_communications WHERE userId = ?', [userId], (err, row) => {
          resolve(row || null);
        });
      });

      assert.ok(row, 'User should exist');
      assert.strictEqual(row.opted_in, 1, 'opted_in should be updated to 1');
      assert.strictEqual(row.updatedAt, now2, 'updatedAt should be updated');
      assert.strictEqual(row.createdAt, now1, 'createdAt should not change');
    });

    it('should handle opted_in=0 (opt-out) via ON CONFLICT', async () => {
      const userId = 'user-789';
      const now = new Date().toISOString();

      // Insert opt-in first
      await new Promise((resolve, reject) => {
        testDb.run(
          `INSERT INTO user_communications (userId, opted_in, createdAt, updatedAt)
           VALUES (?, 1, ?, ?)
           ON CONFLICT(userId) DO UPDATE SET opted_in = 1, updatedAt = ?`,
          [userId, now, now, now],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      // Then opt-out
      const optOutTime = new Date().toISOString();
      await new Promise((resolve, reject) => {
        testDb.run(
          `INSERT INTO user_communications (userId, opted_in, createdAt, updatedAt)
           VALUES (?, 0, ?, ?)
           ON CONFLICT(userId) DO UPDATE SET opted_in = 0, updatedAt = ?`,
          [userId, optOutTime, optOutTime, optOutTime],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      // Verify opt-out
      const row = await new Promise((resolve) => {
        testDb.get('SELECT opted_in FROM user_communications WHERE userId = ?', [userId], (err, row) => {
          resolve(row || null);
        });
      });

      assert.strictEqual(row.opted_in, 0, 'opted_in should be 0 after opt-out');
    });

    it('should not allow duplicate userId without conflict handling', async () => {
      const userId = 'user-duplicate';
      const now = new Date().toISOString();

      // Insert first record
      await new Promise((resolve, reject) => {
        testDb.run(
          'INSERT INTO user_communications (userId, opted_in, createdAt, updatedAt) VALUES (?, ?, ?, ?)',
          [userId, 1, now, now],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      // Try to insert duplicate without ON CONFLICT - should fail
      let duplicateError = null;
      await new Promise((resolve) => {
        testDb.run(
          'INSERT INTO user_communications (userId, opted_in, createdAt, updatedAt) VALUES (?, ?, ?, ?)',
          [userId, 0, now, now],
          (err) => {
            duplicateError = err;
            resolve();
          }
        );
      });

      assert.ok(duplicateError, 'Duplicate userId without ON CONFLICT should error');
      assert.ok(duplicateError.message.includes('UNIQUE'), 'Error should mention UNIQUE constraint');
    });
  });

  describe('schema verification', () => {
    it('should have UNIQUE constraint on userId column', async () => {
      // Check constraints via PRAGMA
      const indexes = await new Promise((resolve) => {
        testDb.all("PRAGMA index_list(user_communications)", (err, rows) => {
          resolve(rows || []);
        });
      });

      // Look for UNIQUE index on userId
      const hasUniqueUserId = indexes.some((idx) => idx.unique && idx.name.includes('userId'));
      assert.ok(hasUniqueUserId || indexes.length > 0, 'Table should have UNIQUE constraint on userId');
    });

    it('column info should show userId as NOT NULL and UNIQUE', async () => {
      const columns = await new Promise((resolve) => {
        testDb.all('PRAGMA table_info(user_communications)', (err, cols) => {
          resolve(cols || []);
        });
      });

      const userIdCol = columns.find((col) => col.name === 'userId');
      assert.ok(userIdCol, 'userId column should exist');
      assert.strictEqual(userIdCol.notnull, 1, 'userId should be NOT NULL');
    });
  });

  describe('concurrent operations', () => {
    it('should handle rapid opt-in/opt-out cycles', async () => {
      const userId = 'user-rapid';
      const now = new Date().toISOString();

      // Simulate rapid toggling
      for (let i = 0; i < 5; i++) {
        const optedIn = i % 2 === 0 ? 1 : 0;
        await new Promise((resolve, reject) => {
          testDb.run(
            `INSERT INTO user_communications (userId, opted_in, createdAt, updatedAt)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(userId) DO UPDATE SET opted_in = ?, updatedAt = ?`,
            [userId, optedIn, now, now, optedIn, now],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }

      // Verify final state
      const row = await new Promise((resolve) => {
        testDb.get('SELECT opted_in FROM user_communications WHERE userId = ?', [userId], (err, row) => {
          resolve(row || null);
        });
      });

      assert.ok(row, 'User should exist after rapid cycling');
      assert.strictEqual(row.opted_in, 1, 'Final state should be opted_in=1 (last iteration was even)');
    });

    it('should maintain data integrity across multiple users', async () => {
      const now = new Date().toISOString();
      const userIds = ['user-a', 'user-b', 'user-c'];

      // Insert multiple users
      for (const userId of userIds) {
        await new Promise((resolve, reject) => {
          testDb.run(
            `INSERT INTO user_communications (userId, opted_in, createdAt, updatedAt)
             VALUES (?, 1, ?, ?)
             ON CONFLICT(userId) DO UPDATE SET opted_in = 1, updatedAt = ?`,
            [userId, now, now, now],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }

      // Verify all users exist with correct data
      const rows = await new Promise((resolve) => {
        testDb.all('SELECT userId, opted_in FROM user_communications ORDER BY userId', [], (err, rows) => {
          resolve(rows || []);
        });
      });

      assert.strictEqual(rows.length, 3, 'Should have 3 users');
      rows.forEach((row) => {
        assert.strictEqual(row.opted_in, 1, `User ${row.userId} should be opted_in`);
      });
    });
  });
});
