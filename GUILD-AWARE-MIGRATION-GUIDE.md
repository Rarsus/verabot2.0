# Guild-Aware Migration Guide for Reminder Services

**Version:** 3.6.0+  
**Status:** Complete  
**Deprecation Target:** v3.7.0 (ReminderService removal)  
**Last Updated:** January 19, 2026

---

## Overview

This guide helps developers migrate from the deprecated `ReminderService` to the new guild-aware reminder architecture. The guild-aware system provides perfect data isolation, safe multi-guild operations, and production-ready reliability.

## Why Migrate?

✅ **Guild Isolation:** Each guild's reminders are completely isolated  
✅ **Multi-Guild Safety:** Concurrent operations across guilds are safe and reliable  
✅ **Error Isolation:** Failures in one guild don't affect others  
✅ **Better Performance:** Batch processing optimizes multi-guild operations  
✅ **Future-Proof:** Preparation for v3.7.0 when ReminderService is removed

## Architecture Overview

### Old Architecture (Deprecated)
```
ReminderService (Global, Single-Guild)
    ↓
db.js wrapper
    ↓
SQLite (No guild context)
```

**Problems:**
- No guild isolation (all reminders in one global table)
- Cross-guild data access possible
- Not designed for multi-guild bot
- Will be removed in v3.7.0

### New Architecture (Guild-Aware)
```
GuildAwareReminderService (Guild-Scoped CRUD)
    ↓
GuildDatabaseManager (Per-Guild Database Routing)
    ↓
Per-Guild SQLite Databases (Perfect Isolation)
```

**Benefits:**
- Every operation requires explicit `guildId` parameter
- Each guild has isolated database instance
- Cross-guild access impossible
- Safe concurrent operations
- Production-ready and tested

## Quick Start: 3-Step Migration

### Step 1: Import Guild-Aware Service
```javascript
// OLD (Deprecated)
const reminderService = require('../services/ReminderService');

// NEW (Guild-Aware)
const GuildAwareReminderService = require('../services/GuildAwareReminderService');
const reminderService = GuildAwareReminderService;
```

### Step 2: Add Guild Context
```javascript
// OLD - No guild context
const reminder = await reminderService.getReminder(reminderId);

// NEW - Explicit guild context
const guildId = interaction.guildId;
const reminder = await reminderService.getReminderById(guildId, reminderId);
```

### Step 3: Update All Calls
```javascript
// OLD
reminderService.createReminder(text, author);
reminderService.deleteReminder(reminderId);
reminderService.updateReminder(reminderId, updates);

// NEW
const guildId = interaction.guildId;
reminderService.createReminder(guildId, text, author);
reminderService.deleteReminder(guildId, reminderId);
reminderService.updateReminder(guildId, reminderId, updates);
```

---

## Migration Examples by Use Case

### 1. Creating a Reminder

**Before (Deprecated):**
```javascript
const reminderService = require('../services/ReminderService');

async function addReminder(interaction) {
  const text = interaction.options.getString('text');
  const author = interaction.user.username;
  
  try {
    const reminder = await reminderService.createReminder(text, author);
    await interaction.reply(`Reminder created: ${reminder.id}`);
  } catch (error) {
    await interaction.reply('Failed to create reminder');
  }
}
```

**After (Guild-Aware):**
```javascript
const GuildAwareReminderService = require('../services/GuildAwareReminderService');

async function addReminder(interaction) {
  const guildId = interaction.guildId;
  const userId = interaction.user.id;
  const text = interaction.options.getString('text');
  
  try {
    const reminder = await GuildAwareReminderService.createReminder(
      guildId,
      userId,
      text,
      new Date(Date.now() + 3600000) // 1 hour from now
    );
    await interaction.reply(`Reminder created: ${reminder.id}`);
  } catch (error) {
    await interaction.reply('Failed to create reminder');
  }
}
```

