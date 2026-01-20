# verabot-core API Reference
**Version:** 1.0.0  
**Last Updated:** January 20, 2026  
**Status:** Complete API Documentation

## Table of Contents
1. [CommandBase](#commandbase)
2. [CommandOptions](#commandoptions)
3. [EventBase](#eventbase)
4. [Response Helpers](#response-helpers)
5. [API Helpers](#api-helpers)
6. [Database Services](#database-services)
7. [Validation Service](#validation-service)
8. [Role Permission Service](#role-permission-service)

---

## CommandBase

Base class for all bot commands. Provides automatic error handling and lifecycle management.

### Constructor

```javascript
const CommandBase = require('verabot-core/core/CommandBase');

class MyCommand extends CommandBase {
  constructor() {
    super({
      name: 'mycommand',                    // Command name
      description: 'My command description', // Short description
      aliases: ['mc'],                      // Prefix command aliases (optional)
      category: 'General',                  // Command category (optional)
      data: slashCommandData,               // Discord slash command data
      options: {                            // Command options
        prefix: { arg1: 'string', arg2: 'user' },
        slash: { arg1: 'string', arg2: 'user' }
      }
    });
  }
}
```

### Methods

#### `execute(message, args)`
**Purpose:** Handle prefix command execution  
**Parameters:**
- `message` (Discord.Message) - The message object
- `args` (Array<string>) - Command arguments

**Returns:** Promise<object>

**Example:**
```javascript
async execute(message, args) {
  const target = args[0];
  return { success: true, target };
}
```

#### `executeInteraction(interaction)`
**Purpose:** Handle slash command execution  
**Parameters:**
- `interaction` (Discord.CommandInteraction) - The interaction object

**Returns:** Promise<object>

**Example:**
```javascript
async executeInteraction(interaction) {
  const target = interaction.options.getUser('target');
  await interaction.reply(`Hello ${target.username}`);
  return { success: true };
}
```

#### `register()`
**Purpose:** Register command and return instance  
**Returns:** CommandBase instance

**Example:**
```javascript
module.exports = new MyCommand().register();
```

### Error Handling

Errors are automatically caught and logged:

```javascript
class MyCommand extends CommandBase {
  async executeInteraction(interaction) {
    throw new Error('Something failed');
    // ✅ Automatically caught
    // ✅ User sees: "❌ An error occurred..."
    // ✅ Error logged to console
  }
}
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Command name |
| `description` | string | Command description |
| `aliases` | Array<string> | Prefix command aliases |
| `category` | string | Command category |
| `data` | object | Slash command data |
| `options` | object | Command options |

---

## CommandOptions

Builder function for creating unified command options for both slash and prefix commands.

### Function Signature

```javascript
const { buildCommandOptions } = require('verabot-core/core/CommandOptions');

const { data, options } = buildCommandOptions(
  commandName,      // string - Command name
  description,      // string - Command description
  optionsArray      // Array<object> - Option definitions
);
```

### Option Definition

Each option in the array:

```javascript
{
  name: 'username',                    // Option name
  type: 'string',                      // Type: 'string', 'user', 'role', 'channel', 'number', 'boolean'
  required: true,                      // Required flag
  description: 'User to search for',  // Description
  choices: [                           // Optional choices
    { name: 'Option 1', value: 'opt1' },
    { name: 'Option 2', value: 'opt2' }
  ]
}
```

### Return Value

```javascript
{
  data: {
    // Slash command ApplicationCommandData
    name: 'mycommand',
    description: 'Description',
    options: [/* Discord.js ApplicationCommandOption array */]
  },
  options: {
    // Prefix command option definitions
    prefix: { username: 'string' },
    slash: { username: 'string' }
  }
}
```

### Example: Full Command with Options

```javascript
const { CommandBase, buildCommandOptions } = require('verabot-core');

const { data, options } = buildCommandOptions('ban', 'Ban a member', [
  {
    name: 'member',
    type: 'user',
    required: true,
    description: 'Member to ban'
  },
  {
    name: 'reason',
    type: 'string',
    required: false,
    description: 'Reason for ban'
  }
]);

class BanCommand extends CommandBase {
  constructor() {
    super({ name: 'ban', description: 'Ban a member', data, options });
  }

  async executeInteraction(interaction) {
    const member = interaction.options.getUser('member');
    const reason = interaction.options.getString('reason') || 'No reason';
    
    await member.ban({ reason });
    await sendSuccess(interaction, `Banned ${member.username}: ${reason}`);
  }
}

module.exports = new BanCommand().register();
```

---

## EventBase

Base class for event handlers.

### Constructor

```javascript
const EventBase = require('verabot-core/core/EventBase');

class MyEvent extends EventBase {
  constructor() {
    super({
      name: 'ready',      // Event name
      once: false         // Listen only once (optional)
    });
  }
}
```

### Methods

#### `execute(...args)`
**Purpose:** Handle event  
**Parameters:** Event-specific arguments  
**Returns:** Promise<void>

**Example:**
```javascript
async execute(client) {
  console.log(`Bot ready as ${client.user.tag}`);
}
```

#### `register()`
**Purpose:** Register event and return instance  
**Returns:** EventBase instance

### Common Events

```javascript
// Ready event
class ReadyEvent extends EventBase {
  constructor() {
    super({ name: 'ready', once: true });
  }
  
  async execute(client) {
    console.log(`✅ ${client.user.tag} logged in`);
  }
}

// Message event
class MessageEvent extends EventBase {
  constructor() {
    super({ name: 'messageCreate' });
  }
  
  async execute(message) {
    if (message.author.bot) return;
    // Handle message
  }
}

// Interaction event
class InteractionEvent extends EventBase {
  constructor() {
    super({ name: 'interactionCreate' });
  }
  
  async execute(interaction) {
    if (interaction.isCommand()) {
      // Handle command
    }
  }
}
```

---

## Response Helpers

Standardized response functions for Discord interactions.

### sendSuccess(interaction, message, ephemeral)

**Purpose:** Send success response  
**Parameters:**
- `interaction` (Interaction) - Discord interaction
- `message` (string) - Success message
- `ephemeral` (boolean, optional) - Default: false

**Example:**
```javascript
const { sendSuccess } = require('verabot-core/helpers/response-helpers');

await sendSuccess(interaction, '✅ Operation completed!');
await sendSuccess(interaction, 'Saved!', true); // Ephemeral
```

### sendError(interaction, message, ephemeral)

**Purpose:** Send error response  
**Parameters:**
- `interaction` (Interaction) - Discord interaction
- `message` (string) - Error message
- `ephemeral` (boolean, optional) - Default: true

**Example:**
```javascript
const { sendError } = require('verabot-core/helpers/response-helpers');

await sendError(interaction, '❌ Access denied');
await sendError(interaction, 'User not found', false);
```

### sendQuoteEmbed(interaction, quote, title)

**Purpose:** Send quote in embed format  
**Parameters:**
- `interaction` (Interaction) - Discord interaction
- `quote` (object) - Quote object with text, author, id
- `title` (string) - Embed title

**Example:**
```javascript
const { sendQuoteEmbed } = require('verabot-core/helpers/response-helpers');

const quote = { text: 'Great quote', author: 'John Doe', id: 123 };
await sendQuoteEmbed(interaction, quote, 'Quote of the Day');
```

### sendDM(user, message)

**Purpose:** Send direct message to user  
**Parameters:**
- `user` (User) - Discord user
- `message` (string|EmbedBuilder) - Message content

**Example:**
```javascript
const { sendDM } = require('verabot-core/helpers/response-helpers');

await sendDM(user, 'Check your DMs!');
```

### deferReply(interaction, ephemeral)

**Purpose:** Defer interaction reply with thinking indicator  
**Parameters:**
- `interaction` (Interaction) - Discord interaction
- `ephemeral` (boolean, optional) - Default: false

**Example:**
```javascript
const { deferReply } = require('verabot-core/helpers/response-helpers');

// For long-running commands
await deferReply(interaction);
// ... perform heavy operations ...
await interaction.editReply('Done!');
```

### formatSuccessEmbed(title, description, fields)

**Purpose:** Create formatted success embed  
**Parameters:**
- `title` (string) - Embed title
- `description` (string) - Embed description
- `fields` (Array<object>) - Embed fields

**Returns:** EmbedBuilder

**Example:**
```javascript
const { formatSuccessEmbed } = require('verabot-core/helpers/response-helpers');

const embed = formatSuccessEmbed(
  'User Created',
  'New user registered',
  [
    { name: 'Username', value: 'john_doe', inline: true },
    { name: 'Status', value: 'Active', inline: true }
  ]
);

await interaction.reply({ embeds: [embed] });
```

### formatErrorEmbed(title, description, error)

**Purpose:** Create formatted error embed  
**Parameters:**
- `title` (string) - Embed title
- `description` (string) - Error description
- `error` (string, optional) - Error details

**Returns:** EmbedBuilder

**Example:**
```javascript
const { formatErrorEmbed } = require('verabot-core/helpers/response-helpers');

const embed = formatErrorEmbed(
  'Operation Failed',
  'Could not save user',
  'Database connection timeout'
);

await interaction.reply({ embeds: [embed] });
```

---

## API Helpers

Request/response utilities for HTTP operations.

### makeRequest(url, options)

**Purpose:** Make HTTP request  
**Parameters:**
- `url` (string) - Request URL
- `options` (object) - Request options (method, headers, body, timeout)

**Returns:** Promise<object>

**Example:**
```javascript
const { makeRequest } = require('verabot-core/helpers/api-helpers');

const response = await makeRequest('https://api.example.com/users', {
  method: 'GET',
  headers: { 'Authorization': 'Bearer token' }
});

console.log(response.data);
```

### parseJSON(text)

**Purpose:** Parse JSON with error handling  
**Parameters:**
- `text` (string) - JSON string

**Returns:** object | null

**Example:**
```javascript
const { parseJSON } = require('verabot-core/helpers/api-helpers');

const data = parseJSON('{"name":"John"}');
if (!data) {
  console.log('Invalid JSON');
}
```

### formatURL(baseURL, params)

**Purpose:** Format URL with query parameters  
**Parameters:**
- `baseURL` (string) - Base URL
- `params` (object) - Query parameters

**Returns:** string

**Example:**
```javascript
const { formatURL } = require('verabot-core/helpers/api-helpers');

const url = formatURL('https://api.example.com/search', {
  q: 'discord',
  limit: 10
});
// Result: https://api.example.com/search?q=discord&limit=10
```

---

## Database Services

### DatabaseService

Base database service for SQLite operations.

#### Constructor
```javascript
const { DatabaseService } = require('verabot-core/services');

const db = new DatabaseService(':memory:'); // or file path
await db.initialize();
```

#### Methods

**execute(sql, params)**
Execute SQL query
```javascript
const result = await db.execute(
  'INSERT INTO quotes (text, author) VALUES (?, ?)',
  ['Great quote', 'Author']
);
```

**get(sql, params)**
Get single row
```javascript
const quote = await db.get(
  'SELECT * FROM quotes WHERE id = ?',
  [1]
);
```

**all(sql, params)**
Get all rows
```javascript
const quotes = await db.all(
  'SELECT * FROM quotes ORDER BY id'
);
```

### GuildAwareDatabaseService

Guild-scoped database operations.

#### Constructor
```javascript
const { GuildAwareDatabaseService } = require('verabot-core/services');

const service = new GuildAwareDatabaseService(database);
```

#### Methods

**getGuildData(guildId, table)**
Get data for specific guild
```javascript
const quotes = await service.getGuildData('guild-123', 'quotes');
```

**addGuildData(guildId, table, data)**
Add data to guild
```javascript
await service.addGuildData('guild-123', 'quotes', {
  text: 'Quote',
  author: 'Author'
});
```

**deleteGuildData(guildId, table, id)**
Delete guild data
```javascript
await service.deleteGuildData('guild-123', 'quotes', 1);
```

---

## Validation Service

### validateUserInput(input, rules)

**Purpose:** Validate user input  
**Parameters:**
- `input` (any) - Input to validate
- `rules` (object) - Validation rules

**Returns:** { valid: boolean, errors: Array<string> }

**Example:**
```javascript
const { ValidationService } = require('verabot-core/services');

const validator = new ValidationService();
const result = validator.validateUserInput('user@example.com', {
  type: 'email',
  required: true
});

if (!result.valid) {
  console.log('Validation errors:', result.errors);
}
```

### Validation Rules

| Rule | Type | Example |
|------|------|---------|
| `type` | string | 'email', 'url', 'username', 'text' |
| `required` | boolean | true / false |
| `minLength` | number | 3 |
| `maxLength` | number | 50 |
| `pattern` | RegExp | /^[a-z0-9]+$/ |

---

## Role Permission Service

Role-based access control system.

### canExecuteCommand(userId, guildId, command, client)

**Purpose:** Check if user can execute command  
**Parameters:**
- `userId` (string) - User ID
- `guildId` (string) - Guild ID
- `command` (string) - Command name
- `client` (Client) - Discord client

**Returns:** Promise<boolean>

**Example:**
```javascript
const { RolePermissionService } = require('verabot-core/services');

const roleService = new RolePermissionService();
const allowed = await roleService.canExecuteCommand(
  interaction.user.id,
  interaction.guildId,
  'ban',
  interaction.client
);

if (!allowed) {
  await sendError(interaction, '❌ You lack permissions');
}
```

### getUserTier(userId, guildId, client)

**Purpose:** Get user's permission tier  
**Parameters:**
- `userId` (string) - User ID
- `guildId` (string) - Guild ID
- `client` (Client) - Discord client

**Returns:** Promise<number> - 0-4 (Guest to Bot Owner)

**Example:**
```javascript
const tier = await roleService.getUserTier(
  interaction.user.id,
  interaction.guildId,
  interaction.client
);

console.log(`User tier: ${tier}`); // 0, 1, 2, 3, or 4
```

### Permission Tiers

| Tier | Level | Permissions |
|------|-------|-------------|
| 0 | Guest | View public data |
| 1 | Member | Use standard commands |
| 2 | Moderator | Manage messages, users |
| 3 | Admin | Server administration |
| 4 | Bot Owner | Full bot control |

### Tier Commands Example

```javascript
// Tier 0: Guest - No special commands
// Tier 1: Member - General commands (quote, search, etc.)
// Tier 2: Moderator - Moderation commands (kick, mute, etc.)
// Tier 3: Admin - Admin commands (ban, config, etc.)
// Tier 4: Bot Owner - Bot control commands (restart, update, etc.)
```

---

## Complete Example: Full Command Implementation

```javascript
const { 
  CommandBase, 
  buildCommandOptions, 
  sendSuccess, 
  sendError, 
  RolePermissionService,
  GuildAwareDatabaseService 
} = require('verabot-core');

// 1. Define options
const { data, options } = buildCommandOptions('ban', 'Ban a member', [
  {
    name: 'member',
    type: 'user',
    required: true,
    description: 'Member to ban'
  },
  {
    name: 'reason',
    type: 'string',
    required: false,
    description: 'Reason for ban'
  }
]);

// 2. Create command class
class BanCommand extends CommandBase {
  constructor() {
    super({
      name: 'ban',
      description: 'Ban a member',
      data,
      options,
    });
    this.roleService = new RolePermissionService();
    this.dbService = new GuildAwareDatabaseService(database);
  }

  async executeInteraction(interaction) {
    // Check permissions (automatically handled by base class on error)
    const canBan = await this.roleService.canExecuteCommand(
      interaction.user.id,
      interaction.guildId,
      'ban',
      interaction.client
    );

    if (!canBan) {
      await sendError(interaction, 'You lack permissions to ban members');
      return;
    }

    // Get parameters
    const member = interaction.options.getUser('member');
    const reason = interaction.options.getString('reason') || 'No reason';

    // Perform action
    await member.ban({ reason });

    // Log to database
    await this.dbService.addGuildData(
      interaction.guildId,
      'bans',
      { userId: member.id, reason, by: interaction.user.id, date: new Date() }
    );

    // Respond to user
    await sendSuccess(
      interaction,
      `✅ Banned ${member.username}: ${reason}`
    );
  }
}

// 3. Export registered command
module.exports = new BanCommand().register();
```

---

## Error Handling

All services include error handling:

```javascript
try {
  const user = await dbService.getUser('123');
} catch (error) {
  console.error('Database error:', error.message);
  // Service includes built-in logging
}
```

## Support

- **Documentation:** [Core Extraction Guide](./core-extraction-guide.md)
- **Issues:** GitHub Issues tracker
- **Examples:** See docs/examples/ directory
