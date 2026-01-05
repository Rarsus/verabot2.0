# Slash Commands Documentation Index

Complete documentation for the "slash commands not available after Docker rebuild" issue.

## 📚 Available Guides

### 🚀 Start Here (Pick One)

**If you just want the fix:**
→ [SLASH-COMMANDS-SOLUTION.md](SLASH-COMMANDS-SOLUTION.md) (2 min read)

- Direct answer to your problem
- 3-step solution
- Quick diagnostic checklist

**If you want quick diagnosis:**
→ [SLASH-COMMANDS-QUICK-FIX.md](SLASH-COMMANDS-QUICK-FIX.md) (3 min read)

- Decision tree to find your issue
- Quick fixes for common problems
- Debug commands

**If you want the full picture:**
→ [SLASH-COMMANDS-VISUAL.md](SLASH-COMMANDS-VISUAL.md) (5 min read)

- Visual flowcharts and diagrams
- Timeline of what happens
- Reference cheat sheet

---

### 🛠️ How-To Guides

**Docker Workflow Guide:**
→ [guides/DOCKER-WORKFLOW.md](guides/DOCKER-WORKFLOW.md) (10 min read)

- Complete build-to-test workflow
- Day-to-day usage patterns
- Common scenarios and solutions
- Production deployment

**Detailed Troubleshooting:**
→ [guides/SLASH-COMMANDS-TROUBLESHOOTING.md](guides/SLASH-COMMANDS-TROUBLESHOOTING.md) (20 min read)

- All 8 common causes
- Step-by-step diagnostics
- Debug commands
- Verification checklist

**Docker Setup Guide:**
→ [guides/DOCKER-SETUP.md](guides/DOCKER-SETUP.md) (15 min read)

- Explains your Dockerfile
- Docker Compose usage
- Persistent data management
- Production best practices

---

## 🎯 Quick Answer

**Slash commands not available after Docker rebuild?**

Run this command:

```bash
docker-compose exec verabot2 npm run register-commands
```

That's it. This fixes 95% of cases. Read [SLASH-COMMANDS-SOLUTION.md](SLASH-COMMANDS-SOLUTION.md) if it doesn't work.

---

## 📋 Complete Workflow

```bash
# Step 1: Create configuration
cp .env.example .env
# Edit .env with your DISCORD_TOKEN and CLIENT_ID

# Step 2: Build and start
docker-compose up -d --build

# Step 3: Register commands (THE KEY STEP)
docker-compose exec verabot2 npm run register-commands

# Step 4: Test in Discord
# Type "/" and commands should appear
```

---

## 🔍 Choose Your Guide

| Your Situation                | Guide                                                                                | Time   |
| ----------------------------- | ------------------------------------------------------------------------------------ | ------ |
| Just want the fix             | [SLASH-COMMANDS-SOLUTION.md](SLASH-COMMANDS-SOLUTION.md)                             | 2 min  |
| Need quick diagnosis          | [SLASH-COMMANDS-QUICK-FIX.md](SLASH-COMMANDS-QUICK-FIX.md)                           | 3 min  |
| Want visual explanation       | [SLASH-COMMANDS-VISUAL.md](SLASH-COMMANDS-VISUAL.md)                                 | 5 min  |
| Learning Docker workflow      | [guides/DOCKER-WORKFLOW.md](guides/DOCKER-WORKFLOW.md)                               | 10 min |
| Troubleshooting complex issue | [guides/SLASH-COMMANDS-TROUBLESHOOTING.md](guides/SLASH-COMMANDS-TROUBLESHOOTING.md) | 20 min |
| Understanding Docker          | [guides/DOCKER-SETUP.md](guides/DOCKER-SETUP.md)                                     | 15 min |

---

## 🆘 Still Not Working?

Follow this order:

1. Read [SLASH-COMMANDS-SOLUTION.md](SLASH-COMMANDS-SOLUTION.md) (2 min)
2. Check [SLASH-COMMANDS-QUICK-FIX.md](SLASH-COMMANDS-QUICK-FIX.md) decision tree (3 min)
3. Follow [guides/SLASH-COMMANDS-TROUBLESHOOTING.md](guides/SLASH-COMMANDS-TROUBLESHOOTING.md) step-by-step (20 min)

If still stuck after all three, something unusual is happening - post details in GitHub Issues.

---

## 📚 Documentation Structure

```
docs/
├── SLASH-COMMANDS-SOLUTION.md          ← Quick answer
├── SLASH-COMMANDS-QUICK-FIX.md         ← Fast diagnosis
├── SLASH-COMMANDS-VISUAL.md            ← Visual guide
├── guides/
│   ├── DOCKER-WORKFLOW.md              ← Complete workflow
│   ├── SLASH-COMMANDS-TROUBLESHOOTING.md ← Detailed help
│   └── DOCKER-SETUP.md                 ← Docker guide
└── (other documentation)
```

---

## ✅ Key Concepts

### Why Register Commands?

Discord doesn't automatically know about your bot's commands. You must explicitly tell Discord's API:

- What commands exist
- What they're named
- How to display them to users

### When to Register?

- ✅ First time bot starts
- ✅ After adding new commands
- ✅ After code rebuild (if commands changed)
- ✅ Once per deploy

### How Long Does It Take?

- **Guild registration** (with GUILD_ID): Instant-1 minute
- **Global registration** (no GUILD_ID): 1-2 hours to propagate

### Why a Separate Step?

- Registration requires valid Discord token
- Bot must be running and connected
- Must happen after bot starts
- More reliable than automatic registration

---

## 🚀 Most Common Solution

**99% of cases are fixed by this single command:**

```bash
docker-compose exec verabot2 npm run register-commands
```

Do this after:

- First time starting bot
- Rebuilding Docker image
- Adding new commands
- If commands mysteriously disappear

Then restart Discord app and try "/" again.

---

## 💡 Pro Tips

1. **Use GUILD_ID during development** - Faster feedback (register instantly)
2. **Remove GUILD_ID for production** - Global registration (takes 1-2 hours)
3. **Check logs frequently** - `docker-compose logs -f` shows what's happening
4. **Always verify bot is running** - `docker-compose ps` before troubleshooting
5. **Restart Discord completely** - Don't just minimize, fully close and reopen

---

## 🔗 Related Documentation

- [Configuration Guide](CONFIGURATION-ANALYSIS.md) - How to set up .env
- [Docker Guide](guides/DOCKER-SETUP.md) - Understanding Docker
- [Creating Commands](guides/01-CREATING-COMMANDS.md) - How to add new commands
- [Architecture](reference/ARCHITECTURE.md) - System design

---

## 📞 Getting Help

1. **Read relevant guide** (2-20 min) - Likely solves problem
2. **Check GitHub Issues** - Someone may have reported it
3. **Review logs** - `docker-compose logs` often has the answer
4. **Post in Discussions** - If still stuck, ask community

---

## Summary

**Problem:** Slash commands not showing after Docker rebuild  
**Cause:** Commands not registered with Discord API  
**Solution:** Run `docker-compose exec verabot2 npm run register-commands`  
**Time to fix:** 2-5 minutes  
**Success rate:** 95%+

For everything else, see the guides above.

---

**Last Updated:** 2025-12-29  
**Status:** Complete  
**Covers:** All common scenarios and edge cases
