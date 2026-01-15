# Discord OAuth Redirect URI Configuration

## Issue

When you click "Login with Discord", the browser opens the Discord app instead of showing the OAuth authorization page. This means **the redirect URI registered in Discord doesn't match what the dashboard is sending**.

## Solution

You need to register the redirect URI in your Discord Developer Portal.

### Step-by-Step Setup

1. **Open Discord Developer Portal**
   - Go to: https://discord.com/developers/applications
   - Click on your application (the one created for VeraBot)

2. **Go to OAuth2 Settings**
   - Left menu: Click **OAuth2**
   - Then click **General**

3. **Add Redirect URI**
   - Scroll down to **Redirects**
   - Click **Add Redirect**
   - Enter: `http://localhost:5000/api/auth/callback`
   - Click **Save**

4. **Verify Your Setup**
   - Your Dashboard URL: `http://localhost:5000`
   - Discord App Redirect URI: `http://localhost:5000/api/auth/callback`
   - **These must match exactly** (including `http://` vs `https://`)

5. **Restart Dashboard**
   ```bash
   docker-compose restart dashboard
   ```

6. **Test Login**
   - Visit `http://localhost:5000`
   - Click "Login with Discord"
   - You should now see Discord's OAuth authorization page (not open the app)
   - Authorize the app
   - Should redirect back to dashboard with login success

### Environment Configuration

Your `.env` file should have:

```env
DISCORD_CLIENT_ID=1434210598585110678
DISCORD_CLIENT_SECRET=3qu-7iAe7kGKhBpBXJXSu436tAPeWRgx
DISCORD_REDIRECT_URI=http://localhost:5000/api/auth/callback
```

These are already set if you followed the initial setup.

### For Production

When you deploy to production, change:

```env
# Production
DISCORD_REDIRECT_URI=https://yourdomain.com/api/auth/callback
```

And register that URL in Discord Developer Portal as well.

### Troubleshooting

**Still opening Discord app?**
- Clear browser cache (Ctrl+Shift+Delete)
- Check Discord app shows the redirect URI is registered
- Make sure it's `http://localhost:5000/api/auth/callback` (exact match)
- Restart dashboard: `docker-compose restart dashboard`

**Authorization page shows error?**
- Check Discord app Client ID matches what's in `.env`
- Check Discord app Client Secret is correct
- Verify redirect URI is exactly registered

**OAuth callback fails?**
- Check server logs: `docker logs verabot20-dashboard-1`
- Look for error messages in the logs
- Verify `DASHBOARD_ALLOWED_USERS` includes your Discord user ID

### How to Check Current Setup

```bash
# Check what redirect URI is configured
docker exec verabot20-dashboard-1 env | grep DISCORD_REDIRECT

# Should output:
# DISCORD_REDIRECT_URI=http://localhost:5000/api/auth/callback
```

### What Changed in .env

Added explicit redirect URI configuration:

```env
# [REQUIRED for Dashboard OAuth] Discord OAuth Redirect URI
# CRITICAL: This must match EXACTLY what you registered in Discord Developer Portal
# Go to: https://discord.com/developers/applications → Your App → OAuth2 → Redirects
# Must include /api/auth/callback at the end
# Local development: http://localhost:5000/api/auth/callback
DISCORD_REDIRECT_URI=http://localhost:5000/api/auth/callback
```

This ensures the backend uses the same redirect URI that Discord expects.

## Quick Reference

| Setting | Value | Where to Check |
|---------|-------|-----------------|
| Discord App Client ID | `1434210598585110678` | Dev Portal → General Info |
| Discord App Client Secret | (shown only once) | Dev Portal → OAuth2 |
| Discord Redirect URI | `http://localhost:5000/api/auth/callback` | Dev Portal → OAuth2 → Redirects |
| Dashboard URL | `http://localhost:5000` | Browser address bar |

All must be registered/configured correctly for OAuth to work.
