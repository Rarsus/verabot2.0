const { SlashCommandBuilder } = require('discord.js');
const { addQuote } = require('../db');
const { validateQuoteText, validateAuthor, handleInteractionError } = require('../utils/error-handler');

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
      
      // Validate quote
      const quoteValidation = validateQuoteText(quote);
      if (!quoteValidation.valid) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send(`❌ ${quoteValidation.error}`);
        } else if (message.reply) {
          await message.reply(`❌ ${quoteValidation.error}`);
        }
        return;
      }

      // Validate author
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
  },
  async executeInteraction(interaction) {
    try {
      const quote = interaction.options.getString('quote');
      const author = interaction.options.getString('author') || 'Anonymous';

      // Validate quote
      const quoteValidation = validateQuoteText(quote);
      if (!quoteValidation.valid) {
        await interaction.reply({ content: `❌ ${quoteValidation.error}`, flags: 64 });
        return;
      }

      // Validate author
      const authorValidation = validateAuthor(author);
      if (!authorValidation.valid) {
        await interaction.reply({ content: `❌ ${authorValidation.error}`, flags: 64 });
        return;
      }

      const id = await addQuote(quoteValidation.sanitized, authorValidation.sanitized);
      await interaction.reply(`✅ Quote #${id} added successfully!`);
    } catch (err) {
      await handleInteractionError(interaction, err, 'add-quote.executeInteraction');
    }
  }
};
