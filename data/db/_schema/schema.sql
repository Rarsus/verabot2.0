-- Guild Database Schema Template
-- Applied to each guild database: data/db/guilds/{GUILD_ID}/quotes.db
-- This file is used as reference for manual schema application if needed

-- Quotes table: Core quote storage
CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Anonymous',
  addedAt TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  averageRating REAL DEFAULT 0,
  ratingCount INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for quotes table
CREATE INDEX IF NOT EXISTS idx_quotes_addedAt ON quotes(addedAt);
CREATE INDEX IF NOT EXISTS idx_quotes_category ON quotes(category);
CREATE INDEX IF NOT EXISTS idx_quotes_author ON quotes(author);

-- Tags table: Category/classification for quotes
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Quote to Tags mapping (many-to-many)
CREATE TABLE IF NOT EXISTS quote_tags (
  quoteId INTEGER NOT NULL,
  tagId INTEGER NOT NULL,
  PRIMARY KEY (quoteId, tagId),
  FOREIGN KEY (quoteId) REFERENCES quotes(id) ON DELETE CASCADE,
  FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
);

-- Ratings table: User ratings for quotes (1-5 stars)
CREATE TABLE IF NOT EXISTS quote_ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quoteId INTEGER NOT NULL,
  userId TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(quoteId, userId),
  FOREIGN KEY (quoteId) REFERENCES quotes(id) ON DELETE CASCADE
);

-- User communications: User preferences and communication settings
CREATE TABLE IF NOT EXISTS user_communications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  guildId TEXT NOT NULL,
  preferences TEXT DEFAULT '{}',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(userId, guildId)
);

-- Schema versions: Track database migrations/updates
CREATE TABLE IF NOT EXISTS schema_versions (
  version INTEGER PRIMARY KEY,
  description TEXT,
  executedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
