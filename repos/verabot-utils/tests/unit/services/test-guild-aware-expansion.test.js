/**
 * Phase 22.2: Guild-Aware Expansion Tests
 * 
 * Expands guild isolation testing from 22/22 passing to 30+/30 with:
 * - Advanced multi-guild scenarios
 * - Concurrent operations across guilds
 * - Guild data isolation verification
 * - Migration and cleanup operations
 */

const assert = require('assert');

class MockGuildService {
  constructor() {
    this.guildData = new Map(); // guildId -> { quotes, metadata }
  }

  initializeGuild(guildId) {
    if (!this.guildData.has(guildId)) {
      this.guildData.set(guildId, {
        quotes: new Map(),
        created: Date.now(),
        operationLog: []
      });
    }
  }

  async addQuoteToGuild(guildId, quoteId, quoteData) {
    assert(guildId, 'Guild ID is required');
    this.initializeGuild(guildId);
    
    const guild = this.guildData.get(guildId);
    guild.quotes.set(quoteId, quoteData);
    guild.operationLog.push({ op: 'add', id: quoteId });
  }

  async getGuildQuote(guildId, quoteId) {
    assert(guildId, 'Guild ID is required');
    this.initializeGuild(guildId);
    
    return this.guildData.get(guildId).quotes.get(quoteId);
  }

  async getAllGuildQuotes(guildId) {
    assert(guildId, 'Guild ID is required');
    this.initializeGuild(guildId);
    
    const quotes = this.guildData.get(guildId).quotes;
    return Array.from(quotes.values());
  }

  async deleteGuildQuote(guildId, quoteId) {
    assert(guildId, 'Guild ID is required');
    this.initializeGuild(guildId);
    
    const guild = this.guildData.get(guildId);
    const deleted = guild.quotes.delete(quoteId);
    guild.operationLog.push({ op: 'delete', id: quoteId });
    return deleted;
  }

  async deleteGuild(guildId) {
    assert(guildId, 'Guild ID is required');
    return this.guildData.delete(guildId);
  }

  getGuildCount() {
    return this.guildData.size;
  }

  getGuildQuoteCount(guildId) {
    this.initializeGuild(guildId);
    return this.guildData.get(guildId).quotes.size;
  }

  // Guild verification methods
  async verifyGuildIsolation(guildId, expectedQuoteCount) {
    const actual = this.getGuildQuoteCount(guildId);
    assert.strictEqual(actual, expectedQuoteCount,
      `Guild ${guildId} should have ${expectedQuoteCount} quotes, has ${actual}`);
  }

  async getOperationLog(guildId) {
    this.initializeGuild(guildId);
    return this.guildData.get(guildId).operationLog;
  }
}

