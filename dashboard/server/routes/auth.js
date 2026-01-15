const express = require('express');
const router = express.Router();
const oauthService = require('../services/oauth-service');
const botService = require('../services/bot-service');
const authorizationService = require('../services/authorization-service');
const { authMiddleware } = require('../middleware/auth');

/**
 * GET /api/auth/login
 * Redirect to Discord OAuth authorization
 */
router.get('/login', (req, res) => {
  try {
    const authUrl = oauthService.getAuthorizationUrl();
    res.json({
      success: true,
      authUrl,
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to generate authorization URL',
    });
  }
});

/**
 * GET /api/auth/callback
 * OAuth callback handler - exchanges code for token
 */
router.get('/callback', async (req, res) => {
  try {
    const { code, error } = req.query;

    // Handle OAuth errors
    if (error) {
      const dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:5000';
      return res.redirect(`${dashboardUrl}/login?error=${encodeURIComponent(error)}`);
    }

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Authorization code not provided',
      });
    }

    // Exchange code for access token
    const tokenData = await oauthService.exchangeCodeForToken(code);

    // Fetch user information
    const user = await oauthService.fetchUserInfo(tokenData.access_token);

    // Fetch user's guilds
    const guilds = await oauthService.fetchUserGuilds(tokenData.access_token);

    console.log(`✓ OAuth callback for user ${user.id} (${user.username})`);

    // Check if user is allowed to access the dashboard
    const allowedUsers = authorizationService.getAllowedUsers();
    const isAllowed = authorizationService.isUserAllowed(user.id);
    
    console.log(`  Allowed users configured: ${allowedUsers.length > 0 ? allowedUsers.join(', ') : 'none'}`);
    console.log(`  User ${user.id} allowed: ${isAllowed}`);
    
    if (!isAllowed) {
      const dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:5000';
      const errorMsg = allowedUsers.length === 0 
        ? 'No users configured' 
        : 'User not in allowlist';
      console.warn(`⚠️  Access denied for user ${user.id} (${user.username}): ${errorMsg}`);
      return res.redirect(
        `${dashboardUrl}/login?error=${encodeURIComponent(errorMsg)}`
      );
    }

    // Generate JWT token
    const jwtToken = oauthService.generateJWT(user, tokenData.access_token);

    // Set secure HTTP-only cookie - axios will send this automatically
    res.cookie('auth_token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Just redirect to dashboard - don't include token in URL
    // The cookie will be sent automatically with API requests
    const dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:5000';
    console.log(`✓ Redirecting to: ${dashboardUrl}/dashboard`);
    res.redirect(`${dashboardUrl}/dashboard`);
  } catch (error) {
    console.error('❌ OAuth callback error:', error.message);
    console.error('   Full error:', error);
    if (error.response?.data) {
      console.error('   Response data:', error.response.data);
    }
    const dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:5000';
    res.redirect(`${dashboardUrl}/login?error=authentication_failed`);
  }
});

/**
 * GET /api/auth/verify
 * Verify JWT token validity
 */
router.get('/verify', authMiddleware, (req, res) => {
  try {
    // Token is valid if we got here (middleware verified it)
    res.json({
      success: true,
      user: {
        id: req.user.userId,
        username: req.user.username,
        discriminator: req.user.discriminator,
        avatar: req.user.avatar,
      },
    });
  } catch (error) {
    console.error('Verify error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Verification failed',
    });
  }
});

/**
 * POST /api/auth/logout
 * Clear session and logout
 */
router.post('/logout', (req, res) => {
  try {
    // Clear auth cookie
    res.clearCookie('auth_token');

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
    });
  }
});

/**
 * GET /api/auth/user
 * Get current authenticated user information
 */
router.get('/user', authMiddleware, async (req, res) => {
  try {
    // Fetch fresh user data from Discord
    const user = await oauthService.fetchUserInfo(req.user.accessToken);
    const guilds = await oauthService.fetchUserGuilds(req.user.accessToken);

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        avatar: user.avatar,
        email: user.email,
        verified: user.verified,
      },
      guilds: guilds.map((guild) => ({
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
        owner: guild.owner,
        permissions: guild.permissions,
      })),
    });
  } catch (error) {
    console.error('User info error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user information',
    });
  }
});

module.exports = router;
