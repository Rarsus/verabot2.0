/**
 * MockInteractionBuilder - Factory for Creating Mock Discord.js Interactions
 * Phase 22.5: Implementation Integration
 *
 * Purpose: Build realistic mock Discord.js interaction objects for command testing
 * Supports both slash commands and prefix commands
 *
 * Usage:
 *   const interaction = MockInteractionBuilder
 *     .forSlashCommand('create-reminder')
 *     .withGuild('guild-456')
 *     .withUser('user-123')
 *     .withOption('subject', 'Test reminder')
 *     .build();
 */

class MockInteractionBuilder {
  constructor() {
    this.guildId = 'test-guild-123';
    this.userId = 'test-user-456';
    this.commandName = 'test-command';
    this.optionsMap = new Map();
    this.isSlash = true;
    this.responses = [];
    this.mocks = {
      reply: jest.fn(),
      editReply: jest.fn(),
      deferReply: jest.fn(),
      followUp: jest.fn(),
      deleteReply: jest.fn(),
    };
  }

  /**
   * Set guild ID
   */
  withGuild(guildId) {
    this.guildId = guildId;
    return this;
  }

  /**
   * Set user ID
   */
  withUser(userId) {
    this.userId = userId;
    return this;
  }

  /**
   * Set command name
   */
  withCommand(commandName) {
    this.commandName = commandName;
    return this;
  }

  /**
   * For slash command interaction
   */
  forSlashCommand(commandName) {
    this.isSlash = true;
    this.commandName = commandName;
    return this;
  }

  /**
   * For prefix/legacy command interaction
   */
  forPrefixCommand(prefix = '!') {
    this.isSlash = false;
    this.prefix = prefix;
    return this;
  }

  /**
   * Add command option
   */
  withOption(name, value) {
    this.optionsMap.set(name, value);
    return this;
  }

  /**
   * Add multiple options at once
   */
  withOptions(optionsObject) {
    Object.entries(optionsObject).forEach(([key, value]) => {
      this.optionsMap.set(key, value);
    });
    return this;
  }

  /**
   * Set user permission level
   */
  withPermissions(permissions = []) {
    this.permissions = permissions;
    return this;
  }

  /**
   * Mark user as admin
   */
  asAdmin() {
    this.permissions = ['ADMINISTRATOR'];
    return this;
  }

  /**
   * Build the mock interaction object
   */
  build() {
    if (this.isSlash) {
      return this.buildSlashInteraction();
    }
    return this.buildPrefixInteraction();
  }

  /**
   * Build slash command interaction
   */
  buildSlashInteraction() {
    const self = this;

    // Build options object with getter methods
    const options = {
      getString: jest.fn((name) => {
        const value = self.optionsMap.get(name);
        return value !== undefined ? String(value) : '';
      }),
      getUser: jest.fn((name) => {
        const value = self.optionsMap.get(name);
        return value ? { id: value, username: `user_${value}` } : null;
      }),
      getRole: jest.fn((name) => {
        const value = self.optionsMap.get(name);
        return value ? { id: value, name: `role_${value}` } : null;
      }),
      getChannel: jest.fn((name) => {
        const value = self.optionsMap.get(name);
        return value ? { id: value, name: `channel_${value}` } : null;
      }),
      getInteger: jest.fn((name) => {
        const value = self.optionsMap.get(name);
        return value !== undefined ? parseInt(value, 10) : 0;
      }),
      getNumber: jest.fn((name) => {
        const value = self.optionsMap.get(name);
        return value !== undefined ? parseFloat(value) : 0;
      }),
      getBoolean: jest.fn((name) => {
        const value = self.optionsMap.get(name);
        return Boolean(value);
      }),
    };

    return {
      // Interaction properties
      id: `interaction_${Date.now()}`,
      token: 'test-token-123',
      type: 2, // APPLICATION_COMMAND
      isCommand: () => true,
      isChatInputCommand: () => true,
      isUserContextMenuCommand: () => false,
      isMessageContextMenuCommand: () => false,
      isButton: () => false,
      isSelectMenu: () => false,
      isModalSubmit: () => false,

      // Guild/User info
      guildId: self.guildId,
      guild: {
        id: self.guildId,
        name: `Guild ${self.guildId}`,
        owner: { id: 'owner-id' },
      },
      channelId: `channel_${self.guildId}`,
      channel: {
        id: `channel_${self.guildId}`,
        name: 'test-channel',
        isDMBased: () => false,
        isTextBased: () => true,
      },
      user: {
        id: self.userId,
        username: `user_${self.userId}`,
        discriminator: '0001',
        bot: false,
      },
      member: {
        id: self.userId,
        user: { id: self.userId },
        roles: { cache: new Map() },
        permissions: self.permissions ? { has: jest.fn((p) => self.permissions.includes(p)) } : null,
      },

      // Command info
      commandName: self.commandName,
      commandId: `cmd_${self.commandName}`,
      options,

      // Response methods (all mocked)
      reply: self.mocks.reply.mockResolvedValue({ id: 'msg-1' }),
      editReply: self.mocks.editReply.mockResolvedValue({ id: 'msg-1' }),
      deferReply: self.mocks.deferReply.mockResolvedValue(),
      followUp: self.mocks.followUp.mockResolvedValue({ id: 'msg-2' }),
      deleteReply: self.mocks.deleteReply.mockResolvedValue(),

      // Utility methods
      isRepliable: () => true,
      getOption: (name, required) => options.getString(name),
    };
  }

