const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendOptInStatus } = require('../../utils/helpers/response-helpers');
const CommunicationService = require('../../services/CommunicationService');

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
        visible: true
      }
    });
  }

  async execute(message, _args) {
    try {
      const status = await CommunicationService.getStatus(message.author.id);
      await sendOptInStatus(message, status.opted_in, status.updated_at);
    } catch (err) {
      throw err;
    }
  }

  async executeInteraction(interaction) {
    // Defer the interaction immediately to avoid timeout (3 second Discord limit)
    await interaction.deferReply();

    try {
      const status = await CommunicationService.getStatus(interaction.user.id);
      await sendOptInStatus(interaction, status.opted_in, status.updated_at);
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new CommStatusCommand().register();
