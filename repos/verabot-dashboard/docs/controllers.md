# VeraBot Dashboard - Controllers Documentation

Complete documentation of all controller classes and methods.

## Overview

Controllers handle the business logic for API endpoints. They:
- Process incoming requests
- Validate data
- Call services
- Return responses

## DashboardController

**Location:** `src/controllers/DashboardController.js`

Handles dashboard overview, settings, and guild information.

### Methods

#### getDashboardOverview(req, res)

Retrieve dashboard overview data for a specific guild.

**Route:** `GET /api/dashboard/:guildId/overview`

**Parameters:**
- `req.params.guildId` - Guild ID (required)

**Response (Success):**
```javascript
{
  success: true,
  overview: {
    guildId: 'guild-123',
    status: 'active',
    lastUpdated: '2024-01-20T12:00:00.000Z'
  }
}
```

**Response (Missing Guild ID):**
```javascript
{
  status: 400,
  body: {
    error: 'Guild ID is required'
  }
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad request (missing guild ID)
- `500` - Server error

**Implementation Details:**
- Validates guild ID is provided
- Retrieves guild information
- Calculates overview statistics
- Returns status and timestamp

---

#### getGuildSettings(req, res)

Retrieve settings for a specific guild.

**Route:** `GET /api/dashboard/:guildId/settings`

**Parameters:**
- `req.params.guildId` - Guild ID (required)

**Response:**
```javascript
{
  success: true,
  settings: {
    guildId: 'guild-123',
    prefix: '!',
    language: 'en',
    moderation: {
      enabled: true,
      logChannel: 'channel-id-123'
    },
    quotes: {
      enabled: true,
      autoTagging: true
    }
  }
}
```

**HTTP Status Codes:**
- `200` - Success
- `404` - Guild not found
- `500` - Server error

**Implementation Details:**
- Fetches guild configuration
- Returns all guild-specific settings
- Includes module-specific configurations

---

#### updateGuildSettings(req, res)

Update settings for a specific guild.

**Route:** `PATCH /api/dashboard/:guildId/settings`

**Parameters:**
- `req.params.guildId` - Guild ID (required)
- `req.body.settings` - Settings object (required)

**Request Body:**
```javascript
{
  settings: {
    prefix: '!',
    language: 'en',
    moderation: {
      enabled: true,
      logChannel: 'channel-id-456'
    }
  }
}
```

**Response:**
```javascript
{
  success: true,
  message: 'Settings updated',
  guildId: 'guild-123',
  settings: {
    prefix: '!',
    language: 'en',
    moderation: {
      enabled: true,
      logChannel: 'channel-id-456'
    }
  }
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad request (invalid settings)
- `403` - Forbidden (insufficient permissions)
- `404` - Guild not found
- `500` - Server error

**Implementation Details:**
- Validates permissions
- Validates settings structure
- Updates guild configuration
- Returns updated settings
- Emits event for config changes

**Validation Rules:**
- Settings object must be valid JSON
- Prefix must be 1-5 characters
- Language must be valid language code
- Channel IDs must exist in guild

---

## Creating New Controllers

To create a new controller:

```javascript
/**
 * QuoteController
 * Handles quote-related operations
 */
class QuoteController {
  /**
   * Get quotes for a guild
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async getQuotes(req, res) {
    try {
      const { guildId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      // Validate input
      if (!guildId) {
        return res.status(400).json({
          error: 'Guild ID is required'
        });
      }

      // Call service (example)
      // const quoteService = req.app.locals.quoteService;
      // const quotes = await quoteService.getQuotes(guildId, page, limit);

      // Return response
      res.json({
        success: true,
        quotes: [],
        page,
        limit,
        total: 0
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default QuoteController;
```

---

## Error Handling in Controllers

Always wrap logic in try-catch blocks:

```javascript
static async deleteGuildSettings(req, res) {
  try {
    const { guildId } = req.params;

    // Validation
    if (!guildId) {
      return res.status(400).json({
        error: 'Guild ID is required'
      });
    }

    // Business logic
    // ...

    // Success response
    res.json({
      success: true,
      message: 'Settings deleted'
    });
  } catch (error) {
    // Error response
    console.error('Error deleting settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete settings',
      details: error.message
    });
  }
}
```

---

## Response Format Standards

### Success Response

```javascript
{
  success: true,
  data: {
    // Requested data
  },
  message: 'Optional message'  // Only if needed
}
```

### Error Response

```javascript
{
  success: false,
  error: 'Error message',
  details: 'Optional additional details'  // Only if helpful
}
```

### Paginated Response

```javascript
{
  success: true,
  data: [
    // Array of items
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 100,
    pages: 10
  }
}
```

---

## Testing Controllers

Controllers should be tested with mocked dependencies:

```javascript
import DashboardController from './DashboardController.js';

describe('DashboardController', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      params: { guildId: 'guild-123' },
      body: {},
      query: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('should return guild settings', async () => {
    await DashboardController.getGuildSettings(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      settings: expect.any(Object)
    });
  });
});
```

---

## Integration with Routes

Controllers are called from route handlers:

```javascript
import DashboardController from '../controllers/DashboardController.js';

router.get('/:guildId/overview', (req, res) => {
  DashboardController.getDashboardOverview(req, res);
});

router.get('/:guildId/settings', (req, res) => {
  DashboardController.getGuildSettings(req, res);
});

router.patch('/:guildId/settings', (req, res) => {
  DashboardController.updateGuildSettings(req, res);
});
```

---

## See Also

- [API Routes Documentation](./api-routes.md) - Route definitions
- [Middleware Documentation](./middleware.md) - Request processing
- [Testing Guide](./testing-guide.md) - How to test controllers
