#!/usr/bin/env node

/**
 * Unified Coverage Management Script
 * Consolidates functionality from coverage-unified.js and coverage-tracking.js
 * 
 * Commands:
 *   npm run coverage:report    - Generate and display coverage report
 *   npm run coverage:validate  - Validate coverage against targets
 *   npm run coverage:baseline  - Set current coverage as baseline
 *   npm run coverage:compare   - Compare current to baseline
 *   npm run coverage:all       - Full comprehensive report
 * 
 * Usage: node scripts/coverage.js [--report|--validate|--baseline|--compare|--all]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { handleScriptError, handleFileError } = require('./lib/error-handler');

// Configuration
const config = {
  coverageDir: path.join(__dirname, '..', 'coverage'),
  testsDir: path.join(__dirname, '..', 'tests'),
  summaryFile: path.join(__dirname, '..', 'coverage', 'coverage-summary.json'),
  finalFile: path.join(__dirname, '..', 'coverage', 'coverage-final.json'),
  baselineFile: path.join(__dirname, '..', '.coverage-baseline.json'),
  historyFile: path.join(__dirname, '..', '.coverage-history.json'),
};

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

// Coverage targets (must match jest.config.js)
const targets = {
  statements: 22,
  branches: 15,
  functions: 18,
  lines: 22,
};

/**
 * Format percentage with color
 */
function formatPercent(value, target = 0) {
  if (value === null || value === undefined) return 'N/A';

  const percent = `${value.toFixed(2)}%`;

  if (target > 0) {
    if (value >= target) return `${colors.green}${percent}${colors.reset}`;
    if (value >= target * 0.7) return `${colors.yellow}${percent}${colors.reset}`;
    return `${colors.red}${percent}${colors.reset}`;
  }

  return percent;
}

/**
 * Generate coverage report
 */
function generateCoverageReport() {
  console.log(`${colors.bold}${colors.cyan}🚀 Generating Coverage Report${colors.reset}`);
  console.log(`${colors.dim}Running all tests and collecting coverage...${colors.reset}\n`);

  try {
    execSync('npm run test:coverage 2>&1', { stdio: 'inherit' });
    console.log(`\n${colors.green}✅ Coverage report generated${colors.reset}\n`);
    return true;
  } catch (_error) {
    console.error(`${colors.red}❌ Failed to generate coverage report${colors.reset}`);
    return false;
  }
}

/**
 * Parse coverage summary from coverage-summary.json
 */
function parseCoverageSummary() {
  if (!fs.existsSync(config.summaryFile)) {
    console.error(
      `${colors.red}❌ Coverage summary not found${colors.reset}\n` +
      `${colors.dim}Run: npm run coverage:report${colors.reset}`
    );
    return null;
  }

  try {
    const summary = JSON.parse(fs.readFileSync(config.summaryFile, 'utf8'));
    return summary.total;
  } catch (_error) {
    handleFileError(_error, config.summaryFile, 'parsing');
    return null;
  }
}

/**
 * Load coverage history
 */
function loadCoverageHistory() {
  if (fs.existsSync(config.historyFile)) {
    try {
      return JSON.parse(fs.readFileSync(config.historyFile, 'utf8'));
    } catch (_error) {
      console.warn(`${colors.yellow}⚠️  Failed to load history${colors.reset}`);
      return [];
    }
  }
  return [];
}

/**
 * Save coverage history
 */
function saveCoverageHistory(history) {
  try {
    fs.writeFileSync(config.historyFile, JSON.stringify(history, null, 2));
  } catch (error) {
    handleFileError(error, config.historyFile, 'writing');
  }
}

/**
 * Load baseline coverage
 */
function loadBaseline() {
  if (fs.existsSync(config.baselineFile)) {
    try {
      return JSON.parse(fs.readFileSync(config.baselineFile, 'utf8'));
    } catch (_error) {
      console.warn(`${colors.yellow}⚠️  Failed to load baseline${colors.reset}`);
      return null;
    }
  }
  return null;
}

/**
 * Save baseline coverage
 */
function saveBaseline(coverage) {
  try {
    fs.writeFileSync(config.baselineFile, JSON.stringify(coverage, null, 2));
  } catch (error) {
    handleFileError(error, config.baselineFile, 'writing');
  }
}

/**
 * Calculate delta from baseline
 */
function calculateDelta(current, baseline) {
  if (!baseline || !current) return null;
  return current - baseline;
}

/**
 * Report current coverage
 */
function reportCoverage() {
  console.log(`${colors.bold}${colors.cyan}📊 Coverage Report${colors.reset}\n`);

  if (!generateCoverageReport()) {
    process.exit(1);
  }

  const coverage = parseCoverageSummary();
  if (!coverage) {
    process.exit(1);
  }

  const history = loadCoverageHistory();
  const newEntry = {
    timestamp: Date.now(),
    lines: coverage.lines.pct,
    statements: coverage.statements.pct,
    functions: coverage.functions.pct,
    branches: coverage.branches.pct,
  };

  history.push(newEntry);
  saveCoverageHistory(history);

  console.log(`${colors.bold}Current Coverage:${colors.reset}`);
  console.log(`   Lines:       ${formatPercent(coverage.lines.pct)}`);
  console.log(`   Statements:  ${formatPercent(coverage.statements.pct)}`);
  console.log(`   Functions:   ${formatPercent(coverage.functions.pct)}`);
  console.log(`   Branches:    ${formatPercent(coverage.branches.pct)}\n`);
}

/**
 * Validate coverage against targets
 */
