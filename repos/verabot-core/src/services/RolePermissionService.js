/**
 * Role Permission Service
 * Manages role-based access control and command visibility
 */

const GuildDatabaseManager = require('./GuildDatabaseManager');
const roleConfig = require('../config/roles');
const { logError, ERROR_LEVELS } = require('verabot-utils/middleware/errorHandler');

class RolePermissionService {
  constructor() {
    this.roleConfig = roleConfig;
    this.cache = new Map();
    this.auditLogsEnabled = this.roleConfig.auditLogging;
    this.guildManager = GuildDatabaseManager;
  }

  /**
   * Check member's role tier in guild
   * @param {Object} member - Discord.js guild member
   * @returns {number} - Calculated tier
   */
  async checkMemberTier(member) {
    // Check if guild admin (tier 3 minimum)
    if (member.permissions.has('ADMINISTRATOR')) {
      return 3;
    }

    // Check Discord role mappings
    let maxTier = this.roleConfig.defaultTier || 1;

    for (const [roleName, tier] of Object.entries(this.roleConfig.roleMapping || {})) {
      if (member.roles.cache.some((role) => role.name === roleName)) {
        maxTier = Math.max(maxTier, tier);
      }
    }

    return maxTier;
  }

  /**
   * Get user's highest role tier in a guild
   * @param {string} userId - Discord user ID
   * @param {string} guildId - Discord guild ID
   * @param {Object} client - Discord.js client for role lookups
   * @returns {Promise<number>} - User's tier (0-4)
   */
  async getUserTier(userId, guildId, client) {
    if (!this.roleConfig.enabled) {
      return 1;
    }

    const cacheKey = `${userId}:${guildId}`;

    // Check cache
    if (this.roleConfig.cacheRoleChecks && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.roleConfig.cacheTTL * 1000) {
        return cached.tier;
      }
    }

