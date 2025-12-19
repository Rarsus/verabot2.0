# Architecture Guide

Comprehensive guide to VeraBot2.0's modern architecture, design patterns, and utility modules.

## Overview

VeraBot2.0 uses a **Command-Based Architecture** with enterprise-grade project structure that eliminates code duplication and improves maintainability:

1. **Command Base Class** (`src/core/CommandBase.js`) - Automatic error handling and lifecycle management
2. **Command Options Builder** (`src/core/CommandOptions.js`) - Unified option definition and validation
3. **Response Helpers** (`src/utils/helpers/response-helpers.js`) - Standardized Discord message formatting
4. **Service Layer** (`src/services/`) - Business logic separation (Database, Validation, Quote, Discord)
5. **Middleware** (`src/middleware/`) - Cross-cutting concerns (Error handling, Validation, Logging)

### Architecture Evolution (v0.2.0)

The project has evolved from a simple utility-based structure to an enterprise-grade architecture:

**v0.1.0 → v0.2.0 Changes:**
- Moved core classes from `src/utils/` to `src/core/` for better organization
- Added service layer pattern in `src/services/` for business logic
- Introduced middleware pattern in `src/middleware/` for cross-cutting concerns
- Improved separation of concerns with dedicated directories
- Enhanced error handling with middleware approach
- Legacy files remain in `src/utils/` for backward compatibility

**Import Path Changes:**
```javascript
// OLD (v0.1.x)
const Command = require('../../utils/command-base');
const buildCommandOptions = require('../../utils/command-options');
const { sendSuccess } = require('../../utils/response-helpers');

// NEW (v0.2.0+)
const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendSuccess } = require('../../utils/helpers/response-helpers');
```

---

## Design Patterns

### 1. Command Pattern with Inheritance

Every command inherits from a base `Command` class that provides:
- Automatic error wrapping
- Consistent lifecycle methods
- Built-in registration system

```javascript
class MyCommand extends Command {
  constructor() {
    super({ name, description, data, options });
  }

  async execute(message, args) {
    // Legacy prefix command handler
  }

  async executeInteraction(interaction) {
    // Slash command handler
  }
}

module.exports = new MyCommand().register();
```

### 2. Builder Pattern for Options

The `buildCommandOptions` function uses the Builder pattern to create command options:

```javascript
const { data, options } = buildCommandOptions('name', 'description', [
  { name: 'arg1', type: 'string', required: true },
  { name: 'arg2', type: 'integer', required: false }
]);
```

**Benefits:**
- Single source of truth for option definitions
- Automatic Discord.js data structure generation
- Type-safe option creation

### 3. Helper Pattern for Responses

Standardized response functions encapsulate Discord API complexity:

```javascript
const { sendSuccess, sendError, sendQuoteEmbed } = require('./response-helpers');

// Instead of complex Discord API calls:
await interaction.reply({ embeds: [embed], ephemeral: true });

// Use simple helpers:
await sendSuccess(interaction, 'Success message', true);
```

---

## Utility Modules

### Command Base Class (`command-base.js`)

**Purpose:** Provides automatic error handling and consistent command structure

**Key Features:**
- Automatic try-catch wrapping
- Error logging to console
- Chainable `.register()` method
- Support for both slash commands and prefix commands

**Usage:**

```javascript
const Command = require('../../core/CommandBase');

class MyCommand extends Command {
  constructor() {
    super({ 
      name: 'mycommand',
      description: 'What the command does',
      data: slashCommandData,
      options: prefixOptions
    });
  }

  // Your command logic - errors are automatically handled
  async execute(message, args) {
    const result = await someOperation(); // No try-catch needed!
    return result;
  }

  async executeInteraction(interaction) {
    const result = await someOperation(); // No try-catch needed!
    return result;
  }
}

module.exports = new MyCommand().register();
```

**Error Handling:**
- All errors are automatically caught
- Errors are logged to console with command name and trace
- User receives automatic error message via Discord

### Command Options Builder (`command-options.js`)

**Purpose:** Unified option definition for both slash commands and prefix commands

**API:**

```javascript
buildCommandOptions(name, description, optionsList)
```

**Parameters:**
- `name` (string): Command name
- `description` (string): Command description (used for slash command)
- `optionsList` (array): Array of option objects

**Option Object Structure:**

```javascript
{
  name: 'argument',
  type: 'string',              // 'string', 'integer', 'boolean', 'number'
  required: true,              // Whether argument is required
  description: 'Optional'      // Used for slash command help
}
```

**Returns:**
```javascript
{
  data: { /* Discord.js SlashCommandBuilder data */ },
  options: [ /* Normalized option array */ ]
}
```

**Usage Examples:**

```javascript
// Simple string argument
const { data, options } = buildCommandOptions('greet', 'Say hello', [
  { name: 'name', type: 'string', required: true }
]);

// Multiple arguments
const { data, options } = buildCommandOptions('add', 'Add two numbers', [
  { name: 'first', type: 'integer', required: true },
  { name: 'second', type: 'integer', required: true }
]);

// Optional arguments
const { data, options } = buildCommandOptions('search', 'Search quotes', [
  { name: 'query', type: 'string', required: true },
  { name: 'limit', type: 'integer', required: false }
]);
```

