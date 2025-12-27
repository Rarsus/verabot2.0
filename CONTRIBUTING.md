# Contributing to VeraBot

Thank you for your interest in contributing to VeraBot!

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
- Check if the bug has not been reported in the [GitHub Issues](../../issues).
- Provide detailed reproduction steps.

## Guidelines for Pull Requests
- Break down large contributions into smaller cohesive commits.
- Each Pull Request must include:
  - A description of the rationale.
  - Reference to keywords (`fixes/partially implements/related`) issues.

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
- [Related Doc 1](path/to/doc.md)
- [Related Doc 2](path/to/doc.md)
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
- [Related Guide](...)
```

#### Reference Docs (`docs/reference/`)

Technical specifications and API documentation:
- Architecture details
- Database schemas
- API references
- Configuration options

**Template:**
```markdown
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

## Related References
- [Reference 1](...)
```

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
   ```

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

```markdown
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

**Related:**
- [Quote Management Guide](guides/03-QUOTE-SYSTEM.md)
```

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

See [Reminder System Guide](guides/05-REMINDER-SYSTEM.md)

### Database Schema

See [Reminder Schema Reference](reference/REMINDER-SCHEMA.md)
```

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
