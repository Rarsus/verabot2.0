# Dashboard User Access Configuration - Quick Reference

## TL;DR - Get Started in 2 Minutes

### 1️⃣ Get your Discord User ID
- Enable Developer Mode in Discord settings
- Right-click your name → "Copy User ID"

### 2️⃣ Update `.env` file
```env
DASHBOARD_ALLOWED_USERS=YOUR_USER_ID_HERE
DASHBOARD_ADMIN_USERS=YOUR_USER_ID_HERE
```

### 3️⃣ Restart dashboard
```bash
docker-compose restart dashboard
```

## Configuration Examples

### Single user dashboard owner
```env
DASHBOARD_ALLOWED_USERS=123456789012345678
DASHBOARD_ADMIN_USERS=123456789012345678
```

### Owner + moderators (moderators manage their guilds only)
```env
DASHBOARD_ALLOWED_USERS=123456789012345678,111111111111111111,222222222222222222
DASHBOARD_ADMIN_USERS=123456789012345678
```

### Multiple admins
```env
DASHBOARD_ALLOWED_USERS=123456789012345678,111111111111111111,222222222222222222
DASHBOARD_ADMIN_USERS=123456789012345678,111111111111111111
```

## Settings Explained

| Variable | Purpose | Required | Example |
|----------|---------|----------|---------|
| `DASHBOARD_ALLOWED_USERS` | Comma-separated user IDs allowed to log in | **YES** | `123,456,789` |
| `DASHBOARD_ADMIN_USERS` | Comma-separated admin user IDs | No | `123,456` |
| `DASHBOARD_URL` | Dashboard URL for OAuth callback | No | `http://localhost:5000` |

## Permission Levels

| Level | Access | Requirements |
|-------|--------|--------------|
| **Regular User** | Own guilds only | In `DASHBOARD_ALLOWED_USERS` + guild admin |
| **Guild Admin** | Specific guild settings | In `DASHBOARD_ALLOWED_USERS` + guild admin role |
| **Dashboard Admin** | All guilds + settings | In both lists |

## What This Protects

✅ **Authentication**: Only Discord OAuth users can log in
✅ **Authorization**: Only allowed users pass login check
✅ **Guild Access**: Users can only manage guilds they admin
✅ **Admin Operations**: Only admins can perform sensitive operations

## File Changes Made

1. **Created** `dashboard/server/services/authorization-service.js` - User allowlist logic
2. **Created** `dashboard/server/middleware/authorization.js` - Permission middleware
3. **Updated** `dashboard/server/routes/auth.js` - Added authorization check to OAuth callback
4. **Updated** `dashboard/server/routes/api.js` - Added authorization to all API endpoints
5. **Updated** `.env` - Added configuration variables
6. **Created** `docs/user-guides/dashboard-access-configuration.md` - Full documentation

## Implementation Details

### How It Works

1. User clicks "Login with Discord"
2. Discord OAuth redirects with user data
3. **Authorization check**: Is user in `DASHBOARD_ALLOWED_USERS`?
   - ✅ YES → Issue JWT token, let them in
   - ❌ NO → Deny access, show error message
4. User makes API requests with JWT token
5. **API authorization**: Check token and permissions again
6. Route executes only if user is authorized

### Security Features

- ✅ No users can access without explicit allowlist
- ✅ Default-deny (empty list = nobody gets in)
- ✅ Admin checks on sensitive operations
- ✅ Guild admin permission verification
- ✅ Audit logging of all access denials

## Next Steps

1. Add your Discord user ID to `.env`:
   ```bash
   # Find your ID in Discord, then edit .env
   nano .env
   # Add: DASHBOARD_ALLOWED_USERS=YOUR_ID
   ```

2. Restart the dashboard:
   ```bash
   docker-compose restart dashboard
   ```

3. Test login at `http://localhost:5000` (or your DASHBOARD_URL)

4. Add other users as needed

## Troubleshooting

**"You do not have permission to access the dashboard"**
→ Add your user ID to `DASHBOARD_ALLOWED_USERS` in `.env`

**"Can't see my guilds"**
→ You need to be a guild admin in Discord (MANAGE_GUILD permission)
→ OR add yourself to `DASHBOARD_ADMIN_USERS`

**Changes not taking effect**
→ Restart the dashboard: `docker-compose restart dashboard`
→ Check `.env` file syntax (no quotes needed around IDs)

## See Also

- Full documentation: [Dashboard Access Configuration](dashboard-access-configuration.md)
- Discord user ID help: https://discord.com/developers
- Security best practices: [Security Guide](../best-practices/security.md)
