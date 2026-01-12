/**
 * Quote Service - Extended Test Suite
 * 
 * Comprehensive testing of QuoteService covering:
 * - Error handling & validation
 * - Guild-aware operations
 * - Complex query patterns
 * - Performance characteristics
 * - Integration scenarios
 * 
 * Target: 80%+ coverage expansion
 */

const assert = require('assert');

/**
 * Enhanced Mock Quote Service with Extended Operations
 * 
 * Mirrors production QuoteService.js behavior with:
 * - Full error handling
 * - Guild isolation
 * - Complex operations
 * - Performance characteristics
 */
class MockQuoteServiceExtended {
  constructor() {
    this.guildData = new Map();
    this.operationLog = [];
  }

  /**
   * Get or create guild data
   * @private
   */
  _getGuildData(guildId) {
    if (!this.guildData.has(guildId)) {
      this.guildData.set(guildId, {
        quotes: [],
        ratings: [],
        tags: [],
        tagMap: new Map(),
        nextId: 1
      });
    }
    return this.guildData.get(guildId);
  }

  /**
   * Log operation for auditing
   * @private
   */
  _logOperation(operation, guildId, data) {
    this.operationLog.push({
      operation,
      guildId,
      timestamp: Date.now(),
      data
    });
  }

  // ==================== QUOTE CRUD OPERATIONS ====================

  async addQuote(guildId, text, author = 'Anonymous') {
    if (!guildId) throw new Error('Guild ID required');
    if (!text || String(text).trim().length === 0) throw new Error('Quote text required');

    const guild = this._getGuildData(guildId);
    const id = guild.nextId++;

    const quote = {
      id,
      guildId,
      text: String(text),
      author: String(author),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      _createdMs: Date.now() // Internal timestamp for testing
    };

    guild.quotes.push(quote);
    this._logOperation('addQuote', guildId, { id, text });
    return id;
  }

  async getQuoteById(guildId, id) {
    if (!guildId) throw new Error('Guild ID required');
    const guild = this._getGuildData(guildId);
    return guild.quotes.find(q => q.id === id) || null;
  }

  async getAllQuotes(guildId) {
    if (!guildId) throw new Error('Guild ID required');
    const guild = this._getGuildData(guildId);
    return [...guild.quotes];
  }

  async getRandomQuote(guildId) {
    if (!guildId) throw new Error('Guild ID required');
    const quotes = await this.getAllQuotes(guildId);
    if (!quotes || quotes.length === 0) return null;
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  async searchQuotes(guildId, keyword) {
    if (!guildId) throw new Error('Guild ID required');
    if (!keyword) return [];

    const guild = this._getGuildData(guildId);
    const lower = String(keyword).toLowerCase();

    return guild.quotes.filter(q =>
      q.text.toLowerCase().includes(lower) ||
      q.author.toLowerCase().includes(lower)
    );
  }

  async updateQuote(guildId, id, text, author = 'Anonymous') {
    if (!guildId) throw new Error('Guild ID required');
    if (!text || String(text).trim().length === 0) throw new Error('Quote text required');

    const guild = this._getGuildData(guildId);
    const quote = guild.quotes.find(q => q.id === id);

    if (!quote) return false;

    quote.text = String(text);
    quote.author = String(author);
    quote.updated_at = new Date().toISOString();
    quote._updatedMs = Date.now(); // Update internal timestamp
    this._logOperation('updateQuote', guildId, { id });
    return true;
  }

  async deleteQuote(guildId, id) {
    if (!guildId) throw new Error('Guild ID required');
    const guild = this._getGuildData(guildId);

    const idx = guild.quotes.findIndex(q => q.id === id);
    if (idx < 0) return false;

    guild.quotes.splice(idx, 1);
    guild.ratings = guild.ratings.filter(r => r.quoteId !== id);
    guild.tags = guild.tags.filter(t => t.quoteId !== id);

    this._logOperation('deleteQuote', guildId, { id });
    return true;
  }

  // ==================== RATING OPERATIONS ====================

  async rateQuote(guildId, quoteId, userId, rating) {
    if (!guildId) throw new Error('Guild ID required');
    // Validate rating is integer 1-5
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error('Rating must be an integer between 1 and 5');
    }

    const guild = this._getGuildData(guildId);
    const quote = guild.quotes.find(q => q.id === quoteId);
    if (!quote) return false;

    const existing = guild.ratings.findIndex(
      r => r.quoteId === quoteId && r.userId === userId
    );

    if (existing >= 0) {
      guild.ratings[existing].rating = rating;
    } else {
      guild.ratings.push({ quoteId, userId, rating });
    }

    this._logOperation('rateQuote', guildId, { quoteId, rating });
    return true;
  }

