/**
 * Quote Service
 * Business logic for quote operations
 */

const db = require('../services/DatabaseService');

/**
 * Get all quotes
 * @returns {Promise<Array>} Array of quotes
 */
async function getAllQuotes() {
  return new Promise((resolve, reject) => {
    const database = db.getDatabase();
    database.all('SELECT * FROM quotes', (err, rows) => {
      if (err) reject(err);
      resolve(rows || []);
    });
  });
}

/**
 * Get random quote
 * @returns {Promise<object>} Random quote object
 */
async function getRandomQuote() {
  return new Promise((resolve, reject) => {
    const database = db.getDatabase();
    database.get('SELECT * FROM quotes ORDER BY RANDOM() LIMIT 1', (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
}

/**
 * Search quotes
 * @param {string} query - Search query
 * @returns {Promise<Array>} Matching quotes
 */
async function searchQuotes(query) {
  return new Promise((resolve, reject) => {
    const database = db.getDatabase();
    const searchPattern = `%${query}%`;
    database.all(
      'SELECT * FROM quotes WHERE text LIKE ? OR author LIKE ? ORDER BY addedAt DESC',
      [searchPattern, searchPattern],
      (err, rows) => {
        if (err) reject(err);
        resolve(rows || []);
      }
    );
  });
}

module.exports = {
  getAllQuotes,
  getRandomQuote,
  searchQuotes
};
