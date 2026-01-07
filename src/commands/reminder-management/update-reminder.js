const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendSuccess, sendError } = require('../../utils/helpers/response-helpers');
const { updateReminder, getReminderById } = require('../../services/GuildAwareReminderService');

const { data, options } = buildCommandOptions('update-reminder', 'Update an existing reminder', [
  { name: 'id', type: 'integer', description: 'Reminder ID', required: true, minValue: 1 },
  {
    name: 'subject',
    type: 'string',
    description: 'New subject (optional)',
    required: false,
    minLength: 3,
    maxLength: 200,
  },
  { name: 'category', type: 'string', description: 'New category (optional)', required: false, maxLength: 50 },
  {
    name: 'when',
    type: 'string',
    description: 'New date/time: "1 day", "tomorrow at 3 PM", etc. (optional)',
    required: false,
  },
  { name: 'content', type: 'string', description: 'New content (optional)', required: false, maxLength: 2000 },
  { name: 'link', type: 'string', description: 'New link (optional)', required: false },
  { name: 'image', type: 'string', description: 'New image URL (optional)', required: false },
  { name: 'status', type: 'string', description: 'New status (optional)', required: false },
]);

class UpdateReminderCommand extends Command {
  constructor() {
    super({
      name: 'update-reminder',
      description: 'Update an existing reminder',
      data,
      options,
      permissions: {
        minTier: 1,
        visible: true,
      },
    });
  }

  async execute(message, _args) {
    await message.reply('❌ This command is only available as a slash command. Use `/update-reminder`');
  }

  async executeInteraction(interaction) {
    // Defer the interaction immediately to avoid timeout (3 second Discord limit)
    await interaction.deferReply();

    const guildId = interaction.guildId;
    const id = interaction.options.getInteger('id');

    // Check if reminder exists
    const existing = await getReminderById(guildId, id);
    if (!existing) {
      await sendError(interaction, `Reminder #${id} not found.`);
      return;
    }

    // Collect updates
    const updates = {};

    const subject = interaction.options.getString('subject');
    if (subject !== null) updates.subject = subject;

    const category = interaction.options.getString('category');
    if (category !== null) updates.category = category;

    const when = interaction.options.getString('when');
    if (when !== null) updates.when = when;

    const content = interaction.options.getString('content');
    if (content !== null) updates.content = content;

    const link = interaction.options.getString('link');
    if (link !== null) updates.link = link;

    const image = interaction.options.getString('image');
    if (image !== null) updates.image = image;

    const status = interaction.options.getString('status');
    if (status !== null) updates.status = status;

    if (Object.keys(updates).length === 0) {
      await sendError(interaction, 'No fields provided to update.');
      return;
    }

    const success = await updateReminder(guildId, id, updates);

    if (success) {
      await sendSuccess(interaction, `Reminder #${id} updated successfully!`);
    } else {
      await sendError(interaction, `Failed to update reminder #${id}.`);
    }
  }
}

module.exports = new UpdateReminderCommand().register();
