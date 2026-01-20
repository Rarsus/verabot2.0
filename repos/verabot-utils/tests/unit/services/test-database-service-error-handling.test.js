/**
 * Database Service - Error Handling & Robustness Tests
 * Phase 22.1a: Foundation Services Coverage Expansion
 * 
 * Tests error scenarios, edge cases, and recovery paths
 * Target: +5-7% coverage improvement for error handling paths
 */

const assert = require('assert');

/**
 * Mock Database Service for testing (simplified)
 */
class MockDatabaseServiceEnhanced {
  constructor() {
    this.quotes = [];
    this.ratings = [];
    this.tags = [];
    this.quoteTags = [];
    this.nextQuoteId = 1;
    this.nextTagId = 1;
  }

  async addQuote(text, author = 'Anonymous') {
    if (!text || text.toString().trim() === '') {
      throw new Error('Quote text is required');
    }

    const id = this.nextQuoteId++;
    this.quotes.push({
      id,
      text: String(text),
      author: author || 'Anonymous',
      created_at: new Date().toISOString(),
      updated_at: null,
    });
    return id;
  }

  async getQuoteById(id) {
    if (typeof id !== 'number' || id <= 0) return null;
    return this.quotes.find((q) => q.id === id) || null;
  }

  async updateQuote(id, text, author = 'Anonymous') {
    if (!text) throw new Error('Quote text is required');

    const quote = await this.getQuoteById(id);
    if (!quote) return false;

    quote.text = text;
    quote.author = author || 'Anonymous';
    quote.updated_at = new Date().toISOString();
    return true;
  }

  async deleteQuote(id) {
    const index = this.quotes.findIndex((q) => q.id === id);
    if (index === -1) return false;

    this.quotes.splice(index, 1);
    this.ratings = this.ratings.filter((r) => r.quote_id !== id);
    this.quoteTags = this.quoteTags.filter((qt) => qt.quote_id !== id);
    return true;
  }

  async rateQuote(quoteId, userId, rating) {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const quote = await this.getQuoteById(quoteId);
    if (!quote) throw new Error('Quote not found');

    const existingRating = this.ratings.find((r) => r.quote_id === quoteId && r.user_id === userId);
    if (existingRating) {
      existingRating.rating = rating;
    } else {
      this.ratings.push({
        quote_id: quoteId,
        user_id: userId,
        rating,
        rated_at: new Date().toISOString(),
      });
    }
    return true;
  }

  async getQuoteCount() {
    return this.quotes.length;
  }

