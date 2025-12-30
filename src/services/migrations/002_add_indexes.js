/**
 * Migration 002: Add Indexes
 * Creates performance indexes for frequently queried columns
 */

/**
 * Apply migration
 * @param {object} db - Database connection
 * @returns {Promise<void>}
 */
async function up(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      let completed = 0;
      const total = 7;

      const checkComplete = (err) => {
        if (err) {
          reject(err);
        } else {
          completed++;
          if (completed === total) {
            resolve();
          }
        }
      };

      // Index on quotes.author for author searches
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_quotes_author
        ON quotes(author)
      `, checkComplete);

      // Index on quotes.category for category filtering
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_quotes_category
        ON quotes(category)
      `, checkComplete);

      // Index on quotes.addedAt for chronological queries
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_quotes_addedAt
        ON quotes(addedAt)
      `, checkComplete);

      // Index on quote_ratings.userId for user rating lookups
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_ratings_userId
        ON quote_ratings(userId)
      `, checkComplete);

      // Index on quote_ratings.quoteId for quote rating aggregation
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_ratings_quoteId
        ON quote_ratings(quoteId)
      `, checkComplete);

      // Composite index on quote_tags for join queries
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_quote_tags_quoteId_tagId
        ON quote_tags(quoteId, tagId)
      `, checkComplete);

      // Index on tags.name for tag lookups
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_tags_name
        ON tags(name)
      `, checkComplete);
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
      let completed = 0;
      const total = 7;

      const checkComplete = (err) => {
        if (err) {
          reject(err);
        } else {
          completed++;
          if (completed === total) {
            resolve();
          }
        }
      };

      db.run('DROP INDEX IF EXISTS idx_quotes_author', checkComplete);
      db.run('DROP INDEX IF EXISTS idx_quotes_category', checkComplete);
      db.run('DROP INDEX IF EXISTS idx_quotes_addedAt', checkComplete);
      db.run('DROP INDEX IF EXISTS idx_ratings_userId', checkComplete);
      db.run('DROP INDEX IF EXISTS idx_ratings_quoteId', checkComplete);
      db.run('DROP INDEX IF EXISTS idx_quote_tags_quoteId_tagId', checkComplete);
      db.run('DROP INDEX IF EXISTS idx_tags_name', checkComplete);
    });
  });
}

module.exports = { up, down };
