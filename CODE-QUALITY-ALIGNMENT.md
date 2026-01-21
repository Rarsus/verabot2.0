# Code Quality Configuration Alignment

**Date:** January 21, 2026  
**Status:** ✅ All Repositories Aligned  
**Scope:** Prettier & ESLint configuration synchronization across main + submodules

---

## Overview

All repositories in the VeraBot2.0 project now share consistent code formatting and linting rules. This ensures that code quality standards are uniform across all submodules and the main repository.

**Applies to:**
- `verabot2.0` (main)
- `repos/verabot-core`
- `repos/verabot-dashboard`
- `repos/verabot-utils`
- `repos/verabot-commands`

---

## Prettier Configuration

### Shared Prettier Rules

All repositories use **identical Prettier configuration** for consistent code formatting:

```json
{
  "semi": true,                    // Semicolons required
  "trailingComma": "es5",          // Trailing commas in ES5 style
  "singleQuote": true,             // Single quotes, not double
  "printWidth": 120,               // 120 character line width
  "tabWidth": 2,                   // 2-space indentation
  "useTabs": false,                // Spaces, not tabs
  "proseWrap": "preserve"          // Preserve markdown formatting
}
```

### Prettier Configuration Files

Each repository has a `.prettierrc.json` file with these exact settings:

```
.prettierrc.json                   ← Root (main repository)
repos/verabot-core/.prettierrc.json
repos/verabot-dashboard/.prettierrc.json
repos/verabot-utils/.prettierrc.json
repos/verabot-commands/.prettierrc.json
```

### Using Prettier

**Format all files in a repository:**
```bash
npm run format
```

**Format specific files:**
```bash
npx prettier --write src/commands/misc/ping.js
```

**Check formatting without changes:**
```bash
npx prettier --check src/
```

---

## ESLint Configuration

### Shared ESLint Rules

#### Test File Exceptions (Applied to All Repositories)

Test files (`tests/**/*.js`, `**/*.test.js`) have special exceptions shared across all repositories:

**Rules relaxed in test files:**
- `no-unused-expressions` - Test assertions often use expressions
- `max-lines-per-function` - Test files intentionally exceed limits
- `max-nested-callbacks` - describe/it blocks are deeply nested
- `max-depth` - Test setup can be deeply nested
- `complexity` - Test scenarios are intentionally complex
- `security/detect-object-injection` - Test mocks bypass security
- `security/detect-non-literal-fs-filename` - Test fixtures use dynamic paths
- `security/detect-unsafe-regex` - Test patterns are safe
- `security/detect-possible-timing-attacks` - Test assertions don't matter
- `no-return-await` - Test mocks need await for consistency
- `no-unused-vars` - Mock parameters intentionally unused

**Rationale:**
- Tests have legitimate reasons for breaking production rules
- Complex nested structures are unavoidable in test suites
- Mock objects and fixtures require security bypasses
- Test assertions use patterns that appear unused

#### Core Rules (All Non-Test Files)

Applied to all non-test JavaScript files across all repositories:

- `eqeqeq: ['error', 'always']` - Strict equality always required
- `no-eval: 'error'` - Never use eval
- `no-console: 'off'` - Console logging allowed (development)
- `no-unused-vars: ['warn', { argsIgnorePattern: '^_' }]` - Warn on unused (allow with `_` prefix)
- `complexity: ['warn', 18]` - Warn if function exceeds complexity 18

#### Security Rules

Applied to all files (more lenient in tests):

- `security/detect-object-injection: 'warn'` - Warn on object injection patterns
- `security/detect-non-literal-fs-filename: 'warn'` - Warn on dynamic file paths
- `security/detect-unsafe-regex: 'warn'` - Warn on potentially unsafe regex

### Shared ESLint Configuration

**Reference file:** `.eslintrc.shared.js` (in main repository)

Contains centralized definitions for:
- Test file patterns
- Test rule exceptions
- Core ESLint rules
- Security rules
- Node.js globals
- Test globals

### ESLint Configuration Files

Each repository maintains its own `eslint.config.js` but follows the shared guidelines:

```
eslint.config.js                   ← Root (main repository)
repos/verabot-core/eslint.config.js
repos/verabot-dashboard/eslint.config.js
repos/verabot-utils/eslint.config.js
repos/verabot-commands/eslint.config.js
```

### Using ESLint

**Lint all files:**
```bash
npm run lint
```

**Lint specific files:**
```bash
npx eslint src/commands/misc/ping.js
```

**Auto-fix linting issues:**
```bash
npx eslint . --fix
```

---

## Code Style Standards

### Naming Conventions (Consistent Across All Repositories)

