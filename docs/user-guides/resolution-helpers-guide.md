# Resolution Helpers Guide

## Overview

The bot now supports automatic resolution of channel names, user names, and role names across all commands. This means you no longer need to copy channel IDs - just use the channel name!

## Supported Input Formats

### Channels

The `/broadcast` and `/embed` commands now accept channels in multiple formats:

```
✅ Channel name:     writing-corner, announcements, general
✅ Channel ID:       123456789012345678
✅ Channel mention:  #writing-corner, #announcements
✅ Partial match:    "writing" (if only one channel matches)
```

**Examples:**

```
/broadcast message: "Hello!" channels: "writing-corner, #announcements, general"
/embed channel: "writing-corner" title: "Title" description: "Description"
/embed channel: "#announcements" title: "Title" description: "Description"
/embed channel: "123456789012345678" title: "Title" description: "Description"
```

### Users

When commands ask for users, you can use:

```
✅ Username:        john, jane_doe, bot-name
✅ User ID:         123456789012345678
✅ User mention:    @john, @jane_doe, <@123456789012345678>
✅ Partial match:   "john" (if only one user matches)
```

### Roles

When commands ask for roles, you can use:

```
✅ Role name:       admin, moderator, member
✅ Role ID:         123456789012345678
✅ Role mention:    @admin, <@&123456789012345678>
✅ Partial match:   "admin" (if only one role matches)
```

## How It Works

### Resolution Order

The helpers search in this order (fastest first):

1. **Exact ID Match** - If input is all numbers, tries as ID
2. **Mention Match** - If input looks like a mention, extracts the ID
3. **Exact Name Match** - Finds exact name match (case-insensitive)
4. **Fuzzy Match** - Finds partial/containing match (returns if exactly 1 match)

### Resolution Helpers

Located in: `src/utils/helpers/resolution-helpers.js`

```javascript
// Single resolution
const channel = await resolveChannel('writing-corner', guild);
const user = await resolveUser('john', client);
const role = await resolveRole('admin', guild);

// Bulk resolution
const channels = await resolveChannels(['chan1', 'chan2', 'chan3'], guild);
const users = await resolveUsers(['user1', 'user2'], client);
const roles = await resolveRoles(['role1', 'role2'], guild);

// Results include resolved items and failed items
console.log(channels.resolved); // Channel objects that were found
console.log(channels.failed); // Input strings that couldn't be resolved
```

## Usage in Commands

### Example: Using in a New Command

```javascript
const { resolveChannel, resolveUser } = require('../../utils/helpers/resolution-helpers');

// In your command execute function:
async executeInteraction(interaction) {
  const channelInput = interaction.options.getString('channel');
  const channel = await resolveChannel(channelInput, interaction.guild);

  if (!channel) {
    return sendError(interaction, `Channel "${channelInput}" not found`, true);
  }

  // Now use channel...
  await channel.send('Hello!');
}
```

## Updated Commands

These commands now support automatic resolution:

- **`/broadcast`** - Use channel names instead of IDs
- **`/embed`** - Use channel names instead of IDs

### Before (Old Way)

```
/embed channel: "1234567890123456789" title: "Title" description: "Description"
```

### After (New Way - Much Easier!)

```
/embed channel: "writing-corner" title: "Title" description: "Description"
/embed channel: "#announcements" title: "Title" description: "Description"
```

## Error Handling

When a name can't be resolved:

```
❌ "Could not find channel: invalid-name. Try using the channel name or ID."
```

**What to do:**

1. Double-check the spelling
2. Make sure the channel exists in your server
3. Make sure the bot can see the channel
4. Try using the exact channel ID as fallback

## Benefits

| Before                         | After                              |
| ------------------------------ | ---------------------------------- |
| `/embed channel: "1234567890"` | `/embed channel: "writing-corner"` |
| Must copy channel IDs          | Use friendly names                 |
| Hard to remember               | Intuitive                          |
| Error-prone                    | Fuzzy matching helps               |
| User mentions needed IDs       | Works with names/mentions          |

## Advanced: Partial Matches

If you type an ambiguous partial name, the command fails:

```
❌ "Could not find channel: w. Try using the channel name or ID."
Reason: Multiple channels start with "w": #writing-corner, #welcome
```

**Solution:** Use a more specific name:

```
✅ /embed channel: "writing-corner"
```

## Notes

- **Case-insensitive** - "Writing-Corner" = "writing-corner" = "WRITING-CORNER"
- **Spaces optional** - Usually, you can omit # symbol
- **Guild-specific** - Only channels/roles/users in current server
- **Caching** - User lookups fetch from Discord if needed
- **Performance** - ID lookups are fastest (no search needed)

## Future Enhancements

These helpers can be extended to support:

- Multiple commands (more admin commands)
- User DM delivery
- Role management commands
- Permission-based filtering

---

For more info, see: `src/utils/helpers/resolution-helpers.js`
