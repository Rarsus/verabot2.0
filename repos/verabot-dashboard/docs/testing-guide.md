# VeraBot Dashboard - Testing Guide

Complete guide to testing the dashboard application.

## TDD Workflow

We follow Test-Driven Development (TDD):

1. **RED** - Write failing tests first
2. **GREEN** - Implement minimal code to pass tests
3. **REFACTOR** - Improve code while tests stay green

## Setup

### Install Dependencies

```bash
cd repos/verabot-dashboard
npm install
```

### Run Tests

```bash
# Run all tests with coverage
npm test

# Watch mode (re-run on changes)
npm test:watch

# Specific test file
npm test test-dashboard-routes.js

# Specific test case
npm test --testNamePattern="should verify"
```

### View Coverage Report

```bash
npm run coverage:open
```

## Test Structure

### Unit Tests

**Location:** `tests/unit/`

Test individual functions and classes in isolation.

**File Naming:** `test-{component-name}.js`

**Example:**
```javascript
import { describe, it, expect, beforeEach } from '@jest/globals';
import DashboardController from '../../src/controllers/DashboardController.js';

describe('DashboardController', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = { params: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('should return guild settings', async () => {
    mockReq.params.guildId = 'guild-123';

    await DashboardController.getGuildSettings(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });
});
```

### Integration Tests

**Location:** `tests/integration/`

Test multiple components working together.

**File Naming:** `test-integration-{feature}.js`

**Example:**
```javascript
import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/index.js';

describe('Dashboard Integration', () => {
  it('should complete auth flow', async () => {
    const response = await request(app)
      .get('/api/dashboard/bot/status')
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

## Mocking

### Mock Express Objects

```javascript
const mockReq = {
  params: { guildId: 'guild-123' },
  query: { page: 1 },
  body: { settings: {} },
  headers: { authorization: 'Bearer token' },
  user: { id: 'user-123' }
};

const mockRes = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  send: jest.fn()
};

const mockNext = jest.fn();
```

### Mock Services

```javascript
const mockQuoteService = {
  getQuotes: jest.fn().mockResolvedValue([]),
  addQuote: jest.fn().mockResolvedValue({}),
  deleteQuote: jest.fn().mockResolvedValue(true)
};
```

### Mock Discord Client

```javascript
const mockClient = {
  isReady: jest.fn().mockReturnValue(true),
  user: {
    username: 'TestBot',
    id: 'bot-123',
    displayAvatarURL: jest.fn().mockReturnValue('avatar.png')
  },
  guilds: {
    cache: new Map()
  },
  users: {
    cache: new Map()
  }
};
```

## Testing Routes

### Test GET Endpoint

```javascript
it('should return bot status', async () => {
  const response = await request(app)
    .get('/api/dashboard/bot/status');

  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
  expect(response.body.online).toBeDefined();
});
```

### Test POST Endpoint

```javascript
it('should verify admin access', async () => {
  const response = await request(app)
    .post('/api/dashboard/auth/verify-admin')
    .send({
      userId: 'user-123',
      guilds: ['guild-1', 'guild-2']
    });

  expect(response.status).toBe(200);
  expect(response.body.isAdmin).toBeDefined();
});
```

### Test Error Handling

```javascript
it('should reject missing guild ID', async () => {
  const response = await request(app)
    .post('/api/dashboard/auth/verify-admin')
    .send({ userId: 'user-123' });

  expect(response.status).toBe(400);
  expect(response.body.error).toBeDefined();
});
```

## Testing Middleware

### Test Authentication

```javascript
it('should verify valid JWT token', () => {
  const token = jwt.sign(
    { userId: 'user-123' },
    process.env.SESSION_SECRET
  );

  mockReq.headers.authorization = `Bearer ${token}`;

  dashboardAuthMiddleware.verifyToken(mockReq, mockRes, mockNext);

  expect(mockNext).toHaveBeenCalled();
  expect(mockReq.dashboardUser).toBeDefined();
});
```

### Test Permission Check

```javascript
it('should grant access to admin', async () => {
  process.env.BOT_OWNER_ID = 'owner-123';
  mockReq.dashboardUser = { userId: 'owner-123' };

  const middleware = dashboardAuthMiddleware.checkAdminPermission(mockClient);
  await middleware(mockReq, mockRes, mockNext);

  expect(mockReq.isAdmin).toBe(true);
  expect(mockNext).toHaveBeenCalled();
});
```

## Testing Controllers

### Test Success Case

```javascript
it('should return dashboard overview', async () => {
  mockReq.params.guildId = 'guild-123';

  await DashboardController.getDashboardOverview(mockReq, mockRes);

  expect(mockRes.json).toHaveBeenCalledWith({
    success: true,
    overview: expect.objectContaining({
      guildId: 'guild-123'
    })
  });
});
```

### Test Error Case

```javascript
it('should reject missing guild ID', async () => {
  mockReq.params.guildId = null;

  await DashboardController.getDashboardOverview(mockReq, mockRes);

  expect(mockRes.status).toHaveBeenCalledWith(400);
  expect(mockRes.json).toHaveBeenCalledWith({
    error: 'Guild ID is required'
  });
});
```

## Coverage Goals

| Metric | Target |
|--------|--------|
| Lines | 85%+ |
| Functions | 90%+ |
| Branches | 80%+ |
| Statements | 85%+ |

## Best Practices

### 1. Test Behavior, Not Implementation

```javascript
// ✅ GOOD - Tests the behavior
it('should reject unauthenticated requests', async () => {
  const response = await request(app)
    .get('/api/dashboard/bot/status');

  expect(response.status).toBe(401);
});

