# VeraBot 2.0 Permissions Documentation Index

Complete permissions reference for VeraBot 2.0, organized by use case and detail level.

---

## 📚 Documentation Files

### Quick Start (5-10 minutes)
- **[PERMISSIONS-QUICK-REFERENCE.md](PERMISSIONS-QUICK-REFERENCE.md)** 
  - At-a-glance command list
  - Admin vs public commands
  - Bot permissions checklist
  - Quick configuration
  - Perfect for: "Which command needs what permission?"

### Visual Overview (10-15 minutes)
- **[PERMISSIONS-VISUAL.md](PERMISSIONS-VISUAL.md)**
  - Flow diagrams and ASCII art
  - Permission system visualization
  - Command stack breakdown
  - Configuration scenarios
  - Perfect for: "Show me how permissions work"

### Complete Reference (20-30 minutes)
- **[PERMISSIONS-OVERVIEW.md](PERMISSIONS-OVERVIEW.md)**
  - Comprehensive permission guide
  - All command stacks detailed
  - Implementation patterns
  - Configuration guide
  - Troubleshooting section
  - Perfect for: "I need all the details"

### Full Matrix (For search/reference)
- **[PERMISSIONS-MATRIX.md](PERMISSIONS-MATRIX.md)**
  - All 32 commands in matrix table
  - Permission statistics
  - Error messages by cause
  - Testing procedures
  - Perfect for: "Find command X permissions"

---

## 🎯 Quick Navigation by Role

### I'm a Server Admin Setting Up VeraBot

**Start here:** [PERMISSIONS-QUICK-REFERENCE.md](PERMISSIONS-QUICK-REFERENCE.md)
- Invite bot with correct permissions
- Configure admin roles (if needed)
- Verify bot has required permissions

**Then read:** [PERMISSIONS-OVERVIEW.md](PERMISSIONS-OVERVIEW.md) → Configuration section
- Environment variable setup
- Discord server role configuration
- Bot permission checks

### I'm a User Learning Commands

**Start here:** [PERMISSIONS-QUICK-REFERENCE.md](PERMISSIONS-QUICK-REFERENCE.md)
- Find your commands (public vs admin)
- See what each command does
- Understand opt-in system

**Visual learner?** [PERMISSIONS-VISUAL.md](PERMISSIONS-VISUAL.md)
- Permission flow diagrams
- Command stack organization
- Two-layer system explained

### I'm a Developer Adding Commands

**Start here:** [PERMISSIONS-OVERVIEW.md](PERMISSIONS-OVERVIEW.md) → Permission Checks section
- Permission check patterns
- Implementation examples
- Common patterns

**Need complete reference:** [PERMISSIONS-MATRIX.md](PERMISSIONS-MATRIX.md)
- All command permissions
- Statistics by module
- Error handling guide

### I'm Troubleshooting Permission Issues

**Start here:** [PERMISSIONS-OVERVIEW.md](PERMISSIONS-OVERVIEW.md) → Common Permission Questions
- FAQ section
- Troubleshooting tips
- Permission error explanations

**Need quick answer:** [PERMISSIONS-QUICK-REFERENCE.md](PERMISSIONS-QUICK-REFERENCE.md) → Debugging Permissions
- Permission error causes
- Quick fixes
- Code pattern examples

---

## 📊 Statistics at a Glance

| Metric | Count |
|--------|-------|
| **Total Commands** | 32 |
| **Public Commands** | 24 (75%) |
| **Admin-Only Commands** | 8 (25%) |
| **Commands with Opt-In Check** | 3 (9%) |
| **Command Stacks** | 8 |
| **Required Bot Permissions** | 8 |
| **Permission Levels** | 2 (Admin + Opt-In) |

---

## 🔗 Command Stacks Overview

| Stack | Commands | Public | Admin | Opt-In |
|-------|----------|--------|-------|--------|
| Admin | 7 | 0 | 7 | ❌ |
| Quote Management | 5 | 3 | 2 | ❌ |
| Quote Discovery | 3 | 3 | 0 | ❌ |
| Quote Social | 2 | 2 | 0 | ❌ |
| Quote Export | 1 | 1 | 0 | ❌ |
| Reminders | 6 | 6 | 0 | ⚠️ (DM) |
| User Preferences | 4 | 3 | 1 | N/A |
| Miscellaneous | 4 | 4 | 0 | ❌ |

---

## 💡 Key Concepts

### Permission Levels

