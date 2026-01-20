# Copilot Instructions for verabot-core

**Status**: Phase 1 - Extraction to Folders  
**Inherits**: Main repo copilot instructions (base requirements)  
**Specific To**: Core bot module  
**Date**: January 20, 2026

---

## ⚠️ CRITICAL: Test-Driven Development (TDD) is MANDATORY

Copilot MUST follow TDD principles for ALL code changes in this module. This is non-negotiable.

- Every new function, method, class, service, or feature MUST have tests written FIRST
- Tests are written in the RED phase (failing tests)
- Then code is implemented to make tests pass (GREEN phase)
- Then code is refactored while maintaining test pass rate (REFACTOR phase)

**If Copilot implements code without writing tests first, the pull request will be rejected.**

---

## Module Overview

**verabot-core** is the Discord bot service responsible for:
- Discord slash commands and legacy prefix commands
- Event handlers and middleware
- Core bot business logic
- Command processing and responses

**Technology Stack**:
- Node.js 20+
- Discord.js v14.11.0
- Jest (testing)
- ESLint + Prettier (code quality)

**Key Files**:
- `src/index.js` - Bot entry point and event handlers
- `src/register-commands.js` - Command registration
- `src/commands/` - Command implementations
- `src/core/` - Core bot classes (CommandBase, EventBase)
- `src/services/` - Business logic services
- `src/middleware/` - Request/event handlers
- `tests/` - Test suites (TDD required)

---

## Development Patterns & Standards

### 1. Command Development

**ALWAYS extend CommandBase**:

```javascript
const Command = require('../../core/CommandBase');
const { sendSuccess, sendError } = require('../../utils/helpers/response-helpers');

const { data, options } = buildCommandOptions('command-name', 'Description', [
  { name: 'arg', type: 'string', required: true, description: 'Description' },
]);

class MyCommand extends Command {
  constructor() {
    super({ name: 'command-name', description: 'Description', data, options });
  }

  async execute(message, args) {
    // Prefix command - errors auto-handled by base class
  }

  async executeInteraction(interaction) {
    // Slash command - errors auto-handled by base class
  }
}

module.exports = new MyCommand().register();
```

**Never**:
- Write manual try-catch blocks (handled by CommandBase)
- Make raw Discord API calls (use response helpers)
- Skip error handling (base class handles automatically)

### 2. Response Helpers (All Discord messages)

**Use response helpers** instead of raw Discord API:

```javascript
// ✅ CORRECT
await sendSuccess(interaction, 'Message content');
await sendError(interaction, 'Error message', true);
await sendQuoteEmbed(interaction, quote, 'Title');
await sendDM(user, 'Direct message');

// ❌ WRONG
await interaction.reply({ content: 'Message', ephemeral: true });
await interaction.followUp({ ... });
```

### 3. Services & Utilities

**Import from verabot-utils** (not local utils):

```javascript
// ✅ CORRECT - Use shared services
import { DatabaseService } from 'verabot-utils';
import { ValidationService } from 'verabot-utils';
import { responseHelpers } from 'verabot-utils';

// ❌ WRONG - Don't duplicate
import { database } from '../utils/db';
import { helpers } from '../utils/helpers';
```

### 4. Guild-Aware Services

**All database operations require guild context**:

```javascript
// ✅ CORRECT - Guild-aware
const guildId = interaction.guildId;
const service = new GuildAwareDatabaseService();
const result = await service.query(guildId, sql, params);

// ❌ WRONG - No guild context
const db = require('../db');
await db.query(sql);  // Lost guild context!
```

### 5. Error Handling

**CommandBase handles all errors automatically**:

```javascript
class MyCommand extends Command {
  async executeInteraction(interaction) {
    // Just write logic - errors are caught and logged
    const result = await someAsyncOperation();
    
    if (!result) {
      throw new Error('Operation failed');  // CommandBase catches and handles
    }
    
    await sendSuccess(interaction, 'Done!');
  }
}

// Base class provides:
// - Try-catch wrapping
// - Error logging
// - User-friendly error messages
// - Graceful degradation
```

---

## Testing Requirements

### TDD Workflow (MANDATORY)

**File**: `tests/unit/test-[feature-name].js`

```javascript
// 1. RED: Write tests that fail
// 2. GREEN: Write minimal code to pass
// 3. REFACTOR: Optimize while tests pass

const assert = require('assert');
const CommandBase = require('../src/core/CommandBase');

describe('CommandBase', () => {
  let command;

  beforeEach(() => {
    command = new CommandBase({ name: 'test' });
  });

  describe('register()', () => {
    it('should return the command instance', () => {
      const result = command.register();
      assert.strictEqual(result, command);
    });

    it('should set registered flag', () => {
      command.register();
      assert.strictEqual(command.registered, true);
    });

    it('should throw error if already registered', () => {
      command.register();
      assert.throws(() => {
        command.register();
      }, /Already registered/);
    });
  });
});
```

