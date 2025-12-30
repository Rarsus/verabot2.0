const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { logError, ERROR_LEVELS } = require('../middleware/errorHandler');

const dbPath = path.join(__dirname, '..', '..', 'data', 'db', 'quotes.db');

/**
 * Initialize SQLite database
 * @returns {sqlite3.Database} Database connection
 */
function initializeDatabase() {
  // Ensure data directory exists
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      logError('database.init', err, ERROR_LEVELS.CRITICAL);
      throw err;
    }
  });

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  return db;
}

/**
 * Set up database schema
 * @param {sqlite3.Database} db - Database connection
 * @returns {Promise<void>}
 */
function setupSchema(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      let completed = 0;
      const totalOperations = 3;

      const checkComplete = () => {
        completed++;
        if (completed === totalOperations) {
          // Force WAL checkpoint to flush to disk
          db.run('PRAGMA wal_checkpoint(TRUNCATE)', (err) => {
            if (err) {
              logError('database.setupSchema.wal_checkpoint', err, ERROR_LEVELS.MEDIUM);
            }
            resolve();
          });
        }
      };

      // Create quotes table
      db.run(
        `
        CREATE TABLE IF NOT EXISTS quotes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          text TEXT NOT NULL,
          author TEXT NOT NULL DEFAULT 'Anonymous',
          addedAt TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        `,
        (err) => {
          if (err) {
            logError('database.setupSchema.createQuotesTable', err, ERROR_LEVELS.CRITICAL);
            reject(err);
          } else {
            checkComplete();
          }
        }
      );

      // Create index on addedAt for faster queries
      db.run(
        'CREATE INDEX IF NOT EXISTS idx_quotes_addedAt ON quotes(addedAt)',
        (err) => {
          if (err) {
            logError('database.setupSchema.createIndex', err, ERROR_LEVELS.MEDIUM);
            // Don't reject on index creation failure, just continue
          }
          checkComplete();
        }
      );

      // Create migrations table
      db.run(
        `
        CREATE TABLE IF NOT EXISTS schema_versions (
          version INTEGER PRIMARY KEY,
          description TEXT,
          executedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        `,
        (err) => {
          if (err) {
            logError('database.setupSchema.createSchemaVersions', err, ERROR_LEVELS.CRITICAL);
            reject(err);
          } else {
            checkComplete();
          }
        }
      );
    });
  });
}

/**
 * Get database connection (singleton pattern)
 */
let db = null;

function getDatabase() {
  if (!db) {
    db = initializeDatabase();
  }
  return db;
}

/**
 * Add a quote to the database
 * @param {string} text - Quote text
 * @param {string} author - Quote author
 * @returns {Promise<number>} Quote ID
 */
function addQuote(text, author = 'Anonymous') {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    const addedAt = new Date().toISOString();

    database.run(
      'INSERT INTO quotes (text, author, addedAt) VALUES (?, ?, ?)',
      [text, author, addedAt],
      function(err) {
        if (err) {
          logError('database.addQuote', err, ERROR_LEVELS.MEDIUM, { text, author });
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
}

/**
 * Get all quotes
 * @returns {Promise<Array>} Array of quotes
 */
function getAllQuotes() {
  return new Promise((resolve, reject) => {
    const database = getDatabase();

    database.all(
      'SELECT id, text, author, addedAt FROM quotes ORDER BY id ASC',
      (err, rows) => {
        if (err) {
          logError('database.getAllQuotes', err, ERROR_LEVELS.MEDIUM);
          reject(err);
        } else {
          resolve(rows || []);
        }
      }
    );
  });
}

/**
 * Get quote by ID
 * @param {number} id - Quote ID
 * @returns {Promise<Object|null>} Quote object or null
 */
function getQuoteById(id) {
  return new Promise((resolve, reject) => {
    const database = getDatabase();

    database.get(
      'SELECT id, text, author, addedAt FROM quotes WHERE id = ?',
      [id],
      (err, row) => {
        if (err) {
          logError('database.getQuoteById', err, ERROR_LEVELS.MEDIUM, { id });
          reject(err);
        } else {
          resolve(row || null);
        }
      }
    );
  });
}

/**
 * Search quotes by keyword
 * @param {string} keyword - Search keyword
 * @returns {Promise<Array>} Matching quotes
 */
function searchQuotes(keyword) {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    const searchTerm = `%${keyword}%`;

    database.all(
      'SELECT id, text, author, addedAt FROM quotes WHERE text LIKE ? OR author LIKE ? ORDER BY id ASC',
      [searchTerm, searchTerm],
      (err, rows) => {
        if (err) {
          logError('database.searchQuotes', err, ERROR_LEVELS.MEDIUM, { keyword });
          reject(err);
        } else {
          resolve(rows || []);
        }
      }
    );
  });
}

/**
 * Update a quote
 * @param {number} id - Quote ID
 * @param {string} text - New quote text
 * @param {string} author - New author
 * @returns {Promise<boolean>} Success status
 */
function updateQuote(id, text, author) {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    const updatedAt = new Date().toISOString();

    database.run(
      'UPDATE quotes SET text = ?, author = ?, updatedAt = ? WHERE id = ?',
      [text, author, updatedAt, id],
      function(err) {
        if (err) {
          logError('database.updateQuote', err, ERROR_LEVELS.MEDIUM, { id });
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      }
    );
  });
}

