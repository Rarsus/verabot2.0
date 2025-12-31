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
      '.husky/**',
      '.github/**',
      '.vscode/**',
      'data/**',
      'logs/**',
      'website/**'
    ]
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
        clearImmediate: 'readonly'
      }
    },
    plugins: {
      security
    },
    rules: {
      // Core ESLint Rules
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'indent': ['error', 2, { SwitchCase: 1 }],
      'comma-dangle': ['error', 'never'],
      'no-trailing-spaces': 'error',
      'eol-last': ['error', 'always'],
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 0 }],

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
      'complexity': ['warn', 15],
      'max-depth': ['warn', 4],
      'max-lines-per-function': ['warn', { max: 150, skipBlankLines: true, skipComments: true }],
      'max-params': ['warn', 5],
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'warn',
      'no-duplicate-imports': 'error',
      'no-unreachable': 'error',
      'no-unused-expressions': 'error',
      'eqeqeq': ['error', 'always'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-return-await': 'warn', // Set to warn as it's often stylistic
      'require-await': 'off', // Disabled as many test mocks don't need await
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error'
    }
  },
  // Test files - more relaxed rules
  {
    files: ['tests/**/*.js'],
    rules: {
      'no-unused-expressions': 'off',
      'max-lines-per-function': 'off',
      'complexity': 'off', // Test files often have complex test scenarios
      'security/detect-object-injection': 'off',
      'security/detect-non-literal-fs-filename': 'off'
    }
  },
  // Script files - relaxed fs and complexity rules
  {
    files: ['scripts/**/*.js'],
    rules: {
      'complexity': 'off', // Scripts often have linear but lengthy logic
      'security/detect-non-literal-fs-filename': 'off', // Scripts use dynamic file paths
      'security/detect-non-literal-require': 'off'
    }
  }
];
