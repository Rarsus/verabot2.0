/**
 * Whisper Command
 * Admin command to send direct messages to users or entire roles
 */

const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendSuccess, sendError } = require('../../utils/helpers/response-helpers');
const { checkAdminPermission } = require('../../utils/proxy-helpers');

const { data, options } = buildCommandOptions(
  'whisper',
  'Send a direct message from the bot to users or roles (Admin only)',
  [
    {
      name: 'targets',
      type: 'string',
      required: true,
      description: 'User IDs or Role IDs (prefix roles with "role:", comma-separated)'
    },
    {
      name: 'message',
      type: 'string',
      required: true,
      description: 'Message to send',
      maxLength: 2000
    }
  ]
);

class WhisperCommand extends Command {
  constructor() {
    super({ name: 'whisper', description: 'Send DMs from the bot to users or roles (Admin only)', data, options });
  }

  async execute(message, _args) {
    await sendError(message, 'This command is only available as a slash command. Use `/whisper`', true);
  }

  async executeInteraction(interaction) {
    try {
      // Check admin permission
      const isAdmin = checkAdminPermission(interaction);
      if (!isAdmin) {
        return sendError(interaction, 'You need admin permissions to use this command', true);
      }

      const targetsInput = interaction.options.getString('targets');
      const messageContent = interaction.options.getString('message');

      const targetList = targetsInput.split(',').map(t => t.trim());
      const results = {
        success: [],
        failed: []
      };

      for (const target of targetList) {
        try {
          let users = [];

          if (target.startsWith('role:')) {
            // Handle role targets
            const roleId = target.substring(5);
            const role = await interaction.guild.roles.fetch(roleId);

            if (!role) {
              results.failed.push(`${target} (role not found)`);
              continue;
            }

            // Get all members with this role
            const members = await interaction.guild.members.fetch();
            users = members.filter(m => m.roles.has(roleId)).map(m => m.user);

            if (users.length === 0) {
              results.failed.push(`${target} (no members in role)`);
              continue;
            }
          } else {
            // Handle user targets
            try {
              const user = await interaction.client.users.fetch(target);
              users = [user];
            } catch {
              results.failed.push(`${target} (user not found)`);
              continue;
            }
          }

          // Send DM to each user
          for (const user of users) {
            try {
              await user.send(messageContent);
              if (!results.success.includes(user.id)) {
                results.success.push(user.username);
              }
            } catch (err) {
              results.failed.push(`${user.username} (${err.message})`);
            }
          }
        } catch (err) {
          results.failed.push(`${target} (${err.message})`);
        }
      }

      const successCount = results.success.length;
      const failedCount = results.failed.length;

      let resultMessage = `✅ Message sent to ${successCount} recipient(s)`;
      if (failedCount > 0) {
        resultMessage += `\n⚠️ Failed for ${failedCount} target(s)`;
        if (failedCount <= 5) {
          resultMessage += `:\n${results.failed.map(f => `  • ${f}`).join('\n')}`;
        }
      }

      return sendSuccess(interaction, resultMessage);
    } catch (err) {
      console.error('Whisper command error:', err);
      return sendError(interaction, `Failed to send whisper: ${err.message}`, true);
    }
  }
}

module.exports = new WhisperCommand().register();
