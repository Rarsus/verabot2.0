const axios = require('axios');

/**
 * Bot Service
 * Handles communication with the VeraBot API
 */
class BotService {
  constructor() {
    this.botApiUrl = process.env.BOT_API_URL || 'http://verabot2:3000';
    this.botApiToken = process.env.BOT_API_TOKEN;
    
    // Create axios instance for bot API
    this.api = axios.create({
      baseURL: this.botApiUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.api.interceptors.request.use((config) => {
      if (this.botApiToken) {
        config.headers.Authorization = `Bearer ${this.botApiToken}`;
      }
      return config;
    });
  }

  /**
   * Verify user has admin permissions for the bot
   * @param {string} userId - Discord user ID
   * @param {Array} guilds - User's guilds
   * @returns {Promise<boolean>} True if user has admin access
   */
  async verifyAdminAccess(userId, guilds) {
    try {
      // Check if user is bot owner (from environment)
      const botOwnerId = process.env.BOT_OWNER_ID;
      if (botOwnerId && userId === botOwnerId) {
        return true;
      }

      // Check if user has admin role in any guild the bot is in
      // This would require bot API endpoint to verify
      const response = await this.api.post('/api/auth/verify-admin', {
        userId,
        guilds: guilds.map(g => g.id),
      }).catch(() => null);

      return response?.data?.isAdmin || false;
    } catch (error) {
      console.error('Error verifying admin access:', error.message);
      return false;
    }
  }

  /**
   * Get bot status
   * @returns {Promise<Object>} Bot status
   */
  async getBotStatus() {
    try {
      const response = await this.api.get('/api/bot/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching bot status:', error.message);
      throw new Error('Failed to fetch bot status');
    }
  }

  /**
   * Get bot information
   * @returns {Promise<Object>} Bot information
   */
  async getBotInfo() {
    try {
      const response = await this.api.get('/api/bot/info');
      return response.data;
    } catch (error) {
      console.error('Error fetching bot info:', error.message);
      throw new Error('Failed to fetch bot information');
    }
  }

  /**
   * Proxy request to bot API
   * @param {string} method - HTTP method
   * @param {string} path - API path
   * @param {Object} data - Request data
   * @returns {Promise<Object>} API response
   */
  async proxyRequest(method, path, data = null) {
    try {
      const response = await this.api.request({
        method,
        url: path,
        data,
      });
      return response.data;
    } catch (error) {
      console.error(`Error proxying ${method} ${path}:`, error.message);
      throw error;
    }
  }
}

module.exports = new BotService();
