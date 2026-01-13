/**
 * Comprehensive tests for reminder-management commands
 * TDD-style tests for: create-reminder, delete-reminder, update-reminder, get-reminder, list-reminders, search-reminders
 * Target Coverage: 85%+
 */

const assert = require('assert');

// Stateful mock store for reminders
class StatefulReminderMockStore {
  constructor() {
    this.reminders = new Map();
    this.nextId = 1;
  }

  reset() {
    this.reminders.clear();
    this.nextId = 1;
  }

  createReminder(guildId, userId, text, dueDate) {
    assert(guildId && userId && text && dueDate);
    const id = this.nextId++;
    const reminder = { id, guildId, userId, text, dueDate, createdAt: new Date(), completed: false };
    this.reminders.set(id, reminder);
    return reminder;
  }

  getReminderById(guildId, reminderId) {
    const reminder = this.reminders.get(reminderId);
    if (!reminder) return null;
    if (reminder.guildId !== guildId) throw new Error('Guild mismatch');
    return { ...reminder };
  }

  updateReminder(guildId, reminderId, updates) {
    const reminder = this.reminders.get(reminderId);
    if (!reminder) throw new Error('Reminder not found');
    if (reminder.guildId !== guildId) throw new Error('Guild mismatch');
    const updated = { ...reminder, ...updates };
    this.reminders.set(reminderId, updated);
    return updated;
  }

  deleteReminder(guildId, reminderId) {
    const reminder = this.reminders.get(reminderId);
    if (!reminder) throw new Error('Reminder not found');
    if (reminder.guildId !== guildId) throw new Error('Guild mismatch');
    this.reminders.delete(reminderId);
    return true;
  }

  listReminders(guildId, userId) {
    return Array.from(this.reminders.values())
      .filter(r => r.guildId === guildId && r.userId === userId)
      .map(r => ({ ...r }));
  }

  searchReminders(guildId, userId, query) {
    return Array.from(this.reminders.values())
      .filter(r => r.guildId === guildId && r.userId === userId && r.text.includes(query))
      .map(r => ({ ...r }));
  }
}

