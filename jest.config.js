module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Test patterns - match all .test.js files
  testMatch: [
    '**/tests/**/*.test.js',
  ],
  
  // Ignore archived test files that are superseded by later phases
  // Must use path segments that match filesystem paths
  testPathIgnorePatterns: ['/node_modules/', '/dashboard/', '/coverage/', 'tests/_archive', 'test-security-integration'],

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

  // Coverage thresholds - Enforce minimum standards
  // Target: 90%+ overall, stricter for critical modules
  coverageThreshold: {
    global: {
      branches: 20,      // Minimum 20% branch coverage
      functions: 35,     // Minimum 35% function coverage
      lines: 25,         // Minimum 25% line coverage
      statements: 25,    // Minimum 25% statement coverage
    },
    './src/middleware/**/*.js': {
      branches: 80,      // Stricter for critical middleware
      functions: 90,     // High coverage for security-related code
      lines: 85,         // Enforce high standards
      statements: 85,
    },
    './src/services/**/*.js': {
      branches: 20,      // Services - baseline coverage
      functions: 35,     // Allow new/developing services
      lines: 25,
      statements: 25,
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
