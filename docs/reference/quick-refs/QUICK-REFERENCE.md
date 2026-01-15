# Quick Reference: New Project Structure

## Where Things Are Now

### Configuration

```
.env                      → config/.env
.env.example              → config/.env.example
.eslintrc.json            → config/.eslintrc.json
```

### Source Code

```
Database logic            → src/services/DatabaseService.js
Quote business logic      → src/services/QuoteService.js
Validation logic          → src/services/ValidationService.js
Discord interactions      → src/services/DiscordService.js

CommandBase class         → src/core/CommandBase.js
CommandOptions builder    → src/core/CommandOptions.js
EventBase class           → src/core/EventBase.js

Error handling            → src/middleware/errorHandler.js
Command validation        → src/middleware/commandValidator.js
Logging                   → src/middleware/logger.js

Migration code            → src/lib/migration.js
Ready event detection     → src/lib/detectReadyEvent.js
Schema enhancement        → src/lib/schema-enhancement.js

Response helpers          → src/utils/helpers/response-helpers.js
Application constants     → src/utils/constants.js
Type definitions          → src/types/index.js
```

### Tests

```
Unit tests (test-*.js)    → tests/unit/
Test data/mocks           → tests/fixtures/
Integration tests         → tests/integration/
Test helpers              → tests/helpers/
Test runner               → tests/unit/run-tests.js
```

### Scripts

```
Test documentation gen    → scripts/build/generate-test-docs.js
Development scripts       → scripts/dev/
CI/CD scripts            → scripts/ci/
```

### Data

```
SQLite database           → data/db/quotes.db
Backup JSON               → data/quotes.json
Database seeds            → data/seeds/
Test databases            → data/db/test_*.db
```

### Documentation

```
API docs                  → docs/api/
Architecture guides       → docs/architecture/
How-to guides            → docs/guides/
Project docs             → docs/project/
Reference docs           → docs/reference/
Tutorials                → docs/tutorials/
CI/CD guide              → docs/CI-CD-QUICK-START.md
Stability procedures     → docs/STABILITY-CHECKLIST.md
```

### Logs

```
Application logs         → logs/
```

---

## Common Commands

### Development

```bash
# Start bot
npm start

# Register commands
npm run register-commands

# Run all tests
npm run test:all

# Lint code
npm run lint

# Run specific test
npm run test:quotes
npm run test:utils:base
npm run test:utils:options
npm run test:utils:helpers

# Generate test documentation
npm run test:docs
```

### File Organization

```bash
# View config
ls config/

# View source structure
tree src/ -L 2

# View tests
tree tests/ -L 2

# View documentation
ls docs/
```

---

## Import Examples

### Old Way → New Way

#### Database Operations

```javascript
// For quote operations - use the wrapper
const db = require('./db'); // Exports from DatabaseService

// For direct database access (initialization, admin operations)
const DatabaseService = require('./services/DatabaseService');
const { logError } = require('./middleware/errorHandler');
```

#### Command Base

```javascript
// OLD (v0.1.x)
const Command = require('../../utils/command-base');
const buildCommandOptions = require('../../utils/command-options');

// NEW (v0.2.0+)
const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
```

#### Response Helpers

```javascript
// OLD (v0.1.x)
const { sendSuccess } = require('../../utils/response-helpers');

// NEW (v0.2.0+)
const { sendSuccess } = require('../../utils/helpers/response-helpers');
```

#### Services

```javascript
// NEW (pattern for all services)
const { QuoteService, ValidationService } = require('../../services');

// Or import individually
const QuoteService = require('../../services/QuoteService');
const ValidationService = require('../../services/ValidationService');
```

#### Constants

```javascript
// NEW
const { EMBED_COLORS, MESSAGE_FLAGS, LIMITS } = require('../../utils/constants');
```

#### Type Definitions

```javascript
// NEW (JSDoc)
const types = require('../../types');

/**
 * @param {types.Quote} quote - A quote object
 * @returns {types.ValidationResult} Validation result
 */
```

---

## Folder Navigation

### If you need to... where do you go?

**Add a new command**
→ `src/commands/{category}/`

**Add business logic**
→ `src/services/`

**Add cross-cutting functionality**
→ `src/middleware/`

**Add framework code**
→ `src/core/`

**Add utility functions**
→ `src/utils/helpers/`

**Add constants/config**
→ `src/utils/constants.js`

**Add tests**
→ `tests/unit/` (or `tests/integration/`)

**Add test data**
→ `tests/fixtures/`

**Add documentation**
→ `docs/` (with appropriate subfolder)

**Add development scripts**
→ `scripts/dev/`

**Add build scripts**
→ `scripts/build/`

**Add seed data**
→ `data/seeds/`

---

## Service Layer API Reference

### DatabaseService

```javascript
const db = require('../services/DatabaseService');

// Initialize database
db.initializeDatabase();

// Get database connection
const conn = db.getDatabase();

// Setup schema
await db.setupSchema(conn);
```

### QuoteService

