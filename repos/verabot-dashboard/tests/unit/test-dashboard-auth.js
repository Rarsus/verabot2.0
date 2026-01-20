/**
 * Dashboard Auth Middleware Tests
 *
 * Tests for authentication and authorization middleware
 * TDD approach - tests written first
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import dashboardAuthMiddleware from '../../src/middleware/auth.js';
import jwt from 'jsonwebtoken';

describe('Dashboard Auth Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
      dashboardUser: null,
      isAdmin: false,
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe('verifyToken', () => {
    it('should verify valid JWT token', () => {
      const testSecret = 'test-secret';
      process.env.SESSION_SECRET = testSecret;

      const token = jwt.sign(
        {
          userId: 'user-123',
          username: 'testuser',
          discriminator: '1234',
          avatar: 'avatar.png',
        },
        testSecret
      );

      mockReq.headers.authorization = `Bearer ${token}`;

      dashboardAuthMiddleware.verifyToken(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.dashboardUser).not.toBeNull();
      expect(mockReq.dashboardUser.userId).toBe('user-123');
    });

    it('should reject missing authorization header', () => {
      dashboardAuthMiddleware.verifyToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject invalid token', () => {
      mockReq.headers.authorization = 'Bearer invalid.token.here';

      dashboardAuthMiddleware.verifyToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject malformed Authorization header', () => {
      mockReq.headers.authorization = 'InvalidFormat token';

      dashboardAuthMiddleware.verifyToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('verifyBotToken', () => {
    it('should verify valid bot API token', () => {
      process.env.BOT_API_TOKEN = 'test-bot-token';
      mockReq.headers.authorization = 'Bearer test-bot-token';

      dashboardAuthMiddleware.verifyBotToken(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject invalid bot API token', () => {
      process.env.BOT_API_TOKEN = 'test-bot-token';
      mockReq.headers.authorization = 'Bearer wrong-token';

      dashboardAuthMiddleware.verifyBotToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject missing API token', () => {
      dashboardAuthMiddleware.verifyBotToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });

  describe('checkAdminPermission', () => {
    it('should grant access to bot owner', async () => {
      process.env.BOT_OWNER_ID = 'owner-123';
      mockReq.dashboardUser = { userId: 'owner-123' };

      const mockClient = {
        guilds: { cache: new Map() },
      };

      const middleware = dashboardAuthMiddleware.checkAdminPermission(mockClient);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockReq.isAdmin).toBe(true);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject unauthenticated user', async () => {
      mockReq.dashboardUser = null;

      const mockClient = {
        guilds: { cache: new Map() },
      };

      const middleware = dashboardAuthMiddleware.checkAdminPermission(mockClient);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('should reject non-admin user', async () => {
      process.env.BOT_OWNER_ID = 'owner-123';
      mockReq.dashboardUser = { userId: 'regular-user' };

      const mockClient = {
        guilds: { cache: new Map() },
      };

      const middleware = dashboardAuthMiddleware.checkAdminPermission(mockClient);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockReq.isAdmin).toBe(false);
    });
  });

  describe('logAccess', () => {
    it('should log access with user info', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      mockReq.dashboardUser = { username: 'testuser' };
      mockReq.method = 'GET';
      mockReq.path = '/api/dashboard/bot/status';

      dashboardAuthMiddleware.logAccess(mockReq, mockRes, mockNext);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('testuser')
      );
      expect(mockNext).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log access without user info', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      mockReq.dashboardUser = null;
      mockReq.method = 'GET';
      mockReq.path = '/api/dashboard/bot/status';

      dashboardAuthMiddleware.logAccess(mockReq, mockRes, mockNext);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unknown')
      );
      expect(mockNext).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
