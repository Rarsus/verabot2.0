# Phase 22.3f - WebhookListener & Dashboard Auth Coverage - Planning

**Phase Status:** Planning  
**Date:** January 13, 2026  
**Target:** 40-50 new tests  
**Estimated Duration:** 2-3 hours

---

## Overview

Phase 22.3f extends Phase 22.3 coverage expansion by adding comprehensive tests for:
1. **WebhookListenerService** (6495 bytes, 229 lines)
2. **Dashboard Authentication Middleware** (4553 bytes, 168 lines)

These critical services handle webhook processing and authentication, requiring thorough testing for security and reliability.

---

## Module Analysis

### 1. WebhookListenerService.js

**Purpose:** Handle incoming webhook messages and relay them to Discord channels

**Public Methods:**
- `constructor(discordClient)` - Initialize with Discord client
- `processIncomingMessage(payload)` - Process and send webhook messages
- `validateIncomingPayload(payload)` - Validate payload structure
- `generateSignature(payload, secret)` - Create HMAC signature
- `verifySignature(payload, signature, secret)` - Verify HMAC signature
- `createServer(port)` - Create HTTP server for webhooks
- `startListening(port)` - Start listening for webhooks
- `stopListening()` - Stop the webhook server
- `getServerStatus()` - Get server status

**Key Features:**
- HMAC signature generation and verification
- Payload validation
- HTTP server for webhook reception
- Discord message sending
- Error handling and logging

**Test Requirements:**
- Mock Discord client and channels
- Mock HTTP server functionality
- Test payload validation (valid/invalid)
- Test signature generation and verification
- Test error scenarios (missing channel, send failures)
- Test server lifecycle (start, stop)
- Real-world webhook scenarios

**Estimated Tests:** 25-30

---

### 2. Dashboard Authentication Middleware

**Purpose:** Authenticate dashboard users via JWT and verify API tokens

**Public Methods:**
- `constructor()` - Initialize with JWT secret
- `verifyToken(req, res, next)` - Verify JWT token from Authorization header
- `verifyBotToken(req, res, next)` - Verify bot API token
- `checkAdminPermission(client)` - Check if user has admin permissions
- `generateToken(userData)` - Generate JWT token
- `refreshToken(token)` - Refresh JWT token
- `revokeToken(token)` - Revoke token

**Key Features:**
- JWT token verification
- Bearer token parsing
- User info extraction
- API token validation
- Permission checking
- Token refresh and revocation

**Test Requirements:**
- Mock Express request/response
- Test valid/invalid JWT tokens
- Test expired tokens
- Test missing tokens
- Test malformed Authorization headers
- Test API token validation
- Test user context setting
- Test admin permission checking
- Error handling (401, 403)

**Estimated Tests:** 20-25

---

## Test Structure Plan

### WebhookListenerService Tests

**File:** `tests/unit/services/test-webhook-listener-coverage.test.js`

**Sections:**
1. Initialization (3-4 tests)
2. Payload Validation (5-6 tests)
3. Message Processing (5-6 tests)
4. HMAC Signature (4-5 tests)
5. Server Lifecycle (3-4 tests)
6. Error Handling (4-5 tests)
7. Real-World Scenarios (3-4 tests)

**Total:** 27-33 tests

---

### Dashboard Auth Middleware Tests

**File:** `tests/unit/middleware/test-dashboard-auth-coverage.test.js`

**Sections:**
1. Initialization (2-3 tests)
2. JWT Token Verification (6-7 tests)
3. Token Parsing & Extraction (3-4 tests)
4. Bot API Token Verification (4-5 tests)
5. Admin Permission Checking (4-5 tests)
6. Error Handling (3-4 tests)
7. Real-World Auth Flows (2-3 tests)

**Total:** 24-31 tests

---

## Mocking Strategy

### WebhookListenerService Mocks

```javascript
// Discord client mock
const mockDiscordClient = {
  channels: {
    cache: {
      get: (id) => ({
        send: async (content) => ({ id: 'msg-123', content })
      })
    }
  }
};

// HTTP request mock
const mockPayload = {
  channel: 'channel-123',
  content: 'Test message',
  timestamp: Date.now()
};
```

### Dashboard Auth Mocks

```javascript
// Express request/response mocks
const mockReq = {
  headers: { authorization: 'Bearer valid.jwt.token' }
};

const mockRes = {
  status: (code) => ({
    json: (data) => ({ code, data })
  })
};

const mockNext = () => {};
```

---

## Coverage Goals

### WebhookListenerService
- **Statements:** 85%+
- **Branches:** 80%+
- **Functions:** 100%
- **Lines:** 85%+

### Dashboard Auth
- **Statements:** 90%+
- **Branches:** 85%+
- **Functions:** 100%
- **Lines:** 90%+

---

## Test Execution Timeline

| Phase | Task | Est. Time | Status |
|-------|------|-----------|--------|
| 1 | Plan & Setup | 30 min | ✅ In Progress |
| 2 | WebhookListener Tests | 60 min | ⏳ Pending |
| 3 | Dashboard Auth Tests | 45 min | ⏳ Pending |
| 4 | Validation & Review | 30 min | ⏳ Pending |
| 5 | Documentation | 30 min | ⏳ Pending |

---

## Expected Results

### Test Metrics
- New Tests: 50-60
- Total Tests: 1818 → 1868-1878
- Pass Rate: 100%
- ESLint Errors: 0
- Execution Time: ~24-26 seconds (minimal overhead)

### Coverage Improvement
- WebhookListenerService: 0% → 85%+
- Dashboard Auth: 0% → 90%+
- Overall Coverage: ~82% → ~84%+

---

## Implementation Priorities

### High Priority (Must Have)
1. Basic initialization tests
2. Happy path functionality
3. Error handling
4. Security validation

### Medium Priority (Should Have)
1. Edge cases
2. Concurrent operations
3. Recovery scenarios
4. Real-world patterns

### Low Priority (Nice to Have)
1. Performance benchmarks
2. Memory usage tests
3. Advanced concurrency
4. Stress scenarios

---

## Risk Assessment

### WebhookListenerService Risks
- HTTP server mock complexity ⚠️ Medium
- Discord.js integration mocking ⚠️ Medium
- Async operation testing ⚠️ Low

### Dashboard Auth Risks
- JWT library mocking ⚠️ Medium
- Express framework mocking ⚠️ Low
- Token generation/refresh ⚠️ Medium

---

## Success Criteria

✅ All new tests passing (100% pass rate)  
✅ No regressions in existing tests  
✅ ESLint validation passes (0 errors)  
✅ Coverage targets met for both modules  
✅ Comprehensive documentation updated  
✅ Commit messages follow project standards  
✅ Git history clean and descriptive

---

## Next Steps

1. Create WebhookListenerService test file
2. Implement 27-33 comprehensive tests
3. Create Dashboard Auth test file
4. Implement 24-31 comprehensive tests
5. Run full validation
6. Create Phase 22.3f completion report
7. Update project documentation
8. Merge to main branch

---

**Plan Status:** READY FOR IMPLEMENTATION  
**Created:** January 13, 2026

