#!/usr/bin/env node
/**
 * Migration Status Script
 * Show current migration status and health
 * 
 * Usage:
 *   node scripts/db/migrate-status.js        - Show status
 *   node scripts/db/migrate-status.js --json - Output as JSON
 *   node scripts/db/migrate-status.js --help - Show help
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

function formatStatus(status) {
  if (status === 'applied') {
    return `${colors.green}✅ APPLIED${colors.reset}`;
  } else if (status === 'pending') {
    return `${colors.yellow}⏳ PENDING${colors.reset}`;
  }
  return `${colors.dim}○ ${status.toUpperCase()}${colors.reset}`;
}

async function showStatus() {
  const isJson = process.argv.includes('--json');
  const isHelp = process.argv.includes('--help');

  if (isHelp) {
    console.log(`${colors.bold}Migration Status${colors.reset}`);
    console.log('Show current database migration status and progress');
    console.log('\nUsage:');
    console.log('  node scripts/db/migrate-status.js        Show formatted status');
    console.log('  node scripts/db/migrate-status.js --json Output as JSON');
    console.log('  node scripts/db/migrate-status.js --help Show this help\n');
    process.exit(0);
  }

  if (!isJson) {
    console.log(`${colors.bold}${colors.cyan}📊 Migration Status${colors.reset}\n`);
  }

  try {
    const db = getDatabase();
    if (!db) {
      throw new Error('Failed to get database connection');
    }

    const manager = new MigrationManager(db);
    const currentVersion = await manager.getVersion();
    const status = await manager.getStatus();

    if (isJson) {
      console.log(JSON.stringify({
        currentVersion,
        migrations: status,
        summary: {
          total: status.length,
          applied: status.filter(m => m.status === 'applied').length,
          pending: status.filter(m => m.status === 'pending').length,
        },
      }, null, 2));
      process.exit(0);
      return;
    }

    console.log(`${colors.dim}Version: ${currentVersion}${colors.reset}\n`);

    if (status.length === 0) {
      console.log(`${colors.yellow}⚠️  No migrations found${colors.reset}\n`);
      process.exit(0);
      return;
    }

    console.log(`${colors.bold}Available migrations:${colors.reset}`);
    console.log(`${colors.dim}${'─'.repeat(70)}${colors.reset}`);

    for (const migration of status) {
      const versionStr = migration.version.toString().padEnd(4);
      const nameStr = migration.name.padEnd(40);
      const statusStr = formatStatus(migration.status);
      console.log(`${versionStr} ${nameStr} ${statusStr}`);
    }

    console.log(`${colors.dim}${'─'.repeat(70)}${colors.reset}`);

    const applied = status.filter((m) => m.status === 'applied').length;
    const pending = status.filter((m) => m.status === 'pending').length;
    const progress = Math.round((applied / status.length) * 100);

    console.log(`\n${colors.green}Applied:${colors.reset} ${applied} | ${colors.yellow}Pending:${colors.reset} ${pending} | Total: ${status.length}`);
    console.log(`${colors.cyan}Progress:${colors.reset} ${progress}%\n`);

    process.exit(0);
  } catch (err) {
    if (!isJson) {
      if (err.code === 'ENOENT') {
        console.error(`${colors.red}${colors.bold}❌ Database not found${colors.reset}`);
        console.error(`${colors.dim}Initialize database first: npm run db:init${colors.reset}`);
      } else if (err.message.includes('locked')) {
        console.error(`${colors.red}${colors.bold}❌ Database is locked${colors.reset}`);
        console.error(`${colors.dim}Another process may be using it${colors.reset}`);
      } else {
        console.error(`${colors.red}${colors.bold}❌ Failed to get status:${colors.reset} ${err.message}`);
      }
      console.log('');
    } else {
      console.log(JSON.stringify({ error: err.message }, null, 2));
    }
    process.exit(1);
  }
}

showStatus();