/**
 * Delete a quote
 * @param {number} id - Quote ID
 * @returns {Promise<boolean>} Success status
 */
function deleteQuote(id) {
  return new Promise((resolve, reject) => {
    const database = getDatabase();

    database.run(
      'DELETE FROM quotes WHERE id = ?',
      [id],
      function(err) {
        if (err) {
          logError('database.deleteQuote', err, ERROR_LEVELS.MEDIUM, { id });
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      }
    );
  });
}

/**
 * Get quote count
 * @returns {Promise<number>} Total number of quotes
 */
function getQuoteCount() {
  return new Promise((resolve, reject) => {
    const database = getDatabase();

    database.get(
      'SELECT COUNT(*) as count FROM quotes',
      (err, row) => {
        if (err) {
          logError('database.getQuoteCount', err, ERROR_LEVELS.MEDIUM);
          reject(err);
        } else {
          resolve(row?.count || 0);
        }
      }
    );
  });
}

/**
 * Close database connection
 */
function closeDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          logError('database.close', err, ERROR_LEVELS.HIGH);
          reject(err);
        } else {
          db = null;
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}

module.exports = {
  initializeDatabase,
  setupSchema,
  getDatabase,
  addQuote,
  getAllQuotes,
  getQuoteById,
  searchQuotes,
  updateQuote,
  deleteQuote,
  getQuoteCount,
  closeDatabase,
  rateQuote,
  getQuoteRating,
  addTag,
  getTagByName,
  addTagToQuote,
  getQuotesByTag,
  getAllTags,
  getQuotesByCategory,
  exportQuotesAsJson,
  exportQuotesAsCsv,
  // Proxy configuration methods
  getProxyConfig,
  setProxyConfig,
  deleteProxyConfig,
  getAllProxyConfig
};

/**
 * Rate a quote
 * @param {number} quoteId - Quote ID
 * @param {string} userId - Discord user ID
 * @param {number} rating - Rating 1-5
 * @returns {Promise<{success: boolean, message: string, averageRating: number}>}
 */
function rateQuote(quoteId, userId, rating) {
  return new Promise((resolve) => {
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      resolve({ success: false, message: 'Rating must be between 1 and 5' });
      return;
    }

    const database = getDatabase();
    if (!database) {
      resolve({ success: false, message: 'Database not connected' });
      return;
    }

    // Insert or update rating
    database.run(
      'INSERT OR REPLACE INTO quote_ratings (quoteId, userId, rating) VALUES (?, ?, ?)',
      [quoteId, userId, rating],
      (err) => {
        if (err) {
          logError('database.rateQuote.insert', err, ERROR_LEVELS.MEDIUM);
          resolve({ success: false, message: 'Failed to save rating' });
          return;
        }

        // Recalculate average rating
        database.get(
          'SELECT AVG(rating) as avgRating, COUNT(*) as count FROM quote_ratings WHERE quoteId = ?',
          [quoteId],
          (err, row) => {
            if (err) {
              logError('database.rateQuote.calculate', err, ERROR_LEVELS.MEDIUM);
              resolve({ success: true, message: 'Rating saved' });
              return;
            }

            const avgRating = row.avgRating ? Math.round(row.avgRating * 10) / 10 : 0;
            database.run(
              'UPDATE quotes SET averageRating = ?, ratingCount = ? WHERE id = ?',
              [avgRating, row.count, quoteId],
              (err) => {
                if (err) {
                  logError('database.rateQuote.update', err, ERROR_LEVELS.MEDIUM);
                }
                resolve({ success: true, message: 'Rating saved', averageRating: avgRating });
              }
            );
          }
        );
      }
    );
  });
}

