/**
 * Proxy Configuration Command
 * Admin command to configure webhook proxy settings
 */

const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendSuccess, sendError } = require('../../utils/helpers/response-helpers');
const { checkAdminPermission, validateWebhookUrl, validateChannelId } = require('../../utils/proxy-helpers');
const GlobalProxyConfigService = require('../../services/GlobalProxyConfigService');

// Define command options
const { data, options } = buildCommandOptions('proxy-config', 'Configure webhook proxy settings (Admin only)', [
  {
    name: 'webhook-url',
    type: 'string',
    required: false,
    description: 'Webhook URL to forward messages to',
  },
  {
    name: 'webhook-token',
    type: 'string',
    required: false,
    description: 'Authentication token for webhook',
  },
  {
    name: 'webhook-secret',
    type: 'string',
    required: false,
    description: 'Secret for incoming webhook signature verification',
  },
  {
    name: 'add-channel',
    type: 'string',
    required: false,
    description: 'Add a channel ID to monitor',
  },
  {
    name: 'remove-channel',
    type: 'string',
    required: false,
    description: 'Remove a channel ID from monitoring',
  },
  {
    name: 'clear-channels',
    type: 'boolean',
    required: false,
    description: 'Clear all monitored channels',
  },
]);

class ProxyConfigCommand extends Command {
  constructor() {
    super({
      name: 'proxy-config',
      description: 'Configure webhook proxy settings',
      data,
      options,
      permissions: {
        minTier: 3,
        visible: false,
      },
    });
  }

  async execute(message, _args) {
    // Check admin permission
    if (!message.member?.permissions?.has?.('Administrator')) {
      await message.channel.send('❌ This command requires Administrator permissions.');
      return;
    }

    await message.channel.send('⚙️ Please use the slash command `/proxy-config` for configuration.');
  }

  async executeInteraction(interaction) {
    // Check admin permission
    if (!checkAdminPermission(interaction)) {
      await sendError(interaction, 'This command requires Administrator permissions.', true);
      return;
    }

    // Get options
    const webhookUrl = interaction.options.getString('webhook-url');
    const webhookToken = interaction.options.getString('webhook-token');
    const webhookSecret = interaction.options.getString('webhook-secret');
    const addChannel = interaction.options.getString('add-channel');
    const removeChannel = interaction.options.getString('remove-channel');
    const clearChannels = interaction.options.getBoolean('clear-channels');

    const updates = [];

    try {
      // Update webhook URL
      if (webhookUrl) {
        const validation = validateWebhookUrl(webhookUrl);
        if (!validation.valid) {
          await sendError(interaction, `Invalid webhook URL: ${validation.error}`, true);
          return;
        }

        await GlobalProxyConfigService.setWebhookUrl(webhookUrl);
        updates.push('Webhook URL updated');
      }

      // Update webhook token
      if (webhookToken) {
        await GlobalProxyConfigService.setWebhookToken(webhookToken);
        updates.push('Webhook token updated (encrypted)');
      }

      // Update webhook secret
      if (webhookSecret) {
        await GlobalProxyConfigService.setWebhookSecret(webhookSecret);
        updates.push('Webhook secret updated (encrypted)');
      }

      // Add channel to monitoring
      if (addChannel) {
        if (!validateChannelId(addChannel)) {
          await sendError(interaction, 'Invalid channel ID format.', true);
          return;
        }

        const channels = await GlobalProxyConfigService.getMonitoredChannels();
        if (!channels.includes(addChannel)) {
          channels.push(addChannel);
          await GlobalProxyConfigService.setMonitoredChannels(channels);
          updates.push(`Added channel <#${addChannel}> to monitoring`);
        } else {
          updates.push(`Channel <#${addChannel}> is already monitored`);
        }
      }

      // Remove channel from monitoring
      if (removeChannel) {
        const channels = await GlobalProxyConfigService.getMonitoredChannels();
        const filtered = channels.filter((ch) => ch !== removeChannel);

        if (filtered.length < channels.length) {
          await GlobalProxyConfigService.setMonitoredChannels(filtered);
          updates.push(`Removed channel <#${removeChannel}> from monitoring`);
        } else {
          updates.push(`Channel <#${removeChannel}> was not monitored`);
        }
      }

      // Clear all channels
      if (clearChannels) {
        await GlobalProxyConfigService.setMonitoredChannels([]);
        updates.push('Cleared all monitored channels');
      }

      // Send response
      if (updates.length === 0) {
        await sendError(interaction, 'No configuration changes specified.', true);
        return;
      }

      await sendSuccess(interaction, `Configuration updated:\n${updates.map((u) => `• ${u}`).join('\n')}`, true);
    } catch (err) {
      await sendError(interaction, `Failed to update configuration: ${err.message}`, true);
    }
  }
}

module.exports = new ProxyConfigCommand().register();
