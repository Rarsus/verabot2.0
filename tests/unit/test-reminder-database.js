/**
 * Test Suite: Reminder Database Schema and Operations
 * Tests database schema initialization and basic CRUD operations
 */

const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Setup test database
const testDbPath = path.join(__dirname, '..', '..', 'data', 'test_reminders.db');

let passed = 0;
let failed = 0;

function setupTestDb() {
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(testDbPath, (err) => {
      if (err) reject(err);

      db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) reject(err);
        resolve(db);
      });
    });
  });
}

async function createSchema(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create reminders table
      db.run(
        `
        CREATE TABLE IF NOT EXISTS reminders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          subject TEXT NOT NULL,
          category TEXT NOT NULL,
          when_datetime TEXT NOT NULL,
          content TEXT,
          link TEXT,
          image TEXT,
          notificationTime TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'active',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `,
        (err) => {
          if (err) reject(err);
        }
      );

      // Create reminder_assignments table
      db.run(
        `
        CREATE TABLE IF NOT EXISTS reminder_assignments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reminderId INTEGER NOT NULL,
          assigneeType TEXT NOT NULL CHECK(assigneeType IN ('user', 'role')),
          assigneeId TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (reminderId) REFERENCES reminders(id) ON DELETE CASCADE
        )
      `,
        (err) => {
          if (err) reject(err);
        }
      );

      // Create reminder_notifications table
      db.run(
        `
        CREATE TABLE IF NOT EXISTS reminder_notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reminderId INTEGER NOT NULL,
          sentAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          success INTEGER DEFAULT 1,
          errorMessage TEXT,
          FOREIGN KEY (reminderId) REFERENCES reminders(id) ON DELETE CASCADE
        )
      `,
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  });
}

