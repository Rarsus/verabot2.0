/**
 * Test Suite: DatabaseService
 * Tests database operations for quotes, tags, ratings, and exports
 */

/* eslint-disable no-unused-vars */

const {
  addQuote,
  getAllQuotes,
  getQuoteById,
  searchQuotes,
  updateQuote,
  deleteQuote,
  getQuoteCount,
  rateQuote,
  getQuoteRating,
  addTag,
  getTagByName,
  addTagToQuote,
  getQuotesByTag,
  getAllTags,
  getQuotesByCategory,
  exportQuotesAsJson,
  exportQuotesAsCsv
} = require('../../src/services/DatabaseService');

let passed = 0;
let failed = 0;

// Test 1: Add quote
console.log('\n=== Test 1: Add Quote ===');
(async () => {
  try {
    const quoteId = await addQuote('Test quote text', 'Test Author');
    if (typeof quoteId === 'number' && quoteId > 0) {
      console.log('✅ Test 1 Passed: Quote added successfully');
      passed++;
    } else {
      console.error('❌ Test 1 Failed: Invalid quote ID returned');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 1 Failed:', err.message);
    failed++;
  }
})();

// Test 2: Get all quotes
console.log('\n=== Test 2: Get All Quotes ===');
(async () => {
  try {
    const quotes = await getAllQuotes();
    if (Array.isArray(quotes)) {
      console.log('✅ Test 2 Passed: Retrieved quotes array');
      passed++;
    } else {
      console.error('❌ Test 2 Failed: Quotes is not an array');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 2 Failed:', err.message);
    failed++;
  }
})();

// Test 3: Get quote count
console.log('\n=== Test 3: Get Quote Count ===');
(async () => {
  try {
    const count = await getQuoteCount();
    if (typeof count === 'number' && count >= 0) {
      console.log(`✅ Test 3 Passed: Quote count retrieved (${count})`);
      passed++;
    } else {
      console.error('❌ Test 3 Failed: Invalid count returned');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 3 Failed:', err.message);
    failed++;
  }
})();

// Test 4: Get quote by ID
console.log('\n=== Test 4: Get Quote by ID ===');
(async () => {
  try {
    // First add a quote
    const quoteId = await addQuote('Find me by ID', 'Test Author');
    // Then retrieve it
    const quote = await getQuoteById(quoteId);
    if (quote && quote.id === quoteId && quote.text === 'Find me by ID') {
      console.log('✅ Test 4 Passed: Quote retrieved by ID');
      passed++;
    } else {
      console.error('❌ Test 4 Failed: Quote not found or incorrect');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 4 Failed:', err.message);
    failed++;
  }
})();

// Test 5: Search quotes
console.log('\n=== Test 5: Search Quotes ===');
(async () => {
  try {
    // Add a searchable quote
    await addQuote('Unique search term here', 'Searchable Author');
    // Search for it
    const results = await searchQuotes('unique search');
    if (Array.isArray(results) && results.length > 0) {
      console.log('✅ Test 5 Passed: Search returned results');
      passed++;
    } else {
      console.error('❌ Test 5 Failed: Search found no results');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 5 Failed:', err.message);
    failed++;
  }
})();

// Test 6: Update quote
console.log('\n=== Test 6: Update Quote ===');
(async () => {
  try {
    // Add a quote to update
    const quoteId = await addQuote('Original text', 'Original Author');
    // Update it
    const success = await updateQuote(quoteId, 'Updated text', 'Updated Author');
    if (success === true) {
      // Verify the update
      const updated = await getQuoteById(quoteId);
      if (updated.text === 'Updated text' && updated.author === 'Updated Author') {
        console.log('✅ Test 6 Passed: Quote updated successfully');
        passed++;
      } else {
        console.error('❌ Test 6 Failed: Update not verified');
        failed++;
      }
    } else {
      console.error('❌ Test 6 Failed: Update returned false');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 6 Failed:', err.message);
    failed++;
  }
})();

// Test 7: Delete quote
console.log('\n=== Test 7: Delete Quote ===');
(async () => {
  try {
    // Add a quote to delete
    const quoteId = await addQuote('Delete me', 'Delete Author');
    // Delete it
    const success = await deleteQuote(quoteId);
    if (success === true) {
      // Verify deletion
      const deleted = await getQuoteById(quoteId);
      if (deleted === null) {
        console.log('✅ Test 7 Passed: Quote deleted successfully');
        passed++;
      } else {
        console.error('❌ Test 7 Failed: Quote still exists after deletion');
        failed++;
      }
    } else {
      console.error('❌ Test 7 Failed: Delete returned false');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 7 Failed:', err.message);
    failed++;
  }
})();

// Test 8: Rate quote
console.log('\n=== Test 8: Rate Quote ===');
(async () => {
  try {
    // Add a quote to rate
    const quoteId = await addQuote('Rate me', 'Rate Author');
    // Rate it
    const result = await rateQuote(quoteId, 'user123', 5);
    if (result.success === true) {
      console.log('✅ Test 8 Passed: Quote rated successfully');
      passed++;
    } else {
      console.error('❌ Test 8 Failed: Rating failed');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 8 Failed:', err.message);
    failed++;
  }
})();

// Test 9: Get quote rating
console.log('\n=== Test 9: Get Quote Rating ===');
(async () => {
  try {
    // Add a quote and rate it
    const quoteId = await addQuote('Get my rating', 'Rating Author');
    await rateQuote(quoteId, 'user456', 4);
    // Retrieve the rating
    const rating = await getQuoteRating(quoteId, 'user456');
    if (rating === 4) {
      console.log('✅ Test 9 Passed: Quote rating retrieved');
      passed++;
    } else {
      console.error('❌ Test 9 Failed: Rating not found or incorrect');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 9 Failed:', err.message);
    failed++;
  }
})();

// Test 10: Invalid rating (out of range)
console.log('\n=== Test 10: Invalid Rating Range ===');
(async () => {
  try {
    const quoteId = await addQuote('Test rating', 'Author');
    // Try to rate with invalid value
    const result = await rateQuote(quoteId, 'user789', 10);
    if (result.success === false) {
      console.log('✅ Test 10 Passed: Invalid rating rejected');
      passed++;
    } else {
      console.error('❌ Test 10 Failed: Invalid rating should be rejected');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 10 Failed:', err.message);
    failed++;
  }
})();

// Test 11: Add tag
console.log('\n=== Test 11: Add Tag ===');
(async () => {
  try {
    const result = await addTag('inspirational', 'Inspiring quotes');
    if (result.success === true) {
      console.log('✅ Test 11 Passed: Tag added successfully');
      passed++;
    } else {
      console.error('❌ Test 11 Failed: Tag addition failed');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 11 Failed:', err.message);
    failed++;
  }
})();

// Test 12: Get tag by name
console.log('\n=== Test 12: Get Tag by Name ===');
(async () => {
  try {
    // Add a tag
    await addTag('motivational', 'Motivational quotes');
    // Retrieve it
    const tag = await getTagByName('motivational');
    if (tag && tag.name === 'motivational') {
      console.log('✅ Test 12 Passed: Tag retrieved by name');
      passed++;
    } else {
      console.error('❌ Test 12 Failed: Tag not found');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 12 Failed:', err.message);
    failed++;
  }
})();

// Test 13: Add tag to quote
console.log('\n=== Test 13: Add Tag to Quote ===');
(async () => {
  try {
    // Add a quote and tag
    const quoteId = await addQuote('Tagged quote', 'Author');
    await addTag('wisdom', 'Wisdom quotes');
    const tag = await getTagByName('wisdom');
    // Add tag to quote
    const success = await addTagToQuote(quoteId, tag.id);
    if (success === true) {
      console.log('✅ Test 13 Passed: Tag added to quote');
      passed++;
    } else {
      console.error('❌ Test 13 Failed: Failed to add tag to quote');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 13 Failed:', err.message);
    failed++;
  }
})();

// Test 14: Get all tags
console.log('\n=== Test 14: Get All Tags ===');
(async () => {
  try {
    const tags = await getAllTags();
    if (Array.isArray(tags)) {
      console.log('✅ Test 14 Passed: Retrieved all tags');
      passed++;
    } else {
      console.error('❌ Test 14 Failed: Tags is not an array');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 14 Failed:', err.message);
    failed++;
  }
})();

// Test 15: Get quotes by category
console.log('\n=== Test 15: Get Quotes by Category ===');
(async () => {
  try {
    const quotes = await getQuotesByCategory('General');
    if (Array.isArray(quotes)) {
      console.log('✅ Test 15 Passed: Retrieved quotes by category');
      passed++;
    } else {
      console.error('❌ Test 15 Failed: Result is not an array');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 15 Failed:', err.message);
    failed++;
  }
})();

// Test 16: Export quotes as JSON
console.log('\n=== Test 16: Export Quotes as JSON ===');
(async () => {
  try {
    const json = await exportQuotesAsJson();
    if (typeof json === 'string' && json.startsWith('[')) {
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed)) {
        console.log('✅ Test 16 Passed: Quotes exported as JSON');
        passed++;
      } else {
        console.error('❌ Test 16 Failed: JSON format invalid');
        failed++;
      }
    } else {
      console.error('❌ Test 16 Failed: Export did not return JSON string');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 16 Failed:', err.message);
    failed++;
  }
})();

// Test 17: Export quotes as CSV
console.log('\n=== Test 17: Export Quotes as CSV ===');
(async () => {
  try {
    const csv = await exportQuotesAsCsv();
    if (typeof csv === 'string' && csv.includes('id,text,author')) {
      console.log('✅ Test 17 Passed: Quotes exported as CSV');
      passed++;
    } else {
      console.error('❌ Test 17 Failed: CSV format invalid');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 17 Failed:', err.message);
    failed++;
  }
})();

// Test 18: Export with specific quotes
console.log('\n=== Test 18: Export Specific Quotes ===');
(async () => {
  try {
    const quoteId = await addQuote('Export me', 'Export Author');
    const quote = await getQuoteById(quoteId);
    const json = await exportQuotesAsJson([quote]);
    if (typeof json === 'string' && json.includes('Export me')) {
      console.log('✅ Test 18 Passed: Specific quotes exported');
      passed++;
    } else {
      console.error('❌ Test 18 Failed: Export missing quote');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 18 Failed:', err.message);
    failed++;
  }
})();

// Wait for all async tests to complete
setTimeout(() => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed === 0) {
    console.log('✅ All database service tests passed!');
  }
}, 500);
