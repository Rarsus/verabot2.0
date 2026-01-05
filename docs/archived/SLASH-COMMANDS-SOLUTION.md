# Slash Commands Missing: Complete Solution Guide

## 🎯 The Answer

**Slash commands not available after Docker rebuild?**

You need to register them! Run this:

```bash
docker-compose exec verabot2 npm run register-commands
```

That's it. 95% of cases fixed with that one command.

---

## 🚨 What Happened

When you rebuild and start the Docker container:

1. ✅ Bot starts and connects to Discord
2. ✅ Bot is online in your server
3. ❌ **But commands aren't registered with Discord yet**
4. ❌ That's why "/" doesn't show commands

**Commands registration is a separate step** that must be done AFTER the bot starts with a valid token.

---

## ✅ The Fix (3 Steps)

### Step 1: Verify Bot is Running

```bash
docker-compose ps
# Should show: STATUS "Up X seconds"
```

### Step 2: Register Slash Commands

```bash
docker-compose exec verabot2 npm run register-commands

# Wait for this output:
# ✓ Successfully registered X commands
```

### Step 3: Test in Discord

```
1. Open Discord
2. Type "/" in any server where bot is member
3. Commands dropdown should appear
4. Click one to test
```

**Done!** Commands should now be available.

---

## 📚 Documentation Available

Choose the guide that matches your needs:

| Guide                                                                                    | Purpose                   | Read Time |
| ---------------------------------------------------------------------------------------- | ------------------------- | --------- |
| **[SLASH-COMMANDS-QUICK-FIX.md](SLASH-COMMANDS-QUICK-FIX.md)**                           | Quick diagnosis and fixes | 3 min     |
| **[guides/DOCKER-WORKFLOW.md](guides/DOCKER-WORKFLOW.md)**                               | Complete Docker workflow  | 10 min    |
| **[guides/SLASH-COMMANDS-TROUBLESHOOTING.md](guides/SLASH-COMMANDS-TROUBLESHOOTING.md)** | Detailed troubleshooting  | 20 min    |
| **[guides/DOCKER-SETUP.md](guides/DOCKER-SETUP.md)**                                     | Docker concepts & usage   | 15 min    |

---

## 🔍 Still Not Working? Diagnostic Checklist

Run these checks in order:

```bash
# 1. Is bot running?
docker-compose ps
# Should show STATUS "Up"

# 2. Are environment variables set?
docker-compose exec verabot2 env | grep -E "DISCORD_TOKEN|CLIENT_ID"
# Both should output (token hidden, that's ok)

# 3. Did register-commands succeed?
docker-compose exec verabot2 npm run register-commands
# Should show "✓ Successfully registered"

# 4. Any errors in logs?
docker-compose logs
# Look for ERROR or FAIL messages

# 5. Discord cache issue?
# Close Discord completely
# Wait 30 seconds
# Reopen Discord
# Type "/" again
```

If any check fails, see [SLASH-COMMANDS-QUICK-FIX.md](SLASH-COMMANDS-QUICK-FIX.md) for fixes.

---

## 🎓 Why This Happens

**Discord.js Slash Commands require registration:**

```
Your Code                Discord API
   ↓                         ↓
Commands exist        Don't know about them yet
   ↓
Bot starts
   ↓
Bot connects to Discord
   ↓
Bot is online ✓        But Discord doesn't know
   ↓                   what commands exist
Register commands
(send command definitions)
   ↓
Discord stores them
   ↓
User types "/" ✓       Discord shows commands
   ↓
Commands available ✓
```

**This is why the separate `register-commands` step exists.**

---

## 🛠️ Complete Workflow

### If Everything is New

```bash
# 1. Create config
cp .env.example .env
# Edit and add DISCORD_TOKEN and CLIENT_ID

# 2. Build and start
docker-compose up -d --build

# 3. Register commands ← DON'T FORGET THIS!
docker-compose exec verabot2 npm run register-commands

# 4. Test in Discord
# Type "/" and commands should appear
```

### If You Just Rebuilt

```bash
# After rebuilding image
docker-compose up -d --build

# Register commands (may have changed)
docker-compose exec verabot2 npm run register-commands

# Test in Discord
```

### If Commands Still Missing After Registration

```bash
# Discord cache issue - do this:
# 1. Close Discord completely
# 2. Wait 30 seconds
# 3. Open Discord
# 4. Type "/" again
# 5. Commands should appear

# Still missing?
# Try restarting bot
docker-compose restart
docker-compose exec verabot2 npm run register-commands
```

---

## 🚀 Quick Command Reference

```bash
# Start bot
docker-compose up -d

# Rebuild and start
docker-compose up -d --build

# Stop bot
docker-compose down

# View logs
docker-compose logs -f

# Register commands ⭐ THE KEY COMMAND
docker-compose exec verabot2 npm run register-commands

# Full reset
docker-compose down -v
docker-compose up -d --build
docker-compose exec verabot2 npm run register-commands
```

---

## 📋 Checklist for Success

Before calling it fixed, verify:

- [ ] `docker-compose ps` shows bot as "Up"
- [ ] `docker-compose logs` shows no ERROR messages
- [ ] `docker-compose exec verabot2 npm run register-commands` shows "✓ Successfully registered"
- [ ] You can type "/" in Discord
- [ ] Commands dropdown appears
- [ ] At least one command works (try `/ping`)

All checked? **You're done!** 🎉

---

## ❓ Common Questions

**Q: Do I need to register commands every time I start the bot?**  
A: No, only when code changes or after rebuild. Commands persist once registered.

**Q: Why doesn't the bot auto-register commands on startup?**  
A: Because it requires API calls to Discord, which can fail. Manual registration is more reliable.

**Q: How long does registration take?**  
A: Usually 5-10 seconds. Global registration (no GUILD_ID) takes 1-2 hours to propagate everywhere.

**Q: What if registration fails?**  
A: Check logs: `docker-compose logs | grep -i error`. Usually missing TOKEN or CLIENT_ID.

**Q: Do I need GUILD_ID?**  
A: Optional. Speeds up testing (registers in 1 server instead of globally). Not needed for production.

---

## 🆘 Need More Help?

1. **Quick answer?** → [SLASH-COMMANDS-QUICK-FIX.md](SLASH-COMMANDS-QUICK-FIX.md) (3 min read)
2. **Docker question?** → [guides/DOCKER-SETUP.md](guides/DOCKER-SETUP.md) (15 min read)
3. **Complete workflow?** → [guides/DOCKER-WORKFLOW.md](guides/DOCKER-WORKFLOW.md) (10 min read)
4. **Detailed debugging?** → [guides/SLASH-COMMANDS-TROUBLESHOOTING.md](guides/SLASH-COMMANDS-TROUBLESHOOTING.md) (20 min read)

---

## 📍 TL;DR

```bash
docker-compose exec verabot2 npm run register-commands
```

Run this command, wait for success, restart Discord, done! 🎉

---

**Created:** 2025-12-29  
**Status:** Ready to use  
**Last Updated:** Today  
**Version:** 1.0
