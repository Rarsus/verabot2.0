/**
 * Migration 001: Initial Schema
 * Creates base tables for quotes, ratings, tags, and migrations
 */

/**
 * Apply migration
 * @param {object} db - Database connection
 * @returns {Promise<void>}
 */
async function up(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Quotes table
      db.run(`
        CREATE TABLE IF NOT EXISTS quotes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          text TEXT NOT NULL,
          author TEXT NOT NULL DEFAULT 'Anonymous',
          category TEXT DEFAULT 'General',
          averageRating REAL DEFAULT 0,
          ratingCount INTEGER DEFAULT 0,
          addedAt TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
      });

      // Ratings table
      db.run(`
        CREATE TABLE IF NOT EXISTS quote_ratings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          quoteId INTEGER NOT NULL,
          userId TEXT NOT NULL,
          rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(quoteId, userId),
          FOREIGN KEY(quoteId) REFERENCES quotes(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) reject(err);
      });

      // Tags table
      db.run(`
        CREATE TABLE IF NOT EXISTS tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
      });

      // Quote-Tag junction table
      db.run(`
        CREATE TABLE IF NOT EXISTS quote_tags (
          quoteId INTEGER NOT NULL,
          tagId INTEGER NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY(quoteId, tagId),
          FOREIGN KEY(quoteId) REFERENCES quotes(id) ON DELETE CASCADE,
          FOREIGN KEY(tagId) REFERENCES tags(id) ON DELETE CASCADE
        )
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
      db.run('DROP TABLE IF EXISTS quote_tags', (err) => {
        if (err) reject(err);
      });
      db.run('DROP TABLE IF EXISTS tags', (err) => {
        if (err) reject(err);
      });
      db.run('DROP TABLE IF EXISTS quote_ratings', (err) => {
        if (err) reject(err);
      });
      db.run('DROP TABLE IF EXISTS quotes', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
}

module.exports = { up, down };
