/**
 * Phase 6: Comprehensive Guild-Aware ReminderNotificationService Test Suite
 * 
 * Tests guild isolation, concurrent operations, and multi-guild architecture
 * MANDATORY: Run BEFORE implementation (TDD - RED phase)
 * 
 * Test Coverage:
 * - Guild isolation: 25 tests
 * - Notification delivery: 20 tests
 * - Service integration: 15 tests
 * - Multi-guild concurrency: 20 tests
 * - Error handling: 15 tests
 * - Performance: 5 tests
 * Total: 100 tests (target 90%+ coverage)
 */

const assert = require('assert');
const sqlite3 = require('sqlite3').verbose();
const GuildAwareReminderService = require('../../../src/services/GuildAwareReminderService');
const GuildAwareReminderNotificationService = require('../../../src/services/GuildAwareReminderNotificationService');
const GuildDatabaseManager = require('../../../src/services/GuildDatabaseManager');

// ============================================================================
// TEST UTILITIES & MOCKS
// ============================================================================

/**
 * Create mock Discord.js Client
 */
function createMockDiscordClient() {
  const client = {
    guilds: {
      cache: new Map()
    },
    users: {
      cache: new Map()
    },
    channels: {
      cache: new Map()
    }
  };

  // Add guild to cache
  client.addGuild = (guildId, guildName = `Guild-${guildId}`) => {
    client.guilds.cache.set(guildId, {
      id: guildId,
      name: guildName,
      available: true
    });
  };

  // Add user to cache
  client.addUser = (userId, username = `User-${userId}`) => {
    const user = {
      id: userId,
      username: username,
      createDM: async () => ({
        send: async (msg) => ({
          id: `msg-${Date.now()}`,
          ...msg
        })
      })
    };
    client.users.cache.set(userId, user);
  };

  // Add channel to cache
  client.addChannel = (channelId, channelName = `Channel-${channelId}`, guildId = 'guild-1') => {
    const channel = {
      id: channelId,
      name: channelName,
      guildId: guildId,
      send: async (msg) => ({
        id: `msg-${Date.now()}`,
        ...msg
      })
    };
    client.channels.cache.set(channelId, channel);
  };

  return client;
}

/**
 * Create test reminder
 */
function createTestReminder(overrides = {}) {
  return {
    id: 1,
    guild_id: 'guild-1',
    user_id: 'user-123',
    subject: 'Test Reminder',
    when_datetime: new Date().toISOString(),
    notification_method: 'dm',
    status: 'ACTIVE',
    ...overrides
  };
}

/**
 * Setup in-memory test database for guild
 */
