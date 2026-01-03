const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendError, sendDM } = require('../../utils/helpers/response-helpers');
const { getAllQuotes } = require('../../db');

const { data, options } = buildCommandOptions('list-quotes', 'Get a list of all quotes in a private message', []);

class ListQuotesCommand extends Command {
  constructor() {
    super({
      name: 'list-quotes',
      description: 'Get a list of all quotes in a private message',
      data,
      options,
      permissions: {
        minTier: 1,
        visible: true
      }
    });
  }

  async execute(message) {
    try {
      const quotes = await getAllQuotes();
      if (quotes.length === 0) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send('No quotes in the database yet.');
        } else if (message.reply) {
          await message.reply('No quotes in the database yet.');
        }
        return;
      }

      const list = quotes.map((q, i) => `${i + 1}. ${q.text}\n   — ${q.author}`).join('\n\n');
      try {
        const dmChannel = await message.author.createDM();
        await dmChannel.send(`**Quotes Database:**\n\n${list}`);
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send('Quote list sent to your DMs!');
        } else if (message.reply) {
          await message.reply('Quote list sent to your DMs!');
        }
      } catch {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send('Could not send DM. Make sure DMs are enabled.');
        } else if (message.reply) {
          await message.reply('Could not send DM. Make sure DMs are enabled.');
        }
      }
    } catch {
      console.error('List-quotes command error', err);
    }
  }

  async executeInteraction(interaction) {
    // Defer the interaction immediately to avoid timeout (3 second Discord limit)
    await interaction.deferReply({ ephemeral: true });

    const quotes = await getAllQuotes();
    if (quotes.length === 0) {
      await sendError(interaction, 'No quotes in the database yet', true);
      return;
    }

    const list = quotes.map((q, i) => `${i + 1}. ${q.text}\n   — ${q.author}`).join('\n\n');
    await sendDM(interaction, `**Quotes Database:**\n\n${list}`, 'Quote list sent to your DMs!');
  }
}

module.exports = new ListQuotesCommand().register();