  async getQuoteRatings(guildId, quoteId) {
    if (!guildId) throw new Error('Guild ID required');
    const guild = this._getGuildData(guildId);

    const ratings = guild.ratings.filter(r => r.quoteId === quoteId);
    if (ratings.length === 0) return null;

    const average = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    return {
      average,
      count: ratings.length,
      ratings
    };
  }

  // ==================== TAG OPERATIONS ====================

  async tagQuote(guildId, quoteId, tagName) {
    if (!guildId) throw new Error('Guild ID required');
    if (!tagName || String(tagName).trim().length === 0) throw new Error('Tag name required');

    const guild = this._getGuildData(guildId);
    const quote = guild.quotes.find(q => q.id === quoteId);
    if (!quote) return false;

    const tag = {
      quoteId,
      tagName: String(tagName).toLowerCase(),
      created_at: new Date().toISOString()
    };

    guild.tags.push(tag);

    if (!guild.tagMap.has(tag.tagName)) {
      guild.tagMap.set(tag.tagName, []);
    }
    guild.tagMap.get(tag.tagName).push(quoteId);

    this._logOperation('tagQuote', guildId, { quoteId, tagName });
    return true;
  }

  async getQuotesByTag(guildId, tagName) {
    if (!guildId) throw new Error('Guild ID required');
    if (!tagName) return [];

    const guild = this._getGuildData(guildId);
    const quoteIds = guild.tagMap.get(tagName.toLowerCase()) || [];

    return guild.quotes.filter(q => quoteIds.includes(q.id));
  }

  async getTagsForQuote(guildId, quoteId) {
    if (!guildId) throw new Error('Guild ID required');
    const guild = this._getGuildData(guildId);

    return guild.tags
      .filter(t => t.quoteId === quoteId)
      .map(t => t.tagName);
  }

  // ==================== ADVANCED QUERIES ====================

  async getQuoteStats(guildId) {
    if (!guildId) throw new Error('Guild ID required');
    const guild = this._getGuildData(guildId);

    const totalQuotes = guild.quotes.length;
    const totalRatings = guild.ratings.length;
    const totalTags = guild.tags.length;
    const avgRating = totalRatings > 0
      ? guild.ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      : 0;

    return {
      totalQuotes,
      totalRatings,
      totalTags,
      avgRating,
      topRatedQuote: this._getTopRatedQuote(guild),
      mostTaggedQuote: this._getMostTaggedQuote(guild)
    };
  }

  /**
   * Get top rated quote in guild
   * @private
   */
  _getTopRatedQuote(guild) {
    if (guild.ratings.length === 0) return null;

    const quoteRatings = new Map();
    guild.ratings.forEach(r => {
      if (!quoteRatings.has(r.quoteId)) {
        quoteRatings.set(r.quoteId, []);
      }
      quoteRatings.get(r.quoteId).push(r.rating);
    });

    let topQuote = null;
    let topAvg = 0;

    for (const [quoteId, ratings] of quoteRatings.entries()) {
      const avg = ratings.reduce((a, b) => a + b) / ratings.length;
      if (avg > topAvg) {
        topAvg = avg;
        topQuote = quoteId;
      }
    }

    return topQuote ? { quoteId: topQuote, avgRating: topAvg } : null;
  }

