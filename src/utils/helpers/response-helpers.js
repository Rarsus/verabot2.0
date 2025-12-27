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
    .setColor(0x5865F2);

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

module.exports = {
  sendQuoteEmbed,
  sendSuccess,
  sendError,
  sendDM,
  deferReply
};
