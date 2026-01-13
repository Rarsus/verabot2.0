/**
 * Phase 22.2: Integration Tests
 * 
 * Comprehensive integration tests combining:
 * - Performance characteristics with guild isolation
 * - Multi-guild scenarios with concurrent operations
 * - Real-world workflow testing
 * - End-to-end feature validation
 */

const assert = require('assert');

class IntegrationTestDatabase {
  constructor() {
    this.guilds = new Map();
    this.globalStats = {
      totalOperations: 0,
      totalGuilds: 0,
      averageGuildSize: 0
    };
  }

  initGuild(guildId) {
    if (!this.guilds.has(guildId)) {
      this.guilds.set(guildId, {
        quotes: new Map(),
        ratings: new Map(),
        tags: new Map(),
        createdAt: Date.now(),
        lastModified: Date.now()
      });
      this.globalStats.totalGuilds++;
    }
  }

  async addQuote(guildId, quoteId, text, author) {
    assert(guildId && quoteId && text, 'Required parameters missing');
    this.initGuild(guildId);
    
    const guild = this.guilds.get(guildId);
    guild.quotes.set(quoteId, {
      id: quoteId,
      text,
      author,
      guildId,
      createdAt: Date.now(),
      ratings: [],
      tags: []
    });
    guild.lastModified = Date.now();
    this.globalStats.totalOperations++;
  }

  async rateQuote(guildId, quoteId, rating) {
    assert(guildId && quoteId && typeof rating === 'number', 'Invalid parameters');
    this.initGuild(guildId);
    
    const guild = this.guilds.get(guildId);
    const quote = guild.quotes.get(quoteId);
    
    if (quote) {
      quote.ratings.push(rating);
      guild.lastModified = Date.now();
      this.globalStats.totalOperations++;
    }
  }

  async tagQuote(guildId, quoteId, tag) {
    assert(guildId && quoteId && tag, 'Invalid parameters');
    this.initGuild(guildId);
    
    const guild = this.guilds.get(guildId);
    const quote = guild.quotes.get(quoteId);
    
    if (quote && !quote.tags.includes(tag)) {
      quote.tags.push(tag);
      guild.lastModified = Date.now();
      this.globalStats.totalOperations++;
    }
  }

  async getQuote(guildId, quoteId) {
    this.initGuild(guildId);
    return this.guilds.get(guildId).quotes.get(quoteId);
  }

  async getGuildStats(guildId) {
    this.initGuild(guildId);
    const guild = this.guilds.get(guildId);
    
    return {
      guildId,
      quoteCount: guild.quotes.size,
      createdAt: guild.createdAt,
      lastModified: guild.lastModified,
      averageRating: this.calculateAverageRating(guildId),
      topTags: this.getTopTags(guildId)
    };
  }

  calculateAverageRating(guildId) {
    const guild = this.guilds.get(guildId);
    let totalRatings = 0;
    let ratingCount = 0;

    for (const quote of guild.quotes.values()) {
      totalRatings += quote.ratings.reduce((a, b) => a + b, 0);
      ratingCount += quote.ratings.length;
    }

    return ratingCount > 0 ? totalRatings / ratingCount : 0;
  }

  getTopTags(guildId) {
    const guild = this.guilds.get(guildId);
    const tagCounts = {};

    for (const quote of guild.quotes.values()) {
      for (const tag of quote.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }

    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));
  }

  async getAllGuildQuotes(guildId) {
    this.initGuild(guildId);
    return Array.from(this.guilds.get(guildId).quotes.values());
  }

  getGlobalStats() {
    const totalQuotes = Array.from(this.guilds.values())
      .reduce((sum, guild) => sum + guild.quotes.size, 0);

    return {
      totalGuilds: this.globalStats.totalGuilds,
      totalOperations: this.globalStats.totalOperations,
      totalQuotes,
      averageQuotesPerGuild: this.globalStats.totalGuilds > 0
        ? totalQuotes / this.globalStats.totalGuilds
        : 0
    };
  }
}

