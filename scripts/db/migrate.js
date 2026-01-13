#!/usr/bin/env node
/**
 * Database Migration Script
 * Run pending migrations with dry-run and verbose support
 * 
 * Usage:
 *   node scripts/db/migrate.js              - Run all pending migrations
 *   node scripts/db/migrate.js [version]    - Migrate to specific version
 *   node scripts/db/migrate.js --dry-run    - Show what would be migrated
 *   node scripts/db/migrate.js --verbose    - Show detailed output
 */

const { getDatabase } = require('../../src/services/DatabaseService');
const MigrationManager = require('../../src/services/MigrationManager');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

function log(msg, type = 'info') {
  const prefix = {
    // eslint-disable-next-line security/detect-object-injection
    error: `${colors.red}${colors.bold}❌${colors.reset}`,
    // eslint-disable-next-line security/detect-object-injection
    success: `${colors.green}${colors.bold}✅${colors.reset}`,
    // eslint-disable-next-line security/detect-object-injection
    warning: `${colors.yellow}⚠️${colors.reset}`,
    // eslint-disable-next-line security/detect-object-injection
    info: `${colors.cyan}ℹ️${colors.reset}`,
    // eslint-disable-next-line security/detect-object-injection
    debug: `${colors.dim}🔍${colors.reset}`,
  };
  // eslint-disable-next-line security/detect-object-injection
  console.log(`${prefix[type] || prefix.info} ${msg}`);
}

async function runMigrations() {
  const isDryRun = process.argv.includes('--dry-run');
  const isVerbose = process.argv.includes('--verbose');
  const targetVersion = parseInt(process.argv.find(arg => /^\d+$/.test(arg)), 10) || null;

  if (isDryRun) {
    log('Running in DRY-RUN mode (no changes will be made)', 'warning');
  }

  log('Starting database migration process...', 'info');

  try {
    const db = getDatabase();
    if (!db) {
      throw new Error('Failed to get database connection');
    }

    if (isVerbose) {
      log('Database connection established', 'debug');
    }

    const manager = new MigrationManager(db);
    const currentVersion = await manager.getVersion();

    if (isVerbose) {
      log(`Current database version: ${currentVersion}`, 'debug');
      if (targetVersion) {
        log(`Target version: ${targetVersion}`, 'debug');
      }
    }

    if (isDryRun) {
      log('Preview mode - showing what would be migrated:', 'info');
      // Note: Actual dry-run logic would require additional manager methods
      log('To actually run migrations, remove --dry-run flag', 'warning');
      process.exit(0);
    }

    const executed = await manager.migrate(targetVersion);

    if (executed > 0) {
      log(`Successfully ran ${executed} migration(s)`, 'success');
    } else {
      log('Database is already up to date', 'info');
    }

    const newVersion = await manager.getVersion();
    log(`Migration complete. Version: ${currentVersion} → ${newVersion}`, 'success');

    process.exit(0);
  } catch (err) {
    if (err.code === 'ENOENT') {
      log('Database file not found', 'error');
      log('Make sure database is initialized first', 'info');
    } else if (err.message.includes('locked')) {
      log('Database is locked - another process may be using it', 'error');
      log('Try again in a few moments', 'info');
    } else if (err.message.includes('permission')) {
      log('Permission denied - check file permissions', 'error');
    } else {
      log(`Migration failed: ${err.message}`, 'error');
      if (isVerbose) {
        console.error(err.stack);
      }
    }
    process.exit(1);
  }
}

runMigrations();
