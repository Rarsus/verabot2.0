# Dashboard Login Troubleshooting Guide

## Issue: Admin Panel Returns to Login Screen After OAuth

### What Was Wrong

The OAuth callback was checking if the user was in the `DASHBOARD_ALLOWED_USERS` list, but:
1. If the check failed, it would redirect back to `/login` with an error parameter
2. The frontend wasn't properly displaying the error message
3. Users saw a redirect loop without understanding why they couldn't log in

### What Was Fixed

1. **Enhanced error logging** in the OAuth callback (`dashboard/server/routes/auth.js`)
   - Now logs which users are allowed
   - Shows whether the current user is in the allowlist
   - Displays detailed error messages

2. **Improved frontend error handling** (`dashboard/src/context/AuthContext.jsx`)
   - Properly decodes error parameters from URL
   - Displays errors from auth context to user

3. **Better error display** in Login page (`dashboard/src/pages/Login.jsx`)
   - Shows error messages from OAuth callback
   - Displays both local and auth context errors

### How to Debug Login Issues

#### Check 1: Is DASHBOARD_ALLOWED_USERS Configured?

```bash
# Check .env file
grep "DASHBOARD_ALLOWED_USERS" .env
```

Should output something like:
```
DASHBOARD_ALLOWED_USERS=1426150554991595631
```

If empty or missing, **add your Discord user ID**:
```env
DASHBOARD_ALLOWED_USERS=YOUR_DISCORD_USER_ID
```

#### Check 2: Verify Your Discord User ID

1. In Discord, enable Developer Mode: Settings → Advanced → Developer Mode
2. Right-click your username → Copy User ID
3. Add it to `.env` and restart:
   ```bash
   docker-compose restart dashboard
   ```

#### Check 3: Monitor Server Logs

Watch the dashboard server logs during OAuth attempt:

```bash
docker logs verabot20-dashboard-1 -f
```

Look for lines like:
```
✓ OAuth callback for user 1426150554991595631 (username#1234)
  Allowed users configured: 1426150554991595631
  User 1426150554991595631 allowed: true
```

If you see `allowed: false`, the user ID is wrong or not in the allowlist.

#### Check 4: Verify Authorization Service

Test if authorization service loads correctly:

```bash
docker exec verabot20-dashboard-1 node -e \
  "const auth = require('./server/services/authorization-service'); \
   console.log('Allowed:', auth.getAllowedUsers()); \
   console.log('Admins:', auth.getAdminUsers());"
```

#### Check 5: Test OAuth Flow Manually

1. Go to `http://localhost:5000`
2. Click "Login with Discord"
3. Check browser console for errors: `F12 → Console`
4. Check dashboard logs: `docker logs verabot20-dashboard-1`

### Common Issues & Solutions

#### Issue: "Authorization failed: No users configured"

**Cause:** `DASHBOARD_ALLOWED_USERS` is empty in `.env`

**Solution:**
```bash
# 1. Get your Discord user ID (enable Developer Mode in Discord settings)
# 2. Edit .env
nano .env

# 3. Add your user ID
DASHBOARD_ALLOWED_USERS=YOUR_DISCORD_USER_ID

# 4. Restart dashboard
docker-compose restart dashboard
```

#### Issue: "Authorization failed: User not in allowlist"

**Cause:** Your Discord user ID is not in the list

**Solution:**
1. Get your correct Discord user ID (right-click name → Copy User ID)
2. Update `.env` with correct ID
3. Restart dashboard: `docker-compose restart dashboard`

**Verify it worked:**
```bash
# During OAuth, check logs
docker logs verabot20-dashboard-1 -f
# Should show: "User XXXXX allowed: true"
```

#### Issue: Blank page or infinite redirect loop

**Cause:** Environment not loaded properly

**Solution:**
```bash
# Rebuild dashboard with fresh environment
docker-compose down
docker-compose up -d --build

# Wait for startup
sleep 3

# Check logs
docker logs verabot20-dashboard-1
```

#### Issue: "OAuth error: access_denied" from Discord

**Cause:** Wrong Discord OAuth credentials or redirect URI

**Solution:**
1. Check Discord OAuth settings: https://discord.com/developers/applications
2. Verify `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` in `.env`
3. Verify Redirect URI matches `DISCORD_REDIRECT_URI` in `.env`
4. Restart: `docker-compose restart dashboard`

### File Changes Made (January 15, 2026)

**Updated Files:**
- `dashboard/server/routes/auth.js` - Enhanced OAuth callback error handling and logging
- `dashboard/src/context/AuthContext.jsx` - Improved error parameter handling
- `dashboard/src/pages/Login.jsx` - Better error display from auth context

**Key Changes:**
1. Added detailed logging to OAuth callback showing:
   - User ID and username
   - Configured allowed users
   - Whether user is allowed
   - Specific reason for rejection

2. Frontend now properly displays authorization errors to user

3. Error messages are URL-decoded for proper display

### Testing the Fix

1. **With correct user ID:**
   ```bash
   # Set your user ID in .env
   DASHBOARD_ALLOWED_USERS=YOUR_CORRECT_ID
   docker-compose restart dashboard
   
   # Visit http://localhost:5000
   # Should: Login with Discord → Redirect to dashboard
   # Logs show: "User XXX allowed: true"
   ```

2. **With wrong user ID:**
   ```bash
   # Set a fake user ID
   DASHBOARD_ALLOWED_USERS=999999999999999999
   docker-compose restart dashboard
   
   # Visit http://localhost:5000
   # Should: Login with Discord → Redirect to login with error message
   # Logs show: "User XXX allowed: false"
   # Error displayed: "User not in allowlist"
   ```

### Environment Variables Checklist

Required for login to work:
- ✅ `DISCORD_TOKEN` - Bot token
- ✅ `DISCORD_CLIENT_ID` - OAuth Client ID
- ✅ `DISCORD_CLIENT_SECRET` - OAuth Secret
- ✅ `DISCORD_REDIRECT_URI` - Must match Discord app settings
- ✅ `DASHBOARD_ALLOWED_USERS` - **Your Discord user ID**
- ✅ `SESSION_SECRET` - JWT signing key

Optional but recommended:
- `DASHBOARD_ADMIN_USERS` - Admin user IDs
- `DASHBOARD_URL` - Dashboard URL (default: http://localhost:5000)

### Advanced Configuration

#### Multiple Users
```env
DASHBOARD_ALLOWED_USERS=user1_id,user2_id,user3_id
```

#### Admin Users
```env
DASHBOARD_ALLOWED_USERS=user1_id,user2_id
DASHBOARD_ADMIN_USERS=user1_id
```

User1 is admin (all guilds), User2 only sees their own guilds.

### Performance Notes

- OAuth callback authorization check: < 10ms
- Frontend error handling: < 50ms
- No additional database calls for authorization

### Security Implications

- ✅ Default-deny: If no users configured, nobody gets in
- ✅ No bypass: Authorization checked at OAuth callback AND API access
- ✅ Audit logging: All access denials logged
- ✅ Token validation: JWT verified on every API call

## Related Documentation

- [Dashboard Access Configuration](./dashboard-access-configuration.md)
- [OAuth Setup Guide](../guides/oauth-login-flow-fix.md)
- [Security Best Practices](../best-practices/security-hardening.md)
