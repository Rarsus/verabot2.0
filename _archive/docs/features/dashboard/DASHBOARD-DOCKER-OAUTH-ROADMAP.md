# Dashboard Docker + OAuth Implementation Roadmap

## Overview

Transform the React dashboard from a standalone frontend into a complete full-stack application with:

- Express.js backend for OAuth handling
- Discord OAuth 2.0 integration
- Docker containerization with bot and dashboard
- Automated deployment

## Implementation Phases

### Phase 1: Backend OAuth Service (Express.js)

**Effort:** 4-6 hours | **Priority:** CRITICAL

#### 1.1 Setup Express Backend

- Create `/dashboard/server/` directory structure
- Initialize Node.js Express server on port 5000 (internal)
- Install dependencies:
  ```json
  {
    "express": "^4.18.2",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "axios": "^1.6.0",
    "express-session": "^1.17.3",
    "cookie-parser": "^1.4.6",
    "jsonwebtoken": "^9.1.2"
  }
  ```

#### 1.2 Discord OAuth Implementation

- Create `/dashboard/server/routes/auth.js`
  - `GET /api/auth/login` - Redirects to Discord OAuth
  - `GET /api/auth/callback` - OAuth callback handler
  - `GET /api/auth/verify` - Verify token validity
  - `GET /api/auth/logout` - Clear session
  - `GET /api/auth/user` - Get current user info

- Create `/dashboard/server/services/oauth-service.js`
  - Exchange code for Discord access token
  - Fetch user profile from Discord API
  - Generate JWT for frontend authentication
  - Validate token with bot backend

#### 1.3 Environment Variables

```env
# Discord OAuth
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
DISCORD_REDIRECT_URI=http://localhost:3001/api/auth/callback

# OAuth Scopes
DISCORD_SCOPES=identify,guilds,applications.commands

# Session
SESSION_SECRET=random_secret_key_here

# Bot API
BOT_API_URL=http://verabot2:3000
BOT_API_TOKEN=your_bot_token_here

# Dashboard
DASHBOARD_URL=http://localhost:3001
NODE_ENV=production
PORT=5000
```

---

### Phase 2: Bot Backend Integration

**Effort:** 3-4 hours | **Priority:** HIGH

#### 2.1 Create Dashboard API Endpoints in Bot

- Create `/src/routes/dashboard.js` (if not exists)
  - Verify JWT from dashboard
  - Validate user has admin permissions
  - Serve protected endpoints

#### 2.2 Add Authentication Middleware

- Create `/src/middleware/dashboard-auth.js`
  - Verify JWT signature
  - Check user guild membership
  - Check admin permissions
  - Log access attempts

#### 2.3 Update Bot Main Entry (`src/index.js`)

```javascript
// Add dashboard API server
if (features.dashboard?.enabled) {
  const dashboardRouter = require('./routes/dashboard');
  client.dashboardApp = express();
  client.dashboardApp.use('/api', dashboardAuth, dashboardRouter);
  client.dashboardApp.listen(3000, () => {
    console.log('Dashboard API listening on port 3000');
  });
}
```

---

### Phase 3: React Frontend OAuth Integration

**Effort:** 2-3 hours | **Priority:** HIGH

#### 3.1 Update AuthContext

- Replace token input with OAuth flow
- Store `accessToken` and `user` info from Discord
- Add `handleDiscordLogin()` method
- Auto-refresh tokens

#### 3.2 Create OAuth Login Page

- Replace simple token input with Discord OAuth button
- Show user profile after login
- Logout functionality
- Remember user preferences

#### 3.3 Update API Client

- Point to backend at `http://localhost:5000`
- Include JWT in Authorization header
- Handle 401 responses (auto-redirect to login)

---

### Phase 4: Docker Containerization

**Effort:** 2-3 hours | **Priority:** HIGH

#### 4.1 Multi-Stage Dockerfile for Dashboard

Create `/dashboard/Dockerfile`:

```dockerfile
# Stage 1: Build frontend
FROM node:18-alpine AS frontend-build
WORKDIR /dashboard
COPY dashboard/package*.json ./
RUN npm ci
COPY dashboard/ .
RUN npm run build

# Stage 2: Setup backend
FROM node:18-alpine AS app
WORKDIR /app
COPY dashboard/server/package*.json ./
RUN npm ci --only=production
COPY dashboard/server/ .
COPY --from=frontend-build /dashboard/dist /app/public

EXPOSE 5000
CMD ["node", "server.js"]
```

#### 4.2 Update Docker-Compose

```yaml
services:
  verabot2:
    build: .
    env_file: .env
    restart: unless-stopped
    volumes:
      - verabot_data:/app/data
    ports:
      - '3000:3000' # Internal API
    networks:
      - verabot-network

  dashboard:
    build: ./dashboard
    env_file: .env
    restart: unless-stopped
    ports:
      - '5000:5000'
    depends_on:
      - verabot2
    networks:
      - verabot-network
    environment: BOT_API_URL=http://verabot2:3000

networks:
  verabot-network:
    driver: bridge

volumes:
  verabot_data:
```

#### 4.3 Update Main Dockerfile

```dockerfile
# Expose internal API port
EXPOSE 3000
ENV NODE_ENV=production

# Add dashboard feature flag
RUN echo 'dashboard: { enabled: true }' >> config/features.js
```

---

### Phase 5: Production Setup

**Effort:** 2-3 hours | **Priority:** MEDIUM

