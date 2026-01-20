# VeraBot Dashboard - Middleware Documentation

Complete documentation of all middleware used in the dashboard.

## Overview

Middleware functions are executed in order for each request and can:
- Validate authentication
- Check permissions
- Log access
- Handle errors
- Transform data

## Built-in Middleware

### Body Parser Middleware

**Location:** Core Express configuration

Parses incoming JSON and form-encoded request bodies.

```javascript
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

**Configuration:**
- JSON size limit: default
- Form size limit: default

---

## Custom Middleware

### Authentication Middleware

**Location:** `src/middleware/auth.js`

Provides JWT token verification and permission checking.

#### verifyToken(req, res, next)

Verifies JWT token in Authorization header.

**Token Format:**
```
Authorization: Bearer <JWT_TOKEN>
```

**On Success:**
- Attaches `req.dashboardUser` object with user info
- Calls `next()` to continue

**On Failure:**
- Returns 401 Unauthorized response
- Does not call `next()`

**User Object Structure:**
```javascript
req.dashboardUser = {
  userId: 'user-id-123',
  username: 'username',
  discriminator: '1234',
  avatar: 'avatar.png'
}
```

**JWT Payload Example:**
```javascript
{
  userId: '123456789',
  username: 'John',
  discriminator: '1234',
  avatar: 'https://...'
}
```

**Environment Variables:**
- `SESSION_SECRET` - JWT signing secret (default: 'your-secret-key-change-in-production')

---

#### verifyBotToken(req, res, next)

Verifies bot API token for server-to-server communication.

**Token Format:**
```
Authorization: Bearer <BOT_API_TOKEN>
```

**Configuration:**
- Compares token against `process.env.BOT_API_TOKEN`

**Use Cases:**
- Internal service communication
- Backend-to-backend API calls
- Automated monitoring and health checks

**On Success:**
- Calls `next()` to continue

**On Failure:**
- Returns 401 Unauthorized response

---

#### checkAdminPermission(client)

Factory function that returns middleware to check admin permissions.

**Parameters:**
- `client` - Discord.js Client instance

**Checks:**
1. User is bot owner (if `BOT_OWNER_ID` set)
2. User has Administrator permission in any mutual guild

**On Success:**
- Sets `req.isAdmin = true`
- Calls `next()` to continue

**On Failure:**
- Returns 403 Forbidden response
- Sets `req.isAdmin = false`

**Environment Variables:**
- `BOT_OWNER_ID` - Discord ID of bot owner (optional)

**Usage:**
```javascript
import dashboardAuthMiddleware from './middleware/auth.js';

app.use(
  '/admin',
  dashboardAuthMiddleware.checkAdminPermission(discordClient)
);
```

---

#### logAccess(req, res, next)

Logs access attempts to the dashboard.

**Log Format:**
```
[Dashboard] 2024-01-20T12:00:00.000Z - username accessed GET /api/dashboard/bot/status
```

**Includes:**
- Timestamp (ISO 8601)
- Username (or "Unknown" if not authenticated)
- HTTP method
- Request path

**Use Cases:**
- Security audit logging
- Access tracking
- Debugging

**Usage:**
```javascript
app.use(dashboardAuthMiddleware.logAccess);
```

---

## Error Handling Middleware

**Location:** Core Express configuration

Catches errors from route handlers and returns consistent error responses.

**Error Response Format:**
```javascript
{
  error: 'Error message',
  status: 500
}
```

**HTTP Status Codes:**
- `4xx` - Client errors (bad request, unauthorized, etc.)
- `5xx` - Server errors

---

## CORS Middleware

**Location:** Core Express configuration

```javascript
app.use(cors());
```

**Default Configuration:**
- Allows requests from any origin
- Supports common HTTP methods
- Allows common headers

**For Production:** Consider restricting origins:
```javascript
app.use(cors({
  origin: [
    'https://yourdomain.com',
    'https://dashboard.yourdomain.com'
  ]
}));
```

---

## Middleware Stack Order

The typical middleware execution order:

```
1. CORS Middleware
2. Body Parser (express.json)
3. Body Parser (express.urlencoded)
4. Static File Middleware (public/)
5. Authentication Middleware
6. Route Handler
7. Error Handler Middleware
```

---

## Custom Middleware Creation

To create new middleware:

```javascript
/**
 * Custom middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
export const myMiddleware = (req, res, next) => {
  try {
    // Your logic here
    
    // Continue to next middleware
    next();
  } catch (error) {
    // Handle errors
    res.status(500).json({
      error: error.message
    });
  }
};
```

---

## Testing Middleware

Middleware functions can be unit tested:

```javascript
import dashboardAuthMiddleware from './middleware/auth.js';

describe('Authentication Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = { headers: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  it('should verify valid token', () => {
    const token = jwt.sign({ userId: '123' }, secret);
    mockReq.headers.authorization = `Bearer ${token}`;

    dashboardAuthMiddleware.verifyToken(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.dashboardUser).toBeDefined();
  });
});
```

---

## See Also

- [API Routes Documentation](./api-routes.md) - Available endpoints
- [Controllers Documentation](./controllers.md) - Request handlers
- [Testing Guide](./testing-guide.md) - How to test middleware
