const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendError } = require('../../utils/helpers/response-helpers');
const { EmbedBuilder } = require('discord.js');
const { searchReminders } = require('../../services/GuildAwareReminderService');

const { data, options } = buildCommandOptions('search-reminders', 'Search reminders by keyword', [
  { name: 'keyword', type: 'string', description: 'Search keyword', required: true, minLength: 2 },
  { name: 'page', type: 'integer', description: 'Page number (default: 1)', required: false, minValue: 1 }
]);

class SearchRemindersCommand extends Command {
  constructor() {
    super({
      name: 'search-reminders',
      description: 'Search reminders by keyword',
      data,
      options,
      permissions: {
        minTier: 1,
        visible: true
      }
    });
  }

  async execute(message, _args) {
    await message.reply('❌ This command is only available as a slash command. Use `/search-reminders`');
  }

  async executeInteraction(interaction) {
    // Defer the interaction immediately to avoid timeout (3 second Discord limit)
    await interaction.deferReply();

    const guildId = interaction.guildId;
    const keyword = interaction.options.getString('keyword');
    const page = interaction.options.getInteger('page') || 1;

    const reminders = await searchReminders(guildId, keyword);

    if (reminders.length === 0) {
      await sendError(interaction, `No reminders found matching "${keyword}".`, false);
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`🔍 Search Results: "${keyword}"`)
      .setColor(0x5865F2)
      .setFooter({ text: `Page ${page} • ${reminders.length} results` });

    // Add reminders to embed with highlighting
    for (const reminder of reminders.slice(0, 10)) {
      const whenDate = new Date(reminder.when_datetime);
      const timeStr = `<t:${Math.floor(whenDate.getTime() / 1000)}:R>`;

      // Create preview with keyword context
      let preview = '';
      const keywordLower = keyword.toLowerCase();

      if (reminder.subject.toLowerCase().includes(keywordLower)) {
        preview = `**${reminder.subject}**`;
      } else if (reminder.category.toLowerCase().includes(keywordLower)) {
        preview = `📂 Category: **${reminder.category}**`;
      } else if (reminder.content && reminder.content.toLowerCase().includes(keywordLower)) {
        // Show snippet of content with context
        const contentLower = reminder.content.toLowerCase();
        const index = contentLower.indexOf(keywordLower);
        const start = Math.max(0, index - 30);
        const end = Math.min(reminder.content.length, index + keyword.length + 30);
        preview = `${start > 0 ? '...' : ''}${reminder.content.substring(start, end)}${end < reminder.content.length ? '...' : ''}`;
      }

      embed.addFields({
        name: `#${reminder.id} - ${reminder.subject}`,
        value: `${preview}\n📂 ${reminder.category} • 📅 ${timeStr}`,
        inline: false
      });
    }

    await interaction.reply({ embeds: [embed] });
  }
}

module.exports = new SearchRemindersCommand().register();
