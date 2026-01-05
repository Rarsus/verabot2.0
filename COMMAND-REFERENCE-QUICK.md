# Quick Command Reference - With Name Resolution ⚡

## `/broadcast` - Broadcast messages to multiple channels

### Old Way (ID-based):

```
/broadcast message: "Hello everyone!" channels: "1234567890,9876543210,5555555555"
```

### New Way (Name-based) 🎉:

```
/broadcast message: "Hello everyone!" channels: "announcements, general, writing-corner"
/broadcast message: "Hello everyone!" channels: "#announcements, #general, #writing-corner"
/broadcast message: "Hello everyone!" channels: "announcements, 1234567890, #general"
```

**Usage Tips:**

- Separate channels with commas
- Use names (case-insensitive), channel IDs, or #mentions
- Mix and match formats in the same command
- Returns success count and lists any failures

**Example Output:**

```
✅ ✅ Message sent to 3 recipient(s)
```

---

## `/embed` - Send formatted embed messages

### Old Way (ID-based):

```
/embed channel: "1234567890" title: "Welcome" description: "Welcome to our server!"
```

### New Way (Name-based) 🎉:

```
/embed channel: "announcements" title: "Welcome" description: "Welcome to our server!"
/embed channel: "#general" title: "Welcome" description: "Welcome to our server!"
```

**All Options:**

```
/embed
  channel: "announcements"           [Required] Channel name, ID, or #mention
  title: "My Title"                  [Required] Embed title (max 256 chars)
  description: "Description text"    [Required] Embed description (max 2048 chars)
  color: "#FF5733"                   [Optional] Hex color (with or without #)
  footer: "Footer text"              [Optional] Footer (max 2048 chars)
  thumbnail: "https://..."           [Optional] Thumbnail image URL
  image: "https://..."               [Optional] Large image URL
```

**Example:**

```
/embed
  channel: "announcements"
  title: "Server Rules"
  description: "Please read these carefully"
  color: "FF0000"
  footer: "Updated Dec 31, 2025"
```

**Output:**

```
✅ Embed sent in #announcements
[Message ID: 1234567890]
```

---

## Accepted Input Formats

### Channel Examples:

```
✅ Name:        writing-corner, announcements, general
✅ Mention:     #writing-corner, #announcements
✅ ID:          1234567890 or any 18-digit number
✅ Partial:     "writ" (if only 1 channel starts with it)
```

### When It Works Best:

- **Name** - Fastest when you know the channel name
- **Mention** - Works like Discord's own #mention system
- **ID** - Best for automation/scripts
- **Partial** - Convenient if name is unique

---

## Troubleshooting

### Error: "Could not find channel: X"

**Common Causes:**

1. **Typo in name** - Check spelling (case doesn't matter)
2. **Channel doesn't exist** - Verify channel name in server
3. **Bot can't see it** - Bot needs permission to view channel
4. **Ambiguous name** - Multiple channels start with same letter

**Solutions:**

```
✅ Use full channel name:    /embed channel: "writing-corner"
✅ Use #mention format:      /embed channel: "#writing-corner"
✅ Use channel ID as backup: /embed channel: "1234567890"
```

### Error: "Message sent to 0 recipients"

**Broadcast specific issues:**

1. **No valid channels provided** - Check comma separation
2. **Bot lacks permission** - Bot needs "Send Messages" permission
3. **All channels failed** - Check all channel names

**Fix:**

```
/broadcast
  message: "Test message"
  channels: "general"  // Start with one known channel
```

---

## Pro Tips 💡

### Tip 1: Mix Formats

```
✅ /broadcast message: "Hi!" channels: "general, #announcements, 1234567890"
```

### Tip 2: Use Partial Names

```
✅ /broadcast message: "Hi!" channels: "writing"  // if unique
❌ /broadcast message: "Hi!" channels: "w"       // too ambiguous
```

### Tip 3: Copy Channel Names

1. Look at your Discord server sidebar
2. Use exact channel name from there (not the #)
3. Paste into command

### Tip 4: Check Bot Permissions

```
Before broadcast:
1. Make sure bot can see the channels
2. Make sure bot can send messages there
3. If permission denied, ask server admin
```

### Tip 5: Escape Special Characters

```
// Channel name with spaces/hyphens - put in quotes
/embed channel: "writing-corner" ...  ✅ (already quoted)
```

---

## Complete Examples

### Example 1: Broadcast to Multiple Channels

```
/broadcast
  message: "Maintenance scheduled for tomorrow at 8 PM UTC"
  channels: "announcements, general, mods"
```

### Example 2: Send Embed to Announcement Channel

```
/embed
  channel: "announcements"
  title: "New Feature Released!"
  description: "Check out our latest feature in #general"
  color: "00FF00"
  footer: "Version 2.3.0"
```

### Example 3: Mix Different Input Formats

```
/broadcast
  message: "Emergency maintenance in 5 minutes!"
  channels: "status, #critical, 1234567890"
```

### Example 4: Embed with Image

```
/embed
  channel: "announcements"
  title: "New Server Banner"
  description: "Check out our awesome new banner!"
  image: "https://example.com/banner.png"
  color: "0099FF"
```

---

## Command Comparison

| Feature            | `/broadcast` | `/embed` |
| ------------------ | :----------: | :------: |
| Send to 1 channel  |      ❌      |    ✅    |
| Send to multiple   |      ✅      |    ❌    |
| Basic text message |      ✅      |    ❌    |
| Formatted embed    |      ❌      |    ✅    |
| Use channel names  |      ✅      |    ✅    |
| Use channel IDs    |      ✅      |    ✅    |
| Use #mentions      |      ✅      |    ✅    |
| Admin-only         |      ✅      |    ✅    |

---

## Quick Copy-Paste Templates

### Broadcast Template:

```
/broadcast message: "[YOUR MESSAGE HERE]" channels: "[CHANNEL1, CHANNEL2, CHANNEL3]"
```

### Embed Template:

```
/embed channel: "[CHANNEL]" title: "[TITLE]" description: "[DESCRIPTION]" color: "[HEX COLOR]" footer: "[FOOTER]"
```

---

**Need more help?** See [RESOLUTION-HELPERS-GUIDE.md](docs/guides/RESOLUTION-HELPERS-GUIDE.md) for full documentation.
