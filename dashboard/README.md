# VeraBot Dashboard

A comprehensive React-based admin dashboard for managing VeraBot Discord bot configuration, including WebSocket services, quotes, and bot statistics.

## Features

### 🤖 Bot Management
- Real-time bot status and uptime monitoring
- Memory and latency metrics
- Guild, user, and message statistics
- Bot information and version tracking

### ⚡ WebSocket Configuration
- Manage external service integrations
- Configure webhooks and allowed actions
- Test service connections
- Monitor connection status in real-time
- Enable/disable services on the fly

### 📚 Quote Management
- Add, edit, and delete quotes
- View quote statistics (total, ratings, tags)
- Paginated quote browser
- Advanced search functionality
- Author attribution tracking

### 🔐 Security
- Token-based authentication
- Secure session management
- Protected routes and admin access
- CORS integration with bot API

## Quick Start

### Prerequisites
- Node.js 18+
- VeraBot backend running with API endpoints

### Installation

```bash
cd dashboard
npm install
```

### Configuration

Create a `.env` file in the `dashboard/` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api
```

### Development

```bash
npm run dev
```

Dashboard will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
```

## Project Structure

```
dashboard/
├── src/
│   ├── pages/
│   │   ├── Login.jsx              # Authentication page
│   │   └── Dashboard.jsx          # Main dashboard with navigation
│   ├── components/
│   │   ├── Alert.jsx              # Alert notifications
│   │   ├── BotStatus.jsx          # Bot status & metrics
│   │   ├── WebSocketConfig.jsx    # Service management
│   │   └── QuoteManagement.jsx    # Quote CRUD interface
│   ├── services/
│   │   └── api.js                 # API client (Axios)
│   ├── context/
│   │   └── AuthContext.jsx        # Auth state management
│   ├── App.jsx                    # Main app component
│   └── main.jsx                   # Entry point
├── public/
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Technology Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## API Integration

The dashboard requires the following API endpoints from the bot backend:

### Authentication
- `POST /api/auth/verify` - Verify admin token
- `POST /api/auth/login` - Login with token

### WebSocket Services
- `GET /api/websocket/services` - List services
- `GET /api/websocket/services/:name` - Get service details
- `PUT /api/websocket/services/:name` - Update service config
- `GET /api/websocket/status/:name` - Get connection status
- `GET /api/websocket/status` - Get all services status
- `POST /api/websocket/test/:name` - Test connection
- `PATCH /api/websocket/services/:name/toggle` - Enable/disable

### Quote Management
- `GET /api/quotes` - List quotes with pagination
- `GET /api/quotes/:id` - Get quote details
- `POST /api/quotes` - Create new quote
- `PUT /api/quotes/:id` - Update quote
- `DELETE /api/quotes/:id` - Delete quote
- `GET /api/quotes/search?q=query` - Search quotes
- `GET /api/quotes/stats` - Get statistics

### Bot Information
- `GET /api/bot/status` - Bot online status and metrics
- `GET /api/bot/info` - Bot information
- `GET /api/bot/stats` - Bot statistics
- `GET /api/bot/commands` - Command list
- `GET /api/bot/guilds` - Guild list
- `GET /api/bot/guilds/:id` - Guild details

## Styling

Uses **Tailwind CSS** for modern, responsive design:
- Dark sidebar navigation
- Gradient stat cards
- Responsive grid layouts
- Smooth transitions and animations
- Mobile-friendly interface

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Bot API base URL | `http://localhost:3000/api` |

## Deployment

### Docker

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY dashboard/package*.json ./
RUN npm ci
COPY dashboard/ .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
```

### Nginx

```nginx
server {
  listen 80;
  server_name dashboard.example.com;
  
  root /path/to/dashboard/dist;
  index index.html;
  
  location / {
    try_files $uri $uri/ /index.html;
  }
  
  location /api {
    proxy_pass http://bot-api:3000;
  }
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### CORS Errors
Ensure bot API has CORS enabled for your dashboard domain.

### Authentication Failures
- Verify bot token is correct
- Ensure bot API server is running
- Check `VITE_API_URL` in `.env`

### API Connection Issues
- Verify bot API is accessible at `VITE_API_URL`
- Check network connectivity
- Review browser console for detailed error messages

## Future Enhancements

- [ ] Guild-specific settings panel
- [ ] Command execution interface
- [ ] Activity logs and audit trails
- [ ] Real-time WebSocket monitoring
- [ ] User preferences and themes
- [ ] Dark/light mode toggle
- [ ] Configuration import/export
- [ ] Advanced analytics dashboard
- [ ] Permission management
- [ ] Multi-user support

## Contributing

When adding new features:
1. Create components in `src/components/`
2. Add new pages in `src/pages/`
3. Add API methods to `src/services/api.js`
4. Use Tailwind CSS for styling
5. Handle errors with Alert component

## License

Part of VeraBot project - See main repository for license details
