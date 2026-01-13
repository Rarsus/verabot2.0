# Role-Based Permission System - Phase 2 Quick Update Guide

**For updating remaining 29 commands**

---

## One-Minute Overview

All 29 remaining commands need **the same 3 changes**:

1. Add `permissions` object to constructor
2. Add permission check to `executeInteraction()`
3. Done! (CommandBase handles the rest)

---

## Copy-Paste Template

### Step 1: Update Constructor

**BEFORE:**

```javascript
constructor() {
  super({ name: 'cmdname', description: 'Description', data, options });
}
```

**AFTER:**

```javascript
constructor() {
  super({
    name: 'cmdname',
    description: 'Description',
    data,
    options,
    permissions: {
      minTier: 1,        // ← Adjust for command (see table below)
      visible: true      // ← Set false for hidden commands
    }
  });
}
```

### Step 2: Add Permission Check to executeInteraction()

**Add this at the START of executeInteraction() method:**

```javascript
async executeInteraction(interaction) {
  // ← ADD THESE 8 LINES (place first, before any logic)
  const permissionCheck = await this.checkPermission(
    {
      userId: interaction.user.id,
      guildId: interaction.guildId,
      commandName: 'cmdname'  // ← Use actual command name
    },
    interaction.client
  );

  if (!permissionCheck.allowed) {
    return sendError(interaction, `Permission denied: ${permissionCheck.reason}`, true);
  }

  // Rest of existing code...
}
```

---

## Tier Reference

Use this to pick the right minTier for each command:

| Tier  | Name      | Access                   | Commands                                                                              |
| ----- | --------- | ------------------------ | ------------------------------------------------------------------------------------- |
| **0** | Guest     | Anyone in Discord        | ping, hi, poem, help, random-quote, search-quotes, add-quote, list-quotes, quote, ... |
| **1** | Member    | Users who join Discord   | (Guild members, usually tier 1 minimum)                                               |
| **2** | Moderator | Moderators (manual role) | delete-quote, update-quote, rate-quote, tag-quote                                     |
| **3** | Admin     | Server Admins            | whisper, embed-message, manage-reminders                                              |
| **4** | Owner     | Bot Owner only           | system-admin, server-stats                                                            |

---

## Commands Needing Updates (29 Total)

### Misc Commands (4)

- [ ] `hi.js` - Tier 0, Visible: true
- [ ] `help.js` - Already updated ✅
- [ ] `poem.js` - Tier 0, Visible: true
- [ ] `ping.js` - Already updated ✅

### Quote Discovery (3)

- [ ] `random-quote.js` - Tier 0, Visible: true
- [ ] `search-quotes.js` - Tier 0, Visible: true
- [ ] `quote-stats.js` - Tier 0, Visible: true

### Quote Management (5)

- [ ] `add-quote.js` - Tier 0, Visible: true
- [ ] `delete-quote.js` - Tier 2, Visible: true
- [ ] `update-quote.js` - Tier 2, Visible: true
- [ ] `list-quotes.js` - Tier 0, Visible: true
- [ ] `quote.js` - Tier 0, Visible: true

### Quote Social (2)

- [ ] `rate-quote.js` - Tier 2, Visible: true
- [ ] `tag-quote.js` - Tier 2, Visible: true

### Quote Export (1)

- [ ] `export-quotes.js` - Tier 0, Visible: true

### Admin Commands (4)

- [ ] `whisper.js` - Already updated ✅
- [ ] `embed-message.js` - Tier 3, Visible: false
- [ ] `ping-pong.js` - Tier 3, Visible: false
- [ ] `server-stats.js` - Tier 4, Visible: false

### Proxy Features (3)

- [ ] `webhook-proxy.js` - Tier 3, Visible: false
- [ ] `auto-react.js` - Tier 2, Visible: false
- [ ] `filter-proxy.js` - Tier 2, Visible: false

### Reminders (4)

- [ ] `create-reminder.js` - Tier 1, Visible: true
- [ ] `list-reminders.js` - Tier 1, Visible: true
- [ ] `delete-reminder.js` - Tier 1, Visible: true
- [ ] `manage-reminders.js` - Tier 3, Visible: false

### Utility (3)

- [ ] `command-reference.js` - Tier 0, Visible: true
- [ ] `about.js` - Tier 0, Visible: true
- [ ] `status.js` - Tier 1, Visible: true

---

## Quick Update Checklist

For each command file:

