# Dashboard User Access Configuration

This guide explains how to configure which Discord users are allowed to access and use the dashboard.

## Overview

The dashboard has a built-in user allowlist system that controls:
- **Who can log in** - Only users in the allowlist can authenticate with Discord OAuth
- **Who is an admin** - Selected users get admin privileges for managing settings
- **Guild admin access** - Users with guild admin permissions in Discord can manage that guild's settings

## Quick Setup

### Step 1: Get Your Discord User ID

1. In Discord, enable Developer Mode:
   - **User Settings** → **Advanced** → Toggle **Developer Mode** ON

2. Right-click your username and select "Copy User ID"
   - Example: `123456789012345678`

3. Do the same for any other users who should have access

### Step 2: Configure .env File

Edit your `.env` file and add:

```env
# List of users allowed to access the dashboard (comma-separated)
DASHBOARD_ALLOWED_USERS=123456789012345678,987654321098765432

# Optional: List of admin users (can manage all guilds and settings)
DASHBOARD_ADMIN_USERS=123456789012345678
```

### Step 3: Restart the Dashboard

```bash
docker-compose restart dashboard
# OR
npm run dev  # if running locally
```

## Configuration Options

### DASHBOARD_ALLOWED_USERS
**Required** to enable any dashboard access

```env
# Single user
DASHBOARD_ALLOWED_USERS=123456789012345678

# Multiple users (comma-separated, no spaces)
DASHBOARD_ALLOWED_USERS=123456789012345678,987654321098765432,111111111111111111
```

**Behavior:**
- ✅ Only these users can log in with Discord OAuth
- ✅ Users automatically see guilds they admin in Discord
- ❌ If not set, NO ONE can access the dashboard
- ❌ Users trying to log in will see: "You do not have permission to access the dashboard"

### DASHBOARD_ADMIN_USERS
**Optional** - grants elevated privileges

```env
# Single admin
DASHBOARD_ADMIN_USERS=123456789012345678

# Multiple admins (comma-separated)
DASHBOARD_ADMIN_USERS=123456789012345678,987654321098765432
```

**Behavior:**
- ✅ These users can access ALL guilds and settings
- ✅ Can perform admin-only operations
- ✅ Overrides guild-admin requirement
- ✅ Must also be in DASHBOARD_ALLOWED_USERS

## Permission Levels

### 1. Regular User
```env
DASHBOARD_ALLOWED_USERS=123456789012345678
```
- Can access their own guilds (where they have MANAGE_GUILD permission)
- Can view and modify settings for those guilds
- Limited to their guild-specific permissions

### 2. Guild Admin
- Member of `DASHBOARD_ALLOWED_USERS`
- Has `MANAGE_GUILD` permission in Discord for that guild
- Can manage that guild's settings
- Cannot access other guilds

### 3. Dashboard Admin
```env
DASHBOARD_ALLOWED_USERS=123456789012345678
DASHBOARD_ADMIN_USERS=123456789012345678
```
- Can access ALL guilds
- Can perform admin-only operations
- Can manage global settings
- Not restricted by guild permissions

## Examples

### Example 1: Single Owner
```env
DASHBOARD_ALLOWED_USERS=123456789012345678
DASHBOARD_ADMIN_USERS=123456789012345678
```
**Result:** Only this user can access the dashboard with full admin access.

### Example 2: Owner + Moderators
```env
DASHBOARD_ALLOWED_USERS=123456789012345678,111111111111111111,222222222222222222
DASHBOARD_ADMIN_USERS=123456789012345678
```
**Result:**
- First user: Full admin access to all settings
- Other users: Can manage guilds where they're an admin

### Example 3: Multiple Admins
```env
DASHBOARD_ALLOWED_USERS=123456789012345678,111111111111111111,222222222222222222
DASHBOARD_ADMIN_USERS=123456789012345678,111111111111111111
```
**Result:** First two users are admins, third user can only manage their own guilds.

## Troubleshooting

### "You do not have permission to access the dashboard"
**Cause:** User is not in `DASHBOARD_ALLOWED_USERS`
**Solution:** Add their Discord user ID to the list and restart the dashboard

```bash
# Check current configuration
grep "DASHBOARD_ALLOWED_USERS" .env

# Update .env and restart
docker-compose restart dashboard
```

### User can log in but sees no guilds
**Cause:** User is not an admin in any guild OR `DASHBOARD_ADMIN_USERS` is missing
**Solutions:**
1. Make them a guild admin in Discord (give MANAGE_GUILD role)
2. OR add them to `DASHBOARD_ADMIN_USERS` in .env

### Admin can't perform certain operations
**Cause:** Missing `DASHBOARD_ADMIN_USERS` configuration
**Solution:**
```env
DASHBOARD_ADMIN_USERS=123456789012345678  # Add the admin user ID
```

## Security Best Practices

1. **Keep it minimal**: Only add users who actually need access
   ```env
   # ✅ GOOD - Only essential users
   DASHBOARD_ALLOWED_USERS=123456789012345678,111111111111111111
   
   # ❌ BAD - Everyone has access
   DASHBOARD_ALLOWED_USERS=ALL_SERVER_MEMBERS
   ```

2. **Separate admins from regular users**:
   ```env
   # ✅ GOOD - Clear separation
   DASHBOARD_ALLOWED_USERS=user1,user2,user3,admin1,admin2
   DASHBOARD_ADMIN_USERS=admin1,admin2
   
   # ❌ BAD - Everyone is an admin
   DASHBOARD_ALLOWED_USERS=user1,user2,user3
   DASHBOARD_ADMIN_USERS=user1,user2,user3
   ```

3. **Don't share user IDs**: Treat them like passwords
   - Store in `.env` (never commit to git)
   - Use `.gitignore` to prevent accidental commits

4. **Use guild admin for permission control**:
   - Don't make everyone a dashboard admin
   - Let Discord guild permissions handle access control

5. **Audit logs**: Monitor who logs in (logs are in `logs/dashboard.log`)

## Advanced Configuration

### Dynamic User Management (Future)

Currently, users must be configured in `.env`. Future versions may support:
- Web UI for adding/removing users
- Database-backed user management
- Role-based access control (RBAC)

### API Access Control

The authorization system also protects API endpoints:

```javascript
// Regular users - allowed
GET /api/bot/guild/123/settings

// Non-admins trying to access admin endpoints - blocked
POST /api/admin/users  // Returns 403 Forbidden

// Admins - allowed
POST /api/admin/users  // Works fine
```

## Environment Variable Validation

On startup, the dashboard logs access configuration:

```
✓ Authorization configured
  - Allowed users: 2
  - Admin users: 1
  - Full details logged at /logs/auth.log
```

Or if not configured:

```
⚠️  DASHBOARD_ALLOWED_USERS not configured. No users will be allowed access.
```

## Related Documentation

- [OAuth Configuration](../guides/oauth-login-flow-fix.md)
- [Security Best Practices](../best-practices/security-hardening.md)
- [Dashboard Setup Guide](../guides/dashboard-setup.md)
