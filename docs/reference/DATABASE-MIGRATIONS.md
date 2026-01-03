# Database Migrations Guide

## Overview

The migration system provides version-based schema management for the database.

## Quick Start

```bash
# Check migration status
npm run db:migrate:status

# Run pending migrations
npm run db:migrate

# Rollback last migration
npm run db:rollback

# Rollback last 2 migrations
npm run db:rollback 2
```

## Creating Migrations

Migrations are stored in `src/services/migrations/` with format `{version}_{description}.js`.

### Migration Template

```javascript
/**
 * Migration {version}: {Description}
 */

async function up(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Apply changes
      db.run('CREATE TABLE ...', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
}

async function down(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Revert changes
      db.run('DROP TABLE ...', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
}

module.exports = { up, down };
```

## Existing Migrations

1. **001_initial_schema.js** - Base tables (quotes, ratings, tags)
2. **002_add_indexes.js** - Performance indexes
3. **003_add_cache_metadata.js** - Cache tracking tables
4. **004_add_performance_metrics.js** - Performance tracking tables

## Best Practices

- Always provide both `up()` and `down()` functions
- Test migrations on a copy of production data
- Keep migrations small and focused
- Use transactions for multi-step changes
- Never modify existing migrations after deployment
