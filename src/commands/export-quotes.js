const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { exportQuotesAsJson, exportQuotesAsCsv, getAllQuotes } = require('../db');
const { handleInteractionError } = require('../utils/error-handler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('export-quotes')
    .setDescription('Export quotes as JSON or CSV file')
    .addStringOption(opt => opt.setName('format').setDescription('Export format').setRequired(true)
      .addChoices(
        { name: 'JSON', value: 'json' },
        { name: 'CSV', value: 'csv' }
      )),
  name: 'export-quotes',
  description: 'Export quotes as JSON or CSV file',
  options: [
    { 
      name: 'format', 
      type: 'string', 
      description: 'Export format (json or csv)', 
      required: true,
      choices: [
        { name: 'JSON', value: 'json' },
        { name: 'CSV', value: 'csv' }
      ]
    }
  ],
  async execute(message, args) {
    try {
      const format = (args[0] || 'json').toLowerCase();

      if (!['json', 'csv'].includes(format)) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send('❌ Format must be "json" or "csv".');
        } else if (message.reply) {
          await message.reply('❌ Format must be "json" or "csv".');
        }
        return;
      }

      const quotes = await getAllQuotes();
      if (!quotes || quotes.length === 0) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send('❌ No quotes to export.');
        } else if (message.reply) {
          await message.reply('❌ No quotes to export.');
        }
        return;
      }

      let data, filename, extension;

      if (format === 'json') {
        data = await exportQuotesAsJson(quotes);
        filename = `quotes_${Date.now()}.json`;
        extension = 'json';
      } else {
        data = await exportQuotesAsCsv(quotes);
        filename = `quotes_${Date.now()}.csv`;
        extension = 'csv';
      }

      const attachment = new AttachmentBuilder(Buffer.from(data), { name: filename });

      if (message.channel && typeof message.channel.send === 'function') {
        await message.channel.send({
          content: `✅ Exported ${quotes.length} quotes as ${extension.toUpperCase()}`,
          files: [attachment]
        });
      } else if (message.reply) {
        await message.reply({
          content: `✅ Exported ${quotes.length} quotes as ${extension.toUpperCase()}`,
          files: [attachment]
        });
      }
    } catch (err) {
      console.error('Error in export-quotes command:', err);
      handleInteractionError(message, 'Failed to export quotes');
    }
  },
  async executeInteraction(interaction) {
    try {
      await interaction.deferReply();
      const format = interaction.options.getString('format');

      const quotes = await getAllQuotes();
      if (!quotes || quotes.length === 0) {
        await interaction.editReply('❌ No quotes to export.');
        return;
      }

      let data, filename, extension;

      if (format === 'json') {
        data = await exportQuotesAsJson(quotes);
        filename = `quotes_${Date.now()}.json`;
        extension = 'json';
      } else {
        data = await exportQuotesAsCsv(quotes);
        filename = `quotes_${Date.now()}.csv`;
        extension = 'csv';
      }

      const attachment = new AttachmentBuilder(Buffer.from(data), { name: filename });

      await interaction.editReply({
        content: `✅ Exported ${quotes.length} quotes as ${extension.toUpperCase()}`,
        files: [attachment]
      });
    } catch (err) {
      console.error('Error in export-quotes interaction:', err);
      await handleInteractionError(interaction, 'Failed to export quotes');
    }
  }
};
