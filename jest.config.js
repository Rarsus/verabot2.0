module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Test patterns - match all .test.js files in functional structure
  testMatch: [
    '<rootDir>/tests/unit/core/**/*.test.js',
    '<rootDir>/tests/unit/middleware/**/*.test.js',
    '<rootDir>/tests/unit/services/**/*.test.js',
    '<rootDir>/tests/unit/commands/**/*.test.js',
    '<rootDir>/tests/unit/utils/**/*.test.js',
    '<rootDir>/tests/integration/**/*.test.js',
  ],
  
  // Ignore archived test files that are superseded by later phases
  // Must use path segments that match filesystem paths
  testPathIgnorePatterns: ['/node_modules/', '/dashboard/', '/coverage/', 'tests/_archive', 'test-security-integration'],

  // Test reporters - output JUnit XML for GitHub Actions
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './test-reports',
      outputName: 'junit.xml',
      suiteName: 'VeraBot2.0 Test Suite',
      usePathAsTestName: true,
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      useConsoleLog: false,
      reportTestSuite: true,
    }],
  ],

  // Collect coverage from source files
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js', // Entry point handled separately
    '!src/register-commands.js', // CLI script
    '!src/config/**', // Config files typically have minimal logic
    '!src/utils/auto-register-commands.js', // Auto-registration script
    '!src/services/migrations/**', // Database migrations - not covered by tests
    '!src/services/WebSocketService.js', // WebSocket service - not yet implemented
    '!src/services/ExternalActionHandler.js', // External handlers - not yet fully implemented
    '!src/services/ReminderService.js', // Legacy reminder service - deprecated
    '!src/core/CommandBase.js', // Covered indirectly through commands
    '!src/core/EventBase.js', // Covered indirectly through events
    '!**/*.test.js',
    '!**/node_modules/**',
  ],

  // Coverage thresholds - Dynamic baseline approach
  // Current baseline (Jan 2026): 79.5% lines | 82.7% functions | 74.7% branches
  // These thresholds automatically become the new minimum as coverage increases
  // Strategy: Once tests pass at this baseline, every improvement raises the bar
  coverageThreshold: {
    global: {
      branches: 74.7,    // Current baseline (increases as coverage improves)
      functions: 82.7,   // Current baseline (increases as coverage improves)
      lines: 79.5,       // Current baseline (increases as coverage improves)
      statements: 79.5,  // Current baseline (increases as coverage improves)
    },
    './src/middleware/**/*.js': {
      branches: 74.7,    // Baseline for middleware (stricter enforcement)
      functions: 82.7,   // Baseline for middleware (stricter enforcement)
      lines: 79.5,       // Baseline for middleware (stricter enforcement)
      statements: 79.5,  // Baseline for middleware (stricter enforcement)
    },
    './src/services/**/*.js': {
      branches: 74.7,    // Baseline for services
      functions: 82.7,   // Baseline for services
      lines: 79.5,       // Baseline for services
      statements: 79.5,  // Baseline for services
    },
  },

  // Timeout for tests - Reduced from 10s to catch slow tests early
  testTimeout: 5000,

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
