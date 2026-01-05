# Dashboard Test Suite

Comprehensive automated tests for the VeraBot Dashboard OAuth implementation.

## Test Coverage

### 1. OAuth Service Tests (`test-oauth-service.js`)
- OAuth service initialization
- Authorization URL generation
- JWT token generation
- JWT token verification
- Invalid JWT token rejection
- JWT token expiration checks

**Run:** `npm run test:dashboard:oauth`

### 2. Bot Service Tests (`test-bot-service.js`)
- Bot service initialization
- Required methods verification
- Bot API URL configuration
- Admin verification logic

**Run:** `npm run test:dashboard:bot`

### 3. Auth Middleware Tests (`test-auth-middleware.js`)
- Middleware function existence
- Request rejection without token
- Valid token acceptance
- Token acceptance from cookies
- Optional auth without token
- Optional auth with token

**Run:** `npm run test:dashboard:auth`

### 4. Error Handler Tests (`test-error-handler.js`)
- Error handler functions existence
- 404 not found handling
- Generic error handling (500)
- Unauthorized error handling (401)
- Validation error handling (400)
- Custom status code handling

**Run:** `npm run test:dashboard:errors` (if added)

### 5. Bot Dashboard Auth Tests (`test-bot-dashboard-auth.js`)
- Middleware object existence
- Required methods verification
- Token rejection without authentication
- Admin permission checks
- Access logging
- Bot token verification

**Run:** Individual file execution

### 6. Integration Tests (`test-integration.js`)
- OAuth service + middleware integration
- Bot service configuration
- Error handler integration
- Bot-side dashboard auth
- Complete JWT token flow
- OAuth URL generation
- Environment configuration

**Run:** `npm run test:dashboard:integration`

## Running Tests

### Run All Dashboard Tests
```bash
npm run test:dashboard
```

### Run Individual Test Suites
```bash
# OAuth service only
npm run test:dashboard:oauth

# Bot service only
npm run test:dashboard:bot

# Auth middleware only
npm run test:dashboard:auth

# Integration tests only
npm run test:dashboard:integration
```

### Run Individual Test Files
```bash
node tests/dashboard/test-oauth-service.js
node tests/dashboard/test-bot-service.js
node tests/dashboard/test-auth-middleware.js
node tests/dashboard/test-error-handler.js
node tests/dashboard/test-bot-dashboard-auth.js
node tests/dashboard/test-integration.js
```

## Test Structure

Each test file follows this pattern:

```javascript
let passed = 0;
let failed = 0;

console.log('=== Test Description ===');
try {
  // Test logic
  if (condition) {
    console.log('✅ Test Passed');
    passed++;
  } else {
    throw new Error('Test failed');
  }
} catch (err) {
  console.error('❌ Test Failed:', err.message);
  failed++;
}

// Summary
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
```

## Expected Results

All tests should pass with 0 failures:

```
╔════════════════════════════════════════════════╗
║   Dashboard Test Summary                       ║
╚════════════════════════════════════════════════╝

Test Results by File:
────────────────────────────────────────────────────────────
✅ test-oauth-service.js              6 passed, 0 failed
✅ test-bot-service.js                4 passed, 0 failed
✅ test-auth-middleware.js            6 passed, 0 failed
✅ test-error-handler.js              6 passed, 0 failed
✅ test-bot-dashboard-auth.js         6 passed, 0 failed
✅ test-integration.js                7 passed, 0 failed
────────────────────────────────────────────────────────────

📊 Overall Results:
   ✅ Total Passed: 35
   ❌ Total Failed: 0
   📝 Total Tests: 35
   📁 Test Files: 6

   🎉 All tests passed!
```

## Test Coverage Areas

### Backend OAuth Service
- ✅ Discord OAuth 2.0 flow
- ✅ JWT token generation/verification
- ✅ Token expiration handling
- ✅ Authorization URL generation

### Authentication & Authorization
- ✅ JWT middleware verification
- ✅ Cookie-based authentication
- ✅ Optional authentication
- ✅ Admin permission checks

### Error Handling
- ✅ 404 not found responses
- ✅ 401 unauthorized responses
- ✅ 400 validation errors
- ✅ 500 server errors
- ✅ Custom error status codes

### Integration
- ✅ OAuth + Middleware integration
- ✅ Bot service configuration
- ✅ Complete JWT flow
- ✅ Environment configuration

## Adding New Tests

To add new test files:

1. Create test file in `tests/dashboard/`
2. Follow naming convention: `test-*.js`
3. Use the test structure pattern above
4. Add to package.json scripts (optional)
5. Run test runner to verify

Example:
```bash
# Create new test
touch tests/dashboard/test-new-feature.js

# Run all tests including new one
npm run test:dashboard
```

## Continuous Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Dashboard Tests
  run: npm run test:dashboard
```

## Troubleshooting

### Tests Fail with Module Not Found
Ensure you're running from the project root:
```bash
cd /path/to/verabot2.0
npm run test:dashboard
```

### JWT Verification Fails
Check that SESSION_SECRET is consistent across dashboard server and bot.

### Integration Tests Fail
Ensure all dependencies are installed:
```bash
npm install
cd dashboard/server && npm install
```

## Test Maintenance

- Tests use no external dependencies beyond Node.js built-ins
- Tests are self-contained and can run independently
- Mock objects are used for Discord client and HTTP req/res
- No actual network calls are made during tests

## Future Enhancements

Potential additions to the test suite:

- [ ] Rate limiting tests
- [ ] Token refresh tests
- [ ] WebSocket connection tests
- [ ] Database integration tests
- [ ] Performance/load tests
- [ ] Security vulnerability tests
- [ ] API endpoint tests with actual HTTP calls

## Documentation

For more information on the dashboard implementation:
- `DASHBOARD-OAUTH-SETUP.md` - Setup guide
- `DASHBOARD-IMPLEMENTATION-COMPLETE.md` - Implementation summary
- `DASHBOARD-DOCKER-OAUTH-ROADMAP.md` - Original roadmap
