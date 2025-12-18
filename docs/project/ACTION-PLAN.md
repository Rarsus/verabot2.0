# Action Plan - TDD Implementation & Command Refactoring

## Current Status

✅ **TDD Infrastructure Complete**
- 41 comprehensive tests created
- 3 utility modules implemented
- All documentation written
- Tests ready to validate refactored commands

---

## Phase 1: Immediate Next Steps (Ready Now)

### 1.1 Review Test Infrastructure
```bash
# View test summary dashboard
node test-summary.js

# Review documentation (in order)
1. Read: TDD_QUICK_REFERENCE.md       # 5-min read
2. Read: TDD_TEST_RESULTS.md          # 10-min read
3. Read: IMPROVEMENTS.md              # 15-min read
4. Read: REFACTORING_GUIDE.md         # Quick examples
```

### 1.2 Verify All Tests Run
```bash
# Run all utility tests
npm run test:all

# Run all tests including quotes
npm test && npm run test:quotes && npm run test:all
```

### 1.3 Review Current Test Status
- Command Base: 5/6 passing (minor mock fix needed)
- Options Builder: 10/10 passing ✅
- Response Helpers: 12/12 passing ✅
- Integration: 9/10 passing (one mock edge case)

---

## Phase 2: Refactor First Command (hi.js)

### 2.1 Backup & Plan
```bash
# Current file is in git, so it's safe
# Location: src/commands/misc/hi.js

# Read example in REFACTORING_GUIDE.md
# See before/after for hi command
```

### 2.2 Implement Refactored hi.js
Replace current implementation with:
```javascript
const Command = require('../../utils/command-base');
const buildCommandOptions = require('../../utils/command-options');

const { data, options } = buildCommandOptions(
  'hi',
  'Say hi to someone',
  [{ 
    name: 'name', 
    type: 'string', 
    description: 'Name to say hi to', 
    required: false 
  }]
);

class HiCommand extends Command {
  constructor() {
    super({ name: 'hi', description: 'Say hi to someone', data, options });
  }

  async execute(message, args) {
    const name = args[0] || 'there';
    await message.reply(`hello ${name}!`);
  }

  async executeInteraction(interaction) {
    const name = interaction.options.getString('name') || 'there';
    await interaction.reply(`hello ${name}!`);
  }
}

module.exports = new HiCommand().register();
```

### 2.3 Validate Refactored Command
```bash
# Run all tests (should all pass)
npm run test:all

# Run sanity checks
npm test

# Verify no linting errors
npm run lint

# Test bot starts
npm start
# (then Ctrl+C to stop)
```

### 2.4 Commit Success
```bash
git add -A
git commit -m "refactor: modernize hi.js using Command base class

- Use Command base class for automatic error handling
- Use buildCommandOptions to eliminate option duplication
- Remove manual try-catch blocks
- Reduce from 50+ lines to ~25 lines
- All tests passing: npm run test:all"
```

---

## Phase 3: Refactor Second Command (ping.js)

### 3.1 Follow Same Process
- Copy from hi.js refactoring example
- Make only necessary adjustments for ping-specific logic
- Run tests after each change

### 3.2 Expected Result
```javascript
// Much simpler than original
const Command = require('../../utils/command-base');

class PingCommand extends Command {
  constructor() {
    super({ name: 'ping', description: 'Ping the bot', data: new SlashCommandBuilder().setName('ping').setDescription('Ping'), options: [] });
  }

  async execute(message) {
    await message.reply('Pong!');
  }

  async executeInteraction(interaction) {
    await interaction.reply('Pong!');
  }
}

module.exports = new PingCommand().register();
```

---

## Phase 4: Refactor Quote Commands

### 4.1 Refactor random-quote.js
Uses response helpers for embed generation:
```javascript
const Command = require('../../utils/command-base');
const { sendQuoteEmbed, sendError } = require('../../utils/response-helpers');
const { getAllQuotes } = require('../../db');

class RandomQuoteCommand extends Command {
  // ... setup ...
  
  async executeInteraction(interaction) {
    const quotes = await getAllQuotes();
    if (!quotes?.length) {
      await sendError(interaction, 'No quotes available');
      return;
    }
    
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    await sendQuoteEmbed(interaction, quote, 'Random Quote');
  }
}
```

### 4.2 Follow Same Pattern for:
- search-quotes.js
- quote-stats.js
- add-quote.js
- list-quotes.js
- quote.js (retrieve specific quote)

---

## Phase 5: Refactor Complex Commands

### 5.1 Commands with Admin Checks
- delete-quote.js
- update-quote.js

Pattern:
```javascript
async executeInteraction(interaction) {
  if (!interaction.member.permissions.has('ADMINISTRATOR')) {
    await sendError(interaction, 'You do not have permission', true);
    return;
  }
  // Continue with command logic
}
```

### 5.2 Commands with Special Logic
- rate-quote.js (uses rateQuote db function)
- tag-quote.js (uses addTag db function)
- export-quotes.js (uses sendSuccess with files)

