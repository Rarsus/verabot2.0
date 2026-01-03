const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendError } = require('../../utils/helpers/response-helpers');
const quoteService = require('../../services/QuoteService');
const { EmbedBuilder } = require('discord.js');

const { data, options } = buildCommandOptions('quote-stats', 'Get statistics about the quote database', []);

class QuoteStatsCommand extends Command {
  constructor() {
    super({
      name: 'quote-stats',
      description: 'Get statistics about the quote database',
      data,
      options,
      permissions: {
        minTier: 1,
        visible: true
      }
    });
  }

  async execute(message) {
    try {
      const guildId = message.guildId;
      const quotes = await quoteService.getAllQuotes(guildId);
      if (!quotes || quotes.length === 0) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send('❌ No quotes in database.');
        } else if (message.reply) {
          await message.reply('❌ No quotes in database.');
        }
        return;
      }

      const totalQuotes = quotes.length;
      const authors = {};
      quotes.forEach(q => {
        authors[q.author] = (authors[q.author] || 0) + 1;
      });

      const topAuthor = Object.entries(authors).sort((a, b) => b[1] - a[1])[0];
      const avgLength = Math.round(quotes.reduce((sum, q) => sum + q.text.length, 0) / totalQuotes);

      const embed = new EmbedBuilder()
        .setTitle('Quote Database Statistics')
        .addFields(
          { name: 'Total Quotes', value: `${totalQuotes}`, inline: true },
          { name: 'Unique Authors', value: `${Object.keys(authors).length}`, inline: true },
          { name: 'Top Author', value: `${topAuthor[0]} (${topAuthor[1]} quotes)`, inline: true },
          { name: 'Average Quote Length', value: `${avgLength} characters`, inline: true }
        )
        .setColor(0x5865F2);

      if (message.channel && typeof message.channel.send === 'function') {
        await message.channel.send({ embeds: [embed] });
      } else if (message.reply) {
        await message.reply({ embeds: [embed] });
      }
    } catch (err) {
      console.error('Error in quote-stats command:', err);
      if (message.channel && typeof message.channel.send === 'function') {
        await message.channel.send('Failed to retrieve statistics');
      } else if (message.reply) {
        await message.reply('Failed to retrieve statistics');
      }
    }
  }

  async executeInteraction(interaction) {
    await interaction.deferReply();
    const guildId = interaction.guildId;
    const quotes = await quoteService.getAllQuotes(guildId);
    if (!quotes || quotes.length === 0) {
      await sendError(interaction, 'No quotes in database');
      return;
    }

    const totalQuotes = quotes.length;
    const authors = {};
    quotes.forEach(q => {
      authors[q.author] = (authors[q.author] || 0) + 1;
    });

    const topAuthor = Object.entries(authors).sort((a, b) => b[1] - a[1])[0];
    const avgLength = Math.round(quotes.reduce((sum, q) => sum + q.text.length, 0) / totalQuotes);

    const embed = new EmbedBuilder()
      .setTitle('Quote Database Statistics')
      .addFields(
        { name: 'Total Quotes', value: `${totalQuotes}`, inline: true },
        { name: 'Unique Authors', value: `${Object.keys(authors).length}`, inline: true },
        { name: 'Top Author', value: `${topAuthor[0]} (${topAuthor[1]} quotes)`, inline: true },
        { name: 'Average Quote Length', value: `${avgLength} characters`, inline: true }
      )
      .setColor(0x5865F2);

    await interaction.editReply({ embeds: [embed] });
  }
}

module.exports = new QuoteStatsCommand().register();