### Coverage Requirements

- **Lines**: 85%+ (minimum)
- **Functions**: 90%+ (minimum)
- **Branches**: 80%+ (minimum)
- **Never decrease** existing coverage
- **All error paths** must be tested

### Test Execution

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run coverage

# Specific test
npm run test:only -- MyCommand

# Check coverage thresholds
npm test -- --coverage
```

---

## Code Quality Standards

### ESLint Configuration

```javascript
// eslint.config.js
module.exports = [
  {
    files: ['src/**/*.js', 'tests/**/*.js'],
    rules: {
      'no-console': 'off',  // Allowed for logging
      'no-unused-vars': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'eqeqeq': 'error',
      'semi': ['error', 'always'],
    }
  }
];
```

### Before Every Commit

```bash
# 1. Lint check (must pass)
npm run lint

# 2. Fix formatting
npm run format

# 3. Run tests (must pass)
npm test

# 4. Check coverage
npm run coverage

# 5. Validate everything
npm run validate
```

---

## File Organization

```
verabot-core/
├── src/
│   ├── index.js                    # Entry point
│   ├── register-commands.js        # Command registration
│   ├── commands/
│   │   ├── misc/                  # Utility commands
│   │   ├── quote-discovery/       # Quote search
│   │   ├── quote-management/      # Quote CRUD
│   │   ├── quote-social/          # Quote rating/tagging
│   │   └── quote-export/          # Export functionality
│   ├── core/
│   │   ├── CommandBase.js         # Base command class
│   │   ├── CommandOptions.js      # Options builder
│   │   └── EventBase.js           # Base event class
│   ├── services/                  # Business logic
│   ├── middleware/                # Request/event handlers
│   └── utils/                     # DEPRECATED - use verabot-utils
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── package.json
├── Dockerfile
├── Dockerfile.dev
└── README.md
```

---

## Git Workflow

### Branch Naming

```bash
feature/{issue-number}-{description}
bugfix/{issue-number}-{description}
refactor/{issue-number}-{description}
```

### Commit Message Format

```
{type}({scope}): {subject}

{body}

{footer}
```

Examples:
```
feat(commands): add new quote command

Implement quote-of-the-day command with:
- Daily random quote selection
- User timezone support
- Schedule via cron

Closes #123
```

### Pull Request Process

1. Create feature branch
2. Write tests FIRST (RED)
3. Write implementation (GREEN)
4. Run validation: `npm run validate`
5. Create pull request
6. Code review approval required
7. Merge to main (or rebase if needed)

---

## Performance Guidelines

- **Bot startup**: < 5 seconds
- **Command response**: < 200ms
- **Database query**: < 100ms
- **Test execution**: < 30 seconds
- **Lint check**: < 10 seconds

---

## Module-Specific Requirements

### Discord Commands

- ✅ Must extend CommandBase
- ✅ Support both slash and prefix
- ✅ Error handling automatic
- ✅ Response via helpers only
- ✅ Guild context required

### Event Handlers

- ✅ Use EventBase class
- ✅ Proper error handling
- ✅ Logging for debugging
- ✅ No blocking operations
- ✅ Graceful degradation

### Integration with Other Modules

- ✅ verabot-utils: Use shared services
- ✅ verabot-dashboard: Request via API endpoints
- ✅ Main repo: Part of coordinated releases

---

## Tips for Copilot Usage

1. **Reference existing commands** as templates for similar functionality
2. **Always extend CommandBase** for new commands
3. **Check verabot-utils** before writing utilities
4. **Run tests frequently** - before every commit
5. **Use response helpers** for all Discord interactions
6. **Follow guild-aware patterns** for database operations
7. **Write tests FIRST** - non-negotiable
8. **Maintain consistency** with existing code style

---

## Key Commands

```bash
# Development
npm run dev                  # Start with hot-reload
npm run register-commands   # Register slash commands

# Testing
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run coverage           # Coverage report

# Code Quality
npm run lint               # Check code style
npm run lint:fix           # Auto-fix issues
npm run format             # Format code
npm run validate           # Lint + test

# Docker
npm run docker:build       # Production build
npm run docker:build:dev   # Dev build
npm run docker:run         # Run production
npm run docker:run:dev     # Run development

# Health
npm run health-check       # Check bot status
```

---

**Version**: 1.0  
**Date**: January 20, 2026  
**Status**: Active - Applies to Phase 1, 2, 3  
**Inherits**: `.github/copilot-instructions.md` (main repo)
