/**
 * Phase 13A: ProxyConfigService Integration Tests
 *
 * Tests for proxy configuration management including:
 * - Webhook URL storage and retrieval
 * - Webhook token encryption/decryption
 * - Monitored channels management
 * - Proxy enabled/disabled state
 * - Webhook secret encryption
 * - Configuration aggregation
 *
 * Current Coverage Target: 15-20% overall (10.96% baseline)
 * Expected ProxyConfigService coverage: 20-30%
 */

/* eslint-disable max-nested-callbacks */
const assert = require('assert');
const ProxyConfigService = require('../src/services/ProxyConfigService');

describe('Phase 13A: ProxyConfigService Integration Tests', () => {
  let service;
  let mockDb;

  beforeAll(() => {
    // Mock DatabaseService with in-memory storage
    const configStorage = new Map();

    mockDb = {
      setProxyConfig: async (key, value, isEncrypted) => {
        configStorage.set(key, { key, value, isEncrypted });
        return true;
      },
      getProxyConfig: async (key) => {
        const config = configStorage.get(key);
        return config || null;
      },
      getAllProxyConfig: async () => {
        return Array.from(configStorage.values());
      },
      deleteProxyConfig: async (key) => {
        configStorage.delete(key);
        return true;
      },
      // Expose storage for test inspection
      _storage: configStorage,
    };

    // Create service with mock database
    service = new ProxyConfigService(mockDb);
  });

  afterEach(() => {
    // Clear storage between tests
    mockDb._storage.clear();
  });

  // ============================================================================
  // SECTION 1: Webhook URL Management (4 tests)
  // ============================================================================

  describe('Webhook URL Management', () => {
    it('should set webhook URL', async () => {
      const url = 'https://webhook.example.com/api/webhook';
      const result = await service.setWebhookUrl(url);

      assert.strictEqual(result, true);
      const stored = await service.getWebhookUrl();
      assert.strictEqual(stored, url);
    });

    it('should get webhook URL after setting', async () => {
      const url = 'https://webhook.example.com/api/webhook';
      await service.setWebhookUrl(url);

      const retrieved = await service.getWebhookUrl();
      assert.strictEqual(retrieved, url);
    });

    it('should return null when webhook URL not set', async () => {
      const url = await service.getWebhookUrl();
      assert.strictEqual(url, null);
    });

    it('should update webhook URL', async () => {
      const url1 = 'https://webhook.example.com/webhook1';
      const url2 = 'https://webhook.example.com/webhook2';

      await service.setWebhookUrl(url1);
      let retrieved = await service.getWebhookUrl();
      assert.strictEqual(retrieved, url1);

      await service.setWebhookUrl(url2);
      retrieved = await service.getWebhookUrl();
      assert.strictEqual(retrieved, url2);
    });
  });

  // ============================================================================
  // SECTION 2: Webhook Token Management (4 tests)
  // ============================================================================

  describe('Webhook Token Management', () => {
    it('should set and encrypt webhook token', async () => {
      const token = 'secret-token-12345';
      const result = await service.setWebhookToken(token);

      assert.strictEqual(result, true);
      const stored = mockDb._storage.get('webhook_token');
      assert(stored);
      assert.strictEqual(stored.isEncrypted, true);
      // Token should be encrypted (not plaintext)
      assert.notStrictEqual(stored.value, token);
    });

    it('should get and decrypt webhook token', async () => {
      const token = 'secret-token-12345';
      await service.setWebhookToken(token);

      const retrieved = await service.getWebhookToken();
      assert.strictEqual(retrieved, token);
    });

    it('should return null when webhook token not set', async () => {
      const token = await service.getWebhookToken();
      assert.strictEqual(token, null);
    });

    it('should handle token update', async () => {
      const token1 = 'token-1';
      const token2 = 'token-2';

      await service.setWebhookToken(token1);
      let retrieved = await service.getWebhookToken();
      assert.strictEqual(retrieved, token1);

      await service.setWebhookToken(token2);
      retrieved = await service.getWebhookToken();
      assert.strictEqual(retrieved, token2);
    });
  });

  // ============================================================================
  // SECTION 3: Monitored Channels Management (4 tests)
  // ============================================================================

  describe('Monitored Channels Management', () => {
    it('should set monitored channels', async () => {
      const channels = ['channel-1', 'channel-2', 'channel-3'];
      const result = await service.setMonitoredChannels(channels);

      assert.strictEqual(result, true);
      const retrieved = await service.getMonitoredChannels();
      assert.deepStrictEqual(retrieved, channels);
    });

    it('should get monitored channels', async () => {
      const channels = ['ch1', 'ch2'];
      await service.setMonitoredChannels(channels);

      const retrieved = await service.getMonitoredChannels();
      assert.deepStrictEqual(retrieved, channels);
    });

    it('should return empty array when no channels set', async () => {
      const channels = await service.getMonitoredChannels();
      assert.deepStrictEqual(channels, []);
    });

    it('should replace monitored channels list', async () => {
      const channels1 = ['ch1', 'ch2'];
      const channels2 = ['ch3', 'ch4', 'ch5'];

      await service.setMonitoredChannels(channels1);
      let retrieved = await service.getMonitoredChannels();
      assert.deepStrictEqual(retrieved, channels1);

      await service.setMonitoredChannels(channels2);
      retrieved = await service.getMonitoredChannels();
      assert.deepStrictEqual(retrieved, channels2);
    });
  });

  // ============================================================================
  // SECTION 4: Proxy Enabled State (4 tests)
  // ============================================================================

  describe('Proxy Enabled State', () => {
    it('should set proxy enabled to true', async () => {
      const result = await service.setProxyEnabled(true);

      assert.strictEqual(result, true);
      const enabled = await service.isProxyEnabled();
      assert.strictEqual(enabled, true);
    });

    it('should set proxy enabled to false', async () => {
      const result = await service.setProxyEnabled(false);

      assert.strictEqual(result, true);
      const enabled = await service.isProxyEnabled();
      assert.strictEqual(enabled, false);
    });

    it('should return false when proxy not configured', async () => {
      const enabled = await service.isProxyEnabled();
      assert.strictEqual(enabled, false);
    });

    it('should toggle proxy enabled state', async () => {
      await service.setProxyEnabled(true);
      let enabled = await service.isProxyEnabled();
      assert.strictEqual(enabled, true);

      await service.setProxyEnabled(false);
      enabled = await service.isProxyEnabled();
      assert.strictEqual(enabled, false);

      await service.setProxyEnabled(true);
      enabled = await service.isProxyEnabled();
      assert.strictEqual(enabled, true);
    });
  });

  // ============================================================================
  // SECTION 5: Webhook Secret Management (3 tests)
  // ============================================================================

  describe('Webhook Secret Management', () => {
    it('should set and encrypt webhook secret', async () => {
      const secret = 'webhook-secret-key-xyz';
      const result = await service.setWebhookSecret(secret);

      assert.strictEqual(result, true);
      const retrieved = await service.getWebhookSecret();
      assert.strictEqual(retrieved, secret);
    });

    it('should get and decrypt webhook secret', async () => {
      const secret = 'my-webhook-secret';
      await service.setWebhookSecret(secret);

      const retrieved = await service.getWebhookSecret();
      assert.strictEqual(retrieved, secret);
    });

    it('should return null when webhook secret not set', async () => {
      const secret = await service.getWebhookSecret();
      assert.strictEqual(secret, null);
    });
  });

  // ============================================================================
  // SECTION 6: Configuration Aggregation (3 tests)
  // ============================================================================

  describe('Configuration Aggregation', () => {
    it('should get all configuration with defaults', async () => {
      const config = await service.getAllConfig();

      assert(config);
      assert.strictEqual(config.webhookUrl, null);
      assert.deepStrictEqual(config.monitoredChannels, []);
      assert.strictEqual(config.enabled, false);
      assert.strictEqual(config.hasToken, false);
      assert.strictEqual(config.hasSecret, false);
    });

    it('should aggregate all configured settings', async () => {
      const url = 'https://webhook.example.com';
      const channels = ['ch1', 'ch2'];

      await service.setWebhookUrl(url);
      await service.setWebhookToken('token-123');
      await service.setMonitoredChannels(channels);
      await service.setProxyEnabled(true);
      await service.setWebhookSecret('secret-key');

      const config = await service.getAllConfig();

      assert.strictEqual(config.webhookUrl, url);
      assert.deepStrictEqual(config.monitoredChannels, channels);
      assert.strictEqual(config.enabled, true);
      assert.strictEqual(config.hasToken, true);
      assert.strictEqual(config.hasSecret, true);
    });

    it('should handle partial configuration', async () => {
      await service.setWebhookUrl('https://webhook.example.com');
      await service.setProxyEnabled(true);

      const config = await service.getAllConfig();

      assert.strictEqual(config.webhookUrl, 'https://webhook.example.com');
      assert.strictEqual(config.enabled, true);
      assert.deepStrictEqual(config.monitoredChannels, []);
      assert.strictEqual(config.hasToken, false);
    });
  });

  // ============================================================================
  // SECTION 7: Configuration Clearing (2 tests)
  // ============================================================================

  describe('Configuration Clearing', () => {
    it('should clear all configuration', async () => {
      // Set multiple configurations
      await service.setWebhookUrl('https://webhook.example.com');
      await service.setWebhookToken('token');
      await service.setWebhookSecret('secret');
      await service.setMonitoredChannels(['ch1', 'ch2']);
      await service.setProxyEnabled(true);

      // Verify they're set
      let config = await service.getAllConfig();
      assert.strictEqual(config.webhookUrl, 'https://webhook.example.com');
      assert.strictEqual(config.enabled, true);

      // Clear all
      const result = await service.clearAllConfig();
      assert.strictEqual(result, true);

      // Verify all cleared
      config = await service.getAllConfig();
      assert.strictEqual(config.webhookUrl, null);
      assert.deepStrictEqual(config.monitoredChannels, []);
      assert.strictEqual(config.enabled, false);
    });

    it('should handle clearing empty configuration', async () => {
      const result = await service.clearAllConfig();
      assert.strictEqual(result, true);
    });
  });

  // ============================================================================
  // SECTION 8: Error Handling (2 tests)
  // ============================================================================

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Replace db with one that throws errors
      const errorDb = new ProxyConfigService({
        getProxyConfig: async () => {
          throw new Error('Database error');
        },
        getAllProxyConfig: async () => {
          throw new Error('Database error');
        },
      });

      // Should return defaults instead of throwing
      const url = await errorDb.getWebhookUrl();
      assert.strictEqual(url, null);

      const config = await errorDb.getAllConfig();
      assert(config);
      assert.strictEqual(config.webhookUrl, null);
    });

    it('should handle invalid JSON in channels', async () => {
      // Manually corrupt the storage
      mockDb._storage.set('monitored_channels', {
        key: 'monitored_channels',
        value: 'invalid-json-{',
        isEncrypted: false,
      });

      // Should return empty array instead of throwing
      const channels = await service.getMonitoredChannels();
      assert.deepStrictEqual(channels, []);
    });
  });

  // ============================================================================
  // SECTION 9: Integration Scenarios (2 tests)
  // ============================================================================

  describe('Integration Scenarios', () => {
    it('should maintain configuration consistency', async () => {
      const url = 'https://webhook.example.com';
      const channels = ['ch1', 'ch2', 'ch3'];

      // Set config step by step
      await service.setWebhookUrl(url);
      await service.setWebhookToken('token-123');
      await service.setMonitoredChannels(channels);
      await service.setProxyEnabled(true);

      // Verify individually
      assert.strictEqual(await service.getWebhookUrl(), url);
      assert.strictEqual(await service.getWebhookToken(), 'token-123');
      assert.deepStrictEqual(await service.getMonitoredChannels(), channels);
      assert.strictEqual(await service.isProxyEnabled(), true);

      // Verify in aggregate
      const config = await service.getAllConfig();
      assert.strictEqual(config.webhookUrl, url);
      assert.deepStrictEqual(config.monitoredChannels, channels);
      assert.strictEqual(config.enabled, true);
      assert.strictEqual(config.hasToken, true);
    });

    it('should handle full lifecycle: set, retrieve, update, clear', async () => {
      // Initial set
      await service.setWebhookUrl('https://webhook1.example.com');
      let url = await service.getWebhookUrl();
      assert.strictEqual(url, 'https://webhook1.example.com');

      // Update
      await service.setWebhookUrl('https://webhook2.example.com');
      url = await service.getWebhookUrl();
      assert.strictEqual(url, 'https://webhook2.example.com');

      // Clear
      await service.clearAllConfig();
      url = await service.getWebhookUrl();
      assert.strictEqual(url, null);
    });
  });
});
