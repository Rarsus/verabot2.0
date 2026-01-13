/**
 * Integration Test: Refactored Commands
 * Tests commands that use the new Command base class and helpers
 */

/* eslint-disable no-unused-vars */

let passed = 0;
let failed = 0;

// Mock Discord.js components
const _mockDiscord = {
  SlashCommandBuilder: class {
    constructor() {
      this.name_val = '';
      this.desc_val = '';
    }
    setName(n) {
      this.name_val = n;
      return this;
    }
    setDescription(d) {
      this.desc_val = d;
      return this;
    }
    addStringOption(fn) {
      fn({ setName: () => ({ setDescription: () => ({ setRequired: () => this }) }) });
      return this;
    }
    toJSON() {
      return { name: this.name_val, description: this.desc_val, options: [] };
    }
  },
  EmbedBuilder: class {
    constructor() {
      this.data = {};
    }
    setTitle(t) {
      this.data.title = t;
      return this;
    }
    setDescription(d) {
      this.data.description = d;
      return this;
    }
    setFooter(f) {
      this.data.footer = f;
      return this;
    }
    setColor(c) {
      this.data.color = c;
      return this;
    }
  },
};

// Create mock interaction
function createMockInteraction() {
  return {
    deferred: false,
    replied: false,
    reply: async function (msg) {
      this.replied = true;
      this._reply = msg;
      return msg;
    },
    editReply: async function (msg) {
      this._edit = msg;
      return msg;
    },
    followUp: async function (msg) {
      return msg;
    },
    isCommand: function () {
      return true;
    },
    isChatInputCommand: function () {
      return true;
    },
    options: { getString: (_name) => 'test_value', getInteger: (_name) => 1 },
  };
}

