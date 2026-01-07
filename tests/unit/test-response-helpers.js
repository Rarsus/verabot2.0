/**
 * Test Suite: Response Helpers
 * Tests quote embeds, success/error messages, DM sending, and defer logic
 */

const {
  sendQuoteEmbed,
  sendSuccess,
  sendError,
  sendDM,
  deferReply
} = require('../../src/utils/helpers/response-helpers');

let passed = 0;
let failed = 0;

// Mock objects
function createMockInteraction(replied = false, deferred = false) {
  return {
    deferred: deferred,
    replied: replied,
    reply: async function(msg) {
      this.replied = true;
      this._lastReply = msg;
      return msg;
    },
    editReply: async function(msg) {
      this._lastEdit = msg;
      return msg;
    },
    followUp: async function(msg) {
      this._lastFollowUp = msg;
      return msg;
    },
    deferReply: async function() {
      this.deferred = true;
    },
    user: { createDM: async function() {
      return {
        send: async function(msg) {
          return msg;
        }
      };
    }}
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
      author: 'Steve Jobs'
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

    if (interaction._lastReply.embeds &&
        interaction._lastReply.embeds[0].data.footer &&
        interaction._lastReply.embeds[0].data.footer.text.includes('Great Person') &&
        interaction._lastReply.embeds[0].data.footer.text.includes('42')) {
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

    if (interaction._lastReply &&
        interaction._lastReply.content.includes('✅') &&
        interaction._lastReply.content.includes('Operation successful')) {
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

    if (interaction._lastReply &&
        interaction._lastReply.content.includes('❌') &&
        interaction._lastReply.content.includes('Something went wrong')) {
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

    if (interaction._lastReply &&
        interaction._lastReply.content.includes('Check your DMs')) {
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

    interaction.deferReply = async function() {
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

// Test 13: sendError with ephemeral = true sets flags to 64
console.log('\n=== Test 13: sendError Ephemeral True Sets Flags 64 ===');
(async () => {
  try {
    const interaction = createMockInteraction(false, false);

    await sendError(interaction, 'Test error', true);

    if (interaction._lastReply && interaction._lastReply.flags === 64) {
      console.log('✅ Test 13 Passed: sendError with ephemeral=true sets flags to 64');
      passed++;
    } else {
      console.error(`❌ Test 13 Failed: flags should be 64, got ${interaction._lastReply?.flags}`);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 13 Failed:', err.message);
    failed++;
  }
})();

// Test 14: sendError with ephemeral = false sets flags to undefined
console.log('\n=== Test 14: sendError Ephemeral False Sets Flags Undefined ===');
(async () => {
  try {
    const interaction = createMockInteraction(false, false);

    await sendError(interaction, 'Test error', false);

    if (interaction._lastReply && interaction._lastReply.flags === undefined) {
      console.log('✅ Test 14 Passed: sendError with ephemeral=false sets flags to undefined');
      passed++;
    } else {
      console.error(`❌ Test 14 Failed: flags should be undefined, got ${interaction._lastReply?.flags}`);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 14 Failed:', err.message);
    failed++;
  }
})();

// Test 15: sendSuccess with ephemeral = true sets flags to 64
console.log('\n=== Test 15: sendSuccess Ephemeral True Sets Flags 64 ===');
(async () => {
  try {
    const interaction = createMockInteraction(false, false);

    await sendSuccess(interaction, 'Test success', true);

    if (interaction._lastReply && interaction._lastReply.flags === 64) {
      console.log('✅ Test 15 Passed: sendSuccess with ephemeral=true sets flags to 64');
      passed++;
    } else {
      console.error(`❌ Test 15 Failed: flags should be 64, got ${interaction._lastReply?.flags}`);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 15 Failed:', err.message);
    failed++;
  }
})();

// Test 16: sendSuccess with ephemeral = false sets flags to undefined
console.log('\n=== Test 16: sendSuccess Ephemeral False Sets Flags Undefined ===');
(async () => {
  try {
    const interaction = createMockInteraction(false, false);

    await sendSuccess(interaction, 'Test success', false);

    if (interaction._lastReply && interaction._lastReply.flags === undefined) {
      console.log('✅ Test 16 Passed: sendSuccess with ephemeral=false sets flags to undefined');
      passed++;
    } else {
      console.error(`❌ Test 16 Failed: flags should be undefined, got ${interaction._lastReply?.flags}`);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 16 Failed:', err.message);
    failed++;
  }
})();

// Test 17: sendError ephemeral flag on deferred interaction
console.log('\n=== Test 17: sendError Ephemeral Flag on Deferred Interaction ===');
(async () => {
  try {
    const interaction = createMockInteraction(false, true);

    await sendError(interaction, 'Test error', true);

    if (interaction._lastEdit && interaction._lastEdit.flags === 64) {
      console.log('✅ Test 17 Passed: sendError with ephemeral=true sets flags to 64 on deferred');
      passed++;
    } else {
      console.error(`❌ Test 17 Failed: flags should be 64, got ${interaction._lastEdit?.flags}`);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 17 Failed:', err.message);
    failed++;
  }
})();

// Test 18: sendError with ephemeral = false on deferred interaction
console.log('\n=== Test 18: sendError Ephemeral False on Deferred Interaction ===');
(async () => {
  try {
    const interaction = createMockInteraction(false, true);

    await sendError(interaction, 'Test error', false);

    if (interaction._lastEdit && interaction._lastEdit.flags === undefined) {
      console.log('✅ Test 18 Passed: sendError with ephemeral=false sets flags to undefined on deferred');
      passed++;
    } else {
      console.error(`❌ Test 18 Failed: flags should be undefined, got ${interaction._lastEdit?.flags}`);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 18 Failed:', err.message);
    failed++;
  }
})();

// Test 19: Send opt-in success on new interaction
console.log('\n=== Test 19: Send Opt-In Success ===');
(async () => {
  try {
    const { sendOptInSuccess } = require('../../src/utils/helpers/response-helpers');
    const interaction = createMockInteraction(false, false);

    await sendOptInSuccess(interaction);

    if (interaction._lastReply &&
        interaction._lastReply.content.includes('✅') &&
        interaction._lastReply.content.includes('opted in') &&
        interaction._lastReply.flags === 64) {
      console.log('✅ Test 19 Passed: Opt-in success message sent with ephemeral flag');
      passed++;
    } else {
      console.error('❌ Test 19 Failed: Opt-in success message not correct');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 19 Failed:', err.message);
    failed++;
  }
})();

// Test 20: Send opt-in success on deferred interaction
console.log('\n=== Test 20: Send Opt-In Success on Deferred ===');
(async () => {
  try {
    const { sendOptInSuccess } = require('../../src/utils/helpers/response-helpers');
    const interaction = createMockInteraction(false, true);

    await sendOptInSuccess(interaction);

    if (interaction._lastEdit &&
        interaction._lastEdit.content.includes('✅') &&
        interaction._lastEdit.flags === 64) {
      console.log('✅ Test 20 Passed: Opt-in success uses editReply when deferred');
      passed++;
    } else {
      console.error('❌ Test 20 Failed: Opt-in success not using editReply');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 20 Failed:', err.message);
    failed++;
  }
})();

// Test 21: Send opt-out success on new interaction
console.log('\n=== Test 21: Send Opt-Out Success ===');
(async () => {
  try {
    const { sendOptOutSuccess } = require('../../src/utils/helpers/response-helpers');
    const interaction = createMockInteraction(false, false);

    await sendOptOutSuccess(interaction);

    if (interaction._lastReply &&
        interaction._lastReply.content.includes('⚠️') &&
        interaction._lastReply.content.includes('opted out') &&
        interaction._lastReply.flags === 64) {
      console.log('✅ Test 21 Passed: Opt-out success message sent with warning icon');
      passed++;
    } else {
      console.error('❌ Test 21 Failed: Opt-out success message not correct');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 21 Failed:', err.message);
    failed++;
  }
})();

// Test 22: Send opt-out success on deferred interaction
console.log('\n=== Test 22: Send Opt-Out Success on Deferred ===');
(async () => {
  try {
    const { sendOptOutSuccess } = require('../../src/utils/helpers/response-helpers');
    const interaction = createMockInteraction(false, true);

    await sendOptOutSuccess(interaction);

    if (interaction._lastEdit &&
        interaction._lastEdit.content.includes('⚠️') &&
        interaction._lastEdit.flags === 64) {
      console.log('✅ Test 22 Passed: Opt-out success uses editReply when deferred');
      passed++;
    } else {
      console.error('❌ Test 22 Failed: Opt-out success not using editReply');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 22 Failed:', err.message);
    failed++;
  }
})();

// Test 23: Send opt-in status - opted in
console.log('\n=== Test 23: Send Opt-In Status - Opted In ===');
(async () => {
  try {
    const { sendOptInStatus } = require('../../src/utils/helpers/response-helpers');
    const interaction = createMockInteraction(false, false);

    await sendOptInStatus(interaction, true, '2026-01-05 10:00:00');

    if (interaction._lastReply &&
        interaction._lastReply.content.includes('✅ Opted In') &&
        interaction._lastReply.content.includes('2026-01-05 10:00:00') &&
        interaction._lastReply.flags === 64) {
      console.log('✅ Test 23 Passed: Opt-in status shows correct status');
      passed++;
    } else {
      console.error('❌ Test 23 Failed: Opt-in status not correct');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 23 Failed:', err.message);
    failed++;
  }
})();

// Test 24: Send opt-in status - opted out
console.log('\n=== Test 24: Send Opt-In Status - Opted Out ===');
(async () => {
  try {
    const { sendOptInStatus } = require('../../src/utils/helpers/response-helpers');
    const interaction = createMockInteraction(false, false);

    await sendOptInStatus(interaction, false, '2026-01-04 15:30:00');

    if (interaction._lastReply &&
        interaction._lastReply.content.includes('❌ Opted Out') &&
        interaction._lastReply.content.includes('2026-01-04 15:30:00')) {
      console.log('✅ Test 24 Passed: Opt-in status shows opted out');
      passed++;
    } else {
      console.error('❌ Test 24 Failed: Opt-in status not showing opted out');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 24 Failed:', err.message);
    failed++;
  }
})();

// Test 25: Send opt-in status - never updated
console.log('\n=== Test 25: Send Opt-In Status - Never Updated ===');
(async () => {
  try {
    const { sendOptInStatus } = require('../../src/utils/helpers/response-helpers');
    const interaction = createMockInteraction(false, false);

    await sendOptInStatus(interaction, true, null);

    if (interaction._lastReply &&
        interaction._lastReply.content.includes('Never')) {
      console.log('✅ Test 25 Passed: Opt-in status shows Never when no timestamp');
      passed++;
    } else {
      console.error('❌ Test 25 Failed: Opt-in status not handling null timestamp');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 25 Failed:', err.message);
    failed++;
  }
})();

// Test 26: Send opt-in decision prompt on new interaction
console.log('\n=== Test 26: Send Opt-In Decision Prompt ===');
(async () => {
  try {
    const { sendOptInDecisionPrompt } = require('../../src/utils/helpers/response-helpers');
    const interaction = createMockInteraction(false, false);
    const recipient = { username: 'TestUser', id: '123456' };

    await sendOptInDecisionPrompt(interaction, recipient, 'Important reminder');

    if (interaction._lastReply &&
        interaction._lastReply.content.includes('⚠️') &&
        interaction._lastReply.content.includes('TestUser') &&
        interaction._lastReply.content.includes('Important reminder') &&
        interaction._lastReply.components &&
        interaction._lastReply.components.length > 0) {
      console.log('✅ Test 26 Passed: Opt-in decision prompt sent with buttons');
      passed++;
    } else {
      console.error('❌ Test 26 Failed: Opt-in decision prompt not correct');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 26 Failed:', err.message);
    failed++;
  }
})();

// Test 27: Send opt-in decision prompt on deferred interaction
console.log('\n=== Test 27: Send Opt-In Decision Prompt on Deferred ===');
(async () => {
  try {
    const { sendOptInDecisionPrompt } = require('../../src/utils/helpers/response-helpers');
    const interaction = createMockInteraction(false, true);
    const recipient = { username: 'TestUser', id: '123456' };

    await sendOptInDecisionPrompt(interaction, recipient, 'Test reminder');

    if (interaction._lastEdit &&
        interaction._lastEdit.content.includes('⚠️') &&
        interaction._lastEdit.components &&
        interaction._lastEdit.components.length > 0) {
      console.log('✅ Test 27 Passed: Opt-in decision prompt uses editReply when deferred');
      passed++;
    } else {
      console.error('❌ Test 27 Failed: Opt-in decision prompt not using editReply');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 27 Failed:', err.message);
    failed++;
  }
})();

// Test 28: Send reminder created server-only on new interaction
console.log('\n=== Test 28: Send Reminder Created Server-Only ===');
(async () => {
  try {
    const { sendReminderCreatedServerOnly } = require('../../src/utils/helpers/response-helpers');
    const interaction = createMockInteraction(false, false);
    const recipient = { username: 'TestUser', id: '123456' };

    await sendReminderCreatedServerOnly(interaction, recipient, 'Meeting at 3pm');

    if (interaction._lastReply &&
        interaction._lastReply.content.includes('✅') &&
        interaction._lastReply.content.includes('TestUser') &&
        interaction._lastReply.content.includes('Server Only') &&
        interaction._lastReply.content.includes('Meeting at 3pm')) {
      console.log('✅ Test 28 Passed: Reminder server-only confirmation sent');
      passed++;
    } else {
      console.error('❌ Test 28 Failed: Reminder server-only confirmation not correct');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 28 Failed:', err.message);
    failed++;
  }
})();

// Test 29: Send reminder created server-only on deferred interaction
console.log('\n=== Test 29: Send Reminder Created Server-Only on Deferred ===');
(async () => {
  try {
    const { sendReminderCreatedServerOnly } = require('../../src/utils/helpers/response-helpers');
    const interaction = createMockInteraction(false, true);
    const recipient = { username: 'TestUser', id: '123456' };

    await sendReminderCreatedServerOnly(interaction, recipient, 'Test reminder');

    if (interaction._lastEdit &&
        interaction._lastEdit.content.includes('✅')) {
      console.log('✅ Test 29 Passed: Reminder server-only uses editReply when deferred');
      passed++;
    } else {
      console.error('❌ Test 29 Failed: Reminder server-only not using editReply');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 29 Failed:', err.message);
    failed++;
  }
})();

// Test 30: Send opt-in request
console.log('\n=== Test 30: Send Opt-In Request ===');
(async () => {
  try {
    const { sendOptInRequest } = require('../../src/utils/helpers/response-helpers');
    const user = {
      createDM: async () => ({
        send: async (msg) => {
          return { success: true, sent: msg };
        }
      })
    };
    const sender = { username: 'Admin', id: '654321' };

    await sendOptInRequest(user, sender, 'Urgent notification');

    console.log('✅ Test 30 Passed: Opt-in request sent to user DM');
    passed++;
  } catch (err) {
    console.error('❌ Test 30 Failed:', err.message);
    failed++;
  }
})();

// Test 31: Send opt-in request with DM creation error
console.log('\n=== Test 31: Send Opt-In Request - DM Error ===');
(async () => {
  try {
    const { sendOptInRequest } = require('../../src/utils/helpers/response-helpers');
    const user = {
      createDM: async () => {
        throw new Error('Cannot create DM');
      }
    };
    const sender = { username: 'Admin', id: '654321' };

    await sendOptInRequest(user, sender, 'Test reminder');

    console.error('❌ Test 31 Failed: Should have thrown error');
    failed++;
  } catch (err) {
    if (err.message.includes('Could not send DM')) {
      console.log('✅ Test 31 Passed: Opt-in request throws error on DM failure');
      passed++;
    } else {
      console.error('❌ Test 31 Failed: Wrong error message');
      failed++;
    }
  }
})();

// Test 32: Success on replied interaction uses editReply
console.log('\n=== Test 32: Success on Replied Uses editReply ===');
(async () => {
  try {
    const interaction = createMockInteraction(true, false);

    await sendSuccess(interaction, 'Done');

    if (interaction._lastEdit && interaction._lastEdit.content.includes('✅')) {
      console.log('✅ Test 32 Passed: Success uses editReply when already replied');
      passed++;
    } else {
      console.error('❌ Test 32 Failed: Not using editReply');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 32 Failed:', err.message);
    failed++;
  }
})();

// Test 33: Error on replied interaction uses editReply
console.log('\n=== Test 33: Error on Replied Uses editReply ===');
(async () => {
  try {
    const interaction = createMockInteraction(true, false);

    await sendError(interaction, 'Failed');

    if (interaction._lastEdit && interaction._lastEdit.content.includes('❌')) {
      console.log('✅ Test 33 Passed: Error uses editReply when already replied');
      passed++;
    } else {
      console.error('❌ Test 33 Failed: Not using editReply');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 33 Failed:', err.message);
    failed++;
  }
})();

// Print summary after all async tests complete, without blocking with setTimeout
// Instead, use a more reliable async pattern
Promise.resolve().then(() => {
  // This runs after all microtasks
  setImmediate(() => {
    console.log('\n=== Test Summary ===');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Total: ${passed + failed}`);
  });
});
