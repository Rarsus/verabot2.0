/**
 * Test Suite: Datetime Parser
 * Tests datetime parsing for various input formats
 */

/* eslint-disable no-unused-vars */

const {
  parseDateTime,
  parseRelativeTime,
  parseNaturalDate,
  parseTimeOnly,
  parseDateOnly,
  parseCombinedDateTime
} = require('../../src/utils/helpers/datetime-parser');

let passed = 0;
let failed = 0;

/**
 * Helper to check if a date is within expected range (for relative times)
 * @param {Date} actual - Actual date
 * @param {Date} expected - Expected date
 * @param {number} toleranceMs - Tolerance in milliseconds
 * @returns {boolean} True if within tolerance
 */
function datesAreClose(actual, expected, toleranceMs = 5000) {
  const diff = Math.abs(actual.getTime() - expected.getTime());
  return diff <= toleranceMs;
}

async function runTests() {
  console.log('\n=== Datetime Parser Tests ===\n');

  // ==================== RELATIVE TIME TESTS ====================

  // Test 1: Relative time - minutes
  console.log('=== Test 1: Relative Time (30 minutes) ===');
  try {
    const result = parseDateTime('30 minutes');
    if (result.valid && result.isoString) {
      const parsedDate = new Date(result.isoString);
      const expected = new Date();
      expected.setMinutes(expected.getMinutes() + 30);
      if (datesAreClose(parsedDate, expected)) {
        console.log('✅ Test 1 Passed: 30 minutes parsed correctly');
        passed++;
      } else {
        console.error('❌ Test 1 Failed: Date mismatch');
        failed++;
      }
    } else {
      console.error('❌ Test 1 Failed: Invalid result');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 1 Failed:', err.message);
    failed++;
  }

  // Test 2: Relative time - hours
  console.log('\n=== Test 2: Relative Time (2 hours) ===');
  try {
    const result = parseDateTime('2 hours');
    if (result.valid && result.isoString) {
      const parsedDate = new Date(result.isoString);
      const expected = new Date();
      expected.setHours(expected.getHours() + 2);
      if (datesAreClose(parsedDate, expected)) {
        console.log('✅ Test 2 Passed: 2 hours parsed correctly');
        passed++;
      } else {
        console.error('❌ Test 2 Failed: Date mismatch');
        failed++;
      }
    } else {
      console.error('❌ Test 2 Failed: Invalid result');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 2 Failed:', err.message);
    failed++;
  }

  // Test 3: Relative time - days
  console.log('\n=== Test 3: Relative Time (1 day) ===');
  try {
    const result = parseDateTime('1 day');
    if (result.valid && result.isoString) {
      const parsedDate = new Date(result.isoString);
      const expected = new Date();
      expected.setDate(expected.getDate() + 1);
      if (datesAreClose(parsedDate, expected)) {
        console.log('✅ Test 3 Passed: 1 day parsed correctly');
        passed++;
      } else {
        console.error('❌ Test 3 Failed: Date mismatch');
        failed++;
      }
    } else {
      console.error('❌ Test 3 Failed: Invalid result');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 3 Failed:', err.message);
    failed++;
  }

  // Test 4: Relative time - weeks
  console.log('\n=== Test 4: Relative Time (1 week) ===');
  try {
    const result = parseDateTime('1 week');
    if (result.valid && result.isoString) {
      const parsedDate = new Date(result.isoString);
      const expected = new Date();
      expected.setDate(expected.getDate() + 7);
      if (datesAreClose(parsedDate, expected)) {
        console.log('✅ Test 4 Passed: 1 week parsed correctly');
        passed++;
      } else {
        console.error('❌ Test 4 Failed: Date mismatch');
        failed++;
      }
    } else {
      console.error('❌ Test 4 Failed: Invalid result');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 4 Failed:', err.message);
    failed++;
  }

  // Test 5: Relative time - months
  console.log('\n=== Test 5: Relative Time (3 months) ===');
  try {
    const result = parseDateTime('3 months');
    if (result.valid && result.isoString) {
      const parsedDate = new Date(result.isoString);
      const expected = new Date();
      expected.setMonth(expected.getMonth() + 3);
      if (datesAreClose(parsedDate, expected)) {
        console.log('✅ Test 5 Passed: 3 months parsed correctly');
        passed++;
      } else {
        console.error('❌ Test 5 Failed: Date mismatch');
        failed++;
      }
    } else {
      console.error('❌ Test 5 Failed: Invalid result');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 5 Failed:', err.message);
    failed++;
  }

  // Test 6: Relative time - short forms
  console.log('\n=== Test 6: Relative Time (5 min) ===');
  try {
    const result = parseDateTime('5 min');
    if (result.valid && result.isoString) {
      console.log('✅ Test 6 Passed: Short form "min" parsed correctly');
      passed++;
    } else {
      console.error('❌ Test 6 Failed: Invalid result');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 6 Failed:', err.message);
    failed++;
  }

  // ==================== ISO FORMAT TESTS ====================

  // Test 7: ISO format - full timestamp
  console.log('\n=== Test 7: ISO Format (Full) ===');
  try {
    const isoDate = '2025-12-31T15:30:00.000Z';
    const result = parseDateTime(isoDate);
    if (result.valid && result.isoString === isoDate) {
      console.log('✅ Test 7 Passed: ISO format maintained');
      passed++;
    } else {
      console.error('❌ Test 7 Failed: ISO format not maintained');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 7 Failed:', err.message);
    failed++;
  }

  // Test 8: ISO format - without milliseconds
  console.log('\n=== Test 8: ISO Format (No Milliseconds) ===');
  try {
    const result = parseDateTime('2025-12-31T15:30:00Z');
    if (result.valid && result.isoString) {
      console.log('✅ Test 8 Passed: ISO without milliseconds parsed');
      passed++;
    } else {
      console.error('❌ Test 8 Failed: Invalid result');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 8 Failed:', err.message);
    failed++;
  }

  // ==================== DATE-ONLY TESTS ====================

  // Test 9: Date only - YYYY-MM-DD format
  console.log('\n=== Test 9: Date Only (YYYY-MM-DD) ===');
  try {
    // Use a future date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const dateStr = futureDate.toISOString().split('T')[0]; // Get YYYY-MM-DD

    const result = parseDateTime(dateStr);
    if (result.valid && result.isoString) {
      // Date-only format should parse correctly
      console.log('✅ Test 9 Passed: Date-only format parsed correctly');
      passed++;
    } else {
      console.error('❌ Test 9 Failed: Invalid result');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 9 Failed:', err.message);
    failed++;
  }

  // Test 10: Date only - MM/DD/YYYY format
  console.log('\n=== Test 10: Date Only (MM/DD/YYYY) ===');
  try {
    // Use a future date
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 6);
    const dateStr = `${futureDate.getMonth() + 1}/${futureDate.getDate()}/${futureDate.getFullYear()}`;

    const result = parseDateTime(dateStr);
    if (result.valid && result.isoString) {
      console.log('✅ Test 10 Passed: MM/DD/YYYY format parsed');
      passed++;
    } else {
      console.error('❌ Test 10 Failed: Invalid result');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 10 Failed:', err.message);
    failed++;
  }

  // Test 11: Date only - text format
  console.log('\n=== Test 11: Date Only (Text Format) ===');
  try {
    // Use a future date
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 6);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateStr = `${months[futureDate.getMonth()]} ${futureDate.getDate()}, ${futureDate.getFullYear()}`;

    const result = parseDateTime(dateStr);
    if (result.valid && result.isoString) {
      console.log('✅ Test 11 Passed: Text date format parsed');
      passed++;
    } else {
      console.error('❌ Test 11 Failed: Invalid result');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 11 Failed:', err.message);
    failed++;
  }

  // ==================== TIME-ONLY TESTS ====================

  // Test 12: Time only - 24-hour format
  console.log('\n=== Test 12: Time Only (24-hour) ===');
  try {
    const result = parseDateTime('15:30');
    if (result.valid && result.isoString) {
      const parsedDate = new Date(result.isoString);
      // Should be today or tomorrow at 15:30
      if (parsedDate.getHours() === 15 && parsedDate.getMinutes() === 30) {
        console.log('✅ Test 12 Passed: 24-hour time parsed');
        passed++;
      } else {
        console.error('❌ Test 12 Failed: Time not set correctly');
        failed++;
      }
    } else {
      console.error('❌ Test 12 Failed: Invalid result');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 12 Failed:', err.message);
    failed++;
  }

  // Test 13: Time only - 12-hour format with PM
  console.log('\n=== Test 13: Time Only (12-hour PM) ===');
  try {
    const result = parseDateTime('3:30 PM');
    if (result.valid && result.isoString) {
      const parsedDate = new Date(result.isoString);
      if (parsedDate.getHours() === 15 && parsedDate.getMinutes() === 30) {
        console.log('✅ Test 13 Passed: 12-hour PM time parsed');
        passed++;
      } else {
        console.error('❌ Test 13 Failed: Time not set correctly');
        failed++;
      }
    } else {
      console.error('❌ Test 13 Failed: Invalid result');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 13 Failed:', err.message);
    failed++;
  }

  // Test 14: Time only - 12-hour format with AM
  console.log('\n=== Test 14: Time Only (12-hour AM) ===');
  try {
    const result = parseDateTime('9:00 AM');
    if (result.valid && result.isoString) {
      const parsedDate = new Date(result.isoString);
      if (parsedDate.getHours() === 9 && parsedDate.getMinutes() === 0) {
        console.log('✅ Test 14 Passed: 12-hour AM time parsed');
        passed++;
      } else {
        console.error('❌ Test 14 Failed: Time not set correctly');
        failed++;
      }
    } else {
      console.error('❌ Test 14 Failed: Invalid result');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 14 Failed:', err.message);
    failed++;
  }

  // ==================== NATURAL LANGUAGE TESTS ====================

  // Test 15: Natural - tomorrow
  console.log('\n=== Test 15: Natural Language (tomorrow) ===');
  try {
    const result = parseDateTime('tomorrow');
    if (result.valid && result.isoString) {
      const parsedDate = new Date(result.isoString);
      const expected = new Date();
      expected.setDate(expected.getDate() + 1);
      expected.setHours(9, 0, 0, 0);
      if (datesAreClose(parsedDate, expected, 60000)) {
        console.log('✅ Test 15 Passed: "tomorrow" parsed correctly');
        passed++;
      } else {
        console.error('❌ Test 15 Failed: Date mismatch');
        failed++;
      }
    } else {
      console.error('❌ Test 15 Failed: Invalid result');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 15 Failed:', err.message);
    failed++;
  }

  // Test 16: Natural - next Monday
  console.log('\n=== Test 16: Natural Language (next Monday) ===');
  try {
    const result = parseDateTime('next Monday');
    if (result.valid && result.isoString) {
      const parsedDate = new Date(result.isoString);
      // Should be a Monday
      if (parsedDate.getDay() === 1) {
        console.log('✅ Test 16 Passed: "next Monday" parsed correctly');
        passed++;
      } else {
        console.error('❌ Test 16 Failed: Not a Monday');
        failed++;
      }
    } else {
      console.error('❌ Test 16 Failed: Invalid result');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 16 Failed:', err.message);
    failed++;
  }

  // Test 17: Natural - next week
  console.log('\n=== Test 17: Natural Language (next week) ===');
  try {
    const result = parseDateTime('next week');
    if (result.valid && result.isoString) {
      const parsedDate = new Date(result.isoString);
      const now = new Date();
      const daysDiff = Math.floor((parsedDate - now) / (1000 * 60 * 60 * 24));
      // Should be approximately 7 days in the future (allow for time differences)
      if (daysDiff >= 6 && daysDiff <= 8) {
        console.log('✅ Test 17 Passed: "next week" parsed correctly');
        passed++;
      } else {
        console.error(`❌ Test 17 Failed: Date mismatch (${daysDiff} days instead of ~7)`);
        failed++;
      }
    } else {
      console.error('❌ Test 17 Failed: Invalid result');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 17 Failed:', err.message);
    failed++;
  }

  // Test 18: Natural - end of month
  console.log('\n=== Test 18: Natural Language (end of month) ===');
  try {
    const result = parseDateTime('end of month');
    if (result.valid && result.isoString) {
      const parsedDate = new Date(result.isoString);
      const now = new Date();
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      if (parsedDate.getDate() === lastDayOfMonth) {
        console.log('✅ Test 18 Passed: "end of month" parsed correctly');
        passed++;
      } else {
        console.error('❌ Test 18 Failed: Not last day of month');
        failed++;
      }
    } else {
      console.error('❌ Test 18 Failed: Invalid result');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 18 Failed:', err.message);
    failed++;
  }

  // ==================== COMBINED DATE+TIME TESTS ====================

  // Test 19: Combined - tomorrow at 3 PM
  console.log('\n=== Test 19: Combined (tomorrow at 3 PM) ===');
  try {
    const result = parseDateTime('tomorrow at 3:30 PM');
    if (result.valid && result.isoString) {
      const parsedDate = new Date(result.isoString);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (parsedDate.getHours() === 15 && parsedDate.getMinutes() === 30 &&
          parsedDate.getDate() === tomorrow.getDate()) {
        console.log('✅ Test 19 Passed: "tomorrow at 3 PM" parsed correctly');
        passed++;
      } else {
        console.error('❌ Test 19 Failed: Date/time mismatch');
        failed++;
      }
    } else {
      console.error('❌ Test 19 Failed: Invalid result');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 19 Failed:', err.message);
    failed++;
  }

  // Test 20: Combined - next Monday at 9 AM
  console.log('\n=== Test 20: Combined (next Monday at 9 AM) ===');
  try {
    const result = parseDateTime('next Monday at 9:00 AM');
    if (result.valid && result.isoString) {
      const parsedDate = new Date(result.isoString);
      if (parsedDate.getDay() === 1 && parsedDate.getHours() === 9) {
        console.log('✅ Test 20 Passed: "next Monday at 9 AM" parsed correctly');
        passed++;
      } else {
        console.error('❌ Test 20 Failed: Not Monday at 9 AM');
        failed++;
      }
    } else {
      console.error('❌ Test 20 Failed: Invalid result');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 20 Failed:', err.message);
    failed++;
  }

  // Test 21: Combined - date with time (space-separated)
  console.log('\n=== Test 21: Combined (Future Date 15:30) ===');
  try {
    // Use a future date
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    const dateStr = futureDate.toISOString().split('T')[0]; // Get YYYY-MM-DD
    const fullStr = `${dateStr} 15:30`;

    const result = parseDateTime(fullStr);
    if (result.valid && result.isoString) {
      const parsedDate = new Date(result.isoString);
      if (parsedDate.getHours() === 15 && parsedDate.getMinutes() === 30) {
        console.log('✅ Test 21 Passed: Date with time parsed correctly');
        passed++;
      } else {
        console.error('❌ Test 21 Failed: Time mismatch');
        failed++;
      }
    } else {
      console.error('❌ Test 21 Failed: Invalid result');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 21 Failed:', err.message);
    failed++;
  }

  // ==================== INVALID INPUT TESTS ====================

  // Test 22: Invalid - empty string
  console.log('\n=== Test 22: Invalid (Empty String) ===');
  try {
    const result = parseDateTime('');
    if (!result.valid && result.error) {
      console.log('✅ Test 22 Passed: Empty string rejected');
      passed++;
    } else {
      console.error('❌ Test 22 Failed: Empty string not rejected');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 22 Failed:', err.message);
    failed++;
  }

  // Test 23: Invalid - null
  console.log('\n=== Test 23: Invalid (Null) ===');
  try {
    const result = parseDateTime(null);
    if (!result.valid && result.error) {
      console.log('✅ Test 23 Passed: Null rejected');
      passed++;
    } else {
      console.error('❌ Test 23 Failed: Null not rejected');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 23 Failed:', err.message);
    failed++;
  }

  // Test 24: Invalid - random string
  console.log('\n=== Test 24: Invalid (Random String) ===');
  try {
    const result = parseDateTime('not-a-date');
    if (!result.valid && result.error) {
      console.log('✅ Test 24 Passed: Random string rejected');
      passed++;
    } else {
      console.error('❌ Test 24 Failed: Random string not rejected');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 24 Failed:', err.message);
    failed++;
  }

  // Test 25: Invalid - past date (strict check)
  console.log('\n=== Test 25: Invalid (Past Date) ===');
  try {
    const result = parseDateTime('2020-01-01T00:00:00Z');
    if (!result.valid && result.error && result.error.includes('past')) {
      console.log('✅ Test 25 Passed: Past date rejected');
      passed++;
    } else {
      console.error('❌ Test 25 Failed: Past date not rejected');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 25 Failed:', err.message);
    failed++;
  }

  // ==================== EDGE CASE TESTS ====================

  // Test 26: Edge case - leap year (use future leap year)
  console.log('\n=== Test 26: Edge Case (Leap Year) ===');
  try {
    // Use 2028 which is a future leap year
    const result = parseDateTime('2028-02-29');
    if (result.valid && result.isoString) {
      const parsedDate = new Date(result.isoString);
      if (parsedDate.getMonth() === 1 && parsedDate.getDate() === 29) {
        console.log('✅ Test 26 Passed: Leap year date parsed');
        passed++;
      } else {
        console.error('❌ Test 26 Failed: Leap year date incorrect');
        failed++;
      }
    } else {
      console.error('❌ Test 26 Failed: Leap year date rejected');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 26 Failed:', err.message);
    failed++;
  }

  // Test 27: Edge case - end of month (31st)
  console.log('\n=== Test 27: Edge Case (End of Month 31st) ===');
  try {
    // Use a future date with 31 days
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 6);
    // Find a month with 31 days (Jan, Mar, May, Jul, Aug, Oct, Dec)
    const monthsWith31 = [0, 2, 4, 6, 7, 9, 11];
    while (!monthsWith31.includes(futureDate.getMonth())) {
      futureDate.setMonth(futureDate.getMonth() + 1);
    }
    const dateStr = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}-31`;

    const result = parseDateTime(dateStr);
    if (result.valid && result.isoString) {
      const parsedDate = new Date(result.isoString);
      if (parsedDate.getDate() === 31) {
        console.log('✅ Test 27 Passed: End of month (31st) parsed');
        passed++;
      } else {
        console.error('❌ Test 27 Failed: Date incorrect');
        failed++;
      }
    } else {
      console.error('❌ Test 27 Failed: Date rejected');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 27 Failed:', err.message);
    failed++;
  }

  // Test 28: Edge case - midnight
  console.log('\n=== Test 28: Edge Case (Midnight) ===');
  try {
    const result = parseDateTime('12:00 AM');
    if (result.valid && result.isoString) {
      const parsedDate = new Date(result.isoString);
      if (parsedDate.getHours() === 0) {
        console.log('✅ Test 28 Passed: Midnight parsed correctly');
        passed++;
      } else {
        console.error('❌ Test 28 Failed: Midnight time incorrect');
        failed++;
      }
    } else {
      console.error('❌ Test 28 Failed: Midnight rejected');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 28 Failed:', err.message);
    failed++;
  }

  // Test 29: Edge case - noon
  console.log('\n=== Test 29: Edge Case (Noon) ===');
  try {
    const result = parseDateTime('12:00 PM');
    if (result.valid && result.isoString) {
      const parsedDate = new Date(result.isoString);
      if (parsedDate.getHours() === 12) {
        console.log('✅ Test 29 Passed: Noon parsed correctly');
        passed++;
      } else {
        console.error('❌ Test 29 Failed: Noon time incorrect');
        failed++;
      }
    } else {
      console.error('❌ Test 29 Failed: Noon rejected');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 29 Failed:', err.message);
    failed++;
  }

  // Test 30: Edge case - case insensitivity
  console.log('\n=== Test 30: Edge Case (Case Insensitive) ===');
  try {
    const result = parseDateTime('TOMORROW');
    if (result.valid && result.isoString) {
      console.log('✅ Test 30 Passed: Case insensitive parsing works');
      passed++;
    } else {
      console.error('❌ Test 30 Failed: Case insensitive parsing failed');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 30 Failed:', err.message);
    failed++;
  }

  // Print summary
  console.log('\n=== Test Summary ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

// Run tests
runTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
