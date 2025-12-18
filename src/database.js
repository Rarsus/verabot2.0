const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { logError, ERROR_LEVELS } = require('./utils/error-handler');

const dbPath = path.join(__dirname, '..', 'data', 'quotes.db');

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
 */
function setupSchema(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
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
          }
        }
      );

      // Create index on addedAt for faster queries
      db.run(
        `CREATE INDEX IF NOT EXISTS idx_quotes_addedAt ON quotes(addedAt)`,
        (err) => {
          if (err) {
            logError('database.setupSchema.createIndex', err, ERROR_LEVELS.MEDIUM);
            // Don't reject on index creation failure
          }
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
            resolve();
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
  closeDatabase
};
