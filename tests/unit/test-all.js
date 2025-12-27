#!/usr/bin/env node
/**
 * Comprehensive Test Runner
 * Runs all unit tests in tests/unit/test-*.js files
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const testsDir = path.join(__dirname);
const testFiles = fs.readdirSync(testsDir)
  .filter(file => file.startsWith('test-') && file.endsWith('.js') && file !== 'test-all.js')
  .map(file => path.join(testsDir, file));

console.log(`\n📝 Running ${testFiles.length} test suites...\n`);

let passed = 0;
let failed = 0;

async function runTest(testFile) {
  return new Promise((resolve) => {
    const testName = path.basename(testFile);
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Running: ${testName}`);
    console.log('='.repeat(60));

    const proc = spawn('node', [testFile], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });

    proc.on('close', (code) => {
      if (code === 0) {
        passed++;
        console.log(`✅ ${testName} completed`);
      } else {
        failed++;
        console.error(`❌ ${testName} failed with exit code ${code}`);
      }
      resolve();
    });
  });
}

async function runAllTests() {
  for (const testFile of testFiles) {
    await runTest(testFile);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  console.log(`Total test suites: ${testFiles.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('='.repeat(60));

  if (failed > 0) {
    console.error(`\n❌ ${failed} test suite(s) failed`);
    process.exit(1);
  } else {
    console.log('\n✅ All test suites passed!');
    process.exit(0);
  }
}

runAllTests().catch(err => {
  console.error('Error running tests:', err);
  process.exit(1);
});
