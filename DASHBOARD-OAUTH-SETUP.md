# VeraBot Dashboard + OAuth Setup Guide

Complete guide for deploying the VeraBot dashboard with Discord OAuth 2.0 authentication.

## Quick Start

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env with your Discord credentials

# 2. Deploy with Docker
./scripts/deploy.sh

# 3. Access dashboard
# Open http://localhost:5000 in your browser
```

## Prerequisites

- Docker and Docker Compose
- Discord Bot Application (with OAuth2 configured)
- Node.js 18+ (for local development)

## Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌──────────────┐
│   Browser   │─────▶│ Dashboard Server │─────▶│  Bot API     │
│  (React)    │◀─────│  (Express+OAuth) │◀─────│ (Discord.js) │
└─────────────┘      └──────────────────┘      └──────────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │  Discord OAuth  │
                     └─────────────────┘
```

## Configuration

### 1. Discord Developer Portal Setup

1. Go to https://discord.com/developers/applications
2. Select your bot application
3. Navigate to **OAuth2** section
4. Click **Add Redirect** and add:
   - Development: `http://localhost:5000/api/auth/callback`
   - Production: `https://yourdomain.com/api/auth/callback`
5. Copy your **Client ID** and **Client Secret**

### 2. Environment Variables

Required variables in `.env`:

```env
# Discord Bot
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here

# Discord OAuth
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
DISCORD_REDIRECT_URI=http://localhost:5000/api/auth/callback
DISCORD_SCOPES=identify,guilds

# Security
SESSION_SECRET=generate_random_secret_here
BOT_API_TOKEN=generate_random_token_here

# Dashboard
ENABLE_DASHBOARD_API=true
PORT=5000
DASHBOARD_URL=http://localhost:5000
BOT_API_URL=http://verabot2:3000
```

Generate secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Deployment Options

### Option 1: Docker Compose (Recommended)

```bash
# Deploy everything
./scripts/deploy.sh

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 2: Manual Deployment

**Terminal 1 - Bot:**

```bash
npm install
ENABLE_DASHBOARD_API=true node src/index.js
```

**Terminal 2 - Dashboard Server:**

```bash
cd dashboard/server
npm install
node server.js
```

**Terminal 3 - Dashboard Frontend:**

```bash
cd dashboard
npm install
npm run dev
```

### Option 3: Production with Nginx

1. Update `docker-compose.yml` to include nginx:

```yaml
nginx:
  image: nginx:alpine
  ports:
    - '80:80'
    - '443:443'
  volumes:
    - ./docker/nginx.conf:/etc/nginx/conf.d/default.conf
    - ./ssl:/etc/nginx/ssl # Add SSL certificates here
  depends_on:
    - dashboard
  networks:
    - verabot-network
```

2. Deploy:

```bash
docker-compose up -d
```

## Service Endpoints

### Dashboard Server (Port 5000)

- `GET /health` - Health check
- `GET /api/auth/login` - Get Discord OAuth URL
- `GET /api/auth/callback` - OAuth callback handler
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/user` - Get current user
- `ALL /api/*` - Proxied to bot API

### Bot API (Port 3000)

- `GET /health` - Health check
- `GET /api/bot/status` - Bot status
- `GET /api/bot/info` - Bot information
- `GET /api/bot/stats` - Statistics
- `GET /api/bot/guilds` - Guild list
- `POST /api/auth/verify-admin` - Verify admin access

## Security Considerations

### Production Checklist

- [ ] Set strong `SESSION_SECRET` (64+ random characters)
- [ ] Set strong `BOT_API_TOKEN` for bot-dashboard communication
- [ ] Use HTTPS in production
- [ ] Update `DISCORD_REDIRECT_URI` to production URL
- [ ] Enable CORS only for dashboard domain
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTP-only cookies for sessions
- [ ] Implement rate limiting
- [ ] Enable audit logging
- [ ] Rotate secrets regularly

### Environment Security

```env
# ✅ GOOD - Strong secrets
SESSION_SECRET=a1b2c3d4e5f6...64_random_characters
BOT_API_TOKEN=x9y8z7w6v5u4...64_random_characters

# ❌ BAD - Weak or default
SESSION_SECRET=your-secret-key-change-in-production
BOT_API_TOKEN=admin123
```

## Troubleshooting

### OAuth Callback Errors

**Problem:** "OAuth error: invalid_redirect_uri"

**Solution:** Ensure redirect URI in Discord Developer Portal exactly matches:

```env
DISCORD_REDIRECT_URI=http://localhost:5000/api/auth/callback
```

### Dashboard Can't Connect to Bot

**Problem:** Dashboard shows "Failed to fetch bot status"

**Solution:** Check that:

1. Bot API is enabled: `ENABLE_DASHBOARD_API=true`
2. Bot is running on port 3000
3. Network configuration in `docker-compose.yml` is correct
4. Both services are in same Docker network

### JWT Token Errors

**Problem:** "Invalid or expired token"

**Solution:**

1. Ensure `SESSION_SECRET` is the same in both dashboard server and bot
2. Clear cookies and login again
3. Check if JWT token hasn't expired (default: 7 days)

### CORS Errors

**Problem:** "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solution:** Update `DASHBOARD_URL` to match your frontend URL:

```env
DASHBOARD_URL=http://localhost:5000
```

## Development

### Local Development Setup

1. Install dependencies:

```bash
# Root (bot)
npm install

# Dashboard server
cd dashboard/server && npm install

# Dashboard frontend
cd dashboard && npm install
```

2. Run services:

```bash
# Terminal 1 - Bot with API
ENABLE_DASHBOARD_API=true npm start

# Terminal 2 - Dashboard server
cd dashboard/server && npm start

# Terminal 3 - Dashboard frontend
cd dashboard && npm run dev
```

3. Access:

- Frontend: http://localhost:3001 (Vite dev server)
- Dashboard API: http://localhost:5000
- Bot API: http://localhost:3000

### Building for Production

```bash
# Build dashboard frontend
cd dashboard
npm run build

# Output in dashboard/dist/
```

## API Examples

### Get Discord OAuth URL

```bash
curl http://localhost:5000/api/auth/login
```

### Verify Token

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/auth/verify
```

### Get Bot Status

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/bot/status
```

## Monitoring

### Check Service Health

```bash
# Dashboard
curl http://localhost:5000/health

# Bot API
curl http://localhost:3000/health
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f dashboard
docker-compose logs -f verabot2
```

## Upgrading

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Support

- Documentation: `/docs/`
- Issues: https://github.com/Rarsus/verabot2.0/issues
- Discord: [Your Discord Server]

## License

MIT License - See LICENSE file for details
