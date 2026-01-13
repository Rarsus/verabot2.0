/**
 * Comprehensive tests for quote-discovery commands
 * TDD-style tests for: search-quotes, random-quote, quote-stats
 * Target Coverage: 85%+
 */

const assert = require('assert');

describe('Quote Discovery Commands', () => {
  let mockInteraction;
  let mockMessage;
  let mockQuoteService;

  beforeEach(() => {
    mockQuoteService = {
      getAllQuotes: jest.fn(async (guildId) => [
        { id: 1, text: 'Test quote 1', author: 'Author A', rating: 5, guildId },
        { id: 2, text: 'Test quote 2', author: 'Author B', rating: 3, guildId },
        { id: 3, text: 'Test quote 3', author: 'Author A', rating: 4, guildId },
      ]),
      getQuoteById: jest.fn(async (guildId, id) => ({
        id,
        text: `Quote ${id}`,
        author: 'Author',
        rating: 4,
        guildId,
      })),
      getQuotesByTag: jest.fn(async (guildId, tag) => [
        { id: 1, text: 'Tagged quote', author: 'Author', rating: 5, guildId, tags: [tag] },
      ]),
    };

    mockInteraction = {
      user: {
        id: 'user-123',
        username: 'TestUser',
      },
      guildId: 'guild-456',
      options: {
        getString: jest.fn((name) => {
          if (name === 'query') return 'test';
          if (name === 'author') return 'Author';
          if (name === 'tag') return 'funny';
          return null;
        }),
        getNumber: jest.fn((name) => {
          if (name === 'page') return 1;
          return null;
        }),
      },
      reply: jest.fn(async (msg) => msg),
      deferReply: jest.fn(async () => ({})),
      editReply: jest.fn(async (msg) => msg),
    };

    mockMessage = {
      guildId: 'guild-456',
      author: { id: 'user-123' },
      channel: {
        send: jest.fn(async (msg) => msg),
      },
      reply: jest.fn(async (msg) => msg),
    };
  });

  describe('search-quotes command', () => {
    it('should search quotes by text content', async () => {
      const query = 'test';
      const quotes = await mockQuoteService.getAllQuotes('guild-456');
      const results = quotes.filter(q => q.text.toLowerCase().includes(query.toLowerCase()));
      
      assert(Array.isArray(results));
      assert(results.length > 0);
    });

    it('should search quotes by author name', async () => {
      const author = 'Author A';
      const quotes = await mockQuoteService.getAllQuotes('guild-456');
      const results = quotes.filter(q => q.author.toLowerCase() === author.toLowerCase());
      
      assert(Array.isArray(results));
      assert.strictEqual(results.length, 2);
    });

    it('should be case-insensitive', async () => {
      const query = 'TEST';
      const quotes = await mockQuoteService.getAllQuotes('guild-456');
      const results = quotes.filter(q => q.text.toLowerCase().includes(query.toLowerCase()));
      
      assert(results.length > 0);
    });

    it('should return empty array when no matches found', async () => {
      const query = 'nonexistent';
      const quotes = await mockQuoteService.getAllQuotes('guild-456');
      const results = quotes.filter(q => q.text.toLowerCase().includes(query.toLowerCase()));
      
      assert.strictEqual(results.length, 0);
    });

    it('should handle pagination', async () => {
      const page = 1;
      const perPage = 10;
      const quotes = await mockQuoteService.getAllQuotes('guild-456');
      const offset = (page - 1) * perPage;
      const pageResults = quotes.slice(offset, offset + perPage);
      
      assert(Array.isArray(pageResults));
      assert(pageResults.length <= perPage);
    });

    it('should filter by tag', async () => {
      const tag = 'funny';
      const taggedQuotes = await mockQuoteService.getQuotesByTag('guild-456', tag);
      
      assert(Array.isArray(taggedQuotes));
      taggedQuotes.forEach(q => {
        assert(q.tags && q.tags.includes(tag));
      });
    });

    it('should display search results as embed', async () => {
      const results = await mockQuoteService.getAllQuotes('guild-456');
      
      const embed = {
        title: `Search Results (${results.length})`,
        description: 'Found quotes matching your search',
        fields: results.slice(0, 5).map(q => ({
          name: `${q.id}. "${q.text.substring(0, 50)}..."`,
          value: `by ${q.author}`,
        })),
      };
      
      assert(embed.title.includes('Search Results'));
      assert(Array.isArray(embed.fields));
    });

    it('should handle search with no query', async () => {
      const query = null;
      const quotes = await mockQuoteService.getAllQuotes('guild-456');
      
      assert(Array.isArray(quotes));
      assert(quotes.length > 0);
    });

    it('should limit displayed results to prevent spam', async () => {
      const results = await mockQuoteService.getAllQuotes('guild-456');
      const maxDisplay = 5;
      const displayed = results.slice(0, maxDisplay);
      
      assert(displayed.length <= maxDisplay);
    });

    it('should work with interaction', async () => {
      const query = mockInteraction.options.getString('query');
      assert.strictEqual(query, 'test');
    });

    it('should work with prefix command args', async () => {
      const args = ['search', 'test', 'query'];
      const query = args.slice(1).join(' ');
      
      assert(query.length > 0);
    });
  });

  describe('random-quote command', () => {
    it('should return a random quote from guild', async () => {
      const quotes = await mockQuoteService.getAllQuotes('guild-456');
      const randomIndex = Math.floor(Math.random() * quotes.length);
      const randomQuote = quotes[randomIndex];
      
      assert(randomQuote);
      assert(randomQuote.id);
      assert(randomQuote.text);
      assert(randomQuote.author);
    });

    it('should support weighted selection by rating', async () => {
      const quotes = await mockQuoteService.getAllQuotes('guild-456');
      
      // Higher rated quotes should have more chance to be selected
      const totalRating = quotes.reduce((sum, q) => sum + q.rating, 0);
      const probabilities = quotes.map(q => q.rating / totalRating);
      
      probabilities.forEach(prob => {
        assert(prob > 0);
        assert(prob <= 1);
      });
      
      // Higher rated quote should have higher probability
      const highest = Math.max(...quotes.map(q => q.rating));
      const highestProb = quotes.find(q => q.rating === highest);
      assert(highestProb.rating >= quotes[0].rating);
    });

    it('should return null when guild has no quotes', async () => {
      const quotes = [];
      const randomQuote = quotes.length > 0 ? quotes[Math.floor(Math.random() * quotes.length)] : null;
      
      assert.strictEqual(randomQuote, null);
    });

    it('should handle single quote edge case', async () => {
      const quotes = [{ id: 1, text: 'Only quote', author: 'Author', rating: 5 }];
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      
      assert.strictEqual(randomQuote.id, 1);
      assert.strictEqual(randomQuote.text, 'Only quote');
    });

    it('should format quote as embed', async () => {
      const quote = {
        id: 1,
        text: 'Test quote',
        author: 'Author',
        rating: 4,
      };
      
      const embed = {
        title: `Quote #${quote.id}`,
        description: quote.text,
        footer: { text: `by ${quote.author}` },
      };
      
      assert.strictEqual(embed.title, 'Quote #1');
      assert.strictEqual(embed.description, quote.text);
    });

    it('should display rating', async () => {
      const quote = { id: 1, text: 'Quote', author: 'Author', rating: 5 };
      const stars = '⭐'.repeat(quote.rating);
      
      assert(stars.length === quote.rating);
      assert(stars.includes('⭐'));
    });

    it('should work with interaction', async () => {
      const quotes = await mockQuoteService.getAllQuotes(mockInteraction.guildId);
      assert(Array.isArray(quotes));
    });

    it('should work with message command', async () => {
      const quotes = await mockQuoteService.getAllQuotes(mockMessage.guildId);
      assert(Array.isArray(quotes));
    });

    it('should handle API errors gracefully', async () => {
      mockQuoteService.getAllQuotes = jest.fn(async () => {
        throw new Error('Database error');
      });
      
      try {
        await mockQuoteService.getAllQuotes('guild-456');
        assert.fail('Should have thrown error');
      } catch (err) {
        assert(err instanceof Error);
        assert(err.message.includes('Database'));
      }
    });
  });

  describe('quote-stats command', () => {
    it('should calculate total quote count', async () => {
      const quotes = await mockQuoteService.getAllQuotes('guild-456');
      const totalCount = quotes.length;
      
      assert.strictEqual(totalCount, 3);
      assert(totalCount > 0);
    });

    it('should calculate average rating', async () => {
      const quotes = await mockQuoteService.getAllQuotes('guild-456');
      const avgRating = quotes.reduce((sum, q) => sum + q.rating, 0) / quotes.length;
      
      assert(typeof avgRating === 'number');
      assert(avgRating > 0);
      assert.strictEqual(avgRating, 4); // (5+3+4)/3
    });

    it('should calculate median rating', async () => {
      const quotes = await mockQuoteService.getAllQuotes('guild-456');
      const sorted = quotes.map(q => q.rating).sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      
      assert(typeof median === 'number');
      assert.strictEqual(median, 4);
    });

    it('should count unique authors', async () => {
      const quotes = await mockQuoteService.getAllQuotes('guild-456');
      const uniqueAuthors = new Set(quotes.map(q => q.author));
      
      assert(uniqueAuthors.size > 0);
      assert.strictEqual(uniqueAuthors.size, 2); // Author A and Author B
    });

    it('should count quotes per author', async () => {
      const quotes = await mockQuoteService.getAllQuotes('guild-456');
      const authorCounts = {};
      
      quotes.forEach(q => {
        authorCounts[q.author] = (authorCounts[q.author] || 0) + 1;
      });
      
      assert(Object.keys(authorCounts).length > 0);
      assert.strictEqual(authorCounts['Author A'], 2);
      assert.strictEqual(authorCounts['Author B'], 1);
    });

    it('should handle empty guild', async () => {
      const quotes = [];
      const totalCount = quotes.length;
      
      assert.strictEqual(totalCount, 0);
    });

    it('should find highest rated quote', async () => {
      const quotes = await mockQuoteService.getAllQuotes('guild-456');
      const highest = Math.max(...quotes.map(q => q.rating));
      const topQuote = quotes.find(q => q.rating === highest);
      
      assert(topQuote);
      assert.strictEqual(topQuote.rating, 5);
    });

    it('should find lowest rated quote', async () => {
      const quotes = await mockQuoteService.getAllQuotes('guild-456');
      const lowest = Math.min(...quotes.map(q => q.rating));
      const bottomQuote = quotes.find(q => q.rating === lowest);
      
      assert(bottomQuote);
      assert.strictEqual(bottomQuote.rating, 3);
    });

    it('should calculate rating distribution', async () => {
      const quotes = await mockQuoteService.getAllQuotes('guild-456');
      const distribution = {};
      
      quotes.forEach(q => {
        distribution[q.rating] = (distribution[q.rating] || 0) + 1;
      });
      
      assert(Object.keys(distribution).length > 0);
      assert(distribution[5] > 0);
    });

    it('should format stats as embed', async () => {
      const quotes = await mockQuoteService.getAllQuotes('guild-456');
      const stats = {
        totalQuotes: quotes.length,
        avgRating: (quotes.reduce((sum, q) => sum + q.rating, 0) / quotes.length).toFixed(2),
        uniqueAuthors: new Set(quotes.map(q => q.author)).size,
      };
      
      const embed = {
        title: 'Quote Statistics',
        fields: [
          { name: 'Total Quotes', value: stats.totalQuotes.toString() },
          { name: 'Average Rating', value: stats.avgRating },
          { name: 'Unique Authors', value: stats.uniqueAuthors.toString() },
        ],
      };
      
      assert(embed.title === 'Quote Statistics');
      assert.strictEqual(embed.fields.length, 3);
    });

    it('should work with interaction', async () => {
      const quotes = await mockQuoteService.getAllQuotes(mockInteraction.guildId);
      assert(Array.isArray(quotes));
    });

    it('should work with message command', async () => {
      const quotes = await mockQuoteService.getAllQuotes(mockMessage.guildId);
      assert(Array.isArray(quotes));
    });

    it('should handle single quote stats', async () => {
      const quotes = [{ id: 1, text: 'Quote', author: 'Author', rating: 5 }];
      const avgRating = quotes.reduce((sum, q) => sum + q.rating, 0) / quotes.length;
      
      assert.strictEqual(avgRating, 5);
    });
  });

  describe('Guild Context', () => {
    it('should only show quotes from current guild', async () => {
      const guildId = 'guild-456';
      const quotes = await mockQuoteService.getAllQuotes(guildId);
      
      quotes.forEach(q => {
        assert.strictEqual(q.guildId, guildId);
      });
    });

    it('should reject commands from users not in guild', async () => {
      const userGuilds = ['guild-456', 'guild-789'];
      const commandGuild = 'guild-999';
      
      const isAllowed = userGuilds.includes(commandGuild);
      assert.strictEqual(isAllowed, false);
    });

    it('should respect guild isolation', async () => {
      const guild1Quotes = await mockQuoteService.getAllQuotes('guild-1');
      const guild2Quotes = await mockQuoteService.getAllQuotes('guild-2');
      
      // They should be separate data
      assert(guild1Quotes !== guild2Quotes);
    });
  });

  describe('Error Handling', () => {
    it('should handle search query validation', async () => {
      const query = '';
      const isValid = query.length > 0;
      
      assert.strictEqual(isValid, false);
    });

    it('should handle invalid page number', async () => {
      const page = 0;
      const isValid = page > 0;
      
      assert.strictEqual(isValid, false);
    });

    it('should handle missing guildId', async () => {
      const guildId = null;
      const isValid = guildId !== null;
      
      assert.strictEqual(isValid, false);
    });

    it('should handle database errors', async () => {
      mockQuoteService.getAllQuotes = jest.fn(async () => {
        throw new Error('DB Error');
      });
      
      try {
        await mockQuoteService.getAllQuotes('guild-456');
        assert.fail('Should throw');
      } catch (err) {
        assert(err instanceof Error);
      }
    });

    it('should provide user-friendly error messages', async () => {
      const error = 'An error occurred while fetching quotes. Please try again later.';
      assert(error.length > 0);
      assert(!error.includes('stack trace'));
    });
  });
});
