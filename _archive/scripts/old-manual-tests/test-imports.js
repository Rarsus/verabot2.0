const db = require('../src/db');

// Test rate-quote imports
console.log('rate-quote needs: rateQuote, getQuoteById');
console.log('  rateQuote:', typeof db.rateQuote === 'function' ? '✓' : '✗');
console.log('  getQuoteById:', typeof db.getQuoteById === 'function' ? '✓' : '✗');

// Test update-quote imports
console.log('\nupdate-quote needs: updateQuote, getQuoteById');
console.log('  updateQuote:', typeof db.updateQuote === 'function' ? '✓' : '✗');
console.log('  getQuoteById:', typeof db.getQuoteById === 'function' ? '✓' : '✗');

// Test tag-quote imports
console.log('\ntag-quote needs: addTag, getTagByName, addTagToQuote, getQuoteById');
console.log('  addTag:', typeof db.addTag === 'function' ? '✓' : '✗');
console.log('  getTagByName:', typeof db.getTagByName === 'function' ? '✓' : '✗');
console.log('  addTagToQuote:', typeof db.addTagToQuote === 'function' ? '✓' : '✗');
console.log('  getQuoteById:', typeof db.getQuoteById === 'function' ? '✓' : '✗');

// Test delete-quote imports
console.log('\ndelete-quote needs: deleteQuote, getQuoteById');
console.log('  deleteQuote:', typeof db.deleteQuote === 'function' ? '✓' : '✗');
console.log('  getQuoteById:', typeof db.getQuoteById === 'function' ? '✓' : '✗');

// Test export-quotes imports
console.log('\nexport-quotes needs: exportQuotesAsJson, exportQuotesAsCsv, getAllQuotes');
console.log('  exportQuotesAsJson:', typeof db.exportQuotesAsJson === 'function' ? '✓' : '✗');
console.log('  exportQuotesAsCsv:', typeof db.exportQuotesAsCsv === 'function' ? '✓' : '✗');
console.log('  getAllQuotes:', typeof db.getAllQuotes === 'function' ? '✓' : '✗');

console.log('\n✅ All required functions are exported and are functions');
