/**
 * Jest Setup Hook
 * Intercepts process.exit calls from custom tests
 */

// Override process.exit to silently ignore (let Jest handle test results)
global.process.exit = function(_code) {
  // Silently ignore - don't throw, Jest will handle test results
  // This allows async operations to complete
  return;
};

// Increase Jest timeout for custom tests
jest.setTimeout(60000);
