# Documentation Validation System

This document describes the comprehensive documentation validation and maintenance system for VeraBot2.0.

## Overview

The documentation validation system ensures high-quality, consistent, and accurate documentation through automated checks and continuous maintenance.

## Features

### 1. ✅ Automated Markdown Validation

- **Tool**: markdownlint-cli
- **Configuration**: `.markdownlint.json`
- **Purpose**: Ensures consistent markdown formatting across all documentation files
- **Command**: `npm run docs:lint`

**Checks:**

- Header hierarchy
- Line length limits
- List formatting
- Code block formatting
- Trailing spaces
- Blank lines around elements

### 2. 🔗 Link Validation

- **Script**: `scripts/validation/check-links.js`
- **Configuration**: `.markdown-link-check.json`
- **Purpose**: Validates all internal and external links
- **Command**: `npm run docs:links`

**Features:**

- Internal file reference validation
- External URL accessibility checks
- Configurable timeouts and retries
- CI-aware error handling (treats network errors as warnings)
- Detailed reporting of broken links

### 3. 🔢 Version Synchronization

- **Script**: `scripts/validation/check-version.js`
- **Purpose**: Ensures version consistency across documentation
- **Command**: `npm run docs:version`

**Monitored Files:**

- package.json (source of truth)
- README.md
- CHANGELOG.md
- docs/README.md
- docs/INDEX.md

### 4. 🎨 Dynamic Status Badges

- **Script**: `scripts/validation/update-badges.js`
- **Purpose**: Updates README badges with current project status
- **Command**: `npm run docs:badges`

**Generated Badges:**

- Version (from package.json)
- Test results (pass/fail count)
- Code coverage percentage
- Node.js version requirement

**Badge Colors:**

- Tests: Green (passing) / Red (failing)
- Coverage: Green (≥90%) / Yellow (≥70%) / Orange (<70%)
- Version: Blue
- Node: Green

## GitHub Actions Integration

### Workflow: `validate-docs.yml`

Located at: `.github/workflows/validate-docs.yml`

**Triggers:**

- Push to main (documentation changes)
- Pull requests (documentation changes)
- Manual dispatch

**Jobs:**

1. **validate-markdown**: Runs markdown linting
2. **check-links**: Validates all links
3. **check-version-sync**: Verifies version consistency
4. **update-badges**: Updates dynamic badges (main branch only)
5. **deploy-docs**: Deploys to GitHub Pages (main branch only)
6. **comment-on-pr**: Adds validation summary to PRs

## Documentation Guidelines

Comprehensive documentation standards are defined in [CONTRIBUTING.md](../CONTRIBUTING.md#-documentation-guidelines), including:

- File naming conventions
- Markdown formatting standards
- Document structure templates
- Code example guidelines
- Writing style recommendations
- Visual element usage
- Category-specific templates

## Usage

### For Developers

**Before committing documentation changes:**

```bash
# Run all validations
npm run docs:validate

# Run individual checks
npm run docs:lint      # Markdown syntax
npm run docs:links     # Link validation
npm run docs:version   # Version consistency
```

**Update badges after test changes:**

```bash
npm run docs:badges
```

### For CI/CD

The validation workflow runs automatically on pull requests and pushes. Review the workflow run logs for any validation failures.

### Manual Review Checklist

Before submitting documentation PRs:

- [ ] Spell check completed
- [ ] All validation scripts pass
- [ ] Links tested (internal and external)
- [ ] Code examples tested
- [ ] Version numbers consistent
- [ ] Related docs updated
- [ ] Badges reflect current state

## Directory Structure

```
.
├── .markdownlint.json                  # Markdown linting config
├── .markdown-link-check.json           # Link checking config
├── CONTRIBUTING.md                     # Documentation guidelines
├── README.md                           # Dynamic badges
├── .github/
│   └── workflows/
│       └── validate-docs.yml           # Validation workflow
├── scripts/
│   └── validation/
│       ├── README.md                   # Validation scripts docs
│       ├── check-links.js              # Link validation
│       ├── check-version.js            # Version consistency
│       └── update-badges.js            # Badge generation
└── docs/
    └── [documentation files]
```

## Configuration

### Markdown Linting

Edit `.markdownlint.json` to customize rules:

```json
{
  "MD013": {
    "line_length": 120
  },
  "MD033": false
}
```

### Link Checking

Edit `.markdown-link-check.json` to ignore specific URLs:

```json
{
  "ignorePatterns": [
    {
      "pattern": "^https://example.com"
    }
  ]
}
```

### Version Files

Edit `scripts/validation/check-version.js` to add files:

```javascript
const VERSION_FILES = ['README.md', 'your-file.md'];
```

## Troubleshooting

### Common Issues

**Issue**: Markdown linting fails on long lines
**Solution**: Break lines at 120 characters or disable rule for specific sections

**Issue**: External links fail in CI
**Solution**: Links are automatically treated as warnings in CI environments

**Issue**: Version checker flags historical versions
**Solution**: Expected behavior for CHANGELOG.md; ignore these warnings

**Issue**: Badges not updating
**Solution**: Ensure tests are run and TEST-SUMMARY-LATEST.md is generated

## Best Practices

1. **Run validations locally** before pushing
2. **Fix lint warnings** to maintain consistency
3. **Keep links up to date** by running link checker regularly
4. **Update version numbers** consistently across all files
5. **Regenerate badges** after significant changes
6. **Review validation logs** in CI for failures

## Metrics

Current documentation status:

- **Files Scanned**: 40+ markdown files
- **Links Validated**: 270+ links
- **Validation Coverage**: 100% of markdown files
- **Automated Checks**: 4 types (lint, links, version, badges)
- **CI Integration**: Full GitHub Actions workflow

## Future Enhancements

Potential improvements:

- [ ] Spell checking integration
- [ ] Documentation coverage metrics
- [ ] API documentation generation
- [ ] Visual regression testing for docs website
- [ ] Multi-language documentation support
- [ ] Automated broken link fixing suggestions
- [ ] Documentation freshness tracking
- [ ] Interactive documentation testing

## Related Documentation

- [CONTRIBUTING.md](../CONTRIBUTING.md) - Full documentation guidelines
- [scripts/validation/README.md](../scripts/validation/README.md) - Validation scripts reference
- [GitHub Actions Workflow](../.github/workflows/validate-docs.yml) - CI/CD configuration

## Support

For questions or issues:

1. Review this documentation
2. Check validation script logs
3. Review GitHub Actions workflow runs
4. Open an issue with validation failure details

---

**Last Updated**: December 2024
**Version**: 3.0.0
