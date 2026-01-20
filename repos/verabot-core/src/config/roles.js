/**
 * Role-Based Permission Configuration
 * Defines role hierarchies, tiers, and command permissions
 */

module.exports = {
  // Feature flag - enable/disable entire system
  enabled: process.env.ROLE_BASED_PERMISSIONS_ENABLED !== 'false',

  // Audit logging of permission checks
  auditLogging: process.env.ROLE_AUDIT_LOGGING !== 'false',

  // Cache role checks for performance
  cacheRoleChecks: true,

  // Cache TTL in seconds
  cacheTTL: 3600,

  // Role tier definitions
  tiers: {
    0: {
      name: 'Guest',
      description: 'Read-only access, cannot execute commands',
      permissions: ['read:quotes'],
    },

    1: {
      name: 'Member',
      description: 'Standard user permissions',
      permissions: [
        'create:quotes',
        'read:quotes',
        'rate:quotes',
        'tag:quotes',
        'view:own_reminders',
        'create:reminders',
      ],
    },

    2: {
      name: 'Moderator',
      description: 'Moderation and advanced quote management',
      permissions: [
        'create:quotes',
        'read:quotes',
        'update:quotes',
        'delete:quotes',
        'rate:quotes',
        'tag:quotes',
        'view:all_reminders',
        'create:reminders',
        'moderate:users',
      ],
    },

    3: {
      name: 'Administrator',
      description: 'Guild administration and all standard features',
      permissions: ['*:quotes', '*:reminders', '*:moderation', 'admin:guild', 'config:reminders', 'manage:webhook'],
    },

    4: {
      name: 'Bot Owner',
      description: 'Full bot access and configuration',
      permissions: ['*'],
    },
  },

  // Command-level permission requirements
  commands: {
    // Miscellaneous commands
    ping: {
      minTier: 0,
      visible: true,
      description: 'Check bot latency',
    },

    help: {
      minTier: 0,
      visible: true,
      description: 'Show available commands',
    },

    // Quote discovery commands
    'random-quote': {
      minTier: 0,
      visible: true,
      description: 'Get a random quote',
    },

    'search-quotes': {
      minTier: 0,
      visible: true,
      description: 'Search for quotes',
    },

    'quote-stats': {
      minTier: 1,
      visible: true,
      description: 'View quote statistics',
    },

    quote: {
      minTier: 0,
      visible: true,
      description: 'Get a specific quote',
    },

    // Quote management commands
    'add-quote': {
      minTier: 1,
      visible: true,
      description: 'Add a new quote',
    },

    'update-quote': {
      minTier: 2,
      visible: true,
      description: 'Update a quote',
    },

    'delete-quote': {
      minTier: 2,
      visible: true,
      description: 'Delete a quote',
    },

    'list-quotes': {
      minTier: 1,
      visible: true,
      description: 'List quotes with pagination',
    },

    // Quote social commands
    'rate-quote': {
      minTier: 1,
      visible: true,
      description: 'Rate a quote',
    },

    'tag-quote': {
      minTier: 1,
      visible: true,
      description: 'Tag a quote',
    },

    // Quote export commands
    'export-quotes': {
      minTier: 1,
      visible: true,
      description: 'Export quotes to file',
    },

    // Reminder commands
    remind: {
      minTier: 1,
      visible: true,
      description: 'Set a reminder',
    },

    'list-reminders': {
      minTier: 1,
      visible: true,
      description: 'List your reminders',
    },

    'delete-reminder': {
      minTier: 1,
      visible: true,
      description: 'Delete a reminder',
    },

    'edit-reminder': {
      minTier: 1,
      visible: true,
      description: 'Edit a reminder',
    },

    'remind-list-all': {
      minTier: 3,
      visible: false,
      description: '[ADMIN] List all server reminders',
    },

    'remind-delete-other': {
      minTier: 3,
      visible: false,
      description: "[ADMIN] Delete another user's reminder",
    },

    // Admin commands - whisper
    whisper: {
      minTier: 3,
      visible: false,
      description: '[ADMIN] Send DMs to users',
    },

    // Admin commands - embed
    'embed-message': {
      minTier: 3,
      visible: false,
      description: '[ADMIN] Create custom embeds',
    },

    // Admin commands - role management
    'manage-roles': {
      minTier: 4,
      visible: false,
      description: '[OWNER] Configure role permissions',
    },

    // Proxy commands
    'proxy-config': {
      minTier: 3,
      visible: false,
      description: '[ADMIN] Configure webhook proxy',
    },

    'proxy-list': {
      minTier: 3,
      visible: false,
      description: '[ADMIN] List proxy webhooks',
    },

    'proxy-delete': {
      minTier: 3,
      visible: false,
      description: '[ADMIN] Delete proxy webhook',
    },

    'proxy-test': {
      minTier: 3,
      visible: false,
      description: '[ADMIN] Test proxy connection',
    },

    // Poem generation
    poem: {
      minTier: 0,
      visible: true,
      description: 'Generate an AI poem',
    },
  },

  // Guild-specific permission overrides
  guildOverrides: {},

  // Bot owner user IDs (highest tier always)
  botOwners: process.env.BOT_OWNERS?.split(',') || [],

  // Roles that map to Discord roles
  roleMapping: {},

  // Whether to allow guild admins to override tier requirements
  allowGuildAdminOverride: false,

  // Default tier for users with no role mappings
  defaultTier: 1,
};
