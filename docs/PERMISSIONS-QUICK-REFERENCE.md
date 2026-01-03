# Permissions Quick Reference

## 🎯 Quick Lookup

### All Commands by Permission Level

#### 🔴 Administrator Required
```
/broadcast       - Send to multiple channels
/say            - Bot sends in channel
/whisper        - Send DMs to users/roles (respects opt-in)
/embed          - Send formatted embeds
/proxy-config   - Configure webhook proxy
/proxy-enable   - Toggle message proxy
/proxy-status   - View proxy settings
/update-quote   - Modify existing quote
/delete-quote   - Remove quote
```

#### 🟢 No Permissions Required
```
/add-quote               - Create new quote
/quote                   - Get quote by ID
/list-quotes             - All quotes in DM
/random-quote            - Random quote
/search-quotes           - Search quotes
/quote-stats             - Database statistics
/rate-quote              - Rate quotes
/tag-quote               - Tag quotes
/export-quotes           - Export JSON/CSV
/create-reminder         - Schedule reminder
/get-reminder            - View reminder
/list-reminders          - All user reminders
/search-reminders        - Filter reminders
/update-reminder         - Modify reminder
/delete-reminder         - Cancel reminder
/opt-in                  - Enable DMs
/opt-out                 - Disable DMs
/comm-status             - View DM preference
/opt-in-request          - Request user opt-in (admin only)
/ping                    - Bot latency
/hi                      - Greeting
/help                    - Show commands
/poem                    - Generate poem
```

---

## 📋 Command Stack Permissions

### Admin Stack (7 commands)
- **All require:** `Administrator` permission
- **Bot needs:** `SEND_MESSAGES`, `EMBED_LINKS`, `ATTACH_FILES`
- **Special:** `/whisper` respects user opt-in status

### Quote Management Stack (5 commands)
- `/add-quote`, `/quote`, `/list-quotes` - No permissions
- `/update-quote`, `/delete-quote` - Require `Administrator`
- **Bot needs:** `SEND_MESSAGES`, `EMBED_LINKS`

### Quote Discovery Stack (3 commands)
- **All require:** Nothing
- **Bot needs:** `SEND_MESSAGES`, `EMBED_LINKS`

### Quote Social Stack (2 commands)
- **All require:** Nothing
- **Bot needs:** `SEND_MESSAGES`, `EMBED_LINKS`

### Quote Export Stack (1 command)
- `/export-quotes` - No permissions required
- **Bot needs:** `SEND_MESSAGES`, `ATTACH_FILES`

### Reminder Management Stack (6 commands)
- **All require:** Nothing (own reminders only)
- **Bot needs:** `SEND_MESSAGES`, `EMBED_LINKS`
- **Special:** Respects user opt-in for DM notifications

### User Preferences Stack (4 commands)
- `/opt-in`, `/opt-out`, `/comm-status` - Self-managed
- `/opt-in-request` - Requires `Administrator`
- **Bot needs:** `SEND_MESSAGES`

### Miscellaneous Stack (4 commands)
- **All require:** Nothing
- **Bot needs:** `SEND_MESSAGES`, `EMBED_LINKS` (for `/help`)

---

## 🤖 Bot Permissions Checklist

### Essential (Always Required)
- ✅ `SEND_MESSAGES` - Reply to commands
- ✅ `READ_MESSAGE_HISTORY` - View message history
- ✅ `EMBED_LINKS` - Format command responses
- ✅ `ATTACH_FILES` - Export quotes
- ✅ `ADD_REACTIONS` - Pagination controls
- ✅ `MANAGE_MESSAGES` - Clean up reactions

### Optional
- ⚠️ `MANAGE_WEBHOOKS` - Only if proxy enabled
- ⚠️ `MENTION_EVERYONE` - Not currently used

### Invite URL with All Permissions
```
https://discord.com/api/oauth2/authorize?
  client_id=YOUR_CLIENT_ID
  &scope=bot%20applications.commands
  &permissions=414565652
```

---

## 🔐 Two Tier Permission System

### Tier 1: Discord Administrator
```
Used for: Dangerous server-wide actions
Check: interaction.member.permissions.has('Administrator')
Scope: Server-level
```

Commands: `/broadcast`, `/say`, `/whisper`, `/embed`, `/proxy-*`, `/update-quote`, `/delete-quote`

### Tier 2: User Opt-In
```
Used for: Controlling DM communications
Check: CommunicationService.isOptedIn(userId)
Scope: Per-user basis
```

Protected by: `/whisper` (respects opt-in), Reminder DMs, `/list-quotes`

---

## ⚙️ Configuration

### Required Environment Variables
```env
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_client_id
```

### Optional Permission Configuration
```env
# Override Administrator check with specific roles
ADMIN_ROLE_IDS=role_id_1,role_id_2

# Super-admin users (bypass all checks)
PRIVILEGED_USER_IDS=user_id_1,user_id_2

# Required for role-based reminders
REMINDER_NOTIFICATION_CHANNEL=channel_id
```

---

## 🚀 Invite Bot to Server

1. Go to Discord Developer Portal
2. Select your application
3. Go to OAuth2 → URL Generator
4. Select scopes: `bot` + `applications.commands`
5. Select permissions: Check all listed in "Essential" above
6. Copy generated URL and share with server

**Or use direct URL:**
```
https://discord.com/api/oauth2/authorize?
  client_id=YOUR_CLIENT_ID
  &scope=bot%20applications.commands
  &permissions=414565652
```

---

## 📊 Permission Statistics

- **Total Commands:** 32
- **Admin-only:** 8 (25%)
- **Public:** 24 (75%)
- **Opt-in Protected:** 3 (9%)
- **Bot Permissions Required:** 8 flags
- **Discord Administrator Checks:** 8 commands

---

## 🔍 Debugging Permissions

### Command fails with "not admin"
- User doesn't have `Administrator` role
- Or set `ADMIN_ROLE_IDS` to specific role and user doesn't have that role

### Bot can't send messages
- Bot missing `SEND_MESSAGES` permission in channel
- Channel permissions deny bot access
- Use `/say` to test bot sending ability

### DMs fail to send
- User has DMs disabled in privacy settings
- User opted out with `/opt-out`
- Bot blocked/missing permissions
- User left server (for `/whisper`)

### Permission checking code patterns
```javascript
// Admin check
if (!checkAdminPermission(interaction)) { /* error */ }

// Bot permission check
if (!channel.permissionsFor(bot.user).has('SendMessages')) { /* error */ }

// Opt-in check
const optedIn = await CommunicationService.isOptedIn(userId);
```

---

## 📚 Full Documentation

For detailed information, see [PERMISSIONS-OVERVIEW.md](PERMISSIONS-OVERVIEW.md)
