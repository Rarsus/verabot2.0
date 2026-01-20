/**
 * Command Option Builder
 * Reduces duplication between SlashCommandBuilder and options array
 */

const { SlashCommandBuilder } = require('discord.js');

/**
 * Build both SlashCommandBuilder and options array from a single definition
 * @param {string} name - Command name
 * @param {string} description - Command description
 * @param {Array} optionDefinitions - Array of option definitions
 * @returns {Object} { data: SlashCommandBuilder, options: Array }
 */
function buildCommandOptions(name, description, optionDefinitions = []) {
  const builder = new SlashCommandBuilder().setName(name).setDescription(description);

  // Build options array and add to builder
  const options = optionDefinitions.map((opt) => {
    // Add to builder
    if (opt.type === 'string') {
      builder.addStringOption((o) => {
        o.setName(opt.name).setDescription(opt.description);
        if (opt.required !== undefined) {
          o.setRequired(opt.required);
        }
        if (opt.choices) {
          o.addChoices(...opt.choices);
        }
        if (opt.minLength) {
          o.setMinLength(opt.minLength);
        }
        if (opt.maxLength) {
          o.setMaxLength(opt.maxLength);
        }
        return o;
      });
    } else if (opt.type === 'integer') {
      builder.addIntegerOption((o) => {
        o.setName(opt.name).setDescription(opt.description);
        if (opt.required !== undefined) {
          o.setRequired(opt.required);
        }
        if (opt.minValue !== undefined) {
          o.setMinValue(opt.minValue);
        }
        if (opt.maxValue !== undefined) {
          o.setMaxValue(opt.maxValue);
        }
        return o;
      });
    } else if (opt.type === 'boolean') {
      builder.addBooleanOption((o) => {
        o.setName(opt.name).setDescription(opt.description);
        if (opt.required !== undefined) {
          o.setRequired(opt.required);
        }
        return o;
      });
    }

    // Return simplified option for legacy support
    return {
      name: opt.name,
      type: opt.type,
      description: opt.description,
      required: opt.required ?? false,
      ...opt,
    };
  });

  return { data: builder, options };
}

module.exports = buildCommandOptions;
