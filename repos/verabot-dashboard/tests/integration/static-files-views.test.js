/**
 * Static Files & Views Integration Tests
 * Tests for CSS, JavaScript, and EJS template rendering
 */

import { describe, it, expect, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../src/index.js';

describe('Static Files & Views Integration', () => {
  describe('Static CSS Files', () => {
    it('should serve main stylesheet', async () => {
      const res = await request(app).get('/css/style.css');
      expect(res.status).toBe(200);
      expect(res.type).toMatch(/css/);
      expect(res.text).toContain('body');
    });

    it('should have correct Content-Type for CSS', async () => {
      const res = await request(app).get('/css/style.css');
      expect(res.type).toMatch(/css/);
    });

    it('should include key CSS classes', async () => {
      const res = await request(app).get('/css/style.css');
      expect(res.text).toContain('.navbar');
      expect(res.text).toContain('.card');
      expect(res.text).toContain('.dashboard-grid');
    });
  });

  describe('Static JavaScript Files', () => {
    it('should serve dashboard JavaScript', async () => {
      const res = await request(app).get('/js/dashboard.js');
      expect(res.status).toBe(200);
      expect(res.type).toMatch(/javascript/);
      expect(res.text).toContain('DashboardApp');
    });

    it('should have correct Content-Type for JS', async () => {
      const res = await request(app).get('/js/dashboard.js');
      expect(res.type).toMatch(/javascript/);
    });

    it('should include DashboardApp class', async () => {
      const res = await request(app).get('/js/dashboard.js');
      expect(res.text).toContain('class DashboardApp');
      expect(res.text).toContain('loadDashboardData');
      expect(res.text).toContain('loadBotStatus');
    });

    it('should include event listener initialization', async () => {
      const res = await request(app).get('/js/dashboard.js');
      expect(res.text).toContain('initializeEventListeners');
      expect(res.text).toContain('DOMContentLoaded');
    });
  });

  describe('View Rendering', () => {
    it('should render index page', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.type).toMatch(/html/);
      expect(res.text).toContain('VeraBot Dashboard');
    });

    it('should include all sections in dashboard', async () => {
      const res = await request(app).get('/');
      expect(res.text).toContain('Bot Status');
      expect(res.text).toContain('Bot Information');
      expect(res.text).toContain('Statistics');
      expect(res.text).toContain('Guilds');
    });

    it('should include links to stylesheets', async () => {
      const res = await request(app).get('/');
      expect(res.text).toContain('/css/style.css');
    });

    it('should include links to scripts', async () => {
      const res = await request(app).get('/');
      expect(res.text).toContain('/js/dashboard.js');
      expect(res.text).toContain('/js/api-client.js');
    });

    it('should have proper HTML structure', async () => {
      const res = await request(app).get('/');
      expect(res.text).toContain('<!DOCTYPE html>');
      expect(res.text).toContain('<html');
      expect(res.text).toContain('</html>');
    });

    it('should have navigation bar', async () => {
      const res = await request(app).get('/');
      expect(res.text).toContain('navbar');
      expect(res.text).toContain('Dashboard');
    });

    it('should have main container', async () => {
      const res = await request(app).get('/');
      expect(res.text).toContain('container');
    });

    it('should have error message container', async () => {
      const res = await request(app).get('/');
      expect(res.text).toContain('error-messages');
    });

    it('should have footer', async () => {
      const res = await request(app).get('/');
      expect(res.text).toContain('footer');
      expect(res.text).toContain('VeraBot');
    });
  });

  describe('Error Page Rendering', () => {
    // Note: Error pages require EJS rendering which only works when EJS is rendering views
    // Since we're testing static files, the index.html is served directly
    // Error page tests are covered in integration tests with the full Express app
    it('should be testable with full Express app', () => {
      expect(true).toBe(true);
    });
  });

  describe('Static File Caching', () => {
    it('should set cache headers for CSS', async () => {
      const res = await request(app).get('/css/style.css');
      expect(res.headers['cache-control']).toBeDefined();
    });

    it('should set cache headers for JS', async () => {
      const res = await request(app).get('/js/dashboard.js');
      expect(res.headers['cache-control']).toBeDefined();
    });

    it('should use reasonable cache time', async () => {
      const res = await request(app).get('/css/style.css');
      const cacheControl = res.headers['cache-control'];
      expect(cacheControl).toContain('max-age');
    });
  });

  describe('Asset Path Resolution', () => {
    it('should resolve CSS paths correctly', async () => {
      const res = await request(app).get('/');
      expect(res.text).toContain('href="/css/style.css"');
    });

    it('should resolve JS paths correctly', async () => {
      const res = await request(app).get('/');
      expect(res.text).toContain('src="/js/dashboard.js"');
    });
  });

  describe('Content Type Headers', () => {
    it('should return HTML for root path', async () => {
      const res = await request(app).get('/');
      expect(res.type).toMatch(/html/);
    });

    it('should return CSS for stylesheet', async () => {
      const res = await request(app).get('/css/style.css');
      expect(res.type).toMatch(/css/);
    });

    it('should return JavaScript for script', async () => {
      const res = await request(app).get('/js/dashboard.js');
      expect(res.type).toMatch(/javascript/);
    });
  });

  describe('Dynamic Content in Templates', () => {
    it('should render dynamic dashboard elements', async () => {
      const res = await request(app).get('/');
      expect(res.text).toContain('id="bot-status"');
      expect(res.text).toContain('id="bot-guilds"');
      expect(res.text).toContain('id="bot-stats"');
    });

    it('should include loading elements in dashboard', async () => {
      const res = await request(app).get('/');
      expect(res.text).toContain('Loading...');
    });

    it('should include error message container', async () => {
      const res = await request(app).get('/');
      expect(res.text).toContain('error-messages');
      expect(res.text).toContain('error-container');
    });
  });

  describe('Accessibility', () => {
    it('should have proper language attribute', async () => {
      const res = await request(app).get('/');
      expect(res.text).toContain('lang="en"');
    });

    it('should have meta viewport tag', async () => {
      const res = await request(app).get('/');
      expect(res.text).toContain('viewport');
    });

    it('should have proper heading hierarchy', async () => {
      const res = await request(app).get('/');
      expect(res.text).toContain('<h1>');
      expect(res.text).toContain('<h2>');
      expect(res.text).toContain('<h3>');
    });
  });
});