### Response Helpers (`response-helpers.js`)

**Purpose:** Standardized, reusable response functions

**Available Functions:**

#### `sendQuoteEmbed(interaction, quote, title)`
Send a formatted quote embed

```javascript
const quote = { text: "Life is...", author: "Someone", rating: 4.5 };
await sendQuoteEmbed(interaction, quote, 'Random Quote');
```

#### `sendSuccess(interaction, message, ephemeral)`
Send a success message

```javascript
await sendSuccess(interaction, 'Quote added successfully!', true);
```

#### `sendError(interaction, message, ephemeral)`
Send an error message

```javascript
await sendError(interaction, 'Failed to add quote', true);
```

#### `sendDM(channel, message)`
Send a DM to a user and return confirmation

```javascript
const success = await sendDM(user, 'Here are your quotes:\n...');
```

#### `deferReply(interaction, ephemeral)`
Safely defer a reply with optional ephemeral setting

```javascript
await deferReply(interaction, true);
// Do some work...
await interaction.editReply('Result: ...');
```

---

## Code Organization

### Directory Structure

```
src/
├── commands/              # All command implementations
│   ├── misc/              # General purpose commands
│   ├── quote-discovery/   # Commands that retrieve quotes
│   ├── quote-management/  # Commands that add/edit/delete quotes
│   ├── quote-social/      # Commands for rating/tagging quotes
│   └── quote-export/      # Commands for exporting quotes
├── utils/
│   ├── command-base.js       # Base class for all commands
│   ├── command-options.js    # Option builder utility
│   ├── response-helpers.js   # Response formatting functions
│   └── error-handler.js      # Error handling and validation
├── index.js               # Bot entry point
├── register-commands.js   # Command registration logic
└── db.js                  # Database layer
```

### Command Organization Strategy

Commands are organized by **function**, not by technical similarity:

- **Misc:** General-purpose commands (help, ping, hi)
- **Quote Discovery:** Get/search quotes
- **Quote Management:** Create/update/delete quotes (admin)
- **Quote Social:** Rate and tag quotes
- **Quote Export:** Export quotes in different formats

This organization makes it easy to understand what each command does and locate related commands.

---

## Creating New Commands

### Step 1: Choose a Category

Determine which category your command belongs to based on its function:
- Retrieves quotes? → `quote-discovery/`
- Adds/modifies quotes? → `quote-management/`
- Rates/tags quotes? → `quote-social/`
- General purpose? → `misc/`

### Step 2: Use the Template

```javascript
const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendSuccess, sendError } = require('../../utils/helpers/response-helpers');

const { data, options } = buildCommandOptions('mycommand', 'What it does', [
  { name: 'arg', type: 'string', required: true }
]);

class MyCommand extends Command {
  constructor() {
    super({ name: 'mycommand', description: 'What it does', data, options });
  }

  async execute(message, args) {
    const arg = args[0];
    // Your logic here
    try {
      // Do something
      await sendSuccess(message.channel, 'Done!');
    } catch (error) {
      await sendError(message.channel, `Error: ${error.message}`);
    }
  }

  async executeInteraction(interaction) {
    const arg = interaction.options.getString('arg');
    // Your logic here
    try {
      // Do something
      await sendSuccess(interaction, 'Done!', true);
    } catch (error) {
      await sendError(interaction, `Error: ${error.message}`, true);
    }
  }
}

module.exports = new MyCommand().register();
```

### Step 3: Register the Command

Commands auto-register when exported from `command-base.js`, but you need to add them to the command loader:

Edit `src/index.js`:
```javascript
const commands = new Collection();

// Add your command
const myCommand = require('./commands/category/mycommand');
commands.set(myCommand.name, myCommand);
```

### Step 4: Add Tests

Create tests in `scripts/test-*.js` following the existing test patterns.

---

## Error Handling

### Automatic Error Handling (Command Base)

The `Command` base class automatically wraps all command logic:

```javascript
async executeWithErrorHandling(handler, context) {
  try {
    return await handler.call(this, context);
  } catch (error) {
    console.error(`[${this.name}] Command error:`, error);
    // Automatically sends error to user
  }
}
```

**What happens when an error occurs:**
1. Error is logged to console with command name and full trace
2. User receives automatic error message
3. Command continues handling other requests

### Manual Error Handling

For complex error cases, handle errors explicitly:

```javascript
try {
  // Your logic
} catch (error) {
  if (error.code === 'RATE_LIMITED') {
    await sendError(interaction, 'Rate limited, please try again later', true);
  } else if (error.code === 'DATABASE_ERROR') {
    await sendError(interaction, 'Database error, please contact admin', true);
  } else {
    await sendError(interaction, 'An unexpected error occurred', true);
  }
}
```

---

