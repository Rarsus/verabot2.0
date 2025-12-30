# Admin Communication Commands

This guide covers the four privileged communication commands that allow bot administrators to send messages through the bot to users, channels, and roles.

## Overview

The admin communication command suite provides powerful messaging capabilities for server administrators:

1. **Broadcast** - Send the same message to multiple channels
2. **Say** - Have the bot send a message in a specific channel
3. **Whisper** - Send direct messages from the bot to users or entire roles
4. **Embed** - Send beautifully formatted embed messages

All commands require **Administrator** permissions and are **slash commands only** (not available as prefix commands).

---

## Broadcast Command

Send the same message to multiple channels at once.

### Usage

```
/broadcast message: "Your message here" channels: "123456789,987654321,555555555"
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message` | String | Yes | Message content to broadcast (max 2000 chars) |
| `channels` | String | Yes | Comma-separated channel IDs |

### Examples

**Example 1: Broadcast to announcement channels**
```
/broadcast message: "Maintenance window tonight from 10 PM to midnight EST" channels: "123456789,987654321"
```

**Example 2: Broadcast with line breaks**
```
/broadcast message: "🎉 New feature released!\n\n✨ Quote tagging system\n🔍 Advanced search filters\n📊 Statistics display" channels: "111111111,222222222,333333333"
```

### Response

The bot will respond with a summary:
```
✅ Broadcast sent to 3 channel(s)
```

If some channels fail:
```
✅ Broadcast sent to 2 channel(s)
❌ Failed to send to 1 channel(s):
  • 123456789 (no send permission)
```

### Permissions Required

- **User**: Administrator permission in the server
- **Bot**: Send Messages permission in target channels

### Notes

- Maximum 2000 characters per message
- Channels must be text-based channels
- Failed channels are reported separately
- Bot must have send permissions in all target channels

---

## Say Command

Make the bot send a message in a specific channel.

### Usage

```
/say channel: "123456789" message: "Your message here"
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `channel` | String | Yes | Channel ID where the bot should send the message |
| `message` | String | Yes | Message content (max 2000 chars) |

### Examples

**Example 1: Send announcement**
```
/say channel: "123456789" message: "Welcome to our Discord server! Read the rules in #rules before posting."
```

**Example 2: Send formatted message**
```
/say channel: "987654321" message: "📋 **Daily Standup**\n• Feature: Quote tagging\n• Status: In progress\n• ETA: 2 days"
```

**Example 3: Send update with emoji**
```
/say channel: "555555555" message: "✅ All systems operational\n⚡ 99.9% uptime\n🚀 Performance: Excellent"
```

### Response

```
✅ Message sent in #general
[Message ID: 1234567890123456789]
```

### Permissions Required

- **User**: Administrator permission in the server
- **Bot**: Send Messages permission in the target channel

### Notes

- Maximum 2000 characters per message
- Only works with text-based channels
- Message ID is provided for reference
- Useful for announcements, alerts, and system messages

---

## Whisper Command

Send direct messages from the bot to specific users or all members of a role.

### Usage

```
/whisper targets: "user1_id,user2_id" message: "Your private message"
/whisper targets: "role:role_id,user_id" message: "Mixed targets"
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `targets` | String | Yes | User IDs or Role IDs (prefix roles with "role:", comma-separated) |
| `message` | String | Yes | Message content (max 2000 chars) |

### Syntax

- **User ID**: `123456789`
- **Role ID**: `role:123456789`
- **Multiple targets**: `123,456,role:789`

### Examples

**Example 1: Send DM to single user**
```
/whisper targets: "987654321" message: "Hey! Check out the new quote search feature."
```

**Example 2: Send DM to all moderators**
```
/whisper targets: "role:123456789" message: "New moderation guidelines have been updated. Please review."
```

**Example 3: Send to multiple users and roles**
```
/whisper targets: "user1,user2,role:mods,role:admins" message: "Important security update. Please change your password."
```

**Example 4: Send welcome DM to new members**
```
/whisper targets: "role:members" message: "Welcome! 👋 Please take a moment to introduce yourself in #introductions."
```

### Response

```
✅ Message sent to 12 recipient(s)
```

If some targets fail:
```
✅ Message sent to 10 recipient(s)
⚠️ Failed for 2 target(s):
  • user123 (user has DMs disabled)
  • role:mod (no members in role)
```

### Permissions Required

- **User**: Administrator permission in the server
- **Bot**: Ability to send direct messages (not blocked by user)

### Notes

- Prefix role targets with `role:`
- Users with DMs disabled will fail (but other targets still succeed)
- Empty roles are reported as failed
- Failed targets don't stop other messages
- Useful for alerts, notifications, and private announcements
- Perfect for role-based messaging to entire groups

---

## Embed Command

Send beautifully formatted embed messages with titles, descriptions, colors, images, and more.

### Usage

