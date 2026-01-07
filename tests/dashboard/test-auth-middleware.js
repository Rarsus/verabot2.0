/**
 * Test Suite: Dashboard Auth Middleware
 * Tests JWT authentication and authorization middleware
 */

const { authMiddleware, optionalAuth } = require('../../dashboard/server/middleware/auth');
const oauthService = require('../../dashboard/server/services/oauth-service');

let passed = 0;
let failed = 0;

console.log('\n=== Dashboard Auth Middleware Tests ===\n');

// Mock request/response objects
function createMockReq(token = null, cookie = null) {
  return {
    headers: token ? { authorization: `Bearer ${token}` } : {},
    cookies: cookie ? { auth_token: cookie } : {},
  };
}

function createMockRes() {
  let statusCode = 200;
  let jsonData = null;

  return {
    status: function (code) {
      statusCode = code;
      return this;
    },
    json: function (data) {
      jsonData = data;
      return this;
    },
    getStatus: () => statusCode,
    getData: () => jsonData,
  };
}

// Test 1: Middleware functions exist
console.log('=== Test 1: Middleware Functions Exist ===');
try {
  if (typeof authMiddleware === 'function' && typeof optionalAuth === 'function') {
    console.log('✅ Auth middleware functions exist');
    passed++;
  } else {
    throw new Error('Middleware functions not found');
  }
} catch (err) {
  console.error('❌ Test 1 Failed:', err.message);
  failed++;
}

// Test 2: Auth middleware rejects requests without token
console.log('\n=== Test 2: Reject Requests Without Token ===');
try {
  const req = createMockReq();
  const res = createMockRes();
  let nextCalled = false;

  authMiddleware(req, res, () => {
    nextCalled = true;
  });

  if (res.getStatus() === 401 && !nextCalled) {
    console.log('✅ Requests without token rejected');
    console.log('   Status:', res.getStatus());
    passed++;
  } else {
    throw new Error('Request without token was not rejected');
  }
} catch (err) {
  console.error('❌ Test 2 Failed:', err.message);
  failed++;
}

// Test 3: Auth middleware accepts valid token
console.log('\n=== Test 3: Accept Valid Token ===');
try {
  const mockUser = {
    id: '123456789',
    username: 'testuser',
    discriminator: '0001',
    avatar: 'avatar_hash',
  };

  const validToken = oauthService.generateJWT(mockUser, 'mock_token');
  const req = createMockReq(validToken);
  const res = createMockRes();
  let nextCalled = false;

  authMiddleware(req, res, () => {
    nextCalled = true;
  });

  if (nextCalled && req.user && req.user.userId === mockUser.id) {
    console.log('✅ Valid token accepted');
    console.log('   User attached to request:', req.user.username);
    passed++;
  } else {
    throw new Error('Valid token was not accepted');
  }
} catch (err) {
  console.error('❌ Test 3 Failed:', err.message);
  failed++;
}

// Test 4: Auth middleware accepts token from cookie
console.log('\n=== Test 4: Accept Token from Cookie ===');
try {
  const mockUser = {
    id: '123456789',
    username: 'testuser',
    discriminator: '0001',
    avatar: 'avatar_hash',
  };

  const validToken = oauthService.generateJWT(mockUser, 'mock_token');
  const req = createMockReq(null, validToken);
  const res = createMockRes();
  let nextCalled = false;

  authMiddleware(req, res, () => {
    nextCalled = true;
  });

  if (nextCalled && req.user) {
    console.log('✅ Token from cookie accepted');
    passed++;
  } else {
    throw new Error('Token from cookie was not accepted');
  }
} catch (err) {
  console.error('❌ Test 4 Failed:', err.message);
  failed++;
}

// Test 5: Optional auth doesn't block without token
console.log('\n=== Test 5: Optional Auth Without Token ===');
try {
  const req = createMockReq();
  const res = createMockRes();
  let nextCalled = false;

  optionalAuth(req, res, () => {
    nextCalled = true;
  });

  if (nextCalled && res.getStatus() === 200) {
    console.log('✅ Optional auth allows requests without token');
    passed++;
  } else {
    throw new Error('Optional auth blocked request without token');
  }
} catch (err) {
  console.error('❌ Test 5 Failed:', err.message);
  failed++;
}

// Test 6: Optional auth attaches user if token present
console.log('\n=== Test 6: Optional Auth With Token ===');
try {
  const mockUser = {
    id: '123456789',
    username: 'testuser',
    discriminator: '0001',
    avatar: 'avatar_hash',
  };

  const validToken = oauthService.generateJWT(mockUser, 'mock_token');
  const req = createMockReq(validToken);
  const res = createMockRes();
  let nextCalled = false;

  optionalAuth(req, res, () => {
    nextCalled = true;
  });

  if (nextCalled && req.user) {
    console.log('✅ Optional auth attaches user when token present');
    passed++;
  } else {
    throw new Error('Optional auth did not attach user');
  }
} catch (err) {
  console.error('❌ Test 6 Failed:', err.message);
  failed++;
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('Test Summary:');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);
console.log('='.repeat(60) + '\n');

process.exit(failed > 0 ? 1 : 0);