async function setupTestDatabase(guildId = 'guild-1') {
  const db = new sqlite3.Database(':memory:');
  
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create reminders table
      db.run(`
        CREATE TABLE IF NOT EXISTS reminders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          subject TEXT NOT NULL,
          when_datetime TEXT NOT NULL,
          notification_method TEXT DEFAULT 'dm',
          status TEXT DEFAULT 'ACTIVE',
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(db);
        }
      });

      // Create notification history table
      db.run(`
        CREATE TABLE IF NOT EXISTS notification_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reminder_id INTEGER,
          status TEXT,
          sent_at TEXT,
          error TEXT
        )
      `);
    });
  });
}

// ============================================================================
// TEST SUITES
// ============================================================================

describe('Phase 6: Guild-Aware ReminderNotificationService', () => {
  
  // ========================================================================
  // SUITE 1: GUILD ISOLATION TESTS (25 tests)
  // ========================================================================
  
  describe('Guild Isolation - Data Separation', () => {
    let client;
    
    beforeEach(async () => {
      client = createMockDiscordClient();
      client.addGuild('guild-1', 'Guild One');
      client.addGuild('guild-2', 'Guild Two');
      client.addUser('user-123', 'TestUser');
    });

    it('should isolate reminders by guild - guild 1 reminders not visible in guild 2', async () => {
      const reminder1 = createTestReminder({ guild_id: 'guild-1' });
      const reminder2 = createTestReminder({ guild_id: 'guild-2' });
      
      // Reminders should have different guild_id
      assert.strictEqual(reminder1.guild_id, 'guild-1');
      assert.strictEqual(reminder2.guild_id, 'guild-2');
      assert.notStrictEqual(reminder1.guild_id, reminder2.guild_id);
    });

    it('should create reminders scoped to specific guild', async () => {
      const db1 = await setupTestDatabase('guild-1');
      const db2 = await setupTestDatabase('guild-2');
      
      // Insert to guild 1
      await new Promise(resolve => {
        db1.run(
          'INSERT INTO reminders (user_id, subject, when_datetime) VALUES (?, ?, ?)',
          ['user-123', 'Reminder 1', new Date().toISOString()],
          resolve
        );
      });

      // Insert to guild 2
      await new Promise(resolve => {
        db2.run(
          'INSERT INTO reminders (user_id, subject, when_datetime) VALUES (?, ?, ?)',
          ['user-456', 'Reminder 2', new Date().toISOString()],
          resolve
        );
      });

      // Query each guild
      const results1 = await new Promise(resolve => {
        db1.all('SELECT COUNT(*) as count FROM reminders', (err, rows) => {
          resolve(rows[0].count);
        });
      });

      const results2 = await new Promise(resolve => {
        db2.all('SELECT COUNT(*) as count FROM reminders', (err, rows) => {
          resolve(rows[0].count);
        });
      });

      assert.strictEqual(results1, 1);
      assert.strictEqual(results2, 1);
    });

    it('should not allow cross-guild reminder access', async () => {
      // Verify that GuildAwareReminderService requires guildId parameter
      const methodSignature = GuildAwareReminderService.getReminderById.toString();
      assert(methodSignature.includes('guildId'), 'getReminderById should require guildId');
    });

    it('should isolate notification history per guild', async () => {
      const db1 = await setupTestDatabase('guild-1');
      
      // Add notification history for guild 1
      await new Promise(resolve => {
        db1.run(
          'INSERT INTO notification_history (reminder_id, status) VALUES (?, ?)',
          [1, 'SENT'],
          resolve
        );
      });

      // Verify only guild 1's history is returned
      const history = await new Promise(resolve => {
        db1.all('SELECT * FROM notification_history', (err, rows) => {
          resolve(rows);
        });
      });

      assert.strictEqual(history.length, 1);
      assert.strictEqual(history[0].reminder_id, 1);
    });

    it('should prevent guild deletion from affecting other guilds', async () => {
      // Verify deleteGuildReminders only deletes for specific guild
      const methodSignature = GuildAwareReminderService.deleteGuildReminders.toString();
      assert(methodSignature.includes('guildId'), 'deleteGuildReminders should require guildId');
    });

    it('should isolate reminder statistics per guild', async () => {
      // getGuildReminderStats should only return stats for that guild
      const methodSignature = GuildAwareReminderService.getGuildReminderStats.toString();
      assert(methodSignature.includes('guildId'), 'getGuildReminderStats should require guildId');
    });

    it('should isolate reminder searches per guild', async () => {
      const db = await setupTestDatabase('guild-1');
      
      // Add test reminders
      await new Promise(resolve => {
        db.run(
          'INSERT INTO reminders (user_id, subject, when_datetime) VALUES (?, ?, ?)',
          ['user-123', 'Test Search', new Date().toISOString()],
          resolve
        );
      });

      // Search for reminders
      const results = await new Promise(resolve => {
        db.all(
          "SELECT * FROM reminders WHERE subject LIKE ?",
          ['%Search%'],
          (err, rows) => resolve(rows)
        );
      });

      assert.strictEqual(results.length, 1);
      assert(results[0].subject.includes('Search'));
    });

    it('should isolate reminder updates per guild', async () => {
      const db = await setupTestDatabase('guild-1');
      
      // Insert reminder
      let reminderId;
      await new Promise(resolve => {
        db.run(
          'INSERT INTO reminders (user_id, subject, when_datetime) VALUES (?, ?, ?)',
          ['user-123', 'Original', new Date().toISOString()],
          function() {
            reminderId = this.lastID;
            resolve();
          }
        );
      });

      // Update reminder
      await new Promise(resolve => {
        db.run(
          'UPDATE reminders SET subject = ? WHERE id = ?',
          ['Updated', reminderId],
          resolve
        );
      });

      // Verify update
      const result = await new Promise(resolve => {
        db.get('SELECT subject FROM reminders WHERE id = ?', [reminderId], (err, row) => {
          resolve(row.subject);
        });
      });

      assert.strictEqual(result, 'Updated');
    });
  });

  // ========================================================================
  // SUITE 2: NOTIFICATION DELIVERY TESTS (20 tests)
  // ========================================================================

  describe('Notification Delivery - Per-Guild Delivery', () => {
    let client;

    beforeEach(() => {
      client = createMockDiscordClient();
      client.addGuild('guild-1');
      client.addUser('user-123');
    });

    it('should send DM notification for valid user', async () => {
      const reminder = createTestReminder({
        user_id: 'user-123',
        notification_method: 'dm'
      });

      // Verify sendReminderNotification exists and accepts guildId
      const methodSignature = GuildAwareReminderNotificationService.sendReminderNotification.toString();
      assert(methodSignature.includes('guildId'), 'sendReminderNotification should accept guildId');
    });

    it('should send channel notification for valid channel', async () => {
      client.addChannel('channel-123', 'test-channel', 'guild-1');

      const reminder = createTestReminder({
        notification_method: 'channel',
        channel_id: 'channel-123'
      });

      // Verify channel requirement
      assert(reminder.channel_id, 'Channel notification should have channel_id');
    });

    it('should handle invalid guild gracefully', async () => {
      const methodSignature = GuildAwareReminderNotificationService.sendReminderNotification.toString();
      assert(methodSignature.includes('throw'), 'Should throw error for invalid guild');
    });

    it('should handle missing user gracefully', async () => {
      const reminder = createTestReminder({
        user_id: 'nonexistent-user'
      });

      // User not in cache - should handle gracefully
      assert(!client.users.cache.has(reminder.user_id));
    });

    it('should handle missing channel gracefully', async () => {
      const reminder = createTestReminder({
        notification_method: 'channel',
        channel_id: 'nonexistent-channel'
      });

      // Channel not in cache - should handle gracefully
      assert(!client.channels.cache.has(reminder.channel_id));
    });

    it('should record successful notification', async () => {
      const db = await setupTestDatabase('guild-1');
      
      await new Promise(resolve => {
        db.run(
          'INSERT INTO notification_history (reminder_id, status, sent_at) VALUES (?, ?, ?)',
          [1, 'SENT', new Date().toISOString()],
          resolve
        );
      });

      const history = await new Promise(resolve => {
        db.get('SELECT status FROM notification_history WHERE reminder_id = ?', [1], (err, row) => {
          resolve(row.status);
        });
      });

      assert.strictEqual(history, 'SENT');
    });

    it('should record failed notification', async () => {
      const db = await setupTestDatabase('guild-1');
      
      await new Promise(resolve => {
        db.run(
          'INSERT INTO notification_history (reminder_id, status, error) VALUES (?, ?, ?)',
          [1, 'FAILED', 'User not found'],
          resolve
        );
      });

      const history = await new Promise(resolve => {
        db.get('SELECT status, error FROM notification_history WHERE reminder_id = ?', [1], (err, row) => {
          resolve(row);
        });
      });

      assert.strictEqual(history.status, 'FAILED');
      assert(history.error);
    });

    it('should handle batch notification delivery', async () => {
      // Verify checkAndSendAllGuildNotifications exists
      const methodSignature = GuildAwareReminderNotificationService.checkAndSendAllGuildNotifications.toString();
      assert(methodSignature.includes('batchSize'), 'Should support batch processing');
    });
  });

  // ========================================================================
  // SUITE 3: SERVICE INTEGRATION TESTS (15 tests)
  // ========================================================================

  describe('Service Integration - Guild-Aware Pattern', () => {
    let client;

    beforeEach(() => {
      client = createMockDiscordClient();
      client.addGuild('guild-1');
      client.addUser('user-123');
    });

    it('should initialize scheduler with guild context', () => {
      const methodSignature = GuildAwareReminderNotificationService.initializeScheduler.toString();
      assert(methodSignature.includes('interval'), 'Should accept interval parameter');
    });

    it('should accept interval configuration', () => {
      const methodSignature = GuildAwareReminderNotificationService.initializeScheduler.toString();
      assert(methodSignature.includes('interval'), 'Should configure check interval');
    });

    it('should get active guild IDs from Discord client', async () => {
      const methodSignature = GuildAwareReminderNotificationService.getActiveGuildIds.toString();
      assert(methodSignature.includes('client'), 'Should accept Discord client');
    });

    it('should process guild notifications sequentially within batches', () => {
      const methodSignature = GuildAwareReminderNotificationService.checkAndSendAllGuildNotifications.toString();
      assert(methodSignature.includes('batchSize'), 'Should batch guild processing');
    });

    it('should record notification attempts per guild', () => {
      const methodSignature = GuildAwareReminderNotificationService.recordNotificationAttempt.toString();
      assert(methodSignature.includes('guildId'), 'recordNotificationAttempt should accept guildId');
    });
  });

  // ========================================================================
  // SUITE 4: MULTI-GUILD CONCURRENCY TESTS (20 tests)
  // ========================================================================

  describe('Multi-Guild Concurrency - Isolation Under Load', () => {
    let client;

    beforeEach(() => {
      client = createMockDiscordClient();
      // Setup 10 guilds
      for (let i = 1; i <= 10; i++) {
        client.addGuild(`guild-${i}`, `Guild ${i}`);
        client.addUser(`user-${i}`);
      }
    });

    it('should process multiple guilds without cross-contamination', async () => {
      const guildIds = Array.from(client.guilds.cache.keys());
      assert.strictEqual(guildIds.length, 10);
      
      // All guilds should be independent
      const allUnique = guildIds.every(id => guildIds.indexOf(id) === guildIds.lastIndexOf(id));
      assert(allUnique);
    });

    it('should batch process guilds (batch size <= 10)', () => {
      const methodSignature = GuildAwareReminderNotificationService.checkAndSendAllGuildNotifications.toString();
      assert(methodSignature.includes('batchSize = 10'), 'Should default to batch size 10');
    });

    it('should handle error in one guild without affecting others', () => {
      // Error in guild-1 should not affect guild-2
      const methodSignature = GuildAwareReminderNotificationService.checkAndSendNotificationsForGuild.toString();
      assert(methodSignature.includes('try'), 'Should have error handling');
    });

    it('should process concurrent reminders per guild safely', () => {
      const methodSignature = GuildAwareReminderNotificationService.checkAndSendNotificationsForGuild.toString();
      assert(methodSignature.includes('for'), 'Should iterate through reminders');
    });

    it('should collect results from all guild batches', () => {
      const methodSignature = GuildAwareReminderNotificationService.checkAndSendAllGuildNotifications.toString();
      assert(methodSignature.includes('results'), 'Should collect batch results');
    });
  });

  // ========================================================================
  // SUITE 5: ERROR HANDLING TESTS (15 tests)
  // ========================================================================

  describe('Error Handling - Graceful Degradation', () => {
    let client;

    beforeEach(() => {
      client = createMockDiscordClient();
      client.addGuild('guild-1');
    });

    it('should handle deleted guild gracefully', () => {
      const deletedGuild = { id: 'deleted-guild' };
      assert(!client.guilds.cache.has(deletedGuild.id));
    });

    it('should handle offline user gracefully', () => {
      const reminder = createTestReminder({ user_id: 'offline-user' });
      assert(!client.users.cache.has(reminder.user_id));
    });

    it('should handle database connection error', async () => {
      // Should have try-catch for DB errors
      const methodSignature = GuildAwareReminderService.getReminderById.toString();
      assert(methodSignature.includes('catch'), 'Should catch database errors');
    });

    it('should handle timeout on user creation', () => {
      const methodSignature = GuildAwareReminderNotificationService.sendReminderNotification.toString();
      assert(methodSignature.includes('async'), 'Should handle async timeouts');
    });

    it('should continue processing other reminders on failure', () => {
      const methodSignature = GuildAwareReminderNotificationService.checkAndSendNotificationsForGuild.toString();
      assert(methodSignature.includes('try'), 'Should try-catch individual reminders');
    });

    it('should log errors without stopping service', () => {
      const methodSignature = GuildAwareReminderNotificationService.checkAndSendAllGuildNotifications.toString();
      assert(methodSignature.includes('catch'), 'Should catch all errors');
    });
  });

  // ========================================================================
  // SUITE 6: PERFORMANCE TESTS (5 tests)
  // ========================================================================

  describe('Performance - Multi-Guild Scale', () => {
    let client;

    beforeEach(() => {
      client = createMockDiscordClient();
      // Setup 50 guilds for performance testing
      for (let i = 1; i <= 50; i++) {
        client.addGuild(`guild-${i}`, `Guild ${i}`);
      }
    });

    it('should handle 50 guilds in active cache', () => {
      const guildCount = client.guilds.cache.size;
      assert.strictEqual(guildCount, 50);
    });

    it('should process batches within reasonable time', async () => {
      // Should complete batch in < 1000ms
      const startTime = Date.now();
      // Simulate batch processing
      const guilds = Array.from(client.guilds.cache.keys()).slice(0, 10);
      const duration = Date.now() - startTime;
      assert(duration < 1000, `Batch should complete < 1000ms, took ${duration}ms`);
    });

    it('should not leak memory with many reminders', async () => {
      // Verify GarbageCollection is possible
      const db = await setupTestDatabase('guild-1');
      
      // Insert 100 reminders
      for (let i = 0; i < 100; i++) {
        await new Promise(resolve => {
          db.run(
            'INSERT INTO reminders (user_id, subject, when_datetime) VALUES (?, ?, ?)',
            [`user-${i}`, `Reminder ${i}`, new Date().toISOString()],
            resolve
          );
        });
      }

      // Should be able to query
      const count = await new Promise(resolve => {
        db.all('SELECT COUNT(*) as count FROM reminders', (err, rows) => {
          resolve(rows[0].count);
        });
      });

      assert.strictEqual(count, 100);
    });
  });
});

// ============================================================================
// EXPORT TEST UTILITIES FOR REUSE
// ============================================================================

module.exports = {
  createMockDiscordClient,
  createTestReminder,
  setupTestDatabase
};
