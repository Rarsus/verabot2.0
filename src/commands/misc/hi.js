const Command = require('../../utils/command-base');
const buildCommandOptions = require('../../utils/command-options');

const { data, options } = buildCommandOptions('hi', 'Say hi to someone', [
  { name: 'name', type: 'string', description: 'Name to say hi to', required: false }
]);

class HiCommand extends Command {
  constructor() {
    super({ name: 'hi', description: 'Say hi to someone', data, options });
  }

  async execute(message, args) {
    const name = args[0] || 'there';
    if (message.channel && typeof message.channel.send === 'function') {
      await message.channel.send(`hello ${name}!`);
    } else if (message.reply) {
      await message.reply(`hello ${name}!`);
    }
  }

  async executeInteraction(interaction) {
    const name = interaction.options.getString('name') || 'there';
    await interaction.reply(`hello ${name}!`);
  }
}

module.exports = new HiCommand().register();
