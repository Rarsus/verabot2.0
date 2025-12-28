#!/usr/bin/env node
/**
 * Automated Test Documentation Generator
 * 
 * Scans all test files in tests/unit/, counts tests, runs them,
 * and generates comprehensive documentation automatically.
 * 
 * Usage:
 *   node scripts/update-test-docs.js
 *   npm run test:docs:update
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const TESTS_DIR = path.join(__dirname, '../tests/unit');
const DOCS_DIR = path.join(__dirname, '../docs');
const TEST_COVERAGE_DOC = path.join(DOCS_DIR, 'TEST-COVERAGE-OVERVIEW.md');
const TEST_SUMMARY_DOC = path.join(DOCS_DIR, 'TEST-SUMMARY-LATEST.md');

/**
 * Get all test files from tests/unit directory
 */
function getAllTestFiles() {
  try {
    const files = fs.readdirSync(TESTS_DIR)
      .filter(file => file.startsWith('test-') && file.endsWith('.js'))
      .filter(file => !['test-all.js', 'run-tests.js'].includes(file))
      .sort();
    return files;
  } catch (err) {
    console.error('❌ Error reading test directory:', err.message);
    return [];
  }
}

/**
 * Count test cases in a test file by looking for "// Test N:" patterns
 */
function countTestsInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Look for "// Test 1:", "// Test 2:", etc.
    const testMatches = content.match(/^\/\/ Test \d+:/gm);
    const count = testMatches ? testMatches.length : 0;
    
    return count;
  } catch (err) {
    console.warn(`⚠️  Could not read ${path.basename(filePath)}: ${err.message}`);
    return 0;
  }
}

/**
 * Extract test descriptions from file
 */
function extractTestDescriptions(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const descriptions = [];
    
    // Match "// Test N: Description"
    const regex = /^\/\/ Test (\d+): (.+)$/gm;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      descriptions.push({
        number: parseInt(match[1]),
        description: match[2].trim()
      });
    }
    
    return descriptions;
  } catch (err) {
    return [];
  }
}

/**
 * Extract file header description
 */
function extractFileDescription(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Look for header comment block
    const headerMatch = content.match(/^\/\*\*\s*\n\s*\*\s*(.+?)\n/);
    if (headerMatch) {
      return headerMatch[1].trim();
    }
    
    // Fallback: convert filename to description
    const filename = path.basename(filePath, '.js');
    return filename.replace(/^test-/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  } catch (err) {
    return 'No description';
  }
}

/**
 * Run a single test file and capture results
 */
function runTestFile(filePath) {
  const filename = path.basename(filePath);
  
  try {
    const startTime = Date.now();
    const output = execSync(`node "${filePath}"`, {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8',
      timeout: 30000, // 30 second timeout
      stdio: ['pipe', 'pipe', 'pipe']
    });
    const duration = Date.now() - startTime;
    
    // Try to extract pass/fail counts from output
    let passed = 0;
    let failed = 0;
    let total = 0;
    
    // Look for "=== Test Summary ===" section with explicit counts
    const summaryMatch = output.match(/=== Test Summary ===[\s\S]*?Passed: (\d+)[\s\S]*?Failed: (\d+)[\s\S]*?Total: (\d+)/i);
    if (summaryMatch) {
      passed = parseInt(summaryMatch[1]);
      failed = parseInt(summaryMatch[2]);
      total = parseInt(summaryMatch[3]);
    } else {
      // Look for "✅ Passed: N" or "❌ Failed: N" patterns
      const passedMatch = output.match(/✅ Passed: (\d+)/i) || output.match(/Passed: (\d+)/i);
      const failedMatch = output.match(/❌ Failed: (\d+)/i) || output.match(/Failed: (\d+)/i);
      
      if (passedMatch) passed = parseInt(passedMatch[1]);
      if (failedMatch) failed = parseInt(failedMatch[1]);
      
      // If no explicit counts, try to count ✅ and ❌ symbols (excluding summary lines)
      if (passed === 0 && failed === 0) {
        const passCount = (output.match(/✅(?! Passed:)/g) || []).length;
        const failCount = (output.match(/❌(?! Failed:)/g) || []).length;
        
        passed = passCount;
        failed = failCount;
      }
      
      total = passed + failed;
    }
    
    return {
      success: failed === 0,
      passed,
      failed,
      total,
      duration,
      error: null
    };
  } catch (err) {
    // Test failed to run or had errors - try to extract any info from stderr
    const errorOutput = err.stdout || err.stderr || err.message || '';
    
    // Still try to extract counts from error output
    let passed = 0;
    let failed = 0;
    
    const summaryMatch = errorOutput.match(/Passed: (\d+)[\s\S]*?Failed: (\d+)/i);
    if (summaryMatch) {
      passed = parseInt(summaryMatch[1]);
      failed = parseInt(summaryMatch[2]);
    }
    
    const total = passed + failed || 1; // At least 1 if we have no info
    const actualFailed = failed || total; // Mark all as failed if unknown
    
    return {
      success: false,
      passed,
      failed: actualFailed,
      total,
      duration: 0,
      error: err.message ? err.message.split('\n')[0] : 'Test execution failed'
    };
  }
}

