/**
 * External Action Status Command
 *
 * Admin command to check status of WebSocket connections to external services.
 * Shows connection status, message counts, and error history.
 *
 * Usage:
 *   /external-action-status [service]
 *   !external-action-status xtoys
 */

const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendSuccess } = require('../../utils/helpers/response-helpers');
const WebSocketService = require('../../services/WebSocketService');

const { data, options } = buildCommandOptions(
  'external-action-status',
  'Check status of external WebSocket connections',
  [
    {
      name: 'service',
      type: 'string',
      required: false,
      description: 'Specific service name (omit to show all)',
    },
  ]
);

class ExternalActionStatusCommand extends Command {
  constructor() {
    super({
      name: 'external-action-status',
      description: 'Check status of external WebSocket connections',
      category: 'admin',
      permissions: ['ADMINISTRATOR'],
      data,
      options,
    });
  }

  async execute(message, args) {
    const serviceName = args[0];
    const status = this._getStatusEmbed(serviceName);
    await sendSuccess(message, status);
  }

  async executeInteraction(interaction) {
    const serviceName = interaction.options.getString('service');
    const status = this._getStatusEmbed(serviceName);
    await sendSuccess(interaction, status);
  }

  /**
   * Generate status embed
   * @private
   * @param {string} [serviceName] - Optional specific service
   * @returns {string|Object} Status message or embed
   */
  _getStatusEmbed(serviceName) {
    const status = WebSocketService.getStatus(serviceName);

    if (serviceName) {
      // Single service status
      if (!status || status.connected === undefined) {
        return {
          title: '❌ Service Not Found',
          description: `No WebSocket connection found for: **${serviceName}**`,
          color: 0xff6b6b,
          fields: [],
        };
      }

      return {
        title: `📡 WebSocket Status: ${serviceName}`,
        description: status.connected ? '✅ Connected' : '❌ Disconnected',
        color: status.connected ? 0x51cf66 : 0xff6b6b,
        fields: [
          {
            name: 'Webhook URL',
            value: this._maskUrl(status.webhookUrl),
            inline: false,
          },
          {
            name: 'Status',
            value: status.connected ? '✅ **Connected**' : '❌ **Disconnected**',
            inline: true,
          },
          {
            name: 'Messages Received',
            value: String(status.messageCount || 0),
            inline: true,
          },
          {
            name: 'Errors',
            value: String(status.errorCount || 0),
            inline: true,
          },
          {
            name: 'Allowed Actions',
            value: status.allowedActions.length > 0 ? `\`${status.allowedActions.join('`, `')}\`` : '*None configured*',
            inline: false,
          },
        ],
        footer: {
          text: `Last updated: ${new Date().toISOString()}`,
        },
      };
    }

    // All services status
    const connectedServices = WebSocketService.getConnectedServices();
    const allServices = Object.keys(status);

    if (allServices.length === 0) {
      return {
        title: '📡 External WebSocket Services',
        description: 'No external services configured',
        color: 0xffa500,
        fields: [
          {
            name: 'Configuration',
            value: 'Configure services in `src/config/external-actions.js`',
            inline: false,
          },
        ],
      };
    }

    const serviceFields = allServices.map((name) => {
      const connected = connectedServices.includes(name);
      const svc = status[name];
      return {
        name: `${connected ? '✅' : '❌'} ${name}`,
        value: `Messages: **${svc.messageCount}** | Errors: **${svc.errorCount}**`,
        inline: true,
      };
    });

    return {
      title: '📡 External WebSocket Services',
      description: `**${connectedServices.length}** of **${allServices.length}** connected`,
      color: connectedServices.length > 0 ? 0x51cf66 : 0xff6b6b,
      fields: [
        {
          name: 'Connected Services',
          value: connectedServices.length > 0 ? connectedServices.map((s) => `\`${s}\``).join(', ') : '*None*',
          inline: false,
        },
        ...serviceFields,
      ],
      footer: {
        text: 'Run /external-action-status <service> for details',
      },
    };
  }

  /**
   * Mask webhook URL for security
   * @private
   * @param {string} url - Full URL
   * @returns {string} Masked URL
   */
  _maskUrl(url) {
    if (!url) return '*(not configured)*';
    const parts = url.split('/');
    const webhookId = parts[parts.length - 1];
    const tail = webhookId.substring(Math.max(0, webhookId.length - 8));
    return `\`wss://webhook.../..${tail}\``;
  }
}

module.exports = new ExternalActionStatusCommand().register();
