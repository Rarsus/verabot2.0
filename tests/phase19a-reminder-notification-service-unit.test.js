/**
 * Phase 19a: ReminderNotificationService Unit Tests
 * Tests for notification creation and message formatting
 */

const assert = require('assert');
const { EmbedBuilder } = require('discord.js');
const { createReminderEmbed } = require('../src/services/ReminderNotificationService');

describe('ReminderNotificationService', () => {
  describe('createReminderEmbed()', () => {
    it('should create embed with title and color', () => {
      const reminder = {
        id: 1,
        subject: 'Team Meeting',
        when_datetime: '2024-01-20T10:00:00Z',
        category: 'Work',
      };

      const embed = createReminderEmbed(reminder);

      assert(embed instanceof EmbedBuilder);
      assert.strictEqual(embed.data.title, '🔔 Reminder: Team Meeting');
      assert.strictEqual(embed.data.color, 0xffd700);
    });

    it('should include category and datetime fields', () => {
      const reminder = {
        id: 1,
        subject: 'Meeting',
        when_datetime: '2024-01-20T10:00:00Z',
        category: 'Work',
      };

      const embed = createReminderEmbed(reminder);
      const categoryField = embed.data.fields.find((f) => f.name === '📂 Category');

      assert(categoryField);
      assert.strictEqual(categoryField.value, 'Work');
    });

    it('should add description when provided', () => {
      const reminder = {
        id: 1,
        subject: 'Meeting',
        when_datetime: '2024-01-20T10:00:00Z',
        category: 'Work',
        content: 'Discuss project timeline',
      };

      const embed = createReminderEmbed(reminder);

      assert.strictEqual(embed.data.description, 'Discuss project timeline');
    });

    it('should add link field when provided', () => {
      const reminder = {
        id: 1,
        subject: 'Meeting',
        when_datetime: '2024-01-20T10:00:00Z',
        category: 'Work',
        link: 'https://example.com/meeting',
      };

      const embed = createReminderEmbed(reminder);
      const linkField = embed.data.fields.find((f) => f.name === '🔗 Link');

      assert(linkField);
      assert.strictEqual(linkField.value, 'https://example.com/meeting');
    });

    it('should add image when provided', () => {
      const reminder = {
        id: 1,
        subject: 'Event',
        when_datetime: '2024-01-20T10:00:00Z',
        category: 'Event',
        image: 'https://example.com/image.png',
      };

      const embed = createReminderEmbed(reminder);

      assert.strictEqual(embed.data.image.url, 'https://example.com/image.png');
    });

    it('should include reminder ID in footer', () => {
      const reminder = {
        id: 42,
        subject: 'Task',
        when_datetime: '2024-01-20T10:00:00Z',
        category: 'Personal',
      };

      const embed = createReminderEmbed(reminder);

      assert.strictEqual(embed.data.footer.text, 'Reminder ID: 42');
    });

    it('should handle missing optional fields', () => {
      const reminder = {
        id: 1,
        subject: 'Simple Reminder',
        when_datetime: '2024-01-20T10:00:00Z',
        category: 'General',
      };

      const embed = createReminderEmbed(reminder);

      assert(embed.data.title);
      assert(embed.data.footer);
      assert(embed.data.fields.length >= 2);
    });

    it('should format datetime for Discord', () => {
      const reminder = {
        id: 1,
        subject: 'Event',
        when_datetime: '2024-01-20T10:00:00Z',
        category: 'Event',
      };

      const embed = createReminderEmbed(reminder);
      const dateField = embed.data.fields.find((f) => f.name === '📅 When');

      assert(dateField);
      assert(dateField.value.includes('t:'));
    });

    it('should handle special characters in subject', () => {
      const reminder = {
        id: 1,
        subject: 'Meeting <@123> & Review',
        when_datetime: '2024-01-20T10:00:00Z',
        category: 'Work',
      };

      const embed = createReminderEmbed(reminder);

      assert(embed.data.title.includes('Meeting'));
    });

    it('should handle long content', () => {
      const reminder = {
        id: 1,
        subject: 'Task',
        when_datetime: '2024-01-20T10:00:00Z',
        category: 'Work',
        content: 'A'.repeat(500),
      };

      const embed = createReminderEmbed(reminder);

      assert(embed.data.description.length > 100);
    });

    it('should support all category types', () => {
      const categories = ['Work', 'Personal', 'Event', 'Deadline', 'Meeting'];

      categories.forEach((category) => {
        const reminder = {
          id: 1,
          subject: 'Test',
          when_datetime: '2024-01-20T10:00:00Z',
          category,
        };

        const embed = createReminderEmbed(reminder);
        const categoryField = embed.data.fields.find((f) => f.name === '📂 Category');

        assert.strictEqual(categoryField.value, category);
      });
    });

    it('should set timestamp on embed', () => {
      const reminder = {
        id: 1,
        subject: 'Event',
        when_datetime: '2024-01-20T10:00:00Z',
        category: 'Event',
      };

      const embed = createReminderEmbed(reminder);

      assert(embed.data.timestamp);
    });
  });

  describe('Embed formatting edge cases', () => {
    it('should handle very long subject', () => {
      const reminder = {
        id: 1,
        subject: 'A'.repeat(200),
        when_datetime: '2024-01-20T10:00:00Z',
        category: 'Work',
      };

      const embed = createReminderEmbed(reminder);
      assert(embed.data.title);
    });

    it('should handle empty category', () => {
      const reminder = {
        id: 1,
        subject: 'Event',
        when_datetime: '2024-01-20T10:00:00Z',
        category: '',
      };

      const embed = createReminderEmbed(reminder);
      const categoryField = embed.data.fields.find((f) => f.name === '📂 Category');

      assert.strictEqual(categoryField.value, '');
    });

    it('should handle unicode in fields', () => {
      const reminder = {
        id: 1,
        subject: 'Événement important 重要イベント',
        when_datetime: '2024-01-20T10:00:00Z',
        category: '日本語',
      };

      const embed = createReminderEmbed(reminder);
      assert(embed.data.title.includes('Événement'));
    });

    it('should handle URL with special characters', () => {
      const reminder = {
        id: 1,
        subject: 'Meeting',
        when_datetime: '2024-01-20T10:00:00Z',
        category: 'Work',
        link: 'https://example.com/path?param=value&other=123',
      };

      const embed = createReminderEmbed(reminder);
      const linkField = embed.data.fields.find((f) => f.name === '🔗 Link');

      assert(linkField.value.includes('?'));
    });
  });

  describe('Notification data structure', () => {
    it('should create consistent embed structure', () => {
      const reminder = {
        id: 1,
        subject: 'Task',
        when_datetime: '2024-01-20T10:00:00Z',
        category: 'Work',
        content: 'Do something',
        link: 'https://example.com',
      };

      const embed = createReminderEmbed(reminder);

      // Verify required fields exist
      assert(embed.data.title);
      assert(embed.data.color);
      assert(Array.isArray(embed.data.fields));
      assert(embed.data.footer);
      assert(embed.data.timestamp);
    });

    it('should maintain field order', () => {
      const reminder = {
        id: 1,
        subject: 'Event',
        when_datetime: '2024-01-20T10:00:00Z',
        category: 'Event',
        content: 'Description',
        link: 'https://example.com',
      };

      const embed = createReminderEmbed(reminder);
      const firstField = embed.data.fields[0];

      // First field should be a date/category field
      assert(firstField.name.includes('📅') || firstField.name.includes('📂'));
    });
  });
});
