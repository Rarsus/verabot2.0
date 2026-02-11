# VeraBot2.0

![Version](https://img.shields.io/badge/version-v3.4.0-blue)
![Tests](https://img.shields.io/badge/tests-3012%2F3012%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-improving-blue)
![Node Version](https://img.shields.io/badge/node-%3E%3D20-green)

Advanced Discord bot with organized commands, quote management system, and modern architecture. Features slash commands, legacy prefix commands, comprehensive testing (3000+ tests, 100% pass rate across 67 test suites), and SQLite database integration.

## 🚀 Quick Start

### Installation

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and set values:

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=optional_test_guild_id    # Speeds up command registration
PREFIX=!                            # Prefix for legacy commands
HUGGINGFACE_API_KEY=optional_key   # For AI poem generation
```

3. Register commands:

```bash
npm run register-commands
```

4. Start the bot:

```bash
npm start
```

---

## ✨ Key Features

### 📝 Quote Management System

- **Add, update, delete quotes** with author attribution
- **Search and filter** by text, author, or tags
- **Rate quotes** (1-5 stars) with community ratings
- **Tag system** for organizing quotes by category
- **Export functionality** (JSON/CSV) for backups

### 🔔 Reminder Management System

- **Create reminders** with scheduled notifications
- **User & role assignments** for targeted notifications
- **Rich content** support (descriptions, links, images)
- **Categorization** and status tracking
- **Search & filter** with powerful query options
- **Automatic delivery** via DM or channel announcements
- **Notification history** and retry logic

[📖 Read the Reminder System Guide](docs/user-guides/reminder-system.md)

### 💬 Bi-Directional Message Proxy

- **Forward messages** from Discord channels to external webhooks
- **Receive messages** from external systems and relay to Discord
- **Admin-only commands** for secure configuration
- **Encrypted storage** of webhook tokens and secrets
- **HMAC signature verification** for incoming webhooks
- **Automatic retry logic** for failed webhook requests
- **Channel-specific monitoring** for fine-grained control

[📖 Read the Proxy Setup Guide](docs/user-guides/proxy-setup.md)

### 🤖 AI Integration

- **AI poem generation** using HuggingFace API
- Extensible framework for adding more AI features

### 🏗️ Modern Architecture

- **Command base class** with automatic error handling
- **Slash commands** and legacy prefix command support
- **SQLite database** with automatic migrations
- **Comprehensive testing** (3000+ tests, 100% pass rate)
- **Test-Driven Development** approach
- **Clean code principles** and SOLID design patterns

---

## 📖 Documentation

### 🚀 Quick Navigation

**[📖 Full Documentation Index](DOCUMENTATION-INDEX.md)** - Navigate all documentation

**Current Development Status:**
- ✅ Phase 23.1 Complete: Global Services & Communication (Latest)
- ✅ Phase 23.0 Complete: Guild Isolation & Multi-Database Support
- ✅ Documentation Fully Reorganized (Jan 15, 2026)

### 📋 Key Documents

**Getting Started:**
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** - Community standards
- **[DEFINITION-OF-DONE.md](DEFINITION-OF-DONE.md)** - Development standards

**Current Phase:**
- **[PHASE-9-NODE-22-MIGRATION-PLAN.md](PHASE-9-NODE-22-MIGRATION-PLAN.md)** - Node.js 22 migration planning
- **[PHASE-9-GIT-RENAME-DETECTION-COMPLETION.md](PHASE-9-GIT-RENAME-DETECTION-COMPLETION.md)** - Git rename detection feature
- **[PHASE-8-COMPLETION-REPORT.md](PHASE-8-COMPLETION-REPORT.md)** - Phase 8 completion summary

**Documentation Standards:**
- **[DOCUMENT-NAMING-CONVENTION.md](DOCUMENT-NAMING-CONVENTION.md)** - Documentation naming standards
- **[docs/INDEX.md](docs/INDEX.md)** - Complete docs/ folder navigation

## 📦 Using verabot-core

**verabot-core** is now available as a standalone npm package with reusable Discord bot infrastructure:

```bash
npm install verabot-core
```

### Core Features

- **CommandBase** - Automatic error handling for commands
- **CommandOptions** - Unified builder for slash/prefix commands  
- **EventBase** - Base class for event handlers
- **Response Helpers** - Standardized Discord message formatting
- **Database Services** - Guild-aware database abstraction
- **Role Permission System** - 5-tier access control

### Quick Command Example

```javascript
const { CommandBase, buildCommandOptions, sendSuccess } = require('verabot-core');

const { data, options } = buildCommandOptions('greet', 'Greet a user', [
  { name: 'target', type: 'user', required: true, description: 'User to greet' }
]);

class GreetCommand extends CommandBase {
  constructor() {
    super({ name: 'greet', description: 'Greet a user', data, options });
  }

  async executeInteraction(interaction) {
    const target = interaction.options.getUser('target');
    await sendSuccess(interaction, `Hello ${target.username}!`);
  }
}

module.exports = new GreetCommand().register();
```

**Learn More:**
- **[Core Extraction Guide](docs/guides/core-extraction-guide.md)** - Complete setup and migration guide
- **[verabot-core API Reference](docs/reference/verabot-core-api.md)** - Full API documentation with examples

---

### 📁 Documentation Organization (Reorganized Jan 15, 2026)

Complete documentation is organized in the [docs/](docs/) folder and root level:

**Root Level (Active & Core):**
- Project governance: README.md, CHANGELOG.md, CONTRIBUTING.md
- Standards: DOCUMENT-NAMING-CONVENTION.md, DEFINITION-OF-DONE.md
- Current work: PHASE-9 (Node.js 22 migration, Git rename detection)
- Analysis: ANALYSIS-SUMMARY.md, GITHUB-ISSUES-CREATED-SUMMARY.md

**[docs/ Directory:**
- **user-guides/** - Step-by-step how-to guides for developers
- **admin-guides/** - Administrator and operator documentation
- **guides/** - Development process and workflow guides
- **reference/** - Technical reference (6 organized subcategories):
  - architecture/ - System design and patterns
  - database/ - Schema, operations, and migrations
  - permissions/ - Role-based access control
  - configuration/ - Setup and configuration
  - quick-refs/ - Quick reference guides
  - reports/ - Analysis and audit reports
- **architecture/** - System design documentation
- **best-practices/** - Coding standards and patterns
- **testing/** - Testing framework and patterns (consolidated Jan 15)
- **archived/** - Historical documentation (PHASE-6, PHASE-22.x, PHASE-1)

### 🚀 Quick Links

- **New developer?** → [docs/user-guides/creating-commands.md](docs/user-guides/creating-commands.md)
- **Set up Docker?** → [docs/user-guides/docker-setup.md](docs/user-guides/docker-setup.md)
- **Learn architecture?** → [docs/reference/architecture/ARCHITECTURE.md](docs/reference/architecture/ARCHITECTURE.md)
- **Admin commands?** → [docs/admin-guides/admin-communication-commands.md](docs/admin-guides/admin-communication-commands.md)
- **Testing guide?** → [docs/user-guides/testing-guide.md](docs/user-guides/testing-guide.md)
- **Database schema?** → [docs/reference/database/](docs/reference/database/)
- **Permission system?** → [docs/reference/permissions/](docs/reference/permissions/)

---

## 🏗️ Project Structure

```
src/
├── index.js                 # Bot entry point
├── register-commands.js     # Command registration
├── db.js                    # Database wrapper for quote operations
├── schema-enhancement.js    # Database schema initialization
├── core/
│   ├── CommandBase.js       # Base class for all commands
│   ├── CommandOptions.js    # Unified option builder
│   └── EventBase.js         # Event handler base class
├── services/
│   ├── DatabaseService.js   # Database operations
│   ├── ValidationService.js # Input validation
│   ├── QuoteService.js      # Quote-specific logic
│   ├── DiscordService.js    # Discord API helpers
│   ├── ProxyConfigService.js    # Proxy configuration management
│   ├── WebhookProxyService.js   # Outgoing webhook forwarding
│   └── WebhookListenerService.js # Incoming webhook server
├── middleware/
│   ├── errorHandler.js      # Error handling & logging
│   ├── commandValidator.js  # Command validation
│   └── logger.js            # Logging utilities
├── utils/
│   ├── command-base.js      # Legacy: Use core/CommandBase.js
│   ├── command-options.js   # Legacy: Use core/CommandOptions.js
│   ├── error-handler.js     # Error handling utilities
│   ├── response-helpers.js  # Standardized Discord responses
│   ├── encryption.js        # Encryption utilities for sensitive data
│   ├── proxy-helpers.js     # Webhook proxy helper functions
│   └── helpers/             # Additional helper functions
└── commands/
    ├── misc/
    │   ├── hi.js           # Simple greeting command
    │   ├── ping.js         # Ping/pong command
    │   ├── help.js         # Paginated help command
    │   └── poem.js         # AI poem generation
    ├── admin/
    │   ├── proxy-config.js    # Configure webhook proxy
    │   ├── proxy-enable.js    # Enable/disable proxy
    │   └── proxy-status.js    # View proxy status
    ├── quote-discovery/
    │   ├── random-quote.js     # Get random quote
    │   ├── search-quotes.js    # Search quotes by text/author
    │   └── quote-stats.js      # Display quote statistics
    ├── quote-management/
    │   ├── add-quote.js        # Add new quote
    │   ├── list-quotes.js      # List all quotes (via DM)
    │   ├── quote.js            # Retrieve specific quote
    │   ├── delete-quote.js     # Delete quote (admin)
    │   └── update-quote.js     # Update quote (admin)
    ├── quote-social/
    │   ├── rate-quote.js       # Rate quotes 1-5 stars
    │   └── tag-quote.js        # Tag quotes with categories
    └── quote-export/
        └── export-quotes.js    # Export as JSON/CSV

data/
├── quotes.db               # SQLite database
└── quotes.json            # Backup quotes (optional)

scripts/
├── run-tests.js           # Main test runner
├── test-command-base.js   # Command base class tests
├── test-command-options.js # Options builder tests
├── test-response-helpers.js # Response helpers tests
└── test-integration-refactor.js # Integration tests
```

---

## 🧪 Testing

### Run Tests

```bash
npm test                        # All tests (3000+ passing)
npm run test:coverage           # Full test suite with coverage report
npm run test:watch              # Watch mode for development
```

### Test Results (Phase 23.1)

- ✅ **3012 tests passing** (100% pass rate)
- ✅ **67 test suites** organized by functional area
- ✅ **Comprehensive coverage** across all modules
- ✅ **Execution time: ~25 seconds**
- ✅ **Zero test failures** - All tests passing

### Test Structure

Tests are organized by functional category for better maintainability:

- **Core utilities** - CommandBase, CommandOptions, EventBase
- **Middleware** - Error handling, validation, logging
- **Services** - Database, validation, Discord operations
- **Commands** - Implementation tests for each command
- **Utils** - Helper function tests
- **Integration** - Cross-module workflow tests

For detailed testing guidance, see [docs/user-guides/testing-guide.md](docs/user-guides/testing-guide.md) and [docs/testing/](docs/testing/).

| Category | Files | Tests | Status |
|----------|-------|-------|--------|
| Core | 4 | 50+ | ✅ Complete |
| Middleware | 8 | 140+ | ✅ Complete |
| Services | 22 | 1200+ | ✅ Complete |
| Commands | 12 | 800+ | ✅ Complete |
| Utils | 8 | 350+ | ✅ Complete |
| Integration | 13 | 470+ | ✅ Complete |
| **TOTAL** | **67** | **3012** | ✅ **Complete** |

---

## 📦 Modern Architecture (v0.2.0)

VeraBot2.0 features an enterprise-grade architecture with clear separation of concerns:

### Project Organization

- **`src/core/`** - Base classes and foundational components (CommandBase, CommandOptions, EventBase)
- **`src/services/`** - Business logic layer (Database, Validation, Quote operations, Discord helpers)
- **`src/middleware/`** - Cross-cutting concerns (Error handling, Logging, Validation)
- **`src/utils/`** - Helper functions and utilities (response-helpers, encryption, proxy-helpers)
- **`src/commands/`** - Command implementations organized by category

### Command Base Class

All commands extend `Command` base class for automatic error handling:

```javascript
const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');

const { data, options } = buildCommandOptions('mycommand', 'Description', [
  { name: 'arg', type: 'string', required: false },
]);

class MyCommand extends Command {
  constructor() {
    super({ name: 'mycommand', description: 'Description', data, options });
  }

  async execute(message, args) {
    // Just write your logic - errors handled automatically
  }

  async executeInteraction(interaction) {
    // Just write your logic - errors handled automatically
  }
}

module.exports = new MyCommand().register();
```

**Benefits:**

- ✅ Automatic error wrapping & logging
- ✅ Consistent error handling across all commands
- ✅ No manual try-catch blocks needed
- ✅ Chainable `.register()` method

### Response Helpers

Standardized Discord response functions:

```javascript
const {
  sendQuoteEmbed, // Send formatted quote embed
  sendSuccess, // Send success message
  sendError, // Send error message
  sendDM, // Send DM with confirmation
  deferReply, // Safe defer handling
} = require('../../utils/helpers/response-helpers');

// Use in your commands
await sendQuoteEmbed(interaction, quote, 'Quote Title');
await sendSuccess(interaction, 'Operation successful!');
await sendError(interaction, 'Something went wrong', true);
```

### Command Options Builder

Single source of truth for command options:

```javascript
const buildCommandOptions = require('../../core/CommandOptions');

const { data, options } = buildCommandOptions('mycommand', 'Description', [
  { name: 'text', type: 'string', required: true },
  { name: 'count', type: 'integer', required: false },
  { name: 'enabled', type: 'boolean', required: false },
]);
```

---

## 📝 Command Examples

### Slash Commands (after registering)

```bash
# Quotes
/random-quote                          # Get random quote
/search-quotes query:inspiration       # Search quotes
/add-quote quote:"..." author:Author   # Add new quote
/quote number:5                        # Get quote #5
/rate-quote id:5 rating:5              # Rate quote 1-5
/list-quotes                           # Get all quotes (DM)
/quote-stats                           # Show statistics
/export-quotes format:json             # Export as JSON/CSV

# General
/hi name:Alice                         # Say hello
/ping                                 # Ping/pong
/help command:optional                 # Show help
/poem type:haiku subject:coffee        # Generate poem
```

### Prefix Commands (using `PREFIX=!`)

```bash
# Quotes
!random-quote                          # Get random quote
!search-quotes inspiration             # Search quotes
!add-quote "text" author               # Add quote
!quote 5                               # Get quote #5
!rate-quote 5 4                        # Rate quote 4 stars
!list-quotes                           # Get all quotes (DM)
!quote-stats                           # Show statistics
!export-quotes json                    # Export as JSON

# General
!hi Alice                              # Say hello
!ping                                 # Ping/pong
!help                                 # Show help
!poem haiku coffee                     # Generate haiku
```

---

## 🗄️ Database

Uses SQLite with automatic schema initialization:

```
quotes
├── id (PRIMARY KEY)
├── text (Quote content)
├── author (Quote author)
├── created_at (Timestamp)
├── updated_at (Timestamp)
└── rating (Average rating)

ratings
├── id (PRIMARY KEY)
├── quote_id (Foreign key)
├── user_id (Discord user ID)
└── rating (1-5 stars)

tags
├── id (PRIMARY KEY)
└── name (Tag name)

quote_tags
├── id (PRIMARY KEY)
├── quote_id (Foreign key)
└── tag_id (Foreign key)
```

---

## 🧬 Code Quality Metrics

### Refactoring Results (All 15 Commands)

- **Lines of Code:** Reduced from ~1100 to ~800 (-27%)
- **Average per Command:** -40% reduction
- **Boilerplate:** 100% of manual try-catch eliminated
- **Code Duplication:** 90% reduction
- **Development Speed:** 50% faster new commands

### Testing Coverage

- **Total Tests:** 74/74 passing (100%)
- **Core Framework:** 27 tests
- **Quote System:** 35 tests
- **Helper & Utilities:** 12 tests
- **Estimated Coverage:** ~40-50%

See [docs/testing/TEST-COVERAGE-OVERVIEW.md](docs/testing/TEST-COVERAGE-OVERVIEW.md) for detailed analysis.

---

## 🔧 Development

### Linting

```bash
npm run lint                # Check for style issues
```

### Docker

**Using Pre-built Images from GitHub Container Registry:**

```bash
# Pull the latest release
docker pull ghcr.io/rarsus/verabot2.0:latest

# Or pull a specific version
docker pull ghcr.io/rarsus/verabot2.0:3.0.0

# Run with your .env file
docker run -d --env-file .env --name verabot ghcr.io/rarsus/verabot2.0:latest

# Or use docker-compose (update image in docker-compose.yml to ghcr.io/rarsus/verabot2.0:latest)
docker-compose up -d
```

**Building Locally:**

```bash
# Build your own image
docker build -t verabot2 .

# Run locally built image
docker-compose up -d
```

**Available Tags:**

- `latest` - Latest stable release (from docker-publish.yml on release)
- `3.0.0`, `3.0`, `3` - Specific version tags (from docker-publish.yml)
- `main`, `main-<sha>` - Development builds from main branch (from deploy.yml)

### Environment Variables

```env
# Required
DISCORD_TOKEN=your_token              # Discord bot token
CLIENT_ID=your_client_id              # Discord application ID

# Optional
GUILD_ID=guild_id                     # Test guild for fast registration
PREFIX=!                              # Prefix for legacy commands (default: !)
HUGGINGFACE_API_KEY=api_key          # For AI poem generation
```

---

## 📖 Command Development Guide

### Creating a New Command

1. **Choose a category** based on what the command does
2. **Use the Command base class** for automatic error handling
3. **Build options** using `buildCommandOptions()`
4. **Use response helpers** for consistent Discord messages
5. **Add tests** for your command logic

### Example: Simple Command

```javascript
const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendSuccess, sendError } = require('../../utils/helpers/response-helpers');

const { data, options } = buildCommandOptions('mycommand', 'What it does', [
  { name: 'arg', type: 'string', description: 'An argument', required: true },
]);

class MyCommand extends Command {
  constructor() {
    super({ name: 'mycommand', description: 'What it does', data, options });
  }

  async execute(message, args) {
    const arg = args[0];
    // Your logic here - errors are automatically handled
  }

  async executeInteraction(interaction) {
    const arg = interaction.options.getString('arg');
    // Your logic here - errors are automatically handled
  }
}

module.exports = new MyCommand().register();
```

---

## 🚀 Performance

- Bot startup time: < 3 seconds
- Command registration: < 1 second per command
- Average command response: < 200ms
- Database queries: < 100ms typical

---

## 📚 Additional Resources

- [Discord.js Documentation](https://discordjs.org/docs/packages/discord.js/main)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

---

## 🤝 Contributing

When adding new commands or features:

1. Follow the Command base class pattern
2. Use response helpers for Discord messages
3. Use buildCommandOptions for command options
4. Add tests for new functionality
5. Update this README if adding new commands
6. Run `npm run lint` to check code style

---

## 📋 Changelog

### v3.4.0 - Current (January 2026) ✅

**Guild-Aware Notifications & Multi-Guild Support (Phase 6)**

- ✅ Guild-aware notification service with per-guild delivery
- ✅ Multi-guild batch processing (10 guilds at a time, 100ms delays)
- ✅ 30 comprehensive integration tests for multi-guild scenarios
- ✅ Guild isolation with error isolation per guild
- ✅ Backward compatibility maintained (100%)
- ✅ 3000+ comprehensive tests (67 test suites, 100% pass rate)
- ✅ Database abstraction analysis completed

See [CHANGELOG.md](CHANGELOG.md) for detailed release notes.

### v3.2.0 - Previous Release

**Multi-Guild & Guild Isolation Completion**

- Guild-aware services and database operations
- Global communication services
- Complete migration from legacy db.js wrapper
- Enhanced permission system

### v0.1.0 - Foundation (December 2025)

**Initial Architecture**

- Command base class with automatic error handling
- Built-in response helpers for Discord messages
- Service layer pattern for business logic
- Comprehensive test suite foundation

---

## 📝 License

MIT
