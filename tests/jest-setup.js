/**
 * Jest Test Utilities
 * Helper functions for common testing patterns
 */

/**
 * Create a mock Discord interaction object
 */
function createMockInteraction(overrides = {}) {
  return {
    user: { id: 'test-user-123', username: 'TestUser' },
    guildId: 'test-guild-456',
    channelId: 'test-channel-789',
    reply: jest.fn(async (msg) => ({ id: 'msg-123', ...msg })),
    deferReply: jest.fn(async () => ({})),
    editReply: jest.fn(async (msg) => ({ id: 'msg-123', ...msg })),
    followUp: jest.fn(async (msg) => ({ id: 'msg-456', ...msg })),
    isRepliable: () => true,
    ...overrides
  };
}

/**
 * Create a mock Discord message object
 */
function createMockMessage(overrides = {}) {
  return {
    id: 'msg-123',
    content: 'Test message',
    author: { id: 'user-123', username: 'TestUser' },
    guild: { id: 'guild-456' },
    channel: { id: 'channel-789', send: jest.fn(async (msg) => ({ id: 'reply-123', ...msg })) },
    reply: jest.fn(async (msg) => ({ id: 'reply-123', ...msg })),
    ...overrides
  };
}

/**
 * Create a mock database connection
 */
function createMockDatabase(overrides = {}) {
  return {
    run: jest.fn((sql, params, callback) => {
      if (callback) callback.call({ lastID: 1, changes: 1 });
      return { lastID: 1, changes: 1 };
    }),
    get: jest.fn((sql, params, callback) => {
      if (callback) callback(null, { id: 1, data: 'test' });
      return { id: 1, data: 'test' };
    }),
    all: jest.fn((sql, params, callback) => {
      if (callback) callback(null, [{ id: 1, data: 'test' }]);
      return [{ id: 1, data: 'test' }];
    }),
    prepare: jest.fn((_sql) => ({
      run: jest.fn(),
      get: jest.fn(),
      all: jest.fn(),
      bind: jest.fn()
    })),
    close: jest.fn((callback) => {
      if (callback) callback();
    }),
    ...overrides
  };
}

/**
 * Assert error thrown
 */
function expectError(fn, errorPattern) {
  expect(fn).toThrow();
  if (errorPattern) {
    expect(fn).toThrow(errorPattern);
  }
}

/**
 * Assert error async function
 */
async function expectAsync(fn, shouldThrow = true) {
  try {
    await fn();
    if (shouldThrow) {
      throw new Error('Expected function to throw but it did not');
    }
  } catch (error) {
    if (!shouldThrow) {
      throw error;
    }
  }
}

/**
 * Capture console output for testing logging
 */
function captureConsoleOutput(fn) {
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  const logs = [];

  console.log = jest.fn((...args) => logs.push({ level: 'log', args }));
  console.error = jest.fn((...args) => logs.push({ level: 'error', args }));
  console.warn = jest.fn((...args) => logs.push({ level: 'warn', args }));

  fn();

  console.log = originalLog;
  console.error = originalError;
  console.warn = originalWarn;

  return logs;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a test guild context
 */
function createGuildContext(guildId = 'test-guild-123') {
  return {
    guildId,
    userId: 'test-user-456',
    channelId: 'test-channel-789'
  };
}

module.exports = {
  createMockInteraction,
  createMockMessage,
  createMockDatabase,
  expectError,
  expectAsync,
  captureConsoleOutput,
  sleep,
  createGuildContext
};
