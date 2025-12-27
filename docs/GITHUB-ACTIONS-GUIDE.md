# GitHub Actions Guide

A comprehensive guide to understanding and working with GitHub Actions workflows in VeraBot2.0.

## Table of Contents

- [Workflow Structure](#workflow-structure)
- [Secrets Management](#secrets-management)
- [Artifacts & Caching](#artifacts--caching)
- [Matrix Builds](#matrix-builds)
- [Advanced Tips](#advanced-tips)

## Workflow Structure

### Basic Workflow Anatomy

```yaml
name: Workflow Name                # Display name in Actions tab

on:                                # Trigger events
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

permissions:                       # Required permissions
  contents: read
  pull-requests: write

jobs:                             # Job definitions
  job-name:
    runs-on: ubuntu-latest        # Runner environment
    
    steps:                        # Sequential steps
      - name: Step name
        uses: action@version      # Use external action
        with:                     # Action parameters
          param: value
      
      - name: Run command
        run: npm test            # Run shell command
```

### Key Components

#### 1. Triggers (`on`)

**Common trigger types:**

```yaml
# Push to specific branches
on:
  push:
    branches: [ main, develop ]
    paths:                        # Only trigger on specific file changes
      - 'src/**'
      - 'tests/**'

# Pull requests
on:
  pull_request:
    branches: [ main ]
    types: [opened, synchronize, reopened]

# Scheduled runs (cron syntax)
on:
  schedule:
    - cron: '0 0 * * 0'          # Every Sunday at midnight

# Manual trigger
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        default: 'staging'

# Multiple triggers
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * 1'          # Weekly on Monday
```

#### 2. Permissions

**Principle of least privilege:**

```yaml
permissions:
  contents: read                  # Read repository contents
  pull-requests: write           # Comment on PRs
  security-events: write         # Write security events (CodeQL)
  actions: read                  # Read workflow runs
```

**Common permission levels:**
- `read` - Read-only access
- `write` - Read and write access
- `none` - No access

#### 3. Jobs

**Job structure:**

```yaml
jobs:
  build:
    name: Build and Test          # Display name
    runs-on: ubuntu-latest        # Runner OS
    timeout-minutes: 30           # Maximum runtime
    
    # Run only if condition is true
    if: github.event_name == 'push'
    
    # Depend on other jobs
    needs: [lint, test]
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
```

**Job dependencies:**

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm test

  deploy:
    needs: test                   # Wait for test to complete
    runs-on: ubuntu-latest
    steps:
      - run: npm run deploy

  notify:
    needs: [test, deploy]         # Wait for multiple jobs
    if: always()                  # Run even if others fail
    runs-on: ubuntu-latest
    steps:
      - run: echo "Jobs complete"
```

#### 4. Steps

**Step types:**

```yaml
steps:
  # Use external action
  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: '20.x'

  # Run shell command
  - name: Install dependencies
    run: npm ci

  # Run multiple commands
  - name: Test and coverage
    run: |
      npm test
      npm run coverage

  # Conditional step
  - name: Deploy
    if: github.ref == 'refs/heads/main'
    run: npm run deploy

  # Continue on error
  - name: Lint
    run: npm run lint
    continue-on-error: true
```

## Secrets Management

### Adding Secrets

1. Go to repository **Settings**
2. Select **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter name and value
5. Click **Add secret**

### Using Secrets

```yaml
steps:
  - name: Deploy
    env:
      API_KEY: ${{ secrets.API_KEY }}
      DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
    run: npm run deploy
```

### Environment-Specific Secrets

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production         # Use production environment
    steps:
      - name: Deploy
        env:
          API_KEY: ${{ secrets.API_KEY }}  # Environment-specific secret
        run: npm run deploy
```

### Security Best Practices

**DO:**
- ✅ Use secrets for sensitive data
- ✅ Rotate secrets regularly
- ✅ Use environment-specific secrets
- ✅ Audit secret access
- ✅ Use GITHUB_TOKEN for GitHub API

**DON'T:**
- ❌ Echo secrets in logs
- ❌ Pass secrets as command arguments
- ❌ Commit secrets to repository
- ❌ Use secrets in PR from forks (not accessible)

### Masking Secrets

Secrets are automatically masked in logs:

```yaml
steps:
  - name: Use secret
    run: echo "${{ secrets.API_KEY }}"
    # Output: echo ***
```

## Artifacts & Caching

### Artifacts

**Upload artifacts:**

```yaml
steps:
  - name: Generate report
    run: npm run test:coverage

  - name: Upload coverage
    uses: actions/upload-artifact@v4
    with:
      name: coverage-report
      path: |
        coverage/
        coverage/lcov-report/
      retention-days: 30            # Keep for 30 days
```

**Download artifacts:**

```yaml
steps:
  - name: Download coverage
    uses: actions/download-artifact@v4
    with:
      name: coverage-report
      path: ./coverage
```

**Use cases:**
- Test reports and coverage
- Build artifacts
- Logs and debug info
- Generated documentation

### Caching

**Cache dependencies:**

```yaml
steps:
  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: '20.x'
      cache: 'npm'                  # Automatic npm caching
```

**Custom cache:**

```yaml
steps:
  - name: Cache dependencies
    uses: actions/cache@v4
    with:
      path: |
        node_modules
        ~/.npm
      key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
      restore-keys: |
        ${{ runner.os }}-node-
```

**Cache strategies:**
- Use unique keys based on file hashes
- Include OS in cache key
- Provide restore-keys as fallback
- Set cache size limits (10GB total per repo)

## Matrix Builds

### Basic Matrix

Test across multiple versions:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x, 22.x]
    
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      
      - run: npm test
```

### Multi-Dimensional Matrix

Test multiple configurations:

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node-version: [18.x, 20.x]
    # Results in 6 jobs: 3 OS × 2 Node versions
```

### Matrix with Include/Exclude

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest]
    node-version: [18.x, 20.x]
    
    # Add specific configuration
    include:
      - os: ubuntu-latest
        node-version: 22.x
        experimental: true
    
    # Exclude specific combination
    exclude:
      - os: windows-latest
        node-version: 18.x
```

### Matrix Variables

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x]
    include:
      - node-version: 18.x
        node-version-id: node18
      - node-version: 20.x
        node-version-id: node20

steps:
  - name: Upload results
    uses: actions/upload-artifact@v4
    with:
      name: test-results-${{ matrix.node-version-id }}
      path: ./results
```

### Fail-Fast Strategy

```yaml
strategy:
  fail-fast: false              # Don't cancel other jobs on failure
  matrix:
    node-version: [18.x, 20.x, 22.x]
```

## Advanced Tips

### 1. Conditional Execution

**Run job only on main branch:**

```yaml
jobs:
  deploy:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
```

**Run step on success:**

```yaml
steps:
  - name: Notify success
    if: success()
    run: echo "Tests passed!"

  - name: Notify failure
    if: failure()
    run: echo "Tests failed!"

  - name: Always run
    if: always()
    run: echo "Always runs"
```

**Complex conditions:**

```yaml
if: |
  github.event_name == 'push' &&
  github.ref == 'refs/heads/main' &&
  !contains(github.event.head_commit.message, '[skip ci]')
```

### 2. Reusable Workflows

**Define reusable workflow:**

```yaml
# .github/workflows/reusable-test.yml
name: Reusable Test Workflow

on:
  workflow_call:
    inputs:
      node-version:
        required: true
        type: string

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
      - run: npm test
```

**Call reusable workflow:**

```yaml
jobs:
  test-18:
    uses: ./.github/workflows/reusable-test.yml
    with:
      node-version: '18.x'

  test-20:
    uses: ./.github/workflows/reusable-test.yml
    with:
      node-version: '20.x'
```

### 3. Output Variables

**Set output in step:**

```yaml
steps:
  - name: Calculate version
    id: version
    run: |
      VERSION=$(cat package.json | jq -r .version)
      echo "version=$VERSION" >> $GITHUB_OUTPUT

  - name: Use version
    run: echo "Version is ${{ steps.version.outputs.version }}"
```

**Job outputs:**

```yaml
jobs:
  build:
    outputs:
      version: ${{ steps.version.outputs.version }}
    steps:
      - id: version
        run: echo "version=1.0.0" >> $GITHUB_OUTPUT

  deploy:
    needs: build
    steps:
      - run: echo "Deploying ${{ needs.build.outputs.version }}"
```

### 4. Environment Variables

**Workflow-level:**

```yaml
env:
  NODE_ENV: production

jobs:
  test:
    runs-on: ubuntu-latest
```

**Job-level:**

```yaml
jobs:
  test:
    env:
      DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

**Step-level:**

```yaml
steps:
  - name: Test
    env:
      API_KEY: ${{ secrets.API_KEY }}
    run: npm test
```

### 5. GitHub Script Action

Execute JavaScript in workflows:

```yaml
steps:
  - name: Comment on PR
    uses: actions/github-script@v7
    with:
      github-token: ${{ secrets.GITHUB_TOKEN }}
      script: |
        const issue_number = context.issue.number;
        await github.rest.issues.createComment({
          issue_number: issue_number,
          owner: context.repo.owner,
          repo: context.repo.repo,
          body: '✅ Build successful!'
        });
```

### 6. Timeout and Retries

**Set timeout:**

```yaml
jobs:
  test:
    timeout-minutes: 30
    steps:
      - name: Long test
        timeout-minutes: 10
        run: npm run long-test
```

**Retry on failure:**

```yaml
steps:
  - name: Flaky test
    uses: nick-invision/retry@v2
    with:
      timeout_minutes: 10
      max_attempts: 3
      command: npm test
```

### 7. Workflow Dispatch

Manual workflow triggers with inputs:

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        type: choice
        options:
          - development
          - staging
          - production
      version:
        description: 'Version to deploy'
        required: false
        default: 'latest'

jobs:
  deploy:
    steps:
      - run: |
          echo "Deploying to ${{ inputs.environment }}"
          echo "Version: ${{ inputs.version }}"
```

### 8. Debugging Workflows

**Enable debug logging:**

Add repository secrets:
- `ACTIONS_STEP_DEBUG=true`
- `ACTIONS_RUNNER_DEBUG=true`

**Add debug output:**

```yaml
steps:
  - name: Debug info
    run: |
      echo "Event: ${{ github.event_name }}"
      echo "Ref: ${{ github.ref }}"
      echo "Actor: ${{ github.actor }}"
      env
```

**Use tmate for interactive debugging:**

```yaml
steps:
  - name: Setup tmate session
    if: failure()
    uses: mxschmitt/action-tmate@v3
```

### 9. Performance Optimization

**Parallel jobs:**

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
  test:
    runs-on: ubuntu-latest
  build:
    runs-on: ubuntu-latest
  # All run in parallel
```

**Cancel redundant runs:**

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

**Skip CI:**

Add `[skip ci]` or `[ci skip]` to commit message.

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Marketplace](https://github.com/marketplace?type=actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Events that trigger workflows](https://docs.github.com/en/actions/reference/events-that-trigger-workflows)
- [Contexts](https://docs.github.com/en/actions/learn-github-actions/contexts)
- [Expressions](https://docs.github.com/en/actions/learn-github-actions/expressions)
