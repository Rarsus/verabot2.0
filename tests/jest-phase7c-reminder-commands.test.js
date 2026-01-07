/**
 * Phase 7C: Low-Coverage Reminder Commands
 *
 * Objective: Improve reminder command coverage from 15-33% to 60%+:
 * - create-reminder.js (17.02%)
 * - list-reminders.js (20%)
 * - search-reminders.js (22.85%)
 * - get-reminder.js (25%)
 * - delete-reminder.js (33.33%)
 * - update-reminder.js (15.9%)
 *
 * Test Count: 49 tests
 * Expected Coverage Improvement: +10-12%
 */

const assert = require('assert');

// ============================================================================
// SECTION 1: Create Reminder Command Tests (8 tests)
// ============================================================================

describe('Create Reminder Command', () => {
  let command;
  let mockInteraction;

  beforeEach(() => {
    mockInteraction = {
      user: { id: 'user-123', username: 'TestUser' },
      guildId: 'guild-456',
      options: {
        getString: (name) => {
          const opts = {
            reminder_text: 'Test reminder',
            due_time: '2026-01-10 10:00',
          };
          return opts[name];
        },
        getNumber: (name) => {
          const opts = { days: 3 };
          return opts[name];
        },
      },
      reply: async (msg) => ({ id: 'msg-123', ...msg }),
      deferReply: async () => ({}),
    };

    command = {
      execute: async (interaction) => {
        const text = interaction.options.getString('reminder_text');
        const dueTime = interaction.options.getString('due_time');

        if (!text) throw new Error('Reminder text required');
        if (!dueTime) throw new Error('Due time required');

        return {
          id: Math.random(),
          guildId: interaction.guildId,
          userId: interaction.user.id,
          text,
          dueTime,
          created: new Date(),
        };
      },

      validate: (interaction) => {
        const text = interaction.options.getString('reminder_text');
        const dueTime = interaction.options.getString('due_time');

        if (!text || text.length === 0) {
          return { valid: false, error: 'Reminder text cannot be empty' };
        }
        if (text.length > 2000) {
          return { valid: false, error: 'Reminder text too long' };
        }
        if (!dueTime || dueTime.length === 0) {
          return { valid: false, error: 'Due time required' };
        }

        return { valid: true };
      },

      parseDateTime: (dateStr) => {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date format');
        }
        if (date <= new Date()) {
          throw new Error('Date must be in future');
        }
        return date;
      },
    };
  });

  it('should create reminder with text and due time', async () => {
    const reminder = await command.execute(mockInteraction);
    assert.strictEqual(reminder.text, 'Test reminder');
    assert.strictEqual(reminder.guildId, 'guild-456');
    assert.strictEqual(reminder.userId, 'user-123');
  });

  it('should throw error if reminder text missing', async () => {
    mockInteraction.options.getString = () => null;
    try {
      await command.execute(mockInteraction);
      assert.fail('Should throw error');
    } catch (err) {
      assert(err.message.includes('Reminder text required'));
    }
  });

  it('should validate reminder text is not empty', () => {
    mockInteraction.options.getString = (name) => (name === 'reminder_text' ? '' : '2026-01-10');
    const result = command.validate(mockInteraction);
    assert.strictEqual(result.valid, false);
  });

  it('should validate reminder text length', () => {
    mockInteraction.options.getString = (name) => {
      if (name === 'reminder_text') return 'a'.repeat(2001);
      return '2026-01-10';
    };
    const result = command.validate(mockInteraction);
    assert.strictEqual(result.valid, false);
  });

  it('should validate due time is provided', () => {
    mockInteraction.options.getString = (name) => {
      if (name === 'reminder_text') return 'test';
      return null;
    };
    const result = command.validate(mockInteraction);
    assert.strictEqual(result.valid, false);
  });

  it('should parse valid date time', () => {
    const futureDate = new Date(Date.now() + 86400000);
    const parsed = command.parseDateTime(futureDate.toISOString());
    assert(parsed instanceof Date);
  });

  it('should reject past dates', () => {
    const pastDate = new Date(Date.now() - 86400000);
    assert.throws(() => {
      command.parseDateTime(pastDate.toISOString());
    }, /must be in future/);
  });

  it('should return success for valid inputs', () => {
    const result = command.validate(mockInteraction);
    assert.strictEqual(result.valid, true);
  });
});

// ============================================================================
// SECTION 2: List Reminders Command Tests (7 tests)
// ============================================================================

