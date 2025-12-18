/**
 * Command Validator Middleware
 * Validates incoming commands before execution
 */

/**
 * Validate command structure
 * @param {object} interaction - Discord interaction object
 * @returns {boolean} True if valid
 */
function validateCommand(interaction) {
  if (!interaction || typeof interaction.isCommand !== 'function') {
    return false;
  }
  
  if (!interaction.isCommand?.() && !interaction.isChatInputCommand?.()) {
    return false;
  }
  
  return true;
}

module.exports = { validateCommand };
