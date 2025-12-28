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
      // Index on quotes.author for author searches
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_quotes_author
        ON quotes(author)
      `, (err) => {
        if (err) reject(err);
      });

      // Index on quotes.category for category filtering
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_quotes_category
        ON quotes(category)
      `, (err) => {
        if (err) reject(err);
      });

      // Index on quotes.addedAt for chronological queries
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_quotes_addedAt
        ON quotes(addedAt)
      `, (err) => {
        if (err) reject(err);
      });

      // Index on quote_ratings.userId for user rating lookups
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_ratings_userId
        ON quote_ratings(userId)
      `, (err) => {
        if (err) reject(err);
      });

      // Index on quote_ratings.quoteId for quote rating aggregation
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_ratings_quoteId
        ON quote_ratings(quoteId)
      `, (err) => {
        if (err) reject(err);
      });

      // Composite index on quote_tags for join queries
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_quote_tags_quoteId_tagId
        ON quote_tags(quoteId, tagId)
      `, (err) => {
        if (err) reject(err);
      });

      // Index on tags.name for tag lookups
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_tags_name
        ON tags(name)
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
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
      db.run('DROP INDEX IF EXISTS idx_quotes_author', (err) => {
        if (err) reject(err);
      });
      db.run('DROP INDEX IF EXISTS idx_quotes_category', (err) => {
        if (err) reject(err);
      });
      db.run('DROP INDEX IF EXISTS idx_quotes_addedAt', (err) => {
        if (err) reject(err);
      });
      db.run('DROP INDEX IF EXISTS idx_ratings_userId', (err) => {
        if (err) reject(err);
      });
      db.run('DROP INDEX IF EXISTS idx_ratings_quoteId', (err) => {
        if (err) reject(err);
      });
      db.run('DROP INDEX IF EXISTS idx_quote_tags_quoteId_tagId', (err) => {
        if (err) reject(err);
      });
      db.run('DROP INDEX IF EXISTS idx_tags_name', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
}

module.exports = { up, down };