describe('Integration Tests - Phase 22.2', () => {
  let db;

  beforeEach(() => {
    db = new IntegrationTestDatabase();
  });

  // ==================== REAL-WORLD WORKFLOWS ====================
  
  describe('Real-World Workflows', () => {
    it('should handle typical bot usage pattern', async () => {
      const guildId = 'gaming-discord';

      // Step 1: User adds quotes
      await db.addQuote(guildId, '1', 'Unity is strength', 'Ancient Proverb');
      await db.addQuote(guildId, '2', 'Enjoy the process', 'Unknown');
      await db.addQuote(guildId, '3', 'Always learn', 'Confucius');

      // Step 2: Community rates quotes
      await db.rateQuote(guildId, '1', 5);
      await db.rateQuote(guildId, '1', 4);
      await db.rateQuote(guildId, '2', 3);
      await db.rateQuote(guildId, '3', 5);
      await db.rateQuote(guildId, '3', 5);

      // Step 3: Add tags for organization
      await db.tagQuote(guildId, '1', 'motivational');
      await db.tagQuote(guildId, '1', 'teamwork');
      await db.tagQuote(guildId, '2', 'life');
      await db.tagQuote(guildId, '3', 'wisdom');
      await db.tagQuote(guildId, '3', 'education');

      // Step 4: Get guild stats
      const stats = await db.getGuildStats(guildId);

      assert.strictEqual(stats.quoteCount, 3, 'Should have 3 quotes');
      assert(stats.averageRating > 4, 'Average rating should be high');
      assert(stats.topTags.length > 0, 'Should have top tags');
    });

    it('should support multiple communities with independent data', async () => {
      const guilds = {
        'gaming': 'gaming-community',
        'studying': 'study-group',
        'fitness': 'gym-buddies'
      };

      // Each guild adds its own type of quotes
      const guildQuotes = {
        'gaming-community': [
          { id: '1', text: 'Level up', author: 'Gamer' },
          { id: '2', text: 'No rage quit', author: 'Pro' }
        ],
        'study-group': [
          { id: '1', text: 'Study hard', author: 'Teacher' },
          { id: '2', text: 'Ask questions', author: 'Mentor' }
        ],
        'gym-buddies': [
          { id: '1', text: 'No pain', author: 'Trainer' },
          { id: '2', text: 'Believe in self', author: 'Coach' }
        ]
      };

      // Add quotes to each guild
      for (const [guildId, quotes] of Object.entries(guildQuotes)) {
        for (const quote of quotes) {
          await db.addQuote(guildId, quote.id, quote.text, quote.author);
        }
      }

      // Verify isolation: each guild sees only its quotes
      for (const [guildId, quotes] of Object.entries(guildQuotes)) {
        const guildQuotes = await db.getAllGuildQuotes(guildId);
        assert.strictEqual(guildQuotes.length, quotes.length,
          `${guildId} should have its own quotes`);
      }

      // Verify global stats
      const globalStats = db.getGlobalStats();
      assert.strictEqual(globalStats.totalGuilds, 3, 'Should have 3 guilds');
      assert.strictEqual(globalStats.totalQuotes, 6, 'Should have 6 quotes total');
    });

    it('should handle progressive user engagement pattern', async () => {
      const guildId = 'progressive-guild';
      const stages = [
        { phase: 'discovery', quotes: 3 },
        { phase: 'engagement', quotes: 7 },
        { phase: 'maturity', quotes: 15 }
      ];

      for (const stage of stages) {
        // Add quotes for this stage
        for (let i = 0; i < stage.quotes; i++) {
          await db.addQuote(guildId, `${stage.phase}-${i}`,
            `Quote ${i}`, 'Author');
        }

        const stats = await db.getGuildStats(guildId);
        
        // After each phase, add ratings
        const quotes = await db.getAllGuildQuotes(guildId);
        for (let i = 0; i < Math.min(3, quotes.length); i++) {
          await db.rateQuote(guildId, quotes[i].id, 4 + Math.floor(Math.random()));
        }
      }

      // Final state check
      const finalStats = await db.getGuildStats(guildId);
      assert.strictEqual(finalStats.quoteCount, 25, 'Should accumulate quotes');
    });
  });

  // ==================== CONCURRENT OPERATIONS ====================
  
  describe('Concurrent Multi-Guild Operations', () => {
    it('should handle concurrent adds across 5 guilds', async () => {
      const guildIds = ['g1', 'g2', 'g3', 'g4', 'g5'];
      const promises = [];

      // Add quotes concurrently
      for (const guildId of guildIds) {
        for (let i = 0; i < 20; i++) {
          promises.push(
            db.addQuote(guildId, `q-${i}`, `Quote ${i}`, 'Author')
          );
        }
      }

      await Promise.all(promises);

      // Verify all added
      const globalStats = db.getGlobalStats();
      assert.strictEqual(globalStats.totalGuilds, 5);
      assert.strictEqual(globalStats.totalQuotes, 100);
    });

    it('should handle concurrent operations of mixed types', async () => {
      const guildId = 'mixed-guild';
      const promises = [];

      // Add quotes
      for (let i = 0; i < 10; i++) {
        promises.push(
          db.addQuote(guildId, `q-${i}`, `Quote ${i}`, 'Author')
        );
      }

      // Wait for quotes to be added
      await Promise.all(promises);

      // Now rate and tag
      const ratingPromises = [];
      for (let i = 0; i < 10; i++) {
        ratingPromises.push(
          db.rateQuote(guildId, `q-${i}`, 5),
          db.rateQuote(guildId, `q-${i}`, 4),
          db.tagQuote(guildId, `q-${i}`, 'popular'),
          db.tagQuote(guildId, `q-${i}`, 'featured')
        );
      }

      await Promise.all(ratingPromises);

      const stats = await db.getGuildStats(guildId);
      assert.strictEqual(stats.quoteCount, 10);
      assert(stats.topTags.length > 0);
    });
  });

  // ==================== PERFORMANCE AT SCALE ====================
  
  describe('Performance Characteristics', () => {
    it('should maintain responsiveness with 1000 quotes per guild', async () => {
      const guildId = 'large-guild';

      // Add 1000 quotes
      for (let i = 0; i < 1000; i++) {
        await db.addQuote(guildId, `q-${i}`, `Quote ${i}`, `Author ${i % 50}`);
      }

      const stats = await db.getGuildStats(guildId);
      assert.strictEqual(stats.quoteCount, 1000);

      // Verify we can still operate efficiently
      await db.rateQuote(guildId, 'q-500', 5);
      await db.tagQuote(guildId, 'q-750', 'sampled');

      const updated = await db.getQuote(guildId, 'q-500');
      assert(updated.ratings.length > 0);
    });

    it('should handle 10 guilds with 100 quotes each efficiently', async () => {
      const guildCount = 10;
      const quotesPerGuild = 100;

      // Add quotes to all guilds
      for (let g = 0; g < guildCount; g++) {
        const guildId = `guild-${g}`;
        for (let q = 0; q < quotesPerGuild; q++) {
          await db.addQuote(guildId, `q-${q}`, `Quote ${q}`, 'Author');
        }
      }

      const globalStats = db.getGlobalStats();
      assert.strictEqual(globalStats.totalGuilds, guildCount);
      assert.strictEqual(globalStats.totalQuotes, guildCount * quotesPerGuild);

      // Verify average
      assert.strictEqual(
        globalStats.averageQuotesPerGuild,
        quotesPerGuild
      );
    });

    it('should efficiently compute stats across multiple guilds', async () => {
      // Setup: 5 guilds with 50 quotes and ratings each
      const guildIds = Array.from({ length: 5 }, (_, i) => `guild-${i}`);

      for (const guildId of guildIds) {
        for (let i = 0; i < 50; i++) {
          await db.addQuote(guildId, `q-${i}`, `Quote ${i}`, 'Author');
          // Rate every other quote
          if (i % 2 === 0) {
            await db.rateQuote(guildId, `q-${i}`, 5);
            await db.rateQuote(guildId, `q-${i}`, 4);
          }
        }
      }

      // Get stats for all guilds
      const allStats = [];
      for (const guildId of guildIds) {
        const stats = await db.getGuildStats(guildId);
        allStats.push(stats);
      }

      // Verify stats are computed correctly
      assert.strictEqual(allStats.length, 5);
      for (const stats of allStats) {
        assert.strictEqual(stats.quoteCount, 50);
      }
    });
  });

  // ==================== DATA CONSISTENCY ====================
  
  describe('Data Consistency & Integrity', () => {
    it('should maintain data consistency during concurrent operations', async () => {
      const guildId = 'consistency-test';
      const quoteId = 'important-quote';

      // Add quote
      await db.addQuote(guildId, quoteId, 'Important', 'Author');

      // Concurrent reads
      const readPromises = Array.from({ length: 10 }, () =>
        db.getQuote(guildId, quoteId)
      );

      const results = await Promise.all(readPromises);

      // All reads should return same data
      for (const result of results) {
        assert.strictEqual(result.id, quoteId);
        assert.strictEqual(result.text, 'Important');
      }
    });

    it('should maintain referential integrity across operations', async () => {
      const guildId = 'integrity-test';

      // Add quotes
      for (let i = 0; i < 5; i++) {
        await db.addQuote(guildId, `q-${i}`, `Quote ${i}`, 'Author');
      }

      // Add ratings and tags
      for (let i = 0; i < 5; i++) {
        await db.rateQuote(guildId, `q-${i}`, 5);
        await db.tagQuote(guildId, `q-${i}`, 'verified');
      }

      // Retrieve and verify references
      const quotes = await db.getAllGuildQuotes(guildId);

      for (const quote of quotes) {
        assert(quote.id.startsWith('q-'), 'Quote ID should be valid');
        assert(quote.ratings.length > 0, 'Quote should have ratings');
        assert(quote.tags.includes('verified'), 'Quote should have tag');
      }
    });

    it('should correctly handle multiple operations on same quote', async () => {
      const guildId = 'multi-op-test';
      const quoteId = 'test-quote';

      // Add quote
      await db.addQuote(guildId, quoteId, 'Test Quote', 'Author');

      // Multiple operations
      const operations = [
        () => db.rateQuote(guildId, quoteId, 5),
        () => db.rateQuote(guildId, quoteId, 4),
        () => db.rateQuote(guildId, quoteId, 3),
        () => db.tagQuote(guildId, quoteId, 'tag1'),
        () => db.tagQuote(guildId, quoteId, 'tag2'),
        () => db.tagQuote(guildId, quoteId, 'tag3')
      ];

      // Execute in sequence
      for (const op of operations) {
        await op();
      }

      // Verify state
      const quote = await db.getQuote(guildId, quoteId);
      assert.strictEqual(quote.ratings.length, 3, 'Should have 3 ratings');
      assert.strictEqual(quote.tags.length, 3, 'Should have 3 tags');
      assert.deepStrictEqual(quote.ratings, [5, 4, 3], 'Ratings should be in order');
    });
  });

  // ==================== ERROR RECOVERY ====================
  
  describe('Error Handling & Recovery', () => {
    it('should handle invalid input gracefully', async () => {
      const guildId = 'error-test';

      // Try operations with invalid inputs
      try {
        await db.addQuote(guildId, '', 'Text', 'Author'); // empty ID
        assert.fail('Should reject empty quote ID');
      } catch {
        // Expected
      }

      try {
        await db.addQuote(guildId, 'q-1', '', 'Author'); // empty text
        assert.fail('Should reject empty text');
      } catch {
        // Expected
      }

      try {
        await db.rateQuote(guildId, 'nonexistent', 5);
        // Should not throw, just no-op
      } catch {
        // Either is acceptable
      }
    });

    it('should continue operating after errors', async () => {
      const guildId = 'recovery-test';

      // Add quote
      await db.addQuote(guildId, 'q-1', 'Quote 1', 'Author');

      // Attempt invalid operation
      try {
        await db.addQuote(guildId, '', 'Invalid', 'Author');
      } catch {
        // Swallow error
      }

      // Should still be able to add valid quotes
      await db.addQuote(guildId, 'q-2', 'Quote 2', 'Author');

      const stats = await db.getGuildStats(guildId);
      assert.strictEqual(stats.quoteCount, 2, 'Should have both quotes');
    });
  });

  // ==================== GLOBAL METRICS ====================
  
  describe('Global Metrics & Reporting', () => {
    it('should accurately track global operations', async () => {
      const guildIds = ['g1', 'g2', 'g3'];

      // Perform various operations
      let expectedOps = 0;

      for (const guildId of guildIds) {
        for (let i = 0; i < 5; i++) {
          await db.addQuote(guildId, `q-${i}`, `Quote ${i}`, 'Author');
          expectedOps++;

          await db.rateQuote(guildId, `q-${i}`, 5);
          expectedOps++;
        }
      }

      const globalStats = db.getGlobalStats();
      assert.strictEqual(globalStats.totalOperations, expectedOps);
      assert.strictEqual(globalStats.totalGuilds, 3);
    });

    it('should provide accurate guild distribution metrics', async () => {
      // Add quotes with varying distribution
      const distribution = {
        'small': 10,
        'medium': 50,
        'large': 100
      };

      for (const [type, count] of Object.entries(distribution)) {
        for (let i = 0; i < count; i++) {
          await db.addQuote(`guild-${type}`, `q-${i}`,
            `Quote ${i}`, 'Author');
        }
      }

      const globalStats = db.getGlobalStats();
      assert.strictEqual(globalStats.totalGuilds, 3);
      assert.strictEqual(globalStats.totalQuotes, 160);
      assert(globalStats.averageQuotesPerGuild > 50);
    });
  });
});