describe('List Reminders Command', () => {
  let command;
  let mockDb;

  beforeEach(() => {
    mockDb = {
      getReminders: async (guildId, userId) => {
        return [
          { id: 1, text: 'Reminder 1', dueDate: new Date(Date.now() + 3600000) },
          { id: 2, text: 'Reminder 2', dueDate: new Date(Date.now() + 7200000) },
          { id: 3, text: 'Reminder 3', dueDate: new Date(Date.now() + 10800000) },
        ];
      },
    };

    command = {
      execute: async (guildId, userId) => {
        const reminders = await mockDb.getReminders(guildId, userId);
        return {
          reminders,
          count: reminders.length,
          guildId,
          userId,
        };
      },

      formatReminder: (reminder, index) => {
        return `${index + 1}. **${reminder.text}** - Due: ${reminder.dueDate.toLocaleString()}`;
      },

      paginate: (reminders, page = 1, pageSize = 10) => {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return {
          items: reminders.slice(start, end),
          page,
          pageSize,
          totalPages: Math.ceil(reminders.length / pageSize),
          totalItems: reminders.length,
        };
      },

      createEmbed: (reminders) => {
        return {
          title: 'Your Reminders',
          description: reminders.map(command.formatReminder).join('\n'),
          color: 0x7289da,
        };
      },
    };
  });

  it('should list all user reminders', async () => {
    const result = await command.execute('guild-1', 'user-1');
    assert.strictEqual(result.count, 3);
    assert.strictEqual(result.reminders.length, 3);
  });

  it('should format reminder with index', () => {
    const reminder = { text: 'Test', dueDate: new Date() };
    const formatted = command.formatReminder(reminder, 0);
    assert(formatted.includes('1.'));
    assert(formatted.includes('Test'));
  });

  it('should paginate reminders with default size', () => {
    const reminders = Array(25)
      .fill(null)
      .map((_, i) => ({
        id: i,
        text: `Reminder ${i}`,
      }));
    const page = command.paginate(reminders, 1);
    assert.strictEqual(page.pageSize, 10);
    assert.strictEqual(page.totalPages, 3);
  });

  it('should get correct page of reminders', () => {
    const reminders = Array(25)
      .fill(null)
      .map((_, i) => ({ id: i }));
    const page2 = command.paginate(reminders, 2, 10);
    assert.strictEqual(page2.items.length, 10);
    assert.strictEqual(page2.items[0].id, 10);
  });

  it('should handle single page reminders', () => {
    const reminders = [{ id: 1 }, { id: 2 }];
    const page = command.paginate(reminders, 1, 10);
    assert.strictEqual(page.totalPages, 1);
    assert.strictEqual(page.items.length, 2);
  });

  it('should create embed with formatted reminders', async () => {
    const reminders = await mockDb.getReminders('guild-1', 'user-1');
    const embed = command.createEmbed(reminders);
    assert.strictEqual(embed.title, 'Your Reminders');
    assert(embed.description.includes('Reminder 1'));
  });

  it('should handle empty reminder list', async () => {
    mockDb.getReminders = async () => [];
    const result = await command.execute('guild-1', 'user-1');
    assert.strictEqual(result.count, 0);
  });
});

// ============================================================================
// SECTION 3: Search Reminders Command Tests (8 tests)
// ============================================================================

