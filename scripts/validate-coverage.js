#!/usr/bin/env node

/**
 * Coverage Validation Script
 * Parses Jest coverage output and validates against project targets
 * 
 * Usage: npm run coverage:validate
 * 
 * Features:
 * - Parses coverage-summary.json
 * - Displays current coverage metrics
 * - Tracks progress toward targets
 * - Shows covered vs uncovered modules
 * - Suggests next test priorities
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
};

// Coverage targets (roadmap)
const targets = {
  current: {
    statements: 0.52,
    branches: 0.06,
    functions: 0.33,
    lines: 0.54,
  },
  phase11: {
    statements: 5,
    branches: 2,
    functions: 5,
    lines: 5,
  },
  phase12: {
    statements: 15,
    branches: 8,
    functions: 15,
    lines: 15,
  },
  phase13: {
    statements: 40,
    branches: 30,
    functions: 40,
    lines: 40,
  },
  final: {
    statements: 90,
    branches: 85,
    functions: 95,
    lines: 90,
  },
};

function getColorCode(current, target) {
  if (current >= target * 0.9) return colors.green;
  if (current >= target * 0.5) return colors.yellow;
  return colors.red;
}

function formatPercent(value, width = 6) {
  return `${value.toFixed(2)}%`.padStart(width);
}

function printHeader(text) {
  console.log(`\n${colors.bold}${colors.cyan}${text}${colors.reset}`);
  console.log(`${colors.dim}${'='.repeat(70)}${colors.reset}\n`);
}

function printSection(title) {
  console.log(`${colors.bold}${title}${colors.reset}`);
}

function main() {
  const coveragePath = path.join(__dirname, '../coverage/coverage-summary.json');

  if (!fs.existsSync(coveragePath)) {
    console.error(
      `${colors.red}Error: Coverage file not found${colors.reset}\n` +
      'Run: npm run test:jest:coverage\n' +
      `File expected at: ${coveragePath}`
    );
    process.exit(1);
  }

  // Parse coverage summary file
  const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf-8'));
  const totalStats = coverage.total;

  // Get current percentages
  const current = {
    statements: totalStats.statements.pct,
    branches: totalStats.branches.pct,
    functions: totalStats.functions.pct,
    lines: totalStats.lines.pct,
  };

  // Print header
  printHeader('📊 Jest Coverage Report');

  // Print current coverage
  printSection('Current Coverage Metrics:');
  console.log(
    `  Statements:  ${getColorCode(current.statements, targets.final.statements)}` +
    `${formatPercent(current.statements)} ${colors.reset}` +
    `(${totalStats.statements.covered}/${totalStats.statements.total})`
  );
  console.log(
    `  Branches:    ${getColorCode(current.branches, targets.final.branches)}` +
    `${formatPercent(current.branches)} ${colors.reset}` +
    `(${totalStats.branches.covered}/${totalStats.branches.total})`
  );
  console.log(
    `  Functions:   ${getColorCode(current.functions, targets.final.functions)}` +
    `${formatPercent(current.functions)} ${colors.reset}` +
    `(${totalStats.functions.covered}/${totalStats.functions.total})`
  );
  console.log(
    `  Lines:       ${getColorCode(current.lines, targets.final.lines)}` +
    `${formatPercent(current.lines)} ${colors.reset}` +
    `(${totalStats.lines.covered}/${totalStats.lines.total})`
  );

  // Print progress roadmap
  console.log(`\n${colors.bold}Coverage Roadmap:${colors.reset}`);
  const phases = [
    { name: 'Current (Phase 9-10)', targets: targets.current },
    { name: 'Phase 11 Target', targets: targets.phase11 },
    { name: 'Phase 12 Target', targets: targets.phase12 },
    { name: 'Phase 13 Target', targets: targets.phase13 },
    { name: 'Final Target', targets: targets.final },
  ];

  console.log(
    `${'Phase'.padEnd(25)} | Statements | Branches | Functions | Lines    ` +
    `| Status`
  );
  console.log('-'.repeat(100));

  phases.forEach(({ name, targets: phaseTargets }) => {
    const statementColor = getColorCode(current.statements, phaseTargets.statements);
    const branchColor = getColorCode(current.branches, phaseTargets.branches);
    const functionColor = getColorCode(current.functions, phaseTargets.functions);
    const lineColor = getColorCode(current.lines, phaseTargets.lines);

    const allMet = current.statements >= phaseTargets.statements &&
                   current.branches >= phaseTargets.branches &&
                   current.functions >= phaseTargets.functions &&
                   current.lines >= phaseTargets.lines;

    const status = allMet ? `${colors.green}✓ MET${colors.reset}` : `${colors.yellow}→ PENDING${colors.reset}`;

    console.log(
      `${name.padEnd(25)} | ` +
      `${statementColor}${formatPercent(phaseTargets.statements)}${colors.reset} | ` +
      `${branchColor}${formatPercent(phaseTargets.branches)}${colors.reset} | ` +
      `${functionColor}${formatPercent(phaseTargets.functions)}${colors.reset} | ` +
      `${lineColor}${formatPercent(phaseTargets.lines)}${colors.reset} | ` +
      status
    );
  });

  // Identify uncovered modules
  console.log(`\n${colors.bold}Uncovered Modules (0% coverage):${colors.reset}`);
  const uncovered = [];
  const partiallyCovered = [];

  Object.entries(coverage).forEach(([file, data]) => {
    if (file === 'total' || file.includes('node_modules') || file.includes('.test.js')) return;

    const statements_pct = data.statements?.pct || 0;
    if (statements_pct === 0) {
      uncovered.push(file.replace(/.*\/src\//, ''));
    } else if (statements_pct < 50) {
      partiallyCovered.push({
        file: file.replace(/.*\/src\//, ''),
        coverage: statements_pct,
      });
    }
  });

  if (uncovered.length > 0) {
    console.log(`\n${colors.red}${uncovered.length} modules with 0% coverage:${colors.reset}`);
    uncovered.slice(0, 10).forEach((file) => {
      console.log(`  • ${file}`);
    });
    if (uncovered.length > 10) {
      console.log(`  ... and ${uncovered.length - 10} more`);
    }
  }

  if (partiallyCovered.length > 0) {
    console.log(`\n${colors.yellow}${partiallyCovered.length} modules with <50% coverage:${colors.reset}`);
    partiallyCovered.slice(0, 5).forEach(({ file, coverage: cov }) => {
      console.log(`  • ${file.padEnd(40)} (${cov.toFixed(1)}%)`);
    });
    if (partiallyCovered.length > 5) {
      console.log(`  ... and ${partiallyCovered.length - 5} more`);
    }
  }

  // Print recommendations
  console.log(`\n${colors.bold}${colors.green}✓ Next Steps:${colors.reset}`);
  if (uncovered.length > 0) {
    console.log(`  1. Add tests for ${uncovered.length} uncovered modules`);
  }
  console.log(`  2. Run: npm run test:jest:coverage`);
  console.log(`  3. Check coverage/index.html for detailed reports`);
  console.log(`  4. Create new test files following Phase 10 patterns`);

  console.log(`\n`);
}

main();
