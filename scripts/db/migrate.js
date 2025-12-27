#!/usr/bin/env node
/**
 * Database Migration Script
 * Run pending migrations
 */

const { getDatabase } = require('../../src/services/DatabaseService');
const MigrationManager = require('../../src/services/MigrationManager');

async function runMigrations() {
  console.log('🔄 Running database migrations...\n');

  try {
    const db = getDatabase();
    const manager = new MigrationManager(db);

    const targetVersion = process.argv[2] ? parseInt(process.argv[2], 10) : null;

    const executed = await manager.migrate(targetVersion);

    if (executed > 0) {
      console.log(`\n✅ Successfully ran ${executed} migration(s)`);
    } else {
      console.log('\n✓ Database is up to date');
    }

    const currentVersion = await manager.getVersion();
    console.log(`Current version: ${currentVersion}\n`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

runMigrations();