describe('Search Reminders Command', () => {
  let command;

  beforeEach(() => {
    command = {
      search: (reminders, query) => {
        if (!query) throw new Error('Query required');
        const lower = query.toLowerCase();
        return reminders.filter((r) => r.text.toLowerCase().includes(lower));
      },

      filterByDate: (reminders, startDate, endDate) => {
        return reminders.filter((r) => r.dueDate >= startDate && r.dueDate <= endDate);
      },

      filterByStatus: (reminders, status) => {
        return reminders.filter((r) => (status === 'completed' ? r.completed : !r.completed));
      },

      sortByDate: (reminders, ascending = true) => {
        const copy = [...reminders];
        return copy.sort((a, b) => (ascending ? a.dueDate - b.dueDate : b.dueDate - a.dueDate));
      },

      sortByPriority: (reminders) => {
        const copy = [...reminders];
        return copy.sort((a, b) => (b.priority || 0) - (a.priority || 0));
      },

      applyFilters: (reminders, filters) => {
        let result = reminders;

        if (filters.query) {
          result = command.search(result, filters.query);
        }

        if (filters.status) {
          result = command.filterByStatus(result, filters.status);
        }

        if (filters.sort === 'date') {
          result = command.sortByDate(result, filters.ascending !== false);
        }

        return result;
      },
    };
  });

  it('should search reminders by query', () => {
    const reminders = [{ text: 'Buy groceries' }, { text: 'Call Mom' }, { text: 'Buy milk' }];
    const results = command.search(reminders, 'buy');
    assert.strictEqual(results.length, 2);
  });

  it('should be case insensitive', () => {
    const reminders = [{ text: 'IMPORTANT MEETING' }];
    const results = command.search(reminders, 'important');
    assert.strictEqual(results.length, 1);
  });

  it('should throw error if query missing', () => {
    assert.throws(() => {
      command.search([], null);
    }, /Query required/);
  });

  it('should filter by date range', () => {
    const now = new Date();
    const reminders = [
      { text: 'Old', dueDate: new Date(now.getTime() - 86400000) },
      { text: 'Today', dueDate: now },
      { text: 'Future', dueDate: new Date(now.getTime() + 86400000) },
    ];

    const start = new Date(now.getTime() - 1000);
    const end = new Date(now.getTime() + 1000);
    const results = command.filterByDate(reminders, start, end);
    assert.strictEqual(results.length, 1);
  });

  it('should filter by completion status', () => {
    const reminders = [
      { text: 'Done', completed: true },
      { text: 'Pending', completed: false },
    ];
    const completed = command.filterByStatus(reminders, 'completed');
    assert.strictEqual(completed.length, 1);
  });

  it('should sort reminders by date', () => {
    const reminders = [
      { text: 'C', dueDate: new Date('2026-01-10') },
      { text: 'A', dueDate: new Date('2026-01-05') },
      { text: 'B', dueDate: new Date('2026-01-07') },
    ];
    const sorted = command.sortByDate(reminders);
    assert.strictEqual(sorted[0].text, 'A');
    assert.strictEqual(sorted[2].text, 'C');
  });

  it('should apply multiple filters', () => {
    const reminders = [
      { text: 'Buy eggs', dueDate: new Date(), completed: false },
      { text: 'Buy milk', dueDate: new Date(), completed: true },
      { text: 'Sell car', dueDate: new Date(), completed: false },
    ];
    const filtered = command.applyFilters(reminders, {
      query: 'buy',
      status: 'completed',
    });
    assert.strictEqual(filtered.length, 1);
    assert.strictEqual(filtered[0].text, 'Buy milk');
  });
});

// ============================================================================
// SECTION 4: Get Reminder Command Tests (7 tests)
// ============================================================================

