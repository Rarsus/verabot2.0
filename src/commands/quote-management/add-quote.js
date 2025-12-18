const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendSuccess, sendError } = require('../../utils/helpers/response-helpers');
const { addQuote } = require('../../db');
const { validateQuoteText, validateAuthor } = require('../../middleware/errorHandler');

const { data, options } = buildCommandOptions('add-quote', 'Add a quote to the database', [
  { name: 'quote', type: 'string', description: 'The quote to add', required: true },
  { name: 'author', type: 'string', description: 'The author of the quote', required: false }
]);

class AddQuoteCommand extends Command {
  constructor() {
    super({ name: 'add-quote', description: 'Add a quote to the database', data, options });
  }

  async execute(message, args) {
    try {
      const quote = args.slice(0, -1).join(' ') || args[0];
      const author = args[args.length - 1] || 'Anonymous';

      const quoteValidation = validateQuoteText(quote);
      if (!quoteValidation.valid) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send(`❌ ${quoteValidation.error}`);
        } else if (message.reply) {
          await message.reply(`❌ ${quoteValidation.error}`);
        }
        return;
      }

      const authorValidation = validateAuthor(author);
      if (!authorValidation.valid) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send(`❌ ${authorValidation.error}`);
        } else if (message.reply) {
          await message.reply(`❌ ${authorValidation.error}`);
        }
        return;
      }

      const id = await addQuote(quoteValidation.sanitized, authorValidation.sanitized);
      if (message.channel && typeof message.channel.send === 'function') {
        await message.channel.send(`✅ Quote #${id} added successfully!`);
      } else if (message.reply) {
        await message.reply(`✅ Quote #${id} added successfully!`);
      }
    } catch (err) {
      console.error('Add-quote command error', err);
    }
  }

  async executeInteraction(interaction) {
    const quote = interaction.options.getString('quote');
    const author = interaction.options.getString('author') || 'Anonymous';

    const quoteValidation = validateQuoteText(quote);
    if (!quoteValidation.valid) {
      await sendError(interaction, quoteValidation.error, true);
      return;
    }

    const authorValidation = validateAuthor(author);
    if (!authorValidation.valid) {
      await sendError(interaction, authorValidation.error, true);
      return;
    }

    const id = await addQuote(quoteValidation.sanitized, authorValidation.sanitized);
    await sendSuccess(interaction, `Quote #${id} added successfully!`);
  }
}

module.exports = new AddQuoteCommand().register();
