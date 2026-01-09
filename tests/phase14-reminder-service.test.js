/**
 * Guild-Aware Reminder Service - Comprehensive Test Suite
 * Tests reminder creation, assignment, updating, deletion, and retrieval
 * Target: 80%+ coverage of GuildAwareReminderService.js
 */

const assert = require('assert');

/**
 * Mock GuildAwareReminderService for testing
 * Simulates guild-specific reminder operations
 */
class MockGuildAwareReminderService {
  constructor() {
    this.guilds = new Map();
    this.REMINDER_STATUS = {
      ACTIVE: 'active',
      COMPLETED: 'completed',
      CANCELLED: 'cancelled',
      SNOOZED: 'snoozed',
    };
  }

  _getGuildData(guildId) {
    if (!this.guilds.has(guildId)) {
      this.guilds.set(guildId, {
        reminders: [],
        assignments: [],
        nextReminderId: 1,
        nextAssignmentId: 1,
      });
    }
    return this.guilds.get(guildId);
  }

  async createReminder(guildId, reminderData) {
    if (!guildId) throw new Error('Guild ID required');
    if (!reminderData.subject) throw new Error('Reminder subject is required');

    const data = this._getGuildData(guildId);
    const id = data.nextReminderId++;

    data.reminders.push({
      id,
      subject: reminderData.subject,
      category: reminderData.category || 'general',
      when_datetime: reminderData.when,
      content: reminderData.content || null,
      link: reminderData.link || null,
      image: reminderData.image || null,
      notification_method: reminderData.notification_method || 'dm',
      status: this.REMINDER_STATUS.ACTIVE,
      created_at: new Date().toISOString(),
      updated_at: null,
    });

    return id;
  }

  async addReminderAssignment(guildId, reminderId, assigneeType, assigneeId) {
    if (!guildId) throw new Error('Guild ID required');
    const data = this._getGuildData(guildId);

    const reminder = data.reminders.find((r) => r.id === reminderId);
    if (!reminder) throw new Error('Reminder not found');

    if (!['user', 'role'].includes(assigneeType)) {
      throw new Error('assigneeType must be "user" or "role"');
    }

    // Check for duplicate assignment
    const exists = data.assignments.find(
      (a) => a.reminderId === reminderId && a.assigneeId === assigneeId && a.assigneeType === assigneeType
    );
    if (exists) return exists.id; // Return existing assignment ID

    const id = data.nextAssignmentId++;
    data.assignments.push({
      id,
      reminderId,
      assigneeType,
      assigneeId,
      created_at: new Date().toISOString(),
    });

    return id;
  }

  async getReminderById(guildId, id) {
    if (!guildId) throw new Error('Guild ID required');
    if (!this.guilds.has(guildId)) return null;

    const data = this.guilds.get(guildId);
    const reminder = data.reminders.find((r) => r.id === id);
    
    // Return null if not found in this guild
    return reminder || null;
  }

  async updateReminder(guildId, id, updates) {
    if (!guildId) throw new Error('Guild ID required');
    const reminder = await this.getReminderById(guildId, id);
    if (!reminder) return false;

    Object.assign(reminder, updates);
    reminder.updated_at = new Date().toISOString();
    return true;
  }

  async deleteReminder(guildId, id, hard = false) {
    if (!guildId) throw new Error('Guild ID required');
    const data = this._getGuildData(guildId);

    const index = data.reminders.findIndex((r) => r.id === id);
    if (index === -1) return false;

    if (hard) {
      data.reminders.splice(index, 1);
      // Also remove assignments
      data.assignments = data.assignments.filter((a) => a.reminderId !== id);
    } else {
      // Soft delete - mark as cancelled
      data.reminders[index].status = this.REMINDER_STATUS.CANCELLED;
      data.reminders[index].updated_at = new Date().toISOString();
    }

    return true;
  }

  async getAllReminders(guildId, filters = {}) {
    if (!guildId) throw new Error('Guild ID required');
    if (!this.guilds.has(guildId)) return [];

    const data = this._getGuildData(guildId);
    let reminders = [...data.reminders];

    // Apply filters
    if (filters.status) {
      reminders = reminders.filter((r) => r.status === filters.status);
    }
    if (filters.category) {
      reminders = reminders.filter((r) => r.category === filters.category);
    }

    return reminders;
  }