**Key Changes:**
- ✅ Add `guildId` parameter (mandatory)
- ✅ Add `userId` parameter (for reminder ownership)
- ✅ Add `dueDate` parameter (when to notify)

### 2. Retrieving a Reminder

**Before (Deprecated):**
```javascript
async function getReminder(interaction) {
  const reminderId = interaction.options.getInteger('id');
  
  const reminder = await reminderService.getReminderById(reminderId);
  if (!reminder) {
    return interaction.reply('Reminder not found');
  }
  
  await interaction.reply(`Reminder: ${reminder.subject}`);
}
```

**After (Guild-Aware):**
```javascript
async function getReminder(interaction) {
  const guildId = interaction.guildId;
  const reminderId = interaction.options.getInteger('id');
  
  const reminder = await GuildAwareReminderService.getReminderById(
    guildId,
    reminderId
  );
  if (!reminder) {
    return interaction.reply('Reminder not found');
  }
  
  await interaction.reply(`Reminder: ${reminder.subject}`);
}
```

**Key Changes:**
- ✅ Always pass `guildId` as first parameter
- ✅ Returns only reminders from that guild (no cross-guild access)

### 3. Listing Reminders

**Before (Deprecated):**
```javascript
async function listReminders(interaction) {
  // Gets ALL reminders (no filtering by guild!)
  const reminders = await reminderService.getAllReminders();
  
  const list = reminders
    .map(r => `${r.id}: ${r.subject}`)
    .join('\n');
  
  await interaction.reply(list || 'No reminders');
}
```

**After (Guild-Aware):**
```javascript
async function listReminders(interaction) {
  const guildId = interaction.guildId;
  
  // Gets only this guild's reminders
  const reminders = await GuildAwareReminderService.getAllReminders(guildId);
  
  const list = reminders
    .map(r => `${r.id}: ${r.subject}`)
    .join('\n');
  
  await interaction.reply(list || 'No reminders');
}
```

**Key Changes:**
- ✅ Add `guildId` parameter
- ✅ Only receives reminders for that guild (automatic filtering)

### 4. Deleting a Reminder

**Before (Deprecated):**
```javascript
async function deleteReminder(interaction) {
  const reminderId = interaction.options.getInteger('id');
  
  // Could delete from wrong guild!
  await reminderService.deleteReminder(reminderId);
  
  await interaction.reply('Reminder deleted');
}
```

**After (Guild-Aware):**
```javascript
async function deleteReminder(interaction) {
  const guildId = interaction.guildId;
  const reminderId = interaction.options.getInteger('id');
  
  // Can only delete from this guild
  await GuildAwareReminderService.deleteReminder(guildId, reminderId);
  
  await interaction.reply('Reminder deleted');
}
```

**Key Changes:**
- ✅ Add `guildId` parameter (prevents cross-guild deletion)

### 5. Searching Reminders

**Before (Deprecated):**
```javascript
async function searchReminders(interaction) {
  const query = interaction.options.getString('search');
  
  // Gets ALL matching reminders from ALL guilds
  const results = await reminderService.searchReminders(query);
  
  const list = results
    .map(r => `${r.id}: ${r.subject}`)
    .join('\n');
  
  await interaction.reply(list || 'No results');
}
```

**After (Guild-Aware):**
```javascript
async function searchReminders(interaction) {
  const guildId = interaction.guildId;
  const query = interaction.options.getString('search');
  
  // Gets only matching reminders from this guild
  const results = await GuildAwareReminderService.searchReminders(guildId, query);
  
  const list = results
    .map(r => `${r.id}: ${r.subject}`)
    .join('\n');
  
  await interaction.reply(list || 'No results');
}
```

**Key Changes:**
- ✅ Add `guildId` parameter
- ✅ Search results automatically scoped to guild

---

## API Reference: Method Signatures

### GuildAwareReminderService

