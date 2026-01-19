# CI/CD Migration Guide - VeraBot2.0

## Transition from Old to New CI/CD Workflows

This guide outlines the step-by-step process to migrate from the old (16-workflow) CI/CD system to the new optimized (4-6 workflow) system.

---

## 📋 Pre-Migration Checklist

- [ ] All team members informed about changes
- [ ] New workflows reviewed and approved
- [ ] Backup of old workflows created
- [ ] Documentation updated
- [ ] Branch protection rules prepared
- [ ] GitHub settings reviewed

---

## 🔄 Migration Timeline

### Week 1: Testing Phase
**Duration**: 3-5 working days

#### Step 1: Deploy Workflows (Non-Main)
```bash
# All workflows are now in .github/workflows/
# New workflows are already created:
- pr-checks.yml
- testing.yml
- security.yml
- documentation.yml
- deploy.yml

# Status: ✅ Ready to test
```

#### Step 2: Create Test Branch
```bash
# Create branch to test new workflows
git checkout -b test/new-cicd
git push origin test/new-cicd

# This will trigger new workflows on PR
```

#### Step 3: Create Test PR
1. Go to GitHub → Pull Requests → New PR
2. Compare: `test/new-cicd` → `main`
3. Create PR with test commit
4. Observe workflow execution

#### Step 4: Monitor Test Results
- Check all workflow executions
- Review job timing and logs
- Note any issues or failures
- Document performance metrics

### Week 2: Configuration Phase
**Duration**: 2-3 working days

#### Step 5: Update GitHub Settings
```
Settings → Branches → main → Add Rule

Add required status checks:
☑ pr-checks / lint-and-format
☑ pr-checks / pr-validation
☑ pr-checks / dependency-check
☑ testing / unit-tests-node20
☑ testing / unit-tests-node22
☑ testing / integration-tests
☑ testing / coverage-validation
☑ security / dependency-scan
☑ security / secret-scan
☑ security / sast-scan
☑ (optional) documentation / markdown-lint
```

#### Step 6: Set Approval Requirements
```
Settings → Branches → main → Add Rule

Require:
☑ Pull Request Reviews (1 approval)
☑ Dismiss stale pull request approvals
☑ Require status checks to pass before merging
☑ Require branches to be up to date before merging
```

#### Step 7: Configure Environments
```
Settings → Environments → Create "staging"
Settings → Environments → Create "production"
```

#### Step 8: Update PR Template
Edit: `.github/pull_request_template.md`

```markdown
## Description
<!-- Describe your changes -->

## Type of Change
- [ ] feat: New feature
- [ ] fix: Bug fix
- [ ] docs: Documentation
- [ ] refactor: Code refactoring
- [ ] perf: Performance improvement
- [ ] test: Test changes
- [ ] chore: Build/CI/dependency changes

## Breaking Changes?
- [ ] No breaking changes
- [ ] Has breaking changes (describe below)

## Migration Guide Included?
- [ ] N/A (not a breaking change)
- [ ] Yes (breaking change with guide)

## Testing
- [ ] Manual testing completed
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Coverage maintained/improved

## Checklist
- [ ] Followed code style guidelines
- [ ] No security vulnerabilities introduced
- [ ] No console logs or debugging code
- [ ] Documentation updated
- [ ] CHANGELOG.md updated (if applicable)
```

### Week 3: Rollout Phase
**Duration**: 2-3 working days

#### Step 9: Disable Old Workflows
```bash
# Archive old workflows
mkdir -p .github/workflows-archived

# Move old workflow files
mv .github/workflows/ci.yml .github/workflows-archived/
mv .github/workflows/pr-validation.yml .github/workflows-archived/
mv .github/workflows/test.yml .github/workflows-archived/
mv .github/workflows/code-quality.yml .github/workflows-archived/
mv .github/workflows/coverage.yml .github/workflows-archived/
# ... and any other old workflows

# Commit changes
git add .github/workflows-archived/
git commit -m "chore: archive old CI/CD workflows"
git push origin main
```

