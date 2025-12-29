# 🎯 SLASH COMMANDS NOT WORKING? READ THIS FIRST

**Just rebuilt your Docker container and slash commands aren't showing?**

You're not alone. This happens to everyone. Here's the fix:

---

## ⚡ THE SOLUTION (3 STEPS)

### Step 1: Run this command
```bash
docker-compose exec verabot2 npm run register-commands
```

Wait for it to show:
```
✓ Successfully registered X commands
```

### Step 2: Restart Discord
- Close Discord completely (not just minimize)
- Wait 10 seconds
- Open Discord again

### Step 3: Test
Type "/" in Discord and your commands should appear.

---

## ✅ That's It!

**99% of cases fixed with those 3 steps.**

---

## 🤔 If That Didn't Work

Follow this order:

1. **Read this:** [SLASH-COMMANDS-SOLUTION.md](SLASH-COMMANDS-SOLUTION.md) (2 min)
   - Direct answer with explanations

2. **Try this:** [SLASH-COMMANDS-QUICK-FIX.md](SLASH-COMMANDS-QUICK-FIX.md) (3 min)
   - Decision tree to find your specific issue
   - Quick fixes for each scenario

3. **Use this:** [guides/SLASH-COMMANDS-TROUBLESHOOTING.md](guides/SLASH-COMMANDS-TROUBLESHOOTING.md) (20 min)
   - Detailed step-by-step troubleshooting
   - All 8 common causes and solutions
   - Debug commands

---

## 📊 What's Wrong?

Choose what matches your situation:

**Bot is online but "/" shows no commands?**
→ [SLASH-COMMANDS-SOLUTION.md](SLASH-COMMANDS-SOLUTION.md)

**Bot won't even start?**
→ [guides/DOCKER-SETUP.md](guides/DOCKER-SETUP.md) - "Bot Won't Start"

**Need to understand the whole process?**
→ [guides/DOCKER-WORKFLOW.md](guides/DOCKER-WORKFLOW.md)

**Something else?**
→ [SLASH-COMMANDS-INDEX.md](SLASH-COMMANDS-INDEX.md) - Full documentation index

---

## 🎓 Why This Happens

When Docker rebuilds:
1. ✅ Bot starts
2. ✅ Bot connects to Discord
3. ✅ Bot is online
4. ❌ **But Discord doesn't know what commands exist yet**
5. ❌ That's why "/" shows nothing

**You have to tell Discord what commands exist** by running the register command.

It's a one-time setup per rebuild/code change. Not automatic, but simple.

---

## 📝 Quick Checklist

Before saying "it's broken," verify:

- [ ] Bot is showing as online in Discord
- [ ] You ran `docker-compose exec verabot2 npm run register-commands`
- [ ] It showed "✓ Successfully registered"
- [ ] You restarted Discord completely
- [ ] You waited a few seconds
- [ ] You tried typing "/" again

All ✓? **It works!**

Missing a step? Go back and do it.

---

## 🔗 All Documentation

**Quick Guides (Read these first):**
- [SLASH-COMMANDS-SOLUTION.md](SLASH-COMMANDS-SOLUTION.md) - Direct answer
- [SLASH-COMMANDS-QUICK-FIX.md](SLASH-COMMANDS-QUICK-FIX.md) - Quick diagnosis
- [SLASH-COMMANDS-VISUAL.md](SLASH-COMMANDS-VISUAL.md) - Visual explanation

**How-To Guides:**
- [guides/DOCKER-WORKFLOW.md](guides/DOCKER-WORKFLOW.md) - Complete workflow
- [guides/DOCKER-SETUP.md](guides/DOCKER-SETUP.md) - Docker fundamentals
- [guides/SLASH-COMMANDS-TROUBLESHOOTING.md](guides/SLASH-COMMANDS-TROUBLESHOOTING.md) - Detailed troubleshooting

**Master Index:**
- [SLASH-COMMANDS-INDEX.md](SLASH-COMMANDS-INDEX.md) - All documentation

---

## 💻 One Command You Need

```bash
docker-compose exec verabot2 npm run register-commands
```

Copy and paste it. You're welcome. 😊

---

## 🆘 Still Stuck?

1. **Check the logs:**
   ```bash
   docker-compose logs
   ```
   Look for ERROR messages - they usually explain what's wrong.

2. **Verify bot is running:**
   ```bash
   docker-compose ps
   ```
   Should show STATUS: "Up"

3. **Check environment:**
   ```bash
   docker-compose exec verabot2 env | grep DISCORD_TOKEN
   ```
   Should output your token (partially hidden, that's ok).

4. **Read troubleshooting guide:**
   → [guides/SLASH-COMMANDS-TROUBLESHOOTING.md](guides/SLASH-COMMANDS-TROUBLESHOOTING.md)

---

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Run register command | 10 seconds |
| Restart Discord | 30 seconds |
| Test commands | 30 seconds |
| **Total** | **~2 minutes** |

You can have this working in 2 minutes. Go try it!

---

## 🎯 Next Steps

1. Run: `docker-compose exec verabot2 npm run register-commands`
2. Restart Discord
3. Type "/" and test
4. Done!

If any step fails, read the appropriate guide from the links above.

---

**Good luck! You've got this! 🚀**

P.S. If this solved your problem, you're welcome. If you need more help, pick a guide from the "All Documentation" section above.
