# Issue #51A: Extract Core Modules to verabot-core Package

**Status**: PLANNING PHASE  
**Blocked Until**: Issue #52 merged ✅ (Completed)  
**Next**: Ready to implement immediately after ESLint fixes ✅

## Overview

This issue extracts core Discord bot infrastructure and services into a reusable `verabot-core` npm package. The extracted core will provide the foundational components needed by any bot built on the Verabot architecture.

## Modules to Extract

### 1. Core Infrastructure (src/core/)

**Files to extract:**
- `CommandBase.js` - Base class for all commands with error handling
- `CommandOptions.js` - Unified option builder for slash/prefix commands
- `EventBase.js` - Base class for event handlers

**Why**: These are the foundational patterns used by every command and event in the bot.

**Dependencies**:
- Discord.js (peer dependency)
- `RolePermissionService` from verabot-utils
- `logError` from verabot-utils middleware

### 2. Core Services (src/services/)

**Files to extract:**
- `DatabaseService.js` - Primary database abstraction layer
- `GuildAwareDatabaseService.js` - Multi-tenant database support
- `GuildDatabaseManager.js` - Database instance management
- `DiscordService.js` - Discord.js helper methods
- `ValidationService.js` - Input validation rules
- `RolePermissionService.js` - Role-based access control
- `services/index.js` - Service exports

**Why**: These services provide core functionality needed by every bot instance.

**Dependencies**:
- `DatabaseService` from verabot-utils
- `ValidationService` from verabot-utils
- Discord.js

### 3. Helper Utilities (src/utils/helpers/)

**Files to extract:**
- `response-helpers.js` - Discord embed/message formatting
- `api-helpers.js` - API request utilities
- Additional helper functions

**Why**: Commands and services depend on these helpers for consistent Discord interactions.

**Dependencies**:
- Discord.js embeds
- May depend on services for error handling

## NOT Extracting (Bot-Specific Logic)

**These stay in main repo**:
- `src/commands/` - Bot-specific command implementations
- `src/config/` - Bot configuration
- `src/routes/` - Express routes
- `src/middleware/` - Most middleware (keep bot-specific auth, logging)
- `src/index.js` - Bot entry point
- `src/register-commands.js` - Command registration

**Why**: These are implementation-specific to this bot instance, not reusable across different bots.

## Dependency Chain

```
                        Discord.js (peer dependency)
                               ↑
                               |
    ┌──────────────────────────┼──────────────────────────┐
    |                          |                          |
CommandBase          CommandOptions              EventBase
    ↓                          ↓                          ↓
RolePermissionService    ValidationService        (no deps)
    ↓                          ↓
    └──────────────────────────┼──────────────────────────┘
                               |
              src/utils/helpers (response-helpers, etc.)
                               ↓
                     verabot-utils (already extracted)
```

## Implementation Steps

### Phase 1: Prepare verabot-core Package Structure

1. **Update package.json** in `repos/verabot-core/`
   - Add proper exports for each module
   - Define dependencies (Discord.js, verabot-utils)
   - Set up build and test scripts

2. **Create directory structure**
   ```
   repos/verabot-core/
   ├── src/
   │   ├── core/
   │   │   ├── CommandBase.js
   │   │   ├── CommandOptions.js
   │   │   ├── EventBase.js
   │   │   └── index.js
   │   ├── services/
   │   │   ├── DatabaseService.js
   │   │   ├── GuildAwareDatabaseService.js
   │   │   ├── GuildDatabaseManager.js
   │   │   ├── DiscordService.js
   │   │   ├── ValidationService.js
   │   │   ├── RolePermissionService.js
   │   │   └── index.js
   │   ├── helpers/
   │   │   ├── response-helpers.js
   │   │   ├── api-helpers.js
   │   │   └── index.js
   │   └── index.js (main entry point)
   ├── tests/
   │   ├── unit/
   │   │   ├── core/
   │   │   └── services/
   │   └── integration/
   ├── jest.config.js
   ├── eslint.config.js
   └── package.json
   ```

3. **Set up test infrastructure**
   - Copy relevant test files from main repo
   - Set up Jest configuration for verabot-core
   - Ensure 80%+ coverage target

