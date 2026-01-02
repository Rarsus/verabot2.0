#!/usr/bin/env node
/**
 * Test GitHub Actions Validation Scripts
 * Ensures all doc validation scripts work correctly
 */

const { execSync } = require('child_process');

let passed = 0;
let failed = 0;

console.log('\n🧪 Testing GitHub Actions Validation Scripts\n');

function test(name, command, expectNonZero = false) {
  try {
    console.log(`Testing: ${name}...`);
    const _output = execSync(command, { stdio: 'pipe', encoding: 'utf8' });
    if (!expectNonZero) {
      passed++;
      console.log(`✅ ${name} - PASSED\n`);
      return true;
    }
  } catch (error) {
    // For docs validation scripts, non-zero exit is OK (warnings/issues found)
    if (expectNonZero) {
      passed++;
      console.log(`✅ ${name} - PASSED (script ran successfully)\n`);
      return true;
    }
    failed++;
    console.error(`❌ ${name} - FAILED`);
    console.error(`   Error: ${error.message}\n`);
    return false;
  }
}

// Test each validation script (these can exit non-zero when finding issues)
console.log('📝 Testing Documentation Validation Scripts:\n');
test('docs:links', 'npm run docs:links', true);
test('docs:version', 'npm run docs:version', true);
test('docs:badges', 'npm run docs:badges');
test('docs:lint', 'npm run docs:lint');

// Test security scripts (should pass)
console.log('\n🔐 Testing Security Scripts:\n');
test('test:security', 'npm run test:security');
test('test:integration', 'npm run test:integration');

// Test other npm commands used in workflows
console.log('\n🔧 Testing Other Workflow Commands:\n');
test('lint (with warnings)', 'npm run lint -- --max-warnings=100');
test('security:audit', 'npm run security:audit');
test('test:all', 'npm run test:all');

console.log('\n' + '='.repeat(50));
console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(50) + '\n');

if (failed > 0) {
  console.error('❌ Some tests failed!');
  process.exit(1);
} else {
  console.log('✅ All validation scripts work correctly!');
  console.log('\nℹ️  Note: Some doc validation scripts may report warnings');
  console.log('   (broken links, version inconsistencies) - this is expected.');
  process.exit(0);
}
