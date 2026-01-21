# Package Import Reference

## Quick Start

### Installation

```bash
# Core module with all dependencies
npm install @verabot/core

# Utils library  
npm install @verabot/utils

# Dashboard frontend
npm install @verabot/dashboard

# Commands module
npm install @verabot/commands

# Or all together
npm install @verabot/core @verabot/utils @verabot/dashboard @verabot/commands
```

## @verabot/core Exports

### Base Classes
```javascript
const CommandBase = require('@verabot/core/core/CommandBase');
const CommandOptions = require('@verabot/core/core/CommandOptions');
const EventBase = require('@verabot/core/core/EventBase');
```

### Services
```javascript
const DatabaseService = require('@verabot/core/services/DatabaseService');
const GuildAwareDatabaseService = require('@verabot/core/services/GuildAwareDatabaseService');
const DiscordService = require('@verabot/core/services/DiscordService');
const ValidationService = require('@verabot/core/services/ValidationService');
const RolePermissionService = require('@verabot/core/services/RolePermissionService');
```

### Response Helpers
```javascript
const { 
  sendSuccess, 
  sendError, 
  sendQuoteEmbed, 
  sendDM 
} = require('@verabot/core/helpers/response-helpers');
```

## @verabot/utils Exports

### Services
```javascript
const DatabaseService = require('@verabot/utils/services/DatabaseService');
const GuildAwareDatabaseService = require('@verabot/utils/services/GuildAwareDatabaseService');
const ValidationService = require('@verabot/utils/services/ValidationService');
```

### Middleware
```javascript
const { logError } = require('@verabot/utils/middleware/errorHandler');
const logger = require('@verabot/utils/middleware/logger');
```

### Helpers
```javascript
const { 
  sendSuccess, 
  sendError, 
  sendQuoteEmbed 
} = require('@verabot/utils/helpers/response-helpers');
```

## @verabot/dashboard Exports

```javascript
const dashboardApp = require('@verabot/dashboard');
```

## @verabot/commands Exports

```javascript
const commandRegistry = require('@verabot/commands');
```

## Usage Examples

### Basic Command Creation
```javascript
const Command = require('@verabot/core/core/CommandBase');
const buildCommandOptions = require('@verabot/core/core/CommandOptions');
const { sendSuccess } = require('@verabot/core/helpers/response-helpers');

const options = buildCommandOptions('mycommand', 'Description', [
  { name: 'arg1', type: 'string', required: true }
]);

class MyCommand extends Command {
  constructor() {
    super({ 
      name: 'mycommand', 
      description: 'Description',
      ...options 
    });
  }

  async executeInteraction(interaction) {
    await sendSuccess(interaction, 'Success!');
  }
}

module.exports = new MyCommand().register();
```

### Using Database Service
```javascript
const DatabaseService = require('@verabot/utils/services/DatabaseService');

const db = new DatabaseService('./data.db');
await db.initialize();
const result = await db.run('SELECT * FROM quotes');
```

### Using Validation
```javascript
const ValidationService = require('@verabot/utils/services/ValidationService');

const validator = new ValidationService();
const isValid = validator.validateEmail('user@example.com');
```

### Using Response Helpers
```javascript
const { sendError, sendQuoteEmbed } = require('@verabot/core/helpers/response-helpers');

// Send error message
await sendError(interaction, 'Something went wrong', true);

// Send quote embed
const quote = { text: 'Great quote', author: 'Author Name', id: 123 };
await sendQuoteEmbed(interaction, quote, 'Quote Found');
```

## Version Management

Each package is independently versioned. When installing, you can specify versions:

```bash
# Specific version
npm install @verabot/core@1.2.3

# Latest
npm install @verabot/core@latest

# Semantic range
npm install @verabot/core@^1.0.0  # >= 1.0.0, < 2.0.0
npm install @verabot/core@~1.2.0  # >= 1.2.0, < 1.3.0
```

## Development vs Production

### Local Development
In your monorepo workspace, packages use `file:` protocol for instant updates:

```json
{
  "dependencies": {
    "@verabot/utils": "file:../verabot-utils"
  }
}
```

Changes in `verabot-utils` are immediately reflected (no npm install needed).

### External Projects
External projects install from npm registry:

```json
{
  "dependencies": {
    "@verabot/utils": "^1.0.0"
  }
}
```

Updates require `npm install` to fetch new versions.

## Troubleshooting

### Module Not Found
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Wrong Version Installed
```bash
# Check what's installed
npm list @verabot/core

# Update to latest
npm install @verabot/core@latest
```

### Package Not Found on npm
```bash
# Verify package is published
npm search @verabot

# Check specific package
npm view @verabot/core
```

## Package Structure

### @verabot/core
```
src/
├── core/
│   ├── CommandBase.js
│   ├── CommandOptions.js
│   └── EventBase.js
├── services/
│   ├── DatabaseService.js
│   ├── GuildAwareDatabaseService.js
│   ├── DiscordService.js
│   ├── ValidationService.js
│   └── RolePermissionService.js
└── helpers/
    ├── response-helpers.js
    └── api-helpers.js
```

### @verabot/utils
```
src/
├── services/
│   ├── DatabaseService.js
│   ├── GuildAwareDatabaseService.js
│   └── ValidationService.js
├── middleware/
│   ├── errorHandler.js
│   └── logger.js
└── helpers/
    ├── response-helpers.js
    └── api-helpers.js
```

## TypeScript Support

For TypeScript users, type definitions are included in relevant packages:

```typescript
import { CommandBase } from '@verabot/core';
import { DatabaseService } from '@verabot/utils';

class MyCommand extends CommandBase {
  // types available
}
```

## Versioning Scheme

We use [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features (backward compatible)
- **PATCH** (1.0.0 → 1.0.1): Bug fixes

Version is automatically bumped based on commit message convention.

## Support

For issues or questions:
1. Check package README: `npm info @verabot/core`
2. Check NPM Publishing Setup guide for environment setup
3. File an issue on GitHub repo
