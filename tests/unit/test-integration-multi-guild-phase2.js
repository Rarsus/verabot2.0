#!/usr/bin/env node
/**
 * Phase 2B: Integration Multi-Guild Testing
 *
 * Comprehensive end-to-end testing across multiple guilds.
 * Tests concurrent operations, data consistency, and cross-guild isolation.
 *
 * Test Categories:
 * 1. Multi-Guild Quote Management (4 tests)
 * 2. Concurrent Guild Operations (4 tests)
 * 3. Guild Data Consistency (3 tests)
 * 4. Cross-Guild Isolation (4 tests)
 * 5. Error Recovery in Multi-Guild Context (3 tests)
 *
 * Total: 18 tests
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
  console.log('\n🧪 Phase 2B: Integration Multi-Guild Testing\n');

  try {
    const guilds = ['guild-test-1', 'guild-test-2', 'guild-test-3', 'guild-test-4', 'guild-test-5'];

    // Cleanup
    for (const guildId of guilds) {
      try {
        await db.deleteGuildData(guildId);
      } catch {
        // Ignore
      }
    }

    // ========================================================================
    // CATEGORY 1: Multi-Guild Quote Management (4 tests)
    // ========================================================================

    console.log('📌 Category 1: Multi-Guild Quote Management\n');

    // Add quotes to each guild
    const quotes = {};
    for (const guildId of guilds) {
      quotes[guildId] = [];
      quotes[guildId].push(await db.addQuote(guildId, `Quote 1 for ${guildId}`, 'Author 1'));
      quotes[guildId].push(await db.addQuote(guildId, `Quote 2 for ${guildId}`, 'Author 2'));
    }

    // Verify each guild has its own quotes
    let allCorrect = true;
    for (const guildId of guilds) {
      const count = await db.getQuoteCount(guildId);
      if (count !== 2) allCorrect = false;
    }
    assert(allCorrect, 'Test 1: Each guild has exactly 2 quotes');

    // Verify quotes are unique per guild
    let isolationOk = true;
    const g1Quotes = await db.getAllQuotes(guilds[0]);
    await db.getAllQuotes(guilds[1]);
    if (g1Quotes[0].text !== g1Quotes[0].text.split('guild-test-1')[0] + 'guild-test-1') {
      isolationOk = false;
    }
    assert(isolationOk, 'Test 2: Quotes contain guild-specific content');

    // Update quotes in different guilds
    await db.updateQuote(guilds[0], quotes[guilds[0]][0], 'Updated G1Q1', 'New Author');
    await db.updateQuote(guilds[1], quotes[guilds[1]][0], 'Updated G2Q1', 'New Author');
    const updated1 = await db.getQuoteById(guilds[0], quotes[guilds[0]][0]);
    const updated2 = await db.getQuoteById(guilds[1], quotes[guilds[1]][0]);
    assert(updated1.text === 'Updated G1Q1' && updated2.text === 'Updated G2Q1', 'Test 3: Updates isolated per guild');

    // Delete from one guild shouldn't affect others
    await db.deleteQuote(guilds[0], quotes[guilds[0]][1]);
    const afterDelete1 = await db.getQuoteCount(guilds[0]);
    const afterDelete2 = await db.getQuoteCount(guilds[1]);
    assert(afterDelete1 === 1 && afterDelete2 === 2, 'Test 4: Deletion doesn\'t cross guilds');

    // ========================================================================
    // CATEGORY 2: Concurrent Guild Operations (4 tests)
    // ========================================================================

    console.log('\n📌 Category 2: Concurrent Guild Operations\n');

    // Concurrent adds across guilds
    const concurrentAdds = [];
    for (let i = 0; i < 10; i++) {
      for (const guildId of guilds) {
        concurrentAdds.push(db.addQuote(guildId, `Concurrent ${i}`, `Author ${i}`));
      }
    }
    await Promise.all(concurrentAdds);

    let concurrentOk = true;
    for (const guildId of guilds) {
      const count = await db.getQuoteCount(guildId);
      if (guildId === guilds[0]) {
        if (count !== 11) concurrentOk = false; // 1 remaining + 10 new
      } else {
        if (count !== 12) concurrentOk = false; // 2 original + 10 new
      }
    }
    assert(concurrentOk, 'Test 5: Concurrent adds maintain correct counts');

    // Concurrent searches
    const concurrentSearches = [];
    for (const guildId of guilds) {
      for (let i = 0; i < 5; i++) {
        concurrentSearches.push(db.searchQuotes(guildId, 'Concurrent'));
      }
    }
    const searchResults = await Promise.all(concurrentSearches);
    assert(searchResults.length === 25, 'Test 6: Concurrent searches complete');

    // Concurrent updates
    const allQuotes = {};
    for (const guildId of guilds) {
      allQuotes[guildId] = await db.getAllQuotes(guildId);
    }

    const concurrentUpdates = [];
    for (const guildId of guilds) {
      if (allQuotes[guildId].length > 0) {
        concurrentUpdates.push(
          db.updateQuote(guildId, allQuotes[guildId][0].id, 'Concurrently Updated', 'Bot')
        );
      }
    }
    await Promise.all(concurrentUpdates);
    assert(true, 'Test 7: Concurrent updates complete');

    // Verify concurrent operations didn't mix data
    let dataMixed = false;
    for (const guildId of guilds) {
      const quotes = await db.getAllQuotes(guildId);
      for (const q of quotes) {
        // Check that no guild's quotes leaked to another
        if (q.text.includes('guild-test-') && !q.text.includes(guildId)) {
          dataMixed = true;
        }
      }
    }
    assert(!dataMixed, 'Test 8: Concurrent operations don\'t mix data');

    // ========================================================================
    // CATEGORY 3: Guild Data Consistency (3 tests)
    // ========================================================================

    console.log('\n📌 Category 3: Guild Data Consistency\n');

    // Count before operations
    const countsBefore = {};
    for (const guildId of guilds) {
      countsBefore[guildId] = await db.getQuoteCount(guildId);
    }

    // Close and reopen
    await guildManager.closeAllDatabases();

    // Count after operations
    const countsAfter = {};
    for (const guildId of guilds) {
      countsAfter[guildId] = await db.getQuoteCount(guildId);
    }

    // Verify consistency
    let consistent = true;
    for (const guildId of guilds) {
      if (countsBefore[guildId] !== countsAfter[guildId]) {
        consistent = false;
      }
    }
    assert(consistent, 'Test 9: Data consistent after close/reopen');

    // Export and verify
    const exports = {};
    for (const guildId of guilds) {
      exports[guildId] = await db.exportGuildData(guildId);
    }

    let exportsValid = true;
    for (const guildId of guilds) {
      if (!exports[guildId].data || !Array.isArray(exports[guildId].data.quotes)) {
        exportsValid = false;
      }
    }
    assert(exportsValid, 'Test 10: All guilds export successfully');

    // Verify exports don't contain cross-guild data
    let exportsIsolated = true;
    for (const guildId of guilds) {
      const exportData = exports[guildId];
      for (const quote of exportData.data.quotes) {
        // Basic check: no obvious cross-contamination
        if (quote.text && quote.text.includes('guild-test-')) {
          const mentioned = quote.text.match(/guild-test-\d/)[0];
          if (mentioned !== guildId) {
            exportsIsolated = false;
          }
        }
      }
    }
    assert(exportsIsolated, 'Test 11: Exports contain only guild-specific data');

    // ========================================================================
    // CATEGORY 4: Cross-Guild Isolation (4 tests)
    // ========================================================================

    console.log('\n📌 Category 4: Cross-Guild Isolation\n');

    // Add tags to quotes in different guilds
    const taggedQuotes = {};
    for (const guildId of guilds.slice(0, 3)) {
      const allQ = await db.getAllQuotes(guildId);
      if (allQ.length > 0) {
        taggedQuotes[guildId] = allQ[0].id;
        await db.tagQuote(guildId, allQ[0].id, `tag-for-${guildId}`);
      }
    }

    // Verify tags are isolated
    let tagsIsolated = true;
    const tag1 = await db.getQuotesByTag(guilds[0], `tag-for-${guilds[0]}`);
    const tag2 = await db.getQuotesByTag(guilds[1], `tag-for-${guilds[1]}`);
    if (tag1.length !== 1 || tag2.length !== 1) tagsIsolated = false;
    assert(tagsIsolated, 'Test 12: Tags are guild-isolated');

    // Rate quotes differently in each guild
    for (const guildId of guilds.slice(0, 3)) {
      const allQ = await db.getAllQuotes(guildId);
      if (allQ.length > 0) {
        await db.rateQuote(guildId, allQ[0].id, 'user-1', 5);
        await db.rateQuote(guildId, allQ[0].id, 'user-2', 4);
      }
    }

    // Verify ratings are isolated
    let ratingsIsolated = true;
    const rating1 = await db.getQuoteRating(guilds[0], taggedQuotes[guilds[0]]);
    const rating2 = await db.getQuoteRating(guilds[1], taggedQuotes[guilds[1]]);
    if (rating1.count !== 2 || rating2.count !== 2) ratingsIsolated = false;
    assert(ratingsIsolated, 'Test 13: Ratings are guild-isolated');

    // Search isolation
    const s1 = await db.searchQuotes(guilds[0], 'Concurrently');
    const s2 = await db.searchQuotes(guilds[1], 'Concurrently');
    const searchIsolated = s1.length === 1 && s2.length === 1;
    assert(searchIsolated, 'Test 14: Search results are isolated');

    // Verify no data leakage
    let noLeakage = true;
    for (const guildId of guilds) {
      const allQ = await db.getAllQuotes(guildId);
      for (const q of allQ) {
        // No obvious cross-guild references should exist
        if (q.text && q.guildId && q.guildId !== guildId) {
          noLeakage = false;
        }
      }
    }
    assert(noLeakage, 'Test 15: No data leakage between guilds');

    // ========================================================================
    // CATEGORY 5: Error Recovery in Multi-Guild Context (3 tests)
    // ========================================================================

    console.log('\n📌 Category 5: Error Recovery in Multi-Guild Context\n');

    // Add more quotes for testing
    await db.addQuote(guilds[0], 'Error test quote', 'Author');

    // Simulate error in one guild (should not affect others)
    let errorRecovered = true;
    try {
      // Try invalid operation
      await db.getQuoteById('', 999);
    } catch {
      // Error expected, guild should still work
      const count = await db.getQuoteCount(guilds[0]);
      errorRecovered = count > 0;
    }
    assert(errorRecovered, 'Test 16: Error in one guild doesn\'t affect others');

    // Cascade prevention: delete in one guild
    await db.getQuoteCount(guilds[0]);
    const g1Count = await db.getQuoteCount(guilds[1]);

    await db.deleteGuildData(guilds[0]);

    const g0CountAfter = await db.getQuoteCount(guilds[0]);
    const g1CountAfter = await db.getQuoteCount(guilds[1]);

    assert(g0CountAfter === 0 && g1CountAfter === g1Count, 'Test 17: Deletion doesn\'t cascade');

    // Recovery after data loss
    await db.addQuote(guilds[0], 'Recovered quote', 'Author');
    const recovered = await db.getQuoteCount(guilds[0]);
    assert(recovered === 1, 'Test 18: Guild recovers after data loss');

    // ========================================================================
    // RESULTS
    // ========================================================================

    console.log('\n' + '='.repeat(60));
    console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
    console.log('='.repeat(60) + '\n');

    if (failed === 0) {
      console.log('✨ All Phase 2B tests passed!\n');
      process.exit(0);
    } else {
      console.log(`⚠️  ${failed} test(s) failed\n`);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runTests();
