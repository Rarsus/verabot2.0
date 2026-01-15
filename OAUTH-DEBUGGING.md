# OAuth Login Flow - Diagnostic Steps

If your browser is opening Discord client instead of showing the OAuth authorization page:

## Quick Diagnostic

1. **Open browser DevTools** (F12)
2. **Go to Console tab**
3. **Click "Login with Discord"**
4. **Watch the console** - it should log:
   - "Got OAuth URL, redirecting..."
   - "URL: https://discord.com/api/oauth2/authorize..."

## What Should Happen

1. Click "Login with Discord" → Should redirect to Discord's website
2. See Discord authorization page asking to authorize the app
3. Click "Authorize" → Should redirect back to dashboard with token
4. Frontend should show loading spinner
5. Should redirect to dashboard home

## What's Probably Happening

The browser is treating the OAuth URL as a Discord app deep link because:
- Discord desktop client is installed
- System has registered `discord://` handler
- Browser might be interpreting the link incorrectly

## Workaround - Test in Incognito/Private Mode

1. **Open a new Incognito/Private window** (Ctrl+Shift+N or Cmd+Shift+N)
2. **Visit** `http://localhost:5000`
3. **Click "Login with Discord"**
4. **Does it work?** → If yes, it's a browser cache/extension issue
   - Clear browser cache completely
   - Disable browser extensions
   - Try again

## Direct OAuth URL Test

1. Open browser console (F12)
2. Copy and run:
   ```javascript
   fetch('http://localhost:5000/api/auth/login')
     .then(r => r.json())
     .then(d => {
       console.log('OAuth URL:', d.authUrl);
       console.log('Client ID:', new URLSearchParams(new URL(d.authUrl).search).get('client_id'));
       console.log('Redirect URI:', new URLSearchParams(new URL(d.authUrl).search).get('redirect_uri'));
     });
   ```
3. **Check the output** - Client ID and Redirect URI should match your Discord app

## If Still Not Working

1. **Check Discord app settings**: https://discord.com/developers/applications
   - Verify you added the redirect URI: `http://localhost:5000/api/auth/callback`
   - Make sure it's exactly that (case-sensitive, trailing slash matters)

2. **Try different browser**:
   - Chrome, Firefox, Safari - does OAuth work?
   - If it works in one but not another, browser-specific issue

3. **Check system Discord app**:
   - If Discord desktop app is registered as URL handler, try:
     - Close Discord app completely
     - Then try login again
     - Or try in a browser that doesn't have Discord as handler

## Network Level Debugging

1. **Open DevTools → Network tab**
2. **Click "Login with Discord"**
3. **Watch Network tab** - you should see:
   - Request to `/api/auth/login` → Response with OAuth URL
   - Redirect to `https://discord.com/...`
   - If no redirect, check Response tab in Network

## Server Side Check

```bash
# Monitor server logs during login attempt
docker logs verabot20-dashboard-1 -f

# Should show:
# ✓ OAuth Service initialized
# ✓ Redirecting to: http://localhost:5000/?token=...
```

If you see "Redirecting to" but browser doesn't show login success, issue is frontend-side.
If you DON'T see "Redirecting to", Discord OAuth failed.

## Solution Path

- **Issue**: Discord app opening → Close Discord, try incognito mode
- **Issue**: Browser not following redirect → Check browser console for errors
- **Issue**: OAuth fails at Discord → Check app redirect URI registration
- **Issue**: Token not being processed → Check browser console logs

Let me know what you see in:
1. Browser console logs
2. Network tab requests
3. Server logs

That will help identify the exact issue!
