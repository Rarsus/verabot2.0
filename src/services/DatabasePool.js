/**
 * Database Connection Pool Service
 * Manages SQLite connection pooling for concurrent requests
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class DatabasePool {
  constructor(options = {}) {
    this.dbPath = options.dbPath || path.join(__dirname, '..', '..', 'data', 'db', 'quotes.db');
    this.poolSize = options.poolSize || 5;
    this.queueTimeout = options.queueTimeout || 5000; // 5 seconds
    this.connectionTimeout = options.connectionTimeout || 30000; // 30 seconds
    this.idleTimeout = options.idleTimeout || 60000; // 60 seconds

    this.pool = [];
    this.available = [];
    this.queue = [];
    this.stats = {
      created: 0,
      acquired: 0,
      released: 0,
      queued: 0,
      timeouts: 0,
      errors: 0
    };

    this._initializePool();
  }

  /**
   * Initialize the connection pool
   * @private
   */
  _initializePool() {
    // Ensure data directory exists
    const dataDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Create initial connections
    for (let i = 0; i < this.poolSize; i++) {
      this._createConnection();
    }
  }

  /**
   * Create a new database connection
   * @private
   * @returns {object} Connection wrapper
   */
  _createConnection() {
    const db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        this.stats.errors++;
        throw err;
      }
    });

    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');

    const conn = {
      db,
      id: this.stats.created++,
      inUse: false,
      lastUsed: Date.now(),
      createdAt: Date.now()
    };

    this.pool.push(conn);
    this.available.push(conn);

    // Set up idle timeout
    this._scheduleIdleCheck(conn);

    return conn;
  }

  /**
   * Schedule idle timeout check for connection
   * @private
   * @param {object} conn - Connection wrapper
   */
  _scheduleIdleCheck(conn) {
    setTimeout(() => {
      if (!conn.inUse && Date.now() - conn.lastUsed > this.idleTimeout) {
        this._closeConnection(conn);
      } else if (!conn.inUse) {
        this._scheduleIdleCheck(conn);
      }
    }, this.idleTimeout);
  }

  /**
   * Close a connection
   * @private
   * @param {object} conn - Connection wrapper
   */
  _closeConnection(conn) {
    const index = this.pool.indexOf(conn);
    if (index > -1) {
      this.pool.splice(index, 1);
    }

    const availIndex = this.available.indexOf(conn);
    if (availIndex > -1) {
      this.available.splice(availIndex, 1);
    }

    conn.db.close((err) => {
      if (err) {
        this.stats.errors++;
      }
    });
  }

  /**
   * Get a connection from the pool
   * @returns {Promise<object>} Database connection
   */
  getConnection() {
    return new Promise((resolve, reject) => {
      // Check for available connection
      if (this.available.length > 0) {
        const conn = this.available.shift();
        conn.inUse = true;
        conn.lastUsed = Date.now();
        this.stats.acquired++;
        resolve(conn);
        return;
      }

      // Queue the request
      this.stats.queued++;
      const request = { resolve, reject };

      // Set timeout for queued request
      const timeout = setTimeout(() => {
        const index = this.queue.indexOf(request);
        if (index > -1) {
          this.queue.splice(index, 1);
          this.stats.timeouts++;
          reject(new Error('Connection request timeout'));
        }
      }, this.queueTimeout);

      request.timeout = timeout;
      this.queue.push(request);
    });
  }

  /**
   * Release a connection back to the pool
   * @param {object} conn - Connection wrapper
   */
  releaseConnection(conn) {
    if (!conn || !conn.db) {
      return;
    }

    conn.inUse = false;
    conn.lastUsed = Date.now();
    this.stats.released++;

    // Check if there are queued requests
    if (this.queue.length > 0) {
      const request = this.queue.shift();
      clearTimeout(request.timeout);
      conn.inUse = true;
      this.stats.acquired++;
      request.resolve(conn);
    } else {
      this.available.push(conn);
    }
  }

  /**
   * Execute a query with automatic connection management
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @param {string} method - Database method (run, get, all)
   * @returns {Promise<*>} Query result
   */
  async execQuery(sql, params = [], method = 'all') {
    const conn = await this.getConnection();

    return new Promise((resolve, reject) => {
      const callback = (err, result) => {
        this.releaseConnection(conn);

        if (err) {
          this.stats.errors++;
          reject(err);
        } else {
          resolve(result);
        }
      };

      try {
        if (method === 'run') {
          conn.db.run(sql, params, function(err) {
            callback(err, { lastID: this.lastID, changes: this.changes });
          });
        } else if (method === 'get') {
          conn.db.get(sql, params, callback);
        } else {
          conn.db.all(sql, params, callback);
        }
      } catch (err) {
        this.releaseConnection(conn);
        this.stats.errors++;
        reject(err);
      }
    });
  }

  /**
   * Close all connections in the pool
   * @returns {Promise<void>}
   */
  close() {
    return new Promise((resolve, reject) => {
      const connections = [...this.pool];
      let closed = 0;
      const errors = [];

      if (connections.length === 0) {
        resolve();
        return;
      }

      connections.forEach(conn => {
        conn.db.close((err) => {
          closed++;
          if (err) {
            errors.push(err);
            this.stats.errors++;
          }

          if (closed === connections.length) {
            this.pool = [];
            this.available = [];
            this.queue.forEach(req => {
              clearTimeout(req.timeout);
              req.reject(new Error('Pool closed'));
            });
            this.queue = [];

            if (errors.length > 0) {
              reject(errors[0]);
            } else {
              resolve();
            }
          }
        });
      });
    });
  }

  /**
   * Get pool statistics
   * @returns {object} Pool statistics
   */
  getStats() {
    return {
      poolSize: this.poolSize,
      totalConnections: this.pool.length,
      availableConnections: this.available.length,
      inUseConnections: this.pool.filter(c => c.inUse).length,
      queuedRequests: this.queue.length,
      created: this.stats.created,
      acquired: this.stats.acquired,
      released: this.stats.released,
      queued: this.stats.queued,
      timeouts: this.stats.timeouts,
      errors: this.stats.errors,
      utilization: this.pool.length > 0
        ? ((this.pool.filter(c => c.inUse).length / this.pool.length) * 100).toFixed(2)
        : 0
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    const created = this.stats.created; // Keep created count
    this.stats = {
      created,
      acquired: 0,
      released: 0,
      queued: 0,
      timeouts: 0,
      errors: 0
    };
  }
}

module.exports = DatabasePool;
