# CI/CD Workflow Quick Reference

## 🚀 New Workflow Summary

| Workflow | Trigger | Time | Purpose |
|----------|---------|------|---------|
| **pr-checks** | PR created | 10 min | Fast validation: lint, format, PR structure, dependencies |
| **testing** | PR created | 10-15 min | Test execution: unit (Node 20/22), integration, coverage |
| **security** | PR created | 8-12 min | Security scanning: dependencies, secrets, SAST, licenses |
| **documentation** | Docs changed | 4-5 min | Doc validation: markdown, links, breaking changes || **versioning** | Main push | 5 min | **NEW**: Automated versioning, changelog, releases || **deploy** | Push to main | 20-30 min | Docker build, staging deploy, smoke tests, production ready |

---

## ✅ PR Checklist

Before creating a PR:

- [ ] Branch name follows pattern: `feature/`, `fix/`, `docs/`, etc.
- [ ] Commit messages are clear and descriptive
- [ ] Code changes follow existing patterns
- [ ] `npm run lint:fix` has been run locally
- [ ] `npm test` passes locally
- [ ] New tests added for new functionality
- [ ] Documentation updated if needed
- [ ] No console.logs or debugging code
- [ ] No secrets or API keys committed

---

## 📝 PR Title Format

**REQUIRED**: All PR titles must follow this format:

```
<type>: <description>
```

### Valid Types

| Type | Usage | Example |
|------|-------|---------|
| `feat:` | New feature | `feat: add guild-aware reminder service` |
| `fix:` | Bug fix | `fix: correct null reference in QuoteService` |
| `docs:` | Documentation only | `docs: update testing guide` |
| `refactor:` | Code refactoring | `refactor: simplify quote validation logic` |
| `perf:` | Performance improvement | `perf: optimize database queries` |
| `test:` | Test changes | `test: add coverage for QuoteService` |
| `chore:` | Build/CI/dependencies | `chore: update dependencies` |

### Invalid Examples ❌
- `update stuff` (missing type)
- `WIP: feature` (not valid type)
- `Fix: bug` (lowercase prefix)
- `adds new feature` (no prefix)

---

## 🔴 Automatic Blockers (PR Cannot Merge)

| Issue | Cause | Fix |
|-------|-------|-----|
| ESLint errors | Code style violations | Run `npm run lint:fix` |
| Prettier issues | Formatting problems | Run `npm run lint:fix` |
| Test failures | Tests don't pass | Debug locally, `npm test` |
| Coverage < 80% lines | Not enough test coverage | Add tests for missing lines |
| Coverage < 90% functions | Missing function tests | Add tests for uncovered functions |
| Coverage < 75% branches | Missing branch tests | Test conditional logic |
| Critical vulnerabilities | npm audit finds CVE | `npm audit fix` or update package |
| Secrets detected | Exposed API keys/tokens | Remove secret, never commit again |

---

## 🟡 Warnings (Merge Allowed but Review Suggested)

| Warning | Action |
|---------|--------|
| High severity vulns | Review and plan fix |
| PR > 500 lines | Consider splitting into smaller PRs |
| PR > 1000 lines | Will require additional review |
| Breaking change | Must include migration guide |
| License violations | Review package, consider alternative |
| Code complexity > 10 | Consider refactoring function |

---

## 🧪 Local Testing Before PR

```bash
# 1. Lint check
npm run lint

# 2. Auto-fix formatting
npm run lint:fix

# 3. Run tests
npm test

# 4. Check coverage
npm test -- --coverage

# 5. Security audit
npm audit

# All should pass before creating PR!
```

---

## 🔧 Common Fixes

### ESLint Errors
```bash
npm run lint:fix
# Fixes most formatting and style issues automatically
```

### Test Failures
```bash
npm test -- --testNamePattern="failing-test-name"
# Run single test to debug
```

### Coverage Issues
```bash
npm test -- --coverage
# See coverage report to identify uncovered code
```

