const { SlashCommandBuilder } = require('discord.js');
const { getQuoteByNumber } = require('../db');

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
      if (isNaN(number) || number < 1) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send('Please provide a valid quote number.');
        } else if (message.reply) {
          await message.reply('Please provide a valid quote number.');
        }
        return;
      }
      const quote = getQuoteByNumber(number);
      if (!quote) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send(`Quote #${number} not found.`);
        } else if (message.reply) {
          await message.reply(`Quote #${number} not found.`);
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
      const quote = getQuoteByNumber(number);
      if (!quote) {
        await interaction.reply({ content: `Quote #${number} not found.`, ephemeral: true });
        return;
      }
      await interaction.reply(`> ${quote.text}\n— ${quote.author}`);
    } catch (err) {
      console.error('Quote interaction error', err);
      try { await interaction.reply({ content: 'Could not retrieve quote.', ephemeral: true }); } catch (e) { void 0; }
    }
  }
};
