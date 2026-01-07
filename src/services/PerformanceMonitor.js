/**
 * Performance Monitor Service
 * Tracks query execution times, cache hit rates, and system metrics
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      queries: {
        total: 0,
        cached: 0,
        uncached: 0,
        totalDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
        byType: {}, // { select: {...}, insert: {...}, update: {...}, delete: {...} }
      },
      cache: {
        hits: 0,
        misses: 0,
        size: 0,
      },
      pool: {
        acquired: 0,
        released: 0,
        queued: 0,
        utilization: 0,
      },
      memory: {
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
      },
      startTime: Date.now(),
    };

    this.queryHistory = [];
    this.maxHistorySize = 1000; // Keep last 1000 queries
  }

  /**
   * Record a query execution
   * @param {string} sql - SQL query
   * @param {number} duration - Execution time in ms
   * @param {boolean} cached - Whether result was cached
   */
  recordQuery(sql, duration, cached = false) {
    // Update overall metrics
    this.metrics.queries.total++;
    if (cached) {
      this.metrics.queries.cached++;
    } else {
      this.metrics.queries.uncached++;
    }

    this.metrics.queries.totalDuration += duration;
    this.metrics.queries.minDuration = Math.min(this.metrics.queries.minDuration, duration);
    this.metrics.queries.maxDuration = Math.max(this.metrics.queries.maxDuration, duration);

    // Determine query type
    const type = this._getQueryType(sql);
    if (!this.metrics.queries.byType[type]) {
      this.metrics.queries.byType[type] = {
        count: 0,
        totalDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
        cached: 0,
      };
    }

    const typeMetrics = this.metrics.queries.byType[type];
    typeMetrics.count++;
    typeMetrics.totalDuration += duration;
    typeMetrics.minDuration = Math.min(typeMetrics.minDuration, duration);
    typeMetrics.maxDuration = Math.max(typeMetrics.maxDuration, duration);
    if (cached) {
      typeMetrics.cached++;
    }

    // Add to history
    this.queryHistory.push({
      sql: sql.substring(0, 200), // Truncate for memory
      duration,
      cached,
      type,
      timestamp: Date.now(),
    });

    // Trim history if too large
    if (this.queryHistory.length > this.maxHistorySize) {
      this.queryHistory.shift();
    }
  }

  /**
   * Update cache metrics
   * @param {object} cacheStats - Cache statistics from CacheManager
   */
  updateCacheMetrics(cacheStats) {
    this.metrics.cache = {
      hits: cacheStats.hits || 0,
      misses: cacheStats.misses || 0,
      size: cacheStats.size || 0,
      hitRate: cacheStats.hitRate || 0,
      memoryUsage: cacheStats.memoryUsage || 0,
    };
  }

  /**
   * Update connection pool metrics
   * @param {object} poolStats - Pool statistics from DatabasePool
   */
  updatePoolMetrics(poolStats) {
    this.metrics.pool = {
      acquired: poolStats.acquired || 0,
      released: poolStats.released || 0,
      queued: poolStats.queued || 0,
      totalConnections: poolStats.totalConnections || 0,
      availableConnections: poolStats.availableConnections || 0,
      inUseConnections: poolStats.inUseConnections || 0,
      utilization: poolStats.utilization || 0,
    };
  }

  /**
   * Update memory metrics
   */
  updateMemoryMetrics() {
    const mem = process.memoryUsage();
    this.metrics.memory = {
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal,
      external: mem.external,
      rss: mem.rss,
    };
  }

  /**
   * Get all performance metrics
   * @returns {object} Performance metrics
   */
  getMetrics() {
    this.updateMemoryMetrics();

    const uptime = Date.now() - this.metrics.startTime;
    const queries = this.metrics.queries;

    return {
      uptime,
      queries: {
        total: queries.total,
        cached: queries.cached,
        uncached: queries.uncached,
        averageDuration: queries.total > 0 ? (queries.totalDuration / queries.total).toFixed(2) : 0,
        minDuration: queries.minDuration === Infinity ? 0 : queries.minDuration,
        maxDuration: queries.maxDuration,
        cacheHitRate: queries.total > 0 ? ((queries.cached / queries.total) * 100).toFixed(2) : 0,
        byType: this._formatTypeMetrics(queries.byType),
      },
      cache: this.metrics.cache,
      pool: this.metrics.pool,
      memory: {
        heapUsed: this._formatBytes(this.metrics.memory.heapUsed),
        heapTotal: this._formatBytes(this.metrics.memory.heapTotal),
        external: this._formatBytes(this.metrics.memory.external),
        rss: this._formatBytes(this.metrics.memory.rss),
      },
      recentQueries: this.queryHistory.slice(-10),
    };
  }

  /**
   * Get slow queries (queries above threshold)
   * @param {number} threshold - Duration threshold in ms (default: 100ms)
   * @returns {Array} Slow queries
   */
  getSlowQueries(threshold = 100) {
    return this.queryHistory
      .filter((q) => q.duration > threshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 20);
  }

  /**
   * Reset metrics
   */
  reset() {
    this.metrics = {
      queries: {
        total: 0,
        cached: 0,
        uncached: 0,
        totalDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
        byType: {},
      },
      cache: {
        hits: 0,
        misses: 0,
        size: 0,
      },
      pool: {
        acquired: 0,
        released: 0,
        queued: 0,
        utilization: 0,
      },
      memory: {
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
      },
      startTime: Date.now(),
    };

    this.queryHistory = [];
  }

  /**
   * Log metrics to console
   */
  logMetrics() {
    const metrics = this.getMetrics();

    console.log('\n=== Performance Metrics ===');
    console.log(`Uptime: ${(metrics.uptime / 1000).toFixed(2)}s`);
    console.log('\nQueries:');
    console.log(`  Total: ${metrics.queries.total}`);
    console.log(`  Cached: ${metrics.queries.cached}`);
    console.log(`  Uncached: ${metrics.queries.uncached}`);
    console.log(`  Cache Hit Rate: ${metrics.queries.cacheHitRate}%`);
    console.log(`  Avg Duration: ${metrics.queries.averageDuration}ms`);
    console.log(`  Min Duration: ${metrics.queries.minDuration}ms`);
    console.log(`  Max Duration: ${metrics.queries.maxDuration}ms`);

    if (Object.keys(metrics.queries.byType).length > 0) {
      console.log('\nBy Type:');
      for (const [type, stats] of Object.entries(metrics.queries.byType)) {
        console.log(`  ${type.toUpperCase()}:`);
        console.log(`    Count: ${stats.count}`);
        console.log(`    Avg: ${stats.averageDuration}ms`);
        console.log(`    Cache Hit Rate: ${stats.cacheHitRate}%`);
      }
    }

    console.log('\nCache:');
    console.log(`  Hits: ${metrics.cache.hits}`);
    console.log(`  Misses: ${metrics.cache.misses}`);
    console.log(`  Size: ${metrics.cache.size}`);
    console.log(`  Hit Rate: ${metrics.cache.hitRate}%`);

    console.log('\nConnection Pool:');
    console.log(`  Total: ${metrics.pool.totalConnections}`);
    console.log(`  Available: ${metrics.pool.availableConnections}`);
    console.log(`  In Use: ${metrics.pool.inUseConnections}`);
    console.log(`  Utilization: ${metrics.pool.utilization}%`);

    console.log('\nMemory:');
    console.log(`  Heap Used: ${metrics.memory.heapUsed}`);
    console.log(`  Heap Total: ${metrics.memory.heapTotal}`);
    console.log(`  RSS: ${metrics.memory.rss}`);
    console.log('===========================\n');
  }

  /**
   * Get query type from SQL
   * @private
   * @param {string} sql - SQL query
   * @returns {string} Query type
   */
  _getQueryType(sql) {
    const normalized = sql.trim().toUpperCase();
    if (normalized.startsWith('SELECT')) return 'select';
    if (normalized.startsWith('INSERT')) return 'insert';
    if (normalized.startsWith('UPDATE')) return 'update';
    if (normalized.startsWith('DELETE')) return 'delete';
    if (normalized.startsWith('CREATE')) return 'create';
    if (normalized.startsWith('DROP')) return 'drop';
    if (normalized.startsWith('ALTER')) return 'alter';
    return 'other';
  }

  /**
   * Format type metrics for output
   * @private
   * @param {object} byType - Type metrics
   * @returns {object} Formatted metrics
   */
  _formatTypeMetrics(byType) {
    const formatted = {};
    for (const [type, metrics] of Object.entries(byType)) {
      formatted[type] = {
        count: metrics.count,
        averageDuration: (metrics.totalDuration / metrics.count).toFixed(2),
        minDuration: metrics.minDuration === Infinity ? 0 : metrics.minDuration,
        maxDuration: metrics.maxDuration,
        cacheHitRate: ((metrics.cached / metrics.count) * 100).toFixed(2),
      };
    }
    return formatted;
  }

  /**
   * Format bytes to human-readable string
   * @private
   * @param {number} bytes - Bytes
   * @returns {string} Formatted string
   */
  _formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}

module.exports = PerformanceMonitor;
