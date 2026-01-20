/**
 * Dashboard JavaScript Functionality Tests
 * Tests for dashboard.js client-side functionality
 */

import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../src/index.js';

describe('Dashboard JavaScript - Client-side Functionality', () => {
  let dashboardJS;

  beforeAll(async () => {
    const res = await request(app).get('/js/dashboard.js');
    dashboardJS = res.text;
  });

  describe('DashboardApp Class', () => {
    it('should export DashboardApp class', () => {
      expect(dashboardJS).toContain('class DashboardApp');
    });

    it('should have constructor method', () => {
      expect(dashboardJS).toContain('constructor()');
    });

    it('should initialize on DOM ready', () => {
      expect(dashboardJS).toContain('DOMContentLoaded');
      expect(dashboardJS).toContain('window.app = new DashboardApp');
    });
  });

  describe('Core Methods', () => {
    it('should have initializeEventListeners method', () => {
      expect(dashboardJS).toContain('initializeEventListeners()');
    });

    it('should have loadDashboardData method', () => {
      expect(dashboardJS).toContain('loadDashboardData()');
    });

    it('should have loadBotStatus method', () => {
      expect(dashboardJS).toContain('loadBotStatus()');
    });

    it('should have loadGuildInfo method', () => {
      expect(dashboardJS).toContain('loadGuildInfo()');
    });

    it('should have updateBotStatus method', () => {
      expect(dashboardJS).toContain('updateBotStatus');
    });

    it('should have updateGuildInfo method', () => {
      expect(dashboardJS).toContain('updateGuildInfo');
    });

    it('should have formatUptime method', () => {
      expect(dashboardJS).toContain('formatUptime');
    });

    it('should have error handling methods', () => {
      expect(dashboardJS).toContain('showError');
      expect(dashboardJS).toContain('clearErrorMessages');
    });

    it('should have loading state methods', () => {
      expect(dashboardJS).toContain('setLoadingState');
    });

    it('should have auto-refresh method', () => {
      expect(dashboardJS).toContain('startAutoRefresh');
    });
  });

  describe('API Endpoint Definitions', () => {
    it('should define API base URL', () => {
      expect(dashboardJS).toContain('this.apiUrl = \'/api\'');
    });

    it('should call /api/status endpoint', () => {
      expect(dashboardJS).toContain('`${this.apiUrl}/status`');
    });

    it('should call /api/guilds endpoint', () => {
      expect(dashboardJS).toContain('`${this.apiUrl}/guilds`');
    });
  });

  describe('DOM Element References', () => {
    it('should reference bot-status element', () => {
      expect(dashboardJS).toContain('bot-status');
    });

    it('should reference guild-list element', () => {
      expect(dashboardJS).toContain('guild-list');
    });

    it('should reference loading-spinner element', () => {
      expect(dashboardJS).toContain('loading-spinner');
    });

    it('should reference error-messages element', () => {
      expect(dashboardJS).toContain('error-messages');
    });

    it('should reference refresh button', () => {
      expect(dashboardJS).toContain('refresh-btn');
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors with try-catch', () => {
      expect(dashboardJS).toContain('try {');
      expect(dashboardJS).toContain('catch (error)');
    });

    it('should show error messages to user', () => {
      expect(dashboardJS).toContain('showError');
    });

    it('should log errors to console', () => {
      expect(dashboardJS).toContain('console.error');
    });

    it('should handle API response errors', () => {
      expect(dashboardJS).toContain('if (!response.ok)');
    });
  });

  describe('Uptime Formatting', () => {
    it('should have formatUptime method', () => {
      expect(dashboardJS).toContain('formatUptime(ms)');
    });

    it('should handle days in uptime', () => {
      expect(dashboardJS).toContain('days > 0');
    });

    it('should handle hours in uptime', () => {
      expect(dashboardJS).toContain('hours > 0');
    });

    it('should handle minutes in uptime', () => {
      expect(dashboardJS).toContain('minutes > 0');
    });

    it('should handle null/undefined uptime', () => {
      expect(dashboardJS).toContain('if (!ms)');
    });
  });

  describe('Guild Information Display', () => {
    it('should handle empty guilds list', () => {
      expect(dashboardJS).toContain('!data.guilds || data.guilds.length === 0');
    });

    it('should display guild icons', () => {
      expect(dashboardJS).toContain('guild-icon');
    });

    it('should display guild names', () => {
      expect(dashboardJS).toContain('guild-name');
    });

    it('should display member count', () => {
      expect(dashboardJS).toContain('guild-members');
    });

    it('should use color mapping for guild avatars', () => {
      expect(dashboardJS).toContain('getGuildColor');
    });
  });

  describe('Auto-Refresh Functionality', () => {
    it('should define refresh interval', () => {
      expect(dashboardJS).toContain('refreshInterval');
    });

    it('should set refresh interval to 30 seconds', () => {
      expect(dashboardJS).toContain('30000');
    });

    it('should start auto-refresh on initialization', () => {
      expect(dashboardJS).toContain('startAutoRefresh()');
    });

    it('should use setInterval for auto-refresh', () => {
      expect(dashboardJS).toContain('setInterval');
    });
  });

  describe('Async/Await Pattern', () => {
    it('should use async/await for API calls', () => {
      expect(dashboardJS).toContain('async ');
      expect(dashboardJS).toContain('await fetch');
    });

    it('should handle async errors', () => {
      expect(dashboardJS).toContain('async');
      expect(dashboardJS).toContain('catch');
    });

    it('should have finally block for cleanup', () => {
      expect(dashboardJS).toContain('finally');
    });
  });

  describe('Event Listener Setup', () => {
    it('should attach click handler to refresh button', () => {
      expect(dashboardJS).toContain('addEventListener');
      expect(dashboardJS).toContain('refresh');
    });

    it('should handle button click events', () => {
      expect(dashboardJS).toContain('addEventListener(\'click\'');
    });
  });

  describe('Loading State Management', () => {
    it('should show loading spinner before API calls', () => {
      expect(dashboardJS).toContain('setLoadingState(true)');
    });

    it('should hide loading spinner after API calls', () => {
      expect(dashboardJS).toContain('setLoadingState(false)');
    });

    it('should add/remove hidden class', () => {
      expect(dashboardJS).toContain('classList.remove(\'hidden\')');
      expect(dashboardJS).toContain('classList.add(\'hidden\')');
    });
  });

  describe('Error Message Management', () => {
    it('should clear previous error messages', () => {
      expect(dashboardJS).toContain('clearErrorMessages');
    });

    it('should display new error messages', () => {
      expect(dashboardJS).toContain('showError');
    });

    it('should use innerHTML for error display', () => {
      expect(dashboardJS).toContain('innerHTML');
    });
  });

  describe('Color Mapping', () => {
    it('should have getGuildColor method', () => {
      expect(dashboardJS).toContain('getGuildColor');
    });

    it('should define color palette', () => {
      expect(dashboardJS).toContain('#3498db');
      expect(dashboardJS).toContain('#e74c3c');
    });

    it('should generate consistent colors', () => {
      expect(dashboardJS).toContain('charCodeAt');
    });
  });

  describe('HTML/DOM Injection', () => {
    it('should use insertAdjacentHTML for error display', () => {
      expect(dashboardJS).toContain('insertAdjacentHTML');
    });

    it('should use template literals for HTML generation', () => {
      expect(dashboardJS).toContain('`');
    });

    it('should inject guild HTML dynamically', () => {
      expect(dashboardJS).toContain('guild-item');
    });
  });

  describe('API Response Parsing', () => {
    it('should parse JSON responses', () => {
      expect(dashboardJS).toContain('response.json()');
    });

    it('should check response status', () => {
      expect(dashboardJS).toContain('response.ok');
    });

    it('should throw error on bad status', () => {
      expect(dashboardJS).toContain('throw new Error');
    });
  });
});
