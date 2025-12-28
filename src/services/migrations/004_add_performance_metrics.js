/**
 * Migration 004: Add Performance Metrics
 * Creates tables for tracking query performance and system metrics
 */

/**
 * Apply migration
 * @param {object} db - Database connection
 * @returns {Promise<void>}
 */
async function up(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Query performance history table
      db.run(`
        CREATE TABLE IF NOT EXISTS query_performance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          queryType TEXT NOT NULL,
          duration REAL NOT NULL,
          cached INTEGER DEFAULT 0,
          executedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
      });

      // System metrics snapshots
      db.run(`
        CREATE TABLE IF NOT EXISTS system_metrics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          metricType TEXT NOT NULL,
          metricValue REAL NOT NULL,
          recordedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
      });

      // Indexes for performance queries
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_query_performance_type
        ON query_performance(queryType)
      `, (err) => {
        if (err) reject(err);
      });

      db.run(`
        CREATE INDEX IF NOT EXISTS idx_query_performance_executedAt
        ON query_performance(executedAt)
      `, (err) => {
        if (err) reject(err);
      });

      db.run(`
        CREATE INDEX IF NOT EXISTS idx_system_metrics_type
        ON system_metrics(metricType)
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
      db.run('DROP INDEX IF EXISTS idx_query_performance_type', (err) => {
        if (err) reject(err);
      });
      db.run('DROP INDEX IF EXISTS idx_query_performance_executedAt', (err) => {
        if (err) reject(err);
      });
      db.run('DROP INDEX IF EXISTS idx_system_metrics_type', (err) => {
        if (err) reject(err);
      });
      db.run('DROP TABLE IF EXISTS query_performance', (err) => {
        if (err) reject(err);
      });
      db.run('DROP TABLE IF EXISTS system_metrics', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
}

module.exports = { up, down };
