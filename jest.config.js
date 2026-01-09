module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Test patterns - match all .test.js files
  testMatch: [
    '**/tests/**/*.test.js',
  ],
  
  // Ignore archived test files that are superseded by later phases
  // Must use path segments that match filesystem paths
  testPathIgnorePatterns: ['/node_modules/', '/dashboard/', '/coverage/', 'tests/_archive'],

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

  // Coverage thresholds - Set realistically for current state (0.52%)
  // Will be increased as coverage improves with new tests
  // Current baseline: Statements 0.52% | Branches 0.06% | Functions 0.33% | Lines 0.54%
  coverageThreshold: {
    global: {
      branches: 0,      // Current: 0.06% - No threshold until more tests added
      functions: 0,     // Current: 0.33% - No threshold until more tests added
      lines: 0,         // Current: 0.54% - No threshold until more tests added
      statements: 0,    // Current: 0.52% - No threshold until more tests added
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
  // Enabled to catch async operations that keep running after tests finish
  detectOpenHandles: true,

  // Transform files
  transform: {
    '^.+\\.js$': 'babel-jest',
  },


  // Coverage path ignore patterns
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/', '/dashboard/', '/coverage/'],
};
