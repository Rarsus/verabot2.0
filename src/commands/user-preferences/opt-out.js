const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendOptOutSuccess } = require('../../utils/helpers/response-helpers');
const CommunicationService = require('../../services/CommunicationService');

const { data, options } = buildCommandOptions('opt-out', 'Opt out of receiving direct messages from VeraBot');

class OptOutCommand extends Command {
  constructor() {
    super({ name: 'opt-out', description: 'Opt out of receiving direct messages from VeraBot', data, options });
  }

  async execute(message, _args) {
    try {
      await CommunicationService.optOut(message.author.id);
      await sendOptOutSuccess(message);
    } catch (err) {
      throw err;
    }
  }

  async executeInteraction(interaction) {
    try {
      await CommunicationService.optOut(interaction.user.id);
      await sendOptOutSuccess(interaction);
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new OptOutCommand().register();
