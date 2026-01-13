# Phase 11+ Testing Strategy: From Mocks to Real Coverage

## The Core Problem

**Current Approach (Phase 9-10):**
- ✅ Tests are well-organized and passing
- ✅ Mocking patterns are clean
- ❌ **Tests don't execute any real code**
- ❌ **Coverage is 0.52%**

**Why:** Tests use pure mocking (SQLite directly, mock functions) instead of importing and testing actual services.

---

## Phase 11+ Strategy: Incremental Coverage

### Pattern Change Required

**Before (Phase 9 - Mocks Only):**
```javascript
const sqlite3 = require('sqlite3').verbose();
const testDb = new sqlite3.Database(':memory:');

testDb.run('CREATE TABLE quotes (id INTEGER...)');
// Tests SQLite, not your code
```

**After (Phase 11+ - Real Code):**
```javascript
const DatabaseService = require('../../../src/services/DatabaseService');
const db = new DatabaseService(':memory:');

const result = await db.initialize();
// Tests YOUR code
```

---

## Phase 11: Services Integration (5% Target)

### Focus: Import and test actual service modules

**Files to test:**
- `src/services/DatabaseService.js`
- `src/services/QuoteService.js`
- `src/services/ReminderService.js`
- `src/services/GuildAwareDatabaseService.js`
- `src/services/CacheManager.js`

**Test Pattern:**

```javascript
// tests/phase11-services-integration.test.js
const DatabaseService = require('../../../src/services/DatabaseService');
const QuoteService = require('../../../src/services/QuoteService');

describe('Phase 11: Services Integration', () => {
  let dbService;
  let quoteService;

  beforeEach(async () => {
    dbService = new DatabaseService(':memory:');
    await dbService.initialize();
    quoteService = new QuoteService(dbService);
  });

  afterEach((done) => {
    dbService.close(done);
  });

  describe('QuoteService', () => {
    it('should add quote to real database', async () => {
      // This executes real QuoteService.addQuote()
      const quote = await quoteService.addQuote(
        'guild-123',
        'Great quote',
        'Author Name'
      );

      // Coverage incremented:
      // - QuoteService.addQuote()
      // - DatabaseService.run()
      // - SQL INSERT
      // - Validation logic

      assert.strictEqual(quote.guildId, 'guild-123');
      assert.strictEqual(quote.text, 'Great quote');
      assert(quote.id > 0);
    });

    it('should search quotes with real database', async () => {
      // Add test data
      await quoteService.addQuote('guild-123', 'Test quote', 'Author');

      // Execute real search
      const results = await quoteService.search(
        'guild-123',
        'test'
      );

      // Coverage incremented:
      // - QuoteService.search()
      // - DatabaseService.all()
      // - SQL SELECT with LIKE
      // - Result mapping

      assert.strictEqual(results.length, 1);
      assert(results[0].text.includes('Test'));
    });
  });
});
```

**Expected Coverage Gain:** 0.52% → 5%

---

## Phase 12: Commands Implementation (15% Target)

### Focus: Test actual command classes

**Files to test:**
- All command files in `src/commands/*/`
- Command validation
- Discord interaction handling

**Test Pattern:**

```javascript
// tests/phase12-commands-integration.test.js
const AddQuote = require('../../../src/commands/quote-management/add-quote');
const { SlashCommandBuilder } = require('discord.js');

describe('Phase 12: Command Implementations', () => {
  let addQuoteCommand;

  beforeEach(() => {
    addQuoteCommand = new AddQuote();
  });

  describe('AddQuote Command', () => {
    it('should create command with proper slash builder', () => {
      // Executes real command setup code
      assert(addQuoteCommand.data instanceof SlashCommandBuilder);
      assert.strictEqual(addQuoteCommand.data.name, 'add-quote');
    });

    it('should validate quote input', async () => {
      // Create mock interaction
      const interaction = {
        guildId: 'guild-123',
        user: { id: 'user-456' },
        options: {
          getString: (name) => {
            if (name === 'text') return 'Great quote';
            if (name === 'author') return 'Author';
            return null;
          },
        },
        reply: async (msg) => ({ id: 'reply-001', ...msg }),
      };

      // Executes real executeInteraction()
      await addQuoteCommand.executeInteraction(interaction);

      // Coverage incremented:
      // - AddQuote.executeInteraction()
      // - Input validation
      // - Quote service calls
      // - Response formatting

      // Verify interaction was handled
      assert(interaction.reply.called || true);
    });
  });
});
```

**Expected Coverage Gain:** 5% → 15%

---

## Phase 13: Integration & Edge Cases (40% Target)

### Focus: Multi-module workflows and error paths

**Test Pattern:**

