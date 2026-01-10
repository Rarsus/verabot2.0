# Contributing to VeraBot

Thank you for your interest in contributing to VeraBot!

## 📝 Commit Message Format (IMPORTANT FOR RELEASES)

This project uses **Semantic Versioning** with **Conventional Commits**. Your commit messages determine automatic version bumps:

### Commit Message Structure

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type       | Version Bump | Description                               |
| ---------- | ------------ | ----------------------------------------- |
| `feat`     | **MINOR** ↑  | New feature                               |
| `fix`      | **PATCH** ↑  | Bug fix                                   |
| `docs`     | No change    | Documentation updates                     |
| `style`    | No change    | Code style (formatting, semicolons, etc.) |
| `refactor` | No change    | Code refactoring (no feature/fix)         |
| `test`     | No change    | Adding or updating tests                  |
| `chore`    | No change    | Build, dependencies, tooling              |
| `ci`       | No change    | CI/CD configuration                       |
| `perf`     | **PATCH** ↑  | Performance improvements                  |

### Examples

```bash
# New feature (triggers MINOR version bump)
git commit -m "feat(commands): add quote export functionality"

# Bug fix (triggers PATCH version bump)
git commit -m "fix(database): resolve migration race condition"

# Breaking change (triggers MAJOR version bump)
git commit -m "feat(api): redesign webhook structure

BREAKING CHANGE: Webhook payload format has changed from v1 to v2"

# Documentation (no version bump)
git commit -m "docs: update installation instructions"

# Chore (no version bump)
git commit -m "chore(deps): update discord.js to v14.11.0"
```

### Breaking Changes

Mark breaking changes with `BREAKING CHANGE:` in the commit body:

```
feat(auth): remove legacy token support

BREAKING CHANGE: Old authentication tokens are no longer supported.
Users must migrate to the new OAuth2 system.
```

---

## Contribution Workflow

1. **Fork & Clone**: Fork the repository and clone it locally.
2. **Create a Branch**: Create a descriptive branch for your feature or fix (`feature/user-auth` or `bugfix/login-error`).
3. **Open a Draft PR**: Use Draft Pull Requests to signal work in progress.
4. **Testing & Linting**: Ensure no failing tests, and the linter passes without warnings.
5. **Request Review**: Mark the PR as ready for review when complete.

## Coding Standards

- Respect the styling defined by the `.editorconfig` file.
- Use features of Node.js 18 and later compatibility (ES modules, native fetch).
- Write clean, self-documenting code.
- Follow the Command base class pattern for new commands
- Use response helpers for Discord messages

## Reporting Bugs

