# Documentation Validation Scripts

This directory contains automated scripts for validating and maintaining documentation quality.

## Available Scripts

### 1. check-documentation-links.js

Validates all internal markdown links in the documentation with auto-fix capabilities and GitHub issue tracking.

**Usage:**

```bash
npm run validate:links                    # Validate links
npm run validate:links -- --fix          # Auto-fix broken links
npm run validate:links -- --ignore-archived  # Skip archived docs
```

**Features:**

- Scans all markdown files in the repository
- Checks internal file references
- Auto-fixes case-sensitivity issues and git renames
- Categorizes and ignores non-critical links:
  - Example/placeholder links in feature documentation
  - Code example paths in technical specifications
  - Historical Phase references in archived documentation
- **GitHub Issue Tracking**: Ignore specific broken links tracked in GitHub issues
- Generates detailed reports with categories

**GitHub Issue Tracking:**

Create a `.link-validator-ignore.json` file in the project root to ignore specific broken links that are tracked in GitHub issues. See `.link-validator-ignore.json.example` for format.

Example:
```json
{
  "ignoreRules": [
    {
      "file": "docs/reference/INDEX.md",
      "exactLink": "project/REFACTORING-COMPLETE.md",
      "issue": "123",
      "comment": "Tracked for removal in issue #123"
    },
    {
      "link": "^project/.*\\.md$",
      "issue": "123",
      "reason": "All project directory references"
    }
  ]
}
```

**Rule Options:**
- `file`: Regex pattern to match source file path
- `exactFile`: Exact source file path (no pattern matching)
- `link`: Regex pattern to match broken link
- `exactLink`: Exact link text (no pattern matching)
- `issue`: GitHub issue number tracking this broken link
- `comment`: Optional description of why link is ignored

The validator will show these ignored links in a separate "LINKS TRACKED IN GITHUB ISSUES" section with issue numbers and counts.

### 2. check-links.js

Legacy link checker (consider using check-documentation-links.js instead).

### 2. check-version.js

Ensures version numbers are consistent across all documentation.

**Usage:**

```bash
npm run docs:version
```

**Features:**

- Reads version from `package.json` as source of truth
- Scans specified documentation files for version references
- Reports any version inconsistencies
- Handles multiple version formats (v1.0.0, version 1.0.0, etc.)

**Files Checked:**

- README.md
- CHANGELOG.md
- docs/README.md
- docs/INDEX.md

**Note:** Historical versions in CHANGELOG.md are expected and flagged as inconsistencies.

### 3. update-badges.js

Updates dynamic status badges in README.md based on current state.

**Usage:**

```bash
npm run docs:badges
```

**Features:**

- Reads version from package.json
- Extracts test results from docs/TEST-SUMMARY-LATEST.md
- Calculates code coverage percentage
- Generates shield.io badge URLs
- Updates badges in README.md automatically

**Generated Badges:**

- Version badge (blue)
- Tests badge (green/red based on status)
- Coverage badge (color based on percentage)
- Node version badge (green)

## Running All Validations

To run all documentation validations at once:

```bash
npm run docs:validate
```

This runs:

1. Markdown linting (`npm run docs:lint`)
2. Link checking (`npm run docs:links`)
3. Version consistency check (`npm run docs:version`)

## CI/CD Integration

These scripts are integrated into the GitHub Actions workflow at `.github/workflows/validate-docs.yml`.

The workflow runs on:

- Every push to main (for documentation paths)
- Every pull request (for documentation paths)
- Manual dispatch

## Exit Codes

All scripts follow standard Unix exit code conventions:

- `0` - Success (all checks passed)
- `1` - Failure (validation errors found)

## Extending the Scripts

### Adding New Files to Version Check

Edit `check-version.js` and add to the `VERSION_FILES` array:

```javascript
const VERSION_FILES = [
  'README.md',
  'CHANGELOG.md',
  'docs/README.md',
  'docs/INDEX.md',
  'your-new-file.md', // Add here
];
```

### Ignoring Specific Links

Edit `.markdown-link-check.json` to add patterns:

```json
{
  "ignorePatterns": [
    {
      "pattern": "^https://example.com"
    }
  ]
}
```

### Customizing Markdown Linting

Edit `.markdownlint.json` to adjust rules:

```json
{
  "MD013": {
    "line_length": 120
  },
  "MD033": false
}
```

## Troubleshooting

### Link Checker Failing on External Links

External links may fail due to:

- Network restrictions
- Rate limiting
- Temporary server issues

The link checker includes retry logic and configurable timeouts.

### Version Checker Finding Historical Versions

This is expected behavior. The CHANGELOG.md will contain historical version numbers.

### Badge Updates Not Appearing

Ensure:

1. Tests have been run recently (`npm test`)
2. TEST-SUMMARY-LATEST.md exists and is up to date
3. README.md has existing badge section or title header

## Development

### Testing Scripts Locally

```bash
# Test link checker
node scripts/validation/check-links.js

# Test version checker
node scripts/validation/check-version.js

# Test badge updater
node scripts/validation/update-badges.js
```

### Adding New Validation Scripts

1. Create script in `scripts/validation/`
2. Add npm script to `package.json`
3. Update `.github/workflows/validate-docs.yml`
4. Document in this README

## Related Documentation

- [CONTRIBUTING.md](../../CONTRIBUTING.md) - Documentation guidelines
- [GitHub Actions Workflow](../../.github/workflows/documentation-validation.yml)
- [Documentation Website](https://Rarsus.github.io/Verabot)

## Support

For issues or questions about validation scripts:

1. Check this README
2. Review GitHub Actions logs for CI failures
3. Open an issue with details of the validation failure
