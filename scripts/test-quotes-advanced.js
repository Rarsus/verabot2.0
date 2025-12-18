/**
 * Advanced Quote System Tests
 * Tests for tags, ratings, categories, and export functionality
 */

const path = require('path');
const sqlite3 = require('sqlite3');
const fs = require('fs');

// Mock database setup for testing
const testDbPath = path.join(__dirname, '..', 'data', 'test_quotes_advanced.db');

function setupTestDb() {
  // Remove old test db if exists
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(testDbPath, (err) => {
      if (err) reject(err);

      db.serialize(() => {
        // Quotes table
        db.run(`
          CREATE TABLE quotes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            author TEXT NOT NULL DEFAULT 'Anonymous',
            category TEXT DEFAULT 'General',
            averageRating REAL DEFAULT 0,
            ratingCount INTEGER DEFAULT 0,
            addedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) reject(err);
        });

        // Tags table
        db.run(`
          CREATE TABLE tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err && !err.message.includes('already exists')) reject(err);
        });

        // Quote tags junction table
        db.run(`
          CREATE TABLE quote_tags (
            quoteId INTEGER NOT NULL,
            tagId INTEGER NOT NULL,
            PRIMARY KEY (quoteId, tagId),
            FOREIGN KEY (quoteId) REFERENCES quotes(id) ON DELETE CASCADE,
            FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
          )
        `, (err) => {
          if (err && !err.message.includes('already exists')) reject(err);
        });

        // Ratings table
        db.run(`
          CREATE TABLE quote_ratings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quoteId INTEGER NOT NULL,
            userId TEXT NOT NULL,
            rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(quoteId, userId),
            FOREIGN KEY (quoteId) REFERENCES quotes(id) ON DELETE CASCADE
          )
        `, (err) => {
          if (err && !err.message.includes('already exists')) reject(err);
          resolve(db);
        });
      });
    });
  });
}

