# Deprecation Audit Report

**Date:** January 5, 2026  
**Status:** IN PROGRESS - Fixing deprecated function usage

## Critical Issue: Guild Isolation Violation

### Current Problem

Several services claim to be "guild-aware" but are actually using the **root database** with `guildId` as a stored column:

1. **GuildAwareReminderService** (`src/services/GuildAwareReminderService.js`)
   - Uses: `getDatabase()` → root database
   - Stores: `reminders.guildId`, `reminder_assignments.guildId`
   - Problem: Cross-guild data stored in same table = **no true isolation**

2. **GuildAwareCommunicationService** (`src/services/GuildAwareCommunicationService.js`)
   - Uses: `getDatabase()` → root database
   - Stores: `user_communications.guildId`
   - Problem: User opt-in preferences not isolated per guild = **potential data leak**

3. **Root Database** (`data/db/quotes.db`)
   - Contains: proxy_config, reminders, reminder_assignments, reminder_notifications
   - Problem: Mixed purposes (bot management + guild data)

### Architecture Violation

Current state violates your requirement:

> "Each guild must have a separate database containing all functionality for that guild. There should be no crossover between guilds."

**Current:** `GuildAwareReminderService` uses root DB with `WHERE guildId = ?`  
**Required:** Each guild should have its own DB with reminders table

---

## Deprecated Function Usage

### 1. `DatabaseService.getDatabase()`

**Status:** ⚠️ DEPRECATED but heavily used  
**Used By:**

- GuildAwareReminderService.js (9 calls)
- GuildAwareCommunicationService.js (9 calls)
- Tests: test-reminder-service.js, test-communication-service.js, test-migration-manager.js, test-admin-communication.js

**Should Be Replaced With:**

- `GuildDatabaseManager.getGuildDatabase(guildId)` for per-guild databases

### 2. `DatabaseService.initializeDatabase()`

**Status:** ⚠️ DEPRECATED but auto-called  
**Used By:**

- index.js line 18: `const database = require('./services/DatabaseService')`

**Current Behavior:**

- Prints: `⚠️  DatabaseService.initializeDatabase() is deprecated`
- Still initializes root database for bot management

**Assessment:** ✅ ACCEPTABLE - Root DB needed for proxy_config, bot settings

---

## Files Needing Fixes

### Priority 1 (Critical - Guild Isolation)

| File                              | Issue                            | Fix                             |
| --------------------------------- | -------------------------------- | ------------------------------- |
| GuildAwareReminderService.js      | Uses root DB instead of guild DB | Migrate to GuildDatabaseManager |
| GuildAwareCommunicationService.js | Uses root DB instead of guild DB | Migrate to GuildDatabaseManager |

### Priority 2 (High - Deprecated Function Removal)

| File            | Issue                                 | Fix                                       |
| --------------- | ------------------------------------- | ----------------------------------------- |
| src/database.js | Legacy wrapper around DatabaseService | Remove, use services directly             |
| Tests           | Using DatabaseService.getDatabase()   | Use GuildDatabaseManager or mock services |

### Priority 3 (Medium - Schema Cleanup)

| File                          | Issue                              | Fix                                 |
| ----------------------------- | ---------------------------------- | ----------------------------------- |
| DatabaseService.setupSchema() | Creates reminder tables in root DB | Move to GuildDatabaseManager schema |

---

## Recommended Action Plan

### Phase 1: Add Reminder Tables to Guild Schema

1. Add reminders tables to `GuildDatabaseManager._initializeSchema()`
2. Remove guildId columns from reminder tables (they're per-guild)
3. Verify new guild databases have all needed tables

### Phase 2: Migrate GuildAwareReminderService

1. Change: `const db = getDatabase()` → `const db = await GuildDatabaseManager.getGuildDatabase(guildId)`
2. Remove: `WHERE guildId = ?` conditions (no longer needed)
3. Update: All reminder_assignments and reminder_notifications queries
4. Test: Verify isolation works

### Phase 3: Migrate GuildAwareCommunicationService ✅ COMPLETE

1. ✅ Changed import from `DatabaseService.getDatabase()` to `GuildDatabaseManager`
2. ✅ Removed all `WHERE guildId = ?` conditions from queries
3. ✅ Removed guildId column from user_communications UNIQUE constraint
4. ✅ All 7 functions refactored (isOptedIn, optIn, optOut, getStatus, getOptedInUsersForGuild, deleteGuildCommunications, getGuildCommunicationStats)
5. ✅ Updated deleteGuildCommunications to use GuildDatabaseManager.deleteGuildDatabase() for complete GDPR deletion
6. ✅ Verified syntax with `node -c`
7. ✅ Removed duplicate old user_communications table schema from GuildDatabaseManager

### Phase 4: Cleanup ✅ PARTIAL

1. ✅ Removed reminder, reminder_assignments, reminder_notifications tables from root database schema (DatabaseService.setupSchema)
2. ✅ Added note explaining reminders now live in per-guild databases
3. ⏳ Need to update bot event handlers in index.js that use old ReminderService (3 functions: deleteReminder, updateNotificationMethod)
4. ⏳ Need to refactor ReminderService or create wrapper to access guild-specific reminders
5. ⏳ Update tests to use proper guild-aware services

### Known Issues & Next Steps

1. **index.js event handlers** - Still using old ReminderService.deleteReminder and ReminderService.updateNotificationMethod
   - These need guild context to work with new architecture
   - Currently storing reminderId without guildId in reminderContexts
   - Solution: Store both guildId and reminderId in context

2. **ReminderService.js** - Legacy service still in codebase
   - Used by: index.js event handlers, ReminderNotificationService
   - Status: Should be refactored or wrapped to access guild-specific databases
3. **Test files** - Old CommunicationService and ReminderService tests
   - test-reminder-service.js - Tests old ReminderService (using root DB)
   - test-communication-service.js - Tests old CommunicationService (using root DB)
   - test-admin-communication.js - Tests old CommunicationService
   - Status: Need to create new tests for GuildAwareReminderService and GuildAwareCommunicationService

---

## Implementation Timeline

- Phase 1: 30 mins (add tables to guild schema)
- Phase 2: 1 hour (migrate GuildAwareReminderService)
- Phase 3: 45 mins (migrate GuildAwareCommunicationService)
- Phase 4: 30 mins (cleanup & testing)

**Total: ~2.5 hours**

---

## Root Database - What Should Stay

✅ **proxy_config** - Bot webhook configuration (not guild-specific)
✅ **schema_versions** - Database versioning (bot infrastructure)

❌ **reminders** - Should be per-guild
❌ **reminder_assignments** - Should be per-guild
❌ **reminder_notifications** - Should be per-guild
❌ **user_communications** - Should be per-guild

---

## Verification Checklist

After fixes:

- [ ] No `getDatabase()` calls in service files
- [ ] No direct `DatabaseService` imports in services
- [ ] All reminder operations use guild-specific DB
- [ ] All communication operations use guild-specific DB
- [ ] Deleting a guild removes all its data (GDPR compliant)
- [ ] No cross-guild data exposure possible
- [ ] Tests pass with proper isolation
