const { SlashCommandBuilder } = require('discord.js');
const { rateQuote, getQuoteById } = require('../db');
const { handleInteractionError } = require('../utils/error-handler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rate-quote')
    .setDescription('Rate a quote (1-5 stars)')
    .addIntegerOption(opt => opt.setName('id').setDescription('Quote ID to rate').setRequired(true))
    .addIntegerOption(opt => opt.setName('rating').setDescription('Your rating (1-5)').setRequired(true)
      .setMinValue(1).setMaxValue(5)),
  name: 'rate-quote',
  description: 'Rate a quote (1-5 stars)',
  options: [
    { name: 'id', type: 'integer', description: 'Quote ID to rate', required: true },
    { name: 'rating', type: 'integer', description: 'Your rating (1-5)', required: true }
  ],
  async execute(message, args) {
    try {
      const id = parseInt(args[0], 10);
      const rating = parseInt(args[1], 10);

      if (isNaN(id) || isNaN(rating)) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send('❌ Invalid quote ID or rating.');
        } else if (message.reply) {
          await message.reply('❌ Invalid quote ID or rating.');
        }
        return;
      }

      if (rating < 1 || rating > 5) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send('❌ Rating must be between 1 and 5.');
        } else if (message.reply) {
          await message.reply('❌ Rating must be between 1 and 5.');
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

      const result = await rateQuote(id, message.author.id, rating);
      if (result.success) {
        const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send(`✅ Rated quote #${id}: ${stars} (Avg: ${result.averageRating}⭐)`);
        } else if (message.reply) {
          await message.reply(`✅ Rated quote #${id}: ${stars} (Avg: ${result.averageRating}⭐)`);
        }
      } else {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send(`❌ ${result.message}`);
        } else if (message.reply) {
          await message.reply(`❌ ${result.message}`);
        }
      }
    } catch (err) {
      console.error('Error in rate-quote command:', err);
      handleInteractionError(message, 'Failed to rate quote');
    }
  },
  async executeInteraction(interaction) {
    try {
      await interaction.deferReply();
      const id = interaction.options.getInteger('id');
      const rating = interaction.options.getInteger('rating');

      const quote = await getQuoteById(id);
      if (!quote) {
        await interaction.editReply(`❌ Quote #${id} not found.`);
        return;
      }

      const result = await rateQuote(id, interaction.user.id, rating);
      if (result.success) {
        const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
        await interaction.editReply(`✅ Rated quote #${id}: ${stars} (Avg: ${result.averageRating}⭐)`);
      } else {
        await interaction.editReply(`❌ ${result.message}`);
      }
    } catch (err) {
      console.error('Error in rate-quote interaction:', err);
      await handleInteractionError(interaction, 'Failed to rate quote');
    }
  }
};
