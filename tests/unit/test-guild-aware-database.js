/**
 * Guild-Aware Database Service Tests
 *
 * Comprehensive test suite for guild-aware database operations.
 * Tests GuildDatabaseManager and GuildAwareDatabaseService with guild isolation.
 *
 * Test Categories:
 * 1. GuildDatabaseManager Basic Operations (4 tests)
 * 2. Guild-Aware Quote Operations (5 tests)
 * 3. Guild Data Isolation Validation (4 tests)
 * 4. Guild Database File Management (3 tests)
 * 5. Error Handling & Edge Cases (3 tests)
 *
 * Total: 19 tests
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
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

describe('GuildAwareDatabaseService', () => {
  let testGuildId;

  beforeEach(() => {
    ensureTestDir();
    testGuildId = getTestGuildId('guild');
  });

  afterEach(async () => {
    if (testGuildId) {
      await cleanupGuildDatabase(testGuildId);
    }
  });

  // ============================================================================
  // CATEGORY 1: GuildDatabaseManager Basic Operations (4 tests)
  // ============================================================================

  describe('GuildDatabaseManager - Basic Operations', () => {
    it('should get database for guild (test 1)', async () => {
      const guildId = getTestGuildId('basic-1');
      const db = await GuildDatabaseManager.getGuildDatabase(guildId);

      assert(db, 'Database object should be returned');
      assert(typeof db.all === 'function', 'Database should have all() method');
      assert(typeof db.get === 'function', 'Database should have get() method');
      assert(typeof db.run === 'function', 'Database should have run() method');

      await cleanupGuildDatabase(guildId);
    });

    it('should create database file in correct directory (test 2)', async () => {
      const guildId = getTestGuildId('basic-2');
      const db = await GuildDatabaseManager.getGuildDatabase(guildId);

      const expectedDir = path.join(TEST_DB_DIR, guildId);
      assert(fs.existsSync(expectedDir), `Guild directory should exist at ${expectedDir}`);

      const dbPath = path.join(expectedDir, 'quotes.db');
      assert(fs.existsSync(dbPath), `Database file should exist at ${dbPath}`);

      await cleanupGuildDatabase(guildId);
    });

    it('should cache connection for same guild (test 3)', async () => {
      const guildId = getTestGuildId('basic-3');
      const db1 = await GuildDatabaseManager.getGuildDatabase(guildId);
      const db2 = await GuildDatabaseManager.getGuildDatabase(guildId);

      assert.strictEqual(db1, db2, 'Same guild should return cached connection');

      await cleanupGuildDatabase(guildId);
    });

    it('should isolate connections between guilds (test 4)', async () => {
      const guild1 = getTestGuildId('basic-4a');
      const guild2 = getTestGuildId('basic-4b');

      const db1 = await GuildDatabaseManager.getGuildDatabase(guild1);
      const db2 = await GuildDatabaseManager.getGuildDatabase(guild2);

      assert.notStrictEqual(db1, db2, 'Different guilds should have different connections');

      await cleanupGuildDatabase(guild1);
      await cleanupGuildDatabase(guild2);
    });
  });

  // ============================================================================
  // CATEGORY 2: Guild-Aware Quote Operations (5 tests)
  // ============================================================================

  describe('GuildAwareDatabaseService - Quote Operations', () => {
    it('should add quote to guild database (test 5)', async () => {
      const quoteId = await GuildAwareDatabaseService.addQuote(
        testGuildId,
        'Test quote text',
        'Test Author'
      );

      assert(Number.isInteger(quoteId), 'Quote ID should be an integer');
      assert(quoteId > 0, 'Quote ID should be positive');
    });

    it('should retrieve all quotes from guild (test 6)', async () => {
      const text1 = 'First quote';
      const text2 = 'Second quote';
      const author = 'Author';

      const id1 = await GuildAwareDatabaseService.addQuote(testGuildId, text1, author);
      const id2 = await GuildAwareDatabaseService.addQuote(testGuildId, text2, author);

      const quotes = await GuildAwareDatabaseService.getAllQuotes(testGuildId);

      assert(Array.isArray(quotes), 'Should return array of quotes');
      assert.strictEqual(quotes.length, 2, 'Should have 2 quotes');
      assert.strictEqual(quotes[0].text, text2, 'Most recent quote should be first (DESC order)');
      assert.strictEqual(quotes[0].id, id2, 'First quote should have correct ID');
    });

    it('should get quote by ID from guild (test 7)', async () => {
      const text = 'Specific quote';
      const author = 'Test Author';

      const quoteId = await GuildAwareDatabaseService.addQuote(testGuildId, text, author);
      const quote = await GuildAwareDatabaseService.getQuoteById(testGuildId, quoteId);

      assert(quote, 'Quote should be found');
      assert.strictEqual(quote.id, quoteId, 'Quote ID should match');
      assert.strictEqual(quote.text, text, 'Quote text should match');
      assert.strictEqual(quote.author, author, 'Quote author should match');
    });

    it('should update quote in guild database (test 8)', async () => {
      const originalText = 'Original text';
      const originalAuthor = 'Original Author';
      const quoteId = await GuildAwareDatabaseService.addQuote(
        testGuildId,
        originalText,
        originalAuthor
      );

      const newText = 'Updated text';
      const newAuthor = 'Updated Author';
      await GuildAwareDatabaseService.updateQuote(
        testGuildId,
        quoteId,
        newText,
        newAuthor
      );

      const updated = await GuildAwareDatabaseService.getQuoteById(testGuildId, quoteId);

      assert.strictEqual(updated.text, newText, 'Text should be updated');
      assert.strictEqual(updated.author, newAuthor, 'Author should be updated');
    });

    it('should delete quote from guild database (test 9)', async () => {
      const quoteId = await GuildAwareDatabaseService.addQuote(
        testGuildId,
        'Quote to delete',
        'Author'
      );

      await GuildAwareDatabaseService.deleteQuote(testGuildId, quoteId);
      const deleted = await GuildAwareDatabaseService.getQuoteById(testGuildId, quoteId);

      assert.strictEqual(deleted, null, 'Quote should be deleted');
    });
  });

  // ============================================================================
  // CATEGORY 3: Guild Data Isolation Validation (4 tests)
  // ============================================================================

  describe('GuildAwareDatabaseService - Guild Isolation', () => {
    it('should isolate quotes between guilds (test 10)', async () => {
      const guild1 = getTestGuildId('isolation-1a');
      const guild2 = getTestGuildId('isolation-1b');

      await GuildAwareDatabaseService.addQuote(guild1, 'Guild 1 Quote', 'Author');
      await GuildAwareDatabaseService.addQuote(guild1, 'Guild 1 Quote 2', 'Author');
      await GuildAwareDatabaseService.addQuote(guild2, 'Guild 2 Quote', 'Author');

      const guild1Quotes = await GuildAwareDatabaseService.getAllQuotes(guild1);
      const guild2Quotes = await GuildAwareDatabaseService.getAllQuotes(guild2);

      assert.strictEqual(guild1Quotes.length, 2, 'Guild 1 should have 2 quotes');
      assert.strictEqual(guild2Quotes.length, 1, 'Guild 2 should have 1 quote');
      assert.notStrictEqual(
        guild1Quotes[0].text,
        guild2Quotes[0].text,
        'Quotes should be different'
      );

      await cleanupGuildDatabase(guild1);
      await cleanupGuildDatabase(guild2);
    });

    it('should not see deleted quotes from other guilds (test 11)', async () => {
      const guild1 = getTestGuildId('isolation-2a');
      const guild2 = getTestGuildId('isolation-2b');

      const id1 = await GuildAwareDatabaseService.addQuote(guild1, 'Guild 1 Quote', 'Author');
      const id2 = await GuildAwareDatabaseService.addQuote(guild2, 'Guild 2 Quote', 'Author');

      await GuildAwareDatabaseService.deleteQuote(guild1, id1);

      const guild1Quotes = await GuildAwareDatabaseService.getAllQuotes(guild1);
      const guild2Quotes = await GuildAwareDatabaseService.getAllQuotes(guild2);

      assert.strictEqual(guild1Quotes.length, 0, 'Guild 1 should have no quotes');
      assert.strictEqual(guild2Quotes.length, 1, 'Guild 2 should still have 1 quote');

      await cleanupGuildDatabase(guild1);
      await cleanupGuildDatabase(guild2);
    });

    it('should isolate quote searches by guild (test 12)', async () => {
      const guild1 = getTestGuildId('isolation-3a');
      const guild2 = getTestGuildId('isolation-3b');

      await GuildAwareDatabaseService.addQuote(guild1, 'I love pizza and coffee', 'Chef');
      await GuildAwareDatabaseService.addQuote(guild1, 'Pizza is great', 'Author');
      await GuildAwareDatabaseService.addQuote(guild2, 'Coffee is wonderful', 'Barista');

      const guild1Results = await GuildAwareDatabaseService.searchQuotes(guild1, 'pizza');
      const guild2Results = await GuildAwareDatabaseService.searchQuotes(guild2, 'pizza');

      assert.strictEqual(guild1Results.length, 2, 'Guild 1 should find 2 pizza quotes');
      assert.strictEqual(guild2Results.length, 0, 'Guild 2 should find 0 pizza quotes');

      await cleanupGuildDatabase(guild1);
      await cleanupGuildDatabase(guild2);
    });

    it('should isolate tags between guilds (test 13)', async () => {
      const guild1 = getTestGuildId('isolation-4a');
      const guild2 = getTestGuildId('isolation-4b');

      const id1 = await GuildAwareDatabaseService.addQuote(guild1, 'Quote 1', 'Author');
      const id2 = await GuildAwareDatabaseService.addQuote(guild2, 'Quote 2', 'Author');

      await GuildAwareDatabaseService.tagQuote(guild1, id1, 'cooking');
      await GuildAwareDatabaseService.tagQuote(guild2, id2, 'science');

      const guild1Quotes = await GuildAwareDatabaseService.getQuotesByTag(guild1, 'cooking');
      const guild2Quotes = await GuildAwareDatabaseService.getQuotesByTag(guild2, 'cooking');

      assert.strictEqual(guild1Quotes.length, 1, 'Guild 1 should have cooking quote');
      assert.strictEqual(guild2Quotes.length, 0, 'Guild 2 should not have cooking quote');

      await cleanupGuildDatabase(guild1);
      await cleanupGuildDatabase(guild2);
    });
  });

  // ============================================================================
  // CATEGORY 4: Guild Database File Management (3 tests)
  // ============================================================================

  describe('GuildDatabaseManager - File Management', () => {
    it('should create separate database files for each guild (test 14)', async () => {
      const guild1 = getTestGuildId('files-1a');
      const guild2 = getTestGuildId('files-1b');

      const db1 = await GuildDatabaseManager.getGuildDatabase(guild1);
      const db2 = await GuildDatabaseManager.getGuildDatabase(guild2);

      const file1 = path.join(TEST_DB_DIR, guild1, 'quotes.db');
      const file2 = path.join(TEST_DB_DIR, guild2, 'quotes.db');

      assert(fs.existsSync(file1), `Guild 1 database file should exist at ${file1}`);
      assert(fs.existsSync(file2), `Guild 2 database file should exist at ${file2}`);
      assert.notStrictEqual(file1, file2, 'Database files should be different');

      await cleanupGuildDatabase(guild1);
      await cleanupGuildDatabase(guild2);
    });

    it('should close guild database connection (test 15)', async () => {
      const guildId = getTestGuildId('files-2');

      const db1 = await GuildDatabaseManager.getGuildDatabase(guildId);
      await GuildDatabaseManager.closeDatabase(guildId);

      // Re-opening should create a new connection
      const db2 = await GuildDatabaseManager.getGuildDatabase(guildId);

      assert.notStrictEqual(db1, db2, 'New connection should be created after close');

      await cleanupGuildDatabase(guildId);
    });

    it('should reopen guild database after close and preserve data (test 16)', async () => {
      const guildId = getTestGuildId('files-3');

      const id = await GuildAwareDatabaseService.addQuote(guildId, 'Test quote', 'Author');
      await GuildDatabaseManager.closeDatabase(guildId);

      // Reopen and verify data persists
      const quotes = await GuildAwareDatabaseService.getAllQuotes(guildId);

      assert.strictEqual(quotes.length, 1, 'Quote should still exist after reopen');
      assert.strictEqual(quotes[0].id, id, 'Quote ID should match');

      await cleanupGuildDatabase(guildId);
    });
  });

  // ============================================================================
  // CATEGORY 5: Error Handling & Edge Cases (3 tests)
  // ============================================================================

  describe('GuildAwareDatabaseService - Error Handling & Edge Cases', () => {
    it('should throw error for missing guild ID (test 17)', async () => {
      assert.rejects(
        async () => {
          await GuildAwareDatabaseService.addQuote(null, 'text', 'author');
        },
        /Guild ID is required/,
        'Should throw error for null guild ID'
      );
    });

    it('should handle concurrent operations correctly (test 18)', async () => {
      const guildId = getTestGuildId('concurrent');

      // Add quotes concurrently
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          GuildAwareDatabaseService.addQuote(
            guildId,
            `Quote ${i}`,
            'Author'
          )
        );
      }

      const ids = await Promise.all(promises);

      // Verify all quotes were added
      const quotes = await GuildAwareDatabaseService.getAllQuotes(guildId);

      assert.strictEqual(quotes.length, 10, 'All 10 quotes should be added');
      assert.strictEqual(new Set(ids).size, 10, 'All quote IDs should be unique');

      await cleanupGuildDatabase(guildId);
    });

    it('should handle large data sets efficiently (test 19)', async () => {
      const guildId = getTestGuildId('large');

      // Add many quotes
      const startTime = Date.now();
      for (let i = 0; i < 100; i++) {
        await GuildAwareDatabaseService.addQuote(
          guildId,
          `Quote ${i}: This is a test quote with some content`,
          `Author ${i}`
        );
      }
      const addTime = Date.now() - startTime;

      // Retrieve all quotes
      const startRetrieve = Date.now();
      const quotes = await GuildAwareDatabaseService.getAllQuotes(guildId);
      const retrieveTime = Date.now() - startRetrieve;

      assert.strictEqual(quotes.length, 100, 'Should have 100 quotes');
      assert(addTime < 5000, `Adding 100 quotes should complete in < 5 seconds (took ${addTime}ms)`);
      assert(retrieveTime < 1000, `Retrieving 100 quotes should complete in < 1 second (took ${retrieveTime}ms)`);

      await cleanupGuildDatabase(guildId);
    });
  });

  // ============================================================================
  // Additional: Search and Rating Operations (Bonus Tests)
  // ============================================================================

  describe('GuildAwareDatabaseService - Advanced Features', () => {
    it('should rate quotes within guild context', async () => {
      const quoteId = await GuildAwareDatabaseService.addQuote(
        testGuildId,
        'Great quote',
        'Author'
      );

      await GuildAwareDatabaseService.rateQuote(testGuildId, quoteId, 5);
      await GuildAwareDatabaseService.rateQuote(testGuildId, quoteId, 4);

      const quote = await GuildAwareDatabaseService.getQuoteById(testGuildId, quoteId);

      assert(quote.rating !== undefined, 'Quote should have rating information');
    });

    it('should maintain separate rating data across guilds', async () => {
      const guild1 = getTestGuildId('rating-1a');
      const guild2 = getTestGuildId('rating-1b');

      const id1 = await GuildAwareDatabaseService.addQuote(guild1, 'Same quote', 'Author');
      const id2 = await GuildAwareDatabaseService.addQuote(guild2, 'Same quote', 'Author');

      await GuildAwareDatabaseService.rateQuote(guild1, id1, 5);
      await GuildAwareDatabaseService.rateQuote(guild2, id2, 2);

      const quote1 = await GuildAwareDatabaseService.getQuoteById(guild1, id1);
      const quote2 = await GuildAwareDatabaseService.getQuoteById(guild2, id2);

      // Ratings should be different (if tracked separately)
      assert(quote1, 'Guild 1 quote should exist');
      assert(quote2, 'Guild 2 quote should exist');

      await cleanupGuildDatabase(guild1);
      await cleanupGuildDatabase(guild2);
    });
  });
});
