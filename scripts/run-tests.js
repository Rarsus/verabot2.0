#!/usr/bin/env node

/**
 * Enhanced Run-Tests Script
 * Validates command files and runs utility tests
 * Now includes error handling utilities and uses modern error context
 * 
 * Usage: node scripts/run-tests.js [--verbose|--quiet]
 */

const fs = require('fs');
const path = require('path');
const { createErrorContext, logErrorWithContext } = require('./lib/error-handler');

// ANSI colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

// Configuration
const verbose = process.argv.includes('--verbose');
const quiet = process.argv.includes('--quiet');

function fail(msg) {
  console.error(`${colors.red}${colors.bold}❌ ERROR:${colors.reset} ${msg}`);
  process.exit(1);
}

function success(msg) {
  if (!quiet) console.log(`${colors.green}${colors.bold}✅ ${msg}${colors.reset}`);
}

function warning(msg) {
  if (!quiet) console.warn(`${colors.yellow}⚠️  ${msg}${colors.reset}`);
}

function info(msg) {
  if (!quiet) console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`);
}

const commandsPath = path.join(__dirname, '..', 'src', 'commands');
if (!fs.existsSync(commandsPath)) fail('commands folder not found');

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
  } catch (error) {
    const context = createErrorContext('run-tests.js', 'finding command files', {
      directory: dir,
    });
    logErrorWithContext(error, context);
    return [];
  }
  return files;
}

/**
 * Validate a single command file
 */
function validateCommand(filePath) {
  const fileName = path.basename(filePath);

  try {
    // Load the command with cache clear to avoid stale modules
    delete require.cache[require.resolve(filePath)];
    const cmd = require(filePath);

    if (!cmd || typeof cmd !== 'object') {
      return { file: fileName, valid: false, error: 'Does not export an object' };
    }

    if (!cmd.name || typeof cmd.name !== 'string') {
      return { file: fileName, valid: false, error: 'Missing string "name" export' };
    }

    if (!cmd.description || typeof cmd.description !== 'string') {
      return { file: fileName, valid: false, error: 'Missing string "description" export' };
    }

    if (!(typeof cmd.execute === 'function' || typeof cmd.executeInteraction === 'function')) {
      return {
        file: fileName,
        valid: false,
        error: 'Must export "execute" or "executeInteraction" function',
      };
    }

    // Check if command has been properly registered (has register method or is an instance)
    if (typeof cmd.register !== 'function' && !cmd.constructor.name.includes('Command')) {
      if (verbose) warning(`${fileName}: Should be registered with .register()`);
    }

    return { file: fileName, valid: true };
  } catch (error) {
    return {
      file: fileName,
      valid: false,
      error: `Failed to load: ${error.message}`,
    };
  }
}

// Find all commands
const files = findCommandFiles(commandsPath);
if (files.length === 0) fail('no command files found');

info(`Found ${files.length} command file(s) to validate`);

// Validate all commands
let validCount = 0;
const errors = [];

for (const file of files) {
  const result = validateCommand(file);
  if (result.valid) {
    validCount++;
    if (verbose) success(`${result.file}`);
  } else {
    errors.push(result);
  }
}

// Display results
if (!quiet) {
  console.log('\n' + colors.bold + colors.cyan + '📊 Command Validation Report' + colors.reset);
  console.log(colors.dim + '='.repeat(60) + colors.reset);
}

if (errors.length > 0) {
  console.log(`\n${colors.red}${errors.length} error(s) found:${colors.reset}\n`);
  for (const err of errors) {
    console.log(`  ${colors.red}✗${colors.reset} ${err.file}: ${err.error}`);
  }
  console.log('');
} else if (!quiet) {
  console.log(`\n${colors.green}✅ All ${validCount} command(s) are valid${colors.reset}\n`);
}

if (!quiet) console.log(colors.dim + '='.repeat(60) + colors.reset + '\n');

if (errors.length > 0) {
  fail(`one or more command files are invalid (${validCount}/${files.length})`);
}

success(`All command sanity checks passed (${validCount}/${files.length})`);

// Additional unit tests for small utilities
if (verbose) info('Running utility tests...');

try {
  const detectReadyEvent = require(path.join(__dirname, '..', 'src', 'detectReadyEvent'));
  const assert = require('assert');

  // Test version detection
  assert.strictEqual(detectReadyEvent('14.11.0'), 'ready');
  assert.strictEqual(detectReadyEvent('15.0.0'), 'clientReady');
  assert.strictEqual(detectReadyEvent('16.2.3'), 'clientReady');
  assert.strictEqual(detectReadyEvent('not-a-version'), 'clientReady');

  success('Utility tests passed.');
} catch (e) {
  const context = createErrorContext('run-tests.js', 'utility tests', {
    utility: 'detectReadyEvent',
  });
  logErrorWithContext(e, context);
  console.error(`${colors.red}${colors.bold}❌ Utility tests failed${colors.reset}`);
  process.exit(1);
}

process.exit(0);