| Element | Convention | Example |
|---------|-----------|---------|
| Variables | camelCase | `userId`, `quoteText` |
| Classes | PascalCase | `CommandBase`, `DatabaseService` |
| Constants | UPPER_SNAKE_CASE | `MAX_COMMANDS`, `DEFAULT_TIMEOUT` |
| Files | kebab-case | `add-quote.js`, `command-base.js` |
| Methods | camelCase | `execute()`, `register()` |
| Private fields | _camelCase | `_cache`, `_config` |
| Boolean properties | `is`/`has` prefix | `isActive`, `hasPermission` |

### Formatting Rules (Enforced by Prettier)

- **Indentation:** 2 spaces (no tabs)
- **Line length:** 120 characters
- **Quotes:** Single quotes (`'string'`)
- **Semicolons:** Always required
- **Trailing commas:** ES5 style (where valid)
- **Spaces:** Around operators and after keywords

### Import/Export Rules (Consistent Across All Repositories)

**Node.js CommonJS:**
```javascript
// Correct
const { sendSuccess } = require('../../verabot-utils/src/helpers');
module.exports = MyCommand;

// Incorrect
import { sendSuccess } from '../../verabot-utils/src/helpers';
export default MyCommand;
```

---

## Configuration Management

### Updating Shared Configurations

When updating code quality configurations:

1. **Update reference file first:** `.eslintrc.shared.js` or `.prettierrc.json` (main repo)
2. **Copy to all submodules:** Apply same configuration to all repositories
3. **Test in each repository:** `npm run lint` and `npm run format`
4. **Document changes:** Update this file and commit

### Verifying Alignment

To verify that all configurations are consistent:

```bash
# Check Prettier configs
find . -name ".prettierrc.json" -exec echo "=== {} ===" \; -exec cat {} \;

# Check ESLint test exceptions
grep -A 10 "files.*test" eslint.config.js repos/*/eslint.config.js
```

### Adding Repository-Specific Rules

If a repository needs additional rules:

1. **Keep shared rules intact** - Don't override shared test exceptions
2. **Document rationale** - Explain why repository needs different rules
3. **Update this guide** - Document repository-specific rules
4. **Keep aligned where possible** - Minimize divergence

---

## Pre-Commit Hooks

All repositories use Husky to enforce code quality before commits:

**Pre-commit checklist:**
- ✅ Prettier formatting (auto-fix)
- ✅ ESLint linting (with test exceptions)
- ✅ No console.log in production code
- ✅ No .only or .skip in tests

### Pre-Commit Installation

Each repository has `.husky/pre-commit` hook. To install:

```bash
npm install
npx husky install
```

---

## Common Tasks

### Format a Single File

```bash
# In any repository
npx prettier --write src/services/DatabaseService.js
```

### Lint and Fix All Issues

```bash
npm run lint -- --fix
```

### Check Test File Compliance

```bash
# Verify test files use correct exceptions
npx eslint tests/unit/test-*.js
```

### Update All Prettier Configs

```bash
# Copy root prettier config to all submodules
for repo in repos/*/; do
  cp .prettierrc.json "$repo/.prettierrc.json"
done
```

---

## Troubleshooting

### Issue: "ESLint errors in tests not being ignored"

**Solution:** Verify `eslint.config.js` includes test file patterns:
```javascript
files: ['tests/**/*.js', '**/*.test.js']
```

### Issue: "Prettier formats differently in different repos"

**Solution:** Ensure `.prettierrc.json` is identical in all repos:
```bash
diff .prettierrc.json repos/verabot-core/.prettierrc.json
```

### Issue: "Git pre-commit hook failing on formatting"

**Solution:** Run formatter before commit:
```bash
npm run format
git add .
git commit -m "chore: format code"
```

---

## Migration Notes

### From Unaligned to Aligned (Jan 21, 2026)

**Changes made:**
- ✅ Created `.prettierrc.json` in all submodules
- ✅ Updated ESLint configurations for test exceptions consistency
- ✅ Created `.eslintrc.shared.js` as reference
- ✅ Documented configuration alignment

**No breaking changes:**
- All existing ESLint rules remain active
- Prettier formatting is more consistent (may require reformatting)
- Test exceptions now uniform across all repos

---

## References

- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)
- [ESLint Configuration](https://eslint.org/docs/latest/use/configure/)
- [Husky Pre-Commit Hooks](https://typicode.github.io/husky/)
- [Copilot Instructions](../.github/copilot-instructions.md)

---

**Status:** ✅ Configuration aligned across all repositories  
**Last Updated:** January 21, 2026  
**Maintained by:** Development Team
