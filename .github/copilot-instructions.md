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

1. **Command Base Class** (`src/utils/command-base.js`)
   - Extends all commands for automatic error handling
   - Provides consistent lifecycle methods
   - Eliminates manual try-catch blocks
   - Chainable `.register()` method

2. **Command Options Builder** (`src/utils/command-options.js`)
   - Single source of truth for command options
   - Unified definition for both slash and prefix commands
   - Type-safe option creation

3. **Response Helpers** (`src/utils/response-helpers.js`)
   - Standardized Discord message formatting
   - Consistent embed creation
   - Error and success message patterns

### Design Patterns Used

- **Command Pattern:** Base class inheritance for all commands
- **Builder Pattern:** Command options construction
- **Helper Pattern:** Response formatting utilities
- **Repository Pattern:** Database abstraction layer

## Project Structure

```
src/
├── index.js                    # Bot entry point & event handlers
├── register-commands.js        # Command registration script
├── db.js                       # Database layer (SQLite)
├── schema-enhancement.js       # Database schema initialization
├── utils/
│   ├── command-base.js         # Base class for all commands
│   ├── command-options.js      # Unified option builder
│   ├── response-helpers.js     # Standardized Discord responses
│   └── error-handler.js        # Error handling & validation
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
const Command = require('../../utils/command-base');
const buildCommandOptions = require('../../utils/command-options');
const { sendSuccess, sendError, sendQuoteEmbed } = require('../../utils/response-helpers');

// Define options
const { data, options } = buildCommandOptions('commandname', 'Description', [
  { name: 'arg', type: 'string', required: true, description: 'Argument description' }
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

### Database Patterns

**ALWAYS use the db module for database operations:**

```javascript
const db = require('../../db');

// Prepared statements are handled automatically
const quote = await db.getQuote(id);
const quotes = await db.getAllQuotes();
await db.addQuote(text, author);
```

### Testing Requirements

- **All new commands** should have corresponding tests
- **Utility functions** must have unit tests
- **Integration tests** for command flows
- Run tests before committing: `npm test`
- Run all tests for major changes: `npm run test:all`

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

```bash
npm test                        # Quick sanity checks
npm run test:all               # All tests (74 tests)
npm run test:quotes            # Quote system tests (17 tests)
npm run test:quotes-advanced   # Advanced quote tests (18 tests)
npm run test:utils:base        # Command base tests (7 tests)
npm run test:utils:options     # Options builder tests (10 tests)
npm run test:utils:helpers     # Response helpers tests (12 tests)
npm run test:integration:refactor # Integration tests (10 tests)
npm run lint                   # Code style checks
```

**Test Coverage Expectations:**
- All test suites: 100% passing (74/74 tests)
- Command base class: 100% passing
- Quote system: 100% passing
- Overall: 100% passing

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

1. Add function to `src/utils/response-helpers.js`
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
- **Node.js:** 18+ required
- **Discord.js:** 14.11.0
- **Major Refactoring:** Completed (27% code reduction)
- **Test Coverage:** 100% passing (74/74 tests)

## Tips for Copilot Usage

- Reference existing commands as examples for similar functionality
- Always extend Command base class for new commands
- Consult docs/ folder for architectural decisions
- Check tests/ folder for testing patterns
- Follow the principle of minimal changes
- Maintain consistency with existing code style
- When in doubt, use response helpers and utility modules