```
/embed channel: "123456789" title: "Title" description: "Description" color: "#FF5733" footer: "Footer text"
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `channel` | String | Yes | Channel ID where the embed should be sent |
| `title` | String | Yes | Embed title (max 256 chars) |
| `description` | String | Yes | Embed description (max 2048 chars) |
| `color` | String | No | Hex color code (e.g., `#FF5733` or `FF5733`) |
| `footer` | String | No | Footer text (max 2048 chars) |
| `thumbnail` | String | No | Thumbnail image URL |
| `image` | String | No | Large image URL |

### Color Codes

**Common Colors:**
- `#FF5733` - Red/Orange
- `#3498DB` - Blue
- `#2ECC71` - Green
- `#9B59B6` - Purple
- `#F39C12` - Yellow/Gold
- `#E74C3C` - Dark Red
- `#1ABC9C` - Teal

**Color Syntax:**
- With hash: `#FF5733`
- Without hash: `FF5733`
- Short form: `F0F` (expands to FF00FF)

### Examples

**Example 1: Simple announcement embed**
```
/embed channel: "123456789" title: "📢 New Features Released" description: "Version 2.2.0 is now live! Check out the new quote tagging system and advanced search filters."
```

**Example 2: Embed with color and footer**
```
/embed channel: "987654321" title: "✅ System Status" description: "All systems operational and running smoothly." color: "#2ECC71" footer: "Last updated: 2025-12-30"
```

**Example 3: Embed with images**
```
/embed channel: "555555555" title: "🎨 New Design Preview" description: "Here's a preview of our upcoming interface redesign." thumbnail: "https://example.com/thumb.png" image: "https://example.com/full-image.png"
```

**Example 4: Event announcement with full details**
```
/embed channel: "111111111" title: "🎉 Community Event Tonight!" description: "Join us for our weekly voice chat!\n\n⏰ Time: 8:00 PM EST\n🎤 Location: General Voice Channel\n👥 Expected: 50+ members" color: "#9B59B6" footer: "Looking forward to seeing you there!"
```

**Example 5: Warning/Alert embed**
```
/embed channel: "222222222" title: "⚠️ Scheduled Maintenance" description: "Database maintenance scheduled for tomorrow 2-4 AM EST.\n\nServices may be unavailable during this time." color: "#F39C12"
```

### Response

```
✅ Embed sent in #announcements
[Message ID: 1234567890123456789]
```

### Permissions Required

- **User**: Administrator permission in the server
- **Bot**: Send Messages and Embed Links permissions in the target channel

### Notes

- **Max lengths:**
  - Title: 256 characters
  - Description: 2048 characters
  - Footer: 2048 characters
- Color codes support:
  - 6-digit hex: `#FF5733`
  - 3-digit hex: `#F0F` (expands to #FF00FF)
  - Defaults to blue if invalid
- Invalid image URLs are silently skipped (embed still sends)
- Timestamp is automatically added to all embeds
- Perfect for announcements, status updates, and formatted messages

---

## Permission Levels

All four commands require **Administrator** permissions to use:

```
ADMINISTRATOR permission in the Discord server
```

Non-admin users will receive:
```
❌ You need admin permissions to use this command
```

## Error Handling

### Common Errors

**"Could not find channel with ID: ..."**
- Channel ID is incorrect
- Channel has been deleted
- Bot doesn't have access to the channel

**"I don't have permission to send messages in that channel"**
- Bot is missing "Send Messages" permission
- Bot is missing "Embed Links" permission (for embeds)

**"User not found"**
- User ID is incorrect
- User is not in the server (for whisper)

**"User has DMs disabled"**
- User has blocked bot or disabled DMs
- Message was not sent to that user
- Other recipients still received the message

### Best Practices

1. **Test carefully** - Always test commands in a test channel first
2. **Check IDs** - Use Discord's developer mode to get correct channel/user/role IDs
3. **Monitor permissions** - Ensure bot has necessary permissions in target channels
4. **Use sparingly** - Don't spam users or channels
5. **Get consent** - Only whisper users with their knowledge/consent
6. **Professional tone** - Use these for legitimate server communications

---

## Related Commands

- `/help` - View all available commands
- `/admin-config` - Configure admin settings
- `/audit-log` - View command usage logs

## Implementation Notes

- Commands are located in `src/commands/admin/`
- All commands use the Command base class pattern
- Admin permission check uses `checkAdminPermission()` utility
- Response helpers provide consistent formatting
- Error handling is automatic via Command base class
- Tests available in `tests/unit/test-admin-communication.js`

## Changelog

### Version 2.2.0 (Current)
- ✅ Broadcast command (send to multiple channels)
- ✅ Say command (bot sends in channel)
- ✅ Whisper command (send DMs to users/roles)
- ✅ Embed command (formatted embed messages)
- ✅ Comprehensive test suite (28 test cases)
- ✅ Full documentation and examples

---

**Admin Communication Commands Enabled:** ✅ (Feature flag: `ENABLE_ADMIN_COMMANDS=true`)
