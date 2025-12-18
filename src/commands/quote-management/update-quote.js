const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendSuccess, sendError } = require('../../utils/helpers/response-helpers');
const { updateQuote, getQuoteById } = require('../../db');
const { validateQuoteText, validateAuthor } = require('../../middleware/errorHandler');

const { data, options } = buildCommandOptions('update-quote', 'Update an existing quote (admin only)', [
  { name: 'id', type: 'integer', description: 'Quote ID to update', required: true },
  { name: 'quote', type: 'string', description: 'New quote text', required: true },
  { name: 'author', type: 'string', description: 'New author', required: false }
]);

class UpdateQuoteCommand extends Command {
  constructor() {
    super({ name: 'update-quote', description: 'Update an existing quote (admin only)', data, options });
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

      const quote = await getQuoteById(id);
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
      const result = await updateQuote(id, quoteValidation.sanitized, author);
      if (result.success) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send(`✅ Quote #${id} updated successfully!`);
        } else if (message.reply) {
          await message.reply(`✅ Quote #${id} updated successfully!`);
        }
      } else {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send(`❌ ${result.message || 'Failed to update quote'}`);
        } else if (message.reply) {
          await message.reply(`❌ ${result.message || 'Failed to update quote'}`);
        }
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
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      await sendError(interaction, 'You do not have permission to update quotes', true);
      return;
    }

    await interaction.deferReply();
    const id = interaction.options.getInteger('id');
    const newText = interaction.options.getString('quote');
    const newAuthor = interaction.options.getString('author');

    const quote = await getQuoteById(id);
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

    const result = await updateQuote(id, quoteValidation.sanitized, author);
    if (result.success) {
      await sendSuccess(interaction, `Quote #${id} updated successfully!`);
    } else {
      await sendError(interaction, result.message || 'Failed to update quote');
    }
  }
}

module.exports = new UpdateQuoteCommand().register();
