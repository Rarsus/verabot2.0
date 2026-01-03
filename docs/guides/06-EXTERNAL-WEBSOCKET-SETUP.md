# External WebSocket Integration Guide

Complete guide to integrating external WebSocket services (like XToys) with VeraBot2.0.

## Overview

The WebSocket integration allows VeraBot to:
- **Receive actions** from external services via WebSocket
- **Execute approved commands** based on incoming actions
- **Send messages** to Discord channels and users
- **Manage roles** and other Discord operations
- **Maintain security** through action whitelisting and validation

## Architecture

```
External Service (XToys, etc.)
         ↓ (WebSocket)
   WebSocketService
         ↓
ExternalActionHandler
         ↓
Discord Bot Operations
(send messages, assign roles, etc.)
```

## Security Model

**CRITICAL: Only add services and actions you explicitly trust.**

### Three Layers of Protection

1. **Service Whitelisting** (external-actions.js)
   - Only enabled services can connect
   - Each service must be explicitly configured

2. **Action Whitelisting** (external-actions.js)
   - Each service has list of approved actions
   - Incoming actions must be in the approved list
   - Unknown actions are rejected with acknowledgment

3. **Action Validation** (ExternalActionHandler)
   - Each action validates its input parameters
   - Actions cannot exceed their intended scope
   - All actions are logged for audit trail

## Setup Instructions

### Step 1: Configure External Service

Edit `src/config/external-actions.js`:

```javascript
module.exports = {
  xtoys: {
    enabled: true,  // Set to true to activate
    webhookUrl: process.env.XTOYS_WEBHOOK_URL || 'wss://webhook.xtoys.app/YOUR_WEBHOOK_ID',
    allowedActions: [
      'discord_message',  // Send to channel
      'discord_dm',       // Send DM
      'notification',     // Log notification
      'ping'             // Health check
    ],
    description: 'XToys webhook integration',
    contactEmail: 'admin@example.com'
  }
};
```

### Step 2: Set Environment Variables

Add to `.env` file:

```env
# External Services
XTOYS_WEBHOOK_URL=wss://webhook.xtoys.app/YOUR_WEBHOOK_ID_HERE
```

**Security Note:** Never commit webhook URLs. Use environment variables.

### Step 3: Initialize Connection

In your bot's ready event or startup (e.g., `src/index.js`):

```javascript
const WebSocketService = require('./services/WebSocketService');
const ExternalActionHandler = require('./services/ExternalActionHandler');
const externalActionsConfig = require('./config/external-actions');

// After bot is ready
client.on('ready', async () => {
  // Connect to configured services
  for (const [serviceName, config] of Object.entries(externalActionsConfig)) {
    if (!config.enabled) continue;

    const actionHandler = (action, payload) => {
      try {
        ExternalActionHandler.executeAction(client, action, payload);
      } catch (err) {
        console.error(`Error handling ${action}:`, err.message);
      }
    };

    await WebSocketService.connect(
      serviceName,
      config.webhookUrl,
      config.allowedActions,
      actionHandler
    );
  }
});
```

## Built-in Actions

### discord_message

Send message to a Discord channel.

**Payload:**
```json
{
  "action": "discord_message",
  "channelId": "123456789",
  "message": "Hello from XToys!",
  "embed": {
    "title": "Notification",
    "description": "Some message",
    "color": 0x51CF66
  }
}
```

**Parameters:**
- `channelId` (required): Discord channel ID
- `message` (required): Message text
- `embed` (optional): Discord embed object

**Returns:**
```json
{
  "status": "ok",
  "messageId": "message_id_here",
  "channelId": "123456789"
}
```

### discord_dm

Send direct message to Discord user.

**Payload:**
```json
{
  "action": "discord_dm",
  "userId": "987654321",
  "message": "Private message"
}
```

**Parameters:**
- `userId` (required): Discord user ID
- `message` (required): Message text
- `embed` (optional): Discord embed object

**Returns:**
```json
{
  "status": "ok",
  "messageId": "message_id_here",
  "userId": "987654321"
}
```

