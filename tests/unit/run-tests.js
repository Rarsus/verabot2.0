const fs = require('fs');
const path = require('path');

function fail(msg) {
  console.error('TEST FAILED:', msg);
  process.exit(1);
}

const commandsPath = path.join(__dirname, '..', '..', 'src', 'commands');
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

let ok = true;
for (const file of files) {
  const cmd = require(file);
  if (!cmd || typeof cmd !== 'object') {
    console.error(path.basename(file), 'does not export an object'); ok = false; continue;
  }
  if (!cmd.name || typeof cmd.name !== 'string') {
    console.error(path.basename(file), 'missing string `name` export'); ok = false; continue;
  }
  if (!(typeof cmd.execute === 'function' || typeof cmd.executeInteraction === 'function')) {
    console.error(path.basename(file), 'must export `execute` or `executeInteraction` function'); ok = false; continue;
  }
}

if (!ok) fail('one or more command files are invalid');

console.log('All command sanity checks passed.');
// Additional unit tests for small utilities
try {
  const detectReadyEvent = require(path.join(__dirname, '..', '..', 'src', 'lib', 'detectReadyEvent'));
  const assert = require('assert');

  assert.strictEqual(detectReadyEvent('14.11.0'), 'ready');
  assert.strictEqual(detectReadyEvent('15.0.0'), 'clientReady');
  assert.strictEqual(detectReadyEvent('16.2.3'), 'clientReady');
  assert.strictEqual(detectReadyEvent('not-a-version'), 'clientReady');

  console.log('Utility tests passed.');
} catch (e) {
  console.error('Utility tests failed:', e);
  process.exit(1);
}

process.exit(0);
