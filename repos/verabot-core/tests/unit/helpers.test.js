/**
 * Unit Tests for Helper Modules
 * Testing response-helpers and api-helpers utilities
 */

const assert = require('assert');
const { responseHelpers, apiHelpers } = require('../../src/helpers');

describe('Response Helpers', () => {
  describe('Module Exports', () => {
    it('should export sendQuoteEmbed', () => {
      assert.strictEqual(typeof responseHelpers.sendQuoteEmbed, 'function');
    });

    it('should export sendSuccess', () => {
      assert.strictEqual(typeof responseHelpers.sendSuccess, 'function');
    });

    it('should export sendError', () => {
      assert.strictEqual(typeof responseHelpers.sendError, 'function');
    });

    it('should export sendDM', () => {
      assert.strictEqual(typeof responseHelpers.sendDM, 'function');
    });

    it('should export deferReply', () => {
      assert.strictEqual(typeof responseHelpers.deferReply, 'function');
    });

    it('should export sendOptInSuccess', () => {
      assert.strictEqual(typeof responseHelpers.sendOptInSuccess, 'function');
    });

    it('should export sendOptOutSuccess', () => {
      assert.strictEqual(typeof responseHelpers.sendOptOutSuccess, 'function');
    });

    it('should export sendOptInStatus', () => {
      assert.strictEqual(typeof responseHelpers.sendOptInStatus, 'function');
    });

    it('should export sendOptInDecisionPrompt', () => {
      assert.strictEqual(typeof responseHelpers.sendOptInDecisionPrompt, 'function');
    });

    it('should export sendReminderCreatedServerOnly', () => {
      assert.strictEqual(typeof responseHelpers.sendReminderCreatedServerOnly, 'function');
    });

    it('should export sendOptInRequest', () => {
      assert.strictEqual(typeof responseHelpers.sendOptInRequest, 'function');
    });
  });
});

describe('API Helpers', () => {
  describe('Module Exports', () => {
    it('should export apiHelpers module', () => {
      assert.ok(apiHelpers);
      assert.strictEqual(typeof apiHelpers, 'object');
    });

    it('should have helper functions', () => {
      assert.ok(Object.keys(apiHelpers).length > 0);
    });
  });
});

describe('Helpers Index', () => {
  it('should export responseHelpers', () => {
    assert.ok(responseHelpers);
  });

  it('should export apiHelpers', () => {
    assert.ok(apiHelpers);
  });

  it('should both be objects', () => {
    assert.strictEqual(typeof responseHelpers, 'object');
    assert.strictEqual(typeof apiHelpers, 'object');
  });
});
