# MCP Servers Configuration Strategy - Epic #49 Consistency

**Status**: Active - All modules  
**Date**: January 20, 2026  
**Scope**: Main repo + all submodules (verabot-core, verabot-dashboard, verabot-utils)

---

## Overview

This document defines the **consistent MCP (Model Context Protocol) server configuration** used across all Epic #49 modules and phases.

---

## Core MCP Servers (Required in ALL Modules)

### 1. Filesystem Server

**File**: `.mcp/servers.json` → `filesystem`

```json
{
  "filesystem": {
    "command": "node",
    "args": ["./mcp-servers/filesystem-server.js"],
    "env": {
      "MCP_FILESYSTEM_ROOT": "${workspaceFolder}"
    },
    "disabled": false
  }
}
```

**Purpose**:
- Read/write operations on module files
- Directory exploration
- File organization tasks

**Used By**: All modules (Phase 1, 2, 3)

---

### 2. Git Server

**File**: `.mcp/servers.json` → `git`

```json
{
  "git": {
    "command": "node",
    "args": ["./mcp-servers/git-server.js"],
    "env": {
      "MCP_GIT_REPO": "${workspaceFolder}"
    },
    "disabled": false
  }
}
```

**Purpose**:
- Version control operations
- Commit management
- Branch operations
- Submodule management (Phase 2)

**Used By**: All modules (Phase 1, 2, 3)

---

### 3. Node Package Manager Server

**File**: `.mcp/servers.json` → `npm`

```json
{
  "npm": {
    "command": "node",
    "args": ["./mcp-servers/npm-server.js"],
    "env": {
      "MCP_NPM_CWD": "${workspaceFolder}"
    },
    "disabled": false
  }
}
```

**Purpose**:
- Package dependency analysis
- Script management
- Module resolution
- Publishing preparation

**Used By**: All modules (Phase 1, 2, 3)

---

### 4. Shell Server (Command Execution)

**File**: `.mcp/servers.json` → `shell`

```json
{
  "shell": {
    "command": "node",
    "args": ["./mcp-servers/shell-server.js"],
    "env": {
      "MCP_SHELL_CWD": "${workspaceFolder}"
    },
    "disabled": false,
    "alwaysAllow": [
      "npm test",
      "npm run lint:fix",
      "npm run register-commands",
      "npm run validate",
      "npm run coverage"
    ]
  }
}
```

**Purpose**:
- Execute npm scripts safely
- Run tests and linting
- Build operations

**Used By**: All modules (Phase 1, 2, 3)

**Allowed Commands**: Predefined safe operations only

---

### 5. Database Server

**File**: `.mcp/servers.json` → `database`

```json
{
  "database": {
    "command": "node",
    "args": ["./mcp-servers/database-server.js"],
    "env": {
      "MCP_DB_ROOT": "${workspaceFolder}/data/db"
    },
    "disabled": false
  }
}
```

**Purpose**:
- Database inspection
- Schema analysis
- Query testing

**Used By**: 
- Main repo (Phase 1, 2, 3)
- verabot-core (Phase 1, 2, 3)
- verabot-utils (Phase 1, 2, 3)

---

## Module-Specific Additions

### verabot-core Addition

No additional MCP servers beyond core 5 (Discord.js is referenced through documentation, not MCP)

### verabot-dashboard Addition

No additional MCP servers beyond core 5 (Express.js is referenced through documentation)

### verabot-utils Addition

No additional MCP servers beyond core 5 (npm server covers package management)

---

## Phase-Based MCP Usage

### Phase 1: Extraction to Folders (6-9 days)

**Active MCP Servers**: All 5 core servers

**Primary Usage**:
- **filesystem**: Organize extracted code into folder structures
- **git**: Commit extracted code, manage branches
- **npm**: Manage dependencies for each folder
- **shell**: Run tests and validation scripts
- **database**: Test database operations during extraction

**Example Workflow**:
```javascript
// 1. Filesystem: Explore source files
// 2. Git: Create feature branch
// 3. Filesystem: Create folder structure  
// 4. Git: Move files with history
// 5. npm: Install dependencies
// 6. Shell: npm test
// 7. Git: Commit changes
```

---

### Phase 2: Git Submodule Conversion (2-3 days)

**Active MCP Servers**: All 5 core servers

**Primary Usage**:
- **git**: Create submodule references, manage submodule branches
- **filesystem**: Verify folder structure for submodules
- **npm**: Validate independent package.json files
- **shell**: Initialize submodule repositories
- **database**: Ensure database isolated by guild

**Example Workflow**:
```javascript
// 1. Git: Create independent repos
// 2. Filesystem: Verify folder structure
// 3. Git: Add submodules to main repo
// 4. npm: Test independent installations
// 5. Shell: npm install in submodules
// 6. Git: Commit submodule references
```

---

### Phase 3: Integration & CI/CD (11-16 days)

**Active MCP Servers**: All 5 core servers

