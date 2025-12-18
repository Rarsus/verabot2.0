/**
 * Database schema enhancement for advanced quote features
 * Adds support for categories, tags, ratings, and voting
 */

const { logError, ERROR_LEVELS } = require('./utils/error-handler');

/**
 * Enhance database schema with new tables for tags, ratings, and voting
 * @param {sqlite3.Database} db - Database connection
 */
function enhanceSchema(db) {
  return new Promise((resolve) => {
    db.serialize(() => {
      // Create tags table
      db.run(
        `
        CREATE TABLE IF NOT EXISTS tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        `,
        (err) => {
          if (err && !err.message.includes('already exists')) {
            logError('schema.tags', err, ERROR_LEVELS.MEDIUM);
          }
        }
      );

      // Create quote_tags junction table
      db.run(
        `
        CREATE TABLE IF NOT EXISTS quote_tags (
          quoteId INTEGER NOT NULL,
          tagId INTEGER NOT NULL,
          PRIMARY KEY (quoteId, tagId),
          FOREIGN KEY (quoteId) REFERENCES quotes(id) ON DELETE CASCADE,
          FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
        )
        `,
        (err) => {
          if (err && !err.message.includes('already exists')) {
            logError('schema.quote_tags', err, ERROR_LEVELS.MEDIUM);
          }
        }
      );

      // Create ratings table
      db.run(
        `
        CREATE TABLE IF NOT EXISTS quote_ratings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          quoteId INTEGER NOT NULL,
          userId TEXT NOT NULL,
          rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(quoteId, userId),
          FOREIGN KEY (quoteId) REFERENCES quotes(id) ON DELETE CASCADE
        )
        `,
        (err) => {
          if (err && !err.message.includes('already exists')) {
            logError('schema.quote_ratings', err, ERROR_LEVELS.MEDIUM);
          }
        }
      );

      // Add new columns to quotes table if they don't exist
      db.all("PRAGMA table_info(quotes)", (err, columns) => {
        if (err) {
          logError('schema.pragma_check', err, ERROR_LEVELS.MEDIUM);
          return;
        }

        const columnNames = columns.map(col => col.name);

        // Add category column if missing
        if (!columnNames.includes('category')) {
          db.run('ALTER TABLE quotes ADD COLUMN category TEXT DEFAULT "General"', (err) => {
            if (err && !err.message.includes('duplicate column')) {
              logError('schema.add_category', err, ERROR_LEVELS.MEDIUM);
            }
          });
        }

        // Add averageRating column if missing
        if (!columnNames.includes('averageRating')) {
          db.run('ALTER TABLE quotes ADD COLUMN averageRating REAL DEFAULT 0', (err) => {
            if (err && !err.message.includes('duplicate column')) {
              logError('schema.add_averageRating', err, ERROR_LEVELS.MEDIUM);
            }
          });
        }

        // Add ratingCount column if missing
        if (!columnNames.includes('ratingCount')) {
          db.run('ALTER TABLE quotes ADD COLUMN ratingCount INTEGER DEFAULT 0', (err) => {
            if (err && !err.message.includes('duplicate column')) {
              logError('schema.add_ratingCount', err, ERROR_LEVELS.MEDIUM);
            }
          });
        }
      });

      // Create indexes for performance
      db.run('CREATE INDEX IF NOT EXISTS idx_quotes_category ON quotes(category)', (err) => {
        if (err && !err.message.includes('already exists')) {
          logError('schema.idx_category', err, ERROR_LEVELS.LOW);
        }
      });

      db.run('CREATE INDEX IF NOT EXISTS idx_quote_tags_quoteId ON quote_tags(quoteId)', (err) => {
        if (err && !err.message.includes('already exists')) {
          logError('schema.idx_quote_tags', err, ERROR_LEVELS.LOW);
        }
      });

      db.run('CREATE INDEX IF NOT EXISTS idx_ratings_quoteId ON quote_ratings(quoteId)', (err) => {
        if (err && !err.message.includes('already exists')) {
          logError('schema.idx_ratings', err, ERROR_LEVELS.LOW);
        }
      });

      resolve();
    });
  });
}

module.exports = {
  enhanceSchema
};
