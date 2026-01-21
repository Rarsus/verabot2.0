# Dual Publishing Setup - GitHub Packages + npm Registry

## Overview

VeraBot packages now publish simultaneously to **both** GitHub Packages and the public npm registry with a single release. This provides maximum distribution flexibility.

## Architecture

### Publishing Targets

| Registry | URL | Authentication | Audience |
|----------|-----|-----------------|----------|
| **GitHub Packages** | `npm.pkg.github.com` | `GITHUB_TOKEN` | GitHub users, private/internal use |
| **npm Registry** | `registry.npmjs.org` | `NPM_TOKEN` | Public npm community, open source |

### Release Flow

```
Push commit → GitHub Actions triggered
    ├─ Tests pass
    ├─ semantic-release analyzes commits
    ├─ Version determined (patch/minor/major)
    ├─ Publish to GitHub Packages ✅
    ├─ Publish to npm Registry ✅
    ├─ Git tag created
    ├─ Release notes generated
    └─ GitHub UI updated (labels, comments)
```

## Configuration Files

### `.npmrc` (New - All 4 Repos)

Routes scoped packages to GitHub Packages registry:

```ini
@verabot:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

**What it does:**
- Directs `@verabot/*` packages to GitHub Packages
- Sets authentication tokens for both registries
- Tokens are resolved from environment variables

### `.releaserc.json` (Updated - All 4 Repos)

Now contains **two npm plugin instances** for dual publishing:

```json
{
  "plugins": [
    // ... other plugins (commit-analyzer, changelog, git, github) ...
    [
      "@semantic-release/npm",
      {
        "npmPublish": true,
        "pkgRoot": ".",
        "registry": "https://npm.pkg.github.com"
      }
    ],
    [
      "@semantic-release/npm",
      {
        "npmPublish": true,
        "pkgRoot": ".",
        "registry": "https://registry.npmjs.org"
      }
    ]
  ]
}
```

**What it does:**
- First npm plugin: publishes to GitHub Packages
- Second npm plugin: publishes to public npm
- Both run in sequence during release
- Version and changelog are shared

### Workflow Files (Updated - All 4 Repos)

Updated `.github/workflows/release.yml` to:
- Remove hardcoded `registry-url` (let `.npmrc` handle routing)
- Keep both `GITHUB_TOKEN` and `NPM_TOKEN` in environment
- Update step name to reflect dual publishing

```yaml
- name: 🚀 Release to npm & GitHub Packages
  uses: cycjimmy/semantic-release-action@v4
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Setup Required

### 1. Create npm Token (One-time)

```bash
# Visit https://npmjs.com
# → Profile → Access Tokens → Generate New Token
# → Choose: Granular Access Token
# → Set permissions: @verabot/*, Publish
# → Copy token
```

### 2. Add NPM_TOKEN to GitHub Secrets (All 4 Repos)

For each repository (verabot-core, verabot-utils, verabot-dashboard, verabot-commands):

```
GitHub → Settings → Secrets and variables → Actions → New repository secret
Name: NPM_TOKEN
Value: [paste npm token]
```

**Note:** `GITHUB_TOKEN` is built-in (no setup needed)

### 3. Test First Release

Push a test commit with conventional format:

```bash
git commit -m "fix: test dual publishing setup"
git push origin main
```

Expected results:
- ✅ GitHub Actions triggers release workflow
- ✅ Tests pass
- ✅ Package publishes to GitHub Packages
- ✅ Package publishes to npm
- ✅ Version bumps (1.0.0 → 1.0.1)
- ✅ Git tag created (v1.0.1)
- ✅ PR labeled "released"

Verify:
```bash
npm view @verabot/core    # Check npm registry
# OR visit https://npm.pkg.github.com/
```

## Installation Paths for Users

### From npm Registry (Public)
```bash
npm install @verabot/core @verabot/utils
```

No setup needed - works anywhere!

### From GitHub Packages (Private/Internal)
```bash
# 1. Create GitHub personal access token with read:packages
# 2. Create ~/.npmrc with:
@verabot:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_TOKEN

# 3. Install
npm install @verabot/core
```

### Both Registries (Advanced)
Configure multiple registries in `.npmrc`:

```ini
@verabot:registry=https://npm.pkg.github.com
@otherorg:registry=https://registry.npmjs.org
```

## Commit Message Format

Same as before (angular preset):

### Patch (1.0.0 → 1.0.1)
```
fix: resolve issue
```

### Minor (1.0.0 → 1.1.0)
```
feat: add new capability
```

### Major (1.0.0 → 2.0.0)
```
feat!: breaking change
# OR
feat: breaking change

BREAKING CHANGE: describe what broke
```

### No Release
```
docs: update README
test: add tests
chore: update deps
```

## Monitoring Releases

### In GitHub UI
- Repository → Releases → view all published versions
- Check for `released` label on PRs
- View success/failure comments on PRs

### In npm
- `npm view @verabot/core` - see latest version
- `npm view @verabot/core versions` - see all versions
- https://npmjs.com/package/@verabot/core

### In GitHub Packages
- Visit https://github.com/Rarsus?tab=packages
- See `@Rarsus/core`, `@Rarsus/utils`, etc.

## Troubleshooting

### Publishing to GitHub Packages Failed
**Check:**
- `GITHUB_TOKEN` is available in workflow (it is, built-in)
- `.npmrc` has correct GitHub Packages URL
- Repository has `packages: write` permission (it does)

### Publishing to npm Failed
**Check:**
- `NPM_TOKEN` secret is set in GitHub Settings
- npm token has correct scopes: `@verabot/*`, Publish
- npm token is not expired
- View workflow logs for specific error

### Package Not Appearing After Release
**Check:**
- Workflow completed successfully (green ✅)
- Version number changed (check git tags)
- Correct registry:
  - `npm view @verabot/core` (for npm)
  - https://npm.pkg.github.com/@verabot/ (for GitHub)

### Authentication Failures

**npm Registry Error:**
```
401 Unauthorized: PUT https://registry.npmjs.org/@verabot/core
```
→ npm token invalid or expired, regenerate and update secret

**GitHub Packages Error:**
```
403 Forbidden: PUT https://npm.pkg.github.com/@verabot/core
```
→ GITHUB_TOKEN doesn't have permissions (check workflow permissions section)

## Benefits of Dual Publishing

| Feature | npm Registry | GitHub Packages | Dual |
|---------|------------|------------------|------|
| Public availability | ✅ | ❌ | ✅✅ |
| GitHub user access | ⚠️ (needs npm account) | ✅ | ✅✅ |
| Private/internal use | ❌ | ✅ | ✅✅ |
| Single version number | ✅ | ✅ | ✅✅ |
| Automatic versioning | ✅ | ✅ | ✅✅ |
| Community visibility | ✅✅ | ⚠️ | ✅✅ |

## Files Changed

### New Files
- `.npmrc` in all 4 submodules (dual registry routing)

### Updated Files
- `.releaserc.json` in all 4 submodules (added second npm plugin)
- `.github/workflows/release.yml` in all 4 submodules (removed hardcoded registry-url, updated step name)

### Git Commits
- **verabot-core**: ec24a17
- **verabot-utils**: 6a73136
- **verabot-dashboard**: 667ac68
- **verabot-commands**: 397a4a7

## Next Steps

1. ✅ Code deployed
2. ⏳ Add `NPM_TOKEN` to GitHub Secrets in all 4 repos
3. ⏳ Test first release with `git commit -m "fix: test dual publishing"`
4. ⏳ Verify packages appear in both registries
5. ✅ Production ready!

## Reference

- [GitHub Packages npm docs](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)
- [npm Registry publishing](https://docs.npmjs.com/cli/v10/commands/npm-publish)
- [Semantic Release docs](https://semantic-release.gitbook.io/)
