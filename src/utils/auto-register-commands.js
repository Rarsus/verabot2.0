const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

/**
 * Auto-register slash commands to Discord
 * Can register globally or to a specific guild
 * @param {Object} options - Configuration options
 * @param {string} options.token - Discord bot token
 * @param {string} options.clientId - Discord application ID
 * @param {string} [options.guildId] - Guild ID for guild-specific registration (optional)
 * @param {string} [options.commandsPath] - Path to commands directory (default: src/commands)
 * @param {Object} [options.features] - Feature flags for command filtering
 * @param {boolean} [options.verbose] - Enable console logging (default: true)
 * @returns {Promise<{success: boolean, commandCount: number, skippedCommands: string[]}>}
 */
async function autoRegisterCommands(options = {}) {
  const {
    token = process.env.DISCORD_TOKEN,
    clientId = process.env.CLIENT_ID,
    guildId = process.env.GUILD_ID || null,
    commandsPath = path.join(__dirname, '../commands'),
    features = require('../config/features'),
    verbose = true
  } = options;

  if (!token || !clientId) {
    throw new Error('Discord token and client ID are required');
  }

  const commands = [];
  const seenNames = new Set();
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
      if (verbose) {
        console.error(`Failed to load command file ${path.basename(file)}:`, e.message);
      }
      continue;
    }

    // Prefer `data` builder (SlashCommandBuilder). If present, use its JSON.
    if (cmd && cmd.data && typeof cmd.data.toJSON === 'function') {
      const json = cmd.data.toJSON();
      if (!json.name || typeof json.name !== 'string') {
        if (verbose) {
          console.warn(`${path.basename(file)} skipped: builder missing valid name`);
        }
        continue;
      }
      if (seenNames.has(json.name)) {
        if (verbose) {
          console.warn(`${path.basename(file)} skipped: duplicate command name ${json.name}`);
        }
        continue;
      }
      seenNames.add(json.name);
      commands.push(json);
      continue;
    }

    if (!cmd || !cmd.name || typeof cmd.name !== 'string') {
      if (verbose) {
        console.warn(`${path.basename(file)} skipped: missing string 'name' export`);
      }
      continue;
    }

    // Validate command name per Discord limits (1-32 chars, alphanumeric, dashes/underscores)
    if (!/^[\w-]{1,32}$/.test(cmd.name)) {
      if (verbose) {
        console.warn(`${path.basename(file)} skipped: invalid command name '${cmd.name}'`);
      }
      continue;
    }
    if (seenNames.has(cmd.name)) {
      if (verbose) {
        console.warn(`${path.basename(file)} skipped: duplicate command name ${cmd.name}`);
      }
      continue;
    }

    const data = {
      name: cmd.name,
      description: cmd.description || 'No description',
      options: Array.isArray(cmd.options) ? cmd.options : []
    };
    seenNames.add(cmd.name);
    commands.push(data);
  }

  if (commands.length === 0) {
    if (verbose) {
      console.log('No commands to register.');
    }
    return { success: true, commandCount: 0, skippedCommands };
  }

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    if (guildId) {
      if (verbose) {
        console.log(`📝 Registering ${commands.length} commands to guild ${guildId}...`);
        if (skippedCommands.length > 0) {
          console.log(`⏭️  Skipped: ${skippedCommands.join(', ')}`);
        }
      }
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
      if (verbose) {
        console.log(`✅ Successfully registered ${commands.length} guild commands.`);
      }
    } else {
      if (verbose) {
        console.log(`📝 Registering ${commands.length} global commands...`);
        if (skippedCommands.length > 0) {
          console.log(`⏭️  Skipped: ${skippedCommands.join(', ')}`);
        }
      }
      await rest.put(Routes.applicationCommands(clientId), { body: commands });
      if (verbose) {
        console.log(`✅ Successfully registered ${commands.length} global commands.`);
      }
    }

    return {
      success: true,
      commandCount: commands.length,
      skippedCommands
    };
  } catch (err) {
    if (verbose) {
      console.error('Failed to register commands:', err.message);
    }
    return {
      success: false,
      commandCount: 0,
      skippedCommands,
      error: err.message
    };
  }
}

module.exports = { autoRegisterCommands };
