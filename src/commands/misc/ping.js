const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Simple ping command'),
  name: 'ping',
  description: 'Simple ping command',
  options: [],
  async execute(message) {
    if (message.channel && typeof message.channel.send === 'function') {
      await message.channel.send('Pong!');
    } else if (message.reply) {
      await message.reply('Pong!');
    }
  },
  async executeInteraction(interaction) {
    await interaction.reply('Pong!');
  }
};
