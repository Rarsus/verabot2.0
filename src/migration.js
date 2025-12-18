const fs = require('fs');
const path = require('path');
const { logError, ERROR_LEVELS } = require('./utils/error-handler');

const jsonDbPath = path.join(__dirname, '..', 'data', 'quotes.json');

/**
 * Migrate data from JSON file to SQLite database
 * @param {object} database - Database module
 * @returns {Promise<number>} Number of quotes migrated
 */
async function migrateFromJson(database) {
  try {
    // Check if JSON file exists
    if (!fs.existsSync(jsonDbPath)) {
      console.log('✓ No existing JSON database found. Starting fresh with SQLite.');
      return 0;
    }

    // Read and parse JSON file
    let quotes = [];
    try {
      const data = fs.readFileSync(jsonDbPath, 'utf8');
      quotes = JSON.parse(data);
    } catch (err) {
      logError('migration.parseJson', err, ERROR_LEVELS.MEDIUM, { path: jsonDbPath });
      console.warn('⚠ Could not parse JSON database. Skipping migration.');
      return 0;
    }

    if (!Array.isArray(quotes) || quotes.length === 0) {
      console.log('✓ JSON database is empty. Nothing to migrate.');
      return 0;
    }

    // Check if data already migrated
    const existingCount = await database.getQuoteCount();
    if (existingCount > 0) {
      console.log(`ℹ Database already contains ${existingCount} quotes. Skipping migration.`);
      return 0;
    }

    // Migrate quotes
    let migratedCount = 0;
    for (const quote of quotes) {
      try {
        if (quote && quote.text && quote.author) {
          await database.addQuote(quote.text, quote.author);
          migratedCount++;
        }
      } catch (err) {
        logError('migration.insertQuote', err, ERROR_LEVELS.MEDIUM, { quote });
        console.warn(`⚠ Failed to migrate quote: ${quote?.text?.substring(0, 50)}`);
      }
    }

    // Backup JSON file after successful migration
    if (migratedCount > 0) {
      const backupPath = `${jsonDbPath}.backup`;
      try {
        fs.copyFileSync(jsonDbPath, backupPath);
        console.log(`✓ JSON database backed up to: ${backupPath}`);
      } catch (err) {
        console.warn('⚠ Could not backup JSON file:', err.message);
      }
    }

    console.log(`✓ Successfully migrated ${migratedCount} quotes from JSON to SQLite`);
    return migratedCount;
  } catch (err) {
    logError('migration.main', err, ERROR_LEVELS.HIGH);
    throw err;
  }
}

module.exports = {
  migrateFromJson
};