#### Step 10: First PR with New System
1. Create PR from feature branch
2. Verify all new workflows execute
3. Verify branch protection rules work
4. Test PR approval/merge flow
5. Document any issues

#### Step 11: Team Training (1 hour)
- Explain new workflow structure
- Show PR title format requirements
- Demonstrate failure scenarios
- Share troubleshooting tips
- Q&A session

#### Step 12: Monitor & Support
- First week: Monitor all PRs
- Respond to workflow failures
- Adjust thresholds if needed
- Collect team feedback

### Week 4: Optimization Phase
**Duration**: 2-3 working days

#### Step 13: Performance Tuning
- Analyze execution times
- Optimize slow jobs
- Adjust timeouts
- Improve caching

#### Step 14: Documentation
- Create runbook for common issues
- Document custom configurations
- Update team wiki/docs
- Create video tutorial (optional)

#### Step 15: Feedback & Iteration
- Gather team feedback
- Adjust rules/thresholds
- Fine-tune workflow order
- Plan improvements for next phase

---

## 🚨 Fallback Plan

If new workflows have critical issues:

### Option 1: Partial Rollback
```bash
# Keep new workflows but disable blocking checks
# Modify branch protection rules to require fewer checks
# Give team time to adapt

Settings → Branches → main
- Disable blocking status checks
- Keep as non-blocking for visibility
- Re-enable after issues fixed
```

### Option 2: Full Rollback
```bash
# Revert to old workflows if critical issues arise
git revert HEAD  # Revert workflow changes
git push origin main

# Then debug and re-deploy new workflows after fixes
```

---

## 📝 New Requirements for All PRs

### PR Title Format
All PRs **MUST** have titles in this format:

```
<type>: <description>
```

**Valid Types:**
- `feat:` - New feature
- `fix:` - Bug fix  
- `docs:` - Documentation only
- `refactor:` - Code refactoring
- `perf:` - Performance improvement
- `test:` - Test changes
- `chore:` - Build/CI/dependency

**Examples:**
- ✅ `feat: add guild-aware reminder service`
- ✅ `fix: correct null reference error in QuoteService`
- ✅ `docs: update testing guide`
- ❌ `update stuff` (invalid)
- ❌ `WIP: feature` (missing type)

### Code Quality Checks
- ESLint must pass: `npm run lint`
- Prettier formatting: `npm run lint:fix`
- Tests must pass: `npm test`
- Coverage minimum: 80% lines, 90% functions, 75% branches

### Security Requirements
- No exposed secrets or API keys
- No critical vulnerabilities (npm audit)
- License compliance (no GPL in dependencies)
- Code complexity < 10 per function

### PR Size Guidelines
- **Ideal**: < 300 lines
- **Acceptable**: 300-500 lines (may request review)
- **Large**: 500-1000 lines (requires extra review)
- **Too Large**: > 1000 lines (split into multiple PRs)

---

## 🔍 Monitoring & Metrics

### Weekly Reports
Create issue to track:
- Total PRs merged
- Average PR validation time
- Workflow failure rate
- Most common failures
- Suggestions for improvement

### Monthly Reviews
- Analyze performance trends
- Adjust timeout thresholds
- Update documentation
- Plan optimizations

### Metrics to Track
```
- Average pr-checks time: target < 10 min
- Average testing time: target < 15 min
- Average security scan: target < 10 min
- Total merge time: target < 30 min
- Workflow success rate: target > 95%
- False positive rate: target < 2%
```

---

## 🎓 Team Training Materials

### For Developers
**Duration**: 15-20 minutes

Topics:
1. New workflow structure (5 min)
2. PR title format requirements (3 min)
3. Common failures & solutions (5 min)
4. Best practices (4 min)
5. Q&A (3 min)