### Dependency Vulnerabilities
```bash
npm audit
# See vulnerabilities

npm audit fix
# Attempt automatic fix

npm audit fix --force
# Force fix (may update major versions)
```

---

## 🧪 Local Testing Before PR

```bash
# 1. Lint check
npm run lint

# 2. Auto-fix formatting
npm run lint:fix

# 3. Run tests
npm test

# 4. Check coverage
npm test -- --coverage

# 5. Security audit
npm audit

# All should pass before creating PR!
```

## 🚨 If PR is Blocked

### Step 1: Identify Issue
- Read the error message
- Check the failing job name
- Click "Details" to see logs

### Step 2: Understand Requirement
- Refer to Quick Reference table above
- Check workflow file for specifics
- Ask for clarification if unclear

### Step 3: Fix Locally
```bash
# Pull latest
git fetch origin
git rebase origin/main

# Fix the issue
npm run lint:fix
npm test
npm audit fix

# Commit and push
git add .
git commit -m "fix: address CI/CD validation issues"
git push origin <branch-name>
```

### Step 4: Verify
- Wait for workflows to complete
- Check all status checks pass
- Request review

---

## 💡 Pro Tips

### Avoid Breaking Changes
- Ask in #dev channel before major changes
- Provide clear migration path
- Update documentation
- Include migration guide link in PR

### Keep PRs Small
- Easier to review
- Faster validation time
- Simpler to revert if needed
- Better git history

### Write Descriptive Commits
```
Good: `feat: add guild-aware reminder notifications to QuoteService`
Bad: `fix stuff`
```

### Add Tests with Code
- Test-driven development (TDD)
- Write test first, then code
- Ensures coverage from start
- Validates requirements

### Document Breaking Changes
Create migration guide: `docs/guides/migration-{version}.md`
```markdown
# Migration Guide v0.2.0

## Breaking Changes

### Change: QuoteService now requires guild context

**Before:**
\`\`\`javascript
const quote = await quoteService.getQuote(id);
\`\`\`

**After:**
\`\`\`javascript
const quote = await quoteService.getQuote(guildId, id);
\`\`\`
```

---

## 📚 Reference Documents

- **Full Analysis**: [CICD-ANALYSIS-AND-REDESIGN.md](../../CICD-ANALYSIS-AND-REDESIGN.md)
- **Migration Guide**: [ci-cd-migration.md](../guides/ci-cd-migration.md)
- **Workflow Files**: `.github/workflows/`

---

## 🆘 Getting Help

### Issue: "Why is my PR blocked?"
→ Check the red ❌ status check details

### Issue: "How do I fix ESLint errors?"
→ Run `npm run lint:fix`

### Issue: "How do I improve coverage?"
→ Run `npm test -- --coverage` to see what's not tested

### Issue: "What's the PR title format?"
→ See "PR Title Format" section above

### Issue: "Still stuck?"
→ Check the workflow files in `.github/workflows/` or ask team

---

## 📱 Workflow Status on Mobile

1. Open PR on github.com
2. Scroll to "Checks" section
3. Expand any failing job
4. Read error messages
5. Fix locally and push again

---

## ⏱️ Expected Timelines

| Operation | Expected Time |
|-----------|---|
| pr-checks job | 8-10 min |
| testing job | 10-15 min |
| security job | 8-12 min |
| **Total PR validation** | **~25-30 min** |
| Merge to production | **~20 min** (with deploy) |

---

## 🎯 Success Indicators

Your PR is ready to merge when:
- ✅ All workflow checks are green
- ✅ PR title format is valid
- ✅ Code review approved
- ✅ Commits are clean and descriptive
- ✅ Documentation updated (if needed)
- ✅ No unresolved conversations

---

## 📞 Questions?

- Check documentation in `/docs`
- Review workflow files in `.github/workflows/`
- Ask team lead or senior developer
- Create GitHub issue for workflow problems

---

**Last Updated**: January 2026
**Version**: 1.0
**Status**: Active
