const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendOptInSuccess } = require('../../utils/helpers/response-helpers');
const { optIn } = require('../../services/GuildAwareCommunicationService');

const { data, options } = buildCommandOptions(
  'opt-in',
  'Opt in to receive direct messages and use VeraBot communication features'
);

class OptInCommand extends Command {
  constructor() {
    super({
      name: 'opt-in',
      description: 'Opt in to receive direct messages and use VeraBot communication features',
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
      await optIn(guildId, message.author.id);
      await sendOptInSuccess(message);
    } catch (err) {
      throw err;
    }
  }

  async executeInteraction(interaction) {
    // Defer the interaction immediately to avoid timeout (3 second Discord limit)
    await interaction.deferReply();

    try {
      const guildId = interaction.guildId;
      await optIn(guildId, interaction.user.id);
      await sendOptInSuccess(interaction);
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new OptInCommand().register();
