/**
 * Guild Database Manager
 *
 * Manages per-guild SQLite database connections and lifecycle.
 * One database file per guild: data/db/guilds/{GUILD_ID}/quotes.db
 *
 * Features:
 * - Automatic database creation and schema initialization
 * - Connection pooling with max 50 connections
 * - Auto-cleanup of idle connections
 * - GDPR-compliant deletion (delete guild folder)
 * - Thread-safe operations
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { logError, ERROR_LEVELS } = require('../middleware/errorHandler');

class GuildDatabaseManager {
  constructor() {
    // Map of guildId -> Database connection
    this.connections = new Map();

    // Configuration
    this.guildsDir = path.join(__dirname, '..', '..', 'data', 'db', 'guilds');
    this.schemaDir = path.join(__dirname, '..', '..', 'data', 'db', '_schema');
    this.maxConnections = 50;
    this.connectionTimeouts = new Map(); // guildId -> timeout ID
    this.idleTimeout = 15 * 60 * 1000; // 15 minutes

    // Ensure directories exist
    this._ensureDirectories();
  }

  /**
   * Ensure required directories exist
   * @private
   */
  _ensureDirectories() {
    if (!fs.existsSync(this.guildsDir)) {
      fs.mkdirSync(this.guildsDir, { recursive: true });
    }
    if (!fs.existsSync(this.schemaDir)) {
      fs.mkdirSync(this.schemaDir, { recursive: true });
    }
  }

  /**
   * Get database connection for a guild
   * Creates database if it doesn't exist
   *
   * @param {string} guildId - Discord guild ID
   * @returns {Promise<sqlite3.Database>} Database connection
   * @throws {Error} If guildId is missing
   */
  async getGuildDatabase(guildId) {
    if (!guildId) {
      throw new Error('Guild ID is required');
    }

    // Return cached connection if exists
    if (this.connections.has(guildId)) {
      this._resetIdleTimeout(guildId);
      return this.connections.get(guildId);
    }

    // Check connection limit
    if (this.connections.size >= this.maxConnections) {
      const oldestGuild = Array.from(this.connections.keys())[0];
      await this.closeGuildDatabase(oldestGuild);
    }

    // Create new database
    const db = await this.createGuildDatabase(guildId);
    this.connections.set(guildId, db);
    this._resetIdleTimeout(guildId);

    return db;
  }

  /**
   * Create a new guild database with schema
   * @private
   * @param {string} guildId - Discord guild ID
   * @returns {Promise<sqlite3.Database>} Database connection
   */
  createGuildDatabase(guildId) {
    return new Promise((resolve, reject) => {
      const guildDir = path.join(this.guildsDir, guildId);
      const dbPath = path.join(guildDir, 'quotes.db');

      // Create guild directory if needed
      if (!fs.existsSync(guildDir)) {
        fs.mkdirSync(guildDir, { recursive: true });
      }

      // Open database
      const db = new sqlite3.Database(dbPath, async (err) => {
        if (err) {
          logError('GuildDatabaseManager.createGuildDatabase', err, ERROR_LEVELS.CRITICAL);
          reject(err);
          return;
        }

        try {
          // Enable foreign keys
          await this._runAsync(db, 'PRAGMA foreign_keys = ON');

          // Initialize schema
          await this._initializeSchema(db, guildId);

          resolve(db);
        } catch (error) {
          logError('GuildDatabaseManager.createGuildDatabase.schema', error, ERROR_LEVELS.CRITICAL);
          db.close();
          reject(error);
        }
      });
    });
  }

  /**
   * Initialize schema for a new database
   * @private
   * @param {sqlite3.Database} db - Database connection
   * @param {string} _guildId - Guild ID (for logging)
   * @returns {Promise<void>}
   */
  async _initializeSchema(db, _guildId) {
    try {
      // Create quotes table
      await this._runAsync(db, `
        CREATE TABLE IF NOT EXISTS quotes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          text TEXT NOT NULL,
          author TEXT NOT NULL DEFAULT 'Anonymous',
          addedAt TEXT NOT NULL,
          category TEXT DEFAULT 'General',
          averageRating REAL DEFAULT 0,
          ratingCount INTEGER DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes
      await this._runAsync(db, 'CREATE INDEX IF NOT EXISTS idx_quotes_addedAt ON quotes(addedAt)');
      await this._runAsync(db, 'CREATE INDEX IF NOT EXISTS idx_quotes_category ON quotes(category)');
      await this._runAsync(db, 'CREATE INDEX IF NOT EXISTS idx_quotes_author ON quotes(author)');

      // Create tags table
      await this._runAsync(db, `
        CREATE TABLE IF NOT EXISTS tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create quote_tags junction table
      await this._runAsync(db, `
        CREATE TABLE IF NOT EXISTS quote_tags (
          quoteId INTEGER NOT NULL,
          tagId INTEGER NOT NULL,
          PRIMARY KEY (quoteId, tagId),
          FOREIGN KEY (quoteId) REFERENCES quotes(id) ON DELETE CASCADE,
          FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
        )
      `);

      // Create ratings table
      await this._runAsync(db, `
        CREATE TABLE IF NOT EXISTS quote_ratings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          quoteId INTEGER NOT NULL,
          userId TEXT NOT NULL,
          rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(quoteId, userId),
          FOREIGN KEY (quoteId) REFERENCES quotes(id) ON DELETE CASCADE
        )
      `);

      // Create reminders table (Phase 1: Guild Isolation)
      await this._runAsync(db, `
        CREATE TABLE IF NOT EXISTS reminders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          subject TEXT NOT NULL,
          category TEXT DEFAULT 'General',
          when_datetime TEXT NOT NULL,
          content TEXT,
          link TEXT,
          image TEXT,
          notificationTime TEXT,
          status TEXT DEFAULT 'active',
          notification_method TEXT DEFAULT 'dm',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create reminder_assignments table (Phase 1: Guild Isolation)
      await this._runAsync(db, `
        CREATE TABLE IF NOT EXISTS reminder_assignments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reminderId INTEGER NOT NULL,
          assigneeType TEXT NOT NULL,
          assigneeId TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (reminderId) REFERENCES reminders(id) ON DELETE CASCADE,
          UNIQUE(reminderId, assigneeType, assigneeId)
        )
      `);

      // Create reminder_notifications table (Phase 1: Guild Isolation)
      await this._runAsync(db, `
        CREATE TABLE IF NOT EXISTS reminder_notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reminderId INTEGER NOT NULL,
          assigneeId TEXT NOT NULL,
          notifiedAt TEXT,
          readAt TEXT,
          status TEXT DEFAULT 'pending',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (reminderId) REFERENCES reminders(id) ON DELETE CASCADE
        )
      `);

      // Create performance indexes for reminders (Phase 1: Guild Isolation - 5 indexes)
      await this._runAsync(db, 'CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status)');
      await this._runAsync(db, 'CREATE INDEX IF NOT EXISTS idx_reminders_when ON reminders(when_datetime)');
      await this._runAsync(db, 'CREATE INDEX IF NOT EXISTS idx_reminder_assignments_reminderId ON reminder_assignments(reminderId)');
      await this._runAsync(db, 'CREATE INDEX IF NOT EXISTS idx_reminder_notifications_reminderId ON reminder_notifications(reminderId)');
      await this._runAsync(db, 'CREATE INDEX IF NOT EXISTS idx_reminder_notifications_assigneeId ON reminder_notifications(assigneeId)');

      // Create user_communications table
      await this._runAsync(db, `
        CREATE TABLE IF NOT EXISTS user_communications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId TEXT NOT NULL,
          opted_in INTEGER DEFAULT 0,
          preferences TEXT DEFAULT '{}',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(userId)
        )
      `);

      // Create schema_versions table for tracking migrations
      await this._runAsync(db, `
        CREATE TABLE IF NOT EXISTS schema_versions (
          version INTEGER PRIMARY KEY,
          description TEXT,
          executedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Checkpoint to flush to disk
      await this._runAsync(db, 'PRAGMA wal_checkpoint(TRUNCATE)');

    } catch (error) {
      logError('GuildDatabaseManager._initializeSchema', error, ERROR_LEVELS.CRITICAL);
      throw error;
    }
  }

  /**
   * Close connection for a guild
   * @param {string} guildId - Discord guild ID
   * @returns {Promise<void>}
   */
  async closeGuildDatabase(guildId) {
    if (!this.connections.has(guildId)) {
      return;
    }

    const db = this.connections.get(guildId);
    this.connections.delete(guildId);

    // Clear timeout
    if (this.connectionTimeouts.has(guildId)) {
      clearTimeout(this.connectionTimeouts.get(guildId));
      this.connectionTimeouts.delete(guildId);
    }

    return new Promise((resolve) => {
      db.close((err) => {
        if (err) {
          logError('GuildDatabaseManager.closeGuildDatabase', err, ERROR_LEVELS.MEDIUM);
        }
        resolve();
      });
    });
  }

  /**
   * Delete entire guild database (GDPR compliance)
   * Deletes: data/db/guilds/{GUILD_ID}/
   *
   * @param {string} guildId - Discord guild ID
   * @returns {Promise<void>}
   * @throws {Error} If deletion fails
   */
  async deleteGuildDatabase(guildId) {
    try {
      // Close connection first
      await this.closeGuildDatabase(guildId);

      // Delete guild directory
      const guildDir = path.join(this.guildsDir, guildId);
      if (fs.existsSync(guildDir)) {
        fs.rmSync(guildDir, { recursive: true, force: true });
      }
    } catch (error) {
      logError('GuildDatabaseManager.deleteGuildDatabase', error, ERROR_LEVELS.CRITICAL);
      throw error;
    }
  }

  /**
   * Close all active database connections
   * Call during bot shutdown
   *
   * @returns {Promise<void>}
   */
  async closeAllDatabases() {
    const promises = Array.from(this.connections.keys()).map((guildId) =>
      this.closeGuildDatabase(guildId)
    );
    await Promise.all(promises);
  }

  /**
   * Reset idle timeout for a connection
   * Closes connection if idle for too long
   * @private
   * @param {string} guildId - Guild ID
   */
  _resetIdleTimeout(guildId) {
    // Clear existing timeout
    if (this.connectionTimeouts.has(guildId)) {
      clearTimeout(this.connectionTimeouts.get(guildId));
    }

    // Set new timeout
    const timeout = setTimeout(async () => {
      await this.closeGuildDatabase(guildId);
    }, this.idleTimeout);

    this.connectionTimeouts.set(guildId, timeout);
  }

  /**
   * Helper: Run async SQL command
   * @private
   * @param {sqlite3.Database} db - Database connection
   * @param {string} sql - SQL command
   * @param {Array} params - SQL parameters
   * @returns {Promise<void>}
   */
  _runAsync(db, sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Get list of all guild databases
   * @returns {Promise<Array<string>>} Array of guild IDs with databases
   */
  async getGuildDatabases() {
    try {
      const files = fs.readdirSync(this.guildsDir);
      return files.filter((f) => {
        const stat = fs.statSync(path.join(this.guildsDir, f));
        return stat.isDirectory();
      });
    } catch (error) {
      logError('GuildDatabaseManager.getGuildDatabases', error, ERROR_LEVELS.MEDIUM);
      return [];
    }
  }

  /**
   * Get database file size in bytes
   * @param {string} guildId - Guild ID
   * @returns {Promise<number>} File size in bytes
   */
  async getGuildDatabaseSize(guildId) {
    try {
      const dbPath = path.join(this.guildsDir, guildId, 'quotes.db');
      if (fs.existsSync(dbPath)) {
        const stat = fs.statSync(dbPath);
        return stat.size;
      }
      return 0;
    } catch (error) {
      logError('GuildDatabaseManager.getGuildDatabaseSize', error, ERROR_LEVELS.LOW);
      return 0;
    }
  }
}

// Export singleton instance
module.exports = new GuildDatabaseManager();
