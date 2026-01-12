/**
 * Phase 19b: Dashboard Authentication Middleware Comprehensive Coverage
 * Tests for JWT token verification and admin permission checks
 */

const assert = require('assert');
const jwt = require('jsonwebtoken');
const dashboardAuth = require('../../src/middleware/dashboard-auth');

describe('Dashboard Auth Middleware', () => {
  let middleware;
  let mockReq;
  let mockRes;
  let nextCalled;
  let statusCode;
  let responseData;

  beforeEach(() => {
    middleware = dashboardAuth;
    nextCalled = false;
    statusCode = null;
    responseData = null;

    mockReq = {
      headers: {},
    };

    mockRes = {
      status: function (code) {
        statusCode = code;
        return this;
      },
      json: function (data) {
        responseData = data;
        return this;
      },
    };
  });

  describe('DashboardAuthMiddleware - Initialization', () => {
    it('should have jwtSecret initialized', () => {
      assert.ok(middleware.jwtSecret);
      assert.strictEqual(typeof middleware.jwtSecret, 'string');
    });

    it('should have botApiToken property', () => {
      // The singleton instance should have the property defined
      assert.ok('botApiToken' in middleware);
    });

    it('should use SESSION_SECRET from environment when available', () => {
      // The singleton is already initialized, just verify it has a secret
      assert.ok(middleware.jwtSecret);
      assert.strictEqual(typeof middleware.jwtSecret, 'string');
    });

    it('should use default secret if SESSION_SECRET not set', () => {
      const originalSecret = process.env.SESSION_SECRET;
      delete process.env.SESSION_SECRET;

      // Re-require to get fresh instance
      delete require.cache[require.resolve('../../src/middleware/dashboard-auth')];
      const testMiddleware = require('../../src/middleware/dashboard-auth');
      assert.strictEqual(testMiddleware.jwtSecret, 'your-secret-key-change-in-production');

      process.env.SESSION_SECRET = originalSecret;
      delete require.cache[require.resolve('../../src/middleware/dashboard-auth')];
    });

    it('should have verifyToken method', () => {
      assert.ok(typeof middleware.verifyToken === 'function');
    });

    it('should have verifyBotToken method', () => {
      assert.ok(typeof middleware.verifyBotToken === 'function');
    });

    it('should have checkAdminPermission method', () => {
      assert.ok(typeof middleware.checkAdminPermission === 'function');
    });

    it('should have logAccess method', () => {
      assert.ok(typeof middleware.logAccess === 'function');
    });
  });

  describe('verifyToken() - Valid Tokens', () => {
    it('should verify valid JWT token', (done) => {
      const token = jwt.sign(
        { userId: 'user123', username: 'testuser', discriminator: '0001', avatar: 'avatar.png' },
        middleware.jwtSecret
      );

      mockReq.headers.authorization = `Bearer ${token}`;

      middleware.verifyToken(mockReq, mockRes, () => {
        nextCalled = true;
        done();
      });

      assert.ok(nextCalled);
    });

    it('should attach user info to request for valid token', (done) => {
      const userData = { userId: 'user123', username: 'testuser', discriminator: '0001', avatar: 'avatar.png' };
      const token = jwt.sign(userData, middleware.jwtSecret);

      mockReq.headers.authorization = `Bearer ${token}`;

      middleware.verifyToken(mockReq, mockRes, () => {
        assert.strictEqual(mockReq.dashboardUser.userId, 'user123');
        assert.strictEqual(mockReq.dashboardUser.username, 'testuser');
        assert.strictEqual(mockReq.dashboardUser.discriminator, '0001');
        assert.strictEqual(mockReq.dashboardUser.avatar, 'avatar.png');
        done();
      });
    });

    it('should preserve all user fields from token', (done) => {
      const userData = {
        userId: 'user456',
        username: 'anotheruser',
        discriminator: '0002',
        avatar: 'other.png',
      };
      const token = jwt.sign(userData, middleware.jwtSecret);

      mockReq.headers.authorization = `Bearer ${token}`;

      middleware.verifyToken(mockReq, mockRes, () => {
        const user = mockReq.dashboardUser;
        assert.strictEqual(user.userId, userData.userId);
        assert.strictEqual(user.username, userData.username);
        assert.strictEqual(user.discriminator, userData.discriminator);
        assert.strictEqual(user.avatar, userData.avatar);
        done();
      });
    });

    it('should call next() for valid token', (done) => {
      const token = jwt.sign({ userId: 'user123', username: 'test' }, middleware.jwtSecret);

      mockReq.headers.authorization = `Bearer ${token}`;

      middleware.verifyToken(mockReq, mockRes, () => {
        nextCalled = true;
        done();
      });
    });
  });

  describe('verifyToken() - Missing Token', () => {
    it('should reject request without authorization header', () => {
      mockReq.headers = {};

      middleware.verifyToken(mockReq, mockRes, () => {
        nextCalled = true;
      });

      assert.strictEqual(statusCode, 401);
      assert.strictEqual(responseData.success, false);
      assert.ok(responseData.error.includes('No authentication token'));
      assert.strictEqual(nextCalled, false);
    });

    it('should reject request with null authorization header', () => {
      mockReq.headers.authorization = null;

      middleware.verifyToken(mockReq, mockRes, () => {
        nextCalled = true;
      });

      assert.strictEqual(statusCode, 401);
      assert.strictEqual(nextCalled, false);
    });

    it('should reject request with undefined authorization header', () => {
      mockReq.headers.authorization = undefined;

      middleware.verifyToken(mockReq, mockRes, () => {
        nextCalled = true;
      });

      assert.strictEqual(statusCode, 401);
      assert.strictEqual(nextCalled, false);
    });

    it('should reject request with empty authorization header', () => {
      mockReq.headers.authorization = '';

      middleware.verifyToken(mockReq, mockRes, () => {
        nextCalled = true;
      });

      assert.strictEqual(statusCode, 401);
      assert.strictEqual(nextCalled, false);
    });
  });

  describe('verifyToken() - Invalid Token Format', () => {
    it('should reject authorization header without Bearer prefix', () => {
      mockReq.headers.authorization = 'not_a_bearer_token';

      middleware.verifyToken(mockReq, mockRes, () => {
        nextCalled = true;
      });

      assert.strictEqual(statusCode, 401);
      assert.strictEqual(nextCalled, false);
    });

    it('should reject authorization header with different prefix', () => {
      mockReq.headers.authorization = 'Basic dXNlcjpwYXNz';

      middleware.verifyToken(mockReq, mockRes, () => {
        nextCalled = true;
      });

      assert.strictEqual(statusCode, 401);
      assert.strictEqual(nextCalled, false);
    });

    it('should reject malformed Bearer token', () => {
      mockReq.headers.authorization = 'Bearer malformed-token-not-jwt';

      middleware.verifyToken(mockReq, mockRes, () => {
        nextCalled = true;
      });

      assert.strictEqual(statusCode, 401);
      assert.strictEqual(nextCalled, false);
    });

    it('should reject token with wrong secret', () => {
      const token = jwt.sign({ userId: 'user123' }, 'different-secret');

      mockReq.headers.authorization = `Bearer ${token}`;

      middleware.verifyToken(mockReq, mockRes, () => {
        nextCalled = true;
      });

      assert.strictEqual(statusCode, 401);
      assert.strictEqual(nextCalled, false);
    });

    it('should reject expired token', () => {
      const token = jwt.sign({ userId: 'user123' }, middleware.jwtSecret, { expiresIn: '0s' });

      // Wait briefly to ensure token is expired
      setTimeout(() => {
        mockReq.headers.authorization = `Bearer ${token}`;

        middleware.verifyToken(mockReq, mockRes, () => {
          nextCalled = true;
        });

        assert.strictEqual(statusCode, 401);
        assert.strictEqual(nextCalled, false);
      }, 10);
    });
  });

  describe('verifyBotToken() - Valid Tokens', () => {
    beforeEach(() => {
      process.env.BOT_API_TOKEN = 'valid-api-token-12345';
      middleware.botApiToken = process.env.BOT_API_TOKEN;
    });

    afterEach(() => {
      delete process.env.BOT_API_TOKEN;
    });

    it('should verify valid bot API token', (done) => {
      mockReq.headers.authorization = 'Bearer valid-api-token-12345';

      middleware.verifyBotToken(mockReq, mockRes, () => {
        nextCalled = true;
        done();
      });

      assert.ok(nextCalled);
    });

    it('should call next() for valid bot token', (done) => {
      mockReq.headers.authorization = 'Bearer valid-api-token-12345';

      middleware.verifyBotToken(mockReq, mockRes, () => {
        nextCalled = true;
        done();
      });
    });

    it('should work without BOT_API_TOKEN set', (done) => {
      middleware.botApiToken = null;

      mockReq.headers.authorization = 'Bearer any-token';

      middleware.verifyBotToken(mockReq, mockRes, () => {
        nextCalled = true;
        done();
      });

      assert.ok(nextCalled);
    });
  });

  describe('verifyBotToken() - Invalid Tokens', () => {
    beforeEach(() => {
      process.env.BOT_API_TOKEN = 'valid-api-token-12345';
      middleware.botApiToken = process.env.BOT_API_TOKEN;
    });

    afterEach(() => {
      delete process.env.BOT_API_TOKEN;
    });

    it('should reject invalid bot token', () => {
      mockReq.headers.authorization = 'Bearer wrong-token';

      middleware.verifyBotToken(mockReq, mockRes, () => {
        nextCalled = true;
      });

      assert.strictEqual(statusCode, 401);
      assert.strictEqual(nextCalled, false);
    });

    it('should reject missing bot token', () => {
      mockReq.headers = {};

      middleware.verifyBotToken(mockReq, mockRes, () => {
        nextCalled = true;
      });

      assert.strictEqual(statusCode, 401);
      assert.strictEqual(nextCalled, false);
    });

    it('should reject authorization without Bearer', () => {
      mockReq.headers.authorization = 'valid-api-token-12345';

      middleware.verifyBotToken(mockReq, mockRes, () => {
        nextCalled = true;
      });

      assert.strictEqual(statusCode, 401);
      assert.strictEqual(nextCalled, false);
    });
  });

  describe('checkAdminPermission() - Return Type', () => {
    it('should return a middleware function', () => {
      const mockClient = { guilds: { cache: new Map() } };
      const middleware_func = middleware.checkAdminPermission(mockClient);

      assert.ok(typeof middleware_func === 'function');
      assert.strictEqual(middleware_func.length, 3); // Should accept (req, res, next)
    });
  });

  describe('checkAdminPermission() - Not Authenticated', () => {
    it('should reject unauthenticated user', async () => {
      const mockClient = { guilds: { cache: new Map() } };
      const middleware_func = middleware.checkAdminPermission(mockClient);

      mockReq.dashboardUser = undefined;

      middleware_func(mockReq, mockRes, () => {
        nextCalled = true;
      });

      assert.strictEqual(statusCode, 401);
      assert.strictEqual(nextCalled, false);
    });

    it('should reject when dashboardUser is null', async () => {
      const mockClient = { guilds: { cache: new Map() } };
      const middleware_func = middleware.checkAdminPermission(mockClient);

      mockReq.dashboardUser = null;

      middleware_func(mockReq, mockRes, () => {
        nextCalled = true;
      });

      assert.strictEqual(statusCode, 401);
      assert.strictEqual(nextCalled, false);
    });
  });

  describe('checkAdminPermission() - Bot Owner', () => {
    it('should allow bot owner', async () => {
      const originalOwnerId = process.env.BOT_OWNER_ID;
      process.env.BOT_OWNER_ID = 'owner-user-123';

      const mockClient = { guilds: { cache: new Map() } };
      const middleware_func = middleware.checkAdminPermission(mockClient);

      mockReq.dashboardUser = { userId: 'owner-user-123', username: 'owner' };

      middleware_func(mockReq, mockRes, () => {
        nextCalled = true;
      });

      assert.ok(nextCalled);
      assert.strictEqual(mockReq.isAdmin, true);

      process.env.BOT_OWNER_ID = originalOwnerId;
    });

    it('should set isAdmin flag for bot owner', async () => {
      process.env.BOT_OWNER_ID = 'owner-user-123';

      const mockClient = { guilds: { cache: new Map() } };
      const middleware_func = middleware.checkAdminPermission(mockClient);

      mockReq.dashboardUser = { userId: 'owner-user-123', username: 'owner' };

      middleware_func(mockReq, mockRes, () => {
        nextCalled = true;
      });

      assert.strictEqual(mockReq.isAdmin, true);

      delete process.env.BOT_OWNER_ID;
    });
  });

  describe('checkAdminPermission() - Guild Admin', () => {
    it('should return async function from checkAdminPermission', () => {
      const mockClient = {
        guilds: {
          cache: new Map(),
        },
      };

      const middleware_func = middleware.checkAdminPermission(mockClient);
      assert.ok(typeof middleware_func === 'function');
    });

    it('should check isAdmin property after permission check', () => {
      const mockClient = {
        guilds: {
          cache: new Map(),
        },
      };

      const middleware_func = middleware.checkAdminPermission(mockClient);
      mockReq.dashboardUser = { userId: 'user-456', username: 'regular-user' };

      // Call the middleware
      middleware_func(mockReq, mockRes, () => {
        nextCalled = true;
      });

      // Should have isAdmin property set
      assert.ok(typeof mockReq.isAdmin === 'boolean');
    });
  });

  describe('checkAdminPermission() - Response', () => {
    it('should set isAdmin property when checking permissions', () => {
      const mockClient = {
        guilds: {
          cache: new Map(),
        },
      };

      const middleware_func = middleware.checkAdminPermission(mockClient);
      mockReq.dashboardUser = { userId: 'user-456', username: 'regular-user' };

      // Call the middleware to set the property
      middleware_func(mockReq, mockRes, () => {
        nextCalled = true;
      });

      // Should have isAdmin property set
      assert.ok(typeof mockReq.isAdmin === 'boolean');
    });
  });

  describe('logAccess() - Access Logging', () => {
    let originalLog;
    let capturedLogs;

    beforeEach(() => {
      capturedLogs = [];
      originalLog = console.log;
      console.log = (...args) => {
        capturedLogs.push(args);
      };
    });

    afterEach(() => {
      console.log = originalLog;
    });

    it('should log dashboard access', () => {
      mockReq.dashboardUser = { userId: 'user-123', username: 'testuser' };
      mockReq.method = 'GET';
      mockReq.path = '/api/quotes';

      middleware.logAccess(mockReq, mockRes, () => {
        nextCalled = true;
      });

      assert.ok(nextCalled);
      assert.strictEqual(capturedLogs.length, 1);
      const logOutput = capturedLogs[0][0];
      assert.ok(logOutput.includes('[Dashboard]'));
      assert.ok(logOutput.includes('testuser'));
      assert.ok(logOutput.includes('GET'));
      assert.ok(logOutput.includes('/api/quotes'));
    });

    it('should log with unknown user if not authenticated', () => {
      mockReq.dashboardUser = undefined;
      mockReq.method = 'POST';
      mockReq.path = '/api/test';

      middleware.logAccess(mockReq, mockRes, () => {
        nextCalled = true;
      });

      assert.ok(nextCalled);
      const logOutput = capturedLogs[0][0];
      assert.ok(logOutput.includes('Unknown'));
    });

    it('should call next middleware', () => {
      mockReq.dashboardUser = { username: 'test' };
      mockReq.method = 'GET';
      mockReq.path = '/api/test';

      middleware.logAccess(mockReq, mockRes, () => {
        nextCalled = true;
      });

      assert.ok(nextCalled);
    });

    it('should include timestamp in log', () => {
      mockReq.dashboardUser = { username: 'test' };
      mockReq.method = 'GET';
      mockReq.path = '/api/test';

      middleware.logAccess(mockReq, mockRes, () => {});

      const logOutput = capturedLogs[0][0];
      assert.ok(logOutput.match(/\d{4}-\d{2}-\d{2}T/)); // ISO date format
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete auth flow: verify token', (done) => {
      const token = jwt.sign({ userId: 'user-123', username: 'testuser' }, middleware.jwtSecret);

      mockReq.headers.authorization = `Bearer ${token}`;

      middleware.verifyToken(mockReq, mockRes, () => {
        assert.strictEqual(mockReq.dashboardUser.userId, 'user-123');
        assert.strictEqual(mockReq.dashboardUser.username, 'testuser');
        done();
      });
    });

    it('should handle multiple requests with different tokens', () => {
      const token1 = jwt.sign({ userId: 'user-1', username: 'user1' }, middleware.jwtSecret);
      const token2 = jwt.sign({ userId: 'user-2', username: 'user2' }, middleware.jwtSecret);

      // Request 1
      mockReq.headers.authorization = `Bearer ${token1}`;
      middleware.verifyToken(mockReq, mockRes, () => {
        assert.strictEqual(mockReq.dashboardUser.userId, 'user-1');
      });

      // Request 2
      mockReq.headers.authorization = `Bearer ${token2}`;
      mockRes.status = function (code) {
        statusCode = code;
        return this;
      };
      middleware.verifyToken(mockReq, mockRes, () => {
        assert.strictEqual(mockReq.dashboardUser.userId, 'user-2');
      });
    });
  });

  describe('Error Handling', () => {
    it('should initialize properly when environment variables not set', () => {
      const originalSecret = process.env.SESSION_SECRET;
      const originalToken = process.env.BOT_API_TOKEN;

      delete process.env.SESSION_SECRET;
      delete process.env.BOT_API_TOKEN;

      // Re-require to get fresh instance
      delete require.cache[require.resolve('../../src/middleware/dashboard-auth')];
      const testMiddleware = require('../../src/middleware/dashboard-auth');
      assert.ok(testMiddleware.jwtSecret);

      process.env.SESSION_SECRET = originalSecret;
      process.env.BOT_API_TOKEN = originalToken;
      delete require.cache[require.resolve('../../src/middleware/dashboard-auth')];
    });

    it('should not throw on invalid JWT', () => {
      mockReq.headers.authorization = 'Bearer invalid.jwt.token';

      assert.doesNotThrow(() => {
        middleware.verifyToken(mockReq, mockRes, () => {
          nextCalled = true;
        });
      });

      assert.strictEqual(statusCode, 401);
    });
  });
});
