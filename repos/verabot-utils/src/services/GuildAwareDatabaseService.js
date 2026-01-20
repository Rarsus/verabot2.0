/**
 * Guild-Aware Database Service
 *
 * Wrapper around GuildDatabaseManager that provides guild-specific
 * database operations. All methods require guildId parameter.
 *
 * Usage:
 *   const quote = await db.addQuote(guildId, text, author);
 *   const quotes = await db.getAllQuotes(guildId);
 */

const guildManager = require('./GuildDatabaseManager');
const { logError, ERROR_LEVELS } = require('../middleware/errorHandler');

class GuildAwareDatabaseService {
  /**
   * Add a quote to a guild's database
   * @param {string} guildId - Discord guild ID
   * @param {string} text - Quote text
   * @param {string} author - Quote author
   * @returns {Promise<number>} Quote ID
   * @throws {Error} If guild ID or quote text is missing
   */
  async addQuote(guildId, text, author = 'Anonymous') {
    if (!guildId) throw new Error('Guild ID is required');
    if (!text || typeof text !== 'string') throw new Error('Quote text is required');
    if (typeof author !== 'string') author = String(author);

    const db = await guildManager.getGuildDatabase(guildId);
    return new Promise((resolve, reject) => {
      const addedAt = new Date().toISOString();
      db.run('INSERT INTO quotes (text, author, addedAt) VALUES (?, ?, ?)', [text, author, addedAt], function (err) {
        if (err) {
          logError('GuildAwareDatabaseService.addQuote', err, ERROR_LEVELS.MEDIUM);
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  /**
   * Get all quotes from a guild's database
   * @param {string} guildId - Discord guild ID
   * @returns {Promise<Array<Object>>} Array of quote objects
   * @throws {Error} If guild ID is missing
   */
  async getAllQuotes(guildId) {
    if (!guildId) throw new Error('Guild ID is required');

    const db = await guildManager.getGuildDatabase(guildId);
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM quotes ORDER BY addedAt DESC', [], (err, rows) => {
        if (err) {
          logError('GuildAwareDatabaseService.getAllQuotes', err, ERROR_LEVELS.MEDIUM);
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  /**
   * Get a quote by ID from a guild's database
   * @param {string} guildId - Discord guild ID
   * @param {number} id - Quote ID
   * @returns {Promise<Object|null>} Quote object or null
   * @throws {Error} If guild ID or quote ID is missing
   */
  async getQuoteById(guildId, id) {
    if (!guildId) throw new Error('Guild ID is required');
    if (!Number.isInteger(id)) throw new Error('Quote ID must be an integer');

    const db = await guildManager.getGuildDatabase(guildId);
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM quotes WHERE id = ?', [id], (err, row) => {
        if (err) {
          logError('GuildAwareDatabaseService.getQuoteById', err, ERROR_LEVELS.MEDIUM);
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  /**
   * Search quotes in a guild's database
   * @param {string} guildId - Discord guild ID
   * @param {string} keyword - Search keyword
   * @returns {Promise<Array<Object>>} Matching quotes
   * @throws {Error} If guild ID or keyword is missing
   */
  async searchQuotes(guildId, keyword) {
    if (!guildId) throw new Error('Guild ID is required');
    if (!keyword || typeof keyword !== 'string') throw new Error('Search keyword is required');

    const db = await guildManager.getGuildDatabase(guildId);
    const searchPattern = `%${keyword}%`;
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM quotes WHERE text LIKE ? OR author LIKE ? ORDER BY addedAt DESC',
        [searchPattern, searchPattern],
        (err, rows) => {
          if (err) {
            logError('GuildAwareDatabaseService.searchQuotes', err, ERROR_LEVELS.MEDIUM);
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
  }

  /**
   * Update a quote in a guild's database
   * @param {string} guildId - Discord guild ID
   * @param {number} id - Quote ID
   * @param {string} text - New quote text
   * @param {string} author - New author
   * @returns {Promise<boolean>} Success status
   * @throws {Error} If required parameters are missing
   */
  async updateQuote(guildId, id, text, author) {
    if (!guildId) throw new Error('Guild ID is required');
    if (!Number.isInteger(id)) throw new Error('Quote ID must be an integer');
    if (!text || typeof text !== 'string') throw new Error('Quote text is required');
    if (typeof author !== 'string') author = String(author);

    const db = await guildManager.getGuildDatabase(guildId);
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE quotes SET text = ?, author = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [text, author, id],
        function (err) {
          if (err) {
            logError('GuildAwareDatabaseService.updateQuote', err, ERROR_LEVELS.MEDIUM);
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
        }
      );
    });
  }

  /**
   * Delete a quote from a guild's database
   * @param {string} guildId - Discord guild ID
   * @param {number} id - Quote ID
   * @returns {Promise<boolean>} Success status
   * @throws {Error} If guild ID or quote ID is missing
   */
  async deleteQuote(guildId, id) {
    if (!guildId) throw new Error('Guild ID is required');
    if (!Number.isInteger(id)) throw new Error('Quote ID must be an integer');

    const db = await guildManager.getGuildDatabase(guildId);
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM quotes WHERE id = ?', [id], function (err) {
        if (err) {
          logError('GuildAwareDatabaseService.deleteQuote', err, ERROR_LEVELS.MEDIUM);
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  /**
   * Get quote count for a guild
   * @param {string} guildId - Discord guild ID
   * @returns {Promise<number>} Total quotes in guild
   * @throws {Error} If guild ID is missing
   */
  async getQuoteCount(guildId) {
    if (!guildId) throw new Error('Guild ID is required');

    const db = await guildManager.getGuildDatabase(guildId);
    return new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM quotes', [], (err, row) => {
        if (err) {
          logError('GuildAwareDatabaseService.getQuoteCount', err, ERROR_LEVELS.MEDIUM);
          reject(err);
        } else {
          resolve(row?.count || 0);
        }
      });
    });
  }

  /**
   * Rate a quote in a guild's database
   * @param {string} guildId - Discord guild ID
   * @param {number} quoteId - Quote ID
   * @param {string} userId - Discord user ID
   * @param {number} rating - Rating (1-5)
   * @returns {Promise<boolean>} Success status
   * @throws {Error} If required parameters are missing/invalid
   */
  async rateQuote(guildId, quoteId, userId, rating) {
    if (!guildId) throw new Error('Guild ID is required');
    if (!Number.isInteger(quoteId)) throw new Error('Quote ID must be an integer');
    if (!userId) throw new Error('User ID is required');
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const db = await guildManager.getGuildDatabase(guildId);
    
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT OR REPLACE INTO quote_ratings (quoteId, userId, rating)
         VALUES (?, ?, ?)`,
        [quoteId, userId, rating],
        async (err) => {
          if (err) {
            logError('GuildAwareDatabaseService.rateQuote', err, ERROR_LEVELS.MEDIUM);
            reject(err);
          } else {
            // Update average rating
            await this._updateAverageRating(guildId, quoteId);
            resolve(true);
          }
        }
      );
    });
  }

  /**
   * Get average rating for a quote
   * @param {string} guildId - Discord guild ID
   * @param {number} quoteId - Quote ID
   * @returns {Promise<Object>} { average, count }
   * @throws {Error} If required parameters are missing
   */
  async getQuoteRating(guildId, quoteId) {
    if (!guildId) throw new Error('Guild ID is required');
    if (!Number.isInteger(quoteId)) throw new Error('Quote ID must be an integer');

    const db = await guildManager.getGuildDatabase(guildId);
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT AVG(rating) as average, COUNT(*) as count
         FROM quote_ratings WHERE quoteId = ?`,
        [quoteId],
        (err, row) => {
          if (err) {
            logError('GuildAwareDatabaseService.getQuoteRating', err, ERROR_LEVELS.MEDIUM);
            reject(err);
          } else {
            resolve({
              average: row?.average || 0,
              count: row?.count || 0,
            });
          }
        }
      );
    });
  }

  /**
   * Tag a quote in a guild's database
   * @param {string} guildId - Discord guild ID
   * @param {number} quoteId - Quote ID
   * @param {string} tagName - Tag name
   * @returns {Promise<boolean>} Success status
   * @throws {Error} If required parameters are missing
   */
  async tagQuote(guildId, quoteId, tagName) {
    if (!guildId) throw new Error('Guild ID is required');
    if (!Number.isInteger(quoteId)) throw new Error('Quote ID must be an integer');
    if (!tagName || typeof tagName !== 'string') throw new Error('Tag name is required');

    const db = await guildManager.getGuildDatabase(guildId);
    return new Promise((resolve, reject) => {
      // First, get or create tag
      db.run('INSERT OR IGNORE INTO tags (name) VALUES (?)', [tagName], (err) => {
        if (err) {
          logError('GuildAwareDatabaseService.tagQuote.insertTag', err, ERROR_LEVELS.MEDIUM);
          reject(err);
          return;
        }

        // Get tag ID
        db.get('SELECT id FROM tags WHERE name = ?', [tagName], (err, tagRow) => {
          if (err) {
            logError('GuildAwareDatabaseService.tagQuote.getTag', err, ERROR_LEVELS.MEDIUM);
            reject(err);
            return;
          }

          if (!tagRow) {
            reject(new Error('Failed to get tag ID'));
            return;
          }

          // Add quote-tag relationship
          db.run('INSERT OR IGNORE INTO quote_tags (quoteId, tagId) VALUES (?, ?)', [quoteId, tagRow.id], (err) => {
            if (err) {
              logError('GuildAwareDatabaseService.tagQuote.insertQuoteTag', err, ERROR_LEVELS.MEDIUM);
              reject(err);
            } else {
              resolve(true);
            }
          });
        });
      });
    });
  }

  /**
   * Get quotes by tag in a guild's database
   * @param {string} guildId - Discord guild ID
   * @param {string} tagName - Tag name
   * @returns {Promise<Array<Object>>} Quotes with the tag
   * @throws {Error} If required parameters are missing
   */
  async getQuotesByTag(guildId, tagName) {
    if (!guildId) throw new Error('Guild ID is required');
    if (!tagName || typeof tagName !== 'string') throw new Error('Tag name is required');

    const db = await guildManager.getGuildDatabase(guildId);
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT DISTINCT q.* FROM quotes q
         JOIN quote_tags qt ON q.id = qt.quoteId
         JOIN tags t ON qt.tagId = t.id
         WHERE t.name = ? ORDER BY q.addedAt DESC`,
        [tagName],
        (err, rows) => {
          if (err) {
            logError('GuildAwareDatabaseService.getQuotesByTag', err, ERROR_LEVELS.MEDIUM);
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
  }

  /**
   * Update average rating for a quote
   * @private
   * @param {string} guildId - Guild ID
   * @param {number} quoteId - Quote ID
   * @returns {Promise<void>}
   */
  async _updateAverageRating(guildId, quoteId) {
    try {
      const db = await guildManager.getGuildDatabase(guildId);
      return new Promise((resolve) => {
        db.run(
          `UPDATE quotes 
           SET averageRating = (
             SELECT AVG(rating) FROM quote_ratings WHERE quoteId = ?
           ),
           ratingCount = (
             SELECT COUNT(*) FROM quote_ratings WHERE quoteId = ?
           )
           WHERE id = ?`,
          [quoteId, quoteId, quoteId],
          () => resolve()
        );
      });
    } catch (error) {
      logError('GuildAwareDatabaseService._updateAverageRating', error, ERROR_LEVELS.LOW);
    }
  }

  /**
   * Export quotes from a guild (for data portability / GDPR)
   * @param {string} guildId - Discord guild ID
   * @returns {Promise<Object>} Exported data
   * @throws {Error} If guild ID is missing
   */
  async exportGuildData(guildId) {
    if (!guildId) throw new Error('Guild ID is required');

    try {
      const quotes = await this.getAllQuotes(guildId);
      const tags = await this._getAllTags(guildId);
      const ratings = await this._getAllRatings(guildId);

      return {
        guildId,
        exportedAt: new Date().toISOString(),
        statistics: {
          totalQuotes: quotes.length,
          totalTags: tags.length,
          totalRatings: ratings.length,
        },
        data: {
          quotes,
          tags,
          ratings,
        },
      };
    } catch (error) {
      logError('GuildAwareDatabaseService.exportGuildData', error, ERROR_LEVELS.MEDIUM);
      throw error;
    }
  }

  /**
   * Get all tags for a guild
   * @private
   * @param {string} guildId - Guild ID
   * @returns {Promise<Array>} Tags
   */
  async _getAllTags(guildId) {
    const db = await guildManager.getGuildDatabase(guildId);
    return new Promise((resolve) => {
      db.all('SELECT * FROM tags ORDER BY name', [], (err, rows) => {
        resolve(err ? [] : rows || []);
      });
    });
  }

  /**
   * Get all ratings for a guild
   * @private
   * @param {string} guildId - Guild ID
   * @returns {Promise<Array>} Ratings
   */
  async _getAllRatings(guildId) {
    const db = await guildManager.getGuildDatabase(guildId);
    return new Promise((resolve) => {
      db.all('SELECT * FROM quote_ratings ORDER BY createdAt DESC', [], (err, rows) => {
        resolve(err ? [] : rows || []);
      });
    });
  }

  /**
   * Delete all data for a guild (GDPR compliance)
   * @param {string} guildId - Discord guild ID
   * @returns {Promise<void>}
   * @throws {Error} If guild ID is missing
   */
  async deleteGuildData(guildId) {
    if (!guildId) throw new Error('Guild ID is required');
    return guildManager.deleteGuildDatabase(guildId);
  }

  /**
   * Get guild statistics
   * @param {string} guildId - Discord guild ID
   * @returns {Promise<Object>} Statistics object
   * @throws {Error} If guild ID is missing
   */
  async getGuildStatistics(guildId) {
    if (!guildId) throw new Error('Guild ID is required');

    try {
      const quoteCount = await this.getQuoteCount(guildId);
      const db = await guildManager.getGuildDatabase(guildId);

      const stats = await new Promise((resolve) => {
        db.get(
          `SELECT 
             COUNT(DISTINCT author) as uniqueAuthors,
             AVG(averageRating) as avgRating,
             COUNT(DISTINCT category) as uniqueCategories
           FROM quotes`,
          [],
          (err, row) => {
            resolve(err ? {} : row || {});
          }
        );
      });

      return {
        guildId,
        totalQuotes: quoteCount,
        uniqueAuthors: stats.uniqueAuthors || 0,
        averageRating: stats.avgRating || 0,
        categories: stats.uniqueCategories || 0,
      };
    } catch (error) {
      logError('GuildAwareDatabaseService.getGuildStatistics', error, ERROR_LEVELS.MEDIUM);
      throw error;
    }
  }
}

module.exports = new GuildAwareDatabaseService();