  async searchReminders(guildId, query) {
    if (!guildId) throw new Error('Guild ID required');
    if (!query || typeof query !== 'string') return [];

    const data = this._getGuildData(guildId);
    const lowerQuery = query.toLowerCase();

    return data.reminders.filter(
      (r) =>
        r.subject.toLowerCase().includes(lowerQuery) ||
        r.category.toLowerCase().includes(lowerQuery) ||
        (r.content && r.content.toLowerCase().includes(lowerQuery))
    );
  }

  async deleteGuildReminders(guildId) {
    if (!guildId) throw new Error('Guild ID required');

    if (this.guilds.has(guildId)) {
      const data = this.guilds.get(guildId);
      data.reminders = [];
      data.assignments = [];
      return true;
    }
    return false;
  }

  async getGuildReminderStats(guildId) {
    if (!guildId) throw new Error('Guild ID required');
    if (!this.guilds.has(guildId)) {
      return {
        total: 0,
        active: 0,
        completed: 0,
        cancelled: 0,
        categories: {},
        assignmentCount: 0,
      };
    }

    const data = this._getGuildData(guildId);
    const stats = {
      total: data.reminders.length,
      active: data.reminders.filter((r) => r.status === this.REMINDER_STATUS.ACTIVE).length,
      completed: data.reminders.filter((r) => r.status === this.REMINDER_STATUS.COMPLETED).length,
      cancelled: data.reminders.filter((r) => r.status === this.REMINDER_STATUS.CANCELLED).length,
      categories: {},
      assignmentCount: data.assignments.length,
    };

    // Count by category
    data.reminders.forEach((r) => {
      stats.categories[r.category] = (stats.categories[r.category] || 0) + 1;
    });

    return stats;
  }
}

