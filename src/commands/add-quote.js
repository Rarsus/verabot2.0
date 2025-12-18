const { SlashCommandBuilder } = require('discord.js');
const { addQuote } = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add-quote')
    .setDescription('Add a quote to the database')
    .addStringOption(opt => opt.setName('quote').setDescription('The quote to add').setRequired(true))
    .addStringOption(opt => opt.setName('author').setDescription('The author of the quote').setRequired(false)),
  name: 'add-quote',
  description: 'Add a quote to the database',
  options: [
    { name: 'quote', type: 'string', description: 'The quote to add', required: true },
    { name: 'author', type: 'string', description: 'The author of the quote', required: false }
  ],
  async execute(message, args) {
    try {
      const quote = args.slice(0, -1).join(' ') || args[0];
      const author = args[args.length - 1] || 'Anonymous';
      if (!quote.trim()) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send('Please provide a quote.');
        } else if (message.reply) {
          await message.reply('Please provide a quote.');
        }
        return;
      }
      const id = addQuote(quote, author);
      if (message.channel && typeof message.channel.send === 'function') {
        await message.channel.send(`Quote #${id} added successfully!`);
      } else if (message.reply) {
        await message.reply(`Quote #${id} added successfully!`);
      }
    } catch (err) {
      console.error('Add-quote command error', err);
    }
  },
  async executeInteraction(interaction) {
    try {
      const quote = interaction.options.getString('quote');
      const author = interaction.options.getString('author') || 'Anonymous';
      const id = addQuote(quote, author);
      await interaction.reply(`Quote #${id} added successfully!`);
    } catch (err) {
      console.error('Add-quote interaction error', err);
      try { await interaction.reply({ content: 'Could not add quote.', ephemeral: true }); } catch (e) { void 0; }
    }
  }
};
