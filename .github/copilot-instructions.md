# Copilot Instructions for VeraBot2.0

## Project Overview

VeraBot2.0 is an advanced Discord bot with organized commands, quote management system, and modern architecture. It features slash commands, legacy prefix commands, comprehensive testing, and database integration. The bot is built with a focus on maintainability, testability, and developer experience through reusable utility modules and consistent patterns.

**Key Features:**

- Discord slash commands and legacy prefix commands
- Quote management system (add, search, rate, tag, export)
- AI-powered poem generation via HuggingFace
- SQLite database with automatic schema management
- Comprehensive testing suite with 100% passing tests (74 tests)
- Modern architecture with Command pattern and utility modules

## Technology Stack

**Core Technologies:**

- **Runtime:** Node.js 18+
- **Language:** JavaScript (ES2021)
- **Framework:** Discord.js v14.11.0
- **Database:** SQLite3 v5.1.7
- **Environment:** dotenv v17.2.3
- **AI Integration:** HuggingFace API (optional)

**Development Tools:**

- **Linting:** ESLint v8.48.0
- **Testing:** Custom test framework (74 comprehensive tests)
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
├── guides/                    # How-to guides for development
├── reference/                 # Architecture & technical docs
└── project/                   # Project information & history
```

## Coding Guidelines & Conventions

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
- db.js will be removed in v0.3.0 (March 2026)

See `docs/reference/DB-DEPRECATION-TIMELINE.md` for detailed migration guide.

### Test-Driven Development (TDD) - MANDATORY

**ALL new code MUST follow strict Test-Driven Development principles:**

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

### Deprecation Notes

- Manual error handling in commands is deprecated
- Raw Discord API calls in commands should use response helpers
- Inconsistent option definitions should use `buildCommandOptions()`

## Documentation Resources

**Primary Documentation:**

- [docs/README.md](docs/README.md) - Documentation overview
- [docs/INDEX.md](docs/INDEX.md) - Complete documentation index

**Development Guides:**

- [docs/guides/01-CREATING-COMMANDS.md](docs/guides/01-CREATING-COMMANDS.md) - Command creation guide
- [docs/guides/02-TESTING-GUIDE.md](docs/guides/02-TESTING-GUIDE.md) - Testing with TDD
- [docs/guides/03-HUGGINGFACE-SETUP.md](docs/guides/03-HUGGINGFACE-SETUP.md) - AI setup

**Technical Reference:**

- [docs/reference/ARCHITECTURE.md](docs/reference/ARCHITECTURE.md) - System design details
- [docs/reference/REFACTORING-GUIDE.md](docs/reference/REFACTORING-GUIDE.md) - Before/after examples
- [docs/reference/TDD-QUICK-REFERENCE.md](docs/reference/TDD-QUICK-REFERENCE.md) - Testing patterns

**External Resources:**

- [Discord.js Documentation](https://discord.js.org/)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

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

- **Current Version:** v0.1.0 (December 2024)
- **Last Updated:** January 5, 2026
- **Node.js:** 18+ required
- **Discord.js:** 14.11.0
- **Major Refactoring:** Completed (27% code reduction, Guild Isolation)
- **Test Coverage:**
  - Current: 79.5% (lines) | 82.7% (functions) | 74.7% (branches)
  - Target: 90%+ (lines) | 95%+ (functions) | 85%+ (branches)
  - Tests: 500+ passing across 32 test suites (100% pass rate)
- **TDD Framework:** Mandatory for all new code (updated January 5, 2026)

## Tips for Copilot Usage

- Reference existing commands as examples for similar functionality
- Always extend Command base class for new commands
- Consult docs/ folder for architectural decisions
- Check tests/ folder for testing patterns
- Follow the principle of minimal changes
- Maintain consistency with existing code style
- When in doubt, use response helpers and utility modules