### Phase 2: Extract Core Files

1. **Copy files** from main repo src/ to verabot-core/src/
   - Core modules (CommandBase, CommandOptions, EventBase)
   - Services (DatabaseService, GuildAwareDatabaseService, etc.)
   - Helpers (response-helpers, api-helpers, etc.)

2. **Update imports** within extracted files
   - Change relative imports to use package exports
   - Update paths to verabot-utils services
   - Ensure all dependencies are explicit

3. **Update main repo imports**
   - Change `require('../core/CommandBase')` to `require('verabot-core')`
   - Change `require('../services/DatabaseService')` to `require('verabot-core/services')`
   - Ensure main repo still has copies for backward compatibility during transition

### Phase 3: Testing & Validation

1. **Unit tests** in verabot-core
   - Run existing tests against extracted code
   - Verify all test suites pass
   - Check coverage meets 80%+ target

2. **Integration tests** in main repo
   - Verify main bot still works with verabot-core imports
   - Test command execution
   - Test service interactions

3. **End-to-end testing**
   - Deploy test bot with verabot-core package
   - Verify all commands work
   - Check database operations

### Phase 4: Documentation

1. **Create extraction guide**
   - Document what was extracted and why
   - List breaking changes (if any)
   - Provide migration guide for using verabot-core

2. **Update README files**
   - Update verabot-core README with usage examples
   - Update main repo README to reflect new structure

3. **API documentation**
   - Document exported modules and their interfaces
   - Provide usage examples for each core component

## File Size & Complexity Reference

**Estimated lines of code to extract**:
- Core modules: ~400 lines
- Services: ~2,500 lines
- Helpers: ~600 lines
- Tests: ~3,000+ lines
- **Total: ~6,500 lines**

**Estimated complexity**:
- Straightforward file extraction
- Dependency updates required
- No architectural changes needed
- Tests should transfer with minimal changes

## Timeline Estimate

- **Phase 1 (Preparation)**: 1-2 hours
  - Create package.json structure
  - Set up directory layout
  - Configure build/test scripts

- **Phase 2 (Extraction)**: 2-3 hours
  - Copy and update files
  - Fix import paths
  - Verify no breaking changes

- **Phase 3 (Testing)**: 1-2 hours
  - Run unit tests
  - Integration testing with main repo
  - Bug fixes as needed

- **Phase 4 (Documentation)**: 1 hour
  - Write guides and update READMEs

**Total Estimate**: 5-8 hours

## Success Criteria

- ✅ All core modules successfully extracted to verabot-core/
- ✅ Unit tests pass with 80%+ coverage
- ✅ Main repo tests pass using verabot-core package
- ✅ No regressions in command execution
- ✅ Documentation updated
- ✅ PR created and reviewed

## Potential Risks & Mitigation

| Risk | Mitigation |
|------|-----------|
| Circular dependencies | Use verabot-utils for shared services first |
| Breaking changes | Keep backward-compatible exports in main repo |
| Test failures | Comprehensive testing before deployment |
| Import issues | Explicit path verification before committing |

## Next Steps After Extraction

1. Publish verabot-core to npm (Phase 2 work)
2. Update main repo to use npm version
3. Begin Issue #51B (Dashboard extraction)
4. Begin Issue #53 (Integration)

---

## Appendix: File Extraction Checklist

### Core Files
- [ ] CommandBase.js
- [ ] CommandOptions.js
- [ ] EventBase.js

### Services
- [ ] DatabaseService.js
- [ ] GuildAwareDatabaseService.js
- [ ] GuildDatabaseManager.js
- [ ] DiscordService.js
- [ ] ValidationService.js
- [ ] RolePermissionService.js
- [ ] services/index.js

### Helpers
- [ ] response-helpers.js
- [ ] api-helpers.js
- [ ] helpers/index.js

### Supporting Files
- [ ] Main index.js (exports)
- [ ] package.json (with proper exports)
- [ ] Jest configuration
- [ ] ESLint configuration
- [ ] README with usage examples

---

**Created**: January 20, 2026  
**Status**: Ready for Implementation  
**Requires**: Issue #52 completion ✅
