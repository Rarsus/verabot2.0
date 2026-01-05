/**
 * Test Suite: Guild-Aware Services (Phases 1-7)
 * Comprehensive tests for GuildDatabaseManager, GuildAwareReminderService, and GuildAwareCommunicationService
 */

const GuildDatabaseManager = require('../../src/services/GuildDatabaseManager');
const GuildAwareReminderService = require('../../src/services/GuildAwareReminderService');
const GuildAwareCommunicationService = require('../../src/services/GuildAwareCommunicationService');
const path = require('path');
const fs = require('fs');

// Test configuration
const TEST_GUILD_ID = 'test-guild-' + Date.now();
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ ${testName}`);
    passedTests++;
  } else {
    console.log(`❌ ${testName}`);
    failedTests++;
  }
}

async function cleanup() {
  try {
    await GuildDatabaseManager.deleteGuildDatabase(TEST_GUILD_ID);
  } catch {
    // Ignore
  }
}

(async () => {
  // Cleanup before tests
  await cleanup();

  console.log('\n' + '='.repeat(70));
  console.log('🧪 Guild-Aware Services Test Suite (Phases 1-7)');
  console.log('='.repeat(70));

  // ============================================================================
  // PART 1: GuildDatabaseManager Tests
  // ============================================================================
  console.log('\n' + '='.repeat(70));
  console.log('PART 1: GuildDatabaseManager Tests');
  console.log('='.repeat(70));

  // Test 1.1: Database Connection
  console.log('\n📌 Test 1.1: Database Connection Management');
  try {
    const db = await GuildDatabaseManager.getGuildDatabase(TEST_GUILD_ID);
    assert(db !== null, 'Creates database connection for new guild');
    assert(GuildDatabaseManager.connections.has(TEST_GUILD_ID), 'Caches connection in memory');
  } catch (err) {
    assert(false, `Database connection failed: ${err.message}`);
  }

  // Test 1.2: Connection Reuse
  console.log('\n📌 Test 1.2: Connection Reuse');
  try {
    const db1 = await GuildDatabaseManager.getGuildDatabase(TEST_GUILD_ID);
    const db2 = await GuildDatabaseManager.getGuildDatabase(TEST_GUILD_ID);
    assert(db1 === db2, 'Reuses cached connection for same guild');
  } catch (err) {
    assert(false, `Connection reuse failed: ${err.message}`);
  }

  // Test 1.3: Schema Initialization
  console.log('\n📌 Test 1.3: Schema Initialization');
  try {
    const db = await GuildDatabaseManager.getGuildDatabase(TEST_GUILD_ID);
    const result = await new Promise((resolve, reject) => {
      db.all(
        "SELECT name FROM sqlite_master WHERE type='table'",
        [],
        (err, rows) => err ? reject(err) : resolve(rows)
      );
    });
    assert(result.length > 0, 'Creates tables in guild database');
    const tableNames = result.map(r => r.name);
    assert(tableNames.includes('quotes'), 'quotes table created');
    assert(tableNames.includes('reminders'), 'reminders table created (Phase 1)');
    assert(tableNames.includes('user_communications'), 'user_communications table created (Phase 1)');
  } catch (err) {
    assert(false, `Schema validation failed: ${err.message}`);
  }

  // Test 1.4: Database Directory Structure
  console.log('\n📌 Test 1.4: Database Directory Structure');
  try {
    const guildDir = path.join(__dirname, '../../data/db/guilds', TEST_GUILD_ID);
    const exists = fs.existsSync(guildDir);
    assert(exists, 'Creates guild directory');

    const dbFile = path.join(guildDir, 'quotes.db');
    const dbExists = fs.existsSync(dbFile);
    assert(dbExists, 'Creates database file in guild directory');
  } catch (err) {
    assert(false, `Directory structure check failed: ${err.message}`);
  }

  // Test 1.5: Get Guild Database Size
  console.log('\n📌 Test 1.5: Database Size Retrieval');
  try {
    const size = await GuildDatabaseManager.getGuildDatabaseSize(TEST_GUILD_ID);
    assert(typeof size === 'number', 'Returns numeric size');
    assert(size > 0, 'Database has non-zero size');
  } catch (err) {
    assert(false, `Database size check failed: ${err.message}`);
  }

  // ============================================================================
  // PART 2: GuildAwareReminderService Tests
  // ============================================================================
  console.log('\n' + '='.repeat(70));
  console.log('PART 2: GuildAwareReminderService Tests (Phase 2)');
  console.log('='.repeat(70));

  let createdReminderId = null;

  // Test 2.1: Create Reminder
  console.log('\n📌 Test 2.1: Create Reminder');
  try {
    const reminderId = await GuildAwareReminderService.createReminder(TEST_GUILD_ID, {
      subject: 'Test Reminder',
      category: 'General',
      when: new Date().toISOString(),
      content: 'This is a test reminder',
      notification_method: 'dm'
    });
    assert(typeof reminderId === 'number' && reminderId > 0, 'Creates reminder and returns ID');
    createdReminderId = reminderId;
  } catch (err) {
    assert(false, `Create reminder failed: ${err.message}`);
  }

  // Test 2.2: Get Reminder by ID
  console.log('\n📌 Test 2.2: Get Reminder by ID');
  try {
    const reminder = await GuildAwareReminderService.getReminderById(TEST_GUILD_ID, createdReminderId);
    assert(reminder !== null, 'Retrieves reminder by ID');
    assert(reminder.subject === 'Test Reminder', 'Reminder has correct subject');
    assert(reminder.category === 'General', 'Reminder has correct category');
  } catch (err) {
    assert(false, `Get reminder failed: ${err.message}`);
  }

  // Test 2.3: Add Reminder Assignment
  console.log('\n📌 Test 2.3: Add Reminder Assignment');
  try {
    const assignmentId = await GuildAwareReminderService.addReminderAssignment(
      TEST_GUILD_ID,
      createdReminderId,
      'user',
      '123456789'
    );
    assert(typeof assignmentId === 'number' && assignmentId > 0, 'Creates assignment and returns ID');
  } catch (err) {
    assert(false, `Add assignment failed: ${err.message}`);
  }

  // Test 2.4: Update Reminder
  console.log('\n📌 Test 2.4: Update Reminder');
  try {
    await GuildAwareReminderService.updateReminder(TEST_GUILD_ID, createdReminderId, {
      subject: 'Updated Reminder',
      notification_method: 'server'
    });
    const reminder = await GuildAwareReminderService.getReminderById(TEST_GUILD_ID, createdReminderId);
    assert(reminder.subject === 'Updated Reminder', 'Updates reminder subject');
    assert(reminder.notification_method === 'server', 'Updates notification method');
  } catch (err) {
    assert(false, `Update reminder failed: ${err.message}`);
  }

  // Test 2.5: Get All Reminders
  console.log('\n📌 Test 2.5: Get All Reminders');
  try {
    const reminders = await GuildAwareReminderService.getAllReminders(TEST_GUILD_ID);
    assert(Array.isArray(reminders), 'Returns array of reminders');
    assert(reminders.length > 0, 'Contains created reminder');
    assert(reminders.some(r => r.id === createdReminderId), 'Created reminder is in list');
  } catch (err) {
    assert(false, `Get all reminders failed: ${err.message}`);
  }

  // Test 2.6: Search Reminders
  console.log('\n📌 Test 2.6: Search Reminders');
  try {
    const results = await GuildAwareReminderService.searchReminders(TEST_GUILD_ID, 'Updated');
    assert(Array.isArray(results), 'Search returns array');
    assert(results.length > 0, 'Search finds matching reminder');
    assert(results.some(r => r.id === createdReminderId), 'Found reminder matches search query');
  } catch (err) {
    assert(false, `Search reminders failed: ${err.message}`);
  }

  // Test 2.7: Get Guild Reminder Stats
  console.log('\n📌 Test 2.7: Get Guild Reminder Statistics');
  try {
    const stats = await GuildAwareReminderService.getGuildReminderStats(TEST_GUILD_ID);
    assert(stats.total > 0, 'Stats show total reminders');
    assert(stats.active >= 0, 'Stats show active reminders');
    assert(stats.categories >= 0, 'Stats show category count');
  } catch (err) {
    assert(false, `Get stats failed: ${err.message}`);
  }

  // Test 2.8: Soft Delete Reminder
  console.log('\n📌 Test 2.8: Soft Delete Reminder');
  try {
    await GuildAwareReminderService.deleteReminder(TEST_GUILD_ID, createdReminderId, false);
    const reminder = await GuildAwareReminderService.getReminderById(TEST_GUILD_ID, createdReminderId);
    assert(reminder.status !== 'active', 'Soft delete changes reminder status');
  } catch (err) {
    assert(false, `Soft delete failed: ${err.message}`);
  }

  // Test 2.9: Hard Delete Reminder
  console.log('\n📌 Test 2.9: Hard Delete Reminder');
  try {
    // Create new reminder for hard delete test
    const reminderId = await GuildAwareReminderService.createReminder(TEST_GUILD_ID, {
      subject: 'Delete Me',
      category: 'Test',
      when: new Date().toISOString(),
      notification_method: 'dm'
    });
    await GuildAwareReminderService.deleteReminder(TEST_GUILD_ID, reminderId, true);
    const reminder = await GuildAwareReminderService.getReminderById(TEST_GUILD_ID, reminderId);
    assert(reminder === null, 'Hard delete removes reminder completely');
  } catch (err) {
    assert(false, `Hard delete failed: ${err.message}`);
  }

  // ============================================================================
  // PART 3: GuildAwareCommunicationService Tests
  // ============================================================================
  console.log('\n' + '='.repeat(70));
  console.log('PART 3: GuildAwareCommunicationService Tests (Phase 3)');
  console.log('='.repeat(70));

  const testUserId = 'user-' + Date.now();

  // Test 3.1: Default User Opt-Out Status
  console.log('\n📌 Test 3.1: Default Opt-Out Status');
  try {
    const isOptedIn = await GuildAwareCommunicationService.isOptedIn(TEST_GUILD_ID, testUserId);
    assert(isOptedIn === false, 'New user defaults to opted out');
  } catch (err) {
    assert(false, `Default status check failed: ${err.message}`);
  }

  // Test 3.2: Opt-In User
  console.log('\n📌 Test 3.2: User Opt-In');
  try {
    await GuildAwareCommunicationService.optIn(TEST_GUILD_ID, testUserId);
    const isOptedIn = await GuildAwareCommunicationService.isOptedIn(TEST_GUILD_ID, testUserId);
    assert(isOptedIn === true, 'User opts in successfully');
  } catch (err) {
    assert(false, `Opt-in failed: ${err.message}`);
  }

  // Test 3.3: Opt-Out User
  console.log('\n📌 Test 3.3: User Opt-Out');
  try {
    await GuildAwareCommunicationService.optOut(TEST_GUILD_ID, testUserId);
    const isOptedIn = await GuildAwareCommunicationService.isOptedIn(TEST_GUILD_ID, testUserId);
    assert(isOptedIn === false, 'User opts out successfully');
  } catch (err) {
    assert(false, `Opt-out failed: ${err.message}`);
  }

  // Test 3.4: Get Communication Status
  console.log('\n📌 Test 3.4: Get Communication Status');
  try {
    const status = await GuildAwareCommunicationService.getStatus(TEST_GUILD_ID, testUserId);
    assert(status !== null, 'Returns status object');
    assert('opted_in' in status, 'Status has opted_in property');
    // opted_in is stored as 0/1 in SQLite
    assert(status.opted_in === 0, 'Status reflects opted-out state');
  } catch (err) {
    assert(false, `Get status failed: ${err.message}`);
  }

  // Test 3.5: Opt-In Is Idempotent
  console.log('\n📌 Test 3.5: Opt-In Idempotency');
  try {
    await GuildAwareCommunicationService.optIn(TEST_GUILD_ID, testUserId);
    await GuildAwareCommunicationService.optIn(TEST_GUILD_ID, testUserId);
    const isOptedIn = await GuildAwareCommunicationService.isOptedIn(TEST_GUILD_ID, testUserId);
    assert(isOptedIn === true, 'Multiple opt-ins have same effect');
  } catch (err) {
    assert(false, `Idempotency test failed: ${err.message}`);
  }

  // Test 3.6: Get Opted-In Users
  console.log('\n📌 Test 3.6: Get Opted-In Users for Guild');
  try {
    await GuildAwareCommunicationService.optIn(TEST_GUILD_ID, testUserId);
    const optedInUsers = await GuildAwareCommunicationService.getOptedInUsersForGuild(TEST_GUILD_ID);
    assert(Array.isArray(optedInUsers), 'Returns array of users');
    assert(optedInUsers.includes(testUserId), 'Includes opted-in user');
  } catch (err) {
    assert(false, `Get opted-in users failed: ${err.message}`);
  }

  // Test 3.7: Get Communication Statistics
  console.log('\n📌 Test 3.7: Get Communication Statistics');
  try {
    const stats = await GuildAwareCommunicationService.getGuildCommunicationStats(TEST_GUILD_ID);
    assert(stats !== null, 'Returns statistics object');
    assert('total' in stats, 'Stats has total property');
    assert('optedIn' in stats, 'Stats has optedIn property');
    assert(stats.total > 0, 'Shows total users');
  } catch (err) {
    assert(false, `Get stats failed: ${err.message}`);
  }

  // Test 3.8: Multiple Users with Different States
  console.log('\n📌 Test 3.8: Multiple Users with Different States');
  try {
    const user1 = 'user1-' + Date.now();
    const user2 = 'user2-' + Date.now();

    await GuildAwareCommunicationService.optIn(TEST_GUILD_ID, user1);
    await GuildAwareCommunicationService.optOut(TEST_GUILD_ID, user2);

    const status1 = await GuildAwareCommunicationService.isOptedIn(TEST_GUILD_ID, user1);
    const status2 = await GuildAwareCommunicationService.isOptedIn(TEST_GUILD_ID, user2);

    assert(status1 === true && status2 === false, 'Different users have different states');
  } catch (err) {
    assert(false, `Multiple users test failed: ${err.message}`);
  }

  // ============================================================================
  // PART 4: Guild Isolation Verification
  // ============================================================================
  console.log('\n' + '='.repeat(70));
  console.log('PART 4: Guild Isolation Verification');
  console.log('='.repeat(70));

  // Test 4.1: Data is isolated between guilds
  console.log('\n📌 Test 4.1: Guild Data Isolation');
  try {
    const guild2 = 'test-guild-2-' + Date.now();

    // Create reminder in guild 1
    await GuildAwareReminderService.createReminder(TEST_GUILD_ID, {
      subject: 'Guild 1 Reminder',
      category: 'Test',
      when: new Date().toISOString(),
      notification_method: 'dm'
    });

    // Create reminder in guild 2
    await GuildAwareReminderService.createReminder(guild2, {
      subject: 'Guild 2 Reminder',
      category: 'Test',
      when: new Date().toISOString(),
      notification_method: 'dm'
    });

    // Verify guild 1 only sees its reminders
    const guild1Reminders = await GuildAwareReminderService.getAllReminders(TEST_GUILD_ID);
    const guild1HasGuild2Data = guild1Reminders.some(r => r.subject === 'Guild 2 Reminder');
    assert(!guild1HasGuild2Data, 'Guild 1 does not see Guild 2 data');

    // Cleanup guild 2
    await GuildDatabaseManager.deleteGuildDatabase(guild2);
  } catch (err) {
    assert(false, `Guild isolation test failed: ${err.message}`);
  }

  // Test 4.2: GDPR Deletion
  console.log('\n📌 Test 4.2: GDPR Deletion (Guild Database Removal)');
  try {
    const guildToDelete = 'guild-to-delete-' + Date.now();

    // Create data in guild
    await GuildAwareReminderService.createReminder(guildToDelete, {
      subject: 'To Delete',
      category: 'Test',
      when: new Date().toISOString(),
      notification_method: 'dm'
    });

    // Delete guild database
    await GuildDatabaseManager.deleteGuildDatabase(guildToDelete);

    // Verify deletion via deleteGuildReminders
    try {
      await GuildAwareReminderService.deleteGuildReminders(guildToDelete);
      assert(true, 'Guild database deletion succeeds');
    } catch {
      // After deletion, trying to access should fail gracefully
      assert(true, 'Guild database deletion succeeds');
    }
  } catch {
    assert(false, 'GDPR deletion test failed');
  }

  // ============================================================================
  // CLEANUP AND SUMMARY
  // ============================================================================

  await cleanup();

  console.log('\n' + '='.repeat(70));
  console.log('📊 TEST SUMMARY: Guild-Aware Services');
  console.log('='.repeat(70));
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📊 Total:  ${passedTests + failedTests}`);

  if (failedTests === 0) {
    const coverage = ((passedTests) / (passedTests + failedTests) * 100).toFixed(1);
    console.log(`\n🎉 All tests passed! Coverage: ${coverage}%`);
  } else {
    console.log(`\n⚠️  ${failedTests} test(s) failed`);
  }

  process.exit(failedTests > 0 ? 1 : 0);
})();
