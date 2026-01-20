# Copilot Instructions for verabot-dashboard

**Status**: Phase 1 - Extraction to Folders  
**Inherits**: Main repo copilot instructions (base requirements)  
**Specific To**: Dashboard module  
**Date**: January 20, 2026

---

## ⚠️ CRITICAL: Test-Driven Development (TDD) is MANDATORY

Copilot MUST follow TDD principles for ALL code changes in this module. This is non-negotiable.

- Every new function, method, class, service, or feature MUST have tests written FIRST
- Tests are written in the RED phase (failing tests)
- Then code is implemented to make tests pass (GREEN phase)
- Then code is refactored while maintaining test pass rate (REFACTOR phase)

**If Copilot implements code without writing tests first, the pull request will be rejected.**

---

## Module Overview

**verabot-dashboard** is the web UI service responsible for:
- Discord OAuth2 authentication and authorization
- Guild and user management interfaces
- Admin controls and settings
- API endpoints for bot configuration

**Technology Stack**:
- Node.js 20+
- Express.js v4.18+
- Passport.js (OAuth)
- Jest (testing)
- ESLint + Prettier (code quality)

**Key Files**:
- `src/index.js` - Express server entry point
- `src/routes/` - API endpoints
- `src/middleware/` - Express middleware
- `src/controllers/` - Request handlers
- `src/services/` - Business logic (uses verabot-utils)
- `tests/` - Test suites (TDD required)

---

## Development Patterns & Standards

### 1. Express Route Development

**TDD First** - Write tests before routes:

```javascript
// tests/unit/test-auth-routes.js
const request = require('supertest');
const app = require('../src/index');

describe('Auth Routes', () => {
  describe('GET /auth/login', () => {
    it('should redirect to Discord OAuth', async () => {
      const res = await request(app).get('/auth/login');
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('discord.com');
    });

    it('should set session state', async () => {
      const res = await request(app)
        .get('/auth/login')
        .expect(302);
      expect(res.headers['set-cookie']).toBeDefined();
    });
  });
});
```

**Implementation** - Write minimal code to pass:

```javascript
// src/routes/auth.js
import express from 'express';
import passport from 'passport';

const router = express.Router();

router.get('/login', passport.authenticate('discord'));

router.get('/callback',
  passport.authenticate('discord', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

export default router;
```

### 2. Middleware Development

**TDD for middleware**:

```javascript
// tests/unit/test-auth-middleware.js
const authMiddleware = require('../src/middleware/auth');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: null };
    res = { redirect: jest.fn() };
    next = jest.fn();
  });

  it('should redirect if not authenticated', () => {
    authMiddleware(req, res, next);
    expect(res.redirect).toHaveBeenCalledWith('/auth/login');
  });

  it('should call next if authenticated', () => {
    req.user = { id: '123' };
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
```

### 3. Service Usage (verabot-utils)

**Import shared services**:

```javascript
// ✅ CORRECT - Use shared services
import { DatabaseService } from 'verabot-utils';
import { ValidationService } from 'verabot-utils';
import { errorHandler } from 'verabot-utils';

// ❌ WRONG - Don't duplicate services
import { database } from '../utils/db';
import { validate } from '../utils/validation';
```

### 4. API Response Consistency

**Use consistent response format**:

```javascript
// Response helper utility
export const sendResponse = (res, statusCode, data, error = null) => {
  res.status(statusCode).json({
    success: statusCode < 400,
    data,
    error: error ? error.message : null,
    timestamp: new Date().toISOString(),
  });
};

// Usage in routes
router.get('/guilds/:guildId', async (req, res) => {
  try {
    const guild = await getGuild(req.params.guildId, req.user.id);
    sendResponse(res, 200, guild);
  } catch (error) {
    sendResponse(res, 500, null, error);
  }
});
```

### 5. Security Requirements

**Always applied**:

```javascript
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// Apply security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/api/', limiter);

// Validate Discord token
const validateToken = (req, res, next) => {
  if (!req.user) {
    return sendResponse(res, 401, null, new Error('Unauthorized'));
  }
  next();
};
```

---

## Testing Requirements

### TDD Workflow (MANDATORY)

**File**: `tests/unit/test-[feature-name].js` or `tests/integration/test-[feature-name].js`

