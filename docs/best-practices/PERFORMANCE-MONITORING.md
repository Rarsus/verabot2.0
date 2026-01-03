# Performance Monitoring Guide

## Overview

The Performance Monitor tracks system metrics, query performance, and resource usage in real-time.

## Features

- **Query Metrics**: Execution times by type (SELECT, INSERT, UPDATE, DELETE)
- **Cache Metrics**: Hit rates, size, and memory usage
- **Pool Metrics**: Connection utilization and queue status
- **Memory Metrics**: Heap usage and RSS

## Viewing Metrics

### Runtime Monitoring

```javascript
const PerformanceMonitor = require('./src/services/PerformanceMonitor');
const monitor = new PerformanceMonitor();

// Log metrics periodically
setInterval(() => {
  monitor.logMetrics();
}, 300000); // Every 5 minutes
```

### CLI Command

```bash
npm run perf:monitor
```

## Metrics Interpretation

### Query Metrics

```
Queries:
  Total: 1000
  Cached: 800
  Uncached: 200
  Cache Hit Rate: 80%
  Avg Duration: 15ms
  Min Duration: 2ms
  Max Duration: 150ms
```

**Interpretation:**
- **Total**: Number of queries executed
- **Cache Hit Rate**: Percentage of queries served from cache (target: >80%)
- **Avg Duration**: Average query execution time (target: <20ms with cache)
- **Max Duration**: Slowest query (investigate if >100ms)

### Cache Metrics

```
Cache:
  Hits: 800
  Misses: 200
  Size: 95
  Hit Rate: 80%
```

**Interpretation:**
- **Hit Rate**: Should be >80% for optimal performance
- **Size**: Current cache utilization (should be < maxSize)

### Connection Pool Metrics

```
Connection Pool:
  Total: 5
  Available: 3
  In Use: 2
  Utilization: 40%
```

**Interpretation:**
- **Utilization**: Percentage of pool in use
- High utilization (>80%) may indicate need for larger pool
- Low utilization (<20%) may indicate over-provisioning

### Memory Metrics

```
Memory:
  Heap Used: 45.2 MB
  Heap Total: 78.5 MB
  RSS: 102.3 MB
```

**Interpretation:**
- Monitor for memory leaks (continuously growing heap used)
- Compare against available system memory

## Performance Optimization

### 1. Improve Cache Hit Rate

```javascript
// Increase cache size
const cache = new CacheManager({ maxSize: 200 });

// Adjust TTL
cache.set('key', value, 600000); // 10 minutes
```

### 2. Optimize Slow Queries

```javascript
// Find slow queries
const slowQueries = monitor.getSlowQueries(100);

// Analyze and optimize
slowQueries.forEach(q => {
  console.log(`Slow: ${q.sql} - ${q.duration}ms`);
});
```

### 3. Scale Connection Pool

```javascript
// Increase pool size for high concurrency
const pool = new DatabasePool({ poolSize: 10 });
```

## Alerts and Thresholds

### Recommended Thresholds

- **Cache Hit Rate**: Alert if <70%
- **Average Query Time**: Alert if >30ms
- **Pool Utilization**: Alert if >85%
- **Memory Usage**: Alert if heap >80% of total

### Example Alert Logic

```javascript
const metrics = monitor.getMetrics();

if (parseFloat(metrics.cache.hitRate) < 70) {
  console.warn('⚠️  Low cache hit rate:', metrics.cache.hitRate);
}

if (parseFloat(metrics.queries.averageDuration) > 30) {
  console.warn('⚠️  High average query time:', metrics.queries.averageDuration);
}

if (parseFloat(metrics.pool.utilization) > 85) {
  console.warn('⚠️  High pool utilization:', metrics.pool.utilization);
}
```

## Configuration

Enable performance monitoring in `.env`:

```
ENABLE_PERFORMANCE_MONITORING=true
PERFORMANCE_LOG_INTERVAL=300000
```

## Export Metrics

For advanced monitoring, metrics can be exported to external systems:

```javascript
const metrics = monitor.getMetrics();

// Send to monitoring service
await sendToMonitoringService(metrics);

// Log to file
fs.appendFileSync('metrics.log', JSON.stringify(metrics) + '\n');
```

## Troubleshooting

### Issue: Low Cache Hit Rate

**Causes:**
- TTL too short
- Cache size too small
- Aggressive invalidation

**Solutions:**
- Increase cache size
- Extend TTL for stable data
- Review invalidation patterns

### Issue: High Query Times

**Causes:**
- Missing indexes
- Complex queries
- Database locks

**Solutions:**
- Add indexes for frequently queried columns
- Use query builder for optimization
- Check for N+1 query problems

### Issue: Pool Exhaustion

**Causes:**
- Too many concurrent requests
- Connection leaks
- Slow queries blocking pool

**Solutions:**
- Increase pool size
- Fix connection leaks
- Optimize slow queries
- Implement request throttling
