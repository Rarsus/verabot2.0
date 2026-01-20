# Core Extraction Guide
**Version:** 1.0.0  
**Last Updated:** January 20, 2026  
**Status:** Phase 4 Documentation

## Overview

This guide documents the extraction of core Discord bot infrastructure into the `verabot-core` standalone package, making reusable command base classes, helpers, and services available for other projects.

## What is verabot-core?

`verabot-core` is a lightweight npm package containing:
- **CommandBase** - Base class for command implementations
- **CommandOptions** - Unified option builder for slash/prefix commands
- **EventBase** - Event handler base class
- **Response Helpers** - Standardized Discord message formatting
- **API Helpers** - Request/response utilities
- **Database Services** - Database abstraction layer (re-exports from verabot-utils)
- **Validation Service** - Input validation utilities
- **Role Configuration** - 5-tier permission system

## Package Installation

```bash
npm install verabot-core
```

Or for local development:
```bash
npm install ./repos/verabot-core
```

## Module Imports

### Entire Core Package
```javascript
const verabotCore = require('verabot-core');

// Access all modules
const { CommandBase, CommandOptions, sendSuccess, DatabaseService } = verabotCore;
```

### Specific Modules
```javascript
// Core infrastructure
const CommandBase = require('verabot-core/core/CommandBase');
const CommandOptions = require('verabot-core/core/CommandOptions');
const EventBase = require('verabot-core/core/EventBase');

// Helpers
const { sendSuccess, sendError } = require('verabot-core/helpers/response-helpers');

// Services
const { DatabaseService, RolePermissionService } = require('verabot-core/services');
```

## Quick Start: Creating a Command

```javascript
const { CommandBase, CommandOptions } = require('verabot-core');

// Define options
const { data, options } = CommandOptions('greet', 'Greet a user', [
  { 
    name: 'target', 
    type: 'user', 
    required: true,
    description: 'User to greet'
  },
]);

// Create command class
class GreetCommand extends CommandBase {
  constructor() {
    super({
      name: 'greet',
      description: 'Greet a user',
      data,
      options,
    });
  }

  async executeInteraction(interaction) {
    const target = interaction.options.getUser('target');
    const message = `Hello ${target.username}!`;
    
    await interaction.reply(message);
    return { success: true };
  }
}

// Register and export
module.exports = new GreetCommand().register();
```

## Response Helpers

Standardized response patterns for common scenarios:

```javascript
const { 
  sendSuccess, 
  sendError, 
  sendQuoteEmbed,
  sendDM,
  deferReply,
} = require('verabot-core/helpers/response-helpers');

// Success response
await sendSuccess(interaction, 'Operation completed!', ephemeral = false);

// Error response
await sendError(interaction, 'Something went wrong', ephemeral = true);

// Quote embed
await sendQuoteEmbed(interaction, quote, 'Featured Quote');

// Direct message
await sendDM(user, 'Check your DMs!');

// Defer with thinking indicator
await deferReply(interaction);
```

## Database Services

Access database operations through guild-aware services:

```javascript
const { DatabaseService, GuildAwareDatabaseService } = require('verabot-core/services');

// Guild-aware database operations
const dbService = new GuildAwareDatabaseService(database);

// Get data for specific guild
const quotes = await dbService.getGuildData(guildId, 'quotes');

// Add guild-scoped data
await dbService.addGuildData(guildId, 'quotes', { text, author });
```

## Permission System

Role-based access control with 5-tier system:

```javascript
const { RolePermissionService } = require('verabot-core/services');

const roleService = new RolePermissionService();

// Check if user can execute command
const canExecute = await roleService.canExecuteCommand(
  userId,
  guildId,
  'admin-only-command',
  client
);

if (!canExecute) {
  await sendError(interaction, 'You lack permissions for this command');
  return;
}

// Get user's permission tier
const userTier = await roleService.getUserTier(userId, guildId, client);
console.log(`User tier: ${userTier}`); // 0-4

// Get visible commands for user
const visible = await roleService.getVisibleCommands(userId, guildId, client);
console.log('Available commands:', visible);
```

## Event Handling

Create event handlers using EventBase:

```javascript
const { EventBase } = require('verabot-core/core/EventBase');

class ReadyEvent extends EventBase {
  constructor() {
    super({
      name: 'ready',
      once: true,  // Only listen once
    });
  }

  async execute(client) {
    console.log(`✅ Logged in as ${client.user.tag}`);
  }
}

module.exports = new ReadyEvent().register();
```

## Error Handling

CommandBase automatically handles errors:

```javascript
class MyCommand extends CommandBase {
  constructor() {
    super({ name: 'test', description: 'Test' });
  }

  async executeInteraction(interaction) {
    // Errors are automatically caught and logged
    // No need for manual try-catch
    throw new Error('Something failed');
    
    // Error is caught by base class and user sees:
    // ❌ An error occurred. Command execution failed.
  }
}
```

