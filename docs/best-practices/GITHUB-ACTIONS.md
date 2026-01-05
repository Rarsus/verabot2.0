# GitHub Actions CI/CD Pipeline

Automated workflows for testing, quality checks, Docker builds, and deployments.

## 📋 Workflows Overview

### 1. **CI Pipeline** (`ci.yml`)

Runs on every push and PR to ensure code quality.

**Triggers:**

- Push to `main`
- Pull requests to `main`

**Jobs:**

- **test-and-lint** (Matrix: Node 18, 20, 24)
  - Installs dependencies
  - Runs ESLint
  - Runs full test suite
  - Uploads test artifacts
- **security-audit**
  - Runs npm security audit
  - Checks for vulnerabilities

- **docker-build**
  - Builds Docker image
  - Caches layers for faster subsequent builds

- **codeql-analysis**
  - Security code analysis
  - JavaScript vulnerability scanning

**Status Badge:**
Add to README:

```markdown
![CI Tests](https://github.com/Rarsus/verabot2.0/actions/workflows/ci.yml/badge.svg)
```

---

### 2. **Deployment Pipeline** (`deploy.yml`)

Automatically builds and pushes Docker image to GitHub Container Registry.

**Triggers:**

- Push to `main` (when source files change)
- Manual trigger (`workflow_dispatch`)

**Jobs:**

- **build-and-push**
  - Builds multi-stage Docker image
  - Pushes to GitHub Container Registry
  - Tags with version, branch, SHA, and latest
  - Uses layer caching for fast builds

- **notify-deployment**
  - Sends success notification
  - Provides image references

**Requirements:**

- GitHub Container Registry access (automatic)
- `GITHUB_TOKEN` (automatic)

**Docker Images Published:**

```
ghcr.io/rarsus/verabot2.0:latest
ghcr.io/rarsus/verabot2.0:main-<sha>
```

---

### 3. **Docker Release Publishing** (`docker-publish.yml`)

Builds and publishes versioned Docker images to GitHub Container Registry on release.

**Triggers:**

- GitHub Release published
- Manual trigger (`workflow_dispatch` with version input)

**Jobs:**

- **build-and-push-release**
  - Builds multi-platform Docker image (amd64, arm64)
  - Extracts version from release tag or manual input
  - Pushes to GitHub Container Registry with multiple tags
  - Uses layer caching for fast builds
  - Generates detailed build summary

- **verify-image**
  - Pulls published image to verify availability
  - Inspects image metadata and labels
  - Ensures image is accessible

**Requirements:**

- GitHub Container Registry access (automatic)
- `GITHUB_TOKEN` (automatic)

**Docker Images Published (for version 3.0.0):**

```
ghcr.io/rarsus/verabot2.0:3.0.0      # Full version
ghcr.io/rarsus/verabot2.0:3.0        # Major.minor
ghcr.io/rarsus/verabot2.0:3          # Major version
ghcr.io/rarsus/verabot2.0:latest     # Latest release
```

**Usage - Creating a Release:**

1. Tag your commit: `git tag v3.0.0`
2. Push the tag: `git push origin v3.0.0`
3. Create GitHub release from tag
4. Workflow automatically builds and publishes Docker images

**Usage - Manual Trigger:**

1. Go to Actions → Docker Release Publishing
2. Click "Run workflow"
3. Enter version number (e.g., "3.0.0")
4. Wait for build to complete

**Pulling Published Images:**

```bash
# Pull specific version
docker pull ghcr.io/rarsus/verabot2.0:3.0.0

# Pull latest release
docker pull ghcr.io/rarsus/verabot2.0:latest

# Run the container
docker run -d --env-file .env ghcr.io/rarsus/verabot2.0:latest
```

---

### 4. **PR Validation** (`pr-validation.yml`)

Enhanced validation for pull requests with automated comments.

**Triggers:**

- Pull request opened, synchronized, or reopened

**Jobs:**

- **validate-pr**
  - Full lint check
  - Complete test suite
  - Posts success/failure comments on PR

