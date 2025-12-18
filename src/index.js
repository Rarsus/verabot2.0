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

// For slash commands we always need `Guilds`. For prefix message handling we add message intents.
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Load commands
const commands = new Map();
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const cmd = require(path.join(commandsPath, file));
    if (cmd && cmd.name) commands.set(cmd.name, cmd);
  }
}
// Expose commands on client for command modules (help, etc.)
client.commands = commands;

const detectReadyEvent = require('./detectReadyEvent');

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

// Graceful shutdown for containers and local development
function shutdown() {
  console.log('Shutting down gracefully...');
  try { client.destroy(); } catch (e) { /* ignore errors on shutdown */ }
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
