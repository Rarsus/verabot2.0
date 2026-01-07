/**
 * Feature Module Configuration
 *
 * Control which features are enabled per instance.
 * Set environment variables to enable/disable features.
 */

module.exports = {
  // Core quote management system (always enabled, fundamental feature)
  quotes: {
    enabled: true,
    description: 'Quote management (add, search, rate, tag, export)',
  },

  // Miscellaneous commands (ping, help, hi, poem)
  misc: {
    enabled: true,
    description: 'Miscellaneous commands (ping, help, hi, poem)',
  },

  // Reminder system
  reminders: {
    enabled: process.env.ENABLE_REMINDERS !== 'false', // Enabled by default
    description: 'Reminder system (create, list, delete reminders)',
  },

  // Proxy/webhook forwarding (disabled by default, requires admin)
  proxy: {
    enabled: process.env.ENABLE_PROXY_FEATURES === 'true',
    description: 'Message proxy (webhook forwarding)',
    webhookPort: process.env.PROXY_WEBHOOK_PORT || 3001,
  },

  // Admin commands (disabled by default, requires admin)
  admin: {
    enabled: process.env.ENABLE_ADMIN_COMMANDS === 'true',
    description: 'Admin commands (proxy configuration)',
  },

  // Dashboard API server (disabled by default)
  dashboard: {
    enabled: process.env.ENABLE_DASHBOARD_API === 'true',
    description: 'Dashboard API server for web interface',
    port: process.env.API_PORT || 3000,
  },
};