**Level 1: Discord Administrator**
- Required for: Dangerous server-wide actions
- Checked by: `checkAdminPermission(interaction)`
- Scope: Server-level (anyone with Administrator role)
- Commands: `/broadcast`, `/say`, `/whisper`, `/embed`, `/proxy-*`, `/update-quote`, `/delete-quote`, `/opt-in-request`

**Level 2: User Opt-In**
- Required for: DM-based communication
- Checked by: `CommunicationService.isOptedIn(userId)`
- Scope: Per-user basis
- Commands: `/whisper`, `/opt-in-request`, Reminder DMs

### Two-Tier System

```
Admin Command Execution
  ↓
Check: User has Administrator?
  ├─ YES → Continue to DM sending
  └─ NO → Reject "Need admin permissions"
      ↓
   Check: Recipient has opted in?
      ├─ YES → Send DM
      └─ NO → Skip recipient, mark failed
```

### Bot Requirements

**Essential (Always)**
- SEND_MESSAGES
- READ_MESSAGE_HISTORY
- EMBED_LINKS

**Common (Most features)**
- ATTACH_FILES
- ADD_REACTIONS
- MANAGE_MESSAGES

**Optional (If enabled)**
- MANAGE_WEBHOOKS (proxy only)

---

## 🚀 Getting Started

### Step 1: Check This Document First
You're already here! ✅

### Step 2: Choose Your Reference
- **Quick:** PERMISSIONS-QUICK-REFERENCE.md (5 min)
- **Visual:** PERMISSIONS-VISUAL.md (15 min)
- **Complete:** PERMISSIONS-OVERVIEW.md (30 min)
- **Search:** PERMISSIONS-MATRIX.md (as needed)

### Step 3: Find Your Answer
Use the navigation by role above to find exactly what you need.

### Step 4: Related Documentation
If you need more context:
- See the "Related Documentation" section in any file
- Check main [PERMISSION-MODEL.md](../PERMISSION-MODEL.md) for architecture
- Review individual command files in `src/commands/`

---

## 📖 Document Structure

### PERMISSIONS-QUICK-REFERENCE.md
```
├─ Quick Lookup
├─ All Commands by Permission Level
├─ Command Stack Permissions
├─ Bot Permissions Checklist
├─ Two Tier Permission System
├─ Configuration
├─ Debugging Permissions
└─ Full Documentation Link
```

### PERMISSIONS-VISUAL.md
```
├─ Command Permission Flow Diagram
├─ Command Stacks & Permission Requirements
├─ Two-Layer Permission System
├─ Permission Coverage Matrix
├─ Configuration Impact
├─ Quick Start Checklist
├─ Reference Sheets
└─ Related Documentation
```

### PERMISSIONS-OVERVIEW.md
```
├─ Overview & Table of Contents
├─ Discord Bot Permissions
├─ User Permissions by Command Stack (8 stacks)
├─ Permission Model (2-tier system)
├─ Configuration (env vars, server setup)
├─ Permission Checks (code patterns)
├─ Summary Table
├─ Common Questions & Answers
└─ Related Documentation
```

### PERMISSIONS-MATRIX.md
```
├─ Full Permissions Matrix (all 32 commands)
├─ Summary Statistics
├─ Permission Inheritance
├─ Bot Permission Dependencies
├─ Configuration Impact on Permissions
├─ Common Permission Scenarios
├─ Permission Error Messages
├─ Testing Permissions
└─ Related Documentation
```

---

## 🔍 Find What You Need

### "How do I invite the bot?"
→ PERMISSIONS-QUICK-REFERENCE.md → Invite Bot section

### "Which commands need Administrator?"
→ PERMISSIONS-QUICK-REFERENCE.md → All Commands by Permission section

### "What does the opt-in system do?"
→ PERMISSIONS-VISUAL.md → Two-Layer Permission System
→ PERMISSIONS-OVERVIEW.md → User Opt-In System section

### "How do I check permissions in code?"
→ PERMISSIONS-OVERVIEW.md → Permission Checks section
→ PERMISSIONS-MATRIX.md → Testing Permissions section

### "What bot permissions does command X need?"
→ PERMISSIONS-MATRIX.md → Full Permissions Matrix table

### "I'm getting a permission error. What do I do?"
→ PERMISSIONS-QUICK-REFERENCE.md → Debugging Permissions
→ PERMISSIONS-MATRIX.md → Permission Error Messages table

### "How do I set up admin roles?"
→ PERMISSIONS-OVERVIEW.md → Configuration section
→ PERMISSIONS-VISUAL.md → Configuration Impact scenarios

