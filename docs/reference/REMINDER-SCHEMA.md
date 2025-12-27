# Reminder System Database Schema Reference

## Overview

This document provides a comprehensive reference for the Reminder System database schema, including table structures, relationships, indexes, and constraints.

**Database Type:** SQLite3  
**Version:** 3.0.0  
**Last Updated:** December 27, 2024

## Entity-Relationship Diagram

```
┌─────────────────────────────────────┐
│           reminders                  │
├─────────────────────────────────────┤
│ id (PK)                              │
│ subject                              │
│ category                             │
│ when_datetime                        │
│ content                              │
│ link                                 │
│ image                                │
│ notificationTime                     │
│ status                               │
│ createdAt                            │
│ updatedAt                            │
└──────────────┬──────────────────────┘
               │
               │ 1:N
               │
      ┌────────┴────────┐
      │                 │
      ▼                 ▼
┌─────────────────┐ ┌───────────────────────────┐
│ reminder_       │ │ reminder_                 │
│ assignments     │ │ notifications             │
├─────────────────┤ ├───────────────────────────┤
│ id (PK)         │ │ id (PK)                   │
│ reminderId (FK) │ │ reminderId (FK)           │
│ assigneeType    │ │ sentAt                    │
│ assigneeId      │ │ success                   │
│ createdAt       │ │ errorMessage              │
└─────────────────┘ └───────────────────────────┘
```

## Tables

### reminders

Main table storing all reminder data.

#### Schema

```sql
CREATE TABLE IF NOT EXISTS reminders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject TEXT NOT NULL,
  category TEXT NOT NULL,
  when_datetime TEXT NOT NULL,
  content TEXT,
  link TEXT,
  image TEXT,
  notificationTime TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Columns

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier for the reminder |
| `subject` | TEXT | NOT NULL | Reminder title/subject (3-200 characters) |
| `category` | TEXT | NOT NULL | Category for organization (max 50 characters) |
| `when_datetime` | TEXT | NOT NULL | ISO 8601 datetime of the reminder event |
| `content` | TEXT | NULL | Optional detailed description (max 2000 characters) |
| `link` | TEXT | NULL | Optional associated URL (max 500 characters) |
| `image` | TEXT | NULL | Optional image URL (max 500 characters) |
| `notificationTime` | TEXT | NOT NULL | ISO 8601 datetime when notification should be sent |
| `status` | TEXT | NOT NULL, DEFAULT 'active' | Reminder status: 'active', 'completed', or 'cancelled' |
| `createdAt` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updatedAt` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last modification timestamp |

#### Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_reminders_when ON reminders(when_datetime);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);
CREATE INDEX IF NOT EXISTS idx_reminders_category ON reminders(category);
```

#### Status Values

- `active` - Reminder is active and notifications pending
- `completed` - Reminder event has occurred and notification sent
- `cancelled` - Reminder has been cancelled (soft delete)

#### Constraints

- `subject` must be between 3 and 200 characters
- `category` must be between 1 and 50 characters
- `when_datetime` must be valid ISO 8601 format
- `notificationTime` must be valid ISO 8601 format
- `status` must be one of: 'active', 'completed', 'cancelled'

### reminder_assignments

Junction table for user/role assignments to reminders.

#### Schema

```sql
CREATE TABLE IF NOT EXISTS reminder_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reminderId INTEGER NOT NULL,
  assigneeType TEXT NOT NULL CHECK(assigneeType IN ('user', 'role')),
  assigneeId TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reminderId) REFERENCES reminders(id) ON DELETE CASCADE
);
```

#### Columns

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier for the assignment |
| `reminderId` | INTEGER | NOT NULL, FOREIGN KEY | Reference to reminders table |
| `assigneeType` | TEXT | NOT NULL, CHECK | Type of assignee: 'user' or 'role' |
| `assigneeId` | TEXT | NOT NULL | Discord User ID or Role ID |
| `createdAt` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

#### Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_reminder_assignments_reminderId ON reminder_assignments(reminderId);
CREATE INDEX IF NOT EXISTS idx_reminder_assignments_assigneeId ON reminder_assignments(assigneeId);
```

#### Foreign Keys

- `reminderId` → `reminders(id)` with `ON DELETE CASCADE`
  - When a reminder is deleted, all associated assignments are automatically deleted

#### Constraints