  /**
   * Build prefix/legacy command interaction
   */
  buildPrefixInteraction() {
    const args = Array.from(this.optionsMap.values());

    return {
      // Message properties
      id: `message_${Date.now()}`,
      content: `${this.prefix}${this.commandName} ${args.join(' ')}`,
      author: {
        id: this.userId,
        username: `user_${this.userId}`,
        bot: false,
      },
      guild: {
        id: this.guildId,
        name: `Guild ${this.guildId}`,
      },
      member: {
        id: this.userId,
        roles: { cache: new Map() },
        permissions: this.permissions,
      },
      channel: {
        id: `channel_${this.guildId}`,
        isDMBased: () => false,
        isTextBased: () => true,
      },

      // Command parsing
      prefix: this.prefix,
      commandName: this.commandName,
      args,

      // Response methods
      reply: this.mocks.reply.mockResolvedValue({ id: 'msg-1' }),
      react: jest.fn().mockResolvedValue({}),
      edit: this.mocks.editReply.mockResolvedValue({ id: 'msg-1' }),
      delete: jest.fn().mockResolvedValue({}),
    };
  }

  /**
   * Get mock call information
   */
  getCallInfo() {
    return {
      replyCalls: this.mocks.reply.mock.calls.length,
      deferCalls: this.mocks.deferReply.mock.calls.length,
      followUpCalls: this.mocks.followUp.mock.calls.length,
      editCalls: this.mocks.editReply.mock.calls.length,
      replyContent: this.mocks.reply.mock.calls.map((call) => call[0]),
    };
  }

  /**
   * Reset all mocks
   */
  resetMocks() {
    Object.values(this.mocks).forEach((mock) => {
      if (mock && mock.mockClear) {
        mock.mockClear();
      }
    });
    return this;
  }

  /**
   * Static helper: Create interaction for specific command
   */
  static create(commandName, guildId = 'test-guild-123', userId = 'test-user-456') {
    return new MockInteractionBuilder()
      .forSlashCommand(commandName)
      .withGuild(guildId)
      .withUser(userId);
  }

  /**
   * Static helper: Create admin interaction
   */
  static createAdmin(commandName) {
    return MockInteractionBuilder.create(commandName).asAdmin();
  }

  /**
   * Static helper: Create batch of interactions for testing
   */
  static createBatch(commandNames, guildId = 'test-guild-123') {
    return commandNames.map((name) => MockInteractionBuilder.create(name, guildId).build());
  }
}

module.exports = MockInteractionBuilder;
