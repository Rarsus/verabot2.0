const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendSuccess } = require('../../utils/helpers/response-helpers');
const { createReminder, addReminderAssignment } = require('../../services/ReminderService');

const { data, options } = buildCommandOptions('create-reminder', 'Create a new reminder', [
  { name: 'subject', type: 'string', description: 'Reminder subject/title', required: true, minLength: 3, maxLength: 200 },
  { name: 'category', type: 'string', description: 'Reminder category', required: true, maxLength: 50 },
  { name: 'when', type: 'string', description: 'When the reminder is for (ISO date or natural)', required: true },
  { name: 'who', type: 'string', description: 'User ID or Role ID (prefix role with "role:")', required: true },
  { name: 'content', type: 'string', description: 'Detailed description (optional)', required: false, maxLength: 2000 },
  { name: 'link', type: 'string', description: 'Associated URL (optional)', required: false },
  { name: 'image', type: 'string', description: 'Image URL (optional)', required: false }
]);

class CreateReminderCommand extends Command {
  constructor() {
    super({ name: 'create-reminder', description: 'Create a new reminder', data, options });
  }

  async execute(message, _args) {
    await message.reply('❌ This command is only available as a slash command. Use `/create-reminder`');
  }

  async executeInteraction(interaction) {
    const subject = interaction.options.getString('subject');
    const category = interaction.options.getString('category');
    const when = interaction.options.getString('when');
    const who = interaction.options.getString('who');
    const content = interaction.options.getString('content');
    const link = interaction.options.getString('link');
    const image = interaction.options.getString('image');

    // Parse assignee (format: "role:123456" or "123456" for user)
    let assigneeType = 'user';
    let assigneeId = who;

    if (who.startsWith('role:')) {
      assigneeType = 'role';
      assigneeId = who.substring(5);
    }

    // Create reminder
    const reminderId = await createReminder({
      subject,
      category,
      when,
      content,
      link,
      image
    });

    // Add assignment
    await addReminderAssignment(reminderId, assigneeType, assigneeId);

    await sendSuccess(
      interaction,
      `Reminder #${reminderId} created successfully! It will be sent at the specified time.`
    );
  }
}

module.exports = new CreateReminderCommand().register();
