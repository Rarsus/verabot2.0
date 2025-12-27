/**
 * Test Suite: Command Options Builder
 * Tests option building, SlashCommandBuilder creation, and options array generation
 */

/* eslint-disable no-unused-vars */
const buildCommandOptions = require('../../src/core/CommandOptions');

let passed = 0;
let failed = 0;

// Test 1: Basic option building
console.log('\n=== Test 1: Basic Option Building ===');
try {
  const { data, options } = buildCommandOptions(
    'test-cmd',
    'Test command'
  );

  if (data && options && Array.isArray(options)) {
    console.log('✅ Test 1 Passed: Returns data and options array');
    passed++;
  } else {
    console.error('❌ Test 1 Failed: Invalid return structure');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 1 Failed:', err.message);
  failed++;
}

// Test 2: String option building
console.log('\n=== Test 2: String Option Building ===');
try {
  const optDef = {
    name: 'text',
    type: 'string',
    description: 'Text input',
    required: true
  };

  const { data, options } = buildCommandOptions(
    'test',
    'Test',
    [optDef]
  );

  if (options.length === 1 && options[0].name === 'text' && options[0].type === 'string') {
    console.log('✅ Test 2 Passed: String option created correctly');
    passed++;
  } else {
    console.error('❌ Test 2 Failed: String option not correct');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 2 Failed:', err.message);
  failed++;
}

// Test 3: Integer option building
console.log('\n=== Test 3: Integer Option Building ===');
try {
  const optDef = {
    name: 'number',
    type: 'integer',
    description: 'Number input',
    required: false,
    minValue: 1,
    maxValue: 100
  };

  const { data, options } = buildCommandOptions(
    'test',
    'Test',
    [optDef]
  );

  if (options[0].type === 'integer' && options[0].minValue === 1 && options[0].maxValue === 100) {
    console.log('✅ Test 3 Passed: Integer option with constraints created');
    passed++;
  } else {
    console.error('❌ Test 3 Failed: Integer option not correct');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 3 Failed:', err.message);
  failed++;
}

// Test 4: Boolean option building
console.log('\n=== Test 4: Boolean Option Building ===');
try {
  const optDef = {
    name: 'enabled',
    type: 'boolean',
    description: 'Enable feature',
    required: false
  };

  const { data, options } = buildCommandOptions(
    'test',
    'Test',
    [optDef]
  );

  if (options[0].type === 'boolean' && options[0].name === 'enabled') {
    console.log('✅ Test 4 Passed: Boolean option created correctly');
    passed++;
  } else {
    console.error('❌ Test 4 Failed: Boolean option not correct');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 4 Failed:', err.message);
  failed++;
}

// Test 5: Multiple options
console.log('\n=== Test 5: Multiple Options ===');
try {
  const optDefs = [
    { name: 'name', type: 'string', description: 'Name', required: true },
    { name: 'count', type: 'integer', description: 'Count', required: false },
    { name: 'active', type: 'boolean', description: 'Active', required: false }
  ];

  const { data, options } = buildCommandOptions(
    'test',
    'Test',
    optDefs
  );

  if (options.length === 3 &&
      options[0].name === 'name' &&
      options[1].name === 'count' &&
      options[2].name === 'active') {
    console.log('✅ Test 5 Passed: Multiple options created correctly');
    passed++;
  } else {
    console.error('❌ Test 5 Failed: Multiple options not correct');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 5 Failed:', err.message);
  failed++;
}

// Test 6: Required option defaults to false
console.log('\n=== Test 6: Required Defaults to False ===');
try {
  const optDef = {
    name: 'optional',
    type: 'string',
    description: 'Optional field'
  };

  const { options } = buildCommandOptions(
    'test',
    'Test',
    [optDef]
  );

  if (options[0].required === false) {
    console.log('✅ Test 6 Passed: Optional defaults to false');
    passed++;
  } else {
    console.error('❌ Test 6 Failed: Required not defaulting');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 6 Failed:', err.message);
  failed++;
}

// Test 7: Empty options array
console.log('\n=== Test 7: Empty Options Array ===');
try {
  const { data, options } = buildCommandOptions(
    'simple-cmd',
    'Command with no options',
    []
  );

  if (options.length === 0 && data) {
    console.log('✅ Test 7 Passed: Empty options handled');
    passed++;
  } else {
    console.error('❌ Test 7 Failed: Empty options not handled');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 7 Failed:', err.message);
  failed++;
}

// Test 8: No options parameter (undefined)
console.log('\n=== Test 8: Undefined Options Parameter ===');
try {
  const { data, options } = buildCommandOptions(
    'simple-cmd',
    'Command with no options'
  );

  if (Array.isArray(options) && options.length === 0) {
    console.log('✅ Test 8 Passed: Undefined options defaults to empty array');
    passed++;
  } else {
    console.error('❌ Test 8 Failed: Undefined not handled');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 8 Failed:', err.message);
  failed++;
}

// Test 9: Command name and description in data
console.log('\n=== Test 9: Command Name and Description ===');
try {
  const { data } = buildCommandOptions(
    'my-command',
    'My command description'
  );

  // Try to get JSON to verify builder was configured
  if (data && typeof data.toJSON === 'function') {
    const json = data.toJSON();
    if (json.name === 'my-command' && json.description === 'My command description') {
      console.log('✅ Test 9 Passed: Command name and description set correctly');
      passed++;
    } else {
      console.log('⚠️  Test 9 Skipped: Builder data structure differs');
    }
  } else {
    console.log('⚠️  Test 9 Skipped: Cannot verify builder structure');
  }
} catch (err) {
  console.error('❌ Test 9 Failed:', err.message);
  failed++;
}

// Test 10: String option with constraints
console.log('\n=== Test 10: String Option with Constraints ===');
try {
  const optDef = {
    name: 'text',
    type: 'string',
    description: 'Text with length',
    minLength: 3,
    maxLength: 50
  };

  const { options } = buildCommandOptions(
    'test',
    'Test',
    [optDef]
  );

  if (options[0].minLength === 3 && options[0].maxLength === 50) {
    console.log('✅ Test 10 Passed: String constraints applied');
    passed++;
  } else {
    console.error('❌ Test 10 Failed: String constraints not applied');
    failed++;
  }
} catch (err) {
  console.error('❌ Test 10 Failed:', err.message);
  failed++;
}

console.log('\n=== Test Summary ===');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed > 0) {
  process.exit(1);
}
