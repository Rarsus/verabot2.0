const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendError } = require('../../utils/helpers/response-helpers');
const { EmbedBuilder } = require('discord.js');
const { getAllReminders } = require('../../services/GuildAwareReminderService');

const { data, options } = buildCommandOptions('list-reminders', 'List reminders with filters', [
  { name: 'status', type: 'string', description: 'Filter by status (active, completed, cancelled)', required: false },
  { name: 'category', type: 'string', description: 'Filter by category', required: false },
  { name: 'assignee', type: 'string', description: 'Filter by assignee ID', required: false },
  { name: 'page', type: 'integer', description: 'Page number (default: 1)', required: false, minValue: 1 },
]);

class ListRemindersCommand extends Command {
  constructor() {
    super({
      name: 'list-reminders',
      description: 'List reminders with filters',
      data,
      options,
      permissions: {
        minTier: 1,
        visible: true,
      },
    });
  }

  async execute(message, _args) {
    await message.reply('❌ This command is only available as a slash command. Use `/list-reminders`');
  }

  async executeInteraction(interaction) {
    // Defer the interaction immediately to avoid timeout (3 second Discord limit)
    await interaction.deferReply();

    const guildId = interaction.guildId;
    const status = interaction.options.getString('status');
    const category = interaction.options.getString('category');
    const assigneeId = interaction.options.getString('assignee');
    const page = interaction.options.getInteger('page') || 1;

    const filters = {};
    if (status) filters.status = status;
    if (category) filters.category = category;

    const reminders = await getAllReminders(guildId, filters);

    if (reminders.length === 0) {
      await sendError(interaction, 'No reminders found matching the filters.', false);
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('📋 Reminders List')
      .setColor(0x5865f2)
      .setFooter({ text: `Page ${page} • ${reminders.length} results` });

    // Add filter info
    const filterInfo = [];
    if (status) filterInfo.push(`Status: ${status}`);
    if (category) filterInfo.push(`Category: ${category}`);
    if (assigneeId) filterInfo.push(`Assignee: <@${assigneeId}>`);

    if (filterInfo.length > 0) {
      embed.setDescription(`**Filters:** ${filterInfo.join(' • ')}`);
    }

    // Add reminders to embed
    for (const reminder of reminders.slice(0, 10)) {
      const whenDate = new Date(reminder.when_datetime);
      const timeStr = `<t:${Math.floor(whenDate.getTime() / 1000)}:R>`;
      const statusEmoji = reminder.status === 'active' ? '🟢' : reminder.status === 'completed' ? '✅' : '⚫';

      embed.addFields({
        name: `${statusEmoji} #${reminder.id} - ${reminder.subject}`,
        value: `📂 ${reminder.category} • 📅 ${timeStr}`,
        inline: false,
      });
    }

    await interaction.reply({ embeds: [embed] });
  }
}

module.exports = new ListRemindersCommand().register();