/**
 * Get rating for a quote by a user
 * @param {number} quoteId - Quote ID
 * @param {string} userId - Discord user ID
 * @returns {Promise<number|null>}
 */
function getQuoteRating(quoteId, userId) {
  return new Promise((resolve) => {
    const database = getDatabase();
    if (!database) {
      resolve(null);
      return;
    }

    database.get(
      'SELECT rating FROM quote_ratings WHERE quoteId = ? AND userId = ?',
      [quoteId, userId],
      (err, row) => {
        if (err) {
          logError('database.getQuoteRating', err, ERROR_LEVELS.MEDIUM);
          resolve(null);
          return;
        }
        resolve(row ? row.rating : null);
      }
    );
  });
}

/**
 * Add a new tag
 * @param {string} name - Tag name
 * @param {string} description - Tag description
 * @returns {Promise<{success: boolean, id?: number}>}
 */
function addTag(name, description = '') {
  return new Promise((resolve) => {
    const database = getDatabase();
    if (!database) {
      resolve({ success: false });
      return;
    }

    database.run(
      'INSERT OR IGNORE INTO tags (name, description) VALUES (?, ?)',
      [name.toLowerCase(), description],
      function(err) {
        if (err) {
          logError('database.addTag', err, ERROR_LEVELS.MEDIUM);
          resolve({ success: false });
          return;
        }
        resolve({ success: true, id: this.lastID });
      }
    );
  });
}

/**
 * Get tag by name
 * @param {string} name - Tag name
 * @returns {Promise<object|null>}
 */
function getTagByName(name) {
  return new Promise((resolve) => {
    const database = getDatabase();
    if (!database) {
      resolve(null);
      return;
    }

    database.get('SELECT * FROM tags WHERE name = ?', [name.toLowerCase()], (err, row) => {
      if (err) {
        logError('database.getTagByName', err, ERROR_LEVELS.MEDIUM);
        resolve(null);
        return;
      }
      resolve(row);
    });
  });
}

/**
 * Add tag to quote
 * @param {number} quoteId - Quote ID
 * @param {number} tagId - Tag ID
 * @returns {Promise<boolean>}
 */
function addTagToQuote(quoteId, tagId) {
  return new Promise((resolve) => {
    const database = getDatabase();
    if (!database) {
      resolve(false);
      return;
    }

    database.run(
      'INSERT OR IGNORE INTO quote_tags (quoteId, tagId) VALUES (?, ?)',
      [quoteId, tagId],
      (err) => {
        if (err) {
          logError('database.addTagToQuote', err, ERROR_LEVELS.MEDIUM);
          resolve(false);
          return;
        }
        resolve(true);
      }
    );
  });
}

/**
 * Get quotes by tag
 * @param {string} tagName - Tag name
 * @returns {Promise<array>}
 */
function getQuotesByTag(tagName) {
  return new Promise((resolve) => {
    const database = getDatabase();
    if (!database) {
      resolve([]);
      return;
    }

    database.all(
      `SELECT DISTINCT q.* FROM quotes q
       JOIN quote_tags qt ON q.id = qt.quoteId
       JOIN tags t ON qt.tagId = t.id
       WHERE t.name = ?
       ORDER BY q.id DESC`,
      [tagName.toLowerCase()],
      (err, rows) => {
        if (err) {
          logError('database.getQuotesByTag', err, ERROR_LEVELS.MEDIUM);
          resolve([]);
          return;
        }
        resolve(rows || []);
      }
    );
  });
}

/**
 * Get all tags
 * @returns {Promise<array>}
 */
function getAllTags() {
  return new Promise((resolve) => {
    const database = getDatabase();
    if (!database) {
      resolve([]);
      return;
    }

    database.all('SELECT * FROM tags ORDER BY name', (err, rows) => {
      if (err) {
        logError('database.getAllTags', err, ERROR_LEVELS.MEDIUM);
        resolve([]);
        return;
      }
      resolve(rows || []);
    });
  });
}

/**
 * Get quotes by category
 * @param {string} category - Category name
 * @returns {Promise<array>}
 */
function getQuotesByCategory(category) {
  return new Promise((resolve) => {
    const database = getDatabase();
    if (!database) {
      resolve([]);
      return;
    }

    database.all(
      'SELECT * FROM quotes WHERE category = ? ORDER BY id DESC',
      [category],
      (err, rows) => {
        if (err) {
          logError('database.getQuotesByCategory', err, ERROR_LEVELS.MEDIUM);
          resolve([]);
          return;
        }
        resolve(rows || []);
      }
    );
  });
}

