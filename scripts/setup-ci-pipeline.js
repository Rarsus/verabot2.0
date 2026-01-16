#!/usr/bin/env node

/**
 * CI/CD Pipeline Setup Script
 * Configures GitHub Actions for automated testing
 * Enhanced with error handling and validation
 * Usage: node scripts/setup-ci-pipeline.js [--init|--validate|--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { handleFileError, createErrorContext, logErrorWithContext } = require('./lib/error-handler');

const GITHUB_WORKFLOWS_DIR = path.join(__dirname, '..', '.github', 'workflows');
const TEST_WORKFLOW = path.join(GITHUB_WORKFLOWS_DIR, 'test.yml');
const COVERAGE_WORKFLOW = path.join(GITHUB_WORKFLOWS_DIR, 'coverage.yml');

// Configuration
const dryRun = process.argv.includes('--dry-run');

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function info(msg) {
  console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`);
}

function success(msg) {
  console.log(`${colors.green}✅ ${msg}${colors.reset}`);
}

function warn(msg) {
  console.warn(`${colors.yellow}⚠️  ${msg}${colors.reset}`);
}

/**
 * Ensure GitHub workflows directory exists
 */
function ensureWorkflowsDir() {
  try {
    if (!fs.existsSync(GITHUB_WORKFLOWS_DIR)) {
      if (!dryRun) {
        fs.mkdirSync(GITHUB_WORKFLOWS_DIR, { recursive: true });
      }
      success(dryRun ? `[DRY-RUN] Would create ${GITHUB_WORKFLOWS_DIR}` : `Created .github/workflows directory`);
      return true;
    }
    return true;
  } catch (error) {
    const context = createErrorContext('setup-ci-pipeline.js', 'creating workflows directory', {
      directory: GITHUB_WORKFLOWS_DIR,
    });
    logErrorWithContext(error, context);
    return false;
  }
}

/**
 * Create main test workflow
 */
function createTestWorkflow() {
  try {
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

    if (!dryRun) {
      fs.writeFileSync(TEST_WORKFLOW, workflow);
    }
    success(dryRun ? `[DRY-RUN] Would create test.yml workflow` : `Created test.yml workflow`);
  } catch (error) {
    handleFileError(error, TEST_WORKFLOW, 'writing');
  }
}

/**
 * Create coverage workflow
 */
function createCoverageWorkflow() {
  try {
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

    if (!dryRun) {
      fs.writeFileSync(COVERAGE_WORKFLOW, workflow);
    }
    success(dryRun ? `[DRY-RUN] Would create coverage.yml workflow` : `Created coverage.yml workflow`);
  } catch (error) {
    handleFileError(error, COVERAGE_WORKFLOW, 'writing');
  }
}

/**
 * Update package.json scripts for CI/CD
 */
function updatePackageJson() {
  try {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      const context = createErrorContext('setup-ci-pipeline.js', 'updating package.json', {
        file: packageJsonPath,
      });
      logErrorWithContext(new Error('package.json not found'), context);
      return false;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Ensure scripts object exists
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    // Add/update CI-related scripts
    const ciScripts = {
      'test': 'jest',
      'lint': 'eslint . --max-warnings=50',
      'test:coverage': 'jest --coverage',
      'coverage:report': 'node scripts/coverage.js --report',
      'coverage:validate': 'node scripts/coverage.js --validate',
      'coverage:baseline': 'node scripts/coverage.js --baseline',
      'coverage:compare': 'node scripts/coverage.js --compare',
    };

    const scriptsUpdated = [];
    for (const [key, value] of Object.entries(ciScripts)) {
      if (!packageJson.scripts[key]) {
        packageJson.scripts[key] = value;
        scriptsUpdated.push(key);
      }
    }

    if (scriptsUpdated.length > 0) {
      if (!dryRun) {
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      }
      success(dryRun ? `[DRY-RUN] Would update ${scriptsUpdated.length} npm scripts` : `Updated ${scriptsUpdated.length} npm scripts`);
      return true;
    } else {
      info('All npm scripts already present');
      return true;
    }
  } catch (error) {
    const context = createErrorContext('setup-ci-pipeline.js', 'updating package.json scripts', {});
    logErrorWithContext(error, context);
    return false;
  }
}

