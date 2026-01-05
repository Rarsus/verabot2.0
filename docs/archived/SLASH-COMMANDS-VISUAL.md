# Visual Guide: Slash Commands in Docker

## 🎯 One Picture is Worth 1000 Words

### The Problem

```
After docker-compose up -d --build:

User in Discord:              Bot in Docker:
    "/"                       ✓ Connected
    [No commands]             ✓ Online
    [Empty dropdown]          ✓ Listening
    ❌ Command not found      ❌ But Discord doesn't know
                                  what commands exist!
```

### The Solution

```
Run: docker-compose exec verabot2 npm run register-commands

Bot in Docker:                Discord API:
✓ Send command definitions   ✓ Receive and store
✓ "Here are my commands"     ✓ "Got it, remembering them"

Now:

User in Discord:              Bot in Docker:
    "/"                       ✓ Connected
    [/ping]                   ✓ Online
    [/help]                   ✓ Commands registered
    [/random-quote]           ✓ Listening
    ✓ Command list!           ✓ Ready to respond
```

---

## 📊 Timeline: What Happens

### Incorrect Setup (Commands Missing)

```
[Time]  [Docker]                    [Discord]
0:00    docker-compose up -d --build
0:05    Bot starts
0:06    Connects to Discord
0:07    ✓ Online in server          Users see bot online
0:08    (waiting...)                Users type "/" → No commands
10:00   (still waiting...)          Users still see no commands
∞       (forever unless you register)
```

### Correct Setup (Commands Working)

```
[Time]  [Docker]                    [Discord]
0:00    docker-compose up -d --build
0:05    Bot starts
0:06    Connects to Discord
0:07    ✓ Online in server          Users see bot online
0:08    (waiting for command)
0:10    npm run register-commands
0:15    ✓ Registering...
0:18    ✓ Sent 15 commands
0:20    (done)                      Discord updates
0:21                                Users type "/" → ✓ Commands appear!
```

---

## 🔄 Process Flowchart

```
START: Bot just rebuilt and started
  ↓
[Check: Is bot online in Discord?]
  ├─ NO → Fix startup issue (see Docker guide)
  │       └─ docker-compose logs
  │
  └─ YES → [Try "/" in Discord]
      ├─ NO commands appear → [YOU ARE HERE]
      │
      └─ Run register-commands
          ↓
          docker-compose exec verabot2 npm run register-commands
          ↓
          [Did it succeed?]
          ├─ ERROR → Check logs
          │           docker-compose logs
          │           Look for: DISCORD_TOKEN, CLIENT_ID errors
          │
          └─ SUCCESS ✓
              ↓
              Restart Discord (close completely, reopen)
              ↓
              Try "/" again
              ↓
              ✓ COMMANDS APPEAR
              ↓
              END: You did it! 🎉
```

---

## 💻 Command Cheat Sheet

### Registration Commands

| Command                                                  | What It Does                   | When to Use                          |
| -------------------------------------------------------- | ------------------------------ | ------------------------------------ |
| `docker-compose exec verabot2 npm run register-commands` | Register commands with Discord | After rebuild, after adding commands |
| `docker-compose logs`                                    | View what bot is doing         | Debugging issues                     |
| `docker-compose ps`                                      | Check if bot is running        | Verify status                        |
| `docker-compose restart`                                 | Restart bot                    | Fix stuck state                      |
| `docker-compose up -d --build`                           | Rebuild and start              | Code changes                         |

### What Each Line Does

```bash
docker-compose           # Use Docker Compose configuration
  exec                   # Execute command inside container
    verabot2             # In the 'verabot2' service
      npm run            # Run npm script
        register-commands # Script name in package.json
```

---

## 🎓 Decision Tree