- `assigneeType` must be either 'user' or 'role' (enforced by CHECK constraint)
- Multiple assignments per reminder are supported (one-to-many relationship)

### reminder_notifications

Tracks notification delivery attempts and outcomes.

#### Schema

```sql
CREATE TABLE IF NOT EXISTS reminder_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reminderId INTEGER NOT NULL,
  sentAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  success INTEGER DEFAULT 1,
  errorMessage TEXT,
  FOREIGN KEY (reminderId) REFERENCES reminders(id) ON DELETE CASCADE
);
```

#### Columns

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier for the notification record |
| `reminderId` | INTEGER | NOT NULL, FOREIGN KEY | Reference to reminders table |
| `sentAt` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp of notification attempt |
| `success` | INTEGER | DEFAULT 1 | 1 if successful, 0 if failed |
| `errorMessage` | TEXT | NULL | Error details if notification failed |

#### Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_reminder_notifications_reminderId ON reminder_notifications(reminderId);
```

#### Foreign Keys

- `reminderId` → `reminders(id)` with `ON DELETE CASCADE`
  - When a reminder is deleted, all associated notification records are automatically deleted

#### Success Values

- `1` - Notification sent successfully
- `0` - Notification failed (see errorMessage for details)

## Relationships

### One-to-Many Relationships

#### reminders → reminder_assignments (1:N)

- One reminder can have multiple assignments (multiple users or roles)
- Assignments are deleted when the parent reminder is deleted (CASCADE)
- Query to get all assignments for a reminder:
  ```sql
  SELECT * FROM reminder_assignments WHERE reminderId = ?;
  ```

#### reminders → reminder_notifications (1:N)

- One reminder can have multiple notification attempts (retries)
- Notifications are deleted when the parent reminder is deleted (CASCADE)
- Query to get notification history for a reminder:
  ```sql
  SELECT * FROM reminder_notifications WHERE reminderId = ? ORDER BY sentAt DESC;
  ```

## Common Queries

### Create Reminder

```sql
INSERT INTO reminders (
  subject, category, when_datetime, content, link, image, 
  notificationTime, status
) VALUES (?, ?, ?, ?, ?, ?, ?, 'active');
```

### Add Assignment

```sql
INSERT INTO reminder_assignments (
  reminderId, assigneeType, assigneeId
) VALUES (?, ?, ?);
```

### Get Reminder with Assignments

```sql
SELECT 
  r.*,
  GROUP_CONCAT(ra.assigneeType || ':' || ra.assigneeId) as assignees
FROM reminders r
LEFT JOIN reminder_assignments ra ON r.id = ra.reminderId
WHERE r.id = ?
GROUP BY r.id;
```

### List Active Reminders

```sql
SELECT * FROM reminders 
WHERE status = 'active' 
ORDER BY when_datetime ASC;
```

### Search Reminders

```sql
SELECT * FROM reminders 
WHERE (subject LIKE ? OR category LIKE ? OR content LIKE ?)
AND status = 'active'
ORDER BY when_datetime ASC;
```

### Get Due Reminders for Notification

```sql
SELECT 
  r.*,
  GROUP_CONCAT(ra.assigneeType || ':' || ra.assigneeId) as assignees
