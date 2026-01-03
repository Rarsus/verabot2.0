const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendSuccess, sendError } = require('../../utils/helpers/response-helpers');
const quoteService = require('../../services/QuoteService');
const { validateQuoteText, validateAuthor } = require('../../middleware/errorHandler');

const { data, options } = buildCommandOptions('update-quote', 'Update an existing quote (admin only)', [
  { name: 'id', type: 'integer', description: 'Quote ID to update', required: true },
  { name: 'quote', type: 'string', description: 'New quote text', required: true },
  { name: 'author', type: 'string', description: 'New author', required: false }
]);

class UpdateQuoteCommand extends Command {
  constructor() {
    super({
      name: 'update-quote',
      description: 'Update an existing quote',
      data,
      options,
      permissions: {
        minTier: 2,
        visible: true
      }
    });
  }

  async execute(message, args) {
    try {
      if (!message.member.permissions.has('ADMINISTRATOR')) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send('❌ You do not have permission to update quotes.');
        } else if (message.reply) {
          await message.reply('❌ You do not have permission to update quotes.');
        }
        return;
      }

      const id = parseInt(args[0], 10);
      if (isNaN(id)) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send('❌ Invalid quote ID.');
        } else if (message.reply) {
          await message.reply('❌ Invalid quote ID.');
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

      const quoteText = args.slice(1).join(' ');
      if (!quoteText) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send('❌ Quote text is required.');
        } else if (message.reply) {
          await message.reply('❌ Quote text is required.');
        }
        return;
      }

      const quoteValidation = validateQuoteText(quoteText);
      if (!quoteValidation.valid) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send(`❌ ${quoteValidation.error}`);
        } else if (message.reply) {
          await message.reply(`❌ ${quoteValidation.error}`);
        }
        return;
      }

      const author = quote.author || 'Anonymous';
      await quoteService.updateQuote(guildId, id, quoteValidation.sanitized, author);
      if (message.channel && typeof message.channel.send === 'function') {
        await message.channel.send(`✅ Quote #${id} updated successfully!`);
      } else if (message.reply) {
        await message.reply(`✅ Quote #${id} updated successfully!`);
      }
    } catch (err) {
      console.error('Error in update-quote command:', err);
      if (message.channel && typeof message.channel.send === 'function') {
        await message.channel.send('Failed to update quote');
      } else if (message.reply) {
        await message.reply('Failed to update quote');
      }
    }
  }

  async executeInteraction(interaction) {
    // Defer immediately to prevent timeout
    await interaction.deferReply();

    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      await sendError(interaction, 'You do not have permission to update quotes', true);
      return;
    }

    const guildId = interaction.guildId;
    const id = interaction.options.getInteger('id');
    const newText = interaction.options.getString('quote');
    const newAuthor = interaction.options.getString('author');

    const quote = await quoteService.getQuoteById(guildId, id);
    if (!quote) {
      await sendError(interaction, `Quote #${id} not found`);
      return;
    }

    const quoteValidation = validateQuoteText(newText);
    if (!quoteValidation.valid) {
      await sendError(interaction, quoteValidation.error);
      return;
    }

    let author = newAuthor || quote.author || 'Anonymous';
    if (newAuthor) {
      const authorValidation = validateAuthor(newAuthor);
      if (!authorValidation.valid) {
        await sendError(interaction, authorValidation.error);
        return;
      }
      author = authorValidation.sanitized;
    }

    await quoteService.updateQuote(guildId, id, quoteValidation.sanitized, author);
    await sendSuccess(interaction, `Quote #${id} updated successfully!`);
  }
}

module.exports = new UpdateQuoteCommand().register();