- [ ] 1. Import: `const RolePermissionService = require('../../services/RolePermissionService');`
  - Usually already imported via CommandBase, but check if needed
- [ ] 2. Find the `constructor()` method
  - Add `permissions: { minTier: X, visible: true/false }`
  - Use tier from table above
- [ ] 3. Find the `executeInteraction()` method
  - Add permission check at the very start (before any other logic)
  - Copy-paste template from above
  - Change `'cmdname'` to actual command name
- [ ] 4. Test locally if possible
  - Run `npm test` to ensure no breaking changes
  - Run `npm run lint` to check code quality
- [ ] 5. Commit when done
  - One commit per command or group of commands
  - Message format: `feat: add permission tier X to cmdname command`

---

## Example: Updating add-quote.js

### Original Code

```javascript
class AddQuoteCommand extends Command {
  constructor() {
    super({ name: 'add-quote', description: 'Add a new quote', data, options });
  }

  async execute(message, args) {
    // ...existing code...
  }

  async executeInteraction(interaction) {
    const quoteText = interaction.options.getString('quote');
    // ...rest of method...
  }
}
```

### Updated Code

```javascript
class AddQuoteCommand extends Command {
  constructor() {
    super({
      name: 'add-quote',
      description: 'Add a new quote',
      data,
      options,
      permissions: {
        minTier: 0, // ← Everyone can add quotes
        visible: true, // ← Show to all users
      },
    });
  }

  async execute(message, args) {
    // ...existing code...
  }

  async executeInteraction(interaction) {
    // ← ADD THIS BLOCK (8 lines)
    const permissionCheck = await this.checkPermission(
      {
        userId: interaction.user.id,
        guildId: interaction.guildId,
        commandName: 'add-quote',
      },
      interaction.client
    );

    if (!permissionCheck.allowed) {
      return sendError(interaction, `Permission denied: ${permissionCheck.reason}`, true);
    }

    const quoteText = interaction.options.getString('quote');
    // ...rest of existing method...
  }
}
```

---

## Batch Update Script (Optional)

To automate updates across multiple files at once:

```bash
# 1. Test first
npm test

# 2. Update one category at a time
# For example, all quote discovery commands:
# - Open each file
# - Apply the 2 changes above
# - Commit as group

# 3. Test after each group
npm test

# 4. Check lint
npm run lint
```

---

## Common Issues & Fixes

### Issue: "RolePermissionService is not defined"

**Fix:** The service is injected via CommandBase. Make sure you're calling `this.checkPermission()` (with `this.`).

### Issue: Tests failing after update

**Likely cause:** Permission check is too strict. Check the `minTier` value.  
**Fix:** Ensure test mock includes tier data in client.

### Issue: ESLint warning about complexity

**Normal:** Some commands already have high complexity.  
**Fix:** This doesn't increase complexity, so no change needed.

### Issue: Command still requires permission check but shouldn't

**Check:** Make sure you set `minTier: 0` for public commands.

---

## Recommended Update Order

### Phase 2B: Public Commands First (Lower Risk)

1. Utility commands (4 files)
2. Quote discovery commands (3 files)
3. Quote management for everyone (5 files)

### Phase 2C: Moderator/Admin Commands (Higher Restriction)

1. Quote moderation (2 files)
2. Admin-only commands (4 files)
3. Proxy features (3 files)

### Phase 2D: Reminder/Premium Commands (Special Features)

1. Reminder commands (4 files)
2. Final cleanup (1 file)

---

## Git Workflow

```bash
# For each command or group of commands:

# 1. Update the file(s)
git add src/commands/path/command.js

# 2. Test
npm test

# 3. Check lint
npm run lint

# 4. Commit
git commit -m "feat: add role-based permissions to command-name"

# 5. Push (if needed)
git push
```

---

## Verification

After updating each command:

✅ Runs without errors  
✅ `npm test` passes  
✅ `npm run lint` at/under 50 warnings  
✅ Command shows permission error if tier too low  
✅ Help command filters command visibility  
✅ Permission check happens before any side effects

---

## Questions?

Refer to:

- `docs/ROLE-IMPLEMENTATION-PHASE1.md` - Core system
- `docs/ROLE-IMPLEMENTATION-PHASE2.md` - Examples
- `src/config/roles.js` - All tier definitions
- `src/services/RolePermissionService.js` - Service API

---

**Expected Time:** ~3-5 minutes per command group  
**Total for all 29:** ~2-3 hours if done in batches  
**Effort Level:** Very low (copy-paste template + customize tier)
