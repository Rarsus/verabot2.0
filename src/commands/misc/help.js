const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const RolePermissionService = require('../../services/RolePermissionService');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function formatUsage(cmd, prefix = '!') {
  const opts = (cmd.data && typeof cmd.data.toJSON === 'function') ? (cmd.data.toJSON().options || []) : (cmd.options || []);
  const parts = opts.map(o => (o.required ? `<${o.name}>` : `[${o.name}]`));
  const slash = `/${cmd.name}${parts.length ? ' ' + parts.join(' ') : ''}`;
  const message = `${prefix}${cmd.name}${parts.length ? ' ' + parts.join(' ') : ''}`;
  return { slash, message };
}

const { data, options } = buildCommandOptions('help', 'List available commands or show detailed help for a command', [
  { name: 'command', type: 'string', description: 'Command name to get details for', required: false }
]);

class HelpCommand extends Command {
  constructor() {
    super({ name: 'help', description: 'List available commands and usage', data, options });
  }

  async execute(message) {
    try {
      const client = message.client;
      const commands = client && client.commands ? client.commands : new Map();
      const lines = [];
      for (const [name, cmd] of commands) {
        lines.push({ name, desc: cmd.description || 'No description', cmd });
      }

      if (lines.length === 0) {
        const e = new EmbedBuilder().setTitle('Available commands').setDescription('No commands available.').setColor(0x00AE86);
        if (message.channel && typeof message.channel.send === 'function') return message.channel.send({ embeds: [e] });
        if (message.reply) return message.reply({ embeds: [e] });
        return;
      }

      const pageSize = 6;
      const pages = [];
      for (let i = 0; i < lines.length; i += pageSize) {
        const chunk = lines.slice(i, i + pageSize);
        const desc = chunk.map(it => `**${it.name}** — ${it.desc}`).join('\n');
        pages.push(new EmbedBuilder().setTitle('Available commands').setDescription(desc).setColor(0x00AE86));
      }

      const components = (pageIndex) => new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('prev').setLabel('Previous').setStyle(ButtonStyle.Primary).setDisabled(pageIndex === 0),
        new ButtonBuilder().setCustomId('next').setLabel('Next').setStyle(ButtonStyle.Primary).setDisabled(pageIndex === pages.length - 1),
        new ButtonBuilder().setCustomId('close').setLabel('Close').setStyle(ButtonStyle.Danger)
      );

      let sentMessage;
      try {
        sentMessage = await message.author.send({ embeds: [pages[0]], components: [components(0)] });
      } catch {
        if (message.channel && typeof message.channel.send === 'function') {
          sentMessage = await message.channel.send({ embeds: [pages[0]], components: [components(0)] });
        } else if (message.reply) {
          sentMessage = await message.reply({ embeds: [pages[0]], components: [components(0)] });
        }
      }

      if (!sentMessage) return;

      const filter = (i) => i.user.id === (message.author && message.author.id);
      const collector = sentMessage.createMessageComponentCollector({ filter, time: 120000 });
      let idx = 0;
      collector.on('collect', async (i) => {
        try {
          if (i.customId === 'next') {
            idx = Math.min(idx + 1, pages.length - 1);
            await i.update({ embeds: [pages[idx]], components: [components(idx)] });
          } else if (i.customId === 'prev') {
            idx = Math.max(idx - 1, 0);
            await i.update({ embeds: [pages[idx]], components: [components(idx)] });
          } else if (i.customId === 'close') {
            await i.update({ content: 'Help closed.', embeds: [], components: [] });
            collector.stop();
          }
        } catch { void 0; }
      });
      collector.on('end', async () => {
        try { await sentMessage.edit({ components: [] }); } catch { void 0; }
      });
    } catch {
      console.error('Help command (message) error', err);
    }
  }

  async executeInteraction(interaction) {
    try {
      const client = interaction.client;
      const commands = client && client.commands ? client.commands : new Map();
      const requested = interaction.options.getString('command');

      // Get user tier and filter visible commands
      const userId = interaction.user.id;
      const guildId = interaction.guildId;

      if (requested) {
        const cmd = commands.get(requested);
        if (!cmd) {
          await interaction.reply({ content: `No command named '${requested}' found.`, ephemeral: true });
          return;
        }

        // Check if command is visible to user
        const isVisible = await RolePermissionService.isCommandVisible(userId, guildId, requested, client);
        if (!isVisible) {
          await interaction.reply({ content: 'You do not have access to that command.', ephemeral: true });
          return;
        }

        const opts = (cmd.data && typeof cmd.data.toJSON === 'function') ? (cmd.data.toJSON().options || []) : (cmd.options || []);
        const usage = formatUsage(cmd, interaction.client?.config?.PREFIX || '!');
        const userTier = await RolePermissionService.getUserTier(userId, guildId, client);
        const tierDesc = RolePermissionService.getRoleDescription(userTier);

        const embed = new EmbedBuilder()
          .setTitle(`Help: ${cmd.name}`)
          .setDescription(cmd.description || 'No description')
          .addFields(
            { name: 'Slash usage', value: usage.slash, inline: false },
            { name: 'Message usage', value: usage.message, inline: false },
            { name: 'Your role', value: tierDesc, inline: false }
          )
          .setColor(0x00AE86);

        if (opts.length) {
          for (const o of opts) {
            const t = o.type || o.type?.toString() || 'string';
            embed.addFields({ name: o.name, value: `${o.description || '-'} (${o.required ? 'required' : 'optional'}, type: ${t})`, inline: false });
          }
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      // Filter commands by visibility
      const items = [];
      for (const [name, cmd] of commands) {
        const isVisible = await RolePermissionService.isCommandVisible(userId, guildId, name, client);
        if (isVisible) {
          items.push({ name, desc: cmd.description || 'No description', cmd });
        }
      }

      if (items.length === 0) {
        return interaction.reply({ content: 'No commands available to you.', ephemeral: true });
      }

      const userTier = await RolePermissionService.getUserTier(userId, guildId, client);
      const pageSize = 6;
      const pages = [];
      for (let i = 0; i < items.length; i += pageSize) {
        const chunk = items.slice(i, i + pageSize);
        const desc = chunk.map(it => `**${it.name}** — ${it.desc}`).join('\n');
        pages.push(new EmbedBuilder()
          .setTitle('Available commands')
          .setDescription(desc)
          .setFooter({ text: `Role: ${RolePermissionService.getRoleDescription(userTier)}` })
          .setColor(0x00AE86));
      }

      const components = (pageIndex) => new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('prev').setLabel('Previous').setStyle(ButtonStyle.Primary).setDisabled(pageIndex === 0),
        new ButtonBuilder().setCustomId('next').setLabel('Next').setStyle(ButtonStyle.Primary).setDisabled(pageIndex === pages.length - 1),
        new ButtonBuilder().setCustomId('close').setLabel('Close').setStyle(ButtonStyle.Danger)
      );

      const reply = await interaction.reply({ embeds: [pages[0]], components: [components(0)], flags: 64 }).then(() => interaction.fetchReply());
      const filter = (i) => i.user.id === interaction.user.id;
      const collector = reply.createMessageComponentCollector({ filter, time: 120000 });
      let idx = 0;
      collector.on('collect', async (i) => {
        try {
          if (i.customId === 'next') {
            idx = Math.min(idx + 1, pages.length - 1);
            await i.update({ embeds: [pages[idx]], components: [components(idx)] });
          } else if (i.customId === 'prev') {
            idx = Math.max(idx - 1, 0);
            await i.update({ embeds: [pages[idx]], components: [components(idx)] });
          } else if (i.customId === 'close') {
            await i.update({ content: 'Help closed.', embeds: [], components: [] });
            collector.stop();
          }
        } catch { void 0; }
      });
      collector.on('end', async () => {
        try { await reply.edit({ components: [] }); } catch { void 0; }
      });
    } catch (err) {
      console.error('Help command (interaction) error', err);
      try { await interaction.reply({ content: 'Could not list commands.', ephemeral: true }); } catch { void 0; }
    }
  }
}

module.exports = new HelpCommand().register();
