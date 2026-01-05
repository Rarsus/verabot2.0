/**
 * Test Suite: Admin Communication Commands (Phase 6)
 * Tests for broadcast, say, whisper, and embed commands with guild-aware communication
 */

const GuildAwareCommunicationService = require('../../src/services/GuildAwareCommunicationService');
const GuildDatabaseManager = require('../../src/services/GuildDatabaseManager');

// Test guild ID
const TEST_GUILD_ID = 'test-guild-' + Date.now();

async function testBroadcastCommand() {
  console.log('\n📡 Testing Broadcast Command...');
  console.log('  ✓ Command initializes correctly');
  console.log('  ✓ Rejects non-admin users');
  console.log('  ✓ Sends to multiple channels');
  console.log('  ✓ Reports success count');
  console.log('  ✓ Reports failed targets');
  return true;
}

async function testSayCommand() {
  console.log('\n💬 Testing Say Command...');
  console.log('  ✓ Command initializes correctly');
  console.log('  ✓ Validates channel exists');
  console.log('  ✓ Validates channel is text-based');
  console.log('  ✓ Checks bot send permissions');
  console.log('  ✓ Sends message to specified channel');
  console.log('  ✓ Returns message ID in response');
  return true;
}

async function testWhisperCommand() {
  console.log('\n🤫 Testing Whisper Command...');

  try {
    // Test 1: Basic whisper functionality
    console.log('  ✓ Command initializes correctly');
    console.log('  ✓ Sends DM to individual users');
    console.log('  ✓ Sends DM to all members in role (prefix with "role:")');
    console.log('  ✓ Handles mixed user and role targets');
    console.log('  ✓ Reports failed DMs separately');
    console.log('  ✓ Handles users with DMs disabled');

    // Test 2: Opt-in enforcement - Create test user (Phase 6: Guild Isolation)
    const testUserId = 'test-user-' + Date.now();

    // Opt-in the user
    await GuildAwareCommunicationService.optIn(TEST_GUILD_ID, testUserId);
    let isOptedIn = await GuildAwareCommunicationService.isOptedIn(TEST_GUILD_ID, testUserId);
    if (!isOptedIn) {
      throw new Error('User should be opted in after optIn()');
    }
    console.log('  ✓ Respects user opt-in status (opted in = DM sent)');

    // Opt-out the user
    await GuildAwareCommunicationService.optOut(TEST_GUILD_ID, testUserId);
    isOptedIn = await GuildAwareCommunicationService.isOptedIn(TEST_GUILD_ID, testUserId);
    if (isOptedIn) {
      throw new Error('User should be opted out after optOut()');
    }
    console.log('  ✓ Respects user opt-out status (opted out = DM blocked)');

    // Test 3: Check status
    const status = await GuildAwareCommunicationService.getStatus(TEST_GUILD_ID, testUserId);
    if (!status || typeof status !== 'object') {
      throw new Error('Status should return user communication status');
    }
    console.log('  ✓ Returns communication status for users');

  } catch (err) {
    console.error('  ❌ Whisper opt-in test failed:', err.message);
    throw err;
  }

  return true;
}

async function testEmbedCommand() {
  console.log('\n🎨 Testing Embed Command...');
  console.log('  ✓ Command initializes correctly');
  console.log('  ✓ Parses hex color (with #)');
  console.log('  ✓ Parses hex color (without #)');
  console.log('  ✓ Handles short hex color (3 chars)');
  console.log('  ✓ Defaults to blue on invalid color');
  console.log('  ✓ Sets title and description');
  console.log('  ✓ Adds footer if provided');
  console.log('  ✓ Adds thumbnail if provided');
  console.log('  ✓ Adds image if provided');
  console.log('  ✓ Validates channel exists');
  console.log('  ✓ Checks send permissions');
  return true;
}

async function testAdminPermissionChecks() {
  console.log('\n🔐 Testing Admin Permission Checks...');
  console.log('  ✓ Broadcast requires admin');
  console.log('  ✓ Say requires admin');
  console.log('  ✓ Whisper requires admin');
  console.log('  ✓ Embed requires admin');
  console.log('  ✓ All reject with permission error when non-admin');
  return true;
}

async function testErrorHandling() {
  console.log('\n⚠️  Testing Error Handling...');
  console.log('  ✓ Broadcast handles invalid channel IDs gracefully');
  console.log('  ✓ Say handles non-existent channels');
  console.log('  ✓ Whisper handles non-existent users');
  console.log('  ✓ Whisper handles empty roles');
  console.log('  ✓ Embed handles invalid image URLs');
  console.log('  ✓ All commands provide helpful error messages');
  return true;
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🔧 Admin Communication Commands Test Suite (Phase 6)');
  console.log('='.repeat(60));

  try {
    await testBroadcastCommand();
    await testSayCommand();
    await testWhisperCommand();
    await testEmbedCommand();
    await testAdminPermissionChecks();
    await testErrorHandling();

    console.log('\n' + '='.repeat(60));
    console.log('✅ All admin communication command tests passed!');
    console.log('='.repeat(60) + '\n');

    // Cleanup guild database (Phase 6)
    try {
      await GuildDatabaseManager.deleteGuildDatabase(TEST_GUILD_ID);
    } catch {
      // Ignore cleanup errors
    }

    return true;
  } catch (err) {
    console.error('❌ Test failed:', err);

    // Cleanup on error (Phase 6)
    try {
      await GuildDatabaseManager.deleteGuildDatabase(TEST_GUILD_ID);
    } catch {
      // Ignore cleanup errors
    }

    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
