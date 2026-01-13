#!/usr/bin/env node

/**
 * Command Validation Script
 * Validates command file structure and exports
 * Updated to work with modern CommandBase patterns
 */

const fs = require('fs');
const path = require('path');
const utils = require('./lib/utils');

const { header, subheader, success, error } = utils;

const commandsPath = path.join(__dirname, '..', 'src', 'commands');

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
 * Main validation function
 */
function main() {
  console.log(header('Command Validation Report'));

  // Check if commands directory exists
  if (!fs.existsSync(commandsPath)) {
    console.error(error(`Commands directory not found: ${commandsPath}`));
    process.exit(1);
  }

  console.log(`Scanning: ${commandsPath}\n`);

  // Find all command files
  const files = findCommandFiles(commandsPath);

  if (files.length === 0) {
    console.error(error('No command files found'));
    process.exit(1);
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
    process.exit(0);
  } else {
    console.log(
      error(`Validation failed: ${invalid.length} command(s) have errors`),
    );
    process.exit(1);
  }
}

// Run validation
main();
