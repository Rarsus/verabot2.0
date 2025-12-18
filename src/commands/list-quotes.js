const { SlashCommandBuilder } = require('discord.js');
const { getAllQuotes } = require('../db');
const { handleInteractionError } = require('../utils/error-handler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('list-quotes')
    .setDescription('Get a list of all quotes in a private message'),
  name: 'list-quotes',
  description: 'Get a list of all quotes in a private message',
  options: [],
  async execute(message) {
    try {
      const quotes = await getAllQuotes();
      if (quotes.length === 0) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send('No quotes in the database yet.');
        } else if (message.reply) {
          await message.reply('No quotes in the database yet.');
        }
        return;
      }
      const list = quotes.map((q, i) => `${i + 1}. ${q.text}\n   — ${q.author}`).join('\n\n');
      const dmChannel = await message.author.createDM();
      await dmChannel.send(`**Quotes Database:**\n\n${list}`);
      if (message.channel && typeof message.channel.send === 'function') {
        await message.channel.send('Quote list sent to your DMs!');
      } else if (message.reply) {
        await message.reply('Quote list sent to your DMs!');
      }
    } catch (err) {
      console.error('List-quotes command error', err);
    }
  },
  async executeInteraction(interaction) {
    try {
      const quotes = await getAllQuotes();
      if (quotes.length === 0) {
        await interaction.reply({ content: 'No quotes in the database yet.', flags: 64 });
        return;
      }
      const list = quotes.map((q, i) => `${i + 1}. ${q.text}\n   — ${q.author}`).join('\n\n');
      const dmChannel = await interaction.user.createDM();
      await dmChannel.send(`**Quotes Database:**\n\n${list}`);
      await interaction.reply({ content: 'Quote list sent to your DMs!', flags: 64 });
    } catch (err) {
      await handleInteractionError(interaction, err, 'list-quotes.executeInteraction');
    }
  }
};
