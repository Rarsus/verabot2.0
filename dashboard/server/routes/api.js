const express = require('express');
const router = express.Router();
const botService = require('../services/bot-service');
const { authMiddleware } = require('../middleware/auth');
const { authorizationMiddleware } = require('../middleware/authorization');

/**
 * Proxy all authenticated requests to the bot API
 * This allows the frontend to communicate with the bot through this server
 */

// Apply authentication and authorization to all API routes
router.use(authMiddleware);
router.use(authorizationMiddleware);

/**
 * GET /api/bot/*
 * Proxy bot-related requests
 */
router.all('/bot/*', async (req, res) => {
  try {
    const path = req.path.replace('/bot', '/api/bot');
    // Get request headers but exclude Authorization (bot-service will add its own with BOT_API_TOKEN)
    const headers = { ...req.headers };
    delete headers.authorization; // Remove user's JWT token (lowercase)
    delete headers.Authorization; // Remove user's JWT token (uppercase, just in case)
    
    const result = await botService.proxyRequest(req.method, path, req.body, headers);
    res.json(result);
  } catch (error) {
    console.error('Bot API proxy error:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || error.message,
    });
  }
});

/**
 * GET /api/quotes/*
 * Proxy quote-related requests
 */
router.all('/quotes/*', async (req, res) => {
  try {
    const path = req.path.replace('/quotes', '/api/quotes');
    // Get request headers but exclude Authorization (bot-service will add its own with BOT_API_TOKEN)
    const headers = { ...req.headers };
    delete headers.authorization; // Remove user's JWT token
    
    const result = await botService.proxyRequest(req.method, path, req.body, headers);
    res.json(result);
  } catch (error) {
    console.error('Quote API proxy error:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || error.message,
    });
  }
});

/**
 * GET /api/websocket/*
 * Proxy WebSocket-related requests
 */
router.all('/websocket/*', async (req, res) => {
  try {
    const path = req.path.replace('/websocket', '/api/websocket');
    // Get request headers but exclude Authorization (bot-service will add its own with BOT_API_TOKEN)
    const headers = { ...req.headers };
    delete headers.authorization; // Remove user's JWT token
    
    const result = await botService.proxyRequest(req.method, path, req.body, headers);
    res.json(result);
  } catch (error) {
    console.error('WebSocket API proxy error:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || error.message,
    });
  }
});

module.exports = router;
