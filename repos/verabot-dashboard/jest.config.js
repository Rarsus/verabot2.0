/**
 * Jest Configuration for VeraBot Dashboard
 */

module.exports = {
  displayName: 'verabot-dashboard',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
  ],
  coverageThreshold: {
    global: {
      lines: 0,
      functions: 0,
      branches: 0,
      statements: 0,
    },
  },
  transform: {},
  testTimeout: 10000,
  setupFilesAfterEnv: [],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
};
