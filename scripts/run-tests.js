const fs = require('fs');
const path = require('path');

function fail(msg) {
  console.error('TEST FAILED:', msg);
  process.exit(1);
}

const commandsPath = path.join(__dirname, '..', 'src', 'commands');
if (!fs.existsSync(commandsPath)) fail('commands folder not found');

const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
if (files.length === 0) fail('no command files found');

let ok = true;
for (const file of files) {
  const cmd = require(path.join(commandsPath, file));
  if (!cmd || typeof cmd !== 'object') {
    console.error(file, 'does not export an object'); ok = false; continue;
  }
  if (!cmd.name || typeof cmd.name !== 'string') {
    console.error(file, 'missing string `name` export'); ok = false; continue;
  }
  if (!(typeof cmd.execute === 'function' || typeof cmd.executeInteraction === 'function')) {
    console.error(file, 'must export `execute` or `executeInteraction` function'); ok = false; continue;
  }
}

if (!ok) fail('one or more command files are invalid');

console.log('All command sanity checks passed.');
process.exit(0);
