# Configuration Files Guide

**Version:** 1.0  
**Last Updated:** January 15, 2026  
**Purpose:** Complete reference for all configuration files in VeraBot2.0

---

## Overview

This guide documents every configuration file in the VeraBot2.0 project, its purpose, location, and how to modify it.

---

## Configuration Files by Category

## 1. ESLint Configuration (Code Linting)

### Active Primary: `eslint.config.js` (Root)

**Purpose:** Modern ESLint 9+ flat configuration format. Enforces code style and quality rules.

**Location:** `/eslint.config.js` (202 lines)

**Key Settings:**
```javascript
module.exports = [
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      'dist/**',
      'dashboard/**',
      // ... excludes for linting
    ]
  },
  {
    files: ['src/**/*.js'],
    languageOptions: {
      globals: { /* browser/node globals */ },
      parserOptions: { ecmaVersion: 2021 }
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'semi': ['error', 'always'],
      'security/detect-object-injection': 'warn',
      // ... more rules
    }
  }
]
```

**How to Modify:**
1. Edit `eslint.config.js` directly
2. Run: `npm run lint` to test changes
3. Common changes:
   - Add/remove ignore patterns
   - Adjust rule severity (off/warn/error)
   - Update parser options for new JavaScript versions

**Tool Support:** ✅ ESLint 9+ (flat config)

---

### Legacy Backup: `.eslintrc.json` (Root) - REMOVED

**Status:** ⚠️ **REMOVED** - This legacy configuration file has been removed as of January 2026.

**Reason:** ESLint 9+ uses the modern flat config format (`eslint.config.js`). The legacy `.eslintrc.json` format is no longer needed and was causing duplicate configuration issues.

**Migration:** All ESLint rules and configuration are now in `eslint.config.js` (primary and only config file).

**Tool Support:** ✅ ESLint 9+ (flat config only)

---

---

## 2. Jest Configuration (Testing)

### Active: `jest.config.js` (Root)

**Purpose:** Jest test runner configuration. Defines test patterns, coverage settings, reporters.

**Location:** `/jest.config.js` (109 lines)

**Key Settings:**
```javascript
module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Test file patterns (what to run)
  testMatch: [
    '<rootDir>/tests/unit/core/**/*.test.js',
    '<rootDir>/tests/unit/middleware/**/*.test.js',
    '<rootDir>/tests/unit/services/**/*.test.js',
    '<rootDir>/tests/unit/commands/**/*.test.js',
    '<rootDir>/tests/unit/utils/**/*.test.js',
    '<rootDir>/tests/integration/**/*.test.js',
  ],

  // Patterns to ignore (what NOT to run)
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dashboard/',
    '/coverage/',
    'tests/_archive',        // ← Excludes archived tests
    'test-security-integration'
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/register-commands.js',
    '!src/config/**',
    // ... more exclusions
  ],

  // Coverage thresholds
  collectCoverage: true,
  coveragePathIgnorePatterns: ['/node_modules/', '/_archive/'],
  coverageThresholds: {
    global: {
      lines: 22,
      functions: 32,
      branches: 16,
      statements: 22
    },
    'src/middleware/**': {
      lines: 80,
      functions: 90,
      branches: 80
    }
    // ... more module-specific thresholds
  },

  // Reporters (output formats)
  reporters: [
    'default',
    ['jest-junit', { /* JUnit XML for CI */ }]
  ]
};
```

**How to Modify:**
1. Edit `jest.config.js` directly
2. Run: `npm test` to verify changes
3. Common changes:
   - Add new test directories to `testMatch`
   - Exclude new patterns in `testPathIgnorePatterns`
   - Update `collectCoverageFrom` for new modules
   - Adjust `coverageThresholds` for stricter/looser coverage

**Tool Support:** ✅ Jest 30.2.0