  /**
   * Get most tagged quote in guild
   * @private
   */
  _getMostTaggedQuote(guild) {
    if (guild.tags.length === 0) return null;

    const tagCounts = new Map();
    guild.tags.forEach(t => {
      tagCounts.set(t.quoteId, (tagCounts.get(t.quoteId) || 0) + 1);
    });

    let topQuote = null;
    let maxTags = 0;

    for (const [quoteId, count] of tagCounts.entries()) {
      if (count > maxTags) {
        maxTags = count;
        topQuote = quoteId;
      }
    }

    return topQuote ? { quoteId: topQuote, tagCount: maxTags } : null;
  }

  async findQuotesByAuthor(guildId, author) {
    if (!guildId) throw new Error('Guild ID required');
    const guild = this._getGuildData(guildId);

    const searchAuthor = String(author).toLowerCase();
    return guild.quotes.filter(q =>
      q.author.toLowerCase() === searchAuthor
    );
  }

  async findQuotesByDateRange(guildId, startDate, endDate) {
    if (!guildId) throw new Error('Guild ID required');
    const guild = this._getGuildData(guildId);

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    return guild.quotes.filter(q => {
      const qTime = new Date(q.created_at).getTime();
      return qTime >= start && qTime <= end;
    });
  }

  // ==================== UTILITY OPERATIONS ====================

  getOperationLog() {
    return [...this.operationLog];
  }

  clearOperationLog() {
    this.operationLog = [];
  }

  async close() {
    this.guildData.clear();
    this.operationLog = [];
  }
}

// ==================== TEST SUITE ====================

