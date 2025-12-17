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

// For slash commands we only need the `Guilds` intent; Message Content intent is NOT required.
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

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

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

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
    if (interaction.replied || interaction.deferred) {
      try { await interaction.followUp('There was an error executing that command.'); } catch(e){}
    } else {
      try { await interaction.reply('There was an error executing that command.'); } catch(e){}
    }
  }
});

client.login(TOKEN).catch(err => {
  console.error('Failed to login:', err);
  process.exit(1);
});
