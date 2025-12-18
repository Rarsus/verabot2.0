const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getAllQuotes } = require('../db');
const { handleInteractionError } = require('../utils/error-handler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quote-stats')
    .setDescription('Get statistics about the quote database'),
  name: 'quote-stats',
  description: 'Get statistics about the quote database',
  async execute(message) {
    try {
      const quotes = await getAllQuotes();

      if (!quotes || quotes.length === 0) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send('❌ No quotes in database.');
        } else if (message.reply) {
          await message.reply('❌ No quotes in database.');
        }
        return;
      }

      // Calculate stats
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
      handleInteractionError(message, 'Failed to retrieve statistics');
    }
  },
  async executeInteraction(interaction) {
    try {
      await interaction.deferReply();
      const quotes = await getAllQuotes();

      if (!quotes || quotes.length === 0) {
        await interaction.editReply('❌ No quotes in database.');
        return;
      }

      // Calculate stats
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
    } catch (err) {
      console.error('Error in quote-stats interaction:', err);
      await handleInteractionError(interaction, 'Failed to retrieve statistics');
    }
  }
};
