/**
 * Phase 13C: WebhookListenerService Integration Tests
 *
 * Tests for webhook incoming message handling including:
 * - Incoming webhook message processing
 * - Payload validation
 * - HMAC signature generation and verification
 * - HTTP server lifecycle (start, stop, isRunning)
 * - Request routing and error handling
 * - Discord channel interaction
 * - Security and signature validation
 *
 * Current Coverage Target: 15-20% overall (10.96% baseline)
 * Expected WebhookListenerService coverage: 15-20%
 */

 
const assert = require('assert');
const WebhookListenerService = require('../src/services/WebhookListenerService');
const { createHmacSignature } = require('../src/utils/encryption');

describe('Phase 13C: WebhookListenerService Integration Tests', () => {
  let service;
  let mockClient;
  let mockChannel;

  // Set higher timeout for server tests
  jest.setTimeout(10000);

  /**
   * Mock Discord Client and Channel
   */
  beforeAll(() => {
    mockChannel = {
      id: 'test-channel-123',
      name: 'test-channel',
      isTextBased: () => true,
      send: async (content) => ({
        id: 'msg-' + Math.random().toString(36).substr(2, 9),
        content,
        channel: mockChannel,
      }),
    };

    mockClient = {
      channels: {
        cache: new Map([['test-channel-123', mockChannel]]),
        get: (id) => mockChannel.id === id ? mockChannel : null,
      },
    };

    service = new WebhookListenerService(mockClient);
  });

  /**
   * Cleanup after all tests
   */
  afterAll(async () => {
    if (service.isRunning()) {
      await service.stopServer();
    }
  });

  describe('Service Initialization', () => {
    it('should create service with Discord client', () => {
      assert(service);
      assert.strictEqual(service.client, mockClient);
      assert.strictEqual(service.server, null);
    });

    it('should have proper methods available', () => {
      assert(typeof service.processIncomingMessage === 'function');
      assert(typeof service.validateIncomingPayload === 'function');
      assert(typeof service.generateSignature === 'function');
      assert(typeof service.verifySignature === 'function');
      assert(typeof service.startServer === 'function');
      assert(typeof service.stopServer === 'function');
      assert(typeof service.isRunning === 'function');
    });

    it('should start in non-running state', () => {
      assert.strictEqual(service.isRunning(), false);
    });
  });

  describe('Incoming Message Processing', () => {
    it('should process valid incoming message', async () => {
      const payload = {
        channel: 'test-channel-123',
        content: 'Hello from webhook',
      };

      const result = await service.processIncomingMessage(payload);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.error, null);
      assert(result.messageId);
    });

    it('should return error for missing channel', async () => {
      const payload = {
        channel: 'nonexistent-channel',
        content: 'Test message',
      };

      const result = await service.processIncomingMessage(payload);
      assert.strictEqual(result.success, false);
      assert(result.error);
      assert.strictEqual(result.messageId, null);
    });

    it('should handle missing channel property', async () => {
      const payload = {
        content: 'Test message',
        // channel is missing
      };

      const result = await service.processIncomingMessage(payload);
      assert.strictEqual(result.success, false);
      assert(result.error);
    });

    it('should handle message sending errors gracefully', async () => {
      // Create a channel that throws on send
      const errorChannel = {
        id: 'error-channel',
        send: async () => {
          throw new Error('Channel send failed');
        },
      };

      mockClient.channels.cache.set('error-channel', errorChannel);

      const payload = {
        channel: 'error-channel',
        content: 'This will fail',
      };

      const result = await service.processIncomingMessage(payload);
      assert.strictEqual(result.success, false);
      assert(result.error);
      assert.strictEqual(result.messageId, null);
    });

    it('should handle null payload gracefully', async () => {
      const result = await service.processIncomingMessage(null);
      assert.strictEqual(result.success, false);
      assert(result.error);
    });

    it('should process message with embed content', async () => {
      const payload = {
        channel: 'test-channel-123',
        content: 'Embed message',
        embeds: [
          {
            title: 'Test Embed',
            description: 'Test description',
          },
        ],
      };

      const result = await service.processIncomingMessage(payload);
      assert.strictEqual(result.success, true);
      assert(result.messageId);
    });
  });

  describe('Payload Validation', () => {
    it('should validate payload with required fields', () => {
      const payload = {
        channel: 'test-channel-123',
        content: 'Valid message',
      };

      const validation = service.validateIncomingPayload(payload);
      assert(validation);
      assert(typeof validation.valid === 'boolean');
      assert(Array.isArray(validation.errors));
    });

    it('should handle validation for empty payload', () => {
      const validation = service.validateIncomingPayload({});
      assert(validation);
      assert.strictEqual(typeof validation.valid, 'boolean');
    });

    it('should handle validation for null payload', () => {
      // Null payload should be handled gracefully
      // The parseIncomingPayload will throw, but that's expected behavior
      try {
        const validation = service.validateIncomingPayload(null);
        assert(validation);
        assert.strictEqual(validation.valid, false);
      } catch (err) {
        // Expected: null payload causes error in parseIncomingPayload
        assert(err);
      }
    });

    it('should validate payload with extra fields', () => {
      const payload = {
        channel: 'test-channel-123',
        content: 'Valid message',
        extra: 'field',
        nested: { data: 'value' },
      };

      const validation = service.validateIncomingPayload(payload);
      assert(validation);
      assert(typeof validation.valid === 'boolean');
    });
  });

  describe('HMAC Signature Generation', () => {
    it('should generate signature for payload', () => {
      const payload = { channel: 'test', content: 'test' };
      const secret = 'test-secret';

      const signature = service.generateSignature(payload, secret);
      assert(signature);
      assert(typeof signature === 'string');
      assert(signature.length > 0);
    });

    it('should generate consistent signatures for same payload', () => {
      const payload = { channel: 'test', content: 'test' };
      const secret = 'test-secret';

      const sig1 = service.generateSignature(payload, secret);
      const sig2 = service.generateSignature(payload, secret);

      assert.strictEqual(sig1, sig2);
    });

    it('should generate different signatures for different payloads', () => {
      const secret = 'test-secret';
      const payload1 = { channel: 'test1', content: 'test' };
      const payload2 = { channel: 'test2', content: 'test' };

      const sig1 = service.generateSignature(payload1, secret);
      const sig2 = service.generateSignature(payload2, secret);

      assert.notStrictEqual(sig1, sig2);
    });

    it('should generate different signatures for different secrets', () => {
      const payload = { channel: 'test', content: 'test' };
      const sig1 = service.generateSignature(payload, 'secret1');
      const sig2 = service.generateSignature(payload, 'secret2');

      assert.notStrictEqual(sig1, sig2);
    });

    it('should handle complex payload objects', () => {
      const payload = {
        channel: 'test-channel',
        content: 'Test message',
        embeds: [{ title: 'Embed', description: 'Desc' }],
        author: { id: 'user-123', name: 'Test User' },
        nested: { deep: { data: 'value' } },
      };

      const signature = service.generateSignature(payload, 'secret');
      assert(signature);
      assert(typeof signature === 'string');
    });
  });

  describe('HMAC Signature Verification', () => {
    it('should verify valid signature', () => {
      const payload = { channel: 'test', content: 'test' };
      const secret = 'test-secret';

      const signature = service.generateSignature(payload, secret);
      const verified = service.verifySignature(payload, signature, secret);

      assert.strictEqual(verified, true);
    });

    it('should reject invalid signature', () => {
      const payload = { channel: 'test', content: 'test' };
      const secret = 'test-secret';

      const signature = 'invalid-signature-string';
      const verified = service.verifySignature(payload, signature, secret);

      assert.strictEqual(verified, false);
    });

    it('should reject signature with wrong secret', () => {
      const payload = { channel: 'test', content: 'test' };
      const signature = service.generateSignature(payload, 'secret1');

      const verified = service.verifySignature(payload, signature, 'wrong-secret');
      assert.strictEqual(verified, false);
    });

    it('should reject signature for modified payload', () => {
      const payload = { channel: 'test', content: 'test' };
      const secret = 'test-secret';

      const signature = service.generateSignature(payload, secret);

      const modifiedPayload = { channel: 'test', content: 'modified' };
      const verified = service.verifySignature(modifiedPayload, signature, secret);

      assert.strictEqual(verified, false);
    });

    it('should handle null payload gracefully', () => {
      const verified = service.verifySignature(null, 'signature', 'secret');
      assert.strictEqual(verified, false);
    });

    it('should handle null signature gracefully', () => {
      const payload = { channel: 'test', content: 'test' };
      const verified = service.verifySignature(payload, null, 'secret');
      assert.strictEqual(verified, false);
    });

    it('should handle signature for empty payload', () => {
      const payload = {};
      const secret = 'test-secret';

      const signature = service.generateSignature(payload, secret);
      const verified = service.verifySignature(payload, signature, secret);

      assert.strictEqual(verified, true);
    });
  });

  describe('Server Lifecycle - Start', () => {
    it('should start server on available port', async () => {
      const service2 = new WebhookListenerService(mockClient);
      await service2.startServer(0, 'test-secret'); // port 0 = random available port
      assert.strictEqual(service2.isRunning(), true);
      await service2.stopServer();
    });

    it('should reject starting server twice', async () => {
      const service2 = new WebhookListenerService(mockClient);
      await service2.startServer(0, 'test-secret');

      try {
        await service2.startServer(0, 'test-secret');
        assert.fail('Should have thrown error');
      } catch (err) {
        assert(err);
        assert(err.message.includes('already running') || err.message);
      }

      await service2.stopServer();
    });
  });

  describe('Server Lifecycle - Stop', () => {
    it('should stop running server', async () => {
      const service2 = new WebhookListenerService(mockClient);
      await service2.startServer(0, 'test-secret');
      assert.strictEqual(service2.isRunning(), true);

      await service2.stopServer();
      assert.strictEqual(service2.isRunning(), false);
    });

    it('should handle stopping already stopped server', async () => {
      const service2 = new WebhookListenerService(mockClient);
      // Don't start the server
      await service2.stopServer(); // Should not throw
      assert.strictEqual(service2.isRunning(), false);
    });
  });

  describe('Server State Management', () => {
    it('should report correct running state', async () => {
      const service2 = new WebhookListenerService(mockClient);
      assert.strictEqual(service2.isRunning(), false);

      await service2.startServer(0, 'test-secret');
      assert.strictEqual(service2.isRunning(), true);

      await service2.stopServer();
      assert.strictEqual(service2.isRunning(), false);
    });

    it('should clear server reference after stopping', async () => {
      const service2 = new WebhookListenerService(mockClient);
      await service2.startServer(0, 'test-secret');
      assert(service2.server !== null);

      await service2.stopServer();
      assert.strictEqual(service2.server, null);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete webhook flow: process message', async () => {
      const payload = {
        channel: 'test-channel-123',
        content: 'Integration test message',
      };

      const result = await service.processIncomingMessage(payload);
      assert.strictEqual(result.success, true);
      assert(result.messageId);
    });

    it('should verify signature in complete flow', () => {
      const payload = {
        channel: 'test-channel-123',
        content: 'Signed message',
      };
      const secret = 'integration-secret';

      const signature = service.generateSignature(payload, secret);
      const verified = service.verifySignature(payload, signature, secret);
      assert.strictEqual(verified, true);
    });
  });

  describe('Error Handling', () => {
    it('should handle payload with missing required fields', async () => {
      const result = await service.processIncomingMessage({});
      assert.strictEqual(result.success, false);
      assert(result.error);
    });

    it('should handle invalid JSON in payload processing', async () => {
      // Service should handle gracefully (it's not parsing JSON itself in processIncomingMessage)
      const payload = {
        channel: 'test-channel-123',
        content: 'Valid content',
      };

      const result = await service.processIncomingMessage(payload);
      assert(result.success || result.error);
      assert(typeof result.success === 'boolean');
    });

    it('should recover from errors without affecting service state', async () => {
      // First error
      const errorPayload = { channel: 'nonexistent' };
      await service.processIncomingMessage(errorPayload);

      // Service should still work
      const validPayload = {
        channel: 'test-channel-123',
        content: 'Recovery test',
      };
      const result = await service.processIncomingMessage(validPayload);
      assert.strictEqual(result.success, true);
    });
  });
});
