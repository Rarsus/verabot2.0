# CI/CD Quick Start Guide

## 🚀 Your Automated Pipeline is Live!

GitHub Actions now automatically tests, validates, and builds your code on every push.

---

## 📊 What Happens Automatically

### On Every Push to `main`

```
✅ Lint checking (ESLint)
✅ Full test suite (74+ tests)
✅ Security audit (npm audit)
✅ CodeQL analysis
✅ Docker image build
✅ Push to GitHub Container Registry
```

⏱️ **Time:** ~10-15 minutes

### On Every Pull Request

```
✅ Code quality checks
✅ All tests run
✅ PR title validation
✅ Size warnings
✅ Auto-comment with results
```

⏱️ **Time:** ~5-8 minutes

### Every Monday at 9 AM UTC

```
✅ Dependency updates check
✅ Security audit report
✅ Full health check
✅ Test report generation
```

---

## 📍 Where to Monitor

### 1. **GitHub Web Interface**

Go to your repository → **Actions** tab

You'll see:

- ✅ All workflow runs
- ⏱️ Execution time
- 📊 Status (success/failed)
- 📦 Artifacts (test results, reports)

### 2. **From Command Line**

```bash
# List recent runs
gh run list --repo Rarsus/verabot2.0

# View specific run
gh run view <run-id>

# View logs
gh run view <run-id> --log

# View detailed output
gh run view <run-id> --log-failed
```

### 3. **Repository Badges**

Add to your README for status display:

```markdown
![CI Tests](https://github.com/Rarsus/verabot2.0/actions/workflows/ci.yml/badge.svg)
![Deploy](https://github.com/Rarsus/verabot2.0/actions/workflows/deploy.yml/badge.svg)
```

---

## 🔄 Workflow Triggers

### Automatic

- ✅ Push to `main`
- ✅ Pull request to `main`
- ✅ Weekly schedule (Monday 9 AM UTC)
- ✅ File changes (src/, Dockerfile, package.json)

### Manual

Click "Run workflow" in Actions tab to trigger any workflow manually

---

## 📦 Docker Images Generated

Every successful deployment creates Docker images:

```
ghcr.io/Rarsus/verabot2.0:latest           # Latest version
ghcr.io/Rarsus/verabot2.0:main-abc123def   # Current commit
```

### View Images

```bash
# List images
gh api user/packages --paginate | grep verabot2.0

# Or in GitHub:
Settings → Packages → Container Registry
```

### Use Images

```bash
# Pull the latest image
docker pull ghcr.io/Rarsus/verabot2.0:latest

# Run with docker-compose
docker pull ghcr.io/Rarsus/verabot2.0:latest && docker-compose up -d
```

---

## 📊 Test Artifacts

Test results are automatically saved and available for download:

**Location:** Actions → Recent run → Artifacts

**Contents:**

- `test-results-node18.x/`
  - `TEST-SUMMARY-LATEST.md` - Quick summary
  - `TEST-RESULTS.md` - Detailed results
- `test-results-node20.x/` - Same for Node 20
- `test-results-node24.x/` - Same for Node 24
- `health-report-*` - Weekly health check reports
- `dependency-report/` - Dependency audit reports

---

## ⚠️ Common Issues & Solutions

### "Workflow failed: Tests didn't pass"

1. Go to Actions → Failed run
2. Click on job to see error details
3. Fix the issue locally
4. Push to retry automatically

### "Docker build timed out"

- Usually on first run due to no cache
- Subsequent runs will be much faster (3-5 min vs 10-15 min)
- Already cached images available on GHCR

### "PR validation failed but tests pass locally"

- Check Node version (CI tests 18, 20, 24)
- Verify .env variables
- Run `npm run test:all` locally

### "Can't access Docker images"

- Images are public by default
- Ensure container registry is set to public
- Settings → Packages & data → Repository visibility

---

## 🔐 Security Features

All workflows include:

✅ **ESLint** - Code style
✅ **Tests** - Functional correctness
✅ **npm audit** - Dependency vulnerabilities
✅ **CodeQL** - Advanced code analysis
✅ **PR validation** - Code review automation

---

## 🚀 Next Steps

### Option 1: Add Deployment

Connect to Railway, DigitalOcean, or AWS for automatic deployments

### Option 2: Add Slack Notifications

Post test results to Slack channel

### Option 3: Add Branch Protection

Require passing checks before merging PRs

**Settings → Branches → Add rule**

- ✅ Require passing checks
- ✅ Require reviews

---

## 📚 Documentation

Full details available in:

- [docs/GITHUB-ACTIONS.md](GITHUB-ACTIONS.md) - Complete workflow documentation
- [docs/CODE-QUALITY.md](CODE-QUALITY.md) - Code standards enforced
- [STABILITY-CHECKLIST.md](STABILITY-CHECKLIST.md) - Operations guide

---

## ✅ Checklist: What's Working

- ✅ Automated testing (every push/PR)
- ✅ Code quality checks (linting)
- ✅ Security scanning (CodeQL, npm audit)
- ✅ Docker image building
- ✅ Image push to GitHub Container Registry
- ✅ PR validation with auto-comments
- ✅ Weekly dependency monitoring
- ✅ Test artifact preservation
- ✅ Multi-version Node testing (18, 20, 24)
- ✅ Layer caching for fast builds

---

## 🎯 You're Ready!

Your entire pipeline is now automated. Every code change will:

1. **Run through quality gates** (lint, tests, security)
2. **Build Docker image** automatically
3. **Push to container registry** for easy deployment
4. **Generate reports** for monitoring

Just push code and watch it go! 🚀
