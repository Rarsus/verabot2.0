const axios = require('axios');
const jwt = require('jsonwebtoken');

/**
 * Discord OAuth Service
 * Handles Discord OAuth 2.0 authentication flow
 */
class OAuthService {
  constructor() {
    this.clientId = process.env.DISCORD_CLIENT_ID;
    this.clientSecret = process.env.DISCORD_CLIENT_SECRET;
    this.redirectUri = process.env.DISCORD_REDIRECT_URI || 'http://localhost:5000/api/auth/callback';
    this.scopes = (process.env.DISCORD_SCOPES || 'identify,guilds').split(',');
    this.jwtSecret = process.env.SESSION_SECRET || 'your-secret-key-change-in-production';

    // Validate required configuration
    if (!this.clientId || !this.clientSecret) {
      console.warn('⚠️  Discord OAuth not configured. Set DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET');
    }
    
    console.log('✓ OAuth Service initialized');
    console.log(`  Client ID: ${this.clientId}`);
    console.log(`  Redirect URI: ${this.redirectUri}`);
    console.log(`  Scopes: ${this.scopes.join(', ')}`);
  }

  /**
   * Generate Discord OAuth authorization URL
   * @returns {string} Authorization URL
   */
  getAuthorizationUrl() {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: this.scopes.join(' '),
    });

    return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   * @param {string} code - Authorization code from Discord
   * @returns {Promise<Object>} Token data
   */
  async exchangeCodeForToken(code) {
    try {
      console.log('📝 Exchanging authorization code for token...');
      console.log('   Code:', code.substring(0, 10) + '...');
      console.log('   Client ID:', this.clientId);
      console.log('   Redirect URI:', this.redirectUri);

      const params = new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.redirectUri,
      });

      const response = await axios.post('https://discord.com/api/oauth2/token', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      console.log('✓ Token exchanged successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error exchanging code for token:');
      console.error('   Message:', error.message);
      console.error('   Response status:', error.response?.status);
      console.error('   Response data:', error.response?.data);
      throw error;
    }
  }

  /**
   * Fetch user information from Discord API
   * @param {string} accessToken - Discord access token
   * @returns {Promise<Object>} User data
   */
  async fetchUserInfo(accessToken) {
    try {
      const response = await axios.get('https://discord.com/api/users/@me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching user info:', error.response?.data || error.message);
      throw new Error('Failed to fetch user information');
    }
  }

  /**
   * Fetch user's guilds from Discord API
   * @param {string} accessToken - Discord access token
   * @returns {Promise<Array>} Array of guild objects
   */
  async fetchUserGuilds(accessToken) {
    try {
      const response = await axios.get('https://discord.com/api/users/@me/guilds', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching user guilds:', error.response?.data || error.message);
      throw new Error('Failed to fetch user guilds');
    }
  }

  /**
   * Generate JWT token for authenticated user
   * @param {Object} user - User data
   * @param {string} accessToken - Discord access token
   * @returns {string} JWT token
   */
  generateJWT(user, accessToken) {
    const payload = {
      userId: user.id,
      username: user.username,
      discriminator: user.discriminator,
      avatar: user.avatar,
      accessToken: accessToken,
      timestamp: Date.now(),
    };

    // Token expires in 7 days
    return jwt.sign(payload, this.jwtSecret, { expiresIn: '7d' });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token to verify
   * @returns {Object|null} Decoded token or null if invalid
   */
  verifyJWT(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      console.error('JWT verification failed:', error.message);
      return null;
    }
  }

  /**
   * Refresh Discord access token
   * @param {string} refreshToken - Discord refresh token
   * @returns {Promise<Object>} New token data
   */
  async refreshAccessToken(refreshToken) {
    try {
      const params = new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });

      const response = await axios.post('https://discord.com/api/oauth2/token', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error refreshing token:', error.response?.data || error.message);
      throw new Error('Failed to refresh access token');
    }
  }
}

module.exports = new OAuthService();
