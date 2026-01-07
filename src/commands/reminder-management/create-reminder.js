const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendSuccess, sendOptInDecisionPrompt } = require('../../utils/helpers/response-helpers');
const { createReminder, addReminderAssignment } = require('../../services/GuildAwareReminderService');
const { isOptedIn } = require('../../services/GuildAwareCommunicationService');

const { data, options } = buildCommandOptions('create-reminder', 'Create a new reminder', [
  {
    name: 'subject',
    type: 'string',
    description: 'Reminder subject/title',
    required: true,
    minLength: 3,
    maxLength: 200,
  },
  { name: 'category', type: 'string', description: 'Reminder category', required: true, maxLength: 50 },
  {
    name: 'when',
    type: 'string',
    description: 'When: "1 day", "tomorrow", "3:30 PM", "2025-12-31", "tomorrow at 3 PM"',
    required: true,
  },
  { name: 'who', type: 'string', description: 'User ID or Role ID (prefix role with "role:")', required: true },
  { name: 'content', type: 'string', description: 'Detailed description (optional)', required: false, maxLength: 2000 },
  { name: 'link', type: 'string', description: 'Associated URL (optional)', required: false },
  { name: 'image', type: 'string', description: 'Image URL (optional)', required: false },
]);

class CreateReminderCommand extends Command {
  constructor() {
    super({
      name: 'create-reminder',
      description: 'Create a new reminder',
      data,
      options,
      permissions: {
        minTier: 1,
        visible: true,
      },
    });
  }

  async execute(message, _args) {
    await message.reply('❌ This command is only available as a slash command. Use `/create-reminder`');
  }

  async executeInteraction(interaction) {
    // Defer the interaction immediately to avoid timeout (3 second Discord limit)
    await interaction.deferReply();

    const guildId = interaction.guildId;
    const subject = interaction.options.getString('subject');
    const category = interaction.options.getString('category');
    const when = interaction.options.getString('when');
    const who = interaction.options.getString('who');
    const content = interaction.options.getString('content');
    const link = interaction.options.getString('link');
    const image = interaction.options.getString('image');

    // Parse assignee (format: "role:123456" or "123456" for user, or mention format)
    let assigneeType = 'user';
    let assigneeId = who;

    if (who.startsWith('role:')) {
      assigneeType = 'role';
      assigneeId = who.substring(5);
    }

    // Extract snowflake ID from mention format (<@123456> or <@&123456>)
    const mentionMatch = assigneeId.match(/<@!?&?(\d+)>/);
    if (mentionMatch) {
      assigneeId = mentionMatch[1];
      // Detect if this was a role mention (<@&...>)
      if (who.includes('<@&')) {
        assigneeType = 'role';
      }
    }

    // Validate snowflake format (must be numeric)
    if (!/^\d+$/.test(assigneeId)) {
      throw new Error('Invalid ID format. Must be a numeric snowflake ID or valid mention format.');
    }

    // Check opt-in status for user assignments
    let optedIn = true;
    let recipient = null;

    if (assigneeType === 'user') {
      try {
        optedIn = await isOptedIn(guildId, assigneeId);
        // Fetch user info for decision prompt
        recipient = await interaction.client.users.fetch(assigneeId);
      } catch {
        // If user not found or other error, proceed with creating reminder
        // The system will handle delivery failure gracefully
      }
    }

    // If user is opted out and this is a DM-based notification, show decision prompt
    if (assigneeType === 'user' && !optedIn && recipient) {
      // Create reminder first, then show decision buttons
      const reminderId = await createReminder(guildId, {
        subject,
        category,
        when,
        content,
        link,
        image,
        notification_method: 'dm', // Default, user will choose
      });

      // Add assignment
      await addReminderAssignment(guildId, reminderId, assigneeType, assigneeId);

      // Store reminder context for button handlers
      interaction.client.reminderContexts = interaction.client.reminderContexts || {};
      interaction.client.reminderContexts[`${Date.now()}`] = {
        reminderId,
        subject,
        recipientId: assigneeId,
        recipient,
      };

      // Show decision prompt
      await sendOptInDecisionPrompt(interaction, recipient, subject);
    } else {
      // User opted in or this is a role-based reminder, create normally
      const reminderId = await createReminder(guildId, {
        subject,
        category,
        when,
        content,
        link,
        image,
      });

      // Add assignment
      await addReminderAssignment(guildId, reminderId, assigneeType, assigneeId);

      if (assigneeType === 'user') {
        await sendSuccess(interaction, `Reminder #${reminderId} created successfully for <@${assigneeId}>!`);
      } else {
        await sendSuccess(interaction, `Reminder #${reminderId} created successfully for role <@&${assigneeId}>!`);
      }
    }
  }
}

module.exports = new CreateReminderCommand().register();
