/**
 * Whisper Command
 * Admin command to send direct messages to users or entire roles
 */

const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const RolePermissionService = require('../../services/RolePermissionService');
const { sendSuccess, sendError } = require('../../utils/helpers/response-helpers');
const { checkAdminPermission } = require('../../utils/proxy-helpers');
const CommunicationService = require('../../services/CommunicationService');

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
    super({
      name: 'whisper',
      description: 'Send DMs from the bot to users or roles (Admin only)',
      data,
      options,
      permissions: {
        minTier: 3,      // Administrator tier
        visible: false   // Hidden from non-admins
      }
    });
  }

  async execute(message, _args) {
    await sendError(message, 'This command is only available as a slash command. Use `/whisper`', true);
  }

  async resolveUsers(interaction, target) {
    if (target.startsWith('role:')) {
      return this.resolveRoleUsers(interaction, target);
    }
    return this.resolveIndividualUser(interaction, target);
  }

  async resolveRoleUsers(interaction, target) {
    const roleId = target.substring(5);
    const role = await interaction.guild.roles.fetch(roleId);

    if (!role) {
      return { users: [], error: `${target} (role not found)` };
    }

    const members = await interaction.guild.members.fetch();
    const users = members.filter(m => m.roles.has(roleId)).map(m => m.user);

    if (users.length === 0) {
      return { users: [], error: `${target} (no members in role)` };
    }

    return { users, error: null };
  }

  async resolveIndividualUser(interaction, target) {
    try {
      // Handle mention format: <@123456>
      const mentionMatch = target.match(/<@!?(\d+)>/);
      if (mentionMatch) {
        const userId = mentionMatch[1];
        try {
          const user = await interaction.client.users.fetch(userId);
          return { users: [user], error: null };
        } catch {
          return { users: [], error: `${target} (user not found)` };
        }
      }

      // Try direct snowflake ID first
      if (/^\d+$/.test(target)) {
        try {
          const user = await interaction.client.users.fetch(target);
          return { users: [user], error: null };
        } catch {
          return { users: [], error: `${target} (user not found)` };
        }
      }

      // Try to resolve by username from guild members
      try {
        const members = await interaction.guild.members.fetch();
        const member = members.find(m =>
          m.user.username === target ||
          m.user.tag === target ||
          m.displayName === target ||
          m.nickname === target
        );

        if (member) {
          return { users: [member.user], error: null };
        }
      } catch {
        // Continue to next attempt
      }

      // If nothing worked, return error
      return { users: [], error: `${target} (user not found)` };
    } catch (err) {
      return { users: [], error: `${target} (${err.message})` };
    }
  }

  async sendDMToUsers(users, messageContent, results) {
    for (const user of users) {
      try {
        // Check if user has opted in to receive DMs
        const optedIn = await CommunicationService.isOptedIn(user.id);
        if (!optedIn) {
          results.failed.push(`${user.username} (opted out of DMs)`);
          continue;
        }

        await user.send(messageContent);
        if (!results.success.includes(user.id)) {
          results.success.push(user.username);
        }
      } catch (err) {
        results.failed.push(`${user.username} (${err.message})`);
      }
    }
  }

  async executeInteraction(interaction) {
    // Check role-based permission
    const permissionCheck = await this.checkPermission(
      {
        userId: interaction.user.id,
        guildId: interaction.guildId,
        commandName: 'whisper'
      },
      interaction.client
    );

    if (!permissionCheck.allowed) {
      return sendError(interaction, `Permission denied: ${permissionCheck.reason}`, true);
    }

    // Defer the interaction immediately to avoid timeout (3 second Discord limit)
    await interaction.deferReply({ flags: 64 });

    try {

      const targetsInput = interaction.options.getString('targets');
      const messageContent = interaction.options.getString('message');
      const targetList = targetsInput.split(',').map(t => t.trim());

      const results = { success: [], failed: [] };

      for (const target of targetList) {
        try {
          const { users, error } = await this.resolveUsers(interaction, target);
          if (error) {
            results.failed.push(error);
            continue;
          }
          await this.sendDMToUsers(users, messageContent, results);
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
