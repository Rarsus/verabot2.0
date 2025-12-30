/**
 * Broadcast Command
 * Admin command to send messages to multiple channels
 */

const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendSuccess, sendError } = require('../../utils/helpers/response-helpers');
const { checkAdminPermission } = require('../../utils/proxy-helpers');

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
      description: 'Comma-separated channel IDs (e.g., "123,456,789")'
    }
  ]
);

class BroadcastCommand extends Command {
  constructor() {
    super({ name: 'broadcast', description: 'Broadcast a message to multiple channels (Admin only)', data, options });
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
      const channelIds = interaction.options.getString('channels').split(',').map(id => id.trim());

      if (channelIds.length === 0) {
        return sendError(interaction, 'No valid channel IDs provided', true);
      }

      const results = {
        success: [],
        failed: []
      };

      for (const channelId of channelIds) {
        try {
          const channel = await interaction.client.channels.fetch(channelId);

          if (!channel || !channel.isTextBased()) {
            results.failed.push(`${channelId} (not a text channel)`);
            continue;
          }

          // Check bot permissions
          if (channel.guild && !channel.permissionsFor(interaction.client.user).has('SendMessages')) {
            results.failed.push(`${channelId} (no send permission)`);
            continue;
          }

          await channel.send(messageContent);
          results.success.push(channelId);
        } catch (err) {
          results.failed.push(`${channelId} (${err.message})`);
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