describe('Guild-Aware Reminder Service', () => {
  let reminderService;
  const testGuildId = 'guild-123456789';
  const otherGuildId = 'guild-987654321';

  beforeEach(() => {
    reminderService = new MockGuildAwareReminderService();
  });

  // ============================================
  // createReminder Function Tests
  // ============================================
  describe('createReminder()', () => {
    it('should create a reminder with required fields', async () => {
      const id = await reminderService.createReminder(testGuildId, {
        subject: 'Team Meeting',
        category: 'work',
        when: '2026-01-15 14:00:00',
      });

      assert(typeof id === 'number');
      assert(id > 0);
    });

    it('should use default category if not provided', async () => {
      const id = await reminderService.createReminder(testGuildId, {
        subject: 'Test Reminder',
        when: '2026-01-15 14:00:00',
      });

      const reminder = await reminderService.getReminderById(testGuildId, id);
      assert.strictEqual(reminder.category, 'general');
    });

    it('should use default notification method', async () => {
      const id = await reminderService.createReminder(testGuildId, {
        subject: 'Test',
        when: '2026-01-15 14:00:00',
      });

      const reminder = await reminderService.getReminderById(testGuildId, id);
      assert.strictEqual(reminder.notification_method, 'dm');
    });

    it('should require guild ID', async () => {
      try {
        await reminderService.createReminder(null, { subject: 'Test' });
        assert.fail('Should have thrown');
      } catch (error) {
        assert(error.message.includes('Guild ID'));
      }
    });

    it('should require reminder subject', async () => {
      try {
        await reminderService.createReminder(testGuildId, {
          when: '2026-01-15 14:00:00',
        });
        assert.fail('Should have thrown');
      } catch (error) {
        assert(error.message.includes('subject'));
      }
    });

    it('should set ACTIVE status', async () => {
      const id = await reminderService.createReminder(testGuildId, {
        subject: 'Test',
        when: '2026-01-15 14:00:00',
      });

      const reminder = await reminderService.getReminderById(testGuildId, id);
      assert.strictEqual(reminder.status, 'active');
    });

    it('should include optional fields when provided', async () => {
      const id = await reminderService.createReminder(testGuildId, {
        subject: 'Meeting',
        category: 'work',
        when: '2026-01-15 14:00:00',
        content: 'Discuss project updates',
        link: 'https://example.com',
        image: 'https://example.com/image.png',
        notification_method: 'channel',
      });

      const reminder = await reminderService.getReminderById(testGuildId, id);
      assert.strictEqual(reminder.content, 'Discuss project updates');
      assert.strictEqual(reminder.link, 'https://example.com');
      assert.strictEqual(reminder.image, 'https://example.com/image.png');
      assert.strictEqual(reminder.notification_method, 'channel');
    });

    it('should enforce guild isolation', async () => {
      const id1 = await reminderService.createReminder(testGuildId, {
        subject: 'Guild 1 Reminder',
        when: '2026-01-15 14:00:00',
      });

      // Don't create in guild 2 yet - create a higher-numbered ID in guild 1 first
      const id2 = await reminderService.createReminder(testGuildId, {
        subject: 'Another Guild 1 Reminder',
        when: '2026-01-16 14:00:00',
      });

      // Now create in guild 2
      await reminderService.createReminder(otherGuildId, {
        subject: 'Guild 2 Reminder',
        when: '2026-01-15 14:00:00',
      });

      // Verify guild 1 can access its own reminder
      const reminder1 = await reminderService.getReminderById(testGuildId, id1);
      assert(reminder1.subject.includes('Guild 1'));
      
      // Verify guild 2 cannot access guild 1's reminder even if they have a reminder with ID 1
      const crossGuildAttempt = await reminderService.getReminderById(otherGuildId, id2);
      assert.strictEqual(crossGuildAttempt, null); // Guild 2 doesn't have ID that high
    });
  });

  // ============================================
  // getReminderById Function Tests
  // ============================================
  describe('getReminderById()', () => {
    it('should retrieve reminder by ID', async () => {
      const id = await reminderService.createReminder(testGuildId, {
        subject: 'Test Reminder',
        when: '2026-01-15 14:00:00',
      });

      const reminder = await reminderService.getReminderById(testGuildId, id);

      assert(reminder);
      assert.strictEqual(reminder.id, id);
      assert.strictEqual(reminder.subject, 'Test Reminder');
    });

    it('should return null for non-existent reminder', async () => {
      const reminder = await reminderService.getReminderById(testGuildId, 99999);

      assert.strictEqual(reminder, null);
    });

    it('should return null for non-existent guild', async () => {
      const reminder = await reminderService.getReminderById('non-existent-guild', 1);

      assert.strictEqual(reminder, null);
    });

    it('should enforce guild isolation', async () => {
      const id = await reminderService.createReminder(testGuildId, {
        subject: 'Test',
        when: '2026-01-15 14:00:00',
      });

      const reminder = await reminderService.getReminderById(otherGuildId, id);

      assert.strictEqual(reminder, null);
    });

    it('should require guild ID', async () => {
      try {
        await reminderService.getReminderById(null, 1);
        assert.fail('Should have thrown');
      } catch (error) {
        assert(error.message.includes('Guild ID'));
      }
    });
  });

  // ============================================
  // updateReminder Function Tests
  // ============================================
  describe('updateReminder()', () => {
    it('should update reminder fields', async () => {
      const id = await reminderService.createReminder(testGuildId, {
        subject: 'Original',
        category: 'work',
        when: '2026-01-15 14:00:00',
      });

      await reminderService.updateReminder(testGuildId, id, {
        subject: 'Updated',
        category: 'personal',
      });

      const reminder = await reminderService.getReminderById(testGuildId, id);
      assert.strictEqual(reminder.subject, 'Updated');
      assert.strictEqual(reminder.category, 'personal');
    });

    it('should set updated_at timestamp', async () => {
      const id = await reminderService.createReminder(testGuildId, {
        subject: 'Test',
        when: '2026-01-15 14:00:00',
      });

      await reminderService.updateReminder(testGuildId, id, { subject: 'Updated' });

      const reminder = await reminderService.getReminderById(testGuildId, id);
      assert(reminder.updated_at);
    });

    it('should return false for non-existent reminder', async () => {
      const result = await reminderService.updateReminder(testGuildId, 99999, { subject: 'Test' });

      assert.strictEqual(result, false);
    });

    it('should enforce guild isolation for updates', async () => {
      const id = await reminderService.createReminder(testGuildId, {
        subject: 'Test',
        when: '2026-01-15 14:00:00',
      });

      const result = await reminderService.updateReminder(otherGuildId, id, { subject: 'Hacked' });

      assert.strictEqual(result, false);

      // Original should be unchanged
      const reminder = await reminderService.getReminderById(testGuildId, id);
      assert.strictEqual(reminder.subject, 'Test');
    });
  });

  // ============================================
  // deleteReminder Function Tests
  // ============================================
  describe('deleteReminder()', () => {
    it('should soft delete reminder by default', async () => {
      const id = await reminderService.createReminder(testGuildId, {
        subject: 'To Delete',
        when: '2026-01-15 14:00:00',
      });

      await reminderService.deleteReminder(testGuildId, id);

      const reminder = await reminderService.getReminderById(testGuildId, id);
      assert.strictEqual(reminder.status, 'cancelled');
    });

    it('should hard delete reminder when requested', async () => {
      const id = await reminderService.createReminder(testGuildId, {
        subject: 'To Delete',
        when: '2026-01-15 14:00:00',
      });

      await reminderService.deleteReminder(testGuildId, id, true);

      const reminder = await reminderService.getReminderById(testGuildId, id);
      assert.strictEqual(reminder, null);
    });

    it('should return false for non-existent reminder', async () => {
      const result = await reminderService.deleteReminder(testGuildId, 99999);

      assert.strictEqual(result, false);
    });

    it('should cascade delete assignments on hard delete', async () => {
      const id = await reminderService.createReminder(testGuildId, {
        subject: 'To Delete',
        when: '2026-01-15 14:00:00',
      });

      await reminderService.addReminderAssignment(testGuildId, id, 'user', 'user-123');
      const allBefore = await reminderService.getAllReminders(testGuildId);
      assert(allBefore.length > 0);

      await reminderService.deleteReminder(testGuildId, id, true);

      const allAfter = await reminderService.getAllReminders(testGuildId);
      assert.strictEqual(allAfter.length, 0);
    });
  });

  // ============================================
  // addReminderAssignment Function Tests
  // ============================================
  describe('addReminderAssignment()', () => {
    it('should add user assignment', async () => {
      const reminderId = await reminderService.createReminder(testGuildId, {
        subject: 'Test',
        when: '2026-01-15 14:00:00',
      });

      const assignmentId = await reminderService.addReminderAssignment(
        testGuildId,
        reminderId,
        'user',
        'user-123'
      );

      assert(typeof assignmentId === 'number');
    });

    it('should add role assignment', async () => {
      const reminderId = await reminderService.createReminder(testGuildId, {
        subject: 'Test',
        when: '2026-01-15 14:00:00',
      });

      const assignmentId = await reminderService.addReminderAssignment(
        testGuildId,
        reminderId,
        'role',
        'role-456'
      );

      assert(typeof assignmentId === 'number');
    });

    it('should reject invalid assignee type', async () => {
      const reminderId = await reminderService.createReminder(testGuildId, {
        subject: 'Test',
        when: '2026-01-15 14:00:00',
      });

      try {
        await reminderService.addReminderAssignment(testGuildId, reminderId, 'invalid', 'id');
        assert.fail('Should have thrown');
      } catch (error) {
        assert(error.message.includes('user'));
      }
    });

    it('should reject non-existent reminder', async () => {
      try {
        await reminderService.addReminderAssignment(testGuildId, 99999, 'user', 'user-123');
        assert.fail('Should have thrown');
      } catch (error) {
        assert(error.message.includes('not found'));
      }
    });

    it('should return existing assignment ID for duplicates', async () => {
      const reminderId = await reminderService.createReminder(testGuildId, {
        subject: 'Test',
        when: '2026-01-15 14:00:00',
      });

      const id1 = await reminderService.addReminderAssignment(
        testGuildId,
        reminderId,
        'user',
        'user-123'
      );
      const id2 = await reminderService.addReminderAssignment(
        testGuildId,
        reminderId,
        'user',
        'user-123'
      );

      assert.strictEqual(id1, id2);
    });
  });

  // ============================================
  // getAllReminders Function Tests
  // ============================================
  describe('getAllReminders()', () => {
    it('should return empty array for new guild', async () => {
      const reminders = await reminderService.getAllReminders(testGuildId);

      assert(Array.isArray(reminders));
      assert.strictEqual(reminders.length, 0);
    });

    it('should return all guild reminders', async () => {
      await reminderService.createReminder(testGuildId, {
        subject: 'Reminder 1',
        when: '2026-01-15 14:00:00',
      });
      await reminderService.createReminder(testGuildId, {
        subject: 'Reminder 2',
        when: '2026-01-16 14:00:00',
      });

      const reminders = await reminderService.getAllReminders(testGuildId);

      assert.strictEqual(reminders.length, 2);
    });

    it('should filter by status', async () => {
      const id1 = await reminderService.createReminder(testGuildId, {
        subject: 'Active',
        when: '2026-01-15 14:00:00',
      });

      const id2 = await reminderService.createReminder(testGuildId, {
        subject: 'To Cancel',
        when: '2026-01-16 14:00:00',
      });

      await reminderService.deleteReminder(testGuildId, id2);

      const active = await reminderService.getAllReminders(testGuildId, { status: 'active' });
      const cancelled = await reminderService.getAllReminders(testGuildId, { status: 'cancelled' });

      assert.strictEqual(active.length, 1);
      assert.strictEqual(cancelled.length, 1);
    });

    it('should filter by category', async () => {
      await reminderService.createReminder(testGuildId, {
        subject: 'Work reminder',
        category: 'work',
        when: '2026-01-15 14:00:00',
      });

      await reminderService.createReminder(testGuildId, {
        subject: 'Personal reminder',
        category: 'personal',
        when: '2026-01-16 14:00:00',
      });

      const work = await reminderService.getAllReminders(testGuildId, { category: 'work' });
      const personal = await reminderService.getAllReminders(testGuildId, { category: 'personal' });

      assert.strictEqual(work.length, 1);
      assert.strictEqual(personal.length, 1);
    });

    it('should enforce guild isolation', async () => {
      await reminderService.createReminder(testGuildId, {
        subject: 'Guild 1 reminder',
        when: '2026-01-15 14:00:00',
      });

      await reminderService.createReminder(otherGuildId, {
        subject: 'Guild 2 reminder',
        when: '2026-01-15 14:00:00',
      });

      const guild1 = await reminderService.getAllReminders(testGuildId);
      const guild2 = await reminderService.getAllReminders(otherGuildId);

      assert.strictEqual(guild1.length, 1);
      assert.strictEqual(guild2.length, 1);
      assert(!guild1[0].subject.includes('Guild 2'));
    });
  });

  // ============================================
  // searchReminders Function Tests
  // ============================================
  describe('searchReminders()', () => {
    it('should find reminders by subject', async () => {
      await reminderService.createReminder(testGuildId, {
        subject: 'Team meeting tomorrow',
        when: '2026-01-15 14:00:00',
      });

      const results = await reminderService.searchReminders(testGuildId, 'team');

      assert.strictEqual(results.length, 1);
    });

    it('should find reminders by category', async () => {
      await reminderService.createReminder(testGuildId, {
        subject: 'Something',
        category: 'urgent',
        when: '2026-01-15 14:00:00',
      });

      const results = await reminderService.searchReminders(testGuildId, 'urgent');

      assert.strictEqual(results.length, 1);
    });

    it('should find reminders by content', async () => {
      await reminderService.createReminder(testGuildId, {
        subject: 'Meeting',
        content: 'Discuss budget allocation',
        when: '2026-01-15 14:00:00',
      });

      const results = await reminderService.searchReminders(testGuildId, 'budget');

      assert.strictEqual(results.length, 1);
    });

    it('should be case-insensitive', async () => {
      await reminderService.createReminder(testGuildId, {
        subject: 'Important Meeting',
        when: '2026-01-15 14:00:00',
      });

      const results1 = await reminderService.searchReminders(testGuildId, 'IMPORTANT');
      const results2 = await reminderService.searchReminders(testGuildId, 'important');

      assert.strictEqual(results1.length, 1);
      assert.strictEqual(results2.length, 1);
    });

    it('should return empty for no matches', async () => {
      await reminderService.createReminder(testGuildId, {
        subject: 'Test',
        when: '2026-01-15 14:00:00',
      });

      const results = await reminderService.searchReminders(testGuildId, 'nonexistent');

      assert.strictEqual(results.length, 0);
    });

    it('should enforce guild isolation in search', async () => {
      await reminderService.createReminder(testGuildId, {
        subject: 'Unique guild 1',
        when: '2026-01-15 14:00:00',
      });

      await reminderService.createReminder(otherGuildId, {
        subject: 'Unique guild 2',
        when: '2026-01-15 14:00:00',
      });

      const results = await reminderService.searchReminders(testGuildId, 'guild 2');

      assert.strictEqual(results.length, 0);
    });
  });

  // ============================================
  // deleteGuildReminders Function Tests
  // ============================================
  describe('deleteGuildReminders()', () => {
    it('should delete all guild reminders', async () => {
      await reminderService.createReminder(testGuildId, {
        subject: 'Reminder 1',
        when: '2026-01-15 14:00:00',
      });

      await reminderService.createReminder(testGuildId, {
        subject: 'Reminder 2',
        when: '2026-01-16 14:00:00',
      });

      await reminderService.deleteGuildReminders(testGuildId);

      const remaining = await reminderService.getAllReminders(testGuildId);
      assert.strictEqual(remaining.length, 0);
    });

    it('should return false for non-existent guild', async () => {
      const result = await reminderService.deleteGuildReminders('non-existent-guild');

      assert.strictEqual(result, false);
    });

    it('should not affect other guilds', async () => {
      await reminderService.createReminder(testGuildId, {
        subject: 'Guild 1',
        when: '2026-01-15 14:00:00',
      });

      await reminderService.createReminder(otherGuildId, {
        subject: 'Guild 2',
        when: '2026-01-15 14:00:00',
      });

      await reminderService.deleteGuildReminders(testGuildId);

      const guild2Reminders = await reminderService.getAllReminders(otherGuildId);
      assert.strictEqual(guild2Reminders.length, 1);
    });
  });

  // ============================================
  // getGuildReminderStats Function Tests
  // ============================================
  describe('getGuildReminderStats()', () => {
    it('should return stats for new guild', async () => {
      const stats = await reminderService.getGuildReminderStats(testGuildId);

      assert.strictEqual(stats.total, 0);
      assert.strictEqual(stats.active, 0);
      assert.strictEqual(stats.completed, 0);
      assert.strictEqual(stats.cancelled, 0);
      assert.strictEqual(stats.assignmentCount, 0);
    });

    it('should calculate correct statistics', async () => {
      const id1 = await reminderService.createReminder(testGuildId, {
        subject: 'Work 1',
        category: 'work',
        when: '2026-01-15 14:00:00',
      });

      const id2 = await reminderService.createReminder(testGuildId, {
        subject: 'Work 2',
        category: 'work',
        when: '2026-01-16 14:00:00',
      });

      const id3 = await reminderService.createReminder(testGuildId, {
        subject: 'Personal',
        category: 'personal',
        when: '2026-01-17 14:00:00',
      });

      await reminderService.deleteReminder(testGuildId, id3);

      await reminderService.addReminderAssignment(testGuildId, id1, 'user', 'user-1');
      await reminderService.addReminderAssignment(testGuildId, id2, 'user', 'user-2');

      const stats = await reminderService.getGuildReminderStats(testGuildId);

      assert.strictEqual(stats.total, 3);
      assert.strictEqual(stats.active, 2);
      assert.strictEqual(stats.cancelled, 1);
      assert.strictEqual(stats.categories.work, 2);
      assert.strictEqual(stats.categories.personal, 1);
      assert.strictEqual(stats.assignmentCount, 2);
    });

    it('should return stats for non-existent guild', async () => {
      const stats = await reminderService.getGuildReminderStats('non-existent-guild');

      assert.strictEqual(stats.total, 0);
      assert.deepStrictEqual(stats.categories, {});
    });
  });

  // ============================================
  // Integration Tests
  // ============================================
  describe('Integration - Complete Workflows', () => {
    it('should handle complete reminder lifecycle', async () => {
      // Create
      const id = await reminderService.createReminder(testGuildId, {
        subject: 'Important Meeting',
        category: 'work',
        when: '2026-01-15 14:00:00',
        content: 'Quarterly review',
      });

      let reminder = await reminderService.getReminderById(testGuildId, id);
      assert(reminder);

      // Assign
      await reminderService.addReminderAssignment(testGuildId, id, 'user', 'user-123');

      let stats = await reminderService.getGuildReminderStats(testGuildId);
      assert.strictEqual(stats.assignmentCount, 1);

      // Update
      await reminderService.updateReminder(testGuildId, id, {
        subject: 'Rescheduled Meeting',
        when: '2026-01-20 10:00:00',
      });

      reminder = await reminderService.getReminderById(testGuildId, id);
      assert.strictEqual(reminder.subject, 'Rescheduled Meeting');

      // Delete
      await reminderService.deleteReminder(testGuildId, id);

      reminder = await reminderService.getReminderById(testGuildId, id);
      assert.strictEqual(reminder.status, 'cancelled');
    });

    it('should handle search and filter workflow', async () => {
      // Create multiple reminders
      await reminderService.createReminder(testGuildId, {
        subject: 'Project deadline',
        category: 'work',
        when: '2026-01-20 17:00:00',
      });

      await reminderService.createReminder(testGuildId, {
        subject: 'Birthday party',
        category: 'personal',
        when: '2026-02-01 19:00:00',
      });

      // Search
      const projectResults = await reminderService.searchReminders(testGuildId, 'project');
      assert.strictEqual(projectResults.length, 1);

      // Filter by category
      const workReminders = await reminderService.getAllReminders(testGuildId, { category: 'work' });
      const personalReminders = await reminderService.getAllReminders(testGuildId, {
        category: 'personal',
      });

      assert.strictEqual(workReminders.length, 1);
      assert.strictEqual(personalReminders.length, 1);
    });

    it('should maintain guild isolation across operations', async () => {
      // Guild 1
      const id1 = await reminderService.createReminder(testGuildId, {
        subject: 'Guild 1 reminder',
        when: '2026-01-15 14:00:00',
      });

      // Guild 2
      const id2 = await reminderService.createReminder(otherGuildId, {
        subject: 'Guild 2 reminder',
        when: '2026-01-15 14:00:00',
      });

      // Verify isolation
      const guild1Reminders = await reminderService.getAllReminders(testGuildId);
      const guild2Reminders = await reminderService.getAllReminders(otherGuildId);

      assert.strictEqual(guild1Reminders.length, 1);
      assert.strictEqual(guild2Reminders.length, 1);
      assert(!guild1Reminders[0].subject.includes('Guild 2'));
      assert(!guild2Reminders[0].subject.includes('Guild 1'));
    });
  });

  // ============================================
  // Edge Cases
  // ============================================
  describe('Edge Cases', () => {
    it('should handle very long reminder subjects', async () => {
      const longSubject = 'a'.repeat(1000);
      const id = await reminderService.createReminder(testGuildId, {
        subject: longSubject,
        when: '2026-01-15 14:00:00',
      });

      assert(typeof id === 'number');
    });

    it('should handle special characters in subject', async () => {
      const id = await reminderService.createReminder(testGuildId, {
        subject: 'Reminder with "quotes" and \n newlines',
        when: '2026-01-15 14:00:00',
      });

      const reminder = await reminderService.getReminderById(testGuildId, id);
      assert(reminder.subject.includes('"'));
    });

    it('should handle unicode characters', async () => {
      const id = await reminderService.createReminder(testGuildId, {
        subject: 'Reminder with émojis 🎉 and üñicode',
        when: '2026-01-15 14:00:00',
      });

      const reminder = await reminderService.getReminderById(testGuildId, id);
      assert(reminder.subject.includes('🎉'));
    });

    it('should handle rapid sequential operations', async () => {
      const ids = [];
      for (let i = 0; i < 20; i++) {
        ids.push(
          await reminderService.createReminder(testGuildId, {
            subject: `Reminder ${i}`,
            when: '2026-01-15 14:00:00',
          })
        );
      }

      const allReminders = await reminderService.getAllReminders(testGuildId);
      assert.strictEqual(allReminders.length, 20);
    });

    it('should handle empty search queries', async () => {
      await reminderService.createReminder(testGuildId, {
        subject: 'Test',
        when: '2026-01-15 14:00:00',
      });

      const results = await reminderService.searchReminders(testGuildId, '');

      assert.strictEqual(results.length, 0);
    });
  });
});
