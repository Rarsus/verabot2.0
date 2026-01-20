/**
 * ESLint Configuration for VeraBot Dashboard
 * Configured for ES Modules
 */

export default [
  {
    ignores: ['node_modules/', 'coverage/', 'dist/', '.git/'],
  },
  {
    files: ['src/**/*.js', 'tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'prefer-const': 'error',
      'semi': ['error', 'always'],
      'no-trailing-spaces': 'error',
    },
  },
];
