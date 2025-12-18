/**
 * Quote System Unit Tests
 * Tests for quote commands and database operations
 */

const path = require('path');
const sqlite3 = require('sqlite3');
const fs = require('fs');

// Recursively find a file by name in a directory
function findCommandFile(dir, filename) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = findCommandFile(fullPath, filename);
      if (found) return found;
    } else if (entry.name === filename) {
      return fullPath;
    }
  }
  return null;
}

// Mock database setup for testing
const testDbPath = path.join(__dirname, '..', '..', 'data', 'db', 'test_quotes.db');

function setupTestDb() {
  // Remove old test db if exists
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(testDbPath, (err) => {
      if (err) reject(err);

      // Create table
      db.run(`
        CREATE TABLE quotes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          text TEXT NOT NULL,
          author TEXT NOT NULL DEFAULT 'Anonymous',
          addedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
        resolve(db);
      });
    });
  });
}

function insertTestData(db) {
  return new Promise((resolve, reject) => {
    const quotes = [
      { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
      { text: 'Innovation distinguishes between a leader and a follower.', author: 'Steve Jobs' },
      { text: 'Life is what happens when you\'re busy making other plans.', author: 'John Lennon' },
      { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' }
    ];

    let inserted = 0;
    quotes.forEach((quote) => {
      db.run('INSERT INTO quotes (text, author) VALUES (?, ?)', [quote.text, quote.author], (err) => {
        if (err) reject(err);
        inserted++;
        if (inserted === quotes.length) resolve();
      });
    });
  });
}

function closeTestDb(db) {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) reject(err);
      if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
      }
      resolve();
    });
  });
}

// Test Suites
async function runTests() {
  let passed = 0;
  let failed = 0;

  try {
    // Test 1: Database query operations
    console.log('\n=== Testing Database Query Operations ===');
    const db = await setupTestDb();
    await insertTestData(db);

    // Test: Count quotes
    db.get('SELECT COUNT(*) as count FROM quotes', (err, row) => {
      if (err || row.count !== 4) {
        console.error('❌ Test 1.1 Failed: Count queries');
        failed++;
      } else {
        console.log('✅ Test 1.1 Passed: Count queries (4 quotes)');
        passed++;
      }
    });

    // Test: Search by author
    db.all('SELECT * FROM quotes WHERE author = ?', ['Steve Jobs'], (err, rows) => {
      if (err || !rows || rows.length !== 2) {
        console.error('❌ Test 1.2 Failed: Search by author');
        failed++;
      } else {
        console.log('✅ Test 1.2 Passed: Search by author (2 results)');
        passed++;
      }
    });

    // Test: Search by text
    db.all('SELECT * FROM quotes WHERE text LIKE ?', ['%innovation%'], (err, rows) => {
      if (err || !rows || rows.length !== 1) {
        console.error('❌ Test 1.3 Failed: Search by text');
        failed++;
      } else {
        console.log('✅ Test 1.3 Passed: Search by text (1 result)');
        passed++;
      }
    });

    // Test: Get random quote
    db.get('SELECT * FROM quotes ORDER BY RANDOM() LIMIT 1', (err, row) => {
      if (err || !row || !row.text || !row.author) {
        console.error('❌ Test 1.4 Failed: Random quote selection');
        failed++;
      } else {
        console.log('✅ Test 1.4 Passed: Random quote selection');
        passed++;
      }
    });

    // Test: Get quote by ID
    db.get('SELECT * FROM quotes WHERE id = ?', [1], (err, row) => {
      if (err || !row || !row.id) {
        console.error('❌ Test 1.5 Failed: Get quote by ID');
        failed++;
      } else {
        console.log('✅ Test 1.5 Passed: Get quote by ID');
        passed++;
      }
    });

    // Test 2: Validation logic
    console.log('\n=== Testing Validation Logic ===');
    
    const { validateQuoteText, validateAuthor } = require('../../src/services/ValidationService');

    // Valid quote
    const validQuote = validateQuoteText('This is a great quote');
    if (validQuote.valid) {
      console.log('✅ Test 2.1 Passed: Valid quote acceptance');
      passed++;
    } else {
      console.error('❌ Test 2.1 Failed: Valid quote rejection');
      failed++;
    }

    // Too short quote
    const shortQuote = validateQuoteText('Hi');
    if (!shortQuote.valid) {
      console.log('✅ Test 2.2 Passed: Short quote rejection');
      passed++;
    } else {
      console.error('❌ Test 2.2 Failed: Short quote acceptance');
      failed++;
    }

    // Too long quote
    const longQuote = validateQuoteText('a'.repeat(501));
    if (!longQuote.valid) {
      console.log('✅ Test 2.3 Passed: Long quote rejection');
      passed++;
    } else {
      console.error('❌ Test 2.3 Failed: Long quote acceptance');
      failed++;
    }

    // Valid author
    const validAuthor = validateAuthor('John Lennon');
    if (validAuthor.valid) {
      console.log('✅ Test 2.4 Passed: Valid author acceptance');
      passed++;
    } else {
      console.error('❌ Test 2.4 Failed: Valid author rejection');
      failed++;
    }

    // Too long author
    const longAuthor = validateAuthor('a'.repeat(101));
    if (!longAuthor.valid) {
      console.log('✅ Test 2.5 Passed: Long author rejection');
      passed++;
    } else {
      console.error('❌ Test 2.5 Failed: Long author acceptance');
      failed++;
    }

    // Test 3: Command structure verification
    console.log('\n=== Testing Command Structure ===');

    const commandsPath = path.join(__dirname, '..', '..', 'src', 'commands');
    const quoteCommands = [
      'add-quote.js',
      'quote.js',
      'list-quotes.js',
      'random-quote.js',
      'search-quotes.js',
      'quote-stats.js',
      'delete-quote.js'
    ];

    for (const cmdFile of quoteCommands) {
      const cmdPath = findCommandFile(commandsPath, cmdFile);
      if (!cmdPath) {
        console.error(`❌ Test 3.${quoteCommands.indexOf(cmdFile) + 1} Failed: ${cmdFile} not found`);
        failed++;
        continue;
      }

      const cmd = require(cmdPath);
      const hasName = cmd.name && typeof cmd.name === 'string';
      const hasExecute = typeof cmd.execute === 'function';
      const hasExecuteInteraction = typeof cmd.executeInteraction === 'function';

      if (hasName && (hasExecute || hasExecuteInteraction)) {
        console.log(`✅ Test 3.${quoteCommands.indexOf(cmdFile) + 1} Passed: ${cmdFile} structure valid`);
        passed++;
      } else {
        console.error(`❌ Test 3.${quoteCommands.indexOf(cmdFile) + 1} Failed: ${cmdFile} invalid structure`);
        failed++;
      }
    }

    // Cleanup
    await closeTestDb(db);

    // Summary
    console.log('\n=== Test Summary ===');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Total: ${passed + failed}`);

    if (failed > 0) {
      process.exit(1);
    }

  } catch (err) {
    console.error('Test suite error:', err);
    process.exit(1);
  }
}

// Run tests
runTests();
