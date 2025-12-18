const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'quotes.json');

// Ensure data directory exists
function ensureDbDirectory() {
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load quotes from file
function loadQuotes() {
  ensureDbDirectory();
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading quotes:', err);
  }
  return [];
}

// Save quotes to file
function saveQuotes(quotes) {
  ensureDbDirectory();
  try {
    fs.writeFileSync(dbPath, JSON.stringify(quotes, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving quotes:', err);
  }
}

// Add a quote
function addQuote(quote, author = 'Anonymous') {
  const quotes = loadQuotes();
  quotes.push({
    id: quotes.length + 1,
    text: quote,
    author: author,
    addedAt: new Date().toISOString()
  });
  saveQuotes(quotes);
  return quotes.length;
}

// Get all quotes
function getAllQuotes() {
  return loadQuotes();
}

// Get quote by number
function getQuoteByNumber(number) {
  const quotes = loadQuotes();
  const index = number - 1;
  if (index >= 0 && index < quotes.length) {
    return quotes[index];
  }
  return null;
}

module.exports = {
  addQuote,
  getAllQuotes,
  getQuoteByNumber
};
