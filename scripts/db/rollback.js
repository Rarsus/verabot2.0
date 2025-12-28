#!/usr/bin/env node
/**
 * Database Rollback Script
 * Rollback migrations
 */

const { getDatabase } = require('../../src/services/DatabaseService');
const MigrationManager = require('../../src/services/MigrationManager');

async function rollbackMigrations() {
  const steps = process.argv[2] ? parseInt(process.argv[2], 10) : 1;

  console.log(`🔄 Rolling back ${steps} migration(s)...\n`);

  try {
    const db = getDatabase();
    const manager = new MigrationManager(db);

    const rolledBack = await manager.rollback(steps);

    if (rolledBack > 0) {
      console.log(`\n✅ Successfully rolled back ${rolledBack} migration(s)`);
    } else {
      console.log('\n✓ No migrations to rollback');
    }

    const currentVersion = await manager.getVersion();
    console.log(`Current version: ${currentVersion}\n`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Rollback failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

rollbackMigrations();
