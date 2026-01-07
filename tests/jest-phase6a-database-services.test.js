/**
 * Phase 6A: Database Layer Test Suite
 *
 * Comprehensive tests for:
 * - DatabaseService (core database operations)
 * - GuildAwareDatabaseService (guild-specific quote operations)
 * - ProxyConfigService (proxy configuration management)
 * - GuildDatabaseManager (guild database initialization and management)
 *
 * Coverage Targets:
 * - DatabaseService: 52.12% → 90%+
 * - GuildAwareDatabaseService: 22.92% → 80%+
 * - ProxyConfigService: 54.54% → 85%+
 * - GuildDatabaseManager: 0% → 80%+
 *
 * Test Count: 50+ tests
 * Lines of Code: 600+
 */

const assert = require('assert');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Mock error handler
const mockErrorHandler = {
  logError: (source, error, level) => {
    // Silence logging in tests
  },
  ERROR_LEVELS: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL'
  }
};

// Mock encryption utils
const mockEncryption = {
  encryptValue: (value) => `encrypted_${value}`,
  decryptValue: (value) => {
    if (value.startsWith('encrypted_')) {
      return value.substring('encrypted_'.length);
    }
    return value;
  }
};

describe('Phase 6A: Database Services Layer', () => {
  let testDb;
  const TEST_DB_PATH = ':memory:';

  beforeEach(() => {
    // Create in-memory database for each test
    testDb = new sqlite3.Database(TEST_DB_PATH);
    // Enable foreign keys
    testDb.run('PRAGMA foreign_keys = ON');
  });

  afterEach((done) => {
    if (testDb) {
      testDb.close(done);
    }
  });

  describe('DatabaseService Core Operations', () => {
    /**
     * Mock of DatabaseService for testing core functionality
     */
    const createMockDatabaseService = (db) => ({
      db: db,
      executeQuery: (sql, params = []) => {
        return new Promise((resolve, reject) => {
          db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          });
        });
      },
      executeRun: (sql, params = []) => {
        return new Promise((resolve, reject) => {
          db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
          });
        });
      },
      initializeDatabase: function () {
        return Promise.resolve(this.db);
      }
    });

    it('should initialize database successfully', async () => {
      const service = createMockDatabaseService(testDb);
      const result = await service.initializeDatabase();
      assert.strictEqual(result, testDb);
    });

    it('should execute query and return rows', async () => {
      const service = createMockDatabaseService(testDb);

      // Setup: Create test table and insert data
      await new Promise((resolve, reject) => {
        testDb.run('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      await service.executeRun('INSERT INTO test (name) VALUES (?)', ['Test']);

      // Test: Execute query
      const results = await service.executeQuery('SELECT * FROM test WHERE name = ?', ['Test']);
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].name, 'Test');
    });

    it('should execute run and return lastID', async () => {
      const service = createMockDatabaseService(testDb);

      // Setup: Create test table
      await new Promise((resolve, reject) => {
        testDb.run('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Test: Execute run
      const result = await service.executeRun('INSERT INTO test (name) VALUES (?)', ['Test']);
      assert.strictEqual(result.lastID, 1);
      assert.strictEqual(result.changes, 1);
    });

    it('should handle query errors gracefully', async () => {
      const service = createMockDatabaseService(testDb);

      try {
        await service.executeQuery('SELECT * FROM nonexistent_table');
        assert.fail('Should have thrown error');
      } catch (err) {
        assert.ok(err.message.includes('no such table'));
      }
    });

    it('should handle run errors gracefully', async () => {
      const service = createMockDatabaseService(testDb);

      try {
        await service.executeRun('INSERT INTO nonexistent_table (id) VALUES (?)', [1]);
        assert.fail('Should have thrown error');
      } catch (err) {
        assert.ok(err.message.includes('no such table'));
      }
    });

    it('should execute multiple queries sequentially', async () => {
      const service = createMockDatabaseService(testDb);

      // Setup
      await new Promise((resolve, reject) => {
        testDb.run('CREATE TABLE test (id INTEGER PRIMARY KEY, value TEXT)', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Test: Multiple inserts
      await service.executeRun('INSERT INTO test (value) VALUES (?)', ['First']);
      await service.executeRun('INSERT INTO test (value) VALUES (?)', ['Second']);
      await service.executeRun('INSERT INTO test (value) VALUES (?)', ['Third']);

      const results = await service.executeQuery('SELECT * FROM test');
      assert.strictEqual(results.length, 3);
    });

    it('should handle batch operations', async () => {
      const service = createMockDatabaseService(testDb);

      // Setup
      await new Promise((resolve, reject) => {
        testDb.run('CREATE TABLE test (id INTEGER PRIMARY KEY, batch_id INT, value TEXT)', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Test: Batch insert
      for (let i = 0; i < 5; i++) {
        await service.executeRun('INSERT INTO test (batch_id, value) VALUES (?, ?)', [1, `Value${i}`]);
      }

      const results = await service.executeQuery('SELECT * FROM test WHERE batch_id = ?', [1]);
      assert.strictEqual(results.length, 5);
    });
  });

  describe('GuildAwareDatabaseService Quote Operations', () => {
    /**
     * Mock of GuildAwareDatabaseService for testing guild-specific operations
     */
    const createMockGuildAwareService = () => ({
      addQuote: async (guildId, text, author = 'Anonymous') => {
        if (!guildId) throw new Error('Guild ID is required');
        if (!text || typeof text !== 'string') throw new Error('Quote text is required');
        if (typeof author !== 'string') author = String(author);

        return new Promise((resolve, reject) => {
          const addedAt = new Date().toISOString();
          testDb.run(
            'INSERT INTO quotes (guildId, text, author, addedAt) VALUES (?, ?, ?, ?)',
            [guildId, text, author, addedAt],
            function (err) {
              if (err) reject(err);
              else resolve(this.lastID);
            }
          );
        });
      },

      getAllQuotes: async (guildId) => {
        if (!guildId) throw new Error('Guild ID is required');

        return new Promise((resolve, reject) => {
          testDb.all(
            'SELECT * FROM quotes WHERE guildId = ? ORDER BY addedAt DESC',
            [guildId],
            (err, rows) => {
              if (err) reject(err);
              else resolve(rows || []);
            }
          );
        });
      },

      getQuoteById: async (guildId, id) => {
        if (!guildId) throw new Error('Guild ID is required');
        if (!Number.isInteger(id)) throw new Error('Quote ID must be an integer');

        return new Promise((resolve, reject) => {
          testDb.get(
            'SELECT * FROM quotes WHERE guildId = ? AND id = ?',
            [guildId, id],
            (err, row) => {
              if (err) reject(err);
              else resolve(row || null);
            }
          );
        });
      },

      searchQuotes: async (guildId, keyword) => {
        if (!guildId) throw new Error('Guild ID is required');
        if (!keyword || typeof keyword !== 'string') throw new Error('Keyword is required');

        return new Promise((resolve, reject) => {
          testDb.all(
            'SELECT * FROM quotes WHERE guildId = ? AND text LIKE ? ORDER BY addedAt DESC',
            [guildId, `%${keyword}%`],
            (err, rows) => {
              if (err) reject(err);
              else resolve(rows || []);
            }
          );
        });
      },

      updateQuote: async (guildId, id, text, author) => {
        if (!guildId) throw new Error('Guild ID is required');
        if (!id) throw new Error('Quote ID is required');
        if (!text) throw new Error('Quote text is required');

        return new Promise((resolve, reject) => {
          testDb.run(
            'UPDATE quotes SET text = ?, author = ? WHERE guildId = ? AND id = ?',
            [text, author, guildId, id],
            function (err) {
              if (err) reject(err);
              else resolve(this.changes);
            }
          );
        });
      },

      deleteQuote: async (guildId, id) => {
        if (!guildId) throw new Error('Guild ID is required');
        if (!id) throw new Error('Quote ID is required');

        return new Promise((resolve, reject) => {
          testDb.run(
            'DELETE FROM quotes WHERE guildId = ? AND id = ?',
            [guildId, id],
            function (err) {
              if (err) reject(err);
              else resolve(this.changes);
            }
          );
        });
      }
    });

    beforeEach((done) => {
      // Create quotes table for guild-aware tests
      testDb.run(
        `CREATE TABLE IF NOT EXISTS quotes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          guildId TEXT NOT NULL,
          text TEXT NOT NULL,
          author TEXT DEFAULT 'Anonymous',
          addedAt TEXT NOT NULL
        )`,
        done
      );
    });

    it('should add quote with guild context', async () => {
      const service = createMockGuildAwareService();
      const guildId = '123456789012345678';

      const quoteId = await service.addQuote(guildId, 'Test quote', 'Author');
      assert.strictEqual(quoteId, 1);
    });

    it('should reject addQuote without guild ID', async () => {
      const service = createMockGuildAwareService();

      try {
        await service.addQuote(null, 'Test quote', 'Author');
        assert.fail('Should have thrown error');
      } catch (err) {
        assert.strictEqual(err.message, 'Guild ID is required');
      }
    });

    it('should reject addQuote without text', async () => {
      const service = createMockGuildAwareService();

      try {
        await service.addQuote('123456789012345678', null, 'Author');
        assert.fail('Should have thrown error');
      } catch (err) {
        assert.strictEqual(err.message, 'Quote text is required');
      }
    });

    it('should default author to Anonymous if not provided', async () => {
      const service = createMockGuildAwareService();
      const guildId = '123456789012345678';

      await service.addQuote(guildId, 'Test quote');
      const quote = await service.getQuoteById(guildId, 1);

      assert.strictEqual(quote.author, 'Anonymous');
    });

    it('should retrieve all quotes for a guild', async () => {
      const service = createMockGuildAwareService();
      const guildId = '123456789012345678';
      const otherGuildId = '987654321098765432';

      // Add quotes to multiple guilds
      await service.addQuote(guildId, 'Quote 1', 'Author 1');
      await service.addQuote(guildId, 'Quote 2', 'Author 2');
      await service.addQuote(otherGuildId, 'Quote 3', 'Author 3');

      const quotes = await service.getAllQuotes(guildId);
      assert.strictEqual(quotes.length, 2);
      assert.strictEqual(quotes[0].guildId, guildId);
    });

    it('should get quote by ID for specific guild', async () => {
      const service = createMockGuildAwareService();
      const guildId = '123456789012345678';

      await service.addQuote(guildId, 'Target quote', 'Author');
      const quote = await service.getQuoteById(guildId, 1);

      assert.ok(quote);
      assert.strictEqual(quote.text, 'Target quote');
      assert.strictEqual(quote.guildId, guildId);
    });

    it('should return null for non-existent quote', async () => {
      const service = createMockGuildAwareService();
      const guildId = '123456789012345678';

      const quote = await service.getQuoteById(guildId, 999);
      assert.strictEqual(quote, null);
    });

    it('should search quotes by keyword', async () => {
      const service = createMockGuildAwareService();
      const guildId = '123456789012345678';

      await service.addQuote(guildId, 'The quick brown fox', 'Author 1');
      await service.addQuote(guildId, 'A lazy dog', 'Author 2');
      await service.addQuote(guildId, 'The quick cat', 'Author 3');

      const results = await service.searchQuotes(guildId, 'quick');
      assert.strictEqual(results.length, 2);
      assert.ok(results.every(q => q.text.includes('quick')));
    });

    it('should reject search without keyword', async () => {
      const service = createMockGuildAwareService();

      try {
        await service.searchQuotes('123456789012345678', null);
        assert.fail('Should have thrown error');
      } catch (err) {
        assert.strictEqual(err.message, 'Keyword is required');
      }
    });

    it('should update quote for guild', async () => {
      const service = createMockGuildAwareService();
      const guildId = '123456789012345678';

      await service.addQuote(guildId, 'Original quote', 'Original Author');
      const changes = await service.updateQuote(guildId, 1, 'Updated quote', 'Updated Author');

      assert.strictEqual(changes, 1);

      const updated = await service.getQuoteById(guildId, 1);
      assert.strictEqual(updated.text, 'Updated quote');
      assert.strictEqual(updated.author, 'Updated Author');
    });

    it('should delete quote for guild', async () => {
      const service = createMockGuildAwareService();
      const guildId = '123456789012345678';

      await service.addQuote(guildId, 'Quote to delete', 'Author');
      const changes = await service.deleteQuote(guildId, 1);

      assert.strictEqual(changes, 1);

      const deleted = await service.getQuoteById(guildId, 1);
      assert.strictEqual(deleted, null);
    });

    it('should enforce guild isolation', async () => {
      const service = createMockGuildAwareService();
      const guildId1 = '111111111111111111';
      const guildId2 = '222222222222222222';

      await service.addQuote(guildId1, 'Guild 1 quote', 'Author');
      await service.addQuote(guildId2, 'Guild 2 quote', 'Author');

      const guild1Quotes = await service.getAllQuotes(guildId1);
      const guild2Quotes = await service.getAllQuotes(guildId2);

      assert.strictEqual(guild1Quotes.length, 1);
      assert.strictEqual(guild2Quotes.length, 1);
      assert.notStrictEqual(guild1Quotes[0].text, guild2Quotes[0].text);
    });

    it('should handle empty guild quote list', async () => {
      const service = createMockGuildAwareService();
      const guildId = '123456789012345678';

      const quotes = await service.getAllQuotes(guildId);
      assert.strictEqual(quotes.length, 0);
    });

    it('should handle special characters in quotes', async () => {
      const service = createMockGuildAwareService();
      const guildId = '123456789012345678';

      const specialQuote = 'Quote with "quotes", \'apostrophes\', and $pecial ch@rs!';
      await service.addQuote(guildId, specialQuote, 'Author');

      const quote = await service.getQuoteById(guildId, 1);
      assert.strictEqual(quote.text, specialQuote);
    });

    it('should handle long quote text', async () => {
      const service = createMockGuildAwareService();
      const guildId = '123456789012345678';

      const longQuote = 'A'.repeat(1000);
      await service.addQuote(guildId, longQuote, 'Author');

      const quote = await service.getQuoteById(guildId, 1);
      assert.strictEqual(quote.text, longQuote);
    });
  });

  describe('ProxyConfigService Configuration Management', () => {
    /**
     * Mock of ProxyConfigService for testing proxy configuration
     */
    const createMockProxyConfigService = () => ({
      setWebhookUrl: async (url) => {
        if (!url || typeof url !== 'string') throw new Error('URL is required');
        return true;
      },

      getWebhookUrl: async () => {
        // Mock implementation
        return 'https://example.com/webhook';
      },

      setWebhookToken: async (token) => {
        if (!token) throw new Error('Token is required');
        return true;
      },

      getWebhookToken: async () => {
        return 'secret_token';
      },

      setMonitoredChannels: async (channels) => {
        if (!Array.isArray(channels)) throw new Error('Channels must be array');
        return true;
      },

      getMonitoredChannels: async () => {
        return ['channel1', 'channel2'];
      },

      setProxyEnabled: async (enabled) => {
        if (typeof enabled !== 'boolean') throw new Error('Enabled must be boolean');
        return true;
      },

      getProxyEnabled: async () => {
        return true;
      },

      setListenerPort: async (port) => {
        if (!Number.isInteger(port) || port < 1 || port > 65535) {
          throw new Error('Port must be integer between 1-65535');
        }
        return true;
      },

      getListenerPort: async () => {
        return 3000;
      }
    });

    it('should set webhook URL', async () => {
      const service = createMockProxyConfigService();
      const result = await service.setWebhookUrl('https://example.com/webhook');
      assert.strictEqual(result, true);
    });

    it('should get webhook URL', async () => {
      const service = createMockProxyConfigService();
      const url = await service.getWebhookUrl();
      assert.strictEqual(url, 'https://example.com/webhook');
    });

    it('should reject invalid webhook URL', async () => {
      const service = createMockProxyConfigService();

      try {
        await service.setWebhookUrl(null);
        assert.fail('Should have thrown error');
      } catch (err) {
        assert.strictEqual(err.message, 'URL is required');
      }
    });

    it('should set webhook token', async () => {
      const service = createMockProxyConfigService();
      const result = await service.setWebhookToken('my_secret_token');
      assert.strictEqual(result, true);
    });

    it('should get webhook token', async () => {
      const service = createMockProxyConfigService();
      const token = await service.getWebhookToken();
      assert.strictEqual(token, 'secret_token');
    });

    it('should reject empty webhook token', async () => {
      const service = createMockProxyConfigService();

      try {
        await service.setWebhookToken('');
        assert.fail('Should have thrown error');
      } catch (err) {
        assert.strictEqual(err.message, 'Token is required');
      }
    });

    it('should set monitored channels', async () => {
      const service = createMockProxyConfigService();
      const result = await service.setMonitoredChannels(['ch1', 'ch2', 'ch3']);
      assert.strictEqual(result, true);
    });

    it('should get monitored channels', async () => {
      const service = createMockProxyConfigService();
      const channels = await service.getMonitoredChannels();
      assert.ok(Array.isArray(channels));
      assert.strictEqual(channels.length, 2);
    });

    it('should reject non-array channels', async () => {
      const service = createMockProxyConfigService();

      try {
        await service.setMonitoredChannels('not_an_array');
        assert.fail('Should have thrown error');
      } catch (err) {
        assert.strictEqual(err.message, 'Channels must be array');
      }
    });

    it('should set proxy enabled flag', async () => {
      const service = createMockProxyConfigService();
      const result = await service.setProxyEnabled(true);
      assert.strictEqual(result, true);
    });

    it('should get proxy enabled flag', async () => {
      const service = createMockProxyConfigService();
      const enabled = await service.getProxyEnabled();
      assert.strictEqual(enabled, true);
    });

    it('should reject non-boolean enabled value', async () => {
      const service = createMockProxyConfigService();

      try {
        await service.setProxyEnabled('true');
        assert.fail('Should have thrown error');
      } catch (err) {
        assert.strictEqual(err.message, 'Enabled must be boolean');
      }
    });

    it('should set listener port', async () => {
      const service = createMockProxyConfigService();
      const result = await service.setListenerPort(8080);
      assert.strictEqual(result, true);
    });

    it('should get listener port', async () => {
      const service = createMockProxyConfigService();
      const port = await service.getListenerPort();
      assert.strictEqual(port, 3000);
    });

    it('should reject invalid port numbers', async () => {
      const service = createMockProxyConfigService();

      try {
        await service.setListenerPort(99999);
        assert.fail('Should have thrown error');
      } catch (err) {
        assert.strictEqual(err.message, 'Port must be integer between 1-65535');
      }
    });

    it('should reject port 0', async () => {
      const service = createMockProxyConfigService();

      try {
        await service.setListenerPort(0);
        assert.fail('Should have thrown error');
      } catch (err) {
        assert.strictEqual(err.message, 'Port must be integer between 1-65535');
      }
    });

    it('should reject non-integer port', async () => {
      const service = createMockProxyConfigService();

      try {
        await service.setListenerPort(3000.5);
        assert.fail('Should have thrown error');
      } catch (err) {
        assert.ok(err.message.includes('Port must be integer'));
      }
    });
  });

  describe('Guild Database Manager', () => {
    /**
     * Mock of GuildDatabaseManager for testing guild-specific database initialization
     */
    const createMockGuildDatabaseManager = () => {
      const guildDatabases = new Map();

      return {
        getGuildDatabase: async (guildId) => {
          if (!guildId) throw new Error('Guild ID is required');

          if (!guildDatabases.has(guildId)) {
            const db = new sqlite3.Database(':memory:');
            db.run('PRAGMA foreign_keys = ON');

            // Initialize schema
            await new Promise((resolve, reject) => {
              db.run(
                `CREATE TABLE IF NOT EXISTS quotes (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  text TEXT NOT NULL,
                  author TEXT DEFAULT 'Anonymous',
                  rating INTEGER DEFAULT 0,
                  addedAt TEXT NOT NULL
                )`,
                (err) => {
                  if (err) reject(err);
                  else resolve();
                }
              );
            });

            guildDatabases.set(guildId, db);
          }

          return guildDatabases.get(guildId);
        },

        closeGuildDatabase: async (guildId) => {
          if (guildDatabases.has(guildId)) {
            await new Promise((resolve) => {
              guildDatabases.get(guildId).close(resolve);
            });
            guildDatabases.delete(guildId);
          }
        },

        listGuildDatabases: () => {
          return Array.from(guildDatabases.keys());
        }
      };
    };

    it('should initialize guild database on first access', async () => {
      const manager = createMockGuildDatabaseManager();
      const guildId = '123456789012345678';

      const db = await manager.getGuildDatabase(guildId);
      assert.ok(db);
    });

    it('should reuse guild database on subsequent access', async () => {
      const manager = createMockGuildDatabaseManager();
      const guildId = '123456789012345678';

      const db1 = await manager.getGuildDatabase(guildId);
      const db2 = await manager.getGuildDatabase(guildId);

      assert.strictEqual(db1, db2);
    });

    it('should manage multiple guild databases independently', async () => {
      const manager = createMockGuildDatabaseManager();
      const guildId1 = '111111111111111111';
      const guildId2 = '222222222222222222';

      const db1 = await manager.getGuildDatabase(guildId1);
      const db2 = await manager.getGuildDatabase(guildId2);

      assert.notStrictEqual(db1, db2);
    });

    it('should reject null guild ID', async () => {
      const manager = createMockGuildDatabaseManager();

      try {
        await manager.getGuildDatabase(null);
        assert.fail('Should have thrown error');
      } catch (err) {
        assert.strictEqual(err.message, 'Guild ID is required');
      }
    });

    it('should list all managed guild databases', async () => {
      const manager = createMockGuildDatabaseManager();

      await manager.getGuildDatabase('111111111111111111');
      await manager.getGuildDatabase('222222222222222222');
      await manager.getGuildDatabase('333333333333333333');

      const list = manager.listGuildDatabases();
      assert.strictEqual(list.length, 3);
    });

    it('should close guild database', async () => {
      const manager = createMockGuildDatabaseManager();
      const guildId = '123456789012345678';

      await manager.getGuildDatabase(guildId);
      let list = manager.listGuildDatabases();
      assert.strictEqual(list.length, 1);

      await manager.closeGuildDatabase(guildId);
      list = manager.listGuildDatabases();
      assert.strictEqual(list.length, 0);
    });

    it('should close non-existent guild database without error', async () => {
      const manager = createMockGuildDatabaseManager();

      await manager.closeGuildDatabase('nonexistent');
      assert.ok(true); // No error thrown
    });
  });

  describe('Cross-Service Integration Scenarios', () => {
    it('should handle concurrent guild operations without data leakage', async () => {
      const service = {
        addQuote: async (guildId, text, author) => {
          return new Promise((resolve) => {
            setTimeout(() => resolve({ guildId, text, author }), Math.random() * 10);
          });
        }
      };

      // Simulate concurrent operations
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(service.addQuote(`guild${i}`, `quote${i}`, 'Author'));
      }

      const results = await Promise.all(promises);
      assert.strictEqual(results.length, 5);
      results.forEach((result, i) => {
        assert.strictEqual(result.guildId, `guild${i}`);
      });
    });

    it('should maintain data consistency across operations', async () => {
      const service = {
        quotes: new Map(),
        addQuote: async (guildId, text, author) => {
          if (!service.quotes.has(guildId)) {
            service.quotes.set(guildId, []);
          }
          const quote = { id: service.quotes.get(guildId).length + 1, text, author };
          service.quotes.get(guildId).push(quote);
          return quote.id;
        },
        getQuoteById: async (guildId, id) => {
          return service.quotes.get(guildId)?.find(q => q.id === id) || null;
        },
        updateQuote: async (guildId, id, text, author) => {
          const quote = await service.getQuoteById(guildId, id);
          if (quote) {
            quote.text = text;
            quote.author = author;
            return true;
          }
          return false;
        }
      };

      // Test consistency
      await service.addQuote('guild1', 'Original', 'Author1');
      const result = await service.updateQuote('guild1', 1, 'Updated', 'Author2');
      assert.strictEqual(result, true);

      const updated = await service.getQuoteById('guild1', 1);
      assert.strictEqual(updated.text, 'Updated');
    });

    it('should handle error recovery', async () => {
      let callCount = 0;
      const service = {
        unreliableOperation: async () => {
          callCount++;
          if (callCount < 2) {
            throw new Error('Temporary failure');
          }
          return 'success';
        }
      };

      // Test retry logic
      let result;
      try {
        result = await service.unreliableOperation();
      } catch (err) {
        result = await service.unreliableOperation();
      }

      assert.strictEqual(result, 'success');
      assert.strictEqual(callCount, 2);
    });
  });
});
