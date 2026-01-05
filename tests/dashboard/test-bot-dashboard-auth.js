/**
 * Test Suite: Bot Dashboard Auth Middleware
 * Tests JWT verification middleware on bot side
 */

const dashboardAuth = require('../../src/middleware/dashboard-auth');

let passed = 0;
let failed = 0;

console.log('\n=== Bot Dashboard Auth Middleware Tests ===\n');

// Mock request/response objects
function createMockReq(token = null) {
  return {
    headers: token ? { authorization: `Bearer ${token}` } : {},
    dashboardUser: null,
    isAdmin: false
  };
}

function createMockRes() {
  let statusCode = 200;
  let jsonData = null;

  return {
    status: function(code) {
      statusCode = code;
      return this;
    },
    json: function(data) {
      jsonData = data;
      return this;
    },
    getStatus: () => statusCode,
    getData: () => jsonData
  };
}

// Mock Discord client
function createMockClient(guilds = []) {
  return {
    guilds: {
      cache: new Map(guilds.map(g => [g.id, g]))
    }
  };
}

// Test 1: Middleware object exists
console.log('=== Test 1: Middleware Object Exists ===');
try {
  if (dashboardAuth && typeof dashboardAuth.verifyToken === 'function') {
    console.log('✅ Dashboard auth middleware exists');
    passed++;
  } else {
    throw new Error('Dashboard auth middleware not found');
  }
} catch (err) {
  console.error('❌ Test 1 Failed:', err.message);
  failed++;
}

// Test 2: Required methods exist
console.log('\n=== Test 2: Required Methods Exist ===');
try {
  const requiredMethods = ['verifyToken', 'verifyBotToken', 'checkAdminPermission', 'logAccess'];
  const missingMethods = [];

  for (const method of requiredMethods) {
    if (typeof dashboardAuth[method] !== 'function') {
      missingMethods.push(method);
    }
  }

  if (missingMethods.length === 0) {
    console.log('✅ All required methods present');
    console.log('   Methods:', requiredMethods.join(', '));
    passed++;
  } else {
    throw new Error(`Missing methods: ${missingMethods.join(', ')}`);
  }
} catch (err) {
  console.error('❌ Test 2 Failed:', err.message);
  failed++;
}

// Test 3: Verify token rejects requests without token
console.log('\n=== Test 3: Reject Requests Without Token ===');
try {
  const req = createMockReq();
  const res = createMockRes();
  let nextCalled = false;

  dashboardAuth.verifyToken(req, res, () => { nextCalled = true; });

  if (res.getStatus() === 401 && !nextCalled) {
    console.log('✅ Requests without token rejected');
    passed++;
  } else {
    throw new Error('Request without token was not rejected');
  }
} catch (err) {
  console.error('❌ Test 3 Failed:', err.message);
  failed++;
}

// Test 4: Check admin permission requires authenticated user
console.log('\n=== Test 4: Admin Check Requires Auth ===');
try {
  const mockClient = createMockClient();
  const req = createMockReq();
  const res = createMockRes();
  let nextCalled = false;

  const middleware = dashboardAuth.checkAdminPermission(mockClient);
  middleware(req, res, () => { nextCalled = true; });

  if (res.getStatus() === 401 && !nextCalled) {
    console.log('✅ Admin check requires authenticated user');
    passed++;
  } else {
    throw new Error('Admin check did not require authentication');
  }
} catch (err) {
  console.error('❌ Test 4 Failed:', err.message);
  failed++;
}

// Test 5: Log access function works
console.log('\n=== Test 5: Log Access Middleware ===');
try {
  const req = createMockReq();
  req.dashboardUser = { username: 'testuser' };
  req.method = 'GET';
  req.path = '/api/test';

  const res = createMockRes();
  let nextCalled = false;

  // Capture console output
  const originalLog = console.log;
  let logMessage = '';
  console.log = (msg) => { logMessage = msg; };

  dashboardAuth.logAccess(req, res, () => { nextCalled = true; });

  console.log = originalLog;

  if (nextCalled && logMessage.includes('testuser')) {
    console.log('✅ Log access middleware works');
    console.log('   Logged:', logMessage.substring(0, 60) + '...');
    passed++;
  } else {
    throw new Error('Log access middleware did not work');
  }
} catch (err) {
  console.error('❌ Test 5 Failed:', err.message);
  failed++;
}

// Test 6: Verify bot token method exists
console.log('\n=== Test 6: Bot Token Verification ===');
try {
  const req = createMockReq();
  const res = createMockRes();
  let nextCalled = false;

  dashboardAuth.verifyBotToken(req, res, () => { nextCalled = true; });

  // Should reject without token
  if (res.getStatus() === 401 && !nextCalled) {
    console.log('✅ Bot token verification rejects without token');
    passed++;
  } else {
    throw new Error('Bot token verification did not reject correctly');
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
