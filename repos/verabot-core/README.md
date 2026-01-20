# verabot-core

Core infrastructure package for VeraBot - a Discord bot framework providing essential utilities for command building, database operations, and Discord interactions.

## Overview

`verabot-core` provides reusable core modules extracted from VeraBot2.0:

- **Core Infrastructure**: Command base classes, event handling, and option builders
- **Database Services**: Guild-aware database operations with multi-database support
- **Discord Services**: API helpers and response formatting
- **Validation**: Input validation and role-based permissions
- **Testing**: 80%+ code coverage with Jest test framework

## Module Structure

```
src/
├── core/                     # Core infrastructure
│   ├── CommandBase.js        # Base class for commands
│   ├── CommandOptions.js     # Option builder for commands
│   ├── EventBase.js          # Base class for events
│   └── index.js              # Core module exports
├── services/                 # Database and business logic
│   ├── DatabaseService.js    # Raw database operations
│   ├── GuildAwareDatabaseService.js  # Guild-scoped database
│   ├── GuildDatabaseManager.js       # Multi-database support
│   ├── DiscordService.js     # Discord API helpers
│   ├── ValidationService.js  # Input validation
│   ├── RolePermissionService.js      # Permission checking
│   └── index.js              # Services exports
├── helpers/                  # Utility helpers
│   ├── response-helpers.js   # Discord response formatting
│   ├── api-helpers.js        # API interaction helpers
│   └── index.js              # Helpers exports
└── index.js                  # Main entry point
```

## Installation

```bash
npm install verabot-core
```

## Requirements

- Node.js 20.0.0 or higher
- npm 10.0.0 or higher
- discord.js ^14.11.0
- verabot-utils ^1.0.0

# Update .env with your configuration
# - DISCORD_TOKEN
# - CLIENT_ID
# - GUILD_ID (optional, for faster command registration)
# - DATABASE_URL
# - REDIS_URL
# - UTILITIES_URL (for shared utilities service)
# - DASHBOARD_URL (for dashboard service)
```

### Configuration

**Required Environment Variables:**

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
DATABASE_URL=postgresql://user:password@localhost:5432/verabot
REDIS_URL=redis://localhost:6379
UTILITIES_URL=http://localhost:3000
DASHBOARD_URL=http://localhost:8080
```

**Optional Environment Variables:**

```env
GUILD_ID=your_guild_id_for_faster_registration
PREFIX=!
LOG_LEVEL=info
DEBUG=verabot:*
HUGGINGFACE_API_KEY=optional_for_ai_features
```

## Development

### Run in Development Mode

```bash
npm run dev
```

This starts the bot with:
- Hot reloading on file changes
- Debug logging enabled
- Console output for all events

### Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test suite
npm test -- tests/commands/quote-management/add-quote.test.js

# Watch mode
npm test -- --watch
```

### Register Commands

```bash
# Register slash commands to Discord
npm run register-commands

# Register to specific guild (faster for testing)
npm run register-commands:guild
```

### Linting & Code Quality

```bash
# Check for linting errors
npm run lint

# Fix linting errors automatically
npm run lint:fix

# Check test coverage
npm run coverage
```

## Connecting to Shared Services

### Using verabot-utils

```javascript
// Database operations
const DatabaseService = require('verabot-utils/services/DatabaseService');
const db = new DatabaseService(process.env.DATABASE_URL);

// Logging
const { createLogger } = require('verabot-utils/middleware/errorHandler');
const logger = createLogger('my-module');

// Utilities
const { sendSuccess, sendError } = require('verabot-utils/helpers/response-helpers');
```

### Calling Dashboard API

```javascript
const dashboardUrl = process.env.DASHBOARD_URL;
const response = await fetch(`${dashboardUrl}/api/guilds/${guildId}`);
const data = await response.json();
```

## Command Development

### Creating a New Command

1. **Choose category**: misc, quote-discovery, quote-management, quote-social, quote-export
2. **Create command file**: `src/commands/{category}/command-name.js`

```javascript
const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');

const { data, options } = buildCommandOptions('commandname', 'Description', [
  { name: 'arg', type: 'string', required: true, description: 'Argument' },
]);

class CommandName extends Command {
  constructor() {
    super({ name: 'commandname', description: 'Description', data, options });
  }

  async execute(message, args) {
    // Legacy prefix command handler
  }

  async executeInteraction(interaction) {
    // Slash command handler
  }
}

module.exports = new CommandName().register();
```

3. **Write tests FIRST** (TDD): Create test file before implementation
4. **Register command**: `npm run register-commands`

## API Endpoints

This service exposes health check endpoints:

- `GET /health` - Service health status
- `GET /ready` - Bot readiness (connected to Discord)
- `GET /metrics` - Prometheus metrics (if enabled)

## Deployment

### Docker

```bash
# Build image
docker build -t verabot-core:latest .

# Run container
docker run -e DISCORD_TOKEN=xxx -e DATABASE_URL=xxx verabot-core:latest
```

### Docker Compose

See `DOCKER-COMPOSE-LOCAL-DEVELOPMENT.yml` or `DOCKER-COMPOSE-PRODUCTION.yml` in parent repository.

```bash
# Development
docker-compose -f DOCKER-COMPOSE-LOCAL-DEVELOPMENT.yml up core-bot

# Production
docker-compose -f DOCKER-COMPOSE-PRODUCTION.yml up -d core-bot
```

## Testing

This project follows **Test-Driven Development (TDD)** principles:

1. **Write tests FIRST** (RED phase)
2. **Implement code** to pass tests (GREEN phase)
3. **Refactor** while maintaining test pass rate (REFACTOR phase)

### Test Coverage Requirements

- **Line Coverage**: 85%+
- **Function Coverage**: 90%+
- **Branch Coverage**: 80%+

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run coverage      # Coverage report
npm run coverage:open # Open HTML coverage report
```

## Troubleshooting

### Bot Not Connecting

1. Verify `DISCORD_TOKEN` is valid
2. Check Discord Developer Portal for proper permissions
3. Ensure bot is invited to guild with correct scopes
4. Check network connectivity to Discord API

### Database Connection Errors

1. Verify `DATABASE_URL` is correct
2. Test connection: `psql $DATABASE_URL`
3. Check PostgreSQL service is running
4. Verify credentials and database exists

### Commands Not Registering

1. Run: `npm run register-commands`
2. Provide `CLIENT_ID` and `DISCORD_TOKEN`
3. Optionally provide `GUILD_ID` for faster registration
4. Wait 1-2 minutes for Discord cache update

### Service Communication Failures

1. Verify `UTILITIES_URL` is reachable
2. Check utilities service health: `curl http://localhost:3000/health`
3. Verify `REDIS_URL` and Redis is running
4. Check network connectivity between services

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for:
- Development workflow
- Code standards
- Commit conventions
- Pull request process

## Architecture References

- **Parent Repository**: https://github.com/Rarsus/verabot2.0
- **Implementation Plan**: [EPIC-49-IMPLEMENTATION-PLAN.md](../../EPIC-49-IMPLEMENTATION-PLAN.md)
- **Database Specification**: [docs/reference/database/](../../docs/reference/database/)

## Support

For issues, questions, or contributions:
1. Check [Troubleshooting](#troubleshooting) section
2. Search existing GitHub issues
3. Create new issue with detailed description
4. See parent repository documentation

## License

MIT - See [LICENSE](./LICENCE) file

---

**Version**: 1.0.0  
**Last Updated**: January 20, 2026  
**Status**: Active Development (Epic #49)
