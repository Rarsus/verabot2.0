# verabot-dashboard

Web dashboard for Verabot - Provides admin interface, OAuth authentication, and bot configuration UI.

## Overview

This repository contains the web dashboard and admin interface extracted from the main Verabot project as part of Epic #49 (Repository Separation). It provides:

- **OAuth Authentication**: Discord OAuth2 login integration
- **Admin Dashboard**: Web UI for bot management and configuration
- **Guild Management**: Guild-specific settings and configuration
- **User Preferences**: Individual user settings and preferences
- **REST API**: Endpoints for dashboard operations
- **Real-time Updates**: WebSocket support for live data (optional)

## Architecture

```
src/
├── index.js              # Express server entry point
├── server.js             # Express app configuration
├── routes/               # API route handlers
│   ├── oauth.js          # OAuth2 callback and login
│   ├── guilds.js         # Guild management endpoints
│   ├── users.js          # User profile endpoints
│   └── admin.js          # Admin-only endpoints
├── middleware/           # Express middleware
│   ├── auth.js           # Authentication middleware
│   ├── errorHandler.js   # Error handling
│   └── logger.js         # Request logging
├── controllers/          # Business logic
├── utils/                # Utility functions
└── public/               # Static frontend files (React, Vue, etc.)

public/
├── index.html            # Main HTML file
└── dist/                 # Compiled frontend (if using React/Vue/Angular)
```

## Prerequisites

- **Node.js**: 20+ (minimum v20.0.0)
- **npm**: 10.0.0+
- **Express.js**: Web server framework
- **verabot-utils**: Installed as npm dependency
- **Core Bot Service**: Running and accessible
- **Redis**: For sessions and caching
- **PostgreSQL/SQLite**: For data persistence

## Setup

### Installation

```bash
# Clone the repository
git clone https://github.com/Rarsus/verabot-dashboard.git
cd verabot-dashboard

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your configuration
# - DISCORD_CLIENT_ID
# - DISCORD_CLIENT_SECRET
# - OAUTH_REDIRECT_URI
# - DATABASE_URL
# - REDIS_URL
# - CORE_BOT_URL
# - UTILITIES_URL
```

### Configuration

**Required Environment Variables:**

```env
PORT=8080
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_discord_client_secret_here
OAUTH_REDIRECT_URI=http://localhost:8080/oauth/callback
DATABASE_URL=postgresql://user:password@localhost:5432/verabot
REDIS_URL=redis://localhost:6379
CORE_BOT_URL=http://localhost:3001
UTILITIES_URL=http://localhost:3000
```

**Optional Environment Variables:**

```env
SESSION_SECRET=your_session_secret_here
JWT_SECRET=your_jwt_secret_here
REACT_APP_API_URL=http://localhost:8080/api
LOG_LEVEL=info
DEBUG=verabot:*
```

## Development

### Run in Development Mode

```bash
npm run dev
```

This starts:
- Express server with hot reloading
- Frontend dev server (if using React/Vue)
- Debug logging enabled
- Console output for all requests

### Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test suite
npm test -- tests/routes/oauth.test.js

# Watch mode
npm test -- --watch
```

### Linting & Code Quality

```bash
# Check for linting errors
npm run lint

# Fix linting errors automatically
npm run lint:fix

# Check test coverage
npm run coverage
```

## API Endpoints

### Authentication

- `GET /oauth/login` - Initiate OAuth flow
- `GET /oauth/callback` - OAuth callback (handled by Discord)
- `POST /auth/logout` - Logout user
- `GET /auth/user` - Get current user info

### Guild Management

- `GET /api/guilds` - List user's guilds
- `GET /api/guilds/:guildId` - Get guild details
- `PUT /api/guilds/:guildId` - Update guild settings
- `GET /api/guilds/:guildId/settings` - Get guild-specific settings

### Admin Endpoints

- `GET /api/admin/stats` - Bot statistics
- `GET /api/admin/users` - List users (admin only)
- `POST /api/admin/ban/:userId` - Ban user (admin only)

### Health Check

- `GET /health` - Service health status
- `GET /ready` - Dashboard readiness

## Connecting to Shared Services

### Using verabot-utils

```javascript
// Database operations
const DatabaseService = require('verabot-utils/services/DatabaseService');
const db = new DatabaseService(process.env.DATABASE_URL);

