# VeraBot Dashboard Quick Start

Get the React admin dashboard running in 5 minutes.

## 1. Install & Setup (2 minutes)

```bash
cd dashboard
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:3000/api" > .env
```

## 2. Start Development Server (30 seconds)

```bash
npm run dev
```

Open: `http://localhost:5173`

## 3. Bot API Setup (2 minutes)

Your Discord bot needs an API server. Add to `src/index.js`:

```javascript
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Basic endpoints
app.post('/api/auth/verify', (req, res) => {
  if (req.body.token === process.env.ADMIN_TOKEN) {
    res.json({ user: { id: 'admin' } });
  } else {
    res.status(401).json({ error: 'Invalid' });
  }
});

app.get('/api/bot/status', (req, res) => {
  const client = req.app.locals.client;
  res.json({
    online: client.isReady(),
    uptime: client.uptime,
    latency: client.ws.ping,
    memory: process.memoryUsage().heapUsed
  });
});

app.get('/api/bot/info', (req, res) => {
  const client = req.app.locals.client;
  res.json({
    username: client.user.username,
    userId: client.user.id,
    version: require('../package.json').version,
    prefix: '!'
  });
});

app.listen(3000, () => console.log('API running on :3000'));

client.once('ready', () => {
  app.locals.client = client;
});
```

## 4. Login

**Token:** Use value from `process.env.ADMIN_TOKEN`

Expected format: Simple string (e.g., `super-secret-token`)

## Key Components

| Component | Purpose |
|-----------|---------|
| **Bot Status** | Real-time uptime, latency, memory |
| **WebSocket Config** | Manage external service integrations |
| **Quote Manager** | Add/edit/delete quotes with stats |
| **Navigation** | Sidebar menu with collapsible state |

## File Structure

```
dashboard/
├── src/
│   ├── pages/
│   │   ├── Login.jsx       ← Authentication
│   │   └── Dashboard.jsx   ← Main panel
│   ├── components/
│   │   ├── Alert.jsx       ← Notifications
│   │   ├── BotStatus.jsx   ← Status display
│   │   ├── WebSocketConfig.jsx ← Service management
│   │   └── QuoteManagement.jsx ← Quote CRUD
│   ├── services/
│   │   └── api.js          ← Axios client
│   └── context/
│       └── AuthContext.jsx ← Auth state
```

## Required API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/verify` | Check admin token |
| GET | `/api/bot/status` | Bot metrics |
| GET | `/api/bot/info` | Bot details |
| GET | `/api/bot/stats` | Guild/user counts |
| GET | `/api/websocket/services` | List services |
| GET | `/api/websocket/status/:name` | Service status |
| GET | `/api/quotes` | List quotes |
| POST | `/api/quotes` | Add quote |
| DELETE | `/api/quotes/:id` | Delete quote |
| GET | `/api/quotes/stats` | Quote stats |

See [07-DASHBOARD-SETUP.md](07-DASHBOARD-SETUP.md) for complete endpoint examples.

## Environment

**.env** (dashboard/)
```env
VITE_API_URL=http://localhost:3000/api
```

**.env** (project root)
```env
ADMIN_TOKEN=your-secure-token-here
API_PORT=3000
```

## Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Styling

Uses **Tailwind CSS**:
- Responsive design
- Dark/light theme ready
- Smooth animations
- Mobile-friendly

## Features Checklist

- [x] Login with token authentication
- [x] Real-time bot status monitoring
- [x] WebSocket service configuration
- [x] Quote management interface
- [x] Responsive sidebar navigation
- [x] Alert notifications
- [x] API error handling
- [x] Session management

## Common Issues

**"Cannot connect to API"**
- Verify bot API is running: `curl http://localhost:3000/api/bot/status`
- Check `VITE_API_URL` matches bot API port

**"Invalid token"**
- Ensure token matches `ADMIN_TOKEN` in bot `.env`
- Tokens are case-sensitive

**CORS error**
- Add bot dashboard origin to CORS config
- Or change `VITE_API_URL` to match bot API origin

## Extend the Dashboard

Add new pages in `src/pages/`:
```javascript
export default function NewPage() {
  return <div>Your content here</div>;
}
```

Add API methods in `src/services/api.js`:
```javascript
export const yourAPI = {
  getData: () => api.get('/data'),
};
```

Add menu item in `src/pages/Dashboard.jsx`:
```javascript
const menuItems = [
  { id: 'new-page', label: 'New Page', icon: Icon }
];
```

## Next Steps

1. ✅ Implement required API endpoints
2. ✅ Start bot and dashboard
3. ✅ Test login flow
4. ✅ Configure WebSocket services
5. ✅ Deploy to production

## Full Documentation

See [07-DASHBOARD-SETUP.md](07-DASHBOARD-SETUP.md) for:
- Complete API implementation examples
- Security best practices
- Production deployment
- Docker setup
- Troubleshooting guide
