const { SlashCommandBuilder } = require('discord.js');
const { addTag, getTagByName, addTagToQuote, getQuoteById } = require('../db');
const { handleInteractionError } = require('../utils/error-handler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tag-quote')
    .setDescription('Add a tag to a quote')
    .addIntegerOption(opt => opt.setName('id').setDescription('Quote ID to tag').setRequired(true))
    .addStringOption(opt => opt.setName('tag').setDescription('Tag name').setRequired(true)),
  name: 'tag-quote',
  description: 'Add a tag to a quote',
  options: [
    { name: 'id', type: 'integer', description: 'Quote ID to tag', required: true },
    { name: 'tag', type: 'string', description: 'Tag name', required: true }
  ],
  async execute(message, args) {
    try {
      const id = parseInt(args[0], 10);
      const tagName = args.slice(1).join(' ');

      if (isNaN(id) || !tagName) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send('❌ Invalid quote ID or tag name.');
        } else if (message.reply) {
          await message.reply('❌ Invalid quote ID or tag name.');
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

      // Create tag if it doesn't exist
      await addTag(tagName);
      const tag = await getTagByName(tagName);

      if (!tag) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send('❌ Failed to create/find tag.');
        } else if (message.reply) {
          await message.reply('❌ Failed to create/find tag.');
        }
        return;
      }

      const success = await addTagToQuote(id, tag.id);
      if (success) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send(`✅ Added tag "#${tagName}" to quote #${id}`);
        } else if (message.reply) {
          await message.reply(`✅ Added tag "#${tagName}" to quote #${id}`);
        }
      } else {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send(`ℹ Tag "#${tagName}" already applied to quote #${id}`);
        } else if (message.reply) {
          await message.reply(`ℹ Tag "#${tagName}" already applied to quote #${id}`);
        }
      }
    } catch (err) {
      console.error('Error in tag-quote command:', err);
      handleInteractionError(message, 'Failed to tag quote');
    }
  },
  async executeInteraction(interaction) {
    try {
      await interaction.deferReply();
      const id = interaction.options.getInteger('id');
      const tagName = interaction.options.getString('tag');

      const quote = await getQuoteById(id);
      if (!quote) {
        await interaction.editReply(`❌ Quote #${id} not found.`);
        return;
      }

      // Create tag if it doesn't exist
      await addTag(tagName);
      const tag = await getTagByName(tagName);

      if (!tag) {
        await interaction.editReply('❌ Failed to create/find tag.');
        return;
      }

      const success = await addTagToQuote(id, tag.id);
      if (success) {
        await interaction.editReply(`✅ Added tag "#${tagName}" to quote #${id}`);
      } else {
        await interaction.editReply(`ℹ Tag "#${tagName}" already applied to quote #${id}`);
      }
    } catch (err) {
      console.error('Error in tag-quote interaction:', err);
      await handleInteractionError(interaction, 'Failed to tag quote');
    }
  }
};
