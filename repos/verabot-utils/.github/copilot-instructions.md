# Copilot Instructions for verabot-utils

**Status**: Phase 1 - Extraction to Folders  
**Inherits**: Main repo copilot instructions (base requirements)  
**Specific To**: Utilities/shared services module  
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

**verabot-utils** is the shared services library providing:
- Database abstraction and services
- Validation utilities
- Error handling middleware
- Response formatting helpers
- Logging services
- Configuration management
- Reusable business logic

**Can be used by**:
- verabot-core (Discord bot)
- verabot-dashboard (Web UI)
- External plugins (future)
- Published to npm (future)

**Technology Stack**:
- Node.js 20+
- SQLite3 + PostgreSQL support
- Jest (testing)
- ESLint + Prettier (code quality)

**Key Files**:
- `src/services/` - Core services (Database, Validation, etc.)
- `src/middleware/` - Express/utility middleware
- `src/helpers/` - Utility functions
- `src/types/` - Type definitions
- `tests/` - Test suites (TDD required)

---

## Development Patterns & Standards

### 1. Service Development (MUST be tested)

**TDD First** - Write tests before services:

```javascript
// tests/unit/test-database-service.js
const assert = require('assert');
const DatabaseService = require('../src/services/DatabaseService');

describe('DatabaseService', () => {
  let db;

  beforeEach(async () => {
    db = new DatabaseService(':memory:');
    await db.initialize();
  });

  afterEach(async () => {
    await db.close();
  });

  describe('query()', () => {
    it('should execute SQL query', async () => {
      const result = await db.query(
        'SELECT ? as value',
        ['test']
      );
      assert.deepStrictEqual(result, [{ value: 'test' }]);
    });

    it('should throw error for invalid SQL', async () => {
      await assert.rejects(
        () => db.query('INVALID SQL'),
        /SQL error/
      );
    });

    it('should handle empty results', async () => {
      const result = await db.query('SELECT * FROM nonexistent');
      assert.deepStrictEqual(result, []);
    });
  });
});
```

**Implementation** - Write minimal code to pass:

```javascript
// src/services/DatabaseService.js
class DatabaseService {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.db = null;
  }

  async initialize() {
    const sqlite3 = require('sqlite3').verbose();
    this.db = new sqlite3.Database(this.dbPath);
  }

  async query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  async close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = DatabaseService;
```

### 2. Helper Functions (MUST be tested)

**TDD for utilities**:

```javascript
// tests/unit/test-validation-helpers.js
const assert = require('assert');
const { validateEmail, validateUrl } = require('../src/helpers/validation');

describe('Validation Helpers', () => {
  describe('validateEmail()', () => {
    it('should accept valid emails', () => {
      assert.strictEqual(validateEmail('user@example.com'), true);
      assert.strictEqual(validateEmail('test+tag@domain.co.uk'), true);
    });

    it('should reject invalid emails', () => {
      assert.strictEqual(validateEmail('invalid'), false);
      assert.strictEqual(validateEmail('@example.com'), false);
      assert.strictEqual(validateEmail('user@'), false);
    });

    it('should handle edge cases', () => {
      assert.strictEqual(validateEmail(''), false);
      assert.strictEqual(validateEmail(null), false);
      assert.strictEqual(validateEmail(undefined), false);
    });
  });
});
```

### 3. Middleware Development

**TDD for middleware**:

```javascript
// tests/unit/test-error-handler.js
const assert = require('assert');
const { errorHandler } = require('../src/middleware/errorHandler');

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('should handle errors with stack traces', () => {
    const error = new Error('Test error');
    errorHandler(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Test error',
        success: false,
      })
    );
  });
});
```

### 4. Exports and Public API

**Clear exports**:

```javascript
// src/index.js
module.exports = {
  // Services
  DatabaseService: require('./services/DatabaseService'),
  ValidationService: require('./services/ValidationService'),
  GuildAwareDatabaseService: require('./services/GuildAwareDatabaseService'),
  
  // Middleware
  errorHandler: require('./middleware/errorHandler'),
  logger: require('./middleware/logger'),
  
  // Helpers
  validators: require('./helpers/validators'),
  responseHelpers: require('./helpers/responseHelpers'),
  
  // Types/Constants
  ERROR_TYPES: require('./types/errors'),
  RESPONSE_CODES: require('./types/responses'),
};
```

**npm package.json exports**:

```json
{
  "exports": {
    ".": "./src/index.js",
    "./services": "./src/services/index.js",
    "./middleware": "./src/middleware/index.js",
    "./helpers": "./src/helpers/index.js"
  }
}
```

---

## Testing Requirements

### Coverage MUST be High (Shared Library)

```javascript
// tests/unit/test-[feature].js
const assert = require('assert');

describe('FeatureName', () => {
  describe('Happy path', () => {
    it('should work with valid input', () => {
      // Test correct functionality
    });
  });

  describe('Error paths', () => {
    it('should throw for invalid input', () => {
      // Test error handling
    });

    it('should handle edge cases', () => {
      // Test boundaries
    });

    it('should validate preconditions', () => {
      // Test constraints
    });
  });

  describe('Integration', () => {
    it('should work with other modules', () => {
      // Test compatibility
    });
  });
});
```

