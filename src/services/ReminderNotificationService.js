/**
 * Reminder Notification Service (Wrapper)
 * 
 * DEPRECATED WRAPPER: This service wraps GuildAwareReminderNotificationService
 * 
 * Migration Status (Phase 6):
 * - ✅ Delegates to guild-aware service
 * - ✅ Maintains backward compatibility with existing code
 * - ✅ Uses guild-aware reminder service
 * - ⏳ Remove this wrapper in v0.4.0 (April 2026)
 * 
 * See: docs/reference/DB-DEPRECATION-TIMELINE.md
 */

const { EmbedBuilder } = require('discord.js');
const { logError, ERROR_LEVELS } = require('../middleware/errorHandler');
const {
  getActiveGuildIds,
  checkAndSendAllGuildNotifications,
  initializeScheduler,
} = require('./GuildAwareReminderNotificationService');

// Guild-aware reminder service (injected at runtime)
let guildAwareReminderService = null;

// Store the scheduler interval handle
let notificationScheduler = null;
let client = null;

/**
 * Initialize notification service
 * @param {Client} discordClient - Discord client instance
 * @param {Object} reminderService - Guild-aware reminder service instance
 */
function initializeNotificationService(discordClient, reminderService) {
  client = discordClient;
  guildAwareReminderService = reminderService;

  // Start notification scheduler using guild-aware service
  if (!notificationScheduler && client && guildAwareReminderService) {
    const checkInterval = parseInt(process.env.REMINDER_CHECK_INTERVAL) || 30000; // 30 seconds default
    
    notificationScheduler = initializeScheduler(
      client,
      guildAwareReminderService,
      checkInterval
    );
    
    console.log(`✅ Reminder notification service initialized (checking every ${checkInterval}ms)`);
  }
}

/**
 * Stop notification service
 */
function stopNotificationService() {
  if (notificationScheduler) {
    clearInterval(notificationScheduler);
    notificationScheduler = null;
    console.log('✅ Reminder notification service stopped');
  }
}

/**
 * Check for and send due notifications (wrapper for backward compatibility)
 */
async function checkAndSendNotifications() {
  if (!client || !guildAwareReminderService) {
    logError(
      'ReminderNotificationService.checkAndSendNotifications',
      new Error('Service not properly initialized'),
      ERROR_LEVELS.HIGH
    );
    return;
  }

  try {
    await checkAndSendAllGuildNotifications(client, guildAwareReminderService);
  } catch (err) {
    logError('ReminderNotificationService.checkAndSendNotifications', err, ERROR_LEVELS.HIGH);
  }
}

/**
 * Create reminder embed (backward compatibility helper)
 * @param {Object} reminder - Reminder object
 * @returns {EmbedBuilder} Discord embed
 * 
 * DEPRECATED: Use GuildAwareReminderNotificationService.sendReminderNotification instead
 */
function createReminderEmbed(reminder) {
  const embed = new EmbedBuilder()
    .setTitle(`🔔 Reminder: ${reminder.subject || reminder.text || 'Untitled'}`)
    .setColor(0xffd700)
    .setTimestamp()
    .setFooter({ text: `Reminder ID: ${reminder.id}` });

  if (reminder.when_datetime) {
    embed.addFields([
      { name: '📅 When', value: formatDateTime(reminder.when_datetime), inline: true },
    ]);
  }

  if (reminder.category) {
    embed.addFields([
      { name: '📂 Category', value: reminder.category, inline: true },
    ]);
  }

  if (reminder.content) {
    embed.setDescription(reminder.content);
  }

  if (reminder.link) {
    embed.addFields({ name: '🔗 Link', value: reminder.link });
  }

  if (reminder.image) {
    embed.setImage(reminder.image);
  }

  return embed;
}

/**
 * Format datetime for display
 * @param {string} datetime - ISO datetime string
 * @returns {string} Formatted datetime
 */
