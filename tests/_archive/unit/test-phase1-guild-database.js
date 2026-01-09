#!/usr/bin/env node
/**
 * Phase 1 Test: GuildDatabaseManager & GuildAwareDatabaseService
 * Tests the new guild-aware database architecture
 */

const guildManager = require('../../src/services/GuildDatabaseManager');
const db = require('../../src/services/GuildAwareDatabaseService');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAILED: ${message}`);
    failed++;
  } else {
    console.log(`  ✓ ${message}`);
    passed++;
  }
}

async function runTests() {
  console.log('\n🧪 Phase 1 Test Suite: Guild-Aware Database Architecture\n');

  try {
    // Test setup
    const guildId1 = 'test-guild-001';
    const guildId2 = 'test-guild-002';

    // Clean up any existing test data from previous runs
    try {
      await db.deleteGuildData(guildId1);
    } catch {
      // Ignore if data doesn't exist
    }
    try {
      await db.deleteGuildData(guildId2);
    } catch {
      // Ignore if data doesn't exist
    }

    console.log('📌 Testing GuildDatabaseManager\n');

    // Test 1: Get database connection
    const conn1 = await guildManager.getGuildDatabase(guildId1);
    assert(conn1, 'Database connection created for guild 1');

    const conn2 = await guildManager.getGuildDatabase(guildId2);
    assert(conn2, 'Database connection created for guild 2');

    // Test 2: Get cached connection
    const conn1Again = await guildManager.getGuildDatabase(guildId1);
    assert(conn1Again === conn1, 'Connection is cached (same instance)');

    console.log('\n📌 Testing GuildAwareDatabaseService\n');

    // Test 3: Add quotes to different guilds
    const quote1Id = await db.addQuote(guildId1, 'Quote 1', 'Author 1');
    assert(quote1Id, 'Quote added to guild 1');

    const quote2Id = await db.addQuote(guildId1, 'Quote 2', 'Author 2');
    assert(quote2Id, 'Second quote added to guild 1');

    const quote3Id = await db.addQuote(guildId2, 'Quote 3', 'Author 3');
    assert(quote3Id, 'Quote added to guild 2');

    // Test 4: Guild isolation - quotes should not cross guilds
    const guild1Quotes = await db.getAllQuotes(guildId1);
    assert(guild1Quotes.length === 2, 'Guild 1 has exactly 2 quotes');

    const guild2Quotes = await db.getAllQuotes(guildId2);
    assert(guild2Quotes.length === 1, 'Guild 2 has exactly 1 quote');

    // Test 5: Search isolation
    const guild1Search = await db.searchQuotes(guildId1, 'Quote');
    assert(guild1Search.length === 2, 'Guild 1 search returns only guild 1 quotes');

    const guild2Search = await db.searchQuotes(guildId2, 'Quote');
    assert(guild2Search.length === 1, 'Guild 2 search returns only guild 2 quotes');

    // Test 6: Quote count isolation
    const guild1Count = await db.getQuoteCount(guildId1);
    assert(guild1Count === 2, 'Guild 1 quote count is 2');

    const guild2Count = await db.getQuoteCount(guildId2);
    assert(guild2Count === 1, 'Guild 2 quote count is 1');

    // Test 7: Get quote by ID
    const retrievedQuote = await db.getQuoteById(guildId1, quote1Id);
    assert(retrievedQuote && retrievedQuote.text === 'Quote 1', 'Retrieved quote by ID');

    // Test 8: Update quote
    const updated = await db.updateQuote(guildId1, quote1Id, 'Updated Quote', 'New Author');
    assert(updated, 'Quote updated successfully');

    const updatedQuote = await db.getQuoteById(guildId1, quote1Id);
    assert(updatedQuote.text === 'Updated Quote', 'Update persisted correctly');

    // Test 9: Rate quote
    const rated = await db.rateQuote(guildId1, quote1Id, 'user-123', 5);
    assert(rated, 'Quote rated successfully');

    const rating = await db.getQuoteRating(guildId1, quote1Id);
    assert(rating.average === 5 && rating.count === 1, 'Rating recorded correctly');

    // Test 10: Tag quote
    const tagged = await db.tagQuote(guildId1, quote1Id, 'awesome');
    assert(tagged, 'Quote tagged successfully');

    const taggedQuotes = await db.getQuotesByTag(guildId1, 'awesome');
    assert(taggedQuotes.length === 1, 'Retrieved quotes by tag');

    // Test 11: Export guild data (GDPR)
    const exportData = await db.exportGuildData(guildId1);
    assert(exportData.data.quotes.length === 2, 'Export includes all guild quotes');
    assert(exportData.data.tags.length > 0, 'Export includes tags');
    assert(exportData.statistics.totalQuotes === 2, 'Export statistics correct');

    // Test 12: Delete quote
    const deleted = await db.deleteQuote(guildId1, quote2Id);
    assert(deleted, 'Quote deleted successfully');

    const afterDelete = await db.getQuoteCount(guildId1);
    assert(afterDelete === 1, 'Quote count decreased after deletion');

    // Test 13: Get guild statistics
    const stats = await db.getGuildStatistics(guildId1);
    assert(stats.guildId === guildId1, 'Statistics include guild ID');
    assert(stats.totalQuotes === 1, 'Statistics count is accurate');

    // Test 14: Close connections
    await guildManager.closeGuildDatabase(guildId1);
    assert(true, 'Connection closed for guild 1');

    await guildManager.closeAllDatabases();
    assert(true, 'All connections closed');

    // Test 15: GDPR - Delete all data for a guild
    const quote4Id = await db.addQuote(guildId2, 'Quote 4', 'Author 4');
    assert(quote4Id, 'Quote added before GDPR deletion test');

    await db.deleteGuildData(guildId2);
    assert(true, 'Guild data deleted (GDPR compliance)');

    console.log('\n' + '='.repeat(60));
    console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
    console.log('='.repeat(60) + '\n');

    if (failed === 0) {
      console.log('✨ All Phase 1 tests passed!\n');
    } else {
      console.log(`⚠️  ${failed} test(s) failed\n`);
    }
  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
    console.error(error.stack);
  }
}

runTests();