- Check if the bug has not been reported in the [GitHub Issues](https://github.com/Rarsus/verabot2.0/issues).
- Provide detailed reproduction steps.

## Guidelines for Pull Requests

- Break down large contributions into smaller cohesive commits.
- Each Pull Request must include:
  - A description of the rationale.
  - Reference to keywords (`fixes/partially implements/related`) issues.
- **Follow commit message format** - Your commits determine automatic version bumps!

---

## 🚀 Automatic Release Process

This project uses **Semantic Release** for automated versioning and releases:

### How It Works

1. **You push commits to `main`** with proper commit messages
2. **GitHub Actions analyzes commits** and determines version bump (MAJOR/MINOR/PATCH)
3. **Semantic Release automatically:**
   - Bumps version in `package.json`
   - Updates `CHANGELOG.md` with release notes
   - Creates a git tag (e.g., `v1.1.0`)
   - Creates a GitHub Release with generated notes
   - Pushes changes back to `main`

### What Gets Updated Automatically

✅ `package.json` - version field  
✅ `package-lock.json` - version lock  
✅ `CHANGELOG.md` - release notes generated from commits  
✅ `README.md` - version badge  
✅ GitHub Releases - created with generated notes  
✅ Git tags - semantic version tags

### Manual Testing

Before pushing to main, you can test locally:

```bash
# Test what version would be released (no changes made)
npm run release:dry

# Check version consistency across files
npm run release:check
```

### Version Format

Versions follow **Semantic Versioning**: `MAJOR.MINOR.PATCH`

Example progression:

- `1.0.0` (initial release)
- `1.1.0` (new feature via `feat` commit)
- `1.1.1` (bug fix via `fix` commit)
- `2.0.0` (breaking change via `feat` with `BREAKING CHANGE:`)

---

## 📚 Documentation Guidelines

### Documentation Structure

Our documentation is organized into several categories:

```
docs/
├── README.md              # Documentation overview
├── INDEX.md               # Complete documentation index
├── guides/                # How-to guides
├── reference/             # Technical reference docs
├── project/               # Project information
└── architecture/          # Architecture documentation
```

### Documentation Standards

#### 1. File Naming Conventions

- Use **UPPERCASE-WITH-HYPHENS.md** for top-level documentation
- Use **descriptive-kebab-case.md** for detailed guides
- Number guides sequentially: `01-CREATING-COMMANDS.md`, `02-TESTING-GUIDE.md`
- Use clear, descriptive names that indicate content

#### 2. Markdown Formatting

- **Headers**: Use ATX-style headers (`#`, `##`, `###`)
- **Line Length**: Keep lines under 120 characters where possible
- **Lists**: Use `-` for unordered lists, `1.` for ordered lists
- **Code Blocks**: Always specify language for syntax highlighting
- **Links**: Use relative links for internal documentation
- **Tables**: Use GitHub-flavored markdown tables

#### 3. Document Structure

Every documentation file should include:

```markdown
# Title

Brief description of what this document covers.

## Table of Contents (for longer docs)

## Section 1

Content...

## Section 2

Content...

## Examples

Practical examples...

## Related Documentation

- [Architecture Overview](docs/architecture/ARCHITECTURE-OVERVIEW.md)
- [Testing Guide](docs/guides/02-TESTING-GUIDE.md)
```

#### 4. Code Examples

- Include working, tested code examples
- Add comments to explain complex logic
- Show both correct and incorrect usage when helpful
- Use syntax highlighting for code blocks

```javascript
// ✅ GOOD - Use response helpers
await sendSuccess(interaction, 'Operation successful!');

// ❌ BAD - Don't use raw Discord API
await interaction.reply({ content: 'Message' });
```

#### 5. Writing Style

- **Be Clear**: Use simple, direct language
- **Be Concise**: Remove unnecessary words
- **Be Consistent**: Follow existing documentation patterns
- **Be Helpful**: Anticipate reader questions
- **Use Active Voice**: "Run the command" not "The command should be run"

#### 6. Visual Elements

- Use emoji sparingly for section markers (✅, ❌, 💡, ⚠️)
- Include diagrams for complex architectures (use Mermaid when possible)
- Add screenshots for UI-related documentation
- Use badges for status indicators

### Documentation Categories

#### Guides (`docs/guides/`)

Step-by-step tutorials for common tasks:

- Creating new commands
- Writing tests
- Setting up integrations
- Deployment guides

**Template:**

```markdown
# Guide Title

## Overview

What this guide covers...

## Prerequisites

- Requirement 1
- Requirement 2

## Steps

### Step 1: ...

Instructions...

### Step 2: ...

Instructions...

## Troubleshooting

Common issues...

## Next Steps

- [Testing Guide](docs/guides/02-TESTING-GUIDE.md)
```

#### Reference Docs (`docs/reference/`)

Technical specifications and API documentation:

- Architecture details
- Database schemas
- API references
- Configuration options

**Template:**

````markdown
# Reference Title

## Description

Technical overview...

## Specifications

### Component/API Name

**Description:** ...

**Parameters:**

- `param1` (type): Description
- `param2` (type): Description

**Returns:** Description

**Example:**

```js
// Example code
```
````

## Related References

- [Architecture Reference](docs/reference/ARCHITECTURE.md)

````

#### Project Documentation (`docs/project/`)

Project-specific information:
- Implementation summaries
- Refactoring logs
- Test results
- Improvement plans

### Validation and Maintenance

#### Automated Checks

Our documentation undergoes automated validation:

1. **Markdown Linting**: Ensures consistent formatting
   ```bash
   npm run docs:lint
````

2. **Link Checking**: Validates all internal and external links

   ```bash
   npm run docs:links
   ```

3. **Version Consistency**: Ensures version numbers are synchronized

   ```bash
   npm run docs:version
   ```

4. **Complete Validation**: Runs all checks
   ```bash
   npm run docs:validate
   ```

#### Manual Review Checklist

Before submitting documentation changes:

- [ ] Spell check completed
- [ ] Links tested (internal and external)
- [ ] Code examples tested and working
- [ ] Formatting follows standards
- [ ] No broken images or references
- [ ] Version numbers up to date
- [ ] Related docs updated if needed
- [ ] Table of contents updated

#### Documentation Updates

- Update documentation when making code changes
- Keep examples in sync with actual code
- Update version numbers consistently
- Add deprecation notices when removing features

### Examples of Well-Documented Features

#### Example 1: Command Documentation

````markdown
## add-quote Command

Add a new quote to the database.

**Usage:**

- Slash command: `/add-quote text:"Quote text" author:"Author name"`
- Prefix command: `!add-quote "Quote text" --author "Author name"`

**Parameters:**

- `text` (required): The quote text
- `author` (optional): Quote author

**Examples:**

```js
// Good quote
/add-quote text:"To be or not to be" author:"Shakespeare"

// Quote without author
/add-quote text:"Unknown wisdom"
```
````

**Related:**

- [Creating Commands Guide](docs/guides/01-CREATING-COMMANDS.md)

````

#### Example 2: Feature Documentation

```markdown
## Reminder System

The reminder system allows users to schedule notifications.

### Features
- Scheduled delivery
- User and role mentions
- Rich embeds with images
- Categories and status tracking

### Architecture

[Diagram or description]

### Usage

See [Creating Commands Guide](docs/guides/01-CREATING-COMMANDS.md)

### Database Schema

See [Architecture Reference](docs/reference/ARCHITECTURE.md)
````

### Getting Help

If you need help with documentation:

1. Check [Documentation Website](https://Rarsus.github.io/Verabot)
2. Review existing documentation for examples
3. Ask in GitHub Discussions
4. Open a documentation issue

### Documentation Tools

We use these tools for documentation:

- **markdownlint**: Markdown linting and formatting
- **markdown-link-check**: Link validation
- **GitHub Pages**: Documentation hosting
- **GitHub Actions**: Automated validation

Install tools:

```bash
npm install
```

Run validation:

```bash
npm run docs:validate
```

---

Thank you for helping improve VeraBot's documentation! 📚

---

## 🚀 CI/CD Pipeline

Our automated testing and deployment pipeline runs on every commit and pull request. Understanding how it works helps you write better code.

### Workflow Overview

**Key Workflows:**
- **test.yml** - Runs tests on Node 20.x and 22.x with coverage reporting
- **ci.yml** - Comprehensive CI including linting, tests, coverage, and security checks
- **coverage.yml** - Coverage validation and PR comments
- **security.yml** - Dependency scanning, SAST, and vulnerability checks
- **code-quality.yml** - ESLint, complexity analysis, and quality metrics
- **release.yml** - Semantic versioning and automated releases
- **deploy.yml** - Docker image building and deployment

### Coverage Requirements

Coverage thresholds are enforced per-file and globally:

**Global Minimum:**
- Branches: 20%
- Functions: 35%
- Lines: 25%
- Statements: 25%

**Critical Paths (Higher Standards):**
- `/src/middleware/**` - 80% branches, 90% functions
- `/src/services/**` - 75% branches, 85% functions
- `/src/core/**` - 70% branches, 80% functions

View coverage: `npm run test:coverage`

### Performance Targets

The CI pipeline is optimized for speed:
- **Test execution:** < 5 seconds per test (timeout enforced)
- **Linting:** < 30 seconds
- **Coverage generation:** < 1 minute
- **Total CI time:** ~15-18 minutes (down from 30 minutes)

### Making Your PR Pass CI

1. **Run tests locally:**
   ```bash
   npm test
   ```

2. **Check coverage:**
   ```bash
   npm run test:coverage
   ```

3. **Lint your code:**
   ```bash
   npm run lint --fix
   ```

4. **Run security audit:**
   ```bash
   npm run security:audit
   ```

5. **Run full suite (before pushing):**
   ```bash
   npm run lint && npm test && npm run test:coverage
   ```

### Workflow Concurrency

To prevent duplicate runs:
- Only the latest commit in a branch will run CI
- Previous runs are automatically cancelled
- Pull request updates trigger fresh runs

### Debugging CI Failures

**If tests fail in CI but pass locally:**
- Check Node version (CI uses 20.x and 22.x)
- Check for timing issues (timeout: 5s)
- Check coverage requirements
- View artifact: test-results-node-*.json

**If coverage fails:**
- Run locally with coverage: `npm run test:coverage`
- Check per-file requirements
- Focus on critical paths first (/middleware, /services, /core)

**If security audit fails:**
- Run: `npm audit` to see vulnerabilities
- Update packages: `npm update`
- Contact maintainers if blocked by security issues

### CI/CD Optimization History

**Phase 1 (January 10, 2026):** Critical Fixes
- Consolidated redundant test workflows
- Fixed coverage configuration mismatch (jest.config.js + .nycrc.json)
- Updated all actions to @v4
- Added concurrency control (40% time reduction)
- Implemented proper permission scoping
- Enhanced caching strategy

**Phase 2 (In Progress):** Configuration Enhancement
- Added per-file coverage enforcement
- Enhanced cache strategies for faster builds
- Added test result publishing
- Updated documentation

**Phase 3 (Planned):** Advanced Security
- Add Semgrep SAST scanning
- Add performance benchmarking
- Implement deployment approval gates

