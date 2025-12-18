const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');

const { data, options } = buildCommandOptions('ping', 'Simple ping command', []);

class PingCommand extends Command {
  constructor() {
    super({ name: 'ping', description: 'Simple ping command', data, options });
  }

  async execute(message) {
    if (message.channel && typeof message.channel.send === 'function') {
      await message.channel.send('Pong!');
    } else if (message.reply) {
      await message.reply('Pong!');
    }
  }

  async executeInteraction(interaction) {
    await interaction.reply('Pong!');
  }
}

module.exports = new PingCommand().register();
