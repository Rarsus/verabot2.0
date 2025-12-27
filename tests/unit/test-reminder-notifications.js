/**
 * Test Suite: Reminder Notification Service
 * Tests notification scheduling and delivery logic
 */

/* eslint-disable no-unused-vars */

const {
  createReminderEmbed
} = require('../../src/services/ReminderNotificationService');

console.log('\n=== Reminder Notification Service Tests ===\n');

let passed = 0;
let failed = 0;

// Test 1: Load notification service
console.log('=== Test 1: Load Notification Service ===');
try {
  const notificationService = require('../../src/services/ReminderNotificationService');
  if (notificationService && typeof notificationService.initializeNotificationService === 'function') {
    console.log('✅ Test 1 Passed: Notification service loaded');
    passed++;
  } else {
    console.error('❌ Test 1 Failed: Notification service not loaded correctly');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 1 Failed:', err.message);
  failed++;
}

// Test 2: Verify service exports
console.log('\n=== Test 2: Verify Service Exports ===');
try {
  const notificationService = require('../../src/services/ReminderNotificationService');
  const requiredFunctions = [
    'initializeNotificationService',
    'stopNotificationService',
    'checkAndSendNotifications',
    'triggerNotificationCheck',
    'createReminderEmbed',
    'sendReminderNotification'
  ];
  
  const allExported = requiredFunctions.every(fn => typeof notificationService[fn] === 'function');
  
  if (allExported) {
    console.log('✅ Test 2 Passed: All required functions exported');
    passed++;
  } else {
    console.error('❌ Test 2 Failed: Missing required exports');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 2 Failed:', err.message);
  failed++;
}

// Test 3: Create reminder embed
console.log('\n=== Test 3: Create Reminder Embed ===');
try {
  const reminder = {
    id: 1,
    subject: 'Test Reminder',
    category: 'Meeting',
    when_datetime: '2024-12-31T10:00:00.000Z',
    content: 'Test content',
    link: 'https://example.com',
    image: 'https://example.com/image.png'
  };
  
  const embed = createReminderEmbed(reminder);
  
  if (embed && embed.data && embed.data.title && embed.data.title.includes('Test Reminder')) {
    console.log('✅ Test 3 Passed: Reminder embed created');
    passed++;
  } else {
    console.error('❌ Test 3 Failed: Embed not created correctly');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 3 Failed:', err.message);
  failed++;
}

// Test 4: Create embed without optional fields
console.log('\n=== Test 4: Create Embed Without Optional Fields ===');
try {
  const reminder = {
    id: 2,
    subject: 'Minimal Reminder',
    category: 'Task',
    when_datetime: '2024-12-31T10:00:00.000Z'
  };
  
  const embed = createReminderEmbed(reminder);
  
  if (embed && embed.data && embed.data.title) {
    console.log('✅ Test 4 Passed: Minimal embed created');
    passed++;
  } else {
    console.error('❌ Test 4 Failed: Minimal embed not created');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 4 Failed:', err.message);
  failed++;
}

// Test 5: Embed has correct color
console.log('\n=== Test 5: Embed Color ===');
try {
  const reminder = {
    id: 3,
    subject: 'Color Test',
    category: 'Event',
    when_datetime: '2024-12-31T10:00:00.000Z'
  };
  
  const embed = createReminderEmbed(reminder);
  
  if (embed && embed.data && embed.data.color === 0xFFD700) {
    console.log('✅ Test 5 Passed: Embed has correct color');
    passed++;
  } else {
    console.error('❌ Test 5 Failed: Embed color incorrect');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 5 Failed:', err.message);
  failed++;
}

// Test 6: Embed includes reminder ID in footer
console.log('\n=== Test 6: Embed Footer ===');
try {
  const reminder = {
    id: 123,
    subject: 'Footer Test',
    category: 'Task',
    when_datetime: '2024-12-31T10:00:00.000Z'
  };
  
  const embed = createReminderEmbed(reminder);
  
  if (embed && embed.data && embed.data.footer && embed.data.footer.text.includes('123')) {
    console.log('✅ Test 6 Passed: Embed includes ID in footer');
    passed++;
  } else {
    console.error('❌ Test 6 Failed: Embed footer missing or incorrect');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 6 Failed:', err.message);
  failed++;
}

// Test 7: Embed includes category
console.log('\n=== Test 7: Embed Category Field ===');
try {
  const reminder = {
    id: 4,
    subject: 'Category Test',
    category: 'Meeting',
    when_datetime: '2024-12-31T10:00:00.000Z'
  };
  
  const embed = createReminderEmbed(reminder);
  
  const hasCategory = embed.data.fields && 
                      embed.data.fields.some(f => f.name.includes('Category') && f.value === 'Meeting');
  
  if (hasCategory) {
    console.log('✅ Test 7 Passed: Embed includes category field');
    passed++;
  } else {
    console.error('❌ Test 7 Failed: Category field missing');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 7 Failed:', err.message);
  failed++;
}

// Test 8: Embed includes when field
console.log('\n=== Test 8: Embed When Field ===');
try {
  const reminder = {
    id: 5,
    subject: 'When Test',
    category: 'Task',
    when_datetime: '2024-12-31T10:00:00.000Z'
  };
  
  const embed = createReminderEmbed(reminder);
  
  const hasWhen = embed.data.fields && 
                  embed.data.fields.some(f => f.name.includes('When'));
  
  if (hasWhen) {
    console.log('✅ Test 8 Passed: Embed includes when field');
    passed++;
  } else {
    console.error('❌ Test 8 Failed: When field missing');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 8 Failed:', err.message);
  failed++;
}

// Test 9: Embed includes link when provided
console.log('\n=== Test 9: Embed Link Field ===');
try {
  const reminder = {
    id: 6,
    subject: 'Link Test',
    category: 'Task',
    when_datetime: '2024-12-31T10:00:00.000Z',
    link: 'https://example.com'
  };
  
  const embed = createReminderEmbed(reminder);
  
  const hasLink = embed.data.fields && 
                  embed.data.fields.some(f => f.name.includes('Link') && f.value.includes('example.com'));
  
  if (hasLink) {
    console.log('✅ Test 9 Passed: Embed includes link field');
    passed++;
  } else {
    console.error('❌ Test 9 Failed: Link field missing');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 9 Failed:', err.message);
  failed++;
}

// Test 10: Embed includes image when provided
console.log('\n=== Test 10: Embed Image ===');
try {
  const reminder = {
    id: 7,
    subject: 'Image Test',
    category: 'Event',
    when_datetime: '2024-12-31T10:00:00.000Z',
    image: 'https://example.com/image.png'
  };
  
  const embed = createReminderEmbed(reminder);
  
  if (embed && embed.data && embed.data.image && embed.data.image.url === 'https://example.com/image.png') {
    console.log('✅ Test 10 Passed: Embed includes image');
    passed++;
  } else {
    console.error('❌ Test 10 Failed: Image not set');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 10 Failed:', err.message);
  failed++;
}

// Test 11: Embed includes content as description
console.log('\n=== Test 11: Embed Description ===');
try {
  const reminder = {
    id: 8,
    subject: 'Content Test',
    category: 'Task',
    when_datetime: '2024-12-31T10:00:00.000Z',
    content: 'This is test content for the reminder'
  };
  
  const embed = createReminderEmbed(reminder);
  
  if (embed && embed.data && embed.data.description === 'This is test content for the reminder') {
    console.log('✅ Test 11 Passed: Embed includes content as description');
    passed++;
  } else {
    console.error('❌ Test 11 Failed: Description not set correctly');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 11 Failed:', err.message);
  failed++;
}

// Test 12: Notification service constants
console.log('\n=== Test 12: Check Default Constants ===');
try {
  const constants = require('../../src/utils/constants/reminder-constants');
  
  if (constants.NOTIFICATION_DEFAULTS && 
      constants.NOTIFICATION_DEFAULTS.CHECK_INTERVAL &&
      constants.NOTIFICATION_DEFAULTS.RETRY_ATTEMPTS) {
    console.log('✅ Test 12 Passed: Notification constants defined');
    passed++;
  } else {
    console.error('❌ Test 12 Failed: Notification constants missing');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 12 Failed:', err.message);
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
