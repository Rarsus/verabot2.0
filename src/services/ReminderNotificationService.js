/**
 * Reminder Notification Service
 * Handles scheduled notification delivery for reminders
 */

const { EmbedBuilder } = require('discord.js');
const { getRemindersForNotification, recordNotification, updateReminder } = require('./ReminderService');
const { REMINDER_STATUS, NOTIFICATION_DEFAULTS } = require('../utils/constants/reminder-constants');
const { logError, ERROR_LEVELS } = require('../utils/error-handler');

// Store the check interval timer
let notificationInterval = null;
let client = null;

/**
 * Initialize notification service
 * @param {Client} discordClient - Discord client instance
 */
function initializeNotificationService(discordClient) {
  client = discordClient;

  // Start notification checker
  if (!notificationInterval) {
    const checkInterval = parseInt(process.env.REMINDER_CHECK_INTERVAL) || NOTIFICATION_DEFAULTS.CHECK_INTERVAL;
    notificationInterval = setInterval(checkAndSendNotifications, checkInterval);
    console.log(`✅ Reminder notification service initialized (checking every ${checkInterval}ms)`);
  }
}

/**
 * Stop notification service
 */
function stopNotificationService() {
  if (notificationInterval) {
    clearInterval(notificationInterval);
    notificationInterval = null;
    console.log('✅ Reminder notification service stopped');
  }
}

/**
 * Check for and send due notifications
 */
async function checkAndSendNotifications() {
  try {
    const dueReminders = await getRemindersForNotification();

    for (const reminder of dueReminders) {
      try {
        await sendReminderNotification(reminder);
        await recordNotification(reminder.id, true);

        // Mark reminder as completed if it's past the event time
        const now = new Date();
        const eventTime = new Date(reminder.when_datetime);
        if (now >= eventTime) {
          await updateReminder(reminder.id, { status: REMINDER_STATUS.COMPLETED });
        }
      } catch (err) {
        logError('ReminderNotificationService.sendNotification', err, ERROR_LEVELS.MEDIUM, {
          reminderId: reminder.id
        });
        await recordNotification(reminder.id, false, err.message);
      }
    }
  } catch (err) {
    logError('ReminderNotificationService.checkAndSendNotifications', err, ERROR_LEVELS.HIGH);
  }
}

/**
 * Create reminder embed
 * @param {Object} reminder - Reminder object
 * @returns {EmbedBuilder} Discord embed
 */
function createReminderEmbed(reminder) {
  const embed = new EmbedBuilder()
    .setTitle(`🔔 Reminder: ${reminder.subject}`)
    .setColor(0xFFD700)
    .addFields([
      { name: '📅 When', value: formatDateTime(reminder.when_datetime), inline: true },
      { name: '📂 Category', value: reminder.category, inline: true }
    ])
    .setTimestamp()
    .setFooter({ text: `Reminder ID: ${reminder.id}` });

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
  const date = new Date(datetime);
  return `<t:${Math.floor(date.getTime() / 1000)}:F>`;
}

/**
 * Send reminder notification
 * @param {Object} reminder - Reminder object with assignments
 */
async function sendReminderNotification(reminder) {
  if (!client) {
    throw new Error('Discord client not initialized');
  }

  const embed = createReminderEmbed(reminder);

  // Parse assignees (format: "type:id,type:id")
  const assignees = reminder.assignees ? reminder.assignees.split(',') : [];

  const sent = {
    users: [],
    roles: [],
    errors: []
  };

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
      logError('ReminderNotificationService.sendReminderNotification.malformedId',
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
        assigneeId: id
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
      embeds: [embed]
    });
  } catch (err) {
    throw new Error(`Failed to send role notification: ${err.message}`);
  }
}

/**
 * Manually trigger notification check (for testing)
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
  sendReminderNotification
};
