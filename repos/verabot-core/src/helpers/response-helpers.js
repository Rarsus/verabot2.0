/**
 * Command Response Helpers
 * Standardized response patterns for common scenarios
 */

const { EmbedBuilder } = require('discord.js');

/**
 * Send a quote embed response
 * @param {Object} interaction - Discord interaction
 * @param {Object} quote - Quote object { id, text, author, ...}
 * @param {string} title - Optional title
 * @returns {Promise<void>}
 */
async function sendQuoteEmbed(interaction, quote, title = 'Quote') {
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(`"${quote.text}"`)
    .setFooter({ text: `— ${quote.author} | #${quote.id}` })
    .setColor(0x5865f2);

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({ embeds: [embed] });
  } else {
    await interaction.reply({ embeds: [embed] });
  }
}

/**
 * Send a success response
 * @param {Object} interaction - Discord interaction
 * @param {string} message - Success message
 * @param {boolean} ephemeral - Show only to user
 */
async function sendSuccess(interaction, message, ephemeral = false) {
  const flags = ephemeral ? 64 : undefined;

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({ content: `✅ ${message}`, flags });
  } else {
    await interaction.reply({ content: `✅ ${message}`, flags });
  }
}

/**
 * Send an error response
 * @param {Object} interaction - Discord interaction
 * @param {string} message - Error message
 * @param {boolean} ephemeral - Show only to user (default true)
 */
async function sendError(interaction, message, ephemeral = true) {
  const flags = ephemeral ? 64 : undefined;
  const content = `❌ ${message}`;

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({ content, flags });
  } else {
    await interaction.reply({ content, flags });
  }
}

/**
 * Send a message to user's DM
 * @param {Object} interaction - Discord interaction
 * @param {string} content - Message content
 * @param {string} confirmMessage - Message to show in channel
 */
async function sendDM(interaction, content, confirmMessage = '📨 Check your DMs!') {
  const dmChannel = await interaction.user.createDM();
  await dmChannel.send(content);
  await sendSuccess(interaction, confirmMessage, true);
}

/**
 * Defer and defer with thinking indicator
 * @param {Object} interaction - Discord interaction
 * @returns {Promise<void>}
 */
async function deferReply(interaction) {
  if (!interaction.deferred && !interaction.replied) {
    await interaction.deferReply();
  }
}

/**
 * Send opt-in success response
 * @param {Object} interaction - Discord interaction
 * @returns {Promise<void>}
 */
async function sendOptInSuccess(interaction) {
  const message =
    "You've opted in to receive direct messages and use VeraBot commands.\nYou now have access to all VeraBot communication features.\nUse `/opt-out` at any time to disable DMs.";

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({ content: `✅ ${message}`, flags: 64 });
  } else {
    await interaction.reply({ content: `✅ ${message}`, flags: 64 });
  }
}

/**
 * Send opt-out success response
 * @param {Object} interaction - Discord interaction
 * @returns {Promise<void>}
 */
async function sendOptOutSuccess(interaction) {
  const message =
    "You've opted out of direct messages.\nYou can still use VeraBot commands in servers, but won't receive DMs.\nUse `/opt-in` to re-enable.";

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({ content: `⚠️ ${message}`, flags: 64 });
  } else {
    await interaction.reply({ content: `⚠️ ${message}`, flags: 64 });
  }
}

/**
 * Send communication status response
 * @param {Object} interaction - Discord interaction
 * @param {boolean} isOptedIn - Whether user is opted in
 * @param {string} timestamp - Last update timestamp
 * @returns {Promise<void>}
 */
async function sendOptInStatus(interaction, isOptedIn, timestamp) {
  const statusText = isOptedIn ? '✅ Opted In' : '❌ Opted Out';
  const message = `Your communication status: ${statusText}\nLast updated: ${timestamp || 'Never'}`;

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({ content: message, flags: 64 });
  } else {
    await interaction.reply({ content: message, flags: 64 });
  }
}

/**
 * Send opt-in decision prompt with interactive buttons
 * @param {Object} interaction - Discord interaction
 * @param {Object} recipient - Recipient user object { username, id }
 * @param {string} reminderSubject - Subject of the reminder
 * @returns {Promise<Object>} Message with button components
 */
async function sendOptInDecisionPrompt(interaction, recipient, reminderSubject) {
  const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

  const message = `⚠️  **${recipient.username}** hasn't opted in to receive direct messages.\n\n**Reminder:** "${reminderSubject}"\n\n**What would you like to do?**`;

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`reminder_cancel_${Date.now()}`)
      .setLabel('❌ Cancel')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('274283534'),
    new ButtonBuilder()
      .setCustomId(`reminder_server_${Date.now()}`)
      .setLabel('📋 Create (Server-Only)')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`reminder_notify_${Date.now()}`)
      .setLabel('📢 Notify User')
      .setStyle(ButtonStyle.Secondary),
  );

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({ content: message, components: [row] });
  } else {
    await interaction.reply({ content: message, components: [row] });
  }
}

/**
 * Send confirmation that reminder created with server-only notifications
 * @param {Object} interaction - Discord interaction
 * @param {Object} recipient - Recipient user object
 * @param {string} reminderSubject - Subject of the reminder
 * @returns {Promise<void>}
 */
async function sendReminderCreatedServerOnly(interaction, recipient, reminderSubject) {
  const message = `✅ **Reminder created for ${recipient.username}**\n\n📋 **Notification Method:** Server Only\nThey will receive a server message but NOT a DM.\n\n**Reminder:** "${reminderSubject}"`;

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({ content: message });
  } else {
    await interaction.reply({ content: message });
  }
}

/**
 * Send opt-in request notification to a user
 * @param {Object} user - User object from Discord.js
 * @param {Object} sender - Sender user object (who requested the opt-in)
 * @param {string} reminderSubject - Subject of the reminder
 * @returns {Promise<void>}
 */
async function sendOptInRequest(user, sender, reminderSubject) {
  const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('optin_reminder_request').setLabel('✅ Opt In Now').setStyle(ButtonStyle.Success),
  );

  const message = `👋 **${sender.username}** tried to create a reminder for you but you haven't opted in to receive DMs.\n\n**Reminder:** "${reminderSubject}"\n\nWould you like to opt in to VeraBot communication features?`;

  try {
    const dmChannel = await user.createDM();
    await dmChannel.send({ content: message, components: [row] });
  } catch (error) {
    throw new Error(`Could not send DM to user: ${error.message}`);
  }
}

module.exports = {
  sendQuoteEmbed,
  sendSuccess,
  sendError,
  sendDM,
  deferReply,
  sendOptInSuccess,
  sendOptOutSuccess,
  sendOptInStatus,
  sendOptInDecisionPrompt,
  sendReminderCreatedServerOnly,
  sendOptInRequest,
};
