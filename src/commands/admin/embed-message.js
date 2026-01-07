/**
 * Embed Command
 * Admin command to send formatted embed messages as the bot
 */

const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendSuccess, sendError } = require('../../utils/helpers/response-helpers');
const { checkAdminPermission } = require('../../utils/proxy-helpers');
const { resolveChannel } = require('../../utils/helpers/resolution-helpers');
const { EmbedBuilder } = require('discord.js');

const { data, options } = buildCommandOptions('embed', 'Send a formatted embed message as the bot (Admin only)', [
  {
    name: 'channel',
    type: 'string',
    required: true,
    description: 'Channel name, ID, or mention',
  },
  {
    name: 'title',
    type: 'string',
    required: true,
    description: 'Embed title',
    maxLength: 256,
  },
  {
    name: 'description',
    type: 'string',
    required: true,
    description: 'Embed description',
    maxLength: 2048,
  },
  {
    name: 'color',
    type: 'string',
    required: false,
    description: 'Hex color code (e.g., #FF5733 or just FF5733)',
  },
  {
    name: 'footer',
    type: 'string',
    required: false,
    description: 'Footer text',
    maxLength: 2048,
  },
  {
    name: 'thumbnail',
    type: 'string',
    required: false,
    description: 'Thumbnail image URL',
  },
  {
    name: 'image',
    type: 'string',
    required: false,
    description: 'Large image URL',
  },
]);

class EmbedCommand extends Command {
  constructor() {
    super({
      name: 'embed',
      description: 'Send a formatted embed message as the bot',
      data,
      options,
      permissions: {
        minTier: 3,
        visible: false,
      },
    });
  }

  async execute(message, _args) {
    await sendError(message, 'This command is only available as a slash command. Use `/embed`', true);
  }

  async executeInteraction(interaction) {
    try {
      // Check admin permission
      const isAdmin = checkAdminPermission(interaction);
      if (!isAdmin) {
        return sendError(interaction, 'You need admin permissions to use this command', true);
      }

      const channelInput = interaction.options.getString('channel');
      const title = interaction.options.getString('title');
      const description = interaction.options.getString('description');
      const colorInput = interaction.options.getString('color') || null;
      const footer = interaction.options.getString('footer') || null;
      const thumbnail = interaction.options.getString('thumbnail') || null;
      const image = interaction.options.getString('image') || null;

      // Fetch the channel using resolution helper
      const channel = await resolveChannel(channelInput, interaction.guild);

      if (!channel) {
        return sendError(
          interaction,
          `Could not find channel: ${channelInput}. Try using the channel name or ID.`,
          true
        );
      }

      if (!channel.isTextBased()) {
        return sendError(interaction, 'That is not a text channel', true);
      }

      // Check bot permissions
      if (channel.guild && !channel.permissionsFor(interaction.client.user).has('SendMessages')) {
        return sendError(interaction, "I don't have permission to send messages in that channel", true);
      }

      // Create embed
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(this.parseColor(colorInput))
        .setTimestamp();

      if (footer) {
        embed.setFooter({ text: footer });
      }

      if (thumbnail) {
        try {
          embed.setThumbnail(thumbnail);
        } catch (err) {
          console.error('Invalid thumbnail URL:', err);
        }
      }

      if (image) {
        try {
          embed.setImage(image);
        } catch (err) {
          console.error('Invalid image URL:', err);
        }
      }

      // Send the embed
      const sentMessage = await channel.send({ embeds: [embed] });

      return sendSuccess(interaction, `✅ Embed sent in ${channel.toString()}\n[Message ID: ${sentMessage.id}]`);
    } catch (err) {
      console.error('Embed command error:', err);
      return sendError(interaction, `Failed to send embed: ${err.message}`, true);
    }
  }

  parseColor(colorInput) {
    if (!colorInput) return 0x0099ff; // Default blue

    try {
      // Remove # if present
      let hex = colorInput.replace('#', '');

      // Pad with leading zeros if needed
      if (hex.length === 3) {
        hex = hex
          .split('')
          .map((char) => char + char)
          .join('');
      }

      // Convert to number
      const color = parseInt(hex, 16);

      // Validate it's a valid color
      if (Number.isNaN(color) || color < 0 || color > 0xffffff) {
        return 0x0099ff; // Default if invalid
      }

      return color;
    } catch {
      return 0x0099ff; // Default if error
    }
  }
}

module.exports = new EmbedCommand().register();