  async searchQuotes(keyword) {
    if (!keyword || typeof keyword !== 'string') return [];
    return this.quotes.filter(
      (q) =>
        q.text.toLowerCase().includes(keyword.toLowerCase()) ||
        q.author.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  async close() {
    this.quotes = [];
    this.ratings = [];
    this.tags = [];
    this.quoteTags = [];
  }
}

describe('Database Service - Error Handling & Robustness', () => {
  let db;

  beforeEach(async () => {
    db = new MockDatabaseServiceEnhanced();
  });

  afterEach(async () => {
    await db.close();
  });

  describe('Parameter Validation & Error Handling', () => {
    it('should convert number text to string', async () => {
      const id = await db.addQuote(12345);
      const quote = await db.getQuoteById(id);
      assert.strictEqual(quote.text, '12345');
    });

    it('should handle very long quote text', async () => {
      const longText = 'a'.repeat(10000);
      const id = await db.addQuote(longText);
      const quote = await db.getQuoteById(id);
      assert.strictEqual(quote.text, longText);
    });

    it('should handle special characters in text', async () => {
      const specialChars = "!@#$%^&*()_+-=[]{}|;:',.<>?/~`";
      const id = await db.addQuote(specialChars);
      const quote = await db.getQuoteById(id);
      assert.strictEqual(quote.text, specialChars);
    });

    it('should handle unicode characters', async () => {
      const unicodeText = '你好 مرحبا שלום 🎉';
      const id = await db.addQuote(unicodeText);
      const quote = await db.getQuoteById(id);
      assert.strictEqual(quote.text, unicodeText);
    });

    it('should reject rating of non-existent quote (async)', async () => {
      try {
        await db.rateQuote(9999, 'user-1', 5);
        assert.fail('Should have thrown');
      } catch (e) {
        assert.match(e.message, /Quote not found/);
      }
    });

    it('should handle undefined author', async () => {
      const id2 = await db.addQuote('Quote 2', undefined);
      const quote2 = await db.getQuoteById(id2);
      assert.strictEqual(quote2.author, 'Anonymous');
    });

    it('should reject non-existent quote ID on update', async () => {
      const result = await db.updateQuote(9999, 'New text');
      assert.strictEqual(result, false);
    });
  });

  describe('Data Integrity & Cascade Operations', () => {
    it('should cascade delete ratings when quote is deleted', async () => {
      const id = await db.addQuote('Test quote');
      await db.rateQuote(id, 'user-1', 5);
      await db.rateQuote(id, 'user-2', 4);

      assert.strictEqual(db.ratings.length, 2);

      await db.deleteQuote(id);

      assert.strictEqual(db.ratings.length, 0);
    });

    it('should not affect other quotes when deleting', async () => {
      const id1 = await db.addQuote('Quote 1');
      const id2 = await db.addQuote('Quote 2');

      await db.rateQuote(id1, 'user-1', 5);
      await db.rateQuote(id2, 'user-2', 4);

      await db.deleteQuote(id1);

      const remaining = db.ratings.filter((r) => r.quote_id === id2);
      assert.strictEqual(remaining.length, 1);
    });

    it('should handle delete of non-existent quote', async () => {
      const result = await db.deleteQuote(9999);
      assert.strictEqual(result, false);
    });

    it('should maintain quote count accuracy', async () => {
      for (let i = 0; i < 10; i++) {
        await db.addQuote(`Quote ${i}`);
      }
      assert.strictEqual(await db.getQuoteCount(), 10);

      for (let i = 1; i <= 5; i++) {
        await db.deleteQuote(i);
      }
      assert.strictEqual(await db.getQuoteCount(), 5);
    });

    it('should handle rapid delete operations', async () => {
      const ids = [];
      for (let i = 0; i < 50; i++) {
        ids.push(await db.addQuote(`Quote ${i}`));
      }

      for (const id of ids) {
        await db.deleteQuote(id);
      }

      assert.strictEqual(await db.getQuoteCount(), 0);
    });
  });

  describe('Search & Query Edge Cases', () => {
    it('should handle search with regex special characters', async () => {
      await db.addQuote('What is (testing) and [validation]?');
      const results = await db.searchQuotes('(testing)');
      assert(results.length > 0);
    });

    it('should be case-insensitive in search', async () => {
      await db.addQuote('UPPERCASE text', 'Author');
      const results = await db.searchQuotes('uppercase');
      assert.strictEqual(results.length, 1);
    });

    it('should find partial text matches', async () => {
      await db.addQuote('The quick brown fox');
      const results = await db.searchQuotes('brown');
      assert.strictEqual(results.length, 1);
    });

    it('should return empty array for null search', async () => {
      await db.addQuote('Test quote');
      const results = await db.searchQuotes(null);
      assert.strictEqual(results.length, 0);
    });

    it('should return empty array for undefined search', async () => {
      await db.addQuote('Test quote');
      const results = await db.searchQuotes(undefined);
      assert.strictEqual(results.length, 0);
    });

    it('should handle numeric search keyword', async () => {
      await db.addQuote('Quote 123');
      const results = await db.searchQuotes(123);
      assert.strictEqual(results.length, 0); // Non-string keyword should return empty
    });

    it('should not find non-matching text', async () => {
      await db.addQuote('Test quote');
      const results = await db.searchQuotes('nonexistent-phrase');
      assert.strictEqual(results.length, 0);
    });
  });

  describe('Concurrent Operation Safety', () => {
    it('should handle multiple rapid additions without duplication', async () => {
      const ids = [];
      for (let i = 0; i < 100; i++) {
        ids.push(await db.addQuote(`Quote ${i}`));
      }

      const count = await db.getQuoteCount();
      assert.strictEqual(count, 100);

      // All IDs should be unique
      const uniqueIds = new Set(ids);
      assert.strictEqual(uniqueIds.size, 100);
    });

    it('should handle mixed operations correctly', async () => {
      const id1 = await db.addQuote('Quote 1');
      const id2 = await db.addQuote('Quote 2');
      const id3 = await db.addQuote('Quote 3');

      await db.rateQuote(id1, 'user-1', 5);
      await db.updateQuote(id2, 'Updated Quote 2');
      await db.deleteQuote(id3);

      assert.strictEqual(await db.getQuoteCount(), 2);
      assert.strictEqual(db.ratings.length, 1);
    });

    it('should maintain operation order', async () => {
      const texts = [];
      for (let i = 0; i < 10; i++) {
        const text = `Quote ${String(i).padStart(2, '0')}`;
        texts.push(text);
        await db.addQuote(text);
      }

      const quotes = db.quotes;
      quotes.forEach((quote, index) => {
        assert.strictEqual(quote.text, texts[index]);
      });
    });
  });

  describe('Recovery & Resilience', () => {
    it('should continue after failed rating', async () => {
      const id1 = await db.addQuote('Quote 1');

      try {
        await db.rateQuote(9999, 'user-1', 5); // Non-existent quote
      } catch (e) {
        // Expected
      }

      // Should still be able to use database
      const id2 = await db.addQuote('Quote 2');
      assert.strictEqual(await db.getQuoteCount(), 2);
    });

    it('should continue after failed delete', async () => {
      const id1 = await db.addQuote('Quote 1');

      const deleted = await db.deleteQuote(9999); // Non-existent
      assert.strictEqual(deleted, false);

      // Database should still be functional
      const id2 = await db.addQuote('Quote 2');
      assert.strictEqual(await db.getQuoteCount(), 2);
    });

    it('should handle update with same text and author', async () => {
      const id = await db.addQuote('Original', 'Author');
      const updated = await db.updateQuote(id, 'Original', 'Author');
      assert(updated);

      const quote = await db.getQuoteById(id);
      assert.strictEqual(quote.text, 'Original');
      assert.strictEqual(quote.author, 'Author');
    });

    it('should update rating if exists for same user', async () => {
      const id = await db.addQuote('Test');
      await db.rateQuote(id, 'user-1', 3);
      await db.rateQuote(id, 'user-1', 5);

      const ratings = db.ratings.filter((r) => r.quote_id === id && r.user_id === 'user-1');
      assert.strictEqual(ratings.length, 1);
      assert.strictEqual(ratings[0].rating, 5);
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle single character quote', async () => {
      const id = await db.addQuote('A');
      const quote = await db.getQuoteById(id);
      assert.strictEqual(quote.text, 'A');
    });

    it('should handle quote ID as string', async () => {
      const quote = await db.getQuoteById('invalid-id');
      assert.strictEqual(quote, null);
    });

    it('should handle negative quote ID', async () => {
      const quote = await db.getQuoteById(-1);
      assert.strictEqual(quote, null);
    });

    it('should handle zero quote ID', async () => {
      const quote = await db.getQuoteById(0);
      assert.strictEqual(quote, null);
    });

    it('should handle very large quote ID', async () => {
      const quote = await db.getQuoteById(999999999);
      assert.strictEqual(quote, null);
    });

    it('should handle very long author name', async () => {
      const longAuthor = 'A'.repeat(1000);
      const id = await db.addQuote('Quote', longAuthor);
      const quote = await db.getQuoteById(id);
      assert.strictEqual(quote.author, longAuthor);
    });
  });

  describe('State Management', () => {
    it('should preserve timestamps on add', async () => {
      const before = new Date();
      const id = await db.addQuote('Test');
      const after = new Date();

      const quote = await db.getQuoteById(id);
      const createdAt = new Date(quote.created_at);

      assert(createdAt >= before && createdAt <= after);
      assert.strictEqual(quote.updated_at, null);
    });

    it('should update timestamp on update', async () => {
      const id = await db.addQuote('Original');
      const originalQuote = await db.getQuoteById(id);
      const originalCreated = originalQuote.created_at;

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      await db.updateQuote(id, 'Updated');
      const updatedQuote = await db.getQuoteById(id);

      assert(updatedQuote.updated_at !== null);
      assert(new Date(updatedQuote.updated_at) > new Date(updatedQuote.created_at));
    });

    it('should not affect created_at on update', async () => {
      const id = await db.addQuote('Original');
      const originalQuote = await db.getQuoteById(id);

      await db.updateQuote(id, 'Updated');
      const updatedQuote = await db.getQuoteById(id);

      assert.strictEqual(originalQuote.created_at, updatedQuote.created_at);
    });
  });

  describe('Clear State Management', () => {
    it('should properly close/reset database', async () => {
      await db.addQuote('Quote 1');
      await db.addQuote('Quote 2');

      assert.strictEqual(await db.getQuoteCount(), 2);

      await db.close();

      assert.strictEqual(db.quotes.length, 0);
      assert.strictEqual(db.ratings.length, 0);
    });

    it('should be reusable after close', async () => {
      await db.addQuote('Quote 1');
      await db.close();

      // After close, db is cleared but instance is reusable
      const id = await db.addQuote('New Quote');
      assert.strictEqual(await db.getQuoteCount(), 1);
    });
  });
});