#### 5.1 Nginx Reverse Proxy

Create `/docker/nginx.conf`:

```nginx
upstream bot-api {
    server verabot2:3000;
}

upstream dashboard {
    server dashboard:5000;
}

server {
    listen 80;
    server_name yourdomain.com;

    # Dashboard
    location / {
        proxy_pass http://dashboard;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Bot API (internal use only)
    location /bot-api {
        proxy_pass http://bot-api;
        proxy_set_header Authorization $http_authorization;
    }
}
```

#### 5.2 Environment Configuration

- Production `.env` with real Discord OAuth credentials
- SSL certificates setup
- Database persistence configuration
- Rate limiting for OAuth endpoints

#### 5.3 Startup Script

Create `/scripts/deploy.sh`:

```bash
#!/bin/bash
set -e

# Register OAuth app with Discord
curl -X POST https://discord.com/api/oauth2/applications \
  -H "Authorization: Bot $DISCORD_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"VeraBot Dashboard\"}"

# Build and start containers
docker-compose up -d --build

# Wait for services
sleep 10

# Verify services
curl http://localhost:5000/health
curl http://localhost:3000/health

echo "✅ Dashboard deployed successfully"
```

---

## Implementation Steps

### Step 1: Discord OAuth Setup

1. Go to Discord Developer Portal
2. Create new application
3. Copy Client ID and Secret
4. Add OAuth2 Redirect URI: `http://localhost:3001/api/auth/callback`
5. Save credentials to `.env`

### Step 2: Create Backend Structure

```
dashboard/
├── server/
│   ├── server.js              # Express entry point
│   ├── package.json
│   ├── routes/
│   │   ├── auth.js            # OAuth routes
│   │   └── api.js             # Proxy to bot
│   ├── services/
│   │   ├── oauth-service.js   # Discord OAuth
│   │   └── bot-service.js     # Bot API calls
│   └── middleware/
│       ├── auth.js            # JWT verification
│       └── error-handler.js
├── src/                        # React frontend
├── Dockerfile
└── docker-compose.yml
```

### Step 3: Implement OAuth Flow

- Update login page with Discord button
- Create callback handler
- Store JWT in secure cookie
- Implement token refresh

### Step 4: Update API Routes

- Create protected endpoints in bot
- Verify JWT on each request
- Log dashboard access
- Return user-specific data

### Step 5: Docker Setup

- Build dashboard image
- Update docker-compose
- Test multi-container setup
- Add health checks

### Step 6: Production Deployment

- Setup Nginx reverse proxy
- Configure SSL/TLS
- Add rate limiting
- Setup monitoring

---

## File Changes Summary

### New Files to Create

- `dashboard/server/server.js` (100 lines)
- `dashboard/server/routes/auth.js` (200 lines)
- `dashboard/server/routes/api.js` (150 lines)
- `dashboard/server/services/oauth-service.js` (150 lines)
- `dashboard/server/middleware/auth.js` (80 lines)
- `dashboard/Dockerfile` (40 lines)
- `dashboard/server/package.json` (30 lines)
- `docker/nginx.conf` (50 lines)
- `scripts/deploy.sh` (30 lines)

### Files to Modify

- `src/index.js` - Add dashboard API server
- `src/middleware/` - Add dashboard auth middleware
- `docker-compose.yml` - Add dashboard service, nginx
- `Dockerfile` - Expose port 3000, add health check
- `dashboard/src/pages/Login.jsx` - OAuth button
- `dashboard/src/context/AuthContext.jsx` - OAuth handling
- `dashboard/vite.config.js` - Proxy configuration

### Total Effort: 13-19 hours

- Phase 1: 4-6 hours
- Phase 2: 3-4 hours
- Phase 3: 2-3 hours
- Phase 4: 2-3 hours
- Phase 5: 2-3 hours

---

## Security Considerations

### 1. OAuth Token Handling

- ✅ Store access tokens in HTTP-only cookies
- ✅ Implement token refresh logic
- ✅ Validate state parameter
- ✅ Use PKCE for additional security

### 2. API Security

- ✅ JWT verification on all protected routes
- ✅ Rate limiting on OAuth endpoints
- ✅ CORS configuration
- ✅ Audit logging for admin actions

### 3. Environment Security

- ✅ Never commit `.env` file
- ✅ Use Docker secrets for production
- ✅ Rotate OAuth credentials regularly
- ✅ Use HTTPS in production

### 4. User Permissions

- ✅ Verify user is in guild
- ✅ Check admin role or bot owner status
- ✅ Log all dashboard access
- ✅ Implement command audit trail

---

## Testing Checklist

- [ ] Discord OAuth flow works locally
- [ ] JWT tokens validate correctly
- [ ] Dashboard API endpoints return user-specific data
- [ ] Bot API endpoints require valid JWT
- [ ] Multi-container setup works with docker-compose
- [ ] Logout clears session properly
- [ ] Token refresh works before expiry
- [ ] CORS configured correctly
- [ ] Environment variables load properly
- [ ] Health checks pass
- [ ] Rate limiting works
- [ ] Audit logs record dashboard actions

---

## Next: Detailed Implementation

When ready, I can implement each phase in order:

1. **Phase 1** - Express backend with OAuth
2. **Phase 2** - Bot API integration
3. **Phase 3** - React OAuth login
4. **Phase 4** - Docker setup
5. **Phase 5** - Production configuration

Would you like me to start with Phase 1?
