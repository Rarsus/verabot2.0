/**
 * Jest Test Runner - Wrapper for Custom Tests
 *
 * This file bridges custom tests with Jest's test infrastructure,
 * allowing existing tests to run with Jest while maintaining compatibility.
 */

const fs = require('fs');
const path = require('path');

// Custom test runner that Jest can execute
async function runCustomTests() {
  const testDir = path.join(__dirname, 'unit');
  const testFiles = fs.readdirSync(testDir)
    .filter(f => f.startsWith('test-') && f.endsWith('.js') && f !== 'test-all.js')
    .sort();

  const results = {
    passed: 0,
    failed: 0,
    tests: [],
    errors: []
  };

  for (const file of testFiles) {
    const testPath = path.join(testDir, file);
    const testName = file.replace('test-', '').replace('.js', '');

    try {
      // Require and run the test
      delete require.cache[testPath];
      const testModule = require(testPath);

      // If it's an async function, await it
      if (testModule && typeof testModule === 'function') {
        await testModule();
      } else if (testModule && typeof testModule === 'object') {
        // Handle exports
        for (const [key, fn] of Object.entries(testModule)) {
          if (typeof fn === 'function') {
            await fn();
          }
        }
      }

      results.passed++;
      results.tests.push({ name: testName, status: 'PASSED' });
    } catch (error) {
      results.failed++;
      results.tests.push({ name: testName, status: 'FAILED' });
      results.errors.push({
        file,
        error: error.message,
        stack: error.stack
      });
    }
  }

  return results;
}

// Jest test wrapper
describe('VeraBot Test Suite (Jest-Compatible)', () => {
  test('All custom tests should pass', async () => {
    const results = await runCustomTests();

    if (results.failed > 0) {
      console.error('\nTest Failures:');
      results.errors.forEach(err => {
        console.error(`\n${err.file}:`);
        console.error(err.error);
      });
    }

    expect(results.failed).toBe(0);
  }, 60000); // 60 second timeout
});

module.exports = { runCustomTests };
