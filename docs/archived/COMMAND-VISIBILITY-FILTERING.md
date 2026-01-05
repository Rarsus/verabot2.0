# Command Visibility Filtering - Implementation Guide

## Overview

**Command Visibility Filtering** allows you to hide commands from users based on their role/permission tier. This creates a cleaner, more secure user experience where admin-only commands are completely hidden from regular users.

---

## Why Visibility Filtering?

### Current Problem

```
Regular User sees in slash menu:
  /ping
  /help
  /add-quote
  /whisper          ← Should not see this!
  /embed-message    ← Should not see this!
  /manage-roles     ← Should not see this!
```

### With Visibility Filtering

```
Regular User sees in slash menu:
  /ping
  /help
  /add-quote

Admin sees in slash menu:
  /ping
  /help
  /add-quote
  /whisper          ← Hidden from regulars
  /embed-message    ← Hidden from regulars
  /manage-roles     ← Hidden from regulars
```

---

## Implementation Strategy

### Three Approaches

#### 1. **Hidden Commands** (Recommended ⭐)

Commands are completely hidden from Discord's slash menu if user lacks permission.

**Pros:**

- Clean user experience
- Users don't see commands they can't use
- Most secure approach
- No confusion about "permission denied" errors

**Cons:**

- Requires filtering at registration time
- Need to update Discord's command list per user

**Use for:** Admin commands (whisper, embed-message, manage-roles)

#### 2. **Visible but Disabled Commands**

Commands appear in menu but are grayed out/disabled.

**Pros:**

- Users know the command exists
- Clearer what features are available

**Cons:**

- Discord Slash Command permissions system is complex
- Users see what they can't access

**Use for:** Premium features, mod commands that members might want

#### 3. **Smart Help Command**

Help command dynamically lists only accessible commands.

**Pros:**

- Users can discover what they can do
- No registration changes needed

**Cons:**

- Users still see hidden commands if they know the name
- Less secure

**Use for:** Supplemental discovery (combine with Strategy 1)

---

## Configuration

### In `src/config/roles.js`

```javascript
// Command visibility settings
commands: {
  // Public commands - always visible
  'ping': {
    minTier: 0,
    visible: true    // Always shown
  },

  'help': {
    minTier: 0,
    visible: true    // Always shown
  },

  // Member commands - visible to tier 1+
  'add-quote': {
    minTier: 1,
    visible: true    // Visible to members
  },

  // Moderator commands - visible to tier 2+
  'delete-quote': {
    minTier: 2,
    visible: true    // Visible to mods
  },

  // Admin commands - completely hidden from non-admins
  'whisper': {
    minTier: 3,
    visible: false   // HIDDEN from members
  },

  'embed-message': {
    minTier: 3,
    visible: false   // HIDDEN from members
  },

  'manage-roles': {
    minTier: 4,
    visible: false   // HIDDEN from admins (owner only)
  }
}
```

### Guild-Specific Overrides

```javascript
guildOverrides: {
  'TRUSTED_SERVER_ID': {
    commands: {
      // Override visibility in specific guild
      'whisper': {
        minTier: 2,   // Allow mods to use it
        visible: true  // Show to everyone in this guild
      }
    }
  }
}
```

---

## Implementation Details

### 1. RolePermissionService Methods

```javascript
// Check if command is visible to user
await RolePermissionService.isCommandVisible(userId, guildId, 'whisper');
// Returns: false for regular users, true for admins

// Get all visible commands for user
const visible = await RolePermissionService.getVisibleCommands(userId, guildId, allLoadedCommands);
// Returns: Array of command objects user can see

// Get visible command names (for autocomplete)
const names = await RolePermissionService.getVisibleCommandNames(userId, guildId, [
  'ping',
  'help',
  'whisper',
  'embed-message',
]);
// Returns: ['ping', 'help'] for regular users
```

### 2. Slash Command Registration

Update `src/register-commands.js` or `src/utils/auto-register-commands.js`:

```javascript
const rest = new REST({ version: '10' }).setToken(token);

// Get all loaded commands
const allCommands = loadAllCommands();

// For global registration: filter visible commands for bot owner
const globalCommands = allCommands.filter((cmd) => {
  const config = features.commands[cmd.name];
  // Include all commands (we'll check visibility per-user at runtime)
  return true;
});

// Register to Discord
await rest.put(Routes.applicationCommands(clientId), {
  body: globalCommands.map((cmd) => ({
    name: cmd.name,
    description: cmd.description,
    options: cmd.options || [],
  })),
});
```

### 3. At Command Execution Time

Update `src/core/CommandBase.js`:

```javascript
async executeInteraction(interaction) {
  const { user, guildId } = interaction;

  // Check visibility
  const isVisible = await RolePermissionService.isCommandVisible(
    user.id,
    guildId,
    this.name
  );

  if (!isVisible) {
    // Pretend command doesn't exist
    await interaction.reply({
      content: 'Unknown command',
      ephemeral: true
    });
    return;
  }

  // Check permission
  const hasPermission = await RolePermissionService.canExecuteCommand(
    user.id,
    guildId,
    this.name
  );

  if (!hasPermission) {
    await sendError(
      interaction,
      `You need tier ${minTier} to use this command`,
      true
    );
    return;
  }

  // Execute command
  return await this.executeImplementation(interaction);
}
```

