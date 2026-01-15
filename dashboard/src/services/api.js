import axios from 'axios';

// Configure API base URL - point to dashboard server (port 5000)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for session management
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if we're not in the auth flow (not checking token)
    if (error.response?.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes('/auth/');
      if (!isAuthEndpoint) {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// WebSocket Configuration APIs
export const websocketAPI = {
  // Get all WebSocket service configurations
  getServices: () => api.get('/websocket/services'),

  // Get specific service configuration
  getService: (serviceName) => api.get(`/websocket/services/${serviceName}`),

  // Update service configuration
  updateService: (serviceName, config) => api.put(`/websocket/services/${serviceName}`, config),

  // Get WebSocket service status
  getStatus: (serviceName) => api.get(`/websocket/status/${serviceName}`),

  // Get all services status
  getAllStatus: () => api.get('/websocket/status'),

  // Test WebSocket connection
  testConnection: (serviceName) => api.post(`/websocket/test/${serviceName}`),

  // Enable/disable service
  toggleService: (serviceName, enabled) => api.patch(`/websocket/services/${serviceName}/toggle`, { enabled }),

  // Get available actions for a service
  getAvailableActions: () => api.get('/websocket/actions'),

  // Send test action
  sendTestAction: (serviceName, action, payload) =>
    api.post(`/websocket/actions/test`, {
      serviceName,
      action,
      payload,
    }),
};

// Quote Management APIs
export const quotesAPI = {
  // Get all quotes with pagination
  getQuotes: (page = 1, limit = 20) => api.get('/quotes', { params: { page, limit } }),

  // Get quote by ID
  getQuote: (id) => api.get(`/quotes/${id}`),

  // Create new quote
  createQuote: (text, author) => api.post('/quotes', { text, author }),

  // Update quote
  updateQuote: (id, text, author) => api.put(`/quotes/${id}`, { text, author }),

  // Delete quote
  deleteQuote: (id) => api.delete(`/quotes/${id}`),

  // Search quotes
  searchQuotes: (query) => api.get('/quotes/search', { params: { q: query } }),

  // Get quote statistics
  getStats: () => api.get('/quotes/stats'),
};

// Bot Management APIs
export const botAPI = {
  // Get bot status
  getStatus: () => api.get('/bot/status'),

  // Get bot info
  getInfo: () => api.get('/bot/info'),

  // Get command list
  getCommands: () => api.get('/bot/commands'),

  // Get guild list
  getGuilds: () => api.get('/bot/guilds'),

  // Get guild info
  getGuild: (guildId) => api.get(`/bot/guilds/${guildId}`),

  // Get bot statistics
  getStats: () => api.get('/bot/stats'),

  // Restart bot (admin only)
  restart: () => api.post('/bot/restart'),
};

// User/Auth APIs
export const authAPI = {
  // Get Discord OAuth login URL
  getLoginUrl: () => api.get('/auth/login'),

  // Verify JWT token
  verify: () => api.get('/auth/verify'),

  // Get current user info
  getUser: () => api.get('/auth/user'),

  // Logout
  logout: () => api.post('/auth/logout'),
};

export default api;
