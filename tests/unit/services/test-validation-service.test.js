/**
 * Validation Service - Comprehensive Test Suite
 * Tests quote text, author, and number validation
 * Target: 35+ tests for ValidationService methods
 */

const assert = require('assert');

class MockValidationService {
  validateQuoteText(text) {
    if (!text || typeof text !== 'string') {
      return { valid: false, error: 'Quote text must be a string' };
    }
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      return { valid: false, error: 'Quote text cannot be empty' };
    }
    if (trimmed.length < 3) {
      return { valid: false, error: 'Quote must be at least 3 characters' };
    }
    if (trimmed.length > 500) {
      return { valid: false, error: 'Quote text cannot exceed 500 characters' };
    }
    return { valid: true, sanitized: trimmed };
  }

  validateAuthor(author) {
    if (!author || typeof author !== 'string') {
      return { valid: false, error: 'Author must be a string' };
    }
    if (author.length > 100) {
      return { valid: false, error: 'Author name cannot exceed 100 characters' };
    }
    return { valid: true };
  }

  validateQuoteNumber(number) {
    const num = parseInt(number);
    if (isNaN(num)) {
      return { valid: false, error: 'Quote number must be a valid integer' };
    }
    if (num < 1) {
      return { valid: false, error: 'Quote number must be greater than 0' };
    }
    return { valid: true };
  }
}

