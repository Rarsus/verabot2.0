#!/usr/bin/env node
/**
 * Migration Status Script
 * Show current migration status
 */

const { getDatabase } = require('../../src/services/DatabaseService');
const MigrationManager = require('../../src/services/MigrationManager');

async function showStatus() {
  console.log('📊 Migration Status\n');

  try {
    const db = getDatabase();
    const manager = new MigrationManager(db);

    const currentVersion = await manager.getVersion();
    const status = await manager.getStatus();

    console.log(`Current version: ${currentVersion}\n`);

    if (status.length === 0) {
      console.log('No migrations found.\n');
      process.exit(0);
      return;
    }

    console.log('Available migrations:');
    console.log('━'.repeat(60));

    for (const migration of status) {
      const icon = migration.status === 'applied' ? '✓' : '○';
      const statusText = migration.status.toUpperCase();
      console.log(`${icon} ${migration.version.toString().padEnd(3)} ${migration.name.padEnd(30)} [${statusText}]`);
    }

    console.log('━'.repeat(60));

    const applied = status.filter((m) => m.status === 'applied').length;
    const pending = status.filter((m) => m.status === 'pending').length;

    console.log(`\nApplied: ${applied} | Pending: ${pending} | Total: ${status.length}\n`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to get status:', err.message);
    process.exit(1);
  }
}

showStatus();
