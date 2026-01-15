# Security Environment Variables Reference

This document provides detailed information about all security-related environment variables in VeraBot2.0.

**Note:** These variables are now included in the main `.env.example` template. This document serves as a detailed reference.

## Encryption & Secrets

### ENCRYPTION_KEY

- **Type:** String (64 hexadecimal characters)
- **Required:** Recommended for production
- **Purpose:** Encrypts sensitive data in database
- **Generate:** `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- **Default:** Auto-generated on first run (not recommended for production)

### SECRET_KEY

- **Type:** String (64 hexadecimal characters)
- **Required:** Required for webhook authentication
- **Purpose:** HMAC signature verification
- **Generate:** `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Rate Limiting

### RATE_LIMIT_MAX_REQUESTS

- **Type:** Integer
- **Default:** 100
- **Purpose:** Maximum requests per time window
- **Recommendation:** Adjust based on server size

### RATE_LIMIT_WINDOW_MS

- **Type:** Integer (milliseconds)
- **Default:** 60000 (1 minute)
- **Purpose:** Time window for rate limiting
- **Recommendation:** Keep at 60000 for most use cases

### RATE_LIMIT_PER_USER

- **Type:** Integer
- **Default:** 10
- **Purpose:** Maximum requests per user per command
- **Recommendation:** Lower for resource-intensive commands

### COMMAND_COOLDOWN_SECONDS

- **Type:** Integer (seconds)
- **Default:** 3
- **Purpose:** Cooldown between command executions
- **Recommendation:** Increase for spam prevention

## Input Validation

### MAX_INPUT_LENGTH

- **Type:** Integer (characters)
- **Default:** 2000
- **Purpose:** Maximum length for user inputs
- **Recommendation:** Discord's message limit is 2000

### MAX_QUOTE_LENGTH

- **Type:** Integer (characters)
- **Default:** 1000
- **Purpose:** Maximum length for quote text
- **Recommendation:** Adjust based on use case

### MAX_AUTHOR_LENGTH

- **Type:** Integer (characters)
- **Default:** 100
- **Purpose:** Maximum length for author names
- **Recommendation:** 100 is reasonable for names

### MIN_QUOTE_LENGTH

- **Type:** Integer (characters)
- **Default:** 10
- **Purpose:** Minimum length for quote text
- **Recommendation:** Prevents empty or meaningless quotes

## Security Features

### STRICT_SECURITY_MODE

- **Type:** Boolean
- **Default:** true
- **Purpose:** Enables additional security checks
- **Recommendation:** Always enable in production

### ENABLE_SQL_INJECTION_DETECTION

- **Type:** Boolean
- **Default:** true
- **Purpose:** Scans inputs for SQL injection patterns
- **Recommendation:** Keep enabled (defense in depth)

### ENABLE_XSS_DETECTION

- **Type:** Boolean
- **Default:** true
- **Purpose:** Scans inputs for XSS patterns
- **Recommendation:** Enable for web-facing features

## Audit & Logging

### ENABLE_SECURITY_AUDIT

- **Type:** Boolean
- **Default:** false
- **Purpose:** Logs security events
- **Recommendation:** Enable for compliance requirements

### SECURITY_LOG_LEVEL

- **Type:** Enum (LOW, MEDIUM, HIGH, CRITICAL)
- **Default:** MEDIUM
- **Purpose:** Filters security log verbosity
- **Recommendation:** MEDIUM for most, HIGH for sensitive systems

### SECURITY_LOG_PATH

- **Type:** String (file path)
- **Default:** ./logs/security.log
- **Purpose:** Location for security audit logs
- **Recommendation:** Use absolute path in production

## Discord Security

### ADMIN_ROLE_IDS

- **Type:** String (comma-separated IDs)
- **Required:** Optional
- **Purpose:** Role IDs that can execute admin commands
- **Example:** `123456789012345678,987654321098765432`

### PRIVILEGED_USER_IDS

