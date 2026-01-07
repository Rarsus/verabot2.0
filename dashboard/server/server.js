require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

// Import middleware
const { errorHandler, notFoundHandler } = require('./middleware/error-handler');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;
const DASHBOARD_URL = process.env.DASHBOARD_URL || 'http://localhost:3001';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    origin: DASHBOARD_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Serve static files from React build (production)
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../dist');
  app.use(express.static(buildPath));

  // Serve React app for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   VeraBot Dashboard Server                     ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ Dashboard URL: ${DASHBOARD_URL}`);
  console.log(`✓ Bot API: ${process.env.BOT_API_URL || 'http://verabot2:3000'}`);
  console.log('');
  console.log('API Endpoints:');
  console.log('  GET  /health');
  console.log('  GET  /api/auth/login');
  console.log('  GET  /api/auth/callback');
  console.log('  GET  /api/auth/verify');
  console.log('  POST /api/auth/logout');
  console.log('  GET  /api/auth/user');
  console.log('  ALL  /api/bot/*');
  console.log('  ALL  /api/quotes/*');
  console.log('  ALL  /api/websocket/*');
  console.log('');
  console.log(`Ready to accept connections at http://localhost:${PORT}`);
  console.log('════════════════════════════════════════════════');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

module.exports = app;