### discord_role

Assign or remove role from user.

**Payload:**
```json
{
  "action": "discord_role",
  "guildId": "guild_id",
  "userId": "user_id",
  "roleId": "role_id",
  "action": "add"
}
```

**Parameters:**
- `guildId` (required): Discord guild ID
- `userId` (required): Discord user ID
- `roleId` (required): Discord role ID
- `action` (required): "add" or "remove"

**Returns:**
```json
{
  "status": "ok",
  "action": "add",
  "userId": "user_id",
  "roleId": "role_id",
  "guildId": "guild_id"
}
```

### notification

Send generic notification (logged only, no Discord action).

**Payload:**
```json
{
  "action": "notification",
  "message": "Server event occurred",
  "level": "info"
}
```

**Parameters:**
- `message` (required): Notification text
- `level` (optional): "info", "warning", or "error"

**Returns:**
```json
{
  "status": "ok",
  "message": "Server event occurred",
  "level": "info"
}
```

### ping

Health check / keep-alive.

**Payload:**
```json
{
  "action": "ping"
}
```

**Returns:**
```json
{
  "status": "ok",
  "pong": true,
  "timestamp": "2026-01-04T12:34:56.789Z"
}
```

## Admin Commands

### /external-action-status

Check status of all or specific WebSocket service.

**Usage:**
```
/external-action-status                 # Show all services
/external-action-status service:xtoys   # Show specific service
```

**Output:**
- Connection status (connected/disconnected)
- Message count
- Error count
- Allowed actions

### /external-action-send

Send approved action to external service.

**Usage:**
```
/external-action-send service:xtoys action:ping
/external-action-send service:xtoys action:notification data:"{\"message\":\"test\"}"
```

**Parameters:**
- `service` (required): Service name
- `action` (required): Action name (must be approved for that service)
- `data` (optional): JSON object with additional parameters

## Creating Custom Actions

### 1. Implement Handler

In `src/services/ExternalActionHandler.js`, add a handler method:

```javascript
async _handleCustomAction(client, payload) {
  const { customParam } = payload;
  
  if (!customParam) {
    throw new Error('customParam is required');
  }

  // Do something with customParam
  // Return result object
  return {
    success: true,
    result: 'action result'
  };
}
```

### 2. Register Handler

In the constructor's `_registerDefaultHandlers()`:

```javascript
this.register('custom_action', this._handleCustomAction.bind(this));
```

### 3. Add to Whitelist

In `src/config/external-actions.js`:

```javascript
module.exports = {
  xtoys: {
    // ...
    allowedActions: [
      'discord_message',
      'custom_action'  // Add here
    ]
  }
};
```

### 4. Test

Use the admin command to test:

```
/external-action-send service:xtoys action:custom_action data:"{\"customParam\":\"test\"}"
```

## Logging & Monitoring

All WebSocket activity is logged to the error handler system:

- **Connection events** (connect, disconnect, reconnect)
- **Message processing** (received, parsed, validated)
- **Action execution** (success, errors)
- **Acknowledgments** (sent to external service)

View logs to audit all external service activity.

## Error Handling

Errors are sent back to the external service via acknowledgment:

**Unknown action:**
```json
{
  "__ack": true,
  "status": "error",
  "reason": "unauthorized_action",
  "action": "invalid_action",
  "message": "Action not in approved list"
}
```

**Handler error:**
```json
{
  "__ack": true,
  "status": "error",
  "reason": "handler_error",
  "action": "discord_message",
  "message": "Error processing action"
}
```

**Invalid message:**
```json
{
  "__ack": true,
  "status": "error",
  "reason": "invalid_action_field",
  "message": "Action field missing or not a string"
}
```

## Troubleshooting

### WebSocket Won't Connect

1. **Check webhook URL**
   - Verify URL in environment variables
   - Ensure it starts with `wss://` (secure WebSocket)
   - Test URL format is correct

2. **Check service is enabled**
   ```javascript
   // In external-actions.js
   enabled: true  // Must be true
   ```

