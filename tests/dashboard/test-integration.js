/**
 * Test Suite: Dashboard Integration Tests
 * End-to-end tests for OAuth flow and API interactions
 */

let passed = 0;
let failed = 0;

console.log('\n=== Dashboard Integration Tests ===\n');

// Test 1: OAuth service and middleware integration
console.log('=== Test 1: OAuth Service + Middleware Integration ===');
try {
  const oauthService = require('../../dashboard/server/services/oauth-service');
  const { authMiddleware } = require('../../dashboard/server/middleware/auth');

  // Generate JWT
  const mockUser = {
    id: '123456789',
    username: 'testuser',
    discriminator: '0001',
    avatar: 'avatar_hash'
  };

  const jwt = oauthService.generateJWT(mockUser, 'mock_token');

  // Test middleware with JWT
  const req = {
    headers: { authorization: `Bearer ${jwt}` },
    cookies: {}
  };
  const res = {
    status: function() { return this; },
    json: function() { return this; }
  };
  let nextCalled = false;

  authMiddleware(req, res, () => { nextCalled = true; });

  if (nextCalled && req.user && req.user.userId === mockUser.id) {
    console.log('✅ OAuth service integrates with auth middleware');
    console.log('   JWT generated and verified successfully');
    passed++;
  } else {
    throw new Error('Integration failed');
  }
} catch (err) {
  console.error('❌ Test 1 Failed:', err.message);
  failed++;
}

// Test 2: Bot service initialization
console.log('\n=== Test 2: Bot Service Configuration ===');
try {
  const botService = require('../../dashboard/server/services/bot-service');

  if (botService && botService.botApiUrl) {
    console.log('✅ Bot service configured correctly');
    console.log('   API URL configured');
    passed++;
  } else {
    throw new Error('Bot service not configured');
  }
} catch (err) {
  console.error('❌ Test 2 Failed:', err.message);
  failed++;
}

// Test 3: Error handler integration
console.log('\n=== Test 3: Error Handler Integration ===');
try {
  const { errorHandler, notFoundHandler } = require('../../dashboard/server/middleware/error-handler');

  // Test 404 handler
  const req404 = { method: 'GET', path: '/nonexistent' };
  const res404 = {
    statusCode: 200,
    status: function(code) { this.statusCode = code; return this; },
    json: function() { return this; }
  };

  notFoundHandler(req404, res404);

  // Test error handler
  const error = new Error('Test error');
  const reqErr = { method: 'GET', path: '/test' };
  const resErr = {
    statusCode: 200,
    status: function(code) { this.statusCode = code; return this; },
    json: function() { return this; }
  };

  errorHandler(error, reqErr, resErr, () => {});

  if (res404.statusCode === 404 && resErr.statusCode === 500) {
    console.log('✅ Error handlers work correctly');
    console.log('   404 and 500 errors handled');
    passed++;
  } else {
    throw new Error('Error handlers not working');
  }
} catch (err) {
  console.error('❌ Test 3 Failed:', err.message);
  failed++;
}

// Test 4: Bot-side dashboard auth
console.log('\n=== Test 4: Bot-Side Dashboard Auth ===');
try {
  const dashboardAuth = require('../../src/middleware/dashboard-auth');

  if (dashboardAuth && dashboardAuth.verifyToken && dashboardAuth.checkAdminPermission) {
    console.log('✅ Bot-side dashboard auth configured');
    console.log('   JWT verification available');
    passed++;
  } else {
    throw new Error('Bot-side auth not configured');
  }
} catch (err) {
  console.error('❌ Test 4 Failed:', err.message);
  failed++;
}

// Test 5: JWT token flow (generate → verify)
console.log('\n=== Test 5: Complete JWT Token Flow ===');
try {
  const oauthService = require('../../dashboard/server/services/oauth-service');

  const mockUser = {
    id: '987654321',
    username: 'integrationtest',
    discriminator: '9999',
    avatar: 'test_avatar'
  };

  // Step 1: Generate JWT
  const jwt = oauthService.generateJWT(mockUser, 'integration_token');

  // Step 2: Verify JWT
  const decoded = oauthService.verifyJWT(jwt);

  // Step 3: Check all data preserved
  if (decoded &&
      decoded.userId === mockUser.id &&
      decoded.username === mockUser.username &&
      decoded.discriminator === mockUser.discriminator &&
      decoded.avatar === mockUser.avatar) {
    console.log('✅ Complete JWT flow works end-to-end');
    console.log('   Generated → Verified → Data intact');
    passed++;
  } else {
    throw new Error('JWT flow incomplete');
  }
} catch (err) {
  console.error('❌ Test 5 Failed:', err.message);
  failed++;
}

// Test 6: OAuth URL generation
console.log('\n=== Test 6: OAuth URL Generation ===');
try {
  const oauthService = require('../../dashboard/server/services/oauth-service');

  const authUrl = oauthService.getAuthorizationUrl();

  const urlChecks = [
    authUrl.includes('discord.com'),
    authUrl.includes('oauth2'),
    authUrl.includes('authorize'),
    authUrl.includes('client_id'),
    authUrl.includes('redirect_uri'),
    authUrl.includes('scope')
  ];

  const passedChecks = urlChecks.filter(check => check).length;

  if (passedChecks === urlChecks.length) {
    console.log('✅ OAuth URL has all required parameters');
    console.log(`   ${passedChecks}/${urlChecks.length} checks passed`);
    passed++;
  } else {
    throw new Error(`OAuth URL missing parameters: ${passedChecks}/${urlChecks.length} checks passed`);
  }
} catch (err) {
  console.error('❌ Test 6 Failed:', err.message);
  failed++;
}

// Test 7: Environment configuration
console.log('\n=== Test 7: Environment Configuration ===');
try {
  // Check if .env.example exists with required variables
  const fs = require('fs');
  const path = require('path');

  const envExamplePath = path.join(__dirname, '../../.env.example');
  const envContent = fs.readFileSync(envExamplePath, 'utf8');

  const requiredVars = [
    'DISCORD_CLIENT_ID',
    'DISCORD_CLIENT_SECRET',
    'DISCORD_REDIRECT_URI',
    'SESSION_SECRET',
    'ENABLE_DASHBOARD_API'
  ];

  const missingVars = requiredVars.filter(v => !envContent.includes(v));

  if (missingVars.length === 0) {
    console.log('✅ Environment configuration complete');
    console.log('   All required variables documented');
    passed++;
  } else {
    throw new Error(`Missing env vars: ${missingVars.join(', ')}`);
  }
} catch (err) {
  console.error('❌ Test 7 Failed:', err.message);
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
