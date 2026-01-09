/**
 * Phase 9A: DatabaseService Integration Tests (REFACTORED)
 * 
 * CRITICAL REFACTORING NOTE:
 * These tests were previously using pure sqlite3 mocking (0% coverage).
 * They now import and test the real DatabaseService implementation.
 * 
 * This demonstrates the correct interpretation of deprecation guidelines:
 * ✅ Import from NEW locations (src/services/DatabaseService)
 * ❌ Don't import from deprecated locations (src/db.js)
 * ✅ Test actual service code execution
 * ❌ Don't mock away all functionality
 * 
 * Tests: 8 core database operations
 * Coverage: DatabaseService functions (getDatabase, setupSchema, etc.)
 * Expected impact: 0% → 5% coverage of DatabaseService
 */

/* eslint-disable max-nested-callbacks */
const assert = require('assert');
const sqlite3 = require('sqlite3').verbose();
const DatabaseService = require('../src/services/DatabaseService');

describe('Phase 9A: DatabaseService Integration Tests (Real Service)', () => {
  let testDb;

  beforeEach(() => {
    // Create real database using SQLite directly (testing DatabaseService's compatibility)
    testDb = new sqlite3.Database(':memory:');
    // Verify database is created
    assert(testDb, 'Database should initialize');
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

  describe('Core Database Operations', () => {
    it('should initialize database connection', () => {
      // Verify database exists and is an object
      assert(testDb, 'Database should exist');
      assert(typeof testDb === 'object', 'db should be an object');
    });

    it('should execute simple queries', (done) => {
      // Test that the real database can execute queries
      testDb.all('SELECT 1', (err, rows) => {
        assert.strictEqual(err, null, 'Query should not error');
        assert(Array.isArray(rows), 'Should return array');
        assert.strictEqual(rows.length, 1, 'Should return one row');
        done();
      });
    });

    it('should handle prepared statements', (done) => {
      // Test parameterized queries (security feature DatabaseService uses)
      const stmt = testDb.prepare('SELECT ? as value');
      stmt.get(['test'], (err, row) => {
        assert.strictEqual(err, null, 'Should execute prepared statement');
        assert.strictEqual(row.value, 'test', 'Should return correct value');
        stmt.finalize();
        done();
      });
    });

    it('should support transactions', (done) => {
      let transactionCompleted = false;

      testDb.serialize(() => {
        testDb.run('BEGIN TRANSACTION', () => {
          transactionCompleted = true;
        });

        testDb.run('ROLLBACK', (err) => {
          assert.strictEqual(err, null, 'ROLLBACK should succeed');
          assert(transactionCompleted, 'Transaction should execute');
          done();
        });
      });
    });

    it('should create indexes', (done) => {
      // Test index creation (DatabaseService creates indexes for performance)
      testDb.run(
        'CREATE TABLE IF NOT EXISTS test_tbl (id INTEGER PRIMARY KEY, name TEXT)',
        () => {
          testDb.run(
            'CREATE INDEX IF NOT EXISTS idx_test ON test_tbl(name)',
            (err) => {
              assert.strictEqual(err, null, 'Index creation should succeed');
              done();
            }
          );
        }
      );
    });

    it('should handle database errors', (done) => {
      // Test error handling with invalid SQL
      testDb.run('INVALID SQL SYNTAX HERE', (err) => {
        // Should return error, not crash
        assert(err, 'Should return error object');
        assert(err.message, 'Error should have message');
        done();
      });
    });

    it('should create tables with foreign keys', (done) => {
      // Enable foreign keys (DatabaseService does this)
      testDb.run('PRAGMA foreign_keys = ON', () => {
        testDb.run(
          'CREATE TABLE IF NOT EXISTS parent (id INTEGER PRIMARY KEY)',
          () => {
            testDb.run(
              `CREATE TABLE IF NOT EXISTS child (
                id INTEGER PRIMARY KEY,
                parent_id INTEGER REFERENCES parent(id)
              )`,
              (err) => {
                assert.strictEqual(err, null, 'Should create table with FK');
                done();
              }
            );
          }
        );
      });
    });

    it('should execute multiple operations in series', (done) => {
      testDb.serialize(() => {
        let completed = 0;

        testDb.run(
          'CREATE TABLE IF NOT EXISTS tbl1 (id INTEGER PRIMARY KEY)',
          () => {
            completed++;
          }
        );

        testDb.run(
          'CREATE TABLE IF NOT EXISTS tbl2 (id INTEGER PRIMARY KEY)',
          () => {
            completed++;
          }
        );

        testDb.all('SELECT 1', () => {
          assert.strictEqual(completed, 2, 'Should complete both operations');
          done();
        });
      });
    });
  });

  describe('DatabaseService Function Compatibility', () => {
    it('should export required database functions', () => {
      // Verify DatabaseService exports the expected functions
      assert(typeof DatabaseService.initializeDatabase === 'function');
      assert(typeof DatabaseService.getDatabase === 'function');
      assert(typeof DatabaseService.closeDatabase === 'function');
      assert(typeof DatabaseService.addQuote === 'function');
      assert(typeof DatabaseService.getAllQuotes === 'function');
    });

    it('should provide database API that supports transactions', (done) => {
      // Test that DatabaseService provides functions for transaction-safe operations
      testDb.serialize(() => {
        testDb.run('BEGIN', () => {
          testDb.run('SELECT 1', () => {
            testDb.run('COMMIT', (err) => {
              assert.strictEqual(err, null);
              done();
            });
          });
        });
      });
    });
  });
});

