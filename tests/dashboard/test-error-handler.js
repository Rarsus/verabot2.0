/**
 * Test Suite: Dashboard Error Handler
 * Tests error handling middleware
 */

const { errorHandler, notFoundHandler } = require('../../dashboard/server/middleware/error-handler');

let passed = 0;
let failed = 0;

console.log('\n=== Dashboard Error Handler Tests ===\n');

// Mock request/response objects
function createMockReq(method = 'GET', path = '/test') {
  return {
    method,
    path
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

// Test 1: Error handler functions exist
console.log('=== Test 1: Error Handler Functions Exist ===');
try {
  if (typeof errorHandler === 'function' && typeof notFoundHandler === 'function') {
    console.log('✅ Error handler functions exist');
    passed++;
  } else {
    throw new Error('Error handler functions not found');
  }
} catch (err) {
  console.error('❌ Test 1 Failed:', err.message);
  failed++;
}

// Test 2: Not found handler returns 404
console.log('\n=== Test 2: Not Found Handler ===');
try {
  const req = createMockReq('GET', '/nonexistent');
  const res = createMockRes();

  notFoundHandler(req, res);

  if (res.getStatus() === 404) {
    const data = res.getData();
    console.log('✅ Not found handler returns 404');
    console.log('   Message:', data.message);
    passed++;
  } else {
    throw new Error('Not found handler did not return 404');
  }
} catch (err) {
  console.error('❌ Test 2 Failed:', err.message);
  failed++;
}

// Test 3: Error handler handles generic errors
console.log('\n=== Test 3: Generic Error Handling ===');
try {
  const error = new Error('Test error');
  const req = createMockReq();
  const res = createMockRes();

  errorHandler(error, req, res, () => {});

  if (res.getStatus() === 500) {
    const data = res.getData();
    console.log('✅ Generic errors handled with 500 status');
    console.log('   Error:', data.error);
    passed++;
  } else {
    throw new Error('Generic error not handled correctly');
  }
} catch (err) {
  console.error('❌ Test 3 Failed:', err.message);
  failed++;
}

// Test 4: Error handler handles unauthorized errors
console.log('\n=== Test 4: Unauthorized Error Handling ===');
try {
  const error = new Error('Unauthorized');
  error.name = 'UnauthorizedError';
  const req = createMockReq();
  const res = createMockRes();

  errorHandler(error, req, res, () => {});

  if (res.getStatus() === 401) {
    console.log('✅ Unauthorized errors handled with 401 status');
    passed++;
  } else {
    throw new Error('Unauthorized error not handled correctly');
  }
} catch (err) {
  console.error('❌ Test 4 Failed:', err.message);
  failed++;
}

// Test 5: Error handler handles validation errors
console.log('\n=== Test 5: Validation Error Handling ===');
try {
  const error = new Error('Validation failed');
  error.name = 'ValidationError';
  const req = createMockReq();
  const res = createMockRes();

  errorHandler(error, req, res, () => {});

  if (res.getStatus() === 400) {
    console.log('✅ Validation errors handled with 400 status');
    passed++;
  } else {
    throw new Error('Validation error not handled correctly');
  }
} catch (err) {
  console.error('❌ Test 5 Failed:', err.message);
  failed++;
}

// Test 6: Error handler respects custom status codes
console.log('\n=== Test 6: Custom Status Code Handling ===');
try {
  const error = new Error('Custom error');
  error.statusCode = 503;
  const req = createMockReq();
  const res = createMockRes();

  errorHandler(error, req, res, () => {});

  if (res.getStatus() === 503) {
    console.log('✅ Custom status codes respected');
    passed++;
  } else {
    throw new Error('Custom status code not respected');
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
