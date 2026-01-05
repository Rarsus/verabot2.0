# Semantic Release Setup Guide

This document describes the automated versioning and release system for VeraBot2.0 using Semantic Release.

## Overview

**Semantic Release** automatically manages version bumping, changelog generation, and GitHub releases based on conventional commit messages. This eliminates manual versioning and ensures consistent version numbers following [Semantic Versioning](https://semver.org/).

## What is Semantic Versioning?

Semantic versioning uses three numbers: `MAJOR.MINOR.PATCH` (e.g., `1.2.3`)

- **MAJOR**: Breaking changes (incompatible API changes)
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## Commit Message Format

Semantic Release uses the **Angular Commit Message Convention** to determine version bumps.

### Commit Message Structure

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Supported Types

| Type       | Version Impact | Description                     |
| ---------- | -------------- | ------------------------------- |
| `feat`     | MINOR          | New feature                     |
| `fix`      | PATCH          | Bug fix                         |
| `docs`     | None           | Documentation only              |
| `style`    | None           | Code style (no logic change)    |
| `refactor` | None           | Code refactor (no logic change) |
| `perf`     | PATCH          | Performance improvement         |
| `test`     | None           | Test additions/changes          |
| `chore`    | None           | Build, dependencies, tooling    |
| `ci`       | None           | CI/CD configuration             |

### Breaking Changes

Add `BREAKING CHANGE:` in the footer to trigger a MAJOR version bump:

```
feat: redesign API endpoints

BREAKING CHANGE: /api/quotes endpoint now returns paginated results
```

### Examples

**Patch Release (1.0.0 → 1.0.1)**

```
fix: resolve quote export encoding issue
```

**Minor Release (1.0.1 → 1.1.0)**

```
feat: add search filters to quote discovery
```

**Major Release (1.1.0 → 2.0.0)**

```
feat: restructure database schema

BREAKING CHANGE: quote table columns have been reorganized
```

## Local Testing

### Test the Release Process

Before pushing to main, you can test what version would be released:

```bash
npm run release:dry
```

This will:

- Analyze commits since the last release
- Determine the new version number
- **NOT** make any actual changes
- Show what would happen

Output will show:

- ✅ Plugins loaded successfully
- Analyzed commits
- Would-be version bump (PATCH/MINOR/MAJOR)

### Check Current Version

```bash
npm run release:check
```

This verifies the version in package.json matches documentation.

### Perform Release

Only do this if you have proper git credentials set up:

```bash
npm run release
```

This will:

1. Analyze commits since last tag
2. Determine version bump
3. Update `package.json` version
4. Update `package-lock.json`
5. Generate/update `CHANGELOG.md`
6. Commit changes with message: `chore(release): <version>`
7. Create git tag: `v<version>`
8. Create GitHub Release
9. Push commits and tags to GitHub

## Automatic Releases (GitHub Actions)

The `.github/workflows/release.yml` workflow automatically runs semantic-release when you push to `main` or `develop`:

### Branches

- **main**: Production releases (version: `1.0.0`)
- **develop**: Pre-release/beta releases (version: `1.0.0-beta.1`)

### How It Works

1. Push commits to `main` or `develop`
2. GitHub Actions workflow starts automatically
3. `semantic-release` analyzes commits since last tag
4. If changes found, creates new version and release
5. Updates `package.json`, `CHANGELOG.md`, and creates Git tag
6. Creates GitHub Release with changelog

### GitHub Permissions Required

The workflow file already includes proper permissions:

```yaml
permissions:
  contents: write # Write to repository (commits, tags)
  pull-requests: write # Write to PRs (comments)
  packages: write # Publish to npm (disabled in config)
```

GITHUB_TOKEN is automatically provided by GitHub Actions.

## Configuration Files

### .releaserc.json

Main Semantic Release configuration:

- **branches**: main (production) and develop (beta)
- **plugins**: changelog, npm, git, github
- **preset**: Angular (conventional commits)

Updates these files on release:

- `package.json` - version field
- `package-lock.json` - lockfile
- `CHANGELOG.md` - release notes
- `README.md` - if needed

### .github/workflows/release.yml

GitHub Actions workflow that:

- Triggers on push to main or develop
- Installs dependencies
- Sets up Git credentials
- Runs semantic-release
- Creates releases and git tags

## Updating Configuration

### Add/Remove Files in Release

Edit `.releaserc.json` `assets` array under the `@semantic-release/git` plugin:

```json
"assets": [
  "package.json",
  "package-lock.json",
  "CHANGELOG.md",
  "README.md"    // Add or remove files here
]
```

### Change Release Branches

Edit `.releaserc.json` `branches` array:

```json
"branches": [
  { "name": "main" },           // Production releases
  { "name": "develop", "prerelease": "beta" }  // Beta releases
]
```

### Disable npm Publishing

Already configured in `.releaserc.json` for non-npm projects:

```json
["@semantic-release/npm", { "npmPublish": false }]
```

## Troubleshooting

### Release Not Triggering

**Problem**: Push to main but no release created

**Solutions**:

1. Verify commit message follows Angular convention (`feat:`, `fix:`, etc.)
2. Check GitHub Actions tab for workflow run status
3. Ensure branch is `main` or `develop`
4. Look for workflows errors in GitHub Actions logs

### Wrong Version Detected

**Problem**: Release bumped wrong version number

**Solutions**:

1. Check commit messages - they determine version bump
2. Run `npm run release:dry` locally to test
3. See "Commit Message Format" section above
4. Use `BREAKING CHANGE:` footer for major versions

### GitHub Token Error

**Problem**: Workflow fails with token error

**Solution**:

- Verify `GITHUB_TOKEN` is in workflow (automatic in GitHub Actions)
- Check repository has `contents:write` and `pull-requests:write` permissions
- Personal token needed for local releases (see Local Testing section)

## Best Practices

1. **Write clear commit messages** following Angular convention
2. **Review semantic version** impact before committing
3. **Test releases locally** with `npm run release:dry` before pushing
4. **Separate concerns** - one commit type per logical change
5. **Use breaking change footer** for major version bumps
6. **Create PRs** for significant features (helps with release notes)

## Release Notes Generation

Changelog is automatically generated from:

- `feat` commits → Features section
- `fix` commits → Bug Fixes section
- `BREAKING CHANGE` footer → Breaking Changes section

Format is human-readable Markdown in `CHANGELOG.md`.

## Example Release Workflow

```bash
# 1. Create feature branch
git checkout -b feature/new-quote-rating

# 2. Make commits with conventional messages
git commit -m "feat: add star rating system for quotes"
git commit -m "fix: correct emoji display in ratings"

# 3. Push to main
git checkout main
git merge feature/new-quote-rating
git push origin main

# 4. GitHub Actions automatically:
#    - Analyzes commits (feat + fix)
#    - Detects MINOR version bump
#    - Updates package.json to 1.2.0
#    - Generates release notes
#    - Creates GitHub Release
#    - Tags commit as v1.2.0
```

## Resources

- [Semantic Release Documentation](https://semantic-release.gitbook.io/)
- [Angular Commit Convention](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- [Semantic Versioning](https://semver.org/)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)

## Quick Reference

| Command                 | Purpose                               |
| ----------------------- | ------------------------------------- |
| `npm run release:dry`   | Test what would be released (dry-run) |
| `npm run release`       | Perform actual release (local)        |
| `npm run release:check` | Verify version consistency            |
| `npm run lint`          | Check code quality                    |
| `npm test`              | Run all tests                         |
