const fs = require('fs');
const path = require('path');

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

function fail(msg) {
  console.error(`${colors.red}${colors.bold}❌ ERROR:${colors.reset} ${msg}`);
  process.exit(1);
}

function success(msg) {
  console.log(`${colors.green}${colors.bold}✅ ${msg}${colors.reset}`);
}

function warning(msg) {
  console.warn(`${colors.yellow}⚠️  ${msg}${colors.reset}`);
}

function info(msg) {
  console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`);
}

const commandsPath = path.join(__dirname, '..', 'src', 'commands');
if (!fs.existsSync(commandsPath)) fail('commands folder not found');

// Recursively find all command files
function findCommandFiles(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(findCommandFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = findCommandFiles(commandsPath);
if (files.length === 0) fail('no command files found');

info(`Found ${files.length} command file(s) to validate`);

let ok = true;
let validCommands = 0;
const errors = [];

for (const file of files) {
  let cmd;
  try {
    cmd = require(file);
  } catch (error) {
    errors.push(`${path.basename(file)}: Failed to load - ${error.message}`);
    ok = false;
    continue;
  }

  if (!cmd || typeof cmd !== 'object') {
    errors.push(`${path.basename(file)}: Does not export an object`);
    ok = false;
    continue;
  }

  if (!cmd.name || typeof cmd.name !== 'string') {
    errors.push(`${path.basename(file)}: Missing string 'name' export`);
    ok = false;
    continue;
  }

  if (!cmd.description || typeof cmd.description !== 'string') {
    errors.push(`${path.basename(file)}: Missing string 'description' export`);
    ok = false;
    continue;
  }

  if (!(typeof cmd.execute === 'function' || typeof cmd.executeInteraction === 'function')) {
    errors.push(`${path.basename(file)}: Must export 'execute' or 'executeInteraction' function`);
    ok = false;
    continue;
  }

  // Check if command has been properly registered (has register method or is an instance)
  if (typeof cmd.register !== 'function' && !cmd.constructor.name.includes('Command')) {
    warning(`${path.basename(file)}: Should be registered with .register()`);
  }

  validCommands++;
}

// Display results
console.log('\n' + colors.bold + colors.cyan + '📊 Command Validation Report' + colors.reset);
console.log(colors.dim + '='.repeat(60) + colors.reset);

if (errors.length > 0) {
  console.log(`\n${colors.red}${errors.length} error(s) found:${colors.reset}\n`);
  for (const error of errors) {
    console.log(`  ${colors.red}✗${colors.reset} ${error}`);
  }
  console.log('');
} else {
  console.log(`\n${colors.green}✅ All ${validCommands} command(s) are valid${colors.reset}\n`);
}

console.log(colors.dim + '='.repeat(60) + colors.reset + '\n');

if (!ok) fail('one or more command files are invalid');

success(`All command sanity checks passed (${validCommands}/${files.length})`);

// Additional unit tests for small utilities
try {
  const detectReadyEvent = require(path.join(__dirname, '..', 'src', 'detectReadyEvent'));
  const assert = require('assert');

  assert.strictEqual(detectReadyEvent('14.11.0'), 'ready');
  assert.strictEqual(detectReadyEvent('15.0.0'), 'clientReady');
  assert.strictEqual(detectReadyEvent('16.2.3'), 'clientReady');
  assert.strictEqual(detectReadyEvent('not-a-version'), 'clientReady');

  success('Utility tests passed.');
} catch (e) {
  console.error(`${colors.red}${colors.bold}❌ Utility tests failed:${colors.reset}`, e.message);
  process.exit(1);
}

process.exit(0);