async function runTests() {
  console.log('\n=== Reminder Database Tests ===\n');

  let db;
  try {
    db = await setupTestDb();
    await createSchema(db);

    // Test 1: Schema created successfully
    console.log('=== Test 1: Schema Creation ===');
    await new Promise((resolve) => {
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='reminders'", (err, row) => {
        if (!err && row) {
          console.log('✅ Test 1 Passed: Reminders table created');
          passed++;
        } else {
          console.error('❌ Test 1 Failed: Reminders table not created');
          failed++;
        }
        resolve();
      });
    });

    // Test 2: Insert reminder
    console.log('\n=== Test 2: Insert Reminder ===');
    await new Promise((resolve) => {
      db.run(
        `INSERT INTO reminders (subject, category, when_datetime, notificationTime, status) 
         VALUES (?, ?, ?, ?, ?)`,
        ['Test Meeting', 'Meeting', '2024-12-31T10:00:00.000Z', '2024-12-31T10:00:00.000Z', 'active'],
        function (err) {
          if (!err && this.lastID > 0) {
            console.log(`✅ Test 2 Passed: Reminder inserted with ID ${this.lastID}`);
            passed++;
          } else {
            console.error('❌ Test 2 Failed:', err?.message || 'No ID returned');
            failed++;
          }
          resolve();
        }
      );
    });

    // Test 3: Query reminder
    console.log('\n=== Test 3: Query Reminder ===');
    await new Promise((resolve) => {
      db.get('SELECT * FROM reminders WHERE id = 1', (err, row) => {
        if (!err && row && row.subject === 'Test Meeting') {
          console.log('✅ Test 3 Passed: Reminder retrieved correctly');
          passed++;
        } else {
          console.error('❌ Test 3 Failed:', err?.message || 'Reminder not found');
          failed++;
        }
        resolve();
      });
    });

    // Test 4: Insert assignment
    console.log('\n=== Test 4: Insert Assignment ===');
    await new Promise((resolve) => {
      db.run(
        'INSERT INTO reminder_assignments (reminderId, assigneeType, assigneeId) VALUES (?, ?, ?)',
        [1, 'user', '123456789'],
        function (err) {
          if (!err && this.lastID > 0) {
            console.log('✅ Test 4 Passed: Assignment inserted');
            passed++;
          } else {
            console.error('❌ Test 4 Failed:', err?.message);
            failed++;
          }
          resolve();
        }
      );
    });

    // Test 5: Foreign key constraint
    console.log('\n=== Test 5: Foreign Key Constraint ===');
    await new Promise((resolve) => {
      db.run(
        'INSERT INTO reminder_assignments (reminderId, assigneeType, assigneeId) VALUES (?, ?, ?)',
        [999, 'user', '987654321'],
        (err) => {
          if (err && err.message.includes('FOREIGN KEY')) {
            console.log('✅ Test 5 Passed: Foreign key constraint works');
            passed++;
          } else {
            console.error('❌ Test 5 Failed: Foreign key constraint not enforced');
            failed++;
          }
          resolve();
        }
      );
    });

    // Test 6: Update reminder
    console.log('\n=== Test 6: Update Reminder ===');
    await new Promise((resolve) => {
      db.run(
        'UPDATE reminders SET subject = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        ['Updated Meeting', 1],
        function (err) {
          if (!err && this.changes > 0) {
            console.log('✅ Test 6 Passed: Reminder updated');
            passed++;
          } else {
            console.error('❌ Test 6 Failed:', err?.message || 'No changes');
            failed++;
          }
          resolve();
        }
      );
    });

    // Test 7: Soft delete (status change)
    console.log('\n=== Test 7: Soft Delete ===');
    await new Promise((resolve) => {
      db.run('UPDATE reminders SET status = ? WHERE id = ?', ['cancelled', 1], function (err) {
        if (!err && this.changes > 0) {
          console.log('✅ Test 7 Passed: Reminder soft deleted');
          passed++;
        } else {
          console.error('❌ Test 7 Failed:', err?.message);
          failed++;
        }
        resolve();
      });
    });

    // Test 8: Cascade delete
    console.log('\n=== Test 8: Cascade Delete ===');
    await new Promise((resolve) => {
      db.run('DELETE FROM reminders WHERE id = ?', [1], (err) => {
        if (err) {
          console.error('❌ Test 8 Failed:', err.message);
          failed++;
          resolve();
        } else {
          // Check if assignments were also deleted
          db.get('SELECT * FROM reminder_assignments WHERE reminderId = 1', (err, row) => {
            if (!err && !row) {
              console.log('✅ Test 8 Passed: Cascade delete works');
              passed++;
            } else {
              console.error('❌ Test 8 Failed: Assignments not deleted');
              failed++;
            }
            resolve();
          });
        }
      });
    });

    // Test 9: Check constraint on assigneeType
    console.log('\n=== Test 9: Check Constraint ===');
    await new Promise((resolve) => {
      db.run(
        'INSERT INTO reminders (subject, category, when_datetime, notificationTime, status) VALUES (?, ?, ?, ?, ?)',
        ['Test 2', 'Task', '2024-12-31T10:00:00.000Z', '2024-12-31T10:00:00.000Z', 'active'],
        function (err) {
          if (!err) {
            const newId = this.lastID;
            db.run(
              'INSERT INTO reminder_assignments (reminderId, assigneeType, assigneeId) VALUES (?, ?, ?)',
              [newId, 'invalid', '123'],
              (err) => {
                if (err && err.message.includes('CHECK')) {
                  console.log('✅ Test 9 Passed: Check constraint works');
                  passed++;
                } else {
                  console.error('❌ Test 9 Failed: Check constraint not enforced');
                  failed++;
                }
                resolve();
              }
            );
          } else {
            console.error('❌ Test 9 Failed: Could not insert test reminder');
            failed++;
            resolve();
          }
        }
      );
    });

    // Test 10: Notification tracking
    console.log('\n=== Test 10: Notification Tracking ===');
    await new Promise((resolve) => {
      db.get('SELECT id FROM reminders LIMIT 1', (err, reminder) => {
        if (!err && reminder) {
          db.run(
            'INSERT INTO reminder_notifications (reminderId, success, errorMessage) VALUES (?, ?, ?)',
            [reminder.id, 1, null],
            function (err) {
              if (!err && this.lastID > 0) {
                console.log('✅ Test 10 Passed: Notification tracked');
                passed++;
              } else {
                console.error('❌ Test 10 Failed:', err?.message);
                failed++;
              }
              resolve();
            }
          );
        } else {
          console.error('❌ Test 10 Failed: No reminder found');
          failed++;
          resolve();
        }
      });
    });
  } catch (err) {
    console.error('❌ Database setup failed:', err.message);
    failed++;
  } finally {
    if (db) {
      await new Promise((resolve) => {
        db.close(() => {
          if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
          }
          resolve();
        });
      });
    }
  }

  // Print summary
  console.log('\n=== Test Summary ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);

  if (failed > 0) {
  }
}

// Run tests
runTests().catch((err) => {
  console.error('Test runner error:', err);
});
