require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID || null;

if (!TOKEN || !CLIENT_ID) {
  console.error('DISCORD_TOKEN and CLIENT_ID must be set in .env');
  process.exit(1);
}

// Load feature configuration to respect disabled features
const features = require('./config/features');

const commands = [];
const seenNames = new Set();
const commandsPath = path.join(__dirname, 'commands');
const skippedCommands = [];

// Recursively find all command files, respecting feature flags
function findCommandFiles(dir, relativePath = '') {
  let files = [];
  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      // Skip admin commands if admin feature is disabled
      if (entry.name === 'admin' && !features.admin.enabled) {
        skippedCommands.push('admin commands (ENABLE_ADMIN_COMMANDS=false)');
        continue;
      }

      // Skip reminder commands if reminders feature is disabled
      if (entry.name === 'reminder-management' && !features.reminders.enabled) {
        skippedCommands.push('reminder commands (ENABLE_REMINDERS=false)');
        continue;
      }

      files = files.concat(findCommandFiles(fullPath, relPath));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  return files;
}

const commandFiles = findCommandFiles(commandsPath);
for (const file of commandFiles) {
  let cmd;
  try {
    cmd = require(file);
  } catch (e) {
    console.error(`Failed to load command file ${path.basename(file)}:`, e);
    continue;
  }

  // Prefer `data` builder (SlashCommandBuilder). If present, use its JSON.
  if (cmd && cmd.data && typeof cmd.data.toJSON === 'function') {
    const json = cmd.data.toJSON();
    if (!json.name || typeof json.name !== 'string') {
      console.warn(`${file} skipped: builder missing valid name`);
      continue;
    }
    if (seenNames.has(json.name)) {
      console.warn(`${file} skipped: duplicate command name ${json.name}`);
      continue;
    }
    seenNames.add(json.name);
    commands.push(json);
    continue;
  }

  if (!cmd || !cmd.name || typeof cmd.name !== 'string') {
    console.warn(`${file} skipped: missing string 'name' export`);
    continue;
  }

  // Validate command name per Discord limits (1-32 chars, alphanumeric, dashes/underscores)
  if (!/^[\w-]{1,32}$/.test(cmd.name)) {
    console.warn(`${file} skipped: invalid command name '${cmd.name}'`);
    continue;
  }
  if (seenNames.has(cmd.name)) {
    console.warn(`${file} skipped: duplicate command name ${cmd.name}`);
    continue;
  }

  const data = {
    name: cmd.name,
    description: cmd.description || 'No description',
    options: Array.isArray(cmd.options) ? cmd.options : [],
  };
  seenNames.add(cmd.name);
  commands.push(data);
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    // Show what's being registered and what's being skipped
    console.log(`\nRegistering ${commands.length} commands.`);
    if (skippedCommands.length > 0) {
      console.log(`⏭️  Skipped: ${skippedCommands.join(', ')}`);
    }

    if (commands.length === 0) {
      console.log('No commands to register. Exiting.');
      process.exit(0);
    }
    if (GUILD_ID) {
      console.log(`\nRegistering commands to guild ${GUILD_ID}`);
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
      console.log('✅ Successfully registered guild commands.');
    } else {
      console.log('\nRegistering global application commands (may take up to an hour to propagate).');
      await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
      console.log('✅ Successfully registered global commands.');
    }
    console.log();
  } catch (err) {
    console.error('Failed to register commands:', err);
    process.exit(1);
  }
})();
