/**
 * Test Suite: Guild-Aware Communication Service (Phase 6)
 * Tests user opt-in/opt-out status management with per-guild databases
 */

const GuildAwareCommunicationService = require('../../src/services/GuildAwareCommunicationService');
const GuildDatabaseManager = require('../../src/services/GuildDatabaseManager');

let passed = 0;
let failed = 0;
const skipped = 0;

// Test guild ID
const TEST_GUILD_ID = 'test-guild-' + Date.now();

// Helper function to cleanup guild database
async function cleanupGuild() {
  try {
    await GuildDatabaseManager.deleteGuildDatabase(TEST_GUILD_ID);
  } catch {
    // Guild may not exist yet, that's ok
  }
}

// Run all tests with guild cleanup
(async () => {
  try {
    await cleanupGuild();
  } catch {
    console.error('Failed to cleanup guild for tests:');
    process.exit(1);
  }

  // Test 1: isOptedIn returns false for non-existent user
  console.log('\n=== Test 1: New User Defaults to Opted Out ===');
  await (async () => {
    try {
      const testUserId = 'test-user-1';

      const result = await GuildAwareCommunicationService.isOptedIn(TEST_GUILD_ID, testUserId);

      if (result === false) {
        console.log('✅ Test 1 Passed: New user is opted out by default');
        passed++;
      } else {
        console.error('❌ Test 1 Failed: Expected false, got', result);
        failed++;
      }
    } catch (err) {
      console.error('❌ Test 1 Failed:', err.message);
      failed++;
    }
  })();

  // Test 2: optIn successfully opts user in
  console.log('\n=== Test 2: Opt-In Successfully Updates Status ===');
  await (async () => {
    try {
      const testUserId = 'test-user-2';

      await GuildAwareCommunicationService.optIn(TEST_GUILD_ID, testUserId);
      const result = await GuildAwareCommunicationService.isOptedIn(TEST_GUILD_ID, testUserId);

      if (result === true) {
        console.log('✅ Test 2 Passed: User opted in successfully');
        passed++;
      } else {
        console.error('❌ Test 2 Failed: Expected true after optIn, got', result);
        failed++;
      }
    } catch (err) {
      console.error('❌ Test 2 Failed:', err.message);
      failed++;
    }
  })();

  // Test 3: optOut successfully opts user out
  console.log('\n=== Test 3: Opt-Out Successfully Updates Status ===');
  await (async () => {
    try {
      const testUserId = 'test-user-3';

      await GuildAwareCommunicationService.optIn(TEST_GUILD_ID, testUserId);
      await GuildAwareCommunicationService.optOut(TEST_GUILD_ID, testUserId);
      const result = await GuildAwareCommunicationService.isOptedIn(TEST_GUILD_ID, testUserId);

      if (result === false) {
        console.log('✅ Test 3 Passed: User opted out successfully');
        passed++;
      } else {
        console.error('❌ Test 3 Failed: Expected false after optOut, got', result);
        failed++;
      }
    } catch (err) {
      console.error('❌ Test 3 Failed:', err.message);
      failed++;
    }
  })();

  // Test 4: optIn is idempotent (can be called multiple times)
  console.log('\n=== Test 4: Opt-In Idempotency ===');
  await (async () => {
    try {
      const testUserId = 'test-user-4';

      await GuildAwareCommunicationService.optIn(TEST_GUILD_ID, testUserId);
      await GuildAwareCommunicationService.optIn(TEST_GUILD_ID, testUserId);
      await GuildAwareCommunicationService.optIn(TEST_GUILD_ID, testUserId);
      const result = await GuildAwareCommunicationService.isOptedIn(TEST_GUILD_ID, testUserId);

      if (result === true) {
        console.log('✅ Test 4 Passed: Opt-in is idempotent');
        passed++;
      } else {
        console.error('❌ Test 4 Failed: Idempotent optIn failed');
        failed++;
      }
    } catch (err) {
      console.error('❌ Test 4 Failed:', err.message);
      failed++;
    }
  })();

  // Test 5: optOut is idempotent (can be called multiple times)
  console.log('\n=== Test 5: Opt-Out Idempotency ===');
  await (async () => {
    try {
      const testUserId = 'test-user-5';

      await GuildAwareCommunicationService.optOut(TEST_GUILD_ID, testUserId);
      await GuildAwareCommunicationService.optOut(TEST_GUILD_ID, testUserId);
      await GuildAwareCommunicationService.optOut(TEST_GUILD_ID, testUserId);
      const result = await GuildAwareCommunicationService.isOptedIn(TEST_GUILD_ID, testUserId);

      if (result === false) {
        console.log('✅ Test 5 Passed: Opt-out is idempotent');
        passed++;
      } else {
        console.error('❌ Test 5 Failed: Idempotent optOut failed');
        failed++;
      }
    } catch (err) {
      console.error('❌ Test 5 Failed:', err.message);
      failed++;
    }
  })();

  // Test 6: getStatus returns correct opted_in value
  console.log('\n=== Test 6: getStatus Returns Correct Opt-In Status ===');
  await (async () => {
    try {
      const testUserId = 'test-user-6';

      await GuildAwareCommunicationService.optIn(TEST_GUILD_ID, testUserId);
      const status = await GuildAwareCommunicationService.getStatus(TEST_GUILD_ID, testUserId);

      // opted_in is stored as 0/1 in SQLite, so check for truthy value and timestamps
      if (status.opted_in === 1 && status.createdAt && status.updatedAt) {
        console.log('✅ Test 6 Passed: getStatus returns correct status with timestamps');
        passed++;
      } else {
        console.error('❌ Test 6 Failed: Incorrect status object', status);
        failed++;
      }
    } catch (err) {
      console.error('❌ Test 6 Failed:', err.message);
      failed++;
    }
  })();

  // Test 7: getStatus returns false for non-existent user
  console.log('\n=== Test 7: getStatus Returns False for New User ===');
  await (async () => {
    try {
      const testUserId = 'test-user-7';

      const status = await GuildAwareCommunicationService.getStatus(TEST_GUILD_ID, testUserId);

      // opted_in is stored as 0/1 in SQLite, so check for 0 and null timestamps
      if (status.opted_in === 0 && status.createdAt === null && status.updatedAt === null) {
        console.log('✅ Test 7 Passed: getStatus returns opt-out with no timestamps for new user');
        passed++;
      } else {
        console.error('❌ Test 7 Failed: Incorrect status for new user', status);
        failed++;
      }
    } catch (err) {
      console.error('❌ Test 7 Failed:', err.message);
      failed++;
    }
  })();

  // Test 8: State transitions work correctly (in -> out -> in)
  console.log('\n=== Test 8: State Transitions ===');
  await (async () => {
    try {
      const testUserId = 'test-user-8';

      // Start opted out
      let result = await GuildAwareCommunicationService.isOptedIn(TEST_GUILD_ID, testUserId);
      if (result !== false) throw new Error('Initial state should be opted out');

      // Transition to opted in
      await GuildAwareCommunicationService.optIn(TEST_GUILD_ID, testUserId);
      result = await GuildAwareCommunicationService.isOptedIn(TEST_GUILD_ID, testUserId);
      if (result !== true) throw new Error('Should be opted in after optIn');

      // Transition to opted out
      await GuildAwareCommunicationService.optOut(TEST_GUILD_ID, testUserId);
      result = await GuildAwareCommunicationService.isOptedIn(TEST_GUILD_ID, testUserId);
      if (result !== false) throw new Error('Should be opted out after optOut');

      // Transition back to opted in
      await GuildAwareCommunicationService.optIn(TEST_GUILD_ID, testUserId);
      result = await GuildAwareCommunicationService.isOptedIn(TEST_GUILD_ID, testUserId);
      if (result !== true) throw new Error('Should be opted in again');

      console.log('✅ Test 8 Passed: State transitions work correctly');
      passed++;
    } catch (err) {
      console.error('❌ Test 8 Failed:', err.message);
      failed++;
    }
  })();

  // Test 9: Multiple users can have different opt-in states
  console.log('\n=== Test 9: Multiple Users with Different States ===');
  await (async () => {
    try {
      const user1 = 'test-user-9a';
      const user2 = 'test-user-9b';
      const user3 = 'test-user-9c';

      // User 1: opted in
      await GuildAwareCommunicationService.optIn(TEST_GUILD_ID, user1);

      // User 2: opted out
      await GuildAwareCommunicationService.optOut(TEST_GUILD_ID, user2);

      // User 3: default (opted out)
      // Don't call anything for user 3

      const result1 = await GuildAwareCommunicationService.isOptedIn(TEST_GUILD_ID, user1);
      const result2 = await GuildAwareCommunicationService.isOptedIn(TEST_GUILD_ID, user2);
      const result3 = await GuildAwareCommunicationService.isOptedIn(TEST_GUILD_ID, user3);

      if (result1 === true && result2 === false && result3 === false) {
        console.log('✅ Test 9 Passed: Multiple users can have different states');
        passed++;
      } else {
        console.error('❌ Test 9 Failed: User states incorrect', { result1, result2, result3 });
        failed++;
      }
    } catch (err) {
      console.error('❌ Test 9 Failed:', err.message);
      failed++;
    }
  })();

  // Test 10: Timestamps are updated on state changes
  console.log('\n=== Test 10: Timestamps Update on Changes ===');
  await (async () => {
    try {
      const testUserId = 'test-user-10';

      // Initial opt-in
      await GuildAwareCommunicationService.optIn(TEST_GUILD_ID, testUserId);
      const status1 = await GuildAwareCommunicationService.getStatus(TEST_GUILD_ID, testUserId);
      const timestamp1 = status1.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      // Opt-out
      await GuildAwareCommunicationService.optOut(TEST_GUILD_ID, testUserId);
      const status2 = await GuildAwareCommunicationService.getStatus(TEST_GUILD_ID, testUserId);
      const timestamp2 = status2.updatedAt;

      if (timestamp1 && timestamp2 && timestamp1 !== timestamp2) {
        console.log('✅ Test 10 Passed: Timestamps update on state changes');
        passed++;
      } else {
        console.error('❌ Test 10 Failed: Timestamps not updated', { timestamp1, timestamp2 });
        failed++;
      }
    } catch (err) {
      console.error('❌ Test 10 Failed:', err.message);
      failed++;
    }
  })();

  // Print summary
  setTimeout(async () => {
    console.log('\n' + '='.repeat(50));
    console.log('TEST SUMMARY: Guild-Aware Communication Service (Phase 6)');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`📊 Total:  ${passed + failed + skipped}`);

    if (failed === 0) {
      console.log('\n🎉 All tests passed!');
    } else {
      console.log(`\n⚠️  ${failed} test(s) failed`);
    }

    // Cleanup guild
    try {
      await GuildDatabaseManager.deleteGuildDatabase(TEST_GUILD_ID);
    } catch {
      // Ignore cleanup errors
    }

    process.exit(failed > 0 ? 1 : 0);
  }, 2000);
})();
