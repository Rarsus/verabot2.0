/**
 * Shared ESLint Configuration for VeraBot2.0 Project (ESLint 9+)
 * 
 * This file provides shared ESLint rules and patterns for consistency across
 * all repositories in the VeraBot2.0 project using ESLint 9 flat config format.
 * 
 * Usage in submodules:
 * 1. Import this in eslint.config.js: const sharedConfig = require('./path/to/.eslintrc.shared.js');
 * 2. Use helper functions: sharedConfig.createSourceConfig(), sharedConfig.createTestConfig()
 * 3. Merge with submodule-specific rules: module.exports = [..., sharedConfig.createSourceConfig()];
 * 
 * Migration Note:
 * ESLint 9+ uses flat config format (eslint.config.js)
 * Old .eslintrc.json/.eslintrc.js format is deprecated as of ESLint 9
 */

const globals = require('globals');

/**
 * Shared ESLint configuration rules
 * Applies to all source files across all repositories
 */
const baseRules = {
  // Strict equality
  'eqeqeq': ['error', 'always'],
  
  // No eval
  'no-eval': 'error',
  'no-implied-eval': 'error',
  'no-new-func': 'error',
  
  // Console allowed for development (warnings logged)
  'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
  
  // Unused variables (allow intentional with leading underscore)
  'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  
  // Function complexity warning
  'complexity': ['warn', 18],
  
  // Code style consistency
  'no-var': 'error',
  'prefer-const': 'error',
  'curly': 'error',
  'semi': ['error', 'always'],
  'quotes': ['error', 'single', { avoidEscape: true }],
  'indent': ['error', 2],
  'comma-dangle': ['error', 'always-multiline'],
  'no-trailing-spaces': 'error',
  'object-curly-spacing': ['error', 'always'],
};

/**
 * Test file rule exceptions
 * Applied only to test files to allow more flexible testing patterns
 */
const testRuleExceptions = {
  'no-unused-expressions': 'off',                           // Test assertions often use expressions
  'max-lines-per-function': 'off',                          // Test files intentionally exceed limit
  'max-nested-callbacks': 'off',                            // describe/it blocks are deeply nested
  'max-depth': 'off',                                       // Test setup can be deeply nested
  'complexity': 'off',                                      // Test scenarios are intentionally complex
  'no-unused-vars': 'off',                                  // Mock parameters intentionally unused
  'no-return-await': 'off',                                 // Test mocks need await for consistency
  'security/detect-object-injection': 'off',               // Test mocks bypass security
  'security/detect-non-literal-fs-filename': 'off',        // Test fixtures use dynamic paths
  'security/detect-unsafe-regex': 'off',                   // Test patterns are safe
  'security/detect-possible-timing-attacks': 'off',        // Test assertions don't matter
};

/**
 * Security rules
 * Applied to all files (more lenient in tests via testRuleExceptions)
 */
const securityRules = {
  'security/detect-object-injection': 'warn',
  'security/detect-non-literal-fs-filename': 'warn',
  'security/detect-unsafe-regex': 'warn',
};

/**
 * Test file patterns - used to identify test files across all repositories
 */
const testFilePatterns = [
  'tests/**/*.js',
  '**/tests/**/*.js',
  '**/*.test.js',
  '**/*.spec.js',
];

/**
 * Test framework globals
 * Available in test files
 */
const testGlobals = {
  describe: 'readonly',
  it: 'readonly',
  test: 'readonly',
  beforeEach: 'readonly',
  afterEach: 'readonly',
  beforeAll: 'readonly',
  afterAll: 'readonly',
  expect: 'readonly',
  jest: 'readonly',
  assert: 'readonly',
};

/**
 * Export configuration objects for use in submodule eslint.config.js files
 */
module.exports = {
  baseRules,
  testRuleExceptions,
  securityRules,
  testFilePatterns,
  testGlobals,
  nodeGlobals: globals.node,

  /**
   * Helper function: create standard configuration for source files
   * @param {Object} options - Override options
   * @returns {Object} ESLint config object for source files
   */
  createSourceConfig(options = {}) {
    return {
      files: options.files || ['src/**/*.js'],
      languageOptions: {
        ecmaVersion: 2021,
        sourceType: 'commonjs',
        globals: globals.node,
        ...options.languageOptions,
      },
      rules: {
        ...baseRules,
        ...options.rules,
      },
    };
  },

  /**
   * Helper function: create standard configuration for test files
   * @param {Object} options - Override options
   * @returns {Object} ESLint config object for test files
   */
  createTestConfig(options = {}) {
    return {
      files: options.files || testFilePatterns,
      languageOptions: {
        ecmaVersion: 2021,
        sourceType: 'commonjs',
        globals: {
          ...globals.node,
          ...testGlobals,
        },
        ...options.languageOptions,
      },
      rules: {
        ...baseRules,
        ...testRuleExceptions,
        ...options.rules,
      },
    };
  },
};