```javascript
// Create a new reminder
async createReminder(guildId, userId, subject, dueDate, channelId = null)
→ Returns: {id, guild_id, user_id, subject, when_datetime, ...}

// Get reminder by ID
async getReminderById(guildId, reminderId)
→ Returns: reminder or null

// Get all reminders for guild
async getAllReminders(guildId)
→ Returns: Array of reminders

// Search reminders
async searchReminders(guildId, query)
→ Returns: Array of matching reminders

// Update reminder
async updateReminder(guildId, reminderId, updates)
→ Returns: updated reminder

// Delete reminder
async deleteReminder(guildId, reminderId)
→ Returns: success status

// Get guild statistics
async getGuildReminderStats(guildId)
→ Returns: {total, active, completed, failed}

// Delete all guild reminders
async deleteGuildReminders(guildId)
→ Returns: count deleted
```

### GuildAwareReminderNotificationService

```javascript
// Initialize scheduler
async initializeScheduler(client, interval = 30000)
→ Starts periodic checking

// Get active guild IDs
async getActiveGuildIds(client)
→ Returns: Array of active guild IDs

// Check and send notifications for one guild
async checkAndSendNotificationsForGuild(client, guildId, reminderService)
→ Returns: {guildId, total, sent, failed}

// Send a specific notification
async sendReminderNotification(client, guildId, reminder, method = 'dm')
→ Returns: success status

// Record notification attempt
async recordNotificationAttempt(guildId, reminderId, status, error = null)
→ Returns: record ID

// Check and send for all guilds
async checkAndSendAllGuildNotifications(client, reminderService, batchSize = 10)
→ Returns: Array of results per guild
```

---

## Common Migration Patterns

### Pattern 1: Command Handler Migration

**Before:**
```javascript
class ReminderCommand extends Command {
  async executeInteraction(interaction) {
    const reminders = await reminderService.getAllReminders();
    // ... process all reminders
  }
}
```

**After:**
```javascript
class ReminderCommand extends Command {
  async executeInteraction(interaction) {
    const guildId = interaction.guildId;
    const reminders = await GuildAwareReminderService.getAllReminders(guildId);
    // ... process this guild's reminders only
  }
}
```

### Pattern 2: Utility Function Migration

**Before:**
```javascript
async function getRemindersForUser(userId) {
  return reminderService.getRemindersForUser(userId);
}
```

**After:**
```javascript
async function getRemindersForUser(guildId, userId) {
  const reminders = await GuildAwareReminderService.getAllReminders(guildId);
  return reminders.filter(r => r.user_id === userId);
}
```

### Pattern 3: Service Wrapper Migration

**Before:**
```javascript
// Wrapper maintains backward compatibility
const reminderService = {
  add: (text, author) => db.addReminder(text, author),
  get: (id) => db.getReminder(id),
  // ... more methods
};
```

**After:**
```javascript
// Use guild-aware service directly
const reminderService = GuildAwareReminderService;

// Or create wrapper for specific guild
function createGuildReminderService(guildId) {
  return {
    add: (userId, subject, dueDate) => 
      reminderService.createReminder(guildId, userId, subject, dueDate),
    get: (id) => 
      reminderService.getReminderById(guildId, id),
    // ... more methods
  };
}
```

---

## Testing Your Migration

### Unit Test Example

```javascript
const assert = require('assert');
const GuildAwareReminderService = require('../services/GuildAwareReminderService');

describe('Guild-Aware Migration Tests', () => {
  it('should create reminder with guild context', async () => {
    const guildId = 'test-guild-123';
    const userId = 'test-user-456';
    
    const reminder = await GuildAwareReminderService.createReminder(
      guildId,
      userId,
      'Test Reminder',
      new Date()
    );
    
    assert.strictEqual(reminder.guild_id, guildId);
    assert.strictEqual(reminder.user_id, userId);
  });
  
  it('should not access cross-guild reminders', async () => {
    const guildId1 = 'guild-1';
    const guildId2 = 'guild-2';
    
    // Create reminder in guild 1
    const reminder1 = await GuildAwareReminderService.createReminder(
      guildId1, 'user', 'Reminder 1', new Date()
    );
    
    // Try to get from guild 2
    const result = await GuildAwareReminderService.getReminderById(
      guildId2, reminder1.id
    );
    
    // Should not find it
    assert.strictEqual(result, null);
  });
});
```

