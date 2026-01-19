#!/usr/bin/env node

/**
 * Consolidated Validator Script
 * Phase 3: Scripts Consolidation
 * Merges: validate-commands.js + run-tests.js
 * 
 * Validates command file structure and runs tests
 * Updated to work with modern CommandBase patterns
 * 
 * Usage:
 *   node scripts/validate-commands.js [--commands|--test|--lint|--all]
 *   npm run validate:commands         - Validate commands only
 *   npm run test                      - Run tests via Jest
 *   npm run validate                  - Full validation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const utils = require('./lib/utils');

const { header, subheader, success, error } = utils;

// Parse command line arguments
const mode = process.argv[2] || '--commands';
const verbose = process.argv.includes('--verbose');
const quiet = process.argv.includes('--quiet');

const commandsPath = path.join(__dirname, '..', 'src', 'commands');

// ============================================================================
// COMMAND VALIDATION (from validate-commands.js)
// ============================================================================

/**
 * Recursively find all command files
 */
function findCommandFiles(dir) {
  let files = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files = files.concat(findCommandFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.js') && !entry.name.startsWith('.')) {
        files.push(fullPath);
      }
    }
  } catch (err) {
    console.error(error(`Failed to scan directory: ${dir}`));
    console.error(err.message);
  }
  return files;
}

/**
 * Validate a single command file
 */
function validateCommand(filePath) {
  const relativePath = path.relative(commandsPath, filePath);

  try {
    // Load the command
    let cmd;
    try {
      delete require.cache[require.resolve(filePath)];
      cmd = require(filePath);
    } catch (err) {
      return {
        file: relativePath,
        valid: false,
        error: `Failed to load: ${err.message}`,
      };
    }

    if (!cmd || typeof cmd !== 'object') {
      return {
        file: relativePath,
        valid: false,
        error: 'Does not export an object',
      };
    }

    // Check for modern pattern: registered command
    const hasRegister = typeof cmd.register === 'function';
    const hasName = typeof cmd.name === 'string' && cmd.name.length > 0;
    const hasDescription = typeof cmd.description === 'string';
    const hasExecute = typeof cmd.execute === 'function';
    const hasInteraction = typeof cmd.executeInteraction === 'function';

    // Check for CommandBase methods
    const hasCommandBaseMethods = hasExecute || hasInteraction;
    const hasSlashCommand = typeof cmd.data === 'object' && typeof cmd.data.setName === 'function';

    // Validations
    const checks = {
      'Has name': { pass: hasName, critical: true },
      'Has description': { pass: hasDescription, critical: false },
      'Has execute or executeInteraction': { pass: hasCommandBaseMethods, critical: true },
      'Has slash command data': { pass: hasSlashCommand, critical: false },
      'Properly registered': { pass: hasRegister, critical: false },
    };

    const failed = Object.entries(checks)
      .filter(([, check]) => !check.pass && check.critical)
      .map(([name]) => name);

    if (failed.length > 0) {
      return {
        file: relativePath,
        valid: false,
        error: `Missing: ${failed.join(', ')}`,
        checks,
      };
    }

    // Get command type
    const type = hasSlashCommand ? 'slash' : 'prefix';

    return {
      file: relativePath,
      valid: true,
      name: cmd.name,
      type,
      checks,
    };
  } catch (err) {
    return {
      file: relativePath,
      valid: false,
      error: err.message,
    };
  }
}

/**
 * Validate commands
 */
function validateCommands() {
  console.log(header('Command Validation Report'));

  // Check if commands directory exists
  if (!fs.existsSync(commandsPath)) {
    console.error(error(`Commands directory not found: ${commandsPath}`));
    return false;
  }

  console.log(`Scanning: ${commandsPath}\n`);

  // Find all command files
  const files = findCommandFiles(commandsPath);

  if (files.length === 0) {
    console.error(error('No command files found'));
    return false;
  }

  console.log(`Found ${files.length} command file(s)\n`);

  // Validate each command
  const results = files.map((file) => validateCommand(file));

  // Separate valid and invalid
  const valid = results.filter((r) => r.valid);
  const invalid = results.filter((r) => !r.valid);

  // Display results
  console.log(subheader(`Valid Commands (${valid.length}/${files.length})`));
  if (valid.length > 0) {
    const validTable = valid.map((v) => ({
      command: v.name || '?',
      type: v.type || 'unknown',
      file: v.file,
    }));
    console.log(utils.formatTable(validTable, ['command', 'type', 'file']));
  } else {
    console.log('  (none)');
  }

  if (invalid.length > 0) {
    console.log(subheader(`Invalid Commands (${invalid.length})`));
    invalid.forEach((inv) => {
      console.log(`\n  ${error(inv.file)}`);
      console.log(`    Error: ${inv.error}`);
      if (inv.checks) {
        Object.entries(inv.checks).forEach(([name, check]) => {
          const status = check.pass ? success('✓') : error('✗');
          const critical = check.critical ? ' [critical]' : '';
          console.log(`      ${status} ${name}${critical}`);
        });
      }
    });
  }

  // Summary
  console.log(subheader('Summary'));
  if (invalid.length === 0) {
    console.log(success(`All ${valid.length} command(s) are valid`));
    return true;
  } else {
    console.log(error(`Validation failed: ${invalid.length} command(s) have errors`));
    return false;
  }
}

// ============================================================================
// TEST RUNNING (from run-tests.js)
// ============================================================================

/**
 * Run Jest tests
 */
function runTests() {
  console.log(header('Running Test Suite'));
  try {
    const cmd = verbose ? 'npm run test:verbose' : 'npm test';
    execSync(cmd, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(error(`Test suite failed`));
    return false;
  }
}

/**
 * Run ESLint
 */
function runLint() {
  console.log(header('Running ESLint'));
  try {
    execSync('npm run lint', { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(error(`Linting failed`));
    return false;
  }
}

// ============================================================================
// MODE HANDLERS
// ============================================================================

/**
 * Show help
 */
function showHelp() {
  console.log(`
${utils.header('Consolidated Validator Script')}

Usage: node scripts/validate-commands.js [MODE]

Modes:
  --commands    Validate command files only (default)
  --test        Run test suite
  --lint        Run ESLint
  --all         Run all validations
  --help, -h    Show this help

npm Scripts:
  npm run validate:commands   - Validate commands
  npm test                    - Run tests
  npm run validate            - Run all validations

Options:
  --verbose     Show detailed output
  --quiet       Suppress non-error output

Examples:
  npm run validate:commands
  node scripts/validate-commands.js --test --verbose
  npm run validate
`);
}

/**
 * Main entry point
 */
function main() {
  let allPass = true;

  try {
    switch (mode) {
      case '--commands':
        allPass = validateCommands();
        break;
      case '--test':
        allPass = runTests();
        break;
      case '--lint':
        allPass = runLint();
        break;
      case '--all':
        allPass = validateCommands() && runTests() && runLint();
        break;
      case '--help':
      case '-h':
        showHelp();
        return;
      default:
        console.error(error(`Unknown mode: ${mode}`));
        showHelp();
        process.exit(1);
    }

    process.exit(allPass ? 0 : 1);
  } catch (err) {
    console.error(error(`Fatal error: ${err.message}`));
    process.exit(1);
  }
}

main();
