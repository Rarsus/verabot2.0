# Epic #49: Submodule Development Strategy

**Status**: Defining standards across all modules  
**Date**: January 20, 2026  
**Applies To**: Main repo + all submodules (verabot-core, verabot-dashboard, verabot-utils)

---

## 📋 Unified Development Standards

This document ensures consistent development practices across all modules during Epic #49 implementation.

### 1. Development Approach (All Modules)

#### Mandatory Requirements

✅ **Test-Driven Development (TDD)**
- All new code MUST have tests written FIRST
- RED → GREEN → REFACTOR workflow
- Never skip test phase for any reason
- TDD is non-negotiable across all modules

✅ **Code Quality Standards**
- ESLint validation required (zero errors)
- Prettier formatting applied
- Pre-commit hooks active (Husky)
- Coverage thresholds: 85%+ (lines), 90%+ (functions), 80%+ (branches)

✅ **Git Workflow**
- Feature branches: `feature/{issue-number}-{description}`
- Pull requests required for all changes
- Code review minimum: 1 approval
- Main branch protected (no direct commits)

✅ **Documentation**
- README.md in every module
- CONTRIBUTING.md in main repo (applies to all)
- Architecture decisions documented
- API endpoints documented

---

### 2. Copilot Instructions Consistency

#### Standard across all modules:

**File**: `.github/copilot-instructions.md` (main) → Copied to each submodule

**Key Requirements**:
```markdown
# Copilot Instructions for [Module Name]

## ⚠️ CRITICAL: Test-Driven Development (TDD) is MANDATORY

1. Every new function/class MUST have tests first
2. RED phase: Tests fail initially  
3. GREEN phase: Code implements to pass tests
4. REFACTOR phase: Optimize while tests still pass

## Technology Stack
- Node.js 20+ (npm 10+)
- [Module-specific]: Discord.js / Express / Internal services
- Jest for testing
- ESLint + Prettier for code quality

## Development Patterns
- Use same design patterns as main repo
- Follow established command/service patterns
- Maintain consistent code style
- Share utility functions via verabot-utils

## Module-Specific Requirements
[Details for core/dashboard/utils]

## Git Workflow
- Feature branches required
- Pull requests with tests
- Code review approval needed
- Main branch protected
```

**Implementation**:
- Main repo copilot instructions guide all modules
- Each module inherits core TDD requirements
- Module-specific extensions documented
- Instructions versioned alongside code

---

### 3. MCP Servers Consistency

#### Standardized MCP Configuration

**File**: `.mcp/servers.json` (all modules)

```json
{
  "mcpServers": {
    "fs": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem"]
    },
    "git": {
      "command": "npx", 
      "args": ["@modelcontextprotocol/server-git"]
    },
    "node": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-node"]
    }
  }
}
```

**Core MCP Servers Required (All Modules)**:

| Server | Purpose | Used By |
|--------|---------|---------|
| **fs** | File system operations | All modules |
| **git** | Version control operations | All modules |
| **node** | Node.js package analysis | All modules |

**Module-Specific MCP Servers**:

| Module | Additional Servers | Purpose |
|--------|-------------------|---------|
| **verabot-core** | discord | Discord.js API references |
| **verabot-dashboard** | express | Express.js framework references |
| **verabot-utils** | node | NPM package publishing |
| **Main repo** | github | Issue/PR management, milestones |

**Environment Setup**:
```bash
# All modules
npm install @modelcontextprotocol/server-filesystem
npm install @modelcontextprotocol/server-git  
npm install @modelcontextprotocol/server-node

# Core specific
npm install @modelcontextprotocol/server-discord

# Dashboard specific
npm install @modelcontextprotocol/server-express

# Utils specific
npm install @modelcontextprotocol/server-npm
```

---

## 🏗️ Development Workflow (All Phases)

### Phase 1: Extraction to Folders (6-9 days)

**Applies To**: All 3 modules (being extracted)

**Development Cycle**:
1. Create test files first (RED)
2. Write minimal implementation (GREEN)  
3. Refactor while tests pass (REFACTOR)
4. ESLint validation: `npm run lint`
5. Coverage check: `npm run coverage`
6. Create PR with tests and code together

**Success Criteria**:
- ✅ All tests passing
- ✅ Zero ESLint errors
- ✅ Coverage >= 85%
- ✅ Code review approved
- ✅ Ready to move to Phase 2

---

### Phase 2: Git Submodule Conversion (2-3 days)

**Applies To**: All 3 modules (independent repos)

**Development Cycle**:
- Same TDD requirements
- Independent Git histories
- Submodule references in main
- CI/CD per submodule
- Coordinated releases

**Success Criteria**:
- ✅ Independent repos created
- ✅ Submodule structure tested
- ✅ Docker Compose works
- ✅ Documentation updated
- ✅ Ready for Phase 3

---

### Phase 3: Integration & CI/CD (11-16 days)

**Applies To**: All modules + main repo

