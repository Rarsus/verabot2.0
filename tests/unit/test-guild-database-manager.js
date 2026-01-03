/**
 * Test Suite: Guild Database Manager
 * Tests multi-database architecture and per-guild operations
 */

const guildManager = require('../../src/services/GuildDatabaseManager');
const path = require('path');
const fs = require('fs');

// Test configuration
const TEST_GUILDS = ['123456789', '987654321', '111222333'];
const TEST_TIMEOUT = 10000;

describe('GuildDatabaseManager - Multi-Database Architecture', () => {
  let manager;

  beforeAll(async () => {
    manager = guildManager;
  });

  afterAll(async () => {
    // Cleanup test databases
    for (const guildId of TEST_GUILDS) {
      try {
        await manager.deleteGuildDatabase(guildId);
      } catch (err) {
        // Ignore errors during cleanup
      }
    }
    // Note: Don't call shutdown on singleton
  });

  describe('Database Connection Management', () => {
    it('should create a new database connection for a guild', async () => {
      const guildId = TEST_GUILDS[0];
      const db = await manager.getGuildDatabase(guildId);

      expect(db).toBeDefined();
      expect(manager.connections.has(guildId)).toBe(true);
    });

    it('should reuse cached connection for same guild', async () => {
      const guildId = TEST_GUILDS[0];
      const db1 = await manager.getGuildDatabase(guildId);
      const db2 = await manager.getGuildDatabase(guildId);

      expect(db1).toBe(db2);
      expect(manager.connections.size).toBe(1);
    });

    it('should create separate databases for different guilds', async () => {
      const guild1 = TEST_GUILDS[0];
      const guild2 = TEST_GUILDS[1];

      const db1 = await manager.getGuildDatabase(guild1);
      const db2 = await manager.getGuildDatabase(guild2);

      expect(db1).not.toBe(db2);
      expect(manager.connections.size).toBe(2);
    });

    it('should throw error for invalid guild ID', async () => {
      await expect(manager.getGuildDatabase(null)).rejects.toThrow('Valid guild ID required');
      await expect(manager.getGuildDatabase('')).rejects.toThrow('Valid guild ID required');
      await expect(manager.getGuildDatabase(123)).rejects.toThrow('Valid guild ID required');
    });

    it('should close guild database connection', async () => {
      const guildId = TEST_GUILDS[2];
      await manager.getGuildDatabase(guildId);
      expect(manager.connections.has(guildId)).toBe(true);

      await manager.closeGuildDatabase(guildId);
      expect(manager.connections.has(guildId)).toBe(false);
    });
  });

  describe('Guild Database Files', () => {
    it('should create guild-specific database file', async () => {
      const guildId = 'test-guild-' + Date.now();
      const db = await manager.getGuildDatabase(guildId);

      const guildDbPath = path.join(manager.guildsDir, guildId, 'quotes.db');
      expect(fs.existsSync(guildDbPath)).toBe(true);

      await manager.deleteGuildDatabase(guildId);
    });

    it('should initialize schema for new guild database', async () => {
      const guildId = 'schema-test-' + Date.now();
      const db = await manager.getGuildDatabase(guildId);

      // Check if tables exist
      const tables = await new Promise((resolve, reject) => {
        db.all(
          "SELECT name FROM sqlite_master WHERE type='table'",
          (err, tables) => {
            if (err) reject(err);
            else resolve(tables || []);
          }
        );
      });

      expect(tables.length).toBeGreaterThan(0);
      expect(tables.some((t) => t.name === 'quotes')).toBe(true);

      await manager.deleteGuildDatabase(guildId);
    });

    it('should get guild database size', async () => {
      const guildId = 'size-test-' + Date.now();
      const db = await manager.getGuildDatabase(guildId);

      const size = manager.getGuildDatabaseSize(guildId);
      expect(size).toBeDefined();
      expect(size.sizeBytes).toBeGreaterThan(0);
      expect(size.sizeMB).toBeDefined();

      await manager.deleteGuildDatabase(guildId);
    });

    it('should list all guild database IDs', async () => {
      const guildId1 = 'list-test-1-' + Date.now();
      const guildId2 = 'list-test-2-' + Date.now();

      await manager.getGuildDatabase(guildId1);
      await manager.getGuildDatabase(guildId2);

      const guildIds = manager.getGuildIds();
      expect(guildIds).toContain(guildId1);
      expect(guildIds).toContain(guildId2);

      await manager.deleteGuildDatabase(guildId1);
      await manager.deleteGuildDatabase(guildId2);
    });
  });

  describe('Data Isolation Between Guilds', () => {
    it('should isolate data between guild databases', async () => {
      const guild1 = 'isolate-test-1-' + Date.now();
      const guild2 = 'isolate-test-2-' + Date.now();

      const db1 = await manager.getGuildDatabase(guild1);
      const db2 = await manager.getGuildDatabase(guild2);

      // Insert data in guild 1
      const insert1 = (sql, params) => {
        return new Promise((resolve, reject) => {
          db1.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this.lastID);
          });
        });
      };

      const id1 = await insert1('INSERT INTO quotes (text, author, addedAt) VALUES (?, ?, ?)', [
        'Guild 1 Quote',
        'Author 1',
        new Date().toISOString()
      ]);

      // Try to find in guild 2
      const findInGuild2 = (sql) => {
        return new Promise((resolve, reject) => {
          db2.get(sql, [], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
      };

      const found = await findInGuild2("SELECT * FROM quotes WHERE text = 'Guild 1 Quote'");
      expect(found).toBeUndefined(); // Should NOT find it in guild 2

      await manager.deleteGuildDatabase(guild1);
      await manager.deleteGuildDatabase(guild2);
    });
  });

  describe('GDPR Compliance - Guild Deletion', () => {
    it('should delete entire guild database and directory', async () => {
      const guildId = 'gdpr-test-' + Date.now();
      const db = await manager.getGuildDatabase(guildId);
      const guildDbPath = path.join(manager.guildsDir, guildId);

      expect(fs.existsSync(guildDbPath)).toBe(true);

      await manager.deleteGuildDatabase(guildId);
      expect(fs.existsSync(guildDbPath)).toBe(false);
      expect(manager.connections.has(guildId)).toBe(false);
    });

    it('should handle deletion of non-existent guild gracefully', async () => {
      const guildId = 'nonexistent-' + Date.now();
      await expect(manager.deleteGuildDatabase(guildId)).resolves.not.toThrow();
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent guild database requests', async () => {
      const promises = [];

      for (let i = 0; i < 5; i++) {
        promises.push(manager.getGuildDatabase('concurrent-test-' + i));
      }

      const dbs = await Promise.all(promises);

      expect(dbs).toHaveLength(5);
      expect(manager.connections.size).toBe(5);

      for (let i = 0; i < 5; i++) {
        await manager.deleteGuildDatabase('concurrent-test-' + i);
      }
    });

    it('should handle concurrent data operations in different guilds', async () => {
      const guilds = ['data-test-1-' + Date.now(), 'data-test-2-' + Date.now()];
      const dbs = [];

      for (const guildId of guilds) {
        dbs.push(await manager.getGuildDatabase(guildId));
      }

      const insertPromises = [];

      for (let i = 0; i < dbs.length; i++) {
        for (let j = 0; j < 3; j++) {
          insertPromises.push(
            new Promise((resolve, reject) => {
              dbs[i].run('INSERT INTO quotes (text, author, addedAt) VALUES (?, ?, ?)', [
                `Guild ${i} Quote ${j}`,
                'Author',
                new Date().toISOString()
              ], function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
              });
            })
          );
        }
      }

      const ids = await Promise.all(insertPromises);
      expect(ids).toHaveLength(6);

      for (const guildId of guilds) {
        await manager.deleteGuildDatabase(guildId);
      }
    });
  });

  describe('Connection Pool Management', () => {
    it('should track connection pool statistics', () => {
      const stats = manager.getPoolStats();

      expect(stats).toHaveProperty('activeConnections');
      expect(stats).toHaveProperty('maxConnections');
      expect(stats).toHaveProperty('connectionTimeout');
      expect(stats).toHaveProperty('utilizationPercent');
      expect(Number(stats.utilizationPercent)).toBeLessThanOrEqual(100);
    });

    it('should prevent exceeding max connections', async () => {
      const GuildDatabaseManager = require('../../src/services/GuildDatabaseManager').constructor;
      const testManager = new GuildDatabaseManager();

      const originalMax = testManager.maxConnections;
      testManager.maxConnections = 2;

      const guild1 = 'max-test-1-' + Date.now();
      const guild2 = 'max-test-2-' + Date.now();
      const guild3 = 'max-test-3-' + Date.now();

      await testManager.getGuildDatabase(guild1);
      await testManager.getGuildDatabase(guild2);

      await expect(testManager.getGuildDatabase(guild3)).rejects.toThrow('Connection pool limit reached');

      testManager.maxConnections = originalMax;

      await testManager.deleteGuildDatabase(guild1);
      await testManager.deleteGuildDatabase(guild2);
    });
  });

  describe('Backup and Restore', () => {
    it('should backup guild database', async () => {
      const guildId = 'backup-test-' + Date.now();
      const backupDir = path.join(__dirname, '../temp/backups');

      const db = await manager.getGuildDatabase(guildId);

      const backupPath = await manager.backupGuildDatabase(guildId, backupDir);

      expect(fs.existsSync(backupPath)).toBe(true);
      expect(backupPath).toContain(guildId);

      // Cleanup
      fs.rmSync(backupDir, { recursive: true, force: true });
      await manager.deleteGuildDatabase(guildId);
    });
  });

  describe('Graceful Shutdown', () => {
    it('should close all connections on shutdown', async () => {
      const GuildDatabaseManager = require('../../src/services/GuildDatabaseManager').constructor;
      const localManager = new GuildDatabaseManager();

      const guild1 = 'shutdown-test-1-' + Date.now();
      const guild2 = 'shutdown-test-2-' + Date.now();

      await localManager.getGuildDatabase(guild1);
      await localManager.getGuildDatabase(guild2);

      expect(localManager.connections.size).toBe(2);

      await localManager.shutdown();

      expect(localManager.connections.size).toBe(0);
    });
  });
});
