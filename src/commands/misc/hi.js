const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');

const { data, options } = buildCommandOptions('hi', 'Say hi to someone', [
  { name: 'name', type: 'string', description: 'Name to say hi to', required: false }
]);

class HiCommand extends Command {
  constructor() {
    super({
      name: 'hi',
      description: 'Say hi to someone',
      data,
      options,
      permissions: {
        minTier: 0,
        visible: true
      }
    });
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
