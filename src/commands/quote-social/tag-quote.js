const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendSuccess, sendError } = require('../../utils/helpers/response-helpers');
const quoteService = require('../../services/QuoteService');

const { data, options } = buildCommandOptions('tag-quote', 'Add a tag to a quote', [
  { name: 'id', type: 'integer', description: 'Quote ID to tag', required: true },
  { name: 'tag', type: 'string', description: 'Tag name', required: true },
]);

class TagQuoteCommand extends Command {
  constructor() {
    super({
      name: 'tag-quote',
      description: 'Add a tag to a quote',
      data,
      options,
      permissions: {
        minTier: 1,
        visible: true,
      },
    });
  }

  async execute(message, args) {
    try {
      const guildId = message.guildId;
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

      const quote = await quoteService.getQuoteById(guildId, id);
      if (!quote) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send(`❌ Quote #${id} not found.`);
        } else if (message.reply) {
          await message.reply(`❌ Quote #${id} not found.`);
        }
        return;
      }

      const success = await quoteService.tagQuote(guildId, id, tagName);
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
      if (message.channel && typeof message.channel.send === 'function') {
        await message.channel.send('Failed to tag quote');
      } else if (message.reply) {
        await message.reply('Failed to tag quote');
      }
    }
  }

  async executeInteraction(interaction) {
    await interaction.deferReply();
    const guildId = interaction.guildId;
    const id = interaction.options.getInteger('id');
    const tagName = interaction.options.getString('tag');

    const quote = await quoteService.getQuoteById(guildId, id);
    if (!quote) {
      await sendError(interaction, `Quote #${id} not found`);
      return;
    }

    const success = await quoteService.tagQuote(guildId, id, tagName);
    if (success) {
      await sendSuccess(interaction, `Added tag "#${tagName}" to quote #${id}`);
    } else {
      await interaction.editReply(`ℹ Tag "#${tagName}" already applied to quote #${id}`);
    }
  }
}

module.exports = new TagQuoteCommand().register();