### Integration Test Example

```javascript
describe('Multi-Guild Reminders', () => {
  it('should isolate reminders between guilds', async () => {
    const guild1Reminders = await GuildAwareReminderService.getAllReminders('guild-1');
    const guild2Reminders = await GuildAwareReminderService.getAllReminders('guild-2');
    
    // Lists should be completely separate
    guild1Reminders.forEach(r => assert.strictEqual(r.guild_id, 'guild-1'));
    guild2Reminders.forEach(r => assert.strictEqual(r.guild_id, 'guild-2'));
  });
});
```

---

## Troubleshooting

### Issue: "Cannot find property 'getAllReminders'"

**Cause:** Mixing old and new service APIs

**Solution:**
```javascript
// ❌ Wrong
const reminders = reminderService.getAllReminders(); 

// ✅ Correct
const guildId = interaction.guildId;
const reminders = await GuildAwareReminderService.getAllReminders(guildId);
```

### Issue: "Reminder not found" when ID exists

**Cause:** Looking in wrong guild

**Solution:**
```javascript
// ❌ Wrong - looks in guild A
const reminder = await reminderService.getReminderById(id);

// ✅ Correct - looks in guild B (where it actually is)
const reminder = await reminderService.getReminderById(guildIdB, id);
```

### Issue: "No reminders" for other users

**Cause:** Reminders are per-user, need to filter

**Solution:**
```javascript
// Get all reminders for guild
const allReminders = await GuildAwareReminderService.getAllReminders(guildId);

// Filter for specific user
const userReminders = allReminders.filter(r => r.user_id === userId);
```

---

## Deprecation Timeline

### v3.6.0 (Current)
- ✅ Guild-aware services fully functional
- ✅ ReminderService wrapper available for compatibility
- ✅ Migration guide published
- ⚠️ ReminderService marked for deprecation
- **Action:** Start migrating existing code

### v3.7.0 (Next Major)
- ❌ ReminderService removed completely
- ✅ Only guild-aware services available
- ⚠️ No migration path after this
- **Action:** Complete all migrations before release

### v3.8.0+
- Only guild-aware architecture

---

## Migration Checklist

Use this checklist to track your migration progress:

- [ ] Review all code using `ReminderService`
- [ ] Identify all reminder-related commands
- [ ] Add `guildId` parameter to all service calls
- [ ] Update method signatures in calling code
- [ ] Add unit tests for migrated code
- [ ] Run integration tests with multiple guilds
- [ ] Verify guild isolation in tests
- [ ] Test error handling
- [ ] Update documentation for new code
- [ ] Remove deprecated imports
- [ ] Final verification in staging environment

---

## Support

For issues or questions about migration:

1. **Check Examples:** See section "Migration Examples by Use Case" above
2. **Review API Reference:** See "API Reference: Method Signatures"
3. **Run Tests:** Execute `npm test` to verify functionality
4. **See Code:** Check `src/services/GuildAwareReminderService.js` for implementation details

---

## Related Documentation

- [PHASE-6-PLANNING.md](PHASE-6-PLANNING.md) - Architecture design
- [PHASE-6-EXECUTION-SUMMARY.md](PHASE-6-EXECUTION-SUMMARY.md) - Verification results
- [REMINDER-REMOVAL-ROADMAP.md](REMINDER-REMOVAL-ROADMAP.md) - Deprecation timeline
- [Copilot Instructions](/.github/copilot-instructions.md) - Development guidelines

---

**Document Version:** 1.0  
**Status:** Complete and Ready  
**Last Updated:** January 19, 2026