3. **Check network connectivity**
   - Verify bot can reach external service
   - Check firewall rules allow WebSocket connections

### Actions Not Being Received

1. **Check allowedActions list**
   - Action must be in the configuration's allowedActions
   - Verify action name spelling

2. **Check external service payload**
   - Must include `"action"` field
   - Action must be a string

3. **Check logs**
   - Look for "unauthorized_action" errors
   - Verify action is being received

### Message Not Sent to Discord

1. **Check channel/user exists**
   - Verify channelId or userId is correct
   - Bot must have access to that channel/user

2. **Check permissions**
   - Bot needs SEND_MESSAGES permission for channels
   - Check role permissions if assigning roles

3. **Check rate limits**
   - Discord has rate limits on messages
   - Space out high-volume messages

## Security Best Practices

1. **Regular Audits**
   - Review allowed services quarterly
   - Remove services that are no longer used
   - Review action handlers for security issues

2. **Access Control**
   - Only admins can use external-action commands
   - Use Discord permissions appropriately
   - Audit who has admin access

3. **Webhook URL Management**
   - Store in environment variables
   - Never commit to Git
   - Rotate webhook IDs periodically
   - Monitor webhook usage

4. **Action Validation**
   - Always validate action payloads
   - Use appropriate error messages
   - Log suspicious activity
   - Implement rate limiting if needed

5. **Monitor Logs**
   - Review error logs regularly
   - Watch for repeated failures
   - Alert on unusual patterns
   - Keep audit trail of all actions

## Example: XToys Integration

Complete example setup for XToys webhook:

### 1. Get Webhook ID

Go to XToys app → Webhooks → Create private webhook → Copy webhook ID

### 2. Configure Bot

**.env:**
```env
XTOYS_WEBHOOK_URL=wss://webhook.xtoys.app/abc123def456ghi789
```

**src/config/external-actions.js:**
```javascript
module.exports = {
  xtoys: {
    enabled: true,
    webhookUrl: process.env.XTOYS_WEBHOOK_URL,
    allowedActions: ['discord_message', 'discord_dm', 'notification', 'ping'],
    description: 'XToys event notifications',
    contactEmail: 'admin@example.com'
  }
};
```

### 3. Initialize in Bot

In `src/index.js`:
```javascript
const WebSocketService = require('./services/WebSocketService');
const ExternalActionHandler = require('./services/ExternalActionHandler');
const externalActionsConfig = require('./config/external-actions');

client.on('ready', async () => {
  for (const [serviceName, config] of Object.entries(externalActionsConfig)) {
    if (!config.enabled) continue;
    
    await WebSocketService.connect(
      serviceName,
      config.webhookUrl,
      config.allowedActions,
      (action, payload) => {
        ExternalActionHandler.executeAction(client, action, payload).catch(console.error);
      }
    );
  }
});
```

### 4. Send Test Message

```
/external-action-send service:xtoys action:ping
```

Should return: `{"status":"ok","pong":true,"timestamp":"..."}`

## API Reference

### WebSocketService

```javascript
// Connect to service
await WebSocketService.connect(
  serviceName,      // string
  webhookUrl,       // string
  allowedActions,   // string[]
  actionHandler     // function(action, payload)
)

// Disconnect from service
await WebSocketService.disconnect(serviceName)

// Send data
WebSocketService.send(serviceName, payload)

// Get status
WebSocketService.getStatus([serviceName])

// Get connected services
WebSocketService.getConnectedServices()

// Check if connected
WebSocketService.isConnected(serviceName)
```

### ExternalActionHandler

```javascript
// Execute action
await ExternalActionHandler.executeAction(client, action, payload)

// Register custom action
ExternalActionHandler.register(actionName, handlerFunction)

// Get registered actions
ExternalActionHandler.getRegisteredActions()
```

## Support

For issues or questions:
1. Check logs in error handler output
2. Verify configuration in external-actions.js
3. Test with /external-action-status
4. Review this guide for similar scenarios
5. Contact bot administrator

---

**Last Updated:** January 4, 2026  
**Version:** 1.0.0
