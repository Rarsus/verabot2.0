#!/usr/bin/env node

/**
 * Coverage Tracking System
 * Tracks, reports, and analyzes code coverage metrics
 * Usage: node scripts/coverage-tracking.js [--baseline|--compare|--report]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const COVERAGE_DIR = path.join(__dirname, '..', 'coverage');
const COVERAGE_HISTORY_FILE = path.join(__dirname, '..', '.coverage-history.json');
const COVERAGE_BASELINE_FILE = path.join(__dirname, '..', '.coverage-baseline.json');

// Ensure coverage directories exist
if (!fs.existsSync(COVERAGE_DIR)) {
  fs.mkdirSync(COVERAGE_DIR, { recursive: true });
}

/**
 * Generate current coverage report
 */
function generateCoverageReport() {
  console.log('📊 Generating coverage report...');
  try {
    execSync('npm run test:coverage', { stdio: 'inherit' });
    console.log('✅ Coverage report generated');
    return true;
  } catch (error) {
    console.error('❌ Failed to generate coverage report:', error.message);
    return false;
  }
}

/**
 * Parse coverage summary from coverage-final.json
 */
function parseCoverageSummary() {
  const summaryPath = path.join(COVERAGE_DIR, 'coverage-summary.json');
  
  if (!fs.existsSync(summaryPath)) {
    console.error('❌ Coverage summary not found. Run coverage first.');
    return null;
  }

  try {
    const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    return summary.total;
  } catch (error) {
    console.error('❌ Failed to parse coverage summary:', error.message);
    return null;
  }
}

/**
 * Load coverage history
 */
function loadCoverageHistory() {
  if (fs.existsSync(COVERAGE_HISTORY_FILE)) {
    return JSON.parse(fs.readFileSync(COVERAGE_HISTORY_FILE, 'utf8'));
  }
  return [];
}

/**
 * Save coverage history
 */
function saveCoverageHistory(history) {
  fs.writeFileSync(COVERAGE_HISTORY_FILE, JSON.stringify(history, null, 2));
}

/**
 * Load baseline coverage
 */
function loadBaseline() {
  if (fs.existsSync(COVERAGE_BASELINE_FILE)) {
    return JSON.parse(fs.readFileSync(COVERAGE_BASELINE_FILE, 'utf8'));
  }
  return null;
}

/**
 * Save baseline coverage
 */
function saveBaseline(coverage) {
  fs.writeFileSync(COVERAGE_BASELINE_FILE, JSON.stringify(coverage, null, 2));
}

/**
 * Format coverage percentage
 */
function formatPercent(value) {
  if (value === null || value === undefined) return 'N/A';
  return `${value.toFixed(2)}%`;
}

/**
 * Calculate delta from baseline
 */
function calculateDelta(current, baseline) {
  if (!baseline || !current) return null;
  return current - baseline;
}

/**
 * Set baseline (--baseline flag)
 */
function setBaseline() {
  console.log('🎯 Setting baseline coverage...\n');
  
  if (!generateCoverageReport()) {
    process.exit(1);
  }

  const coverage = parseCoverageSummary();
  if (!coverage) {
    process.exit(1);
  }

  saveBaseline(coverage);
  
  console.log('\n📍 Baseline Coverage Set:');
  console.log(`   Lines:       ${formatPercent(coverage.lines.pct)}`);
  console.log(`   Statements:  ${formatPercent(coverage.statements.pct)}`);
  console.log(`   Functions:   ${formatPercent(coverage.functions.pct)}`);
  console.log(`   Branches:    ${formatPercent(coverage.branches.pct)}\n`);
}

/**
 * Compare current coverage to baseline (--compare flag)
 */
