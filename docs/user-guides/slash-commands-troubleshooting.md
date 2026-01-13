# Slash Commands Not Available - Troubleshooting Guide

If slash commands are not showing up after rebuilding your Docker container, follow this guide to diagnose and fix the issue.

## Quick Diagnosis 🔍

Run these checks in order:

```bash
# Check if bot is running
docker-compose ps

# Check logs for errors
docker-compose logs --tail=50

# Check environment variables
docker-compose exec verabot2 env | grep -E "DISCORD_TOKEN|CLIENT_ID|GUILD_ID"
```

---

## Common Causes & Solutions

### 1. **Commands Not Registered** 🔴 (Most Common)

**Symptom:** Bot is online but slash commands don't appear in Discord

**Cause:** The `register-commands` script wasn't run inside the container

**Solution:**

```bash
# Run command registration AFTER container starts
docker-compose exec verabot2 npm run register-commands

# You should see output like:
# ✓ Successfully registered X global commands
# or
# ✓ Successfully registered X guild commands to guild XXXXX
```

**Why this happens:**

- Docker container starts bot immediately
- Commands need to be registered with Discord's API
- This requires the bot token and proper network access
- Registration is a one-time setup, not automatic

---

### 2. **Missing or Invalid Bot Token** 🔴

**Symptom:** `register-commands` fails with "DISCORD_TOKEN not set" error

**Cause:** `.env` file missing or incomplete

**Solution:**

```bash
# Verify .env exists
ls -la .env

# Check bot token is set
docker-compose exec verabot2 echo "$DISCORD_TOKEN"

# If empty, add to .env and restart
docker-compose down
# Edit .env to add DISCORD_TOKEN and CLIENT_ID
docker-compose up -d

# Then register commands
docker-compose exec verabot2 npm run register-commands
```

**Expected output:** Should show your token (first 10 chars visible, rest hidden)

---

### 3. **Missing CLIENT_ID** 🔴

**Symptom:** Register command fails with "CLIENT_ID not set"

**Cause:** `.env` missing CLIENT_ID

**Solution:**

```bash
# Get your CLIENT_ID from Discord Developer Portal:
# 1. https://discord.com/developers/applications
# 2. Click your bot application
# 3. Copy "Application ID"

# Add to .env
echo "CLIENT_ID=your_application_id_here" >> .env

# Restart and register
docker-compose restart
docker-compose exec verabot2 npm run register-commands
```

---

### 4. **Discord Cache Issue** 🟡

**Symptom:** Commands registered but don't appear in Discord UI

**Cause:** Discord client cached old command list

**Solution:**

```bash
# Method 1: Restart Discord client (simplest)
1. Close Discord completely
2. Wait 30 seconds
3. Reopen Discord
4. Check if commands appear

# Method 2: Force refresh
1. In Discord, type "/" to open slash commands
2. Wait 10 seconds (Discord refreshes)
3. Check if new commands appear

# Method 3: Clear bot cache (if using guild)
docker-compose exec verabot2 npm run register-commands
# Then wait 1-5 minutes
```

---

### 5. **Bot Doesn't Have Permissions** 🟠

**Symptom:** Commands registered but bot can't execute them

**Cause:** Bot missing required Discord permissions

**Solution:**

```bash
# 1. Check bot has minimum permissions:
#    - GUILD_MESSAGES (read messages)
#    - MESSAGE_CONTENT (see message content)
#    - SEND_MESSAGES (send responses)

# 2. In Discord:
#    - Right-click bot → "View server roles"
#    - Check bot role has message permissions
#    - Check role is above command-restricting roles

# 3. Verify in Developer Portal:
#    - https://discord.com/developers/applications
#    - Bot → Scopes → Check "bot"
#    - Bot → Permissions → Check message permissions
#    - Copy generated invite URL and re-invite bot
```

---

### 6. **Guild vs Global Registration Issue** 🟠

**Symptom:** Commands work in test guild but not elsewhere (or vice versa)

