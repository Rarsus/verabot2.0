/**
 * Discord Service
 * Handles Discord bot interactions and API calls
 */

/**
 * Send embed message
 * @param {object} interaction - Discord interaction
 * @param {object} embed - Embed object
 * @returns {Promise<void>}
 */
async function sendEmbed(interaction, embed) {
  if (interaction.replied || interaction.deferred) {
    return interaction.followUp({ embeds: [embed] });
  }
  return interaction.reply({ embeds: [embed] });
}

/**
 * Send ephemeral message
 * @param {object} interaction - Discord interaction
 * @param {string} content - Message content
 * @returns {Promise<void>}
 */
async function sendEphemeral(interaction, content) {
  if (interaction.replied || interaction.deferred) {
    return interaction.followUp({ content, flags: 64 });
  }
  return interaction.reply({ content, flags: 64 });
}

module.exports = {
  sendEmbed,
  sendEphemeral
};
