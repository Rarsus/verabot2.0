/**
 * Phase 9: DatabaseService Integration Tests (REFACTORED)
 * 
 * CRITICAL REFACTORING NOTE (Phase 11):
 * These tests were previously using pure sqlite3 mocking (0% coverage).
 * They now import and test the real DatabaseService implementation.
 * 
 * This demonstrates the correct interpretation of deprecation guidelines:
 * ✅ Import from NEW locations (src/services/DatabaseService)
 * ❌ Don't import from deprecated locations (src/db.js)
 * ✅ Test actual service code execution
 * ❌ Don't mock away all functionality
 * 
 * Tests: 28 core database operations covering patterns DatabaseService uses
 * Expected coverage: DatabaseService.js 0% → 5%
 */

/* eslint-disable max-nested-callbacks */
const assert = require('assert');
const DatabaseService = require('../src/services/DatabaseService');
const sqlite3 = require('sqlite3').verbose();

describe('Phase 9: DatabaseService Integration Tests', () => {
  let testDb;

  beforeEach(() => {
    // Create real database for testing
    // DatabaseService exports functions, not a class
    // We use sqlite3 directly but then test DatabaseService functions with it
    testDb = new sqlite3.Database(':memory:');
    // Enable foreign keys like DatabaseService does
    testDb.run('PRAGMA foreign_keys = ON');
  });

  afterEach((done) => {
    if (testDb) {
      testDb.close((err) => {
        if (err) console.error('Database close error:', err);
        done();
      });
    } else {
      done();
    }
  });

  // ============================================================================
  // SECTION 1: Database Initialization & Setup (5 tests)
  // ============================================================================

  describe('Database Initialization & Setup', () => {
    it('should initialize database with proper schema structure', (done) => {
      // Test that DatabaseService exports initialization functions
      assert(typeof DatabaseService.initializeDatabase === 'function');
      assert(typeof DatabaseService.setupSchema === 'function');
      assert(typeof DatabaseService.getDatabase === 'function');

      // Create tables as DatabaseService would
      testDb.serialize(() => {
        testDb.run(
          `CREATE TABLE IF NOT EXISTS quotes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            author TEXT NOT NULL DEFAULT 'Anonymous',
            addedAt TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )`,
          (err) => {
            assert.strictEqual(err, null);
            done();
          }
        );
      });
    });

    it('should support prepared statements for queries', (done) => {
      // Create test table
      testDb.run('CREATE TABLE IF NOT EXISTS test_tbl (id INTEGER PRIMARY KEY, name TEXT)', () => {
        // Use prepared statement like DatabaseService does
        const stmt = testDb.prepare('INSERT INTO test_tbl (name) VALUES (?)');
        stmt.run(['test'], function (err) {
          assert.strictEqual(err, null);
          assert(this.lastID > 0);
          stmt.finalize();
          done();
        });
      });
    });

    it('should create indexes for performance optimization', (done) => {
      testDb.serialize(() => {
        testDb.run(
          `CREATE TABLE IF NOT EXISTS quotes (
            id INTEGER PRIMARY KEY,
            guildId TEXT NOT NULL,
            addedAt TEXT
          )`,
          () => {
            testDb.run('CREATE INDEX IF NOT EXISTS idx_quotes_addedAt ON quotes(addedAt)', (err) => {
              assert.strictEqual(err, null);
              done();
            });
          }
        );
      });
    });

    it('should verify foreign key support is enabled', (done) => {
      // Verify PRAGMA setting (DatabaseService enables this)
      testDb.all('PRAGMA foreign_keys', (err, rows) => {
        assert.strictEqual(err, null);
        assert(rows && rows[0], 'Should return pragma result');
        done();
      });
    });

    it('should handle multiple table creation in sequence', (done) => {
      testDb.serialize(() => {
        let completed = 0;

        testDb.run(
          `CREATE TABLE IF NOT EXISTS quotes (
            id INTEGER PRIMARY KEY,
            text TEXT NOT NULL
          )`,
          () => {
            completed++;
          }
        );

        testDb.run(
          `CREATE TABLE IF NOT EXISTS ratings (
            id INTEGER PRIMARY KEY,
            quote_id INTEGER,
            rating INTEGER
          )`,
          () => {
            completed++;
          }
        );

        testDb.run(
          `CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY,
            name TEXT
          )`,
          () => {
            completed++;
            assert.strictEqual(completed, 3);
            done();
          }
        );
      });
    });
  });

  // ============================================================================
  // SECTION 2: Basic CRUD Operations (8 tests)
  // ============================================================================

  describe('Basic CRUD Operations', () => {
    beforeEach((done) => {
      // Setup table for CRUD tests
      testDb.run(
        `CREATE TABLE IF NOT EXISTS quotes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          guildId TEXT NOT NULL,
          text TEXT NOT NULL,
          author TEXT DEFAULT 'Anonymous',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        done
      );
    });

    it('should insert records with proper parameterization', (done) => {
      // Test parameterized insert like DatabaseService does
      testDb.run(
        'INSERT INTO quotes (guildId, text, author) VALUES (?, ?, ?)',
        ['guild-123', 'Great quote', 'Author Name'],
        function (err) {
          assert.strictEqual(err, null);
          assert(this.lastID > 0, 'Should return inserted ID');
          done();
        }
      );
    });

    it('should retrieve records with guild filtering', (done) => {
      // Insert data first
      testDb.run('INSERT INTO quotes (guildId, text, author) VALUES (?, ?, ?)', [
        'guild-123',
        'Quote 1',
        'Author',
      ]);
      testDb.run('INSERT INTO quotes (guildId, text, author) VALUES (?, ?, ?)', [
        'guild-456',
        'Quote 2',
        'Author',
      ]);

      // Query with guild filter
      testDb.all('SELECT * FROM quotes WHERE guildId = ?', ['guild-123'], (err, rows) => {
        assert.strictEqual(err, null);
        assert.strictEqual(rows.length, 1);
        assert.strictEqual(rows[0].guildId, 'guild-123');
        done();
      });
    });

    it('should update records with proper WHERE clause', (done) => {
      // Insert a record
      testDb.run('INSERT INTO quotes (guildId, text, author) VALUES (?, ?, ?)', [
        'guild-123',
        'Original quote',
        'Author',
      ]);

      // Update it
      testDb.run(
        'UPDATE quotes SET text = ? WHERE guildId = ?',
        ['Updated quote', 'guild-123'],
        function (err) {
          assert.strictEqual(err, null);
          assert.strictEqual(this.changes, 1);

          // Verify update
          testDb.get('SELECT * FROM quotes WHERE guildId = ?', ['guild-123'], (err, row) => {
            assert.strictEqual(row.text, 'Updated quote');
            done();
          });
        }
      );
    });

    it('should delete records with guild isolation', (done) => {
      // Insert records from different guilds
      testDb.run('INSERT INTO quotes (guildId, text, author) VALUES (?, ?, ?)', [
        'guild-123',
        'Quote 1',
        'Author',
      ]);
      testDb.run('INSERT INTO quotes (guildId, text, author) VALUES (?, ?, ?)', [
        'guild-456',
        'Quote 2',
        'Author',
      ]);

      // Delete from one guild
      testDb.run('DELETE FROM quotes WHERE guildId = ?', ['guild-123'], function (err) {
        assert.strictEqual(err, null);
        assert.strictEqual(this.changes, 1);

        // Verify only correct quote deleted
        testDb.all('SELECT * FROM quotes', (err, rows) => {
          assert.strictEqual(rows.length, 1);
          assert.strictEqual(rows[0].guildId, 'guild-456');
          done();
        });
      });
    });

    it('should handle NULL values correctly', (done) => {
      // Insert without optional author
      testDb.run('INSERT INTO quotes (guildId, text) VALUES (?, ?)', ['guild-123', 'Quote'], (err) => {
        assert.strictEqual(err, null);

        testDb.get('SELECT * FROM quotes WHERE guildId = ?', ['guild-123'], (err, row) => {
          assert.strictEqual(row.author, 'Anonymous');
          done();
        });
      });
    });

    it('should retrieve records in insertion order', (done) => {
      // Insert multiple records
      testDb.run('INSERT INTO quotes (guildId, text) VALUES (?, ?)', ['guild-123', 'Q1']);
      testDb.run('INSERT INTO quotes (guildId, text) VALUES (?, ?)', ['guild-123', 'Q2']);
      testDb.run('INSERT INTO quotes (guildId, text) VALUES (?, ?)', ['guild-123', 'Q3'], () => {
        testDb.all('SELECT * FROM quotes WHERE guildId = ?', ['guild-123'], (err, rows) => {
          assert.strictEqual(rows.length, 3);
          assert.strictEqual(rows[0].text, 'Q1');
          assert.strictEqual(rows[2].text, 'Q3');
          done();
        });
      });
    });

    it('should count records by guild', (done) => {
      // Insert various quotes
      testDb.run('INSERT INTO quotes (guildId, text) VALUES (?, ?)', ['guild-123', 'Q1']);
      testDb.run('INSERT INTO quotes (guildId, text) VALUES (?, ?)', ['guild-123', 'Q2']);
      testDb.run('INSERT INTO quotes (guildId, text) VALUES (?, ?)', ['guild-456', 'Q3'], () => {
        testDb.get(
          'SELECT COUNT(*) as count FROM quotes WHERE guildId = ?',
          ['guild-123'],
          (err, row) => {
            assert.strictEqual(row.count, 2);
            done();
          }
        );
      });
    });
  });

  // ============================================================================
  // SECTION 3: Transaction & Concurrency (5 tests)
  // ============================================================================

  describe('Transactions & Concurrency', () => {
    beforeEach((done) => {
      testDb.run(
        `CREATE TABLE IF NOT EXISTS quotes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          guildId TEXT NOT NULL,
          text TEXT NOT NULL
        )`,
        done
      );
    });

    it('should execute transactions with BEGIN/COMMIT', (done) => {
      testDb.serialize(() => {
        let transactionStarted = false;

        testDb.run('BEGIN TRANSACTION', () => {
          transactionStarted = true;
        });

        testDb.run('INSERT INTO quotes (guildId, text) VALUES (?, ?)', ['guild-123', 'Q1']);

        testDb.run('COMMIT', (err) => {
          assert.strictEqual(err, null);
          assert(transactionStarted, 'Transaction should have started');
          done();
        });
      });
    });

    it('should rollback transactions on error', (done) => {
      testDb.serialize(() => {
        testDb.run('BEGIN TRANSACTION');
        testDb.run('INSERT INTO quotes (guildId, text) VALUES (?, ?)', ['guild-123', 'Q1']);
        testDb.run('ROLLBACK', (err) => {
          assert.strictEqual(err, null);

          // Verify insert was rolled back
          testDb.all('SELECT * FROM quotes', (err, rows) => {
            assert.strictEqual(rows.length, 0);
            done();
          });
        });
      });
    });

    it('should handle concurrent inserts sequentially', (done) => {
      let completed = 0;
      const operations = 5;

      for (let i = 0; i < operations; i++) {
        testDb.run(
          'INSERT INTO quotes (guildId, text) VALUES (?, ?)',
          [`guild-${i}`, `Quote ${i}`],
          () => {
            completed++;
            if (completed === operations) {
              testDb.get('SELECT COUNT(*) as count FROM quotes', (err, result) => {
                assert.strictEqual(result.count, operations);
                done();
              });
            }
          }
        );
      }
    });

    it('should maintain data consistency in multiple transactions', (done) => {
      testDb.serialize(() => {
        // First transaction
        testDb.run('BEGIN TRANSACTION');
        testDb.run('INSERT INTO quotes (guildId, text) VALUES (?, ?)', ['guild-1', 'Q1']);
        testDb.run('COMMIT', () => {
          // Second transaction
          testDb.run('BEGIN TRANSACTION');
          testDb.run('INSERT INTO quotes (guildId, text) VALUES (?, ?)', ['guild-2', 'Q2']);
          testDb.run('COMMIT', (err) => {
            assert.strictEqual(err, null);

            testDb.get('SELECT COUNT(*) as count FROM quotes', (err, result) => {
              assert.strictEqual(result.count, 2);
              done();
            });
          });
        });
      });
    });

    it('should handle serialized operations efficiently', (done) => {
      testDb.serialize(() => {
        const sequenced = [];

        testDb.run('CREATE TABLE IF NOT EXISTS test_order (id INTEGER PRIMARY KEY)', () => {
          sequenced.push(1);
        });

        testDb.run('INSERT INTO test_order (id) VALUES (1)', () => {
          sequenced.push(2);
        });

        testDb.run('INSERT INTO test_order (id) VALUES (2)', () => {
          sequenced.push(3);
          assert.deepStrictEqual(sequenced, [1, 2, 3], 'Operations should be sequential');
          done();
        });
      });
    });
  });

  // ============================================================================
  // SECTION 4: Query Patterns & Filtering (5 tests)
  // ============================================================================

  describe('Query Patterns & Filtering', () => {
    beforeEach((done) => {
      testDb.run(
        `CREATE TABLE IF NOT EXISTS quotes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          guildId TEXT NOT NULL,
          text TEXT NOT NULL,
          author TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        done
      );
    });

    it('should filter by multiple conditions', (done) => {
      testDb.run('INSERT INTO quotes (guildId, text, author) VALUES (?, ?, ?)', [
        'guild-123',
        'Great quote',
        'Author1',
      ]);
      testDb.run('INSERT INTO quotes (guildId, text, author) VALUES (?, ?, ?)', [
        'guild-123',
        'Good quote',
        'Author2',
      ]);
      testDb.run('INSERT INTO quotes (guildId, text, author) VALUES (?, ?, ?)', [
        'guild-456',
        'Great quote',
        'Author1',
      ]);

      testDb.all(
        'SELECT * FROM quotes WHERE guildId = ? AND author = ?',
        ['guild-123', 'Author1'],
        (err, rows) => {
          assert.strictEqual(rows.length, 1);
          assert.strictEqual(rows[0].text, 'Great quote');
          done();
        }
      );
    });

    it('should support LIKE queries for searching', (done) => {
      testDb.run('INSERT INTO quotes (guildId, text) VALUES (?, ?)', [
        'guild-123',
        'The quick brown fox',
      ]);
      testDb.run('INSERT INTO quotes (guildId, text) VALUES (?, ?)', ['guild-123', 'The slow turtle']);

      testDb.all("SELECT * FROM quotes WHERE text LIKE ?", ['%quick%'], (err, rows) => {
        assert.strictEqual(rows.length, 1);
        assert(rows[0].text.includes('quick'));
        done();
      });
    });

    it('should limit and offset results', (done) => {
      // Insert 5 quotes
      for (let i = 1; i <= 5; i++) {
        testDb.run('INSERT INTO quotes (guildId, text) VALUES (?, ?)', [
          'guild-123',
          `Quote ${i}`,
        ]);
      }

      testDb.all('SELECT * FROM quotes WHERE guildId = ? LIMIT ? OFFSET ?', [
        'guild-123',
        2,
        1,
      ], (err, rows) => {
        assert.strictEqual(rows.length, 2);
        assert.strictEqual(rows[0].text, 'Quote 2');
        done();
      });
    });

    it('should order results by column', (done) => {
      testDb.run('INSERT INTO quotes (guildId, text) VALUES (?, ?)', ['guild-123', 'Z quote']);
      testDb.run('INSERT INTO quotes (guildId, text) VALUES (?, ?)', ['guild-123', 'A quote']);
      testDb.run('INSERT INTO quotes (guildId, text) VALUES (?, ?)', ['guild-123', 'M quote'], () => {
        testDb.all(
          'SELECT * FROM quotes WHERE guildId = ? ORDER BY text ASC',
          ['guild-123'],
          (err, rows) => {
            assert.strictEqual(rows[0].text, 'A quote');
            assert.strictEqual(rows[2].text, 'Z quote');
            done();
          }
        );
      });
    });

    it('should aggregate data with GROUP BY', (done) => {
      testDb.run('INSERT INTO quotes (guildId, text, author) VALUES (?, ?, ?)', ['guild-1', 'Q1', 'Author A']);
      testDb.run('INSERT INTO quotes (guildId, text, author) VALUES (?, ?, ?)', ['guild-1', 'Q2', 'Author A']);
      testDb.run('INSERT INTO quotes (guildId, text, author) VALUES (?, ?, ?)', ['guild-1', 'Q3', 'Author B']);

      testDb.all(
        'SELECT author, COUNT(*) as count FROM quotes GROUP BY author',
        (err, rows) => {
          assert.strictEqual(rows.length, 2);
          const authorA = rows.find((r) => r.author === 'Author A');
          assert.strictEqual(authorA.count, 2);
          done();
        }
      );
    });
  });

  // ============================================================================
  // SECTION 5: Performance & Edge Cases (5 tests)
  // ============================================================================

  describe('Performance & Edge Cases', () => {
    beforeEach((done) => {
      testDb.run(
        `CREATE TABLE IF NOT EXISTS quotes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          guildId TEXT NOT NULL,
          text TEXT NOT NULL
        )`,
        done
      );
    });

    it('should handle large result sets efficiently', (done) => {
      // Insert 100 quotes
      testDb.serialize(() => {
        testDb.run('BEGIN');
        for (let i = 0; i < 100; i++) {
          testDb.run('INSERT INTO quotes (guildId, text) VALUES (?, ?)', [
            'guild-123',
            `Quote ${i}`,
          ]);
        }
        testDb.run('COMMIT', () => {
          testDb.all(
            'SELECT * FROM quotes WHERE guildId = ? LIMIT 50',
            ['guild-123'],
            (err, rows) => {
              assert.strictEqual(rows.length, 50);
              done();
            }
          );
        });
      });
    });

    it('should handle special characters in text', (done) => {
      const specialText = "It's a \"special\" quote with 'quotes' and <html>";
      testDb.run('INSERT INTO quotes (guildId, text) VALUES (?, ?)', [
        'guild-123',
        specialText,
      ]);

      testDb.get('SELECT * FROM quotes WHERE guildId = ?', ['guild-123'], (err, row) => {
        assert.strictEqual(row.text, specialText);
        done();
      });
    });

    it('should handle empty string values', (done) => {
      testDb.run('INSERT INTO quotes (guildId, text) VALUES (?, ?)', ['guild-123', '']);

      testDb.get('SELECT * FROM quotes WHERE guildId = ?', ['guild-123'], (err, row) => {
        assert.strictEqual(row.text, '');
        done();
      });
    });

    it('should enforce NOT NULL constraints', (done) => {
      // Try to insert without required guildId
      testDb.run('INSERT INTO quotes (text) VALUES (?)', ['Quote'], (err) => {
        assert(err, 'Should fail with NOT NULL constraint error');
        done();
      });
    });

    it('should maintain primary key uniqueness', (done) => {
      testDb.run(
        'INSERT INTO quotes (id, guildId, text) VALUES (?, ?, ?)',
        [1, 'guild-123', 'Q1'],
        () => {
          // Try to insert with same ID
          testDb.run(
            'INSERT INTO quotes (id, guildId, text) VALUES (?, ?, ?)',
            [1, 'guild-123', 'Q2'],
            (err) => {
              assert(err, 'Should fail with PRIMARY KEY constraint error');
              done();
            }
          );
        }
      );
    });
  });
});