function validateCoverage() {
  console.log(`${colors.bold}${colors.cyan}✓ Validating Coverage${colors.reset}\n`);

  if (!generateCoverageReport()) {
    process.exit(1);
  }

  const coverage = parseCoverageSummary();
  if (!coverage) {
    process.exit(1);
  }

  console.log(`${colors.bold}Coverage Validation (Targets):${colors.reset}`);
  console.log(`   Lines:       ${formatPercent(coverage.lines.pct, targets.lines)} (target: ${targets.lines}%)`);
  console.log(`   Statements:  ${formatPercent(coverage.statements.pct, targets.statements)} (target: ${targets.statements}%)`);
  console.log(`   Functions:   ${formatPercent(coverage.functions.pct, targets.functions)} (target: ${targets.functions}%)`);
  console.log(`   Branches:    ${formatPercent(coverage.branches.pct, targets.branches)} (target: ${targets.branches}%)\n`);

  const failed = [
    coverage.lines.pct < targets.lines ? 'Lines' : null,
    coverage.statements.pct < targets.statements ? 'Statements' : null,
    coverage.functions.pct < targets.functions ? 'Functions' : null,
    coverage.branches.pct < targets.branches ? 'Branches' : null,
  ].filter(Boolean);

  if (failed.length > 0) {
    console.error(`${colors.red}❌ Coverage validation FAILED${colors.reset}`);
    console.error(`${colors.dim}Failed metrics: ${failed.join(', ')}${colors.reset}\n`);
    process.exit(1);
  }

  console.log(`${colors.green}✅ All coverage targets met!${colors.reset}\n`);
}

/**
 * Set baseline from current coverage
 */
function setBaseline() {
  console.log(`${colors.bold}${colors.cyan}🎯 Setting Baseline Coverage${colors.reset}\n`);

  if (!generateCoverageReport()) {
    process.exit(1);
  }

  const coverage = parseCoverageSummary();
  if (!coverage) {
    process.exit(1);
  }

  saveBaseline(coverage);

  console.log(`${colors.bold}Baseline Coverage Set:${colors.reset}`);
  console.log(`   Lines:       ${formatPercent(coverage.lines.pct)}`);
  console.log(`   Statements:  ${formatPercent(coverage.statements.pct)}`);
  console.log(`   Functions:   ${formatPercent(coverage.functions.pct)}`);
  console.log(`   Branches:    ${formatPercent(coverage.branches.pct)}\n`);
}

/**
 * Compare current coverage to baseline
 */
function compareToBaseline() {
  console.log(`${colors.bold}${colors.cyan}📈 Comparing to Baseline${colors.reset}\n`);

  if (!generateCoverageReport()) {
    process.exit(1);
  }

  const current = parseCoverageSummary();
  const baseline = loadBaseline();

  if (!current) {
    process.exit(1);
  }

  if (!baseline) {
    console.error(`${colors.red}❌ No baseline found${colors.reset}`);
    console.error(`${colors.dim}Run: node scripts/coverage.js --baseline${colors.reset}\n`);
    process.exit(1);
  }

  console.log(`${colors.bold}Baseline vs Current:${colors.reset}\n`);

  const compareMetric = (name, curr, base) => {
    const delta = calculateDelta(curr, base);
    const sign = delta > 0 ? '+' : '';
    const color = delta > 0 ? colors.green : delta < 0 ? colors.red : colors.dim;
    console.log(`   ${name}:`);
    console.log(`      Baseline:  ${formatPercent(base)}`);
    console.log(`      Current:   ${formatPercent(curr)}`);
    console.log(`      Delta:     ${color}${sign}${delta.toFixed(2)}%${colors.reset}`);
  };

  compareMetric('Lines', current.lines.pct, baseline.lines.pct);
  compareMetric('Statements', current.statements.pct, baseline.statements.pct);
  compareMetric('Functions', current.functions.pct, baseline.functions.pct);
  compareMetric('Branches', current.branches.pct, baseline.branches.pct);

  console.log();
}

/**
 * Display comprehensive report
 */
function comprehensiveReport() {
  console.log(`${colors.bold}${colors.cyan}📋 Comprehensive Coverage Report${colors.reset}\n`);

  reportCoverage();
  console.log('\n' + '='.repeat(50) + '\n');
  validateCoverage();
  console.log('='.repeat(50) + '\n');
  compareToBaseline();
}

/**
 * Display help text
 */
function displayHelp() {
  console.log(`
${colors.bold}${colors.cyan}Coverage Management Script${colors.reset}

${colors.bold}Usage:${colors.reset}
  node scripts/coverage.js [command]

${colors.bold}Commands:${colors.reset}
  --report     Generate and display coverage report
  --validate   Validate coverage against targets
  --baseline   Set current coverage as baseline
  --compare    Compare current to baseline
  --all        Full comprehensive report (default)

${colors.bold}npm scripts:${colors.reset}
  npm run coverage:report    - Same as --report
  npm run coverage:validate  - Same as --validate
  npm run coverage:baseline  - Same as --baseline
  npm run coverage:compare   - Same as --compare
  npm run coverage:all       - Same as --all

${colors.bold}Examples:${colors.reset}
  node scripts/coverage.js --report
  npm run coverage:validate
  npm run coverage:baseline
`);
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0] || '--all';

try {
  switch (command) {
    case '--report':
      reportCoverage();
      break;
    case '--validate':
      validateCoverage();
      break;
    case '--baseline':
      setBaseline();
      break;
    case '--compare':
      compareToBaseline();
      break;
    case '--all':
      comprehensiveReport();
      break;
    case '--help':
    case '-h':
      displayHelp();
      break;
    default:
      console.error(`${colors.red}❌ Unknown command: ${command}${colors.reset}`);
      displayHelp();
      process.exit(1);
  }
} catch (error) {
  handleScriptError(error, 'scripts/coverage.js', 1);
}
