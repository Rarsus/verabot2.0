# Git Workflow Guide - Prevent Divergence

## What Happened

You had a local commit that wasn't pushed while origin/main moved ahead (v2.19.0 release). This created a divergence that required force resetting.

## The Best Workflow to Prevent Divergence

### ✅ RECOMMENDED: Feature Branch Workflow

**Always work on feature branches, never directly on main:**

```bash
# 1. ALWAYS create a feature branch (even for small changes)
git checkout -b feature/your-feature-name

# 2. Make your changes and commits
git add .
git commit -m "your commit message"

# 3. Push your branch
git push -u origin feature/your-feature-name

# 4. Create a Pull Request on GitHub
# Let CI run, get reviews, then merge via GitHub UI

# 5. Delete local branch after merge
git checkout main
git pull origin main
git branch -d feature/your-feature-name
```

### ❌ NEVER Do This

- ❌ Commit directly to `main` locally
- ❌ Use `git push --force` on main
- ❌ Use `git reset --hard` without understanding consequences
- ❌ Skip pushing for multiple commits
- ❌ Pull main while working on main

---

## Quick Recovery Commands

If you accidentally diverge again:

```bash
# View the divergence
git log --oneline main..origin/main  # Commits on remote you don't have
git log --oneline origin/main..main  # Commits you have not on remote

# Option 1: Reset to origin (lose local commits you care about)
git reset --hard origin/main
git pull

# Option 2: Rebase (replay your commits on top of origin)
git fetch origin
git rebase origin/main
git push -f origin main  # Only if absolutely sure!

# Option 3: Merge (creates merge commit)
git fetch origin
git merge origin/main
git push origin main
```

---

## Setup: Configure Git for Safety

### 1. Set default branch to main
```bash
git config branch.autosetuprebase always
```

### 2. Prevent accidental force-push on main
```bash
git config branch.main.rebase true
```

### 3. Set up pre-push hook to prevent pushing to main
Create `.git/hooks/pre-push`:
```bash
#!/bin/bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "❌ ERROR: Cannot push directly to main/master"
    echo "Use feature branches instead!"
    exit 1
fi
```

Make it executable:
```bash
chmod +x .git/hooks/pre-push
```

---

## Daily Workflow

### Start of Day
```bash
git checkout main
git pull origin main
```

### For Any Task (no matter how small)
```bash
# Create feature branch
git checkout -b feature/task-description

# Make changes, commit, push
git push -u origin feature/task-description

# Open PR, get merged by GitHub UI
```

### End of Day
```bash
# Make sure main is clean
git checkout main
git pull origin main

# Clean up old branches
git branch -d merged-feature-1 merged-feature-2
```

---

## Why This Works

1. **Feature Branches = Isolation** - Your work doesn't conflict with others
2. **GitHub PR = Safety** - CI runs before merge, you can't accidentally push broken code
3. **main = Always Stable** - main is always deployable
4. **Clear History** - Each PR = one feature, easy to revert if needed
5. **No Force Pushes** - Prevents accidental overwrites

---

## Emergency: You Already Messed Up

**If you find yourself diverged like you just were:**

```bash
# 1. Check what you're about to lose
git log origin/main..main --oneline

# 2. Save important commits (if any) to a branch
git branch backup-my-changes

# 3. Reset to origin
git reset --hard origin/main
git pull origin main

# 4. Review your backup branch if needed
git log backup-my-changes --oneline
```

---

## Git Configuration File (Optional but Recommended)

Create or edit `.gitconfig` in your home directory:

```ini
[user]
    name = Your Name
    email = your.email@example.com

[pull]
    rebase = true          # Always rebase instead of merge

[push]
    default = current      # Push current branch to tracking branch
    autoSetupRemote = true # Automatically set upstream

[branch]
    autosetuprebase = always

[safe]
    directory = /home/olav/repo/verabot2.0

# Optional: Prevent main/master pushes
[branch "main"]
    rebase = true

[branch "master"]
    rebase = true
```

---

## Summary: Your New Workflow

1. ✅ Always work on feature branches
2. ✅ Push to origin regularly
3. ✅ Use GitHub UI to merge PRs
4. ✅ Pull main daily
5. ✅ Never force-push main
6. ✅ When in doubt, create a new branch

**Result:** No more divergence issues! 🎯
