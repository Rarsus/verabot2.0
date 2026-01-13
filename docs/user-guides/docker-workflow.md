# Docker Workflow: Complete Setup & Commands Registration

This guide walks you through the complete process of building, starting, and registering commands in Docker.

## 📋 Complete Workflow

### Stage 1: Preparation

```bash
# 1. Navigate to repo
cd /path/to/verabot2.0

# 2. Verify files exist
ls Dockerfile          # ✓ Should exist
ls docker-compose.yml  # ✓ Should exist
ls .env               # ✗ Should NOT exist (create next)

# 3. Create .env from template
cp .env.example .env

# 4. Edit .env with your values
nano .env
# Add:
# DISCORD_TOKEN=your_bot_token_here
# CLIENT_ID=your_application_id_here
# GUILD_ID=your_test_server_id (optional, for faster testing)
```

### Stage 2: Build Docker Image

```bash
# Option A: Build only (don't start yet)
docker build -t verabot2.0:latest .

# Option B: Build and start immediately
docker-compose up -d --build

# Option C: Full clean rebuild
docker-compose down -v
docker-compose up -d --build
```

### Stage 3: Verify Bot Started

```bash
# Check container is running
docker-compose ps
# Look for: STATUS "Up X seconds"

# Check logs for startup errors
docker-compose logs --tail=30
# Should see:
# ✓ Database schema initialized
# ✓ Logged in as YourBot#0000
```

### Stage 4: Register Slash Commands ⭐ KEY STEP

```bash
# This is what most people forget!
docker-compose exec verabot2 npm run register-commands

# Expected output:
# Registering commands...
# Found command file: src/commands/misc/ping.js
# Found command file: src/commands/misc/help.js
# (... more commands ...)
# ✓ Successfully registered X commands

# If GUILD_ID set: ✓ Successfully registered X guild commands to GUILD_ID
# If no GUILD_ID: ✓ Successfully registered X global commands
```

### Stage 5: Test in Discord

```
1. Open Discord
2. Go to any server where your bot is a member
3. Type "/" and press space
4. See dropdown with your bot's commands
5. Click one and test (e.g., /ping)
6. Should get response
```

---

## 🔄 Typical Day-to-Day Workflow

### Starting the Bot

```bash
# Start (use docker-compose.yml configuration)
docker-compose up -d

# Verify running
docker-compose ps
docker-compose logs -f

# Stop when done
docker-compose down
```

### After Code Changes

```bash
# Rebuild with new code
docker-compose up -d --build

# If you added new commands, register them
docker-compose exec verabot2 npm run register-commands

# Test in Discord
```

### Running Commands in Container

```bash
# Run npm script
docker-compose exec verabot2 npm run lint
docker-compose exec verabot2 npm test

# Run arbitrary command
docker-compose exec verabot2 node -e "console.log('hello')"

# Interactive shell
docker-compose exec verabot2 /bin/sh
# Then: npm test, ls, cd, etc.
# Type: exit (to quit shell)
```

---

## 🐛 Common Scenarios

### Scenario 1: Bot Won't Start

```bash
# Check what's wrong
docker-compose logs

# Common causes:
# 1. "Cannot find module discord.js"
#    → Fix: docker-compose up -d --build

# 2. "DISCORD_TOKEN is not set"
#    → Fix: Edit .env, add token, restart

# 3. "EADDRINUSE: address already in use :::3000"
#    → Fix: Change PROXY_PORT in .env or kill other process

# Restart after fix
docker-compose restart
```

### Scenario 2: Bot Started but No Commands

```bash
# You forgot to register commands!
docker-compose exec verabot2 npm run register-commands

# Wait for success message, then restart Discord and try "/"
```

### Scenario 3: Need to Check Bot's Files

```bash
# List commands
docker-compose exec verabot2 ls -R src/commands

# View specific command
docker-compose exec verabot2 cat src/commands/misc/ping.js

# Check database
docker-compose exec verabot2 ls -lh data/
```

### Scenario 4: Need to Debug Bot

```bash
# View all environment variables
docker-compose exec verabot2 env

# Check if specific module loads
docker-compose exec verabot2 node -e "require('discord.js')"

# Run tests in container
docker-compose exec verabot2 npm test

# View bot logs in real-time
docker-compose logs -f
```

### Scenario 5: Reset Everything

```bash
# Complete reset with data loss
docker-compose down -v         # -v deletes volumes
docker system prune -a         # Remove unused images
rm .env                        # Delete config

# Start fresh
cp .env.example .env
nano .env
docker-compose up -d --build
docker-compose exec verabot2 npm run register-commands
```

---

## 📊 Docker Compose Cheatsheet

| Task                       | Command                                  |
| -------------------------- | ---------------------------------------- |
| **Start**                  | `docker-compose up -d`                   |
| **Stop**                   | `docker-compose down`                    |
| **View logs**              | `docker-compose logs -f`                 |
| **View logs (tail)**       | `docker-compose logs --tail=50`          |
| **Check status**           | `docker-compose ps`                      |
| **Rebuild**                | `docker-compose up -d --build`           |
| **Restart**                | `docker-compose restart`                 |
| **Execute command**        | `docker-compose exec verabot2 <command>` |
| **Interactive shell**      | `docker-compose exec verabot2 /bin/sh`   |
| **View config**            | `docker-compose config`                  |
| **Full reset**             | `docker-compose down -v`                 |
| **View running processes** | `docker-compose top`                     |
| **View environment**       | `docker-compose exec verabot2 env`       |

