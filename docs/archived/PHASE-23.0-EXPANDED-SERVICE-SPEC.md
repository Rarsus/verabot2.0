# GlobalProxyConfigService - Expanded Specification (Phase 23.0 - Full Scope)

**Status:** Specification Phase  
**Target:** Consolidate HTTP Proxy + Webhook Proxy into single service  
**Scope:** Replace DatabaseService + ProxyConfigService entirely  

## Overview

Consolidate both HTTP proxy settings and webhook proxy configuration into a single, comprehensive `GlobalProxyConfigService`. This service handles ALL global proxy-related configuration for the application.

## Unified Service Methods

### HTTP Proxy Configuration
These methods manage the application's HTTP proxy for outbound requests.

```javascript
// HTTP Proxy URL
async getProxyUrl()                    // Returns: 'http://proxy.example.com:8080' | null
async setProxyUrl(url)                 // Sets proxy URL, validates format

// HTTP Proxy Credentials
async getProxyUsername()               // Returns: decrypted username | null
async setProxyUsername(username)       // Sets and encrypts username

async getProxyPassword()               // Returns: decrypted password | null
async setProxyPassword(password)       // Sets and encrypts password

// HTTP Proxy Enable/Disable
async isProxyEnabled()                 // Returns: true | false
async setProxyEnabled(enabled)         // Sets proxy active status (true/false)

// HTTP Proxy Validation
async validateProxyConfig()            // Validates URL format, required fields
```

### Webhook Proxy Configuration
These methods manage webhook proxy for receiving/forwarding Discord webhooks (Stripe, etc).

```javascript
// Webhook Configuration
async getWebhookUrl()                  // Returns: webhook URL | null
async setWebhookUrl(url)               // Sets webhook URL

async getWebhookToken()                // Returns: decrypted token | null
async setWebhookToken(token)           // Sets and encrypts token

async getWebhookSecret()               // Returns: decrypted secret | null
async setWebhookSecret(secret)         // Sets and encrypts secret

// Webhook Monitoring
async getMonitoredChannels()           // Returns: [channel_id, ...] | []
async setMonitoredChannels(channels)   // Sets array of channel IDs to monitor

async addMonitoredChannel(channelId)   // Adds single channel to monitor
async removeMonitoredChannel(channelId)// Removes channel from monitoring

// Webhook Management
async isWebhookEnabled()               // Returns: true | false
async setWebhookEnabled(enabled)       // Enable/disable webhook processing
```

### Unified Configuration Methods

```javascript
// Get all configuration (without sensitive data)
async getAllConfig()                   
// Returns: {
//   httpProxy: { url, username, enabled },
//   webhook: { url, hasToken, hasSecret, monitoredChannels, enabled },
//   lastUpdated
// }

// Get complete config with sensitive data (use carefully)
async getFullConfig()                  
// Returns: {
//   httpProxy: { url, username, password, enabled },
//   webhook: { url, token, secret, monitoredChannels, enabled },
//   lastUpdated
// }

// Clear all configuration
async deleteAllConfig()                // Deletes HTTP + webhook config

// Clear HTTP proxy only
async deleteHttpProxyConfig()

// Clear webhook only
async deleteWebhookConfig()
```

### Validation & Testing
```javascript
async validateProxyConfig()            // Validates HTTP proxy settings
async validateWebhookConfig()          // Validates webhook settings
async testHttpProxyConnection()        // Tests HTTP proxy connectivity
async testWebhookEndpoint()            // Tests webhook URL accessibility
```

## Database Storage

### Single Configuration Table
Use `global_config` table with key-value structure for all settings:

```sql
CREATE TABLE IF NOT EXISTS global_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  encrypted INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Keys Used:**
- `http_proxy_url` - HTTP proxy URL
- `http_proxy_username` - HTTP proxy username (encrypted)
- `http_proxy_password` - HTTP proxy password (encrypted)
- `http_proxy_enabled` - HTTP proxy enabled flag
- `webhook_url` - Webhook URL
- `webhook_token` - Webhook token (encrypted)
- `webhook_secret` - Webhook secret (encrypted)
- `webhook_monitored_channels` - JSON array of channel IDs
- `webhook_enabled` - Webhook enabled flag

## Security Features

1. **Encryption:** Passwords, tokens, and secrets encrypted with AES-256-CBC
2. **Key Derivation:** PBKDF2 from ENCRYPTION_SECRET environment variable
3. **IV Generation:** Random IV per password (not reused)
4. **Validation:** URL format validation for all proxy URLs

## Performance Features

1. **Caching:** 5-minute TTL for frequently accessed config values
2. **Batch Operations:** `getAllConfig()` for single DB call instead of multiple
3. **Lazy Loading:** Credentials only decrypted when requested

## Error Handling

All methods throw specific errors:
- `ValidationError` - Invalid URL format, required field missing
- `EncryptionError` - Encryption/decryption failure
- `DatabaseError` - Database connection or query failure

## Migration Path

### Replace ProxyConfigService
Old code:
```javascript
const ProxyConfigService = require('../../services/ProxyConfigService');
const database = require('../../services/DatabaseService');
const proxyConfig = new ProxyConfigService(database);

await proxyConfig.setWebhookUrl(url);
await proxyConfig.getMonitoredChannels();
```

New code:
```javascript
const globalProxy = require('../../services/GlobalProxyConfigService');

await globalProxy.setWebhookUrl(url);
await globalProxy.getMonitoredChannels();
```

### Affected Files
1. `src/commands/admin/proxy-enable.js`
2. `src/commands/admin/proxy-config.js`
3. `src/commands/admin/proxy-status.js`
4. `src/services/ProxyConfigService.js` (becomes obsolete)

## Test Coverage (TDD RED Phase)

**Total Tests: 80+**

Categories:
1. Module initialization (2 tests)
2. HTTP Proxy URL operations (6 tests)
3. HTTP Proxy credentials encryption (12 tests)
4. HTTP Proxy enable/disable (4 tests)
5. Webhook URL operations (6 tests)
6. Webhook token/secret encryption (12 tests)
7. Webhook monitoring channels (8 tests)
8. Webhook enable/disable (4 tests)
9. Unified config retrieval (6 tests)
10. Validation methods (8 tests)
11. Cleanup operations (4 tests)
12. Error handling (6 tests)

## Completion Criteria

- ✅ All 80+ tests passing (RED → GREEN)
- ✅ Zero test regressions (2827+ existing tests pass)
- ✅ ProxyConfigService completely replaced
- ✅ All proxy commands use GlobalProxyConfigService
- ✅ All encryption working correctly
- ✅ Configuration persists correctly across restarts
