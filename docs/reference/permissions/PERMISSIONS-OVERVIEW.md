# VeraBot 2.0 - Permissions Overview

## Overview

VeraBot 2.0 implements a tiered permission system combining Discord's native permission flags with user/role assignment for targeted features. This document provides a complete breakdown of required permissions by command module/stack.

---

## Table of Contents

1. [Discord Bot Permissions](#discord-bot-permissions) - Bot account requirements
2. [User Permissions by Command Stack](#user-permissions-by-command-stack) - Per-command requirements
3. [Permission Model](#permission-model) - How permissions work
4. [Configuration](#configuration) - Setting up permissions
5. [Permission Checks](#permission-checks) - Implementation patterns

---

## Discord Bot Permissions

### Required Permissions (All Scopes)

The following permissions must be granted to the bot account in the Discord Developer Portal:

| Permission                  | Discord Flag               | Purpose                            | Required |
| --------------------------- | -------------------------- | ---------------------------------- | -------- |
| Read Messages/View Channels | `VIEW_CHANNEL`             | Access guild channels and messages | ✅ Yes   |
| Send Messages               | `SEND_MESSAGES`            | Post messages in channels          | ✅ Yes   |
| Read Message History        | `READ_MESSAGE_HISTORY`     | Fetch message history for commands | ✅ Yes   |
| Add Reactions               | `ADD_REACTIONS`            | React to messages (pagination)     | ✅ Yes   |
| Use Slash Commands          | `USE_APPLICATION_COMMANDS` | Execute slash commands             | ✅ Yes   |
| Embed Links                 | `EMBED_LINKS`              | Send formatted embeds              | ✅ Yes   |
| Attach Files                | `ATTACH_FILES`             | Upload files (export quotes)       | ✅ Yes   |
| Manage Messages             | `MANAGE_MESSAGES`          | Remove reactions (pagination)      | ✅ Yes   |

### Optional Bot Permissions

These permissions are only needed if specific features are enabled:

| Permission              | Purpose            | Feature                  | Default                  |
| ----------------------- | ------------------ | ------------------------ | ------------------------ |
| Manage Webhooks         | `MANAGE_WEBHOOKS`  | Message proxy forwarding | ❌ Only if proxy enabled |
| Mention @everyone/@here | `MENTION_EVERYONE` | Broadcast to all users   | ❌ Not used currently    |

### OAuth2 Scopes Required

When inviting the bot, ensure these scopes are selected:

```
bot                     # Standard bot scope
applications.commands  # Slash commands
```

### Bot Invite URL

```
https://discord.com/api/oauth2/authorize?
  client_id=YOUR_CLIENT_ID
  &scope=bot%20applications.commands
  &permissions=414565652
```

**Permissions Value: 414565652** (includes all required permissions above)

---

## User Permissions by Command Stack

### 1. Admin Commands Stack

**Location:** `src/commands/admin/`

**User Permission Required:** Discord `Administrator` flag

All admin commands enforce administrator-only access. Non-admin users receive:

```
❌ You need admin permissions to use this command
```

#### Commands in This Stack:

| Command         | File               | Purpose                            | Bot Permissions                    |
| --------------- | ------------------ | ---------------------------------- | ---------------------------------- |
| `/broadcast`    | `broadcast.js`     | Send message to multiple channels  | `SEND_MESSAGES` per channel        |
| `/say`          | `say.js`           | Have bot send message in a channel | `SEND_MESSAGES` in target channel  |
| `/whisper`      | `whisper.js`       | Send DMs to users/roles            | `SEND_MESSAGES` (DM) + user opt-in |
| `/embed`        | `embed-message.js` | Send formatted embed in channel    | `SEND_MESSAGES`, `EMBED_LINKS`     |
| `/proxy-config` | `proxy-config.js`  | Configure webhook proxy            | Database write                     |
| `/proxy-enable` | `proxy-enable.js`  | Enable/disable proxy               | Database write                     |
| `/proxy-status` | `proxy-status.js`  | View proxy configuration           | Database read                      |

#### Permission Checks:

```javascript
// All admin commands follow this pattern:
if (!checkAdminPermission(interaction)) {
  return sendError(interaction, 'You need admin permissions to use this command', true);
}

// Plus per-command bot permission checks:
if (!channel.permissionsFor(interaction.client.user).has('SendMessages')) {
  return sendError(interaction, "I don't have permission to send messages in that channel", true);
}
```

---

### 2. Quote Management Stack

**Location:** `src/commands/quote-management/`

**User Permission Required:** None (except `delete-quote` and `update-quote` require `Administrator`)

#### Commands in This Stack:

| Command         | File              | Permissions     | Purpose                    |
| --------------- | ----------------- | --------------- | -------------------------- |
| `/add-quote`    | `add-quote.js`    | None            | Add new quote to database  |
| `/quote`        | `quote.js`        | None            | Get specific quote by ID   |
| `/list-quotes`  | `list-quotes.js`  | None            | Get all quotes (via DM)    |
| `/update-quote` | `update-quote.js` | `Administrator` | Modify existing quote      |
| `/delete-quote` | `delete-quote.js` | `Administrator` | Remove quote from database |

#### Permission Details:

```javascript
// update-quote.js - Admin only
if (!interaction.member.permissions.has('ADMINISTRATOR')) {
  return sendError(interaction, 'You need admin permissions to use this command', true);
}

// add-quote.js - No permission check
// Anyone can add quotes
```

#### Bot Permissions Needed:

- `SEND_MESSAGES` - Send quote embeds
- `EMBED_LINKS` - Format quote displays
- `ADD_REACTIONS` - Pagination controls (not used by default)

---

### 3. Quote Discovery Stack

**Location:** `src/commands/quote-discovery/`

**User Permission Required:** None

#### Commands in This Stack:

| Command          | File               | Purpose                        |
| ---------------- | ------------------ | ------------------------------ |
| `/random-quote`  | `random-quote.js`  | Get random quote from database |
| `/search-quotes` | `search-quotes.js` | Search quotes by text/author   |
| `/quote-stats`   | `quote-stats.js`   | View quote database statistics |

#### Permission Model:

```
No user permissions required
No special bot permissions beyond basic SEND_MESSAGES
```

#### Bot Permissions Needed:

- `SEND_MESSAGES` - Reply with quotes
- `EMBED_LINKS` - Format displays

---

### 4. Quote Social Stack

**Location:** `src/commands/quote-social/`

**User Permission Required:** None

#### Commands in This Stack:

| Command       | File            | Purpose                     |
| ------------- | --------------- | --------------------------- |
| `/rate-quote` | `rate-quote.js` | Rate quotes 1-5 stars       |
| `/tag-quote`  | `tag-quote.js`  | Add tags to organize quotes |

#### Permission Model:

```
No user permissions required
Any user can rate/tag any quote
```

#### Bot Permissions Needed:

- `SEND_MESSAGES` - Confirmation messages
- `EMBED_LINKS` - Display rating/tag results

---

### 5. Quote Export Stack

**Location:** `src/commands/quote-export/`

**User Permission Required:** None

#### Commands in This Stack:

| Command          | File               | Purpose                       |
| ---------------- | ------------------ | ----------------------------- |
| `/export-quotes` | `export-quotes.js` | Export all quotes as JSON/CSV |

#### Permission Model:

```
No user permissions required
Any user can export quotes
```

#### Bot Permissions Needed:

- `SEND_MESSAGES` - Send file
- `ATTACH_FILES` - Upload JSON/CSV file

---

### 6. Reminder Management Stack

**Location:** `src/commands/reminder-management/`

**User Permission Required:** None

#### Commands in This Stack:

| Command             | File                  | Purpose                        |
| ------------------- | --------------------- | ------------------------------ |
| `/create-reminder`  | `create-reminder.js`  | Schedule reminder notification |
| `/get-reminder`     | `get-reminder.js`     | View specific reminder         |
| `/list-reminders`   | `list-reminders.js`   | View all user reminders        |
| `/search-reminders` | `search-reminders.js` | Search reminders by filters    |
| `/update-reminder`  | `update-reminder.js`  | Modify reminder settings       |
| `/delete-reminder`  | `delete-reminder.js`  | Cancel reminder                |

#### Permission Model:

```
No user permissions required
Users can only manage their own reminders
```

#### Bot Permissions Needed:

- `SEND_MESSAGES` - Send reminder notifications
- `EMBED_LINKS` - Format reminder displays
- `READ_MESSAGE_HISTORY` - Track notification status

#### Note on Notification Delivery:

Reminders can notify users via:

1. **Direct Message (DM)** - If user has opted in to communications
2. **Channel Message** - In configured notification channel (if role-based)

The `REMINDER_NOTIFICATION_CHANNEL` environment variable specifies where role-based reminders post.

---

### 7. User Preferences Stack

**Location:** `src/commands/user-preferences/`

**User Permission Required:** None

#### Commands in This Stack:

| Command           | File                | Purpose                        | Enforces           |
| ----------------- | ------------------- | ------------------------------ | ------------------ |
| `/opt-in`         | `opt-in.js`         | Enable DM notifications        | User opt-in system |
| `/opt-out`        | `opt-out.js`        | Disable DM notifications       | User opt-in system |
| `/comm-status`    | `comm-status.js`    | View communication preferences | User opt-in system |
| `/opt-in-request` | `opt-in-request.js` | Request user opt-in (admin)    | User opt-in system |

#### Permission Model:

```
No user permissions required
/opt-in, /opt-out: User manages their own preference
/comm-status: User views their own status
/opt-in-request: Admin can request users opt-in
```

#### Opt-In System Details:

The opt-in system prevents unsolicited DMs to users. When a user opts out:

- ❌ Admin `/whisper` commands skip the user with "(opted out of DMs)"
- ❌ Reminders don't send DMs (fall back to channel notification)
- ❌ Other DM-sending features check opt-in status

---

### 8. Miscellaneous Stack

**Location:** `src/commands/misc/`

**User Permission Required:** None

#### Commands in This Stack:

| Command | File      | Purpose                          |
| ------- | --------- | -------------------------------- |
| `/ping` | `ping.js` | Check bot latency                |
| `/hi`   | `hi.js`   | Friendly greeting                |
| `/help` | `help.js` | Show available commands          |
| `/poem` | `poem.js` | Generate AI poem via HuggingFace |

#### Permission Model:

```
No user permissions required
No permission checks at all
```

#### Bot Permissions Needed:

- `SEND_MESSAGES` - Reply to commands
- `EMBED_LINKS` - Format help display (pagination)

---

## Permission Model

### Two-Tier System

VeraBot implements two complementary permission models:

#### Tier 1: Discord Administrator Permission

**For:** Admin commands that affect server-wide settings
**Check:** `interaction.member.permissions.has(PermissionFlagsBits.Administrator)`
**Scope:** Server-level (administrator role required)

```javascript
const PermissionFlagsBits = require('discord.js').PermissionFlagsBits;

function checkAdminPermission(interaction) {
  try {
    if (!interaction.member) {
      return false;
    }
    return interaction.member.permissions.has(PermissionFlagsBits.Administrator);
  } catch (err) {
    console.error('Error checking admin permission:', err);
    return false;
  }
}
```

#### Tier 2: User Opt-In System

**For:** Communication preferences (DMs, notifications)
**Check:** `CommunicationService.isOptedIn(userId)`
**Scope:** Per-user (self-managed)

```javascript
const CommunicationService = require('../../services/CommunicationService');

// Before sending DM to user:
const optedIn = await CommunicationService.isOptedIn(user.id);
if (!optedIn) {
  // Skip this user, mark as failed
  results.failed.push(`${user.username} (opted out of DMs)`);
  continue;
}
```

### Command Permission Enforcement Flow

```
User executes command
    ↓
Check if admin-only?
    ↓ Yes → Verify Administrator permission
    ↓        ↓
    ↓     Allowed? → Continue
    ↓        ↓
    ↓     Denied? → Return error, stop
    ↓
No → Verify opt-in status (if sending DMs)
    ↓
    ├─ Opted in? → Send message
    └─ Opted out? → Skip user, mark failed
```

---

## Configuration

### Environment Variables for Permissions

**File:** `.env`

```env
# Discord Bot Settings
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here

# Admin Configuration
# Optional: Role IDs that can execute admin commands (if set, overrides Administrator check)
ADMIN_ROLE_IDS=

# Optional: User IDs that bypass all permission checks (super-admin)
PRIVILEGED_USER_IDS=

# Reminder Notifications
# Required for role-based reminder notifications
REMINDER_NOTIFICATION_CHANNEL=

# Feature Flags
ENABLE_ADMIN_COMMANDS=true        # Enable/disable all admin commands
ENABLE_REMINDER_NOTIFICATIONS=true # Enable/disable reminder features
```

### Discord Server Setup

#### 1. Create Admin Role (Optional)

If you want to limit admin commands to a specific role instead of all administrators:

1. Create a "Bot Admin" or "Moderator" role
2. Set `ADMIN_ROLE_IDS=` to that role ID in `.env`
3. Only users with that role can run admin commands

**Current Behavior:** If `ADMIN_ROLE_IDS` is empty, uses Discord's `Administrator` permission

#### 2. Create Notification Channel (For Reminders)

For role-based reminder notifications:

1. Create channel: `#reminders` or similar
2. Set `REMINDER_NOTIFICATION_CHANNEL=` to that channel ID
3. Role-based reminders post there instead of DM

#### 3. Bot Role Permissions

In Discord Server Settings → Roles → Bot Role:

✅ **Enable:**

- View Channels
- Send Messages
- Read Message History
- Add Reactions
- Embed Links
- Attach Files
- Manage Messages

❌ **Disable:**

- Administrator (not needed)
- Manage Server (not needed)
- Manage Webhooks (only if proxy not used)

---

## Permission Checks

### Implementation Patterns

#### Pattern 1: Admin Command

```javascript
const { checkAdminPermission } = require('../../utils/proxy-helpers');
const { sendError, sendSuccess } = require('../../utils/helpers/response-helpers');

async executeInteraction(interaction) {
  // 1. Check admin permission first
  const isAdmin = checkAdminPermission(interaction);
  if (!isAdmin) {
    return sendError(interaction, 'You need admin permissions to use this command', true);
  }

  // 2. Perform admin action
  // ... command logic ...

  await sendSuccess(interaction, 'Action completed');
}
```

#### Pattern 2: Command with Bot Permission Check

```javascript
async executeInteraction(interaction) {
  const channel = interaction.options.getChannel('channel');

  // Check if bot can send messages in that channel
  if (channel.guild && !channel.permissionsFor(interaction.client.user).has('SendMessages')) {
    return sendError(
      interaction,
      'I don\'t have permission to send messages in that channel',
      true
    );
  }

  // Proceed with command
  await channel.send('Hello!');
}
```

#### Pattern 3: User Opt-In Check (Before DM)

```javascript
const CommunicationService = require('../../services/CommunicationService');

async sendDMToUsers(users, messageContent, results) {
  for (const user of users) {
    try {
      // Check if user opted in to receive DMs
      const optedIn = await CommunicationService.isOptedIn(user.id);
      if (!optedIn) {
        results.failed.push(`${user.username} (opted out of DMs)`);
        continue;
      }

      // Send DM
      await user.send(messageContent);
      results.success.push(user.username);
    } catch (err) {
      results.failed.push(`${user.username} (${err.message})`);
    }
  }
}
```

#### Pattern 4: User-Specific Data Access

```javascript
async executeInteraction(interaction) {
  // Only allow users to view their own reminders
  const userId = interaction.user.id;
  const reminders = await ReminderService.getRemindersForUser(userId);

  // Send result
  await sendSuccess(interaction, `Found ${reminders.length} reminders`);
}
```

---

## Summary Table

### Permission Requirements by Module

| Module           | Command Count | Admin Required       | Bot Permissions                 | Opt-In Check    |
| ---------------- | ------------- | -------------------- | ------------------------------- | --------------- |
| Admin            | 7             | ✅ Yes               | Varies                          | No              |
| Quote Management | 5             | 2/5 (delete, update) | `SEND_MESSAGES`, `EMBED_LINKS`  | No              |
| Quote Discovery  | 3             | ❌ No                | `SEND_MESSAGES`, `EMBED_LINKS`  | No              |
| Quote Social     | 2             | ❌ No                | `SEND_MESSAGES`, `EMBED_LINKS`  | No              |
| Quote Export     | 1             | ❌ No                | `SEND_MESSAGES`, `ATTACH_FILES` | No              |
| Reminder         | 6             | ❌ No                | `SEND_MESSAGES` (DM/channel)    | ✅ Yes (for DM) |
| User Preferences | 4             | 1/4 (opt-in-request) | `SEND_MESSAGES`                 | N/A             |
| Misc             | 4             | ❌ No                | `SEND_MESSAGES`, `EMBED_LINKS`  | No              |
| **TOTAL**        | **32**        | **8 commands**       | **Required: 5 core**            | **4 commands**  |

---

## Common Permission Questions

### Q: Can I restrict admin commands to a specific role?

**A:** Yes. Set `ADMIN_ROLE_IDS` in `.env`:

```env
ADMIN_ROLE_IDS=123456789012345678,987654321098765432
```

Only users with those role IDs can run admin commands.

### Q: What permissions does the bot need in Discord?

**A:** Invite with this URL (includes all required perms):

```
https://discord.com/api/oauth2/authorize?client_id=YOUR_ID&scope=bot%20applications.commands&permissions=414565652
```

### Q: How do users opt-in/out of DMs?

**A:** Users run commands in your server:

```
/opt-in           # Enable DMs
/opt-out          # Disable DMs
/comm-status      # Check current status
```

### Q: Can admins force users to opt-in?

**A:** No. Only the user can opt-in. Admins can:

- Request opt-in: `/opt-in-request`
- Send whisper only to opted-in users
- Fall back to channel notifications for reminders

### Q: What if the bot can't send a message?

**A:** Commands check permissions and return helpful errors:

```
❌ I don't have permission to send messages in that channel
❌ User has DMs disabled
❌ Channel is not text-based
```

### Q: Which commands need which bot permissions?

See the table in each command stack section above.

---

## Related Documentation

- [PERMISSION-MODEL.md](PERMISSION-MODEL.md) - Detailed permission architecture
- [SECURITY.md](SECURITY.md) - Security best practices
- [guides/06-ADMIN-COMMUNICATION-COMMANDS.md](guides/06-ADMIN-COMMUNICATION-COMMANDS.md) - Admin command usage
- [guides/04-REMINDER-SYSTEM.md](guides/04-REMINDER-SYSTEM.md) - Reminder system (with opt-in)
