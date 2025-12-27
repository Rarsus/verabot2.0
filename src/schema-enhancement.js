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
  return new Promise((resolve, _reject) => {
    // Helper to run SQL with promise support
    const runAsync = (sql) => {
      return new Promise((res) => {
        db.run(sql, (err) => {
          if (err && !err.message.includes('already exists') && !err.message.includes('duplicate column')) {
            logError('schema.run', err, ERROR_LEVELS.LOW);
          }
          res();
        });
      });
    };

    db.serialize(async () => {
      try {
        // Create tags table
        await runAsync(`
          CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Create quote_tags junction table
        await runAsync(`
          CREATE TABLE IF NOT EXISTS quote_tags (
            quoteId INTEGER NOT NULL,
            tagId INTEGER NOT NULL,
            PRIMARY KEY (quoteId, tagId),
            FOREIGN KEY (quoteId) REFERENCES quotes(id) ON DELETE CASCADE,
            FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
          )
        `);

        // Create ratings table
        await runAsync(`
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

        // Add new columns to quotes table if they don't exist
        const columns = await new Promise((res) => {
          db.all("PRAGMA table_info(quotes)", (err, cols) => {
            if (err) {
              logError('schema.pragma_check', err, ERROR_LEVELS.MEDIUM);
              res([]);
            } else {
              res(cols || []);
            }
          });
        });

        const columnNames = columns.map(col => col.name);

        // Add category column if missing
        if (!columnNames.includes('category')) {
          await runAsync('ALTER TABLE quotes ADD COLUMN category TEXT DEFAULT "General"');
        }

        // Add averageRating column if missing
        if (!columnNames.includes('averageRating')) {
          await runAsync('ALTER TABLE quotes ADD COLUMN averageRating REAL DEFAULT 0');
        }

        // Add ratingCount column if missing
        if (!columnNames.includes('ratingCount')) {
          await runAsync('ALTER TABLE quotes ADD COLUMN ratingCount INTEGER DEFAULT 0');
        }

        // Create indexes for performance
        await runAsync('CREATE INDEX IF NOT EXISTS idx_quotes_category ON quotes(category)');
        await runAsync('CREATE INDEX IF NOT EXISTS idx_quote_tags_quoteId ON quote_tags(quoteId)');
        await runAsync('CREATE INDEX IF NOT EXISTS idx_ratings_quoteId ON quote_ratings(quoteId)');

        // Create reminders table
        await runAsync(`
          CREATE TABLE IF NOT EXISTS reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject TEXT NOT NULL,
            category TEXT NOT NULL,
            when_datetime TEXT NOT NULL,
            content TEXT,
            link TEXT,
            image TEXT,
            notificationTime TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'active',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Create reminder_assignments table for user/role relationships
        await runAsync(`
          CREATE TABLE IF NOT EXISTS reminder_assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reminderId INTEGER NOT NULL,
            assigneeType TEXT NOT NULL CHECK(assigneeType IN ('user', 'role')),
            assigneeId TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (reminderId) REFERENCES reminders(id) ON DELETE CASCADE
          )
        `);

        // Create reminder_notifications table for tracking notification delivery
        await runAsync(`
          CREATE TABLE IF NOT EXISTS reminder_notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reminderId INTEGER NOT NULL,
            sentAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            success INTEGER DEFAULT 1,
            errorMessage TEXT,
            FOREIGN KEY (reminderId) REFERENCES reminders(id) ON DELETE CASCADE
          )
        `);

        // Create indexes for reminder performance
        await runAsync('CREATE INDEX IF NOT EXISTS idx_reminders_when ON reminders(when_datetime)');
        await runAsync('CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status)');
        await runAsync('CREATE INDEX IF NOT EXISTS idx_reminders_category ON reminders(category)');
        await runAsync('CREATE INDEX IF NOT EXISTS idx_reminder_assignments_reminderId ON reminder_assignments(reminderId)');
        await runAsync('CREATE INDEX IF NOT EXISTS idx_reminder_assignments_assigneeId ON reminder_assignments(assigneeId)');
        await runAsync('CREATE INDEX IF NOT EXISTS idx_reminder_notifications_reminderId ON reminder_notifications(reminderId)');

        resolve();
      } catch (err) {
        logError('schema.enhance', err, ERROR_LEVELS.MEDIUM);
        resolve(); // Don't reject - schema enhancement is not critical
      }
    });
  });
}

module.exports = {
  enhanceSchema
};