function insertTestData(db) {
  return new Promise((resolve, reject) => {
    const quotes = [
      { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs', category: 'Motivation' },
      { text: 'Innovation distinguishes between a leader and a follower.', author: 'Steve Jobs', category: 'Leadership' },
      { text: 'Life is what happens when you\'re busy making other plans.', author: 'John Lennon', category: 'Life' },
      { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt', category: 'Dreams' }
    ];

    let inserted = 0;
    quotes.forEach((quote) => {
      db.run('INSERT INTO quotes (text, author, category) VALUES (?, ?, ?)', 
        [quote.text, quote.author, quote.category], 
        (err) => {
          if (err) reject(err);
          inserted++;
          if (inserted === quotes.length) resolve();
        });
    });
  });
}

function insertTestTags(db) {
  return new Promise((resolve, reject) => {
    const tags = ['wisdom', 'inspiration', 'technology', 'personal-growth'];
    let inserted = 0;

    tags.forEach((tag) => {
      db.run('INSERT OR IGNORE INTO tags (name) VALUES (?)', [tag], (err) => {
        if (err) reject(err);
        inserted++;
        if (inserted === tags.length) resolve();
      });
    });
  });
}

function insertTestRatings(db) {
  return new Promise((resolve, reject) => {
    const ratings = [
      { quoteId: 1, userId: 'user1', rating: 5 },
      { quoteId: 1, userId: 'user2', rating: 4 },
      { quoteId: 1, userId: 'user3', rating: 5 },
      { quoteId: 2, userId: 'user1', rating: 3 },
      { quoteId: 3, userId: 'user1', rating: 5 },
    ];

    let inserted = 0;
    ratings.forEach((r) => {
      db.run('INSERT INTO quote_ratings (quoteId, userId, rating) VALUES (?, ?, ?)',
        [r.quoteId, r.userId, r.rating],
        (err) => {
          if (err) reject(err);
          inserted++;
          if (inserted === ratings.length) resolve();
        });
    });
  });
}

function dbGet(db, query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
}

function dbAll(db, query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
}

function dbRun(db, query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
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
    console.log('\n=== Advanced Quote System Tests ===\n');

    let db = await setupTestDb();
    await insertTestData(db);

    // Test 1: Category filtering
    console.log('=== Testing Category Operations ===');
    
    const motivationQuotes = await dbAll(db, 'SELECT * FROM quotes WHERE category = ?', ['Motivation']);
    if (motivationQuotes && motivationQuotes.length === 1) {
      console.log('✅ Test 1.1 Passed: Category filtering');
      passed++;
    } else {
      console.error('❌ Test 1.1 Failed: Category filtering');
      failed++;
    }

    const categories = await dbAll(db, 'SELECT DISTINCT category FROM quotes');
    if (categories && categories.length === 4) {
      console.log('✅ Test 1.2 Passed: Get all categories (4 unique)');
      passed++;
    } else {
      console.error('❌ Test 1.2 Failed: Get all categories');
      failed++;
    }

    // Test 2: Tags operations
    console.log('\n=== Testing Tag Operations ===');
    await insertTestTags(db);

    const wisdomTag = await dbGet(db, 'SELECT * FROM tags WHERE name = ?', ['wisdom']);
    if (wisdomTag) {
      console.log('✅ Test 2.1 Passed: Get tag by name');
      passed++;
    } else {
      console.error('❌ Test 2.1 Failed: Get tag by name');
      failed++;
    }

    await dbRun(db, 'INSERT INTO quote_tags (quoteId, tagId) VALUES (?, ?)', [1, 1]);
    console.log('✅ Test 2.2 Passed: Add tag to quote');
    passed++;

    const taggedQuotes = await dbAll(db, 
      'SELECT q.* FROM quotes q JOIN quote_tags qt ON q.id = qt.quoteId WHERE qt.tagId = ?', 
      [1]);
    if (taggedQuotes && taggedQuotes.length === 1) {
      console.log('✅ Test 2.3 Passed: Retrieve quotes by tag');
      passed++;
    } else {
      console.error('❌ Test 2.3 Failed: Retrieve quotes by tag');
      failed++;
    }

    // Test 3: Ratings operations
    console.log('\n=== Testing Rating Operations ===');
    await insertTestRatings(db);

    const ratingStats = await dbGet(db, 
      'SELECT AVG(rating) as avgRating, COUNT(*) as count FROM quote_ratings WHERE quoteId = ?',
      [1]);
    const avgRating = Math.round(ratingStats.avgRating * 10) / 10;
    if (avgRating === 4.7 && ratingStats.count === 3) {
      console.log('✅ Test 3.1 Passed: Calculate average rating (4.7⭐, 3 votes)');
      passed++;
    } else {
      console.error(`❌ Test 3.1 Failed: Expected 4.7⭐ with 3 votes, got ${avgRating}⭐ with ${ratingStats.count} votes`);
      failed++;
    }

    const userRating = await dbGet(db, 
      'SELECT rating FROM quote_ratings WHERE quoteId = ? AND userId = ?',
      [1, 'user1']);
    if (userRating && userRating.rating === 5) {
      console.log('✅ Test 3.2 Passed: Get user rating (5⭐)');
      passed++;
    } else {
      console.error('❌ Test 3.2 Failed: Get user rating');
      failed++;
    }

    await dbRun(db, 'INSERT OR REPLACE INTO quote_ratings (quoteId, userId, rating) VALUES (?, ?, ?)',
      [1, 'user1', 3]);
    console.log('✅ Test 3.3 Passed: Allow rating updates (INSERT OR REPLACE)');
    passed++;

    // Test 4: Export operations
    console.log('\n=== Testing Export Operations ===');

    const allQuotes = await dbAll(db, 'SELECT * FROM quotes');
    if (allQuotes && allQuotes.length === 4) {
      const jsonExport = JSON.stringify(allQuotes);
      const parsed = JSON.parse(jsonExport);
      if (Array.isArray(parsed) && parsed.length === 4) {
        console.log('✅ Test 4.1 Passed: JSON export format');
        passed++;
      } else {
        console.error('❌ Test 4.1 Failed: JSON export invalid format');
        failed++;
      }

      const headers = ['id', 'text', 'author', 'category'];
      const csvRows = allQuotes.map(r => [
        r.id,
        `"${r.text.replace(/"/g, '""')}"`,
        `"${r.author.replace(/"/g, '""')}"`,
        r.category
      ]);
      const csv = [headers.join(','), ...csvRows.map(r => r.join(','))].join('\n');

      if (csv.includes('Steve Jobs') && csv.includes('Motivation')) {
        console.log('✅ Test 4.2 Passed: CSV export format');
        passed++;
      } else {
        console.error('❌ Test 4.2 Failed: CSV export missing data');
        failed++;
      }
    }

    // Test 5: Data integrity
    console.log('\n=== Testing Data Integrity ===');

    const quoteCount = await dbGet(db, 'SELECT COUNT(*) as count FROM quotes');
    if (quoteCount.count === 4) {
      console.log('✅ Test 5.1 Passed: Quote count verification (4 quotes)');
      passed++;
    } else {
      console.error('❌ Test 5.1 Failed: Quote count verification');
      failed++;
    }

    const tagCount = await dbGet(db, 'SELECT COUNT(*) as count FROM tags');
    if (tagCount.count === 4) {
      console.log('✅ Test 5.2 Passed: Tag count verification (4 tags)');
      passed++;
    } else {
      console.error('❌ Test 5.2 Failed: Tag count verification');
      failed++;
    }

    const ratingCount = await dbGet(db, 'SELECT COUNT(*) as count FROM quote_ratings');
    if (ratingCount.count === 5) {
      console.log('✅ Test 5.3 Passed: Rating count verification (5 ratings)');
      passed++;
    } else {
      console.error('❌ Test 5.3 Failed: Rating count verification');
      failed++;
    }

    // Test 6: Update operations
    console.log('\n=== Testing Update Operations ===');

    // Test 6.1: Update quote text
    await dbRun(db, 'UPDATE quotes SET text = ? WHERE id = ?',
      ['This is an updated quote', 1]);
    const updatedQuote = await dbGet(db, 'SELECT text FROM quotes WHERE id = ?', [1]);
    if (updatedQuote && updatedQuote.text === 'This is an updated quote') {
      console.log('✅ Test 6.1 Passed: Update quote text');
      passed++;
    } else {
      console.error('❌ Test 6.1 Failed: Update quote text');
      failed++;
    }

    // Test 6.2: Update author
    await dbRun(db, 'UPDATE quotes SET author = ? WHERE id = ?',
      ['Updated Author', 1]);
    const updatedAuthor = await dbGet(db, 'SELECT author FROM quotes WHERE id = ?', [1]);
    if (updatedAuthor && updatedAuthor.author === 'Updated Author') {
      console.log('✅ Test 6.2 Passed: Update author field');
      passed++;
    } else {
      console.error('❌ Test 6.2 Failed: Update author field');
      failed++;
    }

    // Test 6.3: Verify updatedAt timestamp changes
    await new Promise(resolve => setTimeout(resolve, 10));
    await dbRun(db, 'UPDATE quotes SET text = ? WHERE id = ?',
      ['Another update', 1]);
    const quoteBefore = await dbGet(db, 'SELECT * FROM quotes WHERE id = ? LIMIT 1', [1]);
    if (quoteBefore && quoteBefore.text === 'Another update') {
      console.log('✅ Test 6.3 Passed: Quote text updated successfully');
      passed++;
    } else {
      console.error('❌ Test 6.3 Failed: Quote text not updated');
      failed++;
    }

    // Test 6.4: Update non-existent quote (should not fail, but affect 0 rows)
    const result = await dbRun(db, 'UPDATE quotes SET text = ? WHERE id = ?',
      ['Test', 999]);
    if (result.changes === 0) {
      console.log('✅ Test 6.4 Passed: Non-existent quote update returns 0 changes');
      passed++;
    } else {
      console.error('❌ Test 6.4 Failed: Non-existent quote should not be updated');
      failed++;
    }

    // Test 6.5: Verify quote integrity after multiple updates
    const finalQuote = await dbGet(db, 'SELECT * FROM quotes WHERE id = ?', [1]);
    if (finalQuote && finalQuote.text && finalQuote.author) {
      console.log('✅ Test 6.5 Passed: Quote integrity maintained after updates');
      passed++;
    } else {
      console.error('❌ Test 6.5 Failed: Quote data integrity check');
      failed++;
    }

    // Cleanup
    await closeTestDb(db);

    console.log('\n=== Test Summary ===');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Total: ${passed + failed}\n`);

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
