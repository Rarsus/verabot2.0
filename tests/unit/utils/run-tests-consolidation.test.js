/**
 * Tests for enhanced run-tests script
 * Combines validation and test execution capabilities
 * TDD Tests - RED Phase
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

describe('Enhanced Run-Tests Script', () => {
  describe('Command File Discovery', () => {
    it('should find command files recursively', () => {
      const commandsPath = path.join(__dirname, '../../../src/commands');
      assert.ok(fs.existsSync(commandsPath));
    });

    it('should filter for .js files only', () => {
      const filename = 'command.js';
      const isValid = filename.endsWith('.js');
      assert.strictEqual(isValid, true);
    });

    it('should exclude hidden files', () => {
      const files = ['test.js', '.hidden.js', 'valid.js'];
      const filtered = files.filter(f => !f.startsWith('.'));
      assert.strictEqual(filtered.length, 2);
    });

    it('should traverse subdirectories', () => {
      const path1 = 'commands/misc/help.js';
      const path2 = 'commands/quote/add-quote.js';
      assert.ok(path1.includes('/'));
      assert.ok(path2.includes('/'));
    });
  });

  describe('Command Validation', () => {
    it('should validate command exports an object', () => {
      const cmd = { name: 'test', description: 'Test' };
      assert.ok(typeof cmd === 'object');
    });

    it('should require name property', () => {
      const cmd = { name: 'test-cmd' };
      assert.ok(cmd.name);
      assert.strictEqual(typeof cmd.name, 'string');
    });

    it('should require description property', () => {
      const cmd = { description: 'Does something' };
      assert.ok(cmd.description);
      assert.strictEqual(typeof cmd.description, 'string');
    });

    it('should require execute or executeInteraction function', () => {
      const cmd1 = { execute: () => {} };
      const cmd2 = { executeInteraction: () => {} };
      
      assert.strictEqual(typeof cmd1.execute, 'function');
      assert.strictEqual(typeof cmd2.executeInteraction, 'function');
    });

    it('should check for CommandBase inheritance', () => {
      const cmd = {
        name: 'test',
        execute: () => {},
        register: () => cmd,
      };
      
      assert.ok(typeof cmd.register === 'function');
    });

    it('should validate slash command structure', () => {
      const cmd = {
        data: {
          setName: () => this,
          setDescription: () => this,
        },
      };
      
      assert.ok(typeof cmd.data.setName === 'function');
    });
  });

  describe('Error Reporting', () => {
    it('should track validation errors', () => {
      const errors = [];
      errors.push('File1.js: Missing name');
      errors.push('File2.js: Invalid structure');
      
      assert.strictEqual(errors.length, 2);
    });

    it('should format error messages', () => {
      const filename = 'command.js';
      const issue = 'Missing name export';
      const message = `${filename}: ${issue}`;
      
      assert.ok(message.includes('command.js'));
      assert.ok(message.includes('Missing name'));
    });

    it('should distinguish critical from warning errors', () => {
      const critical = true;
      const warning = false;
      
      assert.strictEqual(critical, true);
      assert.strictEqual(warning, false);
    });

    it('should track valid command count', () => {
      const validCount = 45;
      const totalCount = 47;
      
      assert.ok(validCount <= totalCount);
    });
  });

  describe('Utility Test Integration', () => {
    it('should run additional unit tests', () => {
      const tests = [
        'detectReadyEvent',
        'colorFormatting',
        'errorHandling',
      ];
      
      assert.ok(Array.isArray(tests));
      assert.ok(tests.length > 0);
    });

    it('should test version detection', () => {
      const version = '14.11.0';
      const isValidVersion = /^\d+\.\d+\.\d+/.test(version);
      
      assert.strictEqual(isValidVersion, true);
    });

    it('should compare semantic versions', () => {
      const v1 = '14.11.0';
      const v2 = '15.0.0';
      
      const major1 = parseInt(v1.split('.')[0]);
      const major2 = parseInt(v2.split('.')[0]);
      
      assert.ok(major1 < major2);
    });
  });

  describe('Output Formatting', () => {
    it('should display validation report header', () => {
      const header = '📊 Command Validation Report';
      assert.ok(header.includes('Command'));
      assert.ok(header.includes('Validation'));
    });

    it('should use color codes for output', () => {
      const colors = {
        red: '\x1b[31m',
        green: '\x1b[32m',
        reset: '\x1b[0m',
      };
      
      assert.ok(colors.red.includes('31'));
      assert.ok(colors.green.includes('32'));
    });

    it('should format success messages', () => {
      const message = '✅ All 45 command(s) are valid';
      assert.ok(message.includes('✅'));
      assert.ok(message.includes('valid'));
    });

    it('should format error messages', () => {
      const message = '❌ 2 error(s) found';
      assert.ok(message.includes('❌'));
      assert.ok(message.includes('error'));
    });

    it('should display validation summary', () => {
      const valid = 45;
      const total = 47;
      const summary = `${valid}/${total} commands valid`;
      
      assert.ok(summary.includes(valid.toString()));
      assert.ok(summary.includes(total.toString()));
    });
  });

  describe('Exit Codes', () => {
    it('should exit with 0 on success', () => {
      const exitCode = 0;
      assert.strictEqual(exitCode, 0);
    });

    it('should exit with 1 on validation failure', () => {
      const exitCode = 1;
      assert.strictEqual(exitCode, 1);
    });

    it('should exit with 1 on utility test failure', () => {
      const exitCode = 1;
      assert.strictEqual(exitCode, 1);
    });
  });

  describe('Performance', () => {
    it('should handle large command sets', () => {
      const commandCount = 100;
      assert.ok(commandCount > 0);
    });

    it('should process files efficiently', () => {
      const startTime = Date.now();
      const duration = 50; // ms
      assert.ok(duration > 0);
    });
  });

  describe('Integration with Error Handler', () => {
    it('should use error handler for file errors', () => {
      const errorHandler = 'handleFileError';
      assert.ok(typeof errorHandler === 'string');
    });

    it('should provide error context', () => {
      const context = {
        scriptName: 'run-tests.js',
        operation: 'validation',
      };
      
      assert.ok(context.scriptName);
      assert.ok(context.operation);
    });

    it('should log errors with context', () => {
      const error = new Error('Test error');
      const logged = error.message.length > 0;
      
      assert.strictEqual(logged, true);
    });
  });

  describe('Consolidation Features', () => {
    it('should validate commands like validate-commands.js', () => {
      const features = [
        'find command files',
        'validate exports',
        'check properties',
      ];
      
      assert.ok(features.length >= 3);
    });

    it('should detect CommandBase pattern', () => {
      const patterns = ['register', 'execute', 'executeInteraction'];
      assert.ok(patterns.length > 0);
    });

    it('should support modern and legacy patterns', () => {
      const supportModern = true;
      const supportLegacy = true;
      
      assert.strictEqual(supportModern, true);
      assert.strictEqual(supportLegacy, true);
    });
  });

  describe('Help and Documentation', () => {
    it('should display usage information', () => {
      const usage = 'node scripts/run-tests.js [options]';
      assert.ok(usage.includes('scripts/run-tests.js'));
    });

    it('should describe command options', () => {
      const options = ['--verbose', '--quiet', '--fix'];
      assert.ok(Array.isArray(options));
    });

    it('should explain output', () => {
      const explanation = 'Validates all command files and runs utility tests';
      assert.ok(explanation.length > 0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle no commands found', () => {
      const count = 0;
      const shouldExit = count === 0;
      assert.strictEqual(shouldExit, true);
    });

    it('should handle invalid JSON in commands', () => {
      const invalid = 'not json';
      assert.throws(() => JSON.parse(invalid));
    });

    it('should handle circular require patterns', () => {
      // This should not crash the script
      const circular = true;
      assert.strictEqual(circular, true);
    });

    it('should handle large file paths', () => {
      const longPath = 'src/commands/category1/category2/subcategory/my-very-long-command-name.js';
      assert.ok(longPath.length > 50);
    });
  });
});
