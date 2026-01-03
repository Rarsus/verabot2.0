# Quick Fix: Slash Commands Missing After Docker Rebuild

## 🚨 TLDR - The Solution (3 Steps)

```bash
# Step 1: Verify bot is running
docker-compose ps
# Should show: STATUS "Up X seconds"

# Step 2: Register slash commands
docker-compose exec verabot2 npm run register-commands
# Should show: "✓ Successfully registered X commands"

# Step 3: Test in Discord
# Type "/" in Discord and commands should appear
# If not, restart Discord app and try again
```

**That's it!** This fixes 95% of cases.

---

## 🔍 Decision Tree

```
Slash commands not showing?
│
├─ Bot not online in Discord?
│  └─ Fix: docker-compose ps → docker-compose logs → fix errors → restart
│
├─ Bot online but no "/" commands?
│  ├─ Never run register-commands?
│  │  └─ Fix: docker-compose exec verabot2 npm run register-commands
│  │
│  ├─ Ran register-commands but got errors?
│  │  ├─ "DISCORD_TOKEN not set"?
│  │  │  └─ Fix: Add DISCORD_TOKEN to .env, restart, try again
│  │  ├─ "CLIENT_ID not set"?
│  │  │  └─ Fix: Add CLIENT_ID to .env, restart, try again
│  │  └─ Other error?
│  │     └─ Fix: Check docker-compose logs, debug from there
│  │
│  └─ Run register-commands successfully but still no "/"?
│     ├─ Using GUILD_ID (test server)?
│     │  └─ Try: Restart Discord app, wait 1 minute, try again
│     └─ Not using GUILD_ID (global)?
│        └─ Note: Global registration takes 1-2 hours to propagate
```

---

## ⚡ Most Common Fix

**99% of the time, this is all you need:**

```bash
docker-compose exec verabot2 npm run register-commands
```

Just run this ONE command and wait for success message.

---

## 📋 Checklist: Did You...?

- [ ] Run `docker-compose ps` and verified bot shows "Up"?
- [ ] Run `docker-compose exec verabot2 npm run register-commands`?
- [ ] Saw "✓ Successfully registered" message?
- [ ] Restarted Discord app?
- [ ] Waited 1-5 minutes for Discord to refresh?
- [ ] Typed "/" in a Discord server to test?

If you checked all boxes and still no commands, continue to detailed guide.

---

## 🐛 Debug Commands

Copy/paste if you need to investigate further:

```bash
# Check if bot is running
docker-compose ps

# View startup logs
docker-compose logs --tail=50

# View last 5 minutes of logs
docker-compose logs --since 5m

# Check environment variables set
docker-compose exec verabot2 env | grep -E "DISCORD_TOKEN|CLIENT_ID|GUILD_ID"

# Count loaded commands
docker-compose exec verabot2 ls -R src/commands | grep ".js" | wc -l

# Manually test command registration
docker-compose exec verabot2 npm run register-commands

# Check if error is in bot startup
docker-compose logs | grep -i "error\|failed\|warn"
```

---

## 🛠️ Quick Fixes by Symptom

### "Bot is online but I don't see /"

**Most likely:** Commands not registered

```bash
docker-compose exec verabot2 npm run register-commands
# Wait for completion message
# Then restart Discord
```

### "register-commands fails with DISCORD_TOKEN error"

**Problem:** .env missing bot token

```bash
# Check if .env exists
ls .env

# If not:
cp .env.example .env

# Add your token:
echo "DISCORD_TOKEN=your_actual_token_here" >> .env
echo "CLIENT_ID=your_actual_client_id_here" >> .env

# Restart bot
docker-compose restart

# Try registration again
docker-compose exec verabot2 npm run register-commands
```

### "Bot crashes immediately after rebuild"

**Problem:** Container startup issue

```bash
# See what's wrong
docker-compose logs

# Common fixes:
# 1. If "Cannot find module": docker-compose up -d --build
# 2. If "DISCORD_TOKEN not set": Add to .env
# 3. If "Port in use": Change PROXY_PORT in .env

# After fix:
docker-compose restart
```

### "Commands registered but Discord shows nothing"

**Problem:** Discord cache hasn't updated

```bash
# Solution 1 (Fast):
# 1. Quit Discord completely (Force quit)
# 2. Wait 30 seconds
# 3. Open Discord
# 4. Try "/" again

# Solution 2 (Force refresh):
# 1. In Discord, type "/" (opens command menu)
# 2. Wait 10 seconds (Discord fetches from bot)
# 3. Check again

# Solution 3 (If using guild registration):
# 1. Commands should appear instantly in that guild
# 2. If not, run register-commands again
docker-compose exec verabot2 npm run register-commands
```

---

## 📞 When Something Goes Wrong

### What to Do

1. **Don't panic** - This is usually a simple fix
2. **Check the logs** - `docker-compose logs` usually explains it
3. **Follow the decision tree** above
4. **Try the quick fixes**
5. **Read the detailed guide** if still stuck

### Where to Get Help

- **Detailed Troubleshooting:** [guides/SLASH-COMMANDS-TROUBLESHOOTING.md](SLASH-COMMANDS-TROUBLESHOOTING.md)
- **Docker Guide:** [guides/DOCKER-SETUP.md](DOCKER-SETUP.md)
- **Configuration Guide:** [CONFIGURATION-ANALYSIS.md](CONFIGURATION-ANALYSIS.md)

---

## 📚 Understanding the Issue

**Why do commands need to be registered?**

Discord.js slash commands don't just appear automatically. They must be registered with Discord's API. This tells Discord what commands exist and how to show them.

**When do I need to register?**

- ✅ First time bot starts
- ✅ After adding new commands
- ✅ After Docker rebuild (if changed code)
- ✅ Never again for same code (registered once, persists)

**How does it work?**

```
1. Bot starts with valid DISCORD_TOKEN
2. You run: npm run register-commands
3. Script reads all .js files in src/commands/
4. Sends command definitions to Discord API
5. Discord stores and displays them
6. Commands appear in Discord when typing "/"
```

---

## ✅ Success Criteria

You're done when:

- ✅ Bot shows as online in Discord
- ✅ You can type "/" and see a list of commands
- ✅ You can execute at least one command
- ✅ No errors in `docker-compose logs`

---

**Most common issue: Simply need to run `docker-compose exec verabot2 npm run register-commands` - try that first!**
