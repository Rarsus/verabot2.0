# VeraBot Dashboard Integration Guide

Complete guide for setting up and integrating the VeraBot React Dashboard with your Discord bot.

## Overview

The VeraBot Dashboard is a full-featured admin panel for managing:
- Bot status and statistics
- WebSocket service configurations
- Quote management system
- Guild and command information

## Architecture

```
┌─────────────────────────────────────────────────────┐
│         React Dashboard (Frontend)                   │
│  - Dashboard UI                                      │
│  - WebSocket Configuration Panel                    │
│  - Quote Management Interface                       │
│  - Real-time Status Monitoring                      │
└─────────────┬───────────────────────────────────────┘
              │ HTTPS/REST API Calls
              ↓
┌─────────────────────────────────────────────────────┐
│    VeraBot Discord Bot (Backend)                     │
│  - Discord.js Integration                           │
│  - WebSocket Service (External integrations)        │
│  - Quote Database                                   │
│  - API Server (Express/Fastify)                     │
└─────────────────────────────────────────────────────┘
```

## Installation & Setup

### 1. Dashboard Installation

```bash
cd /mnt/c/repo/verabot2.0/dashboard
npm install
```

### 2. Environment Configuration

Create `.env` file in `dashboard/` directory:

```env
# Development
VITE_API_URL=http://localhost:3000/api

# Production
# VITE_API_URL=https://your-bot-domain.com/api
```

### 3. Start Development Server

```bash
npm run dev
```

Dashboard accessible at: `http://localhost:5173`

### 4. Bot API Setup

The dashboard requires an API server in your bot. Add the following to your bot's main entry point:

#### Option A: Express API Server

```javascript
// src/api/server.js
const express = require('express');
const cors = require('cors');
const router = require('./routes');

const app = express();

app.use(cors({
  origin: process.env.DASHBOARD_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use('/api', router);

const PORT = process.env.API_PORT || 3000;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});

module.exports = app;
```

#### Option B: Fastify API Server

```javascript
// src/api/server.js
const fastify = require('fastify');
const cors = require('@fastify/cors');
const router = require('./routes');

const app = fastify({ logger: true });

app.register(cors, {
  origin: process.env.DASHBOARD_URL || 'http://localhost:5173',
  credentials: true
});

app.register(router, { prefix: '/api' });

const PORT = process.env.API_PORT || 3000;
app.listen({ port: PORT }, (err) => {
  if (err) throw err;
  console.log(`API server running on port ${PORT}`);
});

module.exports = app;
```

## API Implementation

### Required Endpoints

The dashboard requires the following endpoints to be implemented:

#### Authentication

```javascript
// POST /api/auth/verify
// Verify bot admin token
app.post('/api/auth/verify', (req, res) => {
  const { token } = req.body;
  const adminToken = process.env.ADMIN_TOKEN;
  
  if (token === adminToken) {
    res.json({
      success: true,
      user: { id: 'admin', name: 'Admin User' }
    });
  } else {
    res.status(401).json({ error: 'Invalid token' });
  }
});
```

#### Bot Status & Info

```javascript
// GET /api/bot/status
app.get('/api/bot/status', (req, res) => {
  const client = req.app.locals.discordClient;
  res.json({
    online: client.isReady(),
    uptime: client.uptime,
    latency: client.ws.ping,
    memory: process.memoryUsage().heapUsed
  });
});

// GET /api/bot/info
app.get('/api/bot/info', (req, res) => {
  const client = req.app.locals.discordClient;
  res.json({
    username: client.user.username,
    userId: client.user.id,
    version: process.env.npm_package_version,
    prefix: process.env.PREFIX
  });
});

// GET /api/bot/stats
app.get('/api/bot/stats', (req, res) => {
  const client = req.app.locals.discordClient;
  res.json({
    guildCount: client.guilds.cache.size,
    userCount: client.users.cache.size,
    commandCount: client.application?.commands?.cache?.size || 0,
    messageCount: 0 // Track this separately
  });
});
```

#### WebSocket Services

```javascript
// GET /api/websocket/services
app.get('/api/websocket/services', (req, res) => {
  const webSocketService = req.app.locals.webSocketService;
  const config = require('../config/external-actions');
  
  const services = Array.from(config.entries()).map(([name, cfg]) => ({
    name,
    enabled: cfg.enabled,
    description: cfg.description,
    webhookUrl: cfg.webhookUrl ? cfg.webhookUrl.substring(0, 20) + '...' : '',
    allowedActions: cfg.allowedActions,
    isConnected: webSocketService.isConnected(name)
  }));
  
  res.json(services);
});

// PUT /api/websocket/services/:name
app.put('/api/websocket/services/:name', (req, res) => {
  const { name } = req.params;
  const { enabled, webhookUrl, allowedActions } = req.body;
  const config = require('../config/external-actions');
  
  const service = config.get(name);
  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }
  
  service.enabled = enabled;
  service.webhookUrl = webhookUrl;
  service.allowedActions = allowedActions;
  
  res.json({ success: true, service });
});

// GET /api/websocket/status/:name
app.get('/api/websocket/status/:name', (req, res) => {
  const { name } = req.params;
  const webSocketService = req.app.locals.webSocketService;
  
  const status = webSocketService.getStatus(name);
  res.json(status || { error: 'Service not found' });
});

// POST /api/websocket/test/:name
app.post('/api/websocket/test/:name', async (req, res) => {
  const { name } = req.params;
  const webSocketService = req.app.locals.webSocketService;
  
  try {
    const result = await webSocketService.testConnection(name);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### Quote Management

```javascript
// GET /api/quotes
app.get('/api/quotes', async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const quoteService = req.app.locals.quoteService;
  
  const quotes = await quoteService.getAll(page, limit);
  const total = await quoteService.count();
  
  res.json({ quotes, total });
});

