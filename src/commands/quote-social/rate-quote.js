const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendSuccess, sendError } = require('../../utils/helpers/response-helpers');
const quoteService = require('../../services/QuoteService');

const { data, options } = buildCommandOptions('rate-quote', 'Rate a quote (1-5 stars)', [
  { name: 'id', type: 'integer', description: 'Quote ID to rate', required: true },
  { name: 'rating', type: 'integer', description: 'Your rating (1-5)', required: true },
]);

class RateQuoteCommand extends Command {
  constructor() {
    super({
      name: 'rate-quote',
      description: 'Rate a quote (1-5 stars)',
      data,
      options,
      permissions: {
        minTier: 1,
        visible: true,
      },
    });
  }

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

      const guildId = message.guildId;
      const quote = await quoteService.getQuoteById(guildId, id);
      if (!quote) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send(`❌ Quote #${id} not found.`);
        } else if (message.reply) {
          await message.reply(`❌ Quote #${id} not found.`);
        }
        return;
      }

      await quoteService.rateQuote(guildId, id, message.author.id, rating);
      const ratingInfo = await quoteService.getQuoteRating(guildId, id);
      const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
      if (message.channel && typeof message.channel.send === 'function') {
        await message.channel.send(`✅ Rated quote #${id}: ${stars} (Avg: ${ratingInfo.average.toFixed(1)}⭐)`);
      } else if (message.reply) {
        await message.reply(`✅ Rated quote #${id}: ${stars} (Avg: ${ratingInfo.average.toFixed(1)}⭐)`);
      }
    } catch (err) {
      console.error('Error in rate-quote command:', err);
      if (message.channel && typeof message.channel.send === 'function') {
        await message.channel.send('Failed to rate quote');
      } else if (message.reply) {
        await message.reply('Failed to rate quote');
      }
    }
  }

  async executeInteraction(interaction) {
    await interaction.deferReply();
    const guildId = interaction.guildId;
    const id = interaction.options.getInteger('id');
    const rating = interaction.options.getInteger('rating');

    const quote = await quoteService.getQuoteById(guildId, id);
    if (!quote) {
      await sendError(interaction, `Quote #${id} not found`);
      return;
    }

    await quoteService.rateQuote(guildId, id, interaction.user.id, rating);
    const ratingInfo = await quoteService.getQuoteRating(guildId, id);
    const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
    await sendSuccess(interaction, `Rated quote #${id}: ${stars} (Avg: ${ratingInfo.average.toFixed(1)}⭐)`);
  }
}

module.exports = new RateQuoteCommand().register();