// ❌ BAD - Tests implementation details
it('should call verifyToken function', async () => {
  expect(verifyToken).toHaveBeenCalled();
});
```

### 2. Use Descriptive Test Names

```javascript
// ✅ GOOD
it('should return 401 when authorization header is missing', () => {
});

// ❌ BAD
it('should work', () => {
});
```

### 3. One Assertion Per Test (Usually)

```javascript
// ✅ GOOD
it('should return status 200', () => {
  expect(response.status).toBe(200);
});

it('should return bot information', () => {
  expect(response.body.username).toBe('TestBot');
});

// ⚠️  OK - Multiple related assertions
it('should return complete bot info', () => {
  expect(response.body.username).toBe('TestBot');
  expect(response.body.userId).toBe('bot-123');
  expect(response.body.ready).toBe(true);
});
```

### 4. Clean Up After Tests

```javascript
afterEach(() => {
  jest.clearAllMocks();
  delete process.env.BOT_OWNER_ID;
});
```

### 5. Test Edge Cases

```javascript
describe('Authorization', () => {
  it('should handle missing Authorization header', () => {});
  it('should handle invalid token format', () => {});
  it('should handle expired tokens', () => {});
  it('should handle malformed JWT', () => {});
  it('should handle empty token', () => {});
});
```

## Common Patterns

### Testing Async Functions

```javascript
it('should handle async operations', async () => {
  const promise = DashboardController.getGuildSettings(mockReq, mockRes);
  
  await promise;
  
  expect(mockRes.json).toHaveBeenCalled();
});
```

### Testing Error Handling

```javascript
it('should catch errors gracefully', async () => {
  const error = new Error('Database connection failed');
  mockQuoteService.getQuotes.mockRejectedValue(error);

  await DashboardController.getQuotes(mockReq, mockRes);

  expect(mockRes.status).toHaveBeenCalledWith(500);
});
```

### Testing with Environment Variables

```javascript
beforeEach(() => {
  process.env.BOT_OWNER_ID = 'owner-123';
  process.env.SESSION_SECRET = 'test-secret';
});

afterEach(() => {
  delete process.env.BOT_OWNER_ID;
  delete process.env.SESSION_SECRET;
});
```

## Debugging Tests

### Run Single Test

```bash
npm test -- --testNamePattern="should verify admin"
```

### Run Tests in Debug Mode

```bash
node --inspect-brk ./node_modules/.bin/jest --runInBand
```

### Print Debug Information

```javascript
it('should work', () => {
  console.log('mockReq:', mockReq);
  console.log('response:', response.body);
  expect(true).toBe(true);
});
```

## CI/CD Integration

Tests are run automatically on:
- Pre-commit (via Husky)
- Pull requests
- Deployment pipeline

Ensure all tests pass before committing:

```bash
npm run validate
```

---

## See Also

- [API Routes Documentation](./api-routes.md) - Endpoints to test
- [Middleware Documentation](./middleware.md) - Middleware testing
- [Controllers Documentation](./controllers.md) - Controller testing
