const express = require('express');
const router = express.Router();

/**
 * Dashboard API Routes
 * Protected endpoints for dashboard access to bot data
 */

/**
 * POST /api/auth/verify-admin
 * Verify if user has admin access to the bot
 */
router.post('/auth/verify-admin', async (req, res) => {
  try {
    const { userId, guilds } = req.body;

    if (!userId || !Array.isArray(guilds)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body'
      });
    }

    const client = req.app.locals.discordClient;
    if (!client) {
      return res.status(503).json({
        success: false,
        error: 'Bot client not available'
      });
    }

    // Check if user is bot owner
    const botOwnerId = process.env.BOT_OWNER_ID;
    if (botOwnerId && userId === botOwnerId) {
      return res.json({
        success: true,
        isAdmin: true,
        reason: 'bot_owner'
      });
    }

    // Check if user has admin permissions in any mutual guild
    // Use Promise.all to check all guilds in parallel
    const guildChecks = guilds.map(async (guildId) => {
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return null;

      try {
        const member = await guild.members.fetch(userId);
        if (member && member.permissions.has('Administrator')) {
          return guildId;
        }
      } catch (err) {
        // User not in guild or error fetching
      }
      return null;
    });

    const results = await Promise.all(guildChecks);
    const adminGuilds = results.filter(g => g !== null);
    const isAdmin = adminGuilds.length > 0;

    res.json({
      success: true,
      isAdmin,
      adminGuilds
    });
  } catch (error) {
    console.error('Admin verification error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to verify admin access'
    });
  }
});

/**
 * GET /api/bot/status
 * Get bot status and metrics
 */
router.get('/bot/status', (req, res) => {
  try {
    const client = req.app.locals.discordClient;

    res.json({
      success: true,
      online: client.isReady(),
      uptime: client.uptime,
      latency: client.ws.ping,
      memory: process.memoryUsage().heapUsed,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Bot status error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/bot/info
 * Get bot information
 */
router.get('/bot/info', (req, res) => {
  try {
    const client = req.app.locals.discordClient;

    res.json({
      success: true,
      username: client.user.username,
      userId: client.user.id,
      avatar: client.user.displayAvatarURL(),
      version: require('../../package.json').version,
      prefix: process.env.PREFIX || '!',
      ready: client.isReady()
    });
  } catch (error) {
    console.error('Bot info error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/bot/stats
 * Get bot statistics
 */
router.get('/bot/stats', (req, res) => {
  try {
    const client = req.app.locals.discordClient;

    res.json({
      success: true,
      guildCount: client.guilds.cache.size,
      userCount: client.users.cache.size,
      channelCount: client.channels.cache.size,
      commandCount: client.application?.commands?.cache?.size || 0
    });
  } catch (error) {
    console.error('Bot stats error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/bot/guilds
 * Get guild list
 */
router.get('/bot/guilds', (req, res) => {
  try {
    const client = req.app.locals.discordClient;
    const guilds = client.guilds.cache;

    const guildList = Array.from(guilds.values()).map(guild => ({
      id: guild.id,
      name: guild.name,
      icon: guild.iconURL(),
      memberCount: guild.memberCount,
      owner: guild.ownerId
    }));

    res.json({
      success: true,
      guilds: guildList
    });
  } catch (error) {
    console.error('Bot guilds error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
