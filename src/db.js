const fs = require('fs');
const path = require('path');
const { logError, ERROR_LEVELS } = require('./utils/error-handler');

const dbPath = path.join(__dirname, '..', 'data', 'quotes.json');

// Ensure data directory exists
function ensureDbDirectory() {
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch (err) {
      logError('db.ensureDbDirectory', err, ERROR_LEVELS.CRITICAL);
      throw err;
    }
  }
}

// Validate quotes array structure
function validateQuotesArray(data) {
  if (!Array.isArray(data)) {
    return false;
  }
  return data.every(q => 
    q && 
    typeof q === 'object' && 
    'id' in q && 
    'text' in q && 
    'author' in q &&
    typeof q.text === 'string' &&
    typeof q.author === 'string'
  );
}

// Load quotes from file
function loadQuotes() {
  ensureDbDirectory();
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      const parsed = JSON.parse(data);
      
      if (!validateQuotesArray(parsed)) {
        logError('db.loadQuotes', 'Invalid quotes array structure', ERROR_LEVELS.HIGH, {
          dbPath,
          dataType: typeof parsed,
          isArray: Array.isArray(parsed)
        });
        return [];
      }
      
      return parsed;
    }
  } catch (err) {
    logError('db.loadQuotes', err, ERROR_LEVELS.HIGH, { dbPath });
  }
  return [];
}

// Save quotes to file
function saveQuotes(quotes) {
  ensureDbDirectory();
  try {
    if (!Array.isArray(quotes)) {
      throw new Error('Quotes must be an array');
    }
    fs.writeFileSync(dbPath, JSON.stringify(quotes, null, 2), 'utf8');
  } catch (err) {
    logError('db.saveQuotes', err, ERROR_LEVELS.CRITICAL, { dbPath });
    throw err;
  }
}

// Add a quote with validation
function addQuote(quote, author = 'Anonymous') {
  try {
    if (typeof quote !== 'string') {
      throw new Error('Quote must be a string');
    }
    if (typeof author !== 'string') {
      throw new Error('Author must be a string');
    }

    const quotes = loadQuotes();
    quotes.push({
      id: quotes.length + 1,
      text: quote,
      author: author,
      addedAt: new Date().toISOString()
    });
    saveQuotes(quotes);
    return quotes.length;
  } catch (err) {
    logError('db.addQuote', err, ERROR_LEVELS.MEDIUM);
    throw err;
  }
}

// Get all quotes
function getAllQuotes() {
  return loadQuotes();
}

// Get quote by number
function getQuoteByNumber(number) {
  try {
    if (!Number.isInteger(number)) {
      throw new Error('Quote number must be an integer');
    }
    
    const quotes = loadQuotes();
    const index = number - 1;
    
    if (index < 0 || index >= quotes.length) {
      return null;
    }
    
    return quotes[index];
  } catch (err) {
    logError('db.getQuoteByNumber', err, ERROR_LEVELS.MEDIUM);
    return null;
  }
}

module.exports = {
  addQuote,
  getAllQuotes,
  getQuoteByNumber
};
