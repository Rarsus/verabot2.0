/**
 * Phase 13D: ResolutionHelpers Utility Tests
 *
 * Tests for Discord entity resolution utilities including:
 * - Channel resolution (by ID, mention, name, fuzzy match)
 * - User resolution (by ID, mention, username, fuzzy match)
 * - Role resolution (by ID, mention, name, fuzzy match)
 * - Batch resolution for multiple entities
 * - Error handling and edge cases
 * - Caching behavior validation
 *
 * Current Coverage Target: 15-20% overall (10.96% baseline)
 * Expected ResolutionHelpers coverage: 15-20%
 */

 
const assert = require('assert');
const {
  resolveChannel,
  resolveUser,
  resolveRole,
  resolveChannels,
  resolveUsers,
  resolveRoles,
} = require('../src/utils/helpers/resolution-helpers');

describe('Phase 13D: ResolutionHelpers Utility Tests', () => {
  let mockGuild;
  let mockClient;
  let mockChannel1;
  let mockChannel2;
  let mockUser1;
  let mockUser2;
  let mockRole1;
  let mockRole2;

  /**
   * Helper: Create a collection-like object with find/filter methods
   */
  function createMockCollection(items) {
    const map = new Map();
    for (const item of items) {
      map.set(item.id, item);
    }

    return {
      cache: {
        find: (fn) => {
          for (const item of map.values()) {
            if (fn(item)) return item;
          }
          return undefined;
        },
        filter: (fn) => {
          const result = new Map();
          for (const item of map.values()) {
            if (fn(item)) result.set(item.id, item);
          }
          result.size = result.size;
          result.first = () => result.values().next().value;
          return result;
        },
        get: (id) => map.get(id),
        values: () => map.values(),
      },
      get: (id) => map.get(id),
      find: (fn) => {
        for (const item of map.values()) {
          if (fn(item)) return item;
        }
        return undefined;
      },
      filter: (fn) => {
        const result = new Map();
        for (const item of map.values()) {
          if (fn(item)) result.set(item.id, item);
        }
        result.size = result.size;
        result.first = () => result.values().next().value;
        return result;
      },
      fetch: async (id) => {
        const item = map.get(id);
        if (!item) throw new Error('Item not found');
        return item;
      },
    };
  }

  /**
   * Setup mock Discord objects
   */
  beforeAll(() => {
    // Mock channels
    mockChannel1 = {
      id: '111111111111111111',
      name: 'general',
      isTextBased: () => true,
      guild: { id: 'guild-123' },
    };

    mockChannel2 = {
      id: '222222222222222222',
      name: 'announcements',
      isTextBased: () => true,
      guild: { id: 'guild-123' },
    };

    // Mock users
    mockUser1 = {
      id: '333333333333333333',
      username: 'testuser',
      globalName: 'Test User',
    };

    mockUser2 = {
      id: '444444444444444444',
      username: 'anotheruser',
      globalName: 'Another User',
    };

    // Mock roles
    mockRole1 = {
      id: '555555555555555555',
      name: 'moderator',
    };

    mockRole2 = {
      id: '666666666666666666',
      name: 'admin',
    };

    // Mock guild
    mockGuild = {
      id: 'guild-123',
      client: {
        channels: createMockCollection([mockChannel1, mockChannel2]),
        users: createMockCollection([mockUser1, mockUser2]),
      },
      channels: createMockCollection([mockChannel1, mockChannel2]),
      roles: createMockCollection([mockRole1, mockRole2]),
    };

    // Mock client for user resolution
    mockClient = {
      users: createMockCollection([mockUser1, mockUser2]),
    };
  });

  describe('Channel Resolution', () => {
    it('should resolve channel by ID', async () => {
      const channel = await resolveChannel('111111111111111111', mockGuild);
      assert(channel);
      assert.strictEqual(channel.id, mockChannel1.id);
      assert.strictEqual(channel.name, 'general');
    });

    it('should resolve channel by mention', async () => {
      const channel = await resolveChannel('<#111111111111111111>', mockGuild);
      assert(channel);
      assert.strictEqual(channel.id, mockChannel1.id);
    });

    it('should resolve channel by name', async () => {
      const channel = await resolveChannel('general', mockGuild);
      assert(channel);
      assert.strictEqual(channel.name, 'general');
    });

    it('should resolve channel by name with # prefix', async () => {
      const channel = await resolveChannel('#general', mockGuild);
      assert(channel);
      assert.strictEqual(channel.name, 'general');
    });

    it('should resolve channel by fuzzy match (partial name)', async () => {
      const channel = await resolveChannel('gener', mockGuild);
      assert(channel);
      assert.strictEqual(channel.name, 'general');
    });

    it('should return null for non-existent channel', async () => {
      const channel = await resolveChannel('nonexistent', mockGuild);
      assert.strictEqual(channel, null);
    });

    it('should return null for empty input', async () => {
      const channel = await resolveChannel('', mockGuild);
      assert.strictEqual(channel, null);
    });

    it('should return null for null input', async () => {
      const channel = await resolveChannel(null, mockGuild);
      assert.strictEqual(channel, null);
    });

    it('should return null when guild is null', async () => {
      const channel = await resolveChannel('general', null);
      assert.strictEqual(channel, null);
    });

    it('should be case-insensitive for channel name', async () => {
      const channel = await resolveChannel('GENERAL', mockGuild);
      assert(channel);
      assert.strictEqual(channel.name, 'general');
    });

    it('should handle whitespace in channel input', async () => {
      const channel = await resolveChannel('  general  ', mockGuild);
      assert(channel);
      assert.strictEqual(channel.name, 'general');
    });

    it('should resolve ambiguous mentions correctly', async () => {
      const channel = await resolveChannel('<#222222222222222222>', mockGuild);
      assert(channel);
      assert.strictEqual(channel.id, mockChannel2.id);
    });
  });

  describe('User Resolution', () => {
    it('should resolve user by ID', async () => {
      const user = await resolveUser('333333333333333333', mockClient);
      assert(user);
      assert.strictEqual(user.id, mockUser1.id);
      assert.strictEqual(user.username, 'testuser');
    });

    it('should resolve user by mention', async () => {
      const user = await resolveUser('<@333333333333333333>', mockClient);
      assert(user);
      assert.strictEqual(user.id, mockUser1.id);
    });

    it('should resolve user by mention with ! (nick mention)', async () => {
      const user = await resolveUser('<@!333333333333333333>', mockClient);
      assert(user);
      assert.strictEqual(user.id, mockUser1.id);
    });

    it('should resolve user by username', async () => {
      const user = await resolveUser('testuser', mockClient);
      assert(user);
      assert.strictEqual(user.username, 'testuser');
    });

    it('should resolve user by global name', async () => {
      const user = await resolveUser('Test User', mockClient);
      assert(user);
      assert.strictEqual(user.globalName, 'Test User');
    });

    it('should resolve user by username with @ prefix', async () => {
      const user = await resolveUser('@testuser', mockClient);
      assert(user);
      assert.strictEqual(user.username, 'testuser');
    });

    it('should resolve user by fuzzy match (partial username)', async () => {
      const user = await resolveUser('test', mockClient);
      assert(user);
      assert.strictEqual(user.username, 'testuser');
    });

    it('should return null for non-existent user', async () => {
      const user = await resolveUser('nonexistent', mockClient);
      assert.strictEqual(user, null);
    });

    it('should return null for empty input', async () => {
      const user = await resolveUser('', mockClient);
      assert.strictEqual(user, null);
    });

    it('should return null for null input', async () => {
      const user = await resolveUser(null, mockClient);
      assert.strictEqual(user, null);
    });

    it('should return null when client is null', async () => {
      const user = await resolveUser('testuser', null);
      assert.strictEqual(user, null);
    });

    it('should be case-insensitive for username', async () => {
      const user = await resolveUser('TESTUSER', mockClient);
      assert(user);
      assert.strictEqual(user.username, 'testuser');
    });

    it('should handle whitespace in user input', async () => {
      const user = await resolveUser('  testuser  ', mockClient);
      assert(user);
      assert.strictEqual(user.username, 'testuser');
    });
  });

  describe('Role Resolution', () => {
    it('should resolve role by ID', async () => {
      const role = await resolveRole('555555555555555555', mockGuild);
      assert(role);
      assert.strictEqual(role.id, mockRole1.id);
      assert.strictEqual(role.name, 'moderator');
    });

    it('should resolve role by mention', async () => {
      const role = await resolveRole('<@&555555555555555555>', mockGuild);
      assert(role);
      assert.strictEqual(role.id, mockRole1.id);
    });

    it('should resolve role by name', async () => {
      const role = await resolveRole('moderator', mockGuild);
      assert(role);
      assert.strictEqual(role.name, 'moderator');
    });

    it('should resolve role by name with @ prefix', async () => {
      const role = await resolveRole('@moderator', mockGuild);
      assert(role);
      assert.strictEqual(role.name, 'moderator');
    });

    it('should resolve role by fuzzy match (partial name)', async () => {
      const role = await resolveRole('modera', mockGuild);
      assert(role);
      assert.strictEqual(role.name, 'moderator');
    });

    it('should return null for non-existent role', async () => {
      const role = await resolveRole('nonexistent', mockGuild);
      assert.strictEqual(role, null);
    });

    it('should return null for empty input', async () => {
      const role = await resolveRole('', mockGuild);
      assert.strictEqual(role, null);
    });

    it('should return null for null input', async () => {
      const role = await resolveRole(null, mockGuild);
      assert.strictEqual(role, null);
    });

    it('should return null when guild is null', async () => {
      const role = await resolveRole('moderator', null);
      assert.strictEqual(role, null);
    });

    it('should be case-insensitive for role name', async () => {
      const role = await resolveRole('MODERATOR', mockGuild);
      assert(role);
      assert.strictEqual(role.name, 'moderator');
    });

    it('should handle whitespace in role input', async () => {
      const role = await resolveRole('  moderator  ', mockGuild);
      assert(role);
      assert.strictEqual(role.name, 'moderator');
    });
  });

  describe('Batch Channel Resolution', () => {
    it('should resolve multiple channels', async () => {
      const result = await resolveChannels(['general', 'announcements'], mockGuild);
      assert(result.resolved);
      assert(result.failed);
      assert.strictEqual(result.resolved.length, 2);
      assert.strictEqual(result.failed.length, 0);
    });

    it('should handle mixed valid and invalid channels', async () => {
      const result = await resolveChannels(['general', 'nonexistent'], mockGuild);
      assert.strictEqual(result.resolved.length, 1);
      assert.strictEqual(result.failed.length, 1);
      assert.strictEqual(result.failed[0], 'nonexistent');
    });

    it('should return empty arrays for empty input', async () => {
      const result = await resolveChannels([], mockGuild);
      assert.strictEqual(result.resolved.length, 0);
      assert.strictEqual(result.failed.length, 0);
    });

    it('should handle all failed resolutions', async () => {
      const result = await resolveChannels(['nothere', 'alsono'], mockGuild);
      assert.strictEqual(result.resolved.length, 0);
      assert.strictEqual(result.failed.length, 2);
    });

    it('should track specific failed inputs', async () => {
      const result = await resolveChannels(['general', 'missing1', 'announcements', 'missing2'], mockGuild);
      assert.strictEqual(result.resolved.length, 2);
      assert.strictEqual(result.failed.length, 2);
      assert(result.failed.includes('missing1'));
      assert(result.failed.includes('missing2'));
    });
  });

  describe('Batch User Resolution', () => {
    it('should resolve multiple users', async () => {
      const result = await resolveUsers(['testuser', 'anotheruser'], mockClient);
      assert(result.resolved);
      assert(result.failed);
      assert.strictEqual(result.resolved.length, 2);
      assert.strictEqual(result.failed.length, 0);
    });

    it('should handle mixed valid and invalid users', async () => {
      const result = await resolveUsers(['testuser', 'nonexistent'], mockClient);
      assert.strictEqual(result.resolved.length, 1);
      assert.strictEqual(result.failed.length, 1);
      assert.strictEqual(result.failed[0], 'nonexistent');
    });

    it('should return empty arrays for empty input', async () => {
      const result = await resolveUsers([], mockClient);
      assert.strictEqual(result.resolved.length, 0);
      assert.strictEqual(result.failed.length, 0);
    });

    it('should handle all failed resolutions', async () => {
      const result = await resolveUsers(['notuser1', 'notuser2'], mockClient);
      assert.strictEqual(result.resolved.length, 0);
      assert.strictEqual(result.failed.length, 2);
    });
  });

  describe('Batch Role Resolution', () => {
    it('should resolve multiple roles', async () => {
      const result = await resolveRoles(['moderator', 'admin'], mockGuild);
      assert(result.resolved);
      assert(result.failed);
      assert.strictEqual(result.resolved.length, 2);
      assert.strictEqual(result.failed.length, 0);
    });

    it('should handle mixed valid and invalid roles', async () => {
      const result = await resolveRoles(['moderator', 'nonexistent'], mockGuild);
      assert.strictEqual(result.resolved.length, 1);
      assert.strictEqual(result.failed.length, 1);
      assert.strictEqual(result.failed[0], 'nonexistent');
    });

    it('should return empty arrays for empty input', async () => {
      const result = await resolveRoles([], mockGuild);
      assert.strictEqual(result.resolved.length, 0);
      assert.strictEqual(result.failed.length, 0);
    });

    it('should handle all failed resolutions', async () => {
      const result = await resolveRoles(['notrole1', 'notrole2'], mockGuild);
      assert.strictEqual(result.resolved.length, 0);
      assert.strictEqual(result.failed.length, 2);
    });

    it('should preserve order in batch results', async () => {
      const result = await resolveRoles(['admin', 'moderator'], mockGuild);
      assert.strictEqual(result.resolved[0].name, 'admin');
      assert.strictEqual(result.resolved[1].name, 'moderator');
    });
  });

  describe('Edge Cases', () => {
    it('should handle channel IDs that look like mentions', async () => {
      const channel = await resolveChannel('111111111111111111', mockGuild);
      assert(channel);
      assert.strictEqual(channel.id, mockChannel1.id);
    });

    it('should handle user IDs that are numeric strings', async () => {
      const user = await resolveUser('333333333333333333', mockClient);
      assert(user);
      assert.strictEqual(user.id, mockUser1.id);
    });

    it('should handle role IDs that are numeric strings', async () => {
      const role = await resolveRole('555555555555555555', mockGuild);
      assert(role);
      assert.strictEqual(role.id, mockRole1.id);
    });

    it('should handle very long input strings', async () => {
      const longInput = 'a'.repeat(1000);
      const channel = await resolveChannel(longInput, mockGuild);
      assert.strictEqual(channel, null);
    });

    it('should handle special characters in input', async () => {
      const channel = await resolveChannel('!@#$%^&*()', mockGuild);
      assert.strictEqual(channel, null);
    });

    it('should handle unicode characters in input', async () => {
      const channel = await resolveChannel('😀💯🔥', mockGuild);
      assert.strictEqual(channel, null);
    });

    it('should handle multiple spaces in input', async () => {
      const user = await resolveUser('   testuser   ', mockClient);
      assert(user);
      assert.strictEqual(user.username, 'testuser');
    });

    it('should handle newlines in input', async () => {
      const channel = await resolveChannel('general\n', mockGuild);
      assert(channel);
      // Should still resolve despite newline
      assert.strictEqual(channel.name, 'general');
    });
  });

  describe('Resolution Consistency', () => {
    it('should resolve same entity consistently', async () => {
      const channel1 = await resolveChannel('general', mockGuild);
      const channel2 = await resolveChannel('general', mockGuild);
      assert.strictEqual(channel1.id, channel2.id);
      assert.strictEqual(channel1.name, channel2.name);
    });

    it('should resolve via ID and name to same entity', async () => {
      const byId = await resolveChannel('111111111111111111', mockGuild);
      const byName = await resolveChannel('general', mockGuild);
      assert.strictEqual(byId.id, byName.id);
    });

    it('should resolve via mention and ID to same entity', async () => {
      const byMention = await resolveChannel('<#111111111111111111>', mockGuild);
      const byId = await resolveChannel('111111111111111111', mockGuild);
      assert.strictEqual(byMention.id, byId.id);
    });

    it('should maintain consistent order in batch operations', async () => {
      const result1 = await resolveChannels(['general', 'announcements'], mockGuild);
      const result2 = await resolveChannels(['general', 'announcements'], mockGuild);
      assert.strictEqual(result1.resolved[0].id, result2.resolved[0].id);
      assert.strictEqual(result1.resolved[1].id, result2.resolved[1].id);
    });
  });
});
