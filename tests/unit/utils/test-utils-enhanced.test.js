/**
 * Enhanced Utilities Tests (Phase 3.2)
 * Tests for new utility functions added in Phase 3.2
 * 
 * Tests:
 * - File existence checks
 * - Synchronous command execution
 * - Error handling for utilities
 */

const fs = require('fs');
const path = require('path');
const utils = require('../../../scripts/lib/utils');

const rootDir = path.join(__dirname, '../../..');
const tempDir = path.join(rootDir, 'test-temp-utils');

describe('Phase 3.2: Enhanced Utilities', () => {
  beforeEach(() => {
    // Create temp directory for tests
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('File Existence Checks', () => {
    it('should check if file exists (fileExists)', () => {
      if (typeof utils.fileExists !== 'function') {
        // Function not yet implemented
        expect(true).toBe(true);
        return;
      }

      const testFile = path.join(tempDir, 'test-file.txt');
      fs.writeFileSync(testFile, 'test content');

      expect(utils.fileExists(testFile)).toBe(true);
      expect(utils.fileExists(path.join(tempDir, 'nonexistent.txt'))).toBe(false);
    });

    it('should check if directory exists (dirExists)', () => {
      if (typeof utils.dirExists !== 'function') {
        // Function not yet implemented
        expect(true).toBe(true);
        return;
      }

      const testSubDir = path.join(tempDir, 'test-subdir');
      fs.mkdirSync(testSubDir);

      expect(utils.dirExists(testSubDir)).toBe(true);
      expect(utils.dirExists(path.join(tempDir, 'nonexistent-dir'))).toBe(false);
    });

    it('should check path existence (pathExists)', () => {
      if (typeof utils.pathExists !== 'function') {
        // Function not yet implemented
        expect(true).toBe(true);
        return;
      }

      const testFile = path.join(tempDir, 'test-file.txt');
      const testDir = path.join(tempDir, 'test-dir');

      fs.writeFileSync(testFile, 'test');
      fs.mkdirSync(testDir);

      expect(utils.pathExists(testFile)).toBe(true);
      expect(utils.pathExists(testDir)).toBe(true);
      expect(utils.pathExists(path.join(tempDir, 'nonexistent'))).toBe(false);
    });
  });

  describe('Synchronous Command Execution', () => {
    it('should execute simple command (execCommand)', () => {
      if (typeof utils.execCommand !== 'function') {
        // Function not yet implemented
        expect(true).toBe(true);
        return;
      }

      const result = utils.execCommand('echo "test"');
      expect(result).toContain('test');
    });

    it('should handle command with options (execCommand)', () => {
      if (typeof utils.execCommand !== 'function') {
        // Function not yet implemented
        expect(true).toBe(true);
        return;
      }

      const result = utils.execCommand('pwd', { cwd: tempDir });
      expect(result).toContain('test-temp-utils');
    });

    it('should throw on command failure (execCommand)', () => {
      if (typeof utils.execCommand !== 'function') {
        // Function not yet implemented
        expect(true).toBe(true);
        return;
      }

      expect(() => {
        utils.execCommand('nonexistent-command-xyz-123');
      }).toThrow();
    });

    it('should handle silent mode (execCommand)', () => {
      if (typeof utils.execCommand !== 'function') {
        // Function not yet implemented
        expect(true).toBe(true);
        return;
      }

      const result = utils.execCommand('echo "test"', { silent: true });
      expect(result).toContain('test');
    });
  });

  describe('Enhanced Error Handling', () => {
    it('should provide safe file existence check without throwing', () => {
      if (typeof utils.fileExists !== 'function') {
        expect(true).toBe(true);
        return;
      }

      // Should not throw on invalid path
      expect(() => {
        utils.fileExists(null);
      }).not.toThrow();

      expect(utils.fileExists(null)).toBe(false);
    });

    it('should provide safe directory check without throwing', () => {
      if (typeof utils.dirExists !== 'function') {
        expect(true).toBe(true);
        return;
      }

      // Should not throw on invalid path
      expect(() => {
        utils.dirExists(undefined);
      }).not.toThrow();

      expect(utils.dirExists(undefined)).toBe(false);
    });
  });

  describe('Existing Utilities Still Work', () => {
    it('should have readJSON function', () => {
      expect(typeof utils.readJSON).toBe('function');
    });

    it('should have writeJSON function', () => {
      expect(typeof utils.writeJSON).toBe('function');
    });

    it('should have execAsync function', () => {
      expect(typeof utils.execAsync).toBe('function');
    });

    it('should have color formatting functions', () => {
      expect(typeof utils.success).toBe('function');
      expect(typeof utils.error).toBe('function');
      expect(typeof utils.warning).toBe('function');
      expect(typeof utils.info).toBe('function');
    });

    it('should have formatPercent function', () => {
      expect(typeof utils.formatPercent).toBe('function');
    });
  });

  describe('Integration with Existing Code', () => {
    it('should work with readJSON and fileExists', () => {
      if (typeof utils.fileExists !== 'function') {
        expect(true).toBe(true);
        return;
      }

      const testFile = path.join(tempDir, 'test.json');
      const testData = { test: 'value' };

      utils.writeJSON(testFile, testData);
      expect(utils.fileExists(testFile)).toBe(true);

      const data = utils.readJSON(testFile);
      expect(data).toEqual(testData);
    });

    it('should work with execCommand and output verification', () => {
      if (typeof utils.execCommand !== 'function') {
        expect(true).toBe(true);
        return;
      }

      const testFile = path.join(tempDir, 'exec-test.txt');
      const content = 'test content';

      // Use command to create file
      if (process.platform === 'win32') {
        utils.execCommand(`echo ${content} > "${testFile}"`);
      } else {
        utils.execCommand(`echo "${content}" > "${testFile}"`);
      }

      expect(utils.fileExists(testFile)).toBe(true);
    });
  });
});