/**
 * Analyze all test files and gather metadata
 */
function analyzeAllTests() {
  console.log('📊 Analyzing test files...\n');
  
  const testFiles = getAllTestFiles();
  const results = [];
  
  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  let totalDuration = 0;
  
  for (const filename of testFiles) {
    const filePath = path.join(TESTS_DIR, filename);
    
    console.log(`  📝 ${filename}...`);
    
    const testCount = countTestsInFile(filePath);
    const descriptions = extractTestDescriptions(filePath);
    const fileDescription = extractFileDescription(filePath);
    const runResult = runTestFile(filePath);
    
    totalTests += runResult.total;
    totalPassed += runResult.passed;
    totalFailed += runResult.failed;
    totalDuration += runResult.duration;
    
    results.push({
      filename,
      fileDescription,
      testCount,
      descriptions,
      runResult
    });
    
    const status = runResult.success ? '✅' : '❌';
    console.log(`     ${status} ${runResult.passed}/${runResult.total} passed (${runResult.duration}ms)`);
  }
  
  console.log(`\n✅ Analysis complete: ${totalPassed}/${totalTests} tests passing\n`);
  
  return {
    results,
    summary: {
      totalFiles: testFiles.length,
      totalTests,
      totalPassed,
      totalFailed,
      totalDuration,
      passRate: totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0
    }
  };
}

/**
 * Generate TEST-SUMMARY-LATEST.md
 */
function generateTestSummary(analysis) {
  const { results, summary } = analysis;
  const timestamp = new Date().toISOString();
  
  let content = '# Test Run Summary\n\n';
  content += `**Generated:** ${timestamp}\n\n`;
  
  // List all test files with results
  for (const result of results) {
    const status = result.runResult.success ? '✅' : '❌';
    const { passed, total } = result.runResult;
    content += `${status} **${result.filename}** - ${passed}/${total} passed\n`;
  }
  
  content += '\n## Overall Results\n\n';
  content += `- **Total Tests:** ${summary.totalTests}\n`;
  content += `- **Passed:** ${summary.totalPassed}\n`;
  content += `- **Failed:** ${summary.totalFailed}\n`;
  content += `- **Pass Rate:** ${summary.passRate}%\n`;
  content += `- **Duration:** ${summary.totalDuration}ms\n`;
  
  const allPassed = summary.totalFailed === 0;
  content += `- **Status:** ${allPassed ? '✅ ALL TESTS PASS' : '❌ SOME TESTS FAILING'}\n`;
  
  return content;
}

/**
 * Generate TEST-COVERAGE-OVERVIEW.md
 */
