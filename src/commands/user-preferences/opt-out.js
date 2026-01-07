const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendOptOutSuccess } = require('../../utils/helpers/response-helpers');
const { optOut } = require('../../services/GuildAwareCommunicationService');

const { data, options } = buildCommandOptions('opt-out', 'Opt out of receiving direct messages from VeraBot');

class OptOutCommand extends Command {
  constructor() {
    super({
      name: 'opt-out',
      description: 'Opt out of receiving direct messages from VeraBot',
      data,
      options,
      permissions: {
        minTier: 0,
        visible: true,
      },
    });
  }

  async execute(message, _args) {
    try {
      const guildId = message.guildId;
      await optOut(guildId, message.author.id);
      await sendOptOutSuccess(message);
    } catch (err) {
      throw err;
    }
  }

  async executeInteraction(interaction) {
    // Defer the interaction immediately to avoid timeout (3 second Discord limit)
    await interaction.deferReply();

    try {
      const guildId = interaction.guildId;
      await optOut(guildId, interaction.user.id);
      await sendOptOutSuccess(interaction);
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new OptOutCommand().register();
