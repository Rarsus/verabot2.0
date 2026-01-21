# NPM Package Publishing Setup Guide

## Overview

VeraBot now publishes independent npm packages with automatic semantic versioning. Each commit to `main` triggers:

1. **Automated version bumping** (patch/minor/major based on commit messages)
2. **Package publishing** to public npm registry
3. **Git tags and release notes** auto-generated

## What Changed

### Before (Path Resolution Hell)
```
❌ Complex moduleNameMapper in jest.config.js
❌ GitHub Actions custom path linking
❌ Relative imports: require('../verabot-utils/src/...')
❌ Monorepo-only usability
```

### After (Clean Package Distribution)
```
✅ Simple npm install
✅ Standard imports: require('@verabot/utils')
✅ Works anywhere (local dev, GitHub Actions, external projects)
✅ Automatic versioning with semantic commits
```

## Package Names

| Module | Package Name | Repo |
|--------|------------|------|
| Core | `@verabot/core` | verabot-core |
| Utils | `@verabot/utils` | verabot-utils |
| Dashboard | `@verabot/dashboard` | verabot-dashboard |
| Commands | `@verabot/commands` | verabot-commands |

## Setup Required: NPM_TOKEN

To enable automatic publishing, you need to set up an npm authentication token in GitHub Secrets.

### Step 1: Generate NPM Token

1. Go to https://npmjs.com
2. Login to your account
3. Click profile → **Access Tokens**
4. Click **Generate New Token**
5. Choose: **Granular Access Token** (recommended)
6. Set permissions:
   - **Package access**: `@verabot/*` packages
   - **Permissions**: Publish
7. Copy the token

### Step 2: Add to GitHub Secrets

For each repository (verabot-core, verabot-utils, verabot-dashboard, verabot-commands):

1. Go to GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `NPM_TOKEN`
4. Value: (paste your npm token from Step 1)
5. Click **Add secret**

### Step 3: Verify Setup

Push a test commit with a conventional commit message:

```bash
git commit -m "fix: test semantic-release setup"
git push origin main
```

Expected workflow:
- ✅ GitHub Actions triggers "🚀 Release to npm" workflow
- ✅ Tests pass
- ✅ Package version auto-bumps (1.0.0 → 1.0.1)
- ✅ Published to npm.js
- ✅ Git tag created (v1.0.1)
- ✅ Release notes generated

## Commit Message Format (Conventional Commits)

Semantic versioning is triggered by commit message prefixes:

### Patch Release (1.0.0 → 1.0.1)
```bash
git commit -m "fix: correct bug in response handler"
```

### Minor Release (1.0.0 → 1.1.0)
```bash
git commit -m "feat: add new validation rule"
```

### Major Release (1.0.0 → 2.0.0)
```bash
git commit -m "feat!: breaking change in API"
# OR
git commit -m "feat: breaking change

BREAKING CHANGE: This changes the API signature"
```

### No Release (1.0.0 → 1.0.0)
```bash
git commit -m "docs: update README"
git commit -m "test: add new test case"
git commit -m "chore: update dependencies"
```

## Using Packages Locally

In development, npm workspaces still use `file:` protocol (instant updates):

```json
{
  "dependencies": {
    "@verabot/utils": "file:../verabot-utils",
    "@verabot/core": "file:../verabot-core"
  }
}
```

This is automatic with npm workspaces - no changes needed!

## Using Packages in External Projects

Once published to npm, install normally:

```bash
npm install @verabot/core @verabot/utils
```

Then import:

```javascript
const DatabaseService = require('@verabot/utils/services/DatabaseService');
const CommandBase = require('@verabot/core/core/CommandBase');
```

## GitHub Actions Changes

### Before
```yaml
- name: Move parent repo to proper location
  run: |
    RUNNER_WORKSPACE="${GITHUB_WORKSPACE%/*}"
    # Complex path calculation...
    # Manual directory linking...
```

### After
```yaml
- name: 📚 Install dependencies
  run: npm ci
  # That's it! npm handles all package resolution
```

## Testing Changes

### Before
```javascript
module.exports = {
  moduleNameMapper: {
    '^verabot-utils/(.*)$': '<rootDir>/../verabot-utils/src/$1',
    '^verabot-core/(.*)$': '<rootDir>/../verabot-core/src/$1',
  },
};
```

### After
```javascript
module.exports = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // Only @alias mapping needed
  },
};
```

Jest resolves `@verabot/*` packages normally through npm.

## Troubleshooting

### Release Workflow Not Triggering
- ✅ Verify `NPM_TOKEN` secret is set
- ✅ Check commit message follows conventional commits format
- ✅ Verify branch is `main`
- ✅ Check GitHub Actions permissions (write access needed)

### Package Not Publishing
- ✅ Run `npm test` locally to verify tests pass
- ✅ Run `npm run lint` to verify no lint errors
- ✅ Check npm registry for existing version
- ✅ View workflow logs for specific error

### Module Not Found After Installing
- ✅ Verify package exports in `package.json` are correct
- ✅ Clear npm cache: `npm cache clean --force`
- ✅ Reinstall: `rm -rf node_modules && npm install`
- ✅ Check package is published: `npm view @verabot/utils`

## Release Workflow Files

All 4 repos now have:

| File | Purpose |
|------|---------|
| `.github/workflows/release.yml` | Auto-publishes on main branch |
| `.releaserc.json` | Semantic-release configuration |
| `package.json` | Updated with scoped name, `publishConfig.access: public` |

## Next Steps

1. ✅ Generate NPM token (one-time, reusable across all repos)
2. ✅ Add `NPM_TOKEN` to GitHub Secrets in each repo
3. ✅ Test with a conventional commit
4. ✅ Verify package appears on npm.js
5. ✅ Update documentation with new package names

## Benefits

| Before | After |
|--------|-------|
| ❌ Complex CI/CD configuration | ✅ Simple, standard npm workflow |
| ❌ Path resolution errors in GitHub Actions | ✅ Zero path issues (npm handles it) |
| ❌ Monorepo-only | ✅ Usable as external dependency |
| ❌ Manual version management | ✅ Automated semantic versioning |
| ❌ Hard to upgrade modules independently | ✅ Each package versioned independently |
| ❌ Coupled to monorepo structure | ✅ Independent, interchangeable packages |

## Support

If you encounter issues:
1. Check workflow logs: GitHub → Actions → Latest workflow
2. Verify npm token has correct permissions
3. Ensure commit messages are conventional commits format
4. Test locally: `npm run test && npm run lint`
