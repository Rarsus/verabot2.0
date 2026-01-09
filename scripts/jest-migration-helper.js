/**
 * Jest Migration Helper Script
 * Converts custom test runner to Jest format
 */

const fs = require('fs');
const path = require('path');

// Helper function to convert test function to Jest format
function convertCustomTestToJest(customTestCode) {
  let jestCode = customTestCode;

  // Convert assert calls to expect calls
  jestCode = jestCode.replace(/assert\((.*?),\s*['"`](.*?)['"`]\)/g, 'expect($1).toBe(true); // $2');

  jestCode = jestCode.replace(
    /assert\.strictEqual\((.*?),\s*(.*?),\s*['"`](.*?)['"`]\)/g,
    'expect($1).toBe($2); // $3'
  );

  jestCode = jestCode.replace(/assert\.throws\((.*?),\s*\/(.*?)\//g, 'expect(() => { $1 }).toThrow(/$2/)');

  // Convert console.log test headers to Jest describe/test blocks
  jestCode = jestCode.replace(/console\.log\(['"`]=== (.*?) ===['"`]\)/g, "describe('$1', () => {");

  jestCode = jestCode.replace(/\/\/ Test (\d+):/g, "test('$1'");

  // Add closing brackets for describe blocks
  const describeCount = (jestCode.match(/describe\(/g) || []).length;

  if (describeCount > 0) {
    jestCode += '\n' + '});'.repeat(describeCount);
  }

  return jestCode;
}

// List all test files
const testDir = path.join(__dirname, '..', 'tests', 'unit');
const testFiles = fs.readdirSync(testDir).filter((f) => f.startsWith('test-') && f.endsWith('.js'));

console.log('Found', testFiles.length, 'test files');
console.log('Files to migrate:');
testFiles.forEach((file, idx) => {
  console.log(`  ${idx + 1}. ${file}`);
});

module.exports = {
  convertCustomTestToJest,
  testFiles,
};