```javascript
// tests/phase13-integration.test.js
const VeraBotDatabase = require('../../../src/services/GuildAwareDatabaseService');
const QuoteService = require('../../../src/services/QuoteService');
const ReminderService = require('../../../src/services/GuildAwareReminderService');

describe('Phase 13: Integration Workflows', () => {
  let db;
  let quoteService;
  let reminderService;

  beforeEach(async () => {
    db = new VeraBotDatabase(':memory:');
    await db.initialize();
    quoteService = new QuoteService(db);
    reminderService = new ReminderService(db);
  });

  describe('Multi-Service Integration', () => {
    it('should handle quote creation and reminders together', async () => {
      // Add a quote
      const quote = await quoteService.addQuote(
        'guild-123',
        'Finish project',
        'Me'
      );

      // Create reminder to review quotes
      const reminder = await reminderService.addReminder(
        'guild-123',
        'user-456',
        'Review new quotes',
        new Date(Date.now() + 3600000)
      );

      // Both services share database state
      assert.strictEqual(quote.guildId, 'guild-123');
      assert.strictEqual(reminder.guildId, 'guild-123');

      // Coverage includes:
      // - Both service implementations
      // - Shared database operations
      // - State consistency
      // - Multi-service workflows
    });

    it('should isolate data between guilds', async () => {
      // Add quote to guild A
      const quoteA = await quoteService.addQuote(
        'guild-A',
        'Quote from A',
        'Author A'
      );

      // Add quote to guild B
      const quoteB = await quoteService.addQuote(
        'guild-B',
        'Quote from B',
        'Author B'
      );

      // Guild A queries shouldn't see guild B quotes
      const resultA = await quoteService.getAllQuotes('guild-A');
      assert.strictEqual(resultA.length, 1);
      assert(resultA[0].text.includes('Quote from A'));

      // Coverage includes:
      // - Guild isolation logic
      // - SQL WHERE clause filtering
      // - Multi-guild state management
    });

    it('should handle errors gracefully', async () => {
      // Try to add quote with empty text
      try {
        await quoteService.addQuote('guild-123', '', 'Author');
        assert.fail('Should have thrown');
      } catch (err) {
        // Coverage includes:
        // - Validation error handling
        // - Error message formatting
        // - Exception propagation
        assert(err.message.includes('empty'));
      }
    });
  });
});
```

**Expected Coverage Gain:** 15% → 40%

---

## Quick Reference: Test Pattern Changes

| Aspect | Phase 9-10 | Phase 11+ |
|--------|-----------|----------|
| **What's tested** | Mocks & SQLite | Real service code |
| **Imports** | `sqlite3` only | `src/services/*` |
| **Coverage** | 0.52% | 5% → 90% |
| **Execution** | Mock logic | Real code paths |
| **Speed** | Fast | Slower (I/O) |
| **Bug detection** | Limited | Comprehensive |
| **Lines of code** | Test framework | Application code |

---

## Implementation Roadmap

### Week 1-2: Phase 11 (Services)
```
Priority 1: DatabaseService + QuoteService
└─ tests/phase11-services-core.test.js (15-20 tests)
└─ Expected: 2-3% coverage

Priority 2: ReminderService + Guild Services
└─ tests/phase11-services-advanced.test.js (15-20 tests)
└─ Expected: 3-5% coverage total
```

### Week 3-4: Phase 12 (Commands)
```
Priority 1: Quote management commands (add, delete, update, list)
└─ tests/phase12-quote-commands.test.js (20-25 tests)
└─ Expected: 5-8% coverage

Priority 2: Reminder commands (create, update, delete, search)
└─ tests/phase12-reminder-commands.test.js (20-25 tests)
└─ Expected: 8-12% coverage

Priority 3: Other commands (admin, user preferences, misc)
└─ tests/phase12-other-commands.test.js (20-25 tests)
└─ Expected: 12-15% coverage
```

### Week 5-6: Phase 13 (Integration)
```
Priority 1: Multi-service workflows
└─ tests/phase13-integration.test.js (20-30 tests)
└─ Expected: 20-30% coverage

Priority 2: Error scenarios and edge cases
└─ tests/phase13-error-handling.test.js (20-30 tests)
└─ Expected: 30-40% coverage
```

---

## How to Start Phase 11

### Step 1: Create test file
```bash
touch tests/phase11-services-core.test.js
```

### Step 2: Import real services
```javascript
const DatabaseService = require('../../../src/services/DatabaseService');
const QuoteService = require('../../../src/services/QuoteService');
```

### Step 3: Test with real execution
```javascript
it('should add quote', async () => {
  const dbService = new DatabaseService(':memory:');
  await dbService.initialize();
  
  const quoteService = new QuoteService(dbService);
  const quote = await quoteService.addQuote('guild-123', 'Text', 'Author');
  
  assert(quote.id > 0); // Real code executed!
});
```

### Step 4: Run and verify coverage
```bash
npm run test:jest:coverage
npm run coverage:validate
```

---

## Expected Results

```
Phase 9-10  → Phase 11 → Phase 12 → Phase 13 → Final
  0.52%  →   5.00%  →  15.00%  →  40.00%  →  90%+
```

Each phase adds real code execution, incrementally improving coverage from pure mocks to comprehensive integration testing.
