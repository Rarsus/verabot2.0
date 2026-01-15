# Global Services Migration Guide

**Version:** 3.1.0  
**Status:** Current - Active  
**Last Updated:** January 15, 2026

## Overview

This guide explains how to migrate from the deprecated `DatabaseService` wrapper to the new specialized global services introduced in Phase 23.0 (v3.1.0).

## Quick Reference

| Use Case | Old Pattern | New Pattern |
|----------|------------|------------|
| **Guild-specific data (quotes, tags, etc.)** | `DatabaseService.addQuote(guildId, ...)` | `GuildAwareDatabaseService.addQuote(guildId, ...)` |
| **Global HTTP proxy settings** | `DatabaseService` wrapper + custom methods | `GlobalProxyConfigService` methods |
| **Global user communication preferences** | `DatabaseService.getOptedInUsers()` | `GlobalUserCommunicationService.getAllOptedInUsers()` |
| **Raw database access** | `DatabaseService.executeQuery()` | Implement direct SQLite3 connection |

## Migration Timeline

- **v3.0.0 (Dec 2024):** Guild-aware services introduced
- **v3.1.0 (Jan 2026):** DatabaseService marked DEPRECATED
- **v4.0.0 (Q2 2026):** DatabaseService wrapper will be **REMOVED**

## Detailed Migrations

### 1. Guild-Specific Data Migration

#### Before (DatabaseService - DEPRECATED)
```javascript
const { getDatabase } = require('../../services/DatabaseService');

async function addQuote(guildId, text, author) {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO quotes (guild_id, text, author) VALUES (?, ?, ?)',
      [guildId, text, author],
      function(err) {
        if (err) reject(err);
        resolve({ id: this.lastID, text, author, guildId });
      }
    );
  });
}
```

#### After (GuildAwareDatabaseService - RECOMMENDED)
```javascript
const GuildAwareDatabaseService = require('../../services/GuildAwareDatabaseService');

async function addQuote(guildId, text, author) {
  // GuildAwareDatabaseService handles database access automatically
  const quote = await GuildAwareDatabaseService.addQuote(guildId, text, author);
  return quote;
}
```

**Key Differences:**
- ✅ Guild context is mandatory (safer)
- ✅ No manual promise wrapping needed
- ✅ Cleaner async/await syntax
- ✅ Better error handling

### 2. Global HTTP Proxy Settings Migration

#### Before (DatabaseService - DEPRECATED)
```javascript
const database = require('../../services/DatabaseService');
const ProxyConfigService = require('../../services/ProxyConfigService');

// ProxyConfigService wraps DatabaseService for HTTP proxy settings
const proxyConfig = new ProxyConfigService(database);

async function setProxyUrl(url) {
  // Stored as plaintext (insecure for passwords)
  return new Promise((resolve, reject) => {
    const db = database.getDatabase();
    db.run(
      'INSERT OR REPLACE INTO proxy_config (key, value) VALUES (?, ?)',
      ['proxy_url', url],
      (err) => {
        if (err) reject(err);
        else resolve(url);
      }
    );
  });
}
```

#### After (GlobalProxyConfigService - RECOMMENDED)
```javascript
const GlobalProxyConfigService = require('../../services/GlobalProxyConfigService');

async function setProxyUrl(url) {
  // Handled by specialized service with encryption for passwords
  return await GlobalProxyConfigService.setProxyUrl(url);
}
```

**Key Features of GlobalProxyConfigService:**
- ✅ AES-256-CBC encryption for passwords
- ✅ PBKDF2 key derivation for security
- ✅ 5-minute caching for performance
- ✅ Validation of proxy URLs
- ✅ Cleaner API with no manual database handling

**Usage Examples:**
```javascript
// Set proxy configuration
await GlobalProxyConfigService.setProxyUrl('http://proxy.example.com:8080');
await GlobalProxyConfigService.setProxyUsername('username');
await GlobalProxyConfigService.setProxyPassword('secret-password'); // Auto-encrypted

// Get proxy configuration
const url = await GlobalProxyConfigService.getProxyUrl();
const username = await GlobalProxyConfigService.getProxyUsername();
const password = await GlobalProxyConfigService.getProxyPassword(); // Auto-decrypted
const enabled = await GlobalProxyConfigService.isProxyEnabled();

// Get complete configuration
const config = await GlobalProxyConfigService.getFullProxyConfig();
// Returns: { url, username, enabled, updatedAt }

// Check if proxy is properly configured
const isValid = await GlobalProxyConfigService.validateProxyConfig();

// Enable/disable proxy
await GlobalProxyConfigService.setProxyEnabled(true);
await GlobalProxyConfigService.setProxyEnabled(false);

// Clear all proxy settings
await GlobalProxyConfigService.deleteAllProxyConfig();
```

### 3. Global User Communication Preferences Migration

#### Before (DatabaseService - DEPRECATED)
```javascript
const { getDatabase } = require('../../services/DatabaseService');

async function isOptedIn(userId) {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT opted_in FROM user_communications WHERE user_id = ?',
      [userId],
      (err, row) => {
        if (err) reject(err);
        resolve(row?.opted_in === 1);
      }
    );
  });
}
```

#### After (GlobalUserCommunicationService - RECOMMENDED)
```javascript
const GlobalUserCommunicationService = require('../../services/GlobalUserCommunicationService');

async function isOptedIn(userId) {
  return await GlobalUserCommunicationService.isOptedIn(userId);
}
```

