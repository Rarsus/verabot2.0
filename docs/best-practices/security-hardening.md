# Security Hardening Guide

Comprehensive security implementation details for VeraBot2.0, including input validation, encryption, and best practices.

## Table of Contents

- [Overview](#overview)
- [Input Validation](#input-validation)
- [Encryption & Cryptography](#encryption--cryptography)
- [Security Testing](#security-testing)
- [Best Practices](#best-practices)
- [Vulnerability Reporting](#vulnerability-reporting)

## Overview

VeraBot2.0 implements multiple layers of security to protect against common vulnerabilities:

1. **Input Validation** - Prevents SQL injection and XSS attacks
2. **Encryption** - Protects sensitive data at rest
3. **Rate Limiting** - Prevents abuse and DoS attacks
4. **Security Testing** - 35+ automated security tests
5. **Dependency Scanning** - Automatic vulnerability detection

## Input Validation

### Module: `src/middleware/inputValidator.js`

The input validator provides comprehensive validation and sanitization for all user inputs.

### SQL Injection Prevention

**What is SQL Injection?**
SQL injection is a code injection technique that exploits security vulnerabilities in database queries.

**How We Prevent It:**

```javascript
const { validateTextInput, detectSQLInjection } = require('../middleware/inputValidator');

// Example: Validate user quote input
const result = validateTextInput(userInput, {
  minLength: 10,
  maxLength: 1000,
  checkSQLInjection: true,
  fieldName: 'quote',
});

if (!result.valid) {
  console.error('Validation errors:', result.errors);
  return;
}

// Use sanitized input
const safeInput = result.sanitized;
```

**Detected Patterns:**

- UNION attacks: `' UNION SELECT * FROM users--`
- OR conditions: `' OR '1'='1`
- Comment injection: `'; DROP TABLE users--`
- Hex encoding: `0x31=0x31`

**Example Usage:**

```javascript
// In a command handler
async execute(message, args) {
  const quoteText = args.join(' ');

  const validation = validateTextInput(quoteText, {
    minLength: 10,
    maxLength: 1000,
    checkSQLInjection: true,
    fieldName: 'quote text'
  });

  if (!validation.valid) {
    return message.reply(`❌ Invalid input: ${validation.errors.join(', ')}`);
  }

  // Safe to use validation.sanitized
  await db.addQuote(validation.sanitized, message.author.username);
}
```

### XSS Prevention

**What is XSS (Cross-Site Scripting)?**
XSS attacks inject malicious scripts into web content or Discord messages.

**How We Prevent It:**

```javascript
const { validateTextInput, detectXSS } = require('../middleware/inputValidator');

// Validate and sanitize user input
const result = validateTextInput(userInput, {
  checkXSS: true,
  fieldName: 'message',
});

if (!result.valid) {
  // Input contains XSS patterns
  console.error('XSS attempt blocked:', result.errors);
  return;
}
```

**Detected Patterns:**

- Script tags: `<script>alert('XSS')</script>`
- Event handlers: `<img src=x onerror="alert(1)">`
- IFrames: `<iframe src="http://evil.com"></iframe>`
- JavaScript protocol: `<a href="javascript:alert(1)">Click</a>`

### Validation Functions

#### `validateTextInput(input, options)`

Validates and sanitizes text input.

**Options:**

```javascript
{
  minLength: 1,              // Minimum length
  maxLength: 2000,           // Maximum length
  allowEmpty: false,         // Allow empty strings
  checkSQLInjection: true,   // Check for SQL injection
  checkXSS: true,            // Check for XSS
  customPattern: null,       // Custom regex pattern
  fieldName: 'input'         // Field name for error messages
}
```

**Returns:**

```javascript
{
  valid: boolean,            // Whether input is valid
  sanitized: string,         // Sanitized input (safe to use)
  errors: string[]           // Array of error messages
}
```

#### `validateNumericInput(input, options)`

Validates numeric input.

**Options:**

```javascript
{
  min: Number.MIN_SAFE_INTEGER,  // Minimum value
  max: Number.MAX_SAFE_INTEGER,  // Maximum value
  integer: false,                // Must be integer
  positive: false,               // Must be positive
  fieldName: 'input'             // Field name
}
```

**Example:**

```javascript
const result = validateNumericInput(args[0], {
  min: 1,
  max: 100,
  integer: true,
  positive: true,
  fieldName: 'quote ID',
});

if (!result.valid) {
  return message.reply(`❌ ${result.errors.join(', ')}`);
}

const quoteId = result.value;
```

#### `validateDiscordId(userId)`

Validates Discord snowflake IDs.

**Example:**

```javascript
const result = validateDiscordId(message.author.id);
if (!result.valid) {
  console.error('Invalid Discord ID');
}
```

### Rate Limiting

**Prevents abuse by limiting requests per user.**

```javascript
const { RateLimiter } = require('../middleware/inputValidator');

// Create rate limiter (10 requests per minute)
const limiter = new RateLimiter(10, 60000);

// In command handler
if (!limiter.isAllowed(message.author.id)) {
  return message.reply('⏱️ Slow down! Try again in a minute.');
}

// Process command
const remaining = limiter.getRemaining(message.author.id);
console.log(`User has ${remaining} requests remaining`);
```

**Methods:**

- `isAllowed(identifier)` - Check if request is allowed
- `getRemaining(identifier)` - Get remaining requests
- `reset(identifier)` - Reset limits for user
- `clear()` - Clear all limits

## Encryption & Cryptography

### Module: `src/utils/security.js`

Provides cryptographic functions for data protection.

### Setup

**Generate Encryption Keys:**

```bash
# Generate encryption key (64 hex characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate secret key for HMAC
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Add to `.env`:**

```env
ENCRYPTION_KEY=your_64_character_hex_key_here
SECRET_KEY=your_64_character_hex_key_here
```

### Encryption (AES-256-GCM)

**Encrypt sensitive data before storing:**

```javascript
const { encrypt, decrypt } = require('../utils/security');

// Encrypt sensitive data
const sensitiveData = 'secret API key';
const encrypted = encrypt(sensitiveData);

// Store encrypted data
await db.storeSecret(encrypted);

// Later, decrypt data
const stored = await db.getSecret();
const decrypted = decrypt(stored);
```

**Features:**

- AES-256-GCM algorithm (authenticated encryption)
- Random IV for each encryption
- Authentication tags to detect tampering
- Automatic key management from environment

### HMAC Signatures

**Verify data integrity and authenticity:**

```javascript
const { generateHMAC, verifyHMAC } = require('../utils/security');

// Generate signature
const data = JSON.stringify({ userId: '123', action: 'delete' });
const signature = generateHMAC(data);

// Send data and signature to client
// ...

// Later, verify signature
const receivedData = /* from client */;
const receivedSignature = /* from client */;

if (verifyHMAC(receivedData, receivedSignature)) {
  console.log('✅ Data verified - not tampered');
} else {
  console.log('❌ Data tampered - reject request');
}
```

### Password Hashing

**Securely hash passwords using PBKDF2:**

```javascript
const { hashPassword, verifyPassword } = require('../utils/security');

// Hash password
const password = 'user_password';
const hashed = hashPassword(password);

// Store hashed password
await db.storeUserPassword(userId, hashed);

// Later, verify password
const inputPassword = /* from user */;
const storedHash = await db.getUserPassword(userId);

if (verifyPassword(inputPassword, storedHash)) {
  console.log('✅ Password correct');
} else {
  console.log('❌ Password incorrect');
}
```

**Features:**

- PBKDF2 with 100,000 iterations
- Random salt per password
- Timing-safe comparison

### Token Generation

**Generate secure random tokens:**

```javascript
const { generateToken, validateToken, generateSecureString } = require('../utils/security');

// Generate API token (64 characters hex)
const apiToken = generateToken(32);

// Validate token format
if (!validateToken(apiToken, 64)) {
  console.log('Invalid token format');
}

// Generate alphanumeric string
const sessionId = generateSecureString(20, 'alphanumeric');
```

### Security Configuration

See `.env.security` template for all security-related configuration options.

**Key Settings:**

```env
# Required in production
ENCRYPTION_KEY=<64-char-hex>
SECRET_KEY=<64-char-hex>

# Rate limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000

# Input validation
MAX_INPUT_LENGTH=2000
MAX_QUOTE_LENGTH=1000

# Security features
STRICT_SECURITY_MODE=true
ENABLE_SQL_INJECTION_DETECTION=true
ENABLE_XSS_DETECTION=true
```

## Security Testing

### Running Security Tests

```bash
# Run security validation tests (20 tests)
npm run test:security

# Run security integration tests (15 tests)
npm run test:integration

# Run all security checks
npm run security:check
```

### Test Coverage

**Unit Tests (20 tests):**

1. Valid text input accepted
   2-4. SQL injection detection (UNION, OR, comment attacks)
   5-8. XSS detection (scripts, iframes, event handlers, JS protocol)
   9-10. Text length validation
   11-14. Numeric validation
   15-16. Discord ID validation
2. String sanitization
   18-20. Rate limiting

**Integration Tests (15 tests):**
1-4. Encryption/decryption round-trip and validation
5-7. HMAC generation and verification
8-10. Password hashing and verification
11-15. Token generation and validation

### Writing Security Tests

**Example Test:**

```javascript
const { validateTextInput, detectSQLInjection } = require('../../src/middleware/inputValidator');

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
  } catch (error) {
    console.error(`❌ ${name}: ${error.message}`);
  }
}

// Test SQL injection detection
test('SQL injection detected', () => {
  const malicious = "' OR '1'='1";
  if (!detectSQLInjection(malicious)) {
    throw new Error('SQL injection not detected');
  }
});
```

## Best Practices

### 1. Always Validate User Input

```javascript
// ❌ BAD - No validation
const quoteText = args.join(' ');
await db.addQuote(quoteText, author);

// ✅ GOOD - Validate first
const validation = validateTextInput(args.join(' '), {
  minLength: 10,
  maxLength: 1000,
  checkSQLInjection: true,
  checkXSS: true,
});

if (!validation.valid) {
  return message.reply(`Invalid input: ${validation.errors.join(', ')}`);
}

await db.addQuote(validation.sanitized, author);
```

### 2. Use Prepared Statements

```javascript
// ❌ BAD - String concatenation
db.run(`SELECT * FROM quotes WHERE id = ${quoteId}`);

// ✅ GOOD - Prepared statement
db.run('SELECT * FROM quotes WHERE id = ?', [quoteId]);
```

### 3. Encrypt Sensitive Data

```javascript
// ❌ BAD - Store plaintext
await db.storeApiKey(apiKey);

// ✅ GOOD - Encrypt first
const encrypted = encrypt(apiKey);
await db.storeApiKey(encrypted);
```

### 4. Implement Rate Limiting

```javascript
// ✅ GOOD - Rate limit expensive operations
const limiter = new RateLimiter(5, 60000); // 5 per minute

if (!limiter.isAllowed(userId)) {
  return message.reply('Too many requests. Try again later.');
}

await performExpensiveOperation();
```

### 5. Log Security Events

```javascript
const { logError, ERROR_LEVELS } = require('../middleware/errorHandler');

// Log security violations
if (detectSQLInjection(input)) {
  logError('InputValidator', 'SQL injection attempt', ERROR_LEVELS.HIGH, {
    userId: message.author.id,
    input: input.substring(0, 100),
  });
}
```

### 6. Keep Dependencies Updated

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Check for outdated packages
npm outdated
```

### 7. Use Environment Variables

```javascript
// ❌ BAD - Hardcoded secrets
const apiKey = 'sk_test_12345';

// ✅ GOOD - Environment variable
const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error('API_KEY not set');
}
```

## Vulnerability Reporting

If you discover a security vulnerability in VeraBot2.0, please report it responsibly.

### Reporting Process

1. **DO NOT** open a public issue
2. Email security concerns to the maintainers
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Report

- SQL injection vulnerabilities
- XSS vulnerabilities
- Authentication bypasses
- Privilege escalation
- Information disclosure
- Dependency vulnerabilities

### What Not to Report

- Issues in third-party dependencies (report to maintainer)
- Rate limiting bypass (if it doesn't cause harm)
- Issues requiring physical access
- Social engineering attacks

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Discord.js Security](https://discordjs.guide/popular-topics/permissions.html)
- [npm Security](https://docs.npmjs.com/cli/v9/commands/npm-audit)

## Security Checklist

- [ ] All user inputs validated
- [ ] SQL injection prevention enabled
- [ ] XSS prevention enabled
- [ ] Rate limiting implemented
- [ ] Sensitive data encrypted
- [ ] Prepared statements used for database queries
- [ ] Dependencies up to date
- [ ] Security tests passing
- [ ] Secrets stored in environment variables
- [ ] Error messages don't leak sensitive information
- [ ] Logs sanitized (no secrets logged)
- [ ] HTTPS used for external API calls
- [ ] Authentication properly implemented
- [ ] Authorization checks in place