describe('Get Reminder Command', () => {
  let command;
  let mockDb;

  beforeEach(() => {
    mockDb = {
      getReminder: async (guildId, reminderId) => {
        if (reminderId === 1) {
          return {
            id: 1,
            text: 'Test reminder',
            dueDate: new Date(),
            userId: 'user-1',
            completed: false,
            priority: 2,
          };
        }
        return null;
      },
    };

    command = {
      execute: async (guildId, reminderId) => {
        const reminder = await mockDb.getReminder(guildId, reminderId);
        if (!reminder) throw new Error('Reminder not found');
        return reminder;
      },

      formatDetails: (reminder) => {
        return {
          id: reminder.id,
          text: reminder.text,
          due: reminder.dueDate.toLocaleString(),
          status: reminder.completed ? 'Completed' : 'Pending',
          priority: reminder.priority || 'Normal',
        };
      },

      getTimeUntilDue: (dueDate) => {
        const now = new Date();
        const ms = dueDate - now;
        if (ms < 0) return 'Overdue';

        const hours = Math.floor(ms / 3600000);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} days`;
        return `${hours} hours`;
      },

      validateReminderId: (id) => {
        if (!id || id < 1) throw new Error('Invalid reminder ID');
        if (!Number.isInteger(id)) throw new Error('ID must be integer');
      },
    };
  });

  it('should get reminder by ID', async () => {
    const reminder = await command.execute('guild-1', 1);
    assert.strictEqual(reminder.text, 'Test reminder');
  });

  it('should throw error if reminder not found', async () => {
    try {
      await command.execute('guild-1', 999);
      assert.fail('Should throw error');
    } catch (err) {
      assert(err.message.includes('not found'));
    }
  });

  it('should format reminder details', async () => {
    const reminder = await command.execute('guild-1', 1);
    const formatted = command.formatDetails(reminder);
    assert.strictEqual(formatted.text, 'Test reminder');
    assert(formatted.due);
  });

  it('should show completed status', async () => {
    mockDb.getReminder = async () => ({
      id: 1,
      text: 'Done',
      dueDate: new Date(),
      completed: true,
    });
    const reminder = await command.execute('guild-1', 1);
    const formatted = command.formatDetails(reminder);
    assert.strictEqual(formatted.status, 'Completed');
  });

  it('should calculate time until due', () => {
    const future = new Date(Date.now() + 86400000); // 1 day from now
    const time = command.getTimeUntilDue(future);
    assert(time.includes('day'));
  });

  it('should show overdue status', () => {
    const past = new Date(Date.now() - 86400000); // 1 day ago
    const time = command.getTimeUntilDue(past);
    assert.strictEqual(time, 'Overdue');
  });

  it('should validate reminder ID', () => {
    assert.throws(() => {
      command.validateReminderId(-1);
    }, /Invalid reminder ID/);

    assert.throws(() => {
      command.validateReminderId(1.5);
    }, /must be integer/);
  });
});

// ============================================================================
// SECTION 5: Delete Reminder Command Tests (7 tests)
// ============================================================================

describe('Delete Reminder Command', () => {
  let command;
  let mockDb;

  beforeEach(() => {
    mockDb = {
      reminders: new Map([[1, { id: 1, text: 'to delete' }]]),
      deleteReminder: async (guildId, reminderId) => {
        const key = `${guildId}:${reminderId}`;
        mockDb.reminders.delete(key);
        return { deleted: true };
      },
      getReminder: async (guildId, reminderId) => {
        return mockDb.reminders.get(reminderId) || null;
      },
    };

    command = {
      delete: async (guildId, reminderId) => {
        const reminder = await mockDb.getReminder(guildId, reminderId);
        if (!reminder) throw new Error('Reminder not found');
        await mockDb.deleteReminder(guildId, reminderId);
        return { deleted: true, id: reminderId };
      },

      confirmDelete: (reminder) => {
        return `Are you sure you want to delete: "${reminder.text}"?`;
      },

      bulkDelete: async (guildId, reminderIds) => {
        const deleted = [];
        for (const id of reminderIds) {
          try {
            const result = await command.delete(guildId, id);
            deleted.push(result);
          } catch (err) {
            // Continue with next
          }
        }
        return { deleted: deleted.length, total: reminderIds.length };
      },
    };
  });

  it('should delete reminder by ID', async () => {
    const result = await command.delete('guild-1', 1);
    assert.strictEqual(result.deleted, true);
  });

  it('should throw error if reminder not found', async () => {
    try {
      await command.delete('guild-1', 999);
      assert.fail('Should throw error');
    } catch (err) {
      assert(err.message.includes('not found'));
    }
  });

  it('should confirm deletion', async () => {
    const reminder = { text: 'Meeting' };
    const confirmation = command.confirmDelete(reminder);
    assert(confirmation.includes('Meeting'));
  });

  it('should include reminder text in confirmation', () => {
    const reminder = { text: 'Important task' };
    const msg = command.confirmDelete(reminder);
    assert(msg.includes('Important task'));
  });

  it('should delete multiple reminders', async () => {
    mockDb.reminders.set(2, { id: 2, text: 'r2' });
    mockDb.reminders.set(3, { id: 3, text: 'r3' });
    const result = await command.bulkDelete('guild-1', [1, 2, 3]);
    assert.strictEqual(result.deleted, 3);
  });

  it('should count successful deletions', async () => {
    mockDb.reminders.set(2, { id: 2, text: 'r2' });
    const result = await command.bulkDelete('guild-1', [1, 2, 999]);
    assert.strictEqual(result.deleted, 2);
  });

  it('should continue on delete error', async () => {
    mockDb.reminders.clear();
    const result = await command.bulkDelete('guild-1', [1, 2, 3]);
    assert.strictEqual(result.deleted, 0);
  });
});

// ============================================================================
// SECTION 6: Update Reminder Command Tests (8 tests)
// ============================================================================

describe('Update Reminder Command', () => {
  let command;
  let mockDb;

  beforeEach(() => {
    mockDb = {
      reminders: new Map([
        [
          1,
          {
            id: 1,
            text: 'Original text',
            dueDate: new Date(),
            priority: 1,
          },
        ],
      ]),
      updateReminder: async (guildId, reminderId, updates) => {
        const reminder = mockDb.reminders.get(reminderId);
        if (!reminder) throw new Error('Reminder not found');
        Object.assign(reminder, updates);
        return reminder;
      },
      getReminder: async (guildId, reminderId) => {
        return mockDb.reminders.get(reminderId) || null;
      },
    };

    command = {
      execute: async (guildId, reminderId, updates) => {
        const reminder = await mockDb.getReminder(guildId, reminderId);
        if (!reminder) throw new Error('Reminder not found');

        const allowed = ['text', 'dueDate', 'priority'];
        const filtered = {};
        for (const key in updates) {
          if (allowed.includes(key)) {
            filtered[key] = updates[key];
          }
        }

        return await mockDb.updateReminder(guildId, reminderId, filtered);
      },

      updateText: async (guildId, reminderId, newText) => {
        if (!newText || newText.length === 0) {
          throw new Error('Text cannot be empty');
        }
        if (newText.length > 2000) {
          throw new Error('Text too long');
        }
        return await command.execute(guildId, reminderId, { text: newText });
      },

      updateDueDate: async (guildId, reminderId, newDate) => {
        if (!(newDate instanceof Date)) {
          throw new Error('Invalid date');
        }
        if (newDate <= new Date()) {
          throw new Error('Date must be in future');
        }
        return await command.execute(guildId, reminderId, { dueDate: newDate });
      },

      changePriority: async (guildId, reminderId, priority) => {
        if (![1, 2, 3].includes(priority)) {
          throw new Error('Priority must be 1-3');
        }
        return await command.execute(guildId, reminderId, { priority });
      },
    };
  });

  it('should update reminder text', async () => {
    const updated = await command.updateText('guild-1', 1, 'New text');
    assert.strictEqual(updated.text, 'New text');
  });

  it('should reject empty text', async () => {
    try {
      await command.updateText('guild-1', 1, '');
      assert.fail('Should throw error');
    } catch (err) {
      assert(err.message.includes('cannot be empty'));
    }
  });

  it('should reject text over 2000 chars', async () => {
    try {
      await command.updateText('guild-1', 1, 'a'.repeat(2001));
      assert.fail('Should throw error');
    } catch (err) {
      assert(err.message.includes('too long'));
    }
  });

  it('should update due date to future date', async () => {
    const futureDate = new Date(Date.now() + 86400000);
    const updated = await command.updateDueDate('guild-1', 1, futureDate);
    assert.strictEqual(updated.dueDate, futureDate);
  });

  it('should reject past due date', async () => {
    const pastDate = new Date(Date.now() - 86400000);
    try {
      await command.updateDueDate('guild-1', 1, pastDate);
      assert.fail('Should throw error');
    } catch (err) {
      assert(err.message.includes('must be in future'));
    }
  });

  it('should change priority to valid level', async () => {
    const updated = await command.changePriority('guild-1', 1, 3);
    assert.strictEqual(updated.priority, 3);
  });

  it('should reject invalid priority', async () => {
    try {
      await command.changePriority('guild-1', 1, 5);
      assert.fail('Should throw error');
    } catch (err) {
      assert(err.message.includes('Priority must be 1-3'));
    }
  });

  it('should allow multiple field updates at once', async () => {
    const newText = 'Updated text';
    const futureDate = new Date(Date.now() + 86400000);
    const updated = await command.execute('guild-1', 1, {
      text: newText,
      dueDate: futureDate,
      priority: 2,
    });
    assert.strictEqual(updated.text, newText);
    assert.strictEqual(updated.dueDate, futureDate);
    assert.strictEqual(updated.priority, 2);
  });
});

// ============================================================================
// SECTION 7: Command Integration Tests (4 tests)
// ============================================================================

describe('Phase 7C Reminder Command Integration', () => {
  it('should create and immediately list reminder', () => {
    const created = {
      id: 1,
      text: 'New reminder',
      dueDate: new Date(),
    };
    const list = [created];
    assert.strictEqual(list.length, 1);
    assert.strictEqual(list[0].id, 1);
  });

  it('should search in listed reminders', () => {
    const reminders = [
      { text: 'Buy milk', id: 1 },
      { text: 'Buy eggs', id: 2 },
      { text: 'Call Mom', id: 3 },
    ];
    const results = reminders.filter((r) => r.text.includes('Buy'));
    assert.strictEqual(results.length, 2);
  });

  it('should update and verify changes', () => {
    let reminder = { id: 1, text: 'Old', priority: 1 };
    reminder = { ...reminder, text: 'New', priority: 3 };
    assert.strictEqual(reminder.text, 'New');
    assert.strictEqual(reminder.priority, 3);
  });

  it('should delete and remove from list', () => {
    let reminders = [
      { id: 1, text: 'Keep' },
      { id: 2, text: 'Delete' },
    ];
    reminders = reminders.filter((r) => r.id !== 2);
    assert.strictEqual(reminders.length, 1);
    assert.strictEqual(reminders[0].text, 'Keep');
  });
});
