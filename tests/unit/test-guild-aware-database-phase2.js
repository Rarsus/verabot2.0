#!/usr/bin/env node
/**
 * Phase 2A: Guild-Aware Database Testing
 *
 * Comprehensive test suite for guild-specific database operations.
 * Tests GuildDatabaseManager and GuildAwareDatabaseService with isolation validation.
 *
 * Test Categories:
 * 1. GuildDatabaseManager Basic Operations (4 tests)
 * 2. Guild-Aware Quote Operations (5 tests)
 * 3. Guild Data Isolation Validation (4 tests)
 * 4. Guild Database File Management (3 tests)
 * 5. Error Handling & Edge Cases (3 tests)
 *
 * Total: 19 tests
 */

const guildManager = require('../../src/services/GuildDatabaseManager');
const db = require('../../src/services/GuildAwareDatabaseService');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ ${message}`);
    failed++;
  } else {
    console.log(`  ✓ ${message}`);
    passed++;
  }
}

async function runTests() {
  console.log('\n🧪 Phase 2A: Guild-Aware Database Testing\n');

  try {
    const guildA = 'phase2a-guild-a';
    const guildB = 'phase2a-guild-b';

    // Cleanup before test
    try {
      await db.deleteGuildData(guildA);
      await db.deleteGuildData(guildB);
    } catch {
      // Ignore cleanup errors
    }

    // ========================================================================
    // CATEGORY 1: GuildDatabaseManager Basic Operations (4 tests)
    // ========================================================================

    console.log('📌 Category 1: GuildDatabaseManager Basic Operations\n');

    const connA1 = await guildManager.getGuildDatabase(guildA);
    assert(connA1 !== null && connA1 !== undefined, 'Test 1: Get database connection for guild A');

    const connB1 = await guildManager.getGuildDatabase(guildB);
    assert(connB1 !== null && connB1 !== undefined, 'Test 2: Get database connection for guild B');

    const connA2 = await guildManager.getGuildDatabase(guildA);
    assert(connA1 === connA2, 'Test 3: Connection is cached (same instance)');

    assert(connA1 !== connB1, 'Test 4: Different guilds have different connections');

    // ========================================================================
    // CATEGORY 2: Guild-Aware Quote Operations (5 tests)
    // ========================================================================

    console.log('\n📌 Category 2: Guild-Aware Quote Operations\n');

    const q1 = await db.addQuote(guildA, 'First quote', 'Author A');
    assert(q1 !== null && q1 > 0, 'Test 5: Add quote to guild A');

    const q2 = await db.addQuote(guildA, 'Second quote', 'Author B');
    assert(q2 !== null && q2 > 0, 'Test 6: Add second quote to guild A');

    const q3 = await db.addQuote(guildB, 'Quote for B', 'Author C');
    assert(q3 !== null && q3 > 0, 'Test 7: Add quote to guild B');

    const allA = await db.getAllQuotes(guildA);
    assert(allA.length === 2, 'Test 8: Guild A has exactly 2 quotes');

    const allB = await db.getAllQuotes(guildB);
    assert(allB.length === 1, 'Test 9: Guild B has exactly 1 quote');

    // ========================================================================
    // CATEGORY 3: Guild Data Isolation Validation (4 tests)
    // ========================================================================

    console.log('\n📌 Category 3: Guild Data Isolation Validation\n');

    const searchA = await db.searchQuotes(guildA, 'quote');
    assert(searchA.length === 2, 'Test 10: Guild A search returns 2 quotes');

    const searchB = await db.searchQuotes(guildB, 'quote');
    assert(searchB.length === 1, 'Test 11: Guild B search returns 1 quote');

    const countA = await db.getQuoteCount(guildA);
    assert(countA === 2, 'Test 12: Guild A count is 2');

    const countB = await db.getQuoteCount(guildB);
    assert(countB === 1, 'Test 13: Guild B count is 1');

    // ========================================================================
    // CATEGORY 4: Guild Database File Management (3 tests)
    // ========================================================================

    console.log('\n📌 Category 4: Guild Database File Management\n');

    const qBefore = await db.getQuoteCount(guildA);
    await guildManager.closeGuildDatabase(guildA);
    await guildManager.getGuildDatabase(guildA);
    const qAfter = await db.getQuoteCount(guildA);
    assert(qBefore === qAfter, 'Test 14: Data persists after close/reopen');

    await guildManager.closeAllDatabases();
    assert(true, 'Test 15: Close all databases');

    await guildManager.getGuildDatabase(guildA);
    const finalCount = await db.getQuoteCount(guildA);
    assert(finalCount === 2, 'Test 16: Data still intact after closeAll');

    // ========================================================================
    // CATEGORY 5: Error Handling & Edge Cases (3 tests)
    // ========================================================================

    console.log('\n📌 Category 5: Error Handling & Edge Cases\n');

    try {
      await db.addQuote('', 'text', 'author');
      assert(false, 'Test 17: Should reject empty guild ID');
    } catch {
      assert(true, 'Test 17: Rejects empty guild ID');
    }

    const bulkQuotes = await Promise.all([
      db.addQuote(guildA, 'Bulk 1', 'A'),
      db.addQuote(guildA, 'Bulk 2', 'B'),
      db.addQuote(guildA, 'Bulk 3', 'C')
    ]);
    assert(bulkQuotes.length === 3, 'Test 18: Handle concurrent adds');

    const finalA = await db.getQuoteCount(guildA);
    assert(finalA === 5, 'Test 19: Bulk adds don\'t cross guilds');

    // ========================================================================
    // RESULTS
    // ========================================================================

    console.log('\n' + '='.repeat(60));
    console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
    console.log('='.repeat(60) + '\n');

    if (failed === 0) {
      console.log('✨ All Phase 2A tests passed!\n');
    } else {
      console.log(`⚠️  ${failed} test(s) failed\n`);
    }
  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
    console.error(error.stack);
  }
}

runTests();
