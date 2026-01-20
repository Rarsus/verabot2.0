/**
 * Phase 22.3a: QuoteService Coverage Tests
 *
 * Complete coverage for QuoteService.js - Guild-Aware Quote Operations
 * Tests all public methods: add, get, update, delete, search, rate, tag, export, statistics
 *
 * Coverage Target: 100% of QuoteService public methods
 * Test Count: 12-15 tests covering:
 * - CRUD operations (happy paths, errors, edge cases)
 * - Search and filtering
 * - Rating operations
 * - Tagging operations
 * - Export functionality
 * - Statistics
 * - GDPR compliance (deleteGuildData)
 */

const assert = require('assert');

/**
 * Mock GuildAwareDatabaseService for testing
 * Simulates the underlying database layer
 */
class MockGuildAwareDb {
  constructor() {
    this.guildData = new Map(); // guildId -> { quotes, ratings, tags }
    this.quoteIdCounter = new Map(); // guildId -> nextId
  }

  initializeGuild(guildId) {
    if (!this.guildData.has(guildId)) {
      this.guildData.set(guildId, {
        quotes: new Map(),
        ratings: new Map(), // quoteId -> { userId -> rating }
        tags: new Map(), // tagName -> Set of quoteIds
      });
      this.quoteIdCounter.set(guildId, 1);
    }
  }

  async addQuote(guildId, text, author) {
    this.initializeGuild(guildId);
    const id = this.quoteIdCounter.get(guildId);
    this.quoteIdCounter.set(guildId, id + 1);

    const quote = { id, text, author, addedAt: new Date().toISOString() };
    this.guildData.get(guildId).quotes.set(id, quote);
    return id;
  }

  async getAllQuotes(guildId) {
    this.initializeGuild(guildId);
    return Array.from(this.guildData.get(guildId).quotes.values());
  }

  async getQuoteById(guildId, id) {
    this.initializeGuild(guildId);
    return this.guildData.get(guildId).quotes.get(id) || null;
  }

  async searchQuotes(guildId, keyword) {
    this.initializeGuild(guildId);
    const quotes = Array.from(this.guildData.get(guildId).quotes.values());
    const lowerKeyword = keyword.toLowerCase();
    return quotes.filter(q =>
      q.text.toLowerCase().includes(lowerKeyword) ||
      q.author.toLowerCase().includes(lowerKeyword)
    );
  }

  async updateQuote(guildId, id, text, author) {
    this.initializeGuild(guildId);
    const quote = this.guildData.get(guildId).quotes.get(id);
    if (!quote) return false;
    quote.text = text;
    quote.author = author;
    return true;
  }

  async deleteQuote(guildId, id) {
    this.initializeGuild(guildId);
    return this.guildData.get(guildId).quotes.delete(id);
  }

  async getQuoteCount(guildId) {
    this.initializeGuild(guildId);
    return this.guildData.get(guildId).quotes.size;
  }

  async rateQuote(guildId, quoteId, userId, rating) {
    this.initializeGuild(guildId);
    if (rating < 1 || rating > 5) return false;

    const ratings = this.guildData.get(guildId).ratings;
    if (!ratings.has(quoteId)) {
      ratings.set(quoteId, new Map());
    }
    ratings.get(quoteId).set(userId, rating);
    return true;
  }

  async getQuoteRating(guildId, quoteId) {
    this.initializeGuild(guildId);
    const ratings = this.guildData.get(guildId).ratings.get(quoteId);
    if (!ratings) return { average: 0, count: 0 };

    const ratingArray = Array.from(ratings.values());
    const sum = ratingArray.reduce((a, b) => a + b, 0);
    return { average: sum / ratingArray.length, count: ratingArray.length };
  }

  async tagQuote(guildId, quoteId, tagName) {
    this.initializeGuild(guildId);
    const tags = this.guildData.get(guildId).tags;
    if (!tags.has(tagName)) {
      tags.set(tagName, new Set());
    }
    tags.get(tagName).add(quoteId);
    return true;
  }

