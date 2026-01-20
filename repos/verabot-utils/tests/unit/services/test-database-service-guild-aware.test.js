const assert = require('assert');

/**
 * Enhanced Mock Database Service with Guild-Aware Support
 * 
 * This mock replicates guild-aware database behavior:
 * - Separate data stores per guild ID
 * - Multi-guild operation isolation
 * - Guild context preservation
 * - API compatibility detection
 */
class MockGuildAwareDatabaseService {
  constructor() {
    // Guild storage: { guildId: { quotes: [], ratings: [], tags: [] } }
    this.guildData = new Map();
  }

  /**
   * Get or create guild data structure
   * @private
   */
  _ensureGuild(guildId) {
    if (!this.guildData.has(guildId)) {
      this.guildData.set(guildId, {
        quotes: [],
        ratings: [],
        tags: [],
        nextId: 1
      });
    }
    return this.guildData.get(guildId);
  }

  /**
   * Get next quote ID for a guild
   * @private
   */
  _getNextId(guildId) {
    const guild = this._ensureGuild(guildId);
    return guild.nextId++;
  }

  // ==================== GUILD-AWARE OPERATIONS ====================

  /**
   * Add quote to guild's database
   * @param {string} guildId - Guild ID (required)
   * @param {string} text - Quote text
   * @param {string} author - Quote author
   * @returns {Promise<number>} Quote ID
   */
  async addQuote(guildId, text, author = 'Anonymous') {
    assert(guildId, 'Guild ID required');
    assert(text, 'Quote text required');

    const guild = this._ensureGuild(guildId);
    const id = this._getNextId(guildId);

    guild.quotes.push({
      id,
      guildId,
      text: String(text),
      author: String(author),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    return id;
  }

  /**
   * Get all quotes for a guild
   * @param {string} guildId - Guild ID (required)
   * @returns {Promise<Array>} Guild's quotes
   */
  async getAllQuotes(guildId) {
    assert(guildId, 'Guild ID required');
    const guild = this._ensureGuild(guildId);
    return [...guild.quotes];
  }

  /**
   * Get quote by ID from guild's database
   * @param {string} guildId - Guild ID (required)
   * @param {number} id - Quote ID
   * @returns {Promise<Object|null>} Quote or null
   */
  async getQuoteById(guildId, id) {
    assert(guildId, 'Guild ID required');
    const guild = this._ensureGuild(guildId);
    return guild.quotes.find(q => q.id === id) || null;
  }

  /**
   * Search quotes in a guild
   * @param {string} guildId - Guild ID (required)
   * @param {string} keyword - Search keyword
   * @returns {Promise<Array>} Matching quotes
   */
  async searchQuotes(guildId, keyword) {
    assert(guildId, 'Guild ID required');
    const guild = this._ensureGuild(guildId);
    
    if (!keyword) return [];

    const lowerKeyword = String(keyword).toLowerCase();
    return guild.quotes.filter(q =>
      q.text.toLowerCase().includes(lowerKeyword) ||
      q.author.toLowerCase().includes(lowerKeyword)
    );
  }

  /**
   * Rate a quote
   * @param {string} guildId - Guild ID (required)
   * @param {number} quoteId - Quote ID
   * @param {string} userId - User ID
   * @param {number} rating - Rating (1-5)
   * @returns {Promise<boolean>} Success
   */
  async rateQuote(guildId, quoteId, userId, rating) {
    assert(guildId, 'Guild ID required');
    assert(rating >= 1 && rating <= 5, 'Rating must be 1-5');

    const guild = this._ensureGuild(guildId);
    const quote = guild.quotes.find(q => q.id === quoteId);
    if (!quote) return false;

    const existing = guild.ratings.findIndex(
      r => r.quoteId === quoteId && r.userId === userId
    );

    if (existing >= 0) {
      guild.ratings[existing].rating = rating;
    } else {
      guild.ratings.push({ guildId, quoteId, userId, rating });
    }

    return true;
  }

  /**
   * Delete quote (with cascade to ratings)
   * @param {string} guildId - Guild ID (required)
   * @param {number} id - Quote ID
   * @returns {Promise<boolean>} Success
   */
  async deleteQuote(guildId, id) {
    assert(guildId, 'Guild ID required');
    const guild = this._ensureGuild(guildId);

    const idx = guild.quotes.findIndex(q => q.id === id);
    if (idx < 0) return false;

    guild.quotes.splice(idx, 1);
    guild.ratings = guild.ratings.filter(r => r.quoteId !== id);
    return true;
  }

  /**
   * Get guild statistics
   * @param {string} guildId - Guild ID (required)
   * @returns {Promise<Object>} Stats
   */
  async getGuildStats(guildId) {
    assert(guildId, 'Guild ID required');
    const guild = this._ensureGuild(guildId);

    return {
      guildId,
      totalQuotes: guild.quotes.length,
      totalRatings: guild.ratings.length,
      avgRating: guild.ratings.length > 0
        ? guild.ratings.reduce((sum, r) => sum + r.rating, 0) / guild.ratings.length
        : 0
    };
  }

  // ==================== CLEANUP ====================

  /**
   * Clear all data for testing
   * @returns {Promise<void>}
   */
  async close() {
    this.guildData.clear();
  }

  /**
   * Get all guild IDs (for testing)
   * @returns {Array<string>}
   */
  getGuildIds() {
    return Array.from(this.guildData.keys());
  }
}

// ==================== TEST SUITE ====================

describe('Guild-Aware Database Operations', () => {
  let db;

  beforeEach(async () => {
    db = new MockGuildAwareDatabaseService();
  });

  afterEach(async () => {
    await db.close();
  });

  // ==================== GUILD CONTEXT PRESERVATION ====================

  describe('Guild Context Preservation', () => {
    it('should preserve guild ID on quote addition', async () => {
      const guildId = '123456789012345678';
      const id = await db.addQuote(guildId, 'Test quote', 'Author');
      const quote = await db.getQuoteById(guildId, id);

      assert.strictEqual(quote.guildId, guildId);
    });

    it('should require guild ID for quote operations', async () => {
      const errors = [];

      try {
        await db.addQuote(null, 'Test', 'Author');
      } catch (e) {
        errors.push('addQuote');
      }

      try {
        await db.getAllQuotes(null);
      } catch (e) {
        errors.push('getAllQuotes');
      }

      try {
        await db.getQuoteById(null, 1);
      } catch (e) {
        errors.push('getQuoteById');
      }

      assert.strictEqual(errors.length, 3);
    });

    it('should include guild ID in all returned quotes', async () => {
      const guildId = '999888777666555444';
      await db.addQuote(guildId, 'Quote 1', 'Author 1');
      await db.addQuote(guildId, 'Quote 2', 'Author 2');

      const quotes = await db.getAllQuotes(guildId);
      quotes.forEach(quote => {
        assert.strictEqual(quote.guildId, guildId);
      });
    });

    it('should preserve guild context through rating operations', async () => {
      const guildId = '111222333444555666';
      const id = await db.addQuote(guildId, 'Quote', 'Author');
      await db.rateQuote(guildId, id, 'user1', 5);

      const quote = await db.getQuoteById(guildId, id);
      assert.strictEqual(quote.guildId, guildId);
    });
  });

  // ==================== MULTI-GUILD ISOLATION ====================

  describe('Multi-Guild Data Isolation', () => {
    it('should isolate quotes between guilds', async () => {
      const guild1 = 'guild-001';
      const guild2 = 'guild-002';

      await db.addQuote(guild1, 'Guild 1 Quote', 'Author 1');
      await db.addQuote(guild2, 'Guild 2 Quote', 'Author 2');

      const guild1Quotes = await db.getAllQuotes(guild1);
      const guild2Quotes = await db.getAllQuotes(guild2);

      assert.strictEqual(guild1Quotes.length, 1);
      assert.strictEqual(guild2Quotes.length, 1);
      assert.strictEqual(guild1Quotes[0].text, 'Guild 1 Quote');
      assert.strictEqual(guild2Quotes[0].text, 'Guild 2 Quote');
    });

    it('should not leak data across guilds on search', async () => {
      const guild1 = 'guild-alpha';
      const guild2 = 'guild-beta';

      await db.addQuote(guild1, 'Unique guild 1 quote', 'Author');
      await db.addQuote(guild2, 'Another guild 2 quote', 'Author');

      const guild1Results = await db.searchQuotes(guild1, 'guild');
      const guild2Results = await db.searchQuotes(guild2, 'guild');

      assert.strictEqual(guild1Results.length, 1);
      assert.strictEqual(guild2Results.length, 1);
      assert.strictEqual(guild1Results[0].text, 'Unique guild 1 quote');
      assert.strictEqual(guild2Results[0].text, 'Another guild 2 quote');
    });

    it('should maintain separate ID sequences per guild', async () => {
      const guild1 = 'guild-x';
      const guild2 = 'guild-y';

      const id1a = await db.addQuote(guild1, 'Quote 1', 'Author');
      const id1b = await db.addQuote(guild1, 'Quote 2', 'Author');
      const id2a = await db.addQuote(guild2, 'Quote 1', 'Author');
      const id2b = await db.addQuote(guild2, 'Quote 2', 'Author');

      // Each guild gets its own ID sequence starting at 1
      assert.strictEqual(id1a, 1);
      assert.strictEqual(id1b, 2);
      assert.strictEqual(id2a, 1);
      assert.strictEqual(id2b, 2);
    });

    it('should cascade delete only within guild', async () => {
      const guild1 = 'guild-del1';
      const guild2 = 'guild-del2';

      const id1 = await db.addQuote(guild1, 'Quote', 'Author');
      const id2 = await db.addQuote(guild2, 'Quote', 'Author');

      await db.rateQuote(guild1, id1, 'user1', 5);
      await db.rateQuote(guild2, id2, 'user1', 5);

      await db.deleteQuote(guild1, id1);

      const guild1Quotes = await db.getAllQuotes(guild1);
      const guild2Quotes = await db.getAllQuotes(guild2);

      assert.strictEqual(guild1Quotes.length, 0);
      assert.strictEqual(guild2Quotes.length, 1);
    });

    it('should support 100+ guilds independently', async () => {
      const guildIds = Array.from({ length: 100 }, (_, i) => `guild-${String(i).padStart(3, '0')}`);

      // Add one quote per guild
      for (const guildId of guildIds) {
        await db.addQuote(guildId, `Quote for ${guildId}`, 'Author');
      }

      // Verify isolation
      for (const guildId of guildIds) {
        const quotes = await db.getAllQuotes(guildId);
        assert.strictEqual(quotes.length, 1);
        assert.strictEqual(quotes[0].text, `Quote for ${guildId}`);
      }
    });

    it('should handle concurrent guild operations', async () => {
      const guild1 = 'concurrent-1';
      const guild2 = 'concurrent-2';

      const promise1 = Promise.all([
        db.addQuote(guild1, 'G1-Q1', 'Author'),
        db.addQuote(guild1, 'G1-Q2', 'Author'),
        db.addQuote(guild1, 'G1-Q3', 'Author')
      ]);

      const promise2 = Promise.all([
        db.addQuote(guild2, 'G2-Q1', 'Author'),
        db.addQuote(guild2, 'G2-Q2', 'Author')
      ]);

      await Promise.all([promise1, promise2]);

      const g1 = await db.getAllQuotes(guild1);
      const g2 = await db.getAllQuotes(guild2);

      assert.strictEqual(g1.length, 3);
      assert.strictEqual(g2.length, 2);
    });
  });

  // ==================== API COMPATIBILITY DETECTION ====================

  describe('API Compatibility & Detection', () => {
    it('should accept guild ID as first parameter (new API)', async () => {
      const guildId = 'test-guild-001';
      const id = await db.addQuote(guildId, 'Text', 'Author');

      const quote = await db.getQuoteById(guildId, id);
      assert(quote);
      assert.strictEqual(quote.guildId, guildId);
    });

    it('should enforce guild-aware requirement', async () => {
      let errorThrown = false;

      try {
        await db.addQuote(undefined, 'Text', 'Author');
      } catch (e) {
        errorThrown = true;
        assert(e.message.includes('Guild'));
      }

      assert(errorThrown);
    });

    it('should handle Discord ID format (18-20 digits)', async () => {
      const discordGuildIds = [
        '123456789012345678', // 18 digits
        '1234567890123456789', // 19 digits
        '12345678901234567890' // 20 digits
      ];

      for (const guildId of discordGuildIds) {
        const id = await db.addQuote(guildId, 'Quote', 'Author');
        const quote = await db.getQuoteById(guildId, id);
        assert.strictEqual(quote.guildId, guildId);
      }
    });

    it('should support non-numeric guild identifiers', async () => {
      const guildIds = [
        'dev-guild',
        'test-123',
        'prod_main',
        'custom-guild-id-abc'
      ];

      for (const guildId of guildIds) {
        const id = await db.addQuote(guildId, 'Quote', 'Author');
        const quote = await db.getQuoteById(guildId, id);
        assert.strictEqual(quote.guildId, guildId);
      }
    });
  });

  // ==================== GUILD-AWARE QUERY OPERATIONS ====================

  describe('Guild-Aware Query Operations', () => {
    it('should search only within guild context', async () => {
      const guild1 = 'search-guild-1';
      const guild2 = 'search-guild-2';

      await db.addQuote(guild1, 'famous quote about life', 'Author A');
      await db.addQuote(guild1, 'another quote', 'Author B');
      await db.addQuote(guild2, 'famous quote about death', 'Author C');

      const guild1Results = await db.searchQuotes(guild1, 'famous');
      const guild2Results = await db.searchQuotes(guild2, 'famous');

      assert.strictEqual(guild1Results.length, 1);
      assert.strictEqual(guild1Results[0].text, 'famous quote about life');
      assert.strictEqual(guild2Results.length, 1);
      assert.strictEqual(guild2Results[0].text, 'famous quote about death');
    });

    it('should handle empty search results per guild', async () => {
      const guild1 = 'empty-search-1';
      const guild2 = 'empty-search-2';

      await db.addQuote(guild1, 'Quote with specific text', 'Author');
      await db.addQuote(guild2, 'Different text', 'Author');

      const noResults = await db.searchQuotes(guild1, 'nonexistent');
      assert.strictEqual(noResults.length, 0);
    });

    it('should return empty array for new guild', async () => {
      const quotes = await db.getAllQuotes('brand-new-guild');
      assert.deepStrictEqual(quotes, []);
    });
  });

  // ==================== GUILD STATISTICS ====================

  describe('Guild Statistics & Analytics', () => {
    it('should provide per-guild statistics', async () => {
      const guild1 = 'stats-guild-1';
      const guild2 = 'stats-guild-2';

      const id1 = await db.addQuote(guild1, 'Quote 1', 'Author');
      const id2 = await db.addQuote(guild2, 'Quote 1', 'Author');

      await db.rateQuote(guild1, id1, 'user1', 5);
      await db.rateQuote(guild1, id1, 'user2', 3);
      await db.rateQuote(guild2, id2, 'user1', 4);

      const stats1 = await db.getGuildStats(guild1);
      const stats2 = await db.getGuildStats(guild2);

      assert.strictEqual(stats1.guildId, guild1);
      assert.strictEqual(stats1.totalQuotes, 1);
      assert.strictEqual(stats1.totalRatings, 2);
      assert.strictEqual(stats1.avgRating, 4); // (5+3)/2

      assert.strictEqual(stats2.guildId, guild2);
      assert.strictEqual(stats2.totalQuotes, 1);
      assert.strictEqual(stats2.totalRatings, 1);
      assert.strictEqual(stats2.avgRating, 4);
    });

    it('should not share statistics across guilds', async () => {
      const guild1 = 'isolated-stats-1';
      const guild2 = 'isolated-stats-2';

      for (let i = 0; i < 5; i++) {
        await db.addQuote(guild1, `Quote ${i}`, 'Author');
      }

      for (let i = 0; i < 3; i++) {
        await db.addQuote(guild2, `Quote ${i}`, 'Author');
      }

      const stats1 = await db.getGuildStats(guild1);
      const stats2 = await db.getGuildStats(guild2);

      assert.strictEqual(stats1.totalQuotes, 5);
      assert.strictEqual(stats2.totalQuotes, 3);
    });
  });

  // ==================== GUILD DATA CLEANUP ====================

  describe('Guild Data Management', () => {
    it('should clear all guild data on close', async () => {
      const guild1 = 'cleanup-guild-1';

      await db.addQuote(guild1, 'Quote', 'Author');
      assert.strictEqual((await db.getAllQuotes(guild1)).length, 1);

      await db.close();
      const emptyGuildIds = db.getGuildIds();
      assert.strictEqual(emptyGuildIds.length, 0);
    });

    it('should allow reinitialization after close', async () => {
      const guild1 = 'reinit-guild';

      await db.addQuote(guild1, 'Quote 1', 'Author');
      await db.close();

      const id = await db.addQuote(guild1, 'Quote 2', 'Author');
      const quote = await db.getQuoteById(guild1, id);

      assert.strictEqual(quote.text, 'Quote 2');
    });

    it('should track active guilds', async () => {
      const guilds = ['guild-a', 'guild-b', 'guild-c'];

      for (const guild of guilds) {
        await db.addQuote(guild, 'Quote', 'Author');
      }

      const activeGuilds = db.getGuildIds();
      assert.strictEqual(activeGuilds.length, 3);
      for (const guild of guilds) {
        assert(activeGuilds.includes(guild));
      }
    });
  });

  // ==================== EDGE CASES & ERROR HANDLING ====================

  describe('Guild-Aware Edge Cases', () => {
    it('should handle operations on same quote ID across guilds', async () => {
      const guild1 = 'edge-guild-1';
      const guild2 = 'edge-guild-2';

      // Both guilds will get ID 1 for their first quote
      const id1 = await db.addQuote(guild1, 'Guild 1 Quote', 'Author');
      const id2 = await db.addQuote(guild2, 'Guild 2 Quote', 'Author');

      assert.strictEqual(id1, 1);
      assert.strictEqual(id2, 1);

      const quote1 = await db.getQuoteById(guild1, id1);
      const quote2 = await db.getQuoteById(guild2, id2);

      assert.strictEqual(quote1.text, 'Guild 1 Quote');
      assert.strictEqual(quote2.text, 'Guild 2 Quote');
    });

    it('should not find quote from guild A in guild B', async () => {
      const guild1 = 'exist-guild-1';
      const guild2 = 'exist-guild-2';

      const id = await db.addQuote(guild1, 'Quote', 'Author');
      const quote = await db.getQuoteById(guild2, id);

      assert.strictEqual(quote, null);
    });

    it('should handle guild ID with special characters', async () => {
      const guildId = 'guild-with-special_chars.123';
      const id = await db.addQuote(guildId, 'Quote', 'Author');
      const quote = await db.getQuoteById(guildId, id);

      assert(quote);
      assert.strictEqual(quote.guildId, guildId);
    });

    it('should prevent cross-guild rating operations', async () => {
      const guild1 = 'rating-guild-1';
      const guild2 = 'rating-guild-2';

      const id1 = await db.addQuote(guild1, 'Quote 1', 'Author');
      const id2 = await db.addQuote(guild1, 'Quote 2', 'Author');
      const id3 = await db.addQuote(guild2, 'Quote 3', 'Author');

      // Quotes in guild1: ID 1, 2
      // Quotes in guild2: ID 1 (not 3, because guild2 starts at 1)
      // Try to rate quote with ID 3 in guild1 context (doesn't exist)
      const success = await db.rateQuote(guild1, 999, 'user1', 5);

      // Should fail because ID 999 doesn't exist in guild1
      assert.strictEqual(success, false);
    });
  });
});