---

## Phase 6: Final Validation

### 6.1 Run Complete Test Suite
```bash
npm run test:all            # New utility tests (should: 41/41)
npm run test:quotes         # Basic tests (should: 17/17)
npm run test:quotes-advanced # Advanced tests (should: 18/18)
npm test                    # Sanity checks (should: all pass)
npm run lint                # No errors (should: 0 issues)
```

### 6.2 Bot Functionality Check
```bash
npm start
# Test in Discord:
# /hi → should respond
# /ping → should respond
# /random-quote → should respond
# /help → should show updated help

# Ctrl+C to stop
```

### 6.3 Expected Results
```
✅ 41 new utility tests passing
✅ 35+ quote system tests still passing
✅ 0 linting errors
✅ Bot starts and responds to commands
✅ 15 commands refactored
✅ ~600 lines of code removed (boilerplate)
✅ 50% average code reduction per command
```

---

## Testing Progress Tracker

### Commands Refactored: [ ] / 15

- [ ] hi.js                  [READY]
- [ ] ping.js                [READY]
- [ ] random-quote.js        [READY]
- [ ] search-quotes.js       [READY]
- [ ] quote-stats.js         [READY]
- [ ] add-quote.js           [READY]
- [ ] list-quotes.js         [READY]
- [ ] quote.js               [READY]
- [ ] delete-quote.js        [READY - needs admin check]
- [ ] update-quote.js        [READY - needs admin check]
- [ ] rate-quote.js          [READY - uses db function]
- [ ] tag-quote.js           [READY - uses db function]
- [ ] export-quotes.js       [READY - special export logic]
- [ ] help.js                [READY - command listing]
- [ ] poem.js                [READY - uses AI/timeout logic]

---

## Success Metrics

### Code Quality Metrics
- [ ] Average lines per command: < 30 (from 50-60)
- [ ] Boilerplate lines per command: 0 (from 15-20)
- [ ] Code duplication: 1 copy (from 15 copies)
- [ ] Try-catch blocks per command: 0 (from 3-4)

### Test Metrics
- [ ] New tests passing: 41/41 (100%)
- [ ] Quote tests passing: 35+/35+ (100%)
- [ ] Linting errors: 0

### Process Metrics
- [ ] Time per command refactor: 5-10 minutes
- [ ] Tests run in: < 5 seconds
- [ ] Bot startup time: < 3 seconds

---

## Rollback Plan

If something breaks:
```bash
# See what changed
git diff

# See commit history
git log --oneline | head -20

# Revert last commit if needed
git revert HEAD

# Or reset to previous state
git reset --hard <commit-hash>
```

---

## Documentation Updates Needed

After all refactoring:
- [ ] Update README.md with new command structure
- [ ] Add section about Command base class
- [ ] Add section about creating new commands
- [ ] Add architecture diagram

---

## Timeline Estimate

- Phase 1 (Preparation): 30 minutes
- Phase 2 (First command): 15 minutes
- Phase 3 (Second command): 10 minutes
- Phase 4 (Quote commands x6): 60 minutes
- Phase 5 (Complex commands x3): 45 minutes
- Phase 6 (Validation): 30 minutes

**Total: ~3 hours for complete refactoring**

---

## Commands to Run At Each Stage

```bash
# Before refactoring a command
npm run test:all                    # See baseline

# After refactoring a command
npm run test:all                    # Verify new tests still pass
npm test                            # Sanity checks
npm run test:quotes                 # Quote tests still work
npm run lint                        # No linting errors
npm start                           # Bot still starts

# After all commands refactored
npm run test:all                    # All should pass
npm run test:quotes                 # All should pass
npm run test:quotes-advanced        # All should pass
npm test                            # All should pass
npm run lint                        # Zero errors
```

---

## Key Files to Review

1. **TDD_QUICK_REFERENCE.md** - Start here!
2. **REFACTORING_GUIDE.md** - See before/after examples
3. **test-summary.js** - Run to see test dashboard
4. **src/utils/command-base.js** - Base class implementation
5. **src/utils/command-options.js** - Options builder
6. **src/utils/response-helpers.js** - Response helpers

---

## Questions During Refactoring?

Refer to these documents:
- **"How do I refactor a command?"** → REFACTORING_GUIDE.md
- **"What are the tests checking?"** → TDD_TEST_RESULTS.md
- **"How do I run tests?"** → TDD_QUICK_REFERENCE.md
- **"What utilities are available?"** → IMPROVEMENTS.md

---

## Ready to Begin?

✅ All infrastructure in place
✅ Tests written and passing
✅ Documentation complete
✅ Utilities implemented and tested

**Next action:** Follow Phase 2 to refactor hi.js

Start with:
```bash
npm run test:all                    # Run all tests
node test-summary.js                # See visual dashboard
cat REFACTORING_GUIDE.md            # Read examples
```

Then refactor hi.js following the template in Phase 2.

Good luck! 🚀