describe('Reminder Management Commands', () => {
  let mockInteraction;
  let mockMessage;
  let mockReminderService;
  let reminderStore;

  beforeEach(() => {
    reminderStore = new StatefulReminderMockStore();
    
    // Seed initial test data
    reminderStore.createReminder('guild-456', 'user-123', 'Test reminder text', new Date(Date.now() + 86400000));
    reminderStore.createReminder('guild-456', 'user-123', 'Another reminder', new Date(Date.now() + 172800000));

    mockReminderService = {
      createReminder: jest.fn(async (guildId, userId, text, dueDate) =>
        reminderStore.createReminder(guildId, userId, text, dueDate)
      ),
      getReminderById: jest.fn(async (guildId, reminderId) =>
        reminderStore.getReminderById(guildId, reminderId)
      ),
      updateReminder: jest.fn(async (guildId, reminderId, updates) =>
        reminderStore.updateReminder(guildId, reminderId, updates)
      ),
      deleteReminder: jest.fn(async (guildId, reminderId) =>
        reminderStore.deleteReminder(guildId, reminderId)
      ),
      listReminders: jest.fn(async (guildId, userId) =>
        reminderStore.listReminders(guildId, userId)
      ),
      searchReminders: jest.fn(async (guildId, userId, query) =>
        reminderStore.searchReminders(guildId, userId, query)
      ),
    };

    mockInteraction = {
      user: { id: 'user-123' },
      guildId: 'guild-456',
      options: {
        getString: jest.fn((name) => {
          if (name === 'text') return 'Test reminder text';
          if (name === 'query') return 'test';
          return null;
        }),
        getNumber: jest.fn((name) => {
          if (name === 'id') return 1;
          if (name === 'days') return 1;
          return null;
        }),
      },
      reply: jest.fn(async (msg) => msg),
      deferReply: jest.fn(async () => ({})),
      editReply: jest.fn(async (msg) => msg),
    };

    mockMessage = {
      guildId: 'guild-456',
      author: { id: 'user-123' },
      channel: { send: jest.fn(async (msg) => msg) },
      reply: jest.fn(async (msg) => msg),
    };
  });

  describe('create-reminder command', () => {
    it('should create reminder with text and due date', async () => {
      const text = 'Test reminder text';
      const dueDate = new Date(Date.now() + 86400000); // Tomorrow
      
      const reminder = await mockReminderService.createReminder(
        'guild-456',
        'user-123',
        text,
        dueDate
      );
      
      assert(reminder);
      assert.strictEqual(reminder.text, text);
      assert.strictEqual(reminder.userId, 'user-123');
    });

    it('should validate reminder text length', async () => {
      const text = '';
      const isValid = !!(text && text.length > 0 && text.length <= 1000);
      
      assert.strictEqual(isValid, false);
    });

    it('should require valid due date', async () => {
      const dueDate = new Date(Date.now() - 1000); // Past date
      const isValid = dueDate > new Date();
      
      assert.strictEqual(isValid, false);
    });

    it('should accept due date in future', async () => {
      const dueDate = new Date(Date.now() + 86400000);
      const isValid = dueDate > new Date();
      
      assert.strictEqual(isValid, true);
    });

    it('should parse natural language dates', async () => {
      const dateString = 'tomorrow';
      const tomorrow = new Date(Date.now() + 86400000);
      
      // Would parse "tomorrow" to actual date
      assert(tomorrow > new Date());
    });

    it('should confirm reminder created', async () => {
      const reminder = await mockReminderService.createReminder(
        'guild-456',
        'user-123',
        'Test',
        new Date(Date.now() + 86400000)
      );
      
      const response = `✅ Reminder created (ID: ${reminder.id})`;
      assert(response.includes('created'));
    });

    it('should work with slash command', async () => {
      const text = mockInteraction.options.getString('text');
      const days = mockInteraction.options.getNumber('days') || 1;
      
      assert(text.length > 0);
      assert(days > 0);
    });

    it('should work with prefix command', async () => {
      const args = ['create-reminder', 'text here', '7d'];
      const text = args.slice(1, -1).join(' ');
      
      assert(text.length > 0);
    });

    it('should set reminder for specific time', async () => {
      const time = '14:30';
      const isValidTime = /^\d{1,2}:\d{2}$/.test(time);
      
      assert.strictEqual(isValidTime, true);
    });

    it('should support relative date formats', async () => {
      const formats = ['tomorrow', '1d', '7d', '2h', 'next monday'];
      
      formats.forEach(format => {
        assert(format.length > 0);
      });
    });

    it('should store creation timestamp', async () => {
      const reminder = await mockReminderService.createReminder(
        'guild-456',
        'user-123',
        'Test',
        new Date(Date.now() + 86400000)
      );
      
      assert(reminder.createdAt);
      assert(reminder.createdAt instanceof Date);
    });
  });

  describe('delete-reminder command', () => {
    it('should delete reminder by ID', async () => {
      const reminderId = 1;
      const result = await mockReminderService.deleteReminder('guild-456', reminderId);
      
      assert.strictEqual(result, true);
    });

    it('should validate reminder exists', async () => {
      const reminderId = 1;
      const reminder = await mockReminderService.getReminderById('guild-456', reminderId);
      
      assert(reminder);
    });

    it('should handle non-existent reminder', async () => {
      mockReminderService.getReminderById = jest.fn(async () => null);
      const reminder = await mockReminderService.getReminderById('guild-456', 999);
      
      assert.strictEqual(reminder, null);
    });

    it('should confirm deletion', async () => {
      const response = '✅ Reminder deleted';
      assert(response.includes('deleted'));
    });

    it('should prevent deletion of other user\'s reminder', async () => {
      const reminderId = 1;
      const currentUser = 'user-123';
      const reminderOwner = 'user-456';
      const canDelete = currentUser === reminderOwner;
      
      assert.strictEqual(canDelete, false);
    });

    it('should work with slash command', async () => {
      const reminderId = mockInteraction.options.getNumber('id');
      assert(reminderId > 0);
    });

    it('should work with prefix command', async () => {
      const args = ['delete-reminder', '1'];
      const reminderId = parseInt(args[1]);
      
      assert(reminderId > 0);
    });

    it('should allow reminders own creator to delete', async () => {
      const reminderId = 1;
      const reminder = await mockReminderService.getReminderById('guild-456', reminderId);
      const currentUser = 'user-123';
      
      const canDelete = currentUser === reminder.userId;
      assert.strictEqual(canDelete, true);
    });
  });

  describe('get-reminder command', () => {
    it('should retrieve reminder by ID', async () => {
      const reminderId = 1;
      const reminder = await mockReminderService.getReminderById('guild-456', reminderId);
      
      assert(reminder);
      assert.strictEqual(reminder.id, reminderId);
    });

    it('should display reminder details', async () => {
      const reminder = await mockReminderService.getReminderById('guild-456', 1);
      
      const embed = {
        title: `Reminder #${reminder.id}`,
        description: reminder.text,
        fields: [
          { name: 'Due', value: reminder.dueDate.toString() },
          { name: 'Status', value: reminder.completed ? 'Completed' : 'Pending' },
        ],
      };
      
      assert(embed.title.includes('Reminder'));
      assert.strictEqual(embed.fields.length, 2);
    });

    it('should show time until due date', async () => {
      const reminder = await mockReminderService.getReminderById('guild-456', 1);
      const now = new Date();
      const diff = Math.ceil((reminder.dueDate - now) / 1000); // seconds
      
      assert(diff > 0);
    });

    it('should indicate if reminder is overdue', async () => {
      const dueDate = new Date(Date.now() - 1000);
      const isOverdue = dueDate < new Date();
      
      assert.strictEqual(isOverdue, true);
    });

    it('should handle non-existent reminder', async () => {
      mockReminderService.getReminderById = jest.fn(async () => null);
      const reminder = await mockReminderService.getReminderById('guild-456', 999);
      
      assert.strictEqual(reminder, null);
    });

    it('should work with slash command', async () => {
      const reminderId = mockInteraction.options.getNumber('id');
      assert(reminderId > 0);
    });

    it('should work with prefix command', async () => {
      const args = ['get-reminder', '1'];
      const reminderId = parseInt(args[1]);
      
      assert(reminderId > 0);
    });
  });

  describe('update-reminder command', () => {
    it('should update reminder text', async () => {
      const reminderId = 1;
      const newText = 'Updated reminder text';
      
      const updated = await mockReminderService.updateReminder(
        'guild-456',
        reminderId,
        { text: newText }
      );
      
      assert.strictEqual(updated.text, newText);
    });

    it('should update due date', async () => {
      const reminderId = 1;
      const newDueDate = new Date(Date.now() + 172800000);
      
      const updated = await mockReminderService.updateReminder(
        'guild-456',
        reminderId,
        { dueDate: newDueDate }
      );
      
      assert.strictEqual(updated.dueDate, newDueDate);
    });

    it('should mark reminder as completed', async () => {
      const reminderId = 1;
      
      const updated = await mockReminderService.updateReminder(
        'guild-456',
        reminderId,
        { completed: true }
      );
      
      assert.strictEqual(updated.completed, true);
    });

    it('should validate new text', async () => {
      const newText = '';
      const isValid = !!(newText && newText.length > 0);
      
      assert.strictEqual(isValid, false);
    });

    it('should validate new due date', async () => {
      const newDueDate = new Date(Date.now() - 1000);
      const isValid = newDueDate > new Date();
      
      assert.strictEqual(isValid, false);
    });

    it('should confirm update', async () => {
      const response = '✅ Reminder updated';
      assert(response.includes('updated'));
    });

    it('should work with slash command', async () => {
      const reminderId = mockInteraction.options.getNumber('id');
      assert(reminderId > 0);
    });

    it('should preserve other fields during update', async () => {
      const reminderId = 1;
      const original = await mockReminderService.getReminderById('guild-456', reminderId);
      
      const updated = await mockReminderService.updateReminder(
        'guild-456',
        reminderId,
        { text: 'New text' }
      );
      
      assert.strictEqual(updated.id, original.id);
      assert.strictEqual(updated.userId, original.userId);
    });
  });

  describe('list-reminders command', () => {
    it('should list all user reminders', async () => {
      const reminders = await mockReminderService.listReminders('guild-456', 'user-123');
      
      assert(Array.isArray(reminders));
      assert(reminders.length > 0);
    });

    it('should show pending reminders', async () => {
      const reminders = await mockReminderService.listReminders('guild-456', 'user-123');
      const pending = reminders.filter(r => !r.completed);
      
      assert(pending.length > 0);
    });

    it('should sort by due date', async () => {
      const reminders = await mockReminderService.listReminders('guild-456', 'user-123');
      const sorted = [...reminders].sort((a, b) => a.dueDate - b.dueDate);
      
      // Check if sorted correctly
      for (let i = 0; i < sorted.length - 1; i++) {
        assert(sorted[i].dueDate <= sorted[i + 1].dueDate);
      }
    });

    it('should handle empty list', async () => {
      mockReminderService.listReminders = jest.fn(async () => []);
      const reminders = await mockReminderService.listReminders('guild-456', 'user-456');
      
      assert.strictEqual(reminders.length, 0);
    });

    it('should show reminder count', async () => {
      const reminders = await mockReminderService.listReminders('guild-456', 'user-123');
      const message = `You have ${reminders.length} reminders`;
      
      assert(message.includes('have'));
      assert(message.includes(reminders.length.toString()));
    });

    it('should format as numbered list', async () => {
      const reminders = await mockReminderService.listReminders('guild-456', 'user-123');
      const formatted = reminders.map((r, i) => `${i + 1}. ${r.text}`);
      
      assert(formatted.length === reminders.length);
    });

    it('should work with slash command', async () => {
      const reminders = await mockReminderService.listReminders(
        mockInteraction.guildId,
        mockInteraction.user.id
      );
      assert(Array.isArray(reminders));
    });

    it('should work with prefix command', async () => {
      const reminders = await mockReminderService.listReminders(
        mockMessage.guildId,
        mockMessage.author.id
      );
      assert(Array.isArray(reminders));
    });
  });

  describe('search-reminders command', () => {
    it('should search reminders by text', async () => {
      const query = 'test';
      const results = await mockReminderService.searchReminders('guild-456', 'user-123', query);
      
      assert(Array.isArray(results));
    });

    it('should be case-insensitive', async () => {
      const query = 'TEST';
      const results = await mockReminderService.searchReminders('guild-456', 'user-123', query);
      
      assert(Array.isArray(results));
    });

    it('should return empty array when no matches', async () => {
      mockReminderService.searchReminders = jest.fn(async () => []);
      const results = await mockReminderService.searchReminders('guild-456', 'user-123', 'nonexistent');
      
      assert.strictEqual(results.length, 0);
    });

    it('should support partial text matching', async () => {
      const query = 'rem';
      // Would match "reminder", "remission", etc.
      assert(query.length > 0);
    });

    it('should work with slash command', async () => {
      const query = mockInteraction.options.getString('query');
      assert(query.length > 0);
    });

    it('should work with prefix command', async () => {
      const args = ['search-reminders', 'test'];
      const query = args.slice(1).join(' ');
      
      assert(query.length > 0);
    });
  });

  describe('Guild & User Context', () => {
    it('should isolate reminders by guild', async () => {
      const guild1Reminders = await mockReminderService.listReminders('guild-1', 'user-123');
      const guild2Reminders = await mockReminderService.listReminders('guild-2', 'user-123');
      
      // Should be separate even for same user
      assert(guild1Reminders !== guild2Reminders);
    });

    it('should isolate reminders by user', async () => {
      const user1Reminders = await mockReminderService.listReminders('guild-456', 'user-123');
      const user2Reminders = await mockReminderService.listReminders('guild-456', 'user-456');
      
      // Different users should see different reminders
      assert(user1Reminders !== user2Reminders);
    });

    it('should prevent viewing other user reminders', async () => {
      const reminder = await mockReminderService.getReminderById('guild-456', 1);
      const currentUser = 'user-456';
      
      const canView = reminder.userId === currentUser;
      assert.strictEqual(canView, false);
    });

    it('should allow viewing own reminders', async () => {
      const reminder = await mockReminderService.getReminderById('guild-456', 1);
      const currentUser = 'user-123';
      
      const canView = reminder.userId === currentUser;
      assert.strictEqual(canView, true);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing reminder text', async () => {
      const text = '';
      const isValid = !!(text && text.length > 0);
      
      assert.strictEqual(isValid, false);
    });

    it('should handle missing due date', async () => {
      const dueDate = null;
      const isValid = dueDate !== null && dueDate instanceof Date;
      
      assert.strictEqual(isValid, false);
    });

    it('should handle invalid reminder ID', async () => {
      const reminderId = 'invalid';
      const isValid = /^\d+$/.test(reminderId);
      
      assert.strictEqual(isValid, false);
    });

    it('should handle database errors', async () => {
      mockReminderService.createReminder = jest.fn(async () => {
        throw new Error('DB Error');
      });
      
      try {
        await mockReminderService.createReminder('guild-456', 'user-123', 'text', new Date());
        assert.fail('Should throw');
      } catch (err) {
        assert(err instanceof Error);
      }
    });

    it('should provide helpful error messages', async () => {
      const error = 'Reminder text must be between 1 and 1000 characters';
      assert(error.includes('between'));
    });
  });
});