**Development Cycle**:
- Full integration testing
- Independent CI/CD pipelines
- Performance testing
- Documentation finalization

**Success Criteria**:
- ✅ All tests passing (3000+)
- ✅ Integration tests green
- ✅ CI/CD pipelines working
- ✅ Documentation complete
- ✅ Ready for production

---

## 🔄 Code Patterns & Consistency

### Standard Imports (All Modules)

```javascript
// Services and utilities should be imported from verabot-utils
import { DatabaseService } from 'verabot-utils';
import { ValidationService } from 'verabot-utils';
import { responseHelpers } from 'verabot-utils';

// Never duplicate code - extract to utils
// Never import deprecated locations (old utils/)

// Module-specific imports
import { CommandBase } from './core/CommandBase.js';  // (core only)
import { createServer } from 'express';              // (dashboard only)
```

### Testing Pattern (All Modules)

```javascript
// tests/unit/test-[module-name].js
const assert = require('assert');
const Module = require('../path/to/module');

describe('ModuleName', () => {
  let testData;

  beforeEach(() => {
    testData = { /* ... */ };
  });

  afterEach(() => {
    // Cleanup
  });

  describe('methodName()', () => {
    it('should return expected result for valid input', () => {
      const result = Module.methodName(testData);
      assert.strictEqual(result, expected);
    });

    it('should throw error for invalid input', () => {
      assert.throws(() => {
        Module.methodName(null);
      }, /Expected error message/);
    });

    it('should handle edge case: empty input', () => {
      const result = Module.methodName('');
      assert.strictEqual(result, null);
    });
  });
});
```

### Package.json Standards (All Modules)

```json
{
  "name": "verabot-[module]",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon --exec node src/index.js",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "lint": "eslint src tests",
    "lint:fix": "eslint src tests --fix",
    "format": "prettier --write \"src/**/*.js\" \"tests/**/*.js\"",
    "validate": "npm run lint && npm run test"
  },
  "devDependencies": {
    "eslint": "^8.48.0",
    "jest": "^29.7.0",
    "prettier": "^3.0.3"
  }
}
```

---

## 📊 Quality Metrics (All Modules)

### Coverage Requirements

| Module | Lines | Functions | Branches | Min Tests |
|--------|-------|-----------|----------|-----------|
| **Core** | 85%+ | 90%+ | 80%+ | 50+ |
| **Dashboard** | 85%+ | 90%+ | 80%+ | 40+ |
| **Utils** | 90%+ | 95%+ | 85%+ | 60+ |

### Performance Targets

| Metric | Target | Module |
|--------|--------|--------|
| **Startup time** | < 5 seconds | Core, Dashboard |
| **Response time** | < 200ms | Dashboard |
| **Test execution** | < 30 seconds | All |
| **Lint check** | < 10 seconds | All |

### Error Rates

| Check | Requirement | Modules |
|-------|-------------|---------|
| **ESLint** | 0 errors | All |
| **Test pass rate** | 100% | All |
| **Coverage decrease** | Not allowed | All |

---

## 🔐 Consistency Checklist

### Before Each Phase Transition

- [ ] All modules use same TDD approach
- [ ] Copilot instructions identical (core requirements)
- [ ] MCP servers configured consistently
- [ ] ESLint config matches across modules
- [ ] Prettier config matches across modules
- [ ] Jest config follows same patterns
- [ ] Test coverage meets minimums
- [ ] No code duplication between modules
- [ ] Shared code in verabot-utils
- [ ] Documentation updated
- [ ] All tests passing in all modules

### Module-Specific Pre-checks

**verabot-core**:
- [ ] Commands follow CommandBase pattern
- [ ] All Discord API calls tested
- [ ] Event handlers properly tested
- [ ] Error handling comprehensive

**verabot-dashboard**:
- [ ] Express routes tested
- [ ] OAuth flow validated
- [ ] Security headers present
- [ ] API responses documented

**verabot-utils**:
- [ ] All exports properly documented
- [ ] No circular dependencies
- [ ] Ready as npm package
- [ ] Database services tested

---

## 🚀 Implementation Timeline

### Week 1 (Phase 1: Extraction)
- Apply development strategy to all modules
- Setup TDD in each folder structure
- Configure MCP servers
- Setup copilot instructions

### Week 2 (Phase 2: Submodules)
- Apply same strategy to independent repos
- Copy copilot instructions to each repo
- Configure MCP servers in each repo
- Test consistency across repos

### Week 3-4 (Phase 3: Integration & CI/CD)
- Validate strategy across all modules
- Ensure CI/CD uses same approach
- Final documentation
- Production readiness

---

## 📚 References

- `.github/copilot-instructions.md` - Main copilot instructions
- `.mcp/servers.json` - MCP configuration
- `package.json` - Module scripts and dependencies
- `jest.config.js` - Testing configuration
- `eslint.config.js` - Code quality configuration

---

**Version**: 1.0  
**Last Updated**: January 20, 2026  
**Status**: Active - Applies to all Epic #49 phases
