/**
 * Unit Tests for CommandOptions
 * Testing command options builder
 */

const assert = require('assert');
const buildCommandOptions = require('../../src/core/CommandOptions');

describe('CommandOptions', () => {
  describe('buildCommandOptions()', () => {
    it('should create basic command options', () => {
      const { data, options } = buildCommandOptions('test', 'Test command');

      assert.ok(data);
      assert.ok(options);
      assert.strictEqual(data.name, 'test');
      assert.strictEqual(data.description, 'Test command');
    });

    it('should be a function', () => {
      assert.strictEqual(typeof buildCommandOptions, 'function');
    });

    it('should return object with data and options', () => {
      const result = buildCommandOptions('cmd', 'Description');

      assert.ok(result.data);
      assert.ok(result.options);
      assert.strictEqual(typeof result.data, 'object');
      assert.strictEqual(typeof result.options, 'object');
    });

    it('should handle undefined options parameter', () => {
      const { data, options } = buildCommandOptions('cmd', 'Desc');

      assert.ok(data);
      assert.ok(options);
    });

    it('should handle empty options array', () => {
      const { data, options } = buildCommandOptions('cmd', 'Desc', []);

      assert.ok(data);
      assert.ok(options);
    });

    it('should preserve command name', () => {
      const { data } = buildCommandOptions('mycommand', 'Description');

      assert.strictEqual(data.name, 'mycommand');
    });

    it('should preserve description', () => {
      const { data } = buildCommandOptions('cmd', 'My description');

      assert.strictEqual(data.description, 'My description');
    });
  });

  describe('Return Value Structure', () => {
    it('should always return object with data property', () => {
      const result = buildCommandOptions('test', 'Test');

      assert.ok(result.hasOwnProperty('data'));
      assert.ok(result.data);
    });

    it('should always return object with options property', () => {
      const result = buildCommandOptions('test', 'Test');

      assert.ok(result.hasOwnProperty('options'));
      assert.ok(result.options);
    });

    it('should support multiple calls with different commands', () => {
      const result1 = buildCommandOptions('cmd1', 'Command 1');
      const result2 = buildCommandOptions('cmd2', 'Command 2');

      assert.strictEqual(result1.data.name, 'cmd1');
      assert.strictEqual(result2.data.name, 'cmd2');
    });
  });

  describe('Option Builder Functionality', () => {
    it('should handle simple string options list', () => {
      const optionsList = [
        { name: 'test', type: 'string', description: 'Test option' },
      ];

      const { data, options } = buildCommandOptions('cmd', 'Desc', optionsList);

      assert.ok(data);
      assert.ok(options);
    });

    it('should handle multiple option types', () => {
      const optionsList = [
        { name: 'text', type: 'string', description: 'Text' },
        { name: 'count', type: 'number', description: 'Count' },
        { name: 'enabled', type: 'boolean', description: 'Enabled' },
      ];

      const { data, options } = buildCommandOptions('cmd', 'Desc', optionsList);

      assert.ok(options);
    });

    it('should support required flag', () => {
      const optionsList = [
        { name: 'required', type: 'string', required: true, description: 'Required' },
      ];

      const { data, options } = buildCommandOptions('cmd', 'Desc', optionsList);

      assert.ok(options);
    });

    it('should support optional flag', () => {
      const optionsList = [
        { name: 'optional', type: 'string', required: false, description: 'Optional' },
      ];

      const { data, options } = buildCommandOptions('cmd', 'Desc', optionsList);

      assert.ok(options);
    });
  });
});