**Primary Usage**:
- **shell**: Run integration tests, validate CI/CD
- **npm**: Manage unified dependency verification
- **git**: Merge and release management
- **filesystem**: Organize CI/CD configurations
- **database**: Integration test setup

**Example Workflow**:
```javascript
// 1. Shell: npm test (all modules)
// 2. Shell: npm run validate (lint + test)
// 3. Git: Create release branches
// 4. Shell: Docker build validation
// 5. npm: Coverage analysis
// 6. Git: Merge to main on success
```

---

## Environment Variables (Consistent Across All Modules)

### Global Configuration

```bash
# .env files (same pattern in all modules)
MCP_FILESYSTEM_ROOT=${workspaceFolder}
MCP_GIT_REPO=${workspaceFolder}
MCP_SHELL_CWD=${workspaceFolder}
MCP_NPM_CWD=${workspaceFolder}
MCP_DB_ROOT=${workspaceFolder}/data/db

# Development
NODE_ENV=development
DEBUG=verabot:*

# Testing
TEST_ENV=true
COVERAGE_THRESHOLD=85
```

### Module-Specific Overrides

**verabot-core**:
```bash
MCP_DB_ROOT=${workspaceFolder}/data/db/core
MCP_SHELL_CWD=${workspaceFolder}/repos/verabot-core
```

**verabot-dashboard**:
```bash
MCP_DB_ROOT=${workspaceFolder}/data/db/dashboard
MCP_SHELL_CWD=${workspaceFolder}/repos/verabot-dashboard
```

**verabot-utils**:
```bash
MCP_DB_ROOT=${workspaceFolder}/data/db/utils
MCP_SHELL_CWD=${workspaceFolder}/repos/verabot-utils
```

---

## Allowed Shell Commands (Security)

**Restricted to safe operations** (defined in `.mcp/servers.json`):

```json
{
  "alwaysAllow": [
    "npm test",
    "npm run lint:fix",
    "npm run register-commands",
    "npm run validate",
    "npm run coverage",
    "npm run format",
    "npm run docker:build",
    "npm run docker:build:dev",
    "npm run health-check"
  ]
}
```

**Explicitly Blocked**:
- `npm install -g` (global installs)
- `rm -rf` (destructive operations)
- Database deletions
- System commands outside workspace

---

## Consistency Validation Checklist

### Before Each Phase

- [ ] All modules have `.mcp/servers.json` configured
- [ ] Core 5 MCP servers present in all configs
- [ ] Environment variables set correctly
- [ ] Allowed shell commands documented
- [ ] Copilot instructions reference MCP servers
- [ ] Test execution via MCP shell working
- [ ] Git operations via MCP git working

### Module-Specific Checks

**verabot-core**:
- [ ] Filesystem points to `/repos/verabot-core`
- [ ] Git server configured for core repo
- [ ] Shell commands reach npm in core folder
- [ ] Database isolated to core data folder

**verabot-dashboard**:
- [ ] Filesystem points to `/repos/verabot-dashboard`
- [ ] Git server configured for dashboard repo
- [ ] Shell commands reach npm in dashboard folder
- [ ] Database isolated to dashboard data folder

**verabot-utils**:
- [ ] Filesystem points to `/repos/verabot-utils`
- [ ] Git server configured for utils repo
- [ ] Shell commands reach npm in utils folder
- [ ] npm server ready for publishing

---

## Troubleshooting MCP Issues

### Issue: MCP Server Not Responding

**Solution**:
```bash
# Check server status
node ./mcp-servers/filesystem-server.js --test
node ./mcp-servers/git-server.js --test
node ./mcp-servers/npm-server.js --test
node ./mcp-servers/shell-server.js --test
node ./mcp-servers/database-server.js --test
```

### Issue: Permissions Denied in Shell

**Solution**:
```json
{
  "alwaysAllow": [
    "npm test",
    "YOUR_COMMAND_HERE"
  ]
}
```

### Issue: Git Operations Failing

**Solution**:
```bash
# Verify git repo is accessible
cd ${workspaceFolder}
git status
git remote -v
```

### Issue: npm Dependencies Not Found

**Solution**:
```bash
# Reinstall with MCP
cd ${workspaceFolder}
npm install
```

---

## Migration Path (Phase 2 → Phase 3)

### When Converting to Submodules

1. **Create submodule repos** (Git MCP)
2. **Update MCP configs** in each submodule
3. **Test filesystem access** in each submodule context
4. **Verify git submodule operations** via git MCP
5. **Validate npm in each submodule** via npm MCP
6. **Test shell commands** in each submodule

---

## References

- `.mcp/servers.json` - MCP server configuration
- `.github/copilot-instructions.md` - Copilot requirements (references MCP)
- `repos/verabot-core/.mcp/servers.json` - Core submodule config
- `repos/verabot-dashboard/.mcp/servers.json` - Dashboard submodule config
- `repos/verabot-utils/.mcp/servers.json` - Utils submodule config

---

**Version**: 1.0  
**Last Updated**: January 20, 2026  
**Status**: Active - Applies to all Epic #49 phases  
**Consistency**: Required across all modules
