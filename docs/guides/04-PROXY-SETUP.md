# Webhook Proxy Setup Guide

This guide explains how to set up and configure the bi-directional message proxy feature in VeraBot2.0.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Security Considerations](#security-considerations)
4. [Configuration](#configuration)
5. [Usage Examples](#usage-examples)
6. [Troubleshooting](#troubleshooting)
7. [API Reference](#api-reference)

## Overview

The webhook proxy feature allows VeraBot2.0 to:

- **Forward messages** from Discord channels to external webhooks (Discord → External System)
- **Receive messages** from external webhooks and relay them to Discord channels (External System → Discord)

This enables integration with external systems, logging, analytics, or custom workflows.

### Architecture

```
Discord → VeraBot → External Webhook (Outgoing)
External System → VeraBot Listener → Discord (Incoming)
```

### Key Features

- ✅ Bi-directional message forwarding
- ✅ Admin-only configuration commands
- ✅ Secure encrypted storage of tokens and secrets
- ✅ Channel-specific monitoring
- ✅ Automatic retry logic for failed requests
- ✅ HMAC signature verification for incoming webhooks
- ✅ No sensitive data in logs

## Prerequisites

1. **Discord Bot with Required Permissions:**
   - `GUILD_MESSAGES` - Read messages
   - `MESSAGE_CONTENT` - Access message content
   - `SEND_MESSAGES` - Send messages to channels
   - `ADMINISTRATOR` - Required to configure proxy settings

2. **Environment Variables:**
   ```env
   DISCORD_TOKEN=your_bot_token
   CLIENT_ID=your_client_id
   PROXY_PORT=3000  # Port for incoming webhook listener
   ENCRYPTION_KEY=your_64_character_hex_key  # Optional, auto-generated if not set
   ```

3. **External Webhook Endpoint** (for outgoing messages):
   - Must accept POST requests with JSON payload
   - Should support authentication via Bearer token

## Security Considerations

### 🔒 Secure Storage

All sensitive data is encrypted before storage:
- **Webhook tokens** - Encrypted in database
- **Webhook secrets** - Encrypted in database
- **Encryption key** - Stored in environment variable or auto-generated

### 🔐 Authentication

#### Outgoing Webhooks
- Uses Bearer token authentication
- Token sent in `Authorization` header: `Bearer <token>`

#### Incoming Webhooks
- HMAC SHA-256 signature verification
- Signature sent in `X-Webhook-Signature` header
- Prevents unauthorized message injection

### 🛡️ Best Practices

1. **Use HTTPS URLs** for webhook endpoints
2. **Rotate tokens regularly** - Update webhook token every 90 days
3. **Monitor logs** - Check for failed webhook attempts
4. **Limit monitored channels** - Only forward from necessary channels
5. **Use strong secrets** - Generate secrets with at least 32 bytes entropy
6. **Network security** - Restrict incoming webhook port with firewall rules

### 🚨 What NOT to Do

- ❌ Never commit `.env` file with real tokens
- ❌ Never expose webhook URLs publicly
- ❌ Never disable signature verification in production
- ❌ Never log full message content or tokens
- ❌ Never use HTTP (non-encrypted) for webhooks

## Configuration

### Step 1: Generate Encryption Key (Optional)

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to `.env`:
```env
ENCRYPTION_KEY=<generated_key>
```

### Step 2: Configure Webhook URL and Token

Use the `/proxy-config` command (Administrator only):

```
/proxy-config webhook-url:https://your-webhook-endpoint.com/webhook
/proxy-config webhook-token:your-secret-token-here
```

### Step 3: Configure Incoming Webhook Secret

Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set the secret:
```
/proxy-config webhook-secret:your-generated-secret
```

### Step 4: Add Monitored Channels

Add channels to monitor (right-click channel → Copy ID):

```
/proxy-config add-channel:123456789012345678
/proxy-config add-channel:987654321098765432
```

### Step 5: Enable the Proxy

```
/proxy-enable enabled:true
```

### Step 6: Verify Configuration

```
/proxy-status
```

You should see:
- ✅ Status: Enabled
- ✅ Webhook URL configured
- ✅ Token configured
- ✅ Secret configured
- ✅ Monitored channels listed

## Usage Examples

### Example 1: Basic Setup

```bash
# 1. Configure outgoing webhook
/proxy-config webhook-url:https://api.example.com/webhook
/proxy-config webhook-token:mySecretToken123

# 2. Add monitored channel
/proxy-config add-channel:123456789012345678

# 3. Enable proxy
/proxy-enable enabled:true

# 4. Test by sending a message in the monitored channel
```

### Example 2: Multi-Channel Monitoring

```bash
# Add multiple channels
/proxy-config add-channel:111111111111111111
/proxy-config add-channel:222222222222222222
/proxy-config add-channel:333333333333333333

# Remove a channel
/proxy-config remove-channel:222222222222222222

# View status
/proxy-status
```

### Example 3: Updating Configuration

```bash
# Update webhook URL
/proxy-config webhook-url:https://new-endpoint.com/webhook

# Update token
/proxy-config webhook-token:newToken456

# Changes take effect immediately (no restart needed)
```

### Example 4: Disabling Proxy

```bash
# Temporarily disable
/proxy-enable enabled:false

# Re-enable later
/proxy-enable enabled:true
```

### Example 5: Clearing All Configuration

```bash
# Clear monitored channels
/proxy-config clear-channels:true

# Disable proxy
/proxy-enable enabled:false
```

## Troubleshooting

### Issue: Webhook not receiving messages

**Symptoms:** Messages sent in monitored channels don't reach webhook

**Solutions:**
1. Check proxy is enabled: `/proxy-status`
2. Verify channel is in monitored list: `/proxy-status`
3. Check webhook URL is correct: `/proxy-status`
4. Test webhook URL manually with curl:
   ```bash
   curl -X POST https://your-webhook.com/webhook \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer your-token" \
     -d '{"content":"test","author":{"username":"test"},"channel":"test","timestamp":1234567890}'
   ```
5. Check bot logs for error messages

### Issue: Incoming webhooks fail

**Symptoms:** External system can't send messages to Discord

**Solutions:**
1. Verify webhook listener is running (check bot startup logs)
2. Check `PROXY_PORT` is correct and not blocked by firewall
3. Verify webhook secret is configured: `/proxy-status`
4. Test signature generation matches expected format
5. Check channel ID exists and bot has access

### Issue: "Invalid signature" errors

**Solutions:**
1. Ensure external system is generating correct HMAC signature
2. Verify secret matches on both sides
3. Check payload is exactly the same when generating signature
4. Example signature generation:
   ```javascript
   const crypto = require('crypto');
   const payload = JSON.stringify({content:"test",channel:"123"});
   const signature = crypto.createHmac('sha256', secret)
     .update(payload)
     .digest('hex');
   ```

### Issue: Messages not appearing in Discord

**Solutions:**
1. Check bot has `SEND_MESSAGES` permission in target channel
2. Verify channel ID is correct
3. Check payload format matches required structure
4. Review bot logs for errors

### Issue: High latency or timeouts

**Solutions:**
1. Check network connectivity between bot and webhook
2. Reduce number of monitored channels
3. Implement webhook endpoint caching
4. Consider increasing retry delay in code
5. Monitor webhook endpoint performance

## API Reference

### Outgoing Webhook Payload Format

When VeraBot forwards a message to your webhook, it sends:

```json
{
  "content": "Message text",
  "author": {
    "id": "123456789012345678",
    "username": "Username",
    "tag": "Username#1234"
  },
  "channel": "987654321098765432",
  "channelName": "general",
  "messageId": "111111111111111111",
  "timestamp": 1234567890000,
  "serverId": "555555555555555555",
  "serverName": "My Server"
}
```

### Incoming Webhook Request Format

To send a message to Discord via webhook, POST to:

```
http://your-bot-host:3000/webhook
```

**Headers:**
```
Content-Type: application/json
X-Webhook-Signature: <hmac-sha256-signature>
```

**Body:**
```json
{
  "content": "Message to send to Discord",
  "channel": "987654321098765432",
  "timestamp": 1234567890000,
  "metadata": {
    "source": "external-system",
    "custom": "data"
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "messageId": "111111111111111111"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Error message"
}
```

### Signature Generation

Generate HMAC SHA-256 signature for incoming webhooks:

**Node.js:**
```javascript
const crypto = require('crypto');

function generateSignature(payload, secret) {
  const payloadString = JSON.stringify(payload);
  return crypto.createHmac('sha256', secret)
    .update(payloadString)
    .digest('hex');
}

const payload = {
  content: "Hello Discord",
  channel: "123456789012345678"
};

const signature = generateSignature(payload, 'your-webhook-secret');
```

**Python:**
```python
import hmac
import hashlib
import json

def generate_signature(payload, secret):
    payload_string = json.dumps(payload, separators=(',', ':'))
    signature = hmac.new(
        secret.encode(),
        payload_string.encode(),
        hashlib.sha256
    ).hexdigest()
    return signature

payload = {
    "content": "Hello Discord",
    "channel": "123456789012345678"
}

signature = generate_signature(payload, "your-webhook-secret")
```

### Admin Commands Reference

#### `/proxy-config`
Configure webhook proxy settings (Admin only)

**Options:**
- `webhook-url` (optional) - Webhook URL to forward messages to
- `webhook-token` (optional) - Authentication token for webhook
- `webhook-secret` (optional) - Secret for incoming webhook verification
- `add-channel` (optional) - Add a channel ID to monitor
- `remove-channel` (optional) - Remove a channel ID from monitoring
- `clear-channels` (optional) - Clear all monitored channels

**Examples:**
```
/proxy-config webhook-url:https://api.example.com/webhook
/proxy-config webhook-token:myToken123
/proxy-config add-channel:123456789012345678
```

#### `/proxy-enable`
Enable or disable the webhook proxy (Admin only)

**Options:**
- `enabled` (required) - true to enable, false to disable

**Examples:**
```
/proxy-enable enabled:true
/proxy-enable enabled:false
```

#### `/proxy-status`
View current proxy configuration and status (Admin only)

**Examples:**
```
/proxy-status
```

Shows:
- Enabled/disabled status
- Webhook URL
- Token status (configured/not configured)
- Secret status (configured/not configured)
- List of monitored channels

## Advanced Configuration

### Custom Port Configuration

Change the default port (3000) in `.env`:

```env
PROXY_PORT=8080
```

Restart the bot for port changes to take effect.

### Rate Limiting

The proxy includes automatic retry logic:
- **Max retries:** 3 attempts
- **Retry delay:** 1 second (exponential backoff)
- **Timeout:** Configurable per webhook

To modify retry behavior, edit `src/services/WebhookProxyService.js`:

```javascript
// Default values
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
```

### Logging and Monitoring

All proxy operations are logged with appropriate error levels:
- `LOW` - Minor issues (e.g., signature verification failures)
- `MEDIUM` - Webhook failures, configuration errors
- `HIGH` - Critical errors affecting service

Check logs for patterns:
```bash
grep "WebhookProxyService" logs/bot.log
grep "WebhookListenerService" logs/bot.log
```

### Webhook Testing Tools

Test your webhook integration:

```bash
# Test outgoing webhook endpoint
curl -X POST https://your-webhook.com/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d @test-payload.json

# Test incoming webhook to bot
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: computed-signature" \
  -d '{"content":"Test message","channel":"123456789012345678"}'
```

## Support

For issues or questions:
1. Check this documentation first
2. Review bot logs for error messages
3. Test webhook endpoints independently
4. Open an issue on GitHub with:
   - Bot version
   - Configuration (without sensitive data)
   - Error messages
   - Steps to reproduce

## Security Disclosure

If you discover a security vulnerability in the webhook proxy:
- ⚠️ **DO NOT** open a public issue
- 📧 Contact the maintainers privately
- 🔒 Include details and reproduction steps
- ⏱️ Allow time for patching before disclosure