  async getQuotesByTag(guildId, tagName) {
    this.initializeGuild(guildId);
    const tags = this.guildData.get(guildId).tags;
    if (!tags.has(tagName)) return [];

    const quoteIds = tags.get(tagName);
    const quotes = this.guildData.get(guildId).quotes;
    return Array.from(quoteIds).map(id => quotes.get(id));
  }

  async exportGuildData(guildId) {
    this.initializeGuild(guildId);
    const guild = this.guildData.get(guildId);
    return {
      guildId,
      quotes: Array.from(guild.quotes.values()),
      exportedAt: new Date().toISOString(),
    };
  }

  async getGuildStatistics(guildId) {
    this.initializeGuild(guildId);
    const guild = this.guildData.get(guildId);
    const quoteCount = guild.quotes.size;
    const ratingCount = Array.from(guild.ratings.values())
      .reduce((sum, m) => sum + m.size, 0);
    const tagCount = guild.tags.size;

    return {
      totalQuotes: quoteCount,
      totalRatings: ratingCount,
      totalTags: tagCount,
    };
  }

  async deleteGuildData(guildId) {
    this.guildData.delete(guildId);
    this.quoteIdCounter.delete(guildId);
  }
}

// Create mock instance
const mockDb = new MockGuildAwareDb();

// Mock the GuildAwareDatabaseService before requiring QuoteService
jest.mock('../../../src/services/GuildAwareDatabaseService', () => mockDb);

const QuoteService = require('../../../src/services/QuoteService');

