require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const PREFIX = process.env.PREFIX || '!';

if (!TOKEN) {
  console.error('DISCORD_TOKEN is not set. Copy .env.example to .env and set your token.');
  process.exit(1);
}

// Initialize database
const database = require('./services/DatabaseService');
const { migrateFromJson } = require('./lib/migration');
const { enhanceSchema } = require('./lib/schema-enhancement');

(async () => {
  try {
    // Setup database schema
    await database.setupSchema(database.getDatabase());
    console.log('✓ Database schema initialized');

    // Enhance schema with new tables for tags, ratings, voting
    await enhanceSchema(database.getDatabase());
    console.log('✓ Database schema enhanced');

    // Run migration from JSON if needed
    await migrateFromJson(database);
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
})();

// For slash commands we always need `Guilds`. For prefix message handling we add message intents.
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Load commands
const commands = new Map();
const commandsPath = path.join(__dirname, 'commands');

function loadCommands(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively load from subdirectories
      loadCommands(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      // Load command file
      const cmd = require(fullPath);
      if (cmd && cmd.name) commands.set(cmd.name, cmd);
    }
  }
}

loadCommands(commandsPath);
// Expose commands on client for command modules (help, etc.)
client.commands = commands;

const detectReadyEvent = require('./lib/detectReadyEvent');

const _attachReadyEvent = () => {
  const eventName = detectReadyEvent();
  const onReady = () => {
    console.log(`Logged in as ${client.user?.tag || 'unknown'}`);
  };

  if (eventName === 'ready') {
    console.log('Falling back to legacy `ready` event for older discord.js');
    client.once('ready', onReady);
  } else {
    client.once('clientReady', onReady);
  }
};

_attachReadyEvent();

// Handle slash commands (interactions)
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = commands.get(interaction.commandName);
  if (!command) return;

  try {
    if (typeof command.executeInteraction === 'function') {
      await command.executeInteraction(interaction);
    } else if (typeof command.execute === 'function') {
      const args = [];
      await command.execute(interaction, args);
    }
  } catch (err) {
    console.error('Command error', err);
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp('There was an error executing that command.');
      } else {
        await interaction.reply('There was an error executing that command.');
      }
    } catch (e) {
      /* ignore follow-up errors */
    }
  }
});

// Handle legacy prefix-based commands (optional)
client.on('messageCreate', async (message) => {
  try {
    if (!message || !message.content) return;
    if (message.author?.bot) return;
    if (!PREFIX) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
    const commandName = (args.shift() || '').toLowerCase();
    if (!commandName) return;
    const command = commands.get(commandName);
    if (!command) return;

    if (typeof command.execute === 'function') {
      await command.execute(message, args);
    }
  } catch (err) {
    console.error('Message command error', err);
  }
});

client.login(TOKEN).catch(err => {
  console.error('Failed to login:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await client.destroy();
  await database.closeDatabase();
  process.exit(0);
});

// Graceful shutdown for containers and local development
function shutdown() {
  console.log('Shutting down gracefully...');
  try { client.destroy(); } catch (e) { /* ignore errors on shutdown */ }
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
