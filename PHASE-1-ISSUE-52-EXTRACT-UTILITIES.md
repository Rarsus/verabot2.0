# Phase 1 Issue #52: Extract verabot-utils Module

**Issue**: #52  
**Title**: Extract utilities code to folder structure  
**Milestone**: Phase 1: Extraction to Folders  
**Priority**: HIGHEST (other modules depend on this)  
**Status**: In Progress  
**Created**: January 20, 2026

---

## Overview

Extract the shared services, utilities, and database abstractions into `repos/verabot-utils/` folder to create a reusable foundation for both `verabot-core` and `verabot-dashboard`.

## What Gets Extracted

### 1. Database & Connection Management

**Source**: `src/database.js`, `src/db.js`, `src/schema-enhancement.js`

**Target**: `repos/verabot-utils/src/database/`

```
repos/verabot-utils/src/database/
├── connection.js       (from src/database.js)
├── schema.js          (from src/schema-enhancement.js)
├── migrations.js      (new - migration utilities)
├── legacy-adapter.js  (deprecated db.js - for compatibility)
└── index.js           (exports)
```

### 2. Services (Core Business Logic)

**Source**: `src/services/`

**Target**: `repos/verabot-utils/src/services/`

```
repos/verabot-utils/src/services/
├── DatabaseService.js
├── GuildAwareDatabaseService.js
├── QuoteService.js
├── GuildAwareReminderService.js
├── ValidationService.js
├── DiscordService.js
├── ErrorService.js
├── WebhookListenerService.js
├── ProxyConfigService.js
├── ReminderNotificationService.js
└── index.js           (exports)
```

### 3. Core Base Classes

**Source**: `src/core/`

**Target**: `repos/verabot-utils/src/core/`

```
repos/verabot-utils/src/core/
├── CommandBase.js
├── CommandOptions.js
├── EventBase.js
├── ResponseBuilder.js
└── index.js           (exports)
```

### 4. Middleware (Cross-cutting Concerns)

**Source**: `src/middleware/`

**Target**: `repos/verabot-utils/src/middleware/`

```
repos/verabot-utils/src/middleware/
├── errorHandler.js
├── validator.js
├── logger.js
├── inputValidator.js
├── corsHandler.js
└── index.js           (exports)
```

### 5. Helpers & Utilities

**Source**: `src/utils/helpers/` and `src/utils/`

**Target**: `repos/verabot-utils/src/utils/`

```
repos/verabot-utils/src/utils/
├── helpers/
│   ├── response-helpers.js
│   ├── validation-helpers.js
│   ├── formatting-helpers.js
│   └── index.js
├── constants.js
├── error-codes.js
└── index.js           (main export)
```

## File Extraction Checklist

### Database Files (3)
- [ ] src/database.js → repos/verabot-utils/src/database/connection.js
- [ ] src/schema-enhancement.js → repos/verabot-utils/src/database/schema.js
- [ ] src/db.js → repos/verabot-utils/src/database/legacy-adapter.js (deprecated)

### Service Files (10+)
- [ ] src/services/DatabaseService.js
- [ ] src/services/GuildAwareDatabaseService.js
- [ ] src/services/QuoteService.js
- [ ] src/services/GuildAwareReminderService.js
- [ ] src/services/ValidationService.js
- [ ] src/services/DiscordService.js
- [ ] src/services/ErrorService.js
- [ ] src/services/WebhookListenerService.js
- [ ] src/services/ProxyConfigService.js
- [ ] src/services/ReminderNotificationService.js

### Core Classes (4)
- [ ] src/core/CommandBase.js
- [ ] src/core/CommandOptions.js
- [ ] src/core/EventBase.js
- [ ] src/core/ResponseBuilder.js (if exists)

### Middleware Files (5)
- [ ] src/middleware/errorHandler.js
- [ ] src/middleware/validator.js
- [ ] src/middleware/logger.js
- [ ] src/middleware/inputValidator.js
- [ ] src/middleware/corsHandler.js

### Helper Files (3+)
- [ ] src/utils/helpers/response-helpers.js
- [ ] src/utils/helpers/validation-helpers.js
- [ ] src/utils/helpers/formatting-helpers.js
- [ ] src/utils/constants.js
- [ ] src/utils/error-codes.js

