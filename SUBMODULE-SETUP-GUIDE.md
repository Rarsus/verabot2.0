# Submodule Configuration Guide

## Status: ✅ ACTIVE

All three repositories are now configured as Git submodules in the main verabot2.0 repository.

## Submodule Structure

```
verabot2.0/
├── repos/
│   ├── verabot-core/          # Core bot implementation (v1.0.0)
│   ├── verabot-dashboard/     # Dashboard interface (v1.0.0)
│   └── verabot-utils/         # Utility library (v1.0.0)
├── .gitmodules                # Submodule configuration
└── [other root files]
```

## Quick Start

### Clone with Submodules

```bash
# Clone the main repository WITH all submodules
git clone --recursive https://github.com/Rarsus/verabot2.0.git

# OR: Clone main first, then initialize submodules
git clone https://github.com/Rarsus/verabot2.0.git
cd verabot2.0
git submodule update --init --recursive
```

### Working with Submodules

```bash
# Check submodule status
git submodule status

# Update all submodules to latest commits
git submodule update --remote

# Pull latest changes from main + submodules
git pull --recurse-submodules

# Fetch updates from submodule remotes
git submodule foreach git fetch
```

## Submodule Details

### 1. verabot-core (repos/verabot-core)
**Repository:** https://github.com/Rarsus/verabot-core.git
**Version:** v1.0.0
**Purpose:** Core Discord bot implementation
**Key Files:**
- `src/index.js` - Bot entry point
- `src/commands/` - Command implementations
- `src/services/` - Service layer

**Cloning This Submodule Alone:**
```bash
git clone https://github.com/Rarsus/verabot-core.git
```

### 2. verabot-dashboard (repos/verabot-dashboard)
**Repository:** https://github.com/Rarsus/verabot-dashboard.git
**Version:** v1.0.0
**Purpose:** Web dashboard for bot management
**Key Files:**
- `public/index.html` - Main dashboard page
- `public/css/style.css` - Styling
- `src/app.js` - Dashboard application

**Cloning This Submodule Alone:**
```bash
git clone https://github.com/Rarsus/verabot-dashboard.git
```

### 3. verabot-utils (repos/verabot-utils)
**Repository:** https://github.com/Rarsus/verabot-utils.git
**Version:** v1.0.0
**Purpose:** Shared utilities and helper functions
**Key Files:**
- `src/services/DatabaseService.js` - Database operations
- `src/helpers/` - Helper utilities
- `src/middleware/` - Middleware functions

**Cloning This Submodule Alone:**
```bash
git clone https://github.com/Rarsus/verabot-utils.git
```

## Advanced Submodule Operations

### Updating Submodule Versions

To update a specific submodule to a newer version:

```bash
# Update verabot-core to latest commit on main branch
cd repos/verabot-core
git fetch origin
git checkout main  # or specific branch/tag
cd ../..

# Commit the submodule update in main repo
git add repos/verabot-core
git commit -m "chore: update verabot-core to latest"
git push
```

### Working on Submodule Code

```bash
# Navigate to submodule
cd repos/verabot-core

# Create a branch and make changes
git checkout -b feature/new-command
# ... make changes ...
git add .
git commit -m "feat: add new command"
git push origin feature/new-command

# Return to main repo and commit the submodule update
cd ../..
git add repos/verabot-core
git commit -m "chore: update verabot-core with new feature"
git push
```

### Removing a Submodule (if needed)

```bash
# Remove submodule
git submodule deinit -f repos/verabot-core
git rm -rf repos/verabot-core

# Update .gitmodules
git add .gitmodules
git commit -m "chore: remove verabot-core submodule"
git push
```

## Troubleshooting

### Submodules Show as Dirty

```bash
# This is usually harmless but can be checked with:
git submodule summary

# To clean up, reset submodule to tracked commit:
cd repos/verabot-core
git reset --hard
cd ../..
```

### Clone Fails with Submodules

```bash
# Make sure you're using recursive clone
git clone --recursive https://github.com/Rarsus/verabot2.0.git

# If already cloned without recursion:
git submodule update --init --recursive
```

### Merge Conflicts in .gitmodules

```bash
# Resolve conflicts manually in .gitmodules, then:
git add .gitmodules
git commit -m "resolve: merge conflicts in .gitmodules"
```

## Configuration Reference

### .gitmodules File

```ini
[submodule "repos/verabot-core"]
	path = repos/verabot-core
	url = https://github.com/Rarsus/verabot-core.git
	branch = main

[submodule "repos/verabot-dashboard"]
	path = repos/verabot-dashboard
	url = https://github.com/Rarsus/verabot-dashboard.git
	branch = main

[submodule "repos/verabot-utils"]
	path = repos/verabot-utils
	url = https://github.com/Rarsus/verabot-utils.git
	branch = main
```

## Integration Notes

### Accessing Submodule Code in Main Repo

```javascript
// From main verabot2.0 repository
const DatabaseService = require('./repos/verabot-utils/src/services/DatabaseService');
const botCore = require('./repos/verabot-core/src/index');
```

### Package.json Considerations

If you need to install dependencies for submodules:

```bash
# Install main repo dependencies
npm install

# Install submodule dependencies
cd repos/verabot-core && npm install && cd ../..
cd repos/verabot-dashboard && npm install && cd ../..
cd repos/verabot-utils && npm install && cd ../..
```

## Best Practices

1. **Always use recursive clone** when cloning verabot2.0
2. **Keep submodules up-to-date** - Run `git submodule update --remote` regularly
3. **Make submodule updates in the submodule repo first**, then update the main repo
4. **Use meaningful commit messages** when updating submodule versions
5. **Document breaking changes** in submodules in both repos' CHANGELOGs
6. **Test integration** after updating submodule versions

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Clone with Submodules

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: recursive
      
      - name: Install dependencies
        run: |
          npm install
          cd repos/verabot-core && npm install && cd ../..
          cd repos/verabot-dashboard && npm install && cd ../..
          cd repos/verabot-utils && npm install && cd ../..
```

## Verification

To verify submodules are properly configured, run:

```bash
# Check submodule status
git submodule status

# Expected output (✓):
#  6750114651bd224d0c7512a50597cbd2544c1cd1 repos/verabot-core (v1.0.0)
#  3c06def0fca7342e9829443bbaf2165b2af9aac6 repos/verabot-dashboard (v1.0.0)
#  5310e1f3e27b54fc57d5bf87f0881a638059e959 repos/verabot-utils (v1.0.0)
```

## Support & Documentation

For more information about Git submodules:
- [Git Submodules Documentation](https://git-scm.com/book/en/v2/Git-Tools-Submodules)
- [GitHub Submodules Guide](https://docs.github.com/en/repositories/working-with-submodules)

---

**Last Updated:** January 2026
**Status:** ✅ Fully Operational
**Configuration Date:** January 15, 2026
