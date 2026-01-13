/**
 * Scripts Utility Module
 * Shared utilities for all scripts in the scripts folder
 * Provides consistent formatting, color output, error handling
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

/**
 * Format percentage with color
 * @param {number} value - Value 0-100
 * @param {number} target - Target threshold
 * @param {boolean} useColor - Use color output
 * @returns {string} Formatted percentage
 */
function formatPercent(value, target = 0, useColor = true) {
  if (value === null || value === undefined) return 'N/A';

  const percent = `${value.toFixed(2)}%`;

  if (!useColor) return percent;

  if (target > 0) {
    if (value >= target) return `${colors.green}${percent}${colors.reset}`;
    if (value >= target * 0.7) return `${colors.yellow}${percent}${colors.reset}`;
    return `${colors.red}${percent}${colors.reset}`;
  }

  return percent;
}

/**
 * Format success message
 * @param {string} text - Message text
 * @returns {string} Formatted message
 */
function success(text) {
  return `${colors.green}✅ ${text}${colors.reset}`;
}

/**
 * Format error message
 * @param {string} text - Message text
 * @returns {string} Formatted message
 */
function error(text) {
  return `${colors.red}❌ ${text}${colors.reset}`;
}

/**
 * Format warning message
 * @param {string} text - Message text
 * @returns {string} Formatted message
 */
function warning(text) {
  return `${colors.yellow}⚠️ ${text}${colors.reset}`;
}

/**
 * Format info message
 * @param {string} text - Message text
 * @returns {string} Formatted message
 */
function info(text) {
  return `${colors.cyan}ℹ️ ${text}${colors.reset}`;
}

/**
 * Format section header
 * @param {string} text - Header text
 * @returns {string} Formatted header
 */
function header(text) {
  const border = '='.repeat(text.length + 4);
  return `\n${colors.bright}${colors.cyan}${border}${colors.reset}\n${colors.bright}${colors.cyan}${text}${colors.reset}\n${colors.bright}${colors.cyan}${border}${colors.reset}\n`;
}

/**
 * Format subheader
 * @param {string} text - Subheader text
 * @returns {string} Formatted subheader
 */
function subheader(text) {
  return `\n${colors.bright}${colors.blue}▸ ${text}${colors.reset}`;
}

/**
 * Read JSON file safely
 * @param {string} filePath - Path to JSON file
 * @param {*} defaultValue - Default value if file not found
 * @returns {*} Parsed JSON or default value
 */
function readJSON(filePath, defaultValue = null) {
  try {
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(error(`Failed to read JSON: ${filePath}`));
    return defaultValue;
  }
}

/**
 * Write JSON file safely
 * @param {string} filePath - Path to JSON file
 * @param {*} data - Data to write
 * @param {number} indent - Indentation spaces
 * @returns {boolean} True if successful
 */
function writeJSON(filePath, data, indent = 2) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, indent), 'utf8');
    return true;
  } catch (err) {
    console.error(error(`Failed to write JSON: ${filePath}`));
    console.error(err.message);
    return false;
  }
}

/**
 * Safely require a module
 * @param {string} modulePath - Path to module
 * @param {*} defaultValue - Default value if require fails
 * @returns {*} Module exports or default value
 */
function safeRequire(modulePath, defaultValue = null) {
  try {
    return require(modulePath);
  } catch (err) {
    if (defaultValue !== null) {
      console.warn(warning(`Failed to load module: ${modulePath}`));
      return defaultValue;
    }
    throw err;
  }
}

/**
 * Run script with error handling
 * @param {string} name - Script name
 * @param {Function} fn - Function to run
 * @param {boolean} exitOnError - Exit process on error
 * @returns {*} Function result
 */
function runScript(name, fn, exitOnError = true) {
  console.log(info(`Running: ${name}`));
  try {
    const result = fn();
    console.log(success(`${name} completed`));
    return result;
  } catch (err) {
    console.error(error(`${name} failed`));
    console.error(err.message);
    if (err.stack) console.error(err.stack);
    if (exitOnError) process.exit(1);
    throw err;
  }
}

/**
 * Execute command and return output
 * @param {string} command - Command to execute
 * @param {Object} options - exec options
 * @returns {Promise<string>} Command output
 */
function execAsync(command, options = {}) {
  return new Promise((resolve, reject) => {
    const { execSync } = require('child_process');
    try {
      const output = execSync(command, {
        encoding: 'utf8',
        stdio: options.stdio || 'pipe',
        ...options,
      });
      resolve(output);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Create a progress bar string
 * @param {number} current - Current value
 * @param {number} total - Total value
 * @param {number} width - Bar width
 * @returns {string} Progress bar
 */
function progressBar(current, total, width = 20) {
  const percent = current / total;
  const filled = Math.round(width * percent);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  const percentage = (percent * 100).toFixed(1);
  return `[${bar}] ${percentage}%`;
}

/**
 * Format table from array of objects
 * @param {Array} rows - Array of objects
 * @param {Array} columns - Column names
 * @returns {string} Formatted table
 */
function formatTable(rows, columns) {
  if (!rows || rows.length === 0) return 'No data';

  // Calculate column widths
  const widths = {};
  columns.forEach((col) => {
    // eslint-disable-next-line security/detect-object-injection
    widths[col] = Math.max(
      col.length,
      // eslint-disable-next-line security/detect-object-injection
      ...rows.map((row) => String(row[col] || '').length),
    );
  });

  // Build header
  // eslint-disable-next-line security/detect-object-injection
  let table = columns.map((col) => col.padEnd(widths[col])).join(' | ');
  table += '\n' + '─'.repeat(table.length);

  // Build rows
  rows.forEach((row) => {
    // eslint-disable-next-line security/detect-object-injection
    const cells = columns.map((col) => String(row[col] || '').padEnd(widths[col]));
    table += '\n' + cells.join(' | ');
  });

  return table;
}

/**
 * Exit with message
 * @param {number} code - Exit code
 * @param {string} message - Exit message
 */
function exit(code, message) {
  if (message) {
    if (code === 0) console.log(success(message));
    else console.error(error(message));
  }
  process.exit(code);
}

/**
 * Check if running in CI environment
 * @returns {boolean} True if in CI
 */
function isCI() {
  return !!(process.env.CI || process.env.GITHUB_ACTIONS || process.env.GITLAB_CI);
}

/**
 * Disable colors if in CI or when --no-color flag is set
 * @returns {boolean} True if colors should be used
 */
function shouldUseColor() {
  if (process.argv.includes('--no-color')) return false;
  if (process.argv.includes('--color')) return true;
  if (isCI()) return false;
  return process.stdout.isTTY !== false;
}

// Disable colors globally if needed
if (!shouldUseColor()) {
  Object.keys(colors).forEach((key) => {
    // eslint-disable-next-line security/detect-object-injection
    colors[key] = '';
  });
}

module.exports = {
  // Color codes
  colors,

  // Formatting functions
  formatPercent,
  success,
  error,
  warning,
  info,
  header,
  subheader,
  progressBar,
  formatTable,

  // File operations
  readJSON,
  writeJSON,

  // Module loading
  safeRequire,

  // Script execution
  runScript,
  execAsync,
  exit,

  // Utilities
  isCI,
  shouldUseColor,
};
