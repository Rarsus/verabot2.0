# Copilot Instructions for VeraBot2.0

## ⚠️ CRITICAL: GitHub Issue Management - MANDATORY

**Copilot MUST create issues in the correct repository and split issues that affect multiple repositories.**

### Issue Repository Mapping

**Where to Create Issues:**

| Issue Type | Repository | Reason |
|-----------|-----------|--------|
| **Commands** (new, bugs, features) | `verabot-commands` | Commands are in their own module |
| **Bot Core** (events, lifecycle, initialization) | `verabot-core` | Core bot functionality |
| **Services** (database, validation, helpers) | `verabot-utils` | Shared services layer |
| **Dashboard** (UI, styling, routes) | `verabot-dashboard` | Web UI components |
| **Orchestration** (CI/CD, submodule mgmt, cross-module architecture) | `verabot2.0` | Main coordinator |
| **Infrastructure** (dependencies, versioning, mono-repo structure) | `verabot2.0` | Main coordinator |

### Issue Splitting Rules

**When an issue touches MULTIPLE repositories:**

1. **Create ONE parent issue in main repo (verabot2.0)**
   - Title: Use `[MULTI-REPO]` prefix
   - Description: List all affected repositories
   - Mark as epic or use labels for tracking
   - Reference all sub-issues

2. **Create child issues in each affected submodule**
   - Link to parent issue
   - Include only work specific to that repository
   - Ensure clear scope boundaries

**Example:**

```
Parent Issue (Main Repo - verabot2.0):
Title: [MULTI-REPO] Implement new quote caching system
├─ Child Issue (verabot-utils): Add cache service
├─ Child Issue (verabot-commands): Update quote commands to use cache
└─ Child Issue (verabot-core): Update initialization for cache setup
```

### Issue Assignment Best Practices

- **Single-repo issues** → Create directly in that repository
- **Multi-repo issues** → Always create parent + children pattern
- **Infrastructure issues** → Always in main repository (verabot2.0)
- **Cross-cutting concerns** → Parent in main repo + specific issues in affected modules

---

## ⚠️ CRITICAL: Submodule-Aware Development - MANDATORY

**Copilot MUST be aware of the Git submodule structure and ALWAYS place code in the correct submodule.**

Since January 21, 2026, VeraBot2.0 uses a modular architecture with independent Git submodules:

```
Main Repository (verabot2.0)
├── repos/verabot-core/          # Core bot engine, services, middleware
├── repos/verabot-dashboard/     # Web dashboard & UI components
├── repos/verabot-utils/         # Shared utilities, database layer
└── repos/verabot-commands/      # Commands module (Phase 2.5 - COMING)
```

### Submodule Responsibility Mapping

**Where Code MUST Go:**

| Code Type | Submodule | Reason |
|-----------|-----------|--------|
| Commands (all) | `repos/verabot-commands` (Phase 2.5) | Centralized command management |
| Services (Database, Validation, etc.) | `repos/verabot-utils` | Shared across modules |
| Middleware (error handling, logging) | `repos/verabot-core` | Core infrastructure |
| Event Handlers | `repos/verabot-core` | Core bot functionality |
| Dashboard/UI Components | `repos/verabot-dashboard` | Frontend only |
| Response Helpers | `repos/verabot-utils` | Shared utilities |
| Core Bot Logic | `repos/verabot-core` | Bot engine |
| Tests | Same submodule as code | Co-locate with implementation |

### Critical Rules for Module Placement

1. **NEVER** put commands in `repos/verabot-core` (they belong in `repos/verabot-commands`)
2. **NEVER** put shared utilities in individual command modules
3. **NEVER** put database services anywhere except `repos/verabot-utils`
4. **ALWAYS** verify the current submodule path before creating files
5. **ALWAYS** ensure imports reference the correct submodule path
6. **ALWAYS** keep shared code in `repos/verabot-utils` for reuse

### Validating Module Placement

Before implementing ANY code:

```bash
# Check current directory in submodule context
pwd  # Should show one of:
# /repos/verabot-core
# /repos/verabot-dashboard
# /repos/verabot-utils
# /repos/verabot-commands  (Phase 2.5)

# Verify this is correct for your code type
# Use the responsibility mapping table above
```

### Import Guidelines for Submodules

**From verabot-core to verabot-utils (CORRECT):**
```javascript
const DatabaseService = require('../../verabot-utils/src/services/DatabaseService');
```

**From commands to utils (CORRECT):**
```javascript
const { sendSuccess } = require('../../verabot-utils/src/utils/helpers/response-helpers');
```

**From verabot-core to commands (CORRECT):**
```javascript
const myCommand = require('../../verabot-commands/src/commands/category/my-command');
```

**❌ NEVER do this (INCORRECT):**
```javascript
// Don't import commands into core
const myCommand = require('../commands/category/my-command');

// Don't duplicate shared utilities
const DatabaseService = require('../services/DatabaseService');  // Wrong location
```

### Phase 2.5 - Commands Module (COMING SOON)

A dedicated `repos/verabot-commands` submodule is being created (Phase 2.5) to centralize all command code:

**Future Structure:**
```
repos/verabot-commands/
├── src/
│   ├── commands/
│   │   ├── misc/
│   │   ├── quote-discovery/
│   │   ├── quote-management/
│   │   ├── quote-social/
│   │   └── quote-export/
│   ├── register-commands.js
│   └── index.js
└── tests/
```

**Until Phase 2.5 is complete:** Commands remain in `repos/verabot-core/src/commands/` but will be extracted during Phase 2.5.

---

## ⚠️ CRITICAL: Test-Driven Development (TDD) is MANDATORY

**Copilot MUST follow TDD principles for ALL code changes.** This is non-negotiable.

- Every new function, method, class, service, or feature MUST have tests written FIRST
- Tests are written in the RED phase (failing tests)
- Then code is implemented to make tests pass (GREEN phase)
- Then code is refactored while maintaining test pass rate (REFACTOR phase)

**If Copilot implements code without writing tests first, the pull request will be rejected.**

See detailed instructions in: **Test-Driven Development (TDD) - MANDATORY** section below.

## Project Overview

VeraBot2.0 is an advanced Discord bot with organized commands, quote management system, and modern architecture. It features slash commands, legacy prefix commands, comprehensive testing, and database integration. The bot is built with a focus on maintainability, testability, and developer experience through reusable utility modules and consistent patterns.

**Key Features:**

- Discord slash commands and legacy prefix commands
- Quote management system (add, search, rate, tag, export)
- AI-powered poem generation via HuggingFace
- SQLite database with automatic schema management
- Comprehensive testing suite with 100% passing tests (3000+ tests across 67 test suites)
- Modern architecture with Command pattern and utility modules

## Technology Stack

**Core Technologies:**

- **Runtime:** Node.js 20+ (minimum v20.0.0, npm >=10.0.0)
- **Language:** JavaScript (ES2021)
- **Framework:** Discord.js v14.11.0
- **Database:** SQLite3 v5.1.7
- **Environment:** dotenv v17.2.3
- **AI Integration:** HuggingFace API (optional)

**Development Tools:**

- **Linting:** ESLint v8.48.0
- **Testing:** Jest test framework (3000+ comprehensive tests across 67 test suites)
- **Code Quality:** Pre-commit hooks with Husky
- **Containerization:** Docker & Docker Compose

## Architecture & Design Patterns

### Command-Based Architecture

All commands follow a consistent pattern using three core utility modules:

1. **Command Base Class** (`src/core/CommandBase.js`)
   - Extends all commands for automatic error handling
   - Provides consistent lifecycle methods
   - Eliminates manual try-catch blocks
   - Chainable `.register()` method

2. **Command Options Builder** (`src/core/CommandOptions.js`)
   - Single source of truth for command options
   - Unified definition for both slash and prefix commands
   - Type-safe option creation

3. **Response Helpers** (`src/utils/helpers/response-helpers.js`)
   - Standardized Discord message formatting
   - Consistent embed creation
   - Error and success message patterns

### Design Patterns Used

- **Command Pattern:** Base class inheritance for all commands
- **Builder Pattern:** Command options construction
- **Helper Pattern:** Response formatting utilities
- **Repository Pattern:** Database abstraction layer
- **Service Layer Pattern:** Business logic separation
- **Middleware Pattern:** Cross-cutting concerns

## Project Structure

```
src/
├── index.js                    # Bot entry point & event handlers
├── register-commands.js        # Command registration script
├── db.js                       # Database layer (SQLite)
├── database.js                 # Database connection management
├── schema-enhancement.js       # Database schema initialization
├── core/
│   ├── CommandBase.js          # Base class for all commands
│   ├── CommandOptions.js       # Unified option builder
│   └── EventBase.js            # Event handler base class
├── services/
│   ├── DatabaseService.js      # Database operations
│   ├── ValidationService.js    # Input validation
│   ├── QuoteService.js         # Quote-specific logic
│   └── DiscordService.js       # Discord API helpers
├── middleware/
│   ├── errorHandler.js         # Error handling & logging
│   ├── commandValidator.js     # Command validation
│   └── logger.js               # Logging utilities
├── utils/
│   ├── command-base.js         # Legacy: Use core/CommandBase.js
│   ├── command-options.js      # Legacy: Use core/CommandOptions.js
│   ├── error-handler.js        # Error handling utilities
│   ├── response-helpers.js     # Legacy: Use helpers/response-helpers.js
│   └── helpers/                # Helper functions
└── commands/
    ├── misc/                   # General utility commands
    ├── quote-discovery/        # Quote search & discovery
    ├── quote-management/       # CRUD operations for quotes
    ├── quote-social/          # Social features (rate, tag)
    └── quote-export/          # Export functionality

tests/
├── unit/                      # Unit tests for utilities & commands
└── integration/               # Integration tests

docs/
├── INDEX.md                   # Master documentation index
├── admin-guides/              # Administrator how-to guides
├── user-guides/               # End-user guides and tutorials
├── guides/                    # Developer process guides
├── reference/                 # Technical reference & architecture docs
├── architecture/              # System design and patterns
├── best-practices/            # Coding standards and best practices
├── testing/                   # Testing frameworks and patterns
└── archived/                  # Historical documentation

root/
├── README.md                  # Project overview
├── CHANGELOG.md               # Version history
├── CONTRIBUTING.md            # Contribution guidelines
├── CODE_OF_CONDUCT.md         # Community standards
├── DEFINITION-OF-DONE.md      # Definition of Done criteria
├── DOCUMENT-NAMING-CONVENTION.md  # Documentation naming standards
├── DOCUMENTATION-INDEX.md     # Root docs navigation
├── COMMAND-REFERENCE-QUICK.md # Quick command reference
├── PHASE-*.md                 # Phase deliverables & summaries
└── TEST-*.md                  # Testing documentation
```

