/**
 * Migration 003: Add Cache Metadata
 * Creates tables for tracking cache usage and patterns
 */

/**
 * Apply migration
 * @param {object} db - Database connection
 * @returns {Promise<void>}
 */
async function up(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Cache statistics table
      db.run(
        `
        CREATE TABLE IF NOT EXISTS cache_stats (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          cacheKey TEXT NOT NULL,
          hitCount INTEGER DEFAULT 0,
          missCount INTEGER DEFAULT 0,
          lastAccessed DATETIME DEFAULT CURRENT_TIMESTAMP,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `,
        (err) => {
          if (err) reject(err);
        }
      );

      // Index on cache_stats.cacheKey
      db.run(
        `
        CREATE INDEX IF NOT EXISTS idx_cache_stats_key
        ON cache_stats(cacheKey)
      `,
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  });
}

/**
 * Rollback migration
 * @param {object} db - Database connection
 * @returns {Promise<void>}
 */
async function down(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('DROP INDEX IF EXISTS idx_cache_stats_key', (err) => {
        if (err) reject(err);
      });
      db.run('DROP TABLE IF EXISTS cache_stats', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
}

module.exports = { up, down };
