const { SlashCommandBuilder } = require('discord.js');
const { getQuoteByNumber, getAllQuotes } = require('../../db');
const { validateQuoteNumber, handleInteractionError } = require('../../utils/error-handler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quote')
    .setDescription('Retrieve a quote from the database by number')
    .addIntegerOption(opt => opt.setName('number').setDescription('Quote number').setRequired(true).setMinValue(1)),
  name: 'quote',
  description: 'Retrieve a quote from the database by number',
  options: [
    { name: 'number', type: 'integer', description: 'Quote number', required: true, minValue: 1 }
  ],
  async execute(message, args) {
    try {
      const number = parseInt(args[0], 10);
      
      // Get total quotes for validation
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
  },
  async executeInteraction(interaction) {
    try {
      const number = interaction.options.getInteger('number');
      
      // Get total quotes for validation
      const allQuotes = await getAllQuotes();
      const validation = validateQuoteNumber(number, allQuotes.length);
      
      if (!validation.valid) {
        await interaction.reply({ content: `❌ ${validation.error}`, flags: 64 });
        return;
      }

      const quote = await getQuoteByNumber(number);
      if (!quote) {
        await interaction.reply({ content: `❌ Quote #${number} not found.`, flags: 64 });
        return;
      }
      await interaction.reply(`> ${quote.text}\n— ${quote.author}`);
    } catch (err) {
      await handleInteractionError(interaction, err, 'quote.executeInteraction');
    }
  }
};