- **Type:** String (comma-separated IDs)
- **Required:** Optional
- **Purpose:** User IDs that can bypass role checks
- **Example:** `123456789012345678,987654321098765432`

### MAX_ATTACHMENT_SIZE

- **Type:** Integer (bytes)
- **Default:** 8388608 (8MB)
- **Purpose:** Maximum allowed attachment size
- **Recommendation:** Match Discord's limits

## Database Security

### USE_PREPARED_STATEMENTS

- **Type:** Boolean
- **Default:** true
- **Purpose:** Use prepared statements for SQL
- **Warning:** NEVER disable - prevents SQL injection

### DB_BACKUP_INTERVAL_HOURS

- **Type:** Integer (hours)
- **Default:** 24
- **Purpose:** Automatic backup frequency
- **Recommendation:** 24 for daily, 1 for critical systems

### DB_QUERY_TIMEOUT_MS

- **Type:** Integer (milliseconds)
- **Default:** 5000
- **Purpose:** Maximum query execution time
- **Recommendation:** Adjust based on query complexity

## API Security

### ENABLE_API_SIGNING

- **Type:** Boolean
- **Default:** false
- **Purpose:** Sign external API requests
- **Recommendation:** Enable if using external APIs

### API_TIMEOUT_MS

- **Type:** Integer (milliseconds)
- **Default:** 10000
- **Purpose:** Timeout for API requests
- **Recommendation:** 10000 is standard

### MAX_API_RETRIES

- **Type:** Integer
- **Default:** 3
- **Purpose:** Retry failed API requests
- **Recommendation:** 3 for resilience, 0 for real-time

## Development Mode

### DEV_MODE

- **Type:** Boolean
- **Default:** false
- **Purpose:** Enable development features
- **Warning:** NEVER enable in production

### ALLOW_INSECURE_DEV

- **Type:** Boolean
- **Default:** false
- **Purpose:** Allow insecure operations for testing
- **Warning:** Extremely dangerous, isolated dev only

---

## Security Best Practices

### Production Deployment Checklist

- [ ] Generate strong `ENCRYPTION_KEY` (64 hex chars)
- [ ] Generate strong `SECRET_KEY` (64 hex chars)
- [ ] Set `STRICT_SECURITY_MODE=true`
- [ ] Enable `ENABLE_SQL_INJECTION_DETECTION=true`
- [ ] Enable `ENABLE_XSS_DETECTION=true`
- [ ] Configure `ADMIN_ROLE_IDS` appropriately
- [ ] Set file permissions on `.env` to 600 or 400
- [ ] Enable `ENABLE_SECURITY_AUDIT=true`
- [ ] Rotate secrets every 90 days
- [ ] Set `DEV_MODE=false`
- [ ] Set `ALLOW_INSECURE_DEV=false`
- [ ] Configure `DB_BACKUP_INTERVAL_HOURS`
- [ ] Review and adjust rate limits

### Secret Generation

Generate cryptographically secure secrets:

```bash
# Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate secret key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate multiple secrets at once
node -e "
const crypto = require('crypto');
console.log('ENCRYPTION_KEY=' + crypto.randomBytes(32).toString('hex'));
console.log('SECRET_KEY=' + crypto.randomBytes(32).toString('hex'));
"
```

### File Permissions

Secure your `.env` file:

```bash
# Linux/Mac
chmod 600 .env

# Verify
ls -l .env
# Should show: -rw------- (only owner can read/write)
```

### Secret Rotation

Rotate secrets regularly:

1. Generate new secrets
2. Update `.env` with new values
3. Restart bot
4. Verify functionality
5. Document rotation date
6. Securely delete old secrets

---

## Related Documentation

- [Configuration Analysis](../CONFIGURATION-ANALYSIS.md)
- [Security Guide](../SECURITY.md)
- [Security Hardening](../SECURITY-HARDENING.md)
- [Setup Guide](../../README.md)
