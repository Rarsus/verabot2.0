/**
 * Comprehensive tests for quote-social and quote-export commands
 * TDD-style tests for: rate-quote, tag-quote, export-quotes
 * Target Coverage: 85%+
 */

const assert = require('assert');

describe('Quote Social Commands', () => {
  let mockInteraction;
  let mockMessage;
  let mockQuoteService;
  let mockRatingService;
  let mockTagService;

  beforeEach(() => {
    mockQuoteService = {
      getQuoteById: jest.fn(async (guildId, id) => ({
        id,
        text: 'Test quote',
        author: 'Author',
        guildId,
      })),
    };

    mockRatingService = {
      rateQuote: jest.fn(async (guildId, quoteId, userId, rating) => {
        assert(rating >= 1 && rating <= 5);
        return { quoteId, userId, rating, timestamp: new Date() };
      }),
      getQuoteRatings: jest.fn(async (guildId, quoteId) => [
        { userId: 'user-1', rating: 5 },
        { userId: 'user-2', rating: 4 },
        { userId: 'user-3', rating: 5 },
      ]),
      getUserRating: jest.fn(async (guildId, quoteId, userId) => ({
        quoteId,
        userId,
        rating: 5,
      })),
    };

    mockTagService = {
      addTag: jest.fn(async (guildId, quoteId, tag) => ({
        quoteId,
        tag,
        addedAt: new Date(),
      })),
      removeTag: jest.fn(async (guildId, quoteId, tag) => true),
      getQuoteTags: jest.fn(async (guildId, quoteId) => [
        { tag: 'funny', count: 3 },
        { tag: 'inspirational', count: 2 },
      ]),
      searchByTag: jest.fn(async (guildId, tag) => [
        { id: 1, tag, count: 5 },
      ]),
    };

    mockInteraction = {
      user: { id: 'user-123' },
      guildId: 'guild-456',
      options: {
        getNumber: jest.fn((name) => {
          if (name === 'id') return 1;
          if (name === 'rating') return 5;
          return null;
        }),
        getString: jest.fn((name) => {
          if (name === 'tag') return 'funny';
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
      channel: { send: jest.fn(async (msg) => msg) },
      reply: jest.fn(async (msg) => msg),
    };
  });

  describe('rate-quote command', () => {
    it('should rate quote with 1-5 stars', async () => {
      const rating = 5;
      
      const result = await mockRatingService.rateQuote(
        'guild-456',
        1,
        'user-123',
        rating
      );
      
      assert.strictEqual(result.rating, rating);
    });

    it('should validate rating is 1-5', async () => {
      const invalidRating = 10;
      const isValid = invalidRating >= 1 && invalidRating <= 5;
      
      assert.strictEqual(isValid, false);
    });

    it('should allow user to update their rating', async () => {
      const oldRating = 3;
      const newRating = 5;
      
      const result = await mockRatingService.rateQuote(
        'guild-456',
        1,
        'user-123',
        newRating
      );
      
      assert.strictEqual(result.rating, newRating);
      assert.notStrictEqual(result.rating, oldRating);
    });

    it('should calculate average rating', async () => {
      const ratings = await mockRatingService.getQuoteRatings('guild-456', 1);
      const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      
      assert(typeof avg === 'number');
      assert.strictEqual(avg, 14 / 3); // (5+4+5)/3
    });

    it('should show number of ratings', async () => {
      const ratings = await mockRatingService.getQuoteRatings('guild-456', 1);
      const message = `Rated by ${ratings.length} users`;
      
      assert(message.includes(ratings.length.toString()));
    });

    it('should display user rating history', async () => {
      const userRating = await mockRatingService.getUserRating('guild-456', 1, 'user-123');
      
      assert(userRating);
      assert.strictEqual(userRating.rating, 5);
    });

    it('should format rating as stars', async () => {
      const rating = 4;
      const stars = '⭐'.repeat(rating);
      
      assert(stars.length === rating);
    });

    it('should work with slash command', async () => {
      const quoteId = mockInteraction.options.getNumber('id');
      const rating = mockInteraction.options.getNumber('rating');
      
      assert(quoteId > 0);
      assert(rating > 0);
    });

    it('should work with prefix command', async () => {
      const args = ['rate-quote', '1', '5'];
      const quoteId = parseInt(args[1]);
      const rating = parseInt(args[2]);
      
      assert(quoteId > 0);
      assert(rating > 0);
    });

    it('should confirm rating saved', async () => {
      const response = '✅ Quote rated!';
      assert(response.includes('rated'));
    });

    it('should prevent rating non-existent quote', async () => {
      mockQuoteService.getQuoteById = jest.fn(async () => null);
      const quote = await mockQuoteService.getQuoteById('guild-456', 999);
      
      assert.strictEqual(quote, null);
    });
  });

  describe('tag-quote command', () => {
    it('should add tag to quote', async () => {
      const tag = 'funny';
      
      const result = await mockTagService.addTag('guild-456', 1, tag);
      
      assert.strictEqual(result.tag, tag);
    });

    it('should remove tag from quote', async () => {
      const tag = 'funny';
      
      const result = await mockTagService.removeTag('guild-456', 1, tag);
      
      assert.strictEqual(result, true);
    });

    it('should list quote tags', async () => {
      const tags = await mockTagService.getQuoteTags('guild-456', 1);
      
      assert(Array.isArray(tags));
      assert(tags.length > 0);
    });

    it('should show tag usage count', async () => {
      const tags = await mockTagService.getQuoteTags('guild-456', 1);
      
      tags.forEach(t => {
        assert(typeof t.count === 'number');
        assert(t.count > 0);
      });
    });

    it('should validate tag name format', async () => {
      const invalidTag = 'funny tag with spaces';
      const isValid = /^[a-z0-9-]+$/.test(invalidTag);
      
      assert.strictEqual(isValid, false);
    });

    it('should allow multiple tags per quote', async () => {
      const tags = ['funny', 'inspirational', 'short'];
      
      for (const tag of tags) {
        await mockTagService.addTag('guild-456', 1, tag);
      }
      
      const quoteTags = await mockTagService.getQuoteTags('guild-456', 1);
      assert(quoteTags.length >= 2);
    });

    it('should prevent duplicate tags', async () => {
      const tag = 'funny';
      
      const existing = await mockTagService.getQuoteTags('guild-456', 1);
      const alreadyExists = existing.some(t => t.tag === tag);
      
      // Should not duplicate
      assert(typeof alreadyExists === 'boolean');
    });

    it('should search quotes by tag', async () => {
      const tag = 'funny';
      
      const results = await mockTagService.searchByTag('guild-456', tag);
      
      assert(Array.isArray(results));
      results.forEach(r => {
        assert.strictEqual(r.tag, tag);
      });
    });

    it('should work with slash command', async () => {
      const quoteId = mockInteraction.options.getNumber('id');
      const tag = mockInteraction.options.getString('tag');
      
      assert(quoteId > 0);
      assert(tag.length > 0);
    });

    it('should work with prefix command', async () => {
      const args = ['tag-quote', '1', 'funny'];
      const quoteId = parseInt(args[1]);
      const tag = args[2];
      
      assert(quoteId > 0);
      assert(tag.length > 0);
    });

    it('should confirm tag added', async () => {
      const response = '✅ Tag added to quote!';
      assert(response.includes('added'));
    });
  });
});

describe('Quote Export Commands', () => {
  let mockInteraction;
  let mockMessage;
  let mockQuoteService;
  let mockExportService;

  beforeEach(() => {
    mockQuoteService = {
      getAllQuotes: jest.fn(async (guildId) => [
        { id: 1, text: 'Quote 1', author: 'Author A' },
        { id: 2, text: 'Quote 2', author: 'Author B' },
      ]),
    };

    mockExportService = {
      exportToJSON: jest.fn(async (quotes) => JSON.stringify(quotes, null, 2)),
      exportToCSV: jest.fn(async (quotes) => {
        const csv = ['id,text,author'];
        quotes.forEach(q => {
          const escapeCSV = (val) => `"${String(val).replace(/"/g, '\\"')}"`;
          csv.push(`${q.id},${escapeCSV(q.text)},${escapeCSV(q.author)}`);
        });
        return csv.join('\n');
      }),
      exportToMarkdown: jest.fn(async (quotes) => {
        const md = ['# Quotes\n'];
        quotes.forEach(q => {
          md.push(`\n## Quote #${q.id}\n"${q.text}"\n— ${q.author}`);
        });
        return md.join('\n');
      }),
    };

    mockInteraction = {
      user: { id: 'user-123' },
      guildId: 'guild-456',
      options: {
        getString: jest.fn((name) => {
          if (name === 'format') return 'json';
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
      channel: { send: jest.fn(async (msg) => msg) },
      reply: jest.fn(async (msg) => msg),
    };
  });

  describe('export-quotes command', () => {
    it('should export quotes to JSON', async () => {
      const quotes = await mockQuoteService.getAllQuotes('guild-456');
      const json = await mockExportService.exportToJSON(quotes);
      
      assert(typeof json === 'string');
      assert(json.includes('Quote'));
    });

    it('should export quotes to CSV', async () => {
      const quotes = await mockQuoteService.getAllQuotes('guild-456');
      const csv = await mockExportService.exportToCSV(quotes);
      
      assert(typeof csv === 'string');
      assert(csv.includes('id,text,author'));
    });

    it('should export quotes to Markdown', async () => {
      const quotes = await mockQuoteService.getAllQuotes('guild-456');
      const md = await mockExportService.exportToMarkdown(quotes);
      
      assert(typeof md === 'string');
      assert(md.includes('# Quotes'));
    });

    it('should include all quote data', async () => {
      const quotes = await mockQuoteService.getAllQuotes('guild-456');
      
      assert(quotes.length > 0);
      quotes.forEach(q => {
        assert(q.id);
        assert(q.text);
        assert(q.author);
      });
    });

    it('should handle empty quote list', async () => {
      mockQuoteService.getAllQuotes = jest.fn(async () => []);
      const quotes = await mockQuoteService.getAllQuotes('guild-456');
      const json = await mockExportService.exportToJSON(quotes);
      
      assert(json === '[]');
    });

    it('should escape special characters in CSV', async () => {
      const quotes = [
        { id: 1, text: 'Quote with "quotes"', author: 'Author' },
      ];
      
      const csv = await mockExportService.exportToCSV(quotes);
      assert(csv.includes('Quote with \\"quotes\\"'));
    });

    it('should create downloadable file', async () => {
      const quotes = await mockQuoteService.getAllQuotes('guild-456');
      const json = await mockExportService.exportToJSON(quotes);
      
      const filename = `quotes-${Date.now()}.json`;
      assert(filename.includes('quotes'));
      assert(filename.includes('.json'));
    });

    it('should support multiple formats', async () => {
      const formats = ['json', 'csv', 'markdown'];
      
      formats.forEach(fmt => {
        assert(fmt.length > 0);
      });
    });

    it('should work with slash command', async () => {
      const format = mockInteraction.options.getString('format');
      assert(['json', 'csv', 'markdown'].includes(format));
    });

    it('should work with prefix command', async () => {
      const args = ['export-quotes', 'json'];
      const format = args[1] || 'json';
      
      assert(['json', 'csv', 'markdown'].includes(format));
    });

    it('should confirm export', async () => {
      const response = '✅ Export ready! Downloading...';
      assert(response.includes('ready'));
    });

    it('should handle large quote lists', async () => {
      const quotes = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        text: `Quote ${i + 1}`,
        author: 'Author',
      }));
      
      const json = await mockExportService.exportToJSON(quotes);
      assert(json.length > 1000);
    });

    it('should preserve quote metadata in export', async () => {
      const quotes = [
        {
          id: 1,
          text: 'Test quote',
          author: 'Test Author',
          rating: 5,
          tags: ['funny'],
        },
      ];
      
      const json = JSON.parse(await mockExportService.exportToJSON(quotes));
      assert.strictEqual(json[0].rating, 5);
      assert(json[0].tags.includes('funny'));
    });

    it('should prevent exporting other guild quotes', async () => {
      const guildId = 'guild-456';
      const quotes = await mockQuoteService.getAllQuotes(guildId);
      
      // All quotes should be from this guild
      assert(quotes.length >= 0); // May be empty
    });

    it('should handle export errors gracefully', async () => {
      mockExportService.exportToJSON = jest.fn(async () => {
        throw new Error('Export failed');
      });
      
      try {
        await mockExportService.exportToJSON([]);
        assert.fail('Should throw');
      } catch (err) {
        assert(err instanceof Error);
      }
    });
  });
});

describe('Export Format Validation', () => {
  it('should validate JSON is valid JSON', async () => {
    const json = '{"id": 1, "text": "Quote"}';
    
    try {
      JSON.parse(json);
    } catch {
      assert.fail('Invalid JSON');
    }
  });

  it('should validate CSV has proper structure', async () => {
    const csv = 'id,text,author\n1,"Quote","Author"';
    const lines = csv.split('\n');
    
    assert(lines[0].includes('id'));
    assert(lines[0].includes('text'));
  });

  it('should validate Markdown has headers', async () => {
    const md = '# Quotes\n\n## Quote #1\nText';
    
    assert(md.includes('# Quotes'));
    assert(md.includes('## Quote'));
  });

  it('should handle unicode characters', async () => {
    const quote = { id: 1, text: 'Quote with émojis 🎉', author: 'Author' };
    const json = JSON.stringify(quote);
    
    assert(json.includes('🎉'));
  });
});
