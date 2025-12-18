const { SlashCommandBuilder } = require('discord.js');
const { deleteQuote, getQuoteById } = require('../../db');
const { handleInteractionError } = require('../../utils/error-handler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('delete-quote')
    .setDescription('Delete a quote (admin only)')
    .addIntegerOption(opt => opt.setName('id').setDescription('Quote ID to delete').setRequired(true)),
  name: 'delete-quote',
  description: 'Delete a quote (admin only)',
  options: [
    { name: 'id', type: 'integer', description: 'Quote ID to delete', required: true }
  ],
  async execute(message, args) {
    try {
      // Check admin permission
      if (!message.member.permissions.has('ADMINISTRATOR')) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send('❌ You do not have permission to delete quotes.');
        } else if (message.reply) {
          await message.reply('❌ You do not have permission to delete quotes.');
        }
        return;
      }

      const id = parseInt(args[0], 10);
      if (isNaN(id)) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send('❌ Invalid quote ID.');
        } else if (message.reply) {
          await message.reply('❌ Invalid quote ID.');
        }
        return;
      }

      const quote = await getQuoteById(id);
      if (!quote) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send(`❌ Quote #${id} not found.`);
        } else if (message.reply) {
          await message.reply(`❌ Quote #${id} not found.`);
        }
        return;
      }

      await deleteQuote(id);
      if (message.channel && typeof message.channel.send === 'function') {
        await message.channel.send(`✅ Quote #${id} deleted successfully!`);
      } else if (message.reply) {
        await message.reply(`✅ Quote #${id} deleted successfully!`);
      }
    } catch (err) {
      console.error('Error in delete-quote command:', err);
      handleInteractionError(message, 'Failed to delete quote');
    }
  },
  async executeInteraction(interaction) {
    try {
      // Check admin permission
      if (!interaction.member.permissions.has('ADMINISTRATOR')) {
        await interaction.reply({ content: '❌ You do not have permission to delete quotes.', ephemeral: true });
        return;
      }

      await interaction.deferReply();
      const id = interaction.options.getInteger('id');

      const quote = await getQuoteById(id);
      if (!quote) {
        await interaction.editReply(`❌ Quote #${id} not found.`);
        return;
      }

      await deleteQuote(id);
      await interaction.editReply(`✅ Quote #${id} deleted successfully!`);
    } catch (err) {
      console.error('Error in delete-quote interaction:', err);
      await handleInteractionError(interaction, 'Failed to delete quote');
    }
  }
};
