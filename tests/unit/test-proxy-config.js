/**
 * Tests for Proxy Configuration Service
 * Following TDD approach - tests written before implementation
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

// Test database path
const testDbPath = path.join(__dirname, '..', 'fixtures', 'test-proxy.db');

// Clean up test database before tests
function cleanupTestDb() {
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
}

/**
 * Mock DatabaseService for testing
 */
class MockDatabaseService {
  constructor() {
    this.config = new Map();
  }

  async getProxyConfig(key) {
    return this.config.get(key) || null;
  }

  async setProxyConfig(key, value, encrypted = false) {
    this.config.set(key, { key, value, encrypted, updatedAt: new Date().toISOString() });
    return true;
  }

  async deleteProxyConfig(key) {
    const existed = this.config.has(key);
    this.config.delete(key);
    return existed;
  }

  async getAllProxyConfig() {
    return Array.from(this.config.values());
  }
}

/**
 * Test ProxyConfigService
 */
async function testProxyConfigService() {
  console.log('Testing ProxyConfigService...');

  try {
    const ProxyConfigService = require('../../src/services/ProxyConfigService');
    const mockDb = new MockDatabaseService();
    const service = new ProxyConfigService(mockDb);

    // Test 1: Set webhook URL
    await service.setWebhookUrl('https://example.com/webhook');
    const webhookUrl = await service.getWebhookUrl();
    assert.strictEqual(webhookUrl, 'https://example.com/webhook', 'Webhook URL should be set');

    // Test 2: Set webhook token (should be encrypted)
    await service.setWebhookToken('secret-token-123');
    const token = await service.getWebhookToken();
    assert.strictEqual(token, 'secret-token-123', 'Webhook token should be retrievable');

    // Test 3: Set monitored channels
    await service.setMonitoredChannels(['channel1', 'channel2']);
    const channels = await service.getMonitoredChannels();
    assert.deepStrictEqual(channels, ['channel1', 'channel2'], 'Monitored channels should match');

    // Test 4: Enable/disable proxy
    await service.setProxyEnabled(true);
    let enabled = await service.isProxyEnabled();
    assert.strictEqual(enabled, true, 'Proxy should be enabled');

    await service.setProxyEnabled(false);
    enabled = await service.isProxyEnabled();
    assert.strictEqual(enabled, false, 'Proxy should be disabled');

    // Test 5: Get all configuration
    const allConfig = await service.getAllConfig();
    assert(allConfig, 'Should return configuration object');
    assert.strictEqual(allConfig.webhookUrl, 'https://example.com/webhook', 'Config should include webhook URL');

    console.log('✅ ProxyConfigService tests passed');
  } catch {
    console.error('❌ ProxyConfigService tests failed:', err.message);
    throw err;
  }
}

/**
 * Test Database Schema for Proxy Configuration
 */
async function testProxyDatabaseSchema() {
  console.log('Testing Proxy Database Schema...');

  try {
    // This test ensures the schema can be created
    const sqlite3 = require('sqlite3').verbose();
    const testDb = new sqlite3.Database(':memory:');

    await new Promise((resolve, reject) => {
      testDb.serialize(() => {
        // Create proxy_config table
        testDb.run(`
          CREATE TABLE IF NOT EXISTS proxy_config (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            encrypted INTEGER DEFAULT 0,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) reject(err);
        });

        // Test insert
        testDb.run(`
          INSERT INTO proxy_config (key, value, encrypted) 
          VALUES (?, ?, ?)
        `, ['test_key', 'test_value', 0], (err) => {
          if (err) reject(err);
        });

        // Test select
        testDb.get('SELECT * FROM proxy_config WHERE key = ?', ['test_key'], (err, row) => {
          if (err) reject(err);
          assert(row, 'Should retrieve inserted row');
          assert.strictEqual(row.key, 'test_key', 'Key should match');
          assert.strictEqual(row.value, 'test_value', 'Value should match');
          testDb.close();
          resolve();
        });
      });
    });

    console.log('✅ Proxy Database Schema tests passed');
  } catch {
    console.error('❌ Proxy Database Schema tests failed:', err.message);
    throw err;
  }
}

/**
 * Test Configuration Encryption
 */
async function testConfigEncryption() {
  console.log('Testing Configuration Encryption...');

  try {
    const { encryptValue, decryptValue } = require('../../src/utils/encryption');

    const plaintext = 'my-secret-token-123';
    const encrypted = encryptValue(plaintext);

    assert(encrypted, 'Should return encrypted value');
    assert.notStrictEqual(encrypted, plaintext, 'Encrypted value should differ from plaintext');

    const decrypted = decryptValue(encrypted);
    assert.strictEqual(decrypted, plaintext, 'Decrypted value should match original');

    console.log('✅ Configuration Encryption tests passed');
  } catch {
    if (err.code === 'MODULE_NOT_FOUND') {
      console.log('⚠️  Encryption module not yet implemented (expected in TDD)');
    } else {
      console.error('❌ Configuration Encryption tests failed:', err.message);
      throw err;
    }
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('=== Proxy Configuration Tests ===\n');

  cleanupTestDb();

  try {
    await testProxyDatabaseSchema();
    await testConfigEncryption();
    await testProxyConfigService();

    // Ensure all pending operations are complete before finishing
    await new Promise(resolve => setImmediate(resolve));

    console.log('\n✅ All proxy configuration tests passed!');
  } catch {
    console.error('\n❌ Some tests failed');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
