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

// Load feature configuration
const features = require('./config/features');

// Initialize database
const database = require('./services/DatabaseService');
const { migrateFromJson } = require('./lib/migration');
const { enhanceSchema } = require('./lib/schema-enhancement');

// Initialize proxy services (only if enabled)
let proxyConfig = null;
let webhookProxy = null;
let webhookListener = null;

if (features.proxy.enabled) {
  const ProxyConfigService = require('./services/ProxyConfigService');
  const WebhookProxyService = require('./services/WebhookProxyService');
  proxyConfig = new ProxyConfigService(database);
  webhookProxy = new WebhookProxyService();
}

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
      // Skip admin commands if admin feature is disabled
      if (entry.name === 'admin' && !features.admin.enabled) {
        console.log('ℹ️  Skipping admin commands (ENABLE_ADMIN_COMMANDS=false)');
        continue;
      }

      // Skip reminder commands if reminders feature is disabled
      if (entry.name === 'reminder-management' && !features.reminders.enabled) {
        console.log('ℹ️  Skipping reminder commands (ENABLE_REMINDERS=false)');
        continue;
      }

      // Recursively load from subdirectories
      loadCommands(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      // Load command file
      const cmd = require(fullPath);
      if (cmd && cmd.name) commands.set(cmd.name, cmd);
    }
  }
}

// Initialize database before starting bot
(async () => {
  try {
    console.log('⏳ Initializing database...');

    // Setup database schema
    const dbInstance = database.getDatabase();
    await database.setupSchema(dbInstance);
    console.log('✓ Database schema initialized');

    // Enhance schema with new tables for tags, ratings, voting
    await enhanceSchema(dbInstance);
    console.log('✓ Database schema enhanced');

    // Run migration from JSON if needed
    await migrateFromJson(database);
    console.log('✓ Database migration completed');

    // Small delay to ensure all database operations are flushed
    await new Promise(resolve => setTimeout(resolve, 500));

    // Load commands AFTER database is ready
    console.log('📂 Loading commands...');
    loadCommands(commandsPath);
    console.log(`✓ Loaded ${commands.size} commands`);

    // Expose commands on client for command modules (help, etc.)
    client.commands = commands;

    // Start the bot only after database is ready
    console.log('🤖 Starting Discord bot...');
    await client.login(TOKEN);
  } catch (err) {
    console.error('❌ Failed to initialize:', err);
    process.exit(1);
  }
})();

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

// Start webhook listener when bot is ready (only if proxy is enabled)
client.once('ready', async () => {
  try {
    // Check if proxy is enabled and start listener
    if (features.proxy.enabled && proxyConfig) {
      const WebhookListenerService = require('./services/WebhookListenerService');
      const isProxyEnabled = await proxyConfig.isProxyEnabled();
      const webhookSecret = await proxyConfig.getWebhookSecret();
      const proxyPort = features.proxy.webhookPort;

      if (isProxyEnabled) {
        webhookListener = new WebhookListenerService(client);

        if (!webhookSecret) {
          console.warn('⚠️  WARNING: Webhook listener starting without signature verification. Configure a secret with /proxy-config for better security.');
        }

        await webhookListener.startServer(proxyPort, webhookSecret);
        console.log(`✓ Webhook listener started on port ${proxyPort}`);
      }
    }
  } catch (err) {
    console.error('Failed to start webhook listener:', err.message);
    // Continue without webhook listener if it fails
  }

  // Initialize reminder notification service (if reminders are enabled)
  if (features.reminders.enabled) {
    try {
      const ReminderNotificationService = require('./services/ReminderNotificationService');
      ReminderNotificationService.initializeNotificationService(client);
      console.log('✓ Reminder notification service initialized');
    } catch (err) {
      console.error('Failed to start reminder notification service:', err.message);
      // Continue without reminder notifications if it fails
    }
  }
});

