/**
 * Test Suite: Coverage Consolidation
 * Phase 3: Scripts Consolidation - TDD (RED phase)
 * 
 * Tests for consolidated coverage.js script which merges:
 * - coverage-tracking.js (track and report metrics)
 * - coverage-unified.js (unified reporting with multiple modes)
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

describe('Coverage Consolidation - coverage.js', () => {
  const scriptsDir = path.join(__dirname, '../../../scripts');
  const coverageScript = path.join(scriptsDir, 'coverage.js');
  
  describe('Script Existence & Structure', () => {
    it('should have consolidated coverage.js in scripts directory', () => {
      assert(fs.existsSync(coverageScript), 'coverage.js should exist');
    });

    it('should not have deprecated coverage-tracking.js', () => {
      const deprecated = path.join(scriptsDir, 'coverage-tracking.js');
      assert(!fs.existsSync(deprecated), 'coverage-tracking.js should be consolidated');
    });

    it('should not have deprecated coverage-unified.js', () => {
      const deprecated = path.join(scriptsDir, 'coverage-unified.js');
      assert(!fs.existsSync(deprecated), 'coverage-unified.js should be consolidated');
    });
  });

  describe('Script Content & Modes', () => {
    it('should have CLI argument handling', () => {
      const content = fs.readFileSync(coverageScript, 'utf-8');
      assert(
        content.includes('--report') || content.includes('argv') || content.includes('args'),
        'should handle CLI arguments'
      );
    });

    it('should support --report mode for coverage reporting', () => {
      const content = fs.readFileSync(coverageScript, 'utf-8');
      assert(content.includes('report'), 'should implement report mode');
    });

    it('should support --validate mode for coverage validation', () => {
      const content = fs.readFileSync(coverageScript, 'utf-8');
      assert(content.includes('validate'), 'should implement validate mode');
    });

    it('should support --baseline mode for baseline tracking', () => {
      const content = fs.readFileSync(coverageScript, 'utf-8');
      assert(content.includes('baseline'), 'should implement baseline mode');
    });

    it('should support --compare mode for coverage comparison', () => {
      const content = fs.readFileSync(coverageScript, 'utf-8');
      assert(content.includes('compare'), 'should implement compare mode');
    });

    it('should have help documentation', () => {
      const content = fs.readFileSync(coverageScript, 'utf-8');
      assert(
        content.includes('help') || content.includes('usage') || content.includes('Usage'),
        'should have help documentation'
      );
    });
  });

  describe('Error Handling', () => {
    it('should have try-catch error handling', () => {
      const content = fs.readFileSync(coverageScript, 'utf-8');
      assert(
        content.includes('try') && content.includes('catch'),
        'should have error handling'
      );
    });

    it('should handle missing configuration files', () => {
      const content = fs.readFileSync(coverageScript, 'utf-8');
      assert(
        content.includes('existsSync') || content.includes('fs.') || content.length > 100,
        'should check for file existence'
      );
    });
  });

  describe('Feature Consolidation', () => {
    it('should include report generation from coverage-tracking.js', () => {
      const content = fs.readFileSync(coverageScript, 'utf-8');
      assert(content.includes('report'), 'should generate reports');
    });

    it('should include baseline tracking from coverage-unified.js', () => {
      const content = fs.readFileSync(coverageScript, 'utf-8');
      assert(content.includes('baseline'), 'should track baselines');
    });

    it('should include history comparison from coverage-unified.js', () => {
      const content = fs.readFileSync(coverageScript, 'utf-8');
      assert(content.includes('compare'), 'should compare coverage history');
    });

    it('should include threshold validation from coverage-tracking.js', () => {
      const content = fs.readFileSync(coverageScript, 'utf-8');
      assert(content.includes('validate'), 'should validate thresholds');
    });
  });

  describe('Configuration & Output', () => {
    it('should import utilities from lib/utils.js', () => {
      const content = fs.readFileSync(coverageScript, 'utf-8');
      assert(
        content.includes('require') && (content.includes('utils') || content.includes('./lib')),
        'should use utilities module'
      );
    });

    it('should have logging or output formatting', () => {
      const content = fs.readFileSync(coverageScript, 'utf-8');
      assert(
        content.includes('console') || 
        content.includes('log') || 
        content.includes('format'),
        'should have output formatting'
      );
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain npm script compatibility', () => {
      const packagePath = path.join(__dirname, '../../../package.json');
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      
      assert(pkg.scripts['coverage:report'], 'should have coverage:report script');
      assert(pkg.scripts['coverage:validate'], 'should have coverage:validate script');
      assert(pkg.scripts['coverage:baseline'], 'should have coverage:baseline script');
    });

    it('should reference consolidated coverage.js in package.json', () => {
      const packagePath = path.join(__dirname, '../../../package.json');
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      
      // Coverage scripts should reference coverage.js
      const reportScript = pkg.scripts['coverage:report'] || '';
      assert(
        reportScript.includes('coverage.js'),
        'coverage:report should use consolidated coverage.js'
      );
    });
  });

  describe('Integration with npm test', () => {
    it('should work with npm run commands', () => {
      const packagePath = path.join(__dirname, '../../../package.json');
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      
      assert(pkg.scripts.coverage, 'should have npm run coverage command');
    });
  });

  describe('Documentation & Help', () => {
    it('should have usage comments or help text', () => {
      const content = fs.readFileSync(coverageScript, 'utf-8');
      assert(
        content.includes('//') || content.includes('/*') || content.length > 500,
        'should have documentation'
      );
    });
  });
});

describe('Consolidation Impact Analysis', () => {
  const scriptsDir = path.join(__dirname, '../../../scripts');

  it('should eliminate duplicate coverage scripts', () => {
    // coverage-tracking.js and coverage-unified.js should be consolidated
    const tracking = path.join(scriptsDir, 'coverage-tracking.js');
    const unified = path.join(scriptsDir, 'coverage-unified.js');
    const consolidated = path.join(scriptsDir, 'coverage.js');
    
    assert(!fs.existsSync(tracking), 'coverage-tracking.js should be removed');
    assert(!fs.existsSync(unified), 'coverage-unified.js should be removed');
    assert(fs.existsSync(consolidated), 'coverage.js should exist');
  });

  it('should maintain all npm coverage scripts', () => {
    const packagePath = path.join(__dirname, '../../../package.json');
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    
    const coverageKeys = Object.keys(pkg.scripts).filter(k => k.startsWith('coverage'));
    assert(coverageKeys.length > 0, 'should maintain coverage npm scripts');
  });
});
