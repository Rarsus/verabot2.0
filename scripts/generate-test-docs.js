/**
 * Test Documentation Generator
 * Automatically extracts test information from test files and generates documentation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SCRIPTS_DIR = __dirname;
const DOCS_DIR = path.join(__dirname, '../docs');
const TEST_FILES = [
  'test-command-base.js',
  'test-command-options.js',
  'test-integration-refactor.js',
  'test-quotes.js',
  'test-quotes-advanced.js',
  'test-response-helpers.js',
];

/**
 * Extract test metadata from a file
 */
function extractTestMetadata(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);

  // Extract file header comment
  const headerMatch = content.match(/^\/\*\*[\s\S]*?\*\//);
  const header = headerMatch ? headerMatch[0] : '';

  // Extract all test comments and assertions
  const testMatches = content.matchAll(/\/\/\s*Test\s+(\d+):\s*(.+?)\n.*?console\.log\(['"`]([^'"`]+)/gs);
  const tests = [];

  for (const match of testMatches) {
    const [, testNum, description, result] = match;
    tests.push({
      number: parseInt(testNum),
      description,
      result,
    });
  }

  return {
    fileName,
    filePath,
    header,
    tests,
    testCount: tests.length,
  };
}

/**
 * Run tests and extract results
 */
function extractTestResults(filePath) {
  try {
    const output = execSync(`node "${filePath}" 2>&1`, { encoding: 'utf8' });

    // Extract test summary
    const summaryMatch = output.match(/=== Test Summary ===\n✅ Passed: (\d+)\n❌ Failed: (\d+)\nTotal: (\d+)/);

    if (summaryMatch) {
      const [, passed, failed, total] = summaryMatch;
      return {
        passed: parseInt(passed),
        failed: parseInt(failed),
        total: parseInt(total),
        success: parseInt(failed) === 0,
      };
    }
  } catch (err) {
    // If test fails, extract what we can
    return {
      passed: 0,
      failed: 0,
      total: 0,
      success: false,
      error: err.message,
    };
  }
}

/**
 * Generate markdown documentation for tests
 */
function generateTestDocumentation() {
  const now = new Date().toISOString();
  let documentation = `# Test Documentation

**Last Updated:** ${now}

This documentation is automatically generated from test files. It updates every time tests are run.

## Test Suite Overview

`;

  const testSuites = [];
  let totalTests = 0;
  let totalPassed = 0;

  for (const testFile of TEST_FILES) {
    const filePath = path.join(SCRIPTS_DIR, testFile);

    if (!fs.existsSync(filePath)) {
      continue;
    }

    const metadata = extractTestMetadata(filePath);
    const results = extractTestResults(filePath);

    totalTests += results.total;
    totalPassed += results.passed;

    testSuites.push({
      ...metadata,
      results,
    });
  }

  // Generate summary table
  documentation += '### Quick Summary\n\n| Test Suite | Total Tests | Passed | Failed | Status |\n';
  documentation += '|---|---|---|---|---|\n';

  for (const suite of testSuites) {
    const status = suite.results.success ? '✅ PASS' : '❌ FAIL';
    documentation += `| ${suite.fileName} | ${suite.results.total} | ${suite.results.passed} | ${suite.results.failed} | ${status} |\n`;
  }

  documentation += `\n**Overall:** ${totalPassed}/${totalTests} tests passing\n\n`;

  // Generate detailed documentation for each suite
  documentation += '## Detailed Test Suites\n\n';

  for (const suite of testSuites) {
    documentation += `### ${suite.fileName}\n\n`;

    if (suite.tests.length > 0) {
      documentation += `**Test Count:** ${suite.testCount}\n\n`;
      documentation += '| Test # | Description | Status |\n';
      documentation += '|---|---|---|\n';

      for (const test of suite.tests) {
        const status = suite.results.success ? '✅' : '⚠️';
        documentation += `| ${test.number} | ${test.description} | ${status} |\n`;
      }
    }

    documentation += '\n**Results:** \n';
    documentation += `- Passed: ${suite.results.passed}\n`;
    documentation += `- Failed: ${suite.results.failed}\n`;
    documentation += `- Total: ${suite.results.total}\n\n`;
  }

  return documentation;
}

/**
 * Update TEST-RESULTS.md
 */
function updateTestResults() {
  const docsPath = path.join(DOCS_DIR, 'project', 'TEST-RESULTS.md');
  const documentation = generateTestDocumentation();

  // Ensure directory exists
  const dirPath = path.dirname(docsPath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  fs.writeFileSync(docsPath, documentation, 'utf8');
  console.log(`✅ Test documentation updated: ${docsPath}`);
}

/**
 * Generate quick reference for CI/CD
 */
function generateTestSummary() {
  const now = new Date().toISOString();
  let summary = '# Test Run Summary\n\n';
  summary += `**Generated:** ${now}\n\n`;

  let totalTests = 0;
  let totalPassed = 0;
  let allPassed = true;

  for (const testFile of TEST_FILES) {
    const filePath = path.join(SCRIPTS_DIR, testFile);

    if (!fs.existsSync(filePath)) {
      continue;
    }

    const results = extractTestResults(filePath);
    totalTests += results.total;
    totalPassed += results.passed;

    if (!results.success) {
      allPassed = false;
    }

    const status = results.success ? '✅' : '❌';
    summary += `${status} **${testFile}** - ${results.passed}/${results.total} passed\n`;
  }

  summary += '\n## Overall Results\n\n';
  summary += `- **Total Tests:** ${totalTests}\n`;
  summary += `- **Passed:** ${totalPassed}\n`;
  summary += `- **Failed:** ${totalTests - totalPassed}\n`;
  summary += `- **Pass Rate:** ${totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0}%\n`;
  summary += `- **Status:** ${allPassed ? '✅ ALL TESTS PASS' : '❌ SOME TESTS FAILING'}\n`;

  const summaryPath = path.join(DOCS_DIR, 'TEST-SUMMARY-LATEST.md');
  fs.writeFileSync(summaryPath, summary, 'utf8');
  console.log(`✅ Test summary created: ${summaryPath}`);
}

// Main execution
if (require.main === module) {
  try {
    updateTestResults();
    generateTestSummary();
    console.log('\n✅ Test documentation generation complete!');
  } catch (err) {
    console.error('❌ Error generating test documentation:', err.message);
    process.exit(1);
  }
}

module.exports = {
  extractTestMetadata,
  extractTestResults,
  generateTestDocumentation,
  updateTestResults,
  generateTestSummary,
};
