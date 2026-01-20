# Phase 1 Issue #51: Extract Core Bot & Dashboard Modules

**Issue**: #51  
**Title**: Extract dashboard and core bot code to folder structure  
**Milestone**: Phase 1: Extraction to Folders  
**Dependency**: Requires #52 (Extract utilities) to be merged first  
**Status**: Planning (Blocked by #52)  
**Created**: January 20, 2026

---

## Overview

Extract the Discord bot core functionality and web dashboard into separate folders (`repos/verabot-core/` and `repos/verabot-dashboard/`) after utilities are extracted. This issue covers BOTH modules since they follow the same extraction pattern.

## Prerequisites

⚠️ **BLOCKED BY ISSUE #52** - Must complete utilities extraction first.

### Required Before Starting:
- [ ] #52 merged and utilities extracted to repos/verabot-utils/
- [ ] All utils tests passing with 90%+ coverage
- [ ] All utils imports working correctly
- [ ] repos/verabot-utils/src/index.js exports validated

## Part A: Extract verabot-core (66 files)

### What Gets Extracted

**Bot Core Files** → `repos/verabot-core/src/`

```
src/index.js                → repos/verabot-core/src/index.js
src/register-commands.js    → repos/verabot-core/src/register-commands.js

src/commands/               → repos/verabot-core/src/commands/
├── misc/                   (6 commands)
├── quote-discovery/        (4 commands)
├── quote-management/       (6 commands)
├── quote-social/          (3 commands)
└── quote-export/          (1 command)

src/events/                 → repos/verabot-core/src/events/
├── messageCreate.js
├── interactionCreate.js
├── guildCreate.js
└── ... (other events)

src/services/               → repos/verabot-core/src/services/
├── DiscordService.js       (keep, specific to bot)
└── [others moved to utils]

src/middleware/             → repos/verabot-core/src/middleware/
└── (command-specific middleware)

src/lib/                    → repos/verabot-core/src/lib/
└── (bot-specific utilities)
```

### Files NOT Extracted (Stay in Main Repo)
- `src/core/CommandBase.js` ✗ (moved to utils)
- `src/core/CommandOptions.js` ✗ (moved to utils)
- `src/core/EventBase.js` ✗ (moved to utils)
- `src/db.js` ✗ (moved to utils)
- `src/database.js` ✗ (moved to utils)
- `src/schema-enhancement.js` ✗ (moved to utils)
- `src/services/DatabaseService.js` ✗ (moved to utils)
- `src/services/QuoteService.js` ✗ (moved to utils)
- `src/middleware/errorHandler.js` ✗ (moved to utils)
- `src/utils/helpers/response-helpers.js` ✗ (moved to utils)

### Test Files to Extract

```
tests/
├── unit/commands/          → repos/verabot-core/tests/unit/commands/
├── unit/events/            → repos/verabot-core/tests/unit/events/
├── integration/commands/   → repos/verabot-core/tests/integration/commands/
└── integration/discord/    → repos/verabot-core/tests/integration/discord/
```

**Coverage Target**: 85%+ lines, 90%+ functions, 80%+ branches

### Import Changes for Core

**Before (Monolithic)**:
```javascript
const CommandBase = require('../core/CommandBase');
const { sendSuccess } = require('../utils/helpers/response-helpers');
const QuoteService = require('../services/QuoteService');
const db = require('../db');
```

**After (Modular)**:
```javascript
// From extracted utils (Phase 2, these become npm imports)
const { CommandBase } = require('@verabot/utils').core;
const { sendSuccess } = require('@verabot/utils').utils.helpers;
const { QuoteService } = require('@verabot/utils').services;
const { GuildAwareDatabaseService } = require('@verabot/utils').services;

// Or simpler aliases in local utils:
const CommandBase = require('../../repos/verabot-utils/src/core/CommandBase');
```

### Extraction Checklist for Core

#### Commands (20 commands)
- [ ] misc/help.js
- [ ] misc/ping.js
- [ ] misc/poem.js
- [ ] quote-discovery/random-quote.js
- [ ] quote-discovery/search-quotes.js
- [ ] quote-discovery/quote-stats.js
- [ ] quote-discovery/quote.js
- [ ] quote-management/add-quote.js
- [ ] quote-management/delete-quote.js
- [ ] quote-management/update-quote.js
- [ ] quote-management/list-quotes.js
- [ ] quote-management/quote-details.js
- [ ] quote-social/rate-quote.js
- [ ] quote-social/tag-quote.js
- [ ] quote-social/untag-quote.js
- [ ] quote-export/export-quotes.js
- [ ] ... (other commands)

#### Events (4-5 events)
- [ ] messageCreate.js
- [ ] interactionCreate.js
- [ ] guildCreate.js
- [ ] guildDelete.js (if exists)
- [ ] ready.js (if separate)

#### Tests
- [ ] tests/unit/commands/* (15+ test files)
- [ ] tests/unit/events/* (5+ test files)
- [ ] tests/integration/commands/* (5+ test files)
- [ ] tests/integration/discord/* (3+ test files)

#### Configuration
- [ ] package.json for core module
- [ ] .gitignore
- [ ] README.md
- [ ] Dockerfile & Dockerfile.dev (already created)
- [ ] .github/copilot-instructions.md (already created)

---

## Part B: Extract verabot-dashboard (42 files)

### What Gets Extracted

**Dashboard Files** → `repos/verabot-dashboard/src/`

```
src/routes/                 → repos/verabot-dashboard/src/routes/
├── api/                    (8 API routes)
│   ├── quotes.js
│   ├── reminders.js
│   ├── users.js
│   ├── stats.js
│   └── ...
├── auth.js
├── dashboard.js
└── index.js

src/middleware/             → repos/verabot-dashboard/src/middleware/
├── oauth.js
├── errorHandler.js         (keep dashboard-specific parts)
├── corsHandler.js
└── auth.js

src/controllers/            → repos/verabot-dashboard/src/controllers/
├── QuoteController.js
├── ReminderController.js
├── UserController.js
└── ...

src/utils/                  → repos/verabot-dashboard/src/utils/
└── (dashboard-specific helpers)

public/                     → repos/verabot-dashboard/public/
├── index.html
├── css/
└── js/

views/                      → repos/verabot-dashboard/views/
└── (HTML templates)
```

### Files NOT Extracted (Stay in Main Repo)
- All utils services ✗ (moved to utils)
- `src/middleware/errorHandler.js` ✗ (moved to utils)
- Database connection code ✗ (moved to utils)
- Response helpers ✗ (moved to utils)

### Test Files to Extract

```
tests/
├── unit/routes/            → repos/verabot-dashboard/tests/unit/routes/
├── unit/middleware/        → repos/verabot-dashboard/tests/unit/middleware/
├── integration/api/        → repos/verabot-dashboard/tests/integration/api/
└── integration/oauth/      → repos/verabot-dashboard/tests/integration/oauth/
```

**Coverage Target**: 85%+ lines, 90%+ functions, 80%+ branches

### Import Changes for Dashboard

**Before (Monolithic)**:
```javascript
const { sendSuccess } = require('../utils/helpers/response-helpers');
const QuoteService = require('../services/QuoteService');
const db = require('../db');
const { logError } = require('../middleware/errorHandler');
```

**After (Modular)**:
```javascript
// From extracted utils (Phase 2, these become npm imports)
const { sendSuccess } = require('@verabot/utils').utils.helpers;
const { QuoteService } = require('@verabot/utils').services;
const { GuildAwareDatabaseService } = require('@verabot/utils').services;
const { logError } = require('@verabot/utils').middleware;

// Or simpler aliases:
const { sendSuccess } = require('../../repos/verabot-utils/src/utils/helpers/response-helpers');
```

### Extraction Checklist for Dashboard

#### Routes (8 API routes)
- [ ] routes/api/quotes.js
- [ ] routes/api/reminders.js
- [ ] routes/api/users.js
- [ ] routes/api/stats.js
- [ ] routes/api/settings.js
- [ ] routes/api/auth.js
- [ ] routes/auth.js
- [ ] routes/dashboard.js

#### Middleware
- [ ] middleware/oauth.js
- [ ] middleware/corsHandler.js (dashboard-specific)
- [ ] middleware/auth.js

#### Controllers
- [ ] controllers/QuoteController.js
- [ ] controllers/ReminderController.js
- [ ] controllers/UserController.js
- [ ] controllers/SettingsController.js
- [ ] controllers/StatsController.js

#### Frontend
- [ ] public/index.html
- [ ] public/css/* (all stylesheets)
- [ ] public/js/* (all frontend scripts)
- [ ] views/* (all templates)

#### Tests
- [ ] tests/unit/routes/* (10+ test files)
- [ ] tests/unit/middleware/* (3+ test files)
- [ ] tests/integration/api/* (5+ test files)
- [ ] tests/integration/oauth/* (2+ test files)

#### Configuration
- [ ] package.json for dashboard
- [ ] .gitignore
- [ ] README.md
- [ ] Dockerfile & Dockerfile.dev (already created)
- [ ] .github/copilot-instructions.md (already created)

---

## Implementation Workflow

### Phase: Prepare (After #52 merged)

1. **Update imports in main repo**
   - Create aliases for utility imports
   - Point to repos/verabot-utils/src/
   - Verify all imports resolve

2. **Run full test suite**
   - All 3000+ tests passing
   - Coverage >= 85% across board
   - Zero import errors

### Phase 1: Extract verabot-core

**Step 1: Create structure**
```bash
mkdir -p repos/verabot-core/src/{commands,events,middleware,lib}
mkdir -p repos/verabot-core/tests/{unit,integration}
```

**Step 2: Copy files**
- Copy all command files to src/commands/
- Copy all event files to src/events/
- Copy core-specific middleware to src/middleware/
- Copy core-specific utilities to src/lib/

**Step 3: Update imports**
- Replace `require('../utils/helpers/...')` with utils references
- Replace `require('../services/...')` with utils references
- Replace `require('../db')` with utils references

**Step 4: Extract tests**
- Copy all command tests
- Copy all event tests
- Update test imports
- Verify coverage

**Step 5: Verify package.json**
```json
{
  "name": "verabot-core",
  "version": "1.0.0",
  "description": "Discord bot core for VeraBot",
  "main": "src/index.js",
  "dependencies": {
    "discord.js": "^14.11.0",
    "@verabot/utils": "file:../verabot-utils"
  }
}
```

**Step 6: Test**
```bash
cd repos/verabot-core
npm install
npm test
```

### Phase 2: Extract verabot-dashboard

**Step 1: Create structure**
```bash
mkdir -p repos/verabot-dashboard/src/{routes,middleware,controllers,utils}
mkdir -p repos/verabot-dashboard/tests/{unit,integration}
mkdir -p repos/verabot-dashboard/public/{css,js}
mkdir -p repos/verabot-dashboard/views
```

**Step 2: Copy files**
- Copy all route files to src/routes/
- Copy all middleware to src/middleware/
- Copy all controllers to src/controllers/
- Copy public files to public/
- Copy views to views/

**Step 3: Update imports**
- Replace `require('../utils/helpers/...')` with utils references
- Replace `require('../services/...')` with utils references
- Replace `require('../db')` with utils references

**Step 4: Extract tests**
- Copy all route tests
- Copy all middleware tests
- Update test imports
- Verify coverage

**Step 5: Verify package.json**
```json
{
  "name": "verabot-dashboard",
  "version": "1.0.0",
  "description": "Web dashboard for VeraBot",
  "main": "src/index.js",
  "dependencies": {
    "express": "^4.18.2",
    "@verabot/utils": "file:../verabot-utils"
  }
}
```

**Step 6: Test**
```bash
cd repos/verabot-dashboard
npm install
npm test
```

### Phase 3: Cleanup Main Repository

After both extractions complete:

1. **Remove extracted code from main repo**
   - Delete src/commands/*
   - Delete src/events/*
   - Delete public/* (dashboard files)
   - Delete views/* (dashboard files)

2. **Keep only:**
   - src/core/ (utils already has copies)
   - src/services/ (utils already has copies)
   - src/middleware/errorHandler.js (in utils)
   - src/utils/ (already in utils)
   - Main Docker/compose files
   - Root configuration

3. **Update main package.json**
   - Add @verabot/utils dependency
   - Remove command-specific scripts
   - Keep general utilities

## Success Criteria

### Coverage Requirements

**verabot-core**:
- Lines: 85%+
- Functions: 90%+
- Branches: 80%+
- Tests: 15-20 per command category

**verabot-dashboard**:
- Lines: 85%+
- Functions: 90%+
- Branches: 80%+
- Tests: 15-20 per route category

### Code Quality

✅ Zero circular dependencies between modules  
✅ All imports resolve correctly  
✅ No deprecated code usage  
✅ Zero ESLint errors in new code  
✅ All tests passing (100% pass rate)  
✅ No import conflicts  
✅ Documentation updated  

### Testing

✅ All command paths tested  
✅ All route paths tested  
✅ All error scenarios tested  
✅ OAuth flow tested  
✅ Guild isolation verified  
✅ API response formats validated  

## Timeline

**Estimated Duration**: 7-8 days total

**Core Extraction**: 3-4 days
- Day 1: Create structure, copy files
- Day 2: Update imports, verify
- Day 3: Extract tests, verify coverage
- Day 4: Review, refinement

**Dashboard Extraction**: 3-4 days
- Day 1: Create structure, copy files
- Day 2: Update imports, verify
- Day 3: Extract tests, verify coverage
- Day 4: Review, refinement

**Cleanup & Integration**: 1-2 days
- Remove extracted code from main
- Verify everything still works
- Final validation

## Risks & Mitigations

### Risk: Import Path Errors
**Impact**: HIGH - Breaks module startup
**Mitigation**:
- Automated import validation
- Test suite catches issues
- PR review process

### Risk: Test Failures  
**Impact**: MEDIUM - Invalid extraction
**Mitigation**:
- Extract tests alongside code
- Run tests after each step
- Maintain coverage threshold

### Risk: Missing Exports
**Impact**: MEDIUM - Incomplete functionality
**Mitigation**:
- File inventory checklist
- Automated verification
- Functional testing

### Risk: Circular Dependencies
**Impact**: CRITICAL - Breaks loading
**Mitigation**:
- Architecture enforces hierarchy
- Automated detection
- Code review validation

## Dependency on Previous Issues

- ⚠️ **BLOCKED BY #52**: Cannot start until utilities extracted
- Depends on #50: Module boundaries (planning complete ✓)
- Will unblock Phase 2: Git submodule conversion

---

**Status**: Planning (Blocked by #52)  
**Assigned to**: TBD  
**Estimated**: 7-8 days (after #52 complete)  
**Milestone**: Phase 1: Extraction to Folders
