const authorizationService = require('../services/authorization-service');

/**
 * Authorization middleware
 * Verifies user is in the allowed users list
 */
function authorizationMiddleware(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const userId = req.user.userId;

    if (!authorizationService.isUserAllowed(userId)) {
      console.warn(`⚠️  Unauthorized access attempt by user ${userId}`);
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to access the dashboard',
      });
    }

    // Attach permission info to request
    req.user.isAdmin = authorizationService.isUserAdmin(userId);
    next();
  } catch (error) {
    console.error('Authorization error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Authorization check failed',
    });
  }
}

/**
 * Admin-only middleware
 * Requires user to be an admin
 */
function adminMiddleware(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    if (!authorizationService.isUserAdmin(req.user.userId)) {
      console.warn(`⚠️  Admin access attempt by non-admin user ${req.user.userId}`);
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
    }

    next();
  } catch (error) {
    console.error('Admin authorization error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Admin authorization check failed',
    });
  }
}

/**
 * Guild admin middleware
 * Requires user to be admin of the specified guild
 */
function guildAdminMiddleware(req, res, next) {
  try {
    const { guildId } = req.params;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    if (!guildId) {
      return res.status(400).json({
        success: false,
        error: 'Guild ID required',
      });
    }

    const userGuilds = req.user.guilds || [];

    if (!authorizationService.isGuildAdmin(req.user.userId, guildId, userGuilds)) {
      console.warn(`⚠️  Guild admin access attempt by user ${req.user.userId} for guild ${guildId}`);
      return res.status(403).json({
        success: false,
        error: 'You must be an admin of this guild to manage it',
      });
    }

    next();
  } catch (error) {
    console.error('Guild authorization error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Guild authorization check failed',
    });
  }
}

module.exports = {
  authorizationMiddleware,
  adminMiddleware,
  guildAdminMiddleware,
};
