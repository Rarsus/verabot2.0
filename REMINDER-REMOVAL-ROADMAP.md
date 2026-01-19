# ReminderService Removal Roadmap

**Status:** Deprecation Planning  
**Current Version:** 3.6.0  
**Removal Target:** v3.7.0  
**Timeline:** Q1 2026  
**Last Updated:** January 19, 2026

---

## Overview

This document outlines the plan to remove the deprecated `ReminderService` and fully transition to the guild-aware reminder architecture. This is a **breaking change** but necessary for the bot's multi-guild architecture.

## Why Remove ReminderService?

### Problems with Current Implementation
- ❌ Not designed for multi-guild operation
- ❌ No guild isolation (all reminders in global namespace)
- ❌ Cross-guild data access possible
- ❌ Not compatible with per-guild databases
- ❌ No support for guild-scoped operations
- ❌ Cannot isolate errors per guild

### Benefits of Guild-Aware Architecture
- ✅ Perfect guild isolation (no cross-guild access)
- ✅ Safe concurrent multi-guild operations
- ✅ Per-guild error isolation
- ✅ Better performance with batch processing
- ✅ Future-proof architecture
- ✅ Production-ready and tested (35 tests)

## Removal Timeline

### Phase 1: Deprecation Notice (v3.6.0 - Current)
**Duration:** 1-2 weeks  
**Status:** ✅ ACTIVE

**Activities:**
- ✅ Published migration guide ([GUILD-AWARE-MIGRATION-GUIDE.md](GUILD-AWARE-MIGRATION-GUIDE.md))
- ✅ Added deprecation warnings to ReminderService
- ✅ Created this removal roadmap
- ✅ Documented all migration examples
- ✅ Set removal target (v3.7.0)

**User Actions:**
- Review migration guide
- Start planning code changes
- Assess impact on existing commands

### Phase 2: Migration Period (v3.6.1+ - Optional Releases)
**Duration:** 1-2 weeks  
**Status:** ⏳ PLANNED

**Activities:**
- Create patch releases (v3.6.1, v3.6.2) if needed
- Provide additional examples and support
- Collect feedback on migration difficulty
- Assist with migration issues

**User Actions:**
- Execute migration following guide
- Add guild context to all reminder calls
- Run tests to verify migration
- Report issues for assistance

### Phase 3: Removal (v3.7.0 - Major Release)
**Duration:** Release date  
**Status:** ⏳ SCHEDULED

**Release Date:** ~2 weeks from now  
**Release Notes:** Will include migration checklist

**Changes:**
- ❌ Remove `ReminderService` completely
- ❌ Remove `src/utils/command-base.js` wrapper
- ❌ Remove deprecated db.js functions
- ✅ Only guild-aware services remain
- ✅ Cleaner codebase, better performance

**Required User Actions:**
- MUST have migrated to guild-aware services
- No ReminderService calls allowed
- No fallback available

### Phase 4: Post-Removal (v3.7.1+)
**Duration:** Ongoing  
**Status:** ⏳ FUTURE

**Focus:**
- Performance optimization
- Advanced multi-guild features
- Additional guild-aware services
- Community feedback integration

---

## What Gets Removed?

### Code Deletions (v3.7.0)

```
REMOVE:
├── src/services/ReminderService.js (deprecated service)
├── src/utils/command-base.js (old command pattern)
├── src/db.js (global database wrapper)
├── src/utils/error-handler.js (old error handling)
└── Legacy reminder functions from services/

KEEP:
├── src/services/GuildAwareReminderService.js ✅
├── src/services/GuildAwareReminderNotificationService.js ✅
├── src/services/GuildDatabaseManager.js ✅
├── src/core/CommandBase.js ✅ (modern pattern)
├── src/middleware/errorHandler.js ✅ (modern pattern)
└── All reminder tests ✅
```

### Documentation Changes

**Will be removed:**
- Old ReminderService documentation
- Legacy implementation guides
- Deprecated API examples

**Will be updated:**
- Command implementation guide
- Service layer documentation
- Architecture diagrams
- Testing documentation

**Will be added:**
- v3.7.0 migration notes
- Guild-aware best practices
- Multi-guild patterns library

---

## Migration Checklist for v3.7.0

