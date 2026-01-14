/**
 * Proxy Enable/Disable Command
 * Admin command to enable or disable the webhook proxy
 */

const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendSuccess, sendError } = require('../../utils/helpers/response-helpers');
const { checkAdminPermission } = require('../../utils/proxy-helpers');
const GlobalProxyConfigService = require('../../services/GlobalProxyConfigService');

// Define command options
const { data, options } = buildCommandOptions('proxy-enable', 'Enable or disable the webhook proxy (Admin only)', [
  {
    name: 'enabled',
    type: 'boolean',
    required: true,
    description: 'Enable (true) or disable (false) the proxy',
  },
]);

class ProxyEnableCommand extends Command {
  constructor() {
    super({
      name: 'proxy-enable',
      description: 'Enable or disable the webhook proxy',
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

    await message.channel.send('⚙️ Please use the slash command `/proxy-enable` to enable/disable the proxy.');
  }

  async executeInteraction(interaction) {
    // Check admin permission
    if (!checkAdminPermission(interaction)) {
      await sendError(interaction, 'This command requires Administrator permissions.', true);
      return;
    }

    const enabled = interaction.options.getBoolean('enabled');

    try {
      await GlobalProxyConfigService.setProxyEnabled(enabled);

      const status = enabled ? 'enabled' : 'disabled';
      const emoji = enabled ? '✅' : '⏸️';

      await sendSuccess(interaction, `${emoji} Webhook proxy ${status}.`, true);
    } catch (err) {
      await sendError(interaction, `Failed to update proxy status: ${err.message}`, true);
    }
  }
}

module.exports = new ProxyEnableCommand().register();
