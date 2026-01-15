# Permissions Structure - Visual Overview

## 📊 Command Permission Flow Diagram

```
                              VeraBot Commands (32 total)
                                       |
                    ___________________|___________________
                   |                   |                   |
              PUBLIC (24)         ADMIN-ONLY (8)       SPECIAL PERMS (Opt-in)
              No restrictions     Requires Admin       /whisper, /opt-in-request

              ├─ Quotes (10)      ├─ Broadcast         └─ Respects user
              ├─ Reminders (6)    ├─ Say                  opt-in status
              ├─ Preferences (3)  ├─ Whisper
              └─ Misc (5)         ├─ Embed
                                  ├─ Proxy-config
                                  ├─ Proxy-enable
                                  ├─ Proxy-status
                                  ├─ Update-quote
                                  ├─ Delete-quote
                                  └─ Opt-in-request
```

---

## 🎯 Command Stacks & Permission Requirements

### Admin Stack (7 commands) 🔴

```
All require: Administrator permission
│
├─ /broadcast      → Send message to multiple channels
├─ /say           → Bot sends message in channel
├─ /whisper       → Send DMs to users/roles (checks opt-in)
├─ /embed         → Send formatted embed messages
├─ /proxy-config  → Configure webhook proxy
├─ /proxy-enable  → Enable/disable proxy
└─ /proxy-status  → View proxy configuration
```

**Permission Check:**

```
User has Administrator? → YES → Execute
                      ↓ NO
                    → Reject with error
```

**Bot Needs:** `SEND_MESSAGES`, `EMBED_LINKS`, `ATTACH_FILES`

---

### Quote Management Stack (5 commands) 🟢

```
/add-quote      [PUBLIC]       → Any user can add quotes
/quote          [PUBLIC]       → Get quote by ID
/list-quotes    [PUBLIC]       → All quotes via DM
/update-quote   [ADMIN]        → Modify quote (requires Administrator)
/delete-quote   [ADMIN]        → Remove quote (requires Administrator)
```

**Bot Needs:** `SEND_MESSAGES`, `EMBED_LINKS`

---

### Quote Discovery Stack (3 commands) 🟢

```
/random-quote   [PUBLIC]  → Get random quote
/search-quotes  [PUBLIC]  → Search by text/author
/quote-stats    [PUBLIC]  → Database statistics
```

**Bot Needs:** `SEND_MESSAGES`, `EMBED_LINKS`

---

### Quote Social Stack (2 commands) 🟢

```
/rate-quote     [PUBLIC]  → Rate quote (1-5 stars)
/tag-quote      [PUBLIC]  → Add tags to organize
```

**Bot Needs:** `SEND_MESSAGES`

---

### Quote Export Stack (1 command) 🟢

```
/export-quotes  [PUBLIC]  → Export JSON/CSV file
```

**Bot Needs:** `SEND_MESSAGES`, `ATTACH_FILES`

---

### Reminder Stack (6 commands) 🟢

```
/create-reminder   [PUBLIC]  → Schedule reminder notification
/get-reminder      [PUBLIC]  → View specific reminder
/list-reminders    [PUBLIC]  → All user reminders
/search-reminders  [PUBLIC]  → Filter reminders
/update-reminder   [PUBLIC]  → Modify reminder
/delete-reminder   [PUBLIC]  → Cancel reminder

Special: Respects opt-in for DM delivery
```

**Bot Needs:** `SEND_MESSAGES`, `EMBED_LINKS`

---

### User Preferences Stack (4 commands) 🟢

```
/opt-in         [PUBLIC]   → Enable DM notifications
/opt-out        [PUBLIC]   → Disable DM notifications
/comm-status    [PUBLIC]   → View communication preference
/opt-in-request [ADMIN]    → Request user opt-in (respects opt-in)
```

**Bot Needs:** `SEND_MESSAGES`

---

### Miscellaneous Stack (4 commands) 🟢

```
/ping    [PUBLIC]  → Check bot latency
/hi      [PUBLIC]  → Friendly greeting
/help    [PUBLIC]  → Show available commands
/poem    [PUBLIC]  → Generate AI poem
```

**Bot Needs:** `SEND_MESSAGES`, `EMBED_LINKS` (help only)

---

## 🔐 Two-Layer Permission System

### Layer 1: Discord Administrator Permission

```
            User executes admin command
                       |
                       ↓
         Does user have Administrator?
              /                    \
            YES                    NO
             |                      |
          ALLOW                  REJECT
         Proceed              "Need admin
                              permissions"
```

**Affected Commands (8):**

- `/broadcast`, `/say`, `/whisper`, `/embed`
- `/proxy-config`, `/proxy-enable`, `/proxy-status`
- `/update-quote`, `/delete-quote`
- `/opt-in-request`

---

### Layer 2: User Opt-In System

```
         Command tries to send DM to user
                        |
                        ↓
              User opted in to DMs?
              /                    \
            YES                    NO
             |                      |
           SEND                   SKIP
          Message         "User opted out"
```

**Protected Commands (3):**

- `/whisper` - Admin sending DMs respects opt-in
- `/opt-in-request` - Respects opt-in before sending
- Reminder notifications - DMs only if opted in