// Logging
const { createLogger } = require('verabot-utils/middleware/errorHandler');
const logger = createLogger('dashboard');

// Response helpers
const { sendSuccess, sendError } = require('verabot-utils/helpers/response-helpers');
```

### Calling Core Bot API

```javascript
const coreBotUrl = process.env.CORE_BOT_URL;
const response = await fetch(`${coreBotUrl}/api/commands`);
const commands = await response.json();
```

## Frontend (React/Vue Example)

If using React with the dashboard API:

```javascript
// src/api/guilds.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const getGuilds = async () => {
  const response = await fetch(`${API_URL}/guilds`, {
    credentials: 'include', // Include cookies for authentication
  });
  return response.json();
};

export const updateGuildSettings = async (guildId, settings) => {
  const response = await fetch(`${API_URL}/guilds/${guildId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(settings),
  });
  return response.json();
};
```

## Deployment

### Docker

```bash
# Build image
docker build -t verabot-dashboard:latest .

# Run container
docker run -p 8080:8080 -e DISCORD_CLIENT_ID=xxx -e DISCORD_CLIENT_SECRET=xxx verabot-dashboard:latest
```

### Docker Compose

See `DOCKER-COMPOSE-LOCAL-DEVELOPMENT.yml` or `DOCKER-COMPOSE-PRODUCTION.yml` in parent repository.

```bash
# Development
docker-compose -f DOCKER-COMPOSE-LOCAL-DEVELOPMENT.yml up dashboard

# Production
docker-compose -f DOCKER-COMPOSE-PRODUCTION.yml up -d dashboard
```

## Authentication Flow

```
User → Dashboard (localhost:8080)
       ↓
   [Login Button]
       ↓
   Redirect to Discord OAuth
       ↓
   User authorizes on Discord
       ↓
   Discord redirects to /oauth/callback
       ↓
   Dashboard exchanges code for token
       ↓
   User session created, user redirected to dashboard
       ↓
   User accesses guild settings
```

## Testing

This project follows **Test-Driven Development (TDD)** principles.

### Test Coverage Requirements

- **Line Coverage**: 85%+
- **Function Coverage**: 90%+
- **Branch Coverage**: 80%+

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run coverage      # Coverage report
npm run coverage:open # Open HTML coverage report
```

## Troubleshooting

### OAuth Not Working

1. Verify Discord OAuth credentials are correct
2. Check `OAUTH_REDIRECT_URI` matches Discord Developer Portal
3. Ensure dashboard is accessible at the redirect URI
4. Verify core bot is running (needed for guild data)

### Database Connection Errors

1. Verify `DATABASE_URL` is correct
2. Test connection: `psql $DATABASE_URL`
3. Check PostgreSQL service is running
4. Verify credentials and database exists

### CORS Issues

1. Add `Access-Control-Allow-Origin` headers in Express middleware
2. Verify core bot URL is accessible from browser
3. Check browser console for detailed CORS errors
4. Ensure credentials option is set correctly in fetch calls

### Session Not Persisting

1. Verify Redis is running and accessible
2. Check `REDIS_URL` is correct
3. Verify `SESSION_SECRET` is set
4. Check browser cookies are enabled
5. Ensure HTTPS in production (cookies won't work with HTTP)

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for:
- Development workflow
- Code standards
- Commit conventions
- Pull request process

## Architecture References

- **Parent Repository**: https://github.com/Rarsus/verabot2.0
- **Implementation Plan**: [EPIC-49-IMPLEMENTATION-PLAN.md](../../EPIC-49-IMPLEMENTATION-PLAN.md)
- **API Documentation**: [docs/user-guides/dashboard-access-configuration.md](../../docs/user-guides/dashboard-access-configuration.md)

## Support

For issues, questions, or contributions:
1. Check [Troubleshooting](#troubleshooting) section
2. Search existing GitHub issues
3. Create new issue with detailed description
4. See parent repository documentation

## License

MIT - See [LICENSE](./LICENCE) file

---

**Version**: 1.0.0  
**Last Updated**: January 20, 2026  
**Status**: Active Development (Epic #49)