## Configuration

### Environment Variables
```bash
# Permission system
ROLE_BASED_PERMISSIONS_ENABLED=true

# Bot owners (comma-separated)
BOT_OWNERS=user-id-1,user-id-2

# Server admins
SERVER_ADMINS=admin-id-1,admin-id-2
```

### Role Configuration
Edit `src/config/roles.js` to customize:

```javascript
module.exports = {
  enabled: true,
  auditLogging: true,
  defaultTier: 1,
  tiers: {
    0: 'Guest',
    1: 'Member',
    2: 'Moderator',
    3: 'Admin',
    4: 'Bot Owner',
  },
  roleMapping: {
    'Moderator': 2,
    'Administrator': 3,
  },
  // Command-specific permissions
  commandPermissions: {
    'ban': { minTier: 3 },
    'kick': { minTier: 2 },
  },
};
```

## Testing

Run tests for verabot-core:

```bash
cd repos/verabot-core

# Run all tests
npm test

# Run specific test file
npm test tests/unit/command-base.test.js

# Generate coverage report
npm test -- --coverage

# Watch mode
npm run test:watch
```

## Module Exports

### Main Entry Point (`verabot-core`)
- CommandBase
- CommandOptions
- EventBase
- DatabaseService
- GuildAwareDatabaseService
- DiscordService
- ValidationService
- RolePermissionService (if available)
- responseHelpers
- apiHelpers

### Core Submodule (`verabot-core/core`)
- CommandBase
- CommandOptions
- EventBase

### Services Submodule (`verabot-core/services`)
- DatabaseService
- GuildAwareDatabaseService
- DiscordService
- ValidationService
- RolePermissionService
- GuildDatabaseManager

### Helpers Submodule (`verabot-core/helpers`)
- responseHelpers (with 11 functions)
- apiHelpers (with 6 functions)

## Migration Guide

### From Old Patterns to verabot-core

**Old Way (Don't Use):**
```javascript
const CommandBase = require('../utils/command-base');
const { sendSuccess } = require('../utils/response-helpers');
const db = require('../db');
```

**New Way (Use verabot-core):**
```javascript
const { CommandBase, sendSuccess, DatabaseService } = require('verabot-core');
const dbService = new DatabaseService(database);
```

## Common Patterns

### Command with Permissions
```javascript
class AdminCommand extends CommandBase {
  constructor() {
    super({ name: 'admin', description: 'Admin only' });
    this.roleService = new RolePermissionService();
  }

  async executeInteraction(interaction) {
    const canExecute = await this.roleService.canExecuteCommand(
      interaction.user.id,
      interaction.guildId,
      'admin',
      interaction.client
    );

    if (!canExecute) {
      await sendError(interaction, 'Admin permission required');
      return;
    }

    await sendSuccess(interaction, 'Admin action executed');
  }
}
```

### Command with Database
```javascript
class QuoteCommand extends CommandBase {
  constructor() {
    super({ name: 'quote', description: 'Get a quote' });
    this.dbService = new GuildAwareDatabaseService(database);
  }

  async executeInteraction(interaction) {
    const quotes = await this.dbService.getGuildData(
      interaction.guildId,
      'quotes'
    );

    if (quotes.length === 0) {
      await sendError(interaction, 'No quotes found');
      return;
    }

    const random = quotes[Math.floor(Math.random() * quotes.length)];
    await sendQuoteEmbed(interaction, random);
  }
}
```

## API Reference

See [VERABOT-CORE-API.md](./VERABOT-CORE-API.md) for complete API documentation.

## Troubleshooting

### Module Not Found
```
Error: Cannot find module 'verabot-core'
```
**Solution:** Install with `npm install verabot-core` or use local path

### Circular Dependency Warning
```
Circular dependency detected
```
**Solution:** Ensure you're using the main export, not importing subdirectories directly

### Missing Service
```
Cannot find module 'verabot-utils/services/GuildDatabaseManager'
```
**Solution:** The service may not be exported from verabot-utils; check verabot-utils documentation

## Contributing

To contribute improvements to verabot-core:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/my-feature`)
3. Make changes with tests
4. Run `npm test` and `npm run lint`
5. Commit with clear message
6. Push to branch
7. Create Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for full guidelines.

## Version History

### v1.0.0 (January 2026)
- Initial release
- CommandBase, CommandOptions, EventBase
- Response and API helpers
- Database services (re-exports from verabot-utils)
- Role permission system
- Comprehensive test suite

## License

MIT

## Support

For issues and questions:
- GitHub Issues: [verabot-core/issues](https://github.com/Rarsus/verabot-core/issues)
- Documentation: [verabot-core docs](./docs/)
- Main Project: [VeraBot2.0](https://github.com/Rarsus/verabot2.0)
