# VeraBot 2.0 - Complete Command Permissions Matrix

## Full Permissions Matrix

| #   | Command             | Stack           | Admin?       | Description               | Bot Permissions                | Opt-In Check   |
| --- | ------------------- | --------------- | ------------ | ------------------------- | ------------------------------ | -------------- |
| 1   | `/ping`             | Misc            | ❌           | Check bot latency         | SEND_MESSAGES                  | ❌             |
| 2   | `/hi`               | Misc            | ❌           | Friendly greeting         | SEND_MESSAGES                  | ❌             |
| 3   | `/help`             | Misc            | ❌           | Show available commands   | SEND_MESSAGES, EMBED_LINKS     | ❌             |
| 4   | `/poem`             | Misc            | ❌           | Generate AI poem          | SEND_MESSAGES                  | ❌             |
| 5   | `/add-quote`        | Quote Mgmt      | ❌           | Add quote to database     | SEND_MESSAGES, EMBED_LINKS     | ❌             |
| 6   | `/quote`            | Quote Mgmt      | ❌           | Get quote by ID           | SEND_MESSAGES, EMBED_LINKS     | ❌             |
| 7   | `/list-quotes`      | Quote Mgmt      | ❌           | Get all quotes via DM     | SEND_MESSAGES (DM)             | ❌             |
| 8   | `/update-quote`     | Quote Mgmt      | ✅ **ADMIN** | Modify quote              | SEND_MESSAGES, EMBED_LINKS     | ❌             |
| 9   | `/delete-quote`     | Quote Mgmt      | ✅ **ADMIN** | Remove quote              | SEND_MESSAGES, EMBED_LINKS     | ❌             |
| 10  | `/random-quote`     | Quote Discovery | ❌           | Get random quote          | SEND_MESSAGES, EMBED_LINKS     | ❌             |
| 11  | `/search-quotes`    | Quote Discovery | ❌           | Search by text/author     | SEND_MESSAGES, EMBED_LINKS     | ❌             |
| 12  | `/quote-stats`      | Quote Discovery | ❌           | Database statistics       | SEND_MESSAGES, EMBED_LINKS     | ❌             |
| 13  | `/rate-quote`       | Quote Social    | ❌           | Rate quote (1-5 stars)    | SEND_MESSAGES                  | ❌             |
| 14  | `/tag-quote`        | Quote Social    | ❌           | Add tag to quote          | SEND_MESSAGES                  | ❌             |
| 15  | `/export-quotes`    | Quote Export    | ❌           | Export JSON/CSV           | SEND_MESSAGES, ATTACH_FILES    | ❌             |
| 16  | `/broadcast`        | Admin           | ✅ **ADMIN** | Send to multiple channels | SEND_MESSAGES (per channel)    | ❌             |
| 17  | `/say`              | Admin           | ✅ **ADMIN** | Bot sends in channel      | SEND_MESSAGES (target channel) | ❌             |
| 18  | `/whisper`          | Admin           | ✅ **ADMIN** | Send DMs to users/roles   | SEND_MESSAGES (DM)             | ✅ **CHECKED** |
| 19  | `/embed`            | Admin           | ✅ **ADMIN** | Send formatted embed      | SEND_MESSAGES, EMBED_LINKS     | ❌             |
| 20  | `/proxy-config`     | Admin           | ✅ **ADMIN** | Configure webhook proxy   | Database access                | ❌             |
| 21  | `/proxy-enable`     | Admin           | ✅ **ADMIN** | Toggle message proxy      | Database access                | ❌             |
| 22  | `/proxy-status`     | Admin           | ✅ **ADMIN** | View proxy status         | Database access                | ❌             |
| 23  | `/create-reminder`  | Reminder        | ❌           | Schedule reminder         | SEND_MESSAGES (notifications)  | ⚠️ (DM only)   |
| 24  | `/get-reminder`     | Reminder        | ❌           | View reminder             | SEND_MESSAGES                  | ❌             |
| 25  | `/list-reminders`   | Reminder        | ❌           | All user reminders        | SEND_MESSAGES                  | ❌             |
| 26  | `/search-reminders` | Reminder        | ❌           | Filter reminders          | SEND_MESSAGES                  | ❌             |
| 27  | `/update-reminder`  | Reminder        | ❌           | Modify reminder           | SEND_MESSAGES                  | ❌             |
| 28  | `/delete-reminder`  | Reminder        | ❌           | Cancel reminder           | SEND_MESSAGES                  | ❌             |
| 29  | `/opt-in`           | User Prefs      | ❌           | Enable DM notifications   | SEND_MESSAGES                  | N/A            |
| 30  | `/opt-out`          | User Prefs      | ❌           | Disable DM notifications  | SEND_MESSAGES                  | N/A            |
| 31  | `/comm-status`      | User Prefs      | ❌           | View DM preference        | SEND_MESSAGES                  | ❌             |
| 32  | `/opt-in-request`   | User Prefs      | ✅ **ADMIN** | Request user opt-in       | SEND_MESSAGES (DM)             | ✅ **CHECKED** |

