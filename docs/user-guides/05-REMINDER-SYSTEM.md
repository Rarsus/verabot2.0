# Reminder System Guide

## Overview

The Reminder Management System is a comprehensive feature for VeraBot 2.0 that enables users to create, manage, and receive automated reminders. The system supports scheduled notifications, user/role assignments, rich content including links and images, and flexible filtering and searching capabilities.

**Version:** 3.0.0  
**Status:** Production Ready

## Features

### Core Capabilities

- **CRUD Operations:** Complete Create, Read, Update, Delete functionality
- **Scheduled Notifications:** Automatic delivery at specified times
- **User & Role Assignments:** Assign reminders to individuals or entire roles
- **Rich Content:** Support for descriptions, links, and images
- **Categorization:** Organize reminders by category
- **Search & Filter:** Powerful querying capabilities
- **Notification History:** Track delivery status and failures

### Notification System

- **Automatic Delivery:** Reminders sent at scheduled times
- **DM Notifications:** Direct messages for individual users
- **Role Mentions:** Public announcements for role-based reminders
- **Configurable Timing:** Set notification time independently of event time
- **Retry Logic:** Automatic retry on delivery failures
- **Status Tracking:** Monitor successful and failed notifications

## Commands

### create-reminder

Create a new reminder with all required and optional fields.

**Usage:**
```
/create-reminder subject:<text> category:<text> when:<datetime> who:<user_or_role> [content:<text>] [link:<url>] [image:<url>]
```

**Parameters:**
- `subject` (required) - Reminder title (3-200 characters)
- `category` (required) - Category for organization (e.g., Meeting, Task, Event)
- `when` (required) - Event date/time (ISO format or natural language)
- `who` (required) - User ID or "role:ROLE_ID" for role assignment
- `content` (optional) - Detailed description (max 2000 characters)
- `link` (optional) - Associated URL
- `image` (optional) - Image URL for visualization

**Example:**
```
/create-reminder 
  subject:Team Standup 
  category:Meeting 
  when:2024-12-31T10:00:00Z 
  who:123456789
  content:Daily team standup meeting
  link:https://meet.example.com/standup
```

**Response:**
```
✅ Reminder #42 created successfully! It will be sent at the specified time.
```

### get-reminder

Retrieve and display details of a specific reminder.

**Usage:**
```
/get-reminder id:<number>
```

**Parameters:**
- `id` (required) - Reminder ID

**Example:**
```
/get-reminder id:42
```

**Response:**
An embed displaying:
- Subject and category
- Status (active, completed, cancelled)
- Event time and notification time
- Content, link, and image (if provided)
- Assigned users/roles

### update-reminder

Update one or more fields of an existing reminder.

**Usage:**
```
/update-reminder id:<number> [subject:<text>] [category:<text>] [when:<datetime>] [content:<text>] [link:<url>] [image:<url>] [status:<status>]
```

**Parameters:**
- `id` (required) - Reminder ID
- All other parameters are optional; provide only what you want to update

**Example:**
```
/update-reminder id:42 subject:Updated Meeting Title status:completed
```

**Response:**
```
✅ Reminder #42 updated successfully!
```

### delete-reminder

Delete a reminder (soft delete by default).

**Usage:**
```
/delete-reminder id:<number> [hard:<boolean>]
```

**Parameters:**
- `id` (required) - Reminder ID
- `hard` (optional) - If true, permanently deletes; if false (default), cancels

**Example:**
```
/delete-reminder id:42 hard:false
```

**Response:**
```
✅ Reminder #42 cancelled successfully!
```

### list-reminders

List reminders with optional filters and pagination.

**Usage:**
```
/list-reminders [status:<status>] [category:<category>] [assignee:<user_id>] [page:<number>]
```

**Parameters:**
- `status` (optional) - Filter by status (active, completed, cancelled)
- `category` (optional) - Filter by category
- `assignee` (optional) - Filter by assigned user ID
- `page` (optional) - Page number for pagination (10 per page)

**Example:**
```
/list-reminders status:active category:Meeting
```

**Response:**
An embed listing up to 10 reminders per page with:
- Reminder ID and subject
- Category and relative time
- Status indicator (🟢 active, ✅ completed, ⚫ cancelled)

### search-reminders

Search reminders by keyword across subject, category, and content.

**Usage:**
```
/search-reminders keyword:<text> [page:<number>]
```

**Parameters:**
- `keyword` (required) - Search term (min 2 characters)
- `page` (optional) - Page number for pagination

**Example:**
```
/search-reminders keyword:standup page:1
```

**Response:**
An embed showing matching reminders with keyword context highlighted.

## Database Schema

### reminders Table

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| subject | TEXT | Reminder title (required) |
| category | TEXT | Category for organization (required) |
| when_datetime | TEXT | Event date/time ISO format (required) |
| content | TEXT | Detailed description (optional) |
| link | TEXT | Associated URL (optional) |
| image | TEXT | Image URL (optional) |
| notificationTime | TEXT | When notification should be sent (required) |
| status | TEXT | active, completed, or cancelled (default: active) |
| createdAt | DATETIME | Creation timestamp |
| updatedAt | DATETIME | Last update timestamp |

### reminder_assignments Table

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| reminderId | INTEGER | Foreign key to reminders |
| assigneeType | TEXT | 'user' or 'role' |
| assigneeId | TEXT | User ID or Role ID |
| createdAt | DATETIME | Creation timestamp |