function formatDateTime(datetime) {
  try {
    const date = new Date(datetime);
    const timestamp = Math.floor(date.getTime() / 1000);
    return `<t:${timestamp}:F>`;
  } catch (err) {
    return datetime;
  }
}

/**
 * Send reminder notification (backward compatibility wrapper)
 * @param {Object} reminder - Reminder object with assignments
 * @returns {Promise<Object>} Notification results
 * 
 * DEPRECATED: Use GuildAwareReminderNotificationService.sendReminderNotification instead
 */
async function sendReminderNotification(reminder) {
  if (!client) {
    throw new Error('Discord client not initialized');
  }

  const embed = createReminderEmbed(reminder);

  const sent = {
    users: [],
    roles: [],
    errors: [],
  };

  // Parse assignees (format: "type:id,type:id")
  const assignees = reminder.assignees ? reminder.assignees.split(',') : [];

  for (const assignee of assignees) {
    const [type, rawId] = assignee.split(':');

    // Extract snowflake ID from mention format if present
    let id = rawId;
    const mentionMatch = rawId.match(/<@!?&?(\d+)>/);
    if (mentionMatch) {
      id = mentionMatch[1];
    }

    // Validate ID format
    if (!id || !/^\d+$/.test(id)) {
      logError(
        'ReminderNotificationService.sendReminderNotification.malformedId',
        new Error(`Invalid ID format: ${rawId}`),
        ERROR_LEVELS.LOW,
        { assigneeType: type, assigneeId: rawId }
      );
      sent.errors.push({ type, id: rawId, error: 'Invalid ID format' });
      continue;
    }

    try {
      if (type === 'user') {
        await sendUserNotification(id, embed);
        sent.users.push(id);
      } else if (type === 'role') {
        await sendRoleNotification(id, embed);
        sent.roles.push(id);
      }
    } catch (err) {
      logError('ReminderNotificationService.sendReminderNotification.assignee', err, ERROR_LEVELS.LOW, {
        assigneeType: type,
        assigneeId: id,
      });
      sent.errors.push({ type, id, error: err.message });
    }
  }

  // If no assignees, log warning
  if (assignees.length === 0) {
    logError(
      'ReminderNotificationService.sendReminderNotification',
      new Error('No assignees for reminder'),
      ERROR_LEVELS.LOW,
      { reminderId: reminder.id }
    );
  }

  return sent;
}

/**
 * Send notification to a user via DM
 * @param {string} userId - User ID
 * @param {EmbedBuilder} embed - Notification embed
 * 
 * DEPRECATED: Use GuildAwareReminderNotificationService.sendReminderNotification instead
 */
async function sendUserNotification(userId, embed) {
  try {
    const user = await client.users.fetch(userId);
    await user.send({ embeds: [embed] });
  } catch (err) {
    throw new Error(`Failed to send DM to user ${userId}: ${err.message}`);
  }
}

/**
 * Send notification to a role in designated channel
 * @param {string} roleId - Role ID
 * @param {EmbedBuilder} embed - Notification embed
 * 
 * DEPRECATED: Use GuildAwareReminderNotificationService.sendReminderNotification instead
 */
async function sendRoleNotification(roleId, embed) {
  const channelId = process.env.REMINDER_NOTIFICATION_CHANNEL;

  if (!channelId) {
    throw new Error('REMINDER_NOTIFICATION_CHANNEL not configured');
  }

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) {
      throw new Error('Notification channel not found');
    }

    await channel.send({
      content: `<@&${roleId}>`,
      embeds: [embed],
    });
  } catch (err) {
    throw new Error(`Failed to send role notification: ${err.message}`);
  }
}

/**
 * Manually trigger notification check (for testing)
 * DEPRECATED: Use checkAndSendNotifications instead
 */
async function triggerNotificationCheck() {
  await checkAndSendNotifications();
}

module.exports = {
  initializeNotificationService,
  stopNotificationService,
  checkAndSendNotifications,
  triggerNotificationCheck,
  createReminderEmbed,
  sendReminderNotification,
};
