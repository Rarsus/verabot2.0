const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendError } = require('../../utils/helpers/response-helpers');
const { EmbedBuilder } = require('discord.js');
const { getReminderById } = require('../../services/ReminderService');

const { data, options } = buildCommandOptions('get-reminder', 'Get a specific reminder by ID', [
  { name: 'id', type: 'integer', description: 'Reminder ID', required: true, minValue: 1 }
]);

class GetReminderCommand extends Command {
  constructor() {
    super({ name: 'get-reminder', description: 'Get a specific reminder by ID', data, options });
  }

  async execute(message, _args) {
    await message.reply('❌ This command is only available as a slash command. Use `/get-reminder`');
  }

  async executeInteraction(interaction) {
    // Defer the interaction immediately to avoid timeout (3 second Discord limit)
    await interaction.deferReply();

    const id = interaction.options.getInteger('id');

    const reminder = await getReminderById(id);

    if (!reminder) {
      await sendError(interaction, `Reminder #${id} not found.`);
      return;
    }

    // Format datetime for display
    const whenDate = new Date(reminder.when_datetime);
    const notificationDate = new Date(reminder.notificationTime);

    const embed = new EmbedBuilder()
      .setTitle(`📋 Reminder #${reminder.id}: ${reminder.subject}`)
      .setColor(reminder.status === 'active' ? 0x5865F2 : reminder.status === 'completed' ? 0x57F287 : 0x99AAB5)
      .addFields([
        { name: '📂 Category', value: reminder.category, inline: true },
        { name: '📊 Status', value: reminder.status.toUpperCase(), inline: true },
        { name: '📅 Event Time', value: `<t:${Math.floor(whenDate.getTime() / 1000)}:F>`, inline: false },
        { name: '🔔 Notification Time', value: `<t:${Math.floor(notificationDate.getTime() / 1000)}:F>`, inline: false }
      ])
      .setTimestamp(new Date(reminder.createdAt))
      .setFooter({ text: 'Created' });

    if (reminder.content) {
      embed.setDescription(reminder.content);
    }

    if (reminder.link) {
      embed.addFields({ name: '🔗 Link', value: reminder.link });
    }

    if (reminder.image) {
      embed.setImage(reminder.image);
    }

    // Add assignments
    if (reminder.assignments && reminder.assignments.length > 0) {
      const assigneeList = reminder.assignments.map(a => {
        if (a.assigneeType === 'user') {
          return `👤 <@${a.assigneeId}>`;
        } else {
          return `👥 <@&${a.assigneeId}>`;
        }
      }).join('\n');

      embed.addFields({ name: '👥 Assigned To', value: assigneeList });
    }

    await interaction.reply({ embeds: [embed] });
  }
}

module.exports = new GetReminderCommand().register();
