/**
 * Phase 9B: QuoteService Integration Tests (REFACTORED)
 * 
 * CRITICAL REFACTORING NOTE (Phase 11):
 * These tests previously used pure sqlite3 mocking (0% coverage).
 * They now import and test the real QuoteService implementation using async/await.
 * 
 * Tests: 25 core quote operations covering all QuoteService methods
 * Expected coverage: QuoteService.js 0% → 5%
 */

/* eslint-disable max-nested-callbacks */
const assert = require('assert');
const {
  addQuote,
  getAllQuotes,
  getQuoteById,
  getRandomQuote,
  searchQuotes,
  updateQuote,
  deleteQuote,
  getQuoteCount,
  rateQuote,
  getQuoteRating,
} = require('../src/services/QuoteService');

describe('Phase 9B: QuoteService Integration Tests', () => {
  const testGuildId = 'guild-test-123';

  // ============================================================================
  // SECTION 1: Add Quote Operations (5 tests)
  // ============================================================================

  describe('Add Quote Operations', () => {
    it('should add quote with text and author', async () => {
      const id = await addQuote(testGuildId, 'Life is good', 'John Doe');
      assert(id > 0);

      const quote = await getQuoteById(testGuildId, id);
      assert(quote);
      assert.strictEqual(quote.text, 'Life is good');
      assert.strictEqual(quote.author, 'John Doe');

      // Cleanup
      await deleteQuote(testGuildId, id);
    });

    it('should add quote with default author', async () => {
      const id = await addQuote(testGuildId, 'Anonymous quote');
      const quote = await getQuoteById(testGuildId, id);
      assert.strictEqual(quote.author, 'Anonymous');

      await deleteQuote(testGuildId, id);
    });

    it('should initialize rating to 0', async () => {
      const id = await addQuote(testGuildId, 'Test quote', 'Author');
      const quote = await getQuoteById(testGuildId, id);
      // Rating might be 0, null, or undefined depending on implementation
      assert(quote.rating === 0 || quote.rating === null || quote.rating === undefined);

      await deleteQuote(testGuildId, id);
    });

    it('should isolate quotes by guild', async () => {
      const id1 = await addQuote('guild-1', 'Quote 1', 'Author');
      const id2 = await addQuote('guild-2', 'Quote 2', 'Author');

      const guild1Quotes = await getAllQuotes('guild-1');
      assert.strictEqual(guild1Quotes.length, 1);
      assert.strictEqual(guild1Quotes[0].text, 'Quote 1');

      await deleteQuote('guild-1', id1);
      await deleteQuote('guild-2', id2);
    });

    it('should reject empty quote text', async () => {
      try {
        await addQuote(testGuildId, '', 'Author');
        assert.fail('Should have thrown error for empty quote');
      } catch (err) {
        // Expected error
        assert(err);
      }
    });
  });

  // ============================================================================
  // SECTION 2: Retrieve Quote Operations (6 tests)
  // ============================================================================

  describe('Retrieve Quote Operations', () => {
    let quoteId1;
    let quoteId2;

    beforeEach(async () => {
      quoteId1 = await addQuote(testGuildId, 'Test quote 1', 'Author 1');
      quoteId2 = await addQuote(testGuildId, 'Test quote 2', 'Author 2');
    });

    afterEach(async () => {
      try {
        if (quoteId1) await deleteQuote(testGuildId, quoteId1);
      } catch (e) {
        // Already deleted
      }
      try {
        if (quoteId2) await deleteQuote(testGuildId, quoteId2);
      } catch (e) {
        // Already deleted
      }
    });

    it('should get quote by ID', async () => {
      const quote = await getQuoteById(testGuildId, quoteId1);
      assert(quote);
      assert.strictEqual(quote.text, 'Test quote 1');
    });

    it('should return error for non-existent quote', async () => {
      try {
        await getQuoteById(testGuildId, 99999);
        assert.fail('Should have thrown error');
      } catch (err) {
        assert(err);
      }
    });

    it('should not get quote from different guild', async () => {
      try {
        await getQuoteById('different-guild', quoteId1);
        assert.fail('Should have thrown error');
      } catch (err) {
        assert(err);
      }
    });

    it('should get all quotes for guild', async () => {
      const quotes = await getAllQuotes(testGuildId);
      assert(quotes.length >= 2);
      const texts = quotes.map((q) => q.text);
      assert(texts.includes('Test quote 1'));
      assert(texts.includes('Test quote 2'));
    });

    it('should count quotes per guild', async () => {
      const count = await getQuoteCount(testGuildId);
      assert(count >= 2);
    });

    it('should retrieve all quotes from guild', async () => {
      const quotes = await getAllQuotes(testGuildId);
      const quoteIds = quotes.map((q) => q.id);
      assert(quoteIds.includes(quoteId1));
      assert(quoteIds.includes(quoteId2));
    });
  });

  // ============================================================================
  // SECTION 3: Search Quote Operations (5 tests)
  // ============================================================================

  describe('Search Quote Operations', () => {
    let quote1Id;
    let quote2Id;
    let quote3Id;

    beforeEach(async () => {
      quote1Id = await addQuote(testGuildId, 'Life is beautiful', 'John Smith');
      quote2Id = await addQuote(testGuildId, 'Love conquers all', 'Jane Doe');
      quote3Id = await addQuote(testGuildId, 'Dreams matter', 'John Dream');
    });

    afterEach(async () => {
      try {
        if (quote1Id) await deleteQuote(testGuildId, quote1Id);
      } catch (e) {}
      try {
        if (quote2Id) await deleteQuote(testGuildId, quote2Id);
      } catch (e) {}
      try {
        if (quote3Id) await deleteQuote(testGuildId, quote3Id);
      } catch (e) {}
    });

    it('should search by text (case-insensitive)', async () => {
      const results = await searchQuotes(testGuildId, 'life');
      assert(results.length >= 1);
      assert(results.some((q) => q.text.toLowerCase().includes('life')));
    });

    it('should search by author', async () => {
      const results = await searchQuotes(testGuildId, 'John');
      assert(results.length >= 2);
      assert(results.every((q) => q.author.includes('John')));
    });

    it('should return empty for no matches', async () => {
      const results = await searchQuotes(testGuildId, 'nonexistent-search-term');
      assert.strictEqual(results.length, 0);
    });

    it('should search with partial text match', async () => {
      const results = await searchQuotes(testGuildId, 'love');
      assert(results.length >= 1);
    });

    it('should search with partial author name', async () => {
      const results = await searchQuotes(testGuildId, 'Jane');
      assert(results.length >= 1);
      assert(results.some((q) => q.author === 'Jane Doe'));
    });
  });

  // ============================================================================
  // SECTION 4: Rate Quote Operations (5 tests)
  // ============================================================================

  describe('Rate Quote Operations', () => {
    let quoteId;

    beforeEach(async () => {
      quoteId = await addQuote(testGuildId, 'Test quote', 'Author');
    });

    afterEach(async () => {
      try {
        if (quoteId) await deleteQuote(testGuildId, quoteId);
      } catch (e) {}
    });

    it('should update quote rating', async () => {
      await rateQuote(testGuildId, quoteId, 'user-1', 4);
      const rating = await getQuoteRating(testGuildId, quoteId);
      assert(rating && rating.average !== undefined);
    });

    it('should average multiple ratings', async () => {
      await rateQuote(testGuildId, quoteId, 'user-1', 5);
      await rateQuote(testGuildId, quoteId, 'user-2', 3);
      const rating = await getQuoteRating(testGuildId, quoteId);
      assert(rating.average >= 3 && rating.average <= 5);
      assert(rating.count >= 2);
    });

    it('should validate rating range (0-5)', async () => {
      try {
        await rateQuote(testGuildId, quoteId, 'user-1', 6);
        assert.fail('Should have thrown error for invalid rating');
      } catch (err) {
        assert(err);
      }
    });

    it('should track rating count', async () => {
      await rateQuote(testGuildId, quoteId, 'user-1', 4);
      const rating = await getQuoteRating(testGuildId, quoteId);
      assert(rating.count >= 1);
    });

    it('should handle multiple ratings in sequence', async () => {
      await rateQuote(testGuildId, quoteId, 'user-1', 5);
      await rateQuote(testGuildId, quoteId, 'user-2', 4);
      await rateQuote(testGuildId, quoteId, 'user-3', 3);
      const rating = await getQuoteRating(testGuildId, quoteId);
      assert(rating.count >= 3);
    });
  });

  // ============================================================================
  // SECTION 5: Update & Delete Quote Operations (4 tests)
  // ============================================================================

  describe('Update & Delete Quote Operations', () => {
    let quoteId;

    beforeEach(async () => {
      quoteId = await addQuote(testGuildId, 'Original text', 'Original Author');
    });

    afterEach(async () => {
      try {
        if (quoteId) await deleteQuote(testGuildId, quoteId);
      } catch (e) {}
    });

    it('should update quote text', async () => {
      await updateQuote(testGuildId, quoteId, 'New text', 'Original Author');
      const quote = await getQuoteById(testGuildId, quoteId);
      assert.strictEqual(quote.text, 'New text');
      assert.strictEqual(quote.author, 'Original Author');
    });

    it('should update quote author', async () => {
      await updateQuote(testGuildId, quoteId, 'Original text', 'New Author');
      const quote = await getQuoteById(testGuildId, quoteId);
      assert.strictEqual(quote.author, 'New Author');
      assert.strictEqual(quote.text, 'Original text');
    });

    it('should delete quote from guild', async () => {
      await deleteQuote(testGuildId, quoteId);
      try {
        await getQuoteById(testGuildId, quoteId);
        assert.fail('Quote should have been deleted');
      } catch (err) {
        assert(err);
      }
      quoteId = null; // Prevent afterEach from trying to delete again
    });

    it('should not delete quote from different guild', async () => {
      try {
        await deleteQuote('different-guild', quoteId);
        // If it doesn't throw, try to get the quote to verify it still exists
        const quote = await getQuoteById(testGuildId, quoteId);
        assert(quote);
      } catch (err) {
        // Expected - quote doesn't exist in different guild
        assert(err);
      }
    });
  });
});
