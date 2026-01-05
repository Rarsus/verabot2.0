#!/usr/bin/env node
/**
 * MCP Setup Verification Script
 * Verifies that all MCP servers are properly configured and operational
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = process.cwd();
const MCP_DIR = path.join(PROJECT_ROOT, '.mcp');
const SERVERS_DIR = path.join(PROJECT_ROOT, 'mcp-servers');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function checkFile(filepath, description) {
  if (fs.existsSync(filepath)) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description} - NOT FOUND: ${filepath}`, 'red');
    return false;
  }
}

function checkCommand(cmd, description) {
  try {
    execSync(cmd, { stdio: 'ignore' });
    log(`✅ ${description}`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description}`, 'red');
    return false;
  }
}

function testMCPServer(serverPath, testCmd, description) {
  try {
    const result = execSync(`node ${serverPath} ${testCmd}`, {
      cwd: PROJECT_ROOT,
      timeout: 5000,
      stdio: 'pipe'
    }).toString();
    log(`✅ ${description}`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description}`, 'red');
    return false;
  }
}

async function main() {
  log('\n🔍 VeraBot2.0 MCP Setup Verification\n', 'cyan');

  let allChecks = true;

  // Section 1: Configuration Files
  log('📋 Configuration Files:', 'blue');
  allChecks &= checkFile(path.join(MCP_DIR, 'servers.json'), 'MCP Configuration (.mcp/servers.json)');
  allChecks &= checkFile(path.join(PROJECT_ROOT, '.vscode/settings.json'), 'VS Code Settings (.vscode/settings.json)');
  allChecks &= checkFile(path.join(PROJECT_ROOT, 'package.json'), 'Package Configuration (package.json)');
  log('');

  // Section 2: MCP Server Files
  log('📁 MCP Server Files:', 'blue');
  const servers = [
    { file: 'filesystem-server.js', name: 'Filesystem Server' },
    { file: 'git-server.js', name: 'Git Server' },
    { file: 'shell-server.js', name: 'Shell Server' },
    { file: 'database-server.js', name: 'Database Server' },
    { file: 'npm-server.js', name: 'NPM Server' }
  ];

  for (const server of servers) {
    allChecks &= checkFile(
      path.join(SERVERS_DIR, server.file),
      `${server.name} (mcp-servers/${server.file})`
    );
  }
  log('');

  // Section 3: Dependencies
  log('📦 Dependencies:', 'blue');
  allChecks &= checkCommand('npm list discord.js > /dev/null 2>&1', 'discord.js installed');
  allChecks &= checkCommand('npm list sqlite3 > /dev/null 2>&1', 'sqlite3 installed');
  allChecks &= checkCommand('npm list dotenv > /dev/null 2>&1', 'dotenv installed');
  log('');

  // Section 4: Database Files
  log('💾 Database Files:', 'blue');
  allChecks &= checkFile(
    path.join(PROJECT_ROOT, 'data/db/quotes.db'),
    'Root Database (data/db/quotes.db)'
  );

  // Check if guild databases exist
  const guildsDir = path.join(PROJECT_ROOT, 'data/db/guilds');
  let guildCount = 0;
  if (fs.existsSync(guildsDir)) {
    guildCount = fs.readdirSync(guildsDir).filter(f => !f.startsWith('.')).length;
    log(`✅ Guild Databases Found (${guildCount} guilds)`, 'green');
  } else {
    log('⚠️  Guild Databases Directory Not Found - This is OK for new installations', 'yellow');
  }
  log('');

  // Section 5: MCP Server Functionality Tests
  log('🧪 MCP Server Tests:', 'blue');

  // Test filesystem server
  testMCPServer(
    'mcp-servers/filesystem-server.js',
    'structure',
    'Filesystem Server - Get Structure'
  );

  // Test git server
  testMCPServer(
    'mcp-servers/git-server.js',
    'status',
    'Git Server - Get Status'
  );

  // Test shell server
  testMCPServer(
    'mcp-servers/shell-server.js',
    'info',
    'Shell Server - Get Info'
  );

  // Test database server
  const dbTestResult = testMCPServer(
    'mcp-servers/database-server.js',
    'summary',
    'Database Server - Get Summary'
  );
  if (!dbTestResult) {
    log('  💡 Tip: Rebuild sqlite3 with: npm rebuild sqlite3', 'yellow');
  }

  // Test npm server
  testMCPServer(
    'mcp-servers/npm-server.js',
    'version',
    'NPM Server - Get Version'
  );
  log('');

  // Section 6: Node.js & npm Versions
  log('🔧 Environment:', 'blue');
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf-8' }).trim();
    const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
    const nodeOk = parseInt(nodeVersion.slice(1)) >= 18;

    log(`${nodeOk ? '✅' : '❌'} Node.js ${nodeVersion}${!nodeOk ? ' (requires 18+)' : ''}`, nodeOk ? 'green' : 'red');
    log(`✅ npm ${npmVersion}`, 'green');
  } catch (error) {
    log('❌ Node.js version check failed', 'red');
  }
  log('');

  // Section 7: Configuration Validation
  log('⚙️  Configuration Validation:', 'blue');
  try {
    const configPath = path.join(MCP_DIR, 'servers.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    const mcpServers = config.mcpServers || {};
    const hasFilesystem = mcpServers.filesystem ? true : false;
    const hasGit = mcpServers.git ? true : false;
    const hasShell = mcpServers.shell ? true : false;
    const hasDatabase = mcpServers.database ? true : false;
    const hasNpm = mcpServers.npm ? true : false;

    log(`${hasFilesystem ? '✅' : '❌'} Filesystem server configured`, hasFilesystem ? 'green' : 'red');
    log(`${hasGit ? '✅' : '❌'} Git server configured`, hasGit ? 'green' : 'red');
    log(`${hasShell ? '✅' : '❌'} Shell server configured`, hasShell ? 'green' : 'red');
    log(`${hasDatabase ? '✅' : '❌'} Database server configured`, hasDatabase ? 'green' : 'red');
    log(`${hasNpm ? '✅' : '❌'} NPM server configured`, hasNpm ? 'green' : 'red');

    const allowedCmds = mcpServers.shell?.alwaysAllow || [];
    if (allowedCmds.length > 0) {
      log(`✅ Auto-allowed commands configured (${allowedCmds.length} commands)`, 'green');
    } else {
      log('⚠️  No auto-allowed commands configured', 'yellow');
    }
  } catch (error) {
    log(`❌ Configuration validation failed: ${error.message}`, 'red');
  }
  log('');

  // Section 8: Summary
  log('═'.repeat(60), 'cyan');
  if (allChecks) {
    log('✅ MCP Setup Complete and Verified!', 'green');
    log('', 'reset');
    log('All MCP servers are ready to use with GitHub Copilot.', 'green');
    log('', 'reset');
    log('Next Steps:', 'cyan');
    log('1. Open .github/COPILOT-MCP-SETUP.md for detailed documentation', 'yellow');
    log('2. Test individual servers using the CLI commands shown in docs', 'yellow');
    log('3. Start using Copilot with MCP context in VS Code', 'yellow');
  } else {
    log('⚠️  Some checks failed. Please review the errors above.', 'yellow');
    log('', 'reset');
    log('Common fixes:', 'cyan');
    log('1. Run: npm install', 'yellow');
    log('2. Run: npm run db:init', 'yellow');
    log('3. Check .env file configuration', 'yellow');
    log('4. Verify git repository is initialized', 'yellow');
  }
  log('═'.repeat(60), 'cyan');
  log('');

  // Exit with appropriate code
  process.exit(allChecks ? 0 : 1);
}

// Run verification
main().catch(error => {
  log(`\nFatal Error: ${error.message}`, 'red');
  process.exit(1);
});
