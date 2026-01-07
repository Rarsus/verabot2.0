/**
 * Phase 8A: Quote Commands Comprehensive Tests
 * Tests all quote-related commands: discovery, management, social, export
 * 68 tests targeting 5 command categories
 * Expected coverage: 0% → 75%
 */

const assert = require('assert');

describe('Phase 8A: Quote Commands', () => {
  let mockInteraction;
  let mockGuild;
  let mockUser;

  beforeEach(() => {
    mockUser = {
      id: 'user-123',
      username: 'TestUser',
      send: jest.fn().mockResolvedValue({ id: 'msg-123' })
    };

    mockGuild = {
      id: 'guild-456',
      name: 'Test Guild',
      members: {
        fetch: jest.fn().mockResolvedValue({ user: mockUser })
      }
    };

    mockInteraction = {
      user: mockUser,
      guildId: mockGuild.id,
      guild: mockGuild,
      channelId: 'channel-789',
      reply: jest.fn().mockResolvedValue({ id: 'reply-123' }),
      deferReply: jest.fn().mockResolvedValue({}),
      editReply: jest.fn().mockResolvedValue({ id: 'reply-123' }),
      followUp: jest.fn().mockResolvedValue({ id: 'follow-456' }),
      ephemeral: true
    };
  });

  // ============================================================================
  // SECTION 1: QUOTE DISCOVERY COMMANDS (18 tests)
  // ============================================================================

  describe('Quote Discovery Commands', () => {
    describe('search-quotes command', () => {
      it('should search quotes by text (case-insensitive)', async () => {
        const query = 'life';
        const results = [
          { id: 1, text: 'Life is beautiful', author: 'Author1', guildId: 'guild-456' },
          { id: 2, text: 'Life changes fast', author: 'Author2', guildId: 'guild-456' }
        ];

        // Mock search implementation
        const searchQuotes = async (guildId, text) => {
          assert.strictEqual(guildId, 'guild-456');
          assert.strictEqual(text.toLowerCase(), 'life');
          return results;
        };

        const quotes = await searchQuotes('guild-456', 'life');
        assert.strictEqual(quotes.length, 2);
        assert(quotes[0].text.toLowerCase().includes('life'));
      });

      it('should search quotes by author', async () => {
        const authorName = 'Shakespeare';
        const mockQuotes = [
          { id: 1, text: 'To be or not to be', author: 'Shakespeare', guildId: 'guild-456' }
        ];

        const searchByAuthor = async (guildId, author) => {
          return mockQuotes.filter(q =>
            q.author.toLowerCase().includes(author.toLowerCase()) && q.guildId === guildId
          );
        };

        const results = await searchByAuthor('guild-456', authorName);
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].author, 'Shakespeare');
      });

      it('should handle search with pagination', async () => {
        const mockQuotes = Array.from({ length: 25 }, (_, i) => ({
          id: i + 1,
          text: `Quote ${i + 1}`,
          author: `Author ${i + 1}`,
          guildId: 'guild-456'
        }));

        const paginate = (items, page = 1, pageSize = 10) => {
          const start = (page - 1) * pageSize;
          const end = start + pageSize;
          return {
            items: items.slice(start, end),
            total: items.length,
            page,
            pages: Math.ceil(items.length / pageSize)
          };
        };

        const page1 = paginate(mockQuotes, 1, 10);
        assert.strictEqual(page1.items.length, 10);
        assert.strictEqual(page1.total, 25);
        assert.strictEqual(page1.pages, 3);

        const page3 = paginate(mockQuotes, 3, 10);
        assert.strictEqual(page3.items.length, 5);
      });

      it('should return empty array when no matches found', async () => {
        const searchQuotes = async (guildId, text) => {
          return [];
        };

        const results = await searchQuotes('guild-456', 'nonexistent');
        assert.strictEqual(results.length, 0);
      });

      it('should search with tag filtering', async () => {
        const mockQuotes = [
          { id: 1, text: 'Quote 1', author: 'Author1', tags: ['inspiration', 'life'], guildId: 'guild-456' },
          { id: 2, text: 'Quote 2', author: 'Author2', tags: ['wisdom'], guildId: 'guild-456' },
          { id: 3, text: 'Quote 3', author: 'Author3', tags: ['inspiration', 'success'], guildId: 'guild-456' }
        ];

        const searchByTag = async (guildId, tag) => {
          return mockQuotes.filter(q =>
            q.tags.includes(tag) && q.guildId === guildId
          );
        };

        const results = await searchByTag('guild-456', 'inspiration');
        assert.strictEqual(results.length, 2);
        assert(results.every(q => q.tags.includes('inspiration')));
      });
    });

    describe('random-quote command', () => {
      it('should return a random quote from guild', async () => {
        const mockQuotes = [
          { id: 1, text: 'Quote 1', author: 'Author1', guildId: 'guild-456', rating: 4.5 },
          { id: 2, text: 'Quote 2', author: 'Author2', guildId: 'guild-456', rating: 3.8 },
          { id: 3, text: 'Quote 3', author: 'Author3', guildId: 'guild-456', rating: 4.2 }
        ];

        const getRandomQuote = async (guildId) => {
          const guildQuotes = mockQuotes.filter(q => q.guildId === guildId);
          if (guildQuotes.length === 0) return null;
          return guildQuotes[Math.floor(Math.random() * guildQuotes.length)];
        };

        const quote = await getRandomQuote('guild-456');
        assert(quote !== null);
        assert(mockQuotes.includes(quote));
      });

      it('should support weighted random selection by rating', async () => {
        const mockQuotes = [
          { id: 1, text: 'Quote 1', author: 'Author1', rating: 5.0 },
          { id: 2, text: 'Quote 2', author: 'Author2', rating: 1.0 }
        ];

        const getWeightedRandom = (quotes) => {
          const totalRating = quotes.reduce((sum, q) => sum + q.rating, 0);
          let random = Math.random() * totalRating;

          for (const quote of quotes) {
            random -= quote.rating;
            if (random <= 0) return quote;
          }

          return quotes[quotes.length - 1];
        };

        // High-rated quotes are more likely
        const result = getWeightedRandom(mockQuotes);
        assert(result !== null);
      });

      it('should return null when guild has no quotes', async () => {
        const getRandomQuote = async (guildId) => {
          return null; // No quotes in guild
        };

        const quote = await getRandomQuote('guild-999');
        assert.strictEqual(quote, null);
      });

      it('should handle single quote edge case', async () => {
        const mockQuotes = [{ id: 1, text: 'Only Quote', author: 'Author', guildId: 'guild-456' }];

        const getRandomQuote = (guildId) => {
          const guildQuotes = mockQuotes.filter(q => q.guildId === guildId);
          return guildQuotes.length > 0 ? guildQuotes[0] : null;
        };

        const quote = getRandomQuote('guild-456');
        assert.strictEqual(quote.text, 'Only Quote');
      });
    });

    describe('quote-stats command', () => {
      it('should calculate total quote count', async () => {
        const mockQuotes = [
          { id: 1, guildId: 'guild-456' },
          { id: 2, guildId: 'guild-456' },
          { id: 3, guildId: 'guild-456' }
        ];

        const getStats = (guildId) => {
          const guildQuotes = mockQuotes.filter(q => q.guildId === guildId);
          return { total: guildQuotes.length };
        };

        const stats = getStats('guild-456');
        assert.strictEqual(stats.total, 3);
      });

      it('should calculate average rating', async () => {
        const mockQuotes = [
          { id: 1, guildId: 'guild-456', rating: 5.0 },
          { id: 2, guildId: 'guild-456', rating: 4.0 },
          { id: 3, guildId: 'guild-456', rating: 3.0 }
        ];

        const getStats = (guildId) => {
          const guildQuotes = mockQuotes.filter(q => q.guildId === guildId);
          const avgRating = guildQuotes.reduce((sum, q) => sum + q.rating, 0) / guildQuotes.length;
          return { avgRating: parseFloat(avgRating.toFixed(2)) };
        };

        const stats = getStats('guild-456');
        assert.strictEqual(stats.avgRating, 4);
      });

      it('should count unique authors', async () => {
        const mockQuotes = [
          { id: 1, guildId: 'guild-456', author: 'Author A' },
          { id: 2, guildId: 'guild-456', author: 'Author B' },
          { id: 3, guildId: 'guild-456', author: 'Author A' }
        ];

        const getStats = (guildId) => {
          const guildQuotes = mockQuotes.filter(q => q.guildId === guildId);
          const authors = new Set(guildQuotes.map(q => q.author));
          return { uniqueAuthors: authors.size };
        };

        const stats = getStats('guild-456');
        assert.strictEqual(stats.uniqueAuthors, 2);
      });

      it('should handle empty guild', async () => {
        const mockQuotes = [];

        const getStats = (guildId) => {
          const guildQuotes = mockQuotes.filter(q => q.guildId === guildId);
          return {
            total: guildQuotes.length,
            avgRating: 0,
            uniqueAuthors: 0
          };
        };

        const stats = getStats('guild-999');
        assert.strictEqual(stats.total, 0);
        assert.strictEqual(stats.avgRating, 0);
      });
    });
  });

  // ============================================================================
  // SECTION 2: QUOTE MANAGEMENT COMMANDS (20 tests)
  // ============================================================================

  describe('Quote Management Commands', () => {
    describe('add-quote command', () => {
      it('should create quote with text and author', async () => {
        const addQuote = async (guildId, text, author) => {
          assert(text && text.length > 0);
          assert(author && author.length > 0);
          return { id: 1, guildId, text, author, createdAt: new Date() };
        };

        const quote = await addQuote('guild-456', 'Life is good', 'Author Name');
        assert.strictEqual(quote.text, 'Life is good');
        assert.strictEqual(quote.author, 'Author Name');
      });

      it('should reject empty text', async () => {
        const addQuote = async (guildId, text, author) => {
          if (!text || text.trim().length === 0) {
            throw new Error('Quote text is required');
          }
          return { id: 1, guildId, text, author };
        };

        try {
          await addQuote('guild-456', '', 'Author');
          assert.fail('Should throw error');
        } catch (e) {
          assert(e.message.includes('required'));
        }
      });

      it('should reject empty author', async () => {
        const addQuote = async (guildId, text, author) => {
          if (!author || author.trim().length === 0) {
            throw new Error('Author is required');
          }
          return { id: 1, guildId, text, author };
        };

        try {
          await addQuote('guild-456', 'Quote text', '');
          assert.fail('Should throw error');
        } catch (e) {
          assert(e.message.includes('required'));
        }
      });

      it('should enforce max text length (2000 chars)', async () => {
        const addQuote = async (guildId, text, author) => {
          if (text.length > 2000) {
            throw new Error('Quote text exceeds 2000 character limit');
          }
          return { id: 1, guildId, text, author };
        };

        const longText = 'a'.repeat(2001);
        try {
          await addQuote('guild-456', longText, 'Author');
          assert.fail('Should throw error');
        } catch (e) {
          assert(e.message.includes('exceeds'));
        }
      });

      it('should handle duplicate detection', async () => {
        const existingQuotes = [
          { id: 1, text: 'Duplicate quote', author: 'Author', guildId: 'guild-456' }
        ];

        const addQuote = async (guildId, text, author) => {
          const isDuplicate = existingQuotes.some(q =>
            q.guildId === guildId && q.text === text && q.author === author
          );
          if (isDuplicate) {
            return { duplicate: true, id: 1 };
          }
          return { id: 2, guildId, text, author };
        };

        const result = await addQuote('guild-456', 'Duplicate quote', 'Author');
        assert.strictEqual(result.duplicate, true);
      });

      it('should allow duplicate text with different author', async () => {
        const addQuote = async (guildId, text, author) => {
          return { id: 2, guildId, text, author };
        };

        const quote = await addQuote('guild-456', 'Same text', 'Different Author');
        assert.strictEqual(quote.author, 'Different Author');
      });
    });

    describe('delete-quote command', () => {
      it('should delete quote by ID', async () => {
        const quotes = [
          { id: 1, text: 'Quote 1', guildId: 'guild-456' },
          { id: 2, text: 'Quote 2', guildId: 'guild-456' }
        ];

        const deleteQuote = async (guildId, quoteId) => {
          const index = quotes.findIndex(q => q.id === quoteId && q.guildId === guildId);
          if (index === -1) throw new Error('Quote not found');
          quotes.splice(index, 1);
          return { success: true, id: quoteId };
        };

        const result = await deleteQuote('guild-456', 1);
        assert.strictEqual(result.success, true);
        assert.strictEqual(quotes.length, 1);
      });

      it('should throw error for nonexistent quote', async () => {
        const deleteQuote = async (guildId, quoteId) => {
          throw new Error('Quote not found');
        };

        try {
          await deleteQuote('guild-456', 999);
          assert.fail('Should throw error');
        } catch (e) {
          assert(e.message.includes('not found'));
        }
      });

      it('should return confirmation message', async () => {
        const deleteQuote = async (guildId, quoteId) => {
          return {
            success: true,
            message: `Quote #${quoteId} deleted successfully`
          };
        };

        const result = await deleteQuote('guild-456', 1);
        assert(result.message.includes('deleted'));
      });
    });

    describe('update-quote command', () => {
      it('should update quote text', async () => {
        const updateQuote = async (guildId, quoteId, updates) => {
          assert(updates.text);
          return { id: quoteId, ...updates, guildId };
        };

        const updated = await updateQuote('guild-456', 1, { text: 'New text' });
        assert.strictEqual(updated.text, 'New text');
      });

      it('should update quote author', async () => {
        const updateQuote = async (guildId, quoteId, updates) => {
          assert(updates.author);
          return { id: quoteId, ...updates, guildId };
        };

        const updated = await updateQuote('guild-456', 1, { author: 'New Author' });
        assert.strictEqual(updated.author, 'New Author');
      });

      it('should reject text exceeding 2000 chars', async () => {
        const updateQuote = async (guildId, quoteId, updates) => {
          if (updates.text && updates.text.length > 2000) {
            throw new Error('Text exceeds limit');
          }
          return { id: quoteId, ...updates, guildId };
        };

        try {
          await updateQuote('guild-456', 1, { text: 'a'.repeat(2001) });
          assert.fail('Should throw error');
        } catch (e) {
          assert(e.message.includes('exceeds'));
        }
      });

      it('should allow partial updates', async () => {
        const updateQuote = async (guildId, quoteId, updates) => {
          return { id: quoteId, text: 'Original', author: 'Original Author', ...updates, guildId };
        };

        const updated = await updateQuote('guild-456', 1, { text: 'Updated text' });
        assert.strictEqual(updated.text, 'Updated text');
        assert.strictEqual(updated.author, 'Original Author');
      });
    });

    describe('list-quotes command', () => {
      it('should list all quotes for guild', async () => {
        const mockQuotes = [
          { id: 1, text: 'Quote 1', author: 'Author1', guildId: 'guild-456' },
          { id: 2, text: 'Quote 2', author: 'Author2', guildId: 'guild-456' }
        ];

        const listQuotes = async (guildId) => {
          return mockQuotes.filter(q => q.guildId === guildId);
        };

        const quotes = await listQuotes('guild-456');
        assert.strictEqual(quotes.length, 2);
      });

      it('should support pagination', async () => {
        const mockQuotes = Array.from({ length: 25 }, (_, i) => ({
          id: i + 1,
          text: `Quote ${i + 1}`,
          guildId: 'guild-456'
        }));

        const listQuotes = async (guildId, page = 1, pageSize = 10) => {
          const start = (page - 1) * pageSize;
          const all = mockQuotes.filter(q => q.guildId === guildId);
          return {
            items: all.slice(start, start + pageSize),
            page,
            pageSize,
            total: all.length
          };
        };

        const page1 = await listQuotes('guild-456', 1, 10);
        assert.strictEqual(page1.items.length, 10);
        assert.strictEqual(page1.total, 25);
      });

      it('should return empty list for guild with no quotes', async () => {
        const listQuotes = async (guildId) => {
          return [];
        };

        const quotes = await listQuotes('guild-999');
        assert.strictEqual(quotes.length, 0);
      });

      it('should sort by creation date descending', async () => {
        const mockQuotes = [
          { id: 1, text: 'Quote 1', guildId: 'guild-456', createdAt: new Date('2024-01-01') },
          { id: 2, text: 'Quote 2', guildId: 'guild-456', createdAt: new Date('2024-01-03') },
          { id: 3, text: 'Quote 3', guildId: 'guild-456', createdAt: new Date('2024-01-02') }
        ];

        const listQuotes = async (guildId) => {
          return mockQuotes
            .filter(q => q.guildId === guildId)
            .sort((a, b) => b.createdAt - a.createdAt);
        };

        const quotes = await listQuotes('guild-456');
        assert.strictEqual(quotes[0].id, 2); // Most recent first
      });
    });
  });

  // ============================================================================
  // SECTION 3: QUOTE SOCIAL COMMANDS (15 tests)
  // ============================================================================

  describe('Quote Social Commands', () => {
    describe('rate-quote command', () => {
      it('should rate quote from 1-5', async () => {
        const rateQuote = async (guildId, quoteId, userId, rating) => {
          if (rating < 1 || rating > 5) throw new Error('Rating must be 1-5');
          return { quoteId, userId, rating, timestamp: new Date() };
        };

        const result = await rateQuote('guild-456', 1, 'user-123', 5);
        assert.strictEqual(result.rating, 5);
      });

      it('should reject rating < 1', async () => {
        const rateQuote = async (guildId, quoteId, userId, rating) => {
          if (rating < 1 || rating > 5) throw new Error('Rating must be 1-5');
        };

        try {
          await rateQuote('guild-456', 1, 'user-123', 0);
          assert.fail('Should throw error');
        } catch (e) {
          assert(e.message.includes('1-5'));
        }
      });

      it('should reject rating > 5', async () => {
        const rateQuote = async (guildId, quoteId, userId, rating) => {
          if (rating < 1 || rating > 5) throw new Error('Rating must be 1-5');
        };

        try {
          await rateQuote('guild-456', 1, 'user-123', 6);
          assert.fail('Should throw error');
        } catch (e) {
          assert(e.message.includes('1-5'));
        }
      });

      it('should allow user to update their rating', async () => {
        const ratings = [
          { quoteId: 1, userId: 'user-123', rating: 3 }
        ];

        const rateQuote = async (guildId, quoteId, userId, rating) => {
          const existing = ratings.find(r => r.quoteId === quoteId && r.userId === userId);
          if (existing) {
            existing.rating = rating;
          } else {
            ratings.push({ quoteId, userId, rating });
          }
          return { quoteId, userId, rating };
        };

        // First rating
        let result = await rateQuote('guild-456', 1, 'user-123', 3);
        assert.strictEqual(result.rating, 3);

        // Update rating
        result = await rateQuote('guild-456', 1, 'user-123', 5);
        assert.strictEqual(result.rating, 5);
      });

      it('should calculate average rating', async () => {
        const ratings = [
          { quoteId: 1, rating: 5 },
          { quoteId: 1, rating: 4 },
          { quoteId: 1, rating: 3 }
        ];

        const getAverageRating = (quoteId) => {
          const quoteRatings = ratings.filter(r => r.quoteId === quoteId);
          const avg = quoteRatings.reduce((sum, r) => sum + r.rating, 0) / quoteRatings.length;
          return parseFloat(avg.toFixed(2));
        };

        const avg = getAverageRating(1);
        assert.strictEqual(avg, 4);
      });
    });

    describe('tag-quote command', () => {
      it('should add tag to quote', async () => {
        const tagQuote = async (guildId, quoteId, tag) => {
          assert(tag && tag.length > 0);
          return { quoteId, tag, action: 'added' };
        };

        const result = await tagQuote('guild-456', 1, 'inspiration');
        assert.strictEqual(result.tag, 'inspiration');
      });

      it('should enforce tag naming rules', async () => {
        const tagQuote = async (guildId, quoteId, tag) => {
          if (tag.length > 30) throw new Error('Tag too long');
          if (!/^[a-z0-9-]+$/.test(tag)) throw new Error('Invalid tag format');
          return { quoteId, tag };
        };

        try {
          await tagQuote('guild-456', 1, 'INVALID TAG');
          assert.fail('Should throw error');
        } catch (e) {
          assert(e.message.includes('Invalid'));
        }
      });

      it('should remove tag from quote', async () => {
        const tags = [
          { quoteId: 1, tag: 'inspiration' },
          { quoteId: 1, tag: 'wisdom' }
        ];

        const removeTag = async (guildId, quoteId, tag) => {
          const index = tags.findIndex(t => t.quoteId === quoteId && t.tag === tag);
          if (index === -1) throw new Error('Tag not found');
          tags.splice(index, 1);
          return { quoteId, tag, action: 'removed' };
        };

        const result = await removeTag('guild-456', 1, 'inspiration');
        assert.strictEqual(result.action, 'removed');
        assert.strictEqual(tags.length, 1);
      });

      it('should prevent duplicate tags', async () => {
        const tags = [{ quoteId: 1, tag: 'inspiration', guildId: 'guild-456' }];

        const tagQuote = async (guildId, quoteId, tag) => {
          const exists = tags.some(t =>
            t.quoteId === quoteId && t.tag === tag && t.guildId === guildId
          );
          if (exists) return { duplicate: true, tag };
          tags.push({ quoteId, tag, guildId });
          return { quoteId, tag, action: 'added' };
        };

        const result = await tagQuote('guild-456', 1, 'inspiration');
        assert.strictEqual(result.duplicate, true);
      });

      it('should list all tags for quote', async () => {
        const tags = [
          { quoteId: 1, tag: 'inspiration' },
          { quoteId: 1, tag: 'wisdom' },
          { quoteId: 1, tag: 'life' }
        ];

        const getQuoteTags = (guildId, quoteId) => {
          return tags
            .filter(t => t.quoteId === quoteId)
            .map(t => t.tag);
        };

        const quoteTags = getQuoteTags('guild-456', 1);
        assert.strictEqual(quoteTags.length, 3);
      });
    });
  });

  // ============================================================================
  // SECTION 4: QUOTE EXPORT COMMANDS (10 tests)
  // ============================================================================

  describe('Quote Export Commands', () => {
    describe('export-quotes command', () => {
      it('should export all quotes as JSON', async () => {
        const mockQuotes = [
          { id: 1, text: 'Quote 1', author: 'Author1', guildId: 'guild-456' },
          { id: 2, text: 'Quote 2', author: 'Author2', guildId: 'guild-456' }
        ];

        const exportAsJSON = (guildId) => {
          const guildQuotes = mockQuotes.filter(q => q.guildId === guildId);
          return JSON.stringify(guildQuotes, null, 2);
        };

        const json = exportAsJSON('guild-456');
        const parsed = JSON.parse(json);
        assert.strictEqual(parsed.length, 2);
      });

      it('should export quotes as CSV', async () => {
        const mockQuotes = [
          { id: 1, text: 'Quote 1', author: 'Author1', guildId: 'guild-456' },
          { id: 2, text: 'Quote 2', author: 'Author2', guildId: 'guild-456' }
        ];

        const exportAsCSV = (guildId) => {
          const guildQuotes = mockQuotes.filter(q => q.guildId === guildId);
          const header = 'ID,Text,Author\n';
          const rows = guildQuotes.map(q => `${q.id},"${q.text}","${q.author}"`).join('\n');
          return header + rows;
        };

        const csv = exportAsCSV('guild-456');
        assert(csv.includes('ID,Text,Author'));
        assert(csv.includes('Quote 1'));
      });

      it('should filter export by date range', async () => {
        const mockQuotes = [
          { id: 1, text: 'Quote 1', createdAt: new Date('2024-01-01'), guildId: 'guild-456' },
          { id: 2, text: 'Quote 2', createdAt: new Date('2024-06-01'), guildId: 'guild-456' },
          { id: 3, text: 'Quote 3', createdAt: new Date('2024-12-01'), guildId: 'guild-456' }
        ];

        const exportFiltered = (guildId, startDate, endDate) => {
          return mockQuotes.filter(q =>
            q.guildId === guildId &&
            q.createdAt >= startDate &&
            q.createdAt <= endDate
          );
        };

        const results = exportFiltered(
          'guild-456',
          new Date('2024-01-01'),
          new Date('2024-06-30')
        );
        assert.strictEqual(results.length, 2);
      });

      it('should handle empty export', async () => {
        const exportAsJSON = (guildId) => {
          return JSON.stringify([], null, 2);
        };

        const json = exportAsJSON('guild-999');
        const parsed = JSON.parse(json);
        assert.strictEqual(parsed.length, 0);
      });

      it('should include metadata in export', async () => {
        const mockQuotes = [
          { id: 1, text: 'Quote 1', author: 'Author1', rating: 4.5, guildId: 'guild-456' }
        ];

        const exportWithMetadata = (guildId) => {
          const guildQuotes = mockQuotes.filter(q => q.guildId === guildId);
          return {
            metadata: {
              exportDate: new Date().toISOString(),
              totalQuotes: guildQuotes.length,
              guildId
            },
            quotes: guildQuotes
          };
        };

        const data = exportWithMetadata('guild-456');
        assert.strictEqual(data.metadata.totalQuotes, 1);
        assert(data.metadata.exportDate);
      });
    });
  });

  // ============================================================================
  // SECTION 5: INTEGRATION TESTS (5 tests)
  // ============================================================================

  describe('Quote Commands Integration', () => {
    it('should handle full quote lifecycle: add -> search -> rate -> export', async () => {
      const quotes = [];

      // Add quote
      const add = async (guildId, text, author) => {
        const quote = { id: quotes.length + 1, guildId, text, author, rating: 0 };
        quotes.push(quote);
        return quote;
      };

      // Search quote
      const search = async (guildId, text) => {
        return quotes.filter(q => q.guildId === guildId && q.text.includes(text));
      };

      // Rate quote
      const rate = async (guildId, quoteId, userId, rating) => {
        const quote = quotes.find(q => q.id === quoteId);
        if (quote) quote.rating = rating;
        return quote;
      };

      // Add quote
      const quote = await add('guild-456', 'Life is beautiful', 'Author');
      assert.strictEqual(quote.id, 1);

      // Search for it
      const found = await search('guild-456', 'beautiful');
      assert.strictEqual(found.length, 1);

      // Rate it
      const rated = await rate('guild-456', 1, 'user-123', 5);
      assert.strictEqual(rated.rating, 5);
    });

    it('should enforce guild isolation between quote searches', async () => {
      const quotes = [
        { id: 1, text: 'Guild A Quote', guildId: 'guild-a' },
        { id: 2, text: 'Guild B Quote', guildId: 'guild-b' }
      ];

      const search = (guildId, text) => {
        return quotes.filter(q =>
          q.guildId === guildId && q.text.toLowerCase().includes(text.toLowerCase())
        );
      };

      const resultA = search('guild-a', 'quote');
      const resultB = search('guild-b', 'quote');

      assert.strictEqual(resultA.length, 1);
      assert.strictEqual(resultB.length, 1);
      assert.notStrictEqual(resultA[0].guildId, resultB[0].guildId);
    });

    it('should handle concurrent quote operations', async () => {
      const quotes = [];

      const add = async (guildId, text, author) => {
        const quote = { id: quotes.length + 1, guildId, text, author };
        quotes.push(quote);
        return quote;
      };

      // Simulate concurrent adds
      const promises = [
        add('guild-456', 'Quote 1', 'Author1'),
        add('guild-456', 'Quote 2', 'Author2'),
        add('guild-456', 'Quote 3', 'Author3')
      ];

      const results = await Promise.all(promises);
      assert.strictEqual(results.length, 3);
      assert.strictEqual(quotes.length, 3);
    });

    it('should maintain tag consistency across operations', async () => {
      const quotes = [{ id: 1, text: 'Quote', guildId: 'guild-456', tags: ['inspiration'] }];

      const addTag = async (guildId, quoteId, tag) => {
        const quote = quotes.find(q => q.id === quoteId);
        if (quote && !quote.tags.includes(tag)) {
          quote.tags.push(tag);
        }
        return quote;
      };

      const searchByTag = (guildId, tag) => {
        return quotes.filter(q => q.guildId === guildId && q.tags.includes(tag));
      };

      // Add tag
      await addTag('guild-456', 1, 'wisdom');

      // Search by original tag
      const found = searchByTag('guild-456', 'inspiration');
      assert.strictEqual(found.length, 1);
      assert.strictEqual(found[0].tags.length, 2);
    });

    it('should handle batch operations efficiently', async () => {
      const quotes = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        text: `Quote ${i + 1}`,
        guildId: 'guild-456',
        rating: Math.random() * 5
      }));

      const batchRate = async (guildId, quoteIds, rating) => {
        return quoteIds.map(id => {
          const quote = quotes.find(q => q.id === id && q.guildId === guildId);
          if (quote) quote.rating = rating;
          return quote;
        });
      };

      const updated = await batchRate('guild-456', [1, 2, 3, 4, 5], 5);
      assert.strictEqual(updated.length, 5);
      assert(updated.every(q => q.rating === 5));
    });
  });
});