### Export Files
- [ ] repos/verabot-utils/src/index.js (main entry point)
- [ ] repos/verabot-utils/src/database/index.js
- [ ] repos/verabot-utils/src/services/index.js
- [ ] repos/verabot-utils/src/core/index.js
- [ ] repos/verabot-utils/src/middleware/index.js
- [ ] repos/verabot-utils/src/utils/index.js

## Test Extraction

All tests for utils must be extracted:

**Source**: `tests/unit/services/`, `tests/unit/core/`, `tests/unit/utils/`

**Target**: `repos/verabot-utils/tests/`

```
repos/verabot-utils/tests/
├── unit/
│   ├── services/
│   │   ├── test-database-service.js
│   │   ├── test-guild-aware-db-service.js
│   │   ├── test-quote-service.js
│   │   ├── test-reminder-service.js
│   │   └── ... (15+ test files)
│   ├── core/
│   │   ├── test-command-base.js
│   │   ├── test-command-options.js
│   │   └── ... (5+ test files)
│   ├── middleware/
│   │   └── ... (5+ test files)
│   └── utils/
│       └── ... (5+ test files)
└── jest.config.js
```

**Coverage Target**: 90%+ lines, 95%+ functions, 85%+ branches

## Main Entry Point (index.js)

Create `repos/verabot-utils/src/index.js`:

```javascript
// Core Classes
const CommandBase = require('./core/CommandBase');
const CommandOptions = require('./core/CommandOptions');
const EventBase = require('./core/EventBase');

// Services
const DatabaseService = require('./services/DatabaseService');
const GuildAwareDatabaseService = require('./services/GuildAwareDatabaseService');
const QuoteService = require('./services/QuoteService');
const GuildAwareReminderService = require('./services/GuildAwareReminderService');
const ValidationService = require('./services/ValidationService');

// Middleware
const { logError, handleError } = require('./middleware/errorHandler');

// Helpers
const {
  sendSuccess,
  sendError,
  sendQuoteEmbed,
  sendDM
} = require('./utils/helpers/response-helpers');

module.exports = {
  // Core classes
  core: {
    CommandBase,
    CommandOptions,
    EventBase
  },
  
  // Services
  services: {
    DatabaseService,
    GuildAwareDatabaseService,
    QuoteService,
    GuildAwareReminderService,
    ValidationService
  },
  
  // Middleware
  middleware: {
    errorHandler: { logError, handleError }
  },
  
  // Helpers
  helpers: {
    responseHelpers: {
      sendSuccess,
      sendError,
      sendQuoteEmbed,
      sendDM
    }
  }
};
```

## Package.json Configuration

Update `repos/verabot-utils/package.json`:

```json
{
  "name": "@verabot/utils",
  "version": "1.0.0",
  "description": "Shared utilities and services for VeraBot",
  "main": "src/index.js",
  "scripts": {
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "lint": "eslint src tests",
    "lint:fix": "eslint src tests --fix"
  },
  "exports": {
    ".": "./src/index.js",
    "./core": "./src/core/index.js",
    "./services": "./src/services/index.js",
    "./middleware": "./src/middleware/index.js",
    "./utils": "./src/utils/index.js"
  },
  "dependencies": {
    "sqlite3": "^5.1.7",
    "pg": "^8.11.0",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "eslint": "^8.48.0"
  },
  "keywords": [
    "verabot",
    "utilities",
    "services",
    "database",
    "discord"
  ]
}
```

## Implementation Steps

### Step 1: Create Directory Structure
```bash
mkdir -p repos/verabot-utils/src/{database,services,core,middleware,utils/helpers}
mkdir -p repos/verabot-utils/tests/{unit/{services,core,middleware,utils},integration}
```

### Step 2: Copy Files
- Copy all identified files to their target locations
- Update relative imports to use new structure

### Step 3: Create Exports
- Create index.js files in each folder
- Create main repos/verabot-utils/src/index.js

### Step 4: Create Tests
- Copy all related test files
- Update import paths in tests
- Ensure all tests use real implementations (not deprecated paths)

