/**
 * Dashboard Authentication Middleware
 * Verifies JWT tokens from the dashboard server
 */

import jwt from 'jsonwebtoken';

class DashboardAuthMiddleware {
  constructor() {
    this.jwtSecret = process.env.SESSION_SECRET || 'your-secret-key-change-in-production';
    this.botApiToken = process.env.BOT_API_TOKEN;
  }

  /**
   * Verify JWT token from dashboard
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Next middleware
   */
  verifyToken(req, res, next) {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'No authentication token provided',
        });
      }

      const token = authHeader.substring(7);

      // Verify JWT
      const decoded = jwt.verify(token, this.jwtSecret);
      if (!decoded) {
        return res.status(401).json({
          success: false,
          error: 'Invalid or expired token',
        });
      }

      // Attach user info to request
      req.dashboardUser = {
        userId: decoded.userId,
        username: decoded.username,
        discriminator: decoded.discriminator,
        avatar: decoded.avatar,
      };

      next();
    } catch (error) {
      console.error('Dashboard auth error:', error.message);
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
      });
    }
  }

  /**
   * Verify bot API token (for server-to-server communication)
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Next middleware
   */
  verifyBotToken(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'No API token provided',
        });
      }

      const token = authHeader.substring(7);

      if (this.botApiToken && token !== this.botApiToken) {
        return res.status(401).json({
          success: false,
          error: 'Invalid API token',
        });
      }

      next();
    } catch (error) {
      console.error('Bot API auth error:', error.message);
      return res.status(401).json({
        success: false,
        error: 'API authentication failed',
      });
    }
  }

  /**
   * Check if user has admin permissions
   * @param {Object} client - Discord client
   * @returns {Function} Middleware function
   */
  checkAdminPermission(client) {
    return async (req, res, next) => {
      try {
        const userId = req.dashboardUser?.userId;
        if (!userId) {
          return res.status(401).json({
            success: false,
            error: 'User not authenticated',
          });
        }

        // Check if user is bot owner
        const botOwnerId = process.env.BOT_OWNER_ID;
        if (botOwnerId && userId === botOwnerId) {
          req.isAdmin = true;
          return next();
        }

        // Check if user has admin role in any guild
        const guilds = client.guilds.cache;
        let isAdmin = false;

        for (const [, guild] of guilds) {
          try {
            const member = await guild.members.fetch(userId).catch(() => null);
            if (member && member.permissions.has('Administrator')) {
              isAdmin = true;
              break;
            }
          } catch {
            // Continue checking other guilds
          }
        }

        req.isAdmin = isAdmin;

        if (!isAdmin) {
          return res.status(403).json({
            success: false,
            error: 'Insufficient permissions',
          });
        }

        next();
      } catch (error) {
        console.error('Permission check error:', error.message);
        return res.status(500).json({
          success: false,
          error: 'Failed to verify permissions',
        });
      }
    };
  }

  /**
   * Log dashboard access
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Next middleware
   */
  logAccess(req, res, next) {
    const user = req.dashboardUser;
    const timestamp = new Date().toISOString();
    console.log(`[Dashboard] ${timestamp} - ${user?.username || 'Unknown'} accessed ${req.method} ${req.path}`);
    next();
  }
}

export default new DashboardAuthMiddleware();