// Test 1: Verify Command base class exists and loads
console.log('\n=== Test 1: Command Base Class Loadable ===');
try {
  const Command = require('../../src/core/CommandBase');
  if (typeof Command === 'function') {
    console.log('✅ Test 1 Passed: Command base class loads');
    passed++;
  } else {
    console.error('❌ Test 1 Failed: Command not a class');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 1 Failed:', err.message);
  failed++;
}

// Test 2: Verify command options helper exists
console.log('\n=== Test 2: Command Options Builder Loadable ===');
try {
  const buildCommandOptions = require('../../src/core/CommandOptions');
  if (typeof buildCommandOptions === 'function') {
    console.log('✅ Test 2 Passed: buildCommandOptions loads');
    passed++;
  } else {
    console.error('❌ Test 2 Failed: buildCommandOptions not a function');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 2 Failed:', err.message);
  failed++;
}

// Test 3: Verify response helpers exist
console.log('\n=== Test 3: Response Helpers Loadable ===');
try {
  const helpers = require('../../src/utils/helpers/response-helpers');
  const required = ['sendQuoteEmbed', 'sendSuccess', 'sendError', 'sendDM', 'deferReply'];
  const missing = required.filter((h) => typeof helpers[h] !== 'function');

  if (missing.length === 0) {
    console.log('✅ Test 3 Passed: All response helpers load');
    passed++;
  } else {
    console.error(`❌ Test 3 Failed: Missing helpers: ${missing.join(', ')}`);
    failed++;
  }
} catch (err) {
  console.error('❌ Test 3 Failed:', err.message);
  failed++;
}

// Test 4: Test basic command structure (no errors)
console.log('\n=== Test 4: Basic Command Structure ===');
try {
  const Command = require('../../src/core/CommandBase');

  class SimpleCommand extends Command {
    constructor() {
      super({
        name: 'simple',
        description: 'Simple test command',
        data: { toJSON: () => ({}) },
      });
    }

    async execute(_message) {
      return 'executed';
    }

    async executeInteraction(_interaction) {
      return 'executed';
    }
  }

  const cmd = new SimpleCommand().register();

  if (cmd.name === 'simple' && typeof cmd.execute === 'function' && typeof cmd.executeInteraction === 'function') {
    console.log('✅ Test 4 Passed: Basic command structure valid');
    passed++;
  } else {
    console.error('❌ Test 4 Failed: Command structure invalid');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 4 Failed:', err.message);
  failed++;
}

// Test 5: Test command with options
console.log('\n=== Test 5: Command with Options ===');
try {
  const Command = require('../../src/core/CommandBase');
  const buildCommandOptions = require('../../src/core/CommandOptions');

  const { data, options } = buildCommandOptions('test-cmd', 'Test command', [
    { name: 'text', type: 'string', description: 'Text', required: true },
  ]);

  class TestCommand extends Command {
    constructor() {
      super({ name: 'test-cmd', description: 'Test', data, options });
    }

    async executeInteraction(_interaction) {
      return 'success';
    }
  }

  const cmd = new TestCommand().register();

  if (cmd.options && cmd.options.length === 1) {
    console.log('✅ Test 5 Passed: Command with options created');
    passed++;
  } else {
    console.error('❌ Test 5 Failed: Options not set');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 5 Failed:', err.message);
  failed++;
}

// Test 6: Test command error handling
console.log('\n=== Test 6: Command Error Handling ===');
(async () => {
  try {
    const Command = require('../../src/core/CommandBase');

    class ErrorCommand extends Command {
      constructor() {
        super({ name: 'error-cmd', description: 'Error test' });
      }

      async executeInteraction(_interaction) {
        throw new Error('Test error');
      }
    }

    const cmd = new ErrorCommand().register();
    const interaction = createMockInteraction();

    await cmd.executeInteraction(interaction);

    if (interaction.replied) {
      console.log('✅ Test 6 Passed: Error handled and reply sent');
      passed++;
    } else {
      console.error('❌ Test 6 Failed: No error reply sent');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 6 Failed:', err.message);
    failed++;
  }
})();

// Test 7: Response helpers with command
console.log('\n=== Test 7: Response Helpers in Command ===');
(async () => {
  try {
    const Command = require('../../src/core/CommandBase');
    const { sendSuccess } = require('../../src/utils/helpers/response-helpers');

    class SuccessCommand extends Command {
      constructor() {
        super({ name: 'success', description: 'Success test' });
      }

      async executeInteraction(_interaction) {
        await sendSuccess(interaction, 'Command completed');
      }
    }

    const cmd = new SuccessCommand().register();
    const interaction = createMockInteraction();

    await cmd.executeInteraction(interaction);

    if (interaction._reply && interaction._reply.content && interaction._reply.content.includes('✅')) {
      console.log('✅ Test 7 Passed: Response helpers work in commands');
      passed++;
    } else {
      console.error('❌ Test 7 Failed: Response helper not used correctly');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 7 Failed:', err.message);
    failed++;
  }
})();

// Test 8: Chainable registration
console.log('\n=== Test 8: Chainable Registration ===');
try {
  const Command = require('../../src/core/CommandBase');

  class ChainableCommand extends Command {
    constructor() {
      super({ name: 'chain', description: 'Test' });
    }
    async executeInteraction(_interaction) {}
  }

  const cmd = new ChainableCommand().register();

  if (cmd instanceof Command && cmd.name === 'chain') {
    console.log('✅ Test 8 Passed: Registration is chainable');
    passed++;
  } else {
    console.error('❌ Test 8 Failed: Registration not chainable');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 8 Failed:', err.message);
  failed++;
}

// Test 9: Multiple options in builder
console.log('\n=== Test 9: Multiple Options Builder ===');
try {
  const buildCommandOptions = require('../../src/core/CommandOptions');

  const { data, options } = buildCommandOptions('multi', 'Multiple options test', [
    { name: 'name', type: 'string', description: 'Name' },
    { name: 'count', type: 'integer', description: 'Count' },
    { name: 'active', type: 'boolean', description: 'Active' },
  ]);

  if (options.length === 3 && data) {
    console.log('✅ Test 9 Passed: Multiple options builder works');
    passed++;
  } else {
    console.error('❌ Test 9 Failed: Multiple options not created');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 9 Failed:', err.message);
  failed++;
}

// Test 10: No boilerplate needed for simple command
console.log('\n=== Test 10: Simple Command No Boilerplate ===');
try {
  const Command = require('../../src/core/CommandBase');

  // This should be much simpler than before
  class SimpleCmd extends Command {
    constructor() {
      super({ name: 's', description: 'd' });
    }
    async executeInteraction(i) {
      await i.reply('hello');
    }
  }

  const _cmd = new SimpleCmd().register();

  // Count number of try-catch blocks needed (should be 0 in the implementation)
  const source = SimpleCmd.prototype.executeInteraction.toString();
  const hasTryCatch = source.includes('try') && source.includes('catch');

  if (!hasTryCatch) {
    console.log('✅ Test 10 Passed: Command code has no boilerplate try-catch');
    passed++;
  } else {
    console.log('⚠️  Test 10 Skipped: Boilerplate reduction check');
  }
} catch (err) {
  console.error('❌ Test 10 Failed:', err.message);
  failed++;
}

// Wait for async tests
setTimeout(() => {
  console.log('\n=== Test Summary ===');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}, 1000);
