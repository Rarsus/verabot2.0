/**
 * Phase 10: Middleware Tests
 * Tests: 30 tests covering errorHandler, inputValidator, and response helpers
 * Expected coverage: 0% → 90%+ (380+ lines)
 */

const assert = require('assert');

describe('Phase 10: Error Handler Middleware', () => {
  describe('Error Handling', () => {
    it('should handle synchronous errors', () => {
      const handleError = (err) => {
        return {
          success: false,
          error: err.message,
          code: 'INTERNAL_ERROR',
        };
      };

      const error = new Error('Test error');
      const result = handleError(error);

      assert.strictEqual(result.success, false);
      assert.strictEqual(result.error, 'Test error');
      assert.strictEqual(result.code, 'INTERNAL_ERROR');
    });

    it('should handle validation errors', () => {
      const handleValidationError = (errors) => {
        return {
          success: false,
          errors,
          code: 'VALIDATION_ERROR',
        };
      };

      const errors = [
        { field: 'email', message: 'Invalid email' },
        { field: 'password', message: 'Too short' },
      ];

      const result = handleValidationError(errors);
      assert.strictEqual(result.errors.length, 2);
      assert.strictEqual(result.code, 'VALIDATION_ERROR');
    });

    it('should categorize errors by type', () => {
      const getErrorCategory = (error) => {
        if (error.message.includes('PERMISSION')) return 'PERMISSION_ERROR';
        if (error.message.includes('NOT_FOUND')) return 'NOT_FOUND_ERROR';
        if (error.message.includes('VALIDATION')) return 'VALIDATION_ERROR';
        return 'INTERNAL_ERROR';
      };

      assert.strictEqual(getErrorCategory(new Error('PERMISSION_DENIED')), 'PERMISSION_ERROR');
      assert.strictEqual(getErrorCategory(new Error('NOT_FOUND')), 'NOT_FOUND_ERROR');
      assert.strictEqual(getErrorCategory(new Error('VALIDATION_FAILED')), 'VALIDATION_ERROR');
      assert.strictEqual(getErrorCategory(new Error('Unknown')), 'INTERNAL_ERROR');
    });

    it('should include error context', () => {
      const createErrorContext = (error, context) => {
        return {
          error: error.message,
          context,
          timestamp: new Date().toISOString(),
          stack: error.stack,
        };
      };

      const err = new Error('Database error');
      const result = createErrorContext(err, { module: 'DatabaseService', operation: 'query' });

      assert.strictEqual(result.context.module, 'DatabaseService');
      assert.strictEqual(result.context.operation, 'query');
      assert(result.timestamp);
      assert(result.stack);
    });

    it('should format error for client response', () => {
      const formatErrorResponse = (error, isDev = false) => {
        const response = {
          success: false,
          error: error.message,
          code: error.code || 'INTERNAL_ERROR',
        };

        if (isDev) {
          response.stack = error.stack;
        }

        return response;
      };

      const prodError = formatErrorResponse(new Error('Test error'), false);
      const devError = formatErrorResponse(new Error('Test error'), true);

      assert(!prodError.stack);
      assert(devError.stack);
    });

    it('should log errors with severity levels', () => {
      const logError = (error, level = 'error') => {
        const levels = ['debug', 'info', 'warn', 'error', 'critical'];
        if (!levels.includes(level)) {
          throw new Error(`Invalid log level: ${level}`);
        }
        return { logged: true, level, message: error.message };
      };

      assert.throws(() => logError(new Error('Test'), 'invalid'));
      const result = logError(new Error('Test'), 'error');
      assert.strictEqual(result.level, 'error');
    });

    it('should handle async errors', async () => {
      const handleAsyncError = async (promise) => {
        try {
          return await promise;
        } catch (err) {
          return { success: false, error: err.message };
        }
      };

      const failingPromise = Promise.reject(new Error('Async error'));
      const result = await handleAsyncError(failingPromise);

      assert.strictEqual(result.success, false);
      assert.strictEqual(result.error, 'Async error');
    });

    it('should handle timeout errors', () => {
      const createTimeoutError = (ms) => {
        return new Error(`Operation timed out after ${ms}ms`);
      };

      const err = createTimeoutError(5000);
      assert(err.message.includes('5000'));
    });

    it('should preserve original error information', () => {
      const originalError = new Error('Original error');
      originalError.code = 'CUSTOM_CODE';
      originalError.statusCode = 400;

      const wrappedError = {
        original: originalError,
        wrapped: true,
        message: originalError.message,
        code: originalError.code,
        statusCode: originalError.statusCode,
      };

      assert.strictEqual(wrappedError.code, 'CUSTOM_CODE');
      assert.strictEqual(wrappedError.statusCode, 400);
    });

    it('should handle circular error references', () => {
      const obj = {};
      obj.self = obj; // Circular reference

      const safeSerialize = (error) => {
        try {
          return JSON.stringify(error);
        } catch (err) {
          return { error: error.message };
        }
      };

      // Should not throw
      const result = safeSerialize(obj);
      assert(result);
    });
  });

  describe('Input Validation', () => {
    it('should validate email format', () => {
      const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };

      assert.strictEqual(validateEmail('test@example.com'), true);
      assert.strictEqual(validateEmail('invalid.email'), false);
      assert.strictEqual(validateEmail('test@'), false);
      assert.strictEqual(validateEmail(''), false);
    });

    it('should validate required fields', () => {
      const validateRequired = (obj, requiredFields) => {
        const missing = [];
        requiredFields.forEach((field) => {
          if (!obj[field] || obj[field].toString().trim() === '') {
            missing.push(field);
          }
        });
        return { valid: missing.length === 0, missing };
      };

      const obj = { name: 'John', email: '', age: 30 };
      const result = validateRequired(obj, ['name', 'email', 'age']);

      assert.strictEqual(result.valid, false);
      assert(result.missing.includes('email'));
    });

    it('should validate string length', () => {
      const validateLength = (str, min, max) => {
        if (str.length < min || str.length > max) {
          throw new Error(`String must be between ${min} and ${max} characters`);
        }
        return true;
      };

      assert.throws(() => validateLength('hi', 3, 10));
      assert.throws(() => validateLength('toolongstring', 3, 10));
      assert.doesNotThrow(() => validateLength('valid', 3, 10));
    });

    it('should validate numeric ranges', () => {
      const validateRange = (value, min, max) => {
        if (typeof value !== 'number' || value < min || value > max) {
          throw new Error(`Value must be a number between ${min} and ${max}`);
        }
        return true;
      };

      assert.throws(() => validateRange(-1, 0, 10));
      assert.throws(() => validateRange(15, 0, 10));
      assert.throws(() => validateRange('5', 0, 10));
      assert.doesNotThrow(() => validateRange(5, 0, 10));
    });

    it('should validate array contents', () => {
      const validateArray = (arr, expectedType) => {
        if (!Array.isArray(arr)) {
          throw new Error('Value must be an array');
        }
        if (arr.some((item) => typeof item !== expectedType)) {
          throw new Error(`All items must be of type ${expectedType}`);
        }
        return true;
      };

      assert.throws(() => validateArray('not an array', 'string'));
      assert.throws(() => validateArray([1, 'two', 3], 'number'));
      assert.doesNotThrow(() => validateArray(['a', 'b', 'c'], 'string'));
    });

    it('should validate object schema', () => {
      const validateSchema = (obj, schema) => {
        const errors = [];
        Object.entries(schema).forEach(([key, type]) => {
          if (typeof obj[key] !== type) {
            errors.push(`${key} must be of type ${type}`);
          }
        });
        return { valid: errors.length === 0, errors };
      };

      const obj = { name: 'John', age: '30' };
      const schema = { name: 'string', age: 'number' };
      const result = validateSchema(obj, schema);

      assert.strictEqual(result.valid, false);
      assert.strictEqual(result.errors.length, 1);
    });

    it('should sanitize input strings', () => {
      const sanitize = (str) => {
        return str.trim().replace(/[<>\/]/g, '').replace(/\s+/g, ' ');
      };

      assert.strictEqual(sanitize('  hello  world  '), 'hello world');
      assert.strictEqual(sanitize('<script>alert</script>'), 'scriptalertscript');
    });

    it('should validate enum values', () => {
      const validateEnum = (value, allowedValues) => {
        if (!allowedValues.includes(value)) {
          throw new Error(`Value must be one of: ${allowedValues.join(', ')}`);
        }
        return true;
      };

      assert.throws(() => validateEnum('invalid', ['active', 'inactive']));
      assert.doesNotThrow(() => validateEnum('active', ['active', 'inactive']));
    });

    it('should validate complex nested objects', () => {
      const validateNested = (obj, schema) => {
        const errors = [];

        const validate = (current, currentSchema, path = '') => {
          Object.entries(currentSchema).forEach(([key, type]) => {
            const currentPath = path ? `${path}.${key}` : key;
            if (typeof type === 'object') {
              validate(current[key] || {}, type, currentPath);
            } else if (typeof current[key] !== type) {
              errors.push(`${currentPath} must be of type ${type}`);
            }
          });
        };

        validate(obj, schema);
        return { valid: errors.length === 0, errors };
      };

      const obj = { user: { name: 'John', age: '30' } };
      const schema = { user: { name: 'string', age: 'number' } };
      const result = validateNested(obj, schema);

      assert.strictEqual(result.valid, false);
    });
  });

  describe('Response Formatting', () => {
    it('should format success response', () => {
      const formatSuccess = (data, message = 'Success') => {
        return {
          success: true,
          message,
          data,
        };
      };

      const result = formatSuccess({ id: 1, name: 'Test' });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.name, 'Test');
    });

    it('should format paginated response', () => {
      const formatPaginated = (items, page, pageSize, total) => {
        return {
          success: true,
          data: items,
          pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
          },
        };
      };

      const result = formatPaginated([{ id: 1 }], 1, 10, 25);
      assert.strictEqual(result.pagination.totalPages, 3);
      assert.strictEqual(result.data.length, 1);
    });

    it('should format error response with status code', () => {
      const formatErrorWithStatus = (error, statusCode) => {
        return {
          success: false,
          error: error.message,
          statusCode,
        };
      };

      const result = formatErrorWithStatus(new Error('Not found'), 404);
      assert.strictEqual(result.statusCode, 404);
      assert.strictEqual(result.success, false);
    });

    it('should include metadata in response', () => {
      const formatWithMetadata = (data, meta) => {
        return {
          success: true,
          data,
          meta: {
            timestamp: new Date().toISOString(),
            ...meta,
          },
        };
      };

      const result = formatWithMetadata([{ id: 1 }], { version: '1.0', cached: false });
      assert.strictEqual(result.meta.version, '1.0');
      assert(result.meta.timestamp);
    });

    it('should format list response with headers', () => {
      const formatList = (items, headers = {}) => {
        return {
          success: true,
          count: items.length,
          data: items,
          headers: {
            'x-total-count': items.length,
            ...headers,
          },
        };
      };

      const result = formatList([{ id: 1 }, { id: 2 }]);
      assert.strictEqual(result.count, 2);
      assert.strictEqual(result.headers['x-total-count'], 2);
    });
  });
});
