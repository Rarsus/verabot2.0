/**
 * Communication Service
 * Manages user opt-in/opt-out status for DMs and communication features
 * 
 * ⚠️ REFACTORED (Phase 23.0): Now uses GlobalUserCommunicationService
 * This is a thin wrapper layer that delegates to the specialized service.
 */

const globalUserComm = require('./GlobalUserCommunicationService');

/**
 * Check if user has opted in to receive DMs
 * @param {string} userId - Discord user ID
 * @returns {Promise<boolean>} True if user is opted in, false otherwise
 */
function isOptedIn(userId) {
  return globalUserComm.isOptedIn(userId);
}

/**
 * Opt user in to receive DMs and communication features
 * @param {string} userId - Discord user ID
 * @returns {Promise<void>}
 */
function optIn(userId) {
  return globalUserComm.optIn(userId);
}

/**
 * Opt user out of receiving DMs
 * @param {string} userId - Discord user ID
 * @returns {Promise<void>}
 */
function optOut(userId) {
  return globalUserComm.optOut(userId);
}

/**
 * Get user's communication status and metadata
 * @param {string} userId - Discord user ID
 * @returns {Promise<Object>} Status object with opted_in, created_at, updated_at
 */
async function getStatus(userId) {
  const status = await globalUserComm.getOptInStatus(userId);
  if (!status) {
    return {
      opted_in: false,
      created_at: null,
      updated_at: null,
    };
  }
  return {
    opted_in: status.opted_in === 1,
    created_at: status.created_at,
    updated_at: status.updated_at,
  };
}

module.exports = {
  isOptedIn,
  optIn,
  optOut,
  getStatus,
};
