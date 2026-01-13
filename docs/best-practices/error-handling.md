# Error Handling Standards

This document defines error handling conventions for VeraBot2.0.

## Error Categories

### 1. Command Execution Errors

- Automatically caught by `Command.wrapError()`
- Logged with MEDIUM severity
- User receives error message in Discord
- No stack traces sent to users

### 2. Database Errors

- Caught in database operations
- Logged with HIGH severity
- User-friendly fallback messages
- Operations rolled back on failure

### 3. API Errors

- External API failures (HuggingFace, Discord API)
- Logged with MEDIUM severity
- Graceful degradation with fallbacks
- Retry logic implemented where appropriate

### 4. Validation Errors

- Input validation failures
- Logged with LOW severity
- Clear user feedback on invalid input
- Suggestions provided when possible

## Error Logging

All errors logged via `error-handler.js`:

```javascript
const { logError, ERROR_LEVELS } = require('./utils/error-handler');

// Usage
logError('command.execute', err, ERROR_LEVELS.MEDIUM, {
  commandName: this.name,
  userId: interaction.user.id,
});
```

### Error Levels

- **LOW:** Validation, expected failures
- **MEDIUM:** Recoverable errors, retry recommended
- **HIGH:** Critical failures, requires attention
- **CRITICAL:** System failures, bot restart needed

## Best Practices

### 1. Always Use Try-Catch for Async Operations

```javascript
async executeInteraction(interaction) {
  try {
    // command logic
  } catch (err) {
    // Automatically handled by wrapError
    throw err;
  }
}
```

### 2. Use Command.wrapError for Automatic Handling

```javascript
const cmd = new Command({...});
cmd.register(); // Wraps execute and executeInteraction
```

### 3. Provide User-Friendly Error Messages

```javascript
// ❌ Bad
await interaction.reply('Error: undefined error');

// ✅ Good
const response = `❌ An error occurred: ${err.message || 'Unknown error'}`;
```

### 4. Include Metadata in Logs

```javascript
logError('quote.search', err, ERROR_LEVELS.MEDIUM, {
  commandName: 'search-quotes',
  searchTerm: query,
  userId: interaction.user.id,
});
```

## Error Response Helpers

Use response helpers for consistent error handling:

```javascript
const { sendError } = require('./utils/response-helpers');

// Simple error
await sendError(interaction, 'Failed to process quote');

// Error with details
await sendError(interaction, 'Database error', {
  details: 'Connection timeout',
});
```

## Database Error Handling

```javascript
try {
  // database operation
} catch (err) {
  logError('database.quote.add', err, ERROR_LEVELS.HIGH, {
    operation: 'INSERT',
    table: 'quotes',
  });
  throw err;
}
```

## API Error Handling

```javascript
try {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }
} catch (err) {
  logError('huggingface.api', err, ERROR_LEVELS.MEDIUM, {
    url,
    statusCode: err.response?.status,
  });
  // Use fallback
}
```

## Testing Error Scenarios

All command errors tested with mock interactions:

```javascript
// Test error handling
const cmd = new Command({ name: 'test', description: 'Test' });
const wrapped = cmd.wrapError(failingFn, 'test.execute');
const mockInteraction = createMockInteraction();

await wrapped(mockInteraction);
// Verify error reply was sent
assert(mockInteraction.replied === true);
```

## Monitoring & Debugging

### View Recent Errors

```bash
docker-compose logs --tail=100 verabot2 | grep ERROR
```

### View Error Metadata

```bash
docker-compose logs verabot2 | grep -A 5 "Metadata:"
```

## Recovery Procedures

### High Error Rate

1. Check logs for patterns
2. Verify database connection
3. Restart bot: `docker-compose restart`
4. Check Discord API status

### Database Errors

1. Verify SQLite file permissions
2. Check disk space
3. Backup and restore if corrupted
4. Check schema integrity

### API Errors

1. Verify API keys in .env
2. Check external service status
3. Verify network connectivity
4. Increase retry timeouts if needed