## Coding Guidelines & Conventions

### Code Style & Formatting

**All repositories (main + submodules) use aligned code standards:**

#### Prettier Configuration (Shared)
All repositories use Prettier for consistent formatting:
- **Semi-colons**: Required (true)
- **Trailing commas**: ES5 style
- **Single quotes**: Always
- **Print width**: 120 characters
- **Tab width**: 2 spaces
- **No tabs**: Use spaces only
- **Prose wrap**: Preserve

**Apply Prettier consistently:**
```bash
# Format all files
npm run format

# OR in any submodule
cd repos/verabot-core
npm run format
```

#### ESLint Configuration (Shared Rules)

**All repositories share core ESLint rules:**

**Test Files** - Special exceptions for `tests/**/*.js`, `**/*.test.js`:
```javascript
{
  'no-unused-expressions': 'off',
  'max-lines-per-function': 'off',
  'max-nested-callbacks': 'off',
  'max-depth': 'off',
  'complexity': 'off',
  'security/detect-object-injection': 'off',
  'security/detect-non-literal-fs-filename': 'off',
  'security/detect-unsafe-regex': 'off',
  'security/detect-possible-timing-attacks': 'off',
  'no-return-await': 'off',
  'no-unused-vars': 'off',
}
```

**Rationale for test exceptions:**
- Tests intentionally have complex nested structures (describe/it blocks)
- Test assertions often use expressions that appear unused
- Test mocks and fixtures have legitimate security bypass needs
- Mock parameters are intentionally unused

**Core Rules (ALL files except tests):**
- `eqeqeq: ['error', 'always']` - Strict equality always
- `no-eval: 'error'` - Never use eval
- `no-console: 'off'` - Console logging allowed (development aids)
- `no-unused-vars: ['warn', { argsIgnorePattern: '^_' }]` - Warn on unused (allow intentional with _)
- `complexity: ['warn', 18]` - Warn if function exceeds complexity 18

**Security Rules (ALL files, more lenient in tests):**
- `security/detect-object-injection: 'warn'` - Warn on object injection patterns
- `security/detect-non-literal-fs-filename: 'warn'` - Warn on dynamic file paths
- `security/detect-unsafe-regex: 'warn'` - Warn on potentially unsafe regex

#### Style Consistency Across Submodules

**Variable naming:** camelCase (e.g., `userId`, `quoteText`)
**Classes:** PascalCase (e.g., `CommandBase`, `MyCommand`)
**Constants:** UPPER_SNAKE_CASE for true constants
**Files:** kebab-case (e.g., `add-quote.js`, `command-base.js`)
**Methods:** camelCase (e.g., `execute()`, `register()`)
**Private fields:** Prefix with underscore (e.g., `_cache`, `_config`)

### Command Development

**ALWAYS use the Command base class pattern:**

```javascript
const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendSuccess, sendError, sendQuoteEmbed } = require('../../utils/helpers/response-helpers');

// Define options
const { data, options } = buildCommandOptions('commandname', 'Description', [
  { name: 'arg', type: 'string', required: true, description: 'Argument description' },
]);

class CommandName extends Command {
  constructor() {
    super({ name: 'commandname', description: 'Description', data, options });
  }

  async execute(message, args) {
    // Legacy prefix command handler
    // Errors are automatically handled by base class
  }

  async executeInteraction(interaction) {
    // Slash command handler
    // Errors are automatically handled by base class
  }
}

module.exports = new CommandName().register();
```

### Code Style Rules

- **Variables:** Use camelCase (e.g., `userId`, `quoteText`)
- **Classes:** Use PascalCase (e.g., `CommandBase`, `MyCommand`)
- **Constants:** Use UPPER_SNAKE_CASE for true constants
- **Files:** Use kebab-case (e.g., `add-quote.js`, `command-base.js`)
- **Semicolons:** REQUIRED - enforced by ESLint
- **Async/Await:** ALWAYS use instead of `.then()` chains
- **Error Handling:** Let Command base class handle errors automatically
- **No Console.log:** Use proper logging (console is allowed for now)

### Response Helpers Usage

**ALWAYS use response helpers instead of raw Discord API calls:**