function compareToBaseline() {
  console.log('📊 Comparing to baseline coverage...\n');
  
  if (!generateCoverageReport()) {
    process.exit(1);
  }

  const current = parseCoverageSummary();
  const baseline = loadBaseline();

  if (!current) {
    process.exit(1);
  }

  if (!baseline) {
    console.error('❌ No baseline found. Run with --baseline first.');
    process.exit(1);
  }

  const metrics = ['lines', 'statements', 'functions', 'branches'];
  const results = {};

  console.log('Coverage Comparison:');
  console.log('─'.repeat(70));
  console.log(`${'Metric'.padEnd(15)} ${'Baseline'.padEnd(15)} ${'Current'.padEnd(15)} ${'Change'.padEnd(15)}`);
  console.log('─'.repeat(70));

  let hasRegressions = false;

  metrics.forEach(metric => {
    // eslint-disable-next-line security/detect-object-injection
    const baselineVal = baseline[metric].pct;
    // eslint-disable-next-line security/detect-object-injection
    const currentVal = current[metric].pct;
    const delta = calculateDelta(currentVal, baselineVal);
    const deltaStr = delta >= 0 ? `+${delta.toFixed(2)}%` : `${delta.toFixed(2)}%`;
    const status = delta < 0 ? '⚠️  ' : '✅ ';

    // eslint-disable-next-line security/detect-object-injection
    results[metric] = { baseline: baselineVal, current: currentVal, delta };

    console.log(
      `${metric.padEnd(15)} ${formatPercent(baselineVal).padEnd(15)} ${formatPercent(currentVal).padEnd(15)} ${status}${deltaStr.padEnd(15)}`
    );

    if (delta < -1) {
      hasRegressions = true;
    }
  });

  console.log('─'.repeat(70) + '\n');

  if (hasRegressions) {
    console.warn('⚠️  Coverage regressions detected!');
    process.exit(1);
  } else {
    console.log('✅ No coverage regressions detected.');
  }
}

/**
 * Generate coverage trend report (--report flag)
 */
function generateTrendReport() {
  console.log('📈 Generating coverage trend report...\n');
  
  if (!generateCoverageReport()) {
    process.exit(1);
  }

  const current = parseCoverageSummary();
  if (!current) {
    process.exit(1);
  }

  let history = loadCoverageHistory();
  
  // Add current coverage to history
  history.push({
    date: new Date().toISOString(),
    lines: current.lines.pct,
    statements: current.statements.pct,
    functions: current.functions.pct,
    branches: current.branches.pct
  });

  // Keep only last 30 entries
  if (history.length > 30) {
    history = history.slice(-30);
  }

  saveCoverageHistory(history);

  console.log('Coverage Trend (Last 10 Runs):');
  console.log('─'.repeat(80));
  console.log(`${'Date'.padEnd(20)} ${'Lines'.padEnd(15)} ${'Statements'.padEnd(15)} ${'Functions'.padEnd(15)} ${'Branches'.padEnd(15)}`);
  console.log('─'.repeat(80));

  history.slice(-10).forEach(entry => {
    const date = new Date(entry.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    console.log(
      `${date.padEnd(20)} ${formatPercent(entry.lines).padEnd(15)} ${formatPercent(entry.statements).padEnd(15)} ${formatPercent(entry.functions).padEnd(15)} ${formatPercent(entry.branches).padEnd(15)}`
    );
  });
  console.log('─'.repeat(80) + '\n');

  // Calculate trends
  if (history.length > 1) {
    const prev = history[history.length - 2];
    const curr = history[history.length - 1];

    console.log('Trend Analysis:');
    const linesTrend = curr.lines - prev.lines;
    const stmtTrend = curr.statements - prev.statements;
    const funcTrend = curr.functions - prev.functions;
    const branchTrend = curr.branches - prev.branches;

    console.log(`   Lines:       ${linesTrend >= 0 ? '📈' : '📉'} ${(linesTrend >= 0 ? '+' : '')}${linesTrend.toFixed(2)}%`);
    console.log(`   Statements:  ${stmtTrend >= 0 ? '📈' : '📉'} ${(stmtTrend >= 0 ? '+' : '')}${stmtTrend.toFixed(2)}%`);
    console.log(`   Functions:   ${funcTrend >= 0 ? '📈' : '📉'} ${(funcTrend >= 0 ? '+' : '')}${funcTrend.toFixed(2)}%`);
    console.log(`   Branches:    ${branchTrend >= 0 ? '📈' : '📉'} ${(branchTrend >= 0 ? '+' : '')}${branchTrend.toFixed(2)}%\n`);
  }
}

/**
 * Main execution
 */
function main() {
  const command = process.argv[2];

  switch (command) {
    case '--baseline':
      setBaseline();
      break;
    case '--compare':
      compareToBaseline();
      break;
    case '--report':
      generateTrendReport();
      break;
    default:
      console.log(`Usage: node scripts/coverage-tracking.js [COMMAND]

Commands:
  --baseline    Set current coverage as baseline for comparisons
  --compare     Compare current coverage to baseline (fail on regression)
  --report      Generate coverage trend report

Examples:
  node scripts/coverage-tracking.js --baseline
  node scripts/coverage-tracking.js --compare
  node scripts/coverage-tracking.js --report
`);
  }
}

main();