### Coverage Requirements (Shared Library - Strictest)

- **Lines**: 90%+ (higher than other modules)
- **Functions**: 95%+ (higher than other modules)
- **Branches**: 85%+ (higher than other modules)
- **Never decrease** existing coverage
- **All error paths** must be tested

### Test Execution

```bash
npm test                    # All tests with coverage
npm run test:watch         # Watch mode
npm run coverage           # Coverage report
npm run test:only -- service  # Specific test
npm test -- --coverage    # Coverage threshold check
```

---

## Code Quality Standards

### API Surface Consistency

**All exports documented**:

```javascript
/**
 * Database Service for guild-aware database operations
 * 
 * @class DatabaseService
 * @example
 * const db = new DatabaseService(':memory:');
 * await db.initialize();
 * const results = await db.query('SELECT * FROM quotes', []);
 */
class DatabaseService {
  /**
   * Initialize database connection
   * @async
   * @returns {Promise<void>}
   * @throws {Error} If connection fails
   */
  async initialize() { }

  /**
   * Execute SQL query
   * @async
   * @param {string} sql - SQL query string
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>} Query results
   * @throws {Error} If query fails
   */
  async query(sql, params = []) { }
}
```

### Error Handling

```javascript
class ServiceError extends Error {
  constructor(message, code, context = {}) {
    super(message);
    this.code = code;
    this.context = context;
  }
}

class ValidationError extends ServiceError {
  constructor(message, field, value) {
    super(message, 'VALIDATION_ERROR', { field, value });
  }
}

// Usage
if (!isValid) {
  throw new ValidationError('Invalid email', 'email', value);
}
```

---

## File Organization

```
verabot-utils/
├── src/
│   ├── index.js                    # Main exports
│   ├── services/
│   │   ├── DatabaseService.js      # Database operations
│   │   ├── ValidationService.js    # Input validation
│   │   ├── GuildAwareDatabaseService.js  # Multi-guild DB
│   │   └── index.js                # Services exports
│   ├── middleware/
│   │   ├── errorHandler.js         # Error handling
│   │   ├── logger.js               # Logging
│   │   └── index.js                # Middleware exports
│   ├── helpers/
│   │   ├── validators.js           # Validation helpers
│   │   ├── responseHelpers.js      # Response formatting
│   │   ├── formatters.js           # Data formatting
│   │   └── index.js                # Helpers exports
│   └── types/
│       ├── errors.js               # Error definitions
│       └── responses.js            # Response types
├── tests/
│   ├── unit/
│   │   ├── test-database-service.js
│   │   ├── test-validation-service.js
│   │   └── ...
│   ├── integration/
│   └── fixtures/
├── package.json
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
feat(services): add guild-aware database service

Implement GuildAwareDatabaseService that enforces:
- Mandatory guild context for all operations
- Per-guild data isolation
- Transaction support

Tests cover all CRUD operations and error cases.

Closes #127
```

### Pull Request Process

1. Create feature branch
2. Write tests FIRST (RED) - Test all paths
3. Write implementation (GREEN) - Minimal code
4. Refactor (REFACTOR) - Optimize quality
5. Run validation: `npm run validate`
6. Ensure coverage: 90%+ lines, 95%+ functions
7. Create pull request
8. Code review approval required
9. Merge to main

---

## Performance Guidelines

- **Service initialization**: < 100ms
- **Query execution**: < 50ms (in-memory) / < 100ms (db)
- **Validation**: < 10ms
- **Test execution**: < 30 seconds total
- **Lint check**: < 10 seconds

---

## Module-Specific Requirements

### As Shared Library

- ✅ No circular dependencies
- ✅ Clear, documented API
- ✅ Error handling comprehensive
- ✅ Type definitions provided
- ✅ Examples in README

### Publishing to npm (Future)

- ✅ Version follows semver
- ✅ Changelog maintained
- ✅ Breaking changes documented
- ✅ API stable and backwards compatible
- ✅ Tests 100% passing

### Integration with Modules

- ✅ verabot-core: Uses services and helpers
- ✅ verabot-dashboard: Uses services and validation
- ✅ Main repo: Tests integration patterns

---

## Key Commands

```bash
# Testing (Highest Coverage)
npm test                   # Run all tests with coverage
npm run test:watch        # Watch mode
npm run coverage          # Detailed coverage
npm run coverage:open     # Open in browser

# Code Quality
npm run lint              # Check code style
npm run lint:fix          # Auto-fix issues
npm run format            # Format code
npm run validate          # Lint + test

# Publishing (Future)
npm run build             # Build distribution
npm publish               # Publish to npm
```

---

**Version**: 1.0  
**Date**: January 20, 2026  
**Status**: Active - Applies to Phase 1, 2, 3  
**Inherits**: `.github/copilot-instructions.md` (main repo)
