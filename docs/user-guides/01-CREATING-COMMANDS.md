# Developer Guide

Complete guide for developing new commands and features in VeraBot2.0.

## Quick Start for New Developers

### 1. Setup Your Environment

```bash
# Clone the repository
git clone <repo-url>
cd verabot2.0

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your Discord token
```

### 2. Start the Bot

```bash
npm start
```

You should see:

```
✓ Bot logged in as VeraBot#1234
✓ Registered X commands
✓ Ready to receive commands
```

### 3. Register Commands

```bash
npm run register-commands
```

Commands are now available in Discord servers where the bot has permission.

---

## Creating Your First Command

### Step 1: Create the Command File

Create a new file: `src/commands/misc/mycommand.js`

```javascript
const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendSuccess, sendError } = require('../../utils/helpers/response-helpers');

// Define command options
const { data, options } = buildCommandOptions('mycommand', 'Does something cool', [
  { name: 'text', type: 'string', required: true, description: 'Input text' },
]);

class MyCommand extends Command {
  constructor() {
    super({
      name: 'mycommand',
      description: 'Does something cool',
      data, // For slash commands
      options, // For prefix commands
    });
  }

  async execute(message, args) {
    // Prefix command handler (legacy)
    const text = args.join(' ');

    if (!text) {
      await sendError(message.channel, 'Please provide text');
      return;
    }

    // Your logic here
    const result = text.toUpperCase();
    await sendSuccess(message.channel, `Result: ${result}`);
  }

  async executeInteraction(interaction) {
    // Slash command handler
    const text = interaction.options.getString('text');

    // Your logic here (same as above)
    const result = text.toUpperCase();
    await sendSuccess(interaction, `Result: ${result}`, true); // ephemeral: true
  }
}

module.exports = new MyCommand().register();
```

### Step 2: Register the Command

Edit `src/index.js` and add:

```javascript
const mycommand = require('./commands/misc/mycommand');
commands.set(mycommand.name, mycommand);
```

### Step 3: Test the Command

```bash
# Register commands
npm run register-commands

# Start bot
npm start
```

In Discord:

- Type `/mycommand text:hello`
- Or: `!mycommand hello world`

---

## Command Structure Deep Dive

### Basic Components

Every command has three main parts:

```javascript
// 1. IMPORTS - Required utilities
const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendSuccess, sendError } = require('../../utils/helpers/response-helpers');

// 2. OPTIONS DEFINITION - What the command takes as input
const { data, options } = buildCommandOptions('name', 'description', [
  { name: 'arg1', type: 'string', required: true },
  { name: 'arg2', type: 'integer', required: false },
]);

// 3. CLASS DEFINITION - The command logic
class MyCommand extends Command {
  constructor() {
    super({ name, description, data, options });
  }

  async execute(message, args) {
    /* ... */
  }
  async executeInteraction(interaction) {
    /* ... */
  }
}

module.exports = new MyCommand().register();
```

### Command Parameters

#### Message (Prefix Commands)

```javascript
async execute(message, args) {
  // message: Discord.js Message object
  // message.author: User who sent the command
  // message.channel: Channel where command was sent
  // message.guild: Server where command was sent

  // args: Array of arguments after command name
  // !mycommand arg1 arg2 arg3
  // args = ['arg1', 'arg2', 'arg3']
}
```

#### Interaction (Slash Commands)

```javascript
async executeInteraction(interaction) {
  // interaction: Discord.js Interaction object
  // interaction.user: User who used the command
  // interaction.channel: Channel where command was used
  // interaction.guild: Server where command was used

  // Get options by name
  const text = interaction.options.getString('text');
  const number = interaction.options.getInteger('number');
  const user = interaction.options.getUser('user');
}
```

---

## Common Command Patterns

### 1. Simple Query (Get Data)

```javascript
class SearchCommand extends Command {
  constructor() {
    super({
      name: 'search',
      description: 'Search for something',
      data,
      options,
    });
  }

  async execute(message, args) {
    const query = args.join(' ');

    // Query database or API
    const results = await db.all('SELECT * FROM items WHERE name LIKE ?', [`%${query}%`]);

    if (results.length === 0) {
      await sendError(message.channel, 'No results found');
      return;
    }

    // Format and send results
    const formatted = results.map((r) => `• ${r.name}`).join('\n');
    await sendSuccess(message.channel, formatted);
  }

  async executeInteraction(interaction) {
    const query = interaction.options.getString('query');
    await deferReply(interaction, true);

    const results = await db.all('SELECT * FROM items WHERE name LIKE ?', [`%${query}%`]);

    if (results.length === 0) {
      await sendError(interaction, 'No results found');
      return;
    }

    const formatted = results.map((r) => `• ${r.name}`).join('\n');
    await sendSuccess(interaction, formatted, true);
  }
}
```