FROM reminders r
LEFT JOIN reminder_assignments ra ON r.id = ra.reminderId
WHERE r.status = 'active'
AND r.notificationTime <= ?
AND r.id NOT IN (
  SELECT reminderId FROM reminder_notifications WHERE success = 1
)
GROUP BY r.id
ORDER BY r.notificationTime ASC;
```

### Update Reminder

```sql
UPDATE reminders 
SET subject = ?, category = ?, updatedAt = CURRENT_TIMESTAMP
WHERE id = ?;
```

### Soft Delete (Cancel)

```sql
UPDATE reminders 
SET status = 'cancelled', updatedAt = CURRENT_TIMESTAMP
WHERE id = ?;
```

### Hard Delete

```sql
DELETE FROM reminders WHERE id = ?;
-- Assignments and notifications are automatically deleted via CASCADE
```

### Record Notification

```sql
INSERT INTO reminder_notifications (
  reminderId, success, errorMessage
) VALUES (?, ?, ?);
```

## Data Integrity

### Foreign Key Constraints

All foreign key constraints use `ON DELETE CASCADE` to maintain referential integrity:

- Deleting a reminder automatically deletes all associated assignments
- Deleting a reminder automatically deletes all notification records
- No orphaned records can exist in child tables

### Check Constraints

- `assigneeType` in `reminder_assignments` must be 'user' or 'role'

### Validation Rules

Enforced at application layer (ReminderService):

- Subject: 3-200 characters
- Category: 1-50 characters
- Content: max 2000 characters (optional)
- Link: max 500 characters, valid URL (optional)
- Image: max 500 characters, valid URL (optional)
- Datetime fields: valid ISO 8601 format
- Status: must be 'active', 'completed', or 'cancelled'

## Performance Considerations

### Indexes

Strategic indexes are created for common query patterns:

1. **when_datetime** - For finding upcoming reminders
2. **status** - For filtering by reminder status
3. **category** - For category-based filtering
4. **reminderId** (assignments) - For joins and lookups
5. **assigneeId** (assignments) - For user/role-based filtering
6. **reminderId** (notifications) - For notification history queries

### Query Optimization

- Use prepared statements for all queries (prevents SQL injection)
- Limit result sets with `LIMIT` and `OFFSET` for pagination
- Use indexes for WHERE clauses and JOIN conditions
- GROUP BY for aggregating assignments

## Migration Support

### Schema Initialization

Schema is automatically initialized on bot startup via `enhanceSchema()` function in `src/lib/schema-enhancement.js`.

### Adding New Columns

To add a new column to an existing table:

```sql
ALTER TABLE reminders ADD COLUMN new_column_name TEXT DEFAULT NULL;
```

### Backward Compatibility

All schema changes use `IF NOT EXISTS` to ensure idempotency:
- Tables can be created multiple times without errors
- Indexes won't be duplicated
- Safe to run schema enhancement on existing databases

## Example Data

### Sample Reminder

```sql
INSERT INTO reminders (
  subject, category, when_datetime, content, link, 
  notificationTime, status
) VALUES (
  'Team Standup Meeting',
  'Meeting',
  '2024-12-31T10:00:00.000Z',
  'Daily standup to discuss progress and blockers',
  'https://meet.company.com/standup',
  '2024-12-31T10:00:00.000Z',
  'active'
);
-- Returns ID: 1
```

### Sample Assignment (User)

```sql
INSERT INTO reminder_assignments (
  reminderId, assigneeType, assigneeId
) VALUES (1, 'user', '123456789012345678');
```

### Sample Assignment (Role)

```sql
INSERT INTO reminder_assignments (
  reminderId, assigneeType, assigneeId
) VALUES (1, 'role', '987654321098765432');
```

### Sample Notification Record

```sql
INSERT INTO reminder_notifications (
  reminderId, success, errorMessage
) VALUES (1, 1, NULL);
```

## Maintenance

### Cleanup Completed Reminders

```sql
-- Delete reminders completed more than 30 days ago
DELETE FROM reminders 
WHERE status = 'completed' 
AND updatedAt < datetime('now', '-30 days');
```

### View Notification Statistics

```sql
SELECT 
  COUNT(*) as total_notifications,
  SUM(success) as successful,
  COUNT(*) - SUM(success) as failed
FROM reminder_notifications;
```

### Find Reminders with Failed Notifications

```sql
SELECT DISTINCT r.*
FROM reminders r
JOIN reminder_notifications rn ON r.id = rn.reminderId
WHERE rn.success = 0;
```

## Best Practices

1. **Always use foreign keys** - Maintains data integrity
2. **Use transactions** - For operations affecting multiple tables
3. **Index strategically** - Balance between query speed and write performance
4. **Validate before insert** - Application-layer validation prevents bad data
5. **Use soft deletes** - Preserve history by default
6. **Monitor index usage** - Remove unused indexes
7. **Regular cleanup** - Archive or delete old completed reminders

## Security

### SQL Injection Prevention

All queries use prepared statements with parameterized values:

```javascript
// GOOD - Uses prepared statement
db.run('SELECT * FROM reminders WHERE id = ?', [id]);

// BAD - Vulnerable to SQL injection
db.run(`SELECT * FROM reminders WHERE id = ${id}`);
```

### Access Control

- Reminder access is controlled at application layer
- User permissions checked before CRUD operations
- Assignments determine who receives notifications

---

**Document Version:** 1.0  
**Schema Version:** 3.0.0  
**Last Updated:** December 27, 2024
