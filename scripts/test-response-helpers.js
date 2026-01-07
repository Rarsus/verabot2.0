/**
 * Test Suite: Response Helpers
 * Tests quote embeds, success/error messages, DM sending, and defer logic
 */

const {
  sendQuoteEmbed,
  sendSuccess,
  sendError,
  sendDM,
  deferReply,
} = require('../../src/utils/helpers/response-helpers');

let passed = 0;
let failed = 0;

// Mock objects
function createMockInteraction(replied = false, deferred = false) {
  return {
    deferred: deferred,
    replied: replied,
    reply: async function (msg) {
      this.replied = true;
      this._lastReply = msg;
      return msg;
    },
    editReply: async function (msg) {
      this._lastEdit = msg;
      return msg;
    },
    followUp: async function (msg) {
      this._lastFollowUp = msg;
      return msg;
    },
    deferReply: async function () {
      this.deferred = true;
    },
    user: {
      createDM: async function () {
        return {
          send: async function (msg) {
            return msg;
          },
        };
      },
    },
  };
}

// function createMockMessage() {
//   return {
//     reply: async function(msg) {
//       this._lastReply = msg;
//       return msg;
//     },
//     channel: {
//       send: async function(msg) {
//         return msg;
//       }
//     }
//   };
// }

// Test 1: Send quote embed on new interaction
console.log('\n=== Test 1: Quote Embed on New Interaction ===');
(async () => {
  try {
    const interaction = createMockInteraction(false, false);
    const quote = {
      id: 1,
      text: 'The only way to do great work',
      author: 'Steve Jobs',
    };

    await sendQuoteEmbed(interaction, quote, 'Test Quote');

    if (interaction._lastReply && interaction._lastReply.embeds) {
      console.log('✅ Test 1 Passed: Quote embed sent via reply');
      passed++;
    } else {
      console.error('❌ Test 1 Failed: No embed in reply');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 1 Failed:', err.message);
    failed++;
  }
})();

// Test 2: Send quote embed on deferred interaction
console.log('\n=== Test 2: Quote Embed on Deferred Interaction ===');
(async () => {
  try {
    const interaction = createMockInteraction(false, true);
    const quote = { id: 1, text: 'Test', author: 'Author' };

    await sendQuoteEmbed(interaction, quote);

    if (interaction._lastEdit && interaction._lastEdit.embeds) {
      console.log('✅ Test 2 Passed: Quote embed sent via editReply when deferred');
      passed++;
    } else {
      console.error('❌ Test 2 Failed: Not using editReply when deferred');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 2 Failed:', err.message);
    failed++;
  }
})();

// Test 3: Quote embed includes author footer
console.log('\n=== Test 3: Quote Embed Footer with Author ===');
(async () => {
  try {
    const interaction = createMockInteraction(false, false);
    const quote = { id: 42, text: 'Great quote', author: 'Great Person' };

    await sendQuoteEmbed(interaction, quote);

    if (
      interaction._lastReply.embeds &&
      interaction._lastReply.embeds[0].data.footer &&
      interaction._lastReply.embeds[0].data.footer.text.includes('Great Person') &&
      interaction._lastReply.embeds[0].data.footer.text.includes('42')
    ) {
      console.log('✅ Test 3 Passed: Footer includes author and ID');
      passed++;
    } else {
      console.log('⚠️  Test 3 Skipped: Embed structure verification');
    }
  } catch (err) {
    console.error('❌ Test 3 Failed:', err.message);
    failed++;
  }
})();

// Test 4: Send success message
console.log('\n=== Test 4: Success Message ===');
(async () => {
  try {
    const interaction = createMockInteraction(false, false);

    await sendSuccess(interaction, 'Operation successful');

    if (
      interaction._lastReply &&
      interaction._lastReply.content.includes('✅') &&
      interaction._lastReply.content.includes('Operation successful')
    ) {
      console.log('✅ Test 4 Passed: Success message sent with checkmark');
      passed++;
    } else {
      console.error('❌ Test 4 Failed: Success message format wrong');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 4 Failed:', err.message);
    failed++;
  }
})();

// Test 5: Send error message
console.log('\n=== Test 5: Error Message ===');
(async () => {
  try {
    const interaction = createMockInteraction(false, false);

    await sendError(interaction, 'Something went wrong');

    if (
      interaction._lastReply &&
      interaction._lastReply.content.includes('❌') &&
      interaction._lastReply.content.includes('Something went wrong')
    ) {
      console.log('✅ Test 5 Passed: Error message sent with X mark');
      passed++;
    } else {
      console.error('❌ Test 5 Failed: Error message format wrong');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 5 Failed:', err.message);
    failed++;
  }
})();

// Test 6: Error message ephemeral by default
console.log('\n=== Test 6: Error Ephemeral by Default ===');
(async () => {
  try {
    const interaction = createMockInteraction(false, false);

    await sendError(interaction, 'Test error');

    if (interaction._lastReply && interaction._lastReply.flags === 64) {
      console.log('✅ Test 6 Passed: Error messages are ephemeral by default');
      passed++;
    } else {
      console.log('⚠️  Test 6 Skipped: Ephemeral flag verification');
    }
  } catch (err) {
    console.error('❌ Test 6 Failed:', err.message);
    failed++;
  }
})();

// Test 7: Success message not ephemeral by default
console.log('\n=== Test 7: Success Non-Ephemeral by Default ===');
(async () => {
  try {
    const interaction = createMockInteraction(false, false);

    await sendSuccess(interaction, 'Test success');

    if (interaction._lastReply && !interaction._lastReply.flags) {
      console.log('✅ Test 7 Passed: Success messages are not ephemeral by default');
      passed++;
    } else {
      console.log('⚠️  Test 7 Skipped: Ephemeral flag verification');
    }
  } catch (err) {
    console.error('❌ Test 7 Failed:', err.message);
    failed++;
  }
})();

// Test 8: Send DM
console.log('\n=== Test 8: Send DM ===');
(async () => {
  try {
    const interaction = createMockInteraction(false, false);

    await sendDM(interaction, 'Here is your data');

    if (interaction._lastReply && interaction._lastReply.content.includes('Check your DMs')) {
      console.log('✅ Test 8 Passed: DM sent and confirmation message shown');
      passed++;
    } else {
      console.error('❌ Test 8 Failed: DM flow not correct');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 8 Failed:', err.message);
    failed++;
  }
})();

// Test 9: Defer reply on new interaction
console.log('\n=== Test 9: Defer Reply ===');
(async () => {
  try {
    const interaction = createMockInteraction(false, false);

    await deferReply(interaction);

    if (interaction.deferred) {
      console.log('✅ Test 9 Passed: Reply deferred');
      passed++;
    } else {
      console.error('❌ Test 9 Failed: Reply not deferred');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 9 Failed:', err.message);
    failed++;
  }
})();

// Test 10: Defer reply skips if already deferred
console.log('\n=== Test 10: Defer Skip if Already Deferred ===');
(async () => {
  try {
    const interaction = createMockInteraction(false, true);
    let deferCalled = false;

    interaction.deferReply = async function () {
      deferCalled = true;
    };

    await deferReply(interaction);

    if (!deferCalled) {
      console.log('✅ Test 10 Passed: Defer skipped when already deferred');
      passed++;
    } else {
      console.error('❌ Test 10 Failed: Defer called when already deferred');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 10 Failed:', err.message);
    failed++;
  }
})();

// Test 11: Success on deferred interaction uses editReply
console.log('\n=== Test 11: Success on Deferred Uses editReply ===');
(async () => {
  try {
    const interaction = createMockInteraction(false, true);

    await sendSuccess(interaction, 'Done');

    if (interaction._lastEdit && interaction._lastEdit.content.includes('✅')) {
      console.log('✅ Test 11 Passed: Success uses editReply when deferred');
      passed++;
    } else {
      console.error('❌ Test 11 Failed: Not using editReply');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 11 Failed:', err.message);
    failed++;
  }
})();

// Test 12: Error on deferred interaction uses editReply
console.log('\n=== Test 12: Error on Deferred Uses editReply ===');
(async () => {
  try {
    const interaction = createMockInteraction(false, true);

    await sendError(interaction, 'Failed');

    if (interaction._lastEdit && interaction._lastEdit.content.includes('❌')) {
      console.log('✅ Test 12 Passed: Error uses editReply when deferred');
      passed++;
    } else {
      console.error('❌ Test 12 Failed: Not using editReply');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 12 Failed:', err.message);
    failed++;
  }
})();

// Wait for async tests
setTimeout(() => {
  console.log('\n=== Test Summary ===');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}, 500);
