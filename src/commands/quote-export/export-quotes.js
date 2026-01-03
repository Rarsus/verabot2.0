const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendError } = require('../../utils/helpers/response-helpers');
const { exportQuotesAsJson, exportQuotesAsCsv, getAllQuotes } = require('../../db');
const { AttachmentBuilder } = require('discord.js');

const { data, options } = buildCommandOptions('export-quotes', 'Export quotes as JSON or CSV file', [
  { name: 'format', type: 'string', description: 'Export format (json or csv)', required: true }
]);

class ExportQuotesCommand extends Command {
  constructor() {
    super({
      name: 'export-quotes',
      description: 'Export quotes as JSON or CSV file',
      data,
      options,
      permissions: {
        minTier: 1,
        visible: true
      }
    });
  }

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
      if (message.channel && typeof message.channel.send === 'function') {
        await message.channel.send('Failed to export quotes');
      } else if (message.reply) {
        await message.reply('Failed to export quotes');
      }
    }
  }

  async executeInteraction(interaction) {
    await interaction.deferReply();
    const format = interaction.options.getString('format');

    const quotes = await getAllQuotes();
    if (!quotes || quotes.length === 0) {
      await sendError(interaction, 'No quotes to export');
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
  }
}

module.exports = new ExportQuotesCommand().register();
