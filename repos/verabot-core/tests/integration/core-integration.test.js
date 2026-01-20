/**
 * Integration Tests for verabot-core
 * Testing module loading and interactions
 */

const assert = require('assert');

describe('verabot-core Integration', () => {
  describe('Module Loading', () => {
    it('should load main index successfully', () => {
      const core = require('../../src/index');

      assert.ok(core);
    });

    it('should load core module successfully', () => {
      const core = require('../../src/core');

      assert.ok(core);
      assert.ok(core.CommandBase);
      assert.ok(core.CommandOptions);
      assert.ok(core.EventBase);
    });

    it('should load helpers module successfully', () => {
      const helpers = require('../../src/helpers');

      assert.ok(helpers);
      assert.ok(helpers.responseHelpers);
      assert.ok(helpers.apiHelpers);
    });

    it('should load services module successfully', () => {
      const services = require('../../src/services');

      assert.ok(services);
      assert.ok(services.DatabaseService);
    });

    it('should load config successfully', () => {
      const config = require('../../src/config/roles');

      assert.ok(config);
      assert.strictEqual(typeof config.enabled, 'boolean');
    });
  });

  describe('Core Exports', () => {
    it('should export CommandBase', () => {
      const core = require('../../src/index');

      assert.ok(core.CommandBase);
      assert.strictEqual(typeof core.CommandBase, 'function');
    });

    it('should export CommandOptions', () => {
      const core = require('../../src/index');

      assert.ok(core.CommandOptions);
      assert.strictEqual(typeof core.CommandOptions, 'function');
    });

    it('should export EventBase', () => {
      const core = require('../../src/index');

      assert.ok(core.EventBase);
      assert.strictEqual(typeof core.EventBase, 'function');
    });
  });

  describe('Services Available', () => {
    it('should export DatabaseService', () => {
      const core = require('../../src/index');

      assert.ok(core.DatabaseService);
    });

    it('should export GuildAwareDatabaseService', () => {
      const core = require('../../src/index');

      assert.ok(core.GuildAwareDatabaseService);
    });

    it('should export DiscordService', () => {
      const core = require('../../src/index');

      assert.ok(core.DiscordService);
    });

    it('should export ValidationService', () => {
      const core = require('../../src/index');

      assert.ok(core.ValidationService);
    });
  });

  describe('Helpers Available', () => {
    it('should export response helpers', () => {
      const core = require('../../src/index');

      assert.ok(core.responseHelpers);
    });

    it('should export api helpers', () => {
      const core = require('../../src/index');

      assert.ok(core.apiHelpers);
    });
  });

  describe('Package Configuration', () => {
    it('should have valid package.json', () => {
      const pkg = require('../../package.json');

      assert.ok(pkg.name);
      assert.ok(pkg.version);
      assert.strictEqual(pkg.name, 'verabot-core');
    });

    it('should have exports defined', () => {
      const pkg = require('../../package.json');

      assert.ok(pkg.exports);
      assert.ok(typeof pkg.exports === 'object');
    });

    it('should have scripts defined', () => {
      const pkg = require('../../package.json');

      assert.ok(pkg.scripts);
      assert.ok(pkg.scripts.test);
    });

    it('should have dependencies', () => {
      const pkg = require('../../package.json');

      assert.ok(pkg.dependencies);
      assert.ok(pkg.dependencies['discord.js']);
      assert.ok(pkg.dependencies['verabot-utils']);
    });
  });

  describe('No Circular Dependencies', () => {
    it('should load core without circular dependency errors', () => {
      // If we got here, no stack overflow occurred
      const core = require('../../src/core');

      assert.ok(core);
    });

    it('should load helpers without circular dependency errors', () => {
      const helpers = require('../../src/helpers');

      assert.ok(helpers);
    });

    it('should load services without circular dependency errors', () => {
      const services = require('../../src/services');

      assert.ok(services);
    });

    it('should load main index without circular dependency errors', () => {
      const core = require('../../src/index');

      assert.ok(core);
    });
  });
});