### Step 5: Verify Imports
- Run `npm test` to verify all imports resolve
- Check for circular dependencies
- Validate no deprecated code usage

### Step 6: Update package.json
- Add @verabot/utils metadata
- Configure exports
- Add dev dependencies

### Step 7: Coverage Validation
```bash
npm test -- --coverage
# Must achieve: 90%+ lines, 95%+ functions, 85%+ branches
```

## Import Path Migration

### Before (Monolithic - DEPRECATED)
```javascript
const CommandBase = require('../core/CommandBase');
const { sendSuccess } = require('../utils/helpers/response-helpers');
const QuoteService = require('../services/QuoteService');
const db = require('../db');
```

### After (Modular - NEW)
```javascript
// Phase 1: Still in same repo but from utils folder
const { CommandBase } = require('@verabot/utils').core;
const { responseHelpers } = require('@verabot/utils').helpers;
const { QuoteService } = require('@verabot/utils').services;
const { GuildAwareDatabaseService } = require('@verabot/utils').services;

// Or more specifically:
const CommandBase = require('@verabot/utils/core').CommandBase;
const { sendSuccess } = require('@verabot/utils/utils').responseHelpers;
```

## Success Criteria

### Code Quality
- ✅ Zero circular dependencies
- ✅ All imports resolve correctly
- ✅ No deprecated code usage in new structure
- ✅ Zero ESLint errors

### Testing
- ✅ 90%+ line coverage
- ✅ 95%+ function coverage
- ✅ 85%+ branch coverage
- ✅ All service tests passing
- ✅ All core class tests passing
- ✅ All helper tests passing
- ✅ All middleware tests passing

### File Organization
- ✅ All 48 utility files extracted
- ✅ Proper folder structure
- ✅ Export files created
- ✅ package.json configured

### Documentation
- ✅ README.md updated
- ✅ Exports documented
- ✅ API surface defined
- ✅ Migration guide provided

## Key Decisions

### 1. No Circular Dependencies
- verabot-utils has ZERO external module dependencies
- Other modules depend on utils, never the reverse
- Enforced through architecture and testing

### 2. Service-First Design
- All business logic accessed through services
- Services handle guild isolation
- Services manage database access
- Services provide consistent error handling

### 3. Export Strategy
- Main export for convenience
- Specific exports for tree-shaking
- Deprecated exports with warnings
- Clear API surface

### 4. Testing Strategy
- Extract tests alongside code
- Use real implementations in tests (not deprecated)
- Mock external dependencies (DB, Discord API)
- Achieve highest coverage requirements (90%+)

## Timeline

**Estimated Duration**: 3-4 days

- Day 1: Create structure, copy files, create exports
- Day 2: Extract and update tests, verify imports
- Day 3: Coverage validation, documentation
- Day 4: Review and refinement

## Risks & Mitigations

### Risk: Import Path Changes
**Impact**: HIGH - Breaks all consuming code
**Mitigation**: 
- Automated find/replace
- Test suite catches issues
- PR review validates

### Risk: Circular Dependencies
**Impact**: CRITICAL - Breaks module loading
**Mitigation**:
- Architecture enforces hierarchy
- Automated tests detect cycles
- Code review catches issues

### Risk: Test Failures
**Impact**: MEDIUM - Invalid extraction
**Mitigation**:
- Extract tests alongside code
- Run tests after each step
- Maintain coverage threshold

### Risk: Missing Files
**Impact**: MEDIUM - Incomplete extraction
**Mitigation**:
- File inventory checklist
- Automated verification
- Peer review process

## Next Steps After Extraction

1. **Update Main Repo** (Issue #51)
   - Remove extracted files from main
   - Update imports to use @verabot/utils
   - Verify all tests still pass

2. **Extract Dashboard** (Issue #51)
   - Similar extraction process
   - Update imports for utils
   - Maintain 85%+ coverage

3. **Extract Core** (Issue #51)
   - Similar extraction process
   - Update imports for utils
   - Maintain 85%+ coverage

---

**Status**: Not Started  
**Assigned to**: TBD  
**Estimated**: 3-4 days  
**Milestone**: Phase 1: Extraction to Folders
