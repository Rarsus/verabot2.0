# Epic #49: Milestone and Issue Tracking Strategy

**Status**: Setting up milestones and tracking  
**Date**: January 20, 2026  
**Repository**: github.com/Rarsus/verabot2.0

---

## Overview

This document defines the **milestone structure and issue tracking** for Epic #49 implementation across all phases. Each phase has a dedicated milestone with properly assigned issues.

---

## Milestone Structure

### Phase 1 Milestone: "Extraction to Folders" (6-9 days)

**Title**: `Phase 1: Extraction to Folders`  
**Description**: Extract modules to folder structure while keeping in single repo

**Target Date**: ~Feb 3, 2026 (9 days)

**Assigned Issues**:
- #50: Plan and define modular boundaries (2-3 days)
- #51: Extract dashboard code to folder (4-5 days)
- #52: Extract utilities code to folder (3-4 days)

**Success Criteria**:
- ✅ All modules in folder structure
- ✅ TDD applied to all new code
- ✅ Test coverage >= 85%
- ✅ Zero ESLint errors
- ✅ Code review approved

**Blocking Issues**: None (can start immediately)

**Blocked By**: None

---

### Phase 2 Milestone: "Git Submodule Conversion" (2-3 days)

**Title**: `Phase 2: Git Submodule Conversion`  
**Description**: Convert folder structure to independent Git submodules

**Target Date**: ~Feb 6, 2026 (2-3 days after Phase 1)

**Assigned Issues**:
- #98: Convert folders to Git submodules (2-3 days)

**Success Criteria**:
- ✅ GitHub repositories created
- ✅ Independent Git histories initialized
- ✅ Submodule references in main repo
- ✅ Docker Compose works with submodules
- ✅ Documentation updated

**Blocking Issues**: Phase 1 completion required

