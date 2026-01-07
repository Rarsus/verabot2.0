/**
 * Proxy Status Command
 * Admin command to view current proxy configuration and status
 */

const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { EmbedBuilder } = require('discord.js');
const { sendError } = require('../../utils/helpers/response-helpers');
const { checkAdminPermission } = require('../../utils/proxy-helpers');
const ProxyConfigService = require('../../services/ProxyConfigService');
const database = require('../../services/DatabaseService');

// Create proxy config service instance
const proxyConfig = new ProxyConfigService(database);

// Define command options
const { data, options } = buildCommandOptions(
  'proxy-status',
  'View webhook proxy configuration and status (Admin only)',
  []
);

class ProxyStatusCommand extends Command {
  constructor() {
    super({
      name: 'proxy-status',
      description: 'View webhook proxy configuration and status',
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

    await message.channel.send('⚙️ Please use the slash command `/proxy-status` to view the status.');
  }

  async executeInteraction(interaction) {
    // Check admin permission
    if (!checkAdminPermission(interaction)) {
      await sendError(interaction, 'This command requires Administrator permissions.', true);
      return;
    }

    try {
      const config = await proxyConfig.getAllConfig();

      const embed = new EmbedBuilder()
        .setTitle('🔗 Webhook Proxy Status')
        .setColor(config.enabled ? 0x00ff00 : 0xff0000)
        .addFields(
          {
            name: 'Status',
            value: config.enabled ? '✅ Enabled' : '⏸️ Disabled',
            inline: true,
          },
          {
            name: 'Webhook URL',
            value: config.webhookUrl || '❌ Not configured',
            inline: false,
          },
          {
            name: 'Authentication',
            value: config.hasToken ? '✅ Token configured' : '❌ No token',
            inline: true,
          },
          {
            name: 'Signature Verification',
            value: config.hasSecret ? '✅ Secret configured' : '❌ No secret',
            inline: true,
          },
          {
            name: 'Monitored Channels',
            value:
              config.monitoredChannels.length > 0
                ? config.monitoredChannels.map((ch) => `<#${ch}>`).join(', ')
                : '❌ No channels configured',
            inline: false,
          }
        )
        .setFooter({ text: 'Use /proxy-config to modify settings' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], flags: 64 });
    } catch (err) {
      await sendError(interaction, `Failed to retrieve status: ${err.message}`, true);
    }
  }
}

module.exports = new ProxyStatusCommand().register();
