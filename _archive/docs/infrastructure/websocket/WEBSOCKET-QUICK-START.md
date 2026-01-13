# WebSocket Integration - Quick Reference

Fast setup guide for external WebSocket services (XToys, etc.)

## 5-Minute Setup

### 1. Get Webhook ID

For XToys: App → Webhooks → Create private webhook → Copy ID

### 2. Add to .env

```env
XTOYS_WEBHOOK_URL=wss://webhook.xtoys.app/YOUR_WEBHOOK_ID_HERE
```

### 3. Configure Service

Edit `src/config/external-actions.js`:

```javascript
module.exports = {
  xtoys: {
    enabled: true,
    webhookUrl: process.env.XTOYS_WEBHOOK_URL,
    allowedActions: ['discord_message', 'notification', 'ping'],
    description: 'XToys notifications',
    contactEmail: 'admin@example.com',
  },
};
```

### 4. Initialize in Bot

In `src/index.js`, add to client.on('ready') event:

```javascript
const WebSocketService = require('./services/WebSocketService');
const ExternalActionHandler = require('./services/ExternalActionHandler');
const externalActionsConfig = require('./config/external-actions');

for (const [serviceName, config] of Object.entries(externalActionsConfig)) {
  if (!config.enabled) continue;

  await WebSocketService.connect(serviceName, config.webhookUrl, config.allowedActions, (action, payload) => {
    ExternalActionHandler.executeAction(client, action, payload).catch(console.error);
  });
}
```

### 5. Test It

```
/external-action-status                 # Should show xtoys connected
/external-action-send service:xtoys action:ping  # Should work
```

Done! ✅

## Built-in Actions Quick Reference

### discord_message

Send message to channel

```json
{ "action": "discord_message", "channelId": "123", "message": "Hello!" }
```

### discord_dm

Send DM to user

```json
{ "action": "discord_dm", "userId": "456", "message": "Hi!" }
```

### discord_role

Add/remove role

```json
{ "action": "discord_role", "guildId": "111", "userId": "222", "roleId": "333", "action": "add" }
```

### notification

Log notification

```json
{ "action": "notification", "message": "Something happened", "level": "info" }
```

### ping

Health check

```json
{ "action": "ping" }
```

## Commands

```
/external-action-status [service]              # Check status
/external-action-send service:X action:Y [data]  # Send action
```

## Security Checklist

- ✅ Only add services you trust
- ✅ Use environment variables for webhook URLs
- ✅ Only add actions you need
- ✅ Review action implementations
- ✅ Test before enabling in production
- ✅ Monitor logs regularly

## For Full Documentation

See: `docs/guides/06-EXTERNAL-WEBSOCKET-SETUP.md`

---

**Files Created:**

- `src/services/WebSocketService.js` - Core WebSocket
- `src/services/ExternalActionHandler.js` - Action execution
- `src/config/external-actions.js` - Configuration
- `src/commands/admin/external-action-status.js` - Status command
- `src/commands/admin/external-action-send.js` - Send command
- `docs/guides/06-EXTERNAL-WEBSOCKET-SETUP.md` - Full guide
