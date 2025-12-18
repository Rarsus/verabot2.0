const { SlashCommandBuilder } = require('discord.js');
const { updateQuote, getQuoteById } = require('../../db');
const { validateQuoteText, validateAuthor, handleInteractionError } = require('../../utils/error-handler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('update-quote')
    .setDescription('Update an existing quote (admin only)')
    .addIntegerOption(opt => opt.setName('id').setDescription('Quote ID to update').setRequired(true))
    .addStringOption(opt => opt.setName('quote').setDescription('New quote text').setRequired(true))
    .addStringOption(opt => opt.setName('author').setDescription('New author').setRequired(false)),
  name: 'update-quote',
  description: 'Update an existing quote (admin only)',
  options: [
    { name: 'id', type: 'integer', description: 'Quote ID to update', required: true },
    { name: 'quote', type: 'string', description: 'New quote text', required: true },
    { name: 'author', type: 'string', description: 'New author', required: false }
  ],
  async execute(message, args) {
    try {
      // Check admin permission
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

      // Check if quote exists
      const quote = await getQuoteById(id);
      if (!quote) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send(`❌ Quote #${id} not found.`);
        } else if (message.reply) {
          await message.reply(`❌ Quote #${id} not found.`);
        }
        return;
      }

      // Parse quote and author from args
      // Format: !update-quote <id> <new_quote> [new_author]
      const quoteText = args.slice(1).join(' ');
      if (!quoteText) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send('❌ Quote text is required.');
        } else if (message.reply) {
          await message.reply('❌ Quote text is required.');
        }
        return;
      }

      // Validate new quote text
      const quoteValidation = validateQuoteText(quoteText);
      if (!quoteValidation.valid) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send(`❌ ${quoteValidation.error}`);
        } else if (message.reply) {
          await message.reply(`❌ ${quoteValidation.error}`);
        }
        return;
      }

      // Use existing author if not provided
      const author = quote.author || 'Anonymous';

      // Update the quote
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
      handleInteractionError(message, 'Failed to update quote');
    }
  },
  async executeInteraction(interaction) {
    try {
      // Check admin permission
      if (!interaction.member.permissions.has('ADMINISTRATOR')) {
        await interaction.reply({ content: '❌ You do not have permission to update quotes.', ephemeral: true });
        return;
      }

      await interaction.deferReply();
      const id = interaction.options.getInteger('id');
      const newText = interaction.options.getString('quote');
      const newAuthor = interaction.options.getString('author');

      // Check if quote exists
      const quote = await getQuoteById(id);
      if (!quote) {
        await interaction.editReply(`❌ Quote #${id} not found.`);
        return;
      }

      // Validate new quote text
      const quoteValidation = validateQuoteText(newText);
      if (!quoteValidation.valid) {
        await interaction.editReply(`❌ ${quoteValidation.error}`);
        return;
      }

      // Validate new author if provided
      let author = newAuthor || quote.author || 'Anonymous';
      if (newAuthor) {
        const authorValidation = validateAuthor(newAuthor);
        if (!authorValidation.valid) {
          await interaction.editReply(`❌ ${authorValidation.error}`);
          return;
        }
        author = authorValidation.sanitized;
      }

      // Update the quote
      const result = await updateQuote(id, quoteValidation.sanitized, author);
      if (result.success) {
        await interaction.editReply(`✅ Quote #${id} updated successfully!`);
      } else {
        await interaction.editReply(`❌ ${result.message || 'Failed to update quote'}`);
      }
    } catch (err) {
      console.error('Error in update-quote interaction:', err);
      await handleInteractionError(interaction, 'Failed to update quote');
    }
  }
};
