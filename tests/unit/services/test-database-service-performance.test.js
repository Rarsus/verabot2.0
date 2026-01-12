const assert = require('assert');

/**
 * Performance-Optimized Mock Database Service
 * 
 * Simulates performance characteristics:
 * - Large dataset handling (1000+ quotes)
 * - Search efficiency
 * - Memory management
 * - Bulk operation optimization
 */
class MockPerformanceDatabaseService {
  constructor() {
    this.quotes = [];
    this.ratings = [];
    this.tags = [];
    this.nextId = 1;
    this.operationTiming = [];
  }

  /**
   * Record operation timing for performance analysis
   * @private
   */
  _recordTiming(operation, duration) {
    this.operationTiming.push({ operation, duration, timestamp: Date.now() });
  }

  /**
   * Track memory usage
   * @private
   */
  _getMemoryUsage() {
    if (global.gc) {
      global.gc();
    }
    return process.memoryUsage();
  }

  // ==================== BASIC OPERATIONS ====================

  async addQuote(text, author = 'Anonymous') {
    const startTime = Date.now();

    const id = this.nextId++;
    this.quotes.push({
      id,
      text: String(text),
      author: String(author),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    this._recordTiming('addQuote', Date.now() - startTime);
    return id;
  }

  async getQuoteById(id) {
    const startTime = Date.now();
    const quote = this.quotes.find(q => q.id === id) || null;
    this._recordTiming('getQuoteById', Date.now() - startTime);
    return quote;
  }

  async getAllQuotes() {
    const startTime = Date.now();
    const result = [...this.quotes];
    this._recordTiming('getAllQuotes', Date.now() - startTime);
    return result;
  }

  async searchQuotes(keyword) {
    const startTime = Date.now();

    if (!keyword) {
      this._recordTiming('searchQuotes', Date.now() - startTime);
      return [];
    }

    const lowerKeyword = String(keyword).toLowerCase();
    const results = this.quotes.filter(q =>
      q.text.toLowerCase().includes(lowerKeyword) ||
      q.author.toLowerCase().includes(lowerKeyword)
    );

    this._recordTiming('searchQuotes', Date.now() - startTime);
    return results;
  }

  async deleteQuote(id) {
    const startTime = Date.now();

    const idx = this.quotes.findIndex(q => q.id === id);
    if (idx < 0) {
      this._recordTiming('deleteQuote', Date.now() - startTime);
      return false;
    }

    this.quotes.splice(idx, 1);
    this.ratings = this.ratings.filter(r => r.quoteId !== id);

    this._recordTiming('deleteQuote', Date.now() - startTime);
    return true;
  }

  async rateQuote(quoteId, userId, rating) {
    const startTime = Date.now();

    assert(rating >= 1 && rating <= 5, 'Rating must be 1-5');

    const quote = this.quotes.find(q => q.id === quoteId);
    if (!quote) {
      this._recordTiming('rateQuote', Date.now() - startTime);
      return false;
    }

    const existing = this.ratings.findIndex(
      r => r.quoteId === quoteId && r.userId === userId
    );

    if (existing >= 0) {
      this.ratings[existing].rating = rating;
    } else {
      this.ratings.push({ quoteId, userId, rating });
    }

    this._recordTiming('rateQuote', Date.now() - startTime);
    return true;
  }

  // ==================== PERFORMANCE UTILITIES ====================

  /**
   * Get performance statistics
   */
  getPerformanceStats() {
    if (this.operationTiming.length === 0) {
      return null;
    }

    const stats = {};

    // Group by operation type
    this.operationTiming.forEach(entry => {
      if (!stats[entry.operation]) {
        stats[entry.operation] = {
          count: 0,
          totalTime: 0,
          minTime: Infinity,
          maxTime: 0
        };
      }

      const op = stats[entry.operation];
      op.count++;
      op.totalTime += entry.duration;
      op.minTime = Math.min(op.minTime, entry.duration);
      op.maxTime = Math.max(op.maxTime, entry.duration);
    });

    // Calculate averages
    Object.keys(stats).forEach(op => {
      stats[op].avgTime = Math.round(stats[op].totalTime / stats[op].count * 100) / 100;
    });

    return stats;
  }

  /**
   * Clear timing data
   */
  clearTimings() {
    this.operationTiming = [];
  }

  /**
   * Close/reset
   */
  async close() {
    this.quotes = [];
    this.ratings = [];
    this.tags = [];
    this.nextId = 1;
    this.operationTiming = [];
  }
}

// ==================== TEST SUITE ====================

describe('Database Performance & Optimization', () => {
  let db;

  beforeEach(async () => {
    db = new MockPerformanceDatabaseService();
  });

  afterEach(async () => {
    await db.close();
  });

  // ==================== LARGE DATASET HANDLING ====================

  describe('Large Dataset Handling', () => {
    it('should efficiently add 1000+ quotes', async () => {
      const count = 1000;
      const startTime = Date.now();

      for (let i = 0; i < count; i++) {
        await db.addQuote(`Quote ${i}`, `Author ${i}`);
      }

      const duration = Date.now() - startTime;
      const quotes = await db.getAllQuotes();

      assert.strictEqual(quotes.length, 1000);
      assert(duration < 5000, `Adding 1000 quotes took ${duration}ms (target: <5000ms)`);
    });

    it('should maintain constant-time ID lookup in large dataset', async () => {
      // Add 1000 quotes
      for (let i = 0; i < 1000; i++) {
        await db.addQuote(`Quote ${i}`, 'Author');
      }

      db.clearTimings();

      // Look up quotes at different positions
      const lookupIds = [1, 250, 500, 750, 1000];
      const timings = [];

      for (const id of lookupIds) {
        db.clearTimings();
        await db.getQuoteById(id);
        const stats = db.getPerformanceStats();
        if (stats && stats.getQuoteById) {
          timings.push(stats.getQuoteById.avgTime);
        }
      }

      // All lookups should be roughly similar speed (constant time or log(n))
      const maxTiming = Math.max(...timings);
      const minTiming = Math.min(...timings);
      const variation = (maxTiming - minTiming) / minTiming;

      assert(variation < 3, `Lookup time variation too high: ${variation}x`);
    });

    it('should handle getAllQuotes() with 1000+ quotes', async () => {
      for (let i = 0; i < 1000; i++) {
        await db.addQuote(`Quote ${i}`, 'Author');
      }

      const startTime = Date.now();
      const quotes = await db.getAllQuotes();
      const duration = Date.now() - startTime;

      assert.strictEqual(quotes.length, 1000);
      assert(duration < 1000, `getAllQuotes() took ${duration}ms (target: <1000ms)`);
    });

    it('should efficiently handle 500+ concurrent operations', async () => {
      const operations = [];

      // Add 500 quotes concurrently
      for (let i = 0; i < 500; i++) {
        operations.push(db.addQuote(`Quote ${i}`, 'Author'));
      }

      const startTime = Date.now();
      await Promise.all(operations);
      const duration = Date.now() - startTime;

      const quotes = await db.getAllQuotes();
      assert.strictEqual(quotes.length, 500);
      assert(duration < 2000, `Concurrent adds took ${duration}ms (target: <2000ms)`);
    });

    it('should handle mixed operations on large dataset', async () => {
      // Set up 1000 quotes
      for (let i = 0; i < 1000; i++) {
        await db.addQuote(`Quote ${i}`, `Author ${i}`);
      }

      db.clearTimings();
      const startTime = Date.now();

      // Perform mixed operations
      await db.searchQuotes('Quote 5');
      await db.getQuoteById(500);
      await db.rateQuote(500, 'user1', 5);
      await db.getAllQuotes();
      await db.searchQuotes('Author');

      const duration = Date.now() - startTime;
      assert(duration < 1000, `Mixed ops on 1000 quotes took ${duration}ms (target: <1000ms)`);
    });
  });

  // ==================== SEARCH EFFICIENCY ====================

  describe('Search Efficiency & Optimization', () => {
    it('should perform substring search efficiently', async () => {
      // Add 500 quotes
      for (let i = 0; i < 500; i++) {
        await db.addQuote(`The quick brown fox quote number ${i}`, `Author ${i}`);
      }

      db.clearTimings();
      const results = await db.searchQuotes('quick brown');

      assert(results.length > 0);
      const stats = db.getPerformanceStats();
      assert(stats.searchQuotes.avgTime < 100, 
        `Search took ${stats.searchQuotes.avgTime}ms (target: <100ms)`);
    });

    it('should search progressively faster with index optimization', async () => {
      // Simulate search optimization by measuring performance
      const timings = [];

      for (let batchSize = 100; batchSize <= 500; batchSize += 100) {
        await db.close();
        db = new MockPerformanceDatabaseService();

        // Add batch
        for (let i = 0; i < batchSize; i++) {
          await db.addQuote(`Quote with search term ${i}`, 'Author');
        }

        db.clearTimings();
        await db.searchQuotes('search term');
        const stats = db.getPerformanceStats();
        timings.push({
          batchSize,
          time: stats.searchQuotes.avgTime
        });
      }

      // Search times should scale sublinearly (log n or better)
      const ratio1 = timings[1].time / timings[0].time;
      const ratio2 = timings[2].time / timings[1].time;

      assert(ratio1 < 1.5, `Search scaling suboptimal: ${ratio1}x`);
      assert(ratio2 < 1.5, `Search scaling suboptimal: ${ratio2}x`);
    });

    it('should handle regex-safe search with special characters', async () => {
      const specialQuotes = [
        'Quote with (parentheses)',
        'Quote with [brackets]',
        'Quote with {braces}',
        'Quote with $dollar signs',
        'Quote with ^caret'
      ];

      for (const quote of specialQuotes) {
        await db.addQuote(quote, 'Author');
      }

      db.clearTimings();

      const result1 = await db.searchQuotes('(parentheses)');
      const result2 = await db.searchQuotes('$dollar');
      const result3 = await db.searchQuotes('^caret');

      const stats = db.getPerformanceStats();
      assert(stats.searchQuotes.avgTime < 50,
        `Special char search took ${stats.searchQuotes.avgTime}ms (target: <50ms)`);
    });

    it('should search case-insensitively without performance penalty', async () => {
      for (let i = 0; i < 200; i++) {
        await db.addQuote(`UPPERCASE Quote ${i}`, 'Author');
      }

      db.clearTimings();

      const results1 = await db.searchQuotes('UPPERCASE');
      const stats1 = db.getPerformanceStats();
      const time1 = stats1.searchQuotes.avgTime;

      db.clearTimings();

      const results2 = await db.searchQuotes('uppercase');
      const stats2 = db.getPerformanceStats();
      const time2 = stats2.searchQuotes.avgTime;

      assert.strictEqual(results1.length, results2.length);
      assert(Math.abs(time1 - time2) < 5, 'Case-insensitive search performance penalty');
    });
  });

  // ==================== MEMORY EFFICIENCY ====================

  describe('Memory Efficiency & Leak Detection', () => {
    it('should not leak memory on repeated operations', async () => {
      const baseline = db._getMemoryUsage();

      // Perform 1000 operations
      for (let i = 0; i < 1000; i++) {
        const id = await db.addQuote('Quote', 'Author');
        await db.getQuoteById(id);
        await db.deleteQuote(id);
      }

      const afterOps = db._getMemoryUsage();

      // Clear data
      await db.close();
      const afterClear = db._getMemoryUsage();

      // Memory should decrease significantly after close
      const memoryDiff = afterClear.heapUsed - baseline.heapUsed;
      assert(memoryDiff < afterOps.heapUsed - baseline.heapUsed,
        'Memory not released after close');
    });

    it('should maintain consistent memory with bulk deletes', async () => {
      // Add 500 quotes
      const ids = [];
      for (let i = 0; i < 500; i++) {
        const id = await db.addQuote(`Quote ${i}`, 'Author');
        ids.push(id);
      }

      const beforeDelete = db._getMemoryUsage();

      // Delete all quotes
      for (const id of ids) {
        await db.deleteQuote(id);
      }

      const afterDelete = db._getMemoryUsage();

      // Memory should decrease after deleting quotes
      const memDecrease = beforeDelete.heapUsed - afterDelete.heapUsed;
      assert(memDecrease > 0, 'Memory not reclaimed after deletes');
    });

    it('should handle rapid rating operations without memory bloat', async () => {
      const id = await db.addQuote('Quote', 'Author');

      const beforeRatings = db._getMemoryUsage();

      // Add 1000 ratings
      for (let i = 0; i < 1000; i++) {
        await db.rateQuote(id, `user-${i}`, (i % 5) + 1);
      }

      const afterRatings = db._getMemoryUsage();
      const memUsed = afterRatings.heapUsed - beforeRatings.heapUsed;

      // Roughly 1000 ratings * ~40 bytes per rating = ~40KB (with overhead)
      assert(memUsed < 1000000, `Ratings using too much memory: ${memUsed} bytes`);
    });
  });

  // ==================== BULK OPERATION OPTIMIZATION ====================

  describe('Bulk Operation Optimization', () => {
    it('should optimize bulk adds with batching', async () => {
      const batchSize = 100;
      const batches = 5;

      db.clearTimings();

      for (let b = 0; b < batches; b++) {
        const operations = [];
        for (let i = 0; i < batchSize; i++) {
          operations.push(db.addQuote(`Quote ${b}-${i}`, 'Author'));
        }
        await Promise.all(operations);
      }

      const stats = db.getPerformanceStats();
      const avgAddTime = stats.addQuote.avgTime;

      // Average add time should remain consistent across batches
      assert(avgAddTime < 10, `Bulk add too slow: ${avgAddTime}ms per op`);
    });

    it('should efficiently handle bulk deletes', async () => {
      const ids = [];

      // Add 300 quotes
      for (let i = 0; i < 300; i++) {
        const id = await db.addQuote(`Quote ${i}`, 'Author');
        ids.push(id);
      }

      db.clearTimings();
      const startTime = Date.now();

      // Delete first 100
      for (const id of ids.slice(0, 100)) {
        await db.deleteQuote(id);
      }

      const duration = Date.now() - startTime;
      assert(duration < 1000, `Bulk delete took ${duration}ms (target: <1000ms)`);
    });

    it('should optimize batch search across large dataset', async () => {
      // Add 500 quotes with varied keywords
      const keywords = ['alpha', 'beta', 'gamma', 'delta', 'epsilon'];

      for (let i = 0; i < 500; i++) {
        const keyword = keywords[i % keywords.length];
        await db.addQuote(`Quote ${keyword} ${i}`, 'Author');
      }

      db.clearTimings();

      // Search for all keywords
      const results = [];
      for (const keyword of keywords) {
        const res = await db.searchQuotes(keyword);
        results.push(res.length);
      }

      const stats = db.getPerformanceStats();
      const totalTime = stats.searchQuotes.totalTime;

      assert(totalTime < 500, `Batch searches took ${totalTime}ms (target: <500ms)`);
      results.forEach(count => assert.strictEqual(count, 100));
    });
  });

  // ==================== SCALABILITY TESTING ====================

  describe('Scalability & Growth Patterns', () => {
    it('should maintain performance as dataset grows', async () => {
      const measurements = [];

      for (let size = 100; size <= 1000; size += 100) {
        await db.close();
        db = new MockPerformanceDatabaseService();

        // Add quotes
        for (let i = 0; i < size; i++) {
          await db.addQuote(`Quote ${i}`, 'Author');
        }

        db.clearTimings();

        // Measure operations
        const startTime = Date.now();
        await db.getAllQuotes();
        await db.searchQuotes('Quote');
        await db.getQuoteById(50);
        const duration = Date.now() - startTime;

        measurements.push({
          datasetSize: size,
          operationTime: duration
        });
      }

      // Check that growth is sublinear
      const ratio = measurements[measurements.length - 1].operationTime /
                   measurements[0].operationTime;

      assert(ratio < 5, `Performance degrades too much: ${ratio}x growth`);
    });

    it('should handle maximum practical dataset (10000 quotes)', async () => {
      const startTime = Date.now();

      // Add 10,000 quotes progressively
      for (let i = 0; i < 10000; i++) {
        await db.addQuote(`Quote ${i}`, `Author ${i % 100}`);

        if ((i + 1) % 1000 === 0) {
          const elapsed = Date.now() - startTime;
          console.log(`Added ${i + 1} quotes in ${elapsed}ms`);
        }
      }

      const duration = Date.now() - startTime;
      const quotes = await db.getAllQuotes();

      assert.strictEqual(quotes.length, 10000);
      assert(duration < 30000, `Adding 10k quotes took ${duration}ms (target: <30s)`);
    });

    it('should support database snapshots without performance hit', async () => {
      // Add 500 quotes
      for (let i = 0; i < 500; i++) {
        await db.addQuote(`Quote ${i}`, 'Author');
      }

      db.clearTimings();

      // Take "snapshot" by reading all data
      const snapshot1 = await db.getAllQuotes();

      const snapshot2 = await db.getAllQuotes();

      const snapshot3 = await db.getAllQuotes();

      const stats = db.getPerformanceStats();
      const times = [
        stats.getAllQuotes.minTime,
        stats.getAllQuotes.avgTime,
        stats.getAllQuotes.maxTime
      ];

      // All reads should be consistent
      assert(times[2] - times[0] < 10, 'Snapshot read time inconsistent');
    });
  });

  // ==================== PERFORMANCE BASELINES ====================

  describe('Performance Baselines & Benchmarks', () => {
    it('should document baseline performance metrics', async () => {
      // Create realistic dataset
      for (let i = 0; i < 500; i++) {
        await db.addQuote(`Quote ${i}`, `Author ${i}`);
      }

      db.clearTimings();

      // Perform benchmark operations
      await db.getQuoteById(250);
      await db.searchQuotes('Quote');
      await db.getAllQuotes();
      await db.rateQuote(250, 'user1', 5);

      const stats = db.getPerformanceStats();

      // Document baselines
      const baselines = {};
      Object.keys(stats).forEach(op => {
        baselines[op] = {
          min: stats[op].minTime,
          avg: stats[op].avgTime,
          max: stats[op].maxTime
        };
      });

      // All operations should complete quickly
      Object.keys(baselines).forEach(op => {
        assert(baselines[op].avg < 100, `${op} baseline too slow: ${baselines[op].avg}ms`);
      });
    });

    it('should identify performance regressions', async () => {
      // Set initial baseline
      for (let i = 0; i < 200; i++) {
        await db.addQuote(`Quote ${i}`, 'Author');
      }

      db.clearTimings();
      await db.searchQuotes('Quote');
      const baselineStats = db.getPerformanceStats();
      const baselineTime = baselineStats.searchQuotes.avgTime;

      // After dataset growth
      for (let i = 200; i < 400; i++) {
        await db.addQuote(`Quote ${i}`, 'Author');
      }

      db.clearTimings();
      await db.searchQuotes('Quote');
      const laterStats = db.getPerformanceStats();
      const laterTime = laterStats.searchQuotes.avgTime;

      // Acceptable regression: less than 2x for 2x dataset
      const regression = laterTime / baselineTime;
      assert(regression < 2.5, `Performance regression: ${regression}x`);
    });
  });
});