    try {
      // Check if user is bot owner (always tier 4)
      if (this.roleConfig.botOwners && this.roleConfig.botOwners.includes(userId)) {
        this.setCacheEntry(cacheKey, 4);
        return 4;
      }

      // Fetch user from guild
      const guild = await client.guilds.fetch(guildId);
      const member = await guild.members.fetch(userId);

      if (!member) {
        this.setCacheEntry(cacheKey, 0);
        return 0;
      }

      // Check member roles
      const tier = await this.checkMemberTier(member);
      this.setCacheEntry(cacheKey, tier);
      return tier;
    } catch (err) {
      logError('RolePermissionService.getUserTier', err, ERROR_LEVELS.MEDIUM);
      this.setCacheEntry(cacheKey, 1);
      return 1; // Default to member tier on error
    }
  }

  /**
   * Check if user can execute a command
   * @param {string} userId - Discord user ID
   * @param {string} guildId - Discord guild ID
   * @param {string} commandName - Command name
   * @param {Object} client - Discord.js client
   * @returns {Promise<boolean>}
   */
  async canExecuteCommand(userId, guildId, commandName, client) {
    if (!this.roleConfig.enabled) {
      return true;
    }

    try {
      const userTier = await this.getUserTier(userId, guildId, client);
      const commandConfig = this.getCommandConfig(commandName, guildId);

      if (!commandConfig) {
        return true; // No restrictions
      }

      const canExecute = userTier >= commandConfig.minTier;

      if (this.auditLogsEnabled) {
        await this.auditLog({
          userId,
          guildId,
          commandName,
          result: canExecute ? 'EXECUTED' : 'PERMISSION_DENIED',
          userTier,
          requiredTier: commandConfig.minTier,
        });
      }

      return canExecute;
    } catch (err) {
      logError('RolePermissionService.canExecuteCommand', err, ERROR_LEVELS.MEDIUM);
      return true; // Allow on error
    }
  }

  /**
   * Check if a command is visible to a user
   * @param {string} userId - Discord user ID
   * @param {string} guildId - Discord guild ID
   * @param {string} commandName - Command name
   * @param {Object} client - Discord.js client
   * @returns {Promise<boolean>}
   */
  async isCommandVisible(userId, guildId, commandName, client) {
    if (!this.roleConfig.enabled) {return true;}

    try {
      const hasPermission = await this.canExecuteCommand(userId, guildId, commandName, client);

      if (!hasPermission) {
        if (this.auditLogsEnabled) {
          await this.auditLog({
            userId,
            guildId,
            commandName,
            result: 'HIDDEN_NO_PERMISSION',
          });
        }
        return false;
      }

      const commandConfig = this.getCommandConfig(commandName, guildId);
      if (commandConfig && commandConfig.visible === false) {
        if (this.auditLogsEnabled) {
          await this.auditLog({
            userId,
            guildId,
            commandName,
            result: 'HIDDEN_BY_CONFIG',
          });
        }
        return false;
      }

      return true;
    } catch (err) {
      logError('RolePermissionService.isCommandVisible', err, ERROR_LEVELS.MEDIUM);
      return true;
    }
  }

  /**
   * Get all commands visible to a user
   * @param {string} userId - Discord user ID
   * @param {string} guildId - Discord guild ID
   * @param {Array} allCommands - Array of all command objects
   * @param {Object} client - Discord.js client
   * @returns {Promise<Array>} - Filtered commands
   */
  async getVisibleCommands(userId, guildId, allCommands, client) {
    const visible = [];

    for (const cmd of allCommands) {
      if (await this.isCommandVisible(userId, guildId, cmd.name, client)) {
        visible.push(cmd);
      }
    }

    return visible;
  }

  /**
   * Get visible command names (for autocomplete)
   * @param {string} userId - Discord user ID
   * @param {string} guildId - Discord guild ID
   * @param {Array} allCommandNames - Array of command name strings
   * @param {Object} client - Discord.js client
   * @returns {Promise<Array>} - Filtered command names
   */
  async getVisibleCommandNames(userId, guildId, allCommandNames, client) {
    const visible = [];

    for (const name of allCommandNames) {
      if (await this.isCommandVisible(userId, guildId, name, client)) {
        visible.push(name);
      }
    }

    return visible;
  }

  /**
   * Get a user's role description
   * @param {number} tier - Role tier
   * @returns {string} - Role name and description
   */
  getRoleDescription(tier) {
    const tierConfig = this.roleConfig.tiers[tier];
    if (!tierConfig) {return 'Unknown';}
    return `${tierConfig.name} - ${tierConfig.description}`;
  }

  /**
   * Get command configuration with guild overrides
   * @param {string} commandName - Command name
   * @param {string} guildId - Guild ID for overrides
   * @returns {Object} - Command config
   */
  getCommandConfig(commandName, guildId) {
    // Check guild override
    // eslint-disable-next-line security/detect-object-injection
    const guildOverride = this.roleConfig.guildOverrides[guildId];
    if (guildOverride?.commands?.[commandName]) {
      return guildOverride.commands[commandName];
    }

    // Return default config
    // eslint-disable-next-line security/detect-object-injection
    return this.roleConfig.commands[commandName];
  }

  /**
   * Cache entry with timestamp
   * @param {string} key - Cache key
   * @param {number} tier - User tier
   */
  setCacheEntry(key, tier) {
    if (this.roleConfig.cacheRoleChecks) {
      this.cache.set(key, {
        tier,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Clear cache entry
   * @param {string} userId - User ID
   * @param {string} guildId - Guild ID
   */
  clearCacheEntry(userId, guildId) {
    const key = `${userId}:${guildId}`;
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Audit log a permission check
   * @param {Object} entry - Audit log entry
   */
  async auditLog(entry) {
    if (!this.auditLogsEnabled || !entry.guildId) {
      return;
    }

    try {
      const db = await this.guildManager.getGuildDatabase(entry.guildId);

      // Create table if it doesn't exist
      await new Promise((resolve, reject) => {
        db.run(
          `
          CREATE TABLE IF NOT EXISTS permission_audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            guild_id TEXT NOT NULL,
            command_name TEXT NOT NULL,
            result TEXT,
            user_tier INTEGER,
            required_tier INTEGER,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `,
          (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          },
        );
      });

      // Insert log entry
      await new Promise((resolve, reject) => {
        db.run(
          `
          INSERT INTO permission_audit_log
          (user_id, guild_id, command_name, result, user_tier, required_tier)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
          [
            entry.userId,
            entry.guildId,
            entry.commandName,
            entry.result,
            entry.userTier || null,
            entry.requiredTier || null,
          ],
          (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          },
        );
      });
    } catch (err) {
      logError('RolePermissionService.auditLog', err, ERROR_LEVELS.LOW);
    }
  }

  /**
   * Get audit logs for a user
   * @param {string} userId - User ID
   * @param {string} guildId - Guild ID
   * @param {number} limit - Number of results
   * @returns {Promise<Array>} - Audit log entries
   */
  async getAuditLogs(userId, guildId, limit = 50) {
    try {
      const db = await this.guildManager.getGuildDatabase(guildId);

      return new Promise((resolve, reject) => {
        db.all(
          `
          SELECT * FROM permission_audit_log
          WHERE user_id = ? AND guild_id = ?
          ORDER BY timestamp DESC
          LIMIT ?
        `,
          [userId, guildId, limit],
          (err, rows) => {
            if (err) {
              reject(err);
            } else {
              resolve(rows || []);
            }
          },
        );
      });
    } catch (err) {
      logError('RolePermissionService.getAuditLogs', err, ERROR_LEVELS.MEDIUM);
      return [];
    }
  }

  /**
   * Get all audit logs for a guild
   * @param {string} guildId - Guild ID
   * @param {number} limit - Number of results
   * @returns {Promise<Array>} - Audit log entries
   */
  async getGuildAuditLogs(guildId, limit = 100) {
    try {
      const db = await this.guildManager.getGuildDatabase(guildId);

      return new Promise((resolve, reject) => {
        db.all(
          `
          SELECT * FROM permission_audit_log
          WHERE guild_id = ?
          ORDER BY timestamp DESC
          LIMIT ?
        `,
          [guildId, limit],
          (err, rows) => {
            if (err) {
              reject(err);
            } else {
              resolve(rows || []);
            }
          },
        );
      });
    } catch (err) {
      logError('RolePermissionService.getGuildAuditLogs', err, ERROR_LEVELS.MEDIUM);
      return [];
    }
  }
}

module.exports = new RolePermissionService();
