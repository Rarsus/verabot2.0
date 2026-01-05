const express = require('express');
const router = express.Router();
const botService = require('../services/bot-service');
const { authMiddleware } = require('../middleware/auth');

/**
 * Proxy all authenticated requests to the bot API
 * This allows the frontend to communicate with the bot through this server
 */

// Apply authentication to all API routes
router.use(authMiddleware);

/**
 * GET /api/bot/*
 * Proxy bot-related requests
 */
router.all('/bot/*', async (req, res) => {
  try {
    const path = req.path.replace('/bot', '/api/bot');
    const result = await botService.proxyRequest(req.method, path, req.body);
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
    const result = await botService.proxyRequest(req.method, path, req.body);
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
    const result = await botService.proxyRequest(req.method, path, req.body);
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