### Preparation (Before v3.7.0 Release)

- [ ] **Audit Code**
  - [ ] Run `grep -r "ReminderService" src/` to find all uses
  - [ ] Run `grep -r "require.*reminder" src/` to find imports
  - [ ] Document all files that need updates

- [ ] **Update Imports**
  - [ ] Change `ReminderService` → `GuildAwareReminderService`
  - [ ] Change `CommandBase` → `CommandBase` from `src/core/`
  - [ ] Change error handlers to use `middleware/errorHandler.js`

- [ ] **Add Guild Context**
  - [ ] Add `guildId` to all service calls
  - [ ] Add `userId` where appropriate
  - [ ] Add `dueDate` for reminder creation

- [ ] **Testing**
  - [ ] Run unit tests: `npm test`
  - [ ] Run integration tests: `npm test:integration`
  - [ ] Test multi-guild scenarios
  - [ ] Verify guild isolation

- [ ] **Code Review**
  - [ ] Review migrated code
  - [ ] Check error handling
  - [ ] Verify guild context in all calls
  - [ ] Approve for release

### Release Day (v3.7.0)

- [ ] Update CHANGELOG.md
- [ ] Tag version as v3.7.0
- [ ] Publish release notes
- [ ] Notify users of removal
- [ ] Provide support contact info

### Post-Release (v3.7.1+)

- [ ] Monitor for issues
- [ ] Provide migration support
- [ ] Collect community feedback
- [ ] Plan optimizations

---

## Migration Impact Analysis

### Files Affected

**High Impact (Many changes required):**
- Commands using reminders (all reminder commands)
- Services depending on ReminderService
- Event handlers checking reminders
- Scheduled tasks for reminders

**Medium Impact (Some changes):**
- Utility functions using reminders
- Test files for reminder functionality
- Documentation files

**Low Impact (Few/no changes):**
- Core bot infrastructure
- Unrelated commands
- Configuration files
- Build scripts

### Time Estimates

| Task | Time | Difficulty |
|------|------|-----------|
| Audit code | 1 hour | Low |
| Create migration plan | 2 hours | Low |
| Update imports | 1 hour | Low |
| Add guild context | 3-5 hours | Medium |
| Update tests | 2-3 hours | Medium |
| Testing & verification | 2 hours | Low |
| Code review | 1 hour | Low |
| **TOTAL** | **12-15 hours** | Medium |

---

## Example: Before and After

### Example 1: Add Reminder Command

**BEFORE (v3.6.0 - With ReminderService):**
```javascript
const reminderService = require('../services/ReminderService');

async function addReminder(interaction) {
  try {
    const text = interaction.options.getString('text');
    const author = interaction.user.username;
    
    const reminder = await reminderService.createReminder(text, author);
    
    await interaction.reply(`✅ Reminder added: #${reminder.id}`);
  } catch (error) {
    await interaction.reply('❌ Failed to add reminder');
  }
}
```

**AFTER (v3.7.0 - Guild-Aware Only):**
```javascript
const GuildAwareReminderService = require('../services/GuildAwareReminderService');

