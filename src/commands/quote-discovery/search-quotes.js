const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendError } = require('../../utils/helpers/response-helpers');
const { getAllQuotes } = require('../../db');
const { EmbedBuilder } = require('discord.js');

const { data, options } = buildCommandOptions('search-quotes', 'Search quotes by text or author', [
  { name: 'query', type: 'string', description: 'Search term (text or author)', required: true }
]);

class SearchQuotesCommand extends Command {
  constructor() {
    super({
      name: 'search-quotes',
      description: 'Search quotes by text or author',
      data,
      options,
      permissions: {
        minTier: 0,
        visible: true
      }
    });
  }

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
      if (message.channel && typeof message.channel.send === 'function') {
        await message.channel.send('Failed to search quotes');
      } else if (message.reply) {
        await message.reply('Failed to search quotes');
      }
    }
  }

  async executeInteraction(interaction) {
    await interaction.deferReply();
    const query = interaction.options.getString('query').toLowerCase();

    const quotes = await getAllQuotes();
    const results = quotes.filter(q =>
      q.text.toLowerCase().includes(query) ||
      q.author.toLowerCase().includes(query)
    );

    if (results.length === 0) {
      await sendError(interaction, `No quotes found matching "${query}"`);
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`Search Results (${results.length} found)`)
      .setDescription(results.slice(0, 5).map(q => `**#${q.id}**: "${q.text}" — ${q.author}`).join('\n\n'))
      .setFooter({ text: results.length > 5 ? `... and ${results.length - 5} more` : '' })
      .setColor(0x5865F2);

    await interaction.editReply({ embeds: [embed] });
  }
}

module.exports = new SearchQuotesCommand().register();
