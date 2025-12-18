const Command = require('../../utils/command-base');
const buildCommandOptions = require('../../utils/command-options');
const { sendError } = require('../../utils/response-helpers');
const { getQuoteByNumber, getAllQuotes } = require('../../db');
const { validateQuoteNumber } = require('../../utils/error-handler');

const { data, options } = buildCommandOptions('quote', 'Retrieve a quote from the database by number', [
  { name: 'number', type: 'integer', description: 'Quote number', required: true }
]);

class QuoteCommand extends Command {
  constructor() {
    super({ name: 'quote', description: 'Retrieve a quote from the database by number', data, options });
  }

  async execute(message, args) {
    try {
      const number = parseInt(args[0], 10);
      const allQuotes = await getAllQuotes();
      const validation = validateQuoteNumber(number, allQuotes.length);

      if (!validation.valid) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send(`❌ ${validation.error}`);
        } else if (message.reply) {
          await message.reply(`❌ ${validation.error}`);
        }
        return;
      }

      const quote = await getQuoteByNumber(number);
      if (!quote) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send(`❌ Quote #${number} not found.`);
        } else if (message.reply) {
          await message.reply(`❌ Quote #${number} not found.`);
        }
        return;
      }

      if (message.channel && typeof message.channel.send === 'function') {
        await message.channel.send(`> ${quote.text}\n— ${quote.author}`);
      } else if (message.reply) {
        await message.reply(`> ${quote.text}\n— ${quote.author}`);
      }
    } catch (err) {
      console.error('Quote command error', err);
    }
  }

  async executeInteraction(interaction) {
    const number = interaction.options.getInteger('number');
    const allQuotes = await getAllQuotes();
    const validation = validateQuoteNumber(number, allQuotes.length);

    if (!validation.valid) {
      await sendError(interaction, validation.error, true);
      return;
    }

    const quote = await getQuoteByNumber(number);
    if (!quote) {
      await sendError(interaction, `Quote #${number} not found`, true);
      return;
    }

    await interaction.reply(`> ${quote.text}\n— ${quote.author}`);
  }
}

module.exports = new QuoteCommand().register();