### "Can I limit admin commands to a specific role?"
→ PERMISSIONS-QUICK-REFERENCE.md → Configuration section
→ PERMISSIONS-OVERVIEW.md → Environment Variables

---

## 🎓 Learning Paths

### Path 1: Setup (New Server Admin)
1. PERMISSIONS-QUICK-REFERENCE.md - Learn the commands
2. PERMISSIONS-OVERVIEW.md (Configuration) - Set up your server
3. PERMISSIONS-OVERVIEW.md (Common Questions) - Q&A section
4. Done! You're ready to use VeraBot

### Path 2: Understanding (Developer/Power User)
1. PERMISSIONS-VISUAL.md - See how it works
2. PERMISSIONS-OVERVIEW.md - Deep dive into details
3. PERMISSIONS-MATRIX.md - Reference specifics
4. PERMISSION-MODEL.md - Understand architecture

### Path 3: Troubleshooting (Something's Wrong)
1. PERMISSIONS-QUICK-REFERENCE.md - Check error description
2. PERMISSIONS-MATRIX.md - Find error in error messages table
3. PERMISSIONS-OVERVIEW.md - Read detailed explanation
4. Common Questions - Find solution

### Path 4: Adding Commands (Developer)
1. PERMISSIONS-OVERVIEW.md → Permission Checks section
2. Review existing commands in src/commands/
3. Follow the implementation pattern
4. Test permissions (PERMISSIONS-MATRIX.md)

---

## ✅ Checklist Before Going Live

### Bot Setup
- [ ] Bot invited to server
- [ ] Bot has all required permissions
- [ ] `/ping` command works
- [ ] `/help` shows all commands

### Admin Setup (If Using Admin Commands)
- [ ] Admin has Administrator permission
- [ ] Or ADMIN_ROLE_IDS configured in .env
- [ ] Test: `/broadcast`, `/say`, `/whisper` work
- [ ] Test: Non-admin gets "need admin" error

### User Setup
- [ ] Users can run public commands
- [ ] `/opt-in` and `/opt-out` work
- [ ] Reminders work (if enabled)
- [ ] DM delivery respects opt-in

### Optional Features
- [ ] Proxy configured (if using)
- [ ] Reminder notification channel set (if role reminders)
- [ ] Poem generation works (if HuggingFace key set)

---

## 🆘 Still Need Help?

### Can't Find the Answer?

1. **Check the FAQ** in PERMISSIONS-OVERVIEW.md
2. **Search the matrix** in PERMISSIONS-MATRIX.md
3. **Read the architecture** in PERMISSION-MODEL.md
4. **Review source code** in src/commands/

### Something Isn't Working?

1. **Check error messages** in PERMISSIONS-MATRIX.md
2. **Debug permissions** in PERMISSIONS-QUICK-REFERENCE.md
3. **Verify bot permissions** in your Discord server
4. **Test with /ping** to verify bot can send messages

### Want to Customize Permissions?

1. **Read Configuration** in PERMISSIONS-OVERVIEW.md
2. **Check scenarios** in PERMISSIONS-VISUAL.md
3. **Review environment** variables section
4. **Test permissions** following PERMISSIONS-MATRIX.md

---

## 📝 Document Versions

- **PERMISSIONS-QUICK-REFERENCE.md** - v1.0 - 220 lines
- **PERMISSIONS-VISUAL.md** - v1.0 - 380 lines
- **PERMISSIONS-OVERVIEW.md** - v1.0 - 616 lines
- **PERMISSIONS-MATRIX.md** - v1.0 - 600 lines
- **This Index** - v1.0

**Total:** 1,816 lines of permissions documentation

---

## 🔗 Cross References

Within VeraBot Documentation:
- [PERMISSION-MODEL.md](../PERMISSION-MODEL.md) - Architecture & design
- [SECURITY.md](../SECURITY.md) - Security best practices
- [guides/06-ADMIN-COMMUNICATION-COMMANDS.md](../guides/06-ADMIN-COMMUNICATION-COMMANDS.md) - Admin commands guide
- [guides/04-REMINDER-SYSTEM.md](../guides/04-REMINDER-SYSTEM.md) - Reminder system details

External Resources:
- [Discord.js Permissions](https://discord.js.org/#/docs/main/stable/class/PermissionsBitField)
- [Discord Bot Permissions](https://discord.com/developers/docs/topics/permissions)
- [Discord OAuth2 Guide](https://discord.com/developers/docs/topics/oauth2)

---

**Happy using VeraBot! 🎉**