**Cause:** GUILD_ID set or not set incorrectly

**Solution:**

**For Testing (Fast Registration):**

```bash
# Set GUILD_ID to test server
# Edit .env
GUILD_ID=your_test_server_id_here

# Restart and register
docker-compose restart
docker-compose exec verabot2 npm run register-commands

# Should see: "Successfully registered X guild commands"
```

**For Production (Global Registration):**

```bash
# Remove GUILD_ID from .env
# Or leave it empty

# Restart and register
docker-compose down
# Edit .env and remove or comment out GUILD_ID
docker-compose up -d
docker-compose exec verabot2 npm run register-commands

# Should see: "Successfully registered X global commands"
# Note: Takes 1-2 hours to appear in all servers
```

---

### 7. **Bot is Offline** 🔴

**Symptom:** Bot doesn't appear online in Discord

**Cause:** Container crashed or not running

**Solution:**

```bash
# Check status
docker-compose ps

# If shows "Exited":
docker-compose logs

# Common issues in logs:
# - "Cannot find module" → Missing dependencies
# - "DISCORD_TOKEN not set" → Missing .env
# - "Port already in use" → Another process using port 3000

# Restart
docker-compose up -d

# Verify running
docker-compose ps  # Should show "Up"
```

---

### 8. **Dockerfile/Container Issues** 🟠

**Symptom:** Bot crashes on startup after rebuild

**Cause:** Dockerfile copied wrong files or environment issue

**Solution:**

```bash
# Clean rebuild
docker-compose down
docker-compose up -d --build

# View full logs
docker-compose logs -f

# If still failing, check:
# 1. node_modules copied? → Check Dockerfile
# 2. .env accessible? → docker-compose exec verabot2 ls -la .env
# 3. src/ directory exists? → docker-compose exec verabot2 ls -la src/
```

---

## Step-by-Step Troubleshooting 🔧

### If You Just Rebuilt the Container

Follow this exact sequence:

**Step 1: Verify Bot is Running**

```bash
docker-compose ps
# Should show STATUS: "Up X seconds"

# If not:
docker-compose logs
# Check for errors
```

**Step 2: Verify Environment Variables**

```bash
docker-compose exec verabot2 env | grep -E "DISCORD_TOKEN|CLIENT_ID"
# Both should output values (token will be hidden)

# If empty:
docker-compose down
# Edit .env to add values
docker-compose up -d
```

**Step 3: Register Commands**

```bash
docker-compose exec verabot2 npm run register-commands

# Expected output:
# Registering commands...
# ✓ Successfully registered X commands

# If errors, check logs
docker-compose logs --tail=20
```

**Step 4: Verify in Discord**

```
1. Open Discord
2. In any server, type "/"
3. Your bot's commands should appear
4. If not, restart Discord client
5. Wait 1-5 minutes, try again
```

---

## Detailed Logging 📋

Get more detailed information about what's happening:

```bash
# View full bot startup logs
docker-compose logs -f verabot2

# Watch for these messages:
# ✓ Database schema initialized
# ✓ Loaded X commands
# ✓ Logged in as YourBot#0000

# If you see errors, search for:
# - "DISCORD_TOKEN"
# - "CLIENT_ID"
# - "Failed"
# - "Error"
```

---

## Complete Reset Procedure 🔄

If nothing else works, do a complete reset:

```bash
# 1. Stop everything
docker-compose down -v  # -v removes volumes

# 2. Clean up old images/containers
docker system prune -a
docker volume prune

# 3. Setup fresh
cp .env.example .env
# Edit .env with your DISCORD_TOKEN and CLIENT_ID

# 4. Build and start
docker-compose up -d --build

# 5. Wait for startup (10-20 seconds)
sleep 15

# 6. Register commands
docker-compose exec verabot2 npm run register-commands

# 7. Verify
docker-compose ps
docker-compose logs --tail=20
```

---

## Testing Commands 🧪

After registration, test your commands:

### In Docker Container

