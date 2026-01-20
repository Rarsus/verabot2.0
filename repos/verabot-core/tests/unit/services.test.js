/**
 * Unit Tests for Services
 * Testing service exports and availability
 */

const assert = require('assert');

describe('Services', () => {
  describe('Services Module Loading', () => {
    it('should load services module', () => {
      const services = require('../../src/services');

      assert.ok(services);
      assert.strictEqual(typeof services, 'object');
    });

    it('should export DatabaseService', () => {
      const services = require('../../src/services');

      assert.ok(services.DatabaseService);
    });

    it('should export GuildAwareDatabaseService', () => {
      const services = require('../../src/services');

      assert.ok(services.GuildAwareDatabaseService);
    });

    it('should export DiscordService', () => {
      const services = require('../../src/services');

      assert.ok(services.DiscordService);
    });

    it('should export ValidationService', () => {
      const services = require('../../src/services');

      assert.ok(services.ValidationService);
    });

    it('should have multiple services', () => {
      const services = require('../../src/services');

      const serviceCount = Object.keys(services).length;
      assert.ok(serviceCount >= 4);
    });
  });

  describe('Service Type Checking', () => {
    it('DatabaseService should be available', () => {
      const services = require('../../src/services');
      const { DatabaseService } = services;

      assert.ok(DatabaseService);
    });

    it('should support service access by name', () => {
      const services = require('../../src/services');

      Object.keys(services).forEach((key) => {
        assert.ok(services[key]);
      });
    });
  });

  describe('Module Caching', () => {
    it('should return same module on multiple requires', () => {
      const services1 = require('../../src/services');
      const services2 = require('../../src/services');

      assert.strictEqual(services1, services2);
    });

    it('should maintain service references', () => {
      const services = require('../../src/services');
      const db1 = services.DatabaseService;

      const services2 = require('../../src/services');
      const db2 = services2.DatabaseService;

      assert.strictEqual(db1, db2);
    });
  });
});
