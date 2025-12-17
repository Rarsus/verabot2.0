module.exports = {
  name: 'hi',
  description: 'Say hi to someone: /hi name:Alice',
  options: [
    {
      name: 'name',
      type: 3,
      description: 'Name to say hi to',
      required: false
    }
  ],
  async execute(message, args) {
    const name = args[0] || 'there';
    if (message.channel && typeof message.channel.send === 'function') {
      await message.channel.send(`hello ${name}!`);
    } else if (message.reply) {
      await message.reply(`hello ${name}!`);
    }
  },
  async executeInteraction(interaction) {
    const name = interaction.options.getString('name') || 'there';
    await interaction.reply(`hello ${name}!`);
  }
};
