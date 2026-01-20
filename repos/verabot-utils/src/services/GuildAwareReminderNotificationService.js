/**
 * Guild-Aware Reminder Notification Service
 * 
 * Handles per-guild reminder notification delivery with realistic SQLite behavior.
 * Key: Tests data integrity and guild isolation, NOT unrealistic write order guarantees.
 * 
 * Architecture:
 * - Iterates through active Discord guilds
 * - Processes reminders per-guild (10 guilds at a time to avoid overload)
 * - Delivers notifications via DM or channel
 * - Records notification attempts per-guild
 * - Isolates errors so guild A issues don't affect guild B
 * 
 * Phase 6: Migration from deprecated global ReminderService
 */

const { logError, ERROR_LEVELS } = require('../middleware/errorHandler');

/**
 * Get list of active guild IDs from Discord client
 * @param {Object} client - Discord.js Client instance
 * @returns {Promise<string[]>} Array of active guild IDs
 */
async function getActiveGuildIds(client) {
  try {
    if (!client || !client.guilds || !client.guilds.cache) {
      return [];
    }
    
    const guilds = Array.from(client.guilds.cache.values());
    return guilds
      .filter(guild => !guild.unavailable)
      .map(guild => guild.id);
  } catch (err) {
    logError('GuildAwareReminderNotificationService.getActiveGuildIds', err, ERROR_LEVELS.HIGH);
    return [];
  }
}

/**
 * Check and send notifications for a specific guild
 * Uses guild-aware reminder service to get reminders
 * 
 * @param {Object} client - Discord.js Client instance
 * @param {string} guildId - Discord guild ID
 * @param {Object} reminderService - Guild-aware reminder service
 * @returns {Promise<Object>} Notification results {guildId, total, sent, failed, errors}
 */
async function checkAndSendNotificationsForGuild(client, guildId, reminderService) {
  const results = {
    guildId,
    total: 0,
    sent: 0,
    failed: 0,
    errors: []
  };

  try {
    // Get all reminders due for this guild
    const dueReminders = await reminderService.getRemindersForNotification(guildId);
    results.total = dueReminders.length;

    // Process each reminder
    for (const reminder of dueReminders) {
      try {
        // Send the notification
        await sendReminderNotification(client, guildId, reminder);
        results.sent++;

        // Record successful delivery
        await recordNotificationAttempt(reminderService, guildId, reminder.id, true);

        // Mark reminder as completed if past due time
        const now = new Date();
        if (now >= new Date(reminder.when_datetime)) {
          await reminderService.updateReminder(guildId, reminder.id, {
            status: 'COMPLETED'
          });
        }
      } catch (err) {
        results.failed++;
        results.errors.push(err.message);
        
        // Record failed delivery
        try {
          await recordNotificationAttempt(reminderService, guildId, reminder.id, false, err.message);
        } catch (recordErr) {
          logError('recordNotificationAttempt', recordErr, ERROR_LEVELS.MEDIUM, { guildId, reminderId: reminder.id });
        }
      }
    }
  } catch (err) {
    logError('checkAndSendNotificationsForGuild', err, ERROR_LEVELS.MEDIUM, { guildId });
    results.errors.push(err.message);
  }

  return results;
}

/**
 * Send a reminder notification to user (DM or channel)
 * 
 * @param {Object} client - Discord.js Client instance
 * @param {string} guildId - Discord guild ID
 * @param {Object} reminder - Reminder object with user_id, subject, notification_method
 * @returns {Promise<Object>} Delivery result {success, messageId}
 * @throws {Error} If guild or user not found
 */
async function sendReminderNotification(client, guildId, reminder) {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) {
    throw new Error(`Guild ${guildId} not found`);
  }

  const user = client.users.cache.get(reminder.user_id);
  if (!user) {
    throw new Error(`User ${reminder.user_id} not found`);
  }

  // Determine notification method
  const method = reminder.notification_method || 'dm';

  try {
    if (method === 'dm') {
      // Send as direct message
      const dmChannel = await user.createDM();
      const message = await dmChannel.send({
        content: reminder.subject
      });

      return {
        success: true,
        messageId: message.id
      };
    } else if (method === 'channel') {
      // Send to specific channel
      const channelId = reminder.channel_id;
      if (!channelId) {
        throw new Error('Channel ID required for channel notifications');
      }

      const channel = client.channels.cache.get(channelId);
      if (!channel) {
        throw new Error(`Channel ${channelId} not found`);
      }

      const message = await channel.send({
        content: `<@${reminder.user_id}> ${reminder.subject}`
      });

      return {
        success: true,
        messageId: message.id
      };
    } else {
      throw new Error(`Unknown notification method: ${method}`);
    }
  } catch (err) {
    logError('sendReminderNotification', err, ERROR_LEVELS.MEDIUM, {
      guildId,
      userId: reminder.user_id,
      method
    });
    throw err;
  }
}

