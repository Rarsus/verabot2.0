/**
 * Phase 18: Validation Service Comprehensive Coverage
 * Full test coverage for ValidationService.js
 */

describe('Validation Service Comprehensive', () => {
  const ValidationService = require('../src/services/ValidationService');

  describe('validateQuoteText', () => {
    it('should validate correct quote text', () => {
      const result = ValidationService.validateQuoteText('This is a valid quote');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('This is a valid quote');
    });

    it('should reject null', () => {
      const result = ValidationService.validateQuoteText(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should reject undefined', () => {
      const result = ValidationService.validateQuoteText(undefined);
      expect(result.valid).toBe(false);
    });

    it('should reject non-string', () => {
      const result = ValidationService.validateQuoteText(123);
      expect(result.valid).toBe(false);
    });

    it('should reject empty string', () => {
      const result = ValidationService.validateQuoteText('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should reject whitespace only', () => {
      const result = ValidationService.validateQuoteText('   ');
      expect(result.valid).toBe(false);
    });

    it('should reject text shorter than 3 chars', () => {
      const result = ValidationService.validateQuoteText('ab');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('3 characters');
    });

    it('should accept exactly 3 characters', () => {
      const result = ValidationService.validateQuoteText('abc');
      expect(result.valid).toBe(true);
    });

    it('should reject text exceeding 500 characters', () => {
      const longText = 'a'.repeat(501);
      const result = ValidationService.validateQuoteText(longText);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('500');
    });

    it('should accept exactly 500 characters', () => {
      const text = 'a'.repeat(500);
      const result = ValidationService.validateQuoteText(text);
      expect(result.valid).toBe(true);
    });

    it('should trim whitespace', () => {
      const result = ValidationService.validateQuoteText('  Valid quote  ');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('Valid quote');
    });

    it('should handle special characters', () => {
      const result = ValidationService.validateQuoteText('Quote with "quotes" & symbols!');
      expect(result.valid).toBe(true);
    });

    it('should handle unicode characters', () => {
      const result = ValidationService.validateQuoteText('Quote with emoji 🎉');
      expect(result.valid).toBe(true);
    });

    it('should handle newlines', () => {
      const result = ValidationService.validateQuoteText('Quote\nwith\nlines');
      expect(result.valid).toBe(true);
    });
  });

  describe('validateAuthor', () => {
    it('should validate correct author', () => {
      const result = ValidationService.validateAuthor('John Doe');
      expect(result.valid).toBe(true);
    });

    it('should reject null', () => {
      const result = ValidationService.validateAuthor(null);
      expect(result.valid).toBe(false);
    });

    it('should reject undefined', () => {
      const result = ValidationService.validateAuthor(undefined);
      expect(result.valid).toBe(false);
    });

    it('should reject non-string', () => {
      const result = ValidationService.validateAuthor(123);
      expect(result.valid).toBe(false);
    });

    it('should reject empty string', () => {
      const result = ValidationService.validateAuthor('');
      expect(result.valid).toBe(false);
    });

    it('should reject author exceeding 100 chars', () => {
      const longAuthor = 'a'.repeat(101);
      const result = ValidationService.validateAuthor(longAuthor);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('100');
    });

    it('should accept exactly 100 characters', () => {
      const author = 'a'.repeat(100);
      const result = ValidationService.validateAuthor(author);
      expect(result.valid).toBe(true);
    });

    it('should allow single character', () => {
      const result = ValidationService.validateAuthor('A');
      expect(result.valid).toBe(true);
    });

    it('should handle names with apostrophes', () => {
      const result = ValidationService.validateAuthor("O'Brien");
      expect(result.valid).toBe(true);
    });

    it('should handle names with numbers', () => {
      const result = ValidationService.validateAuthor('John Doe 123');
      expect(result.valid).toBe(true);
    });

    it('should handle names with hyphens', () => {
      const result = ValidationService.validateAuthor('Mary-Jane Smith');
      expect(result.valid).toBe(true);
    });
  });

  describe('validateQuoteNumber', () => {
    it('should validate positive integer', () => {
      const result = ValidationService.validateQuoteNumber(5);
      expect(result.valid).toBe(true);
    });

    it('should validate string number', () => {
      const result = ValidationService.validateQuoteNumber('5');
      expect(result.valid).toBe(true);
    });

    it('should reject zero', () => {
      const result = ValidationService.validateQuoteNumber(0);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('greater than 0');
    });

    it('should reject negative', () => {
      const result = ValidationService.validateQuoteNumber(-5);
      expect(result.valid).toBe(false);
    });

    it('should reject NaN', () => {
      const result = ValidationService.validateQuoteNumber('abc');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('integer');
    });

    it('should accept 1', () => {
      const result = ValidationService.validateQuoteNumber(1);
      expect(result.valid).toBe(true);
    });

    it('should accept large numbers', () => {
      const result = ValidationService.validateQuoteNumber(999999);
      expect(result.valid).toBe(true);
    });

    it('should handle float numbers', () => {
      const result = ValidationService.validateQuoteNumber(5.5);
      expect(result.valid).toBe(true); // parseInt converts 5.5 to 5
    });

    it('should handle string float numbers', () => {
      const result = ValidationService.validateQuoteNumber('5.5');
      expect(result.valid).toBe(true);
    });

    it('should reject null', () => {
      const result = ValidationService.validateQuoteNumber(null);
      expect(result.valid).toBe(false);
    });

    it('should reject undefined', () => {
      const result = ValidationService.validateQuoteNumber(undefined);
      expect(result.valid).toBe(false);
    });

    it('should reject empty string', () => {
      const result = ValidationService.validateQuoteNumber('');
      expect(result.valid).toBe(false);
    });
  });

  describe('Integration scenarios', () => {
    it('should validate full quote creation', () => {
      const textResult = ValidationService.validateQuoteText('Great quote');
      const authorResult = ValidationService.validateAuthor('John Doe');

      expect(textResult.valid).toBe(true);
      expect(authorResult.valid).toBe(true);
    });

    it('should handle validation failures together', () => {
      const textResult = ValidationService.validateQuoteText('');
      const authorResult = ValidationService.validateAuthor('');

      expect(textResult.valid).toBe(false);
      expect(authorResult.valid).toBe(false);
    });

    it('should validate quote retrieval', () => {
      const numberResult = ValidationService.validateQuoteNumber(5);
      expect(numberResult.valid).toBe(true);
    });

    it('should validate in sequence for add quote', () => {
      const text = 'My favorite quote';
      const author = 'Einstein';

      const textValid = ValidationService.validateQuoteText(text);
      const authorValid = ValidationService.validateAuthor(author);

      expect(textValid.valid).toBe(true);
      expect(authorValid.valid).toBe(true);

      if (textValid.valid && authorValid.valid) {
        // Would proceed with add
        expect(true).toBe(true);
      }
    });
  });
});
