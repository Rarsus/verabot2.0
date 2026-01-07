/**
 * Jest Master Test Suite - Bridges Custom Tests
 * This file imports and validates all custom tests within Jest infrastructure
 *
 * NOTE: This is a legacy bridge for running standalone test files under Jest.
 * Most tests are now written in Jest format (.test.js). This bridge is deprecated.
 */

const path = require('path');
const fs = require('fs');

// Legacy custom test files - these should be migrated to Jest format (.test.js)
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

describe('VeraBot Legacy Tests - Jest Bridge (Deprecated)', () => {
  customTestFiles.forEach((testFileName) => {
    test.skip(`${testFileName} - SKIPPED (legacy standalone test)`, () => {
      // These legacy tests are skipped in Jest context
      // To run standalone tests, use: node tests/unit/test-filename.js
      // Or: npm run test:cache, npm run test:pool, etc.
    });
  });
});