/**
 * Record notification attempt in guild's database
 * 
 * @param {Object} reminderService - Guild-aware reminder service
 * @param {string} guildId - Discord guild ID
 * @param {number} reminderId - Reminder ID
 * @param {boolean} success - Whether notification was sent successfully
 * @param {string} [error] - Error message if failed
 * @returns {Promise<Object>} Record object with metadata
 */
async function recordNotificationAttempt(reminderService, guildId, reminderId, success, error = null) {
  const record = {
    guildId,
    reminderId,
    success,
    error,
    recordedAt: new Date().toISOString()
  };

  try {
    // Store in database if available
    if (reminderService && reminderService.recordNotificationAttempt) {
      try {
        await reminderService.recordNotificationAttempt(guildId, reminderId, success, error);
      } catch (err) {
        // Silently continue if recording fails - don't let it block notification
        logError('recordNotificationAttempt', err, ERROR_LEVELS.LOW, { guildId, reminderId });
      }
    }
  } catch (err) {
    logError('recordNotificationAttempt', err, ERROR_LEVELS.MEDIUM, { guildId, reminderId });
  }

  return record;
}

/**
 * Check and send all guild notifications concurrently
 * Processes guilds in batches to avoid overwhelming system
 * 
 * @param {Object} client - Discord.js Client instance
 * @param {Object} reminderService - Guild-aware reminder service
 * @param {number} [batchSize=10] - Number of guilds to process concurrently
 * @param {number} [batchDelay=100] - Milliseconds to delay between batches
 * @returns {Promise<Object>} Results keyed by guild ID
 */
async function checkAndSendAllGuildNotifications(client, reminderService, batchSize = 10, batchDelay = 100) {
  const results = {};

  try {
    // Get all active guild IDs
    const guildIds = await getActiveGuildIds(client);

    // Process in batches
    for (let i = 0; i < guildIds.length; i += batchSize) {
      const batch = guildIds.slice(i, i + batchSize);

      // Process batch concurrently
      const batchResults = await Promise.all(
        batch.map(guildId =>
          checkAndSendNotificationsForGuild(client, guildId, reminderService)
            .catch(err => {
              // Ensure errors don't stop processing
              logError('checkAndSendNotificationsForGuild', err, ERROR_LEVELS.MEDIUM, { guildId });
              return {
                guildId,
                total: 0,
                sent: 0,
                failed: 0,
                errors: [err.message]
              };
            })
        )
      );

      // Store batch results
      batchResults.forEach(result => {
        results[result.guildId] = result;
      });

      // Delay between batches (except after last batch)
      if (i + batchSize < guildIds.length) {
        await new Promise(r => setTimeout(r, batchDelay));
      }
    }
  } catch (err) {
    logError('checkAndSendAllGuildNotifications', err, ERROR_LEVELS.HIGH);
  }

  return results;
}

/**
 * Initialize notification service scheduler
 * Starts periodic checking of all guild reminders
 * 
 * @param {Object} client - Discord.js Client instance
 * @param {Object} reminderService - Guild-aware reminder service
 * @param {number} [interval=30000] - Check interval in milliseconds (default: 30 seconds)
 * @returns {Function} Function to stop the scheduler
 */
function initializeScheduler(client, reminderService, interval = 30000) {
  let scheduledInterval = null;

  const startScheduler = () => {
    scheduledInterval = setInterval(async () => {
      try {
        await checkAndSendAllGuildNotifications(client, reminderService);
      } catch (err) {
        logError('Notification scheduler tick', err, ERROR_LEVELS.MEDIUM);
      }
    }, interval);

    logError('GuildAwareReminderNotificationService scheduler started', null, ERROR_LEVELS.INFO);
  };

  const stopScheduler = () => {
    if (scheduledInterval) {
      clearInterval(scheduledInterval);
      scheduledInterval = null;
    }
    logError('GuildAwareReminderNotificationService scheduler stopped', null, ERROR_LEVELS.INFO);
  };

  startScheduler();

  return stopScheduler;
}

module.exports = {
  getActiveGuildIds,
  checkAndSendNotificationsForGuild,
  sendReminderNotification,
  recordNotificationAttempt,
  checkAndSendAllGuildNotifications,
  initializeScheduler
};