// Handle slash commands and button interactions
client.on('interactionCreate', async (interaction) => {
  // Handle slash commands
  if (interaction.isChatInputCommand()) {
    const command = commands.get(interaction.commandName);
    if (!command) return;

    try {
      if (typeof command.executeInteraction === 'function') {
        await command.executeInteraction(interaction);
      } else if (typeof command.execute === 'function') {
        const args = [];
        await command.execute(interaction, args);
      }
    } catch {
      console.error('Command error', err);
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp('There was an error executing that command.');
        } else {
          await interaction.reply('There was an error executing that command.');
        }
      } catch {
        /* ignore follow-up errors */
      }
    }
    return;
  }

  // Handle button interactions
  if (interaction.isButton()) {
    const customId = interaction.customId;

    try {
      // Handle reminder decision buttons
      if (customId.startsWith('reminder_cancel_')) {
        // Cancel and delete the reminder
        await interaction.deferReply({ ephemeral: true });

        // Extract reminder ID from stored context
        const context = Object.values(client.reminderContexts || {}).find(
          ctx => customId.includes(Date.now() - 1000) || customId.includes(Date.now())
        );

        if (context && context.reminderId) {
          const { deleteReminder } = require('./services/ReminderService');
          await deleteReminder(context.reminderId);
          await interaction.editReply('✅ Reminder cancelled.');
        } else {
          await interaction.editReply('❌ Could not find reminder to cancel.');
        }
      } else if (customId.startsWith('reminder_server_')) {
        // Create reminder with server-only notification method
        await interaction.deferReply({ ephemeral: true });

        const context = Object.values(client.reminderContexts || {}).find(
          ctx => customId.includes(Date.now() - 1000) || customId.includes(Date.now())
        );

        if (context && context.reminderId) {
          const { updateNotificationMethod } = require('./services/ReminderService');
          await updateNotificationMethod(context.reminderId, 'server');
          await interaction.editReply(`✅ Reminder created with server-only notifications for "${context.subject}".`);
        } else {
          await interaction.editReply('❌ Could not update reminder notification method.');
        }
      } else if (customId.startsWith('reminder_notify_')) {
        // Send opt-in request to the recipient
        await interaction.deferReply({ ephemeral: true });

        const context = Object.values(client.reminderContexts || {}).find(
          ctx => customId.includes(Date.now() - 1000) || customId.includes(Date.now())
        );

        if (context && context.recipient) {
          const { updateNotificationMethod } = require('./services/ReminderService');
          await updateNotificationMethod(context.reminderId, 'dm');

          // Send opt-in request to the user
          const { sendOptInRequest } = require('./utils/helpers/response-helpers');
          try {
            await sendOptInRequest(context.recipient, interaction.user.username, context.subject);
            await interaction.editReply(`📢 Sent opt-in request to ${context.recipient.username}. They can respond with '/opt-in'.`);
          } catch {
            await interaction.editReply('✅ Reminder set to DM mode. Could not send opt-in request (user may have DMs disabled).');
          }
        } else {
          await interaction.editReply('❌ Could not send opt-in request.');
        }
      } else if (customId === 'optin_reminder_request') {
        // User clicked "Opt In" from the opt-in request message
        await interaction.deferReply({ ephemeral: true });

        // Execute the /opt-in command
        const optInCommand = commands.get('opt-in');
        if (optInCommand) {
          try {
            await optInCommand.executeInteraction(interaction);
          } catch {
            await interaction.editReply('❌ Error processing opt-in request.');
          }
        } else {
          await interaction.editReply('❌ Opt-in command not available.');
        }
      }
    } catch (err) {
      console.error('Button interaction error:', err);
      try {
        if (interaction.deferred) {
          await interaction.editReply('❌ There was an error processing this action.');
        } else if (!interaction.replied) {
          await interaction.reply({ content: '❌ There was an error processing this action.', ephemeral: true });
        }
      } catch {
        /* ignore follow-up errors */
      }
    }
  }
});

// Handle legacy prefix-based commands (optional)
client.on('messageCreate', async (message) => {
  try {
    if (!message || !message.content) return;
    if (message.author?.bot) return;

    // Handle webhook proxy forwarding (only if proxy is enabled)
    if (features.proxy.enabled && proxyConfig && webhookProxy) {
      const { shouldForwardMessage } = require('./utils/proxy-helpers');
      const isProxyEnabled = await proxyConfig.isProxyEnabled();
      if (isProxyEnabled) {
        const monitoredChannels = await proxyConfig.getMonitoredChannels();
        if (shouldForwardMessage(message, monitoredChannels)) {
          const webhookUrl = await proxyConfig.getWebhookUrl();
          const webhookToken = await proxyConfig.getWebhookToken();

          if (webhookUrl && webhookToken) {
            // Forward message asynchronously (don't block command processing)
            webhookProxy.forwardMessageWithRetry(message, webhookUrl, webhookToken, 3, 1000)
              .catch(err => {
                console.error('Failed to forward message:', err);
              });
          }
        }
      }
    }

    // Handle prefix commands
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

// Handle new members joining - send onboarding message about opt-in system
client.on('guildMemberAdd', async (member) => {
  if (member.user.bot) return; // Don't message bots

  try {
    const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('Welcome to the Server! 👋')
      .setDescription('Thanks for joining! We use a communication opt-in system to respect your privacy.')
      .addFields(
        {
          name: '📢 What is Opt-In?',
          value: 'The bot can send you reminders and notifications. You control whether you get DMs or just server-only messages.'
        },
        {
          name: '✅ Getting Started',
          value: 'Use `/comm-status` to check your preferences, or `/opt-in` to enable direct messages.'
        },
        {
          name: '📖 Learn More',
          value: 'See our full guide with examples and workflows for the opt-in system.'
        }
      )
      .setFooter({ text: 'You can always change your preferences with /opt-out' })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('optin_reminder_request')
          .setLabel('📖 Learn About Opt-In')
          .setStyle(ButtonStyle.Primary)
      );

    // Send DM to the new member
    await member.send({ embeds: [embed], components: [row] });
  } catch {
    // Silently fail if we can't DM the user (they might have DMs disabled)
    console.log(`Could not send onboarding DM to ${member.user.tag}: DMs likely disabled`);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  try {
    if (webhookListener) {
      await webhookListener.stopServer();
    }
    await client.destroy();
    await database.closeDatabase();
  } catch (err) {
    console.error('Error during shutdown:', err);
  }
  process.exit(0);
});

// Graceful shutdown for containers and local development
async function shutdown() {
  console.log('Shutting down gracefully...');
  try {
    if (webhookListener) {
      await webhookListener.stopServer();
    }
    client.destroy();
  } catch {
    /* ignore errors on shutdown */
  }
  process.exit(0);
}
process.on('SIGTERM', shutdown);
