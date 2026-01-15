/**
 * Authorization Service
 * Handles user access control and permissions for the dashboard
 */
class AuthorizationService {
  constructor() {
    // Get allowed users from environment variable
    this.allowedUsers = this.parseAllowedUsers();
    
    // Get admin users from environment variable
    this.adminUsers = this.parseAdminUsers();
    
    if (this.allowedUsers.length === 0) {
      console.warn('⚠️  DASHBOARD_ALLOWED_USERS not configured. No users will be allowed access.');
    }
  }

  /**
   * Parse comma-separated list of allowed user IDs from environment
   * @returns {Array<string>} Array of user IDs
   */
  parseAllowedUsers() {
    const usersEnv = process.env.DASHBOARD_ALLOWED_USERS || '';
    if (!usersEnv) return [];
    
    return usersEnv
      .split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);
  }

  /**
   * Parse comma-separated list of admin user IDs from environment
   * @returns {Array<string>} Array of admin user IDs
   */
  parseAdminUsers() {
    const adminsEnv = process.env.DASHBOARD_ADMIN_USERS || '';
    if (!adminsEnv) return [];
    
    return adminsEnv
      .split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);
  }

  /**
   * Check if user is allowed to access the dashboard
   * @param {string} userId - Discord user ID
   * @returns {boolean} Whether user is allowed
   */
  isUserAllowed(userId) {
    // If no allowed users configured, deny all access
    if (this.allowedUsers.length === 0) {
      return false;
    }
    
    // Check if user is in allowlist (or is an admin)
    return this.allowedUsers.includes(userId) || this.adminUsers.includes(userId);
  }

  /**
   * Check if user is an admin
   * @param {string} userId - Discord user ID
   * @returns {boolean} Whether user is an admin
   */
  isUserAdmin(userId) {
    return this.adminUsers.includes(userId);
  }

  /**
   * Check if user has admin access to a specific guild
   * @param {string} userId - Discord user ID
   * @param {string} guildId - Discord guild ID
   * @param {Array<Object>} userGuilds - User's guilds from Discord API
   * @returns {boolean} Whether user is admin of the guild
   */
  isGuildAdmin(userId, guildId, userGuilds = []) {
    // Admins can access any guild
    if (this.isUserAdmin(userId)) {
      return true;
    }

    // Check if user is admin of this specific guild
    // User must have MANAGE_GUILD permission in the guild
    const guild = userGuilds.find(g => g.id === guildId);
    if (!guild) return false;

    // permissions is a string bitmask
    const permissions = BigInt(guild.permissions);
    const MANAGE_GUILD = BigInt(32); // Discord MANAGE_GUILD permission

    return (permissions & MANAGE_GUILD) === MANAGE_GUILD;
  }

  /**
   * Get list of allowed users (for debugging/admin purposes)
   * @returns {Array<string>} Array of allowed user IDs
   */
  getAllowedUsers() {
    return [...this.allowedUsers];
  }

  /**
   * Get list of admin users (for debugging/admin purposes)
   * @returns {Array<string>} Array of admin user IDs
   */
  getAdminUsers() {
    return [...this.adminUsers];
  }
}

module.exports = new AuthorizationService();
