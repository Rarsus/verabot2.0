const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendOptInStatus } = require('../../utils/helpers/response-helpers');
const { getStatus } = require('../../services/GuildAwareCommunicationService');

const { data, options } = buildCommandOptions('comm-status', 'Check your current communication opt-in status');

class CommStatusCommand extends Command {
  constructor() {
    super({
      name: 'comm-status',
      description: 'Check your current communication opt-in status',
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
      const status = await getStatus(guildId, message.author.id);
      await sendOptInStatus(message, status.opted_in, status.updated_at);
    } catch (err) {
      throw err;
    }
  }

  async executeInteraction(interaction) {
    // Defer the interaction immediately to avoid timeout (3 second Discord limit)
    await interaction.deferReply();

    try {
      const guildId = interaction.guildId;
      const status = await getStatus(guildId, interaction.user.id);
      await sendOptInStatus(interaction, status.opted_in, status.updated_at);
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new CommStatusCommand().register();
