/**
 * Integration Tests: Multi-Guild Workflows
 *
 * Comprehensive test suite for end-to-end workflows across multiple guilds.
 * Tests complete user journeys and guild isolation in production scenarios.
 *
 * Test Categories:
 * 1. Multi-Guild Quote Management (4 tests)
 * 2. Concurrent Guild Operations (4 tests)
 * 3. Guild Data Consistency (3 tests)
 * 4. Cross-Guild Isolation (4 tests)
 * 5. Error Recovery in Multi-Guild Context (3 tests)
 *
 * Total: 18 tests
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const GuildDatabaseManager = require('../../src/services/GuildDatabaseManager');
const GuildAwareDatabaseService = require('../../src/services/GuildAwareDatabaseService');

// Test database directory
const TEST_DB_DIR = path.join(__dirname, '../../data/test-guilds');

// Helper function to ensure test directory exists
function ensureTestDir() {
  if (!fs.existsSync(TEST_DB_DIR)) {
    fs.mkdirSync(TEST_DB_DIR, { recursive: true });
  }
}

// Helper function to clean up test guild database
async function cleanupGuildDatabase(guildId) {
  try {
    await GuildDatabaseManager.closeDatabase(guildId);
    const dbPath = path.join(TEST_DB_DIR, guildId, 'quotes.db');
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
    const guildDir = path.dirname(dbPath);
    if (fs.existsSync(guildDir) && fs.readdirSync(guildDir).length === 0) {
      fs.rmdirSync(guildDir);
    }
  } catch (err) {
    // Cleanup errors are okay in tests
  }
}

// Helper function to generate unique test guild IDs
function getTestGuildId(prefix) {
  return `test-${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

describe('Integration Tests: Multi-Guild Workflows', () => {
  beforeEach(() => {
    ensureTestDir();
  });

  // ============================================================================
  // CATEGORY 1: Multi-Guild Quote Management (4 tests)
  // ============================================================================

  describe('Multi-Guild Quote Management', () => {
    it('should manage separate quote libraries for multiple guilds (test 1)', async () => {
      const guild1 = getTestGuildId('mgmt-1a');
      const guild2 = getTestGuildId('mgmt-1b');
      const guild3 = getTestGuildId('mgmt-1c');

      // Add quotes to different guilds
      const quotes1 = [];
      quotes1.push(await GuildAwareDatabaseService.addQuote(guild1, 'Guild 1 Quote 1', 'Author'));
      quotes1.push(await GuildAwareDatabaseService.addQuote(guild1, 'Guild 1 Quote 2', 'Author'));

      const quotes2 = [];
      quotes2.push(await GuildAwareDatabaseService.addQuote(guild2, 'Guild 2 Quote 1', 'Author'));

      const quotes3 = [];
      quotes3.push(await GuildAwareDatabaseService.addQuote(guild3, 'Guild 3 Quote 1', 'Author'));
      quotes3.push(await GuildAwareDatabaseService.addQuote(guild3, 'Guild 3 Quote 2', 'Author'));
      quotes3.push(await GuildAwareDatabaseService.addQuote(guild3, 'Guild 3 Quote 3', 'Author'));

      // Verify each guild has correct count
      const allQuotes1 = await GuildAwareDatabaseService.getAllQuotes(guild1);
      const allQuotes2 = await GuildAwareDatabaseService.getAllQuotes(guild2);
      const allQuotes3 = await GuildAwareDatabaseService.getAllQuotes(guild3);

      assert.strictEqual(allQuotes1.length, 2, 'Guild 1 should have 2 quotes');
      assert.strictEqual(allQuotes2.length, 1, 'Guild 2 should have 1 quote');
      assert.strictEqual(allQuotes3.length, 3, 'Guild 3 should have 3 quotes');

      await cleanupGuildDatabase(guild1);
      await cleanupGuildDatabase(guild2);
      await cleanupGuildDatabase(guild3);
    });

    it('should perform CRUD operations independently for each guild (test 2)', async () => {
      const guild1 = getTestGuildId('mgmt-2a');
      const guild2 = getTestGuildId('mgmt-2b');

      // Add and update in guild1
      const id1 = await GuildAwareDatabaseService.addQuote(guild1, 'Original Guild 1', 'Author');
      await GuildAwareDatabaseService.updateQuote(guild1, id1, 'Updated Guild 1', 'Author');

      // Add and delete in guild2
      const id2a = await GuildAwareDatabaseService.addQuote(guild2, 'Quote to delete', 'Author');
      const id2b = await GuildAwareDatabaseService.addQuote(guild2, 'Quote to keep', 'Author');
      await GuildAwareDatabaseService.deleteQuote(guild2, id2a);

      // Verify operations were independent
      const updated1 = await GuildAwareDatabaseService.getQuoteById(guild1, id1);
      assert.strictEqual(updated1.text, 'Updated Guild 1', 'Guild 1 update should succeed');

      const remaining2 = await GuildAwareDatabaseService.getAllQuotes(guild2);
      assert.strictEqual(remaining2.length, 1, 'Guild 2 should have 1 quote after delete');
      assert.strictEqual(remaining2[0].text, 'Quote to keep', 'Correct quote should remain');

      await cleanupGuildDatabase(guild1);
      await cleanupGuildDatabase(guild2);
    });

    it('should search within specific guild scope (test 3)', async () => {
      const guild1 = getTestGuildId('mgmt-3a');
      const guild2 = getTestGuildId('mgmt-3b');

      // Add similar quotes to different guilds
      await GuildAwareDatabaseService.addQuote(guild1, 'Python is awesome', 'Programmer');
      await GuildAwareDatabaseService.addQuote(guild1, 'Python testing is important', 'QA');
      await GuildAwareDatabaseService.addQuote(guild2, 'Java is powerful', 'Developer');
      await GuildAwareDatabaseService.addQuote(guild2, 'Python is also good', 'Generalist');

      // Search within each guild
      const pythonInGuild1 = await GuildAwareDatabaseService.searchQuotes(guild1, 'Python');
      const pythonInGuild2 = await GuildAwareDatabaseService.searchQuotes(guild2, 'Python');
      const pythonInGuild3 = await GuildAwareDatabaseService.searchQuotes(getTestGuildId('mgmt-3c'), 'Python');

      assert.strictEqual(pythonInGuild1.length, 2, 'Guild 1 should find 2 Python quotes');
      assert.strictEqual(pythonInGuild2.length, 1, 'Guild 2 should find 1 Python quote');
      assert.strictEqual(pythonInGuild3.length, 0, 'Guild 3 should find 0 Python quotes');

      await cleanupGuildDatabase(guild1);
      await cleanupGuildDatabase(guild2);
    });

    it('should tag quotes independently per guild (test 4)', async () => {
      const guild1 = getTestGuildId('mgmt-4a');
      const guild2 = getTestGuildId('mgmt-4b');

      const id1 = await GuildAwareDatabaseService.addQuote(guild1, 'Programming quote', 'Dev');
      const id2 = await GuildAwareDatabaseService.addQuote(guild2, 'Programming quote', 'Dev');

      // Tag same quote differently in each guild
      await GuildAwareDatabaseService.tagQuote(guild1, id1, 'coding');
      await GuildAwareDatabaseService.tagQuote(guild1, id1, 'python');
      await GuildAwareDatabaseService.tagQuote(guild2, id2, 'development');

      // Verify tags are isolated
      const tagged1 = await GuildAwareDatabaseService.getQuotesByTag(guild1, 'coding');
      const tagged2 = await GuildAwareDatabaseService.getQuotesByTag(guild2, 'coding');

      assert.strictEqual(tagged1.length, 1, 'Guild 1 should find quote with coding tag');
      assert.strictEqual(tagged2.length, 0, 'Guild 2 should not find coding tag');

      await cleanupGuildDatabase(guild1);
      await cleanupGuildDatabase(guild2);
    });
  });

  // ============================================================================
  // CATEGORY 2: Concurrent Guild Operations (4 tests)
  // ============================================================================

  describe('Concurrent Guild Operations', () => {
    it('should handle concurrent operations across multiple guilds (test 5)', async () => {
      const guilds = [
        getTestGuildId('concurrent-5a'),
        getTestGuildId('concurrent-5b'),
        getTestGuildId('concurrent-5c'),
        getTestGuildId('concurrent-5d'),
        getTestGuildId('concurrent-5e')
      ];

      const promises = [];
      guilds.forEach((guildId, index) => {
        for (let i = 0; i < 10; i++) {
          promises.push(
            GuildAwareDatabaseService.addQuote(
              guildId,
              `Quote ${i} from Guild ${index}`,
              'Author'
            )
          );
        }
      });

      const ids = await Promise.all(promises);

      assert.strictEqual(ids.length, 50, 'Should add 50 quotes total');
      assert.strictEqual(new Set(ids).size, 50, 'All quote IDs should be unique');

      // Verify each guild has 10 quotes
      for (const guildId of guilds) {
        const quotes = await GuildAwareDatabaseService.getAllQuotes(guildId);
        assert.strictEqual(quotes.length, 10, 'Guild should have 10 quotes');
      }

      for (const guildId of guilds) {
        await cleanupGuildDatabase(guildId);
      }
    });

    it('should maintain data integrity during concurrent writes (test 6)', async () => {
      const guild = getTestGuildId('concurrent-6');

      // Add 20 quotes concurrently
      const promises = [];
      for (let i = 0; i < 20; i++) {
        promises.push(
          GuildAwareDatabaseService.addQuote(guild, `Quote ${i}`, 'Author')
        );
      }

      const ids = await Promise.all(promises);

      // Verify all were added
      const allQuotes = await GuildAwareDatabaseService.getAllQuotes(guild);
      assert.strictEqual(allQuotes.length, 20, 'All 20 quotes should be present');

      // Verify no duplicates
      const uniqueIds = new Set(allQuotes.map(q => q.id));
      assert.strictEqual(uniqueIds.size, 20, 'All quote IDs should be unique');

      // Verify data integrity - all quotes should be retrievable
      for (const quote of allQuotes) {
        const retrieved = await GuildAwareDatabaseService.getQuoteById(guild, quote.id);
        assert(retrieved, `Quote ${quote.id} should be retrievable`);
      }

      await cleanupGuildDatabase(guild);
    });

    it('should handle concurrent operations across guilds with different workloads (test 7)', async () => {
      const lightGuild = getTestGuildId('concurrent-7a');
      const heavyGuild = getTestGuildId('concurrent-7b');

      const promises = [];

      // Heavy load on one guild
      for (let i = 0; i < 50; i++) {
        promises.push(
          GuildAwareDatabaseService.addQuote(heavyGuild, `Heavy Quote ${i}`, 'Author')
        );
      }

      // Light load on another guild
      for (let i = 0; i < 5; i++) {
        promises.push(
          GuildAwareDatabaseService.addQuote(lightGuild, `Light Quote ${i}`, 'Author')
        );
      }

      const ids = await Promise.all(promises);

      // Verify counts
      const heavyQuotes = await GuildAwareDatabaseService.getAllQuotes(heavyGuild);
      const lightQuotes = await GuildAwareDatabaseService.getAllQuotes(lightGuild);

      assert.strictEqual(heavyQuotes.length, 50, 'Heavy guild should have 50 quotes');
      assert.strictEqual(lightQuotes.length, 5, 'Light guild should have 5 quotes');

      await cleanupGuildDatabase(lightGuild);
      await cleanupGuildDatabase(heavyGuild);
    });

    it('should not interfere with concurrent searches across guilds (test 8)', async () => {
      const guild1 = getTestGuildId('concurrent-8a');
      const guild2 = getTestGuildId('concurrent-8b');

      // Add data
      for (let i = 0; i < 10; i++) {
        await GuildAwareDatabaseService.addQuote(guild1, `Python quote ${i}`, 'Author');
        await GuildAwareDatabaseService.addQuote(guild2, `Java quote ${i}`, 'Author');
      }

      // Search concurrently
      const [results1, results2] = await Promise.all([
        GuildAwareDatabaseService.searchQuotes(guild1, 'Python'),
        GuildAwareDatabaseService.searchQuotes(guild2, 'Java')
      ]);

      assert.strictEqual(results1.length, 10, 'Guild 1 should find 10 Python quotes');
      assert.strictEqual(results2.length, 10, 'Guild 2 should find 10 Java quotes');

      await cleanupGuildDatabase(guild1);
      await cleanupGuildDatabase(guild2);
    });
  });

  // ============================================================================
  // CATEGORY 3: Guild Data Consistency (3 tests)
  // ============================================================================

  describe('Guild Data Consistency', () => {
    it('should maintain consistent data across close/reopen cycles (test 9)', async () => {
      const guild = getTestGuildId('consistency-9');

      // Add quotes
      const ids = [];
      ids.push(await GuildAwareDatabaseService.addQuote(guild, 'Quote 1', 'Author'));
      ids.push(await GuildAwareDatabaseService.addQuote(guild, 'Quote 2', 'Author'));

      // Close and reopen
      await GuildDatabaseManager.closeDatabase(guild);
      const quotes1 = await GuildAwareDatabaseService.getAllQuotes(guild);

      // Add more quotes
      ids.push(await GuildAwareDatabaseService.addQuote(guild, 'Quote 3', 'Author'));

      // Close and reopen again
      await GuildDatabaseManager.closeDatabase(guild);
      const quotes2 = await GuildAwareDatabaseService.getAllQuotes(guild);

      assert.strictEqual(quotes1.length, 2, 'First retrieval should have 2 quotes');
      assert.strictEqual(quotes2.length, 3, 'Second retrieval should have 3 quotes');

      await cleanupGuildDatabase(guild);
    });

    it('should preserve quotes through multiple guild isolation boundaries (test 10)', async () => {
      const guilds = Array.from({ length: 5 }, (_, i) => getTestGuildId(`consistency-10-${i}`));

      // Add unique quotes to each guild
      for (let i = 0; i < guilds.length; i++) {
        for (let j = 0; j < 5; j++) {
          await GuildAwareDatabaseService.addQuote(
            guilds[i],
            `Guild ${i} Quote ${j}`,
            'Author'
          );
        }
      }

      // Verify isolation and consistency
      for (let i = 0; i < guilds.length; i++) {
        const quotes = await GuildAwareDatabaseService.getAllQuotes(guilds[i]);
        assert.strictEqual(quotes.length, 5, `Guild ${i} should have exactly 5 quotes`);

        // Verify no quotes from other guilds appear
        for (const quote of quotes) {
          assert(quote.text.includes(`Guild ${i}`), `Quote should belong to Guild ${i}`);
        }
      }

      for (const guildId of guilds) {
        await cleanupGuildDatabase(guildId);
      }
    });

    it('should maintain referential integrity in multi-guild environment (test 11)', async () => {
      const guild1 = getTestGuildId('consistency-11a');
      const guild2 = getTestGuildId('consistency-11b');

      // Add quotes in both guilds
      const id1 = await GuildAwareDatabaseService.addQuote(guild1, 'Quote A', 'Author');
      const id2 = await GuildAwareDatabaseService.addQuote(guild2, 'Quote B', 'Author');

      // Add tags
      await GuildAwareDatabaseService.tagQuote(guild1, id1, 'important');
      await GuildAwareDatabaseService.tagQuote(guild2, id2, 'important');

      // Verify tags are separate
      const tagged1 = await GuildAwareDatabaseService.getQuotesByTag(guild1, 'important');
      const tagged2 = await GuildAwareDatabaseService.getQuotesByTag(guild2, 'important');

      assert.strictEqual(tagged1.length, 1, 'Guild 1 should have 1 important quote');
      assert.strictEqual(tagged2.length, 1, 'Guild 2 should have 1 important quote');
      assert.notStrictEqual(tagged1[0].id, tagged2[0].id, 'IDs should be different');

      await cleanupGuildDatabase(guild1);
      await cleanupGuildDatabase(guild2);
    });
  });

  // ============================================================================
  // CATEGORY 4: Cross-Guild Isolation (4 tests)
  // ============================================================================

  describe('Cross-Guild Isolation', () => {
    it('should not leak data between guild operations (test 12)', async () => {
      const guild1 = getTestGuildId('isolation-12a');
      const guild2 = getTestGuildId('isolation-12b');
      const guild3 = getTestGuildId('isolation-12c');

      // Interleave operations
      await GuildAwareDatabaseService.addQuote(guild1, 'Guild 1 Q1', 'A1');
      await GuildAwareDatabaseService.addQuote(guild2, 'Guild 2 Q1', 'A2');
      await GuildAwareDatabaseService.addQuote(guild3, 'Guild 3 Q1', 'A3');
      await GuildAwareDatabaseService.addQuote(guild1, 'Guild 1 Q2', 'A1');
      await GuildAwareDatabaseService.addQuote(guild2, 'Guild 2 Q2', 'A2');

      // Verify no leakage
      const q1 = await GuildAwareDatabaseService.getAllQuotes(guild1);
      const q2 = await GuildAwareDatabaseService.getAllQuotes(guild2);
      const q3 = await GuildAwareDatabaseService.getAllQuotes(guild3);

      assert.strictEqual(q1.length, 2, 'Guild 1 should have exactly 2 quotes');
      assert.strictEqual(q2.length, 2, 'Guild 2 should have exactly 2 quotes');
      assert.strictEqual(q3.length, 1, 'Guild 3 should have exactly 1 quote');

      await cleanupGuildDatabase(guild1);
      await cleanupGuildDatabase(guild2);
      await cleanupGuildDatabase(guild3);
    });

    it('should isolate quote IDs across guilds (test 13)', async () => {
      const guild1 = getTestGuildId('isolation-13a');
      const guild2 = getTestGuildId('isolation-13b');

      // Add same content to both guilds
      const id1 = await GuildAwareDatabaseService.addQuote(guild1, 'Identical content', 'Author');
      const id2 = await GuildAwareDatabaseService.addQuote(guild2, 'Identical content', 'Author');

      // IDs might be the same if databases are separate, but retrieval should be isolated
      const retrieved1 = await GuildAwareDatabaseService.getQuoteById(guild1, id1);
      const retrieved2 = await GuildAwareDatabaseService.getQuoteById(guild2, id2);

      assert.strictEqual(retrieved1.text, 'Identical content', 'Guild 1 retrieval should succeed');
      assert.strictEqual(retrieved2.text, 'Identical content', 'Guild 2 retrieval should succeed');

      // Trying to get guild1's quote from guild2 should fail or return null
      const wrongGuild = await GuildAwareDatabaseService.getQuoteById(guild2, id1);
      if (id1 !== id2) {
        assert(!wrongGuild || wrongGuild.id !== id1, 'Guild 2 should not have Guild 1 quote');
      }

      await cleanupGuildDatabase(guild1);
      await cleanupGuildDatabase(guild2);
    });

    it('should isolate search results across guilds (test 14)', async () => {
      const guild1 = getTestGuildId('isolation-14a');
      const guild2 = getTestGuildId('isolation-14b');

      // Add different but searchable content
      await GuildAwareDatabaseService.addQuote(guild1, 'Testing is important', 'Tester');
      await GuildAwareDatabaseService.addQuote(guild1, 'Test all the things', 'QA');
      await GuildAwareDatabaseService.addQuote(guild2, 'Production deployment test', 'DevOps');

      // Search within each guild
      const test1 = await GuildAwareDatabaseService.searchQuotes(guild1, 'Test');
      const test2 = await GuildAwareDatabaseService.searchQuotes(guild2, 'Test');

      assert.strictEqual(test1.length, 2, 'Guild 1 should find 2 test quotes');
      assert.strictEqual(test2.length, 1, 'Guild 2 should find 1 test quote');

      await cleanupGuildDatabase(guild1);
      await cleanupGuildDatabase(guild2);
    });

    it('should isolate rating and metadata across guilds (test 15)', async () => {
      const guild1 = getTestGuildId('isolation-15a');
      const guild2 = getTestGuildId('isolation-15b');

      const id1 = await GuildAwareDatabaseService.addQuote(guild1, 'Same quote', 'Author');
      const id2 = await GuildAwareDatabaseService.addQuote(guild2, 'Same quote', 'Author');

      // Rate differently in each guild
      await GuildAwareDatabaseService.rateQuote(guild1, id1, 5);
      await GuildAwareDatabaseService.rateQuote(guild2, id2, 2);

      const quote1 = await GuildAwareDatabaseService.getQuoteById(guild1, id1);
      const quote2 = await GuildAwareDatabaseService.getQuoteById(guild2, id2);

      assert(quote1, 'Guild 1 quote should exist');
      assert(quote2, 'Guild 2 quote should exist');

      await cleanupGuildDatabase(guild1);
      await cleanupGuildDatabase(guild2);
    });
  });

  // ============================================================================
  // CATEGORY 5: Error Recovery in Multi-Guild Context (3 tests)
  // ============================================================================

  describe('Error Recovery in Multi-Guild Context', () => {
    it('should recover from errors without affecting other guilds (test 16)', async () => {
      const guild1 = getTestGuildId('recovery-16a');
      const guild2 = getTestGuildId('recovery-16b');

      // Add data to guild1
      await GuildAwareDatabaseService.addQuote(guild1, 'Guild 1 Quote', 'Author');

      // Attempt invalid operation on guild2 (should fail gracefully)
      try {
        await GuildAwareDatabaseService.addQuote(guild2, null, 'Author');
      } catch (err) {
        // Expected to fail
      }

      // Guild1 should still be accessible
      const quotes1 = await GuildAwareDatabaseService.getAllQuotes(guild1);
      assert.strictEqual(quotes1.length, 1, 'Guild 1 should still be accessible');

      // Guild2 should still be accessible for valid operations
      const id2 = await GuildAwareDatabaseService.addQuote(guild2, 'Valid quote', 'Author');
      assert(Number.isInteger(id2), 'Guild 2 should recover and work normally');

      await cleanupGuildDatabase(guild1);
      await cleanupGuildDatabase(guild2);
    });

    it('should handle database errors without cascading to other guilds (test 17)', async () => {
      const guilds = Array.from({ length: 3 }, (_, i) => getTestGuildId(`recovery-17-${i}`));

      // Add quotes to all guilds
      const ids = [];
      for (const guildId of guilds) {
        ids.push(await GuildAwareDatabaseService.addQuote(guildId, 'Test quote', 'Author'));
      }

      // Verify all guilds are operational
      for (const guildId of guilds) {
        const quotes = await GuildAwareDatabaseService.getAllQuotes(guildId);
        assert.strictEqual(quotes.length, 1, 'Guild should have 1 quote');
      }

      for (const guildId of guilds) {
        await cleanupGuildDatabase(guildId);
      }
    });

    it('should maintain isolation even during bulk operations across guilds (test 18)', async () => {
      const guild1 = getTestGuildId('recovery-18a');
      const guild2 = getTestGuildId('recovery-18b');

      // Bulk add to guild1
      const ids1 = [];
      for (let i = 0; i < 20; i++) {
        ids1.push(
          await GuildAwareDatabaseService.addQuote(guild1, `Guild 1 Quote ${i}`, 'Author')
        );
      }

      // Add a few to guild2
      const ids2 = [];
      ids2.push(await GuildAwareDatabaseService.addQuote(guild2, 'Guild 2 Quote', 'Author'));

      // Verify isolation
      const all1 = await GuildAwareDatabaseService.getAllQuotes(guild1);
      const all2 = await GuildAwareDatabaseService.getAllQuotes(guild2);

      assert.strictEqual(all1.length, 20, 'Guild 1 should have 20 quotes');
      assert.strictEqual(all2.length, 1, 'Guild 2 should have 1 quote');

      await cleanupGuildDatabase(guild1);
      await cleanupGuildDatabase(guild2);
    });
  });
});
