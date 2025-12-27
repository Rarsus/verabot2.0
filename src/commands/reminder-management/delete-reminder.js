const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendSuccess, sendError } = require('../../utils/helpers/response-helpers');
const { deleteReminder, getReminderById } = require('../../services/ReminderService');

const { data, options } = buildCommandOptions('delete-reminder', 'Delete a reminder', [
  { name: 'id', type: 'integer', description: 'Reminder ID', required: true, minValue: 1 },
  { name: 'hard', type: 'boolean', description: 'Permanently delete (default: soft delete)', required: false }
]);

class DeleteReminderCommand extends Command {
  constructor() {
    super({ name: 'delete-reminder', description: 'Delete a reminder', data, options });
  }

  async execute(message, _args) {
    await message.reply('❌ This command is only available as a slash command. Use `/delete-reminder`');
  }

  async executeInteraction(interaction) {
    const id = interaction.options.getInteger('id');
    const hard = interaction.options.getBoolean('hard') || false;

    // Check if reminder exists
    const existing = await getReminderById(id);
    if (!existing) {
      await sendError(interaction, `Reminder #${id} not found.`);
      return;
    }

    const success = await deleteReminder(id, hard);

    if (success) {
      const deleteType = hard ? 'permanently deleted' : 'cancelled';
      await sendSuccess(interaction, `Reminder #${id} ${deleteType} successfully!`);
    } else {
      await sendError(interaction, `Failed to delete reminder #${id}.`);
    }
  }
}

module.exports = new DeleteReminderCommand().register();
