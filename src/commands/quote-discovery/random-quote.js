const Command = require('../../utils/command-base');
const buildCommandOptions = require('../../utils/command-options');
const { sendQuoteEmbed, sendError } = require('../../utils/response-helpers');
const { getAllQuotes } = require('../../db');

const { data, options } = buildCommandOptions('random-quote', 'Get a random quote', []);

class RandomQuoteCommand extends Command {
  constructor() {
    super({ name: 'random-quote', description: 'Get a random quote', data, options });
  }

  async execute(message) {
    try {
      const quotes = await getAllQuotes();
      if (!quotes || quotes.length === 0) {
        if (message.channel && typeof message.channel.send === 'function') {
          await message.channel.send('❌ No quotes available.');
        } else if (message.reply) {
          await message.reply('❌ No quotes available.');
        }
        return;
      }

      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      const { EmbedBuilder } = require('discord.js');
      const embed = new EmbedBuilder()
        .setTitle('Random Quote')
        .setDescription(`"${randomQuote.text}"`)
        .setFooter({ text: `— ${randomQuote.author} | #${randomQuote.id}` })
        .setColor(0x5865F2);

      if (message.channel && typeof message.channel.send === 'function') {
        await message.channel.send({ embeds: [embed] });
      } else if (message.reply) {
        await message.reply({ embeds: [embed] });
      }
    } catch (err) {
      console.error('Error in random-quote command:', err);
      if (message.channel && typeof message.channel.send === 'function') {
        await message.channel.send('Failed to retrieve random quote');
      } else if (message.reply) {
        await message.reply('Failed to retrieve random quote');
      }
    }
  }

  async executeInteraction(interaction) {
    await interaction.deferReply();
    const quotes = await getAllQuotes();
    if (!quotes || quotes.length === 0) {
      await sendError(interaction, 'No quotes available');
      return;
    }

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    await sendQuoteEmbed(interaction, randomQuote, 'Random Quote');
  }
}

module.exports = new RandomQuoteCommand().register();
