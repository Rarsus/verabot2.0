/**
 * ESLint 9 Flat Configuration
 * Enhanced with security rules and code quality checks
 */

const security = require('eslint-plugin-security');

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      'dist/**',
      'build/**',
      'dashboard/**',
      '.husky/**',
      '.github/**',
      '.vscode/**',
      'data/**',
      'logs/**',
      'website/**',
      'src/utils/auto-register-commands.js',
      'src/lib/migration.js',
      'src/migration.js',
      'src/index.js', // Main event handler - complexity is legitimate
      'src/register-commands.js', // Command registration - safe dynamic paths
      'scripts/test-quotes-advanced.js',
      'scripts/test-integration-refactor.js',
      'scripts/validation/check-links.js',
      'scripts/validation/update-badges.js',
      'tests/test-github-actions-scripts.js',
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
      'security/detect-unsafe-regex': 'warn', // Set to warn to avoid false positives
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
      'no-return-await': 'warn', // Set to warn as it's often stylistic
      'require-await': 'off', // Disabled as many test mocks don't need await
    },
  },
  // Test files - more relaxed rules
  {
    files: ['tests/**/*.js', '**/tests/**/*.js', '**/*.test.js'],
    rules: {
      'no-unused-expressions': 'off',
      'max-lines-per-function': 'off',
      'max-nested-callbacks': 'off', // Test files often have deeply nested describe/it blocks
      'max-depth': 'off', // Test setup and assertions can be deeply nested
      complexity: 'off', // Test files often have complex test scenarios
      'security/detect-object-injection': 'off',
      'security/detect-non-literal-fs-filename': 'off',
      'security/detect-unsafe-regex': 'off', // Test patterns are safe
      'security/detect-possible-timing-attacks': 'off', // Test assertions don't have real security impact
      'no-return-await': 'off', // Test mocks may need await for consistency
      'no-unused-vars': 'off', // Tests have many intentionally unused parameters in mocks and catch blocks
    },
  },
  // Command files - allow higher complexity for feature-rich commands
  {
    files: ['src/commands/**/*.js'],
    rules: {
      complexity: ['warn', 30],
      'max-lines-per-function': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-depth': ['warn', 6],
      'security/detect-object-injection': 'off', // Safe in command context
      'security/detect-non-literal-fs-filename': 'off', // Safe in command context
      'security/detect-unsafe-regex': 'off', // Safe in command context
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
  // Core index.js - allow higher complexity for event handler
  {
    files: ['src/index.js'],
    rules: {
      complexity: ['warn', 30],
      'max-lines-per-function': ['warn', { max: 250, skipBlankLines: true, skipComments: true }],
    },
  },
  // Services - allow slightly higher complexity
  {
    files: ['src/services/**/*.js'],
    rules: {
      complexity: ['warn', 18],
      'max-lines-per-function': ['warn', { max: 200, skipBlankLines: true, skipComments: true }],
      'security/detect-object-injection': 'off', // Safe in service context
      'security/detect-non-literal-fs-filename': 'off', // Services can use dynamic paths safely
    },
  },
  // Middleware and validators - allow slightly higher complexity for validation logic
  {
    files: ['src/middleware/**/*.js'],
    rules: {
      complexity: ['warn', 20],
      'max-lines-per-function': ['warn', { max: 200, skipBlankLines: true, skipComments: true }],
      'security/detect-unsafe-regex': 'off', // Validation patterns are safe
      'security/detect-non-literal-fs-filename': 'off', // Validation in middleware is safe
      'security/detect-object-injection': 'off', // Safe in validation context
    },
  },
  // Utilities - relax rules for error handling and other utilities
  {
    files: ['src/utils/**/*.js'],
    rules: {
      complexity: ['warn', 20],
      'security/detect-object-injection': 'off', // Safe in utility context
      'security/detect-non-literal-fs-filename': 'off', // Utilities can use dynamic paths
    },
  },
  // Script files - relaxed fs and complexity rules
  {
    files: ['scripts/**/*.js'],
    rules: {
      complexity: 'off', // Scripts often have linear but lengthy logic
      'security/detect-non-literal-fs-filename': 'off', // Scripts use dynamic file paths
      'security/detect-non-literal-require': 'off',
    },
  },
];
