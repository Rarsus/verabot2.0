#!/usr/bin/env node

/**
 * Checks that Node.js version meets minimum requirements
 * Run before npm install to ensure compatible environment
 */

const version = parseInt(process.version.slice(1));
const required = 18;

if (version < required) {
  console.error(`\n❌ Node.js ${required}+ required, but you have Node ${version}\n`);
  console.error(`Please install Node.js 20+ from https://nodejs.org/\n`);
  console.error('Or if using NVM, run: nvm install && nvm use\n');
  process.exit(1);
}

console.log(`✅ Node.js ${version} - OK\n`);
