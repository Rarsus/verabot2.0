/**
 * Broadcast Command
 * Admin command to send messages to multiple channels
 */

const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendSuccess, sendError } = require('../../utils/helpers/response-helpers');
const { checkAdminPermission } = require('../../utils/proxy-helpers');
const { resolveChannel } = require('../../utils/helpers/resolution-helpers');

const { data, options } = buildCommandOptions(
  'broadcast',
  'Broadcast a message to multiple channels (Admin only)',
  [
    {
      name: 'message',
      type: 'string',
      required: true,
      description: 'Message content to broadcast',
      maxLength: 2000
    },
    {
      name: 'channels',
      type: 'string',
      required: true,
      description: 'Channel names, IDs, or mentions (comma-separated)'
    }
  ]
);

class BroadcastCommand extends Command {
  constructor() {
    super({
      name: 'broadcast',
      description: 'Broadcast a message to multiple channels',
      data,
      options,
      permissions: {
        minTier: 3,
        visible: false
      }
    });
  }

  async execute(message, _args) {
    await sendError(message, 'This command is only available as a slash command. Use `/broadcast`', true);
  }

  async executeInteraction(interaction) {
    try {
      // Check admin permission
      const isAdmin = checkAdminPermission(interaction);
      if (!isAdmin) {
        return sendError(interaction, 'You need admin permissions to use this command', true);
      }

      const messageContent = interaction.options.getString('message');
      const channelInputs = interaction.options.getString('channels').split(',').map(id => id.trim());

      if (channelInputs.length === 0) {
        return sendError(interaction, 'No valid channel identifiers provided', true);
      }

      const results = {
        success: [],
        failed: []
      };

      for (const channelInput of channelInputs) {
        try {
          // Use resolution helper to find channel by name, ID, or mention
          const channel = await resolveChannel(channelInput, interaction.guild);

          if (!channel) {
            results.failed.push(`${channelInput} (channel not found)`);
            continue;
          }

          if (!channel.isTextBased()) {
            results.failed.push(`${channel.name} (not a text channel)`);
            continue;
          }

          // Check bot permissions
          if (channel.guild && !channel.permissionsFor(interaction.client.user).has('SendMessages')) {
            results.failed.push(`${channel.name} (no send permission)`);
            continue;
          }

          await channel.send(messageContent);
          results.success.push(channel.name || channelInput);
        } catch (err) {
          results.failed.push(`${channelInput} (${err.message})`);
        }
      }

      const successCount = results.success.length;
      const failedCount = results.failed.length;

      let resultMessage = `✅ Broadcast sent to ${successCount} channel(s)`;
      if (failedCount > 0) {
        resultMessage += `\n❌ Failed to send to ${failedCount} channel(s)`;
        if (failedCount <= 5) {
          resultMessage += `:\n${results.failed.map(f => `  • ${f}`).join('\n')}`;
        }
      }

      return sendSuccess(interaction, resultMessage);
    } catch (err) {
      console.error('Broadcast command error:', err);
      return sendError(interaction, `Failed to broadcast message: ${err.message}`, true);
    }
  }
}

module.exports = new BroadcastCommand().register();