```javascript
// 1. RED: Write tests that fail
// 2. GREEN: Write minimal code to pass
// 3. REFACTOR: Optimize while tests pass

const request = require('supertest');
const app = require('../src/index');
const { mockUser, mockGuild } = require('../fixtures');

describe('Guild Management Routes', () => {
  describe('GET /api/guilds', () => {
    it('should return user guilds', async () => {
      const res = await request(app)
        .get('/api/guilds')
        .set('Cookie', `session=${mockUser.sessionId}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/guilds');
      expect(res.status).toBe(401);
    });

    it('should handle API errors gracefully', async () => {
      jest.spyOn(discordApi, 'getGuilds').mockRejectedValue(
        new Error('API Error')
      );
      
      const res = await request(app)
        .get('/api/guilds')
        .set('Cookie', `session=${mockUser.sessionId}`);
      
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });
});
```

### Coverage Requirements

- **Lines**: 85%+ (minimum)
- **Functions**: 90%+ (minimum)
- **Branches**: 80%+ (minimum)
- **Never decrease** existing coverage
- **All error paths** must be tested

### Test Execution

```bash
npm test                    # All tests
npm run test:watch         # Watch mode
npm run coverage           # Coverage report
npm run test:only -- auth  # Specific test
npm test -- --coverage    # Coverage check
```

---

## Code Quality Standards

### Express Best Practices

- Use async/await (not callbacks)
- Handle all promises with .catch() or try-catch
- Validate all input data
- Sanitize all output
- Use middleware for cross-cutting concerns
- Separate routes, controllers, services

### Security Checklist

- [ ] HTTPS enforced in production
- [ ] CORS properly configured
- [ ] Rate limiting active
- [ ] Input validation on all endpoints
- [ ] Output sanitization applied
- [ ] Session security configured
- [ ] Error messages don't expose internals
- [ ] Secrets in environment variables

---

## File Organization

```
verabot-dashboard/
├── src/
│   ├── index.js                    # Express server
│   ├── config/
│   │   ├── passport.js             # OAuth config
│   │   └── database.js             # DB connection
│   ├── routes/
│   │   ├── auth.js                 # Auth endpoints
│   │   ├── guilds.js               # Guild management
│   │   ├── settings.js             # Configuration
│   │   └── admin.js                # Admin functions
│   ├── controllers/                # Request handlers
│   ├── middleware/
│   │   ├── auth.js                 # Auth verification
│   │   ├── errorHandler.js         # Error handling
│   │   └── validation.js           # Input validation
│   ├── services/                   # Business logic (uses verabot-utils)
│   └── utils/                      # Dashboard-specific utilities
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── public/                         # Static files (if any)
├── package.json
├── Dockerfile
├── Dockerfile.dev
└── README.md
```

---

## Git Workflow

### Branch Naming

```bash
feature/{issue-number}-{description}
bugfix/{issue-number}-{description}
refactor/{issue-number}-{description}
```

### Commit Message Format

```
{type}({scope}): {subject}

{body}

{footer}
```

Examples:
```
feat(routes): add guild settings endpoint

Implement GET/POST /api/guilds/{guildId}/settings:
- Get current settings for guild
- Update settings with validation
- Return updated configuration

Tests included for all scenarios.

Closes #125
```

### Pull Request Process

1. Create feature branch
2. Write tests FIRST (RED)
3. Write implementation (GREEN)
4. Run validation: `npm run validate`
5. Create pull request with tests
6. Code review approval required
7. Merge to main

---

## Performance Guidelines

- **Server startup**: < 5 seconds
- **API response**: < 200ms (95th percentile)
- **Database query**: < 100ms
- **Test execution**: < 30 seconds
- **Lint check**: < 10 seconds

---

## Module-Specific Requirements

### OAuth Implementation

- ✅ Discord OAuth2 flow
- ✅ Secure session management
- ✅ Token refresh handling
- ✅ User data caching
- ✅ Permission verification

### API Endpoints

- ✅ RESTful design
- ✅ Consistent response format
- ✅ Proper HTTP status codes
- ✅ Input validation
- ✅ Error handling

### Integration with Other Modules

- ✅ verabot-core: API calls to bot
- ✅ verabot-utils: Shared services
- ✅ Main repo: Part of coordinated release

---

## Key Commands

```bash
# Development
npm run dev                # Start with hot-reload
npm run start              # Production start

# Testing
npm test                   # Run all tests
npm run test:watch        # Watch mode
npm run coverage          # Coverage report

# Code Quality
npm run lint              # Check code style
npm run lint:fix          # Auto-fix issues
npm run format            # Format code
npm run validate          # Lint + test

# Docker
npm run docker:build      # Production build
npm run docker:build:dev  # Dev build
npm run docker:run        # Run production
npm run docker:run:dev    # Run development

# Health
npm run health-check      # Check dashboard status
```

---

**Version**: 1.0  
**Date**: January 20, 2026  
**Status**: Active - Applies to Phase 1, 2, 3  
**Inherits**: `.github/copilot-instructions.md` (main repo)