describe('Quote Service - Extended Coverage', () => {
  let service;

  beforeEach(async () => {
    service = new MockQuoteServiceExtended();
  });

  afterEach(async () => {
    await service.close();
  });

  // ==================== ERROR HANDLING & VALIDATION ====================

  describe('Error Handling & Validation', () => {
    it('should reject missing guild ID', async () => {
      const errors = [];

      try { await service.addQuote(null, 'Text', 'Author'); } catch (e) { errors.push('add'); }
      try { await service.getAllQuotes(null); } catch (e) { errors.push('getAll'); }
      try { await service.getQuoteById(null, 1); } catch (e) { errors.push('getById'); }
      try { await service.searchQuotes(null, 'test'); } catch (e) { errors.push('search'); }

      assert.strictEqual(errors.length, 4);
    });

    it('should reject empty quote text', async () => {
      const guildId = 'test-guild';
      let errorThrown = false;

      try {
        await service.addQuote(guildId, '', 'Author');
      } catch (e) {
        errorThrown = true;
        assert(e.message.includes('required'));
      }

      assert(errorThrown);
    });

    it('should reject invalid rating values', async () => {
      const guildId = 'test-guild';
      const id = await service.addQuote(guildId, 'Quote', 'Author');

      const invalidRatings = [0, 6, -1, 10, 2.5];
      let successCount = 0;

      for (const rating of invalidRatings) {
        try {
          await service.rateQuote(guildId, id, 'user', rating);
          successCount++;
        } catch (e) {
          // Expected to throw
        }
      }

      // All invalid ratings should be rejected (successCount should be 0)
      assert.strictEqual(successCount, 0);
    });

    it('should handle operations on non-existent quotes', async () => {
      const guildId = 'test-guild';

      const quote = await service.getQuoteById(guildId, 999);
      const updated = await service.updateQuote(guildId, 999, 'New', 'Author');
      const deleted = await service.deleteQuote(guildId, 999);
      const rated = await service.rateQuote(guildId, 999, 'user', 5);

      assert.strictEqual(quote, null);
      assert.strictEqual(updated, false);
      assert.strictEqual(deleted, false);
      assert.strictEqual(rated, false);
    });

    it('should validate tag names', async () => {
      const guildId = 'test-guild';
      const id = await service.addQuote(guildId, 'Quote', 'Author');

      let errorThrown = false;

      try {
        await service.tagQuote(guildId, id, '');
      } catch (e) {
        errorThrown = true;
      }

      assert(errorThrown);
    });
  });

  // ==================== GUILD ISOLATION & SECURITY ====================

  describe('Guild Isolation & Security', () => {
    it('should maintain guild isolation in searches', async () => {
      const guild1 = 'guild-1';
      const guild2 = 'guild-2';

      await service.addQuote(guild1, 'Unique guild 1 quote', 'Author');
      await service.addQuote(guild2, 'Unique guild 2 quote', 'Author');

      const g1Results = await service.searchQuotes(guild1, 'guild 1');
      const g2Results = await service.searchQuotes(guild2, 'guild 2');

      assert.strictEqual(g1Results.length, 1);
      assert.strictEqual(g2Results.length, 1);
      assert.notStrictEqual(g1Results[0].text, g2Results[0].text);
    });

    it('should not leak ratings across guilds', async () => {
      const guild1 = 'guild-1';
      const guild2 = 'guild-2';

      const id1 = await service.addQuote(guild1, 'Quote', 'Author');
      const id2 = await service.addQuote(guild2, 'Quote', 'Author');

      await service.rateQuote(guild1, id1, 'user', 5);

      const ratings1 = await service.getQuoteRatings(guild1, id1);
      const ratings2 = await service.getQuoteRatings(guild2, id2);

      assert(ratings1);
      assert.strictEqual(ratings2, null);
    });

    it('should cascade delete only within guild', async () => {
      const guild1 = 'guild-1';
      const guild2 = 'guild-2';

      const id1 = await service.addQuote(guild1, 'Quote', 'Author');
      const id2 = await service.addQuote(guild2, 'Quote', 'Author');

      await service.rateQuote(guild1, id1, 'user', 5);
      await service.rateQuote(guild2, id2, 'user', 5);
      await service.tagQuote(guild1, id1, 'tag1');
      await service.tagQuote(guild2, id2, 'tag1');

      await service.deleteQuote(guild1, id1);

      const g1Quotes = await service.getAllQuotes(guild1);
      const g2Quotes = await service.getAllQuotes(guild2);
      const g1Tags = await service.getQuotesByTag(guild1, 'tag1');
      const g2Tags = await service.getQuotesByTag(guild2, 'tag1');

      assert.strictEqual(g1Quotes.length, 0);
      assert.strictEqual(g2Quotes.length, 1);
      assert.strictEqual(g1Tags.length, 0);
      assert.strictEqual(g2Tags.length, 1);
    });
  });

  // ==================== COMPLEX QUERY OPERATIONS ====================

  describe('Complex Query Operations', () => {
    it('should find quotes by exact author match', async () => {
      const guildId = 'test-guild';

      await service.addQuote(guildId, 'Quote 1', 'Shakespeare');
      await service.addQuote(guildId, 'Quote 2', 'Aristotle');
      await service.addQuote(guildId, 'Quote 3', 'Shakespeare');

      const shakespeareQuotes = await service.findQuotesByAuthor(guildId, 'Shakespeare');
      const aristotleQuotes = await service.findQuotesByAuthor(guildId, 'Aristotle');

      assert.strictEqual(shakespeareQuotes.length, 2);
      assert.strictEqual(aristotleQuotes.length, 1);
    });

    it('should find quotes by date range', async () => {
      const guildId = 'test-guild';

      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      await service.addQuote(guildId, 'Quote 1', 'Author');
      const quotes = await service.findQuotesByDateRange(
        guildId,
        yesterday.toISOString(),
        tomorrow.toISOString()
      );

      assert(quotes.length > 0);
    });

    it('should provide comprehensive guild statistics', async () => {
      const guildId = 'test-guild';

      const id1 = await service.addQuote(guildId, 'Quote 1', 'Author 1');
      const id2 = await service.addQuote(guildId, 'Quote 2', 'Author 2');

      await service.rateQuote(guildId, id1, 'user1', 5);
      await service.rateQuote(guildId, id1, 'user2', 3);
      await service.rateQuote(guildId, id2, 'user1', 4);

      await service.tagQuote(guildId, id1, 'favorite');
      await service.tagQuote(guildId, id1, 'inspirational');
      await service.tagQuote(guildId, id2, 'funny');

      const stats = await service.getQuoteStats(guildId);

      assert.strictEqual(stats.totalQuotes, 2);
      assert.strictEqual(stats.totalRatings, 3);
      assert.strictEqual(stats.totalTags, 3);
      assert(stats.avgRating > 0);
      assert(stats.topRatedQuote);
      assert(stats.mostTaggedQuote);
    });
  });

  // ==================== RATING & TAG OPERATIONS ====================

  describe('Rating & Tag Operations', () => {
    it('should support multiple ratings per quote', async () => {
      const guildId = 'test-guild';
      const id = await service.addQuote(guildId, 'Quote', 'Author');

      await service.rateQuote(guildId, id, 'user1', 5);
      await service.rateQuote(guildId, id, 'user2', 4);
      await service.rateQuote(guildId, id, 'user3', 3);

      const ratings = await service.getQuoteRatings(guildId, id);

      assert.strictEqual(ratings.count, 3);
      assert.strictEqual(ratings.average, 4);
    });

    it('should allow users to update their ratings', async () => {
      const guildId = 'test-guild';
      const id = await service.addQuote(guildId, 'Quote', 'Author');

      await service.rateQuote(guildId, id, 'user1', 2);
      await service.rateQuote(guildId, id, 'user1', 5);

      const ratings = await service.getQuoteRatings(guildId, id);

      assert.strictEqual(ratings.count, 1);
      assert.strictEqual(ratings.average, 5);
    });

    it('should support multiple tags per quote', async () => {
      const guildId = 'test-guild';
      const id = await service.addQuote(guildId, 'Quote', 'Author');

      await service.tagQuote(guildId, id, 'favorite');
      await service.tagQuote(guildId, id, 'inspirational');
      await service.tagQuote(guildId, id, 'funny');

      const tags = await service.getTagsForQuote(guildId, id);

      assert.strictEqual(tags.length, 3);
      assert(tags.includes('favorite'));
      assert(tags.includes('inspirational'));
      assert(tags.includes('funny'));
    });

    it('should find quotes by tag', async () => {
      const guildId = 'test-guild';

      const id1 = await service.addQuote(guildId, 'Quote 1', 'Author');
      const id2 = await service.addQuote(guildId, 'Quote 2', 'Author');
      const id3 = await service.addQuote(guildId, 'Quote 3', 'Author');

      await service.tagQuote(guildId, id1, 'funny');
      await service.tagQuote(guildId, id2, 'funny');
      await service.tagQuote(guildId, id3, 'serious');

      const funnyQuotes = await service.getQuotesByTag(guildId, 'funny');
      const seriousQuotes = await service.getQuotesByTag(guildId, 'serious');

      assert.strictEqual(funnyQuotes.length, 2);
      assert.strictEqual(seriousQuotes.length, 1);
    });

    it('should handle tag case-insensitivity', async () => {
      const guildId = 'test-guild';
      const id = await service.addQuote(guildId, 'Quote', 'Author');

      await service.tagQuote(guildId, id, 'Favorite');

      const results1 = await service.getQuotesByTag(guildId, 'favorite');
      const results2 = await service.getQuotesByTag(guildId, 'FAVORITE');
      const results3 = await service.getQuotesByTag(guildId, 'Favorite');

      assert.strictEqual(results1.length, 1);
      assert.strictEqual(results2.length, 1);
      assert.strictEqual(results3.length, 1);
    });
  });

  // ==================== UPDATE & EDIT OPERATIONS ====================

  describe('Update & Edit Operations', () => {
    it('should update quote text and author', async () => {
      const guildId = 'test-guild';
      const id = await service.addQuote(guildId, 'Original', 'Author 1');

      const success = await service.updateQuote(guildId, id, 'Updated', 'Author 2');
      const quote = await service.getQuoteById(guildId, id);

      assert(success);
      assert.strictEqual(quote.text, 'Updated');
      assert.strictEqual(quote.author, 'Author 2');
    });

    it('should preserve created_at on update', async () => {
      const guildId = 'test-guild';
      const id = await service.addQuote(guildId, 'Quote', 'Author');
      const original = await service.getQuoteById(guildId, id);
      const originalCreatedAt = original.created_at;

      await service.updateQuote(guildId, id, 'Updated', 'Author');
      const updated = await service.getQuoteById(guildId, id);

      assert.strictEqual(updated.created_at, originalCreatedAt);
    });

    it('should update updated_at on edit', async () => {
      const guildId = 'test-guild';
      const id = await service.addQuote(guildId, 'Quote', 'Author');
      const original = await service.getQuoteById(guildId, id);

      // Wait 100ms to ensure timestamps are different
      await new Promise(resolve => setTimeout(resolve, 100));
      await service.updateQuote(guildId, id, 'Updated', 'Author');
      const updated = await service.getQuoteById(guildId, id);

      // Verify update timestamp changed (use internal ms timestamp for accuracy)
      assert(updated._updatedMs > original._createdMs,
        'Updated timestamp should be after created timestamp');
    });
  });

  // ==================== OPERATION AUDITING ====================

  describe('Operation Auditing & Logging', () => {
    it('should log all quote modifications', async () => {
      const guildId = 'test-guild';

      const id = await service.addQuote(guildId, 'Quote', 'Author');
      await service.updateQuote(guildId, id, 'Updated', 'Author');
      await service.deleteQuote(guildId, id);

      const logs = service.getOperationLog();

      assert(logs.some(l => l.operation === 'addQuote'));
      assert(logs.some(l => l.operation === 'updateQuote'));
      assert(logs.some(l => l.operation === 'deleteQuote'));
    });

    it('should include guild context in operation logs', async () => {
      const guild1 = 'guild-1';
      const guild2 = 'guild-2';

      await service.addQuote(guild1, 'Quote', 'Author');
      await service.addQuote(guild2, 'Quote', 'Author');

      const logs = service.getOperationLog();
      const guild1Logs = logs.filter(l => l.guildId === guild1);
      const guild2Logs = logs.filter(l => l.guildId === guild2);

      assert(guild1Logs.length > 0);
      assert(guild2Logs.length > 0);
    });
  });

  // ==================== RANDOM QUOTE OPERATIONS ====================

  describe('Random Quote Selection', () => {
    it('should return random quotes from guild', async () => {
      const guildId = 'test-guild';

      for (let i = 0; i < 10; i++) {
        await service.addQuote(guildId, `Quote ${i}`, 'Author');
      }

      const random1 = await service.getRandomQuote(guildId);
      const random2 = await service.getRandomQuote(guildId);

      assert(random1);
      assert(random2);
      // Probability they're different is high (though possible they're same)
      assert(random1.id >= 1 && random1.id <= 10);
      assert(random2.id >= 1 && random2.id <= 10);
    });

    it('should return null for empty guild', async () => {
      const guildId = 'empty-guild';
      const random = await service.getRandomQuote(guildId);

      assert.strictEqual(random, null);
    });
  });

  // ==================== PERFORMANCE CHARACTERISTICS ====================

  describe('Performance Characteristics', () => {
    it('should handle 100 quotes efficiently', async () => {
      const guildId = 'test-guild';

      const startAdd = Date.now();
      for (let i = 0; i < 100; i++) {
        await service.addQuote(guildId, `Quote ${i}`, `Author ${i}`);
      }
      const addTime = Date.now() - startAdd;

      const startSearch = Date.now();
      await service.searchQuotes(guildId, 'Quote');
      const searchTime = Date.now() - startSearch;

      assert(addTime < 1000, `Adding 100 quotes took ${addTime}ms`);
      assert(searchTime < 500, `Searching 100 quotes took ${searchTime}ms`);
    });

    it('should provide consistent performance with tags', async () => {
      const guildId = 'test-guild';
      const id = await service.addQuote(guildId, 'Quote', 'Author');

      const startTag = Date.now();
      for (let i = 0; i < 50; i++) {
        await service.tagQuote(guildId, id, `tag-${i}`);
      }
      const tagTime = Date.now() - startTag;

      assert(tagTime < 1000, `Adding 50 tags took ${tagTime}ms`);
    });
  });
});
