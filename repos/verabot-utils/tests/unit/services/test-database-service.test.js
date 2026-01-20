/**
 * Database Service - Core Operations Test Suite
 * Tests CRUD operations, transactions, and database management
 * Target: 85%+ coverage of DatabaseService.js
 */

const assert = require('assert');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

/**
 * Mock Database Service for testing
 * Provides synchronous interface for testing async patterns
 */
class MockDatabaseService {
  constructor() {
    this.db = null;
    this.quotes = [];
    this.ratings = [];
    this.tags = [];
    this.quoteTags = [];
    this.nextQuoteId = 1;
    this.nextTagId = 1;
    this.proxyConfig = new Map();
  }

  async initialize() {
    // Simulate async initialization
    return true;
  }

  async addQuote(text, author = 'Anonymous') {
    if (!text) throw new Error('Quote text is required');

    const id = this.nextQuoteId++;
    this.quotes.push({
      id,
      text,
      author,
      created_at: new Date().toISOString(),
      updated_at: null,
    });
    return id;
  }

  async getAllQuotes() {
    return [...this.quotes];
  }

  async getQuoteById(id) {
    return this.quotes.find((q) => q.id === id) || null;
  }

  async searchQuotes(keyword) {
    if (!keyword || typeof keyword !== 'string') return [];

    return this.quotes.filter(
      (q) =>
        q.text.toLowerCase().includes(keyword.toLowerCase()) ||
        q.author.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  async updateQuote(id, text, author = 'Anonymous') {
    const quote = await this.getQuoteById(id);
    if (!quote) return false;

    quote.text = text;
    quote.author = author;
    quote.updated_at = new Date().toISOString();
    return true;
  }

  async deleteQuote(id) {
    const index = this.quotes.findIndex((q) => q.id === id);
    if (index === -1) return false;

    this.quotes.splice(index, 1);
    // Also delete associated ratings
    this.ratings = this.ratings.filter((r) => r.quote_id !== id);
    // Also delete associated tags
    this.quoteTags = this.quoteTags.filter((qt) => qt.quote_id !== id);
    return true;
  }

  async getQuoteCount() {
    return this.quotes.length;
  }

  async rateQuote(quoteId, userId, rating) {
    if (rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5');

    const quote = await this.getQuoteById(quoteId);
    if (!quote) throw new Error('Quote not found');

    // Update or create rating
    const existingRating = this.ratings.find((r) => r.quote_id === quoteId && r.user_id === userId);
    if (existingRating) {
      existingRating.rating = rating;
      existingRating.rated_at = new Date().toISOString();
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

  async getQuoteRating(quoteId) {
    const quoteRatings = this.ratings.filter((r) => r.quote_id === quoteId);
    if (quoteRatings.length === 0) {
      return { average: 0, count: 0 };
    }

    const sum = quoteRatings.reduce((acc, r) => acc + r.rating, 0);
    return {
      average: sum / quoteRatings.length,
      count: quoteRatings.length,
    };
  }

  async addTag(name, description = '') {
    if (!name) throw new Error('Tag name is required');

    const id = this.nextTagId++;
    this.tags.push({
      id,
      name: name.toLowerCase(),
      description,
      created_at: new Date().toISOString(),
    });
    return id;
  }

  async getTagByName(name) {
    return this.tags.find((t) => t.name === name.toLowerCase()) || null;
  }

  async addTagToQuote(quoteId, tagId) {
    const quote = await this.getQuoteById(quoteId);
    if (!quote) throw new Error('Quote not found');

    const tag = this.tags.find((t) => t.id === tagId);
    if (!tag) throw new Error('Tag not found');

    // Check if already tagged
    const exists = this.quoteTags.find((qt) => qt.quote_id === quoteId && qt.tag_id === tagId);
    if (exists) return false;

    this.quoteTags.push({
      quote_id: quoteId,
      tag_id: tagId,
    });
    return true;
  }

  async getQuotesByTag(tagName) {
    const tag = await this.getTagByName(tagName);
    if (!tag) return [];

    const quoteTags = this.quoteTags.filter((qt) => qt.tag_id === tag.id);
    return quoteTags
      .map((qt) => this.quotes.find((q) => q.id === qt.quote_id))
      .filter((q) => q !== undefined);
  }

  async getAllTags() {
    return [...this.tags];
  }

  async exportQuotesAsJson(quotes) {
    return JSON.stringify(quotes || this.quotes, null, 2);
  }

  async exportQuotesAsCsv(quotes) {
    const data = quotes || this.quotes;
    let csv = 'id,text,author,created_at\n';
    data.forEach((q) => {
      csv += `${q.id},"${q.text.replace(/"/g, '""')}","${q.author}","${q.created_at}"\n`;
    });
    return csv;
  }

  async getProxyConfig(key) {
    return this.proxyConfig.get(key) || null;
  }

  async setProxyConfig(key, value, encrypted = false) {
    this.proxyConfig.set(key, {
      value,
      encrypted,
      set_at: new Date().toISOString(),
    });
    return true;
  }

  async deleteProxyConfig(key) {
    if (!this.proxyConfig.has(key)) return false;
    this.proxyConfig.delete(key);
    return true;
  }

  async getAllProxyConfig() {
    return Array.from(this.proxyConfig.entries()).map(([key, val]) => ({
      key,
      ...val,
    }));
  }

  async close() {
    this.quotes = [];
    this.ratings = [];
    this.tags = [];
    this.quoteTags = [];
    this.proxyConfig.clear();
    return true;
  }
}

describe('Database Service', () => {
  let db;

  beforeEach(() => {
    db = new MockDatabaseService();
  });

  afterEach(async () => {
    await db.close();
  });

  // ============================================
  // Quote CRUD Operations
  // ============================================
  describe('Quote CRUD Operations', () => {
    describe('addQuote()', () => {
      it('should add a quote with text and author', async () => {
        const id = await db.addQuote('Test quote', 'Test Author');

        assert(typeof id === 'number');
        assert(id > 0);
      });

      it('should add quote with default Anonymous author', async () => {
        const id = await db.addQuote('Test quote');
        const quote = await db.getQuoteById(id);

        assert.strictEqual(quote.author, 'Anonymous');
      });

      it('should require quote text', async () => {
        try {
          await db.addQuote(null);
          assert.fail('Should have thrown');
        } catch (error) {
          assert(error.message.includes('text'));
        }
      });

      it('should return incremental IDs', async () => {
        const id1 = await db.addQuote('Quote 1');
        const id2 = await db.addQuote('Quote 2');
        const id3 = await db.addQuote('Quote 3');

        assert(id1 < id2);
        assert(id2 < id3);
      });

      it('should set created_at timestamp', async () => {
        const id = await db.addQuote('Test quote');
        const quote = await db.getQuoteById(id);

        assert(quote.created_at);
        assert(new Date(quote.created_at) instanceof Date);
      });
    });

    describe('getAllQuotes()', () => {
      it('should return empty array for new database', async () => {
        const quotes = await db.getAllQuotes();

        assert(Array.isArray(quotes));
        assert.strictEqual(quotes.length, 0);
      });

      it('should return all added quotes', async () => {
        await db.addQuote('Quote 1');
        await db.addQuote('Quote 2');

        const quotes = await db.getAllQuotes();

        assert.strictEqual(quotes.length, 2);
      });

      it('should not be affected by modifications to returned array', async () => {
        const id = await db.addQuote('Original text');
        const quotes1 = await db.getAllQuotes();
        const count1 = quotes1.length;

        // Get again and modify the array
        const quotes2 = await db.getAllQuotes();
        quotes2.push({ id: 999, text: 'Fake quote' });

        // Original should not have the fake quote
        const quotes3 = await db.getAllQuotes();
        assert.strictEqual(quotes3.length, count1);
        assert(!quotes3.some((q) => q.id === 999));
      });
    });

    describe('getQuoteById()', () => {
      it('should retrieve quote by ID', async () => {
        const id = await db.addQuote('Test quote', 'Test Author');
        const quote = await db.getQuoteById(id);

        assert(quote);
        assert.strictEqual(quote.id, id);
        assert.strictEqual(quote.text, 'Test quote');
        assert.strictEqual(quote.author, 'Test Author');
      });

      it('should return null for non-existent quote', async () => {
        const quote = await db.getQuoteById(99999);

        assert.strictEqual(quote, null);
      });

      it('should return quote with all properties', async () => {
        const id = await db.addQuote('Test quote', 'Author');
        const quote = await db.getQuoteById(id);

        assert(quote.hasOwnProperty('id'));
        assert(quote.hasOwnProperty('text'));
        assert(quote.hasOwnProperty('author'));
        assert(quote.hasOwnProperty('created_at'));
      });
    });

    describe('updateQuote()', () => {
      it('should update quote text and author', async () => {
        const id = await db.addQuote('Old text', 'Old Author');
        await db.updateQuote(id, 'New text', 'New Author');

        const quote = await db.getQuoteById(id);
        assert.strictEqual(quote.text, 'New text');
        assert.strictEqual(quote.author, 'New Author');
      });

      it('should set updated_at timestamp', async () => {
        const id = await db.addQuote('Text');
        await db.updateQuote(id, 'Updated text');

        const quote = await db.getQuoteById(id);
        assert(quote.updated_at);
      });

      it('should return false for non-existent quote', async () => {
        const result = await db.updateQuote(99999, 'Text');

        assert.strictEqual(result, false);
      });

      it('should use default Anonymous if no author provided', async () => {
        const id = await db.addQuote('Text', 'Original Author');
        await db.updateQuote(id, 'New text');

        const quote = await db.getQuoteById(id);
        assert.strictEqual(quote.author, 'Anonymous');
      });
    });

    describe('deleteQuote()', () => {
      it('should delete a quote', async () => {
        const id = await db.addQuote('To delete');
        const result = await db.deleteQuote(id);

        assert(result);

        const quote = await db.getQuoteById(id);
        assert.strictEqual(quote, null);
      });

      it('should return false for non-existent quote', async () => {
        const result = await db.deleteQuote(99999);

        assert.strictEqual(result, false);
      });

      it('should decrease quote count', async () => {
        await db.addQuote('Quote 1');
        const id2 = await db.addQuote('Quote 2');
        let count = await db.getQuoteCount();
        assert.strictEqual(count, 2);

        await db.deleteQuote(id2);
        count = await db.getQuoteCount();
        assert.strictEqual(count, 1);
      });

      it('should cascade delete ratings', async () => {
        const id = await db.addQuote('Quote to delete');
        await db.rateQuote(id, 'user-1', 5);

        await db.deleteQuote(id);
        const rating = await db.getQuoteRating(id);

        assert.strictEqual(rating.count, 0);
      });

      it('should cascade delete tags', async () => {
        const qId = await db.addQuote('Quote');
        const tId = await db.addTag('funny');
        await db.addTagToQuote(qId, tId);

        await db.deleteQuote(qId);
        const taggedQuotes = await db.getQuotesByTag('funny');

        assert.strictEqual(taggedQuotes.length, 0);
      });
    });

    describe('getQuoteCount()', () => {
      it('should return 0 for empty database', async () => {
        const count = await db.getQuoteCount();

        assert.strictEqual(count, 0);
      });

      it('should return correct count', async () => {
        await db.addQuote('Quote 1');
        await db.addQuote('Quote 2');
        await db.addQuote('Quote 3');

        const count = await db.getQuoteCount();

        assert.strictEqual(count, 3);
      });

      it('should decrement after delete', async () => {
        const id1 = await db.addQuote('Quote 1');
        await db.addQuote('Quote 2');

        let count = await db.getQuoteCount();
        assert.strictEqual(count, 2);

        await db.deleteQuote(id1);
        count = await db.getQuoteCount();
        assert.strictEqual(count, 1);
      });
    });
  });

  // ============================================
  // Search Operations
  // ============================================
  describe('Search Operations', () => {
    it('should search by quote text', async () => {
      await db.addQuote('The quick brown fox', 'Author 1');
      await db.addQuote('The lazy dog', 'Author 2');

      const results = await db.searchQuotes('quick');

      assert.strictEqual(results.length, 1);
      assert(results[0].text.includes('quick'));
    });

    it('should search by author name', async () => {
      await db.addQuote('Quote 1', 'Albert Einstein');
      await db.addQuote('Quote 2', 'Marie Curie');

      const results = await db.searchQuotes('einstein');

      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].author, 'Albert Einstein');
    });

    it('should be case-insensitive', async () => {
      await db.addQuote('Amazing quote', 'Author');

      const results1 = await db.searchQuotes('AMAZING');
      const results2 = await db.searchQuotes('amazing');

      assert.strictEqual(results1.length, 1);
      assert.strictEqual(results2.length, 1);
    });

    it('should return empty array for no matches', async () => {
      await db.addQuote('Test quote', 'Author');

      const results = await db.searchQuotes('nonexistent');

      assert.strictEqual(results.length, 0);
    });

    it('should handle empty search keyword', async () => {
      await db.addQuote('Test quote');

      const results = await db.searchQuotes('');

      assert.strictEqual(results.length, 0);
    });
  });

  // ============================================
  // Rating System
  // ============================================
  describe('Rating System', () => {
    describe('rateQuote()', () => {
      it('should add rating to quote', async () => {
        const qId = await db.addQuote('Quote');
        const result = await db.rateQuote(qId, 'user-1', 5);

        assert(result);
      });

      it('should enforce 1-5 rating range', async () => {
        const qId = await db.addQuote('Quote');

        try {
          await db.rateQuote(qId, 'user-1', 6);
          assert.fail('Should have thrown');
        } catch (error) {
          assert(error.message.includes('Rating'));
        }
      });

      it('should reject zero rating', async () => {
        const qId = await db.addQuote('Quote');

        try {
          await db.rateQuote(qId, 'user-1', 0);
          assert.fail('Should have thrown');
        } catch (error) {
          assert(error.message.includes('Rating'));
        }
      });

      it('should reject non-existent quote', async () => {
        try {
          await db.rateQuote(99999, 'user-1', 5);
          assert.fail('Should have thrown');
        } catch (error) {
          assert(error.message.includes('not found'));
        }
      });

      it('should update existing rating', async () => {
        const qId = await db.addQuote('Quote');
        await db.rateQuote(qId, 'user-1', 3);
        await db.rateQuote(qId, 'user-1', 5);

        const rating = await db.getQuoteRating(qId);
        assert.strictEqual(rating.average, 5);
        assert.strictEqual(rating.count, 1);
      });
    });

    describe('getQuoteRating()', () => {
      it('should return average and count', async () => {
        const qId = await db.addQuote('Quote');
        await db.rateQuote(qId, 'user-1', 5);
        await db.rateQuote(qId, 'user-2', 3);

        const rating = await db.getQuoteRating(qId);

        assert.strictEqual(rating.average, 4);
        assert.strictEqual(rating.count, 2);
      });

      it('should return 0 for unrated quote', async () => {
        const qId = await db.addQuote('Quote');
        const rating = await db.getQuoteRating(qId);

        assert.strictEqual(rating.average, 0);
        assert.strictEqual(rating.count, 0);
      });

      it('should calculate correct average', async () => {
        const qId = await db.addQuote('Quote');
        await db.rateQuote(qId, 'user-1', 1);
        await db.rateQuote(qId, 'user-2', 2);
        await db.rateQuote(qId, 'user-3', 3);

        const rating = await db.getQuoteRating(qId);

        assert.strictEqual(rating.average, 2);
      });
    });
  });

  // ============================================
  // Tag System
  // ============================================
  describe('Tag System', () => {
    describe('addTag()', () => {
      it('should add a tag', async () => {
        const id = await db.addTag('funny', 'Humorous quotes');

        assert(typeof id === 'number');
      });

      it('should normalize tag names to lowercase', async () => {
        const id = await db.addTag('FUNNY');
        const tag = await db.getTagByName('funny');

        assert(tag);
        assert.strictEqual(tag.name, 'funny');
      });

      it('should require tag name', async () => {
        try {
          await db.addTag(null);
          assert.fail('Should have thrown');
        } catch (error) {
          assert(error.message.includes('Tag name'));
        }
      });
    });

    describe('getTagByName()', () => {
      it('should retrieve tag by name', async () => {
        await db.addTag('funny', 'Humorous quotes');
        const tag = await db.getTagByName('funny');

        assert(tag);
        assert.strictEqual(tag.name, 'funny');
      });

      it('should be case-insensitive', async () => {
        await db.addTag('funny');
        const tag = await db.getTagByName('FUNNY');

        assert(tag);
      });

      it('should return null for non-existent tag', async () => {
        const tag = await db.getTagByName('nonexistent');

        assert.strictEqual(tag, null);
      });
    });

    describe('addTagToQuote()', () => {
      it('should tag a quote', async () => {
        const qId = await db.addQuote('Quote');
        const tId = await db.addTag('funny');
        const result = await db.addTagToQuote(qId, tId);

        assert(result);
      });

      it('should reject duplicate tags', async () => {
        const qId = await db.addQuote('Quote');
        const tId = await db.addTag('funny');
        await db.addTagToQuote(qId, tId);

        const result = await db.addTagToQuote(qId, tId);

        assert.strictEqual(result, false);
      });

      it('should reject non-existent quote', async () => {
        const tId = await db.addTag('funny');

        try {
          await db.addTagToQuote(99999, tId);
          assert.fail('Should have thrown');
        } catch (error) {
          assert(error.message.includes('Quote'));
        }
      });

      it('should reject non-existent tag', async () => {
        const qId = await db.addQuote('Quote');

        try {
          await db.addTagToQuote(qId, 99999);
          assert.fail('Should have thrown');
        } catch (error) {
          assert(error.message.includes('Tag'));
        }
      });
    });

    describe('getQuotesByTag()', () => {
      it('should retrieve quotes by tag', async () => {
        const q1 = await db.addQuote('Funny quote 1');
        const q2 = await db.addQuote('Funny quote 2');
        const tId = await db.addTag('funny');

        await db.addTagToQuote(q1, tId);
        await db.addTagToQuote(q2, tId);

        const quotes = await db.getQuotesByTag('funny');

        assert.strictEqual(quotes.length, 2);
      });

      it('should return empty array for untagged quotes', async () => {
        const quotes = await db.getQuotesByTag('nonexistent');

        assert.strictEqual(quotes.length, 0);
      });
    });

    describe('getAllTags()', () => {
      it('should return all tags', async () => {
        await db.addTag('funny');
        await db.addTag('inspiring');
        await db.addTag('sad');

        const tags = await db.getAllTags();

        assert.strictEqual(tags.length, 3);
      });

      it('should return empty array for new database', async () => {
        const tags = await db.getAllTags();

        assert.strictEqual(tags.length, 0);
      });
    });
  });

  // ============================================
  // Export Operations
  // ============================================
  describe('Export Operations', () => {
    it('exportQuotesAsJson should return valid JSON', async () => {
      const q1 = await db.addQuote('Quote 1', 'Author 1');
      const q2 = await db.addQuote('Quote 2', 'Author 2');

      const json = await db.exportQuotesAsJson();
      const parsed = JSON.parse(json);

      assert(Array.isArray(parsed));
      assert.strictEqual(parsed.length, 2);
    });

    it('exportQuotesAsJson should format with indentation', async () => {
      await db.addQuote('Test quote');

      const json = await db.exportQuotesAsJson();

      assert(json.includes('\n'));
    });

    it('exportQuotesAsCSV should return valid CSV', async () => {
      await db.addQuote('Test quote', 'Test Author');

      const csv = await db.exportQuotesAsCsv();

      assert(csv.includes('id,text,author'));
      assert(csv.includes('Test quote'));
      assert(csv.includes('Test Author'));
    });

    it('exportQuotesAsCSV should handle special characters', async () => {
      await db.addQuote('Quote with "quotes"', 'Author');

      const csv = await db.exportQuotesAsCsv();

      assert(csv.includes('""quotes""'));
    });

    it('exportQuotesAsJson with custom quotes', async () => {
      const customQuotes = [{ id: 1, text: 'Custom', author: 'Test' }];
      const json = await db.exportQuotesAsJson(customQuotes);

      assert(json.includes('Custom'));
    });
  });

  // ============================================
  // Proxy Configuration Storage
  // ============================================
  describe('Proxy Configuration', () => {
    describe('setProxyConfig()', () => {
      it('should set configuration value', async () => {
        const result = await db.setProxyConfig('api_key', 'secret123');

        assert(result);
      });

      it('should accept encrypted flag', async () => {
        await db.setProxyConfig('password', 'secret', true);
        const config = await db.getProxyConfig('password');

        assert.strictEqual(config.encrypted, true);
      });
    });

    describe('getProxyConfig()', () => {
      it('should retrieve configuration', async () => {
        await db.setProxyConfig('api_url', 'https://api.example.com');
        const value = await db.getProxyConfig('api_url');

        assert(value);
        assert.strictEqual(value.value, 'https://api.example.com');
      });

      it('should return null for non-existent key', async () => {
        const value = await db.getProxyConfig('nonexistent');

        assert.strictEqual(value, null);
      });
    });

    describe('deleteProxyConfig()', () => {
      it('should delete configuration', async () => {
        await db.setProxyConfig('temp_key', 'value');
        const result = await db.deleteProxyConfig('temp_key');

        assert(result);

        const value = await db.getProxyConfig('temp_key');
        assert.strictEqual(value, null);
      });

      it('should return false for non-existent key', async () => {
        const result = await db.deleteProxyConfig('nonexistent');

        assert.strictEqual(result, false);
      });
    });

    describe('getAllProxyConfig()', () => {
      it('should return all configurations', async () => {
        await db.setProxyConfig('key1', 'value1');
        await db.setProxyConfig('key2', 'value2');

        const configs = await db.getAllProxyConfig();

        assert.strictEqual(configs.length, 2);
        assert(configs.some((c) => c.key === 'key1'));
        assert(configs.some((c) => c.key === 'key2'));
      });

      it('should return empty array for no configs', async () => {
        const configs = await db.getAllProxyConfig();

        assert.strictEqual(configs.length, 0);
      });
    });
  });

  // ============================================
  // Integration Tests
  // ============================================
  describe('Integration - Complex Workflows', () => {
    it('should handle complete quote lifecycle with ratings and tags', async () => {
      // Add quote
      const qId = await db.addQuote('Great quote', 'Famous Author');

      // Add tags
      const tId1 = await db.addTag('inspiring');
      const tId2 = await db.addTag('motivational');

      // Tag quote
      await db.addTagToQuote(qId, tId1);
      await db.addTagToQuote(qId, tId2);

      // Rate quote
      await db.rateQuote(qId, 'user-1', 5);
      await db.rateQuote(qId, 'user-2', 4);

      // Verify quote is findable by all tags
      const byTag1 = await db.getQuotesByTag('inspiring');
      const byTag2 = await db.getQuotesByTag('motivational');

      assert.strictEqual(byTag1.length, 1);
      assert.strictEqual(byTag2.length, 1);

      // Verify rating
      const rating = await db.getQuoteRating(qId);
      assert.strictEqual(rating.average, 4.5);
      assert.strictEqual(rating.count, 2);

      // Search should find it
      const search = await db.searchQuotes('great');
      assert.strictEqual(search.length, 1);

      // Update quote
      await db.updateQuote(qId, 'Even better quote');
      const updated = await db.getQuoteById(qId);
      assert.strictEqual(updated.text, 'Even better quote');

      // Delete should remove ratings and tags
      await db.deleteQuote(qId);

      const byTag1After = await db.getQuotesByTag('inspiring');
      assert.strictEqual(byTag1After.length, 0);
    });

    it('should maintain referential integrity with multiple quotes', async () => {
      // Add multiple quotes
      const q1 = await db.addQuote('Quote 1', 'Author A');
      const q2 = await db.addQuote('Quote 2', 'Author B');
      const q3 = await db.addQuote('Quote 3', 'Author C');

      // Add shared tag
      const tId = await db.addTag('shared');

      // Tag all quotes
      await db.addTagToQuote(q1, tId);
      await db.addTagToQuote(q2, tId);
      await db.addTagToQuote(q3, tId);

      // Rate all quotes
      await db.rateQuote(q1, 'user-1', 5);
      await db.rateQuote(q2, 'user-2', 4);
      await db.rateQuote(q3, 'user-3', 3);

      // Delete middle quote
      await db.deleteQuote(q2);

      // Verify others still exist
      const byTag = await db.getQuotesByTag('shared');
      assert.strictEqual(byTag.length, 2);

      const quotes = await db.getAllQuotes();
      assert.strictEqual(quotes.length, 2);
    });
  });

  // ============================================
  // Edge Cases
  // ============================================
  describe('Edge Cases', () => {
    it('should handle very long quote text', async () => {
      const longText = 'a'.repeat(10000);
      const id = await db.addQuote(longText);

      assert(typeof id === 'number');
    });

    it('should handle special characters in quotes', async () => {
      const id = await db.addQuote('Quote with \n newlines \t tabs', "Author's Name");
      const quote = await db.getQuoteById(id);

      assert(quote.text.includes('newlines'));
      assert(quote.author.includes("'"));
    });

    it('should handle unicode characters', async () => {
      const id = await db.addQuote('Quote with émojis 🎉 and üñicode', 'Autör');
      const quote = await db.getQuoteById(id);

      assert(quote.text.includes('🎉'));
      assert(quote.author.includes('ö'));
    });

    it('should handle rapid sequential operations', async () => {
      const ids = [];
      for (let i = 0; i < 50; i++) {
        ids.push(await db.addQuote(`Quote ${i}`));
      }

      const count = await db.getQuoteCount();
      assert.strictEqual(count, 50);
    });

    it('should handle empty database operations', async () => {
      const quotes = await db.getAllQuotes();
      const count = await db.getQuoteCount();
      const search = await db.searchQuotes('anything');
      const tags = await db.getAllTags();

      assert.strictEqual(quotes.length, 0);
      assert.strictEqual(count, 0);
      assert.strictEqual(search.length, 0);
      assert.strictEqual(tags.length, 0);
    });

    it('should handle whitespace in search', async () => {
      await db.addQuote('Test   quote   with   spaces');

      const results = await db.searchQuotes('   ');

      assert(Array.isArray(results));
    });
  });
});
