/**
 * Test Suite: Dashboard OAuth Service
 * Tests Discord OAuth 2.0 flow, token exchange, and JWT generation
 */

const oauthService = require('../../dashboard/server/services/oauth-service');

let passed = 0;
let failed = 0;

console.log('\n=== Dashboard OAuth Service Tests ===\n');

// Test 1: OAuth service initialization
console.log('=== Test 1: OAuth Service Initialization ===');
try {
  if (oauthService && typeof oauthService.getAuthorizationUrl === 'function') {
    console.log('✅ OAuth service initialized correctly');
    passed++;
  } else {
    throw new Error('OAuth service not properly initialized');
  }
} catch (err) {
  console.error('❌ Test 1 Failed:', err.message);
  failed++;
}

// Test 2: Authorization URL generation
console.log('\n=== Test 2: Authorization URL Generation ===');
try {
  const authUrl = oauthService.getAuthorizationUrl();

  if (authUrl && authUrl.includes('discord.com/api/oauth2/authorize')) {
    console.log('✅ Authorization URL generated correctly');
    console.log('   URL:', authUrl.substring(0, 80) + '...');
    passed++;
  } else {
    throw new Error('Invalid authorization URL');
  }
} catch (err) {
  console.error('❌ Test 2 Failed:', err.message);
  failed++;
}

// Test 3: JWT generation
console.log('\n=== Test 3: JWT Token Generation ===');
try {
  const mockUser = {
    id: '123456789',
    username: 'testuser',
    discriminator: '0001',
    avatar: 'avatar_hash',
  };

  const mockAccessToken = 'mock_access_token';
  const jwt = oauthService.generateJWT(mockUser, mockAccessToken);

  if (jwt && typeof jwt === 'string' && jwt.split('.').length === 3) {
    console.log('✅ JWT token generated successfully');
    console.log('   Token parts:', jwt.split('.').length);
    passed++;
  } else {
    throw new Error('Invalid JWT token format');
  }
} catch (err) {
  console.error('❌ Test 3 Failed:', err.message);
  failed++;
}

// Test 4: JWT verification
console.log('\n=== Test 4: JWT Token Verification ===');
try {
  const mockUser = {
    id: '123456789',
    username: 'testuser',
    discriminator: '0001',
    avatar: 'avatar_hash',
  };

  const jwt = oauthService.generateJWT(mockUser, 'mock_token');
  const decoded = oauthService.verifyJWT(jwt);

  if (decoded && decoded.userId === mockUser.id && decoded.username === mockUser.username) {
    console.log('✅ JWT token verified successfully');
    console.log('   Decoded user ID:', decoded.userId);
    passed++;
  } else {
    throw new Error('JWT verification failed');
  }
} catch (err) {
  console.error('❌ Test 4 Failed:', err.message);
  failed++;
}

// Test 5: Invalid JWT verification
console.log('\n=== Test 5: Invalid JWT Token Rejection ===');
try {
  const invalidToken = 'invalid.jwt.token';
  const decoded = oauthService.verifyJWT(invalidToken);

  if (decoded === null) {
    console.log('✅ Invalid JWT token rejected correctly');
    passed++;
  } else {
    throw new Error('Invalid JWT was not rejected');
  }
} catch (err) {
  console.error('❌ Test 5 Failed:', err.message);
  failed++;
}

// Test 6: JWT expiration check
console.log('\n=== Test 6: JWT Token Expiration ===');
try {
  const mockUser = {
    id: '123456789',
    username: 'testuser',
    discriminator: '0001',
    avatar: 'avatar_hash',
  };

  const jwt = oauthService.generateJWT(mockUser, 'mock_token');
  const decoded = oauthService.verifyJWT(jwt);

  // Check if exp field exists and is in the future
  if (decoded && decoded.exp && decoded.exp > Date.now() / 1000) {
    const daysUntilExpiry = Math.floor((decoded.exp - Date.now() / 1000) / 86400);
    console.log('✅ JWT expiration set correctly');
    console.log(`   Expires in ~${daysUntilExpiry} days`);
    passed++;
  } else {
    throw new Error('JWT expiration not set correctly');
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
