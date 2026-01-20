# Epic #49: Phase-Based Repository Separation Strategy

**Status**: Phases 1 & 2 Defined  
**Date**: January 20, 2026

---

## 📋 Three-Phase Approach

### Phase 1: Keep as Folders (Issues #50-#52) ✅ CURRENT
**Status**: In Progress  
**Issues**: #50, #51, #52  
**Duration**: 6-9 days

**What**: Extract sub-repositories as folders within main repo

**Why**:
- Easier initial development
- Single workspace for testing
- Can validate module boundaries
- Reduced CI/CD complexity during transition
- Allows code review before separation

**Deliverables**:
- ✅ Module boundaries defined (#50)
- ✅ Dashboard extracted to `repos/verabot-dashboard` (#51)
- ✅ Utils extracted to `repos/verabot-utils` (#52)

**How to Work**:
```bash
# Develop in folders - all in single repo
cd repos/verabot-core
npm install
npm run dev

# Commit to main repo
git add .
git commit -m "feat: add command to core bot"
git push origin main
```

---

### Phase 2: Convert to Git Submodules (Issue #98) ⏭️ NEXT
**Status**: Planned (after Phase 1)  
**Issue**: #98  
**Duration**: 2-3 days

**What**: Convert folders to independent Git submodules

**Why**:
- Enable independent versioning for each sub-repository
- Allow separate releases without touching main repo
- Prepare for Phase 3 transition to integration and CI/CD
- Maintain single workspace for development
- Clear separation of concerns

**Deliverables**:
- Independent GitHub repositories created
  - `github.com/Rarsus/verabot-core`
  - `github.com/Rarsus/verabot-dashboard`
  - `github.com/Rarsus/verabot-utils`
- Main repo configured with `.gitmodules`
- Development workflow documented
- CI/CD foundation documented

**How to Work**:
```bash
# Clone with submodules
git clone --recursive https://github.com/Rarsus/verabot2.0.git

# Develop in submodules
cd repos/verabot-core
git checkout -b feature/my-feature
npm install
npm run dev

# Commit changes independently
git add .
git commit -m "feat: my feature"
git push origin feature/my-feature

# Update submodule reference in main
cd ../..
git add repos/verabot-core
git commit -m "chore: update verabot-core to latest"
git push origin main
```

---

### Phase 3: Integration & CI/CD (Issues #53-#56) 🔄 INTEGRATION
**Status**: Planned (after Phase 2)  
**Issues**: #53, #54, #55, #56  
**Duration**: 11-16 days

**What**: Refactor core bot, test submodule integration, setup independent CI/CD, finalize documentation

**Why**:
- Ensure all sub-repositories work together as submodules
- Test integration in monolithic and modular states
- Setup independent CI/CD pipelines for each submodule
- Refactor main repo after extractions complete
- Comprehensive documentation for submodule workflow

**Issues in Phase 3:**
- #53: Integration testing (4-6 days) - Test inter-repo communication, Docker Compose validation
- #54: Refactor core bot repo (2-3 days) - Clean up main repo after extractions
- #55: CI/CD pipelines for submodules (3-4 days) - GitHub Actions for each repo
- #56: Documentation finalization (2 days) - Submodule workflow, architecture diagrams

**Deliverables**:
- ✅ Core bot refactored in `repos/verabot-core` (#54)
- ✅ Integration testing complete (#53)
- ✅ Independent CI/CD for each submodule (#55)
- ✅ Comprehensive documentation (#56)
- ✅ Docker Compose works with submodule structure
- ✅ All tests passing (3000+)

---

### Phase 4: Fully Separate Repositories (Future) 🔮 FUTURE
**Status**: Future planning  
**Issue**: TBD (Post-Phase 3)  
**Duration**: 3-5 days

**What**: Create fully independent repositories with separate issue tracking

**Why**:
- Enable true multi-team development
- Separate issue tracking and project management
- Independent CI/CD pipelines for each sub-product
- Allow external contributors to each repository
- True microservices architecture

**Deliverables**:
- Independent repos no longer use submodules in main
- Main repo references via npm packages or configuration
- Separate issue labels and tracking
- Separate CI/CD workflows
- Independent release cycles

**How to Work**:
```bash
# Install as npm dependencies
npm install @verabot/core @verabot/dashboard @verabot/utils

# Or use Docker Compose with external repos
# Repos cloned separately or via Docker volume mounts

# Develop completely independently
cd verabot-core
git clone https://github.com/Rarsus/verabot-core.git
npm install
npm run dev
```

---

## 🗺️ Timeline Overview

```
Week 1: Phase 1 - Keep as Folders (#50-#52)
├─ Day 1-3: Module boundaries (#50)
├─ Day 3-6: Dashboard extraction (#51)
└─ Day 4-9: Utils extraction (#52)

Week 2: Phase 2 - Git Submodules (#98)
├─ Day 1: Create GitHub repos
├─ Day 1: Initialize Git histories  
├─ Day 2: Convert to submodules
└─ Day 3: Documentation & testing

Week 3-4: Phase 3 - Integration & CI/CD (#53-#56)
├─ Day 1-6: Integration testing (#53)
├─ Day 3-5: Core bot refactoring (#54)
├─ Day 5-8: CI/CD pipelines (#55)
└─ Day 9-10: Documentation finalization (#56)

Week 5+: Phase 4 - Fully Separate (Future)
├─ Create independent projects
├─ Separate issue tracking
└─ Independent CI/CD
```

---

## 🔄 Transition Path

### Phase 1 → Phase 2 Transition

**Before Starting #98:**
- ✅ Code extraction complete (#50-#52)
- ✅ All integration tests passing (#53)
- ✅ CI/CD working with folder structure (#55, partial)
- ✅ Documentation updated (#56, partial)

**Phase 2 Work:**
1. Create GitHub repositories
2. Initialize independent Git histories in each
3. Remove folders from main repo tracking
4. Add as Git submodules
5. Update documentation
6. Test in Docker Compose
7. Update CI/CD for submodule support

**After Phase 2:**
- Each sub-repo has independent commit history
- Main repo tracks via `.gitmodules` (references specific commits)
- Developers clone with `--recursive` flag
- Can work independently or together

---

## 📦 What's Different in Each Phase

| Aspect | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|--------|---------|---------|----------|----------|
| **Repository Structure** | Folders in main | Git submodules | Git submodules (with CI/CD) | Separate repos |
| **Version Control** | Single Git repo | Two+ Git repos (linked) | Two+ Git repos (linked) | Independent Git repos |
| **Development** | Everything in one workspace | Unified workspace, independent versions | Unified workspace, independent versions | Completely independent |
| **Releases** | Single monolithic release | Can release sub-repos independently | Can release sub-repos independently | Independent release cycles |
| **Issue Tracking** | Single issue tracker | Single tracker | Single tracker | Separate trackers per repo |
| **CI/CD** | Single pipeline | Single pipeline | Multiple independent pipelines | Independent pipelines |
| **npm packages** | Internal only | Can publish utils to npm | Publishing setup | All published to npm |
| **Complexity** | Simple | Medium | Medium-High | Complex |
| **Team Size** | 1-2 developers | 2-3 developers | 2-3 developers | 3+ developers |

---

## 🎯 Why This Phased Approach?

### Advantages

✅ **Reduced Risk**
- Test extraction thoroughly before true separation (Phase 1)
- Can rollback easily in Phase 1
- Submodule conversion in isolation (Phase 2)
- CI/CD and integration after modules are separate (Phase 3)
- Gradual complexity increase

✅ **Faster Time to Value**
- Get working modules quickly (Phase 1, 6-9 days)
- Add independence when ready (Phase 2, 2-3 days)
- Ensure everything works together (Phase 3, 11-16 days)
- Scale to separate repos when needed (Phase 4)

✅ **Team Flexibility**
- Phase 1: Single team working on extraction
- Phase 2: Single developer on submodule conversion
- Phase 3: Team validates integration and CI/CD
- Phase 4: True multi-team development

✅ **Testing Coverage**
- All integration tested in single repo (Phase 1)
- Submodule structure validated (Phase 2)
- Full integration and CI/CD tested (Phase 3)
- Independent system testing (Phase 4)

✅ **Documentation Quality**
- Build workflow docs incrementally
- Update submodule procedures after conversion (Phase 2)
- Document CI/CD procedures (Phase 3)
- Document independent workflows (Phase 4)
- Reduce breaking changes

---

## 🚀 Current Status

**Phase 1 Progress:**
- ✅ Infrastructure created (Docker Compose, package.json files)
- ✅ Folder structures ready
- 🔄 Code extraction starting (Sub-issues #50-#52)
- ⏳ Ready for Phase 2 after extraction

**Phase 2 Progress:**
- ⏳ Submodule conversion (Issue #98)
- ⏳ GitHub repositories creation

**Phase 3 Progress:**
- ⏳ Integration testing (Sub-issue #53)
- ⏳ Core bot refactoring (Sub-issue #54)
- ⏳ CI/CD pipelines (Sub-issue #55)
- ⏳ Documentation (Sub-issue #56)

**Next Milestone:**
- Complete Sub-issues #50-#52 (1-2 weeks)
- Start Phase 2 issue #98 (convert to submodules)
- After Phase 2 complete, begin Phase 3 (#53-#56)

---

## 📚 Related Documentation

- [EPIC-49-IMPLEMENTATION-PLAN.md](EPIC-49-IMPLEMENTATION-PLAN.md)
- [EPIC-49-INFRASTRUCTURE-SETUP-SUMMARY.md](EPIC-49-INFRASTRUCTURE-SETUP-SUMMARY.md)
- [Sub-Issue #50](https://github.com/Rarsus/verabot2.0/issues/50) - Plan boundaries
- [Sub-Issue #51](https://github.com/Rarsus/verabot2.0/issues/51) - Extract dashboard
- [Sub-Issue #52](https://github.com/Rarsus/verabot2.0/issues/52) - Extract utilities
- [Sub-Issue #54](https://github.com/Rarsus/verabot2.0/issues/54) - Refactor core
- [Issue #98](https://github.com/Rarsus/verabot2.0/issues/98) - Git Submodules

---

## ✅ Decision Points

**Phase 1 → Phase 2:**
- [ ] All code extraction complete (#50-#52)?
- [ ] Code compiles and runs in folder structure?
- [ ] Basic integration testing passes?
- [ ] Team ready for submodule workflow?

**Phase 2 → Phase 3:**
- [ ] GitHub repositories created and initialized?
- [ ] Submodule conversion complete?
- [ ] Submodule structure tested locally?
- [ ] Docker Compose works with submodules?

**Phase 3 → Phase 4:**
- [ ] Full integration testing complete?
- [ ] Independent CI/CD pipelines working?
- [ ] All documentation updated?
- [ ] Multi-team development desired?
- [ ] npm packages needed for external use?
- [ ] Separate issue tracking preferred?

---

**Version**: 1.0  
**Status**: Active - Phase 1 in progress  
**Last Updated**: January 20, 2026