---

## Summary Statistics

### By Permission Level

| Level             | Count | %   | Commands                                                                                                             |
| ----------------- | ----- | --- | -------------------------------------------------------------------------------------------------------------------- |
| Public (No Admin) | 24    | 75% | Quotes, Discovery, Social, Export, Reminders, Preferences (3), Misc                                                  |
| Admin Only        | 8     | 25% | Broadcast, Say, Whisper, Embed, Proxy-config, Proxy-enable, Proxy-status, Update-quote, Delete-quote, Opt-in-request |

### By Bot Permissions Needed

| Permission           | Commands         | Count |
| -------------------- | ---------------- | ----- |
| SEND_MESSAGES        | All 32           | 32    |
| EMBED_LINKS          | Quote & Help     | 15    |
| READ_MESSAGE_HISTORY | System           | 1     |
| ADD_REACTIONS        | Pagination       | 2     |
| MANAGE_MESSAGES      | Pagination       | 2     |
| ATTACH_FILES         | Export           | 1     |
| MANAGE_WEBHOOKS      | Proxy (optional) | 3     |

### By Stack

| Stack            | Count  | Admin | Public | Mixed        |
| ---------------- | ------ | ----- | ------ | ------------ |
| Admin            | 7      | 7     | 0      | 0            |
| Quote Management | 5      | 2     | 3      | ✓            |
| Quote Discovery  | 3      | 0     | 3      | ❌           |
| Quote Social     | 2      | 0     | 2      | ❌           |
| Quote Export     | 1      | 0     | 1      | ❌           |
| Reminders        | 6      | 0     | 6      | ❌           |
| User Preferences | 4      | 1     | 3      | ✓            |
| Misc             | 4      | 0     | 4      | ❌           |
| **TOTAL**        | **32** | **8** | **24** | **2 stacks** |

---

## Permission Inheritance

### What Discord Administrator Permission Covers

These commands require **Discord Administrator** permission on the server:

```
/broadcast          (Send messages to channels)
/say               (Bot speaks in channel)
/whisper           (Send DMs to users)
/embed             (Send embeds)
/proxy-config      (Configure proxy)
/proxy-enable      (Enable proxy)
/proxy-status      (Check proxy)
/update-quote      (Modify quotes)
/delete-quote      (Remove quotes)
/opt-in-request    (Request user opt-in)
```

**How it's checked:**

```javascript
const isAdmin = checkAdminPermission(interaction);
// Uses: interaction.member.permissions.has('ADMINISTRATOR')
```

### What Opt-In Permission Covers

These commands check user **opt-in** before sending DMs:

```
/whisper           (Admin sends DMs - respects opt-in)
/opt-in-request    (Admin sends opt-in request - respects opt-in)
Reminder DMs       (Reminders via DM - respects opt-in)
/list-quotes       (Returns quotes via DM - may need opt-in)
```

**How it's checked:**

```javascript
const optedIn = await CommunicationService.isOptedIn(userId);
```

---

## Bot Permission Dependencies

### Minimum Viable Bot Permissions

To run basic quote commands only:

```
SEND_MESSAGES      (reply to commands)
EMBED_LINKS        (format quotes)
READ_MESSAGE_HISTORY (fetch history)
```

### Recommended Bot Permissions

For all features:

```
SEND_MESSAGES       (core)
READ_MESSAGE_HISTORY (history access)
EMBED_LINKS         (formatting)
ATTACH_FILES        (export)
ADD_REACTIONS       (pagination)
MANAGE_MESSAGES     (cleanup)
USE_APP_COMMANDS    (slash commands)
```

### Full Permission Bitmask

**414565652** = includes all above

**OAuth2 Invite URL:**

```
https://discord.com/api/oauth2/authorize?
  client_id=YOUR_CLIENT_ID
  &scope=bot%20applications.commands
  &permissions=414565652
```

---

## Configuration Impact on Permissions

### Feature Flags

