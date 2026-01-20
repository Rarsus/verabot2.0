# Phase 1 Issue #50: Module Boundaries & Extraction Plan

**Issue**: #50  
**Title**: Plan and define modular boundaries  
**Milestone**: Phase 1: Extraction to Folders  
**Status**: In Progress  
**Created**: January 20, 2026

---

## Objective

Define clear modular boundaries, dependencies, and extraction strategy for separating the monolithic VeraBot2.0 repository into three independent modules while maintaining functionality and test coverage.

---

## Module Definitions

### Module 1: verabot-core

**Purpose**: Discord bot core functionality - commands, events, business logic

**Scope**:
```
Current Location → Target Location
src/index.js → repos/verabot-core/src/index.js
src/register-commands.js → repos/verabot-core/src/register-commands.js
src/core/ → repos/verabot-core/src/core/
src/commands/ → repos/verabot-core/src/commands/
src/services/ → repos/verabot-core/src/services/ (excluding shared)
src/middleware/ → repos/verabot-core/src/middleware/
src/events/ → repos/verabot-core/src/events/
src/utils/command-*.js → repos/verabot-core/src/utils/
```

**Responsibility**:
- Discord bot connection and lifecycle management
- Command handling (slash + prefix)
- Event processing (messages, reactions, guild events)
- Business logic (quotes, reminders, AI integration)
- Bot-specific error handling

**Database Access**:
- Through guild-aware services (imported from verabot-utils)
- No direct db.js access
- Using QuoteService, ReminderService, etc.

**Dependencies**:
```
EXTERNAL:
├── discord.js v14.11.0
├── dotenv v17.2.3
└── verabot-utils (npm package, Phase 2+)

INTERNAL (to be imported from verabot-utils):
├── DatabaseService
├── QuoteService
├── GuildAwareDatabaseService
├── ValidationService
├── response-helpers
└── CommandBase
```

