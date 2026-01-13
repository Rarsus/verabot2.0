# CI/CD Setup Guide

This guide explains the GitHub Actions CI/CD workflows in VeraBot2.0 and how to work with them.

## Table of Contents

- [Quick Start](#quick-start)
- [Overview](#overview)
- [Workflows](#workflows)
- [Running Workflows Locally](#running-workflows-locally)
- [Troubleshooting](#troubleshooting)
- [Adding New Workflows](#adding-new-workflows)

## Quick Start

### 🚀 Your Automated Pipeline is Live!

GitHub Actions now automatically tests, validates, and builds your code on every push.

#### What Happens Automatically

**On Every Push to `main`:**
```
✅ Lint checking (ESLint)
✅ Full test suite (1,901+ tests)
✅ Security audit (npm audit)
✅ CodeQL analysis
✅ Docker image build
✅ Push to GitHub Container Registry
```
⏱️ **Time:** ~10-15 minutes

**On Every Pull Request:**
```
✅ Code quality checks
✅ All tests run
✅ PR title validation
✅ Size warnings
✅ Auto-comment with results
```
⏱️ **Time:** ~5-8 minutes

**Every Monday at 9 AM UTC:**
```
✅ Dependency updates check
✅ Security audit report
✅ Full health check
✅ Test report generation
```

#### Where to Monitor

1. **GitHub Web Interface** - Go to Actions tab in your repository
2. **Status Badges** - Check README.md for workflow status
3. **Pull Request Comments** - Automatic results posted on PRs
4. **Codecov Dashboard** - Coverage trends and analysis

#### If a Workflow Fails

1. Click on the failed workflow
2. Review the error logs
3. Common fixes:
   - **Lint errors:** Run `npm run lint:fix`
   - **Test failures:** Run `npm test`
   - **Coverage drop:** Add more tests or fix coverage gaps
4. Push the fix to re-run workflow

#### Running Tests Locally

Before pushing, always run locally to catch issues early:

```bash
# Run all tests
npm test

# Check code style
npm run lint

# Check code style and fix auto-fixable issues
npm run lint:fix

# Generate coverage report
npm run test:coverage

# Watch mode for development
npm test -- --watch
```

## Overview

VeraBot2.0 uses GitHub Actions for continuous integration and continuous deployment (CI/CD). The workflows automatically run tests, perform security scans, check code quality, and generate coverage reports on every push and pull request.

## Workflows

### 1. CI - Tests & Quality Checks (`.github/workflows/ci.yml`)

**Triggers:** Push to `main`, Pull requests to `main`

**What it does:**

- Runs on Node.js 18.x, 20.x, and 22.x (matrix testing)
- Executes ESLint with strict enforcement (max 100 warnings)
- Runs all tests with coverage collection
- Generates coverage reports
- Uploads coverage to Codecov
- Performs security audit
- Runs CodeQL security analysis
- Builds Docker image (main branch only)

**Key Features:**

- Parallel testing across multiple Node versions
- Automatic coverage reporting with c8
- Integration with Codecov for coverage tracking
- Caches npm dependencies for faster builds

**Success Criteria:**

- All tests pass on all Node versions
- No ESLint errors (warnings allowed up to 100)
- Coverage meets minimum thresholds (70%)

### 2. Test Coverage & Reporting (`.github/workflows/test-coverage.yml`)

**Triggers:** Push to `main`, Pull requests to `main`

**What it does:**

- Runs comprehensive test suite with coverage
- Checks coverage thresholds (70% minimum)
- Generates detailed HTML coverage reports
- Uploads coverage artifacts
- Posts coverage summary as PR comment
- Uploads results to Codecov

**Coverage Thresholds:**

- Statements: 70%
- Branches: 65%
- Functions: 70%
- Lines: 70%

**Artifacts Generated:**

- `coverage-report` - Full HTML coverage report
- Coverage summary JSON

**PR Comment Example:**

```
## 📊 Code Coverage Report

| Metric | Coverage | Status |
|--------|----------|--------|
| Statements | 75.5% | ✅ |
| Branches | 68.2% | ✅ |
| Functions | 72.1% | ✅ |
| Lines | 75.3% | ✅ |
```

### 3. Security Scanning (`.github/workflows/security.yml`)

**Triggers:** Push to `main`, Pull requests to `main`, Weekly schedule (Sunday midnight)

**What it does:**

- **Dependency Scan:** Runs `npm audit` to check for vulnerabilities
- **ESLint Security:** Scans code with security-focused ESLint rules
- **Security Tests:** Runs security validation and integration tests
- **Secret Detection:** Uses TruffleHog to detect leaked secrets
- Posts security summary as PR comment

**Security Tests:**

- 20 input validation tests (SQL injection, XSS prevention)
- 15 integration tests (encryption, HMAC, hashing)

**Artifacts Generated:**

- `npm-audit-report` - Dependency vulnerability report
- `eslint-security-report` - Security-focused lint results

**PR Comment Example:**

```
## 🔐 Security Scan Summary

| Check | Status |
|-------|--------|
| Dependency Scan | ✅ Passed |
| ESLint Security | ✅ Passed |
| Security Tests | ✅ Passed |
| Secret Detection | ✅ Passed |
```

### 4. Code Quality Analysis (`.github/workflows/code-quality.yml`)

**Triggers:** Push to `main`, Pull requests to `main`

**What it does:**

- Runs ESLint for code quality checks
- Analyzes cyclomatic complexity
- Generates code metrics and statistics
- Calculates quality score (0-100)
- Posts quality summary as PR comment

**Quality Metrics:**

- Complexity warnings for functions >15 complexity
- Long function warnings (>150 lines)
- Code statistics (file count, line count)

**Quality Score Calculation:**

```
Score = 100 - (errors × 5) - (warnings × 0.5)
```

**Grade Scale:**

- A+ (95-100): Excellent
- A (90-94): Very Good
- B (80-89): Good
- C (70-79): Acceptable
- D (65-69): Needs Improvement
- F (<65): Poor

**Artifacts Generated:**

- `eslint-quality-report` - JSON and HTML lint reports
- `complexity-report` - Complexity analysis
- `code-metrics-report` - Code statistics

### 5. PR Validation (`.github/workflows/pr-validation.yml`)

**Triggers:** Pull request opened, synchronized, or reopened

**What it does:**

- Validates PR title format (must start with: feat:, fix:, docs:, etc.)
- Runs linter (strict, no errors allowed)
- Executes all tests
- Runs security validation tests
- Runs security integration tests
- Performs security audit
- Checks PR size (warns if >10 files or >500 additions)

**PR Title Format:**
Must start with one of:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Maintenance tasks

## Running Workflows Locally

While GitHub Actions workflows run automatically on the cloud, you can test them locally to catch issues before pushing.

### Running Tests Locally

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run security tests
npm run test:security

# Run integration tests
npm run test:integration

# Test GitHub Actions scripts
npm run test:workflows

# Check coverage thresholds
npm run coverage:check
```

### Running Documentation Validation Locally

```bash
# Check all documentation links
npm run docs:links

# Check version consistency across docs
npm run docs:version

# Update badges in README
npm run docs:badges

# Lint markdown files (placeholder)
npm run docs:lint
```

### Running Linter Locally

```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Run with max warnings (same as CI)
npm run lint -- --max-warnings=100
```

### Running Security Checks Locally

```bash
# Run npm audit
npm run security:audit

# Run all security checks (audit + lint)
npm run security:check
```

### Simulating CI Environment

Install act (GitHub Actions local runner):

```bash
# Install act (https://github.com/nektos/act)
brew install act  # macOS
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash  # Linux

# Run a workflow locally
act -W .github/workflows/ci.yml

# Run specific job
act -j test-and-lint

# Run with secrets
act -s GITHUB_TOKEN=<token>
```

## Troubleshooting

### Common Issues

#### 1. "Tests failed in CI but pass locally"

**Cause:** Different Node version or environment variables

**Solution:**

```bash
# Check Node version matches CI
node --version  # Should be 18.x, 20.x, or 22.x

# Run tests in clean environment
rm -rf node_modules package-lock.json
npm install
npm test
```

#### 2. "Coverage threshold not met"

**Cause:** Code coverage below 70%

**Solution:**

```bash
# Check coverage locally
npm run test:coverage

# View detailed HTML report
open coverage/lcov-report/index.html

# Add tests for uncovered files
```

#### 3. "Lint errors blocking PR"

**Cause:** ESLint errors in code

**Solution:**

```bash
# See specific errors
npm run lint

# Auto-fix what's possible
npm run lint:fix

# Check remaining issues
npm run lint
```

#### 4. "Security tests failing"

**Cause:** Security vulnerabilities or test failures

**Solution:**

```bash
# Run security tests locally
npm run test:security
npm run test:integration

# Check npm audit
npm audit

# Fix vulnerabilities
npm audit fix
```

#### 5. "Workflow syntax error"

**Cause:** Invalid YAML syntax in workflow file

**Solution:**

```bash
# Validate workflow file
act -W .github/workflows/ci.yml --dryrun

# Check YAML syntax online
# https://www.yamllint.com/
```

### Debugging Workflows

#### Enable Debug Logging

Add these secrets to your repository:

- `ACTIONS_STEP_DEBUG=true` - Enable step debug logging
- `ACTIONS_RUNNER_DEBUG=true` - Enable runner debug logging

#### View Workflow Logs

1. Go to the Actions tab in GitHub
2. Click on the workflow run
3. Click on the job that failed
4. Expand the failing step to see logs

#### Download Artifacts

Artifacts are available for 30 days after workflow completion:

1. Go to workflow run summary
2. Scroll to "Artifacts" section
3. Download the artifact you need

### Performance Issues

#### Slow Workflow Runs

**Solutions:**

1. Use npm cache (`cache: 'npm'` in setup-node action)
2. Run jobs in parallel where possible
3. Use `continue-on-error: true` for non-critical steps
4. Reduce matrix size if needed

#### High Resource Usage

**Solutions:**

1. Split large jobs into smaller ones
2. Use conditional job execution (`if` statements)
3. Skip unnecessary steps for specific branches
4. Use Docker layer caching for build jobs

## Adding New Workflows

### Creating a New Workflow

1. Create a new file in `.github/workflows/`
2. Use YAML format
3. Follow naming convention: `<purpose>.yml`
4. Start with minimal configuration
5. Test locally with `act`
6. Commit and push to test on GitHub

### Example Workflow Template

```yaml
name: My Custom Workflow

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  pull-requests: write

jobs:
  my-job:
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 📦 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'

      - name: 📚 Install dependencies
        run: npm ci

      - name: 🔧 Run my command
        run: npm run my-command
```

### Best Practices

1. **Use descriptive names** with emojis for visual clarity
2. **Cache dependencies** to speed up builds
3. **Use continue-on-error** for non-critical steps
4. **Set proper permissions** (least privilege)
5. **Add comments** for complex logic
6. **Upload artifacts** for debugging
7. **Post PR comments** for visibility
8. **Use matrix builds** for testing multiple versions
9. **Set timeouts** to prevent hung jobs
10. **Use secrets** for sensitive data

### Workflow Security

- Never hardcode secrets in workflows
- Use GitHub secrets for sensitive data
- Set minimal required permissions
- Validate inputs from external sources
- Use pinned action versions (@v4 not @main)

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Act - Local Runner](https://github.com/nektos/act)
- [Codecov Documentation](https://docs.codecov.com/)
- [ESLint Rules](https://eslint.org/docs/rules/)

## Support

If you encounter issues with workflows:

1. Check this guide first
2. Review workflow logs in GitHub Actions
3. Test locally with provided commands
4. Open an issue with workflow logs attached
