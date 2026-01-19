#!/usr/bin/env node
/**
 * Performance Metrics Display Script
 * Show current performance metrics
 */

console.log('📊 Performance Metrics\n');
console.log('━'.repeat(60));
console.log('Performance monitoring is available at runtime.');
console.log('To view metrics:');
console.log('  1. Ensure ENABLE_PERFORMANCE_MONITORING=true in .env');
console.log('  2. Start the bot with `npm start`');
console.log('  3. Metrics are logged periodically to console');
console.log('━'.repeat(60));
console.log('\nMetrics include:');
console.log('  • Query execution times (avg, min, max)');
console.log('  • Cache hit rates');
console.log('  • Connection pool utilization');
console.log('  • Memory usage');
console.log('  • Query distribution by type\n');

process.exit(0);
