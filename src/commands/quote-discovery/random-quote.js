const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getAllQuotes } = require('../../db');
const { handleInteractionError } = require('../../utils/error-handler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('random-quote')
    .setDescription('Get a random quote'),
  name: 'random-quote',
  description: 'Get a random quote',
  async execute(message) {
    try {
      const quotes = await getAllQuotes();
      
      if (!quotes || quotes.length === 0) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send('❌ No quotes available.');
        } else if (message.reply) {
          await message.reply('❌ No quotes available.');
        }
        return;
      }

      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      const embed = new EmbedBuilder()
        .setTitle('Random Quote')
        .setDescription(`"${randomQuote.text}"`)
        .setFooter({ text: `— ${randomQuote.author} | #${randomQuote.id}` })
        .setColor(0x5865F2);

      if (message.channel && typeof message.channel.send === 'function') {
        await message.channel.send({ embeds: [embed] });
      } else if (message.reply) {
        await message.reply({ embeds: [embed] });
      }
    } catch (err) {
      console.error('Error in random-quote command:', err);
      handleInteractionError(message, 'Failed to retrieve random quote');
    }
  },
  async executeInteraction(interaction) {
    try {
      await interaction.deferReply();
      const quotes = await getAllQuotes();
      
      if (!quotes || quotes.length === 0) {
        await interaction.editReply('❌ No quotes available.');
        return;
      }

      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      const embed = new EmbedBuilder()
        .setTitle('Random Quote')
        .setDescription(`"${randomQuote.text}"`)
        .setFooter({ text: `— ${randomQuote.author} | #${randomQuote.id}` })
        .setColor(0x5865F2);

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error('Error in random-quote interaction:', err);
      await handleInteractionError(interaction, 'Failed to retrieve random quote');
    }
  }
};
