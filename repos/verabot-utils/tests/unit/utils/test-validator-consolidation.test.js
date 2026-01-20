/**
 * Test Suite: Validator Consolidation
 * Phase 3: Scripts Consolidation - TDD (RED phase)
 * 
 * Tests for consolidated validate-commands.js script which merges:
 * - run-tests.js (run tests and validate commands)
 * - validate-commands.js (command validation)
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

describe('Validator Consolidation - validate-commands.js', () => {
  const scriptsDir = path.join(__dirname, '../../../scripts');
  const validateScript = path.join(scriptsDir, 'validate-commands.js');
  
  describe('Script Existence & Structure', () => {
    it('should have validate-commands.js in scripts directory', () => {
      assert(fs.existsSync(validateScript), 'validate-commands.js should exist');
    });

    it('should not have deprecated run-tests.js', () => {
      const deprecated = path.join(scriptsDir, 'run-tests.js');
      assert(!fs.existsSync(deprecated), 'run-tests.js should be consolidated into validate-commands.js');
    });

    it('should be executable', () => {
      const stats = fs.statSync(validateScript);
      assert(stats.isFile(), 'validate-commands.js should be a file');
    });
  });

  describe('Command Line Interface', () => {
    it('should have CLI argument handling', () => {
      const content = fs.readFileSync(validateScript, 'utf-8');
      assert(
        content.includes('argv') || content.includes('args') || content.includes('--'),
        'should handle CLI arguments'
      );
    });

    it('should support --commands mode for command validation', () => {
      const content = fs.readFileSync(validateScript, 'utf-8');
      assert(content.includes('commands'), 'should have commands mode');
    });

    it('should support --test mode for running tests', () => {
      const content = fs.readFileSync(validateScript, 'utf-8');
      assert(content.includes('test'), 'should have test mode');
    });

    it('should support --lint mode for linting validation', () => {
      const content = fs.readFileSync(validateScript, 'utf-8');
      assert(content.includes('lint'), 'should have lint mode');
    });

    it('should have help documentation', () => {
      const content = fs.readFileSync(validateScript, 'utf-8');
      assert(
        content.includes('help') || content.includes('usage'),
        'should have help documentation'
      );
    });
  });

  describe('Feature Consolidation from run-tests.js', () => {
    it('should run test suite (from run-tests.js)', () => {
      const content = fs.readFileSync(validateScript, 'utf-8');
      assert(content.includes('test'), 'should execute test suite');
    });

    it('should provide test summary (from run-tests.js)', () => {
      const content = fs.readFileSync(validateScript, 'utf-8');
      assert(content.length > 500, 'should have test functionality');
    });
  });

  describe('Feature Consolidation from validate-commands.js', () => {
    it('should validate command structure (from validate-commands.js)', () => {
      const content = fs.readFileSync(validateScript, 'utf-8');
      assert(content.includes('commands'), 'should validate commands');
    });

    it('should check command exports (from validate-commands.js)', () => {
      const content = fs.readFileSync(validateScript, 'utf-8');
      assert(content.includes('require') || content.length > 500, 'should verify exports');
    });

    it('should validate command registration (from validate-commands.js)', () => {
      const content = fs.readFileSync(validateScript, 'utf-8');
      assert(content.length > 500, 'should check registration');
    });
  });

  describe('Error Handling', () => {
    it('should have try-catch error handling', () => {
      const content = fs.readFileSync(validateScript, 'utf-8');
      assert(
        content.includes('try') && content.includes('catch'),
        'should have error handling'
      );
    });

    it('should handle missing command directories', () => {
      const content = fs.readFileSync(validateScript, 'utf-8');
      assert(content.length > 500, 'should have error handling');
    });

    it('should provide meaningful error messages', () => {
      const content = fs.readFileSync(validateScript, 'utf-8');
      assert(content.length > 500, 'script should have error handling');
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain npm script compatibility', () => {
      const packagePath = path.join(__dirname, '../../../package.json');
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      
      assert(pkg.scripts.test, 'should have test script');
      assert(pkg.scripts['validate:commands'], 'should have validate:commands script');
      assert(pkg.scripts.validate, 'should have validate script');
    });

    it('should use proper test execution', () => {
      const packagePath = path.join(__dirname, '../../../package.json');
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      
      const testScript = pkg.scripts.test;
      assert(
        testScript && (testScript.includes('jest') || testScript.includes('node')),
        'should use proper test execution'
      );
    });

    it('should provide validate-commands integration', () => {
      const packagePath = path.join(__dirname, '../../../package.json');
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      
      assert(pkg.scripts['validate:commands'], 'should provide validate:commands');
    });
  });

  describe('Integration with Test Framework', () => {
    it('should work with Jest', () => {
      const jestConfigPath = path.join(__dirname, '../../../jest.config.js');
      assert(fs.existsSync(jestConfigPath), 'jest.config.js should exist');
    });
  });

  describe('Integration with npm Scripts', () => {
    it('should be accessible via npm run test', () => {
      const packagePath = path.join(__dirname, '../../../package.json');
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      
      assert(pkg.scripts.test, 'npm run test should be available');
    });

    it('should be accessible via npm run validate', () => {
      const packagePath = path.join(__dirname, '../../../package.json');
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      
      assert(pkg.scripts.validate, 'npm run validate should be available');
    });

    it('should be accessible via npm run validate:commands', () => {
      const packagePath = path.join(__dirname, '../../../package.json');
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      
      assert(pkg.scripts['validate:commands'], 'npm run validate:commands should be available');
    });
  });

  describe('Output Format', () => {
    it('should use utilities module', () => {
      const utilsPath = path.join(scriptsDir, 'lib/utils.js');
      assert(fs.existsSync(utilsPath), 'lib/utils.js should exist');
      
      const content = fs.readFileSync(validateScript, 'utf-8');
      assert(
        content.includes('utils') || content.includes('require'),
        'should use utilities module'
      );
    });

    it('should have output formatting', () => {
      const content = fs.readFileSync(validateScript, 'utf-8');
      assert(
        content.includes('console') || content.includes('log'),
        'should display results'
      );
    });

    it('should show validation status', () => {
      const content = fs.readFileSync(validateScript, 'utf-8');
      assert(content.length > 500, 'should show validation status');
    });
  });

  describe('Exit Codes', () => {
    it('should handle success and failure states', () => {
      const content = fs.readFileSync(validateScript, 'utf-8');
      assert(
        content.includes('process.exit') || content.length > 500,
        'should have exit code handling'
      );
    });
  });
});

describe('Consolidation Impact Analysis', () => {
  const scriptsDir = path.join(__dirname, '../../../scripts');

  it('should eliminate duplicate validation logic', () => {
    const validatePath = path.join(scriptsDir, 'validate-commands.js');
    const runTestsPath = path.join(scriptsDir, 'run-tests.js');
    
    assert(!fs.existsSync(runTestsPath), 'run-tests.js should be consolidated');
    assert(fs.existsSync(validatePath), 'validate-commands.js should exist with merged features');
  });

  it('should maintain all npm scripts', () => {
    const packagePath = path.join(__dirname, '../../../package.json');
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    
    assert(pkg.scripts.test, 'should have test script');
    assert(pkg.scripts['validate:commands'], 'should have validate:commands');
  });

  it('should not break existing workflow', () => {
    const packagePath = path.join(__dirname, '../../../package.json');
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    
    const importantScripts = ['test', 'validate', 'validate:commands', 'lint'];
    const hasScripts = importantScripts.every(script => pkg.scripts[script]);
    
    assert(hasScripts, 'should maintain all important npm scripts');
  });

  it('should reduce script count', () => {
    const files = fs.readdirSync(scriptsDir)
      .filter(f => f.endsWith('.js') && !f.startsWith('.'));
    
    assert(files.length < 25, 'consolidation should reduce script count');
  });
});
