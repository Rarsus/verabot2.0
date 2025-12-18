const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendSuccess, sendError } = require('../../utils/helpers/response-helpers');
const { deleteQuote, getQuoteById } = require('../../db');

const { data, options } = buildCommandOptions('delete-quote', 'Delete a quote (admin only)', [
  { name: 'id', type: 'integer', description: 'Quote ID to delete', required: true }
]);

class DeleteQuoteCommand extends Command {
  constructor() {
    super({ name: 'delete-quote', description: 'Delete a quote (admin only)', data, options });
  }

  async execute(message, args) {
    try {
      if (!message.member.permissions.has('ADMINISTRATOR')) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send('❌ You do not have permission to delete quotes.');
        } else if (message.reply) {
          await message.reply('❌ You do not have permission to delete quotes.');
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

      await deleteQuote(id);
      if (message.channel && typeof message.channel.send === 'function') {
        await message.channel.send(`✅ Quote #${id} deleted successfully!`);
      } else if (message.reply) {
        await message.reply(`✅ Quote #${id} deleted successfully!`);
      }
    } catch (err) {
      console.error('Error in delete-quote command:', err);
      if (message.channel && typeof message.channel.send === 'function') {
        await message.channel.send('Failed to delete quote');
      } else if (message.reply) {
        await message.reply('Failed to delete quote');
      }
    }
  }

  async executeInteraction(interaction) {
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      await sendError(interaction, 'You do not have permission to delete quotes', true);
      return;
    }

    await interaction.deferReply();
    const id = interaction.options.getInteger('id');

    const quote = await getQuoteById(id);
    if (!quote) {
      await sendError(interaction, `Quote #${id} not found`);
      return;
    }

    await deleteQuote(id);
    await sendSuccess(interaction, `Quote #${id} deleted successfully!`);
  }
}

module.exports = new DeleteQuoteCommand().register();