```javascript
// ✅ GOOD - Use response helpers
await sendSuccess(interaction, 'Operation successful!');
await sendError(interaction, 'Something went wrong', true);
await sendQuoteEmbed(interaction, quote, 'Quote Title');
await sendDM(user, 'Direct message content');

// ❌ BAD - Don't use raw Discord API
await interaction.reply({ content: 'Message', ephemeral: true });
```

### Database Patterns - Guild-Aware Services

**⚠️ IMPORTANT: Use guild-aware services, NOT the legacy db.js wrapper**

All database operations must use guild-aware services that enforce mandatory guild context:

**For Quote Operations:**

```javascript
// ✅ CORRECT - Use QuoteService with guild context
const quoteService = require('../../services/QuoteService');

const guildId = interaction.guildId;
const quote = await quoteService.getQuoteById(guildId, id);
const quotes = await quoteService.getAllQuotes(guildId);
await quoteService.addQuote(guildId, text, author);
```

**For Reminder Operations:**

```javascript
// ✅ CORRECT - Use GuildAwareReminderService with guild context
const reminderService = require('../../services/GuildAwareReminderService');

const guildId = interaction.guildId;
const reminder = await reminderService.getReminderById(guildId, id);
await reminderService.addReminder(guildId, userId, text, dueDate);
```

**For Direct Database Access (rare):**

```javascript
// ✅ CORRECT - Use GuildAwareDatabaseService for raw operations
const guildDbService = require('../../services/GuildAwareDatabaseService');

const guildId = interaction.guildId;
const result = await guildDbService.executeQuery(guildId, sql, params);
```

**❌ DEPRECATED - Do NOT use:**

```javascript
// ❌ WRONG - db.js wrapper is deprecated, remove all uses
const db = require('../../db');
await db.getQuote(id); // No guild context!
await db.addQuote(text, author); // No guild isolation!
```

**Why guild-aware services?**

- ✅ Mandatory guild context prevents cross-guild data leaks
- ✅ Clear intent: every operation is explicitly guild-scoped
- ✅ Easy to test by mocking a single service
- ✅ Supports multi-guild and multi-database architectures
- ✅ Consistent API across all commands

**Timeline:**

- db.js is marked **DEPRECATED** as of January 2026
- All new code MUST use guild-aware services
- db.js will be fully removed in v4.0.0

See `docs/reference/DB-DEPRECATION-TIMELINE.md` for detailed migration guide.

### Test-Driven Development (TDD) - MANDATORY

**⚠️ CRITICAL: COPILOT MUST FOLLOW TDD FOR ALL CODE CHANGES**

This is **NON-NEGOTIABLE**. Every code change, bug fix, feature, or implementation MUST follow the TDD workflow below. No exceptions.

**What triggers TDD requirement:**
- ✅ Creating new functions, methods, or classes
- ✅ Creating new services or utilities
- ✅ Adding new features or commands
- ✅ Fixing bugs (write test that reproduces bug first)
- ✅ Refactoring existing code
- ✅ Adding database migrations

**What does NOT require TDD:**
- ❌ Configuration file changes (`.env`, `.yml`, etc.)
- ❌ Documentation updates
- ❌ Dependency upgrades (unless code changes required)

**Copilot Workflow (MANDATORY):**

1. **BEFORE ANY CODE:** Ask user confirmation or proceed with explicit TDD workflow statement
2. **Create test file FIRST** - No implementation until tests exist
3. **Write RED phase tests** - All tests should initially FAIL
4. **Run tests** - Verify RED phase (tests fail as expected)
5. **Implement GREEN phase** - Write minimal code to pass tests
6. **Run tests again** - Verify GREEN phase (all tests pass)
7. **Check coverage** - Verify coverage meets thresholds
8. **Commit with message** - Include test file and implementation together

**All new code MUST follow strict Test-Driven Development principles:**

#### TDD Workflow (RED → GREEN → REFACTOR)

1. **RED Phase - Write Tests First**
   - Create test file BEFORE implementation
   - Define test cases for all scenarios (happy path, error paths, edge cases)
   - Run tests (should FAIL - RED)
   - Tests drive design and requirements

2. **GREEN Phase - Implement Minimum Code**
   - Write ONLY code needed to pass tests
   - Keep implementation focused and simple
   - All tests PASS (GREEN)
   - No over-engineering

3. **REFACTOR Phase - Improve Quality**
   - Optimize code while tests remain passing
   - Improve readability and maintainability
   - All tests STILL PASS
   - No new functionality during refactor

**This is NON-NEGOTIABLE for new code.**

#### Coverage Requirements by Module Type

| Module Type   | Lines    | Functions | Branches | Test Count |
| ------------- | -------- | --------- | -------- | ---------- |
| Core Services | **85%+** | **90%+**  | **80%+** | 20-30      |
| Utilities     | **90%+** | **95%+**  | **85%+** | 15-25      |
| Commands      | **80%+** | **85%+**  | **75%+** | 15-20      |
| Middleware    | **95%+** | **100%**  | **90%+** | 20-25      |
| New Features  | **90%+** | **95%+**  | **85%+** | 20-30      |

#### Test Requirements Checklist

Before ANY code is committed, verify:

- ✅ Test file created BEFORE implementation code
- ✅ **IMPORTANT: Import real code from NEW locations** (not deprecated paths)
- ✅ All public methods have test cases
- ✅ Happy path scenarios tested
- ✅ Error scenarios tested (all error types)
- ✅ Edge cases tested (boundary conditions, invalid inputs, null/empty values)
- ✅ Async/await error handling tested
- ✅ Database transactions tested (if applicable)
- ✅ Discord interaction mocking tested (if applicable)
- ✅ Coverage thresholds met (see table above)
- ✅ All tests PASS locally: `npm test`
- ✅ No ESLint errors: `npm run lint`
- ✅ Coverage maintained/improved: `npm test -- --coverage`

#### Import Rules for Tests (CRITICAL)

**What to import and test:**

```javascript
// ✅ Core modules - ALWAYS import and test these
const CommandBase = require('../../../src/core/CommandBase');
const CommandOptions = require('../../../src/core/CommandOptions');

// ✅ Services - ALWAYS import and test these
const DatabaseService = require('../../../src/services/DatabaseService');
const GuildAwareDatabaseService = require('../../../src/services/GuildAwareDatabaseService');
const QuoteService = require('../../../src/services/QuoteService');
const GuildAwareReminderService = require('../../../src/services/GuildAwareReminderService');

// ✅ Middleware - ALWAYS import and test these
const { logError } = require('../../../src/middleware/errorHandler');
const { validateInput } = require('../../../src/middleware/inputValidator');

// ✅ Helpers - ALWAYS import and test these
const { sendSuccess, sendError } = require('../../../src/utils/helpers/response-helpers');
```

**What NOT to import:**

```javascript
// ❌ DO NOT import from deprecated locations
const CommandBase = require('../../../src/utils/command-base');  // WRONG
const db = require('../../../src/db');  // WRONG
const errorHandler = require('../../../src/utils/error-handler');  // WRONG

// ❌ DO NOT avoid testing functionality to avoid deprecated code
// If you need database functionality, import DatabaseService (NEW)
// If you need error handling, import errorHandler (MIDDLEWARE)
// If you need validation, import inputValidator (MIDDLEWARE)
```

**Example: Correct test that imports real code:**

```javascript
// ✅ CORRECT - Imports from new location, tests actual service
const DatabaseService = require('../../../src/services/DatabaseService');
const QuoteService = require('../../../src/services/QuoteService');

describe('Quote Management', () => {
  let db;
  let quoteService;

  beforeEach(async () => {
    db = new DatabaseService(':memory:');
    await db.initialize();
    quoteService = new QuoteService(db);
  });

  it('should add quote to database', async () => {
    const quote = await quoteService.addQuote(
      'guild-123',
      'Great quote',
      'Author'
    );
    assert.strictEqual(quote.guildId, 'guild-123');
  });
});
```

#### Test File Structure (MANDATORY)

```javascript
// tests/unit/test-{module-name}.js
const assert = require('assert');
const Module = require('../path/to/module');

describe('ModuleName', () => {
  let testData;

  beforeEach(() => {
    // Initialize test data
    testData = {
      /* ... */
    };
  });

  afterEach(() => {
    // Cleanup resources
    // Close databases, clear mocks, etc.
  });

  describe('methodName()', () => {
    // Test happy path
    it('should return expected result for valid input', () => {
      const result = Module.methodName(testData);
      assert.strictEqual(result, expected);
    });

    // Test error scenarios
    it('should throw error for invalid input', () => {
      assert.throws(() => {
        Module.methodName(null);
      }, /Expected error message/);
    });

    // Test edge cases
    it('should handle edge case: empty input', () => {
      const result = Module.methodName('');
      assert.strictEqual(result, null);
    });
  });
});
```

#### Mocking Standards

**Discord.js Mocking:**

```javascript
const mockInteraction = {
  user: { id: 'test-user-123', username: 'TestUser' },
  guildId: 'test-guild-456',
  channelId: 'test-channel-789',
  reply: async (msg) => ({ id: 'msg-123', ...msg }),
  deferReply: async () => ({}),
  editReply: async (msg) => ({ id: 'msg-123', ...msg }),
  followUp: async (msg) => ({ id: 'msg-456', ...msg }),
};
```

**Database Mocking:**

```javascript
// Use in-memory SQLite for isolated tests
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

// Initialize schema in beforeEach
// Reset/cleanup in afterEach
```

**Service Mocking:**

```javascript
// Mock external services to avoid dependencies
const mockService = {
  method: async (param) => {
    return { success: true, data: {} };
  },
};
```

#### Error Path Testing (CRITICAL)

Every error scenario must be tested:

```javascript
describe('error handling', () => {
  it('should handle database connection error', async () => {
    // Setup mock to throw error
    // Assert error is caught and handled
  });

  it('should handle invalid Discord permissions', async () => {
    // Setup mock user without permissions
    // Assert permission denial is handled
  });

  it('should handle timeout errors', async () => {
    // Setup slow/timeout scenario
    // Assert timeout handling
  });

  it('should handle race conditions', async () => {
    // Setup concurrent operations
    // Assert proper synchronization
  });
});
```