/**
 * Create .nycrc.json for coverage configuration
 */
function createNycConfig() {
  try {
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
    if (!dryRun) {
      fs.writeFileSync(nycPath, JSON.stringify(nycConfig, null, 2) + '\n');
    }
    success(dryRun ? '[DRY-RUN] Would create .nycrc.json configuration' : 'Created .nycrc.json configuration');
    return true;
  } catch (error) {
    const context = createErrorContext('setup-ci-pipeline.js', 'creating .nycrc.json', {});
    logErrorWithContext(error, context);
    return false;
  }
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
  try {
    info('\n📋 Validating CI/CD Setup...\n');

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
  } catch (error) {
    const context = createErrorContext('setup-ci-pipeline.js', 'validating setup', {});
    logErrorWithContext(error, context);
    return false;
  }
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
  try {
    // Handle help flag
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
      console.log(`Usage: node scripts/setup-ci-pipeline.js [OPTIONS]

Options:
  --init       Initialize CI/CD pipeline with GitHub Actions
  --validate   Validate existing CI/CD setup
  --dry-run    Preview changes without writing files
  --help       Show this help message

Examples:
  node scripts/setup-ci-pipeline.js --init
  node scripts/setup-ci-pipeline.js --validate
  node scripts/setup-ci-pipeline.js --init --dry-run
`);
      process.exit(0);
    }

    if (process.argv.includes('--init')) {
      info('🔧 Initializing CI/CD Pipeline...\n');
      
      const steps = [
        { name: 'Ensure workflows directory', fn: ensureWorkflowsDir },
        { name: 'Create test workflow', fn: createTestWorkflow },
        { name: 'Create coverage workflow', fn: createCoverageWorkflow },
        { name: 'Create .nycrc.json config', fn: createNycConfig },
        { name: 'Update package.json scripts', fn: updatePackageJson }
      ];

      let allSuccess = true;
      for (const step of steps) {
        try {
          const result = step.fn();
          if (!result) {
            warn(`Failed: ${step.name}`);
            allSuccess = false;
          }
        } catch (error) {
          const context = createErrorContext('setup-ci-pipeline.js', `executing ${step.name}`, {});
          logErrorWithContext(error, context);
          allSuccess = false;
        }
      }

      if (allSuccess) {
        success(dryRun ? '\n[DRY-RUN] Would complete CI/CD setup' : '\n✅ CI/CD Pipeline initialized!\n');
        showQuickStart();
        process.exit(0);
      } else {
        warn('\n⚠️  Some setup steps failed. Please review errors above.');
        process.exit(1);
      }
    } else if (process.argv.includes('--validate')) {
      const isValid = validateSetup();
      process.exit(isValid ? 0 : 1);
    } else {
      // Default: show usage
      console.log(`Usage: node scripts/setup-ci-pipeline.js [OPTIONS]

Options:
  --init       Initialize CI/CD pipeline with GitHub Actions
  --validate   Validate existing CI/CD setup
  --dry-run    Preview changes without writing files
  --help       Show this help message

Examples:
  node scripts/setup-ci-pipeline.js --init
  node scripts/setup-ci-pipeline.js --validate
  node scripts/setup-ci-pipeline.js --init --dry-run
`);
      process.exit(0);
    }
  } catch (error) {
    const context = createErrorContext('setup-ci-pipeline.js', 'main execution', {
      argv: process.argv.slice(2)
    });
    logErrorWithContext(error, context);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  const context = createErrorContext('setup-ci-pipeline.js', 'unhandled promise rejection', {
    promise: String(promise),
    reason: String(reason)
  });
  logErrorWithContext(new Error(String(reason)), context);
  process.exit(1);
});

main();
