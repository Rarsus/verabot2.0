/**
 * Say Command
 * Admin command to make the bot say something in a channel
 */

const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendSuccess, sendError } = require('../../utils/helpers/response-helpers');
const { checkAdminPermission } = require('../../utils/proxy-helpers');

const { data, options } = buildCommandOptions(
  'say',
  'Make the bot send a message in a channel (Admin only)',
  [
    {
      name: 'channel',
      type: 'string',
      required: true,
      description: 'Channel ID where the bot should send the message'
    },
    {
      name: 'message',
      type: 'string',
      required: true,
      description: 'Message content to send',
      maxLength: 2000
    }
  ]
);

class SayCommand extends Command {
  constructor() {
    super({ name: 'say', description: 'Make the bot say something in a channel (Admin only)', data, options });
  }

  async execute(message, _args) {
    await sendError(message, 'This command is only available as a slash command. Use `/say`', true);
  }

  async executeInteraction(interaction) {
    try {
      // Check admin permission
      const isAdmin = checkAdminPermission(interaction);
      if (!isAdmin) {
        return sendError(interaction, 'You need admin permissions to use this command', true);
      }

      const channelId = interaction.options.getString('channel');
      const messageContent = interaction.options.getString('message');

      // Fetch the channel
      let channel;
      try {
        channel = await interaction.client.channels.fetch(channelId);
      } catch {
        return sendError(interaction, `Could not find channel with ID: ${channelId}`, true);
      }

      if (!channel || !channel.isTextBased()) {
        return sendError(interaction, 'That is not a text channel', true);
      }

      // Check bot permissions
      if (channel.guild && !channel.permissionsFor(interaction.client.user).has('SendMessages')) {
        return sendError(interaction, 'I don\'t have permission to send messages in that channel', true);
      }

      // Send the message
      const sentMessage = await channel.send(messageContent);

      return sendSuccess(interaction, `✅ Message sent in ${channel.toString()}\n[Message ID: ${sentMessage.id}]`);
    } catch (err) {
      console.error('Say command error:', err);
      return sendError(interaction, `Failed to send message: ${err.message}`, true);
    }
  }
}

module.exports = new SayCommand().register();
