/**
 * Dashboard Routes Tests
 *
 * Tests for dashboard API endpoints
 * TDD approach - tests written first
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import dashboardRoutes from '../../src/routes/dashboard.js';

describe('Dashboard Routes', () => {
  let app;
  let mockClient;

  beforeEach(() => {
    // Setup Express app with routes
    app = express();
    app.use(express.json());

    // Mock Discord client
    mockClient = {
      isReady: () => true,
      uptime: 3600000,
      ws: { ping: 45 },
      user: {
        username: 'TestBot',
        id: 'bot-123',
        displayAvatarURL: () => 'https://example.com/avatar.png',
      },
      guilds: {
        cache: {
          size: 5,
          get: () => ({
            id: 'guild-123',
            name: 'Test Guild',
            iconURL: () => 'https://example.com/icon.png',
            memberCount: 100,
            ownerId: 'owner-123',
          }),
          values: () => [
            {
              id: 'guild-1',
              name: 'Guild 1',
              iconURL: () => 'https://example.com/icon1.png',
              memberCount: 50,
              ownerId: 'owner-1',
            },
          ],
        },
      },
      users: { cache: { size: 150 } },
      channels: { cache: { size: 200 } },
      application: { commands: { cache: { size: 30 } } },
    };

    app.locals.discordClient = mockClient;
    app.use('/api/dashboard', dashboardRoutes);
  });

  describe('POST /auth/verify-admin', () => {
    it('should verify bot owner as admin', async () => {
      process.env.BOT_OWNER_ID = 'owner-123';

      const response = await request(app)
        .post('/api/dashboard/auth/verify-admin')
        .send({
          userId: 'owner-123',
          guilds: ['guild-1', 'guild-2'],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.isAdmin).toBe(true);
      expect(response.body.reason).toBe('bot_owner');
    });

    it('should reject invalid request body', async () => {
      const response = await request(app)
        .post('/api/dashboard/auth/verify-admin')
        .send({ userId: 'user-123' }); // Missing guilds array

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle missing Discord client', async () => {
      app.locals.discordClient = null;

      const response = await request(app)
        .post('/api/dashboard/auth/verify-admin')
        .send({
          userId: 'user-123',
          guilds: ['guild-1'],
        });

      expect(response.status).toBe(503);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /bot/status', () => {
    it('should return bot status', async () => {
      const response = await request(app).get('/api/dashboard/bot/status');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.online).toBe(true);
      expect(response.body.latency).toBe(45);
    });
  });

  describe('GET /bot/info', () => {
    it('should return bot information', async () => {
      const response = await request(app).get('/api/dashboard/bot/info');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.username).toBe('TestBot');
      expect(response.body.userId).toBe('bot-123');
    });
  });

  describe('GET /bot/stats', () => {
    it('should return bot statistics', async () => {
      const response = await request(app).get('/api/dashboard/bot/stats');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.guildCount).toBe(5);
      expect(response.body.userCount).toBe(150);
      expect(response.body.channelCount).toBe(200);
    });
  });

  describe('GET /bot/guilds', () => {
    it('should return list of guilds', async () => {
      const response = await request(app).get('/api/dashboard/bot/guilds');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.guilds)).toBe(true);
      expect(response.body.guilds.length).toBe(1);
      expect(response.body.guilds[0].id).toBe('guild-1');
    });
  });
});
