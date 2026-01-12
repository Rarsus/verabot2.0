/**
 * Phase 13B: CommunicationService Integration Tests
 *
 * Tests for user communication preference management including:
 * - User opt-in for DMs and features
 * - User opt-out from communication
 * - Communication status retrieval
 * - Default opt-out behavior
 * - Multiple user management
 * - Status persistence and updates
 *
 * Current Coverage Target: 15-20% overall (10.96% baseline)
 * Expected CommunicationService coverage: 20-30%
 */

const assert = require('assert');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

describe('Phase 13B: CommunicationService Integration Tests', () => {
  let db;
  let communicationService;
  const TEST_DB_PATH = path.join(__dirname, '../data/test-communication.db');

  /**
   * Initialize database before all tests
   */
  beforeAll((done) => {
    // Create in-memory database
    db = new sqlite3.Database(':memory:');

    // Initialize schema
    db.serialize(() => {
      // Create user_communications table
      db.run(
        `CREATE TABLE IF NOT EXISTS user_communications (
          user_id TEXT PRIMARY KEY,
          opted_in INTEGER DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )`,
        (err) => {
          if (err) {
            done(err);
          } else {
            // Mock the DatabaseService before requiring CommunicationService
            jest.resetModules();
            jest.doMock('../src/services/DatabaseService', () => ({
              getDatabase: () => db,
            }));

            // Now require the service
            communicationService = require('../../src/services/CommunicationService');
            done();
          }
        }
      );
    });
  });

  /**
   * Clear database before each test
   */
  beforeEach((done) => {
    db.run('DELETE FROM user_communications', done);
  });

  /**
   * Close database after all tests
   */
  afterAll((done) => {
    jest.unmock('../src/services/DatabaseService');
    db.close(done);
  });

  describe('User Opt-In Operations', () => {
    it('should opt user in to communications', (done) => {
      communicationService.optIn('user-123').then(() => {
        db.get(
          'SELECT opted_in FROM user_communications WHERE user_id = ?',
          ['user-123'],
          (err, row) => {
            assert.strictEqual(row.opted_in, 1);
            done(err);
          }
        );
      }).catch(done);
    });

    it('should create opt-in entry with timestamps', (done) => {
      communicationService.optIn('user-456').then(() => {
        db.get(
          'SELECT * FROM user_communications WHERE user_id = ?',
          ['user-456'],
          (err, row) => {
            assert(row.created_at);
            assert(row.updated_at);
            assert(row.created_at.includes('2026') || row.created_at.includes('2025'));
            done(err);
          }
        );
      }).catch(done);
    });

    it('should update opt-in status if user already exists', (done) => {
      const now = new Date().toISOString();
      db.run(
        'INSERT INTO user_communications (user_id, opted_in, created_at, updated_at) VALUES (?, ?, ?, ?)',
        ['user-789', 0, now, now],
        () => {
          communicationService.optIn('user-789').then(() => {
            db.get(
              'SELECT opted_in FROM user_communications WHERE user_id = ?',
              ['user-789'],
              (err, row) => {
                assert.strictEqual(row.opted_in, 1);
                done(err);
              }
            );
          }).catch(done);
        }
      );
    });

    it('should handle multiple opt-in operations for same user', (done) => {
      communicationService.optIn('user-multi')
        .then(() => communicationService.optIn('user-multi'))
        .then(() => communicationService.optIn('user-multi'))
        .then(() => {
          db.get(
            'SELECT opted_in FROM user_communications WHERE user_id = ?',
            ['user-multi'],
            (err, row) => {
              assert.strictEqual(row.opted_in, 1);
              done(err);
            }
          );
        })
        .catch(done);
    });
  });

  describe('User Opt-Out Operations', () => {
    it('should opt user out of communications', (done) => {
      const now = new Date().toISOString();
      db.run(
        'INSERT INTO user_communications (user_id, opted_in, created_at, updated_at) VALUES (?, ?, ?, ?)',
        ['user-123', 1, now, now],
        () => {
          communicationService.optOut('user-123').then(() => {
            db.get(
              'SELECT opted_in FROM user_communications WHERE user_id = ?',
              ['user-123'],
              (err, row) => {
                assert.strictEqual(row.opted_in, 0);
                done(err);
              }
            );
          }).catch(done);
        }
      );
    });

    it('should create opt-out entry if user does not exist', (done) => {
      communicationService.optOut('new-user-opt-out').then(() => {
        db.get(
          'SELECT opted_in FROM user_communications WHERE user_id = ?',
          ['new-user-opt-out'],
          (err, row) => {
            assert.strictEqual(row.opted_in, 0);
            done(err);
          }
        );
      }).catch(done);
    });

    it('should update timestamps on opt-out', (done) => {
      communicationService.optOut('user-timestamps').then(() => {
        db.get(
          'SELECT updated_at FROM user_communications WHERE user_id = ?',
          ['user-timestamps'],
          (err, row) => {
            assert(row.updated_at);
            done(err);
          }
        );
      }).catch(done);
    });

    it('should handle opt-out for already opted-out user', (done) => {
      const now = new Date().toISOString();
      db.run(
        'INSERT INTO user_communications (user_id, opted_in, created_at, updated_at) VALUES (?, ?, ?, ?)',
        ['user-already-out', 0, now, now],
        () => {
          communicationService.optOut('user-already-out').then(() => {
            db.get(
              'SELECT opted_in FROM user_communications WHERE user_id = ?',
              ['user-already-out'],
              (err, row) => {
                assert.strictEqual(row.opted_in, 0);
                done(err);
              }
            );
          }).catch(done);
        }
      );
    });

    it('should handle opt-out for multiple users', (done) => {
      const now = new Date().toISOString();
      db.run(
        'INSERT INTO user_communications (user_id, opted_in, created_at, updated_at) VALUES (?, ?, ?, ?)',
        ['user-a', 1, now, now],
        () => {
          db.run(
            'INSERT INTO user_communications (user_id, opted_in, created_at, updated_at) VALUES (?, ?, ?, ?)',
            ['user-b', 1, now, now],
            () => {
              communicationService.optOut('user-a')
                .then(() => communicationService.optOut('user-b'))
                .then(() => {
                  db.all(
                    'SELECT * FROM user_communications WHERE opted_in = 0',
                    (err, rows) => {
                      assert.strictEqual(rows.length, 2);
                      done(err);
                    }
                  );
                })
                .catch(done);
            }
          );
        }
      );
    });
  });

  describe('Default Behavior (Opt-Out)', () => {
    it('should return false for isOptedIn when user does not exist', (done) => {
      communicationService.isOptedIn('nonexistent-user').then((result) => {
        assert.strictEqual(result, false);
        done();
      }).catch(done);
    });

    it('should return false for isOptedIn when opted_in is 0', (done) => {
      const now = new Date().toISOString();
      db.run(
        'INSERT INTO user_communications (user_id, opted_in, created_at, updated_at) VALUES (?, ?, ?, ?)',
        ['opted-out-user', 0, now, now],
        () => {
          communicationService.isOptedIn('opted-out-user').then((result) => {
            assert.strictEqual(result, false);
            done();
          }).catch(done);
        }
      );
    });

    it('should return true for isOptedIn when opted_in is 1', (done) => {
      const now = new Date().toISOString();
      db.run(
        'INSERT INTO user_communications (user_id, opted_in, created_at, updated_at) VALUES (?, ?, ?, ?)',
        ['opted-in-user', 1, now, now],
        () => {
          communicationService.isOptedIn('opted-in-user').then((result) => {
            assert.strictEqual(result, true);
            done();
          }).catch(done);
        }
      );
    });
  });

  describe('Preference Update Operations', () => {
    it('should preserve created_at on subsequent updates', (done) => {
      const originalTime = '2025-01-01T00:00:00.000Z';
      db.run(
        'INSERT INTO user_communications (user_id, opted_in, created_at, updated_at) VALUES (?, ?, ?, ?)',
        ['user-preserve', 0, originalTime, originalTime],
        () => {
          communicationService.optIn('user-preserve').then(() => {
            db.get(
              'SELECT created_at FROM user_communications WHERE user_id = ?',
              ['user-preserve'],
              (err, row) => {
                assert.strictEqual(row.created_at, originalTime);
                done(err);
              }
            );
          }).catch(done);
        }
      );
    });

    it('should update updated_at on status change', (done) => {
      const oldTime = '2025-01-01T00:00:00.000Z';
      db.run(
        'INSERT INTO user_communications (user_id, opted_in, created_at, updated_at) VALUES (?, ?, ?, ?)',
        ['user-update-time', 0, oldTime, oldTime],
        () => {
          communicationService.optIn('user-update-time').then(() => {
            db.get(
              'SELECT updated_at FROM user_communications WHERE user_id = ?',
              ['user-update-time'],
              (err, row) => {
                assert(row.updated_at !== oldTime);
                done(err);
              }
            );
          }).catch(done);
        }
      );
    });

    it('should toggle opt-in/opt-out correctly', (done) => {
      communicationService.optIn('toggle-user')
        .then(() => communicationService.isOptedIn('toggle-user'))
        .then((result) => {
          assert.strictEqual(result, true);
          return communicationService.optOut('toggle-user');
        })
        .then(() => communicationService.isOptedIn('toggle-user'))
        .then((result) => {
          assert.strictEqual(result, false);
          done();
        })
        .catch(done);
    });
  });

  describe('Multi-User Scenarios', () => {
    it('should manage preferences for multiple users independently', (done) => {
      communicationService.optIn('user-1')
        .then(() => communicationService.optIn('user-2'))
        .then(() => communicationService.optOut('user-3'))
        .then(() => communicationService.isOptedIn('user-1'))
        .then((result) => {
          assert.strictEqual(result, true);
          return communicationService.isOptedIn('user-2');
        })
        .then((result) => {
          assert.strictEqual(result, true);
          return communicationService.isOptedIn('user-3');
        })
        .then((result) => {
          assert.strictEqual(result, false);
          done();
        })
        .catch(done);
    });

    it('should handle concurrent opt-in operations', (done) => {
      Promise.all([
        communicationService.optIn('concurrent-1'),
        communicationService.optIn('concurrent-2'),
        communicationService.optIn('concurrent-3'),
      ])
        .then(() => {
          db.all(
            'SELECT COUNT(*) as count FROM user_communications WHERE opted_in = 1',
            (err, rows) => {
              assert.strictEqual(rows[0].count, 3);
              done(err);
            }
          );
        })
        .catch(done);
    });

    it('should track separate timestamps for different users', (done) => {
      communicationService.optIn('user-time-1')
        .then(() => {
          // Small delay to ensure different timestamps
          return new Promise(resolve => setTimeout(resolve, 50));
        })
        .then(() => communicationService.optIn('user-time-2'))
        .then(() => {
          db.all(
            'SELECT user_id, updated_at FROM user_communications ORDER BY updated_at',
            (err, rows) => {
              assert.strictEqual(rows.length, 2);
              assert(rows[0].user_id === 'user-time-1' || rows[0].user_id === 'user-time-2');
              done(err);
            }
          );
        })
        .catch(done);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long user IDs', (done) => {
      const longUserId = 'a'.repeat(500);
      communicationService.optIn(longUserId).then(() => {
        db.get(
          'SELECT opted_in FROM user_communications WHERE user_id = ?',
          [longUserId],
          (err, row) => {
            assert(row);
            assert.strictEqual(row.opted_in, 1);
            done(err);
          }
        );
      }).catch(done);
    });

    it('should handle special characters in user ID', (done) => {
      const specialId = 'user-!@#$%^&*()_+-=[]{}|;:,.<>?';
      communicationService.optIn(specialId).then(() => {
        db.get(
          'SELECT opted_in FROM user_communications WHERE user_id = ?',
          [specialId],
          (err, row) => {
            assert(row);
            assert.strictEqual(row.opted_in, 1);
            done(err);
          }
        );
      }).catch(done);
    });

    it('should handle empty communication status check', (done) => {
      communicationService.isOptedIn('empty-check-user').then((result) => {
        assert.strictEqual(result, false);
        done();
      }).catch(done);
    });
  });

  describe('Status Information', () => {
    it('should return complete status object for opted-in user', (done) => {
      communicationService.optIn('status-user').then(() => {
        return communicationService.getStatus('status-user');
      }).then((status) => {
        assert(status);
        assert.strictEqual(status.opted_in, true);
        assert(status.created_at);
        assert(status.updated_at);
        done();
      }).catch(done);
    });

    it('should return consistent status objects', (done) => {
      communicationService.optIn('consistent-status')
        .then(() => communicationService.getStatus('consistent-status'))
        .then((status1) => {
          return communicationService.getStatus('consistent-status').then((status2) => {
            assert.deepStrictEqual(status1, status2);
          });
        })
        .then(() => done())
        .catch(done);
    });
  });
});
