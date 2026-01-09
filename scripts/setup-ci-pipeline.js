#!/usr/bin/env node

/**
 * CI/CD Pipeline Setup Script
 * Configures GitHub Actions for automated testing
 * Usage: node scripts/setup-ci-pipeline.js [--init|--validate]
 */

const fs = require('fs');
const path = require('path');

const GITHUB_WORKFLOWS_DIR = path.join(__dirname, '..', '.github', 'workflows');
const TEST_WORKFLOW = path.join(GITHUB_WORKFLOWS_DIR, 'test.yml');
const COVERAGE_WORKFLOW = path.join(GITHUB_WORKFLOWS_DIR, 'coverage.yml');

/**
 * Create GitHub workflows directory
 */
function ensureWorkflowsDir() {
  if (!fs.existsSync(GITHUB_WORKFLOWS_DIR)) {
    fs.mkdirSync(GITHUB_WORKFLOWS_DIR, { recursive: true });
    console.log('✅ Created .github/workflows directory');
  }
}

/**
 * Create main test workflow
 */
function createTestWorkflow() {
  const workflow = `name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v3
      
      - name: Use Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: \${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint code
        run: npm run lint --if-present
      
      - name: Run tests
        run: npm test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella
          fail_ci_if_error: false
`;

  fs.writeFileSync(TEST_WORKFLOW, workflow);
  console.log('✅ Created test.yml workflow');
}

/**
 * Create coverage workflow
 */
function createCoverageWorkflow() {
  const workflow = `name: Coverage

on:
  pull_request:
    branches: [ main, develop ]

jobs:
  coverage:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20.x'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Generate coverage report
        run: npm run test:coverage
      
      - name: Check coverage thresholds
        run: npm run coverage:validate --if-present
      
      - name: Comment PR with coverage
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          github-token: \${{ secrets.GITHUB_TOKEN }}
          lcov-file: ./coverage/lcov.info
`;

  fs.writeFileSync(COVERAGE_WORKFLOW, workflow);
  console.log('✅ Created coverage.yml workflow');
}

/**
 * Update package.json scripts for CI/CD
 */
function updatePackageJson() {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Ensure scripts object exists
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  // Add or update coverage scripts
  packageJson.scripts['test:coverage'] = packageJson.scripts['test:coverage'] || 'nyc npm test';
  packageJson.scripts['coverage:validate'] = packageJson.scripts['coverage:validate'] || 'node scripts/coverage-tracking.js --compare';
  packageJson.scripts['coverage:baseline'] = packageJson.scripts['coverage:baseline'] || 'node scripts/coverage-tracking.js --baseline';
  packageJson.scripts['coverage:report'] = packageJson.scripts['coverage:report'] || 'node scripts/coverage-tracking.js --report';

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated package.json with coverage scripts');
}

/**
 * Create .nycrc.json for coverage configuration
 */
function createNycConfig() {
  const nycConfig = {
    all: true,
    include: ['src/**/*.js'],
    exclude: [
      'src/**/*.test.js',
      'src/**/*.spec.js',
      '**/node_modules/**',
      'coverage/**'
    ],
    reporter: ['text', 'lcov', 'html', 'json-summary'],
    'report-dir': './coverage',
    'temp-dir': './coverage/.nyc_output',
    lines: 90,
    functions: 95,
    branches: 85,
    statements: 90,
    'check-coverage': true,
    'per-file': false,
    'skip-full': false
  };

  const nycPath = path.join(__dirname, '..', '.nycrc.json');
  fs.writeFileSync(nycPath, JSON.stringify(nycConfig, null, 2));
  console.log('✅ Created .nycrc.json configuration');
}

/**
 * Create GitHub status checks configuration
 */
function createStatusChecks() {
  const checksConfig = {
    branches: {
      main: {
        protection: {
          required_status_checks: {
            strict: true,
            contexts: ['Tests', 'Coverage']
          },
          required_pull_request_reviews: {
            dismiss_stale_reviews: true,
            require_code_owner_reviews: false,
            required_approving_review_count: 1
          }
        }
      }
    }
  };

  const checksPath = path.join(__dirname, '..', '.github', 'status-checks.json');
  fs.writeFileSync(checksPath, JSON.stringify(checksConfig, null, 2));
  console.log('✅ Created status-checks configuration');
}

/**
 * Validate existing CI/CD setup
 */
function validateSetup() {
  console.log('\n📋 Validating CI/CD Setup...\n');

  const checks = [
    { name: 'Test Workflow', path: TEST_WORKFLOW },
    { name: 'Coverage Workflow', path: COVERAGE_WORKFLOW },
    { name: '.nycrc.json', path: path.join(__dirname, '..', '.nycrc.json') },
    { name: 'package.json scripts', path: path.join(__dirname, '..', 'package.json') }
  ];

  let allValid = true;

  checks.forEach(check => {
    const exists = fs.existsSync(check.path);
    const status = exists ? '✅' : '❌';
    console.log(`${status} ${check.name}`);
    if (!exists) allValid = false;
  });

  console.log('\n' + (allValid ? '✅ CI/CD setup is complete!' : '❌ Some components are missing.'));
  return allValid;
}

/**
 * Display quick start guide
 */
function showQuickStart() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║          CI/CD Pipeline Quick Start Guide                      ║
╚════════════════════════════════════════════════════════════════╝

✅ GitHub Actions Workflows Configured
   - Tests run on push and pull request
   - Coverage reports generated and uploaded
   - Lint checks included

📦 Coverage Tools Installed
   - nyc (Istanbul) for coverage tracking
   - Coverage validation on PRs
   - Coverage trend reporting

🚀 Quick Commands

   Set baseline coverage:
   $ npm run coverage:baseline

   Compare to baseline:
   $ npm run coverage:validate

   Generate trend report:
   $ npm run coverage:report

   Run full test suite with coverage:
   $ npm run test:coverage

💡 Next Steps

   1. Push this branch to GitHub
   2. Create a Pull Request
   3. Watch GitHub Actions run tests
   4. Coverage report will be posted on PR
   5. Merge when all checks pass

📖 Documentation

   - .github/workflows/test.yml - Main test workflow
   - .github/workflows/coverage.yml - Coverage workflow
   - .nycrc.json - Coverage configuration
   - scripts/coverage-tracking.js - Coverage tracking script

🔗 GitHub Actions Status
   https://github.com/Rarsus/verabot2.0/actions

`);
}

/**
 * Main execution
 */
function main() {
  const command = process.argv[2];

  switch (command) {
    case '--init':
      console.log('🔧 Initializing CI/CD Pipeline...\n');
      ensureWorkflowsDir();
      createTestWorkflow();
      createCoverageWorkflow();
      createNycConfig();
      createStatusChecks();
      updatePackageJson();
      console.log('\n✅ CI/CD Pipeline initialized!\n');
      showQuickStart();
      break;

    case '--validate':
      validateSetup();
      break;

    default:
      console.log(`Usage: node scripts/setup-ci-pipeline.js [COMMAND]

Commands:
  --init       Initialize CI/CD pipeline with GitHub Actions
  --validate   Validate existing CI/CD setup

Examples:
  node scripts/setup-ci-pipeline.js --init
  node scripts/setup-ci-pipeline.js --validate
`);
  }
}

main();