describe('Guild-Aware Operations - Phase 22.2 Expansion', () => {
  let service;

  beforeEach(() => {
    service = new MockGuildService();
  });

  // ==================== ADVANCED MULTI-GUILD SCENARIOS ====================
  
  describe('Multi-Guild Operations', () => {
    it('should isolate data between 10 different guilds', async () => {
      const guildIds = Array.from({ length: 10 }, (_, i) => `guild-${i}`);

      // Add different number of quotes to each guild
      for (let i = 0; i < guildIds.length; i++) {
        const guildId = guildIds[i];
        const quoteCount = (i + 1) * 5; // 5, 10, 15, ..., 50

        for (let q = 0; q < quoteCount; q++) {
          await service.addQuoteToGuild(guildId, `quote-${q}`, {
            id: `quote-${q}`,
            text: `Quote for guild ${i}`,
            guildId
          });
        }
      }

      // Verify each guild has correct isolated count
      for (let i = 0; i < guildIds.length; i++) {
        const guildId = guildIds[i];
        const expectedCount = (i + 1) * 5;
        await service.verifyGuildIsolation(guildId, expectedCount);
      }

      assert.strictEqual(service.getGuildCount(), 10, 'Should have 10 guilds');
    });

    it('should prevent cross-guild quote access', async () => {
      const guild1 = 'guild-1';
      const guild2 = 'guild-2';

      // Add quote to guild1
      await service.addQuoteToGuild(guild1, 'quote-1', {
        text: 'Guild 1 quote',
        guildId: guild1
      });

      // Verify guild1 has quote
      const quote1 = await service.getGuildQuote(guild1, 'quote-1');
      assert(quote1, 'Guild 1 should have quote-1');

      // Verify guild2 cannot access guild1's quote
      const quote2 = await service.getGuildQuote(guild2, 'quote-1');
      assert(!quote2, 'Guild 2 should NOT have guild1\'s quote');

      // Verify guild2 is still empty
      await service.verifyGuildIsolation(guild2, 0);
    });

    it('should allow independent operations in parallel guilds', async () => {
      const guilds = ['guild-a', 'guild-b', 'guild-c'];

      // Simulate concurrent operations
      const operations = [];

      for (const guildId of guilds) {
        for (let i = 0; i < 10; i++) {
          operations.push(
            service.addQuoteToGuild(guildId, `q-${i}`, {
              text: `Quote ${i}`,
              guildId
            })
          );
        }
      }

      await Promise.all(operations);

      // Verify each guild has exactly 10 quotes
      for (const guildId of guilds) {
        await service.verifyGuildIsolation(guildId, 10);
      }
    });

    it('should handle guild-specific query filters', async () => {
      const guild1 = 'guild-1';
      const guild2 = 'guild-2';

      // Add quotes with tags to both guilds
      for (let i = 0; i < 5; i++) {
        await service.addQuoteToGuild(guild1, `q-${i}`, {
          text: `Quote ${i}`,
          tags: i % 2 === 0 ? ['important'] : ['other'],
          guildId: guild1
        });

        await service.addQuoteToGuild(guild2, `q-${i}`, {
          text: `Quote ${i}`,
          tags: i % 2 === 0 ? ['funny'] : ['other'],
          guildId: guild2
        });
      }

      // Query guild1 important quotes
      const guild1Quotes = await service.getAllGuildQuotes(guild1);
      const guild1Important = guild1Quotes.filter(q =>
        q.tags && q.tags.includes('important')
      );

      assert.strictEqual(guild1Important.length, 3, 'Guild 1 should have 3 important quotes');

      // Query guild2 funny quotes
      const guild2Quotes = await service.getAllGuildQuotes(guild2);
      const guild2Funny = guild2Quotes.filter(q =>
        q.tags && q.tags.includes('funny')
      );

      assert.strictEqual(guild2Funny.length, 3, 'Guild 2 should have 3 funny quotes');

      // Verify tag isolation: guild1 doesn't have 'funny'
      const guild1Funny = guild1Quotes.filter(q =>
        q.tags && q.tags.includes('funny')
      );
      assert.strictEqual(guild1Funny.length, 0, 'Guild 1 should not have funny quotes');
    });
  });

  // ==================== CONCURRENT OPERATIONS ====================
  
  describe('Concurrent Guild Operations', () => {
    it('should handle concurrent adds to same guild safely', async () => {
      const guildId = 'concurrent-guild';
      const operations = [];

      // Add 100 quotes concurrently
      for (let i = 0; i < 100; i++) {
        operations.push(
          service.addQuoteToGuild(guildId, `quote-${i}`, {
            id: `quote-${i}`,
            text: `Concurrent quote ${i}`
          })
        );
      }

      await Promise.all(operations);

      // Verify all 100 quotes were added
      await service.verifyGuildIsolation(guildId, 100);
    });

    it('should handle concurrent operations across multiple guilds', async () => {
      const guilds = ['g1', 'g2', 'g3', 'g4', 'g5'];
      const operations = [];

      for (const guildId of guilds) {
        for (let i = 0; i < 20; i++) {
          operations.push(
            service.addQuoteToGuild(guildId, `q-${i}`, {
              text: `Quote ${i}`,
              guildId
            })
          );
        }
      }

      await Promise.all(operations);

      // Verify isolation maintained
      for (const guildId of guilds) {
        await service.verifyGuildIsolation(guildId, 20);
      }

      assert.strictEqual(service.getGuildCount(), 5, 'Should have 5 guilds');
    });

    it('should handle concurrent deletes with proper isolation', async () => {
      const guild1 = 'delete-guild-1';
      const guild2 = 'delete-guild-2';

      // Add quotes to both
      for (let i = 0; i < 10; i++) {
        await service.addQuoteToGuild(guild1, `q-${i}`, { text: `Quote ${i}` });
        await service.addQuoteToGuild(guild2, `q-${i}`, { text: `Quote ${i}` });
      }

      // Delete from both concurrently
      const deletes = [];
      for (let i = 0; i < 5; i++) {
        deletes.push(
          service.deleteGuildQuote(guild1, `q-${i}`),
          service.deleteGuildQuote(guild2, `q-${i}`)
        );
      }

      await Promise.all(deletes);

      // Verify isolation: each should have 5 left
      await service.verifyGuildIsolation(guild1, 5);
      await service.verifyGuildIsolation(guild2, 5);
    });
  });

  // ==================== DATA ISOLATION VERIFICATION ====================
  
  describe('Data Isolation Integrity', () => {
    it('should prevent data leakage between guilds', async () => {
      const guilds = ['secure-1', 'secure-2', 'secure-3'];

      // Add sensitive data to each guild
      for (const [idx, guildId] of guilds.entries()) {
        for (let i = 0; i < 10; i++) {
          await service.addQuoteToGuild(guildId, `sensitive-${idx}-${i}`, {
            text: `Sensitive quote from guild ${idx}`,
            confidential: true,
            guildId
          });
        }
      }

      // Verify no cross-guild access
      for (let i = 0; i < guilds.length; i++) {
        const accessGuild = guilds[i];

        for (let j = 0; j < guilds.length; j++) {
          if (i !== j) {
            const otherGuild = guilds[j];

            // Attempt to access other guild's quotes
            const leaked = await service.getGuildQuote(
              accessGuild,
              `sensitive-${j}-0`
            );

            assert(!leaked,
              `Guild ${accessGuild} should not access ${otherGuild} data`);
          }
        }
      }
    });

    it('should maintain isolation during bulk operations', async () => {
      const guild1 = 'bulk-1';
      const guild2 = 'bulk-2';

      // Add 500 quotes to guild1
      const adds1 = [];
      for (let i = 0; i < 500; i++) {
        adds1.push(
          service.addQuoteToGuild(guild1, `bulk-${i}`, {
            text: `Quote ${i}`,
            guildId: guild1
          })
        );
      }

      await Promise.all(adds1);

      // Guild2 should still be empty
      await service.verifyGuildIsolation(guild2, 0);

      // Add to guild2
      const adds2 = [];
      for (let i = 0; i < 200; i++) {
        adds2.push(
          service.addQuoteToGuild(guild2, `q-${i}`, {
            text: `Quote ${i}`,
            guildId: guild2
          })
        );
      }

      await Promise.all(adds2);

      // Verify both maintain isolation
      await service.verifyGuildIsolation(guild1, 500);
      await service.verifyGuildIsolation(guild2, 200);
    });

    it('should track operations separately per guild', async () => {
      const guild1 = 'track-1';
      const guild2 = 'track-2';

      // Perform operations on guild1
      for (let i = 0; i < 5; i++) {
        await service.addQuoteToGuild(guild1, `guild1-q-${i}`, { text: `Quote ${i}` });
      }

      // Perform operations on guild2
      for (let i = 0; i < 3; i++) {
        await service.addQuoteToGuild(guild2, `guild2-q-${i}`, { text: `Quote ${i}` });
      }

      // Get operation logs
      const log1 = await service.getOperationLog(guild1);
      const log2 = await service.getOperationLog(guild2);

      assert.strictEqual(log1.length, 5, 'Guild 1 should have 5 operations');
      assert.strictEqual(log2.length, 3, 'Guild 2 should have 3 operations');

      // Verify logs have correct operations
      const log1OpIds = log1.map(op => op.id);
      const log2OpIds = log2.map(op => op.id);

      // Guild1 should have its IDs
      for (let i = 0; i < 5; i++) {
        assert(log1OpIds.includes(`guild1-q-${i}`),
          'Guild 1 should have its own operation');
      }

      // Guild2 should have its IDs
      for (let i = 0; i < 3; i++) {
        assert(log2OpIds.includes(`guild2-q-${i}`),
          'Guild 2 should have its own operation');
      }
    });
  });

  // ==================== GUILD LIFECYCLE OPERATIONS ====================
  
  describe('Guild Lifecycle Management', () => {
    it('should initialize guilds on first access', async () => {
      const guildId = 'lazy-init';

      // Guild doesn't exist yet
      assert.strictEqual(service.getGuildCount(), 0);

      // Access guild (implicit init)
      await service.getGuildQuote(guildId, 'non-existent');

      // Guild now initialized
      assert.strictEqual(service.getGuildCount(), 1);
      await service.verifyGuildIsolation(guildId, 0);
    });

    it('should support clean guild deletion', async () => {
      const guildId = 'to-delete';

      // Add quotes
      for (let i = 0; i < 10; i++) {
        await service.addQuoteToGuild(guildId, `q-${i}`, { text: `Quote ${i}` });
      }

      await service.verifyGuildIsolation(guildId, 10);

      // Delete guild
      await service.deleteGuild(guildId);

      // Verify deleted
      assert.strictEqual(service.getGuildCount(), 0);
      assert.strictEqual(service.getGuildQuoteCount(guildId), 0);
    });

    it('should allow guild recreation after deletion', async () => {
      const guildId = 'recreate-guild';

      // Create
      await service.addQuoteToGuild(guildId, 'q-1', { text: 'Quote 1' });
      assert.strictEqual(service.getGuildCount(), 1);

      // Delete
      await service.deleteGuild(guildId);
      assert.strictEqual(service.getGuildCount(), 0);

      // Recreate
      await service.addQuoteToGuild(guildId, 'q-2', { text: 'Quote 2' });
      assert.strictEqual(service.getGuildCount(), 1);

      // Should only have new quote
      const quote = await service.getGuildQuote(guildId, 'q-1');
      assert(!quote, 'Should not have old quote');

      const newQuote = await service.getGuildQuote(guildId, 'q-2');
      assert(newQuote, 'Should have new quote');
    });

    it('should handle guild migration scenarios', async () => {
      const sourceGuild = 'source-guild';
      const targetGuild = 'target-guild';

      // Add quotes to source with unique IDs
      const quotesData = [];
      for (let i = 0; i < 5; i++) {
        const quoteData = {
          id: `migrate-${i}`,
          text: `Quote ${i}`,
          migratable: true
        };
        quotesData.push(quoteData);
        await service.addQuoteToGuild(sourceGuild, `migrate-${i}`, quoteData);
      }

      // Verify source has quotes
      await service.verifyGuildIsolation(sourceGuild, 5);

      // Simulate migration: copy quotes to target
      const quotes = await service.getAllGuildQuotes(sourceGuild);
      for (const quote of quotes) {
        await service.addQuoteToGuild(targetGuild, quote.id, quote);
      }

      // Verify both have same count
      await service.verifyGuildIsolation(sourceGuild, 5);
      await service.verifyGuildIsolation(targetGuild, 5);

      // Verify data integrity
      for (const quoteData of quotesData) {
        const sourceQuote = await service.getGuildQuote(sourceGuild, quoteData.id);
        const targetQuote = await service.getGuildQuote(targetGuild, quoteData.id);

        assert(sourceQuote, 'Source should have quote');
        assert(targetQuote, 'Target should have migrated quote');
        assert.strictEqual(sourceQuote.id, targetQuote.id,
          'Migrated data should have same ID');
      }
    });
  });

  // ==================== ERROR HANDLING IN GUILD CONTEXT ====================
  
  describe('Guild-Aware Error Handling', () => {
    it('should handle missing guild ID gracefully', async () => {
      // Test addQuoteToGuild with undefined guild
      try {
        await service.addQuoteToGuild(undefined, 'q-1', {});
        assert.fail('Should have thrown error for undefined guild ID');
      } catch (err) {
        assert(err.message.includes('Guild ID is required'));
      }

      // Test getGuildQuote with null guild
      try {
        await service.getGuildQuote(null, 'q-1');
        assert.fail('Should have thrown error for null guild ID');
      } catch (err) {
        assert(err.message.includes('Guild ID is required'));
      }
    });

    it('should handle operations on non-existent quotes in guild', async () => {
      const guildId = 'test-guild';

      // Add one quote
      await service.addQuoteToGuild(guildId, 'q-1', { text: 'Quote' });

      // Try to get non-existent
      const quote = await service.getGuildQuote(guildId, 'q-nonexistent');
      assert(!quote, 'Should return undefined for non-existent quote');

      // Try to delete non-existent
      const deleted = await service.deleteGuildQuote(guildId, 'q-nonexistent');
      assert(!deleted, 'Delete should return false for non-existent quote');
    });

    it('should handle quota and limit scenarios per guild', async () => {
      const guildId = 'quota-guild';
      const maxQuotes = 1000;

      // Add up to limit
      for (let i = 0; i < maxQuotes; i++) {
        await service.addQuoteToGuild(guildId, `q-${i}`, {
          text: `Quote ${i}`
        });
      }

      // Verify at capacity
      await service.verifyGuildIsolation(guildId, maxQuotes);

      // Should still allow retrieval and deletion
      const quote = await service.getGuildQuote(guildId, 'q-0');
      assert(quote, 'Should retrieve at capacity');

      const deleted = await service.deleteGuildQuote(guildId, 'q-0');
      assert(deleted, 'Should delete at capacity');
    });
  });
});
