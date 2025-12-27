/**
 * Test Suite: Reminder Service
 * Tests business logic and validation for reminder operations
 */

/* eslint-disable no-unused-vars */

const path = require('path');
const fs = require('fs');

// Setup test database path before requiring service
process.env.NODE_ENV = 'test';
const testDbPath = path.join(__dirname, '..', '..', 'data', 'quotes.db');

// Initialize database schema
const database = require('../../src/services/DatabaseService');
const { enhanceSchema } = require('../../src/lib/schema-enhancement');

async function initializeDatabase() {
  try {
    await database.setupSchema(database.getDatabase());
    await enhanceSchema(database.getDatabase());
    console.log('✓ Test database initialized\n');
  } catch (err) {
    console.error('Failed to initialize test database:', err);
    process.exit(1);
  }
}

const {
  validateSubject,
  validateCategory,
  validateDatetime,
  validateContent,
  validateLink,
  validateImage,
  createReminder,
  addReminderAssignment,
  getReminderById,
  updateReminder,
  deleteReminder,
  listReminders,
  searchReminders,
  getRemindersForNotification,
  recordNotification
} = require('../../src/services/ReminderService');

let passed = 0;
let failed = 0;

async function runTests() {
  console.log('\n=== Reminder Service Tests ===\n');

  // Initialize database first
  await initializeDatabase();

  // Test 1: Validate subject - valid
  console.log('=== Test 1: Validate Subject (Valid) ===');
  try {
    const result = validateSubject('Valid Subject');
    if (result.valid && result.sanitized === 'Valid Subject') {
      console.log('✅ Test 1 Passed: Valid subject accepted');
      passed++;
    } else {
      console.error('❌ Test 1 Failed: Valid subject rejected');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 1 Failed:', err.message);
    failed++;
  }

  // Test 2: Validate subject - too short
  console.log('\n=== Test 2: Validate Subject (Too Short) ===');
  try {
    const result = validateSubject('AB');
    if (!result.valid && result.error.includes('at least')) {
      console.log('✅ Test 2 Passed: Short subject rejected');
      passed++;
    } else {
      console.error('❌ Test 2 Failed: Short subject not rejected');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 2 Failed:', err.message);
    failed++;
  }

  // Test 3: Validate subject - too long
  console.log('\n=== Test 3: Validate Subject (Too Long) ===');
  try {
    const longSubject = 'A'.repeat(201);
    const result = validateSubject(longSubject);
    if (!result.valid && result.error.includes('exceed')) {
      console.log('✅ Test 3 Passed: Long subject rejected');
      passed++;
    } else {
      console.error('❌ Test 3 Failed: Long subject not rejected');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 3 Failed:', err.message);
    failed++;
  }

  // Test 4: Validate category - valid
  console.log('\n=== Test 4: Validate Category (Valid) ===');
  try {
    const result = validateCategory('Meeting');
    if (result.valid && result.sanitized === 'Meeting') {
      console.log('✅ Test 4 Passed: Valid category accepted');
      passed++;
    } else {
      console.error('❌ Test 4 Failed: Valid category rejected');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 4 Failed:', err.message);
    failed++;
  }

  // Test 5: Validate datetime - valid ISO
  console.log('\n=== Test 5: Validate Datetime (Valid ISO) ===');
  try {
    const result = validateDatetime('2024-12-31T23:59:59.000Z');
    if (result.valid && result.sanitized) {
      console.log('✅ Test 5 Passed: Valid ISO datetime accepted');
      passed++;
    } else {
      console.error('❌ Test 5 Failed: Valid ISO datetime rejected');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 5 Failed:', err.message);
    failed++;
  }

  // Test 6: Validate datetime - invalid
  console.log('\n=== Test 6: Validate Datetime (Invalid) ===');
  try {
    const result = validateDatetime('not-a-date');
    if (!result.valid && result.error.includes('Invalid')) {
      console.log('✅ Test 6 Passed: Invalid datetime rejected');
      passed++;
    } else {
      console.error('❌ Test 6 Failed: Invalid datetime not rejected');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 6 Failed:', err.message);
    failed++;
  }

  // Test 7: Validate content - valid optional
  console.log('\n=== Test 7: Validate Content (Optional) ===');
  try {
    const result = validateContent(null);
    if (result.valid && result.sanitized === null) {
      console.log('✅ Test 7 Passed: Null content accepted');
      passed++;
    } else {
      console.error('❌ Test 7 Failed: Null content rejected');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 7 Failed:', err.message);
    failed++;
  }

  // Test 8: Validate link - valid URL
  console.log('\n=== Test 8: Validate Link (Valid URL) ===');
  try {
    const result = validateLink('https://example.com/test');
    if (result.valid && result.sanitized === 'https://example.com/test') {
      console.log('✅ Test 8 Passed: Valid URL accepted');
      passed++;
    } else {
      console.error('❌ Test 8 Failed: Valid URL rejected');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 8 Failed:', err.message);
    failed++;
  }

  // Test 9: Validate link - invalid URL
  console.log('\n=== Test 9: Validate Link (Invalid URL) ===');
  try {
    const result = validateLink('not-a-url');
    if (!result.valid && result.error.includes('Invalid')) {
      console.log('✅ Test 9 Passed: Invalid URL rejected');
      passed++;
    } else {
      console.error('❌ Test 9 Failed: Invalid URL not rejected');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 9 Failed:', err.message);
    failed++;
  }

  // Test 10: Validate image - valid URL
  console.log('\n=== Test 10: Validate Image (Valid URL) ===');
  try {
    const result = validateImage('https://example.com/image.png');
    if (result.valid && result.sanitized === 'https://example.com/image.png') {
      console.log('✅ Test 10 Passed: Valid image URL accepted');
      passed++;
    } else {
      console.error('❌ Test 10 Failed: Valid image URL rejected');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 10 Failed:', err.message);
    failed++;
  }

  // Test 11: Create reminder - valid data
  console.log('\n=== Test 11: Create Reminder (Valid) ===');
  try {
    const reminderId = await createReminder({
      subject: 'Test Reminder',
      category: 'Meeting',
      when: '2024-12-31T10:00:00.000Z',
      content: 'This is a test reminder',
      link: 'https://example.com',
      image: null
    });
    if (typeof reminderId === 'number' && reminderId > 0) {
      console.log(`✅ Test 11 Passed: Reminder created with ID ${reminderId}`);
      passed++;
    } else {
      console.error('❌ Test 11 Failed: Invalid reminder ID');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 11 Failed:', err.message);
    failed++;
  }

  // Test 12: Create reminder - invalid subject
  console.log('\n=== Test 12: Create Reminder (Invalid Subject) ===');
  try {
    await createReminder({
      subject: 'AB',
      category: 'Meeting',
      when: '2024-12-31T10:00:00.000Z'
    });
    console.error('❌ Test 12 Failed: Invalid subject not rejected');
    failed++;
  } catch (err) {
    if (err.message.includes('at least')) {
      console.log('✅ Test 12 Passed: Invalid subject rejected');
      passed++;
    } else {
      console.error('❌ Test 12 Failed:', err.message);
      failed++;
    }
  }

  // Test 13: Add reminder assignment - user
  console.log('\n=== Test 13: Add Reminder Assignment (User) ===');
  try {
    const assignmentId = await addReminderAssignment(1, 'user', '123456789');
    if (typeof assignmentId === 'number' && assignmentId > 0) {
      console.log('✅ Test 13 Passed: User assignment added');
      passed++;
    } else {
      console.error('❌ Test 13 Failed: Invalid assignment ID');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 13 Failed:', err.message);
    failed++;
  }

  // Test 14: Add reminder assignment - invalid type
  console.log('\n=== Test 14: Add Reminder Assignment (Invalid Type) ===');
  try {
    await addReminderAssignment(1, 'invalid', '123456789');
    console.error('❌ Test 14 Failed: Invalid assignee type not rejected');
    failed++;
  } catch (err) {
    if (err.message.includes('user') && err.message.includes('role')) {
      console.log('✅ Test 14 Passed: Invalid assignee type rejected');
      passed++;
    } else {
      console.error('❌ Test 14 Failed:', err.message);
      failed++;
    }
  }

  // Test 15: Get reminder by ID
  console.log('\n=== Test 15: Get Reminder by ID ===');
  try {
    const reminder = await getReminderById(1);
    if (reminder && reminder.id === 1 && reminder.subject === 'Test Reminder') {
      console.log('✅ Test 15 Passed: Reminder retrieved');
      passed++;
    } else {
      console.error('❌ Test 15 Failed: Reminder not found or incorrect');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 15 Failed:', err.message);
    failed++;
  }

  // Test 16: Get reminder by ID - not found
  console.log('\n=== Test 16: Get Reminder by ID (Not Found) ===');
  try {
    const reminder = await getReminderById(99999);
    if (reminder === null) {
      console.log('✅ Test 16 Passed: Non-existent reminder returns null');
      passed++;
    } else {
      console.error('❌ Test 16 Failed: Non-existent reminder found');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 16 Failed:', err.message);
    failed++;
  }

  // Test 17: Update reminder
  console.log('\n=== Test 17: Update Reminder ===');
  try {
    const success = await updateReminder(1, { subject: 'Updated Subject' });
    if (success) {
      const reminder = await getReminderById(1);
      if (reminder.subject === 'Updated Subject') {
        console.log('✅ Test 17 Passed: Reminder updated');
        passed++;
      } else {
        console.error('❌ Test 17 Failed: Update not applied');
        failed++;
      }
    } else {
      console.error('❌ Test 17 Failed: Update returned false');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 17 Failed:', err.message);
    failed++;
  }

  // Test 18: Update reminder - invalid field
  console.log('\n=== Test 18: Update Reminder (Invalid Field) ===');
  try {
    await updateReminder(1, { subject: 'AB' });
    console.error('❌ Test 18 Failed: Invalid update not rejected');
    failed++;
  } catch (err) {
    if (err.message.includes('at least')) {
      console.log('✅ Test 18 Passed: Invalid update rejected');
      passed++;
    } else {
      console.error('❌ Test 18 Failed:', err.message);
      failed++;
    }
  }

  // Test 19: List reminders - no filter
  console.log('\n=== Test 19: List Reminders (No Filter) ===');
  try {
    const reminders = await listReminders();
    if (Array.isArray(reminders) && reminders.length > 0) {
      console.log(`✅ Test 19 Passed: Listed ${reminders.length} reminders`);
      passed++;
    } else {
      console.error('❌ Test 19 Failed: No reminders found');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 19 Failed:', err.message);
    failed++;
  }

  // Test 20: List reminders - with status filter
  console.log('\n=== Test 20: List Reminders (Status Filter) ===');
  try {
    const reminders = await listReminders({ status: 'active' });
    if (Array.isArray(reminders) && reminders.every(r => r.status === 'active')) {
      console.log('✅ Test 20 Passed: Status filter works');
      passed++;
    } else {
      console.error('❌ Test 20 Failed: Status filter not working');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 20 Failed:', err.message);
    failed++;
  }

  // Test 21: Search reminders
  console.log('\n=== Test 21: Search Reminders ===');
  try {
    await createReminder({
      subject: 'Searchable Reminder',
      category: 'Task',
      when: '2024-12-31T10:00:00.000Z'
    });
    const results = await searchReminders('Searchable');
    if (Array.isArray(results) && results.some(r => r.subject.includes('Searchable'))) {
      console.log('✅ Test 21 Passed: Search works');
      passed++;
    } else {
      console.error('❌ Test 21 Failed: Search not working');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 21 Failed:', err.message);
    failed++;
  }

  // Test 22: Delete reminder - soft delete
  console.log('\n=== Test 22: Delete Reminder (Soft Delete) ===');
  try {
    const success = await deleteReminder(1, false);
    if (success) {
      const reminder = await getReminderById(1);
      if (reminder && reminder.status === 'cancelled') {
        console.log('✅ Test 22 Passed: Soft delete works');
        passed++;
      } else {
        console.error('❌ Test 22 Failed: Soft delete not applied');
        failed++;
      }
    } else {
      console.error('❌ Test 22 Failed: Delete returned false');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 22 Failed:', err.message);
    failed++;
  }

  // Test 23: Get reminders for notification
  console.log('\n=== Test 23: Get Reminders for Notification ===');
  try {
    // Create a reminder with past notification time
    const pastDate = new Date();
    pastDate.setHours(pastDate.getHours() - 1);
    const reminderId = await createReminder({
      subject: 'Past Reminder',
      category: 'Task',
      when: pastDate.toISOString(),
      notificationTime: pastDate.toISOString()
    });

    const dueReminders = await getRemindersForNotification(new Date());
    if (Array.isArray(dueReminders)) {
      console.log(`✅ Test 23 Passed: Found ${dueReminders.length} due reminders`);
      passed++;
    } else {
      console.error('❌ Test 23 Failed: Invalid result');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 23 Failed:', err.message);
    failed++;
  }

  // Test 24: Record notification
  console.log('\n=== Test 24: Record Notification ===');
  try {
    const notificationId = await recordNotification(1, true, null);
    if (typeof notificationId === 'number' && notificationId > 0) {
      console.log('✅ Test 24 Passed: Notification recorded');
      passed++;
    } else {
      console.error('❌ Test 24 Failed: Invalid notification ID');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 24 Failed:', err.message);
    failed++;
  }

  // Test 25: Record failed notification
  console.log('\n=== Test 25: Record Failed Notification ===');
  try {
    const notificationId = await recordNotification(1, false, 'Test error');
    if (typeof notificationId === 'number' && notificationId > 0) {
      console.log('✅ Test 25 Passed: Failed notification recorded');
      passed++;
    } else {
      console.error('❌ Test 25 Failed: Invalid notification ID');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 25 Failed:', err.message);
    failed++;
  }

  // Print summary
  console.log('\n=== Test Summary ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

// Run tests
runTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