```javascript
const { getAllQuotes, getRandomQuote, searchQuotes } = require('../services/QuoteService');

// Get all quotes
const all = await getAllQuotes();

// Get random quote
const random = await getRandomQuote();

// Search quotes
const results = await searchQuotes('love');
```

### ValidationService

```javascript
const { validateQuoteText, validateAuthor, validateQuoteNumber } = require('../services/ValidationService');

// Validate text
const textResult = validateQuoteText('Quote text');
if (!textResult.valid) console.error(textResult.error);

// Validate author
const authorResult = validateAuthor('Author Name');

// Validate number
const numResult = validateQuoteNumber(5);
```

### DiscordService

```javascript
const { sendEmbed, sendEphemeral } = require('../services/DiscordService');

// Send embed
await sendEmbed(interaction, embedObject);

// Send ephemeral message
await sendEphemeral(interaction, 'Hidden message');
```

---

## Middleware API Reference

### errorHandler

```javascript
const { logError, ERROR_LEVELS } = require('../middleware/errorHandler');

logError('context', error, ERROR_LEVELS.MEDIUM, { metadata });
```

### commandValidator

```javascript
const { validateCommand } = require('../middleware/commandValidator');

if (!validateCommand(interaction)) {
  console.error('Invalid command structure');
}
```

### logger

```javascript
const { log, LOG_LEVELS } = require('../middleware/logger');

log(LOG_LEVELS.INFO, 'context', 'message', { data });
```

---

## Type Definitions

Available JSDoc types in `src/types/index.js`:

```javascript
/**
 * @typedef {Object} Quote
 * @property {number} id
 * @property {string} text
 * @property {string} author
 * @property {string} addedAt
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} CommandConfig
 * @property {string} name
 * @property {string} description
 * @property {object} data
 * @property {Array} options
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {string} error
 */

/**
 * @typedef {Object} CommandContext
 * @property {object} interaction
 * @property {object} client
 * @property {Map} commands
 */
```

---

## Test Execution

### Run specific test suites

```bash
npm run test:quotes              # Quote database tests
npm run test:quotes-advanced     # Advanced quote tests
npm run test:utils:base          # CommandBase tests
npm run test:utils:options       # CommandOptions tests
npm run test:utils:helpers       # Response helpers tests
npm run test:integration:refactor # Integration tests
```

### Run all tests

```bash
npm run test:all                 # All tests + documentation
npm run test                     # Core tests + documentation
npm run test:docs                # Generate documentation only
```

---

## Git Workflow

### Commit the restructuring

```bash
git add -A
git commit -m "refactor: reorganize to Option B structure"
git push origin main
```

### Create feature branches

```bash
git checkout -b feature/new-service
# Make changes
git commit -m "feat: add new service"
git push origin feature/new-service
```

---

## Troubleshooting Import Errors

### Error: Cannot find module '../utils/...'

**Fix:** Update import to new path

```javascript
// OLD: require('../utils/command-base')
// NEW:
require('../core/CommandBase');
```

### Error: Cannot find module './database'

**Fix:** Update to DatabaseService

```javascript
// OLD: require('./database')
// NEW:
require('./services/DatabaseService');
```

### Error: Script not found in tests/

**Fix:** Test files moved to tests/unit/

```bash
# OLD: scripts/test-quotes.js
# NEW: tests/unit/test-quotes.js
```

### ESLint error about old paths

**Fix:** Run with updated paths

```bash
npm run lint  # Now checks src/, tests/, scripts/ all correctly
```

---

## Summary of Major Changes

| Aspect          | Before                                      | After                                                     |
| --------------- | ------------------------------------------- | --------------------------------------------------------- |
| **Database**    | `src/database.js` + `src/db.js` (duplicate) | `src/services/DatabaseService.js` + `src/db.js` (wrapper) |
| **Commands**    | `src/utils/command-base.js`                 | `src/core/CommandBase.js`                                 |
| **Errors**      | `src/utils/error-handler.js`                | `src/middleware/errorHandler.js`                          |
| **Tests**       | `scripts/test-*.js`                         | `tests/unit/test-*.js`                                    |
| **Config**      | Root level                                  | `config/`                                                 |
| **Structure**   | Flat                                        | Layered/Enterprise                                        |
| **Services**    | None                                        | 4 core services                                           |
| **Middleware**  | None                                        | 3 middleware                                              |
| **Type Safety** | None                                        | JSDoc types                                               |
| **Scalability** | 10 commands max                             | 100+ commands                                             |

---

## Need More Info?

- 📖 [Architecture Overview](architecture/ARCHITECTURE-OVERVIEW.md) - Detailed architecture
- 📋 [Folder Structure Analysis](architecture/FOLDER-STRUCTURE-ANALYSIS.md) - Organization rationale
- 🚀 [CI/CD Quick Start](CI-CD-QUICK-START.md) - Deployment pipeline
- ✅ [Stability Checklist](STABILITY-CHECKLIST.md) - Operations guide
