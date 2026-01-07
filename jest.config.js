module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Test patterns - only match .test.js files (Jest-native tests)
  testMatch: ['**/tests/**/*.test.js'],

  // Collect coverage from source files
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js', // Entry point handled separately
    '!src/register-commands.js', // CLI script
    '!src/config/**', // Config files typically have minimal logic
    '!src/utils/auto-register-commands.js', // Auto-registration script
    '!**/*.test.js',
    '!**/node_modules/**',
  ],

  // Coverage thresholds - Set realistically for current state
  // Will be increased as coverage improves through Phase 4 testing
  coverageThreshold: {
    global: {
      branches: 15,
      functions: 20,
      lines: 20,
      statements: 20,
    },
  },

  // Coverage directory
  coverageDirectory: 'coverage',

  // Coverage reporters
  coverageReporters: ['text', 'text-summary', 'html', 'json', 'json-summary', 'lcov'],

  // Timeout for tests
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Bail on first test failure (optional, set to false for full run)
  bail: false,

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/jest-setup-hook.js'],

  // Module name mapper for path aliases (if needed)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
  },

  // Force exit after all tests finish (needed for custom tests that call process.exit)
  forceExit: true,

  // Detect open handles (helpful for debugging)
  detectOpenHandles: false,

  // Transform files
  transform: {
    '^.+\\.js$': 'babel-jest',
  },

  // Ignore patterns
  testPathIgnorePatterns: ['/node_modules/', '/dashboard/', '/coverage/'],

  // Coverage path ignore patterns
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/', '/dashboard/', '/coverage/'],
};
