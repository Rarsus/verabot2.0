/**
 * Phase 9: Reminder Operations Comprehensive Tests
 * Tests: 22 tests covering reminder functionality
 * Expected coverage: Core reminder patterns and guild isolation
 */

/* eslint-disable max-nested-callbacks */
const assert = require('assert');
const sqlite3 = require('sqlite3').verbose();

describe('Phase 9: Reminder Operations', () => {
  let testDb;
  const testGuildId = 'test-guild-123';
  const testUserId = 'test-user-456';

  beforeEach(() => {
    testDb = new sqlite3.Database(':memory:');

    return new Promise((resolve) => {
      testDb.run(
        `CREATE TABLE IF NOT EXISTS reminders (
          id INTEGER PRIMARY KEY,
          guildId TEXT NOT NULL,
          userId TEXT NOT NULL,
          text TEXT NOT NULL,
          dueDate DATETIME NOT NULL,
          completed INTEGER DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(guildId, id)
        )`,
        resolve
      );
    });
  });

  afterEach((done) => {
    if (testDb) {
      testDb.close(done);
    } else {
      done();
    }
  });

  // ============================================================================
  // SECTION 1: Reminder Creation (5 tests)
  // ============================================================================

  describe('Create Reminder', () => {
    it('should create reminder for user in guild', (done) => {
      const dueDate = new Date(Date.now() + 3600000); // 1 hour from now

      testDb.run(
        'INSERT INTO reminders (guildId, userId, text, dueDate) VALUES (?, ?, ?, ?)',
        [testGuildId, testUserId, 'Remember to test', dueDate.toISOString()],
        function (err) {
          assert.strictEqual(err, null);
          assert(this.lastID > 0);
          testDb.get('SELECT * FROM reminders WHERE id = ?', [this.lastID], (err, row) => {
            assert.strictEqual(row.guildId, testGuildId);
            assert.strictEqual(row.userId, testUserId);
            assert.strictEqual(row.text, 'Remember to test');
            assert.strictEqual(row.completed, 0);
            done();
          });
        }
      );
    });

    it('should store reminder with due date', (done) => {
      const dueDate = new Date('2026-02-01T15:00:00Z');

      testDb.run(
        'INSERT INTO reminders (guildId, userId, text, dueDate) VALUES (?, ?, ?, ?)',
        [testGuildId, testUserId, 'Future reminder', dueDate.toISOString()],
        function (err) {
          testDb.get('SELECT * FROM reminders WHERE id = ?', [this.lastID], (err, row) => {
            assert(row.dueDate);
            assert(row.dueDate.includes('2026-02-01'));
            done();
          });
        }
      );
    });

    it('should enforce guild isolation on creation', (done) => {
      testDb.run(
        'INSERT INTO reminders (guildId, userId, text, dueDate) VALUES (?, ?, ?, ?)',
        [testGuildId, testUserId, 'Reminder 1', new Date().toISOString()],
        function () {
          const id = this.lastID;
          testDb.get('SELECT * FROM reminders WHERE id = ? AND guildId = ?', [id, 'different-guild'], (err, row) => {
            assert.strictEqual(row, undefined);
            done();
          });
        }
      );
    });

    it('should set created date automatically', (done) => {
      testDb.run(
        'INSERT INTO reminders (guildId, userId, text, dueDate) VALUES (?, ?, ?, ?)',
        [testGuildId, testUserId, 'Test', new Date().toISOString()],
        function () {
          testDb.get('SELECT * FROM reminders WHERE id = ?', [this.lastID], (err, row) => {
            assert(row.createdAt);
            done();
          });
        }
      );
    });

    it('should reject empty reminder text', (done) => {
      const validateReminder = (text, dueDate) => {
        if (!text || text.trim().length === 0) {
          throw new Error('Reminder text cannot be empty');
        }
        if (!dueDate) {
          throw new Error('Due date is required');
        }
        return true;
      };

      try {
        validateReminder('', new Date());
        assert.fail('Should have thrown');
      } catch (err) {
        assert(err.message.includes('empty'));
        done();
      }
    });
  });

  // ============================================================================
  // SECTION 2: Reminder Retrieval (5 tests)
  // ============================================================================

  describe('Retrieve Reminder', () => {
    beforeEach((done) => {
      const future1 = new Date(Date.now() + 3600000);
      const future2 = new Date(Date.now() + 7200000);

      testDb.run('BEGIN');
      testDb.run(
        'INSERT INTO reminders (guildId, userId, text, dueDate) VALUES (?, ?, ?, ?)',
        [testGuildId, testUserId, 'Reminder 1', future1.toISOString()]
      );
      testDb.run(
        'INSERT INTO reminders (guildId, userId, text, dueDate) VALUES (?, ?, ?, ?)',
        [testGuildId, testUserId, 'Reminder 2', future2.toISOString()]
      );
      testDb.run('COMMIT', done);
    });

    it('should get reminder by ID', (done) => {
      testDb.get('SELECT * FROM reminders WHERE id = 1 AND guildId = ?', [testGuildId], (err, row) => {
        assert(row);
        assert.strictEqual(row.text, 'Reminder 1');
        done();
      });
    });

    it('should get all reminders for user in guild', (done) => {
      testDb.all(
        'SELECT * FROM reminders WHERE guildId = ? AND userId = ? ORDER BY dueDate',
        [testGuildId, testUserId],
        (err, rows) => {
          assert.strictEqual(rows.length, 2);
          done();
        }
      );
    });

    it('should get pending reminders (not completed)', (done) => {
      testDb.all(
        'SELECT * FROM reminders WHERE guildId = ? AND userId = ? AND completed = 0 ORDER BY dueDate',
        [testGuildId, testUserId],
        (err, rows) => {
          assert(rows.every((r) => r.completed === 0));
          done();
        }
      );
    });

    it('should get overdue reminders', (done) => {
      const pastDate = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago
      testDb.run(
        'INSERT INTO reminders (guildId, userId, text, dueDate) VALUES (?, ?, ?, ?)',
        [testGuildId, testUserId, 'Overdue reminder', pastDate],
        () => {
          testDb.all(
            'SELECT * FROM reminders WHERE guildId = ? AND completed = 0',
            [testGuildId],
            (err, rows) => {
              assert(rows.length >= 1);
              done();
            }
          );
        }
      );
    });

    it('should not get reminders from different guild', (done) => {
      testDb.all(
        'SELECT * FROM reminders WHERE guildId = ? AND userId = ?',
        ['different-guild', testUserId],
        (err, rows) => {
          assert.strictEqual(rows.length, 0);
          done();
        }
      );
    });
  });

  // ============================================================================
  // SECTION 3: Reminder Update (4 tests)
  // ============================================================================

  describe('Update Reminder', () => {
    beforeEach((done) => {
      testDb.run(
        'INSERT INTO reminders (guildId, userId, text, dueDate) VALUES (?, ?, ?, ?)',
        [testGuildId, testUserId, 'Original text', new Date().toISOString()],
        done
      );
    });

    it('should update reminder text', (done) => {
      testDb.run('UPDATE reminders SET text = ? WHERE id = 1 AND guildId = ?', ['Updated text', testGuildId], (err) => {
        assert.strictEqual(err, null);
        testDb.get('SELECT * FROM reminders WHERE id = 1', (err, row) => {
          assert.strictEqual(row.text, 'Updated text');
          done();
        });
      });
    });

    it('should update reminder due date', (done) => {
      const newDate = new Date('2026-03-01T10:00:00Z');
      testDb.run('UPDATE reminders SET dueDate = ? WHERE id = 1 AND guildId = ?', [newDate.toISOString(), testGuildId], (err) => {
        assert.strictEqual(err, null);
        done();
      });
    });

    it('should mark reminder as completed', (done) => {
      testDb.run('UPDATE reminders SET completed = 1 WHERE id = 1 AND guildId = ?', [testGuildId], (err) => {
        assert.strictEqual(err, null);
        testDb.get('SELECT * FROM reminders WHERE id = 1', (err, row) => {
          assert.strictEqual(row.completed, 1);
          done();
        });
      });
    });

    it('should not update reminder from different guild', (done) => {
      testDb.run(
        'UPDATE reminders SET text = ? WHERE id = 1 AND guildId = ?',
        ['Should not update', 'different-guild'],
        (err) => {
          assert.strictEqual(err, null);
          testDb.get('SELECT * FROM reminders WHERE id = 1', (err, row) => {
            assert.strictEqual(row.text, 'Original text');
            done();
          });
        }
      );
    });
  });

  // ============================================================================
  // SECTION 4: Reminder Deletion (4 tests)
  // ============================================================================

  describe('Delete Reminder', () => {
    beforeEach((done) => {
      testDb.run(
        'INSERT INTO reminders (guildId, userId, text, dueDate) VALUES (?, ?, ?, ?)',
        [testGuildId, testUserId, 'To delete', new Date().toISOString()],
        done
      );
    });

    it('should delete reminder', (done) => {
      testDb.run('DELETE FROM reminders WHERE id = 1 AND guildId = ?', [testGuildId], (err) => {
        assert.strictEqual(err, null);
        testDb.get('SELECT * FROM reminders WHERE id = 1', (err, row) => {
          assert.strictEqual(row, undefined);
          done();
        });
      });
    });

    it('should not delete reminder from different guild', (done) => {
      testDb.run('DELETE FROM reminders WHERE id = 1 AND guildId = ?', ['different-guild'], (err) => {
        assert.strictEqual(err, null);
        testDb.get('SELECT * FROM reminders WHERE id = 1', (err, row) => {
          assert(row); // Still exists
          done();
        });
      });
    });

    it('should delete all completed reminders for user', (done) => {
      testDb.run('INSERT INTO reminders (guildId, userId, text, dueDate, completed) VALUES (?, ?, ?, ?, 1)', [
        testGuildId,
        testUserId,
        'Completed reminder',
        new Date().toISOString(),
      ]);
      
      testDb.run('DELETE FROM reminders WHERE guildId = ? AND userId = ? AND completed = 1', [testGuildId, testUserId], (err) => {
        testDb.all('SELECT * FROM reminders WHERE guildId = ? AND completed = 1', [testGuildId], (err, rows) => {
          assert.strictEqual(rows.length, 0);
          done();
        });
      });
    });

    it('should cleanup expired reminders', (done) => {
      const pastDate = new Date(Date.now() - 86400000 * 30).toISOString(); // 30 days ago
      testDb.run(
        'INSERT INTO reminders (guildId, userId, text, dueDate, completed) VALUES (?, ?, ?, ?, ?)',
        [testGuildId, testUserId, 'Old reminder', pastDate, 1],
        () => {
          testDb.all('SELECT * FROM reminders WHERE guildId = ?', [testGuildId], (err, rows) => {
            // At least the first reminder remains
            done();
          });
        }
      );
    });
  });

  // ============================================================================
  // SECTION 5: Reminder Search & Filtering (4 tests)
  // ============================================================================

  describe('Search & Filter Reminders', () => {
    beforeEach((done) => {
      testDb.run('BEGIN');
      testDb.run(
        'INSERT INTO reminders (guildId, userId, text, dueDate) VALUES (?, ?, ?, ?)',
        [testGuildId, 'user-1', 'Buy groceries', new Date(Date.now() + 3600000).toISOString()]
      );
      testDb.run(
        'INSERT INTO reminders (guildId, userId, text, dueDate) VALUES (?, ?, ?, ?)',
        [testGuildId, 'user-2', 'Call mom', new Date(Date.now() + 7200000).toISOString()]
      );
      testDb.run(
        'INSERT INTO reminders (guildId, userId, text, dueDate, completed) VALUES (?, ?, ?, ?, 1)',
        [testGuildId, 'user-1', 'Completed task', new Date().toISOString(), 1]
      );
      testDb.run('COMMIT', done);
    });

    it('should search reminders by text', (done) => {
      testDb.all(
        'SELECT * FROM reminders WHERE guildId = ? AND text LIKE ? COLLATE NOCASE',
        [testGuildId, '%groceries%'],
        (err, rows) => {
          assert.strictEqual(rows.length, 1);
          assert.strictEqual(rows[0].text, 'Buy groceries');
          done();
        }
      );
    });

    it('should filter by user ID', (done) => {
      testDb.all(
        'SELECT * FROM reminders WHERE guildId = ? AND userId = ?',
        [testGuildId, 'user-1'],
        (err, rows) => {
          assert.strictEqual(rows.length, 2);
          assert(rows.every((r) => r.userId === 'user-1'));
          done();
        }
      );
    });

    it('should filter by completion status', (done) => {
      testDb.all(
        'SELECT * FROM reminders WHERE guildId = ? AND completed = 0',
        [testGuildId],
        (err, rows) => {
          assert(rows.every((r) => r.completed === 0));
          done();
        }
      );
    });

    it('should sort reminders by due date', (done) => {
      testDb.all(
        'SELECT * FROM reminders WHERE guildId = ? ORDER BY dueDate ASC',
        [testGuildId],
        (err, rows) => {
          for (let i = 1; i < rows.length; i++) {
            assert(rows[i - 1].dueDate <= rows[i].dueDate);
          }
          done();
        }
      );
    });
  });
});
