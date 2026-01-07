/**
 * External Action Send Command
 *
 * Admin command to send approved actions to external WebSocket services.
 * Only preconfigured actions can be sent.
 *
 * Usage:
 *   /external-action-send service:xtoys action:notification message:"Hello!"
 *   !external-action-send xtoys notification message="Server maintenance"
 */

const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendSuccess, sendError } = require('../../utils/helpers/response-helpers');
const WebSocketService = require('../../services/WebSocketService');
const externalActionsConfig = require('../../config/external-actions');

const { data, options } = buildCommandOptions('external-action-send', 'Send approved action to external service', [
  {
    name: 'service',
    type: 'string',
    required: true,
    description: 'Target service name',
  },
  {
    name: 'action',
    type: 'string',
    required: true,
    description: 'Action to send (must be approved)',
  },
  {
    name: 'data',
    type: 'string',
    required: false,
    description: 'JSON payload (optional)',
  },
]);

class ExternalActionSendCommand extends Command {
  constructor() {
    super({
      name: 'external-action-send',
      description: 'Send approved action to external service',
      category: 'admin',
      permissions: ['ADMINISTRATOR'],
      data,
      options,
    });
  }

  async execute(message, args) {
    const serviceName = args[0];
    const actionName = args[1];
    const dataStr = args.slice(2).join(' ');

    await this._handleSend(message, serviceName, actionName, dataStr);
  }

  async executeInteraction(interaction) {
    const serviceName = interaction.options.getString('service');
    const actionName = interaction.options.getString('action');
    const dataStr = interaction.options.getString('data');

    await this._handleSend(interaction, serviceName, actionName, dataStr);
  }

  /**
   * Handle send action
   * @private
   */
  async _handleSend(target, serviceName, actionName, dataStr) {
    // Validate service exists and is enabled
    if (!externalActionsConfig[serviceName]) {
      return sendError(
        target,
        `Unknown service: \`${serviceName}\`\n\nRun \`/external-action-status\` to see available services.`,
        true
      );
    }

    const serviceConfig = externalActionsConfig[serviceName];
    if (!serviceConfig.enabled) {
      return sendError(target, `Service is disabled: \`${serviceName}\``, true);
    }

    // Validate action is approved
    if (!serviceConfig.allowedActions.includes(actionName)) {
      return sendError(
        target,
        `Action not approved for \`${serviceName}\`\n\nAllowed actions:\n${serviceConfig.allowedActions.map((a) => `• \`${a}\``).join('\n')}`,
        true
      );
    }

    // Validate service is connected
    if (!WebSocketService.isConnected(serviceName)) {
      return sendError(
        target,
        `Service not connected: \`${serviceName}\`\n\nUnable to send action at this time.`,
        true
      );
    }

    // Parse optional JSON payload
    let payload = { action: actionName };
    if (dataStr) {
      try {
        const customData = JSON.parse(dataStr);
        payload = { ...payload, ...customData };
      } catch (err) {
        return sendError(
          target,
          `Invalid JSON payload: ${err.message}\n\nExample: \`{"message":"test","level":"info"}\``,
          true
        );
      }
    }

    // Send action
    const success = WebSocketService.send(serviceName, payload);
    if (!success) {
      return sendError(
        target,
        `Failed to send action to \`${serviceName}\`\n\nPlease try again or contact an admin.`,
        true
      );
    }

    await sendSuccess(target, {
      title: '✅ Action Sent',
      description: `Successfully sent **${actionName}** to **${serviceName}**`,
      color: 0x51cf66,
      fields: [
        {
          name: 'Service',
          value: `\`${serviceName}\``,
          inline: true,
        },
        {
          name: 'Action',
          value: `\`${actionName}\``,
          inline: true,
        },
        {
          name: 'Payload',
          value: `\`\`\`json\n${JSON.stringify(payload, null, 2)}\n\`\`\``,
          inline: false,
        },
      ],
    });
  }
}

module.exports = new ExternalActionSendCommand().register();
