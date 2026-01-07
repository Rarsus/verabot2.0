#!/usr/bin/env node
/**
 * Dashboard Test Runner
 * Runs all dashboard-related tests
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const testsDir = path.join(__dirname);
const testFiles = fs
  .readdirSync(testsDir)
  .filter((file) => file.startsWith('test-') && file.endsWith('.js'))
  .map((file) => path.join(testsDir, file));

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║   Dashboard Test Suite                         ║');
console.log('╚════════════════════════════════════════════════╝');
console.log(`\n📝 Running ${testFiles.length} test files...\n`);

let totalPassed = 0;
let totalFailed = 0;
const results = [];

async function runTest(testFile) {
  return new Promise((resolve) => {
    const testName = path.basename(testFile);

    const proc = spawn('node', [testFile], {
      cwd: path.join(__dirname, '../..'),
      stdio: 'pipe',
    });

    let output = '';

    proc.stdout.on('data', (data) => {
      output += data.toString();
      process.stdout.write(data);
    });

    proc.stderr.on('data', (data) => {
      output += data.toString();
      process.stderr.write(data);
    });

    proc.on('close', (code) => {
      // Parse test results from output
      const passedMatch = output.match(/✅ Passed: (\d+)/);
      const failedMatch = output.match(/❌ Failed: (\d+)/);

      const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
      const failed = failedMatch ? parseInt(failedMatch[1]) : 0;

      totalPassed += passed;
      totalFailed += failed;

      results.push({
        name: testName,
        passed,
        failed,
        exitCode: code,
      });

      resolve(code);
    });
  });
}

async function runAllTests() {
  for (const testFile of testFiles) {
    await runTest(testFile);
  }

  // Print summary
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║   Dashboard Test Summary                       ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  console.log('Test Results by File:');
  console.log('─'.repeat(60));

  for (const result of results) {
    const status = result.exitCode === 0 ? '✅' : '❌';
    const name = result.name.padEnd(40);
    console.log(`${status} ${name} ${result.passed} passed, ${result.failed} failed`);
  }

  console.log('─'.repeat(60));
  console.log('\n📊 Overall Results:');
  console.log(`   ✅ Total Passed: ${totalPassed}`);
  console.log(`   ❌ Total Failed: ${totalFailed}`);
  console.log(`   📝 Total Tests: ${totalPassed + totalFailed}`);
  console.log(`   📁 Test Files: ${testFiles.length}`);

  const failedFiles = results.filter((r) => r.exitCode !== 0).length;
  if (failedFiles > 0) {
    console.log(`\n   ⚠️  ${failedFiles} test file(s) had failures`);
  } else {
    console.log('\n   🎉 All tests passed!');
  }

  console.log('\n' + '═'.repeat(60) + '\n');

  process.exit(totalFailed > 0 ? 1 : 0);
}

runAllTests().catch((err) => {
  console.error('Error running tests:', err);
  process.exit(1);
});