### reminder_notifications Table

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| reminderId | INTEGER | Foreign key to reminders |
| sentAt | DATETIME | When notification was sent |
| success | INTEGER | 1 if successful, 0 if failed |
| errorMessage | TEXT | Error details if failed |

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Reminder notification channel (required for role notifications)
REMINDER_NOTIFICATION_CHANNEL=channel_id

# Check interval in milliseconds (default: 60000 = 1 minute)
REMINDER_CHECK_INTERVAL=60000

# Timezone for reminder times (default: UTC)
REMINDER_TIMEZONE=UTC
```

### Notification Service Initialization

The notification service is automatically initialized when the bot starts. It checks for due reminders every minute by default.

## Usage Examples

### Example 1: Create a Meeting Reminder

```
/create-reminder
  subject:Weekly Team Sync
  category:Meeting
  when:2024-12-29T15:00:00Z
  who:123456789
  content:Discuss sprint progress and blockers
  link:https://meet.company.com/weekly-sync
```

### Example 2: Create a Role-Based Reminder

```
/create-reminder
  subject:Code Review Deadline
  category:Deadline
  when:2024-12-30T17:00:00Z
  who:role:987654321
  content:All PRs must be reviewed by EOD
```

### Example 3: List Active Reminders

```
/list-reminders status:active
```

### Example 4: Search for Reminders

```
/search-reminders keyword:meeting
```

### Example 5: Update Reminder Status

```
/update-reminder id:42 status:completed
```

## Architecture

### Service Layer

**ReminderService.js**
- Core CRUD operations
- Input validation and sanitization
- Database abstraction
- Assignment management

**ReminderNotificationService.js**
- Scheduled notification checking
- Embed generation
- User/role notification routing
- Delivery tracking

### Command Layer

All commands extend from `CommandBase` and follow the established patterns:
- Automatic error handling
- Consistent response formatting
- Both slash and prefix command support
- Input validation

### Database Layer

- SQLite backend
- Foreign key constraints enabled
- Cascading deletes for referential integrity
- Indexed columns for performance

## Best Practices

### Creating Reminders

1. **Use descriptive subjects** - Make it easy to identify at a glance
2. **Choose appropriate categories** - Helps with filtering and organization
3. **Set correct timezone** - Ensure times are in the expected timezone
4. **Add context in content** - Provide details that will be useful later
5. **Include links when relevant** - Direct access to meetings or resources

### Managing Reminders

1. **Regular cleanup** - Delete or mark completed reminders as done
2. **Use soft delete** - Preserve history unless absolutely necessary to purge
3. **Filter effectively** - Use status and category filters to find reminders
4. **Search when needed** - Keyword search across all fields

### Notifications

1. **Configure notification channel** - Required for role-based reminders
2. **Test notification delivery** - Verify DMs and channel messages work
3. **Monitor notification logs** - Check for delivery failures
4. **Adjust check interval** - Balance between responsiveness and performance

## Troubleshooting

### Notifications Not Sending

**Problem:** Reminders created but notifications not delivered

**Solutions:**
1. Check `REMINDER_NOTIFICATION_CHANNEL` is set for role notifications
2. Verify bot has permission to DM users
3. Check bot has permission to post in notification channel
4. Verify notification service is running (`index.js` initialization)

### Can't Create Reminder

**Problem:** Error when creating reminder

**Solutions:**
1. Verify all required fields are provided
2. Check datetime format (use ISO 8601)
3. Ensure subject meets length requirements (3-200 chars)
4. Validate URL format for links and images

### Can't Find Reminders

**Problem:** List or search returns no results

**Solutions:**
1. Check filter values match actual data
2. Try broader search terms
3. Verify reminders exist with correct status
4. Check pagination - may be on different page

## API Integration

### Programmatic Access

Services can be accessed programmatically:

```javascript
const {
  createReminder,
  getReminderById,
  updateReminder,
  deleteReminder,
  listReminders,
  searchReminders
} = require('./src/services/ReminderService');

// Create a reminder
const reminderId = await createReminder({
  subject: 'Test Reminder',
  category: 'Task',
  when: '2024-12-31T10:00:00Z',
  content: 'Testing programmatic access'
});

// Get reminder
const reminder = await getReminderById(reminderId);

// List with filters
const activeReminders = await listReminders({ 
  status: 'active',
  limit: 20 
});
```

## Future Enhancements

Potential improvements for future versions:

- **Recurring reminders** - Support for daily, weekly, monthly repeats
- **Advanced notification timing** - Multiple notifications per reminder
- **Reminder templates** - Pre-defined reminder formats
- **Timezone support** - Per-user timezone preferences
- **Reminder sharing** - Share reminders between users
- **Calendar integration** - Export to iCal or Google Calendar
- **Webhook notifications** - Send notifications to external systems
- **Reminder analytics** - Statistics and insights dashboard

## Support

For issues, questions, or contributions:

- **Repository:** https://github.com/Rarsus/verabot2.0
- **Documentation:** See `/docs` directory
- **Issues:** Use GitHub Issues for bug reports

## Changelog

### v3.0.0 (December 2024)

- Initial release of Reminder Management System
- Full CRUD operations for reminders
- Scheduled notification system
- User and role assignment support
- Rich content support (links, images)
- Search and filtering capabilities
- Comprehensive test coverage (37 tests)
- Complete documentation

---

**Last Updated:** December 27, 2024  
**Version:** 3.0.0