- **check-pr-title**
  - Validates PR title format
  - Required prefixes: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`

- **size-check**
  - Warns on large PRs (10+ files or 500+ additions)
  - Encourages smaller, focused PRs

---

### 5. **Scheduled Checks** (`scheduled-checks.yml`)

Weekly health checks and dependency monitoring.

**Triggers:**

- Every Monday at 9 AM UTC
- Manual trigger (`workflow_dispatch`)

**Jobs:**

- **check-dependencies**
  - Checks for outdated packages
  - Runs security audit
  - Generates dependency report
  - Artifacts available for 30 days

- **health-check**
  - Runs full test suite
  - Generates health report
  - Uploads report (90-day retention)

- **notify-status**
  - Summary notification

---

## 🚀 How to Use

### Running Workflows Manually

Go to **Actions** tab → Select workflow → **Run workflow**

### Checking Workflow Status

- **GitHub Web UI:** Settings → Actions → All workflows
- **Command line:**
  ```bash
  gh run list --repo Rarsus/verabot2.0
  gh run view <run-id>
  ```

### Viewing Artifacts

1. Go to Actions tab
2. Select a workflow run
3. Download artifacts section at bottom

---

## 🔧 Configuration

### Environment Variables

All workflows use standard GitHub environment variables:

- `GITHUB_TOKEN` - Automatic authentication
- `GITHUB_REPOSITORY` - Owner/repo
- `GITHUB_SHA` - Current commit SHA
- `GITHUB_REF` - Current branch

### Secrets (Optional for Future Deployment)

If adding deployment to external services, add secrets in:
**Settings → Secrets and Variables → Actions**

Examples:

- `DOCKER_USERNAME` - For Docker Hub
- `DEPLOY_KEY` - For server deployments
- `SLACK_WEBHOOK` - For notifications

---

## 📊 Workflow Performance

### CI Pipeline

- **Duration:** ~5-8 minutes
- **Nodes tested:** 3 (18.x, 20.x, 24.x)
- **Cache:** NPM dependencies cached

### Deployment Pipeline

- **Duration:** ~10-15 minutes (first run), ~3-5 minutes (cached)
- **Docker build:** Multi-stage, optimized for size
- **Registry:** GitHub Container Registry (GHCR)

### Scheduled Checks

- **Duration:** ~5-10 minutes
- **Frequency:** Weekly (Monday 9 AM UTC)
- **Reports:** Stored for 30-90 days

---

## ✅ Monitoring Dashboard

### Quick Status Checks

```bash
# Latest CI status
gh run list --repo Rarsus/verabot2.0 -w ci.yml -L 1

# Latest deployment
gh run list --repo Rarsus/verabot2.0 -w deploy.yml -L 1

# All workflows
gh workflow list --repo Rarsus/verabot2.0
```

### GitHub Web Dashboard

1. **Repository main page** → Actions tab
2. See all workflows and their latest runs
3. Click any run for detailed logs

---

## 🔐 Security Features

### Code Quality Gates

✅ ESLint - Code style enforcement
✅ Tests - Functional correctness
✅ Security Audit - Vulnerability scanning
✅ CodeQL - Advanced code analysis

### PR Protection Rules

✅ Title format validation
✅ Size warnings (prevent massive PRs)
✅ Auto-comments with results

---

## 📝 Next Steps

### To Enable Auto-Deployment

1. Choose a hosting platform:
   - Railway.app (easy, free tier)
   - DigitalOcean (scalable)
   - Heroku (simple)
   - AWS (powerful)

2. Add deployment job to `deploy.yml`

3. Store secrets in GitHub

### Example: Railway Deployment

```yaml
- name: Deploy to Railway
  run: |
    npx railway up
  env:
    RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

### Example: Discord Notifications

```yaml
- name: Notify on Slack/Discord
  run: |
    curl -X POST ${{ secrets.DISCORD_WEBHOOK }} \
      -H 'Content-Type: application/json' \
      -d '{"content":"✅ Deployment successful!"}'
```

---

## 🚨 Troubleshooting

### "Tests failed in CI but pass locally"

- **Cause:** Different Node version or missing environment variable
- **Solution:** Check `.env.example` and set `GUILD_ID` if needed

### "Docker build is slow"

- **Cause:** Cache not working
- **Solution:** Cache is automatic, wait for second run

### "PR comments not showing"

- **Cause:** Insufficient permissions
- **Solution:** Check repository settings → Actions permissions

---

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker build action](https://github.com/docker/build-push-action)
- [Node.js setup](https://github.com/actions/setup-node)
- [GHCR Documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
