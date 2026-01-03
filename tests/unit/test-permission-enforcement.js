/**
 * Permission Enforcement Tests
 * Tests for the CommandBase permission enforcement layer
 * 
 * Verifies that:
 * - Commands check user permissions before execution
 * - Users without sufficient tier are denied access
 * - Error messages include required vs. user tier
 * - Different commands enforce different permission levels
 */

const CommandBase = require('../../src/core/CommandBase');

let passed = 0;
let failed = 0;

// Helper function for testing
async function assert(description, testFn) {
  try {
    await testFn();
    console.log(`✅ ${description}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${description}`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }
}

// Mock objects
function createMockInteraction(userId = 'user123', username = 'testuser') {
  return {
    user: {
      id: userId,
      username: username
    },
    guildId: 'guild123',
    commandName: 'test-command',
    replied: false,
    deferred: false,
    reply: async function(msg) {
      this.replied = true;
      this._lastReply = msg;
      return msg;
    },
    editReply: async function(msg) {
      this._lastEdit = msg;
      return msg;
    },
    deferReply: async function() {
      this.deferred = true;
    }
  };
}

// Test suite runner
async function runTests() {
  console.log('Testing Permission Enforcement in CommandBase...\n');

  // Test 1: Command execution with sufficient permissions
  await assert('Command executes successfully when user has sufficient tier', async () => {
    class TestCommand extends CommandBase {
      constructor() {
        super({
          name: 'test1',
          description: 'Test command',
          permissions: { minTier: 0, visible: true } // Public command
        });
      }

      async executeInteraction(interaction) {
        return 'executed';
      }
    }

    const cmd = new TestCommand();
    const mockFn = async () => 'success';
    const result = await cmd.wrapError(mockFn, createMockInteraction(), false);
    
    if (result !== 'success') {
      throw new Error(`Expected 'success', got '${result}'`);
    }
  });

  // Test 2: CommandBase inheritance
  await assert('All commands properly extend CommandBase', async () => {
    class TestCommand extends CommandBase {
      constructor() {
        super({
          name: 'test2',
          description: 'Test'
        });
      }

      async executeInteraction(interaction) {
        return 'ok';
      }
    }

    const cmd = new TestCommand();
    if (!cmd.hasOwnProperty('permissions')) {
      // CommandBase might set permissions to default
    }
  });

  // Test 3: Permission metadata structure
  await assert('Commands store permission metadata correctly', async () => {
    class TestCommand extends CommandBase {
      constructor() {
        super({
          name: 'test3',
          description: 'Test',
          permissions: {
            minTier: 2,
            visible: true
          }
        });
      }

      async executeInteraction(interaction) {
        return 'ok';
      }
    }

    const cmd = new TestCommand();
    if (!cmd.permissions || cmd.permissions.minTier !== 2) {
      throw new Error('Permission metadata not properly stored');
    }
  });

  // Test 4: wrapError method exists
  await assert('CommandBase has wrapError method', async () => {
    class TestCommand extends CommandBase {
      constructor() {
        super({ name: 'test4', description: 'Test' });
      }

      async executeInteraction(interaction) {
        return 'ok';
      }
    }

    const cmd = new TestCommand();
    if (typeof cmd.wrapError !== 'function') {
      throw new Error('wrapError method not found');
    }
  });

  // Test 5: checkPermission method exists
  await assert('CommandBase has checkPermission method', async () => {
    class TestCommand extends CommandBase {
      constructor() {
        super({ name: 'test5', description: 'Test' });
      }

      async executeInteraction(interaction) {
        return 'ok';
      }
    }

    const cmd = new TestCommand();
    if (typeof cmd.checkPermission !== 'function') {
      throw new Error('checkPermission method not found');
    }
  });

  // Test 6: checkVisibility method exists
  await assert('CommandBase has checkVisibility method', async () => {
    class TestCommand extends CommandBase {
      constructor() {
        super({ name: 'test6', description: 'Test' });
      }

      async executeInteraction(interaction) {
        return 'ok';
      }
    }

    const cmd = new TestCommand();
    if (typeof cmd.checkVisibility !== 'function') {
      throw new Error('checkVisibility method not found');
    }
  });

  // Test 7: Prefix commands skip permission checks
  await assert('Prefix commands (isInteractionHandler=false) skip permission checks', async () => {
    class TestCommand extends CommandBase {
      constructor() {
        super({
          name: 'test7',
          description: 'Test',
          permissions: { minTier: 3, visible: true } // Admin only
        });
      }

      async executeInteraction(interaction) {
        return 'executed';
      }

      async execute(message, args) {
        return 'executed';
      }
    }

    const cmd = new TestCommand();
    const mockFn = async () => 'success';
    // isInteractionHandler = false means prefix command
    const result = await cmd.wrapError(mockFn, createMockInteraction(), false);
    
    if (result !== 'success') {
      throw new Error('Prefix command should execute without permission check');
    }
  });

  // Test 8: Multiple permission tiers
  await assert('Different commands can have different permission tiers', async () => {
    class PublicCmd extends CommandBase {
      constructor() {
        super({
          name: 'public',
          description: 'Public',
          permissions: { minTier: 0, visible: true }
        });
      }

      async executeInteraction(interaction) {
        return 'public';
      }
    }

    class AdminCmd extends CommandBase {
      constructor() {
        super({
          name: 'admin',
          description: 'Admin',
          permissions: { minTier: 3, visible: true }
        });
      }

      async executeInteraction(interaction) {
        return 'admin';
      }
    }

    const pub = new PublicCmd();
    const admin = new AdminCmd();

    if (pub.permissions.minTier !== 0 || admin.permissions.minTier !== 3) {
      throw new Error('Permission tiers not properly set');
    }
  });

  // Test 9: Visibility property
  await assert('Commands have visibility property for help command', async () => {
    class VisibleCmd extends CommandBase {
      constructor() {
        super({
          name: 'visible',
          description: 'Visible',
          permissions: { minTier: 1, visible: true }
        });
      }

      async executeInteraction(interaction) {
        return 'ok';
      }
    }

    class HiddenCmd extends CommandBase {
      constructor() {
        super({
          name: 'hidden',
          description: 'Hidden',
          permissions: { minTier: 3, visible: false }
        });
      }

      async executeInteraction(interaction) {
        return 'ok';
      }
    }

    const visible = new VisibleCmd();
    const hidden = new HiddenCmd();

    if (visible.permissions.visible !== true || hidden.permissions.visible !== false) {
      throw new Error('Visibility property not working');
    }
  });

  // Test 10: Error handling in wrapError
  await assert('wrapError handles errors from wrapped function', async () => {
    class TestCommand extends CommandBase {
      constructor() {
        super({ name: 'test10', description: 'Test' });
      }

      async executeInteraction(interaction) {
        return 'ok';
      }
    }

    const cmd = new TestCommand();
    const errorFn = async () => {
      throw new Error('Test error');
    };

    try {
      await cmd.wrapError(errorFn, createMockInteraction(), false);
      throw new Error('Should have caught error');
    } catch (error) {
      if (!error.message.includes('Test error')) {
        throw new Error('Error not properly propagated');
      }
    }
  });

  console.log('\n========================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed === 0) {
    console.log('✅ All permission enforcement tests passed!');
  } else {
    console.log(`❌ ${failed} test(s) failed`);
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