### For Reviewers
**Duration**: 10-15 minutes

Topics:
1. What checks are automated (3 min)
2. What to manually review (3 min)
3. How to use workflow results (3 min)
4. Approval checklist (3 min)
5. Q&A (3 min)

### For Maintainers
**Duration**: 30-45 minutes

Topics:
1. Workflow architecture (10 min)
2. Troubleshooting guide (10 min)
3. Configuration & customization (10 min)
4. Monitoring & metrics (5 min)
5. Roadmap & improvements (5 min)

---

## ✅ Migration Completion Checklist

### Configuration
- [ ] All new workflows created and tested
- [ ] Branch protection rules updated
- [ ] GitHub environments configured
- [ ] PR template updated
- [ ] GitHub secrets configured (if needed)

### Team Readiness
- [ ] All team members trained
- [ ] PR title format documented
- [ ] Code quality requirements clear
- [ ] Troubleshooting guide shared
- [ ] Questions answered

### Process Changes
- [ ] Reviewed workflow documentation
- [ ] Updated development guidelines
- [ ] Tested complete PR flow
- [ ] Verified merge process works
- [ ] Backup/rollback plan ready

### Monitoring
- [ ] Set up performance tracking
- [ ] Create monitoring dashboard
- [ ] Define success metrics
- [ ] Schedule review meetings
- [ ] Plan optimization phase

---

## 📞 Support & Issues

### Common Issues During Migration

**Issue**: PR blocked by ESLint
```
Solution: Run 'npm run lint:fix' locally, commit, push
```

**Issue**: Coverage below threshold
```
Solution: Add tests for uncovered lines, run 'npm test -- --coverage'
```

**Issue**: Dependency vulnerability blocks merge
```
Solution: Run 'npm audit fix', or update package.json, commit changes
```

**Issue**: Secret detected falsely
```
Solution: Update patterns in security.yml if legitimate content
```

**Issue**: Workflow timeout
```
Solution: Check runner availability, optimize slow steps, increase timeout
```

### Getting Help
1. Check `CICD-ANALYSIS-AND-REDESIGN.md` for details
2. Review workflow file for specific job
3. Check GitHub Actions logs
4. Consult troubleshooting section above
5. Ask team lead for assistance

---

## 📅 Post-Migration Follow-up

### Day 3
- Check workflow success rate
- Identify any issues
- Gather initial feedback

### Week 1
- Monitor all PRs
- Document issues found
- Prepare quick fixes
- Validate performance

### Month 1
- Comprehensive analysis
- Performance optimization
- Threshold adjustments
- Team feedback session

### Month 3
- Full audit of new system
- Compare vs old system
- Plan Phase 2 improvements
- Document lessons learned

---

## 🎉 Success Criteria

Migration is **successful** when:

✅ All new workflows are passing consistently
✅ Team is comfortable with new requirements
✅ PR merge time is 30-40% faster
✅ No critical workflow failures
✅ Coverage maintained or improved
✅ Security vulnerabilities caught before merge
✅ Team productivity not negatively impacted
✅ Documentation complete and accurate

---

## 📄 Related Documents

- [CICD-ANALYSIS-AND-REDESIGN.md](../../CICD-ANALYSIS-AND-REDESIGN.md) - Full technical analysis
- [../../.github/workflows/pr-checks.yml](../../.github/workflows/pr-checks.yml) - PR validation workflow
- [../../.github/workflows/testing.yml](../../.github/workflows/testing.yml) - Testing workflow
- [../../.github/workflows/security.yml](../../.github/workflows/security.yml) - Security scanning workflow
- [../../.github/workflows/documentation.yml](../../.github/workflows/documentation.yml) - Documentation validation
- [../../.github/workflows/deploy.yml](../../.github/workflows/deploy.yml) - Deployment workflow

---

**Version**: 1.0
**Created**: January 2026
**Status**: Ready for Implementation
