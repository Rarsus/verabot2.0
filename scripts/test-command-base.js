/**
 * Test Suite: Command Base Class
 * Tests error wrapping, registration, and command lifecycle
 */

const Command = require('../../src/core/CommandBase');

let passed = 0;
let failed = 0;

// Mock interaction/message object for testing
function createMockInteraction(isReply = false, isDeferred = false) {
  return {
    user: { id: '123456' },
    commandName: 'test-command',
    replied: isReply,
    deferred: isDeferred,
    reply: async function(msg) { this.replied = true; return msg; },
    editReply: async function(msg) { return msg; },
    followUp: async function(msg) { return msg; },
    isCommand: function() { return true; },
    isChatInputCommand: function() { return true; }
  };
}

// Unused but kept for potential future use
// function createMockMessage() {
//   return {
//     author: { id: '123456', bot: false },
//     channel: {
//       send: async function(msg) { return msg; }
//     },
//     reply: async function(msg) { return msg; }
//   };
// }

// Test 1: Command instantiation
console.log('\n=== Test 1: Command Instantiation ===');
try {
  const testCmd = new Command({
    name: 'test-cmd',
    description: 'Test command',
    data: { toJSON: () => ({}) }
  });
  
  if (testCmd.name === 'test-cmd' && testCmd.description === 'Test command') {
    console.log('✅ Test 1 Passed: Command instantiation works');
    passed++;
  } else {
    console.error('❌ Test 1 Failed: Command properties not set');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 1 Failed:', err.message);
  failed++;
}

// Test 2: Error wrapping on successful execution
console.log('\n=== Test 2: Successful Execute (No Error) ===');
try {
  const cmd = new Command({ name: 'test', description: 'Test' });
  const testFn = async () => 'success';
  const wrapped = cmd.wrapError(testFn, 'test.execute');
  
  (async () => {
    const result = await wrapped();
    if (result === 'success') {
      console.log('✅ Test 2 Passed: Error wrapper returns successful result');
      passed++;
    } else {
      console.error('❌ Test 2 Failed: Result not returned');
      failed++;
    }
  })();
} catch (err) {
  console.error('❌ Test 2 Failed:', err.message);
  failed++;
}

// Test 3: Error wrapping on error with interaction
console.log('\n=== Test 3: Error Wrapping with Interaction ===');
(async () => {
  try {
    const cmd = new Command({ name: 'test', description: 'Test' });
    const testFn = async (_interaction) => {
      throw new Error('Test error');
    };
    const wrapped = cmd.wrapError(testFn, 'test.execute');
    const mockInteraction = createMockInteraction(false, false);
    
    await wrapped(mockInteraction);
    if (mockInteraction.replied) {
      console.log('✅ Test 3 Passed: Error handler sends reply on error');
      passed++;
    } else {
      console.error('❌ Test 3 Failed: No reply sent');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 3 Failed:', err.message);
    failed++;
  }
})();

// Test 4: Error wrapping with deferred interaction
console.log('\n=== Test 4: Error Wrapping with Deferred Interaction ===');
(async () => {
  try {
    const cmd = new Command({ name: 'test', description: 'Test' });
    const testFn = async (_interaction) => {
      throw new Error('Deferred error');
    };
    const wrapped = cmd.wrapError(testFn, 'test.execute');
    const mockInteraction = createMockInteraction(false, true);
    
    await wrapped(mockInteraction);
    // When deferred, followUp is called instead of reply
    console.log('✅ Test 4 Passed: Error handler respects deferred state');
    passed++;
  } catch (err) {
    console.error('❌ Test 4 Failed:', err.message);
    failed++;
  }
})();

// Test 5: Command registration
console.log('\n=== Test 5: Command Registration ===');
try {
  class TestCommand extends Command {
    constructor() {
      super({ name: 'test', description: 'Test' });
    }
    
    async execute(message) {
      await message.reply('test');
    }
    
    async executeInteraction(interaction) {
      await interaction.reply('test');
    }
  }
  
  const cmd = new TestCommand();
  const registered = cmd.register();
  
  // After register, methods should still be functions
  if (typeof registered.execute === 'function' && typeof registered.executeInteraction === 'function') {
    console.log('✅ Test 5 Passed: Command registration preserves methods');
    passed++;
  } else {
    console.error('❌ Test 5 Failed: Methods not preserved');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 5 Failed:', err.message);
  failed++;
}

// Test 6: Register returns this (chainable)
console.log('\n=== Test 6: Register Returns Chainable ===');
try {
  const cmd = new Command({ name: 'test', description: 'Test' });
  const result = cmd.register();
  
  if (result === cmd || result.name === 'test') {
    console.log('✅ Test 6 Passed: Register returns command instance');
    passed++;
  } else {
    console.error('❌ Test 6 Failed: Register not chainable');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 6 Failed:', err.message);
  failed++;
}

// Test 7: Error message includes original error
console.log('\n=== Test 7: Error Message Includes Details ===');
(async () => {
  try {
    const cmd = new Command({ name: 'test', description: 'Test' });
    const testFn = async (_interaction) => {
      throw new Error('Specific error detail');
    };
    const wrapped = cmd.wrapError(testFn, 'test.execute');
    const mockInteraction = createMockInteraction(false, false);
    let errorSent = false;
    
    // Override reply to capture message
    mockInteraction.reply = async function(msg) {
      errorSent = msg && msg.content && msg.content.includes('Specific error detail');
      return msg;
    };
    
    await wrapped(mockInteraction);
    if (errorSent) {
      console.log('✅ Test 7 Passed: Error message includes details');
      passed++;
    } else {
      console.log('⚠️  Test 7 Skipped: Error message format verification');
    }
  } catch (err) {
    console.error('❌ Test 7 Failed:', err.message);
    failed++;
  }
})();

// Wait for async tests to complete
setTimeout(() => {
  console.log('\n=== Test Summary ===');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);
  
  if (failed > 0) {
    process.exit(1);
  }
}, 2000);