#### Integration Testing

For complex workflows, add integration tests:

```javascript
// tests/integration/test-integration-{feature}.js
describe('Feature Integration', () => {
  it('should complete full workflow', async () => {
    // Setup initial state
    // Perform multiple operations
    // Assert final state
  });
});
```

#### Pre-Commit Testing Workflow

MANDATORY before every commit:

```bash
# 1. Run specific module tests
npm test -- tests/unit/test-{module-name}.js

# 2. Check code style
npm run lint

# 3. Generate coverage report
npm test -- --coverage

# 4. Verify coverage meets thresholds
npm run coverage:validate

# 5. Run all tests before push
npm test

# Only commit if ALL checks pass
```

#### Coverage Maintenance

- **Current:** 79.5% (lines) | 82.7% (functions) | 74.7% (branches)
- **Target:** 90%+ (lines) | 95%+ (functions) | 85%+ (branches)
- **Never decrease** existing coverage
- **Always improve** coverage with new code

See `CODE-COVERAGE-ANALYSIS-PLAN.md` for detailed coverage roadmap and priorities.

#### Testing Guidelines Summary

- ✅ **Write tests FIRST**, not after
- ✅ **Test all code paths**, not just happy paths
- ✅ **Use mocks** for external dependencies
- ✅ **Keep tests focused** (one concept per test)
- ✅ **Name tests clearly** (describe what is being tested)
- ✅ **Cleanup after tests** (no side effects between tests)
- ✅ **Test async code properly** (promises, callbacks, streams)
- ✅ **Test error handling** (all error types and edge cases)
- ✅ **Maintain test documentation** (comment complex test logic)
- ✅ **Run tests frequently** (before every commit)

**Violation of TDD requirements will result in rejection of pull requests.**

## Command Categories

Commands are organized by purpose:

