const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendSuccess, sendOptInRequest } = require('../../utils/helpers/response-helpers');

const { data, options } = buildCommandOptions('opt-in-request', 'Request a user to opt in to DM notifications', [
  { name: 'user', type: 'user', description: 'User to request opt-in from', required: true },
  { name: 'reason', type: 'string', description: 'Why you\'re requesting (optional)', required: false, maxLength: 100 }
]);

class OptInRequestCommand extends Command {
  constructor() {
    super({ name: 'opt-in-request', description: 'Request a user to opt in to DM notifications', data, options });
  }

  async execute(message, _args) {
    await message.reply('❌ This command is only available as a slash command. Use `/opt-in-request`');
  }

  async executeInteraction(interaction) {
    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');

    // Prevent self-requests
    if (targetUser.id === interaction.user.id) {
      throw new Error('You cannot request opt-in from yourself.');
    }

    // Prevent requesting from bots
    if (targetUser.bot) {
      throw new Error('You cannot request opt-in from a bot.');
    }

    try {
      // Send opt-in request message to the target user
      await sendOptInRequest(
        targetUser,
        interaction.user.username,
        reason || 'No reason provided'
      );

      await sendSuccess(
        interaction,
        `✅ Sent opt-in request to ${targetUser.username}. They can respond with \`/opt-in\`.`
      );
    } catch (error) {
      // If DMs are disabled, show helpful error
      if (error.code === 50007) { // Cannot send messages to this user
        throw new Error(`Cannot send opt-in request to ${targetUser.username} - they may have DMs disabled.`);
      }
      throw error;
    }
  }
}

module.exports = new OptInRequestCommand().register();
