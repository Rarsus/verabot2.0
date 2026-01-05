# MCP Servers Quick Reference

## Overview

5 MCP servers are configured for VeraBot2.0 to integrate with GitHub Copilot and other AI tools.

## Quick Commands

### Filesystem Server

```bash
# Get project structure
node mcp-servers/filesystem-server.js structure

# List directory
node mcp-servers/filesystem-server.js list src/commands

# Find files
node mcp-servers/filesystem-server.js find "add-quote.js"

# Read file
node mcp-servers/filesystem-server.js read src/index.js

# Search in file
node mcp-servers/filesystem-server.js search src/index.js "discord"
```

### Git Server

```bash
# Repository status
node mcp-servers/git-server.js status

# Commit history
node mcp-servers/git-server.js log 10

# File changes
node mcp-servers/git-server.js diff src/commands/quote-management/add-quote.js

# Branches
node mcp-servers/git-server.js branches

# Tags
node mcp-servers/git-server.js tags

# Commit details
node mcp-servers/git-server.js commit 826af7b
```

### Shell Server

```bash
# Run tests
node mcp-servers/shell-server.js exec "npm test"

# Run lint fix
node mcp-servers/shell-server.js exec "npm run lint:fix"

# Register commands
node mcp-servers/shell-server.js exec "npm run register-commands"

# Project info
node mcp-servers/shell-server.js info

# Available scripts
node mcp-servers/shell-server.js available

# Test scripts only
node mcp-servers/shell-server.js getTestScripts
```

### Database Server

```bash
# Database summary
node mcp-servers/database-server.js summary

# Root database stats
node mcp-servers/database-server.js root

# All guilds
node mcp-servers/database-server.js guilds

# Specific guild
node mcp-servers/database-server.js guild 123456789

# Recent quotes
node mcp-servers/database-server.js quotes root 10

# Search quotes
node mcp-servers/database-server.js search root "meme"
```

### NPM Server

```bash
# Package version
node mcp-servers/npm-server.js version

# All scripts
node mcp-servers/npm-server.js scripts

# Test scripts
node mcp-servers/npm-server.js test-scripts

# Dev scripts
node mcp-servers/npm-server.js dev-scripts

# Dependencies
node mcp-servers/npm-server.js dependencies

# Specific dependency
node mcp-servers/npm-server.js dependency discord.js

# Metadata
node mcp-servers/npm-server.js metadata

# Configuration
node mcp-servers/npm-server.js config
```

## Verification

```bash
# Full verification
node scripts/verify-mcp-setup.js

# Or add to npm scripts and use:
npm run verify:mcp
```

## Using with Copilot

Once configured, ask Copilot:

- "Show me the structure of src/commands"
- "What were the recent changes to add-quote.js?"
- "Run the tests and show me the results"
- "How many quotes are in guild 123456789?"
- "List all npm test scripts"
- "Find all files with 'QuoteService' in the name"
- "What's in the git log from the last 5 commits?"

## Whitelisted Commands

Shell server can execute these npm commands:

- `npm test`
- `npm run lint`
- `npm run lint:fix`
- `npm run register-commands`
- `npm run test:quotes`
- `npm run test:quotes-advanced`
- `npm run test:utils:base`
- `npm run test:utils:options`
- `npm run test:utils:helpers`
- `npm run test:integration`
- `npm run test:all`

## Configuration File

Location: `.mcp/servers.json`

Edit to:

- Add more whitelisted commands
- Change environment variables
- Disable specific servers
- Modify server settings

## Documentation

- **Main Guide:** `.github/COPILOT-MCP-SETUP.md`
- **Summary:** `MCP-IMPLEMENTATION-SUMMARY.md`
- **This File:** `MCP-QUICK-REFERENCE.md`

## Troubleshooting

### Database Server Fails

```bash
# Rebuild sqlite3
npm rebuild sqlite3
```

### MCP Files Missing

```bash
# Verify all files exist
node scripts/verify-mcp-setup.js
```

### Commands Not Working

```bash
# Check git is initialized
git status

# Check node_modules installed
npm install

# Check database exists
ls -la data/db/
```

## Performance Tips

1. **Cache Results** - Reuse outputs when possible
2. **Batch Operations** - Get status once instead of many calls
3. **Limit File Search** - Use specific patterns
4. **Use CLI Mode** - Test servers standalone before Copilot

## Security Notes

- **Read-Only:** All file and database access is read-only
- **Whitelisted:** Only approved commands can execute
- **Parameterized:** All SQL queries use parameters
- **Validated:** All paths are validated for safety

## Version Info

- **Node.js:** 18+ required
- **VeraBot2.0:** v2.13.0
- **MCP:** Implementation v1.0.0
- **Last Updated:** January 2026

---

**For detailed documentation, see `.github/COPILOT-MCP-SETUP.md`**
