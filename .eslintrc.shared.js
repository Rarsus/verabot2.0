#!/usr/bin/env node
/**
 * Shared ESLint Configuration for VeraBot2.0 Project
 * 
 * This file defines shared ESLint rules that are consistent across all repositories
 * in the VeraBot2.0 project. Each submodule should use these rules as a base.
 * 
 * Usage in submodules:
 * 1. Copy this file or reference it from parent
 * 2. Import shared rules in eslint.config.js
 * 3. Override rules as needed for specific module requirements
 */

module.exports = {
  // Shared test file patterns across all repositories
  testFilePatterns: [
    'tests/**/*.js',
    '**/tests/**/*.js',
    '**/*.test.js',
    '**/*.spec.js',
  ],

  // Test-related ESLint rule exceptions
  // Applied to all test files across all repositories
  testRuleExceptions: {
    'no-unused-expressions': 'off',       // Test assertions often use expressions
    'max-lines-per-function': 'off',      // Test files intentionally exceed limit
    'max-nested-callbacks': 'off',        // describe/it blocks are deeply nested
    'max-depth': 'off',                   // Test setup can be deeply nested
    'complexity': 'off',                  // Test scenarios are intentionally complex
    'security/detect-object-injection': 'off',           // Test mocks bypass security
    'security/detect-non-literal-fs-filename': 'off',    // Test fixtures use dynamic paths
    'security/detect-unsafe-regex': 'off',               // Test patterns are safe
    'security/detect-possible-timing-attacks': 'off',    // Test assertions don't matter
    'no-return-await': 'off',             // Test mocks need await for consistency
    'no-unused-vars': 'off',              // Mock parameters intentionally unused
  },

  // Core ESLint rules applied to all non-test files
  coreRules: {
    // Strict equality
    'eqeqeq': ['error', 'always'],
    
    // No eval
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    
    // Console allowed for development
    'no-console': 'off',
    
    // Unused variables (allow intentional with leading underscore)
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    
    // Function complexity
    'complexity': ['warn', 18],
  },

  // Security rules applied to all files (more lenient in tests)
  securityRules: {
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-fs-filename': 'warn',
    'security/detect-unsafe-regex': 'warn',
  },

  // Globals for all Node.js modules
  nodeGlobals: {
    __dirname: 'readonly',
    __filename: 'readonly',
    Buffer: 'readonly',
    console: 'readonly',
    exports: 'writable',
    global: 'readonly',
    module: 'readonly',
    process: 'readonly',
    require: 'readonly',
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
    setInterval: 'readonly',
    clearInterval: 'readonly',
    setImmediate: 'readonly',
    clearImmediate: 'readonly',
  },

  // Globals for test files
  testGlobals: {
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
  },
};
