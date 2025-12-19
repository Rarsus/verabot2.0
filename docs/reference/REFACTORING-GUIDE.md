/**
 * REFACTORING EXAMPLE - Before and After
 * This file demonstrates how to reduce repeating code
 */

// ============================================
// BEFORE: 50+ lines with duplication
// ============================================
const BEFORE_EXAMPLE = `
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getAllQuotes } = require('../../db');
const { handleInteractionError } = require('../../utils/error-handler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('random-quote')
    .setDescription('Get a random quote'),
  name: 'random-quote',
  description: 'Get a random quote',
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
      const embed = new EmbedBuilder()
        .setTitle('Random Quote')
        .setDescription(\`"\${randomQuote.text}"\`)
        .setFooter({ text: \`— \${randomQuote.author} | #\${randomQuote.id}\` })
        .setColor(0x5865F2);
      if (message.channel && typeof message.channel.send === 'function') {
        await message.channel.send({ embeds: [embed] });
      } else if (message.reply) {
        await message.reply({ embeds: [embed] });
      }
    } catch (err) {
      console.error('Error in random-quote execute:', err);
    }
  },
  async executeInteraction(interaction) {
    try {
      await interaction.deferReply();
      const quotes = await getAllQuotes();
      
      if (!quotes || quotes.length === 0) {
        await interaction.editReply('❌ No quotes available.');
        return;
      }

      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      const embed = new EmbedBuilder()
        .setTitle('Random Quote')
        .setDescription(\`"\${randomQuote.text}"\`)
        .setFooter({ text: \`— \${randomQuote.author} | #\${randomQuote.id}\` })
        .setColor(0x5865F2);

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error('Error in random-quote interaction:', err);
      await handleInteractionError(interaction, 'Failed to retrieve random quote');
    }
  }
};
`;

// ============================================
// AFTER: 20 lines, cleaner, no duplication
// ============================================
const AFTER_EXAMPLE = `
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { getAllQuotes, sendQuoteEmbed } = require('../../utils/helpers/response-helpers');

const { data, options } = buildCommandOptions('random-quote', 'Get a random quote');

class RandomQuoteCommand extends Command {
  constructor() {
    super({ name: 'random-quote', description: 'Get a random quote', data, options });
  }

  async execute(message) {
    const quotes = await getAllQuotes();
    if (!quotes?.length) {
      await message.reply('❌ No quotes available.');
      return;
    }
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    await sendQuoteEmbed(message, quote, 'Random Quote');
  }

  async executeInteraction(interaction) {
    await deferReply(interaction);
    const quotes = await getAllQuotes();
    if (!quotes?.length) {
      await sendError(interaction, 'No quotes available.');
      return;
    }
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    await sendQuoteEmbed(interaction, quote, 'Random Quote');
  }
}

module.exports = new RandomQuoteCommand().register();
`;

console.log('='.repeat(60));
console.log('REFACTORING GUIDE - REDUCING CODE DUPLICATION');
console.log('='.repeat(60));
console.log('\nBEFORE (verbose, repeated patterns):\n', BEFORE_EXAMPLE);
console.log('\n' + '='.repeat(60));
console.log('AFTER (clean, reusable):\n', AFTER_EXAMPLE);