**Blocked By**: Phase 1 (#50, #51, #52)

---

### Phase 3 Milestone: "Integration & CI/CD" (11-16 days)

**Title**: `Phase 3: Integration & CI/CD`  
**Description**: Full integration testing, CI/CD setup, documentation finalization

**Target Date**: ~Feb 20, 2026 (11-16 days after Phase 2)

**Assigned Issues**:
- #53: Integration testing with submodules (4-6 days)
- #54: Refactor core bot repository (2-3 days)
- #55: Setup CI/CD pipelines for submodules (3-4 days)
- #56: Finalize documentation (2 days)

**Success Criteria**:
- ✅ All integration tests passing
- ✅ Independent CI/CD for each submodule
- ✅ Test coverage >= 85% (all modules)
- ✅ Docker Compose validated
- ✅ All 3000+ tests passing
- ✅ Ready for production

**Blocking Issues**: Phase 2 completion required

**Blocked By**: Phase 2 (#98)

---

### Phase 4 Milestone: "Full Separation" (Future - 3-5 days)

**Title**: `Phase 4: Full Separation (Future)`  
**Description**: Fully independent repositories, issue tracking, npm packages

**Target Date**: TBD (after Phase 3)

**Assigned Issues**: TBD (to be created after Phase 3)

**Success Criteria**: TBD

**Blocking Issues**: Phase 3 completion required

**Blocked By**: Phase 3 (#53, #54, #55, #56)

---

## Issue Tracking Matrix

| Issue | Title | Milestone | Priority | Assigned | Status | 
|-------|-------|-----------|----------|----------|--------|
| #50 | Plan module boundaries | Phase 1 | High | TBD | Waiting for Phase 1 start |
| #51 | Extract dashboard | Phase 1 | High | TBD | Waiting for Phase 1 start |
| #52 | Extract utilities | Phase 1 | High | TBD | Waiting for Phase 1 start |
| #53 | Integration testing | Phase 3 | High | TBD | Waiting for Phase 2 complete |
| #54 | Refactor core bot | Phase 3 | High | TBD | Waiting for Phase 2 complete |
| #55 | CI/CD pipelines | Phase 3 | High | TBD | Waiting for Phase 2 complete |
| #56 | Documentation | Phase 3 | High | TBD | Waiting for Phase 2 complete |
| #98 | Git submodule conversion | Phase 2 | High | TBD | Waiting for Phase 1 complete |

---

## Milestone Timeline

```
Week 1: Phase 1 - Extraction to Folders (#50-52)
├─ Day 1-3: #50 (Plan boundaries)
├─ Day 3-7: #51 (Extract dashboard)
├─ Day 4-8: #52 (Extract utilities)
└─ Day 9: Phase 1 completion checkpoint

Week 2: Phase 2 - Git Submodules (#98)
├─ Day 10-12: #98 (Submodule conversion)
└─ Day 13: Phase 2 completion checkpoint

Week 3-4: Phase 3 - Integration & CI/CD (#53-56)
├─ Day 14-20: #53 (Integration testing)
├─ Day 16-18: #54 (Core bot refactoring)
├─ Day 19-22: #55 (CI/CD pipelines)
├─ Day 22-24: #56 (Documentation)
└─ Day 25: Phase 3 completion checkpoint

Week 5+: Phase 4 - Full Separation (Future)
└─ TBD: Phase 4 work
```

---

## Dependencies and Blocking

### Phase 1 → Phase 2

**Blockers for Phase 2 Start**:
- [ ] #50 complete (boundaries defined)
- [ ] #51 complete (dashboard extracted)
- [ ] #52 complete (utilities extracted)
- [ ] All tests passing
- [ ] Code review approvals
- [ ] Main branch updated

**Gate Criteria**:
- All Phase 1 issues closed
- Coverage >= 85%
- Zero ESLint errors
- Milestone 100% complete

### Phase 2 → Phase 3

**Blockers for Phase 3 Start**:
- [ ] #98 complete (submodule conversion)
- [ ] GitHub repos created
- [ ] Submodules verified
- [ ] Docker Compose working
- [ ] Documentation updated

**Gate Criteria**:
- Phase 2 milestone 100% complete
- Submodule structure validated
- Docker environment passes healthchecks
- All team members trained on submodule workflow

---

## Issue Assignment Strategy

### Phase 1 Issues

**#50: Plan Boundaries**
- **Assigned To**: [Architect/Lead Developer]
- **Effort**: 2-3 days
- **Skills**: System design, dependency analysis
- **Artifacts**: Architecture doc, dependency graph

**#51: Extract Dashboard**
- **Assigned To**: [Backend/Full-stack Developer]
- **Effort**: 4-5 days
- **Skills**: Express.js, OAuth, REST APIs
- **Artifacts**: Folder structure, tests, README

**#52: Extract Utilities**
- **Assigned To**: [Backend/Utilities Developer]
- **Effort**: 3-4 days
- **Skills**: Service design, package management
- **Artifacts**: Services, exports, documentation

### Phase 2 Issues

**#98: Git Submodule Conversion**
- **Assigned To**: [DevOps/Git Expert]
- **Effort**: 2-3 days
- **Skills**: Git, submodules, GitHub APIs
- **Artifacts**: Repos, .gitmodules, workflow docs

### Phase 3 Issues

**#53: Integration Testing**
- **Assigned To**: [QA/Test Lead]
- **Effort**: 4-6 days
- **Skills**: Testing, integration, Docker
- **Artifacts**: Test suites, reports, validation

**#54: Core Bot Refactoring**
- **Assigned To**: [Discord Bot Developer]
- **Effort**: 2-3 days
- **Skills**: Discord.js, command patterns
- **Artifacts**: Refactored code, tests, docs

**#55: CI/CD Pipelines**
- **Assigned To**: [DevOps Engineer]
- **Effort**: 3-4 days
- **Skills**: GitHub Actions, Docker, automation
- **Artifacts**: Workflows, scripts, documentation

**#56: Documentation**
- **Assigned To**: [Technical Writer]
- **Effort**: 2 days
- **Skills**: Technical writing, Markdown, architecture
- **Artifacts**: Guides, API docs, troubleshooting

---

## Milestone Completion Criteria

### Phase 1 Milestone Completion

**All Issues Closed**:
- [ ] #50: Closed
- [ ] #51: Closed
- [ ] #52: Closed

**Quality Gates**:
- [ ] All tests passing (npm test)
- [ ] Coverage >= 85% (lines), 90% (functions), 80% (branches)
- [ ] Zero ESLint errors (npm run lint)
- [ ] All PRs merged to main
- [ ] Code review approvals on all PRs

**Deliverables**:
- [ ] Folder structure verified
- [ ] Code extracted and organized
- [ ] TDD applied throughout
- [ ] Documentation updated
- [ ] Team trained on structure

**Sign-off**: Project lead verifies all criteria met before Phase 2 start

---

### Phase 2 Milestone Completion

**All Issues Closed**:
- [ ] #98: Closed

**Quality Gates**:
- [ ] Submodule repos created on GitHub
- [ ] Independent Git histories initialized
- [ ] Submodule references in main repo verified
- [ ] Docker Compose still works
- [ ] All tests passing

**Deliverables**:
- [ ] 3 GitHub repositories created
- [ ] `.gitmodules` configured
- [ ] Development workflow documented
- [ ] Team trained on submodule workflow
- [ ] Merge commits to main

**Sign-off**: Project lead verifies all criteria met before Phase 3 start

---

### Phase 3 Milestone Completion

**All Issues Closed**:
- [ ] #53: Closed
- [ ] #54: Closed
- [ ] #55: Closed
- [ ] #56: Closed

**Quality Gates**:
- [ ] All integration tests passing
- [ ] CI/CD pipelines working
- [ ] Coverage >= 85% (all modules)
- [ ] Zero ESLint errors (all modules)
- [ ] All 3000+ tests passing
- [ ] Docker environment validated

**Deliverables**:
- [ ] Core bot refactored and tested
- [ ] CI/CD workflows for all submodules
- [ ] Complete documentation
- [ ] Production readiness checklist
- [ ] Team trained on new workflow

**Sign-off**: Project lead and ops team sign-off on production readiness

---

## Progress Tracking

### Weekly Status Updates

**During Each Phase**:
- Monday: Phase start/progress update
- Wednesday: Mid-week status check
- Friday: Week summary and blockers
- Sprint end: Milestone checklist

### Milestone Progress View

```
Phase 1: Extraction [███░░░░░░] 30% Complete
  ├─ #50 [███████░░░] 70%
  ├─ #51 [████░░░░░░] 40%
  └─ #52 [░░░░░░░░░░]  0%

Phase 2: Submodules [░░░░░░░░░░]  0% (Waiting for Phase 1)
  └─ #98 [░░░░░░░░░░]  0%

Phase 3: Integration [░░░░░░░░░░]  0% (Waiting for Phase 2)
  ├─ #53 [░░░░░░░░░░]  0%
  ├─ #54 [░░░░░░░░░░]  0%
  ├─ #55 [░░░░░░░░░░]  0%
  └─ #56 [░░░░░░░░░░]  0%
```

---

## Risk Mitigation

### Potential Blockers

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Circular dependencies | High | High | Issue #50 includes dependency analysis |
| Test coverage gaps | Medium | High | TDD mandatory, coverage validation in Phase 1 |
| Git submodule issues | Low | Medium | Issue #98 has detailed steps, training included |
| Integration test failures | Medium | Medium | Comprehensive testing in Phase 3 |
| Documentation gaps | Low | Low | Phase 3 includes documentation finalization |

### Rollback Plan

**If Phase 1 Fails**:
- Revert extraction to main repo
- Keep code organized but not separated
- Continue with Phase 1 retry

**If Phase 2 Fails**:
- Keep folders in main repo
- Maintain as separate folders (not submodules)
- Plan Phase 2 retry

**If Phase 3 Fails**:
- Hotfix issues in submodules
- Don't merge until phase complete
- Plan Phase 3 retry

---

## References

- `.github/copilot-instructions.md` - Development standards
- `SUBMODULE-DEVELOPMENT-STRATEGY.md` - Development approach
- `MCP-SERVERS-CONFIGURATION-STRATEGY.md` - MCP consistency
- `EPIC-49-PHASE-BASED-STRATEGY.md` - Phase details
- `EPIC-49-COMPLETE-IMPLEMENTATION-GUIDE.md` - Implementation guide
- `EPIC-49-IMPLEMENTATION-PLAN.md` - Detailed specifications

---

**Version**: 1.0  
**Last Updated**: January 20, 2026  
**Status**: Active - Milestone planning complete
