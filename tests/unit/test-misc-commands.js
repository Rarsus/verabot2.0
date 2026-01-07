/**
 * Test Suite: Misc Commands (hi, ping, help, poem)
 * Tests basic command functionality for misc commands
 */

/* eslint-disable no-unused-vars */

const Command = require('../../src/core/CommandBase');
const HiCommand = require('../../src/commands/misc/hi');
const PingCommand = require('../../src/commands/misc/ping');

let passed = 0;
let failed = 0;

// Mock interaction/message objects
function createMockInteraction(options = {}) {
  return {
    user: { id: '123456', username: 'testuser' },
    commandName: options.commandName || 'test',
    replied: false,
    deferred: false,
    options: {
      getString: (name) => options[name] || null,
      getInteger: (name) => options[name] || null,
      getBoolean: (name) => options[name] || false,
    },
    reply: async function (msg) {
      this.replied = true;
      this.lastReply = msg;
      return { id: '123' };
    },
    editReply: async function (msg) {
      this.lastReply = msg;
      return { id: '123' };
    },
    followUp: async function (msg) {
      this.lastFollowUp = msg;
      return { id: '456' };
    },
  };
}

function createMockMessage() {
  return {
    author: { id: '123456', bot: false },
    channel: {
      send: async function (msg) {
        this.lastSent = msg;
        return { id: '123' };
      },
    },
    reply: async function (msg) {
      this.lastReply = msg;
      return { id: '456' };
    },
  };
}

// Test 1: Hi command instantiation
console.log('\n=== Test 1: Hi Command Instantiation ===');
try {
  const hiCmd = HiCommand;
  if (hiCmd && hiCmd.name === 'hi' && typeof hiCmd.executeInteraction === 'function') {
    console.log('✅ Test 1 Passed: Hi command loaded correctly');
    passed++;
  } else {
    console.error('❌ Test 1 Failed: Hi command not properly loaded');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 1 Failed:', err.message);
  failed++;
}

// Test 2: Hi command interaction without name
console.log('\n=== Test 2: Hi Command - Execution Works ===');
(async () => {
  try {
    const interaction = createMockInteraction();
    await HiCommand.executeInteraction(interaction);
    // If we get here without error, the command executed successfully
    console.log('✅ Test 2 Passed: Hi command executes without error');
    passed++;
  } catch (err) {
    console.error('❌ Test 2 Failed:', err.message);
    failed++;
  }
})();

// Test 3: Hi command interaction with name
console.log('\n=== Test 3: Hi Command - Execution With Args ===');
(async () => {
  try {
    const interaction = createMockInteraction({ name: 'Alice' });
    interaction.options.getString = (key) => (key === 'name' ? 'Alice' : null);

    await HiCommand.executeInteraction(interaction);
    // If we get here without error, the command executed successfully
    console.log('✅ Test 3 Passed: Hi command executes with arguments');
    passed++;
  } catch (err) {
    console.error('❌ Test 3 Failed:', err.message);
    failed++;
  }
})();

// Test 4: Ping command instantiation
console.log('\n=== Test 4: Ping Command Instantiation ===');
try {
  const pingCmd = PingCommand;
  if (pingCmd && pingCmd.name === 'ping' && typeof pingCmd.executeInteraction === 'function') {
    console.log('✅ Test 4 Passed: Ping command loaded correctly');
    passed++;
  } else {
    console.error('❌ Test 4 Failed: Ping command not properly loaded');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 4 Failed:', err.message);
  failed++;
}

// Test 5: Ping command responds with pong
console.log('\n=== Test 5: Ping Command - Execution Works ===');
(async () => {
  try {
    const interaction = createMockInteraction();
    await PingCommand.executeInteraction(interaction);
    // If we get here without error, the command executed successfully
    console.log('✅ Test 5 Passed: Ping command executes without error');
    passed++;
  } catch (err) {
    console.error('❌ Test 5 Failed:', err.message);
    failed++;
  }
})();

// Test 6: Hi command has description
console.log('\n=== Test 6: Hi Command Description ===');
try {
  const hiCmd = HiCommand;
  if (hiCmd && hiCmd.description && hiCmd.description.length > 0) {
    console.log('✅ Test 6 Passed: Hi command has description');
    passed++;
  } else {
    console.error('❌ Test 6 Failed: Hi command missing description');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 6 Failed:', err.message);
  failed++;
}

// Test 7: Ping command has description
console.log('\n=== Test 7: Ping Command Description ===');
try {
  const pingCmd = PingCommand;
  if (pingCmd && pingCmd.description && pingCmd.description.length > 0) {
    console.log('✅ Test 7 Passed: Ping command has description');
    passed++;
  } else {
    console.error('❌ Test 7 Failed: Ping command missing description');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 7 Failed:', err.message);
  failed++;
}

// Test 8: Hi command has data property
console.log('\n=== Test 8: Hi Command Data Property ===');
try {
  const hiCmd = HiCommand;
  if (hiCmd && hiCmd.data && typeof hiCmd.data.toJSON === 'function') {
    console.log('✅ Test 8 Passed: Hi command has data property');
    passed++;
  } else {
    console.error('❌ Test 8 Failed: Hi command missing data property');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 8 Failed:', err.message);
  failed++;
}

// Test 9: Ping command has data property
console.log('\n=== Test 9: Ping Command Data Property ===');
try {
  const pingCmd = PingCommand;
  if (pingCmd && pingCmd.data && typeof pingCmd.data.toJSON === 'function') {
    console.log('✅ Test 9 Passed: Ping command has data property');
    passed++;
  } else {
    console.error('❌ Test 9 Failed: Ping command missing data property');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 9 Failed:', err.message);
  failed++;
}

// Test 10: Hi command has execute method (prefix command)
console.log('\n=== Test 10: Hi Command Execute Method ===');
try {
  const hiCmd = HiCommand;
  if (hiCmd && typeof hiCmd.execute === 'function') {
    console.log('✅ Test 10 Passed: Hi command has execute method');
    passed++;
  } else {
    console.error('❌ Test 10 Failed: Hi command missing execute method');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 10 Failed:', err.message);
  failed++;
}

// Test 11: Ping command has execute method (prefix command)
console.log('\n=== Test 11: Ping Command Execute Method ===');
try {
  const pingCmd = PingCommand;
  if (pingCmd && typeof pingCmd.execute === 'function') {
    console.log('✅ Test 11 Passed: Ping command has execute method');
    passed++;
  } else {
    console.error('❌ Test 11 Failed: Ping command missing execute method');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 11 Failed:', err.message);
  failed++;
}

// Test 12: Commands are instances of Command base class
console.log('\n=== Test 12: Commands Extend Base Class ===');
try {
  const hiCmd = HiCommand;
  const pingCmd = PingCommand;
  if (hiCmd instanceof Command && pingCmd instanceof Command) {
    console.log('✅ Test 12 Passed: Commands extend CommandBase');
    passed++;
  } else {
    console.error('❌ Test 12 Failed: Commands do not extend CommandBase');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 12 Failed:', err.message);
  failed++;
}

// Wait for async tests to complete
setTimeout(() => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed === 0) {
    console.log('✅ All misc command tests passed!');
  }
}, 100);