function generateCoverageOverview(analysis) {
  const { results, summary } = analysis;
  const timestamp = new Date().toISOString().split('T')[0]; // Just the date
  
  let content = '# Test Coverage Overview\n\n';
  content += `**Last Updated:** ${timestamp}  \n`;
  content += `**Repository:** VeraBot2.0  \n`;
  content += `**Test Files:** ${summary.totalFiles}  \n`;
  content += `**Total Tests:** ${summary.totalTests}  \n`;
  content += `**Pass Rate:** ${summary.passRate}%\n\n`;
  
  content += '## Executive Summary\n\n';
  content += `VeraBot2.0 has **${summary.totalTests} tests** across **${summary.totalFiles} test files** `;
  content += `with a **${summary.passRate}% pass rate**. `;
  content += 'The test suite covers core framework components, commands, services, and utilities.\n\n';
  
  content += '> **Note:** This documentation is automatically generated. Last run: ' + new Date().toISOString() + '\n\n';
  
  content += '## Test Files Overview\n\n';
  content += '| Test File | Tests | Passed | Status | Description |\n';
  content += '|-----------|-------|--------|--------|-------------|\n';
  
  for (const result of results) {
    const status = result.runResult.success ? '✅' : '❌';
    const { passed, total } = result.runResult;
    content += `| ${result.filename} | ${total} | ${passed} | ${status} | ${result.fileDescription} |\n`;
  }
  
  content += '\n## Detailed Test Breakdown\n\n';
  
  for (const result of results) {
    content += `### ${result.filename}\n\n`;
    content += `**Description:** ${result.fileDescription}\n\n`;
    content += `**Test Count:** ${result.runResult.total}  \n`;
    content += `**Status:** ${result.runResult.success ? '✅ Passing' : '❌ Failing'}  \n`;
    content += `**Pass Rate:** ${result.runResult.total > 0 ? ((result.runResult.passed / result.runResult.total) * 100).toFixed(1) : 0}%\n\n`;
    
    if (result.descriptions.length > 0) {
      content += '**Tests:**\n\n';
      for (const desc of result.descriptions) {
        content += `${desc.number}. ${desc.description}\n`;
      }
      content += '\n';
    }
  }
  
  content += '## Test Execution Commands\n\n';
  content += '```bash\n';
  content += '# Run all tests\n';
  content += 'npm test\n';
  content += 'npm run test:all\n\n';
  content += '# Run quick sanity checks\n';
  content += 'npm run test:quick\n\n';
  content += '# Update test documentation\n';
  content += 'npm run test:docs:update\n';
  content += '```\n\n';
  
  content += '## CI/CD Integration\n\n';
  content += 'Test documentation is automatically updated on every CI run. ';
  content += 'The documentation reflects the latest test results and is kept in sync with the codebase.\n\n';
  
  content += '---\n\n';
  content += '*This document is automatically generated by `scripts/update-test-docs.js`. ';
  content += 'Do not edit manually - changes will be overwritten.*\n';
  
  return content;
}

/**
 * Write documentation files
 */
function writeDocumentation(analysis) {
  console.log('📝 Generating documentation...\n');
  
  try {
    // Generate and write TEST-SUMMARY-LATEST.md
    const summary = generateTestSummary(analysis);
    fs.writeFileSync(TEST_SUMMARY_DOC, summary, 'utf8');
    console.log(`  ✅ Updated: ${path.relative(process.cwd(), TEST_SUMMARY_DOC)}`);
    
    // Generate and write TEST-COVERAGE-OVERVIEW.md
    const overview = generateCoverageOverview(analysis);
    fs.writeFileSync(TEST_COVERAGE_DOC, overview, 'utf8');
    console.log(`  ✅ Updated: ${path.relative(process.cwd(), TEST_COVERAGE_DOC)}`);
    
    console.log('\n✅ Documentation updated successfully!\n');
  } catch (err) {
    console.error('❌ Error writing documentation:', err.message);
    throw err;
  }
}

/**
 * Main execution
 */
function main() {
  const startTime = Date.now();
  
  console.log('\n' + '='.repeat(60));
  console.log('🧪 Automated Test Documentation Generator');
  console.log('='.repeat(60) + '\n');
  
  try {
    // Analyze all tests
    const analysis = analyzeAllTests();
    
    // Generate documentation
    writeDocumentation(analysis);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`⏱️  Total time: ${duration}s\n`);
    
    // Show summary but don't fail on test failures
    // Documentation should be updated regardless of test status
    if (analysis.summary.totalFailed > 0) {
      console.warn(`⚠️  ${analysis.summary.totalFailed} test(s) failed, but documentation updated\n`);
    } else {
      console.log('✅ All tests passed!\n');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Fatal error:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  getAllTestFiles,
  countTestsInFile,
  extractTestDescriptions,
  extractFileDescription,
  runTestFile,
  analyzeAllTests,
  generateTestSummary,
  generateCoverageOverview
};