**Key Files** (66 files total):
- src/index.js - Bot startup
- src/commands/quote-*/* - All quote commands
- src/commands/misc/* - Utility commands
- src/services/QuoteService.js - Quote operations
- src/middleware/errorHandler.js - Error handling
- tests/unit/commands/* - Command tests
- tests/integration/commands/* - Integration tests

**Testing Requirements**:
- Coverage: 85%+ lines, 90%+ functions, 80%+ branches
- Tests: 15-20 per command category
- All command paths tested
- Error handling tested
- Guild context validated

---

### Module 2: verabot-dashboard

**Purpose**: Web dashboard and API for bot management

**Scope**:
```
Current Location → Target Location
src/dashboard/ → repos/verabot-dashboard/src/
src/api/ → repos/verabot-dashboard/src/api/
public/ → repos/verabot-dashboard/public/
views/ → repos/verabot-dashboard/views/
middleware/oauth.js → repos/verabot-dashboard/src/middleware/oauth.js
middleware/errorHandler.js → repos/verabot-dashboard/src/middleware/errorHandler.js
```

**Responsibility**:
- Express server setup and routing
- OAuth2 authentication
- Dashboard UI serving
- REST API endpoints
- Session management
- Rate limiting and security headers

**Database Access**:
- Through guild-aware services (imported from verabot-utils)
- API endpoints delegate to services
- No direct database queries

**Dependencies**:
```
EXTERNAL:
├── express v4.18.2
├── passport v0.6.0
├── axios v1.6.0
├── cors v2.8.5
├── helmet v7.0.0
└── verabot-utils (npm package, Phase 2+)

INTERNAL (to be imported from verabot-utils):
├── QuoteService
├── ReminderService
├── DatabaseService
├── ValidationService
└── response-helpers
```

**Key Files** (42 files total):
- src/index.js - Express app startup
- src/routes/* - All API routes
- src/middleware/auth.js - Authentication
- src/middleware/errorHandler.js - Error handling
- public/index.html - Dashboard UI
- tests/unit/routes/* - Route tests
- tests/integration/api/* - API tests

**Testing Requirements**:
- Coverage: 85%+ lines, 90%+ functions, 80%+ branches
- Tests: 15-20 per route category
- All routes tested (happy + error paths)
- OAuth flow tested
- API response formats validated
- CORS and security headers verified

---

### Module 3: verabot-utils

**Purpose**: Shared services, utilities, and database abstractions

**Scope**:
```
Current Location → Target Location
src/services/ → repos/verabot-utils/src/services/
src/core/CommandBase.js → repos/verabot-utils/src/core/CommandBase.js
src/core/CommandOptions.js → repos/verabot-utils/src/core/CommandOptions.js
src/core/EventBase.js → repos/verabot-utils/src/core/EventBase.js
src/middleware/ → repos/verabot-utils/src/middleware/
src/utils/helpers/ → repos/verabot-utils/src/utils/helpers/
src/db.js → repos/verabot-utils/src/db/legacy-adapter.js (deprecated)
src/database.js → repos/verabot-utils/src/database/connection.js
src/schema-enhancement.js → repos/verabot-utils/src/database/schema.js
```

**Responsibility**:
- Shared service implementations (Quote, Reminder, Database)
- Guild-aware database operations
- Input validation
- Error handling middleware
- Response formatting helpers
- Command and event base classes

**Core Services**:
1. **DatabaseService** - SQLite connection and management
2. **GuildAwareDatabaseService** - Guild-scoped operations
3. **QuoteService** - Quote CRUD and search
4. **GuildAwareReminderService** - Reminder management
5. **ValidationService** - Input validation
6. **CommandBase** - Base class for all commands
7. **response-helpers** - Consistent response formatting

**Dependencies**:
```
EXTERNAL:
├── sqlite3 v5.1.7
├── pg v8.11.0
└── winston v3.11.0

INTERNAL:
└── None (no circular dependencies)
```

**Key Files** (48 files total):
- src/services/DatabaseService.js
- src/services/GuildAwareDatabaseService.js
- src/services/QuoteService.js
- src/services/GuildAwareReminderService.js
- src/core/CommandBase.js
- src/utils/helpers/response-helpers.js
- tests/unit/services/* - Service tests
- tests/unit/core/* - Core class tests

**Testing Requirements**:
- Coverage: 90%+ lines, 95%+ functions, 85%+ branches (HIGHEST)
- Tests: 20-30 per service
- All service methods tested
- Database transactions tested
- Error handling comprehensive
- Guild isolation validated
- No cross-guild data leaks

---

## Dependency Matrix

```
┌─────────────────────────────────────────────────────────┐
│                  External Dependencies                   │
│  (npm packages, node_modules, environment variables)    │
└─────────────────────────────────────────────────────────┘
           ↓              ↓              ↓
      discord.js     express.js     sqlite3/pg
           ↓              ↓              ↓
┌──────────────────┬──────────────────┬──────────────────┐
│  verabot-core    │  verabot-        │  verabot-utils   │
│  (Discord Bot)   │  dashboard (API) │  (Shared)        │
│                  │                  │                  │
│ Commands         │ Routes           │ Services         │
│ Events           │ OAuth            │ Database         │
│ Business Logic   │ Sessions         │ Helpers          │
└──────────────────┴──────────────────┴──────────────────┘
           ↓              ↓              ↑
           └──────────────┼──────────────┘
                          ↓
        ┌─────────────────────────────────┐
        │   verabot-utils Exports         │
        │  (Phase 2+: npm package)        │
        ├─────────────────────────────────┤
        │ ✓ CommandBase                   │
        │ ✓ DatabaseService              │
        │ ✓ QuoteService                 │
        │ ✓ ReminderService              │
        │ ✓ ValidationService            │
        │ ✓ response-helpers             │
        │ ✓ errorHandler middleware      │
        └─────────────────────────────────┘
```

---

## File Inventory by Module

### verabot-core (66 files)

**Code Files** (48):
```
src/
├── index.js (1)
├── register-commands.js (1)
├── core/ (3)
│   ├── CommandBase.js → DELETE (move to utils)
│   ├── CommandOptions.js → DELETE (move to utils)
│   └── EventBase.js → DELETE (move to utils)
├── commands/ (28)
│   ├── misc/ (6 commands)
│   ├── quote-discovery/ (4 commands)
│   ├── quote-management/ (6 commands)
│   ├── quote-social/ (3 commands)
│   └── quote-export/ (1 command)
├── services/ (5)
│   ├── DiscordService.js (keep)
│   └── [others moved to utils]
├── middleware/ (3)
│   └── [errorHandler.js → copy to utils, keep here]
└── utils/ (2)
    └── [moved to utils or deprecated]

tests/
├── unit/commands/ (15)
├── unit/core/ (2)
├── integration/commands/ (5)
└── integration/discord/ (3)
```

**Config/Doc Files** (18):
- Dockerfile, Dockerfile.dev
- package.json
- .gitignore
- README.md
- .github/copilot-instructions.md

---

### verabot-dashboard (42 files)

**Code Files** (24):
```
src/
├── index.js (1)
├── routes/ (12)
│   ├── api/ (8 routes)
│   ├── auth.js (1)
│   └── dashboard.js (3)
├── middleware/ (3)
│   ├── oauth.js
│   ├── errorHandler.js
│   └── corsHandler.js
├── controllers/ (5)
│   └── [business logic, delegates to services]
└── utils/ (3)
    └── [dashboard-specific helpers]

tests/
├── unit/routes/ (10)
├── unit/middleware/ (3)
├── integration/api/ (5)
└── integration/oauth/ (2)
```

**UI/Config Files** (18):
- public/index.html
- views/*.html
- Dockerfile, Dockerfile.dev
- package.json
- .gitignore
- README.md
- .github/copilot-instructions.md

---

### verabot-utils (48 files)

**Code Files** (36):
```
src/
├── services/ (12)
│   ├── DatabaseService.js
│   ├── GuildAwareDatabaseService.js
│   ├── QuoteService.js
│   ├── GuildAwareReminderService.js
│   ├── ValidationService.js
│   ├── DiscordService.js
│   ├── ErrorService.js
│   ├── WebhookListenerService.js
│   ├── ProxyConfigService.js
│   ├── ReminderNotificationService.js
│   └── [additional services]
├── core/ (4)
│   ├── CommandBase.js
│   ├── CommandOptions.js
│   ├── EventBase.js
│   └── ResponseBuilder.js
├── middleware/ (5)
│   ├── errorHandler.js
│   ├── validator.js
│   ├── logger.js
│   ├── inputValidator.js
│   └── corsHandler.js
├── utils/ (10)
│   ├── helpers/
│   │   ├── response-helpers.js
│   │   ├── validation-helpers.js
│   │   └── formatting-helpers.js
│   └── [other utilities]
├── database/ (3)
│   ├── connection.js
│   ├── schema.js
│   └── migrations.js
└── index.js (1)

tests/
├── unit/services/ (18)
├── unit/core/ (6)
├── unit/middleware/ (5)
├── unit/utils/ (5)
└── integration/database/ (4)
```

**Config/Doc Files** (12):
- package.json (with exports)
- .gitignore
- README.md
- .github/copilot-instructions.md
- index.js (main export file)

---

## Extraction Order & Dependencies

### Phase 1.1: Extract verabot-utils (0 dependencies)
**Why first**: Other modules depend on it
- Extract all services
- Extract all core classes
- Extract all helpers
- Add comprehensive tests
- Target: 90%+ coverage

### Phase 1.2: Extract verabot-core (depends on utils)
**Why second**: Depends on utils services
- Extract all commands
- Extract all events
- Update imports to use utils
- Add command tests
- Target: 85%+ coverage

### Phase 1.3: Extract verabot-dashboard (depends on utils)
**Why third**: Depends on utils services
- Extract all routes
- Extract all middleware
- Update imports to use utils
- Add route tests
- Target: 85%+ coverage

---

## Import Changes Required

### verabot-core Changes

**Before** (monolithic):
```javascript
const { sendSuccess } = require('../utils/helpers/response-helpers');
const CommandBase = require('../core/CommandBase');
const db = require('../db');
```

**After** (modular):
```javascript
const { sendSuccess } = require('@verabot/utils').responseHelpers;
const { CommandBase } = require('@verabot/utils').core;
const { QuoteService } = require('@verabot/utils').services;
```

### verabot-dashboard Changes

**Before**:
```javascript
const { sendSuccess } = require('../utils/helpers/response-helpers');
const db = require('../db');
```

**After**:
```javascript
const { sendSuccess } = require('@verabot/utils').responseHelpers;
const { QuoteService } = require('@verabot/utils').services;
```

---

## Implementation Checklist

### Pre-Extraction
- [ ] Analyze all import statements across codebase
- [ ] Document all circular dependencies
- [ ] Create dependency graph
- [ ] Identify shared vs module-specific code
- [ ] Review test coverage for each module
- [ ] Plan database access patterns

### Phase 1.1: Extract verabot-utils
- [ ] Create folder structure in repos/verabot-utils/src/
- [ ] Copy all service files
- [ ] Copy all core classes
- [ ] Copy all helpers and middleware
- [ ] Create index.js with exports
- [ ] Update package.json
- [ ] Create/verify test files
- [ ] Verify imports work
- [ ] Achieve 90%+ coverage
- [ ] PR and review

### Phase 1.2: Extract verabot-core
- [ ] Create folder structure in repos/verabot-core/src/
- [ ] Copy all command files
- [ ] Copy all event handlers
- [ ] Update imports to use verabot-utils
- [ ] Remove duplicated code
- [ ] Update package.json
- [ ] Create/verify test files
- [ ] Verify imports work
- [ ] Test all commands
- [ ] Achieve 85%+ coverage
- [ ] PR and review

### Phase 1.3: Extract verabot-dashboard
- [ ] Create folder structure in repos/verabot-dashboard/src/
- [ ] Copy all route files
- [ ] Copy all middleware
- [ ] Update imports to use verabot-utils
- [ ] Remove duplicated code
- [ ] Update package.json
- [ ] Create/verify test files
- [ ] Verify imports work
- [ ] Test all routes
- [ ] Achieve 85%+ coverage
- [ ] PR and review

### Post-Extraction (Phase 1 Completion)
- [ ] All tests passing (3000+)
- [ ] Coverage >= 85% (all modules)
- [ ] Zero ESLint errors
- [ ] All PRs merged
- [ ] Documentation updated
- [ ] Ready for Phase 2

---

## Success Criteria

### Coverage Requirements
- verabot-core: 85%+ lines, 90%+ functions, 80%+ branches
- verabot-dashboard: 85%+ lines, 90%+ functions, 80%+ branches
- verabot-utils: 90%+ lines, 95%+ functions, 85%+ branches

### Code Quality
- ✓ Zero ESLint errors in new code
- ✓ All tests passing (100% pass rate)
- ✓ No circular dependencies
- ✓ All imports resolve correctly
- ✓ No deprecated code usage

### Testing
- ✓ 3000+ total tests
- ✓ All command paths tested
- ✓ All route paths tested
- ✓ All service methods tested
- ✓ Error handling tested
- ✓ Guild isolation verified

### Documentation
- ✓ Each module has README.md
- ✓ Each module has copilot-instructions.md
- ✓ All public APIs documented
- ✓ Migration guide created

---

## Risk Mitigation

### Risk: Circular Dependencies
**Mitigation**:
- Strict layering: core → utils ← dashboard
- No cross-imports between core and dashboard
- verabot-utils has zero external dependencies

### Risk: Import Path Changes
**Mitigation**:
- Search and replace all imports
- Automated testing catches issues
- PR review process validates

### Risk: Test Failures
**Mitigation**:
- Extract tests alongside code
- Run tests after each extraction
- Maintain 85%+ coverage threshold

### Risk: Database Connectivity
**Mitigation**:
- All DB access through services
- Services tested with mocked DB
- Integration tests with real DB

---

## Timeline

**Estimated Duration**: 6-9 days

- Day 1-2: Planning & dependency analysis (THIS ISSUE)
- Day 3: Extract verabot-utils + tests (Issue #52)
- Day 4-6: Extract verabot-core + tests (Issue #51)
- Day 7-8: Extract verabot-dashboard + tests (Issue #51)
- Day 9: Integration testing & validation

---

## Next Steps

1. **Issue #50 (Current)**: Complete boundary planning ✓ (THIS DOCUMENT)
2. **Issue #52**: Extract verabot-utils (most critical)
3. **Issue #51**: Extract verabot-core and verabot-dashboard
4. **Validation**: Run full test suite, verify coverage

---

**Status**: In Progress  
**Last Updated**: January 20, 2026  
**Assignee**: TBD  
**Milestone**: Phase 1: Extraction to Folders