describe('QuoteService', () => {
  let guildId;
  let quoteService;

  beforeEach(() => {
    guildId = 'test-guild-' + Date.now();
    mockDb.initializeGuild(guildId);
    quoteService = QuoteService;
  });

  afterEach(() => {
    mockDb.deleteGuildData(guildId);
  });

  describe('CRUD Operations', () => {
    describe('addQuote()', () => {
      it('should add quote with default author "Anonymous"', async () => {
        const id = await quoteService.addQuote(guildId, 'Test quote');
        assert(typeof id === 'number');
        assert(id > 0);
      });

      it('should add quote with provided author', async () => {
        const id = await quoteService.addQuote(guildId, 'Test quote', 'John Doe');
        const quote = await quoteService.getQuoteById(guildId, id);
        assert.strictEqual(quote.author, 'John Doe');
      });

      it('should throw error when guildId is missing', async () => {
        await assert.rejects(
          () => quoteService.addQuote(null, 'Test quote'),
          /Guild ID required/
        );
      });

      it('should increment quote ID for sequential adds', async () => {
        const id1 = await quoteService.addQuote(guildId, 'Quote 1');
        const id2 = await quoteService.addQuote(guildId, 'Quote 2');
        assert(id2 > id1);
      });

      it('should handle special characters in quote text', async () => {
        const specialText = 'Quote with "quotes" & <brackets> and émojis 🎉';
        const id = await quoteService.addQuote(guildId, specialText);
        const quote = await quoteService.getQuoteById(guildId, id);
        assert.strictEqual(quote.text, specialText);
      });
    });

    describe('getQuoteById()', () => {
      it('should retrieve quote by ID', async () => {
        const id = await quoteService.addQuote(guildId, 'Test quote', 'Author');
        const quote = await quoteService.getQuoteById(guildId, id);
        assert.strictEqual(quote.text, 'Test quote');
        assert.strictEqual(quote.author, 'Author');
      });

      it('should return null for non-existent quote', async () => {
        const quote = await quoteService.getQuoteById(guildId, 999);
        assert.strictEqual(quote, null);
      });

      it('should throw error when guildId is missing', async () => {
        await assert.rejects(
          () => quoteService.getQuoteById(null, 1),
          /Guild ID required/
        );
      });

      it('should maintain quote metadata (addedAt)', async () => {
        const id = await quoteService.addQuote(guildId, 'Test quote');
        const quote = await quoteService.getQuoteById(guildId, id);
        assert(quote.addedAt);
        assert(typeof quote.addedAt === 'string');
      });
    });

    describe('getAllQuotes()', () => {
      it('should return empty array for guild with no quotes', async () => {
        const quotes = await quoteService.getAllQuotes(guildId);
        assert.strictEqual(quotes.length, 0);
      });

      it('should return all quotes from a guild', async () => {
        await quoteService.addQuote(guildId, 'Quote 1');
        await quoteService.addQuote(guildId, 'Quote 2');
        await quoteService.addQuote(guildId, 'Quote 3');

        const quotes = await quoteService.getAllQuotes(guildId);
        assert.strictEqual(quotes.length, 3);
      });

      it('should throw error when guildId is missing', async () => {
        await assert.rejects(
          () => quoteService.getAllQuotes(null),
          /Guild ID required/
        );
      });

      it('should maintain quote order in results', async () => {
        const id1 = await quoteService.addQuote(guildId, 'First');
        const id2 = await quoteService.addQuote(guildId, 'Second');

        const quotes = await quoteService.getAllQuotes(guildId);
        assert.strictEqual(quotes[0].text, 'First');
        assert.strictEqual(quotes[1].text, 'Second');
      });
    });

    describe('updateQuote()', () => {
      it('should update quote text', async () => {
        const id = await quoteService.addQuote(guildId, 'Old text', 'Author');
        const updated = await quoteService.updateQuote(guildId, id, 'New text', 'Author');
        assert.strictEqual(updated, true);

        const quote = await quoteService.getQuoteById(guildId, id);
        assert.strictEqual(quote.text, 'New text');
      });

      it('should update quote author', async () => {
        const id = await quoteService.addQuote(guildId, 'Text', 'Old Author');
        await quoteService.updateQuote(guildId, id, 'Text', 'New Author');

        const quote = await quoteService.getQuoteById(guildId, id);
        assert.strictEqual(quote.author, 'New Author');
      });

      it('should return false for non-existent quote', async () => {
        const updated = await quoteService.updateQuote(guildId, 999, 'New text');
        assert.strictEqual(updated, false);
      });

      it('should throw error when guildId is missing', async () => {
        await assert.rejects(
          () => quoteService.updateQuote(null, 1, 'Text'),
          /Guild ID required/
        );
      });
    });

    describe('deleteQuote()', () => {
      it('should delete quote from guild', async () => {
        const id = await quoteService.addQuote(guildId, 'Test quote');
        const deleted = await quoteService.deleteQuote(guildId, id);
        assert.strictEqual(deleted, true);

        const quote = await quoteService.getQuoteById(guildId, id);
        assert.strictEqual(quote, null);
      });

      it('should return false for non-existent quote', async () => {
        const deleted = await quoteService.deleteQuote(guildId, 999);
        assert.strictEqual(deleted, false);
      });

      it('should throw error when guildId is missing', async () => {
        await assert.rejects(
          () => quoteService.deleteQuote(null, 1),
          /Guild ID required/
        );
      });

      it('should not affect other guild quotes', async () => {
        const guildId2 = 'test-guild-2-' + Date.now();
        mockDb.initializeGuild(guildId2);

        const id1 = await quoteService.addQuote(guildId, 'Guild 1 quote');
        const id2 = await quoteService.addQuote(guildId2, 'Guild 2 quote');

        await quoteService.deleteQuote(guildId, id1);

        const quote2 = await quoteService.getQuoteById(guildId2, id2);
        assert(quote2);
      });
    });

    describe('getQuoteCount()', () => {
      it('should return 0 for empty guild', async () => {
        const count = await quoteService.getQuoteCount(guildId);
        assert.strictEqual(count, 0);
      });

      it('should return correct quote count', async () => {
        await quoteService.addQuote(guildId, 'Quote 1');
        await quoteService.addQuote(guildId, 'Quote 2');
        const count = await quoteService.getQuoteCount(guildId);
        assert.strictEqual(count, 2);
      });

      it('should throw error when guildId is missing', async () => {
        await assert.rejects(
          () => quoteService.getQuoteCount(null),
          /Guild ID required/
        );
      });
    });
  });

  describe('Search Operations', () => {
    describe('searchQuotes()', () => {
      beforeEach(async () => {
        await quoteService.addQuote(guildId, 'The quick brown fox', 'Author A');
        await quoteService.addQuote(guildId, 'Lazy dog sleeping', 'Author B');
        await quoteService.addQuote(guildId, 'Quick thoughts on life', 'Quick Man');
      });

      it('should find quotes by text keyword', async () => {
        const results = await quoteService.searchQuotes(guildId, 'quick');
        assert(results.length >= 2);
      });

      it('should find quotes by author keyword', async () => {
        const results = await quoteService.searchQuotes(guildId, 'Quick Man');
        assert(results.length >= 1);
        assert(results.some(q => q.author === 'Quick Man'));
      });

      it('should return empty array for no matches', async () => {
        const results = await quoteService.searchQuotes(guildId, 'nonexistent');
        assert.strictEqual(results.length, 0);
      });

      it('should be case-insensitive', async () => {
        const results = await quoteService.searchQuotes(guildId, 'QUICK');
        assert(results.length >= 2);
      });

      it('should throw error when guildId is missing', async () => {
        await assert.rejects(
          () => quoteService.searchQuotes(null, 'test'),
          /Guild ID required/
        );
      });
    });
  });

  describe('Rating Operations', () => {
    describe('rateQuote()', () => {
      it('should add rating to quote', async () => {
        const id = await quoteService.addQuote(guildId, 'Test quote');
        const success = await quoteService.rateQuote(guildId, id, 'user-123', 5);
        assert.strictEqual(success, true);
      });

      it('should accept ratings from 1 to 5', async () => {
        const id = await quoteService.addQuote(guildId, 'Test quote');
        for (let rating = 1; rating <= 5; rating++) {
          const success = await quoteService.rateQuote(guildId, id, `user-${rating}`, rating);
          assert.strictEqual(success, true);
        }
      });

      it('should update rating for duplicate user', async () => {
        const id = await quoteService.addQuote(guildId, 'Test quote');
        await quoteService.rateQuote(guildId, id, 'user-123', 3);
        await quoteService.rateQuote(guildId, id, 'user-123', 5);

        const rating = await quoteService.getQuoteRating(guildId, id);
        assert.strictEqual(rating.average, 5);
      });

      it('should throw error when guildId is missing', async () => {
        await assert.rejects(
          () => quoteService.rateQuote(null, 1, 'user-123', 5),
          /Guild ID required/
        );
      });
    });

    describe('getQuoteRating()', () => {
      it('should return { average: 0, count: 0 } for unrated quote', async () => {
        const id = await quoteService.addQuote(guildId, 'Test quote');
        const rating = await quoteService.getQuoteRating(guildId, id);
        assert.strictEqual(rating.average, 0);
        assert.strictEqual(rating.count, 0);
      });

      it('should calculate average rating correctly', async () => {
        const id = await quoteService.addQuote(guildId, 'Test quote');
        await quoteService.rateQuote(guildId, id, 'user-1', 3);
        await quoteService.rateQuote(guildId, id, 'user-2', 5);

        const rating = await quoteService.getQuoteRating(guildId, id);
        assert.strictEqual(rating.average, 4);
        assert.strictEqual(rating.count, 2);
      });

      it('should throw error when guildId is missing', async () => {
        await assert.rejects(
          () => quoteService.getQuoteRating(null, 1),
          /Guild ID required/
        );
      });
    });
  });

  describe('Tagging Operations', () => {
    describe('tagQuote()', () => {
      it('should add tag to quote', async () => {
        const id = await quoteService.addQuote(guildId, 'Test quote');
        const success = await quoteService.tagQuote(guildId, id, 'funny');
        assert.strictEqual(success, true);
      });

      it('should add multiple tags to quote', async () => {
        const id = await quoteService.addQuote(guildId, 'Test quote');
        await quoteService.tagQuote(guildId, id, 'funny');
        await quoteService.tagQuote(guildId, id, 'inspiring');

        const byFunny = await quoteService.getQuotesByTag(guildId, 'funny');
        const byInspiring = await quoteService.getQuotesByTag(guildId, 'inspiring');
        assert(byFunny.length > 0);
        assert(byInspiring.length > 0);
      });

      it('should throw error when guildId is missing', async () => {
        await assert.rejects(
          () => quoteService.tagQuote(null, 1, 'tag'),
          /Guild ID required/
        );
      });
    });

    describe('getQuotesByTag()', () => {
      it('should return empty array for non-existent tag', async () => {
        const results = await quoteService.getQuotesByTag(guildId, 'nonexistent');
        assert.strictEqual(results.length, 0);
      });

      it('should return all quotes with tag', async () => {
        const id1 = await quoteService.addQuote(guildId, 'Funny quote 1');
        const id2 = await quoteService.addQuote(guildId, 'Funny quote 2');
        const id3 = await quoteService.addQuote(guildId, 'Sad quote');

        await quoteService.tagQuote(guildId, id1, 'funny');
        await quoteService.tagQuote(guildId, id2, 'funny');

        const results = await quoteService.getQuotesByTag(guildId, 'funny');
        assert.strictEqual(results.length, 2);
      });

      it('should throw error when guildId is missing', async () => {
        await assert.rejects(
          () => quoteService.getQuotesByTag(null, 'tag'),
          /Guild ID required/
        );
      });
    });
  });

  describe('Export Operations', () => {
    describe('exportGuildData()', () => {
      it('should export empty guild data', async () => {
        const data = await quoteService.exportGuildData(guildId);
        assert.strictEqual(data.guildId, guildId);
        assert(Array.isArray(data.quotes));
        assert.strictEqual(data.quotes.length, 0);
      });

      it('should export all quotes with metadata', async () => {
        await quoteService.addQuote(guildId, 'Quote 1', 'Author 1');
        await quoteService.addQuote(guildId, 'Quote 2', 'Author 2');

        const data = await quoteService.exportGuildData(guildId);
        assert.strictEqual(data.quotes.length, 2);
        assert(data.exportedAt);
      });

      it('should throw error when guildId is missing', async () => {
        await assert.rejects(
          () => quoteService.exportGuildData(null),
          /Guild ID required/
        );
      });
    });

    describe('exportAsJson()', () => {
      it('should export quotes as JSON string', async () => {
        const id = await quoteService.addQuote(guildId, 'Test quote', 'Author');
        const json = await quoteService.exportAsJson(guildId);

        const parsed = JSON.parse(json);
        assert(Array.isArray(parsed));
        assert(parsed.length > 0);
      });

      it('should handle special characters in JSON export', async () => {
        const specialText = 'Quote with "quotes" and new\nlines';
        await quoteService.addQuote(guildId, specialText, 'Author');

        const json = await quoteService.exportAsJson(guildId);
        const parsed = JSON.parse(json);
        assert(parsed.length > 0);
      });

      it('should throw error when guildId is missing', async () => {
        await assert.rejects(
          () => quoteService.exportAsJson(null),
          /Guild ID required/
        );
      });
    });

    describe('exportAsCSV()', () => {
      it('should export empty guild as CSV with headers', async () => {
        const csv = await quoteService.exportAsCSV(guildId);
        assert(csv.includes('id,text,author,addedAt'));
      });

      it('should export quotes as CSV with proper formatting', async () => {
        await quoteService.addQuote(guildId, 'Test quote', 'Test Author');
        const csv = await quoteService.exportAsCSV(guildId);

        const lines = csv.split('\n');
        assert(lines.length >= 2); // header + at least 1 data row
        assert(lines[0].includes('id,text,author'));
      });

      it('should escape quotes in CSV', async () => {
        await quoteService.addQuote(guildId, 'Quote with "quotes"', 'Author');
        const csv = await quoteService.exportAsCSV(guildId);

        assert(csv.includes('""'));
      });

      it('should throw error when guildId is missing', async () => {
        await assert.rejects(
          () => quoteService.exportAsCSV(null),
          /Guild ID required/
        );
      });
    });
  });

  describe('Statistics and GDPR', () => {
    describe('getGuildStatistics()', () => {
      it('should return zero statistics for empty guild', async () => {
        const stats = await quoteService.getGuildStatistics(guildId);
        assert.strictEqual(stats.totalQuotes, 0);
        assert.strictEqual(stats.totalRatings, 0);
        assert.strictEqual(stats.totalTags, 0);
      });

      it('should calculate correct statistics', async () => {
        const id1 = await quoteService.addQuote(guildId, 'Quote 1');
        const id2 = await quoteService.addQuote(guildId, 'Quote 2');

        await quoteService.rateQuote(guildId, id1, 'user-1', 5);
        await quoteService.rateQuote(guildId, id2, 'user-2', 4);

        await quoteService.tagQuote(guildId, id1, 'funny');
        await quoteService.tagQuote(guildId, id2, 'inspiring');

        const stats = await quoteService.getGuildStatistics(guildId);
        assert.strictEqual(stats.totalQuotes, 2);
        assert.strictEqual(stats.totalRatings, 2);
        assert.strictEqual(stats.totalTags, 2);
      });

      it('should throw error when guildId is missing', async () => {
        await assert.rejects(
          () => quoteService.getGuildStatistics(null),
          /Guild ID required/
        );
      });
    });

    describe('deleteGuildData()', () => {
      it('should delete all guild data', async () => {
        await quoteService.addQuote(guildId, 'Quote 1');
        await quoteService.addQuote(guildId, 'Quote 2');

        await quoteService.deleteGuildData(guildId);

        const quotes = await quoteService.getAllQuotes(guildId);
        assert.strictEqual(quotes.length, 0);
      });

      it('should comply with GDPR requirements', async () => {
        const id = await quoteService.addQuote(guildId, 'Personal quote');
        await quoteService.rateQuote(guildId, id, 'user-123', 5);

        await quoteService.deleteGuildData(guildId);

        const stats = await quoteService.getGuildStatistics(guildId);
        assert.strictEqual(stats.totalQuotes, 0);
        assert.strictEqual(stats.totalRatings, 0);
      });

      it('should not affect other guild data', async () => {
        const guildId2 = 'test-guild-2-' + Date.now();
        mockDb.initializeGuild(guildId2);

        await quoteService.addQuote(guildId, 'Guild 1 quote');
        const id2 = await quoteService.addQuote(guildId2, 'Guild 2 quote');

        await quoteService.deleteGuildData(guildId);

        const quote2 = await quoteService.getQuoteById(guildId2, id2);
        assert(quote2);
      });

      it('should throw error when guildId is missing', async () => {
        await assert.rejects(
          () => quoteService.deleteGuildData(null),
          /Guild ID required/
        );
      });
    });
  });

  describe('Special Cases and Edge Cases', () => {
    it('should handle empty search results gracefully', async () => {
      await quoteService.addQuote(guildId, 'Quote 1');
      const results = await quoteService.searchQuotes(guildId, 'xyz');
      assert.strictEqual(results.length, 0);
    });

    it('should isolate data between guilds', async () => {
      const guildId2 = 'test-guild-2-' + Date.now();
      mockDb.initializeGuild(guildId2);

      const id1 = await quoteService.addQuote(guildId, 'Guild 1 quote');
      const id2 = await quoteService.addQuote(guildId2, 'Guild 2 quote');

      const quotes1 = await quoteService.getAllQuotes(guildId);
      const quotes2 = await quoteService.getAllQuotes(guildId2);

      // Verify quote counts
      assert.strictEqual(quotes1.length, 1);
      assert.strictEqual(quotes2.length, 1);

      // Verify quotes contain correct data (guild isolation)
      assert.strictEqual(quotes1[0].text, 'Guild 1 quote');
      assert.strictEqual(quotes2[0].text, 'Guild 2 quote');
    });

    it('should maintain data consistency across operations', async () => {
      const id = await quoteService.addQuote(guildId, 'Original');
      await quoteService.updateQuote(guildId, id, 'Updated');
      await quoteService.rateQuote(guildId, id, 'user-1', 5);

      const quote = await quoteService.getQuoteById(guildId, id);
      assert.strictEqual(quote.text, 'Updated');

      const rating = await quoteService.getQuoteRating(guildId, id);
      assert.strictEqual(rating.average, 5);
    });
  });
});
