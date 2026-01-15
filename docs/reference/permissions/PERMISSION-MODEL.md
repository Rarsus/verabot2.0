# Permission Model & User Access Control

## Overview

VeraBot2.0 implements a **permission-based access control system** with two complementary approaches:

1. **Discord Administrator Permission** - For admin-only commands
2. **User/Role Assignment System** - For targeted features (reminders)

---

## 1. Administrator Permission Model

### For Admin Commands

Admin commands require Discord's **Administrator** permission flag. This is checked using Discord.js's built-in permission system.

**File:** [src/utils/proxy-helpers.js](src/utils/proxy-helpers.js#L39)

```javascript
function checkAdminPermission(interaction) {
  try {
    if (!interaction.member) {
      return false;
    }

    return interaction.member.permissions.has(PermissionFlagsBits.Administrator);
  } catch (err) {
    console.error('Error checking admin permission:', err);
    return false;
  }
}
```

### Usage in Commands

Admin commands check permissions at the start of execution:

**File:** [src/commands/admin/proxy-config.js](src/commands/admin/proxy-config.js#L82)

```javascript
async executeInteraction(interaction) {
  // Check admin permission FIRST
  if (!checkAdminPermission(interaction)) {
    await sendError(interaction, 'This command requires Administrator permissions.', true);
    return;
  }

  // Continue with command logic...
}
```

### Admin Commands Available

| Command        | Location                                                                 | Purpose                          |
| -------------- | ------------------------------------------------------------------------ | -------------------------------- |
| `proxy-config` | [src/commands/admin/proxy-config.js](src/commands/admin/proxy-config.js) | Configure webhook proxy settings |
| `proxy-enable` | [src/commands/admin/proxy-enable.js](src/commands/admin/proxy-enable.js) | Enable/disable message proxy     |
| `proxy-status` | [src/commands/admin/proxy-status.js](src/commands/admin/proxy-status.js) | Check proxy configuration status |

---

## 2. User & Role Assignment System

### For Reminder Assignments

The reminder system supports assigning reminders to **individual users** or **entire roles**.

### Assignment Format

Reminders can be assigned using:

```
user:[USER_ID]      # Direct user assignment
role:[ROLE_ID]      # Role-based assignment
[USER_ID]           # Shorthand for user
<@USER_ID>          # Discord mention format
<@&ROLE_ID>         # Discord role mention format
```

### How It Works

**File:** [src/commands/reminder-management/create-reminder.js](src/commands/reminder-management/create-reminder.js#L26)

```javascript
// Parse assignee (format: "role:123456" or "123456" for user, or mention format)
let assigneeType = 'user';
let assigneeId = who;

if (who.startsWith('role:')) {
  assigneeType = 'role';
  assigneeId = who.substring(5);
}

// Extract snowflake ID from mention format (<@123456> or <@&123456>)
const mentionMatch = assigneeId.match(/<@!?&?(\d+)>/);
if (mentionMatch) {
  assigneeId = mentionMatch[1];
  if (who.includes('<@&')) {
    assigneeType = 'role';
  }
}
```

### Database Storage

**File:** [src/services/ReminderService.js](src/services/ReminderService.js#L216)

```javascript
async function addReminderAssignment(reminderId, assigneeType, assigneeId) {
  const db = getDatabase();

  if (!['user', 'role'].includes(assigneeType)) {
    throw new Error('Assignee type must be "user" or "role"');
  }

  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO reminder_assignments (reminderId, assigneeType, assigneeId) VALUES (?, ?, ?)',
      [reminderId, assigneeType, assigneeId],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
}
```

### Notification Delivery

When a reminder is triggered, notifications are sent based on assignment type:

**File:** [src/services/ReminderNotificationService.js](src/services/ReminderNotificationService.js#L154)

#### User Notifications (via DM)

```javascript
if (type === 'user') {
  await sendUserNotification(id, embed);
  sent.users.push(id);
}
```

```javascript
async function sendUserNotification(userId, embed) {
  try {
    const user = await client.users.fetch(userId);
    await user.send({ embeds: [embed] });
  } catch (err) {
    throw new Error(`Failed to send DM to user ${userId}: ${err.message}`);
  }
}
```

#### Role Notifications (in designated channel)

```javascript
else if (type === 'role') {
  await sendRoleNotification(id, embed);
  sent.roles.push(id);
}
```

```javascript
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
      content: `<@&${roleId}>`, // Ping the role
      embeds: [embed],
    });
  } catch (err) {
    throw new Error(`Failed to send role notification: ${err.message}`);
  }
}
```

---

## 3. Database Schema

### Permission-Related Tables

#### reminder_assignments

Stores user and role assignments for reminders.

| Column         | Type                                | Description                    |
| -------------- | ----------------------------------- | ------------------------------ |
| `id`           | INTEGER PRIMARY KEY                 | Assignment ID                  |
| `reminderId`   | INTEGER NOT NULL                    | Foreign key to reminders table |
| `assigneeType` | TEXT NOT NULL                       | 'user' or 'role'               |
| `assigneeId`   | TEXT NOT NULL                       | Discord User ID or Role ID     |
| `createdAt`    | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | Creation timestamp             |

**File:** [src/services/ReminderService.js](src/services/ReminderService.js)

---

## 4. Configuration

### Environment Variables

**File:** [.env](.env)

```env
# Admin-only command role IDs (optional)
# Users with these roles can execute admin commands
# Example: ADMIN_ROLE_IDS=123456789012345678,987654321098765432
ADMIN_ROLE_IDS=

# Reminder notification channel
# Required for role-based reminder notifications
REMINDER_NOTIFICATION_CHANNEL=

# Optional: Users who can bypass role checks (super-admin)
# Example: PRIVILEGED_USER_IDS=123456789012345678,987654321098765432
PRIVILEGED_USER_IDS=
```

---

## 5. Permission Flow Examples

### Example 1: Creating an Admin-Only Command

```javascript
const Command = require('../../core/CommandBase');
const { checkAdminPermission } = require('../../utils/proxy-helpers');
const { sendError, sendSuccess } = require('../../utils/helpers/response-helpers');

class MyAdminCommand extends Command {
  async executeInteraction(interaction) {
    // Step 1: Check admin permission
    if (!checkAdminPermission(interaction)) {
      await sendError(interaction, 'This command requires Administrator permissions.', true);
      return;
    }

    // Step 2: Execute admin logic
    // ...
    await sendSuccess(interaction, 'Admin action completed!');
  }
}
```

### Example 2: Creating a Reminder for a User

```javascript
// User runs: /create-reminder subject:"Team Meeting" when:"tomorrow 2pm" who:"@alice"
const reminderId = await createReminder({
  subject: 'Team Meeting',
  when: 'tomorrow 2pm',
});

// Assign to user
await addReminderAssignment(reminderId, 'user', '123456789');

// At reminder time: Alice receives DM with reminder details
```

### Example 3: Creating a Reminder for a Role

```javascript
// User runs: /create-reminder subject:"Daily Standup" when:"tomorrow 9am" who:"role:123456"
const reminderId = await createReminder({
  subject: 'Daily Standup',
  when: 'tomorrow 9am',
});

// Assign to role
await addReminderAssignment(reminderId, 'role', '123456789');

// At reminder time: Message posted in REMINDER_NOTIFICATION_CHANNEL:
// "@role_name [embed with reminder details]"
```

---

## 6. Security Considerations

### Admin Permission Checks

- Always check at the **beginning** of command execution
- Use Discord's native `PermissionFlagsBits.Administrator`
- Return immediately with error if check fails
- Never attempt to proceed with admin operations without validation

### User/Role Assignment

- Validate snowflake ID format: `/^\d+$/` (must be 17-19 digits)
- Support both explicit format (`role:123`) and mention format (`<@&123>`)
- Store as TEXT in database for flexibility
- Validate assignee type is either 'user' or 'role'

### Notification Delivery

- User notifications: Requires user to be fetchable and have DMs enabled
- Role notifications: Requires `REMINDER_NOTIFICATION_CHANNEL` configured
- Gracefully handle failures (user left server, DMs closed, etc.)

---

## 7. Testing

### Admin Permission Tests

**File:** [tests/unit/test-proxy-commands.js](tests/unit/test-proxy-commands.js#L235)

```javascript
async function testAdminPermissionChecks() {
  // Test 1: Admin user
  const adminInteraction = new MockInteraction(true);
  assert.strictEqual(checkAdminPermission(adminInteraction), true, 'Should allow admin users');

  // Test 2: Non-admin user
  const nonAdminInteraction = new MockInteraction(false);
  assert.strictEqual(checkAdminPermission(nonAdminInteraction), false, 'Should deny non-admin users');
}
```

---

## 8. Common Patterns

### Check Permission Pattern

```javascript
if (!checkAdminPermission(interaction)) {
  await sendError(interaction, 'Admin permissions required', true);
  return;
}
```

### Parse User/Role from Input Pattern

```javascript
let assigneeType = 'user';
let assigneeId = input;

if (input.startsWith('role:')) {
  assigneeType = 'role';
  assigneeId = input.substring(5);
}

const mentionMatch = assigneeId.match(/<@!?&?(\d+)>/);
if (mentionMatch) {
  assigneeId = mentionMatch[1];
  if (input.includes('<@&')) assigneeType = 'role';
}
```

### Validate Snowflake Format Pattern

```javascript
if (!/^\d+$/.test(assigneeId)) {
  throw new Error('Invalid ID format. Must be numeric snowflake ID.');
}
```

---

## 9. Future Enhancements

Potential improvements to the permission system:

1. **Role-Based Permission Levels**
   - Define custom role hierarchy
   - Check role level instead of just Administrator

2. **Command-Specific Permissions**
   - Configure which roles can use which commands
   - Per-command permission requirements

3. **Audit Logging**
   - Log who executed admin commands
   - Log permission check failures
   - Track unauthorized access attempts

4. **Delegation**
   - Allow admins to delegate specific permissions
   - Temporary permission grants

5. **Rate Limiting**
   - Limit how many reminders a user can create
   - Limit admin command usage frequency

---

## Summary

| Feature            | Method                             | Scope                         |
| ------------------ | ---------------------------------- | ----------------------------- |
| **Admin Commands** | Discord `Administrator` permission | Server-wide, all admins       |
| **Reminder Users** | Direct user ID assignment          | Individual users (DM)         |
| **Reminder Roles** | Role ID assignment                 | All members of role (channel) |

The permission model is intentionally simple to start, with room for expansion as the bot's features grow.