/**
 * Export quotes as JSON
 * @param {array} quotes - Quotes to export (optional, exports all if not provided)
 * @returns {Promise<string>} JSON string
 */
function exportQuotesAsJson(quotes) {
  return new Promise((resolve) => {
    if (quotes) {
      resolve(JSON.stringify(quotes, null, 2));
      return;
    }

    getAllQuotes().then((allQuotes) => {
      resolve(JSON.stringify(allQuotes, null, 2));
    }).catch((err) => {
      logError('database.exportQuotesAsJson', err, ERROR_LEVELS.MEDIUM);
      resolve('[]');
    });
  });
}

/**
 * Export quotes as CSV
 * @param {array} quotes - Quotes to export (optional, exports all if not provided)
 * @returns {Promise<string>} CSV string
 */
function exportQuotesAsCsv(quotes) {
  return new Promise((resolve) => {
    const processQuotes = (quotesToProcess) => {
      if (!quotesToProcess || quotesToProcess.length === 0) {
        resolve('id,text,author,category,averageRating,ratingCount,addedAt');
        return;
      }

      const headers = ['id', 'text', 'author', 'category', 'averageRating', 'ratingCount', 'addedAt'];
      const rows = quotesToProcess.map(q => [
        q.id,
        `"${(q.text || '').replace(/"/g, '""')}"`,
        `"${(q.author || '').replace(/"/g, '""')}"`,
        q.category || 'General',
        q.averageRating || 0,
        q.ratingCount || 0,
        q.addedAt || ''
      ]);

      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      resolve(csv);
    };

    if (quotes) {
      processQuotes(quotes);
    } else {
      getAllQuotes().then(processQuotes).catch((err) => {
        logError('database.exportQuotesAsCsv', err, ERROR_LEVELS.MEDIUM);
        processQuotes([]);
      });
    }
  });
}

/**
 * Get proxy configuration value
 * @param {string} key - Configuration key
 * @returns {Promise<Object|null>} Configuration object or null
 */
function getProxyConfig(key) {
  return new Promise((resolve, reject) => {
    const database = getDatabase();

    database.get(
      'SELECT key, value, encrypted, updatedAt FROM proxy_config WHERE key = ?',
      [key],
      (err, row) => {
        if (err) {
          logError('database.getProxyConfig', err, ERROR_LEVELS.MEDIUM, { key });
          reject(err);
        } else {
          resolve(row || null);
        }
      }
    );
  });
}

/**
 * Set proxy configuration value
 * @param {string} key - Configuration key
 * @param {string} value - Configuration value
 * @param {boolean} encrypted - Whether value is encrypted
 * @returns {Promise<boolean>}
 */
function setProxyConfig(key, value, encrypted = false) {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    const updatedAt = new Date().toISOString();

    database.run(
      `INSERT INTO proxy_config (key, value, encrypted, updatedAt) 
       VALUES (?, ?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET 
         value = excluded.value,
         encrypted = excluded.encrypted,
         updatedAt = excluded.updatedAt`,
      [key, value, encrypted ? 1 : 0, updatedAt],
      (err) => {
        if (err) {
          logError('database.setProxyConfig', err, ERROR_LEVELS.MEDIUM, { key });
          reject(err);
        } else {
          resolve(true);
        }
      }
    );
  });
}

/**
 * Delete proxy configuration value
 * @param {string} key - Configuration key
 * @returns {Promise<boolean>}
 */
function deleteProxyConfig(key) {
  return new Promise((resolve, reject) => {
    const database = getDatabase();

    database.run(
      'DELETE FROM proxy_config WHERE key = ?',
      [key],
      function(err) {
        if (err) {
          logError('database.deleteProxyConfig', err, ERROR_LEVELS.MEDIUM, { key });
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      }
    );
  });
}

/**
 * Get all proxy configuration
 * @returns {Promise<Array>} Array of configuration objects
 */
function getAllProxyConfig() {
  return new Promise((resolve, reject) => {
    const database = getDatabase();

    database.all(
      'SELECT key, value, encrypted, updatedAt FROM proxy_config',
      (err, rows) => {
        if (err) {
          logError('database.getAllProxyConfig', err, ERROR_LEVELS.MEDIUM);
          reject(err);
        } else {
          resolve(rows || []);
        }
      }
    );
  });
}