```
Do you see "/" in Discord?
│
├─ NO (Discord doesn't recognize bot exists)
│  └─ Bot not running
│     └─ Run: docker-compose ps
│        └─ If "Exited": docker-compose logs
│           └─ Fix error and restart
│
└─ YES (Discord recognizes bot)
   │
   └─ Do you see commands list?
      │
      ├─ NO (Bot online but no commands)
      │  └─ Commands not registered!
      │     └─ Run: docker-compose exec verabot2 npm run register-commands
      │        └─ Restart Discord
      │           └─ Try "/" again → ✓ WORKS
      │
      └─ YES (You already have commands)
         └─ Everything working! 🎉
```

---

## 📱 What You'll See

### Before Registration (❌ Commands Missing)

```
User types "/" in Discord:

No suggestions
────────────────
(empty dropdown)
────────────────

Status: Command palette open but no commands available
```

### After Registration (✅ Commands Available)

```
User types "/" in Discord:

@YourBot help
@YourBot ping
@YourBot random-quote
@YourBot add-quote
@YourBot search-quotes
... and more ...
────────────────

Status: All commands visible and ready to use
```

---

## 🔐 Environment Variables Verification

```
Your .env file
       ↓
docker-compose reads it
       ↓
Creates container
       ↓
Sets DISCORD_TOKEN in container env
       ↓
Bot uses: process.env.DISCORD_TOKEN
       ↓
register-commands uses: process.env.DISCORD_TOKEN
       ↓
Sends to Discord API with token
       ↓
Discord validates token
       ↓
If valid → ✓ Commands registered
If invalid → ✗ Error message

Check with: docker-compose exec verabot2 env | grep DISCORD_TOKEN
```

---

## ⏱️ Time Expectations

| Task                           | Time          | Notes                    |
| ------------------------------ | ------------- | ------------------------ |
| Build image                    | 30-60 sec     | One-time, cached after   |
| Start bot                      | 5-10 sec      | Depends on deps          |
| Connect to Discord             | 2-3 sec       | Network                  |
| Register commands              | 5-15 sec      | Depends on # of commands |
| Discord refreshes              | Instant-5 min | Usually under 1 min      |
| Global registration propagates | 1-2 hours     | Only if no GUILD_ID      |

**Total time to working commands: 1-2 minutes** (usually less)

---

## 🐛 Debugging Mindset

```
Slash commands not working?

Don't panic! Follow this:

1. OBSERVE
   ├─ docker-compose ps (is it running?)
   ├─ docker-compose logs (any errors?)
   └─ Check .env (token set?)

2. HYPOTHESIZE
   ├─ "Bot not running" → Restart it
   ├─ "Not registered" → Run register command
   └─ "Cache issue" → Restart Discord

3. TEST
   ├─ Try "/" in Discord
   ├─ Check logs for success
   └─ Verify bot responds

4. ADJUST
   ├─ If still broken → Check troubleshooting guide
   └─ Repeat from step 1

5. SUCCESS
   ✓ Commands work!
```

---

## 📖 Reference Map

```
New to this?
    ↓
[SLASH-COMMANDS-SOLUTION.md] ← You probably want this
    ↓
    ├─ Still confused?
    │   ↓
    │   [SLASH-COMMANDS-QUICK-FIX.md] ← Fast answers
    │
    └─ Want full understanding?
        ↓
        [guides/DOCKER-WORKFLOW.md] ← Complete guide
        ↓
        Still have issues?
        ↓
        [guides/SLASH-COMMANDS-TROUBLESHOOTING.md] ← Detailed help
```

---

## ✅ Success Indicators

You know it's working when:

```
✓ docker-compose ps shows "Up"
✓ docker-compose logs shows no ERROR
✓ register-commands shows "✓ Successfully registered"
✓ You can type "/" in Discord
✓ Commands dropdown appears
✓ You can click and execute a command
✓ Bot responds
```

All 7? **You're done!** 🎉

---

## 🎬 Quick Start Recap

```bash
# Build and start
docker-compose up -d --build

# Register commands (don't skip this!)
docker-compose exec verabot2 npm run register-commands

# Test in Discord
# Type "/" and use a command

# Done!
```

Three commands, that's it.

---

**Remember:** Commands registration is always needed after rebuild. It's a separate step. Just run the register-commands command and you're good! 🚀
