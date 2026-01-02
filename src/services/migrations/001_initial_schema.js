/**
 * Migration 001: Initial Schema
 * Creates base tables for quotes, ratings, tags, migrations, and proxy configuration
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
      const total = 7; // 6 creates + 1 category column check

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

      // Schema versions table (MUST be created first)
      db.run(`
        CREATE TABLE IF NOT EXISTS schema_versions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          version INTEGER NOT NULL UNIQUE,
          description TEXT,
          applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, checkComplete);

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
      `, checkComplete);

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
      `, checkComplete);

      // Tags table
      db.run(`
        CREATE TABLE IF NOT EXISTS tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, checkComplete);

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
      `, checkComplete);

      // Proxy config table
      db.run(`
        CREATE TABLE IF NOT EXISTS proxy_config (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          encrypted INTEGER DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, checkComplete);

      // Ensure category column exists (for databases that existed before this migration)
      db.run(`
        ALTER TABLE quotes ADD COLUMN category TEXT DEFAULT 'General'
      `, (_err) => {
        // Ignore error if column already exists
        checkComplete(null);
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
      db.run('DROP TABLE IF EXISTS proxy_config', (err) => {
        if (err) reject(err);
      });
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
        // NOTE: Do NOT drop schema_versions - it's needed by the migration manager
        // to track migration history even after rollback
        else resolve();
      });
    });
  });
}

module.exports = { up, down };