1. **misc/** - General utility commands (hi, ping, help, poem)
2. **quote-discovery/** - Finding quotes (random-quote, search-quotes, quote-stats)
3. **quote-management/** - CRUD operations (add-quote, delete-quote, update-quote, list-quotes, quote)
4. **quote-social/** - Social features (rate-quote, tag-quote)
5. **quote-export/** - Data export (export-quotes)

**When creating new commands:**

- Place in the appropriate category folder
- If creating a new category, follow the existing naming pattern
- Update help command if adding new command categories

## Development Workflow

### Creating a New Command

1. **Choose category** based on command purpose
2. **Create file** in appropriate `src/commands/` subdirectory
3. **Use Command base class** - extend from `Command`
4. **Build options** using `buildCommandOptions()`
5. **Use response helpers** for all Discord messages
6. **Add tests** in `tests/unit/` or `tests/integration/`
7. **Run tests** with `npm test`
8. **Lint code** with `npm run lint`
9. **Register commands** with `npm run register-commands`
10. **Test in Discord** to verify functionality

### Making Changes to Existing Commands

1. **Read existing code** to understand current implementation
2. **Maintain patterns** - don't break from Command base class usage
3. **Update tests** to reflect changes
4. **Run tests** to ensure nothing breaks
5. **Test in Discord** to verify changes work

### Testing Strategy

**TDD is mandatory for all development.** See section: **Test-Driven Development (TDD) - MANDATORY** above.

```bash
npm test                        # Quick sanity checks
npm run test:all               # All tests (500+ tests)
npm run test:coverage          # Coverage report
npm run test:quotes            # Quote system tests
npm run test:utils:base        # Command base tests
npm run test:utils:options     # Options builder tests
npm run test:utils:helpers     # Response helpers tests
npm run test:integration:*     # Integration tests
npm run lint                   # Code style checks
```

**Test Coverage Expectations:**

- **Line Coverage:** 90%+ (target from 79.5%)
- **Function Coverage:** 95%+ (target from 82.7%)
- **Branch Coverage:** 85%+ (target from 74.7%)
- **Test Pass Rate:** 100% (maintain)
- **All untested modules:** Eliminated (from 2 to 0)

**Coverage Priority Roadmap:**
See `CODE-COVERAGE-ANALYSIS-PLAN.md` for detailed implementation roadmap:

- Phase 1: Critical foundation (response-helpers, ReminderNotificationService, DatabaseService)
- Phase 2: Service completeness (ReminderService, errorHandler, WebhookListenerService, ProxyConfigService)
- Phase 3: New features (resolution-helpers, features.js)
- Phase 4: Optimization (branch coverage, edge cases, performance)

### Code Quality Standards

- **No ESLint errors** - Run `npm run lint` before committing
- **Tests passing** - Run `npm test` before committing
- **Consistent patterns** - Follow Command base class approach
- **Documentation** - Update docs when changing architecture
- **Minimal changes** - Make surgical, focused changes

## Environment Configuration

Required environment variables (`.env` file):

```env
# Required
DISCORD_TOKEN=your_bot_token_here         # Discord bot token
CLIENT_ID=your_client_id_here             # Discord application ID

# Optional
GUILD_ID=optional_test_guild_id           # Speeds up command registration
PREFIX=!                                   # Prefix for legacy commands (default: !)
HUGGINGFACE_API_KEY=optional_key          # For AI poem generation
```

## Important Implementation Notes

### Error Handling

- **NEVER** write manual try-catch blocks in command classes
- The Command base class handles ALL errors automatically
- Just write your logic; errors are caught and logged
- Use response helpers for user-facing error messages

### Command Registration

- Commands self-register via `.register()` method
- Both slash and prefix commands are supported
- Options are shared between both command types
- Registration script: `src/register-commands.js`

### Database Schema

- Auto-initialized on first run via `schema-enhancement.js`
- Tables: quotes, ratings, tags, quote_tags
- All queries use prepared statements for SQL injection protection

### Deprecation Notes & Testing Requirements

**Deprecated (DO NOT USE):**
- `src/utils/command-base.js` → **Use:** `src/core/CommandBase.js`
- `src/utils/command-options.js` → **Use:** `src/core/CommandOptions.js`
- `src/utils/response-helpers.js` → **Use:** `src/utils/helpers/response-helpers.js`
- `src/utils/error-handler.js` → **Use:** `src/middleware/errorHandler.js`
- `src/db.js` → **Use:** Guild-aware services (`src/services/GuildAwareDatabaseService.js`)

**What This Means for Testing:**
- ✅ **DO import** from `src/core/`, `src/services/`, `src/middleware/`
- ✅ **DO test** actual service implementations with real execution
- ✅ **DO test** database operations through DatabaseService
- ✅ **DO test** error handling through errorHandler middleware
- ❌ **DON'T import** from deprecated locations
- ❌ **DON'T mock** services when you can test real implementations
- ❌ **DON'T avoid** testing actual code to avoid deprecated imports

**Critical:** The deprecation applies to CODE LOCATIONS, not to functionality. You must still test all functionality—just import from NEW locations, not deprecated ones.

**Manual error handling in commands is deprecated** - Use CommandBase
**Raw Discord API calls in commands should use response helpers** - Use `src/utils/helpers/response-helpers.js`
**Inconsistent option definitions should use CommandOptions** - Use `src/core/CommandOptions.js`

## Documentation Resources

**Documentation Standards & Navigation:**

- [DOCUMENT-NAMING-CONVENTION.md](../../DOCUMENT-NAMING-CONVENTION.md) - Complete naming convention guide (follow this for all new docs)
- [DOCUMENTATION-INDEX.md](../../DOCUMENTATION-INDEX.md) - Master root-level documentation index
- [docs/INDEX.md](../../docs/INDEX.md) - Complete docs/ folder navigation

**Development Guides (docs/user-guides/):**

- [creating-commands.md](../../docs/user-guides/creating-commands.md) - Command creation guide
- [testing-guide.md](../../docs/user-guides/testing-guide.md) - Testing with TDD
- [docker-setup.md](../../docs/user-guides/docker-setup.md) - Docker containerization
- [huggingface-setup.md](../../docs/user-guides/huggingface-setup.md) - AI setup

**Technical Reference (docs/reference/ - Organized into 6 subcategories as of Jan 15):**

- [docs/reference/architecture/](../../docs/reference/architecture/) - System design and architecture
- [docs/reference/database/](../../docs/reference/database/) - Database schemas and operations
- [docs/reference/permissions/](../../docs/reference/permissions/) - Role-based access control
- [docs/reference/configuration/](../../docs/reference/configuration/) - Configuration and setup
- [docs/reference/quick-refs/](../../docs/reference/quick-refs/) - Quick reference guides
- [docs/reference/reports/](../../docs/reference/reports/) - Analysis and audit reports

**Testing Documentation (docs/testing/ - Consolidated Jan 15):**

- [test-naming-convention-guide.md](../../docs/testing/test-naming-convention-guide.md) - Test naming standards
- [test-file-audit-report.md](../../docs/testing/test-file-audit-report.md) - Test file organization
- [test-coverage-baseline-strategy.md](../../docs/testing/test-coverage-baseline-strategy.md) - Coverage strategy

**Current Phase Work (Root Level - Phase 23.1):**

- [PHASE-23.1-FINAL-STATUS-REPORT.md](../../PHASE-23.1-FINAL-STATUS-REPORT.md) - Latest phase status (✅ COMPLETE)
- [PHASE-23.0-COMPLETION-REPORT.md](../../PHASE-23.0-COMPLETION-REPORT.md) - Phase 23.0 summary
- [DEFINITION-OF-DONE.md](../../DEFINITION-OF-DONE.md) - Development standards

**Documentation Reorganization (Jan 15, 2026):**

- [ANALYSIS-SUMMARY.md](../../ANALYSIS-SUMMARY.md) - Analysis of all 73 documentation files
- [REORGANIZATION-EXECUTION-COMPLETE.md](../../REORGANIZATION-EXECUTION-COMPLETE.md) - Execution report (6 phases)
- [GITHUB-ISSUES-CREATED-SUMMARY.md](../../GITHUB-ISSUES-CREATED-SUMMARY.md) - Issues #61-67 details
- [docs/archived/](../../docs/archived/) - Historical documentation (PHASE-6, PHASE-22.x, PHASE-1)

**External Resources:**

- [Discord.js Documentation](https://discord.js.org/)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

## Documentation Standards & Naming Convention

**ALL new documentation must follow the standards in [DOCUMENT-NAMING-CONVENTION.md](../../DOCUMENT-NAMING-CONVENTION.md).**

### Quick Reference - Document Naming Rules

**Root-Level Documents (Project Governance):**
- Pattern: `{DESCRIPTOR}.md` (e.g., `README.md`, `CHANGELOG.md`)
- Use UPPER-CASE for organizational documents
- Examples: `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`

**Phase Documents (Planning & Deliverables):**
- Pattern: `PHASE-{#}.{a-z?}-{TYPE}.md`
- Examples: `PHASE-22.3-COVERAGE-EXPANSION-PLAN.md`, `PHASE-22.3a-INITIALIZATION-SUMMARY.md`

**Test & Quality Documents:**
- Pattern: `TEST-{DESCRIPTOR}.md` or `TESTING-{DESCRIPTOR}.md`
- Examples: `TEST-NAMING-CONVENTION-GUIDE.md`, `TEST-COVERAGE-ANALYSIS.md`

**Definition Documents:**
- Pattern: `DEFINITION-OF-{CONCEPT}.md`
- Examples: `DEFINITION-OF-DONE.md`, `DEFINITION-OF-READY.md`

**Subdirectory Files (use lowercase with hyphens):**
- `docs/admin-guides/{action}.md` - Admin how-to guides
- `docs/user-guides/{action}.md` - User how-to guides
- `docs/guides/{topic}.md` - Developer process guides
- `docs/reference/{component}-reference.md` - Technical reference
- `docs/architecture/{topic}.md` - System design docs
- `docs/best-practices/{topic}.md` - Coding standards
- `docs/testing/{topic}.md` - Testing documentation
- `docs/archived/{historical}.md` - Old or historical docs

### Creating New Documentation

1. **Identify the document type** (Phase, Test, Definition, Guide, Reference, etc.)
2. **Use the appropriate naming pattern** from DOCUMENT-NAMING-CONVENTION.md
3. **Choose the right location** (root, docs/*, or docs/archived/)
4. **Create with clear structure** - headers, examples, links
5. **Update DOCUMENTATION-INDEX.md** when adding root-level docs
6. **Link from docs/INDEX.md** when adding docs/ files

### Updating Links When Documents Change

When renaming or moving documents:
1. Update all markdown links in other documents
2. Update links in code comments
3. Update `DOCUMENTATION-INDEX.md` and `docs/INDEX.md`
4. Use grep to find all references: `grep -r "old-filename" src/ docs/`
5. Test all links before committing

## Common Tasks & Examples

### Adding a New Quote Command Feature

1. Identify category (discovery/management/social/export)
2. Create file using Command base class pattern
3. Use `buildCommandOptions()` for options
4. Use `sendQuoteEmbed()` for displaying quotes
5. Use `db` module for database operations
6. Add tests in appropriate test file
7. Update help command if needed

### Modifying Database Schema

1. Update `src/schema-enhancement.js`
2. Update corresponding `db.js` methods
3. Add migration logic if needed
4. Test with fresh database
5. Update documentation

### Adding Response Helper

1. Add function to `src/utils/helpers/response-helpers.js`
2. Add tests in `tests/unit/test-response-helpers.js`
3. Export function
4. Update this guide with usage example

## Performance Guidelines

- Bot startup: Should be < 3 seconds
- Command response: Target < 200ms
- Database queries: Keep < 100ms
- Use async/await for all I/O operations
- Defer interaction replies if processing takes > 3 seconds

## Security Best Practices

- **Never commit** `.env` file or secrets
- **Always use** prepared statements for database queries
- **Validate** all user input before processing
- **Check permissions** before executing admin commands
- **Rate limit** sensitive operations if needed
- **Sanitize** user input in embeds and messages

## Version Information

- **Current Version:** v3.4.0 (January 2026)
- **Last Updated:** January 15, 2026
- **Node.js:** 20+ required (minimum v20.0.0, npm >=10.0.0)
- **Discord.js:** 14.11.0
- **Major Refactoring:** Completed (Guild Isolation, Multi-Database Support, Phase 6)
- **Test Coverage:**
  - Current: 3000+ tests across 67 test suites (100% pass rate)
  - Tests: 3012 passing tests in all categories
  - Zero test failures, zero regressions
  - Total time: ~25 seconds
- **TDD Framework:** Mandatory for all new code (enforced since January 2026)

## Tips for Copilot Usage

- Reference existing commands as examples for similar functionality
- Always extend Command base class for new commands
- Consult docs/ folder for architectural decisions
- Check tests/ folder for testing patterns
- Follow the principle of minimal changes
- Maintain consistency with existing code style
- When in doubt, use response helpers and utility modules
