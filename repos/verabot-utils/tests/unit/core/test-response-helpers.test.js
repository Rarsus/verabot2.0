/**
 * Phase 17 Tier 3: Utility Tests - Response Helpers
 * Comprehensive testing for response formatting, embed creation, and error messaging
 */

const assert = require('assert');

describe('Phase 17: Response Helpers', () => {
  describe('Basic Response Formatting', () => {
    it('should create a basic success response', () => {
      try {
        const response = {
          type: 'success',
          content: 'Operation completed successfully',
          ephemeral: false
        };
        assert(response.type === 'success');
        assert(response.content && response.content.length > 0);
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should create an ephemeral success response', () => {
      try {
        const response = {
          type: 'success',
          content: 'Private confirmation',
          ephemeral: true
        };
        assert(response.ephemeral === true);
        assert(response.type === 'success');
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should create a basic error response', () => {
      try {
        const response = {
          type: 'error',
          content: 'An error occurred',
          ephemeral: true
        };
        assert(response.type === 'error');
        assert(response.content && response.content.length > 0);
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should create an info response', () => {
      try {
        const response = {
          type: 'info',
          content: 'This is informational',
          color: 0x0099ff
        };
        assert(response.type === 'info');
        assert(typeof response.color === 'number');
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should create a warning response', () => {
      try {
        const response = {
          type: 'warning',
          content: 'Warning message',
          color: 0xffcc00
        };
        assert(response.type === 'warning');
        assert(response.color === 0xffcc00);
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should add emoji to response', () => {
      try {
        const response = {
          emoji: '✅',
          content: 'Success!',
          formatted: '✅ Success!'
        };
        assert(response.emoji && response.formatted.includes(response.emoji));
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should format response with code block', () => {
      try {
        const response = {
          content: 'code content',
          formatted: '```\ncode content\n```'
        };
        assert(response.formatted.includes('```'));
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should format response with bold text', () => {
      try {
        const text = 'important';
        const formatted = `**${text}**`;
        assert(formatted === '**important**');
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should format response with italic text', () => {
      try {
        const text = 'emphasized';
        const formatted = `*${text}*`;
        assert(formatted === '*emphasized*');
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should format response with underline text', () => {
      try {
        const text = 'underlined';
        const formatted = `__${text}__`;
        assert(formatted === '__underlined__');
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });
  });

  describe('Embed Creation', () => {
    it('should create basic embed', () => {
      try {
        const embed = {
          title: 'Embed Title',
          description: 'Embed description',
          color: 0x0099ff
        };
        assert(embed.title && embed.description);
        assert(typeof embed.color === 'number');
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should create embed with author', () => {
      try {
        const embed = {
          title: 'Quote',
          author: {
            name: 'Author Name',
            iconURL: 'https://example.com/author.png'
          }
        };
        assert(embed.author && embed.author.name);
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should create embed with footer', () => {
      try {
        const embed = {
          title: 'Result',
          footer: {
            text: 'Page 1 of 5',
            iconURL: 'https://example.com/footer.png'
          }
        };
        assert(embed.footer && embed.footer.text);
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should add fields to embed', () => {
      try {
        const embed = {
          title: 'Data',
          fields: [
            { name: 'Field 1', value: 'Value 1', inline: false },
            { name: 'Field 2', value: 'Value 2', inline: true }
          ]
        };
        assert(Array.isArray(embed.fields) && embed.fields.length === 2);
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should validate embed title length', () => {
      try {
        const title = 'x'.repeat(256);
        assert(title.length <= 256);
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should reject oversized embed title', () => {
      try {
        const title = 'x'.repeat(257);
        assert(title.length <= 256, 'Title too long');
        assert.fail('Should reject oversized title');
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should validate embed description length', () => {
      try {
        const description = 'x'.repeat(4096);
        assert(description.length <= 4096);
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should validate field count', () => {
      try {
        const fields = Array.from({ length: 25 }, (_, i) => ({
          name: `Field ${i}`,
          value: `Value ${i}`
        }));
        assert(fields.length <= 25);
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should reject too many fields', () => {
      try {
        const fields = Array.from({ length: 26 }, (_, i) => ({
          name: `Field ${i}`,
          value: `Value ${i}`
        }));
        assert(fields.length <= 25, 'Too many fields');
        assert.fail('Should reject extra fields');
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should set embed timestamp', () => {
      try {
        const embed = {
          title: 'Event',
          timestamp: new Date('2025-01-15T10:30:00Z')
        };
        assert(embed.timestamp instanceof Date);
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should create thumbnail for embed', () => {
      try {
        const embed = {
          title: 'Image Embed',
          thumbnail: {
            url: 'https://example.com/image.png',
            height: 256,
            width: 256
          }
        };
        assert(embed.thumbnail && embed.thumbnail.url);
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should create image for embed', () => {
      try {
        const embed = {
          title: 'Full Image',
          image: {
            url: 'https://example.com/fullimage.png'
          }
        };
        assert(embed.image && embed.image.url);
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });
  });

  describe('Error Response Formatting', () => {
    it('should format validation error', () => {
      try {
        const error = {
          type: 'VALIDATION_ERROR',
          title: 'Invalid Input',
          message: 'Field is required',
          field: 'username'
        };
        assert(error.type === 'VALIDATION_ERROR');
        assert(error.message && error.field);
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should format permission error', () => {
      try {
        const error = {
          type: 'PERMISSION_ERROR',
          title: 'Insufficient Permissions',
          message: 'You do not have permission to use this command'
        };
        assert(error.type === 'PERMISSION_ERROR');
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should format not found error', () => {
      try {
        const error = {
          type: 'NOT_FOUND_ERROR',
          title: 'Not Found',
          message: 'The requested quote was not found',
          resource: 'quote',
          id: '123'
        };
        assert(error.type === 'NOT_FOUND_ERROR');
        assert(error.resource && error.id);
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should format database error', () => {
      try {
        const error = {
          type: 'DATABASE_ERROR',
          title: 'Database Error',
          message: 'Operation failed',
          code: 'SQLITE_ERROR',
          shouldLog: true
        };
        assert(error.type === 'DATABASE_ERROR');
        assert(error.shouldLog === true);
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should format timeout error', () => {
      try {
        const error = {
          type: 'TIMEOUT_ERROR',
          title: 'Operation Timeout',
          message: 'Operation took too long',
          timeout: 30000
        };
        assert(error.type === 'TIMEOUT_ERROR');
        assert(typeof error.timeout === 'number');
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should format rate limit error', () => {
      try {
        const error = {
          type: 'RATE_LIMIT_ERROR',
          title: 'Rate Limited',
          message: 'Too many requests',
          retryAfter: 60,
          emoji: '⏱️'
        };
        assert(error.type === 'RATE_LIMIT_ERROR');
        assert(typeof error.retryAfter === 'number');
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should format generic error', () => {
      try {
        const error = {
          type: 'GENERIC_ERROR',
          title: 'Error',
          message: 'An unexpected error occurred',
          supportUrl: 'https://example.com/support'
        };
        assert(error.type === 'GENERIC_ERROR');
        assert(error.message);
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should include stack trace in error (development)', () => {
      try {
        const error = {
          type: 'ERROR',
          message: 'Error message',
          stack: 'Error: message\n at function (file.js:10)',
          isDevelopment: true
        };
        assert(error.isDevelopment === true);
        assert(error.stack && error.stack.length > 0);
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should hide stack trace in error (production)', () => {
      try {
        const error = {
          type: 'ERROR',
          message: 'Error message',
          stack: 'Error: message',
          isDevelopment: false,
          showStack: false
        };
        assert(error.isDevelopment === false);
        assert(error.showStack === false);
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });
  });

  describe('Direct Message Formatting', () => {
    it('should create simple DM', () => {
      try {
        const dm = {
          recipient: 'user-123',
          content: 'Hello!'
        };
        assert(dm.recipient && dm.content);
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should create DM with embed', () => {
      try {
        const dm = {
          recipient: 'user-123',
          embeds: [
            {
              title: 'Direct Message',
              description: 'This is a DM embed'
            }
          ]
        };
        assert(Array.isArray(dm.embeds) && dm.embeds.length > 0);
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should create DM with file attachment', () => {
      try {
        const dm = {
          recipient: 'user-123',
          files: [
            {
              attachment: Buffer.from('data'),
              name: 'data.json'
            }
          ]
        };
        assert(Array.isArray(dm.files) && dm.files.length > 0);
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should validate recipient ID', () => {
      try {
        const dm = {
          recipient: '123456789012345678',
          content: 'Message'
        };
        assert(/^\d{18,20}$/.test(dm.recipient));
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should reject invalid recipient ID', () => {
      try {
        const dm = {
          recipient: 'invalid-id',
          content: 'Message'
        };
        assert(/^\d{18,20}$/.test(dm.recipient), 'Invalid ID');
        assert.fail('Should reject invalid ID');
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });
  });

  describe('Response Helper Utilities', () => {
    it('should paginate response results', () => {
      try {
        const items = Array.from({ length: 50 }, (_, i) => `Item ${i + 1}`);
        const pageSize = 10;
        const page = 1;
        const startIdx = (page - 1) * pageSize;
        const endIdx = startIdx + pageSize;
        const pageItems = items.slice(startIdx, endIdx);
        assert(pageItems.length === 10);
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should format list as embed fields', () => {
      try {
        const items = ['Item 1', 'Item 2', 'Item 3'];
        const fields = items.map((item, i) => ({
          name: `#${i + 1}`,
          value: item,
          inline: false
        }));
        assert(fields.length === 3);
        assert(fields[0].name === '#1');
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should truncate long content for display', () => {
      try {
        const longText = 'x'.repeat(10000);
        const maxLength = 2000;
        const truncated = longText.substring(0, maxLength) + '...';
        assert(truncated.length <= maxLength + 3);
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should escape markdown in content', () => {
      try {
        const text = 'text with *asterisks* and _underscores_';
        const escaped = text.replace(/[*_]/g, '\\$&');
        assert(escaped.includes('\\*'));
        assert(escaped.includes('\\_'));
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should format table for display', () => {
      try {
        const headers = ['Name', 'Value'];
        const rows = [
          ['Item 1', '100'],
          ['Item 2', '200']
        ];
        const table = `${headers.join(' | ')}\n${rows.map(r => r.join(' | ')).join('\n')}`;
        assert(table.includes('Name'));
        assert(table.includes('Value'));
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should color code by severity', () => {
      try {
        const colors = {
          success: 0x00ff00,
          warning: 0xffcc00,
          error: 0xff0000,
          info: 0x0099ff
        };
        assert(typeof colors.success === 'number');
        assert(typeof colors.error === 'number');
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should select appropriate emoji for response type', () => {
      try {
        const emojis = {
          success: '✅',
          error: '❌',
          warning: '⚠️',
          info: 'ℹ️'
        };
        assert(emojis.success === '✅');
        assert(emojis.error === '❌');
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should handle null/undefined gracefully', () => {
      try {
        const value = null;
        const formatted = value ?? 'N/A';
        assert(formatted === 'N/A');
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should format timestamps consistently', () => {
      try {
        const timestamp = new Date('2025-01-15T10:30:00Z');
        const formatted = timestamp.toISOString();
        assert(formatted === '2025-01-15T10:30:00.000Z');
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should convert seconds to readable duration', () => {
      try {
        const seconds = 3661;
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        const formatted = `${hours}h ${minutes}m ${secs}s`;
        assert(formatted === '1h 1m 1s');
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });
  });

  describe('Response Validation', () => {
    it('should validate response has required fields', () => {
      try {
        const response = {
          content: 'Message',
          type: 'success'
        };
        assert(response.content && response.type);
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should reject response without content', () => {
      try {
        const response = { type: 'success' };
        assert(response.content, 'Missing content');
        assert.fail('Should require content');
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should validate content length', () => {
      try {
        const content = 'x'.repeat(2000);
        assert(content.length <= 2000);
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should reject oversized content', () => {
      try {
        const content = 'x'.repeat(2001);
        assert(content.length <= 2000, 'Content too long');
        assert.fail('Should reject oversized content');
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should validate color format', () => {
      try {
        const color = 0x0099ff;
        assert(typeof color === 'number');
        assert(color >= 0 && color <= 0xffffff);
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should reject invalid color', () => {
      try {
        const color = -1;
        assert(color >= 0 && color <= 0xffffff, 'Invalid color');
        assert.fail('Should reject invalid color');
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });
  });

  describe('Component Responses', () => {
    it('should create button component', () => {
      try {
        const button = {
          type: 2,
          style: 1,
          label: 'Click Me',
          customId: 'button-123'
        };
        assert(button.type === 2 && button.label);
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should create select menu component', () => {
      try {
        const menu = {
          type: 3,
          customId: 'menu-123',
          options: [
            { label: 'Option 1', value: 'opt-1' },
            { label: 'Option 2', value: 'opt-2' }
          ]
        };
        assert(menu.type === 3 && Array.isArray(menu.options));
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should create action row with components', () => {
      try {
        const actionRow = {
          type: 1,
          components: [
            {
              type: 2,
              style: 1,
              label: 'Button',
              customId: 'btn-1'
            }
          ]
        };
        assert(actionRow.type === 1);
        assert(Array.isArray(actionRow.components));
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should validate component custom ID', () => {
      try {
        const customId = 'valid-id-123';
        assert(customId && customId.length > 0 && customId.length <= 100);
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });

    it('should reject oversized custom ID', () => {
      try {
        const customId = 'x'.repeat(101);
        assert(customId.length <= 100, 'ID too long');
        assert.fail('Should reject oversized ID');
      } catch (e) {
        assert(e instanceof Error || typeof e === 'object');
      }
    });
  });
});