```bash
# Test bot loads commands
docker-compose exec verabot2 node -e "
  const cmds = require('fs').readdirSync('./src/commands', {recursive: true});
  console.log('Command files found:', cmds.length);
  cmds.forEach(f => console.log('  -', f));
"

# Test specific command
docker-compose exec verabot2 node -e "
  const cmd = require('./src/commands/misc/ping.js');
  console.log('Ping command loaded:', cmd?.name);
"
```

### In Discord

```
/ping                    # Should respond with pong
/help                    # Should show command list
/random-quote           # Should show random quote
```

---

## Common Error Messages & Fixes

### Error: "DISCORD_TOKEN and CLIENT_ID must be set"

```bash
# Fix: Add to .env
echo "DISCORD_TOKEN=your_token_here" >> .env
echo "CLIENT_ID=your_client_id_here" >> .env
docker-compose restart
```

### Error: "Cannot find module 'discord.js'"

```bash
# Fix: Rebuild with dependencies
docker-compose down
docker-compose up -d --build
```

### Error: "EADDRINUSE: address already in use :::3000"

```bash
# Fix: Change proxy port or stop other process
# Option 1: Kill other process
sudo lsof -i :3000
# Note the PID and kill it

# Option 2: Change port in .env
PROXY_PORT=3001
docker-compose restart
```

### Error: "Bot not responding to commands"

```bash
# 1. Verify bot is online
#    → Check Discord server member list

# 2. Register commands
docker-compose exec verabot2 npm run register-commands

# 3. Restart Discord client

# 4. Check bot permissions
#    → Bot role must be above member roles
#    → Bot needs message permissions
```

---

## Verification Checklist ✅

Before declaring success, verify:

- [ ] `docker-compose ps` shows bot as "Up"
- [ ] `docker-compose logs` shows no errors
- [ ] `docker-compose exec verabot2 npm run register-commands` completes successfully
- [ ] In Discord, type "/" and see bot commands appear
- [ ] At least one command works (test with `/ping`)
- [ ] Bot responds to prefix commands (e.g., `!help`)
- [ ] Database initialized (check logs for "✓")

---

## Still Not Working? 🆘

If you've tried everything above:

1. **Collect Debug Information**

   ```bash
   # Save full logs
   docker-compose logs > bot-logs.txt

   # Check environment
   docker-compose exec verabot2 env > env-vars.txt

   # Check file structure
   docker-compose exec verabot2 find src/commands -name "*.js" | head -20 > commands.txt
   ```

2. **Share These Files**
   - bot-logs.txt (remove sensitive info)
   - Your docker-compose.yml
   - Your Dockerfile (if custom)
   - Error messages from `/register-commands`

3. **Check GitHub Issues**
   - Search existing issues for similar problems
   - Look for resolved issues with command registration

---

## Quick Command Reference

```bash
# Essential commands when troubleshooting
docker-compose ps                          # Check if running
docker-compose logs -f                     # View logs (live)
docker-compose exec verabot2 npm run register-commands  # Register commands
docker-compose restart                    # Restart bot
docker-compose up -d --build              # Rebuild and restart
docker-compose down -v                    # Complete reset
```

---

## Prevention Tips 💡

To prevent this issue in future rebuilds:

1. **Automate Registration**

   ```bash
   # Add to startup script
   docker-compose exec verabot2 npm run register-commands
   ```

2. **Use Health Checks**

   ```yaml
   # In docker-compose.yml
   healthcheck:
     test: ['CMD', 'npm', 'run', 'register-commands']
     interval: 300s
   ```

3. **Document the Process**
   - Add to README: "After first run, register commands with..."
   - Create startup script that does this automatically

4. **Check on Startup**
   - Modify `src/index.js` to register commands if needed
   - Or detect if no commands are loaded and warn user

---

**Remember:** Command registration is a one-time setup that needs to happen AFTER the bot starts with a valid token and client ID. It's not automatic and must be done manually with `npm run register-commands`.