### 4. Help Command Enhancement

Update `src/commands/misc/help.js`:

```javascript
async executeInteraction(interaction) {
  const { user, guildId } = interaction;

  // Get all commands visible to this user
  const visibleCommands = await RolePermissionService
    .getVisibleCommands(user.id, guildId, this.allCommands);

  // Get user's tier for description
  const userTier = await RolePermissionService
    .getUserRoles(user.id, guildId);

  // Build help embed with only visible commands
  const helpEmbed = new EmbedBuilder()
    .setTitle('Available Commands')
    .setDescription(`You have access to ${visibleCommands.length} commands (Tier ${userTier})`);

  // Group by category
  const categories = this.groupCommandsByCategory(visibleCommands);

  for (const [category, commands] of Object.entries(categories)) {
    helpEmbed.addFields({
      name: category,
      value: commands.map(cmd => `**/${cmd.name}** - ${cmd.description}`).join('\n')
    });
  }

  await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
}
```

---

## User Experience Examples

### Scenario 1: Regular Member Uses /help

```
Member types: /help

Bot responds:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 Available Commands (Tier 1)

💬 QUOTES
  /add-quote - Add a new quote
  /search-quotes - Find quotes
  /rate-quote - Rate a quote

⏰ REMINDERS
  /remind - Set a reminder
  /list-reminders - View your reminders

❓ MISC
  /ping - Check bot latency
  /help - Show this message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Scenario 2: Admin Uses /help

```
Admin types: /help

Bot responds:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 Available Commands (Tier 3)

💬 QUOTES
  /add-quote - Add a new quote
  /search-quotes - Find quotes
  /rate-quote - Rate a quote
  /delete-quote - Delete a quote

⏰ REMINDERS
  /remind - Set a reminder
  /list-reminders - View all reminders
  /delete-reminder - Cancel a reminder

👮 ADMIN
  /whisper - Send DMs to users
  /embed-message - Create embeds
  /manage-roles - Configure role permissions

❓ MISC
  /ping - Check bot latency
  /help - Show this message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Scenario 3: Member Types Hidden Command

```
Member types: /whisper

Discord response:
"Unknown command"

(Command is hidden from slash menu completely)
```

---

## Performance Considerations

### Caching

Visibility checks are cached for performance:

```javascript
const cache = {
  'USER_ID:GUILD_ID': {
    tier: 1,
    timestamp: Date.now(),
    visibleCommands: ['ping', 'help', 'add-quote', ...]
  }
}

// Cache expires after 1 hour (configurable)
cacheTTL: 3600
```

### Audit Logging

All visibility checks can be logged:

```javascript
// permission_audit_log table
{
  user_id: '123456789',
  guild_id: '987654321',
  command_name: 'whisper',
  result: 'HIDDEN',  // Hidden due to tier/visibility
  user_tier: 1,
  required_tier: 3,
  timestamp: '2026-01-03 10:30:00'
}
```

---

## Testing Visibility Filtering

### Test Case 1: Regular Member

```
GIVEN a user with tier 1
WHEN they load the slash menu
THEN they see: ping, help, add-quote, search-quotes, rate-quote, remind
THEN they don't see: whisper, embed-message, manage-roles, delete-quote
```

### Test Case 2: Admin

```
GIVEN a user with tier 3
WHEN they load the slash menu
THEN they see: ALL commands
THEN specifically: whisper, embed-message, delete-quote are visible
```

### Test Case 3: Hidden Command Execution

```
GIVEN a regular member
WHEN they try /whisper (somehow)
THEN bot responds: "Unknown command"
AND permission audit log shows: HIDDEN
```

---

## Configuration Checklist

- [ ] Update `src/config/roles.js` with visibility settings
- [ ] Add `visible: true/false` to all command configs
- [ ] Update `RolePermissionService` with visibility methods
- [ ] Modify `CommandBase` to check visibility
- [ ] Enhance help command to show only visible commands
- [ ] Update command registration script to handle visibility
- [ ] Test with multiple user tiers
- [ ] Verify audit logs are recorded
- [ ] Deploy and test in Discord server

---

## Troubleshooting

### Commands Still Appear When Hidden

**Problem:** Command shows in slash menu even though `visible: false`

**Solution:**

1. Check cache wasn't stale: Restart bot or wait for cache to expire
2. Verify config file syntax in `src/config/roles.js`
3. Check registration script updated correctly
4. Ensure user's tier is correct: `/manage-roles view-permissions @user`

### Visible Commands Don't Show

**Problem:** Command set to `visible: true` but doesn't appear

**Solution:**

1. Check minimum tier meets user's tier
2. Verify command loaded successfully
3. Check guild-specific overrides aren't hiding it
4. Review audit logs for visibility checks

---

## Related Documentation

- [ROLE-BASED-PERMISSIONS-PROPOSAL.md](ROLE-BASED-PERMISSIONS-PROPOSAL.md) - Full system design
- [PERMISSIONS-MATRIX.md](PERMISSIONS-MATRIX.md) - All 32 commands permission table
- [PERMISSION-MODEL.md](PERMISSION-MODEL.md) - Permission concepts