**Test Pattern Examples:**
- Add unit tests: `'<rootDir>/tests/unit/**/*.test.js'`
- Exclude archive: `'tests/_archive'` (already done)
- Exclude specific file: `'test-skip-this.test.js'`

---

## 3. Package Configuration

### `package.json` (Root)

**Purpose:** Node.js package metadata, dependencies, npm scripts, project info.

**Location:** `/package.json`

**Key Sections:**
```json
{
  "name": "verabot2.0",
  "version": "2.21.0",
  "description": "Advanced Discord bot with quote management",
  "main": "src/index.js",
  "type": "commonjs",
  "scripts": {
    "start": "node src/index.js",
    "lint": "eslint . --max-warnings=50",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "register-commands": "node src/register-commands.js"
  },
  "dependencies": {
    "discord.js": "^14.11.0",
    "sqlite3": "^5.1.7",
    "dotenv": "^17.2.3"
  },
  "devDependencies": {
    "eslint": "^9.0.0",
    "jest": "^30.2.0"
  }
}
```

**How to Modify:**
1. Add dependencies: `npm install <package>`
2. Add dev dependencies: `npm install --save-dev <package>`
3. Update version: Edit `"version"` field (semver format)
4. Add/update scripts: Edit `"scripts"` section
5. Do NOT manually edit unless using `npm` commands

**Tool Support:** ✅ npm / Node.js (required)

---

## 4. Environment Variables

### `.env.example` (Root)

**Purpose:** Template showing all required environment variables. Users copy this to `.env`.

**Location:** `/.env.example`

**Content:**
```env
# Discord Configuration
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=optional_test_guild_id
PREFIX=!

# Optional Features
HUGGINGFACE_API_KEY=optional_key
```

**How to Modify:**
1. Add new environment variables to `.env.example`
2. Update `.env` (local) with same structure
3. Update documentation referencing environment setup
4. Never commit `.env` file (only `.env.example`)

**Tool Support:** ✅ dotenv (automatic via `require('dotenv').config()`)

---

## 5. Docker Configuration

### `Dockerfile` (Root)

**Purpose:** Container image definition for running VeraBot2.0 in Docker.

**Location:** `/Dockerfile`

**Key Sections:**
- Base image selection
- Dependency installation
- Application setup
- Entry point configuration

**How to Modify:**
1. Update Node.js version: Change `FROM node:20` to newer version
2. Add system dependencies: Add `RUN apt-get install ...`
3. Change build steps: Modify `RUN npm install` or similar
4. Test: `docker build -t verabot2.0 .`

**Tool Support:** ✅ Docker/Docker Compose

---

### `docker-compose.yml` (Root)

**Purpose:** Multi-container orchestration for VeraBot2.0 and dependencies.

**Location:** `/docker-compose.yml`

**Key Services:**
- bot: VeraBot2.0 application
- (Optional) database, cache, etc.

**How to Modify:**
1. Add new services: Add service definitions
2. Adjust ports: Change port mappings
3. Update volumes: Change mount points
4. Modify environment: Update `environment` section
5. Test: `docker-compose up`

**Tool Support:** ✅ Docker Compose

---

### `docker/nginx.conf` (Subdirectory)

**Purpose:** Nginx reverse proxy configuration (if used).

**Location:** `/docker/nginx.conf`

**How to Modify:**
1. Update server blocks for new routes
2. Adjust proxy settings
3. Modify SSL/TLS configuration
4. Test: Restart Nginx container

**Tool Support:** ✅ Nginx

---

## 6. Git Configuration (Not in Config/)

### `.gitignore` (Root)

**Purpose:** Specify files/folders Git should ignore.

**Key Patterns:**
```
node_modules/
.env
coverage/
dist/
*.log
.vscode/
.husky/
```

**How to Modify:**
1. Add patterns to ignore: `*.tmp`
2. Exclude directories: `folder/**`
3. Add exceptions: `!important-file.txt`
4. Test: `git status` (should not show ignored files)

---

### `.github/` Directory