---

## 📈 Permission Coverage Matrix

```
┌─────────────────────────────────────────────────────────────┐
│                    COMMAND PERMISSIONS                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  PUBLIC (No checks) ████████████████████ 75% (24 commands)  │
│                                                               │
│  Admin only        ████ 25% (8 commands)                    │
│                                                               │
│  Opt-in protected  ██ 9% (3 commands - subset of above)     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Bot Permission Coverage

### By Importance

```
TIER 1 - Essential (All commands)
├─ SEND_MESSAGES       ████████████████████████████████ 100%
├─ READ_MESSAGE_HISTORY ████████████████████████████████ 100%
└─ EMBED_LINKS         ███████████████████ 47% (15 commands)

TIER 2 - Important (Many commands)
├─ ATTACH_FILES        ██ 3% (1 command - export)
├─ ADD_REACTIONS       ██ 6% (pagination - optional)
└─ MANAGE_MESSAGES     ██ 6% (pagination - optional)

TIER 3 - Optional (Feature-dependent)
└─ MANAGE_WEBHOOKS     ████ 9% (Proxy - if enabled)
```

---

## ⚙️ Configuration Impact

### Scenario: Different Admin Models

#### Model A: Discord Administrator (Default)

```
┌─────────────────────────────────┐
│ ADMIN_ROLE_IDS = (empty)        │
├─────────────────────────────────┤
│ Check: Discord Administrator    │
│ Scope: Any admin in server      │
│ Setup: No configuration needed  │
└─────────────────────────────────┘
```

#### Model B: Custom Admin Role

```
┌─────────────────────────────────┐
│ ADMIN_ROLE_IDS = 123456789...   │
├─────────────────────────────────┤
│ Check: User has specific role   │
│ Scope: Only users with that role│
│ Setup: Configure role ID in .env│
└─────────────────────────────────┘
```

#### Model C: Super Admin Users

```
┌─────────────────────────────────┐
│ PRIVILEGED_USER_IDS = 111...,22│
├─────────────────────────────────┤
│ Check: User ID matches list    │
│ Scope: Only listed users       │
│ Setup: Add user IDs to .env    │
│ Effect: Bypass ALL permission  │
└─────────────────────────────────┘
```

---

## 🚀 Quick Start Checklist

### Step 1: Invite Bot to Server

```
1. Get your CLIENT_ID from Developer Portal
2. Use OAuth2 URL:
   https://discord.com/api/oauth2/authorize?
     client_id=YOUR_CLIENT_ID
     &scope=bot%20applications.commands
     &permissions=414565652
3. Select server
4. Confirm all permissions
```

### Step 2: Grant Administrator Permission (Optional)

If you want to use admin commands:

```
1. Go to Server Settings → Roles
2. Find your bot's role
3. Grant "Administrator" permission
   OR set ADMIN_ROLE_IDS in .env
```

### Step 3: Configure Optional Features

```env
# In .env:
ADMIN_ROLE_IDS=123456789012345678    # (optional)
PRIVILEGED_USER_IDS=999888777666555  # (optional)
REMINDER_NOTIFICATION_CHANNEL=111222333444555
```

### Step 4: Test Permissions

```
# As regular user:
/ping                  # Works ✅
/broadcast ...         # Fails ❌ (needs admin)

# As admin:
/broadcast message:"hello" channels:"general"  # Works ✅
/whisper targets:"@user" message:"hi"         # Works ✅
```

---

## 📋 Reference Sheets

### Permission Symbols

| Symbol | Meaning              | Count  |
| ------ | -------------------- | ------ |
| 🔴     | Admin Only           | 8      |
| 🟢     | Public               | 24     |
| ✅     | Enabled              | 32     |
| ❌     | Disabled/Restricted  | Varies |
| ⚠️     | Optional/Conditional | 3      |

### Permission Flags

| Flag                 | Full Name                | Used By            |
| -------------------- | ------------------------ | ------------------ |
| SEND_MESSAGES        | Send Messages in Channel | All 32 commands    |
| EMBED_LINKS          | Embed Links              | 15 commands        |
| READ_MESSAGE_HISTORY | Read Message History     | System             |
| ADD_REACTIONS        | Add Reactions            | Pagination (opt)   |
| MANAGE_MESSAGES      | Manage Messages          | Pagination (opt)   |
| ATTACH_FILES         | Attach Files             | 1 command (export) |
| MANAGE_WEBHOOKS      | Manage Webhooks          | Proxy (optional)   |
| USE_APP_COMMANDS     | Use Application Commands | All slash commands |

---

## 🔗 Related Documentation

- **[PERMISSIONS-OVERVIEW.md](PERMISSIONS-OVERVIEW.md)** - Complete detailed reference
- **[PERMISSIONS-QUICK-REFERENCE.md](PERMISSIONS-QUICK-REFERENCE.md)** - Quick lookup guide
- **[PERMISSIONS-MATRIX.md](PERMISSIONS-MATRIX.md)** - Full command matrix table
- **[PERMISSION-MODEL.md](../PERMISSION-MODEL.md)** - Architecture & design details