### 2. Modification (Create/Update/Delete)

```javascript
class AddCommand extends Command {
  constructor() {
    super({
      name: 'add',
      description: 'Add a new item',
      data,
      options,
    });
  }

  async execute(message, args) {
    if (args.length < 2) {
      await sendError(message.channel, 'Usage: !add <name> <value>');
      return;
    }

    const [name, value] = args;

    // Validation
    if (name.length > 100) {
      await sendError(message.channel, 'Name too long (max 100 chars)');
      return;
    }

    // Database operation
    try {
      await db.run('INSERT INTO items (name, value) VALUES (?, ?)', [name, value]);
      await sendSuccess(message.channel, `Added "${name}"`);
    } catch (error) {
      if (error.message.includes('UNIQUE')) {
        await sendError(message.channel, 'Item already exists');
      } else {
        throw error; // Let base class handle
      }
    }
  }

  async executeInteraction(interaction) {
    const name = interaction.options.getString('name');
    const value = interaction.options.getString('value');

    await deferReply(interaction, true);

    // Validation and operation (same as above)
    if (name.length > 100) {
      await sendError(interaction, 'Name too long');
      return;
    }

    try {
      await db.run('INSERT INTO items (name, value) VALUES (?, ?)', [name, value]);
      await sendSuccess(interaction, `Added "${name}"`, true);
    } catch (error) {
      if (error.message.includes('UNIQUE')) {
        await sendError(interaction, 'Item already exists', true);
      } else {
        throw error;
      }
    }
  }
}
```

### 3. Admin-Only Command

```javascript
class AdminCommand extends Command {
  constructor() {
    super({ name: 'admin', description: '...', data, options });
  }

  async execute(message, args) {
    // Check permissions
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      await sendError(message.channel, 'Admin only', true);
      return;
    }

    // Admin logic here
  }

  async executeInteraction(interaction) {
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      await sendError(interaction, 'Admin only', true);
      return;
    }

    // Admin logic here
  }
}
```

### 4. Command with Multiple Options

```javascript
const { data, options } = buildCommandOptions('rate', 'Rate something', [
  { name: 'id', type: 'integer', required: true },
  { name: 'rating', type: 'integer', required: true },
  { name: 'comment', type: 'string', required: false },
]);

class RateCommand extends Command {
  async executeInteraction(interaction) {
    const id = interaction.options.getInteger('id');
    const rating = interaction.options.getInteger('rating');
    const comment = interaction.options.getString('comment') || null;

    // Validation
    if (rating < 1 || rating > 5) {
      await sendError(interaction, 'Rating must be 1-5', true);
      return;
    }

    // Process rating
    await db.run('INSERT INTO ratings (item_id, user_id, rating, comment) VALUES (?, ?, ?, ?)', [
      id,
      interaction.user.id,
      rating,
      comment,
    ]);

    await sendSuccess(interaction, `Rated ${rating}/5`, true);
  }
}
```

---

## Working with the Database

### Query Examples

```javascript
// SELECT - Get single row
const item = await db.get('SELECT * FROM items WHERE id = ?', [id]);

// SELECT - Get multiple rows
const items = await db.all('SELECT * FROM items WHERE category = ?', [category]);

// COUNT
const count = await db.get('SELECT COUNT(*) as count FROM items');

// INSERT
await db.run('INSERT INTO items (name, value) VALUES (?, ?)', [name, value]);

// UPDATE
await db.run('UPDATE items SET value = ? WHERE id = ?', [newValue, id]);

// DELETE
await db.run('DELETE FROM items WHERE id = ?', [id]);

// TRANSACTION
await db.run('BEGIN TRANSACTION');
try {
  await db.run('INSERT INTO ...');
  await db.run('UPDATE FROM ...');
  await db.run('COMMIT');
} catch {
  await db.run('ROLLBACK');
  throw error;
}
```

---

## Working with Discord.js

### Sending Messages

```javascript
// Using response helpers (recommended)
await sendSuccess(interaction, 'Done!', true);
await sendError(interaction, 'Error occurred', true);
await sendQuoteEmbed(interaction, quote, 'Title');

// Direct Discord.js (if needed)
await interaction.reply({ content: 'Hello!', ephemeral: true });
await interaction.channel.send('Hello!');
```

### User Information

```javascript
// Get user
const user = interaction.user; // User object
const userId = user.id;
const username = user.username;
const discriminator = user.discriminator;

// Get member (server-specific info)
const member = interaction.member;
const roles = member.roles;
const nickname = member.nickname;
const permissions = member.permissions;
```

### Channel Information

```javascript
const channel = interaction.channel;
const channelId = channel.id;
const channelName = channel.name;
const isPrivate = channel.isDMBased();

// Send DM
const dm = await user.send('Direct message here');
```

---

