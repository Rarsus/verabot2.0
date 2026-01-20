# VeraBot Dashboard - API Routes Reference

Complete documentation of all API endpoints available in the VeraBot Dashboard.

## Base URL

```
http://localhost:8080/api/dashboard
```

## Authentication

All endpoints except health checks require valid authentication:

```
Authorization: Bearer <JWT_TOKEN>
```

For server-to-server communication:
```
Authorization: Bearer <BOT_API_TOKEN>
```

## Endpoints

### Admin Verification

#### POST /auth/verify-admin

Verify if a user has admin access to the bot.

**Request:**
```json
{
  "userId": "user-id-123",
  "guilds": ["guild-id-1", "guild-id-2"]
}
```

**Response (Success):**
```json
{
  "success": true,
  "isAdmin": true,
  "adminGuilds": ["guild-id-1"],
  "reason": "bot_owner"
}
```

**Response (Not Admin):**
```json
{
  "success": true,
  "isAdmin": false,
  "adminGuilds": []
}
```

**Status Codes:**
- `200` - Request successful
- `400` - Invalid request body
- `503` - Bot client not available

---

### Bot Status

#### GET /bot/status

Get current bot status and metrics.

**Response:**
```json
{
  "success": true,
  "online": true,
  "uptime": 3600000,
  "latency": 45,
  "memory": 52428800,
  "timestamp": 1642000000000
}
```

**Fields:**
- `online` - Bot is ready and online
- `uptime` - Milliseconds since bot started
- `latency` - Discord WebSocket ping in milliseconds
- `memory` - Heap memory used in bytes
- `timestamp` - Request timestamp

**Status Codes:**
- `200` - Success
- `500` - Error retrieving status

---

### Bot Information

#### GET /bot/info

Get basic bot information.

**Response:**
```json
{
  "success": true,
  "username": "VeraBot",
  "userId": "bot-id-123",
  "avatar": "https://cdn.discordapp.com/avatars/...",
  "version": "3.4.0",
  "prefix": "!",
  "ready": true
}
```

**Fields:**
- `username` - Bot's Discord username
- `userId` - Bot's Discord ID
- `avatar` - Bot's avatar URL
- `version` - Package version
- `prefix` - Command prefix
- `ready` - Bot is ready

**Status Codes:**
- `200` - Success
- `500` - Error retrieving info

---

### Bot Statistics

#### GET /bot/stats

Get bot statistics and cache sizes.

**Response:**
```json
{
  "success": true,
  "guildCount": 142,
  "userCount": 25000,
  "channelCount": 8500,
  "commandCount": 42
}
```

**Fields:**
- `guildCount` - Number of guilds bot is in
- `userCount` - Total unique users in cache
- `channelCount` - Total channels in cache
- `commandCount` - Number of registered commands

**Status Codes:**
- `200` - Success
- `500` - Error retrieving stats

---

### Guild List

#### GET /bot/guilds

Get list of all guilds the bot is in.

**Response:**
```json
{
  "success": true,
  "guilds": [
    {
      "id": "guild-id-123",
      "name": "My Discord Server",
      "icon": "https://cdn.discordapp.com/icons/...",
      "memberCount": 500,
      "owner": "owner-id-456"
    }
  ]
}
```

**Guild Object:**
- `id` - Guild ID
- `name` - Guild name
- `icon` - Guild icon URL
- `memberCount` - Member count in guild
- `owner` - Guild owner ID

**Status Codes:**
- `200` - Success
- `500` - Error retrieving guilds

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes:**
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (missing/invalid authentication)
- `403` - Forbidden (insufficient permissions)
- `500` - Server Error (unexpected error)
- `503` - Service Unavailable (Discord client not ready)

---

## Rate Limiting

Currently no rate limiting is implemented. Please avoid making excessive requests.

---

## Examples

### Check if user is admin

```bash
curl -X POST http://localhost:8080/api/dashboard/auth/verify-admin \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "123456789",
    "guilds": ["guild-id-1", "guild-id-2"]
  }'
```

### Get bot status

```bash
curl http://localhost:8080/api/dashboard/bot/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get bot info

```bash
curl http://localhost:8080/api/dashboard/bot/info \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get all guilds

```bash
curl http://localhost:8080/api/dashboard/bot/guilds \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## See Also

- [Controllers Documentation](./controllers.md) - Detailed controller implementation
- [Middleware Documentation](./middleware.md) - Authentication and middleware
- [Testing Guide](./testing-guide.md) - How to write tests for routes
