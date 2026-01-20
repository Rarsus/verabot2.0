/**
 * Jest Global Teardown Hook
 * 
 * Cleans up test databases and temporary guild directories after all tests complete.
 * This hook runs once after all test suites finish.
 * 
 * Removes:
 * - All test guild directories from data/db/guilds/
 * - Preserves schema directory (data/db/_schema/)
 * - Leaves no artifacts between test runs
 */

const fs = require('fs');
const path = require('path');

module.exports = async () => {
  const guildsDir = path.join(__dirname, '..', 'data', 'db', 'guilds');

  if (fs.existsSync(guildsDir)) {
    try {
      const entries = fs.readdirSync(guildsDir);

      for (const entry of entries) {
        const entryPath = path.join(guildsDir, entry);
        const stat = fs.statSync(entryPath);

        if (stat.isDirectory()) {
          // Recursively remove directory and all contents
          removeDirectoryRecursive(entryPath);
        } else {
          // Remove file
          fs.unlinkSync(entryPath);
        }
      }

      console.log('✓ Test database cleanup completed');
    } catch (err) {
      console.error('⚠ Warning: Failed to clean up test databases:', err.message);
      // Don't throw - allow tests to exit even if cleanup fails
    }
  }
};

/**
 * Recursively remove a directory and all its contents
 * @param {string} dirPath - Directory to remove
 */
function removeDirectoryRecursive(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const filePath = path.join(dirPath, file);
      if (fs.statSync(filePath).isDirectory()) {
        removeDirectoryRecursive(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}