## Database Integration

### Schema

The bot uses SQLite with the following schema:

```sql
CREATE TABLE quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  author TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  rating REAL DEFAULT 0
);

CREATE TABLE ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  FOREIGN KEY (quote_id) REFERENCES quotes(id),
  UNIQUE(quote_id, user_id)
);

CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE quote_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  FOREIGN KEY (quote_id) REFERENCES quotes(id),
  FOREIGN KEY (tag_id) REFERENCES tags(id),
  UNIQUE(quote_id, tag_id)
);
```

### Usage in Commands

```javascript
const db = require('../../db');

// Query quotes
const quote = await db.get('SELECT * FROM quotes WHERE id = ?', [id]);

// Insert quote
await db.run('INSERT INTO quotes (text, author) VALUES (?, ?)', [text, author]);

// Update quote
await db.run('UPDATE quotes SET text = ? WHERE id = ?', [newText, id]);

// Delete quote
await db.run('DELETE FROM quotes WHERE id = ?', [id]);
```

---

## Performance Considerations

### Command Response Time

Typical response times:
- Simple commands (no DB): < 50ms
- DB queries (single): < 100ms
- Embed generation: < 150ms
- API calls (external): < 500ms

### Optimization Tips

1. **Use ephemeral responses** for temporary messages:
   ```javascript
   await sendSuccess(interaction, 'Message', true); // ephemeral: true
   ```

2. **Defer long-running operations**:
   ```javascript
   await deferReply(interaction, false);
   // Do heavy work...
   await interaction.editReply('Result');
   ```

3. **Cache frequently accessed data**:
   ```javascript
   const cachedQuotes = new Map();
   const getQuote = (id) => cachedQuotes.get(id) || fetchFromDB(id);
   ```

4. **Batch database operations**:
   ```javascript
   // Good: Single transaction
   await db.run('BEGIN TRANSACTION');
   // Multiple operations
   await db.run('COMMIT');
   
   // Bad: Multiple separate operations
   await db.run('INSERT ...');
   await db.run('UPDATE ...');
   await db.run('DELETE ...');
   ```

---

## Testing Architecture

### Test Structure

Tests are organized by module:
- `test-command-base.js` - Command class tests
- `test-command-options.js` - Options builder tests
- `test-response-helpers.js` - Response helper tests
- `test-integration-refactor.js` - Integration tests

### Writing Tests

```javascript
// Test pattern
function testCommandInheritance() {
  const command = new TestCommand();
  assert.strictEqual(command.name, 'test');
  assert(command instanceof Command);
  console.log('✓ Command inheritance works');
}

// Run tests
testCommandInheritance();
```

---

## Best Practices

### 1. Always Use Helper Functions

```javascript
// Bad
await interaction.reply({ 
  embeds: [embed], 
  ephemeral: true 
});

// Good
await sendQuoteEmbed(interaction, quote, 'Title');
```

### 2. Extend Command Base Class

```javascript
// Bad
module.exports = {
  name: 'cmd',
  async execute() { /* logic */ }
};

// Good
class MyCommand extends Command {
  async execute() { /* logic */ }
}
module.exports = new MyCommand().register();
```

### 3. Use buildCommandOptions

```javascript
// Bad
const options = [
  { name: 'text', description: 'Input text', type: STRING }
];

// Good
const { data, options } = buildCommandOptions('cmd', 'Description', [
  { name: 'text', type: 'string', required: true }
]);
```

### 4. Handle Errors Explicitly

```javascript
// Bad
await someDatabase.query();

// Good
try {
  await someDatabase.query();
} catch (error) {
  if (error.code === 'DB_ERROR') {
    await sendError(interaction, 'Database error');
  }
  throw error;
}
```

### 5. Document Command Parameters

```javascript
class MyCommand extends Command {
  constructor() {
    // Document your options
    super({ 
      name: 'mycommand',
      description: 'Does something amazing',
      data: slashData,
      options: [
        { name: 'input', type: 'string', required: true },  // What it is
      ]
    });
  }
}
```

---

## Troubleshooting

### Command not registering
- Check command file is in correct directory
- Verify command exports from `Command` class
- Ensure `.register()` is called on export

### Options not working
- Verify option types match Discord.js types
- Check required fields are marked correctly
- Ensure option names match parameter names in execute()

### Errors not being caught
- Make sure to `await` async operations
- Verify error-prone code is inside execute() or executeInteraction()
- Check Command base class is being extended

### Tests failing
- Run tests with `npm run test:all`
- Check test output for specific failures
- Verify utility modules are loaded correctly

---

## Future Improvements

1. **Middleware System** - Add before/after hooks for commands
2. **Permission System** - Centralized permission checking
3. **Command Groups** - Organize related commands together
4. **Event System** - Trigger events on command execution
5. **Logging** - Centralized logging with log levels

---

## References

- [Discord.js Documentation](https://discord.js.org/)
- [Design Patterns - Gang of Four](https://en.wikipedia.org/wiki/Design_Patterns)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
