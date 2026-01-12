/**
 * Phase 18: Response Helpers Comprehensive Coverage
 * Full test coverage for response-helpers.js utility functions
 * Tests all response types, state handling, error scenarios
 */

// Mock Discord.js BEFORE requiring response-helpers
jest.mock('discord.js', () => ({
  EmbedBuilder: jest.fn(() => ({
    setTitle: jest.fn(function() { return this; }),
    setDescription: jest.fn(function() { return this; }),
    setFooter: jest.fn(function() { return this; }),
    setColor: jest.fn(function() { return this; }),
  })),
}));

describe('Response Helpers Comprehensive', () => {
  const {
    sendQuoteEmbed,
    sendSuccess,
    sendError,
    sendDM,
    deferReply,
  } = require('../../src/utils/helpers/response-helpers');

  describe('sendQuoteEmbed', () => {
    let mockInteraction;
    let mockQuote;

    beforeEach(() => {
      mockQuote = {
        id: 123,
        text: 'This is a great quote',
        author: 'John Doe',
      };

      mockInteraction = {
        deferred: false,
        replied: false,
        reply: jest.fn().mockResolvedValue({}),
        editReply: jest.fn().mockResolvedValue({}),
      };
    });

    it('should send quote embed on new interaction', async () => {
      await sendQuoteEmbed(mockInteraction, mockQuote, 'Test Quote');

      expect(mockInteraction.reply).toHaveBeenCalled();
      expect(mockInteraction.editReply).not.toHaveBeenCalled();
    });

    it('should edit reply on deferred interaction', async () => {
      mockInteraction.deferred = true;

      await sendQuoteEmbed(mockInteraction, mockQuote);

      expect(mockInteraction.editReply).toHaveBeenCalled();
      expect(mockInteraction.reply).not.toHaveBeenCalled();
    });

    it('should edit reply on already replied interaction', async () => {
      mockInteraction.replied = true;

      await sendQuoteEmbed(mockInteraction, mockQuote);

      expect(mockInteraction.editReply).toHaveBeenCalled();
      expect(mockInteraction.reply).not.toHaveBeenCalled();
    });

    it('should use default title when not provided', async () => {
      await sendQuoteEmbed(mockInteraction, mockQuote);

      const callArgs = mockInteraction.reply.mock.calls[0];
      expect(callArgs[0].embeds).toBeDefined();
    });

    it('should format quote with author and ID', async () => {
      const quote = {
        id: 456,
        text: 'Amazing quote text',
        author: 'Jane Smith',
      };

      await sendQuoteEmbed(mockInteraction, quote);

      expect(mockInteraction.reply).toHaveBeenCalled();
    });

    it('should handle special characters in quote text', async () => {
      const quote = {
        id: 789,
        text: 'Quote with "quotes" and \'apostrophes\'',
        author: 'Test Author',
      };

      await sendQuoteEmbed(mockInteraction, quote);

      expect(mockInteraction.reply).toHaveBeenCalled();
    });

    it('should handle quotes with very long text', async () => {
      const longText = 'A'.repeat(1000);
      const quote = {
        id: 1,
        text: longText,
        author: 'Author',
      };

      await sendQuoteEmbed(mockInteraction, quote);

      expect(mockInteraction.reply).toHaveBeenCalled();
    });

    it('should handle error when reply fails', async () => {
      mockInteraction.reply.mockRejectedValueOnce(new Error('Discord API error'));

      await expect(sendQuoteEmbed(mockInteraction, mockQuote))
        .rejects.toThrow('Discord API error');
    });

    it('should handle error when editReply fails', async () => {
      mockInteraction.deferred = true;
      mockInteraction.editReply.mockRejectedValueOnce(new Error('Edit failed'));

      await expect(sendQuoteEmbed(mockInteraction, mockQuote))
        .rejects.toThrow('Edit failed');
    });
  });

  describe('sendSuccess', () => {
    let mockInteraction;

    beforeEach(() => {
      mockInteraction = {
        deferred: false,
        replied: false,
        reply: jest.fn().mockResolvedValue({}),
        editReply: jest.fn().mockResolvedValue({}),
      };
    });

    it('should send success message on new interaction', async () => {
      await sendSuccess(mockInteraction, 'Operation completed');

      expect(mockInteraction.reply).toHaveBeenCalled();
      const callArgs = mockInteraction.reply.mock.calls[0][0];
      expect(callArgs.content).toContain('✅');
      expect(callArgs.content).toContain('Operation completed');
    });

    it('should send ephemeral success message', async () => {
      await sendSuccess(mockInteraction, 'Done', true);

      const callArgs = mockInteraction.reply.mock.calls[0][0];
      expect(callArgs.flags).toBe(64); // Ephemeral flag
    });

    it('should send non-ephemeral success message', async () => {
      await sendSuccess(mockInteraction, 'Done', false);

      const callArgs = mockInteraction.reply.mock.calls[0][0];
      expect(callArgs.flags).toBeUndefined();
    });

    it('should use default non-ephemeral when flag not specified', async () => {
      await sendSuccess(mockInteraction, 'Done');

      const callArgs = mockInteraction.reply.mock.calls[0][0];
      expect(callArgs.flags).toBeUndefined();
    });

    it('should edit reply on deferred interaction', async () => {
      mockInteraction.deferred = true;

      await sendSuccess(mockInteraction, 'Done');

      expect(mockInteraction.editReply).toHaveBeenCalled();
      expect(mockInteraction.reply).not.toHaveBeenCalled();
    });

    it('should edit reply on already replied interaction', async () => {
      mockInteraction.replied = true;

      await sendSuccess(mockInteraction, 'Done');

      expect(mockInteraction.editReply).toHaveBeenCalled();
      expect(mockInteraction.reply).not.toHaveBeenCalled();
    });

    it('should format message with success emoji', async () => {
      const testMessage = 'Test success message';

      await sendSuccess(mockInteraction, testMessage);

      const callArgs = mockInteraction.reply.mock.calls[0][0];
      expect(callArgs.content).toBe(`✅ ${testMessage}`);
    });

    it('should handle special characters in message', async () => {
      const message = 'Quote "test" & other @symbols!';

      await sendSuccess(mockInteraction, message);

      expect(mockInteraction.reply).toHaveBeenCalled();
    });

    it('should handle error when reply fails', async () => {
      mockInteraction.reply.mockRejectedValueOnce(new Error('Reply failed'));

      await expect(sendSuccess(mockInteraction, 'Test'))
        .rejects.toThrow('Reply failed');
    });

    it('should handle error when editReply fails', async () => {
      mockInteraction.deferred = true;
      mockInteraction.editReply.mockRejectedValueOnce(new Error('Edit failed'));

      await expect(sendSuccess(mockInteraction, 'Test'))
        .rejects.toThrow('Edit failed');
    });
  });

  describe('sendError', () => {
    let mockInteraction;

    beforeEach(() => {
      mockInteraction = {
        deferred: false,
        replied: false,
        reply: jest.fn().mockResolvedValue({}),
        editReply: jest.fn().mockResolvedValue({}),
      };
    });

    it('should send error message on new interaction', async () => {
      await sendError(mockInteraction, 'Something went wrong');

      expect(mockInteraction.reply).toHaveBeenCalled();
      const callArgs = mockInteraction.reply.mock.calls[0][0];
      expect(callArgs.content).toContain('❌');
      expect(callArgs.content).toContain('Something went wrong');
    });

    it('should send ephemeral error by default', async () => {
      await sendError(mockInteraction, 'Error');

      const callArgs = mockInteraction.reply.mock.calls[0][0];
      expect(callArgs.flags).toBe(64); // Ephemeral flag
    });

    it('should send ephemeral error when explicitly set', async () => {
      await sendError(mockInteraction, 'Error', true);

      const callArgs = mockInteraction.reply.mock.calls[0][0];
      expect(callArgs.flags).toBe(64);
    });

    it('should send non-ephemeral error when specified', async () => {
      await sendError(mockInteraction, 'Error', false);

      const callArgs = mockInteraction.reply.mock.calls[0][0];
      expect(callArgs.flags).toBeUndefined();
    });

    it('should edit reply on deferred interaction', async () => {
      mockInteraction.deferred = true;

      await sendError(mockInteraction, 'Error');

      expect(mockInteraction.editReply).toHaveBeenCalled();
      expect(mockInteraction.reply).not.toHaveBeenCalled();
    });

    it('should edit reply on already replied interaction', async () => {
      mockInteraction.replied = true;

      await sendError(mockInteraction, 'Error');

      expect(mockInteraction.editReply).toHaveBeenCalled();
      expect(mockInteraction.reply).not.toHaveBeenCalled();
    });

    it('should format message with error emoji', async () => {
      const testMessage = 'Invalid input provided';

      await sendError(mockInteraction, testMessage);

      const callArgs = mockInteraction.reply.mock.calls[0][0];
      expect(callArgs.content).toBe(`❌ ${testMessage}`);
    });

    it('should handle various error messages', async () => {
      const errorMessages = [
        'Database connection failed',
        'Permission denied',
        'Invalid quote ID',
        'User not found',
      ];

      for (const message of errorMessages) {
        mockInteraction.reply.mockClear();
        await sendError(mockInteraction, message);
        expect(mockInteraction.reply).toHaveBeenCalled();
      }
    });

    it('should handle error when reply fails', async () => {
      mockInteraction.reply.mockRejectedValueOnce(new Error('Reply failed'));

      await expect(sendError(mockInteraction, 'Test error'))
        .rejects.toThrow('Reply failed');
    });

    it('should handle error when editReply fails', async () => {
      mockInteraction.deferred = true;
      mockInteraction.editReply.mockRejectedValueOnce(new Error('Edit failed'));

      await expect(sendError(mockInteraction, 'Test error'))
        .rejects.toThrow('Edit failed');
    });
  });

  describe('sendDM', () => {
    let mockInteraction;
    let mockDmChannel;

    beforeEach(() => {
      mockDmChannel = {
        send: jest.fn().mockResolvedValue({}),
      };

      mockInteraction = {
        deferred: false,
        replied: false,
        user: {
          createDM: jest.fn().mockResolvedValue(mockDmChannel),
        },
        reply: jest.fn().mockResolvedValue({}),
        editReply: jest.fn().mockResolvedValue({}),
      };
    });

    it('should create DM channel and send message', async () => {
      await sendDM(mockInteraction, 'Check this out');

      expect(mockInteraction.user.createDM).toHaveBeenCalled();
      expect(mockDmChannel.send).toHaveBeenCalledWith('Check this out');
    });

    it('should send confirmation message in channel', async () => {
      await sendDM(mockInteraction, 'DM content');

      expect(mockInteraction.reply).toHaveBeenCalled();
      const callArgs = mockInteraction.reply.mock.calls[0][0];
      expect(callArgs.content).toContain('📨');
      expect(callArgs.content).toContain('Check your DMs');
    });

    it('should use custom confirmation message', async () => {
      await sendDM(mockInteraction, 'Content', 'Custom DM message');

      const callArgs = mockInteraction.reply.mock.calls[0][0];
      expect(callArgs.content).toContain('Custom DM message');
    });

    it('should send confirmation as ephemeral', async () => {
      await sendDM(mockInteraction, 'Content');

      const callArgs = mockInteraction.reply.mock.calls[0][0];
      expect(callArgs.flags).toBe(64); // Ephemeral
    });

    it('should handle DM channel creation error', async () => {
      mockInteraction.user.createDM.mockRejectedValueOnce(
        new Error('Cannot create DM')
      );

      await expect(sendDM(mockInteraction, 'Content'))
        .rejects.toThrow('Cannot create DM');
    });

    it('should handle DM send error', async () => {
      mockDmChannel.send.mockRejectedValueOnce(new Error('Send failed'));

      await expect(sendDM(mockInteraction, 'Content'))
        .rejects.toThrow('Send failed');
    });

    it('should handle long DM content', async () => {
      const longContent = 'A'.repeat(2000);

      await sendDM(mockInteraction, longContent);

      expect(mockDmChannel.send).toHaveBeenCalledWith(longContent);
    });

    it('should handle special characters in DM', async () => {
      const dmContent = 'Hello @user, check this **bold** and `code`';

      await sendDM(mockInteraction, dmContent);

      expect(mockDmChannel.send).toHaveBeenCalledWith(dmContent);
    });

    it('should handle confirmation message error', async () => {
      mockInteraction.reply.mockRejectedValueOnce(new Error('Reply failed'));

      await expect(sendDM(mockInteraction, 'Content'))
        .rejects.toThrow('Reply failed');
    });
  });

  describe('deferReply', () => {
    let mockInteraction;

    beforeEach(() => {
      mockInteraction = {
        deferred: false,
        replied: false,
        deferReply: jest.fn().mockResolvedValue({}),
      };
    });

    it('should defer reply when not deferred or replied', async () => {
      await deferReply(mockInteraction);

      expect(mockInteraction.deferReply).toHaveBeenCalled();
    });

    it('should not defer when already deferred', async () => {
      mockInteraction.deferred = true;

      await deferReply(mockInteraction);

      expect(mockInteraction.deferReply).not.toHaveBeenCalled();
    });

    it('should not defer when already replied', async () => {
      mockInteraction.replied = true;

      await deferReply(mockInteraction);

      expect(mockInteraction.deferReply).not.toHaveBeenCalled();
    });

    it('should handle deferReply error', async () => {
      mockInteraction.deferReply.mockRejectedValueOnce(
        new Error('Defer failed')
      );

      await expect(deferReply(mockInteraction))
        .rejects.toThrow('Defer failed');
    });

    it('should handle both deferred and replied being true', async () => {
      mockInteraction.deferred = true;
      mockInteraction.replied = true;

      await deferReply(mockInteraction);

      expect(mockInteraction.deferReply).not.toHaveBeenCalled();
    });
  });

  describe('Integration scenarios', () => {
    it('should handle quote embed followed by success', async () => {
      const mockInteraction = {
        deferred: false,
        replied: false,
        reply: jest.fn()
          .mockResolvedValueOnce({}) // First reply for embed
          .mockResolvedValueOnce({}), // Second would fail, use editReply
        editReply: jest.fn().mockResolvedValue({}),
      };

      const quote = { id: 1, text: 'Test', author: 'Author' };

      await sendQuoteEmbed(mockInteraction, quote);
      mockInteraction.replied = true; // Simulate state change

      // Can't reply again, need editReply
      await sendSuccess(mockInteraction, 'Added to favorites');

      expect(mockInteraction.reply).toHaveBeenCalledTimes(1);
      expect(mockInteraction.editReply).toHaveBeenCalledTimes(1);
    });

    it('should handle defer then send error', async () => {
      const mockInteraction = {
        deferred: false,
        replied: false,
        deferReply: jest.fn().mockResolvedValue({}),
        editReply: jest.fn().mockResolvedValue({}),
      };

      await deferReply(mockInteraction);
      mockInteraction.deferred = true;

      await sendError(mockInteraction, 'Processing failed');

      expect(mockInteraction.deferReply).toHaveBeenCalled();
      expect(mockInteraction.editReply).toHaveBeenCalled();
    });

    it('should handle DM with quote follow-up', async () => {
      const mockDmChannel = {
        send: jest.fn().mockResolvedValue({}),
      };

      const mockInteraction = {
        deferred: false,
        replied: false,
        user: {
          createDM: jest.fn().mockResolvedValue(mockDmChannel),
        },
        reply: jest.fn().mockResolvedValue({}),
      };

      await sendDM(mockInteraction, 'Full quote text here');

      expect(mockInteraction.user.createDM).toHaveBeenCalled();
      expect(mockDmChannel.send).toHaveBeenCalled();
      expect(mockInteraction.reply).toHaveBeenCalled();
    });
  });
});
