/**
 * Jest Test Bridge - DEPRECATED
 *
 * Legacy bridge for executing custom tests with Jest coverage.
 * These standalone test files are now skipped in Jest context.
 *
 * To run standalone tests:
 * - npm run test:cache (runs test-cache-manager.js)
 * - npm run test:pool (runs test-database-pool.js)
 * - npm run test:query-builder (runs test-query-builder.js)
 * - node tests/unit/test-filename.js (run any standalone test)
 */

const testFiles = [
  'test-command-base',
  'test-command-options',
  'test-error-handler',
  'test-phase1-guild-database',
  'test-guild-aware-database-phase2',
  'test-phase3-coverage-gaps',
  'test-integration-multi-guild-phase2',
  'test-response-helpers',
  'test-services-quote',
  'test-services-validation',
  'test-webhook-proxy',
];

describe('VeraBot Custom Tests Bridge - DEPRECATED', () => {
  // These legacy tests are skipped in Jest - migrate to Jest format instead
  testFiles.forEach((testName) => {
    test.skip(`${testName} - SKIPPED (legacy standalone test)`, () => {
      // Run standalone tests separately using:
      // node tests/unit/test-filename.js
    });
  });
});