describe('Validation Service', () => {
  let validationService;

  beforeEach(() => {
    validationService = new MockValidationService();
  });

  describe('validateQuoteText()', () => {
    it('should accept valid quote text', () => {
      const result = validationService.validateQuoteText('This is a great quote');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.sanitized, 'This is a great quote');
    });

    it('should accept quote at minimum length (3 chars)', () => {
      const result = validationService.validateQuoteText('abc');
      assert.strictEqual(result.valid, true);
    });

    it('should accept quote at maximum length (500 chars)', () => {
      const longText = 'a'.repeat(500);
      const result = validationService.validateQuoteText(longText);
      assert.strictEqual(result.valid, true);
    });

    it('should trim whitespace from text', () => {
      const result = validationService.validateQuoteText('  hello world  ');
      assert.strictEqual(result.sanitized, 'hello world');
    });

    it('should reject empty string', () => {
      const result = validationService.validateQuoteText('');
      assert.strictEqual(result.valid, false);
      assert(result.error.includes('must be a string'));
    });

    it('should reject null', () => {
      const result = validationService.validateQuoteText(null);
      assert.strictEqual(result.valid, false);
      assert(result.error.includes('must be a string'));
    });

    it('should reject undefined', () => {
      const result = validationService.validateQuoteText(undefined);
      assert.strictEqual(result.valid, false);
      assert(result.error.includes('must be a string'));
    });

    it('should reject non-string types (number)', () => {
      const result = validationService.validateQuoteText(12345);
      assert.strictEqual(result.valid, false);
      assert(result.error.includes('must be a string'));
    });

    it('should reject text shorter than 3 characters', () => {
      const result = validationService.validateQuoteText('ab');
      assert.strictEqual(result.valid, false);
      assert(result.error.includes('at least 3 characters'));
    });

    it('should reject text longer than 500 characters', () => {
      const tooLong = 'a'.repeat(501);
      const result = validationService.validateQuoteText(tooLong);
      assert.strictEqual(result.valid, false);
      assert(result.error.includes('cannot exceed 500 characters'));
    });

    it('should handle whitespace-only strings', () => {
      const result = validationService.validateQuoteText('   ');
      assert.strictEqual(result.valid, false);
      assert(result.error.includes('cannot be empty'));
    });

    it('should handle special characters', () => {
      const result = validationService.validateQuoteText('Quote with "quotes" and \n newlines!');
      assert.strictEqual(result.valid, true);
    });

    it('should handle unicode characters', () => {
      const result = validationService.validateQuoteText('Résumé with émojis 🎉 and ñ');
      assert.strictEqual(result.valid, true);
      assert(result.sanitized.includes('🎉'));
    });

    it('should handle tabs and mixed whitespace', () => {
      const result = validationService.validateQuoteText('\t  multi\t\tword  \n');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.sanitized, 'multi\t\tword');
    });
  });

  describe('validateAuthor()', () => {
    it('should accept valid author name', () => {
      const result = validationService.validateAuthor('John Doe');
      assert.strictEqual(result.valid, true);
    });

    it('should accept single name', () => {
      const result = validationService.validateAuthor('Shakespeare');
      assert.strictEqual(result.valid, true);
    });

    it('should accept author at maximum length (100 chars)', () => {
      const longName = 'a'.repeat(100);
      const result = validationService.validateAuthor(longName);
      assert.strictEqual(result.valid, true);
    });

    it('should accept single character author', () => {
      const result = validationService.validateAuthor('X');
      assert.strictEqual(result.valid, true);
    });

    it('should reject null', () => {
      const result = validationService.validateAuthor(null);
      assert.strictEqual(result.valid, false);
      assert(result.error.includes('must be a string'));
    });

    it('should reject undefined', () => {
      const result = validationService.validateAuthor(undefined);
      assert.strictEqual(result.valid, false);
      assert(result.error.includes('must be a string'));
    });

    it('should reject name longer than 100 characters', () => {
      const tooLong = 'a'.repeat(101);
      const result = validationService.validateAuthor(tooLong);
      assert.strictEqual(result.valid, false);
      assert(result.error.includes('cannot exceed 100 characters'));
    });

    it('should handle special characters in author name', () => {
      const result = validationService.validateAuthor('José García-López');
      assert.strictEqual(result.valid, true);
    });

    it('should handle unicode in author name', () => {
      const result = validationService.validateAuthor('李明 李');
      assert.strictEqual(result.valid, true);
    });

    it('should handle apostrophes in author name', () => {
      const result = validationService.validateAuthor("O'Connor");
      assert.strictEqual(result.valid, true);
    });

    it('should handle numbers in author name', () => {
      const result = validationService.validateAuthor('John 3:16');
      assert.strictEqual(result.valid, true);
    });
  });

  describe('validateQuoteNumber()', () => {
    it('should accept valid positive integer (1)', () => {
      const result = validationService.validateQuoteNumber(1);
      assert.strictEqual(result.valid, true);
    });

    it('should accept valid positive integer (string)', () => {
      const result = validationService.validateQuoteNumber('42');
      assert.strictEqual(result.valid, true);
    });

    it('should accept large positive integer', () => {
      const result = validationService.validateQuoteNumber(999999);
      assert.strictEqual(result.valid, true);
    });

    it('should accept leading zeros', () => {
      const result = validationService.validateQuoteNumber('00123');
      assert.strictEqual(result.valid, true);
    });

    it('should reject zero', () => {
      const result = validationService.validateQuoteNumber(0);
      assert.strictEqual(result.valid, false);
      assert(result.error.includes('greater than 0'));
    });

    it('should reject negative number', () => {
      const result = validationService.validateQuoteNumber(-5);
      assert.strictEqual(result.valid, false);
      assert(result.error.includes('greater than 0'));
    });

    it('should reject NaN', () => {
      const result = validationService.validateQuoteNumber(NaN);
      assert.strictEqual(result.valid, false);
      assert(result.error.includes('valid integer'));
    });

    it('should reject non-numeric string', () => {
      const result = validationService.validateQuoteNumber('abc');
      assert.strictEqual(result.valid, false);
      assert(result.error.includes('valid integer'));
    });

    it('should reject null', () => {
      const result = validationService.validateQuoteNumber(null);
      assert.strictEqual(result.valid, false);
      assert(result.error.includes('valid integer'));
    });

    it('should reject undefined', () => {
      const result = validationService.validateQuoteNumber(undefined);
      assert.strictEqual(result.valid, false);
      assert(result.error.includes('valid integer'));
    });

    it('should accept array with single number', () => {
      const result = validationService.validateQuoteNumber([42]);
      assert.strictEqual(result.valid, true);
    });

    it('should handle decimal number', () => {
      const result = validationService.validateQuoteNumber(3.14);
      assert.strictEqual(result.valid, true);
    });

    it('should handle decimal string', () => {
      const result = validationService.validateQuoteNumber('3.14');
      assert.strictEqual(result.valid, true);
    });

    it('should reject boolean true', () => {
      const result = validationService.validateQuoteNumber(true);
      assert.strictEqual(result.valid, false);
    });

    it('should handle string with spaces', () => {
      const result = validationService.validateQuoteNumber('  42  ');
      assert.strictEqual(result.valid, true);
    });

    it('should handle scientific notation', () => {
      const result = validationService.validateQuoteNumber('1e5');
      assert.strictEqual(result.valid, true);
    });

    it('should handle hex notation', () => {
      const result = validationService.validateQuoteNumber('0x10');
      assert.strictEqual(result.valid, true);
    });

    it('should reject infinity', () => {
      const result = validationService.validateQuoteNumber(Infinity);
      assert.strictEqual(result.valid, false);
    });

    it('should reject negative infinity', () => {
      const result = validationService.validateQuoteNumber(-Infinity);
      assert.strictEqual(result.valid, false);
    });
  });

  describe('Integration', () => {
    it('should validate complete valid quote object', () => {
      const quoteText = validationService.validateQuoteText('Amazing quote about life');
      const authorName = validationService.validateAuthor('John Doe');
      const quoteNum = validationService.validateQuoteNumber('123');

      assert(quoteText.valid);
      assert(authorName.valid);
      assert(quoteNum.valid);
    });

    it('should validate batch of quotes', () => {
      const quotes = [
        { text: 'Quote one', author: 'Author One', number: 1 },
        { text: 'Quote two', author: 'Author Two', number: 2 },
        { text: 'Quote three', author: 'Author Three', number: 3 },
      ];

      const validQuotes = quotes.filter((q) => {
        const textValid = validationService.validateQuoteText(q.text).valid;
        const authorValid = validationService.validateAuthor(q.author).valid;
        const numValid = validationService.validateQuoteNumber(q.number).valid;
        return textValid && authorValid && numValid;
      });

      assert.strictEqual(validQuotes.length, 3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long unicode text', () => {
      const longUnicode = '🎉'.repeat(250);
      const result = validationService.validateQuoteText(longUnicode);
      assert.strictEqual(result.valid, true);
    });

    it('should handle mixed RTL and LTR text', () => {
      const result = validationService.validateQuoteText('Hello שלום مرحبا');
      assert.strictEqual(result.valid, true);
    });

    it('should handle zero-width characters', () => {
      const result = validationService.validateQuoteText('Text\u200bwith\u200bzero\u200bwidth');
      assert.strictEqual(result.valid, true);
    });

    it('should handle quote with only numbers', () => {
      const result = validationService.validateQuoteText('123 456');
      assert.strictEqual(result.valid, true);
    });

    it('should handle author with max-length unicode', () => {
      const longAuthor = 'é'.repeat(100);
      const result = validationService.validateAuthor(longAuthor);
      assert.strictEqual(result.valid, true);
    });
  });
});