**Usage Examples:**
```javascript
// Check if user is opted in
const optedIn = await GlobalUserCommunicationService.isOptedIn(userId);

// Opt user in/out
await GlobalUserCommunicationService.optIn(userId);
await GlobalUserCommunicationService.optOut(userId);

// Bulk operations (efficient)
const userIds = ['123456789', '234567890', '345678901'];
await GlobalUserCommunicationService.bulkOptIn(userIds);
await GlobalUserCommunicationService.bulkOptOut(userIds);

// Get user status with timestamps
const status = await GlobalUserCommunicationService.getOptInStatus(userId);
// Returns: { user_id, opted_in, created_at, updated_at }

// List all opted-in users
const optedInUsers = await GlobalUserCommunicationService.getAllOptedInUsers();

// List all opted-out users
const optedOutUsers = await GlobalUserCommunicationService.getAllOptedOutUsers();

// Clean up inactive users (not modified for 30+ days)
const deletedCount = await GlobalUserCommunicationService.cleanupInactiveUsers(30);

// Delete all user communication records
await GlobalUserCommunicationService.deleteAllUserCommunications();
```

### 4. CommunicationService Refactoring

The `CommunicationService` has already been refactored to use `GlobalUserCommunicationService`. If you're importing it directly:

#### Before
```javascript
const { getDatabase } = require('../../services/DatabaseService');
const CommunicationService = require('../../services/CommunicationService');

// CommunicationService used database directly
const status = await CommunicationService.isOptedIn(userId);
```

#### After (No change needed for consumers!)
```javascript
const CommunicationService = require('../../services/CommunicationService');

// CommunicationService still provides same interface, now uses GlobalUserCommunicationService
const status = await CommunicationService.isOptedIn(userId);
```

**For Direct Usage:** Skip CommunicationService wrapper and use `GlobalUserCommunicationService` directly for better clarity about what you're doing.

## Migration Checklist

- [ ] **Identify dependencies** - Find all files importing `DatabaseService`
- [ ] **Categorize usage** - Determine if usage is guild-scoped, global proxy, or user preferences
- [ ] **Replace imports** - Update to appropriate new service
- [ ] **Update method calls** - Adjust to new service API
- [ ] **Remove old code** - Delete `DatabaseService` imports from migrated files
- [ ] **Test thoroughly** - Run unit and integration tests
- [ ] **Verify no regressions** - Full test suite must pass

## Audit Results (v3.1.0)

| File | Service | Status | Notes |
|------|---------|--------|-------|
| `CommunicationService.js` | GlobalUserCommunicationService | ✅ MIGRATED | Delegates to new service |
| `ReminderNotificationService.js` | DatabaseService | ⏳ PENDING | Awaiting guild-aware refactoring |
| Proxy commands | DatabaseService | 🔒 KEPT | Global settings require root database |
| `index.js` | DatabaseService | ✅ EXPORTED | Kept for backwards compatibility |

## Error Handling

All new services follow consistent error handling patterns:

```javascript
try {
  const result = await GlobalProxyConfigService.getProxyUrl();
} catch (error) {
  if (error.code === 'VALIDATION_ERROR') {
    console.error('Invalid proxy configuration:', error.message);
  } else if (error.code === 'DATABASE_ERROR') {
    console.error('Database access failed:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Performance Considerations

### GlobalProxyConfigService
- **Caching:** 5-minute TTL on proxy configuration
- **Encryption overhead:** ~10ms per password operation (minimal)
- **Recommended:** Cache proxy settings at application startup

### GlobalUserCommunicationService
- **Bulk operations:** Use `bulkOptIn/bulkOptOut` for multiple users (100x faster than individual calls)
- **Large datasets:** `getAllOptedInUsers()` loads entire table - consider pagination for 10k+ users
- **Cleanup:** Run `cleanupInactiveUsers()` monthly to remove stale records

## FAQ

**Q: When should I use DatabaseService going forward?**  
A: Only for ProxyConfigService initialization in `index.js`. All new code should use specialized services.

**Q: Can I still use the old API?**  
A: Yes, but it's deprecated. The wrapper still works for backwards compatibility until v4.0.0.

**Q: Will my current code break in v3.1.0?**  
A: No, v3.1.0 is backwards compatible. Code will break in v4.0.0 when DatabaseService is removed.

**Q: How do I handle migration errors?**  
A: New services throw descriptive errors. Wrap calls in try-catch and handle specific error codes.

**Q: What about custom database queries?**  
A: For complex queries, implement direct SQLite3 connection:
```javascript
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./data/db/quotes.db');
// Write custom queries here
```

## See Also

- [DB-DEPRECATION-TIMELINE.md](DB-DEPRECATION-TIMELINE.md) - Complete deprecation timeline
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture overview
- [GuildAwareDatabaseService documentation](../reference/GuildAwareDatabaseService.md)
- `.github/copilot-instructions.md` - Updated service usage patterns

## Questions or Issues?

For migration help:
1. Review this guide completely
2. Check example code in tests: `tests/unit/services/test-global-*.test.js`
3. Review [DEFINITION-OF-DONE.md](../../DEFINITION-OF-DONE.md) for code standards
4. Open an issue with specific migration questions
