# verabot-utils

Shared utilities and services library for Verabot - Provides database abstraction, logging, validation, and common helpers.

## Overview

This repository contains reusable utilities and services extracted from the main Verabot project as part of Epic #49 (Repository Separation). It provides:

- **Database Abstraction**: Guild-aware database services
- **Logging & Error Handling**: Centralized logging and error tracking
- **Validation**: Input validation utilities
- **API Helpers**: Common API client utilities
- **Response Formatting**: Standardized response helpers
- **Type Definitions**: Shared TypeScript interfaces

## Architecture

```
src/
├── services/              # Reusable services
│   ├── DatabaseService.js
│   ├── GuildAwareDatabaseService.js
│   ├── GuildAwareReminderService.js
│   └── ValidationService.js
├── middleware/            # Middleware functions
│   ├── errorHandler.js
│   ├── logger.js
│   └── inputValidator.js
├── helpers/               # Helper functions
│   ├── response-helpers.js
│   ├── api-helpers.js
│   └── validation-helpers.js
├── types/                 # Type definitions
│   └── index.d.ts
└── index.js              # Main export file

tests/
├── services/
├── middleware/
└── helpers/
```

## Prerequisites

- **Node.js**: 20+ (minimum v20.0.0)
- **npm**: 10.0.0+
- **PostgreSQL/SQLite**: For database operations

## Setup

### Installation

```bash
# Clone the repository
git clone https://github.com/Rarsus/verabot-utils.git
cd verabot-utils

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### Configuration

**Required Environment Variables:**

```env
DATABASE_URL=postgresql://user:password@localhost:5432/verabot
LOG_LEVEL=info
```

**Optional Environment Variables:**

```env
DEBUG=verabot:*
```

## Development

### Run Tests

```bash
npm test
npm run test:watch
npm run coverage
```

### Linting & Code Quality

```bash
npm run lint
npm run lint:fix
npm run format
```

## Usage Examples

### Database Operations

```javascript
const GuildAwareDatabaseService = require('verabot-utils/services/GuildAwareDatabaseService');

const db = new GuildAwareDatabaseService(process.env.DATABASE_URL);

// Get a quote for specific guild
const quote = await db.getQuote('guild-123', quoteId);

// Add quote to guild
const newQuote = await db.addQuote('guild-123', {
  text: 'Great quote',
  author: 'Author Name'
});
```

### Logging

```javascript
const { createLogger } = require('verabot-utils/middleware/errorHandler');

const logger = createLogger('my-module');

logger.info('Information message');
logger.warn('Warning message');
logger.error('Error message', error);
logger.debug('Debug information');
```

### Response Helpers

```javascript
const { sendSuccess, sendError, sendQuoteEmbed } = require('verabot-utils/helpers/response-helpers');

// In Discord commands
await sendSuccess(interaction, 'Operation successful!');
await sendError(interaction, 'Something went wrong', true);
await sendQuoteEmbed(interaction, quote, 'Quote Title');
```

### Input Validation

```javascript
const ValidationService = require('verabot-utils/services/ValidationService');

const validator = new ValidationService();

const isValid = validator.validateQuoteText(quoteText);
if (!isValid) {
  throw new Error('Invalid quote text');
}
```

## Deploying as npm Package

### Publish to npm

```bash
# Bump version
npm version patch  # or minor, major

# Publish
npm publish
```

### Using in Other Projects

```bash
npm install verabot-utils
```

Then in your code:

```javascript
const DatabaseService = require('verabot-utils/services/DatabaseService');
const { createLogger } = require('verabot-utils/middleware/errorHandler');
const { sendSuccess } = require('verabot-utils/helpers/response-helpers');
```

## Testing

### Coverage Requirements

- **Line Coverage**: 90%+
- **Function Coverage**: 95%+
- **Branch Coverage**: 85%+

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run coverage      # Coverage report
npm run coverage:open # Open HTML coverage report
```

### Test Structure

Tests follow TDD principles:

```javascript
describe('GuildAwareDatabaseService', () => {
  let db;

  beforeEach(async () => {
    db = new GuildAwareDatabaseService(':memory:');
    await db.initialize();
  });

  it('should add and retrieve quotes for specific guild', async () => {
    const quote = await db.addQuote('guild-123', {
      text: 'Test quote',
      author: 'Author'
    });

    const retrieved = await db.getQuote('guild-123', quote.id);
    expect(retrieved.text).toBe('Test quote');
  });
});
```

## API Reference

### Services

#### DatabaseService

Core database operations:

```javascript
new DatabaseService(connectionString)
  .initialize()        // Initialize database
  .getConnection()     // Get raw DB connection
  .close()             // Close connection
```

#### GuildAwareDatabaseService

Guild-scoped database operations:

```javascript
new GuildAwareDatabaseService(connectionString)
  .getQuote(guildId, quoteId)
  .getAllQuotes(guildId)
  .addQuote(guildId, text, author)
  .deleteQuote(guildId, quoteId)
  .updateQuote(guildId, quoteId, updates)
  .rateQuote(guildId, quoteId, rating)
  .tagQuote(guildId, quoteId, tag)
```

#### ValidationService

Input validation utilities:

```javascript
new ValidationService()
  .validateQuoteText(text)     // Validate quote text
  .validateGuildId(guildId)    // Validate guild ID
  .validateUserId(userId)      // Validate user ID
  .validateEmail(email)        // Validate email
  .validateUrl(url)            // Validate URL
```

### Middleware

#### Error Handler

```javascript
const { errorHandler, logError, createLogger } = require('verabot-utils/middleware/errorHandler');

// Create logger instance
const logger = createLogger('module-name');

// Express middleware
app.use(errorHandler);

// Manual logging
logError(error, context);
```

### Helpers

#### Response Helpers

```javascript
const {
  sendSuccess,
  sendError,
  sendQuoteEmbed,
  sendDM,
  formatResponse
} = require('verabot-utils/helpers/response-helpers');
```

#### API Helpers

```javascript
const { createApiClient, retry } = require('verabot-utils/helpers/api-helpers');

const client = createApiClient(baseUrl);
const response = await retry(() => client.get('/endpoint'), { retries: 3 });
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for development guidelines.

## Architecture References

- **Parent Repository**: https://github.com/Rarsus/verabot2.0
- **Implementation Plan**: [EPIC-49-IMPLEMENTATION-PLAN.md](../../EPIC-49-IMPLEMENTATION-PLAN.md)

## Support

For issues or questions, create an issue or contact the development team.

## License

MIT - See [LICENSE](../../LICENCE) file

---

**Version**: 1.0.0  
**Last Updated**: January 20, 2026  
**Status**: Active Development (Epic #49)
