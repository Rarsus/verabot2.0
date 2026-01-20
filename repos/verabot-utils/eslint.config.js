/**
 * ESLint 9 Flat Configuration for verabot-utils
 * Inherits standards from main repo, adjusted for submodule context
 */

const security = require('eslint-plugin-security');

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      'dist/**',
      'build/**',
      '.husky/**',
      '.git/**',
    ],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
      globals: {
        // Node.js globals
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
    },
    plugins: {
      security,
    },
    rules: {
      // Core ESLint Rules
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      // Formatting rules disabled - Prettier handles these
      semi: 'off',
      quotes: 'off',
      indent: 'off',
      'comma-dangle': 'off',
      'no-trailing-spaces': 'off',
      'eol-last': 'off',
      'no-multiple-empty-lines': 'off',
      // Core logic rules
      'no-unreachable': 'error',
      'no-unused-expressions': 'error',
      eqeqeq: ['error', 'always'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',

      // Security Rules
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-unsafe-regex': 'warn',
      'security/detect-buffer-noassert': 'error',
      'security/detect-child-process': 'warn',
      'security/detect-disable-mustache-escape': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-no-csrf-before-method-override': 'error',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-non-literal-require': 'off',
      'security/detect-possible-timing-attacks': 'warn',
      'security/detect-pseudoRandomBytes': 'error',

      // Code Quality Rules
      complexity: ['warn', 18],
      'max-lines-per-function': ['warn', { max: 200, skipBlankLines: true, skipComments: true }],
      'max-depth': ['warn', 5],
      'max-nested-callbacks': ['warn', 3],
      'max-params': ['warn', 5],
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'warn',
      'no-duplicate-imports': 'error',
      'no-return-await': 'warn',
      'require-await': 'off',
    },
  },
  // Test files - disable rules where test structure legitimately requires exception
  // See ESLINT-WARNINGS-ANALYSIS.md for formal acceptance rationale
  {
    files: ['tests/**/*.js'],
    rules: {
      'no-unused-expressions': 'off',
      // FORMALLY ACCEPTED: Test structure requires nesting depth > 3
      // see ESLINT-WARNINGS-ANALYSIS.md section 1a - max-nested-callbacks
      'max-nested-callbacks': 'off',
      // FORMALLY ACCEPTED: Test files intentionally large, future refactoring planned
      // see ESLINT-WARNINGS-ANALYSIS.md section 1b - max-lines-per-function
      'max-lines-per-function': 'off',
      'max-depth': 'off',
      // FORMALLY ACCEPTED: Mock parameters with _ prefix pattern enforced
      // see ESLINT-WARNINGS-ANALYSIS.md section 1c - no-unused-vars
      'no-unused-vars': 'warn',
      complexity: 'off',
      'no-return-await': 'off',
      // FORMALLY ACCEPTED: All test mocking scenarios, no security risk
      // see ESLINT-WARNINGS-ANALYSIS.md section 2a - security/detect-object-injection
      'security/detect-object-injection': 'off',
      // FORMALLY ACCEPTED: Jest teardown uses safe path.join() construction
      // see ESLINT-WARNINGS-ANALYSIS.md section 2b - security/detect-non-literal-fs-filename
      'security/detect-non-literal-fs-filename': 'off',
      'security/detect-unsafe-regex': 'off',
      'security/detect-possible-timing-attacks': 'off',
    },
  },
  // Core files - allow higher complexity for base infrastructure
  {
    files: ['src/core/**/*.js'],
    rules: {
      complexity: ['warn', 25],
      'max-lines-per-function': ['warn', { max: 250, skipBlankLines: true, skipComments: true }],
    },
  },
  // Services - security warnings formally evaluated and accepted where contained
  {
    files: ['src/services/**/*.js'],
    rules: {
      complexity: ['warn', 18],
      'max-lines-per-function': ['warn', { max: 200, skipBlankLines: true, skipComments: true }],
      // FORMALLY ACCEPTED: Internal-only object property access, no untrusted input
      // see ESLINT-WARNINGS-ANALYSIS.md section 2a - security/detect-object-injection
      'security/detect-object-injection': 'warn',
      // FORMALLY ACCEPTED: Safe path construction via path.join() with validated inputs
      // see ESLINT-WARNINGS-ANALYSIS.md section 2b - security/detect-non-literal-fs-filename
      'security/detect-non-literal-fs-filename': 'warn',
    },
  },
  // Middleware and validators - allow slightly higher complexity for validation logic
  {
    files: ['src/middleware/**/*.js'],
    rules: {
      complexity: ['warn', 20],
      'max-lines-per-function': ['warn', { max: 200, skipBlankLines: true, skipComments: true }],
      'security/detect-unsafe-regex': 'off',
      'security/detect-non-literal-fs-filename': 'off',
      'security/detect-object-injection': 'off',
    },
  },
  // Utilities - relax rules for error handling and other utilities
  {
    files: ['src/utils/**/*.js'],
    rules: {
      complexity: ['warn', 20],
      'security/detect-object-injection': 'off',
      'security/detect-non-literal-fs-filename': 'off',
    },
  },
  // Database files - allow higher complexity for connection handling
  {
    files: ['src/database/**/*.js'],
    rules: {
      complexity: ['warn', 20],
      'max-lines-per-function': ['warn', { max: 250, skipBlankLines: true, skipComments: true }],
      'security/detect-non-literal-fs-filename': 'off',
    },
  },
  // Scripts folder - warning only, not production code
  {
    files: ['scripts/**/*.js'],
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      complexity: 'warn',
      'max-lines-per-function': 'off',
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-non-literal-regexp': 'warn',
    },
  },
];
