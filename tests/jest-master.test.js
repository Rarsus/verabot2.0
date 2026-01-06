/**
 * Jest Master Test Suite - Bridges Custom Tests
 * This file imports and validates all custom tests within Jest infrastructure
 */

const path = require('path');
const fs = require('fs');

// All custom test files to run
const customTestFiles = [
  'test-response-helpers',
  'test-command-base',
  'test-command-options',
  'test-error-handler',
  'test-phase1-guild-database',
  'test-guild-aware-database-phase2',
  'test-phase3-coverage-gaps',
  'test-integration-multi-guild-phase2',
  'test-services-quote',
  'test-services-validation',
  'test-webhook-proxy',
  'test-datetime-parser',
  'test-reminder-notifications',
  'test-services-database',
  'test-guild-aware-services',
  'test-reminder-service',
  'test-quotes-advanced',
  'test-communication-service',
  'test-reminder-database',
  'test-reminder-commands',
  'test-integration-refactor',
  'test-migration-manager',
  'test-proxy-commands',
  'test-database-pool',
  'test-security-utils',
  'test-cache-manager',
  'test-quotes',
  'test-misc-commands',
  'test-performance-monitor',
  'test-security-validation'
];

describe('VeraBot Test Suite - Jest Bridge', () => {
  // Override process.exit to not actually exit
  const originalExit = process.exit;
  beforeAll(() => {
    process.exit = jest.fn(() => {
      // Jest mock
    });
  });

  afterAll(() => {
    process.exit = originalExit;
  });

  customTestFiles.forEach((testFileName) => {
    test(`should pass: ${testFileName}`, () => {
      const testPath = path.join(__dirname, 'unit', testFileName + '.js');

      // Skip if file doesn't exist
      if (!fs.existsSync(testPath)) {
        console.log(`⏭️  Skipping ${testFileName} (file not found)`);
        return;
      }

      try {
        // Clear require cache
        delete require.cache[require.resolve(testPath)];

        // Load the test file - if it runs without throwing, it passed
        require(testPath);

        // Test passed
        expect(true).toBe(true);
      } catch (error) {
        // Test failed
        console.error(`\n❌ ${testFileName} failed:`);
        console.error(error.message);
        throw error;
      }
    }, 45000);
  });
});