## Testing Your Command

### Manual Testing

```bash
# 1. Start bot
npm start

# 2. In Discord, use your command:
/mycommand arg1:value

# 3. Check console for errors or logs
```

### Automated Testing

Create a test file: `scripts/test-mycommand.js`

```javascript
const assert = require('assert');
const MyCommand = require('../src/commands/misc/mycommand');

function testCommandCreation() {
  const command = new MyCommand();
  assert.strictEqual(command.name, 'mycommand');
  console.log('✓ Command created successfully');
}

function testCommandExecution() {
  // Mock objects
  const message = {
    channel: { send: async () => {} },
  };
  const args = ['test'];

  // Test execution doesn't throw
  try {
    command.execute(message, args);
    console.log('✓ Command execution works');
  } catch (error) {
    console.error('✗ Command execution failed:', error);
  }
}

// Run tests
testCommandCreation();
testCommandExecution();
```

Run test: `node scripts/test-mycommand.js`

---

## Common Issues and Solutions

### Issue: Command not showing up in Discord

**Solution:**

1. Verify command file is in correct directory
2. Run `npm run register-commands`
3. Restart bot: `npm start`
4. Wait 1 minute for Discord to sync
5. Check bot has permission to use application commands

### Issue: "Cannot find module" error

**Solution:**

- Check file path is correct
- Verify relative paths match directory structure
- Try: `node src/commands/misc/mycommand.js` to test directly

### Issue: Slash command works but prefix command doesn't

**Solution:**

- Check `buildCommandOptions` is being used
- Verify command is registered in `src/index.js`
- Check prefix is set correctly in `.env`

### Issue: Database error when adding command

**Solution:**

- Ensure database is initialized: `npm start` creates it
- Check SQL syntax is correct
- Verify table exists: `SELECT name FROM sqlite_master WHERE type='table'`

### Issue: Command runs but doesn't send response

**Solution:**

- Add `await` before Discord API calls
- Check ephemeral responses with `true` parameter
- Verify `sendSuccess`, `sendError` are imported correctly
- Check user has permission to see bot responses

---

## Best Practices

### 1. Error Handling

```javascript
// Good
try {
  const result = await someOperation();
  await sendSuccess(interaction, `Done: ${result}`);
} catch (error) {
  if (error.code === 'SPECIFIC_ERROR') {
    await sendError(interaction, 'User-friendly message');
  } else {
    throw error; // Let base class handle
  }
}

// Bad
const result = await someOperation(); // No error handling
await sendSuccess(interaction, `Done: ${result}`);
```

### 2. Input Validation

```javascript
// Good
const rating = interaction.options.getInteger('rating');
if (rating < 1 || rating > 5) {
  await sendError(interaction, 'Rating must be 1-5');
  return;
}

// Bad
const rating = interaction.options.getInteger('rating');
// No validation, might crash
```

### 3. Code Organization

```javascript
// Good - Organized sections
class MyCommand extends Command {
  constructor() { /* ... */ }

  async validateInput() { /* ... */ }
  async getRequiredData() { /* ... */ }
  async processData() { /* ... */ }
  async sendResponse() { /* ... */ }

  async execute(message, args) {
    if (!this.validateInput(args)) return;
    const data = await this.getRequiredData();
    const result = await this.processData(data);
    await this.sendResponse(message, result);
  }
}

// Bad - Mixed logic
async execute(message, args) {
  // Everything mixed together
  if (args.length === 0) return;
  const data = await fetch(...);
  // ... more logic ...
}
```

### 4. Naming Conventions

```javascript
// Good
- commandName.js - File names lowercase-hyphen
- MyCommand - Class names PascalCase
- myVariable - Variable names camelCase
- MY_CONSTANT - Constants UPPER_SNAKE_CASE

// Bad
- MyCommand.js - Inconsistent naming
- my_command - Underscore in file names
- MyVar - Inconsistent variable naming
```

### 5. Documentation

```javascript
class ImportantCommand extends Command {
  /**
   * Gets the top N quotes by rating
   * @param {number} limit - Maximum quotes to return
   * @returns {Promise<Array>} Array of quotes, sorted by rating
   */
  async getTopQuotes(limit) {
    return db.all('SELECT * FROM quotes ORDER BY rating DESC LIMIT ?', [limit]);
  }
}
```

---

## Next Steps

1. **Read ARCHITECTURE.md** - Understand how utilities work
2. **Look at existing commands** - Study command patterns
3. **Create a simple command** - Start with a basic command
4. **Add tests** - Test your command functionality
5. **Submit a PR** - Share your improvements!

---

## Getting Help

- Check [Discord.js Documentation](https://discord.js.org/)
- Review existing command implementations
- Check console errors when bot runs
- Read error messages carefully - they usually point to the issue
- Test incrementally - build, test, and verify each step
