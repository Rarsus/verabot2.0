#!/usr/bin/env node
/**
 * Database Rollback Script
 * Rollback migrations with safety checks
 * 
 * Usage:
 *   node scripts/db/rollback.js              - Rollback 1 migration
 *   node scripts/db/rollback.js [steps]      - Rollback N migrations
 *   node scripts/db/rollback.js --dry-run    - Preview what would be rolled back
 *   node scripts/db/rollback.js --force      - Skip confirmation (dangerous!)
 *   node scripts/db/rollback.js --verbose    - Show detailed output
 */

const { getDatabase } = require('../../src/services/DatabaseService');
const MigrationManager = require('../../src/services/MigrationManager');
const readline = require('readline');

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

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.toLowerCase());
    });
  });
}

async function rollbackMigrations() {
  const steps = parseInt(process.argv.find(arg => /^\d+$/.test(arg)), 10) || 1;
  const isDryRun = process.argv.includes('--dry-run');
  const isForce = process.argv.includes('--force');
  const isVerbose = process.argv.includes('--verbose');

  if (isDryRun) {
    log('Running in DRY-RUN mode (no changes will be made)', 'warning');
  }

  log(`Rolling back ${steps} migration(s)...`, 'info');

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
    }

    // Safety check: warn about dangerous rollback
    if (steps > 3 && !isForce && !isDryRun) {
      log(`⚠️  You are about to rollback ${steps} migrations!`, 'warning');
      const answer = await prompt(`${colors.yellow}Continue? (y/n):${colors.reset} `);
      if (answer !== 'y' && answer !== 'yes') {
        log('Rollback cancelled', 'warning');
        process.exit(0);
      }
    }

    if (isDryRun) {
      log('Preview mode - showing what would be rolled back:', 'info');
      log(`Would rollback ${steps} migration(s)`, 'warning');
      log('To actually rollback, remove --dry-run flag', 'info');
      process.exit(0);
    }

    const rolledBack = await manager.rollback(steps);

    if (rolledBack > 0) {
      log(`Successfully rolled back ${rolledBack} migration(s)`, 'success');
    } else {
      log('No migrations to rollback', 'info');
    }

    const newVersion = await manager.getVersion();
    log(`Rollback complete. Version: ${currentVersion} → ${newVersion}`, 'success');

    process.exit(0);
  } catch (err) {
    if (err.code === 'ENOENT') {
      log('Database file not found', 'error');
      log('Make sure database is initialized first', 'info');
    } else if (err.message.includes('locked')) {
      log('Database is locked - another process may be using it', 'error');
      log('Try again in a few moments', 'info');
    } else if (err.message.includes('nothing to rollback')) {
      log('Database is at initial version - nothing to rollback', 'warning');
    } else {
      log(`Rollback failed: ${err.message}`, 'error');
      if (isVerbose) {
        console.error(err.stack);
      }
    }
    process.exit(1);
  }
}

rollbackMigrations();