| Setting                               | Affects                                         | Commands                      |
| ------------------------------------- | ----------------------------------------------- | ----------------------------- |
| `ENABLE_ADMIN_COMMANDS=false`         | Disables all admin commands                     | All 7 admin commands          |
| `ENABLE_REMINDER_NOTIFICATIONS=false` | Disables reminders                              | All 6 reminder commands       |
| `ADMIN_ROLE_IDS=set`                  | Requires specific role instead of Administrator | All 8 admin commands          |
| `PRIVILEGED_USER_IDS=set`             | Super-admin users bypass all checks             | All 8 admin commands + opt-in |
| `REMINDER_NOTIFICATION_CHANNEL=set`   | Role reminders post there instead of DM         | 6 reminder commands           |

### Environment Variables for Permissions

```env
# Required
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_client_id

# Optional Permission Overrides
ADMIN_ROLE_IDS=role_id_1,role_id_2
PRIVILEGED_USER_IDS=user_id_1,user_id_2

# Required for some features
REMINDER_NOTIFICATION_CHANNEL=channel_id
```

---

## Common Permission Scenarios

### Scenario 1: Fully Restricted Bot

**Goal:** Only trusted admins can use dangerous commands

**Setup:**

```env
ADMIN_ROLE_IDS=123456789012345678
```

**Result:**

- Only users with role `123456789012345678` can run admin commands
- Regular users can still use quote/reminder commands
- Admin check becomes role-based instead of Discord Administrator

### Scenario 2: Public Bot (Quote-focused)

**Goal:** Anyone can use quote commands, admins can manage

**Setup:**

```env
ENABLE_ADMIN_COMMANDS=true
# Other settings default
```

**Result:**

- All quote commands available to everyone
- Admin commands require Discord Administrator
- Reminders work for all users
- User opt-in applies to DMs

### Scenario 3: Private Bot (Trusted Group)

**Goal:** Only specific users can execute anything

**Setup:**

```env
PRIVILEGED_USER_IDS=123456789012345678,987654321098765432
```

**Result:**

- Only those 2 users can run commands
- All permission checks pass for them
- Other users: "not authorized"

### Scenario 4: Role-Based Reminders

**Goal:** Reminders notify via channel, not DM

**Setup:**

```env
REMINDER_NOTIFICATION_CHANNEL=987654321098765432
```

**Result:**

- Individual reminders: User-created, notify via channel @role
- Opt-in status doesn't affect channel notifications
- Channel must exist and bot must have SEND_MESSAGES permission

---

## Permission Error Messages

| Error                                                      | Cause                                       | Solution                                          |
| ---------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------- |
| "You need admin permissions to use this command"           | User lacks Administrator permission         | Grant Administrator role or set ADMIN_ROLE_IDS    |
| "I don't have permission to send messages in that channel" | Bot missing SEND_MESSAGES in target channel | Give bot Send Messages permission in that channel |
| "Could not send DM. User has DMs disabled"                 | User privacy settings block DMs             | Ask user to enable DMs in privacy settings        |
| "User opted out of DMs"                                    | User ran /opt-out command                   | Send `/opt-in-request` or message via channel     |
| "Channel not found"                                        | Invalid channel ID/name/mention             | Double-check channel exists and bot can see it    |
| "No permission to read message history"                    | Bot missing READ_MESSAGE_HISTORY            | Grant Read Message History permission             |

---

## Testing Permissions

### Test 1: Verify Admin Check

```bash
# As non-admin user
/broadcast message:"test" channels:"general"
# Expected: "You need admin permissions..."

# As admin user
/broadcast message:"test" channels:"general"
# Expected: Command executes
```

### Test 2: Verify Bot Permissions

```bash
# In channel where bot can't send messages
/say channel:"test-channel" message:"hello"
# Expected: "I don't have permission to send messages..."

# Verify bot actually can't send
/say channel:"general" message:"hello"
# Expected: "Message sent"
```

### Test 3: Verify Opt-In

```bash
# As user who opted out
# Admin runs: /whisper targets:"@user" message:"hello"
# Expected: "Failed for user (opted out of DMs)"

# User opts in
/opt-in
# Expected: "DMs enabled"

# Admin runs same whisper
# Expected: "Message sent to user"
```

---

## Related Documentation

- [PERMISSIONS-OVERVIEW.md](PERMISSIONS-OVERVIEW.md) - Detailed reference
- [PERMISSIONS-QUICK-REFERENCE.md](PERMISSIONS-QUICK-REFERENCE.md) - Quick lookup
- [PERMISSION-MODEL.md](../PERMISSION-MODEL.md) - Architecture details