// POST /api/quotes
app.post('/api/quotes', async (req, res) => {
  const { text, author } = req.body;
  const quoteService = req.app.locals.quoteService;
  
  const quote = await quoteService.add(text, author);
  res.json(quote);
});

// DELETE /api/quotes/:id
app.delete('/api/quotes/:id', async (req, res) => {
  const { id } = req.params;
  const quoteService = req.app.locals.quoteService;
  
  await quoteService.delete(id);
  res.json({ success: true });
});

// GET /api/quotes/stats
app.get('/api/quotes/stats', async (req, res) => {
  const quoteService = req.app.locals.quoteService;
  
  const stats = await quoteService.getStats();
  res.json(stats);
});
```

## Integration with Existing Bot

### Step 1: Mount API Server

In `src/index.js`:

```javascript
const client = new Discord.Client({ intents: [...] });
const apiServer = require('./api/server');

client.once('ready', () => {
  console.log(`✓ Bot ready as ${client.user.tag}`);
  
  // Mount API endpoints
  apiServer.locals = {
    discordClient: client,
    webSocketService: require('./services/WebSocketService'),
    quoteService: require('./services/QuoteService')
  };
});
```

### Step 2: Environment Variables

Add to `.env`:

```env
# Bot Configuration
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_client_id
PREFIX=!

# API Configuration
API_PORT=3000
ADMIN_TOKEN=your_secure_admin_token
DASHBOARD_URL=http://localhost:5173

# WebSocket Configuration
XTOYS_WEBHOOK_URL=wss://webhook.xtoys.app/YOUR_ID
```

### Step 3: Install API Dependencies

```bash
# For Express
npm install express cors

# For Fastify
npm install fastify @fastify/cors
```

## Dashboard Features in Detail

### Bot Status Panel

Displays:
- Online/offline status with real-time indicator
- Uptime in readable format (days, hours, minutes)
- WebSocket ping latency in milliseconds
- Memory usage with automatic formatting (B, KB, MB, GB)
- Bot username and user ID
- Bot version
- Default command prefix
- Guild count, user count, command count, message count

### WebSocket Configuration Panel

Allows:
- View all configured external services
- Enable/disable services without restart
- Edit webhook URLs securely
- Configure allowed actions per service
- Test connections in real-time
- View connection status indicators
- Monitor message and error counts

### Quote Management Panel

Features:
- Paginated quote browser (10 per page)
- Add new quotes with author attribution
- Delete quotes with confirmation
- View quote statistics:
  - Total quote count
  - Average rating
  - Most rated quote
  - Total tags used
- Expandable quote details
- Responsive layout

## Security Considerations

### Authentication
- Use strong admin tokens (generate with: `crypto.randomBytes(32).toString('hex')`)
- Store tokens in `.env` file, never commit to git
- Verify token on every protected endpoint

### API Protection
- Enable CORS only for dashboard domain
- Use HTTPS in production
- Implement rate limiting
- Add request validation

### Data Sensitivity
- Never expose full webhook URLs to frontend (truncate)
- Mask sensitive configuration values
- Log all admin actions
- Use secure session cookies

## Monitoring & Logs

The dashboard stores authentication status locally. For production monitoring:

```javascript
// Log dashboard access
app.use('/api', (req, res, next) => {
  console.log(`[DASHBOARD] ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
```

## Troubleshooting

### Dashboard can't connect to API

```bash
# Check if API server is running
curl http://localhost:3000/api/bot/status

# Check VITE_API_URL in dashboard .env
cat dashboard/.env

# Verify CORS is enabled
# Check browser console for CORS errors
```

### Authentication fails

```bash
# Verify admin token
echo $ADMIN_TOKEN

# Test token endpoint
curl -X POST http://localhost:3000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"token":"your_token"}'
```

### WebSocket services not showing

```bash
# Verify services are configured
cat src/config/external-actions.js

# Check WebSocketService is initialized
# Review bot logs for initialization errors
```

## Performance Tips

1. **Caching**: Implement Redis for frequently accessed data
2. **Rate Limiting**: Use express-rate-limit for API endpoints
3. **Pagination**: Always paginate large datasets
4. **Compression**: Enable gzip compression on API responses
5. **CDN**: Serve static dashboard from CDN in production

## Production Deployment

### Docker Compose

```yaml
version: '3.8'

services:
  bot:
    build: .
    environment:
      DISCORD_TOKEN: ${DISCORD_TOKEN}
      API_PORT: 3000
    ports:
      - "3000:3000"
    networks:
      - verabot

  dashboard:
    build: ./dashboard
    environment:
      VITE_API_URL: http://bot:3000/api
    ports:
      - "5173:5173"
    depends_on:
      - bot
    networks:
      - verabot

networks:
  verabot:
    driver: bridge
```

### Nginx Reverse Proxy

```nginx
upstream bot_api {
  server localhost:3000;
}

upstream dashboard {
  server localhost:5173;
}

server {
  listen 80;
  server_name bot.example.com;

  # Dashboard
  location / {
    proxy_pass http://dashboard;
  }

  # API
  location /api {
    proxy_pass http://bot_api;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

## Next Steps

1. Implement API endpoints in your bot
2. Configure environment variables
3. Start the API server
4. Access dashboard at `http://localhost:5173`
5. Customize dashboard theme in Tailwind config
6. Deploy to production with your preferred hosting

## Support

For issues or questions:
1. Check browser console for errors
2. Review bot logs
3. Verify API endpoints are implemented
4. Check environment variables are set
5. Ensure CORS is properly configured
