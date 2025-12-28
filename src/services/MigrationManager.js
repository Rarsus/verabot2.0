/**
 * Migration Manager Service
 * Handles database schema versioning and migrations
 */

const fs = require('fs');
const path = require('path');

class MigrationManager {
  constructor(database) {
    this.db = database;
    this.migrationsPath = path.join(__dirname, 'migrations');
  }

  /**
   * Get current schema version
   * @returns {Promise<number>} Current version
   */
  async getVersion() {
    return new Promise((resolve) => {
      this.db.get(
        'SELECT MAX(version) as version FROM schema_versions',
        (err, row) => {
          if (err) {
            resolve(0); // No migrations table yet
          } else {
            resolve(row?.version || 0);
          }
        }
      );
    });
  }

  /**
   * List available migrations
   * @returns {Promise<Array>} Migration files
   */
  async listMigrations() {
    if (!fs.existsSync(this.migrationsPath)) {
      return [];
    }

    const files = fs.readdirSync(this.migrationsPath)
      .filter(f => f.endsWith('.js'))
      .sort();

    return files.map(file => {
      const match = file.match(/^(\d+)_(.+)\.js$/);
      if (match) {
        return {
          version: parseInt(match[1], 10),
          name: match[2],
          file: file,
          path: path.join(this.migrationsPath, file)
        };
      }
      return null;
    }).filter(Boolean);
  }

  /**
   * Run migrations up to target version
   * @param {number} targetVersion - Target version (null = latest)
   * @returns {Promise<number>} Number of migrations run
   */
  async migrate(targetVersion = null) {
    const currentVersion = await this.getVersion();
    const migrations = await this.listMigrations();

    let target = targetVersion;
    if (target === null) {
      target = migrations.length > 0
        ? Math.max(...migrations.map(m => m.version))
        : 0;
    }

    if (currentVersion >= target) {
      console.log(`✓ Already at version ${currentVersion}`);
      return 0;
    }

    const toRun = migrations.filter(m =>
      m.version > currentVersion && m.version <= target
    );

    let executed = 0;
    for (const migration of toRun) {
      try {
        console.log(`Running migration ${migration.version}: ${migration.name}...`);


        const migrationModule = require(migration.path);

        if (typeof migrationModule.up !== 'function') {
          throw new Error(`Migration ${migration.file} missing up() function`);
        }

        await migrationModule.up(this.db);

        // Record migration
        await this._recordMigration(migration.version, migration.name);

        console.log(`✓ Migration ${migration.version} completed`);
        executed++;
      } catch (err) {
        console.error(`✗ Migration ${migration.version} failed:`, err.message);
        throw err;
      }
    }

    return executed;
  }

  /**
   * Rollback migrations
   * @param {number} steps - Number of steps to rollback (default: 1)
   * @returns {Promise<number>} Number of migrations rolled back
   */
  async rollback(steps = 1) {
    const currentVersion = await this.getVersion();

    if (currentVersion === 0) {
      console.log('✓ Already at version 0');
      return 0;
    }

    const migrations = await this.listMigrations();
    const executed = migrations.filter(m => m.version <= currentVersion);
    const toRollback = executed.slice(-steps).reverse();

    let rolledBack = 0;
    for (const migration of toRollback) {
      try {
        console.log(`Rolling back migration ${migration.version}: ${migration.name}...`);


        const migrationModule = require(migration.path);

        if (typeof migrationModule.down !== 'function') {
          throw new Error(`Migration ${migration.file} missing down() function`);
        }

        await migrationModule.down(this.db);

        // Remove migration record
        await this._removeMigration(migration.version);

        console.log(`✓ Rollback ${migration.version} completed`);
        rolledBack++;
      } catch (err) {
        console.error(`✗ Rollback ${migration.version} failed:`, err.message);
        throw err;
      }
    }

    return rolledBack;
  }

  /**
   * Get migration status
   * @returns {Promise<Array>} Migration status
   */
  async getStatus() {
    const currentVersion = await this.getVersion();
    const migrations = await this.listMigrations();

    return migrations.map(m => ({
      version: m.version,
      name: m.name,
      status: m.version <= currentVersion ? 'applied' : 'pending'
    }));
  }

  /**
   * Record migration execution
   * @private
   * @param {number} version - Migration version
   * @param {string} description - Migration description
   * @returns {Promise<void>}
   */
  _recordMigration(version, description) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO schema_versions (version, description) VALUES (?, ?)',
        [version, description],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  /**
   * Remove migration record
   * @private
   * @param {number} version - Migration version
   * @returns {Promise<void>}
   */
  _removeMigration(version) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM schema_versions WHERE version = ?',
        [version],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }
}

module.exports = MigrationManager;
