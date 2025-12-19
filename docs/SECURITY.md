# Security Best Practices for VeraBot2.0

This document outlines security considerations and best practices for deploying and using VeraBot2.0, especially when using the webhook proxy feature.

## Table of Contents

1. [General Security](#general-security)
2. [Webhook Proxy Security](#webhook-proxy-security)
3. [Secret Management](#secret-management)
4. [Network Security](#network-security)
5. [Deployment Security](#deployment-security)
6. [Monitoring and Auditing](#monitoring-and-auditing)
7. [Incident Response](#incident-response)

## General Security

### Environment Variables

**✅ DO:**
- Store all secrets in `.env` file (never committed to git)
- Use strong, randomly generated tokens and keys
- Rotate secrets regularly (every 90 days minimum)
- Use different secrets for development, staging, and production
- Set appropriate file permissions on `.env` (600 or 400)

**❌ DON'T:**
- Commit `.env` file to version control
- Share secrets via email, chat, or public channels
- Use default or example secrets in production
- Hardcode secrets in source code
- Log secrets in plain text

### Discord Bot Permissions

Follow the principle of least privilege:

**Required Permissions:**
- `GUILD_MESSAGES` - Read messages in guilds
- `MESSAGE_CONTENT` - Access message content
- `SEND_MESSAGES` - Send messages to channels

**Admin-Only Features:**
- `ADMINISTRATOR` - For proxy configuration commands
- Grant to trusted users only

**Avoid:**
- Granting unnecessary permissions
- Using bot accounts with server-wide admin rights
- Exposing bot token to untrusted parties

### Database Security

**Protection Measures:**
- Database is stored in `data/db/` directory
- Use filesystem permissions to protect database file
- Regular backups (automated if possible)
- Encrypt database backups before storing offsite
- Monitor database size and growth

**SQLite Security:**
```bash
# Set appropriate permissions
chmod 600 data/db/quotes.db
chown bot-user:bot-user data/db/quotes.db
```

## Webhook Proxy Security

### Secure Storage of Secrets

All sensitive data is encrypted before storage using AES-256-CBC:

**What's Encrypted:**
- Webhook authentication tokens
- Webhook secrets for signature verification
- Any other sensitive configuration values

**Encryption Key:**
```env
# Generate strong encryption key (64 hex characters)
ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
```

**Key Management:**
- Store encryption key in `.env` file
- Never commit encryption key to version control
- Rotate encryption key periodically
- Re-encrypt all secrets after key rotation

### Webhook Authentication

#### Outgoing Webhooks (Discord → External)

**Bearer Token Authentication:**
```
Authorization: Bearer <your-secret-token>
```

**Best Practices:**
- Generate tokens with at least 32 bytes of entropy
- Use different tokens for different environments
- Rotate tokens every 90 days
- Monitor for unusual webhook activity
- Implement rate limiting on receiving end

**Token Generation:**
```bash
# Generate secure token
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Incoming Webhooks (External → Discord)

**HMAC SHA-256 Signature Verification:**
```
X-Webhook-Signature: <hmac-sha256-signature>
```

**Security Features:**
- Signature verification prevents unauthorized messages
- Uses secret key known only to authorized parties
- Timing-safe comparison prevents timing attacks
- Rejects requests with invalid or missing signatures

**Secret Generation:**
```bash
# Generate secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Transport Security

**HTTPS/TLS Requirements:**
- ✅ Use HTTPS for all webhook URLs
- ✅ Verify SSL certificates
- ✅ Use TLS 1.2 or higher
- ❌ Never use HTTP for webhooks
- ❌ Never disable certificate verification

**Configuration:**
```javascript
// Good - HTTPS with proper verification
webhookUrl: "https://secure-endpoint.com/webhook"

// Bad - HTTP (unencrypted)
webhookUrl: "http://insecure-endpoint.com/webhook"
```

### Access Control

**Admin-Only Commands:**
- `/proxy-config` - Configure webhook settings
- `/proxy-enable` - Enable/disable proxy
- `/proxy-status` - View configuration

**Permission Checks:**
- Requires `Administrator` permission
- Checked on every command invocation
- Logs unauthorized access attempts

**Monitoring:**
```bash
# Check logs for unauthorized access
grep "Administrator permissions" logs/bot.log
```

## Secret Management

### Production Secrets Checklist

Before going to production, ensure:

- [ ] Strong `DISCORD_TOKEN` generated from Discord Developer Portal
- [ ] Unique `CLIENT_ID` for your application
- [ ] Random `ENCRYPTION_KEY` (64 hex characters)
- [ ] Secure `webhook-token` (32+ bytes entropy)
- [ ] Secure `webhook-secret` (32+ bytes entropy)
- [ ] `.env` file has proper permissions (600)
- [ ] `.env` is in `.gitignore`
- [ ] Backup of secrets stored securely offline

### Secret Rotation Procedure

1. **Generate new secret:**
   ```bash
   NEW_TOKEN=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   ```

2. **Update configuration:**
   ```
   /proxy-config webhook-token:$NEW_TOKEN
   ```

3. **Update external systems** with new token

4. **Test connectivity** with new token

5. **Monitor logs** for any errors

6. **Old token can be retired** after verification period

### Secret Storage Options

**Development:**
- `.env` file (local only)
- Git-ignored, never committed

**Production Options:**
- **Environment variables** (simple, works everywhere)
- **Secret management services** (AWS Secrets Manager, HashiCorp Vault)
- **Kubernetes secrets** (if deploying on Kubernetes)
- **Docker secrets** (if using Docker Swarm)

**Example with AWS Secrets Manager:**
```javascript
// Optional enhancement (not included by default)
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getSecret(secretName) {
  const data = await secretsManager.getSecretValue({
    SecretId: secretName
  }).promise();
  return JSON.parse(data.SecretString);
}
```

## Network Security

### Firewall Configuration

**Incoming Webhook Listener:**
```bash
# Only allow connections from trusted IPs
iptables -A INPUT -p tcp --dport 3000 -s TRUSTED_IP -j ACCEPT
iptables -A INPUT -p tcp --dport 3000 -j DROP

# Or use ufw
ufw allow from TRUSTED_IP to any port 3000
ufw deny 3000
```

**Rate Limiting:**
```bash
# Limit connections per IP
iptables -A INPUT -p tcp --dport 3000 -m connlimit \
  --connlimit-above 10 --connlimit-mask 32 -j REJECT
```

### Reverse Proxy (Recommended)

Use Nginx or Apache as reverse proxy:

**Nginx Configuration:**
```nginx
server {
    listen 443 ssl http2;
    server_name webhook.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=webhook:10m rate=10r/s;
    limit_req zone=webhook burst=20 nodelay;

    location /webhook {
        proxy_pass http://localhost:3000/webhook;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### DDoS Protection

**Cloudflare (Recommended):**
- Free DDoS protection
- Rate limiting
- SSL/TLS encryption
- Geographic restrictions

**Implementation:**
1. Sign up for Cloudflare
2. Add your domain
3. Update DNS records
4. Enable "Under Attack" mode if needed

## Deployment Security

### Docker Deployment

**Secure Dockerfile:**
```dockerfile
FROM node:18-alpine

# Run as non-root user
RUN addgroup -g 1001 -S botuser && \
    adduser -u 1001 -S botuser -G botuser

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src ./src

# Set ownership
RUN chown -R botuser:botuser /app

USER botuser

CMD ["node", "src/index.js"]
```

**Secure docker-compose.yml:**
```yaml
version: '3.8'
services:
  bot:
    build: .
    restart: unless-stopped
    env_file:
      - .env
    volumes:
      - ./data:/app/data:rw
    networks:
      - bot-network
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp

networks:
  bot-network:
    driver: bridge
```

### System Hardening

**Linux Security:**
```bash
# Keep system updated
apt update && apt upgrade -y

# Install fail2ban
apt install fail2ban -y

# Enable automatic security updates
apt install unattended-upgrades -y
dpkg-reconfigure -plow unattended-upgrades

# Disable unnecessary services
systemctl disable SERVICE_NAME

# Configure firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw enable
```

## Monitoring and Auditing

### Logging Best Practices

**What to Log:**
- ✅ Authentication attempts (success/failure)
- ✅ Configuration changes
- ✅ Webhook forwarding attempts (without content)
- ✅ Errors and exceptions
- ✅ Admin command usage

**What NOT to Log:**
- ❌ Full message content
- ❌ Tokens or secrets
- ❌ User passwords
- ❌ Webhook payloads with sensitive data

**Log Configuration:**
```javascript
// Good - Log without sensitive data
console.log('Webhook forwarded', {
  channel: message.channel.id,
  timestamp: Date.now(),
  success: true
});

// Bad - Logging sensitive data
console.log('Webhook forwarded', {
  content: message.content,  // Don't log full content
  token: webhookToken        // Never log tokens!
});
```

### Monitoring Checklist

- [ ] Set up log aggregation (ELK, Splunk, or similar)
- [ ] Configure alerts for:
  - Repeated authentication failures
  - Unusual webhook activity
  - High error rates
  - Database errors
- [ ] Monitor resource usage:
  - CPU usage
  - Memory usage
  - Disk space
  - Network traffic
- [ ] Regular security audits
- [ ] Review access logs weekly

### Security Monitoring Tools

**Log Analysis:**
```bash
# Check for failed authentication
grep "permission" logs/bot.log | tail -20

# Monitor webhook errors
grep "WebhookProxyService" logs/bot.log | grep "MEDIUM\|HIGH"

# Check for unusual activity
grep "ERROR" logs/bot.log | wc -l
```

## Incident Response

### Security Incident Procedure

1. **Detection:**
   - Monitor logs for anomalies
   - Check alerts and notifications
   - Review user reports

2. **Containment:**
   - Disable affected features: `/proxy-enable enabled:false`
   - Rotate compromised secrets
   - Block suspicious IPs
   - Isolate affected systems

3. **Investigation:**
   - Review logs for attack vectors
   - Identify compromised data
   - Determine scope of breach
   - Document findings

4. **Remediation:**
   - Patch vulnerabilities
   - Update security measures
   - Restore from clean backups if needed
   - Verify system integrity

5. **Recovery:**
   - Re-enable features gradually
   - Monitor closely for 48 hours
   - Communicate with users if needed

6. **Post-Incident:**
   - Conduct post-mortem
   - Update security procedures
   - Implement additional safeguards
   - Train team on lessons learned

### Emergency Contacts

Maintain a list of:
- Security team contacts
- Hosting provider support
- Discord API support
- Security consultants

### Backup and Recovery

**Backup Strategy:**
```bash
#!/bin/bash
# Daily backup script

DATE=$(date +%Y%m%d)
BACKUP_DIR="/backups"

# Backup database
sqlite3 data/db/quotes.db ".backup '${BACKUP_DIR}/quotes-${DATE}.db'"

# Encrypt backup
gpg --encrypt --recipient your@email.com "${BACKUP_DIR}/quotes-${DATE}.db"

# Upload to secure location
aws s3 cp "${BACKUP_DIR}/quotes-${DATE}.db.gpg" s3://your-bucket/backups/

# Clean up old backups (keep 30 days)
find ${BACKUP_DIR} -name "quotes-*.db*" -mtime +30 -delete
```

**Recovery Testing:**
- Test backup restoration monthly
- Verify data integrity
- Document recovery procedures
- Time recovery process

## Security Checklist

Use this checklist before deploying to production:

### Pre-Deployment
- [ ] All secrets are randomly generated (32+ bytes)
- [ ] `.env` file is not in version control
- [ ] HTTPS is used for all webhook URLs
- [ ] Encryption key is securely stored
- [ ] Firewall rules are configured
- [ ] Database file permissions are set correctly
- [ ] Non-root user is used to run bot
- [ ] Reverse proxy is configured (if applicable)

### Post-Deployment
- [ ] Admin permissions are correctly restricted
- [ ] Webhook endpoints are responding correctly
- [ ] Signature verification is working
- [ ] Logs are being collected
- [ ] Monitoring alerts are configured
- [ ] Backup strategy is in place
- [ ] Incident response plan is documented

### Ongoing
- [ ] Review logs weekly
- [ ] Rotate secrets every 90 days
- [ ] Update dependencies monthly
- [ ] Apply security patches promptly
- [ ] Conduct security audits quarterly
- [ ] Test backups monthly
- [ ] Review access controls quarterly

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** create a public GitHub issue
2. Email security concerns to: [MAINTAINER_EMAIL]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
4. Allow reasonable time for patching before public disclosure
5. Coordinate disclosure timing with maintainers

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Discord Security Best Practices](https://discord.com/developers/docs/topics/security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [SQLite Security](https://www.sqlite.org/security.html)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

**Last Updated:** December 2024  
**Version:** 2.0.0

*This document should be reviewed and updated regularly as new security best practices emerge.*