---

## 📁 File Structure for Docker

Your repo should look like:

```
verabot2.0/
├── Dockerfile          # ✓ Recipe for building image
├── docker-compose.yml  # ✓ Configuration for running container
├── .dockerignore      # ✓ Files to exclude from image
├── .env               # ✓ Your config (create from .env.example)
├── .env.example       # ✓ Template for .env
├── package.json       # ✓ Dependencies
├── package-lock.json  # ✓ Lock file
├── src/               # ✓ Bot source code
│   ├── index.js       # Entry point (bot starts here)
│   ├── register-commands.js  # Command registration
│   └── commands/      # All commands
└── data/              # ✓ Persistent data (created by bot)
    └── quotes.db      # ✓ SQLite database
```

---

## 🚀 Production Deployment

For deploying to a server:

```bash
# 1. SSH into server
ssh user@your-server.com

# 2. Clone repository
git clone https://github.com/Rarsus/verabot2.0.git
cd verabot2.0

# 3. Create .env with production tokens
nano .env
# Add DISCORD_TOKEN and CLIENT_ID

# 4. Build and start
docker-compose up -d --build

# 5. Register commands
docker-compose exec verabot2 npm run register-commands

# 6. Verify
docker-compose ps
docker-compose logs --tail=20

# 7. Set up auto-restart (optional)
sudo systemctl enable docker
```

---

## 🔐 Security Notes for Docker

**DO:**

- ✅ Keep `.env` out of git (check `.gitignore`)
- ✅ Use strong DISCORD_TOKEN
- ✅ Use unique ENCRYPTION_KEY
- ✅ Don't hardcode secrets in Dockerfile
- ✅ Use `.dockerignore` to exclude unnecessary files

**DON'T:**

- ❌ Commit `.env` to repository
- ❌ Share `.env` file with others
- ❌ Use test tokens in production
- ❌ Copy `.env` into Docker image
- ❌ Log sensitive environment variables

---

## 📞 Troubleshooting Quick Links

- **Commands not showing?** → [SLASH-COMMANDS-QUICK-FIX.md](SLASH-COMMANDS-QUICK-FIX.md)
- **Need detailed help?** → [guides/SLASH-COMMANDS-TROUBLESHOOTING.md](guides/SLASH-COMMANDS-TROUBLESHOOTING.md)
- **Docker questions?** → [guides/DOCKER-SETUP.md](guides/DOCKER-SETUP.md)
- **Configuration issues?** → [CONFIGURATION-ANALYSIS.md](CONFIGURATION-ANALYSIS.md)

---

## ✅ Checklist: Complete Setup

- [ ] Cloned repository
- [ ] Created .env from .env.example
- [ ] Added DISCORD_TOKEN to .env
- [ ] Added CLIENT_ID to .env
- [ ] Ran `docker-compose up -d --build`
- [ ] Verified bot is running: `docker-compose ps`
- [ ] No errors in logs: `docker-compose logs`
- [ ] Registered commands: `docker-compose exec verabot2 npm run register-commands`
- [ ] Got "✓ Successfully registered" message
- [ ] Tested "/" in Discord to see commands
- [ ] Executed one command successfully
- [ ] Bot shows as online in Discord

If all ✓, you're done! Your bot is running perfectly.

---

## 🎓 Understanding the Process

### Why Docker?

| Benefit         | Explanation                                         |
| --------------- | --------------------------------------------------- |
| **Isolation**   | Bot runs in isolated container, no system conflicts |
| **Consistency** | Same setup everywhere (laptop, server, CI/CD)       |
| **Easy Deploy** | One command instead of 10 setup steps               |
| **Persistence** | Data survives container restarts                    |
| **Scalability** | Run multiple containers easily                      |

### How Docker Compose Works

```
docker-compose up -d --build
           ↓
    Reads docker-compose.yml
           ↓
    Builds image from Dockerfile (if needed)
           ↓
    Creates container
           ↓
    Maps volumes (for persistent data)
           ↓
    Sets environment from .env
           ↓
    Runs: node src/index.js
           ↓
    Bot starts and connects to Discord
```

### Why Register Commands?

```
Discord API needs to know:
- What commands exist
- What they're called
- How to display them
- What permissions needed

register-commands.js does this:
- Reads all .js files in src/commands/
- Extracts command definitions
- Sends to Discord API
- Discord stores them
- Users can now type "/" and see them
```

---

## 🎯 Next Steps

1. **First Time Setup:** Follow "Complete Workflow" above
2. **Daily Use:** Use "Typical Day-to-Day Workflow"
3. **Need Help:** Check "Troubleshooting Quick Links"
4. **Deploy to Server:** Follow "Production Deployment"

---

**You now know how to build, run, and manage your bot in Docker!**
