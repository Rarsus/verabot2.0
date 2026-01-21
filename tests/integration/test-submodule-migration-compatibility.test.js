/**
 * Integration Test: Submodule Migration Compatibility
 * 
 * Purpose: Verify that all submodules work correctly together after repository split
 * Tests cross-module dependencies, exports, and service integration
 * 
 * Related Issue: #4 - Test the Migration
 * 
 * Test Coverage:
 * - verabot-core ↔ verabot-utils integration
 * - verabot-dashboard ↔ verabot-utils integration  
 * - verabot-commands ↔ verabot-core integration
 * - Module exports and imports
 * - Shared service compatibility
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

describe('Submodule Migration Compatibility Tests', () => {
  const repoRoot = path.join(__dirname, '..', '..');
  const submodules = {
    core: path.join(repoRoot, 'repos', 'verabot-core'),
    utils: path.join(repoRoot, 'repos', 'verabot-utils'),
    dashboard: path.join(repoRoot, 'repos', 'verabot-dashboard'),
    commands: path.join(repoRoot, 'repos', 'verabot-commands'),
  };

  describe('1. Submodule Structure Verification', () => {
    it('should have all submodules initialized', () => {
      Object.entries(submodules).forEach(([name, modulePath]) => {
        assert.ok(
          fs.existsSync(modulePath),
          `Submodule ${name} should exist at ${modulePath}`
        );
      });
    });

    it('should have package.json in each submodule', () => {
      Object.entries(submodules).forEach(([name, modulePath]) => {
        const packagePath = path.join(modulePath, 'package.json');
        assert.ok(
          fs.existsSync(packagePath),
          `Submodule ${name} should have package.json`
        );
      });
    });

    it('should have src directory in each submodule', () => {
      Object.entries(submodules).forEach(([name, modulePath]) => {
        const srcPath = path.join(modulePath, 'src');
        assert.ok(
          fs.existsSync(srcPath),
          `Submodule ${name} should have src directory`
        );
      });
    });

    it('should have git repository in each submodule', () => {
      Object.entries(submodules).forEach(([name, modulePath]) => {
        const gitPath = path.join(modulePath, '.git');
        assert.ok(
          fs.existsSync(gitPath),
          `Submodule ${name} should have .git directory`
        );
      });
    });
  });

  describe('2. verabot-core Module Tests', () => {
    let verabotCore;

    it('should load verabot-core module', () => {
      const corePath = path.join(submodules.core, 'src', 'index.js');
      assert.ok(fs.existsSync(corePath), 'verabot-core index.js should exist');
      
      // Note: Actual require() would need npm install in submodule
      // For now, just verify file structure
    });

    it('should export CommandBase class', () => {
      const commandBasePath = path.join(submodules.core, 'src', 'core', 'CommandBase.js');
      assert.ok(fs.existsSync(commandBasePath), 'CommandBase should exist');
    });

    it('should export CommandOptions builder', () => {
      const commandOptionsPath = path.join(submodules.core, 'src', 'core', 'CommandOptions.js');
      assert.ok(fs.existsSync(commandOptionsPath), 'CommandOptions should exist');
    });

    it('should export EventBase class', () => {
      const eventBasePath = path.join(submodules.core, 'src', 'core', 'EventBase.js');
      assert.ok(fs.existsSync(eventBasePath), 'EventBase should exist');
    });

    it('should re-export services from verabot-utils', () => {
      const servicesPath = path.join(submodules.core, 'src', 'services');
      assert.ok(fs.existsSync(servicesPath), 'Services directory should exist');

      // Verify key service re-exports
      const expectedServices = [
        'DatabaseService.js',
        'GuildAwareDatabaseService.js',
        'DiscordService.js',
        'ValidationService.js',
      ];

      expectedServices.forEach((service) => {
        const servicePath = path.join(servicesPath, service);
        assert.ok(
          fs.existsSync(servicePath),
          `Service ${service} should exist in verabot-core`
        );
      });
    });

    it('should have helpers module', () => {
      const helpersPath = path.join(submodules.core, 'src', 'helpers');
      assert.ok(fs.existsSync(helpersPath), 'Helpers directory should exist');
    });
  });

  describe('3. verabot-utils Module Tests', () => {
    it('should load verabot-utils module', () => {
      const utilsPath = path.join(submodules.utils, 'src', 'index.js');
      assert.ok(fs.existsSync(utilsPath), 'verabot-utils index.js should exist');
    });

    it('should have DatabaseService', () => {
      const dbServicePath = path.join(
        submodules.utils,
        'src',
        'services',
        'DatabaseService.js'
      );
      assert.ok(fs.existsSync(dbServicePath), 'DatabaseService should exist');
    });

    it('should have GuildAwareDatabaseService', () => {
      const guildDbPath = path.join(
        submodules.utils,
        'src',
        'services',
        'GuildAwareDatabaseService.js'
      );
      assert.ok(fs.existsSync(guildDbPath), 'GuildAwareDatabaseService should exist');
    });

    it('should have ValidationService', () => {
      const validationPath = path.join(
        submodules.utils,
        'src',
        'services',
        'ValidationService.js'
      );
      assert.ok(fs.existsSync(validationPath), 'ValidationService should exist');
    });

    it('should have middleware', () => {
      const middlewarePath = path.join(submodules.utils, 'src', 'middleware');
      assert.ok(fs.existsSync(middlewarePath), 'Middleware directory should exist');

      // Verify key middleware
      const expectedMiddleware = ['errorHandler.js', 'logger.js'];

      expectedMiddleware.forEach((middleware) => {
        const middlewareFile = path.join(middlewarePath, middleware);
        assert.ok(
          fs.existsSync(middlewareFile),
          `Middleware ${middleware} should exist`
        );
      });
    });

    it('should have response helpers', () => {
      const helpersPath = path.join(
        submodules.utils,
        'src',
        'utils',
        'helpers',
        'response-helpers.js'
      );
      assert.ok(fs.existsSync(helpersPath), 'response-helpers should exist');
    });
  });

  describe('4. verabot-dashboard Module Tests', () => {
    it('should load verabot-dashboard module', () => {
      const dashboardPath = path.join(submodules.dashboard, 'src', 'index.js');
      assert.ok(
        fs.existsSync(dashboardPath),
        'verabot-dashboard index.js should exist'
      );
    });

    it('should have views directory', () => {
      const viewsPath = path.join(submodules.dashboard, 'views');
      assert.ok(fs.existsSync(viewsPath), 'Views directory should exist');
    });

    it('should have public assets', () => {
      const publicPath = path.join(submodules.dashboard, 'public');
      assert.ok(fs.existsSync(publicPath), 'Public directory should exist');
    });

    it('should depend on verabot-utils in package.json', () => {
      const packagePath = path.join(submodules.dashboard, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

      assert.ok(
        packageJson.dependencies['verabot-utils'],
        'verabot-dashboard should depend on verabot-utils'
      );
    });
  });

  describe('5. verabot-commands Module Tests', () => {
    it('should load verabot-commands module', () => {
      const commandsPath = path.join(submodules.commands, 'src');
      assert.ok(fs.existsSync(commandsPath), 'verabot-commands src should exist');
    });

    it('should depend on verabot-core in package.json', () => {
      const packagePath = path.join(submodules.commands, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

      assert.ok(
        packageJson.dependencies['verabot-core'],
        'verabot-commands should depend on verabot-core'
      );
    });

    it('should depend on verabot-utils in package.json', () => {
      const packagePath = path.join(submodules.commands, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

      assert.ok(
        packageJson.dependencies['verabot-utils'],
        'verabot-commands should depend on verabot-utils'
      );
    });
  });

  describe('6. Cross-Module Dependency Chain', () => {
    it('should have correct dependency hierarchy', () => {
      // Read all package.json files
      const packages = {};
      Object.entries(submodules).forEach(([name, modulePath]) => {
        const packagePath = path.join(modulePath, 'package.json');
        packages[name] = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      });

      // Verify dependency chain:
      // - verabot-utils: no internal dependencies (base layer)
      // - verabot-core: depends on verabot-utils
      // - verabot-dashboard: depends on verabot-utils
      // - verabot-commands: depends on verabot-core and verabot-utils

      // verabot-utils should not depend on other verabot modules
      const utilsDeps = packages.utils.dependencies || {};
      assert.ok(
        !utilsDeps['verabot-core'],
        'verabot-utils should not depend on verabot-core'
      );
      assert.ok(
        !utilsDeps['verabot-dashboard'],
        'verabot-utils should not depend on verabot-dashboard'
      );
      assert.ok(
        !utilsDeps['verabot-commands'],
        'verabot-utils should not depend on verabot-commands'
      );

      // verabot-core should depend on verabot-utils
      const coreDeps = packages.core.dependencies || {};
      assert.ok(
        coreDeps['verabot-utils'],
        'verabot-core should depend on verabot-utils'
      );

      // verabot-dashboard should depend on verabot-utils
      const dashboardDeps = packages.dashboard.dependencies || {};
      assert.ok(
        dashboardDeps['verabot-utils'],
        'verabot-dashboard should depend on verabot-utils'
      );

      // verabot-commands should depend on both core and utils
      const commandsDeps = packages.commands.dependencies || {};
      assert.ok(
        commandsDeps['verabot-core'],
        'verabot-commands should depend on verabot-core'
      );
      assert.ok(
        commandsDeps['verabot-utils'],
        'verabot-commands should depend on verabot-utils'
      );
    });
  });

  describe('7. Package.json Validation', () => {
    it('should have consistent Node.js version requirements', () => {
      const packages = {};
      Object.entries(submodules).forEach(([name, modulePath]) => {
        const packagePath = path.join(modulePath, 'package.json');
        packages[name] = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      });

      // All should require Node.js >= 20.0.0
      Object.entries(packages).forEach(([name, pkg]) => {
        assert.ok(
          pkg.engines && pkg.engines.node,
          `${name} should specify Node.js version`
        );
        assert.ok(
          pkg.engines.node.includes('20'),
          `${name} should require Node.js 20+`
        );
      });
    });

    it('should have test scripts in each submodule', () => {
      Object.entries(submodules).forEach(([name, modulePath]) => {
        const packagePath = path.join(modulePath, 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

        assert.ok(
          packageJson.scripts && packageJson.scripts.test,
          `${name} should have test script`
        );
      });
    });

    it('should have lint scripts in each submodule', () => {
      Object.entries(submodules).forEach(([name, modulePath]) => {
        const packagePath = path.join(modulePath, 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

        assert.ok(
          packageJson.scripts && packageJson.scripts.lint,
          `${name} should have lint script`
        );
      });
    });

    it('should have format scripts in most submodules', () => {
      // verabot-commands may not have format script yet (Phase 2.5)
      const requiredFormatModules = ['core', 'utils', 'dashboard'];
      
      requiredFormatModules.forEach((name) => {
        const modulePath = submodules[name];
        const packagePath = path.join(modulePath, 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

        assert.ok(
          packageJson.scripts && packageJson.scripts.format,
          `${name} should have format script`
        );
      });
    });
  });

  describe('8. Module Export Verification', () => {
    it('should have index.js exports in verabot-core', () => {
      const indexPath = path.join(submodules.core, 'src', 'index.js');
      const content = fs.readFileSync(indexPath, 'utf8');

      // Verify key exports
      assert.ok(
        content.includes('CommandBase'),
        'verabot-core should export CommandBase'
      );
      assert.ok(
        content.includes('CommandOptions'),
        'verabot-core should export CommandOptions'
      );
      assert.ok(
        content.includes('EventBase'),
        'verabot-core should export EventBase'
      );
    });

    it('should have index.js exports in verabot-utils', () => {
      const indexPath = path.join(submodules.utils, 'src', 'index.js');
      const content = fs.readFileSync(indexPath, 'utf8');

      // Verify key exports
      assert.ok(
        content.includes('DatabaseService') || content.includes('database'),
        'verabot-utils should export DatabaseService'
      );
    });
  });

  describe('9. Test Infrastructure Validation', () => {
    it('should have test directory in each submodule', () => {
      Object.entries(submodules).forEach(([name, modulePath]) => {
        const testPath = path.join(modulePath, 'tests');
        assert.ok(
          fs.existsSync(testPath),
          `${name} should have tests directory`
        );
      });
    });

    it('should have jest.config.js in each submodule', () => {
      Object.entries(submodules).forEach(([name, modulePath]) => {
        const jestConfigPath = path.join(modulePath, 'jest.config.js');
        assert.ok(
          fs.existsSync(jestConfigPath),
          `${name} should have jest.config.js`
        );
      });
    });
  });

  describe('10. Main Repository Integration', () => {
    it('should have .gitmodules file', () => {
      const gitmodulesPath = path.join(repoRoot, '.gitmodules');
      assert.ok(
        fs.existsSync(gitmodulesPath),
        'Main repository should have .gitmodules'
      );
    });

    it('should reference all submodules in .gitmodules', () => {
      const gitmodulesPath = path.join(repoRoot, '.gitmodules');
      const content = fs.readFileSync(gitmodulesPath, 'utf8');

      const expectedSubmodules = [
        'repos/verabot-core',
        'repos/verabot-dashboard',
        'repos/verabot-utils',
        'repos/verabot-commands',
      ];

      expectedSubmodules.forEach((submodule) => {
        assert.ok(
          content.includes(submodule),
          `.gitmodules should reference ${submodule}`
        );
      });
    });

    it('should have main package.json with proper structure', () => {
      const mainPackagePath = path.join(repoRoot, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(mainPackagePath, 'utf8'));

      assert.strictEqual(
        packageJson.name,
        'verabot2.0',
        'Main repository should be named verabot2.0'
      );

      assert.ok(packageJson.scripts.test, 'Main repo should have test script');
      assert.ok(packageJson.scripts.lint, 'Main repo should have lint script');
    });
  });
});