**Purpose:** GitHub-specific configuration.

**Key Files:**
- `.github/workflows/` - CI/CD pipelines (GitHub Actions)
- `.github/ISSUE_TEMPLATE/` - Issue templates
- `.github/PULL_REQUEST_TEMPLATE.md` - PR template

---

## 7. IDE & Editor Configuration

### `.vscode/settings.json` (Optional)

**Purpose:** VS Code settings for developers.

**Key Settings:**
- Formatter options
- Linter settings
- Theme and appearance
- File associations

**How to Modify:**
1. Open Command Palette: `Ctrl+Shift+P`
2. Search: "Preferences: Open Workspace Settings"
3. Modify JSON in `.vscode/settings.json`

---

## Configuration Modification Workflow

### To Add a New Configuration Setting:

1. **Identify the Config File:**
   - Code style → `eslint.config.js` (modern ESLint 9+ flat config)
   - Testing → `jest.config.js`
   - Dependencies → `package.json`
   - Environment → `.env.example` + `.env`
   - Deployment → `Dockerfile` + `docker-compose.yml`

2. **Make the Change:**
   ```bash
   # Edit the file
   vim eslint.config.js        # Example: ESLint config
   
   # Test the change
   npm run lint                # For ESLint changes
   npm test                    # For Jest changes
   ```

3. **Verify Backward Compatibility:**
   - Test with `npm run lint`
   - Test with `npm test`
   - Check pre-commit hooks: `npx husky install`

4. **Document the Change:**
   - Update `.env.example` if new env vars
   - Update README.md if public config
   - Update this file if adding new config category

---

## Configuration File Locations Summary

```
verabot2.0/
├── eslint.config.js           ← Primary ESLint 9+ flat config (only)
├── jest.config.js             ← Jest test configuration
├── package.json               ← npm configuration
├── .env.example               ← Environment template (commit)
├── .env                       ← Environment actual (DO NOT COMMIT)
├── .gitignore                 ← Git ignore patterns
├── Dockerfile                 ← Docker image definition
├── docker-compose.yml         ← Docker compose orchestration
├── .github/                   ← GitHub configuration
│   ├── workflows/             ← CI/CD pipelines
│   └── PULL_REQUEST_TEMPLATE.md
├── .vscode/                   ← VS Code settings (optional)
│   └── settings.json
└── config/                    ← Reserved for future config files
    └── (none currently)
```

---

## Best Practices

### ✅ DO:
- Keep configurations in their standard locations (root)
- Version control public configs (eslint.config.js, jest.config.js)
- Use environment variables for secrets (.env.example only)
- Document configuration changes in git commits
- Test configuration changes before committing
- Use modern ESLint 9+ flat config format (eslint.config.js)

### ❌ DON'T:
- Commit `.env` or other secret files
- Store secrets in configuration files
- Modify configuration in running containers (changes lost)
- Create configuration in random locations
- Use different configs in different environments without documentation
- Forget to update `.env.example` when adding new env vars

---

## Troubleshooting Configuration Issues

| Issue | Solution |
|-------|----------|
| ESLint not working | Check `eslint.config.js` exists and is valid JSON/JS |
| Tests not running | Verify `jest.config.js` `testMatch` includes your tests |
| Env vars not loading | Ensure `.env` file exists and matches `.env.example` |
| Docker build fails | Check `Dockerfile` syntax and dependencies |
| Pre-commit hooks fail | Run `npx husky install` and verify hooks |

---

## For More Information

- **Document Naming:** See [DOCUMENT-NAMING-CONVENTION.md](../../../DOCUMENT-NAMING-CONVENTION.md)
- **ESLint Rules:** https://eslint.org/docs/rules/
- **Jest Options:** https://jestjs.io/docs/configuration
- **Docker Guide:** https://docs.docker.com/

---

**Last Updated:** January 15, 2026  
**Status:** Active  
**Maintenance:** Review quarterly when updating major dependencies