async function addReminder(interaction) {
  try {
    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    const text = interaction.options.getString('text');
    const duration = interaction.options.getInteger('duration', true); // in seconds
    
    const dueDate = new Date(Date.now() + (duration * 1000));
    
    const reminder = await GuildAwareReminderService.createReminder(
      guildId,
      userId,
      text,
      dueDate
    );
    
    await interaction.reply(`✅ Reminder added: #${reminder.id}`);
  } catch (error) {
    await interaction.reply('❌ Failed to add reminder');
  }
}
```

**Changes:**
- ✅ Add guild context (`guildId`)
- ✅ Add user context (`userId`)
- ✅ Add timing (`dueDate`)
- ✅ Remove author (determined by `userId`)
- ✅ Better error handling

### Example 2: List Reminders Command

**BEFORE (v3.6.0):**
```javascript
async function listReminders(interaction) {
  const reminders = await reminderService.getAllReminders();
  
  if (!reminders.length) {
    return interaction.reply('No reminders found');
  }
  
  const list = reminders
    .map((r, i) => `${i + 1}. ${r.subject}`)
    .join('\n');
  
  await interaction.reply(`**Reminders:**\n${list}`);
}
```

**AFTER (v3.7.0):**
```javascript
async function listReminders(interaction) {
  const guildId = interaction.guildId;
  
  const reminders = await GuildAwareReminderService.getAllReminders(guildId);
  
  if (!reminders.length) {
    return interaction.reply('No reminders found');
  }
  
  const list = reminders
    .map((r, i) => `${i + 1}. ${r.subject}`)
    .join('\n');
  
  await interaction.reply(`**Reminders:**\n${list}`);
}
```

**Changes:**
- ✅ Add guild context to get call
- ✅ Rest of code stays the same
- ✅ Automatic filtering by guild

---

## Known Issues & Solutions

### Issue 1: "Cannot find module 'ReminderService'"
**When:** After updating to v3.7.0  
**Cause:** ReminderService was deleted  
**Solution:** Use GuildAwareReminderService with guild context

### Issue 2: "Reminder not found" after migration
**When:** During migration testing  
**Cause:** Guild context mismatch  
**Solution:** Verify correct `guildId` is passed to all calls

### Issue 3: "Tests fail with new guild-aware calls"
**When:** After migrating command code  
**Cause:** Tests still use old mocks  
**Solution:** Update test mocks to include `guildId` parameter

### Issue 4: "Memory usage increase with many guilds"
**When:** Production deployment with 100+ guilds  
**Cause:** Per-guild databases in memory  
**Solution:** Implement database connection pooling (planned for v3.8.0)

---

## Support Resources

### Documentation
- [GUILD-AWARE-MIGRATION-GUIDE.md](GUILD-AWARE-MIGRATION-GUIDE.md) - Detailed migration steps
- [PHASE-6-PLANNING.md](PHASE-6-PLANNING.md) - Architecture overview
- [Copilot Instructions](/.github/copilot-instructions.md) - Development guidelines

### Code Examples
- `src/services/GuildAwareReminderService.js` - Implementation reference
- `tests/unit/services/test-phase-6-guild-aware-integration.test.js` - Usage examples
- Command examples in `src/commands/` - Real-world usage

### Getting Help
1. Check the migration guide examples
2. Review the Phase 6 documentation
3. Look at existing guild-aware command implementations
4. Check test files for patterns

---

## Frequently Asked Questions

### Q: Can I skip this migration?
**A:** No. ReminderService is removed in v3.7.0. Migration is mandatory for upgrading.

### Q: How long does migration take?
**A:** Typically 12-15 hours for a complete codebase. Depends on reminder usage scope.

### Q: Will old reminders still work?
**A:** Yes. Data is preserved. Only code needs updating.

### Q: Can I run both systems in parallel?
**A:** Yes, during v3.6.0. The wrapper is still available for compatibility.

### Q: What if I find issues during migration?
**A:** Report them with examples. Support will help troubleshoot.

### Q: Can I roll back to v3.6.0?
**A:** Yes, but then you can't upgrade further. Migration to v3.7.0+ is required for future updates.

---

## Success Criteria for v3.7.0 Release

- ✅ All reminder code migrated to guild-aware services
- ✅ All tests passing (100% pass rate)
- ✅ Guild isolation verified
- ✅ Multi-guild scenarios tested
- ✅ Error handling verified
- ✅ Documentation complete
- ✅ Zero regressions
- ✅ Performance acceptable

---

## Post-Removal Architecture (v3.7.0+)

After removal, the reminder system will look like:

```
Discord Events
    ↓
Reminder Commands (Guild-Aware)
    ↓
GuildAwareReminderService (CRUD)
    ↓
GuildAwareReminderNotificationService (Delivery)
    ↓
GuildDatabaseManager (Routing)
    ↓
Per-Guild SQLite Databases
    ↓
Discord API (Send reminders)
```

**Benefits:**
- ✅ Clean, simple architecture
- ✅ Perfect guild isolation
- ✅ Scalable to 100+ guilds
- ✅ Maintainable codebase
- ✅ Production-ready

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 19, 2026 | Initial roadmap created |

---

**Status:** Ready for v3.7.0 Release  
**Maintained by:** GitHub Copilot  
**Related:** [GUILD-AWARE-MIGRATION-GUIDE.md](GUILD-AWARE-MIGRATION-GUIDE.md)
