# Phase 6: Guild-Aware Reminder Notification Architecture

**Document Type:** Architecture & Design Specification  
**Phase:** 6 - ReminderNotificationService Guild-Aware Refactoring  
**Version:** 1.0  
**Date:** January 14, 2026

---

## Table of Contents

1. [Current Architecture](#current-architecture)
2. [Problems to Solve](#problems-to-solve)
3. [Guild-Aware Architecture](#guild-aware-architecture)
4. [Implementation Strategy](#implementation-strategy)
5. [Data Flow](#data-flow)
6. [API Specifications](#api-specifications)
7. [Testing Strategy](#testing-strategy)
8. [Migration Path](#migration-path)

---

## Current Architecture

### Overview
```
ReminderNotificationService
    ↓
ReminderService (DEPRECATED)
    ↓
DatabaseService (Root database)
    ↓
SQLite (data/db/reminders.db)
```

### Current Issues

#### 1. **Global Notification Processing**
```javascript
// PROBLEM: Gets ALL reminders from all guilds
async function checkAndSendNotifications() {
  const dueReminders = await getRemindersForNotification();
  // dueReminders = array of ALL reminders from ALL guilds
  for (const reminder of dueReminders) {
    await sendReminderNotification(reminder);
  }
}
```

**Issues:**
- ❌ No guild context during notification processing
- ❌ Difficult to implement per-guild notification policies
- ❌ Performance issues with many guilds
- ❌ Cannot isolate notifications per guild

#### 2. **No Guild Isolation**
```javascript
// Current: All reminders in shared database
SELECT * FROM reminders WHERE status = 'ACTIVE'
// Returns reminders from ALL guilds!
```

**Issues:**
- ❌ Reminders from guild A can interfere with guild B
- ❌ No way to disable notifications per guild
- ❌ Database scaling issues with growth

#### 3. **Deprecated Dependencies**
```javascript
// DEPRECATED: ReminderService
const { getRemindersForNotification, recordNotification } = require('./ReminderService');
```

**Issues:**
- ❌ ReminderService marked for removal
- ❌ Blocks deprecation timeline
- ❌ Security concerns with shared database

---

## Problems to Solve

### Problem 1: Guild-Scoped Notification Processing
**Current:** Notifications processed globally (all guilds at once)  
**Required:** Process notifications per-guild

### Problem 2: Multi-Guild Concurrency
**Current:** Single notification loop  
**Required:** Concurrent notification processing per guild

### Problem 3: Per-Guild Notification Policies
**Current:** Same notification behavior for all guilds  
**Required:** Support per-guild notification preferences

### Problem 4: Performance at Scale
**Current:** Single query across all reminders  
**Required:** Efficient queries per guild

### Problem 5: Error Isolation
**Current:** Guild A error affects Guild B notifications  
**Required:** Guild-isolated error handling

---

## Guild-Aware Architecture

### Proposed Architecture
```
ReminderNotificationService
    ↓
    Iterate through active guilds
    ↓
    ┌─────────────────────────────────┐
    │  Per-Guild Processing Loop      │
    ├─────────────────────────────────┤
    │  1. Get guild database          │
    │  2. Check guild reminders       │
    │  3. Send guild notifications    │
    │  4. Record guild results        │
    │  5. Update guild reminders      │
    └─────────────────────────────────┘
    ↓
GuildAwareReminderNotificationService
    ↓
GuildAwareReminderService
    ↓
GuildDatabaseManager
    ↓
Per-Guild Databases
```

### Guild Database Structure
```
client.guilds.cache (Active Discord guilds)
    ↓
For each guild:
    ├── Guild Database: data/db/guild-{guildId}.db
    │   ├── reminders table (guild-specific)
    │   ├── notification_history table (guild-specific)
    │   └── notification_settings table (guild-specific)
```

### Key Components

#### 1. GuildAwareReminderNotificationService (NEW)
```javascript
/**
 * Guild-Aware Reminder Notification Service
 * Handles per-guild reminder notification delivery
 */
class GuildAwareReminderNotificationService {
  // Get all active guild IDs
  async getActiveGuildIds() {}
  
  // Check and send notifications for a specific guild
  async checkAndSendNotificationsForGuild(guildId) {}
  
  // Process all guild notifications concurrently
  async checkAndSendAllGuildNotifications() {}
  
  // Send a reminder notification for a guild
  async sendReminderNotification(guildId, reminder) {}
  
  // Record notification attempt per guild
  async recordNotificationAttempt(guildId, reminderId, success, error) {}
}
```

#### 2. Updated ReminderNotificationService
```javascript
// Initialize with Discord client
function initializeNotificationService(discordClient) {
  client = discordClient;
  
  // Start guild-aware notification checker
  notificationInterval = setInterval(
    checkAndSendAllGuildNotifications,
    checkInterval
  );
}

// Check all guild notifications concurrently
async function checkAndSendAllGuildNotifications() {
  try {
    const guildIds = await getActiveGuildIds();
    
    // Process in batches to avoid overwhelming system
    const batchSize = 10;
    for (let i = 0; i < guildIds.length; i += batchSize) {
      const batch = guildIds.slice(i, i + batchSize);
      await Promise.all(
        batch.map(guildId => 
          checkAndSendNotificationsForGuild(guildId)
        )
      );
    }
  } catch (err) {
    logError('checkAndSendAllGuildNotifications', err);
  }
}

// Process guild notifications (called per-guild)
async function checkAndSendNotificationsForGuild(guildId) {
  try {
    const dueReminders = await GuildAwareReminderService.
      getRemindersForNotification(guildId);
    
    for (const reminder of dueReminders) {
      try {
        await sendReminderNotification(guildId, reminder);
        await recordNotificationAttempt(guildId, reminder.id, true);
        
        // Mark as completed if past event time
        const now = new Date();
        if (now >= new Date(reminder.when_datetime)) {
          await GuildAwareReminderService.updateReminder(
            guildId,
            reminder.id,
            { status: REMINDER_STATUS.COMPLETED }
          );
        }
      } catch (err) {
        logError('sendNotification', err, { guildId, reminderId: reminder.id });
        await recordNotificationAttempt(guildId, reminder.id, false, err.message);
      }
    }
  } catch (err) {
    logError('checkAndSendNotificationsForGuild', err, { guildId });
  }
}
```

---

## Implementation Strategy

### Strategy Overview
```
Phase 1: Design & Specification (CURRENT)
    ↓
Phase 2: TDD RED - Write Comprehensive Tests
    - 100+ tests covering all scenarios
    - All tests failing initially
    ↓
Phase 3: TDD GREEN - Implement Service
    - Create GuildAwareReminderNotificationService
    - All tests passing
    ↓
Phase 4: Migrate Existing Code
    - Update ReminderNotificationService imports
    - Remove deprecated ReminderService usage
    ↓
Phase 5: Integration & Validation
    - Write integration tests
    - Test multi-guild scenarios
    - Verify isolation and security
    ↓
Phase 6: Documentation & Release
    - Update CHANGELOG
    - Create migration guide
```

### Key Implementation Details

#### 1. Getting Active Guild IDs
```javascript
async function getActiveGuildIds() {
  return client.guilds.cache
    .filter(guild => {
      // Skip guilds if needed (e.g., maintenance mode)
      return !guild.unavailable;
    })
    .map(guild => guild.id);
}
```

#### 2. Batched Processing
```javascript
// Process 10 guilds concurrently to avoid overwhelming system
const batchSize = 10;
for (let i = 0; i < guildIds.length; i += batchSize) {
  const batch = guildIds.slice(i, i + batchSize);
  await Promise.all(
    batch.map(guildId => checkAndSendNotificationsForGuild(guildId))
  );
  
  // Small delay between batches
  await new Promise(r => setTimeout(r, 100));
}
```

#### 3. Error Isolation
```javascript
// Error in Guild A doesn't stop Guild B processing
for (const guildId of guildIds) {
  try {
    await checkAndSendNotificationsForGuild(guildId);
  } catch (err) {
    // Log error for this guild, continue with others
    logError('Guild notification check failed', err, { guildId });
  }
}
```

---

## Data Flow

### Notification Delivery Flow

```
┌─────────────────────────────────────────┐
│  Timer Fires (every 30 seconds)         │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  Get Active Guilds                      │
│  - client.guilds.cache.map(g => g.id)  │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  Batch Guild Processing (10 at a time)  │
└──────────────┬──────────────────────────┘
               ↓
     ┌─────────┴─────────┐
     │                   │
     ↓                   ↓
┌──────────────┐    ┌──────────────┐
│  Guild 1     │    │  Guild N     │
└──────┬───────┘    └──────┬───────┘
       ↓                   ↓
┌─────────────────────────────────────┐
│ Get Guild Database                  │
│ GuildDatabaseManager.getDatabase()  │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ Query Guild Reminders Due           │
│ SELECT * FROM reminders             │
│ WHERE status = 'ACTIVE'             │
│ AND when_datetime <= NOW()          │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ For Each Reminder                   │
│ - Send notification (DM/channel)    │
│ - Record attempt result             │
│ - Update reminder status            │
└─────────────────────────────────────┘
```

### Database Operations Per Guild

```
Guild Database (data/db/guild-{guildId}.db)
│
├── Query: Get due reminders
│   SELECT * FROM reminders
│   WHERE status = 'ACTIVE'
│   AND when_datetime <= NOW()
│
├── Update: Mark as completed
│   UPDATE reminders
│   SET status = 'COMPLETED'
│   WHERE id = ?
│
└── Insert: Notification history
    INSERT INTO notification_history
    (reminder_id, status, sent_at, method, result)
    VALUES (?, ?, ?, ?, ?)
```

---

## API Specifications

### GuildAwareReminderNotificationService API

#### Method: getActiveGuildIds()
```javascript
/**
 * Get list of active guild IDs
 * @returns {Promise<string[]>} Array of guild IDs
 */
async function getActiveGuildIds() {
  // Returns: ['guild-1', 'guild-2', ...]
}
```

#### Method: checkAndSendNotificationsForGuild(guildId)
```javascript
/**
 * Check and send due notifications for a specific guild
 * @param {string} guildId - Discord guild ID
 * @returns {Promise<Object>} Notification results
 *   {
 *     guildId: string,
 *     total: number,
 *     sent: number,
 *     failed: number,
 *     errors: Error[]
 *   }
 */
async function checkAndSendNotificationsForGuild(guildId) {
  // Process guild reminders
  // Returns summary of notification attempts
}
```

#### Method: sendReminderNotification(guildId, reminder)
```javascript
/**
 * Send a reminder notification to user or channel
 * @param {string} guildId - Discord guild ID
 * @param {Object} reminder - Reminder object
 *   {
 *     id: number,
 *     user_id: string,
 *     subject: string,
 *     when_datetime: string,
 *     notification_method: 'dm' | 'channel',
 *     ...
 *   }
 * @returns {Promise<Object>} Delivery result
 *   {
 *     success: boolean,
 *     messageId?: string,
 *     error?: Error
 *   }
 */
async function sendReminderNotification(guildId, reminder) {
  // Send DM or channel notification
  // Return delivery result
}
```

#### Method: recordNotificationAttempt(guildId, reminderId, success, error)
```javascript
/**
 * Record notification attempt result
 * @param {string} guildId - Discord guild ID
 * @param {number} reminderId - Reminder ID
 * @param {boolean} success - Whether notification was sent
 * @param {string} [error] - Error message if failed
 * @returns {Promise<void>}
 */
async function recordNotificationAttempt(guildId, reminderId, success, error) {
  // Insert record into notification_history
  // Track: reminder_id, status, timestamp, method, result
}
```

---

## Testing Strategy

### Test File Structure
```javascript
// tests/unit/services/test-guild-aware-reminder-notification-service.test.js

describe('GuildAwareReminderNotificationService', () => {
  describe('getActiveGuildIds()', () => {
    // 8 tests
  });
  
  describe('checkAndSendNotificationsForGuild()', () => {
    // 20 tests
  });
  
  describe('sendReminderNotification()', () => {
    // 25 tests
  });
  
  describe('recordNotificationAttempt()', () => {
    // 15 tests
  });
  
  describe('Multi-Guild Concurrency', () => {
    // 20 tests
  });
  
  describe('Error Handling', () => {
    // 15 tests
  });
  
  // TOTAL: 100+ tests
});
```

### Test Categories

#### 1. **Guild ID Retrieval** (8 tests)
- Get active guilds
- Filter unavailable guilds
- Empty guild list
- Single guild
- Multiple guilds

#### 2. **Notification Processing** (20 tests)
- Get due reminders for guild
- Send notifications to DM
- Send notifications to channel
- Skip non-due reminders
- Handle no reminders
- Process multiple reminders

#### 3. **Notification Delivery** (25 tests)
- Successful DM delivery
- Successful channel delivery
- User not found error
- Channel not found error
- Permission denied error
- Discord API error
- Message content validation
- Embed formatting
- Multiple deliveries

#### 4. **Notification Recording** (15 tests)
- Record successful delivery
- Record failed delivery
- Record error message
- Query notification history
- Multiple records per reminder
- Timestamp accuracy

#### 5. **Multi-Guild Concurrency** (20 tests)
- Process 2 guilds concurrently
- Process 5 guilds concurrently
- Process 10 guilds concurrently
- Guild isolation
- No data leaks between guilds
- Concurrent error handling

#### 6. **Error Handling** (15+ tests)
- Guild A error doesn't affect Guild B
- Database connection error
- Retry logic
- Logging validation
- Error recovery
- Timeout handling

---

## Migration Path

### Step 1: Create New Service
```javascript
// src/services/GuildAwareReminderNotificationService.js
// Implement all methods
// All tests passing
```

### Step 2: Update ReminderNotificationService
```javascript
// BEFORE:
const { getRemindersForNotification, recordNotification } = require('./ReminderService');

async function checkAndSendNotifications() {
  const dueReminders = await getRemindersForNotification();
  // ...
}

// AFTER:
const GuildAwareReminderNotificationService = require('./GuildAwareReminderNotificationService');

async function checkAndSendNotifications() {
  await GuildAwareReminderNotificationService.checkAndSendAllGuildNotifications();
}
```

### Step 3: Verify No Remaining Imports
```bash
# Ensure no active imports of deprecated ReminderService
grep -r "getRemindersForNotification\|recordNotification" src/ --exclude-dir=_archive
# Should return: No matches

# Ensure only legacy tests reference old API
grep -r "ReminderService\." src/services/ReminderNotificationService.js
# Should return: No matches
```

### Step 4: Update Tests
```javascript
// Remove old ReminderService tests that are no longer relevant
// Update integration tests to use new guild-aware API

// BEFORE:
test('should get all reminders', () => {
  const reminders = ReminderService.getRemindersForNotification();
});

// AFTER:
test('should get guild reminders', async () => {
  const reminders = await GuildAwareReminderService.getRemindersForNotification('guild-123');
});
```

---

## Success Criteria

### Functional
- ✅ All reminders deliver to correct guild only
- ✅ No cross-guild notification leaks
- ✅ Multi-guild concurrent notification delivery
- ✅ Per-guild notification tracking
- ✅ Error isolation between guilds

### Quality
- ✅ 100+ comprehensive tests
- ✅ 100% test pass rate
- ✅ ESLint passing
- ✅ TDD workflow followed
- ✅ No regressions

### Security
- ✅ Guild isolation verified
- ✅ No shared state leaks
- ✅ No cross-guild data exposure

### Performance
- ✅ Handles 100+ guilds efficiently
- ✅ Batched processing works
- ✅ Concurrent notification dispatch
- ✅ Database queries per-guild optimal

---

## Dependencies & Integration

### Existing Services Used
- ✅ GuildAwareReminderService (already available)
- ✅ GuildDatabaseManager (already available)
- ✅ Discord.js Client (provided by bot)

### No New Dependencies Required
- All necessary infrastructure already in place
- Just need to implement guild-aware notification delivery

---

**Architecture Document Version:** 1.0  
**Created:** January 14, 2026  
**Status:** Ready for Implementation
