/**
 * VeraBot Dashboard - Main Entry Point
 *
 * Initializes Express server with API routes, middleware, and dashboard endpoints.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dashboardRoutes from './routes/dashboard.js';

dotenv.config({ path: '../../.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.DASHBOARD_PORT || 3000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public files - static assets
app.use(express.static(path.join(__dirname, '..', 'public'), {
  maxAge: '1d',
  etag: false,
}));

// API Routes
app.use('/api/dashboard', dashboardRoutes);

// Dashboard routes
app.get('/', (req, res) => {
  res.render('index', { title: 'Dashboard' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    title: '404 - Not Found',
    message: 'The page you are looking for does not exist.',
  });
});

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error('Dashboard error:', err);

  // Check if it's an API request
  if (req.accepts('json')) {
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error',
      status: err.status || 500,
    });
  } else {
    // Render error page for HTML requests
    res.status(err.status || 500).render('error', {
      title: `Error ${err.status || 500}`,
      message: err.message || 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? err : {},
    });
  }
});

// Start server
if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(PORT, () => {
    console.log(`VeraBot Dashboard running on port ${PORT}`);
  });
}

export default app;
