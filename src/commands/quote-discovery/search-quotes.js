const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getAllQuotes } = require('../../db');
const { handleInteractionError } = require('../../utils/error-handler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('search-quotes')
    .setDescription('Search quotes by text or author')
    .addStringOption(opt => opt.setName('query').setDescription('Search term (text or author)').setRequired(true)),
  name: 'search-quotes',
  description: 'Search quotes by text or author',
  options: [
    { name: 'query', type: 'string', description: 'Search term (text or author)', required: true }
  ],
  async execute(message, args) {
    try {
      const query = args.join(' ').toLowerCase();
      
      if (!query) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send('❌ Please provide a search term.');
        } else if (message.reply) {
          await message.reply('❌ Please provide a search term.');
        }
        return;
      }

      const quotes = await getAllQuotes();
      const results = quotes.filter(q => 
        q.text.toLowerCase().includes(query) || 
        q.author.toLowerCase().includes(query)
      );

      if (results.length === 0) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send(`❌ No quotes found matching "${query}".`);
        } else if (message.reply) {
          await message.reply(`❌ No quotes found matching "${query}".`);
        }
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`Search Results (${results.length} found)`)
        .setDescription(results.slice(0, 5).map(q => `**#${q.id}**: "${q.text}" — ${q.author}`).join('\n\n'))
        .setFooter({ text: results.length > 5 ? `... and ${results.length - 5} more` : '' })
        .setColor(0x5865F2);

      if (message.channel && typeof message.channel.send === 'function') {
        await message.channel.send({ embeds: [embed] });
      } else if (message.reply) {
        await message.reply({ embeds: [embed] });
      }
    } catch (err) {
      console.error('Error in search-quotes command:', err);
      handleInteractionError(message, 'Failed to search quotes');
    }
  },
  async executeInteraction(interaction) {
    try {
      await interaction.deferReply();
      const query = interaction.options.getString('query').toLowerCase();

      const quotes = await getAllQuotes();
      const results = quotes.filter(q => 
        q.text.toLowerCase().includes(query) || 
        q.author.toLowerCase().includes(query)
      );

      if (results.length === 0) {
        await interaction.editReply(`❌ No quotes found matching "${query}".`);
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`Search Results (${results.length} found)`)
        .setDescription(results.slice(0, 5).map(q => `**#${q.id}**: "${q.text}" — ${q.author}`).join('\n\n'))
        .setFooter({ text: results.length > 5 ? `... and ${results.length - 5} more` : '' })
        .setColor(0x5865F2);

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error('Error in search-quotes interaction:', err);
      await handleInteractionError(interaction, 'Failed to search quotes');
    }
  }
};
